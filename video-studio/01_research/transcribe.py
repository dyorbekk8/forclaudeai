import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
for v in sys.argv[1:]:
    segs, info = m.transcribe(f"01_research/ref_videos/{v}.mp4", word_timestamps=True, vad_filter=False)
    out=[]
    for s in segs:
        out.append({"start":round(s.start,2),"end":round(s.end,2),"text":s.text.strip(),"words":[[w.word,round(w.start,2),round(w.end,2)] for w in (s.words or [])]})
    json.dump(out, open(f"01_research/frames/{v}/transcript.json","w"), ensure_ascii=False, indent=0)
    open(f"01_research/frames/{v}/transcript.txt","w").write("\n".join(f"[{o['start']:7.2f}] {o['text']}" for o in out))
    print(v, "done", len(out), flush=True)
