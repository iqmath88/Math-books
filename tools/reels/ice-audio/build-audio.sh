#!/usr/bin/env bash
# Female Arabic voice-over (voice settings «B», chosen by the teacher for the shadow reel) for tools/reels/ice.html, then mux.
#   setup: pip install piper-tts ; download vits-piper-ar_JO-SA_dii-high (see ../cone-volume-audio/build-audio.sh)
#   usage: VOICE=…/vits-piper-ar_JO-SA_dii-high ./build-audio.sh video.mp4 out.mp4
# Changing a line changes the timeline: mix.py rewrites ../ice.timeline.full.js — re-render the video after it.
set -euo pipefail
cd "$(dirname "$0")"; M="$VOICE/ar_JO-SA_dii-high.onnx"; mkdir -p tmp
grep -v '^#' narration.txt | while IFS='|' read -r k l; do
  echo "$l" | python3 -m piper -m "$M" -c "$M.json" --length-scale 1.1 --noise-scale 0.8 --noise-w-scale 1.0 --sentence-silence 0.4 -f tmp/c_$k.wav 2>/dev/null
  ffmpeg -nostdin -v error -y -i tmp/c_$k.wav -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,atempo=1.04" -ar 44100 -ac 1 tmp/$k.wav
done
python3 mix.py tmp full
ffmpeg -nostdin -v error -y -i "$1" -i tmp/mix-full.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$2"
echo wrote "$2"
