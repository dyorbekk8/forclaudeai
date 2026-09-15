#!/usr/bin/env python3
"""Render the hangoma.ai reel: 1080x1920 vertical, Apple-style minimalist +
kinetic-typography frames, driven by the measured voiceover timing.

Frames are streamed as raw RGB24 into ffmpeg (image2pipe) to avoid writing
hundreds of PNGs to disk.
"""
import json
import math
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "output")
FONT_DIR = os.path.join(ROOT, "assets", "fonts")
FOOTAGE_PATH = os.path.join(ROOT, "assets", "footage", "hangoma_source_b.mp4")
# the source clip cuts to a different, less on-brand scene (banquet table)
# around 4.85s -- only the romantic couple portrait portion before that is used.
FOOTAGE_USABLE_DURATION = 4.7

W, H = 1080, 1920
FPS = 30

# ---- palette (2 base colors + 1 accent, per the Apple-style brief) --------
BG_A = (7, 9, 14)        # near-black navy
BG_B = (12, 15, 24)      # slightly lighter navy (used after each "cut")
ACCENT = (58, 150, 255)  # electric blue
WHITE = (244, 247, 252)
MUTED = (146, 156, 176)

F_BLACK = os.path.join(FONT_DIR, "Poppins-900.ttf")
F_BOLD = os.path.join(FONT_DIR, "Poppins-700.ttf")
F_SEMI = os.path.join(FONT_DIR, "Poppins-600.ttf")
F_REG = os.path.join(FONT_DIR, "Poppins-400.ttf")


