# Voice casting (v2 — male narrator)

Why a male narrator: every top channel in the niche uses one —
Ifverse (mid-30s, clear, confident American, 140–155 WPM), Awaken (witty male, 150–170 WPM),
IFNation / ConChaser (male storytellers).

| Role | Voice | Source |
|---|---|---|
| Narrator | **Brian** — deep, resonant, warm (ElevenLabs premade, via vidIQ voiceover) | `vidiq/N1–N4.mp3` |
| Grandpa Walt | **Bill** — wise, mature (ElevenLabs premade, via vidIQ voiceover) | `vidiq/G.mp3` |
| Eli, Mom, Sam, Nora | Kokoro local TTS (am_puck, af_sarah, am_echo, af_sky) | `build_vo.py` |

Result: 5:22 runtime, 145 WPM (inside Ifverse's 140–155 range).

## How the takes became per-line clips
Each take holds ~20 script lines read in one go (cheaper and more natural than 80 separate calls).
`align_split.py` synthesises the same lines with Kokoro as a reference, aligns the take to it with
MFCC + DTW, and snaps every boundary to the nearest pause. All narrator boundaries snapped within
0.22 s. The Grandpa take was cut by hand (`cut_at.py`) after mapping its 15 speech islands to the 8 lines.

## Swapping voices later
Put new per-line WAVs in `out/lines/<id>.wav` (or run the splitter on new takes), then:
`python3 build_vo.py && cp out/timeline.json ../05_visuals/src/data/ && python3 ../06_edit/mix.py` and re-render.
ElevenLabs direct (eleven_v4 "Michael") was tried first but the account quota (36,988/month) is used up.
