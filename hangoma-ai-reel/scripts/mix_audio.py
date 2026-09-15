#!/usr/bin/env python3
"""Mix voiceover + ducked background music + SFX cues into one audio track,
using the exact same scene timeline as render.py (so cues line up with the
visuals frame-for-frame)."""
import json
import os
import subprocess
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from render import build_timeline  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "output")
SFX_DIR = os.path.join(ROOT, "assets", "sfx")
MUSIC_DIR = os.path.join(ROOT, "assets", "music")
SR = 44100


def read_wav_mono(path):
    with wave.open(path, "rb") as w:
        sr = w.getframerate()
        n = w.getnframes()
        raw = w.readframes(n)
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
        if w.getnchannels() == 2:
            data = data.reshape(-1, 2).mean(axis=1)
    if sr != SR:
        # simple linear resample (good enough for SFX/short clips at this SR ratio)
        n_out = int(len(data) * SR / sr)
        x_old = np.linspace(0, 1, len(data))
        x_new = np.linspace(0, 1, n_out)
        data = np.interp(x_new, x_old, data).astype(np.float32)
    return data


def write_wav(path, samples):
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def mix_at(buf, samples, start_time, gain=1.0):
    start = int(start_time * SR)
    if start >= len(buf):
        return
    end = start + len(samples)
    if end > len(buf):
        samples = samples[: len(buf) - start]
        end = len(buf)
    if end <= start:
        return
    buf[start:end] += samples * gain


def duck_envelope(n_total, vo_windows, sr, duck_level=0.28, fade=0.15):
    """1.0 outside VO, dipping to duck_level under each VO window, with a
    smooth fade in/out so the ducking isn't a hard on/off click."""
    env = np.ones(n_total, dtype=np.float32)
    fade_n = int(fade * sr)
    for (s, e) in vo_windows:
        si, ei = int(s * sr), int(e * sr)
        si, ei = max(0, si), min(n_total, ei)
        if ei <= si:
            continue
        env[si:ei] = duck_level
        for i in range(fade_n):
            if si - i - 1 >= 0:
                t = i / fade_n
                env[si - i - 1] = min(env[si - i - 1], 1.0 - t * (1.0 - duck_level))
            if ei + i < n_total:
                t = i / fade_n
                env[ei + i] = min(1.0, duck_level + t * (1.0 - duck_level))
    return env


def main():
    with open(os.path.join(OUT_DIR, "word_timings.json"), encoding="utf-8") as f:
        vo_data = json.load(f)
    tl = build_timeline(vo_data)
    total_dur = tl["total"]
    n_total = int(total_dur * SR)

    voiceover_44k = os.path.join(OUT_DIR, "voiceover_44100.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(OUT_DIR, "voiceover.wav"),
         "-ar", str(SR), "-ac", "1", voiceover_44k],
        check=True,
    )

    buf = np.zeros(n_total, dtype=np.float32)

    # --- voiceover, starting right after the opening burst ---
    vo = read_wav_mono(voiceover_44k)
    vo_start = tl["open_start"] + tl["OPEN_DUR"]
    mix_at(buf, vo, vo_start, gain=1.0)
    vo_windows = [
        (vo_start, vo_start + tl["seg1_dur"]),
        (tl["seg2_start"], tl["seg2_start"] + tl["seg2_dur"]),
        (tl["seg3_start"], tl["seg3_start"] + tl["seg3_dur"]),
    ]

    # --- background music, ducked under VO, held up during open/transitions/tail ---
    music_src = read_wav_mono(os.path.join(MUSIC_DIR, "hype_beat.wav"))
    reps = int(np.ceil(n_total / len(music_src))) + 1
    music = np.tile(music_src, reps)[:n_total]
    env = duck_envelope(n_total, vo_windows, SR, duck_level=0.22)
    music_fade_n = int(0.35 * SR)
    music[:music_fade_n] *= np.linspace(0, 1, music_fade_n)
    music[-music_fade_n:] *= np.linspace(1, 0, music_fade_n)
    buf += music * env * 0.55

    # --- SFX cues, timed to the same chunk beats as render.py's draw_frame ---
    sfx = {name: read_wav_mono(os.path.join(SFX_DIR, f"{name}.wav"))
           for name in ["whoosh", "pop", "bass_impact", "whoop_rise", "notification_ping"]}

    def cue(name, t, gain=0.9):
        mix_at(buf, sfx[name], t, gain=gain)

    # open: explosion hit
    cue("bass_impact", tl["open_start"], gain=1.0)
    cue("whoosh", tl["open_start"] + 0.03, gain=0.8)

    # seg1: two stat chunks (numbers land with a thump + pop)
    half = tl["seg1_dur"] / 2
    cue("bass_impact", vo_start, gain=0.55)
    cue("pop", vo_start, gain=0.8)
    cue("bass_impact", vo_start + half, gain=0.55)
    cue("pop", vo_start + half, gain=0.8)

    # transition 1
    cue("whoosh", tl["trans1_start"], gain=0.9)

    # seg2: three chunks (clock / AI badge / play icon)
    third = tl["seg2_dur"] / 3
    cue("pop", tl["seg2_start"], gain=0.7)
    cue("pop", tl["seg2_start"] + third, gain=0.7)
    cue("pop", tl["seg2_start"] + 2 * third, gain=0.7)

    # transition 2: zoom punch + shake
    cue("whoop_rise", tl["trans2_start"], gain=0.9)

    # seg3: CTA chunk + brand reveal ping
    cue("pop", tl["seg3_start"], gain=0.8)
    cta_end = tl["seg3_dur"] * 0.62
    cue("notification_ping", tl["seg3_start"] + cta_end, gain=1.0)

    # soft limiter
    peak = np.max(np.abs(buf)) or 1.0
    if peak > 0.98:
        buf = buf / peak * 0.98

    out_path = os.path.join(OUT_DIR, "mixed_audio.wav")
    write_wav(out_path, buf)
    print(f"wrote {out_path} ({total_dur:.3f}s)")


if __name__ == "__main__":
    main()
