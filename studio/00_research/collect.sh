#!/usr/bin/env bash
# Collects metadata, captions and thumbnails for the research corpus.
set -u
cd "$(dirname "$0")"
mkdir -p data/meta data/subs data/thumbs

CORPUS=(
  K41m75_OapU KgHM7rggPek 3pJGGadJy9g i-tdkQKBxjM QlPLtq7c77A y1cfJiVnXUg dyb9UmbbMao
  S8la96LpApQ XmzYT4Arkas 0QSWsAJoV3c fB5QyKPSVzc N7jHGtn747Q n7Xqdntq6jA
  uf9te_WeP84 uikZS1niYW0 BfU1w0muDTk cZSpnb_LUrI
  kTSKw7vztds 0tQDhjkngP0
  U82kws12DM4 _sWnisokq84 ZHi5GFaIOao
  EyN93SqOyR4 8dCrNJwPCE0 HTV0N_2v2Ps
  cU4TIgi_dyU
)
printf "%s\n" "${CORPUS[@]}" > data/corpus_ids.txt

# Thumbnails for every video of the reference channels (direct CDN, no rate limit).
cat data/UnclassifiedYTT.txt data/FieldManualYT.txt data/TerrainAndTactics.txt data/BriefedYT.txt data/CasualTactics.txt \
  | cut -d'|' -f1 | sort -u > data/all_ref_ids.txt
echo "cU4TIgi_dyU" >> data/all_ref_ids.txt
while read -r id; do
  [ -s "data/thumbs/$id.jpg" ] && continue
  curl -sSf -m 20 -o "data/thumbs/$id.jpg" "https://i.ytimg.com/vi/$id/maxresdefault.jpg" \
    || curl -sSf -m 20 -o "data/thumbs/$id.jpg" "https://i.ytimg.com/vi/$id/hqdefault.jpg" || echo "thumb fail $id"
done < data/all_ref_ids.txt
echo "thumbs: $(ls data/thumbs | wc -l)"

# Full metadata + captions for the corpus.
for id in "${CORPUS[@]}"; do
  if [ ! -s "data/meta/$id.info.json" ]; then
    yt-dlp --js-runtimes node --skip-download --write-info-json --no-write-playlist-metafiles \
      --write-auto-subs --write-subs --sub-langs "en-orig,en" --sub-format json3 \
      --sleep-requests 1 --sleep-subtitles 3 \
      -o "data/meta/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$id" >/dev/null 2>>data/collect_errors.log \
      || echo "meta fail $id" >> data/collect_errors.log
    sleep 2
  fi
done
mv data/meta/*.json3 data/subs/ 2>/dev/null
echo "meta: $(ls data/meta/*.info.json 2>/dev/null | wc -l) / ${#CORPUS[@]}"
echo "subs: $(ls data/subs | wc -l)"
echo DONE
