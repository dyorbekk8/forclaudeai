#!/usr/bin/env python3
"""Generate the Uzbek voiceover for the hangoma.ai reel and word-level timing data.

Primary path: edge-tts (uz-UZ-SardorNeural), which also gives exact word
boundaries via SubMaker -- used automatically if network access allows it.

Fallback (used in this environment, where edge-tts's backend host is blocked
by the sandbox's egress policy): espeak-ng's "uz" voice, with per-word timing
estimated proportionally by character count within each measured segment
duration (ffprobe-verified). Swap in a real neural voiceover later by
re-running with USE_EDGE_TTS=1 once network access to speech.platform.bing.com
is available, or by dropping a pre-recorded voiceover.wav + matching
word_timings.json in output/ (see README.md in this folder).
"""
import asyncio
import json
import os
import subprocess
import sys

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUT_DIR, exist_ok=True)

VOICE_EDGE = "uz-UZ-SardorNeural"  # energetic male voice, matches the confident/energetic brief
VOICE_ESPEAK = "uz"

SEGMENTS = [
    "Haliyam soatlab montaj qilib, bir necha yuzta ko'rishga erishyapsizmi?",
    "Endi kerak emas. Sun'iy intellekt bilan, daqiqalarda kuchli video tayyor.",
    "Narxi bilan tanishish uchun, directga yoz.",
]

ESPEAK_RATE = "225"
ESPEAK_PITCH = "60"
ESPEAK_AMP = "190"
SEG_GAP = 0.2


def ffprobe_duration(path: str) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def word_spans(text: str, duration: float, start_offset: float):
    """Allocate `duration` seconds across the words of `text` proportional to
    character length (a standard approximation absent forced alignment)."""
    words = text.replace("—", " ").split()
    words = [w.strip(",.?!") for w in words if w.strip(",.?!")]
    weights = [max(len(w), 2) for w in words]
    total_w = sum(weights)
    t = start_offset
    spans = []
    for w, wt in zip(words, weights):
        dur = duration * (wt / total_w)
        spans.append({"word": w, "start": round(t, 3), "end": round(t + dur, 3)})
        t += dur
    return spans


def gen_espeak(segments):
    seg_files = []
    for i, text in enumerate(segments):
        wav = os.path.join(OUT_DIR, f"vo_seg{i}.wav")
        subprocess.run(
            ["espeak-ng", "-v", VOICE_ESPEAK, "-s", ESPEAK_RATE, "-p", ESPEAK_PITCH,
             "-a", ESPEAK_AMP, "-w", wav, text],
            check=True,
        )
        seg_files.append(wav)
    return seg_files


async def gen_edge(segments):
    import edge_tts
    seg_files = []
    boundaries_per_seg = []
    for i, text in enumerate(segments):
        mp3 = os.path.join(OUT_DIR, f"vo_seg{i}.mp3")
        wav = os.path.join(OUT_DIR, f"vo_seg{i}.wav")
        communicate = edge_tts.Communicate(text, VOICE_EDGE)
        boundaries = []
        with open(mp3, "wb") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    boundaries.append(chunk)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, wav], check=True)
        seg_files.append(wav)
        boundaries_per_seg.append(boundaries)
    return seg_files, boundaries_per_seg


def concat_segments(seg_files, gap=0.35):
    """Concatenate segment wavs with a short natural gap between sentences."""
    silence = os.path.join(OUT_DIR, "_silence.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
         "-i", f"anullsrc=r=24000:cl=mono", "-t", str(gap), silence],
        check=True,
    )
    list_path = os.path.join(OUT_DIR, "_concat.txt")
    with open(list_path, "w") as f:
        for i, seg in enumerate(seg_files):
            f.write(f"file '{os.path.abspath(seg)}'\n")
            if i != len(seg_files) - 1:
                f.write(f"file '{os.path.abspath(silence)}'\n")
    final_wav = os.path.join(OUT_DIR, "voiceover.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", list_path, "-ar", "24000", "-ac", "1", final_wav],
        check=True,
    )
    return final_wav


def main():
    use_edge = os.environ.get("USE_EDGE_TTS") == "1"
    engine = "espeak-ng (offline fallback)"
    timings_all = []
    seg_durations = []

    if use_edge:
        try:
            seg_files, boundaries_per_seg = asyncio.run(gen_edge(SEGMENTS))
            engine = f"edge-tts ({VOICE_EDGE})"
            t = 0.0
            gap = 0.35
            for i, (text, boundaries) in enumerate(zip(SEGMENTS, boundaries_per_seg)):
                dur = ffprobe_duration(seg_files[i])
                if boundaries:
                    for b in boundaries:
                        w_start = t + b["offset"] / 1e7
                        w_end = w_start + b["duration"] / 1e7
                        timings_all.append({"word": b["text"], "start": round(w_start, 3), "end": round(w_end, 3)})
                else:
                    timings_all.extend(word_spans(text, dur, t))
                seg_durations.append(dur)
                t += dur + (gap if i != len(SEGMENTS) - 1 else 0)
        except Exception as e:
            print(f"edge-tts failed ({e}); falling back to espeak-ng", file=sys.stderr)
            use_edge = False

    if not use_edge:
        seg_files = gen_espeak(SEGMENTS)
        t = 0.0
        gap = SEG_GAP
        for i, text in enumerate(SEGMENTS):
            dur = ffprobe_duration(seg_files[i])
            timings_all.extend(word_spans(text, dur, t))
            seg_durations.append(dur)
            t += dur + (gap if i != len(SEGMENTS) - 1 else 0)

    final_wav = concat_segments(seg_files, gap=SEG_GAP)
    total_dur = ffprobe_duration(final_wav)

    data = {
        "engine": engine,
        "segments": [
            {"text": text, "duration": round(d, 3)}
            for text, d in zip(SEGMENTS, seg_durations)
        ],
        "gap": SEG_GAP,
        "total_duration": round(total_dur, 3),
        "words": timings_all,
    }
    with open(os.path.join(OUT_DIR, "word_timings.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Engine: {engine}")
    print(f"Total VO duration: {total_dur:.3f}s")
    for s in data["segments"]:
        print(f"  seg: {s['duration']:.3f}s -- {s['text']}")


if __name__ == "__main__":
    main()
