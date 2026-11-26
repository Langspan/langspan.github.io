#!/usr/bin/env python3
"""Frame-exact film of the real website coordination component, offline."""
import argparse, base64, hashlib, json, os, re, subprocess, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'marketing/motion/coordination-loop'
SPEC = json.loads((SOURCE / 'timing.json').read_text())

def data(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()

def document():
    # Inline the same local assets used by the homepage. No network requests,
    # no agent process, no copied or redesigned state-machine implementation.
    html = (ROOT / 'index.html').read_text()
    css = (ROOT / 'assets/product-first.css').read_text()
    css = css.replace('fonts/inter-5.2.5/inter-latin-wght-normal.woff2', data(ROOT / 'assets/fonts/inter-5.2.5/inter-latin-wght-normal.woff2', 'font/woff2'))
    html = re.sub(r'<link\b[^>]*>', '', html)
    html = re.sub(r'<script\b[^>]*\bsrc=["\'][^"\']+["\'][^>]*>\s*</script>', '', html)
    html = re.sub(r'src="(assets/[^"\n]+)"', lambda m: 'src="'+data(ROOT / m[1], 'image/svg+xml' if m[1].endswith('.svg') else 'image/jpeg' if m[1].endswith('.jpg') else 'image/png')+'"', html)
    html = html.replace('</head>', '<style>'+css+'\n'+(SOURCE/'film.css').read_text()+'</style></head>')
    js = (ROOT/'assets/product-first.js').read_text()
    film = (SOURCE/'film.js').read_text()
    return html.replace('</body>', '<script>'+js+'</script><script>window.FILM_SPEC='+json.dumps(SPEC)+';\n'+film+'</script></body>')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=ROOT/'marketing/exports/coordination-loop');parser.add_argument('--stills',action='store_true');args=parser.parse_args();out=args.out;out.mkdir(parents=True,exist_ok=True)
    fps=SPEC['fps'];n=round(fps*SPEC['duration_s']);report={'frames':0,'geometry_errors':[],'minimum_panel_width_px':None,'seek_determinism':[],'source_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest()}
    with sync_playwright() as p:
        options={'headless':True,'args':['--disable-dev-shm-usage']}
        if os.environ.get('CHROMIUM_PATH'):options['executable_path']=os.environ['CHROMIUM_PATH']
        browser=p.chromium.launch(**options)
        page=browser.new_page(viewport={'width':SPEC['width'],'height':SPEC['height']},device_scale_factor=SPEC['scale'],reduced_motion='reduce')
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.route('**/*',lambda r:r.abort())
        page.set_content(document(),wait_until='load');page.evaluate('document.fonts.ready');page.wait_for_function('typeof window.renderAt === "function"');page.evaluate('Promise.all([...document.querySelectorAll("#film img")].map(i=>i.decode()))')
        frame_cache={}
        def draw(t, reuse=False):
            state=page.evaluate('t=>window.renderAt(t)',t);m=page.evaluate('window.measureFilm()');assert not m['errors'],(t,m['errors']);assert m['panel_width']*SPEC['scale']>=1000, m
            if report['minimum_panel_width_px'] is None or m['panel_width']*SPEC['scale']<report['minimum_panel_width_px']:report['minimum_panel_width_px']=m['panel_width']*SPEC['scale']
            if state['step']==1:assert page.locator('[data-event-message]').inner_text()=='Command blocked by PreToolUse hook: LangSpan coordination conflict.'
            # Cache only the pixel-identical settled intervals. Every requested
            # timestamp still exercises the real component and geometry checks.
            key=page.evaluate("()=>JSON.stringify([window.LangSpanProduct.snapshot().step,...[...document.querySelectorAll('#film [data-film-label],#film [data-film-title],#film [data-film-body],#film .inspector,#film .inspector > *')].map(e=>[e.textContent,e.style.cssText])])") if reuse else None
            if reuse and key in frame_cache:return frame_cache[key]
            image=page.screenshot(animations='disabled',type='png')
            if reuse:frame_cache[key]=image
            return image
        for i,t in enumerate([1.0,3.6,7.6,11.8]):
            still=draw(t);(out/f'beat-{i+1}.png').write_bytes(still)
            draw(8.0 if t<7 else 0.0);again=draw(t)
            same=still==again;report['seek_determinism'].append({'time_s':t,'pixel_identical':same});assert same, f'seek mismatch {t}'
        assert draw(0)==draw(SPEC['duration_s']), 'loop endpoint differs from opening'
        report['endpoint_pixel_identical']=True
        if not args.stills:
            cmd=['ffmpeg','-v','error','-y','-f','image2pipe','-vcodec','png','-r',str(fps),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-profile:v','high','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'langspan-coordination-loop.mp4')]
            with subprocess.Popen(cmd,stdin=subprocess.PIPE) as ff:
                for frame in range(n):
                    ff.stdin.write(draw(frame/fps,reuse=True));report['frames']+=1
                    if frame%60==0:print(f'Rendered {frame+1}/{n}',flush=True)
                ff.stdin.close();assert ff.wait()==0
        report['page_errors']=errors;assert not errors, errors
        browser.close()
    (out/'render-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if __name__=='__main__':main()
