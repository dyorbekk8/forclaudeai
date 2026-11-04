"""EP04 Short #1: hook (mom yells Leo) -> rule -> sonic boom payoff. 1080x1920, burned captions, loops."""
import json, subprocess, os
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f"{EP}/07_renders/EP04_What_If_You_Got_1_Faster_Every_Time_Someone_Said_Your_Name.mp4"
TL = {l["id"]: l for l in json.load(open(f"{EP}/03_voiceover/out/timeline.json"))["lines"]}
S = lambda i: TL[i]["start"]; E = lambda i: TL[i]["end"]
SEGS = [(0.3, E("a02") + 0.15, ["a01", "a02"]),
        (S("a04") - 0.1, E("a04") + 0.25, ["a04"]),
        (S("d05") - 0.1, E("d06") + 0.6, ["d05", "d06"])]
FONT = "/tmp/claude-0/fonts"

def t2a(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

# captions: 2-4 word chunks, timed by character share
ev = []; off = 0.0
for a, b, ids in SEGS:
    for i in ids:
        words = TL[i]["text"].split(); st, en = S(i) - a + off, E(i) - a + off
        chunks, cur = [], []
        for w in words:
            cur.append(w)
            if len(cur) >= 3 or w[-1] in ".?!,": chunks.append(" ".join(cur)); cur = []
        if cur: chunks.append(" ".join(cur))
        tot = sum(len(c) for c in chunks); t = st
        for c in chunks:
            d = (en - st) * len(c) / tot
            col = "&H00FFFFFF&" if TL[i]["speaker"] == "N" else "&H0031C5FF&"
            ev.append(f"Dialogue: 0,{t2a(t)},{t2a(t + d)},Cap,,0,0,0,,{{\\c{col}\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}}{c.upper()}")
            t += d
    off += b - a
total = off
hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Fredoka Light,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,8,3,2,60,60,430,1
Style: Title,Fredoka Light,92,&H0000D2FF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,8,4,8,50,50,170,1
Style: Sub,Fredoka Light,80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,6,2,8,50,50,290,1
Style: CTA,Fredoka Light,96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,8,4,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 1,{t2a(0)},{t2a(off)},Title,,0,0,0,,EVERY TIME SOMEONE\\NSAYS YOUR NAME…
Dialogue: 1,{t2a(0)},{t2a(off)},Sub,,0,0,0,,{{\\c&H005EFF4D&}}+1% FASTER
"""
open("caps.ass", "w").write(hdr + "\n".join(ev) + "\n")

# cut + concat segments (re-encode for clean cuts), add 3.2 s frozen end card
parts = []
for k, (a, b, _) in enumerate(SEGS):
    p = f"seg{k}.mp4"; parts.append(p)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", SRC, "-t", f"{b - a:.3f}", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", p], check=True)
open("parts.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "parts.txt", "-c", "copy", "joined.mp4"], check=True)
fc = (
    "[0:v]split[a][b];"
    "[a]scale=-2:1920,crop=1080:1920,boxblur=28:2,eq=brightness=-0.18:saturation=1.3[bg];"
    "[b]crop=1920:864:0:108,scale=1600:-2,crop=1080:720[fg];"
    "[bg][fg]overlay=0:(H-h)/2-60,"
    f"ass=caps.ass:fontsdir={FONT}[v];"
    "[0:a]anull[au]"
)
out = f"{EP}/10_shorts/EP04_SHORT1_name.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "joined.mp4", "-filter_complex", fc, "-map", "[v]", "-map", "[au]", "-t", f"{total:.2f}",
                "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], check=True)
print("short", round(total, 2), "s ->", out)
