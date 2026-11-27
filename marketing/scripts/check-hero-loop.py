#!/usr/bin/env python3
"""Check the decoded phone cut against marketing/motion/hero-loop/timing.json.

Reads the WebM and MP4 that render-hero-loop.py wrote, measures them and
writes motion-qa.json. Exits with an error on the first failed check.
"""
import argparse, json, re, subprocess
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parents[2]
SPEC = json.loads((ROOT / 'marketing/motion/hero-loop/timing.json').read_text())
CUT = SPEC['phone_cut']
W, H = CUT['width'] * CUT['scale'], CUT['height'] * CUT['scale']
SMALL = (216, 270)


def decoded_frames(video):
    pixels = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(video), '-vf', f'scale={SMALL[0]}:{SMALL[1]}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'])
    size = SMALL[0] * SMALL[1]
    assert len(pixels) % size == 0, f'{video.name}: partial frame in decode'
    return [memoryview(pixels)[i * size:(i + 1) * size] for i in range(len(pixels) // size)]


def probe(video, codec):
    streams = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(video)]))['streams']
    assert len(streams) == 1 and streams[0]['codec_type'] == 'video', f'{video.name}: expected one silent video stream'
    s = streams[0]
    assert s['codec_name'] == codec, f'{video.name}: codec {s["codec_name"]}, expected {codec}'
    assert s['pix_fmt'] == 'yuv420p', f'{video.name}: pixel format {s["pix_fmt"]}'
    assert (s['width'], s['height']) == (W, H), f'{video.name}: {s["width"]}x{s["height"]}, expected {W}x{H}'
    assert s['r_frame_rate'] == f'{SPEC["fps"]}/1', f'{video.name}: frame rate {s["r_frame_rate"]}'
    return s


def freezes(video):
    run = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(video), '-vf', 'freezedetect=n=-50dB:d=0.4', '-an', '-f', 'null', '-'], capture_output=True, text=True, check=True)
    intervals, start = [], None
    for kind, value in re.findall(r'lavfi\.freezedetect\.freeze_(start|end):\s*([\d.]+)', run.stderr):
        if kind == 'start':
            start = float(value)
        elif start is not None:
            intervals.append([start, float(value)])
            start = None
    if start is not None:
        intervals.append([start, SPEC['duration_s']])
    return intervals


def check(directory):
    render = json.loads((directory / 'render-report.json').read_text())
    n, fps = SPEC['frames'], SPEC['fps']
    assert render['frames'] == n and not render['page_errors'], 'render report is incomplete or has page errors'
    assert render['min_text_px'] >= CUT['min_text_px'], f'smallest text {render["min_text_px"]} px, expected at least {CUT["min_text_px"]}'
    assert render['endpoint_pixel_identical'] and all(x['pixel_identical'] for x in render['seek_determinism'])
    result = {'status': 'pass', 'dimensions': [W, H], 'fps': fps, 'frames': n, 'min_text_px': render['min_text_px'],
              'render_mode': render['mode'], 'ignored_targets': render['ignored_targets'], 'files': {}}
    for name, codec in (('hero-loop-phone.webm', 'vp9'), ('hero-loop-phone.mp4', 'h264')):
        video = directory / name
        probe(video, codec)
        frames = decoded_frames(video)
        assert len(frames) == n, f'{name}: decoded {len(frames)} frames, expected {n}'
        result['files'][name] = {'bytes': video.stat().st_size, 'decoded_frames': len(frames)}
    frames = decoded_frames(directory / 'hero-loop-phone.mp4')

    def diff(a, b):
        return mean(abs(x - y) for x, y in zip(frames[a], frames[b]))

    seam = diff(n - 1, 0)
    assert seam <= 1.0, f'visible loop seam: mean gray difference {seam:.3f}'
    samples = [round(fps * t) for t in CUT['seek_samples_s']]
    beats = [diff(a, b) for a, b in zip(samples, samples[1:])]
    assert all(v >= 2 for v in beats), f'a beat did not change visibly: {beats}'
    # A feedback change (150 ms, one word) sits below the freeze detector's
    # noise floor, so a hold may run on through it. Each feedback event must
    # still change the decoded pixels.
    feedback = {}
    for e in SPEC['events']:
        if e['motion'] == 'feedback':
            start = round(e['at'] * fps) - 1
            feedback[e['at']] = round(diff(start, start + round(fps * SPEC['easing']['feedback']['ms'] / 1000) + 1), 4)
            assert feedback[e['at']] >= 0.01, f'feedback at {e["at"]} s changed nothing'
    # The same holds for a small entrance, such as one card fading onto the
    # canvas: if no frame-to-frame change reaches the detector's floor
    # (-50 dB, about 0.8 gray levels), a hold may run on through it, and the
    # entrance must still change the decoded pixels.
    floor = 255 * 10 ** (-50 / 20)
    quiet, entrances = set(), {}
    for e in SPEC['events']:
        if e['motion'] == 'entrance':
            start = round(e['at'] * fps) - 1
            end = start + round(fps * SPEC['easing']['entrance']['ms'] / 1000) + 1
            step = max(diff(k, k + 1) for k in range(start, end))
            entrances[e['at']] = {'change': round(diff(start, end), 4), 'largest_frame_step': round(step, 4)}
            if step < floor:
                assert entrances[e['at']]['change'] >= 0.1, f'entrance at {e["at"]} s changed nothing'
                quiet.add(e['at'])
    allowed = []
    for lo, hi in SPEC['holds_s']:
        later = [e['at'] for e in SPEC['events'] if e['at'] >= hi and e['motion'] not in ('feedback', 'none') and not (e['motion'] == 'entrance' and e['at'] in quiet)]
        allowed.append([lo, min(later, default=SPEC['duration_s'])])
    found = freezes(directory / 'hero-loop-phone.mp4')
    for a, b in found:
        assert any(a >= lo - .25 and b <= hi + .25 for lo, hi in allowed), f'unplanned freeze: {a}-{b} s'
    result['feedback_mean_gray_differences'] = feedback
    result['entrance_mean_gray_differences'] = entrances
    result['entrances_below_detector_floor_s'] = sorted(quiet)
    result.update({'seam_mean_gray_difference': round(seam, 4), 'beat_mean_gray_differences': [round(v, 4) for v in beats],
                   'detected_holds_s': found, 'declared_holds_s': SPEC['holds_s'], 'unplanned_freezes': 0,
                   'pixel_identical_seek_samples': len(render['seek_determinism']), 'source_sha256': render['source_sha256']})
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', type=Path)
    args = parser.parse_args()
    output = json.dumps(check(args.directory), indent=2) + '\n'
    (args.directory / 'motion-qa.json').write_text(output)
    print(output, end='')
