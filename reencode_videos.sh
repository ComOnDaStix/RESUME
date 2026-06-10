#!/bin/bash
# Re-encode originals from Assests/*.mp4|MP4 into Assests/web/videos/*.mp4
# Quality target: 1080p max dimension, H.264 CRF 20, AAC 128k, faststart.

set -e
FF=~/bin/ffmpeg
SRC=/Users/com/photogrophy/Assests
DST=/Users/com/photogrophy/Assests/web/videos
LOG=/Users/com/photogrophy/reencode.log

: > "$LOG"

shopt -s nullglob
cd "$SRC"

for input in *.mp4 *.MP4; do
  [ -e "$input" ] || continue
  # Output uses lowercase .mp4 extension to match existing web naming
  base="${input%.*}"
  output="$DST/${base}.mp4"
  tmp="$DST/.${base}.tmp.mp4"

  echo "[$(date +%H:%M:%S)] >>> $input -> $output" | tee -a "$LOG"

  "$FF" -y -i "$input" \
    -vf "scale=1920:1920:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -c:v libx264 -preset slow -crf 20 -profile:v high -level 4.2 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ac 2 \
    -movflags +faststart \
    "$tmp" >> "$LOG" 2>&1

  mv "$tmp" "$output"
  size=$(ls -lh "$output" | awk '{print $5}')
  echo "[$(date +%H:%M:%S)] <<< done: $output ($size)" | tee -a "$LOG"
done

echo "[$(date +%H:%M:%S)] ALL DONE" | tee -a "$LOG"
