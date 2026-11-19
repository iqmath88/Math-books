#!/usr/bin/env bash
# Narration for cinema/idea1-tank: one clip per narration.txt line (Piper, Arabic female voice "SA_dii-high").
# usage: bash cinema/idea1-tank/tts.sh <model.onnx> <out dir> [narration.txt]      then: python3 cinema/idea1-tank/mix.py <out dir> full
# model: vits-piper-ar_JO-SA_dii-high (onnx + its .json next to it). Settings chosen on the earlier reels (voice "B").
set -euo pipefail
M=${1:?model.onnx}; O=${2:?out dir}; mkdir -p "$O"; here=$(cd "$(dirname "$0")" && pwd); N=${3:-$here/narration.txt}
grep -v '^#' "$N" | while IFS='|' read -r key text; do
  [ -z "$key" ] && continue
  echo "$text" | piper --model "$M" --output_file "$O/raw_$key.wav" \
    --length-scale 1.1 --noise-scale 0.8 --noise-w-scale 1.0 --sentence-silence 0.4 >/dev/null 2>&1
  # trim leading/trailing silence, then 4 % faster
  ffmpeg -nostdin -v error -y -i "$O/raw_$key.wav" -af \
    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=1.04" \
    "$O/$key.wav"
done
echo "clips in $O"
