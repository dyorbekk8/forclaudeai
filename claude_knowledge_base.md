# CLAUDE KNOWLEDGE BASE — Factwoven explainer studio
**Versiya:** 2026-11-06 · **Repo:** `dyorbekk8/forclaudeai` · **Branch:** `claude/jolly-ptolemy-7umh9s` · **Ish papkasi:** `/home/user/forclaudeai/studio`

Bu fayl yangi sessiyaning yagona kirish nuqtasi. Yangi chatda avval shu faylni, keyin `studio/RULES.md` va `studio/03_voiceover/VOICE.md` ni o'qing.

---

## 0. TEZKOR KONTEKST (30 soniyada)

- **Kanal:** **Factwoven**, YouTube, `UCRgsaiNL2QDrKKLNq62o__Q`.
  - Holati: 3 obunachi, inglizcha, 16:9 explainer.
- **Egasi:** o'zbekcha yozadi, javob ham **o'zbekcha** bo'lishi kerak.
  - Toshkent vaqti UTC+5. Server UTC'da ishlaydi, vaqt aytganda **Toshkent vaqtida** ayting.
- **Niche (QULFLANGAN):** harbiy, xavfsizlik va operatsion tizimlarni ochib berish: kodlar, darajalar, belgilar, rollar, jihozlar.
  - Format: "Every X Explained" / "How X Actually Works".
