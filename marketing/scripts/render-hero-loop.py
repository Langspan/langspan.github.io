#!/usr/bin/env python3
"""Render the hero loop's 1080x1350 phone cut, frame by frame, offline.

One clock: marketing/motion/hero-loop/timing.json. The page's own component is
framed by film.css and driven by film.js. Writes WebM, MP4, a poster and
render-report.json. --stills writes the seek samples only.
"""
import argparse, base64, hashlib, json, os, re, shutil, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'marketing/motion/hero-loop'
SPEC = json.loads((SOURCE / 'timing.json').read_text())
CUT = SPEC['phone_cut']
MIME = {'.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}


def data(path):
    mime = MIME.get(path.suffix, 'font/woff2' if path.suffix == '.woff2' else 'application/octet-stream')
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()


def document():
    # Inline the home page's own local files. No network request runs, and no
    # agent or daemon starts.
    html = (ROOT / 'index.html').read_text()
    # The page's own styles: layout and the proof chips.
    css = (ROOT / 'assets/product-first.css').read_text() + '\n' + (ROOT / 'assets/proof.css').read_text()
    css = re.sub(r"url\('(fonts/[^']+)'\)", lambda m: "url('" + data(ROOT / 'assets' / m[1]) + "')", css)
    html = re.sub(r'<link\b[^>]*>', '', html)
    html = re.sub(r'<script\b[^>]*\bsrc=["\'][^"\']+["\'][^>]*>\s*</script>', '', html)
    html = re.sub(r'src="(assets/[^"\n]+)"', lambda m: 'src="' + data(ROOT / m[1]) + '"', html)
    html = html.replace('</head>', '<style>' + css + '\n' + (SOURCE / 'film.css').read_text() + '</style></head>')
    page_js = (ROOT / 'assets/product-first.js').read_text()
    film_js = (SOURCE / 'film.js').read_text()
    return html.replace('</body>', '<script>' + page_js + '</script><script>window.FILM_SPEC=' + json.dumps(SPEC) + ';\n' + film_js + '</script></body>')


def encode(frames, out):
    rate = ['-framerate', str(SPEC['fps']), '-i', str(frames / '%04d.png'), '-an', '-pix_fmt', 'yuv420p']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *rate, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', str(out / 'hero-loop-phone.webm')], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *rate, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high', '-movflags', '+faststart', str(out / 'hero-loop-phone.mp4')], check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', type=Path, default=ROOT / 'marketing/exports/hero-loop')
    parser.add_argument('--stills', action='store_true', help='write the seek samples and poster only')
    args = parser.parse_args()
    out = args.out
    out.mkdir(parents=True, exist_ok=True)
    fps, n = SPEC['fps'], SPEC['frames']
    assert n == round(fps * SPEC['duration_s']), 'frames must equal fps x duration_s'
    report = {'frames': 0, 'mode': None, 'ignored_targets': [], 'min_text_px': None, 'seek_determinism': [],
              'source_sha256': hashlib.sha256((ROOT / 'index.html').read_bytes() + (ROOT / 'assets/product-first.js').read_bytes()).hexdigest()}
    with sync_playwright() as p:
        options = {'headless': True, 'args': ['--disable-dev-shm-usage']}
        if os.environ.get('CHROMIUM_PATH'):
            options['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = p.chromium.launch(**options)
        page = browser.new_page(viewport={'width': CUT['width'], 'height': CUT['height']}, device_scale_factor=CUT['scale'], reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/*', lambda r: r.abort())
        page.set_content(document(), wait_until='load')
        page.evaluate('document.fonts.ready')
        assert not errors, errors
        page.wait_for_function('typeof window.renderAt === "function"')
        page.evaluate('Promise.all([...document.querySelectorAll("#film img")].map(i => i.decode()))')
        cache = {}

        def draw(t, reuse=False):
            state = page.evaluate('t => window.renderAt(t)', t)
            m = page.evaluate('window.measureFilm()')
            assert not m['errors'], (t, m['errors'])
            report['mode'], report['ignored_targets'] = state['mode'], state['ignored_targets']
            if report['min_text_px'] is None or m['min_text_px'] < report['min_text_px']:
                report['min_text_px'] = m['min_text_px']
            # Frames inside a hold are pixel-identical, so a settled state is
            # captured once. Every timestamp still runs renderAt and the checks.
            key = page.evaluate("() => { const panel = window.LangSpanHero ? window.LangSpanHero.element : document.querySelector('#film [data-coordination-event]'); return JSON.stringify([...panel.querySelectorAll('*')].map(e => [e.textContent, e.getAttribute('style'), e.getAttribute('aria-pressed'), e.className])); }") if reuse else None
            if key in cache:
                return cache[key]
            image = page.screenshot(animations='disabled', type='png')
            if reuse:
                cache[key] = image
            return image

        for i, t in enumerate(CUT['seek_samples_s']):
            still = draw(t)
            (out / f'seek-{i + 1}.png').write_bytes(still)
            draw(SPEC['duration_s'] - t)
            same = still == draw(t)
            report['seek_determinism'].append({'time_s': t, 'pixel_identical': same})
            assert same, f'seeking to {t} s draws different pixels'
        (out / 'hero-loop-phone-poster.png').write_bytes(draw(CUT['poster_s']))
        for t in CUT.get('stills_s', []):
            (out / f'still-{t:g}s.png').write_bytes(draw(t))
        report['endpoint_pixel_identical'] = draw(0) == draw(SPEC['duration_s'])
        assert report['endpoint_pixel_identical'], 'frame N differs from frame 0'
        if not args.stills:
            frames = out / 'frames'
            shutil.rmtree(frames, ignore_errors=True)
            frames.mkdir()
            for frame in range(n):  # frames 0 to N-1; frame N would repeat frame 0
                (frames / f'{frame:04d}.png').write_bytes(draw(frame / fps, reuse=True))
                report['frames'] += 1
            encode(frames, out)
        report['page_errors'] = errors
        assert not errors, errors
        browser.close()
    (out / 'render-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
