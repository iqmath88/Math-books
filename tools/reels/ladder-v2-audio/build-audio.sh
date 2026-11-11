#!/usr/bin/env bash
# Female Arabic voice-over for tools/reels/ladder-v2.html, both versions, then mux.
#   setup: pip install piper-tts ; download vits-piper-ar_JO-SA_dii-high (see ../cone-volume-audio/build-audio.sh)
#   usage: VOICE=…/vits-piper-ar_JO-SA_dii-high ./build-audio.sh <full|short> video.mp4 out.mp4
# Changing a line changes the timeline: mix.py rewrites ../ladder-v2.timeline.<mode>.js — re-render the video after it.
set -euo pipefail
cd "$(dirname "$0")"; M="$VOICE/ar_JO-SA_dii-high.onnx"; mkdir -p tmp
grep -v '^#' narration.txt | while IFS='|' read -r k l; do
  echo "$l" | python3 -m piper -m "$M" -c "$M.json" --sentence-silence 0.2 -f tmp/c_$k.wav 2>/dev/null
  ffmpeg -nostdin -v error -y -i tmp/c_$k.wav -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,atempo=1.1" -ar 44100 -ac 1 tmp/$k.wav
done
python3 mix.py tmp "$1"
ffmpeg -nostdin -v error -y -i "$2" -i tmp/mix-$1.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$3"
echo wrote "$3"
