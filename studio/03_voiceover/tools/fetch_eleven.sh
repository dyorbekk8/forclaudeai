#!/usr/bin/env bash
# fetch_eleven.sh <beat_id> <generation_id> <url>  -> sprinkler/eleven/<beat_id>.mp3, appends manifest
set -euo pipefail
d="$(dirname "$0")/../sprinkler/eleven"; mkdir -p "$d"
curl -sSf -m 60 -o "$d/$1.mp3" "$3"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$d/$1.mp3")
echo "$1,$2,$dur" >> "$d/manifest.csv"
echo "$1 ok $dur"
