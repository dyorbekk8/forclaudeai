#!/usr/bin/env python3
"""Synthesize the reel's SFX with numpy (Pixabay/Mixkit are unreachable from
this sandbox's network policy, so CC0 packs can't be downloaded)."""
import os
import wave
import numpy as np

SR = 44100
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
os.makedirs(OUT_DIR, exist_ok=True)


def write_wav(path, samples):
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def envelope(n, attack, release):
    e = np.ones(n)
    a = int(n * attack)
    r = int(n * release)
    if a > 0:
        e[:a] = np.linspace(0, 1, a)
    if r > 0:
        e[-r:] = np.linspace(1, 0, r)
    return e


def whoosh(duration=0.35):
    n = int(SR * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    noise = np.random.uniform(-1, 1, n)
    # sweep a bandpass center frequency up then let it decay -> classic whoosh
    center = 400 + 3500 * (t / duration) ** 1.5
    phase = np.cumsum(2 * np.pi * center / SR)
    tone = np.sin(phase)
    sig = noise * 0.6 + tone * 0.4
    sig *= envelope(n, 0.08, 0.75)
    sig *= np.linspace(1.0, 0.3, n)
    return sig * 0.9


def pop(duration=0.09):
    n = int(SR * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    freq = 1800
    sig = np.sin(2 * np.pi * freq * t) * np.exp(-t * 60)
    click = np.random.uniform(-1, 1, n) * np.exp(-t * 120) * 0.4
    return (sig + click) * 0.8


def bass_impact(duration=0.45):
    n = int(SR * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    freq = 130 * np.exp(-t * 10) + 40
    phase = np.cumsum(2 * np.pi * freq / SR)
    sig = np.sin(phase) * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 8)
    noise_click = np.random.uniform(-1, 1, n) * np.exp(-t * 200) * 0.5
    return (sig * 0.7 + sub * 0.5 + noise_click) * 0.95


def whoop_rise(duration=0.55):
    n = int(SR * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    freq = 250 + 2200 * (t / duration) ** 2
    phase = np.cumsum(2 * np.pi * freq / SR)
    sig = np.sin(phase) + 0.3 * np.sin(2 * phase)
    sig *= envelope(n, 0.05, 0.35)
    return sig * 0.7


def notification_ping(duration=0.5):
    n = int(SR * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    f1, f2 = 1568.0, 2093.0  # G6 -> C7, bright "ding-ding"
    e1 = np.exp(-t * 7)
    tone1 = np.sin(2 * np.pi * f1 * t) * e1
    delay = int(SR * 0.12)
    tone2 = np.zeros(n)
    tone2[delay:] = np.sin(2 * np.pi * f2 * t[: n - delay]) * np.exp(-t[: n - delay] * 6)
    sig = tone1 * 0.6 + tone2 * 0.6
    return sig * 0.8


def main():
    sfx = {
        "whoosh.wav": whoosh(),
        "pop.wav": pop(),
        "bass_impact.wav": bass_impact(),
        "whoop_rise.wav": whoop_rise(),
        "notification_ping.wav": notification_ping(),
    }
    for name, samples in sfx.items():
        path = os.path.join(OUT_DIR, name)
        write_wav(path, samples)
        print(f"wrote {path} ({len(samples) / SR:.3f}s)")


if __name__ == "__main__":
    main()
