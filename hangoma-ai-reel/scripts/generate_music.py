#!/usr/bin/env python3
"""Synthesize a simple 128 BPM energetic/hype background beat with numpy
(royalty-free libraries like Pixabay/Mixkit audio are unreachable from this
sandbox's network policy)."""
import os
import sys
import wave
import numpy as np

SR = 44100
BPM = 128
BEAT = 60.0 / BPM
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "music")
os.makedirs(OUT_DIR, exist_ok=True)


def write_wav(path, samples):
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def kick(n):
    t = np.linspace(0, n / SR, n, endpoint=False)
    freq = 120 * np.exp(-t * 18) + 45
    phase = np.cumsum(2 * np.pi * freq / SR)
    return np.sin(phase) * np.exp(-t * 9)


def hihat(n, open_=False):
    t = np.linspace(0, n / SR, n, endpoint=False)
    decay = 3.5 if open_ else 22
    noise = np.random.uniform(-1, 1, n)
    # crude high-pass: subtract a smoothed version
    kernel = 9
    smooth = np.convolve(noise, np.ones(kernel) / kernel, mode="same")
    hp = noise - smooth
    return hp * np.exp(-t * decay) * 0.5


def bass_note(n, freq):
    t = np.linspace(0, n / SR, n, endpoint=False)
    sig = np.sin(2 * np.pi * freq * t)
    sig += 0.35 * np.sin(2 * np.pi * freq * 2 * t)
    env = np.ones(n)
    a = int(0.01 * SR)
    env[:a] = np.linspace(0, 1, a)
    return sig * env


def mix_at(buf, samples, start_sample, gain=1.0):
    end = start_sample + len(samples)
    if end > len(buf):
        samples = samples[: len(buf) - start_sample]
        end = len(buf)
    if start_sample < 0 or start_sample >= len(buf):
        return
    buf[start_sample:end] += samples[: end - start_sample] * gain


def build_track(duration):
    n_total = int(SR * duration)
    buf = np.zeros(n_total)

    # root notes for a simple 4-bar minor loop, one change per bar (bar = 4 beats)
    roots = [110.0, 98.0, 87.31, 98.0]  # A2, G2, F2, G2 -- energetic minor feel

    beat_i = 0
    tt = 0.0
    while tt < duration:
        bar = beat_i // 4
        beat_in_bar = beat_i % 4
        start = int(tt * SR)

        # kick on every beat
        k = kick(int(0.35 * SR))
        mix_at(buf, k, start, gain=0.9)

        # closed hihat on the off-8th
        hh_start = int((tt + BEAT / 2) * SR)
        hh = hihat(int(0.08 * SR), open_=(beat_in_bar == 3))
        mix_at(buf, hh, hh_start, gain=0.5)

        # bass pulses with the kick, root note per bar
        root = roots[bar % len(roots)]
        b = bass_note(int(BEAT * 0.9 * SR), root)
        mix_at(buf, b, start, gain=0.35)

        beat_i += 1
        tt += BEAT

    # gentle overall fade in/out so loop point + start/end are clean
    fade_n = int(0.05 * SR)
    buf[:fade_n] *= np.linspace(0, 1, fade_n)
    buf[-fade_n:] *= np.linspace(1, 0, fade_n)

    # soft limiter
    peak = np.max(np.abs(buf)) or 1.0
    buf = buf / peak * 0.85
    return buf


def main():
    duration = float(sys.argv[1]) if len(sys.argv) > 1 else 15.0
    track = build_track(duration)
    path = os.path.join(OUT_DIR, "hype_beat.wav")
    write_wav(path, track)
    print(f"wrote {path} ({duration:.2f}s, {BPM} BPM)")


if __name__ == "__main__":
    main()
