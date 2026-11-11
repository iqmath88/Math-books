#!/usr/bin/env bash
# Arabic voice-over + music + sfx for tools/reels/ladder-3d.html, then mux with the rendered video.
#   one-off setup:  pip install piper-tts
#                   curl -L -O https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ar_JO-SA_dii-high.tar.bz2 && tar xjf vits-piper-ar_JO-SA_dii-high.tar.bz2
#   usage: VOICE=path/to/vits-piper-ar_JO-SA_dii-high ./build-audio.sh video.mp4 out.mp4
# narration.txt: one line per cue (fully voweled for correct pronunciation). If you change a line,
# re-run and copy the printed cue list into CUES in ladder-3d.html, then re-render the video.
set -euo pipefail
cd "$(dirname "$0")"; M="$VOICE/ar_JO-SA_dii-high.onnx"; i=0; mkdir -p tmp
while IFS= read -r l; do i=$((i+1)); echo "$l" | python3 -m piper -m "$M" -c "$M.json" --sentence-silence 0.2 -f tmp/c$i.wav 2>/dev/null
  ffmpeg -nostdin -v error -y -i tmp/c$i.wav -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,atempo=1.1" -ar 44100 -ac 1 tmp/k$i.wav
done < narration.txt
python3 mix.py tmp
ffmpeg -nostdin -v error -y -i "$1" -i tmp/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$2"
echo wrote "$2"