- **Eng yaxshi video:** "Every Aircraft Carrier Shirt Color Explained" (`6CIfEvUw9UI`) — **512 view**, 4:47.
  - Bu video egasi tomonidan oldin qilingan. Unga Claude faqat yangi thumbnail qilgan.
  - **Shu videoning shabloni kanalning standarti** (4.2-bo'lim).
- **Joriy ish:** "Nuclear incident code words" videosi (6-bo'lim).

---

## 1. [LOYIHA STRUKTURASI]

### 1.1 Yakuniy maqsad

**Asosiy maqsad:** to'liq kod bilan (Remotion, React/SVG) yaratiladigan, AI-slop bo'lmagan, viral potensialli YouTube explainer videolar.
- Har bir uzun videoga 2–3 ta Short.
- Kunlik ishlab chiqarish quvuri: tadqiqot → ssenariy → fakt tekshiruvi → ovoz → montaj → render → QA → packaging.

**Egasining tayinlagan talabi:**
- Har bosqich alohida papkada bo'lsin.
- Agentlar o'z papkalarida ishlasin.
- Claude supervisor bo'lib hammasini tekshirsin.
- Egasi "**faqat o'zing emas, agentlarni ham ishlat**" deb so'ragan.

### 1.2 Papka arxitekturasi (`studio/`)

| Papka | Vazifasi |
|---|---|
| `00_research/` | Raqobatchi korpusi, `visual_analysis/README.md`, `dossier/EXPLAINER_RESEARCH_DOSSIER_v2.md` (GPT tadqiqoti), `topics/<topic>/` (masalan `aircraft_designations/wiki_1962_tri_service_extract.txt`, `wiki_1963_missile_extract.txt`, `brief.md`) |
| `01_ideas/` | G'oyalar |
| `02_scripts/<project>/` | `script.json` (matn, manbalar, items/views) va `vo_lines.json` (TTS uchun yozilgan matn) |
| `03_voiceover/` | `tools/` (cb_vo.py, process_vo.py, kokoro_vo.py), `refs/ref_michael.wav` (**qulflangan ovoz reference**), `<project>/cb_raw` (xom take'lar), `<project>/final` (48 kHz, tozalangan) |
| `04_audio_sfx_music/` | `library/*.wav` (SFX), `music/lofi_loop.wav` |
| `05_visual_system/` | Vizual tizim |
| `06_edit_cuts_transitions/` | EDL builderlar (`<project>_build_edl.py`), `sprinkler/mix.py` (mix) |
| `07_render/` | Remotion loyihasi: `src/` (kompozitsiyalar), `render_<project>.sh`, `stills.mjs` (tez still), `out/` (git'da emas) |
| `08_thumbnails_titles/<project>/` | thumb_A/B.png, description.txt, captions.srt, titles.txt, make_meta.py |
| `09_qa/` | `sprinkler/qa.py` (avtomatik QA), `<project>/qa_auto.json`, `frames/` |
| `agents/` | `image-sourcer/`, `topic-scout/` (report.md + raw/), `fact-checker/`, `shorts-writer/aircraft/` (a1–a3.json) |
| `RULES.md` | Qulflangan ishlab chiqarish qoidalari |
| `03_voiceover/VOICE.md` | Qulflangan ovoz spetsifikatsiyasi |

### 1.3 Texnik stek

- **Remotion 4.0.540** (React/TSX, SVG). Render quyidagi browser bilan:
  `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
  Flaglar: `--codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --muted`.
- **Fontlar:** lokal `07_render/public/fonts/*.woff2` (Barlow Condensed 600/700/800, Inter, Caveat, JetBrains Mono). Ular FontFace + delayRender orqali yuklanadi (`src/theme.ts`).
- **TTS:** **Chatterbox** (ResembleAI, MIT), CPU, venv `/opt/tts/.venv` (Python 3.13, torch 2.6 CUDA build, CPU'da ishlaydi). Reference: `refs/ref_michael.wav`.
- **ASR:** faster-whisper `small.en` (int8, CPU).
- **Audio:** ffmpeg, pyloudnorm, soundfile.
- **Ma'lumot:** `yt-dlp --flat-playlist -j "ytsearch10:<q>"` (YouTube qidiruvi va kanal ro'yxati ishlaydi), WebSearch, Wikipedia (`curl` va UA bilan; WebFetch bloklangan).

### 1.4 Ishlab chiqarish quvuri (hozirgi standart)

1. **Mavzu:** topic-scout agenti, 8-bo'limdagi mezonlar.
2. **Tadqiqot:** WebSearch va Wikipedia `curl`; extractlar `00_research/topics/` ga saqlanadi.
3. **Ssenariy:** `02_scripts/<p>/script.json` — items, har gap uchun `views`, sources. `vo_lines.json` esa kodlar so'z bilan yozilgan TTS matni.
4. **Fakt tekshiruvi:** fact-checker agenti har bir da'voni tekshiradi. Tuzatishlar `script.json` ga kiritiladi, ovozi o'zgargan qatorlar `vo_fix.json` ga.
5. **Ovoz:** `cb_vo.py` — gapma-gap generatsiya, Whisper tekshiruvi, pauzalar.
6. **Post-processing:** `process_vo.py cb_raw → final`.
7. **EDL:** `<p>_build_edl.py` (venv python) — Whisper word timestamps orqali shotlar, captionlar va SFX cue'lar.
8. **Mix:** `mix.py <edl> <outdir> lofi`.
9. **Render:** `npx remotion render`, ffmpeg mux, `qa.py`.
10. **Tekshiruv:** stills sheet orqali vizual QA (ko'z bilan ko'riladi), keyin user'ga yuboriladi (SendUserFile).
11. **Meta:** title, description, chapters, tags, SRT inline beriladi.
12. **Shorts:** 3 ta, related video bilan bog'lanadi.
13. **Git:** commit va push.

---

## 2. [EGASI TUSHUNTIRGAN QO'LLANMALAR VA YO'RIQNOMALAR] — QAT'IY

### 2.1 Umumiy

- Sifat professional bo'lsin, "AI slop" emas.
- Video 100% kod bilan yasaladi, 16:9.
- Shoshilmaslik kerak, lekin tez yetkazish ham kerak. Egasi kechikishdan norozi bo'ladi, shuning uchun progressni muntazam aytib turish kerak.
- Har bosqichga alohida papka, agentlarga alohida papka. Claude hammasini boshqaradi va tekshiradi.
- **Kanal niche'si aralashib ketmasin.** Tibbiyot, miya, tana, random faktlar, true crime, celebrity mavzulariga yangi video yo'q. Keyingi 15 video harbiy/xavfsizlik yo'nalishida.
- **Raqobatchilar qilmagan, lekin talabi katta mavzu** tanlanadi. Kanal "uchib ketishi" kerak (1M+ potensial).
- Har bir faktni tekshirish shart. To'qilgan raqam, soxta patent yoki soxta "classified" muhr ishlatilmaydi.
- Qurbonlar va fojeani bo'rttirish yo'q, ohang xotirjam.
- Rasm manbalari: **faqat qonuniy** (AQSh hukumatining public domain'i, Wikimedia CC BY/BY-SA va kredit bilan). Google/Pinterest'dan rasm olinmaydi (copyright strike xavfi).
  - Hozirgi uslubda foto deyarli ishlatilmaydi: "faqat kerakli joyda ozgina", asosiy vizual vektor.

### 2.2 Long-form video — QAT'IY talablar

1. **Intro yo'q.** Birinchi soniyadan ro'yxat boshlanadi. Logo, "today we'll explore" kabi gaplar yo'q.
2. **Ro'yxat formati (eng muhim):** hamma elementlar grid'da terilgan turadi. Har element boshida kamera grid'dagi tile'ga **zoom in** qiladi va ovoz faqat **nomini aytadi** ("F. Fighter."). Keyin tushuntirish keladi.
3. **Shablon carrier videosiniki** (4.2-bo'lim):
   - tepada chapter panel va progress nuqtalari;
   - chapda katta illyustratsiya kartochkasi;
   - o'ngda 3 ta raqamlangan xususiyat kartochkasi, chiziqlar bilan ulangan;
   - stat/gauge kartochkasi;
   - "chapter summary" va elementlar chip qatori (DONE/ACTIVE);
   - pastda aytilayotgan gap matni (qora pill).
4. **Vizual ovoz bilan chambarchas bog'liq.** Har bir **gap** uchun aniq vizual belgilanadi (`views`). Kartochka yoki xususiyat aynan o'sha narsa aytilgan gapda yonadi. Matn va vizual hech qachon boshqa narsa haqida bo'lmasin.
   - Egasi aynan shu xato uchun aircraft v1 videosini rad etgan.
5. **Ritm bir xil ("stable flow").** "Transition, animatsiya, pauza" sikli yo'q.
   - Oddiy shot almashishi: yumshoq fade, taxminan 8–10 kadr.
   - Butun ekranni zoom, blur yoki slide bilan almashtirmaslik.
   - Kamera drifti global bo'ladi, har shotda qaytadan boshlanmaydi.
   - Kadr 4 sekunddan ortiq qotib qolmasligi kerak.
   - Bo'sh "dashed" placeholder ham, umuman bo'sh ekran ham yo'q: elementlar oldindan xira ko'rinib turadi, aytilganda yonadi.
6. **Uzunlik:** juda qisqa bo'lmasin.
   - Egasi 3 daqiqani "juda qisqa" degan.
   - Maqsad 6–12 daqiqa, uzunlik haqiqiy faktlar hisobiga, suv qo'shmasdan.
   - Element uzunligi murakkablikka qarab o'zgaradi, 60 sekundga majburlanmaydi.
7. **Fon och** (cream/paper), qorong'i uslub yo'q.
   - Egasi dark radar uslubini rad etgan: "nishadan chiqib ketyapsan".
   - Toza ikon-grid estetikasi saqlanadi.
8. **Ovoz tiniq, xatosiz, tinish belgilariga e'tiborli.** Faqat **bitta sifatli erkak ovozi** (3-bo'lim). Pauzalar: `.` ≈0.42 s, `?` 0.45 s, `:`/`;` 0.30 s, qatorlar orasida 0.3 s, bo'limlar orasida 0.55–0.6 s.
9. **Pastdagi gap matni** (burned-in sentence pill) carrier shablonining bir qismi. Egasining eng yaxshi videosida bor, shuning uchun saqlanadi.
   - Alohida `.srt` ham yuklanadi: YouTube CC default o'chiq bo'ladi, bu SEO va tarjima uchun foydali. Egasi buni tasdiqlagan.
10. **Description, title va tag'lar chatga inline beriladi.** Chapters, manbalar va disclaimerlar ham.

### 2.3 Short-form (Shorts) — talablar

- 15–25 soniya, 1080×1920.
- **Birinchi qatorda kuchli hook**, bitta to'liq payoff, oxirgi qator uzun videoga qiziqish uyg'otsin. "Like and subscribe" yo'q.
- Faqat uzun videodagi faktlardan.
- So'zma-so'z yirik captionlar: 3 so'zlik guruh, joriy so'z qizil, timing Whisper bo'yicha.
- Vizual yirik (Ammo Shorts'dagi `scale(1.22)`), pastki qism bo'sh qolmasin.
- Har uzun videoga 2–3 Short. Yuklashda **Related video** maydoniga uzun video ulanadi.
- Prison Short (1.2K) va Pen-cap Short (1.3K) kanalning eng ko'p ko'rilgan kontenti.

### 2.4 Thumbnail

- **Kanal formulasi (egasining "gamechanger"i):**
  - och fon;
  - bitta obyekt oilasi rang yoki variantlarda, 6 ta tile;
  - qisqa label'lar;
  - bitta kattalashtirilgan, qizil ramkali "anchor" tile;
  - anchor ustida **haqiqiy faktni aytuvchi** qizil muhr ("GRAPES", "NERVE AGENT", "F-35? SHOULD BE F-24").
- Mobil 160–200 px testi o'tkaziladi, muhr yozuvni yopib qo'ymasligi kerak.
- B variant (test uchun): bitta katta obyekt va bitta qiziqarli savol ("2 STRIPES?", "WHY "GRAPES"?").
- Test & Compare egasining kanalida yopiq. Thumbnail qo'lda almashtiriladi, 3–4 kunda CTR solishtiriladi.

### 2.5 Ish tartibi bo'yicha egasining izohlari

- "Davom et" — to'xtamasdan oxirigacha ishlash degani. Agentlardan foydalanish kerak.
- Kerakli network domenlarini **bir yo'la** so'rash kerak. Egasi `huggingface.co` va boshqalariga ruxsat bergan.
- Egasining analitikasi: carrier videosi CTR 1.5%, 7.2K impressions, AVD ≈2:24/4:47, 87% Browse.
  - Auditoriya: 58% USA (boshqa panelda 24.6%), 40% mobile, 18% TV.

---

## 3. [OVOZ — QULFLANGAN] (`studio/03_voiceover/VOICE.md`)

- **Engine:** Chatterbox TTS, CPU.
  - O'rnatish: `cd /opt/tts && uv venv --python 3.13 .venv && uv pip install chatterbox-tts faster-whisper soundfile pyloudnorm "setuptools<81"`.
- **Reference:** `studio/03_voiceover/refs/ref_michael.wav` — Kokoro `am_michael` bilan yaratilgan sintetik ovoz, SPEED 0.98. Real odam ovozi emas.
- **Sozlamalar:** exaggeration 0.45 · cfg_weight 0.5 · temperature 0.7. **Hech qachon o'zgartirmang.**
- **Watermark:** Chatterbox'ning Perth watermark'i saqlanadi (ataylab).
- **Buyruq:**
  `. /opt/tts/.venv/bin/activate && cd studio/03_voiceover && nohup python tools/cb_vo.py ../02_scripts/<p>/vo_lines.json <p>/cb_raw refs/ref_michael.wav > <p>/cb_full.log 2>&1 &`
- **Tezlik:** CPU'da ~1–1.5 daqiqa/qator. 60 qator ≈ 1–1.5 soat.
  - Boshqa render bilan parallel ishlasa juda sekinlashadi.
  - `nohup` ishlatiladi; Bash run_in_background 2 soatlik limitga ega.
- **TTS matni:** kodlar so'z bilan yoziladi.
  - Masalan: "F-35" → "F thirty-five", "SR-71" → "S R seventy-one", "C-130" → "C one thirty", "B-52" → "B fifty-two", "NUCFLASH" → "Nuke Flash", "U.S." → "U S".
  - Yillar so'z bilan: "nineteen sixty-six".
- **Muhim:** ekrandagi matnda va `script.json`da "U.S." gapni ikkiga bo'lib yuboradi, chunki splitter regex'i `(?<=[.?!])\s+`. Gap ichida "American" deb yozing.
- ElevenLabs: bepul akkaunt "unusual activity (proxy)" deb bloklangan. Egasining "Adam" ovozi (`pNInz6obpgDQGcFmaJgB`) faqat pullik tarif bilan ishlaydi; tasdiqlanmagan.

---

## 4. [RAQOBATCHILAR VA TRENDLAR TAHLILI]

### 4.1 Raqobatchilar

- **Unclassified** (@UnclassifiedYTT) — asosiy raqobatchi.
  - Katalogdagi median ≈75.5K view, runtime ≈11:50.
  - Yaqinda: Bullet Type 34K, Shotgun Shell 86K, Medical Waste 29K.
  - Ular allaqachon qilgan mavzular: Bullet Tip 425K, DEFCON 1.38M, hazmat placards, hospital codes, security clearance, firefighter helmets, prison uniforms, berets, hull codes, INTERPOL, police codes.
- **Field Manual** (@FieldManualYT): emergency lights 347K.
- **Terrain & Tactics**, **Briefed**, **Casual Tactics × Scrawl Explains** (berets 682K, DEFCON 1.10M), **Stripes Decoded** (ko'p mavzu, lekin juda past view).
- **Unclassified uslubining ildizi:**
  - butun video **bitta xarita ustida** ketadi: thumbnail'dagi grid'ning o'zi;
  - kamera xarita bo'ylab sirpanib, elementga zoom qiladi;
  - o'tishlar kamera harakati orqali, butun ekranni almashtirish yo'q;
  - matn va vizual joyida fade bo'ladi;
  - yagona ritm saqlanadi.

### 4.2 Egasining eng yaxshi videosi (carrier) shabloni — kanal standarti

- Krem fon.
- Tepada oq panel: "03 / 07" rangli badge, nom, kategoriya, o'ngda progress nuqtalari.
- Chapda illyustratsiya kartochkasi: nom, katta ikonka, doira fon, pastda kichik label.
- O'ngda 01/02/03 xususiyat kartochkalari: sarlavha va bir qator izoh, ikonkadan chiziq bilan ulangan.
- Gauge kartochka ("15 SEC" kabi katta raqam) va qizil izohli kartochka.
- "CHAPTER 05/07 OPERATIONAL SUMMARY" kartochkasi: sarlavha, matn, bar va hamma elementlarning rangli chip qatori (DONE/ACTIVE).
- Pastda qora pill: aytilayotgan gap.
- Ssenariy formulasi (carrier transkriptidan):
  - "Yellow." bilan to'g'ridan-to'g'ri boshlanadi;
  - har element: nom/laqab → jihoz → joy → raqam → real voqea va sana → fuqarolik hayoti bilan solishtirish → xulosa ("Yellow never means beginner…");
  - oxiri: "Which color would you wear?".

### 4.3 Mavzu tanlash qoidalari

- **Rubric (0–4):** tanish obyekt · haqiqiy savol yoki noto'g'ri tushuncha · birlamchi manba · vizual mexanizm · oldingi videolar bilan bog'liqlik · original burchak.
- **Talab belgisi:** direct / cross-channel analogue / own-channel early / untested. To'qilgan "search volume" yo'q.
- "Every" faqat **chegaralangan, to'liq to'plam** uchun. Bo'lmasa "What X Actually Mean", "U.S.", "Common" yoki "Main" deb yoziladi. 8 taga yetkazish uchun soxta element qo'shilmaydi.
- Talab tekshiruvi `yt-dlp ytsearch10` orqali: 2–3 xil so'rov. Raqobatchilar qilmagan, lekin 100K+ analog videosi bor mavzu izlanadi.
- Kanal klasteri: aviatsiya va operatsiya → xavfsizlik kodlari → darajalar.
- **Topic-scout reytingi** (`agents/topic-scout/report.md`):
  1. Carrier launch hand signals — 1.51M / 306K / 184K; NATOPS manbasi cheklangan.
  2. Nuclear incident code words — ★ hozir ishlanmoqda.
  3. Every Squawk Code — FAA JO 7110.66H.
  4. Every Airport Sign — FAA AIM 2-3-7, 6 tur.
  5. Missile names (AIM/AGM/BGM/LGM).
  6. NATO reporting names.
  7. MOPP levels.
  8. Airliner lights.
  9. Fighter radio calls.
  10. UL 687 safe ratings.
  11. Army hand signals.
  12. Maritime flags.
  - Istisno (raqobatchida bor): DEFCON, clearance, FPCON, hazmat, INTERPOL, 10-codes, hull codes, smoke grenades, Navy badges, biosafety, runway markings.

### 4.4 Dossier (GPT) xulosalari (`00_research/dossier/`)

- Positioning: "You recognize the object. Now understand the system." Bu tekshirilmagan gipoteza.
- CTR muammosi: birinchi 30 soniya va thumbnail bitta va'da. Grid'ni CTR uchun ayblash isbotlanmagan.
- Muhim distinctionlar:
  - NIJ'ning eski/yangi darajalari; III+ rasmiy daraja emas;
  - BOP Administrative — alohida tarmoq;
  - DOT va NFPA belgilari boshqa-boshqa tizim;
  - gaz ballonida label birlamchi;
  - USB ranglari tavsiya, majburiy emas;
  - DoD 4120.15-L 2023-yilda bekor qilingan, o'rniga DoDI 4120.15 / DAFI 16-401 / AR 70-50 / NAVAIRINST 13100.16.

---

## 5. [KOD BAZASI HOLATI] — hozir ishlayotgan yakuniy holat

### 5.1 Kanal standartidagi ro'yxat shabloni (★ ISHLATILADIGAN)

- **`07_render/src/aircraft2/Main.tsx`** (`MainAircraft2`) — carrier shablonidagi ro'yxat video.
  - Komponentlar: `TopBar` (badge, nom, kategoriya, progress nuqtalari), `Caption` (gap pill), `Grid` (hamma tile; current tile'ga zoom: `prog(f, dur-26, 22)`, scale 1+1.9·z), `ItemCard` (chap kartochka, 3 ta feature, connector chiziqlar; xira placeholder → `pop` bilan yonadi), `Summary` (gauge `stat.v` va `stat.l`, chip qatori DONE/ACTIVE/NEXT), `TextCard`, `Thirteen`, `Outro` (grid va savol banneri).
  - Global kamera: `1.01+0.006·sin(f/240)`; har shot uchun `Fade` 8 kadr.
- **`07_render/src/nuclear/Main.tsx`** (`MainNuclear`) — aircraft2'ning nusxasi.
  - `NIcon` ishlatadi (`nuclear/icons.tsx`: flash, arrow, quiver, spear, reactor, sword, bomb, plane, silo).
  - Grid 3 ustun (TW 360, TH 250).
  - `EventCard` qo'shilgan: sana badge, joy, sarlavha va `stampAt` paytida chiqadigan RedStamp.
  - Kindlar: grid, card, summary, event, text, recap, outro.
- **`06_edit_cuts_transitions/aircraft2_build_edl.py`** va **`nuclear_build_edl.py`** — venv python bilan ishga tushiriladi:
  - `script.json` → items (letter, name, cat, kind, example, features[3], stat, **views**, events).
  - Har item'ning 1-qatori (nom) = grid shot.
  - Keyingi har bir **gap** uchun `views[i]`:
    - `['f1','f2']` → card, shu featurelar gap boshida va 33% oraliqlarda yonadi;
    - `[]` → card, yangi narsa qo'shilmaydi;
    - `'S'` → summary;
    - `'E:key'` → event (faqat nuclear builderda).
  - Ketma-ket bir xil view birlashtiriladi. Feature oldingi segmentda yongan bo'lsa `-100`, hali yonmagan bo'lsa `99999`.
  - Gap boshlanishlari: Whisper word timestamps, so'z indeksining proporsiyasi bilan.
  - Captionlar = script gaplari.
  - SFX cue'lar: whoosh (zoom), pop (har feature), paper_slide, counter_tick (summary), stamp_thud (event).
  - Assert: shotlar orasida bo'shliq bo'lmasin. Shuning uchun har qatorning 1-gapi qator boshidan, oxirgi gapi keyingi gap boshigacha davom etadi.
  - **Views soni gaplar soniga teng bo'lishi shart.** Ssenariy yozilgach tekshiruv snippet'i bilan `MISMATCH` yo'qligini tekshiring.
- **Ammo Shorts shabloni:** `07_render/src/short/ShortAmmo.tsx` (scene'lar: live, two, fire, bars, coated, blue, harmless, puff, a10, rules, gray, meaning, binary, ab, date) va `ammo_shorts_build_edl.py` (Whisper word timing, 3 so'zlik captionlar).

### 5.2 Umumiy vositalar

- **`03_voiceover/tools/cb_vo.py`** — gapma-gap Chatterbox generatsiyasi.
  - Har gap Whisper bilan tekshiriladi, WER normalizatsiyasi bilan: raqamlar, ordinal'lar va "U S S" kabi harf ketma-ketliklari olib tashlanadi.
  - Gap mos kelmaguncha 4 urinishgacha qayta yaratiladi.
  - `trim` qilinadi, pauzalar qo'shiladi, `<id>.wav` (24 kHz) yoziladi.
  - Usage: `cb_vo.py <vo_lines.json> <outdir> <ref.wav> [ids]`.
- **`03_voiceover/tools/process_vo.py src dst`** — 48 kHz mono, HPF, EQ, kompressor, har klip −18 LUFS, alimiter, chetlardagi sukunat qirqiladi.
- **`06_edit_cuts_transitions/sprinkler/mix.py <edl.json> <outdir> lofi`** — VO, lo-fi music bed (ducking) va SFX cue'larni birlashtiradi. Ikki bosqichli loudnorm: −14 LUFS / −1 dBTP.
- **`09_qa/sprinkler/qa.py <mp4> <edl> <outdir>`** tekshiradi:
  - format: 1920×1080 **yoki** 1080×1920;
  - 30 fps, yuv420p;
  - davomiylik EDL bilan mos;
  - audio va video uzunligi teng;
  - blackdetect;
  - freezedetect (>4 s);
  - −14±1 LUFS, TP ≤ −1.
- **`07_render/stills.mjs <Comp> <outdir> <f1,f2,...>`** — bitta bundle'dan ko'p still (jpeg, scale 0.5). Contact sheet: `ffmpeg -pattern_type glob -i 'f*.jpg' -vf tile=...`.
- **Render skriptlari:** `07_render/render_<p>.sh`. Ketma-ketlik: EDL builder → mix → remotion render → ffmpeg mux (AAC 320k) → qa.
  - `aircraft2_pipeline.sh` — ovozni kutadi, fix'larni qayta ovozlaydi, keyin process va render qiladi.
- **`Root.tsx`** kompozitsiyalari: Aircraft2, Nuclear, ThumbAircraftGrid, ShortAmmo-s1..s3, Ammo, ThumbAmmo/ThumbAmmoB/ThumbCarrierB, Aircraft (v1, rad etilgan), Potus, Prison, Armor, ShortPrison va boshqalar.
- **Meta:** `08_thumbnails_titles/<p>/make_meta.py` → description.txt (chapters, sources), captions.srt, titles.txt. Aircraft2 meta va SRT esa EDL caps'dan inline skript bilan yaratilgan.

### 5.3 Tayyor videolar (out/ — git'da emas)

| Video | Holat |
|---|---|
| aircraft2: Every Letter in a Military Aircraft Name Explained | **Tayyor, 6:18, carrier shablonida.** Egasi yuklagan, SRT ham qo'shilgan. Thumb: grid va "F" anchor. 5:33'da ~5 s hold bor |
| ammo: Every Military Ammo Color Explained | 5:37, stable-flow'dan oldingi versiya. Thumb A (grid) va B. Nomni "What the Colors on Military Ammo Actually Mean" ga o'zgartirish tavsiya qilingan ("Every" to'liq emas) |
| ammo_shorts s1/s2/s3 | Tayyor: Two Yellow Stripes / Blue Bomb Isn't Harmless / Stripe That Means Nerve Agent |
| carrier thumb_B | WHY "GRAPES"? |
| aircraft (v1) | **Egasi rad etgan:** ovoz bilan sinxron emas, intro g'alati. Ishlatilmaydi |
| potus, prison, armor, sprinkler | Eski formatlar. Potus qorong'i v2 egasi tomonidan rad etilgan |

---

## 6. [BUG & ERROR LOG] — takrorlanmasligi shart

1. **Google fontlar sertifikat xatosi bilan tushmaydi** → lokal woff2 va FontFace + delayRender.
2. **VO clipping** → klip −18 LUFS va alimiter, mixda ikki bosqichli loudnorm.
3. **4 sekunddan uzun qotib qolgan kadr** → global kamera drifti va placeholder'lar.
   - Uzun bitta-kartochkali gaplarda (masalan, aircraft2'dagi F4H/F-110 Versus) kadr ichida qo'shimcha harakat yoki yangi beat qo'ying.
   - Oxirgi 3 s outro hold'iga sekin zoom bering.
4. **yuvj420p** → `--color-space=bt709 --pixel-format=yuv420p`.
5. **Timeline bo'shliqlari** → EDL builderdagi gap assert; sentence segmentlar ketma-ket va bo'shliqsiz.
6. **Bo'sh slotlar event indekslarini "yeb qo'yadi"** (aircraft v1 Code) → ev faqat to'ldirilgan slotlar bo'yicha (`filledOrd`).
7. **Fokus slot harfdan oldin rang bilan to'lib qolgan** → harf tushmaguncha rang bermaslik (`p > 0.3`).
8. **Harflar ro'yxatida faqat sarlavha ko'rinib, ekran bo'sh turgan** → hamma tile oldindan 0.28 opacity'da, aytilganda yonadi.
9. **Vizual gap bilan mos emas** (summary kartochkasi boshqa gapda chiqqan) → har gap uchun `views` mapping. **Asosiy qoida.**
10. **"U.S." gapni ikkiga bo'ladi** → script matnida "American".
11. **faster-whisper `transcribe(path)` av metadata_errors xatosi** → audio soundfile bilan o'qiladi va 16 kHz numpy array beriladi (`load16`).
12. **Chatterbox `perth.PerthImplicitWatermarker` None** → `uv pip install "setuptools<81"` (pkg_resources).
13. **HF xet CDN bloklangan** → egasi `*.hf.co`, `*.xethub.hf.co` va `huggingface.co` domenlariga ruxsat bergan. Hozir ishlaydi.
14. **Wikimedia 429** → contact UA (`ExplainerStudioBot/1.0 (https://github.com/dyorbekk8/forclaudeai)`), 1280px thumb'lar `upload.wikimedia.org`dan md5 yo'li bilan olinadi. API ham shu UA bilan ishlaydi. `thumb.wikimedia.org` bloklangan.
15. **WebFetch ko'p domenlarda ENOTFOUND** → WebSearch (summary) va `curl`'dan foydalanish (Wikipedia HTML).
16. **googlevideo bloklangan, yt-dlp bot-check** → faqat flat-playlist va search ishlaydi. Subtitrlar ba'zan 429. **Bot-checkni aylanib o'tishga urinmang** (avval rad etilgan).
17. **Bash run_in_background 2 soatlik limit va foreground 10 daqiqa** → uzoq ishlar uchun `nohup … &` va kutish uchun alohida `until grep …` watcher.
    - Container restart bo'lsa fon jarayonlari o'ladi. `cb_raw` bo'yicha qolgan id'lar topiladi va faqat ular qayta yaratiladi.
18. **`pkill -f <pattern>` o'z shell'ingizni o'ldiradi**, agar pattern buyruq qatorida bo'lsa → `pgrep`/`pkill`ni ehtiyotkorlik bilan ishlating.
19. **Stop hook commit talab qiladi** → har bosqichdan keyin commit va push. Loglar, wav'lar va `out/` gitignore qilingan (`03_voiceover/*/*.log`, `*/cb_raw/`, `*/final/*.wav`, `07_render/out/`). `refs/ref_michael.wav` esa track qilinadi.
20. **SendUserFile yo'li** → absolyut yo'l ishlating; cwd o'zgarishi mumkin.
21. **Thumbnail'da RedStamp** `f={0}` bilan ko'rinmaydi → `f={40}` bering. Muhr matnni yopib qo'ymasligi uchun o'lchamini tekshiring.
22. **Dark style va har shotdagi zoom/blur transition** → egasi rad etgan. Qaytarmang.
23. **Unclassified grid'ini aynan nusxalash** → "copycat" ko'rinadi. Kanalning o'z carrier shabloni ishlatiladi.
24. **Raqamlarni nomuvofiq denominator bilan talqin qilish** (465 view, 176 engaged, AVD) → sababni to'qimang.

---

## 7. [NEXT STEPS] — navbatdagi vazifalar

### 7.1 JORIY: "Nuclear incident code words" videosi

**Fayllar:** `02_scripts/nuclear/script.json` (6 item, 41 qator, events, views), `vo_lines.json`, `vo_fix.json` (fact-check tuzatishlari: i01b, i01c, i02f, i02g, i02h, i04f).

**Fact-checker natijalari script.json'ga kiritilgan:**
- NUCFLASH ta'rifi kengaytirildi: tasodifiy raketa uchirilishi ham kiradi;
- "highest precedence in the military's incident reporting system";
- Goldsboro: "near Goldsboro", "came to detonating";
- Palomares: "off the coast near Palomares";
- Minot: "preflight check looked at only one wing's missiles";
- on-screen tuzatishlar.

**Title:** "Broken Arrow, Bent Spear, Empty Quiver: Nuclear Incident Code Words Explained". "Every" ishlatilmadi, chunki Emergency Disablement/Evacuation kirmagan.

**Holat:** ovoz yaratish to'xtab qolgan, `cb_raw`da 8/41 wav bor (jarayon o'lgan).

**Qadamlar:**
1. Qolgan id'lar uchun ro'yxat tuzing (`cb_raw`da yo'q bo'lganlar **va** `vo_fix.json`dagilar, chunki ular eski matn bilan bo'lishi mumkin):
   ```
   python3 -c "import json,os; v=json.load(open('02_scripts/nuclear/vo_lines.json')); fx={x['id'] for x in json.load(open('02_scripts/nuclear/vo_fix.json'))}; json.dump([x for x in v if x['id'] in fx or not os.path.exists('03_voiceover/nuclear/cb_raw/'+x['id']+'.wav')],open('02_scripts/nuclear/vo_rest.json','w'),indent=1)"
   ```
   Keyin: `cd 03_voiceover && nohup /opt/tts/.venv/bin/python tools/cb_vo.py ../02_scripts/nuclear/vo_rest.json nuclear/cb_raw refs/ref_michael.wav > nuclear/cb_rest.log 2>&1 &`
2. `rm -rf 03_voiceover/nuclear/final && python3 03_voiceover/tools/process_vo.py 03_voiceover/nuclear/cb_raw 03_voiceover/nuclear/final`
3. `bash 07_render/render_nuclear.sh` (nohup bilan). U ichida `nuclear_build_edl.py`ni venv python bilan ishga tushiradi.
   - Agar `render_nuclear.sh`da builder chaqiruvi `/opt/tts/.venv/bin/python` bo'lmasa, tuzating.
4. Stills sheet bilan vizual QA. Tekshiriladi:
   - har gap vizuali mos;
   - event kartochkalar: Tybee, Thule, Damascus, Minot;
   - 4 s'dan uzun hold yo'q, ayniqsa Broken Arrow summary va Bent Spear;
   - oxiridagi Pinnacle TextCard'lar bo'sh ko'rinmasligi kerak. Ularni boyitish kerak: Pinnacle → NMCC diagrammasi, yorliqlar zinapoyasi. Aircraft2'da shunday text card'lar statik bo'lib "frozen" xatosi bergan.
5. **Uzunlik:** ~4–5 daqiqa chiqishi kutiladi (563 so'z). Egasi "qisqa bo'lmasin" degan. Kerak bo'lsa tekshirilgan faktlar bilan kengaytiring:
   - Emergency Disablement / Emergency Evacuation qisqa qismi;
   - Tybee: B-47 F-86 bilan to'qnashgan, 1958-yil 5-fevral;
   - Damascus: W53 kallak otilib chiqqan;
   - Thule: North Star Bay.
   Fact-checker tasdiqlagan.
6. **Thumbnail:** formula bo'yicha — 6 ikon-tile (NUCFLASH, BROKEN ARROW, EMPTY QUIVER, BENT SPEAR, FADED GIANT, DULL SWORD) va qizil ramkali anchor (masalan BROKEN ARROW, muhr "32 OFFICIAL" yoki "NEVER RECOVERED").
7. Meta (chapters, description, sources, tags) va SRT inline beriladi. Commit va push.
8. 3 ta Short (masalan: "The bomb that was never found" (Tybee), "A dropped socket and a Titan II" (Damascus), "Six warheads flown by mistake" (Minot)) — ShortAmmo shablonini moslashtirib.

### 7.2 Keyingilar

1. **Aircraft Shorts:** `agents/shorts-writer/aircraft/a1–a3.json`, `vo_lines.json` tayyor:
   - "The F-35 Should Have Been the F-24";
   - "One Letter Turns a Cargo Plane Into a Gunship";
   - "The Secret F-19 That Never Existed".
   Ovoz va ShortAmmo uslubidagi render qilinadi.
2. **Aircraft2'dagi 5:33 hold'ni tuzatish** (ixtiyoriy, qayta render ~25 daqiqa).
3. **Ammo videosini carrier shablonida qayta qilish** (ixtiyoriy). Nomi "What the Colors on Military Ammo Actually Mean" bo'ladi.
4. **Keyingi mavzular:** Carrier launch hand signals (manba muammosini hal qilish kerak) → Every Squawk Code → Every Airport Sign → Missile names.
5. Har yangi video uchun quvur: topic-scout → script → **fact-checker agent** → ovoz → EDL (views) → stills QA → render → QA → meta → Shorts → commit.
6. Egasidan yangi analitika kelganda faqat bir xil davr va manbadagi ko'rsatkichlar solishtiriladi: CTR, AVD, intro retention.