def font(path, size):
    return ImageFont.truetype(path, size)


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_out_cubic(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ease_out_back(t, overshoot=1.7):
    t = clamp(t)
    c1 = overshoot
    c3 = c1 + 1
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def ease_in_cubic(t):
    t = clamp(t)
    return t ** 3


# ---------------------------------------------------------------------------
# text-layer helpers: render text to its own RGBA layer so it can be scaled
# and alpha-blended for punch-in / punch-out kinetic animation.
# ---------------------------------------------------------------------------

def render_text_layer(text, fontpath, size, color, pad=40):
    fnt = font(fontpath, size)
    tmp = Image.new("RGBA", (10, 10))
    d = ImageDraw.Draw(tmp)
    bbox = d.textbbox((0, 0), text, font=fnt)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    layer = Image.new("RGBA", (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text((pad - bbox[0], pad - bbox[1]), text, font=fnt, fill=color)
    return layer


def paste_scaled(frame, layer, cx, cy, scale, alpha=1.0):
    if scale <= 0.001 or alpha <= 0.004:
        return
    w, h = layer.size
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = layer.resize((nw, nh), Image.LANCZOS)
    if alpha < 1.0:
        a = resized.getchannel("A").point(lambda p: int(p * alpha))
        resized.putalpha(a)
    frame.alpha_composite(resized, (int(cx - nw / 2), int(cy - nh / 2)))


def punch_anim(local_t, hold_until, punch_dur=0.22, exit_dur=0.12):
    """Returns (scale, alpha) for a chunk shown from t=0, punching in with
    overshoot, holding, then a fast exit (used for hard-cut kinetic swaps)."""
    if local_t < 0:
        return 0.0, 0.0
    if local_t < punch_dur:
        p = ease_out_back(local_t / punch_dur)
        return max(p, 0.0), clamp(local_t / (punch_dur * 0.6))
    if local_t < hold_until - exit_dur:
        return 1.0, 1.0
    if local_t < hold_until:
        p = (local_t - (hold_until - exit_dur)) / exit_dur
        return 1.0 - 0.25 * ease_in_cubic(p), 1.0 - ease_in_cubic(p)
    return 0.0, 0.0


# ---------------------------------------------------------------------------
# background + shared fx
# ---------------------------------------------------------------------------

def draw_gradient_bg(bg_color):
    top = tuple(min(255, c + 10) for c in bg_color)
    bot = tuple(max(0, c - 6) for c in bg_color)
    grad = np.linspace(0, 1, H).reshape(H, 1)
    row = np.array(top) * (1 - grad) + np.array(bot) * grad
    arr = np.repeat(row[:, np.newaxis, :], W, axis=1).astype(np.uint8)
    return Image.fromarray(arr, "RGB").convert("RGBA")


class FootageSource:
    """Sequential-read wrapper around a real client clip, used as before/after
    b-roll behind the hook + AI-transformation scenes. The clip is already
    9:16 (720x1280), matching the 1080x1920 canvas exactly, so no cropping is
    needed -- just an upscale."""

    def __init__(self, path):
        self.cap = cv2.VideoCapture(path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 30.0
        self.n_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.duration = self.n_frames / self.fps
        self.pos = -1
        self.last_frame = None

    def get_frame(self, src_t):
        idx = min(self.n_frames - 1, max(0, int(src_t * self.fps)))
        if idx == self.pos and self.last_frame is not None:
            return self.last_frame
        if idx < self.pos:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            self.pos = idx - 1
        while self.pos < idx:
            ok, bgr = self.cap.read()
            self.pos += 1
            if not ok:
                break
        if self.last_frame is None or ok:
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(rgb).resize((W, H), Image.LANCZOS).convert("RGBA")
            self.last_frame = img
        return self.last_frame


_footage = None


def get_footage():
    global _footage
    if _footage is None:
        _footage = FootageSource(FOOTAGE_PATH)
    return _footage


def grade_raw(frame_rgba):
    """'Before' look: desaturated, slightly flat/dim -- reads as unedited
    raw footage nobody wants to sit through for 3 hours."""
    rgb = frame_rgba.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(0.35)
    rgb = ImageEnhance.Contrast(rgb).enhance(0.88)
    rgb = ImageEnhance.Brightness(rgb).enhance(0.72)
    out = rgb.convert("RGBA")
    scrim = Image.new("RGBA", (W, H), (5, 6, 10, 130))
    out.alpha_composite(scrim)
    return out


def grade_enhanced(frame_rgba):
    """'After' look: punchy, warm, saturated -- sells the AI-enhanced result."""
    rgb = frame_rgba.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(1.35)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.16)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.06)
    out = rgb.convert("RGBA")
    glow = Image.new("RGBA", (W, H), (*ACCENT, 26))
    out.alpha_composite(glow)
    scrim = Image.new("RGBA", (W, H), (4, 6, 12, 95))
    out.alpha_composite(scrim)
    return out


def draw_bottom_scrim(frame, strength=190):
    """Extra darkening at the bottom third so captions stay legible over
    busy real-footage backgrounds."""
    grad = Image.new("L", (1, H), 0)
    for y in range(H):
        p = clamp((y - H * 0.32) / (H * 0.55))
        grad.putpixel((0, y), int(strength * ease_out_cubic(p)))
    grad = grad.resize((W, H))
    dark = Image.new("RGBA", (W, H), (2, 3, 6, 255))
    dark.putalpha(grad)
    frame.alpha_composite(dark)


def draw_rec_counter(frame, local_t, seg_dur):
    """Fake ticking timecode ('3 soat' worth of raw footage) + REC dot,
    top-left, to visually sell the "hours of raw material" pain point."""
    fake_hours_total = 3.0 + 7.0 / 60  # "3 SOAT" hook, matches the stat text
    p = clamp(local_t / seg_dur)
    fake_seconds = p * fake_hours_total * 3600
    hh = int(fake_seconds // 3600)
    mm = int((fake_seconds % 3600) // 60)
    ss = int(fake_seconds % 60)
    label = f"REC  {hh:02d}:{mm:02d}:{ss:02d}"
    layer = render_text_layer(label, F_SEMI, 34, WHITE, pad=14)
    x, y = 46, 70
    blink_on = int(local_t * 2.4) % 2 == 0
    d = ImageDraw.Draw(frame, "RGBA")
    if blink_on:
        d.ellipse([x, y + layer.height / 2 - 8, x + 16, y + layer.height / 2 + 8],
                  fill=(235, 70, 70, 255))
    frame.alpha_composite(layer, (x + 26, y))


def _sparkle(size, color):
    """A tiny 4-point sparkle/star drawn as shapes (no emoji font dependency)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = size / 2
    d.polygon([(c, 0), (c * 1.22, c * 0.78), (size, c), (c * 1.22, c * 1.22),
               (c, size), (c * 0.78, c * 1.22), (0, c), (c * 0.78, c * 0.78)],
              fill=color)
    return img


def draw_ai_enhanced_badge(frame, local_t, third):
    """Small pill badge over the enhanced footage, punching in once."""
    p = clamp((local_t - 0.1) / 0.3)
    if p <= 0:
        return
    scale = ease_out_back(p)
    layer = render_text_layer("AI ENHANCED", F_SEMI, 40, WHITE, pad=20)
    spark = _sparkle(34, WHITE)
    pill = Image.new("RGBA", (layer.width + spark.width + 40, layer.height + 20), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle([0, 0, pill.width, pill.height], radius=pill.height / 2,
                          fill=(*ACCENT, 235))
    pill.alpha_composite(spark, (18, int(pill.height / 2 - spark.height / 2)))
    pill.alpha_composite(layer, (18 + spark.width + 4, 10))
    paste_scaled(frame, pill, W / 2, H * 0.135, scale, clamp(p * 2))


def add_vignette(frame):
    """Subtle edge darkening only -- the ellipse marks the "fully lit" zone,
    so this must NOT dim the readable center where text/icons live."""
    vg = Image.new("L", (W, H), 195)
    d = ImageDraw.Draw(vg)
    d.ellipse([-W * 0.5, -H * 0.35, W * 1.5, H * 1.25], fill=255)
    vg = vg.filter(ImageFilter.GaussianBlur(180))
    dark = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    dark.putalpha(Image.eval(vg, lambda p: 255 - p))
    frame.alpha_composite(dark)


def screen_flash(frame, alpha):
    if alpha <= 0.003:
        return
    overlay = Image.new("RGBA", (W, H), (255, 255, 255, int(255 * clamp(alpha))))
    frame.alpha_composite(overlay)


def strobe_alpha(p, decay=22.0, peak=0.9):
    """A punchy, fast-decaying flash for hard cuts -- reads as a strobe pop,
    not a sustained gray wash (p is 0..1 progress through the transition)."""
    return peak * math.exp(-decay * max(p, 0.0))


def whip_streaks(frame, progress, color=ACCENT):
    """Fast horizontal streaks sweeping across the frame to sell a hard cut."""
    d = ImageDraw.Draw(frame, "RGBA")
    n = 5
    for i in range(n):
        y = int(H * (i + 0.5) / n)
        band_h = 10 + i * 4
        x = int(-W * 0.5 + (W * 2.2) * ease_out_cubic(progress) - i * 40)
        length = 260 + i * 30
        a = int(210 * (1 - progress))
        d.rectangle([x, y - band_h // 2, x + length, y + band_h // 2],
                    fill=(color[0], color[1], color[2], max(a, 0)))


def screen_shake_offset(t, dur, magnitude=14):
    if t < 0 or t > dur:
        return 0, 0
    decay = 1 - t / dur
    ang = t * 90
    return (int(magnitude * decay * math.sin(ang)),
            int(magnitude * decay * math.cos(ang * 1.3)))


# ---------------------------------------------------------------------------
# icon drawing (simple generic shapes -- no third-party trademarks reproduced)
# ---------------------------------------------------------------------------

def draw_clock(frame, cx, cy, r, t, glow=ACCENT):
    d = ImageDraw.Draw(frame, "RGBA")
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.ellipse([cx - r - 18, cy - r - 18, cx + r + 18, cy + r + 18],
               outline=(*glow, 120), width=10)
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(14))
    frame.alpha_composite(glow_layer)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=WHITE, width=8)
    for k in range(12):
        a = k / 12 * 2 * math.pi
        x1, y1 = cx + math.sin(a) * (r - 14), cy - math.cos(a) * (r - 14)
        x2, y2 = cx + math.sin(a) * (r - 26), cy - math.cos(a) * (r - 26)
        d.line([x1, y1, x2, y2], fill=MUTED, width=5)
    fast_ang = t * 2 * math.pi * 3.2  # spinning fast
    hx = cx + math.sin(fast_ang) * (r - 34)
    hy = cy - math.cos(fast_ang) * (r - 34)
    d.line([cx, cy, hx, hy], fill=(*glow, 255), width=10)
    slow_ang = t * 2 * math.pi * 0.6
    mx = cx + math.sin(slow_ang) * (r - 60)
    my = cy - math.cos(slow_ang) * (r - 60)
    d.line([cx, cy, mx, my], fill=WHITE, width=12)
    d.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=WHITE)


def draw_ai_badge(frame, cx, cy, r, pulse):
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gr = r + 30 + pulse * 24
    gd.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], fill=(*ACCENT, 90))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(40))
    frame.alpha_composite(glow_layer)
    d = ImageDraw.Draw(frame, "RGBA")
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*ACCENT, 235))
    layer = render_text_layer("AI", F_BLACK, int(r * 1.05), WHITE)
    paste_scaled(frame, layer, cx, cy, 1.0)


def draw_play_icon(frame, cx, cy, r, glow_alpha):
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.ellipse([cx - r - 20, cy - r - 20, cx + r + 20, cy + r + 20],
               fill=(*ACCENT, int(140 * glow_alpha)))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(30))
    frame.alpha_composite(glow_layer)
    d = ImageDraw.Draw(frame, "RGBA")
    d.rounded_rectangle([cx - r, cy - r, cx + r, cy + r], radius=r * 0.32,
                         outline=WHITE, width=7)
    tri = r * 0.42
    d.polygon([(cx - tri * 0.45, cy - tri), (cx - tri * 0.45, cy + tri),
               (cx + tri * 0.9, cy)], fill=WHITE)


def draw_dm_icon(frame, cx, cy, r):
    """Generic rounded chat-bubble + send-arrow -- not a reproduction of any
    specific app's trademarked logo."""
    d = ImageDraw.Draw(frame, "RGBA")
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.rounded_rectangle([cx - r, cy - r, cx + r, cy + r], radius=r * 0.34,
                          fill=(*ACCENT, 110))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(36))
    frame.alpha_composite(glow_layer)
    d.rounded_rectangle([cx - r, cy - r, cx + r, cy + r], radius=r * 0.34,
                         fill=(*ACCENT, 235))
    s = r * 0.85
    d.polygon([(cx - s, cy - s * 0.55), (cx + s, cy),
               (cx - s, cy + s * 0.55), (cx - s * 0.42, cy)],
              fill=WHITE)


def draw_wordmark(frame, cx, cy, scale, alpha):
    layer = render_text_layer("hangoma", F_BLACK, 118, WHITE)
    dot_ai = render_text_layer(".ai", F_BLACK, 118, ACCENT)
    combo = Image.new("RGBA", (layer.width + dot_ai.width, max(layer.height, dot_ai.height)), (0, 0, 0, 0))
    combo.alpha_composite(layer, (0, 0))
    combo.alpha_composite(dot_ai, (layer.width, 0))
    paste_scaled(frame, combo, cx, cy, scale, alpha)


# ---------------------------------------------------------------------------
# scene chunk config (texts synced proportionally within each VO segment)
# ---------------------------------------------------------------------------

def draw_stat_chunk(frame, cy, big_text, small_text, scale, alpha, color=WHITE):
    big = render_text_layer(big_text, F_BLACK, 168, color)
    small = render_text_layer(small_text, F_SEMI, 58, MUTED)
    paste_scaled(frame, big, W / 2, cy, scale, alpha)
    paste_scaled(frame, small, W / 2, cy + big.height * scale / 2 + 46 * scale, scale, alpha)


def draw_headline_chunk(frame, cy, lines, scale, alpha, size=96, color=WHITE, gap=14):
    layers = [render_text_layer(t, F_BLACK, size, color) for t in lines]
    total_h = sum(l.height for l in layers) + gap * (len(layers) - 1)
    y = cy - total_h * scale / 2
    for l in layers:
        paste_scaled(frame, l, W / 2, y + l.height * scale / 2, scale, alpha)
        y += (l.height + gap) * scale


def draw_cta_chunk(frame, cy, scale, alpha):
    layers = [
        render_text_layer("NARXI UCHUN", F_SEMI, 54, MUTED),
        render_text_layer("DIRECTGA YOZ", F_BLACK, 104, WHITE),
    ]
    total_h = sum(l.height for l in layers) + 20
    y = cy - total_h * scale / 2
    for l in layers:
        paste_scaled(frame, l, W / 2, y + l.height * scale / 2, scale, alpha)
        y += (l.height + 20) * scale


# ---------------------------------------------------------------------------
# main render
# ---------------------------------------------------------------------------

def build_timeline(vo):
    segs = vo["segments"]
    OPEN_DUR = 0.45
    # transitions must land exactly on the VO's inter-segment silence (see
    # generate_voiceover.py's SEG_GAP) or the video cuts drift out of sync
    # with the spoken segments.
    TRANS_DUR = vo.get("gap", 0.2)
    TAIL_DUR = 1.05

    t = 0.0
    tl = {"OPEN_DUR": OPEN_DUR, "TRANS_DUR": TRANS_DUR, "TAIL_DUR": TAIL_DUR}
    tl["open_start"] = t
    t += OPEN_DUR
    tl["seg1_start"] = t
    tl["seg1_dur"] = segs[0]["duration"]
    t += tl["seg1_dur"]
    tl["trans1_start"] = t
    t += TRANS_DUR
    tl["seg2_start"] = t
    tl["seg2_dur"] = segs[1]["duration"]
    t += tl["seg2_dur"]
    tl["trans2_start"] = t
    t += TRANS_DUR
    tl["seg3_start"] = t
    tl["seg3_dur"] = segs[2]["duration"]
    t += tl["seg3_dur"]
    tl["tail_start"] = t
    t += TAIL_DUR
    tl["total"] = t
    return tl


def render(vo_path, out_video):
    with open(vo_path, "r", encoding="utf-8") as f:
        vo = json.load(f)
    tl = build_timeline(vo)
    total_dur = tl["total"]
    n_frames = int(math.ceil(total_dur * FPS))
    print(f"Rendering {n_frames} frames ({total_dur:.3f}s @ {FPS}fps) -> {out_video}")

    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
        "-i", "-",
        "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18",
        out_video,
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    for fi in range(n_frames):
        t = fi / FPS
        frame = draw_frame(t, tl)
        proc.stdin.write(np.array(frame.convert("RGB")).tobytes())
        if fi % 30 == 0:
            print(f"  frame {fi}/{n_frames} t={t:.2f}s", flush=True)

    proc.stdin.close()
    proc.wait()
    return tl


def draw_frame(t, tl):
    footage_start, footage_end = tl["seg1_start"], tl["trans2_start"]
    use_footage = os.path.exists(FOOTAGE_PATH) and footage_start <= t < footage_end

    if use_footage:
        footage = get_footage()
        span = footage_end - footage_start
        usable = min(FOOTAGE_USABLE_DURATION, footage.duration)
        src_t = (t - footage_start) / span * usable
        raw = footage.get_frame(src_t)
        is_enhanced = t >= tl["seg2_start"]
        frame = grade_enhanced(raw) if is_enhanced else grade_raw(raw)
    else:
        # pick background shade: flips once per major scene boundary
        if t < tl["seg1_start"]:
            bg = BG_A
        elif t < tl["trans2_start"] + tl["TRANS_DUR"]:
            bg = BG_B
        else:
            bg = BG_A
        frame = draw_gradient_bg(bg)

    # ---------------- OPEN (radial burst) ----------------
    if t < tl["seg1_start"]:
        lt = t - tl["open_start"]
        p = clamp(lt / tl["OPEN_DUR"])
        cx, cy = W / 2, H * 0.42
        d = ImageDraw.Draw(frame, "RGBA")

        # radial rays shooting outward, fading as the burst progresses
        n_rays = 14
        ray_len = ease_out_cubic(p) * W * 0.55
        for k in range(n_rays):
            ang = 2 * math.pi * k / n_rays
            x2 = cx + math.cos(ang) * ray_len
            y2 = cy + math.sin(ang) * ray_len
            a = int(200 * (1 - p) ** 1.3)
            d.line([cx, cy, x2, y2], fill=(*ACCENT, a), width=6)

        # two expanding rings, offset in time, capped so they stay on-canvas
        for ring_i, delay in enumerate([0.0, 0.12]):
            rp = clamp((lt - delay) / (tl["OPEN_DUR"] - delay + 1e-6))
            if rp <= 0:
                continue
            r = ease_out_cubic(rp) * W * 0.5
            ring_alpha = int(255 * (1 - rp) ** 1.4)
            width = int(18 * (1 - rp) + 3)
            d.ellipse([cx - r, cy - r, cx + r, cy + r],
                      outline=(*ACCENT, ring_alpha), width=width)

        # bright core flash concentrated in the first couple of frames
        screen_flash(frame, strobe_alpha(p, decay=16, peak=0.95))

    # ---------------- SEG 1: hook stats ----------------
    if tl["seg1_start"] <= t < tl["trans1_start"]:
        local = t - tl["seg1_start"]
        if use_footage:
            draw_rec_counter(frame, local, tl["seg1_dur"])
            draw_bottom_scrim(frame, strength=205)
        half = tl["seg1_dur"] / 2
        s_a, a_a = punch_anim(local, half)
        s_b, a_b = punch_anim(local - half, tl["seg1_dur"] - half)
        cy = H * 0.78 if use_footage else H * 0.42
        if a_a > 0:
            draw_stat_chunk(frame, cy, "3 SOAT", "MONTAJ VAQTI", s_a, a_a)
        if a_b > 0:
            draw_stat_chunk(frame, cy, "340", "KO'RISH", s_b, a_b, color=ACCENT)

    # ---------------- TRANSITION 1 ----------------
    if tl["trans1_start"] <= t < tl["seg2_start"]:
        p = (t - tl["trans1_start"]) / tl["TRANS_DUR"]
        whip_streaks(frame, p)
        screen_flash(frame, strobe_alpha(p))

    # ---------------- SEG 2: AI transformation ----------------
    if tl["seg2_start"] <= t < tl["trans2_start"]:
        local = t - tl["seg2_start"]
        third = tl["seg2_dur"] / 3
        cy_icon = H * 0.33
        cy_text = H * 0.62

        if use_footage:
            draw_bottom_scrim(frame, strength=175)
            draw_ai_enhanced_badge(frame, local, third)
            cy_text = H * 0.78
        elif local < third * 1.15:
            draw_clock(frame, W / 2, cy_icon, 150, local)
        elif local < third * 2.15:
            pulse = 0.5 + 0.5 * math.sin(local * 10)
            draw_ai_badge(frame, W / 2, cy_icon, 140, pulse)
        else:
            glow = 0.6 + 0.4 * math.sin(local * 14)
            draw_play_icon(frame, W / 2, cy_icon, 120, glow)

        s_a, a_a = punch_anim(local, third)
        s_b, a_b = punch_anim(local - third, third)
        s_c, a_c = punch_anim(local - 2 * third, tl["seg2_dur"] - 2 * third)
        if a_a > 0:
            draw_headline_chunk(frame, cy_text, ["SUN'IY", "INTELLEKT"], s_a, a_a)
        if a_b > 0:
            draw_headline_chunk(frame, cy_text, ["DAQIQALARDA"], s_b, a_b, size=84)
        if a_c > 0:
            draw_headline_chunk(frame, cy_text, ["KUCHLI VIDEO", "TAYYOR"], s_c, a_c, size=80, color=ACCENT)

    # ---------------- TRANSITION 2 (zoom punch + shake) ----------------
    if tl["trans2_start"] <= t < tl["seg3_start"]:
        p = (t - tl["trans2_start"]) / tl["TRANS_DUR"]
        whip_streaks(frame, p, color=ACCENT)
        screen_flash(frame, strobe_alpha(p))

    # ---------------- SEG 3 + TAIL: CTA ----------------
    if t >= tl["seg3_start"]:
        local = t - tl["seg3_start"]
        cta_end = tl["seg3_dur"] * 0.62
        cy_icon = H * 0.34
        cy_text = H * 0.56
        s_cta, a_cta = punch_anim(local, cta_end, punch_dur=0.2, exit_dur=0.15)
        if a_cta > 0:
            draw_dm_icon(frame, W / 2, cy_icon, 110)
            draw_cta_chunk(frame, cy_text, s_cta, a_cta)

        brand_start = cta_end
        brand_local = local - brand_start
        if brand_local >= 0:
            p = clamp(brand_local / 0.3)
            scale = ease_out_back(p)
            alpha = clamp(brand_local / 0.18)
            draw_wordmark(frame, W / 2, H * 0.60, scale, alpha)
            if brand_local >= 0.26:
                screen_flash(frame, strobe_alpha(brand_local - 0.26, decay=18, peak=0.5))

    add_vignette(frame)
    return frame


if __name__ == "__main__":
    vo_path = os.path.join(OUT_DIR, "word_timings.json")
    out_video = os.path.join(OUT_DIR, "silent_video.mp4")
    render(vo_path, out_video)
