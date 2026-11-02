import soundfile as sf, time
from kokoro_onnx import Kokoro
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
print(sorted(k.get_voices()), flush=True)
line = "Something in your spine goes... pop. Your hoodie gets tighter. Your voice drops. And there's a hair on your chin that wasn't there a second ago. You were fifteen. Now... you're sixteen."
for v in ["am_michael", "am_adam", "am_fenrir", "am_puck", "am_echo", "am_eric", "am_liam", "am_onyx", "bm_george", "bm_fable"]:
    t = time.time()
    s, sr = k.create(line, voice=v, speed=1.0, lang="en-us")
    sf.write(f"tests/{v}.wav", s, sr)
    print(v, round(len(s) / sr, 2), round(time.time() - t, 1), flush=True)
