#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
FORMAT=${1:?launch, teaser, square, vertical or walkthrough}
case "$FORMAT" in launch|teaser|square|vertical|walkthrough) ;; *) exit 2;; esac
export FILM_WORK="$PWD/marketing/.work"
export PLAYWRIGHT_DIR="$PWD/review"
export FPS=24
node "$FILM_WORK/render.js" "plan-$FORMAT.json"
# The unmodified upstream Product-film renderer captures each logical frame at DSF 2.
# Encode at that full physical resolution, with no grain, vignette, music or scaling.
mkdir -p "marketing/exports/$FORMAT"
ffmpeg -v error -y -framerate "$FPS" -i "$FILM_WORK/frames/$FORMAT/story/f_%05d.jpg" \
 -c:v libx264 -preset fast -crf 19 -pix_fmt yuv420p -movflags +faststart -an "marketing/exports/$FORMAT/$FORMAT.mp4"
cp "$FILM_WORK/$FORMAT.vtt" "marketing/exports/$FORMAT/$FORMAT.vtt"
ffprobe -v error -show_entries stream=width,height,r_frame_rate:format=duration,size -of json "marketing/exports/$FORMAT/$FORMAT.mp4" > "marketing/exports/$FORMAT/spec.json"
ffmpeg -v error -y -ss 0.5 -i "marketing/exports/$FORMAT/$FORMAT.mp4" -frames:v 1 "marketing/exports/$FORMAT/poster.png"
ffmpeg -v error -y -i "marketing/exports/$FORMAT/$FORMAT.mp4" -vf "fps=1/2,scale=320:-2,tile=4x5:padding=5:margin=5:color=white" -frames:v 1 "marketing/exports/$FORMAT/contact-sheet.jpg"
if [ "$FORMAT" = walkthrough ]; then
 ffmpeg -v error -y -i "marketing/exports/$FORMAT/$FORMAT.mp4" -vf scale=1280:720 -c:v libx264 -preset fast -crf 23 -movflags +faststart -an "marketing/exports/$FORMAT/website-loop.mp4"
fi
