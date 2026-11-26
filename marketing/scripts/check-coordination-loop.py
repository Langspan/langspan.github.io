#!/usr/bin/env python3
"""Check decoded frames against a declared timeline; write machine-readable QA."""
import argparse, json, re, subprocess
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parents[2]
SPEC = json.loads((ROOT/'marketing/motion/coordination-loop/timing.json').read_text())

def check(video, render):
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(video)]))['streams']
    assert len(probe)==1 and probe[0]['codec_type']=='video', 'expected one silent video stream'
    s=probe[0];fps=SPEC['fps'];total=round(fps*SPEC['duration_s'])
    assert s['codec_name']=='h264' and s['pix_fmt']=='yuv420p'
    assert (s['width'],s['height'])==(SPEC['width']*SPEC['scale'],SPEC['height']*SPEC['scale'])
    assert s['r_frame_rate']==f'{fps}/1' and int(s['nb_frames'])==total
    assert abs(float(s['duration'])-SPEC['duration_s'])<1/fps
    assert render['frames']==total and not render['geometry_errors'] and not render['page_errors']
    assert render['minimum_panel_width_px']>=1000 and render['endpoint_pixel_identical']
    assert all(x['pixel_identical'] for x in render['seek_determinism'])
    pixels=subprocess.check_output(['ffmpeg','-v','error','-i',str(video),'-vf','scale=320:180','-f','rawvideo','-pix_fmt','gray','-'])
    size=320*180;assert len(pixels)==total*size, 'decoded frame count mismatch'
    frames=[memoryview(pixels)[i*size:(i+1)*size] for i in range(total)]
    def diff(a,b):return mean(abs(x-y) for x,y in zip(frames[a],frames[b]))
    seam=diff(0,total-1);assert seam<=1.0, f'visible loop seam: {seam}'
    # Compare stable states, not the progress rail: every narrative beat must change.
    samples=[round(fps*t) for t in (1,3.6,7.6,11.8)]
    differences=[diff(a,b) for a,b in zip(samples,samples[1:])]
    assert all(v>=2 for v in differences), 'a narrative beat failed to change visibly'
    run=subprocess.run(['ffmpeg','-hide_banner','-i',str(video),'-vf','freezedetect=n=-50dB:d=0.4','-an','-f','null','-'],capture_output=True,text=True,check=True)
    events=re.findall(r'lavfi\.freezedetect\.freeze_(start|end):\s*([\d.]+)',run.stderr)
    intervals=[];start=None
    for kind,val in events:
        if kind=='start':start=float(val)
        elif start is not None:intervals.append([start,float(val)]);start=None
    if start is not None:intervals.append([start,SPEC['duration_s']])
    for a,b in intervals:
        assert any(a>=lo-.25 and b<=hi+.25 for lo,hi in SPEC['intentional_holds_s']),f'unplanned freeze: {a}–{b}'
    return {'status':'pass','dimensions':[s['width'],s['height']],'fps':fps,'frames':total,'duration_s':float(s['duration']),'seam_mean_gray_difference':round(seam,4),'beat_mean_gray_differences':[round(v,4) for v in differences],'detected_intentional_holds_s':intervals,'unplanned_freezes':0,'geometry_checked_frames':render['frames'],'minimum_panel_width_px':render['minimum_panel_width_px'],'pixel_identical_seek_samples':len(render['seek_determinism']),'source_sha256':render['source_sha256']}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('directory',type=Path);a=p.parse_args()
    result=check(a.directory/'langspan-coordination-loop.mp4',json.loads((a.directory/'render-report.json').read_text()))
    output=json.dumps(result,indent=2)+'\n';(a.directory/'motion-qa.json').write_text(output);print(output,end='')
