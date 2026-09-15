# ABSOLUTE CINEMA — hangoma.ai uchun AI Reels Video Yaratish Buyrug'i

> **Bu faylni Claude Code'ga to'liq holda ber.** U sendan hech narsa so'ramasdan,
> boshidan oxirigacha, 100% o'zi ishlab, tayyor `.mp4` faylni chiqarishi kerak.
> Faylni ochgan zahoti, quyidagi barcha bo'limlarni bitta yaxlit vazifa sifatida bajar.

---

## 0. Kerakli narsalar (ishga tushirishdan oldin tekshir)

Claude Code o'zi ishlaydigan muhitda quyidagilar bo'lishi kerak (yo'q bo'lsa, o'zi o'rnatishga harakat qilsin):

- Node.js (LTS) — video render qilish uchun
- Python 3 — ovoz (voiceover) generatsiya qilish uchun
- `ffmpeg` — audio/video billashtirish uchun
- Internetga chiqish — kutubxonalarni o'rnatish va bepul effekt/musiqa yuklab olish uchun

Agar bulardan biri yo'q bo'lsa yoki o'rnatib bo'lmasa — pastdagi "Muqobil yo'llar" bandlariga qara, ular uchun ham yechim yozilgan.

---

## 1. ROL VA MAQSAD

Sen — professional **motion graphic dizayner + video montajchi + copywriter + dasturchi**
jamoasi vazifasini bajarasan. Vazifang: tugagan, yuklashga tayyor, **10–13 soniyalik**
vertikal (Instagram Reels) reklama videosini, boshidan oxirigacha **o'zing kod yozib**,
odam qo'li tegmagan holda yaratish.

**Qoida: hech qanday oraliq bosqichda mendan narsa so'rama.** Agar biror vosita,
kutubxona yoki ma'lumot yetishmasa — o'zing muqobil yechim top, qaror qabul qil va
ishni davom ettir. Faqat quyida "TO'XTASH SHARTLARI" bandida yozilgan hollarda to'xta.

Video **reklama qilayotgan xizmat**: mening (buyurtmachining) AI yordamida video
montaj xizmatim — odamlar soatlab qo'lda montaj qilib, kam ko'rish olayotganiga
qarshi, "biz AI bilan tez va sifatli, hozir trendda bo'lgan video yasab beramiz"
degan taklif.

---

## 2. YAKUNIY FAYL SPETSIFIKATSIYASI

| Parametr | Qiymat |
|---|---|
| Format | MP4 (H.264) |
| O'lcham | 1080×1920 (9:16, vertikal) |
| Davomiyligi | **10–13 soniya** (qattiq chegara — 13 sekunddan oshmasin) |
| FPS | 30 yoki 60 (silliqlik uchun 60 afzal, agar render vaqti muammo bo'lmasa) |
| Ovoz | O'zbek tilidagi voiceover + fon musiqa + SFX, bitta audio trackka mikslangan |
| Captions | Ekranda, VO bilan sinxron, kinetik matn animatsiyasi |
| Watermark | Yo'q. Faqat video oxirida `hangoma.ai` Instagram nomi chiqadi |

Davomiylikni **taxmin qilma — `ffprobe` bilan aniq o'lchab tasdiqla.**

---

## 3. IJODIY YO'NALISH — nima uchun bunday va nima natija kutilyapti

Video **zerikarli AI-reklama** ko'rinishida bo'lmasligi kerak. U:
- Apple mahsulot reklamalaridagi kabi **toza, minimalist, premium** ko'rinishda,
- Hozirgi Instagram Reels trendlaridagi kabi **tez kesimli, kinetik matnli, effektli** bo'lishi kerak,
- Birinchi 1–2 soniyada odamni to'xtatib qoladigan **kuchli hook** bilan boshlanishi kerak,
- Oxirida aniq, tushunarli chaqiruv (CTA) bilan tugashi kerak.

---

## 4. SKRIPT VA VOICEOVER MATNI

Quyidagi matn — boshlang'ich variant. Ma'no va ohangni saqlagan holda, davomiylikka
moslash uchun so'zlarni qisqartirish yoki sal o'zgartirishga ruxsat bor.

> **"Haliyam soatlab montaj qilib, bir necha yuzta ko'rishga erishyapsizmi?
> Endi kerak emas — sun'iy intellekt bilan, daqiqalarda trenddagi kuchli video tayyor.
> Narxi bilan tanishish uchun directga yoz."**

Ohang: ishonchli, energetik, biroz tez sur'atli (reels tempiga mos), lekin har bir
so'z aniq eshitilishi kerak. Masxaralovchi emas — o'ziga ishongan va samimiy.

---

## 5. OVOZ (VOICEOVER) — MAJBURIY QOIDA

**Voiceover albatta va faqat o'zbek tilida bo'lishi kerak.** Turk, rus yoki boshqa
"yaqin" tilga almashtirish **mumkin emas** — past sifatli o'rinbosar emas, asl
o'zbekcha AI ovoz kerak.

**Tavsiya etilgan vosita: `edge-tts`**
- Ochiq manba (open-source) Python kutubxonasi, **API kalit talab qilmaydi**,
  Microsoft Edge'ning bepul onlayn TTS xizmatidan foydalanadi.
- Bu xizmatda o'zbek tili uchun rasmiy 2 ta neural ovoz mavjud:
  - `uz-UZ-SardorNeural` — erkak ovozi
  - `uz-UZ-MadinaNeural` — ayol ovozi
- O'rnatish: `pip install edge-tts`
- Mavjudligini tekshirish: `edge-tts --list-voices | grep -i "uz-UZ"`
- Generatsiya qilish: `edge-tts --voice uz-UZ-SardorNeural --text "..." --write-media voiceover.mp3`
- Ikkala ovozdan (Sardor yoki Madina) qaysi biri brendga ko'proq mos kelsa (energetik,
  ishonchli ohang) — o'zing tanla.

**Talaffuz bo'yicha eslatma:** TTS matniga `hangoma.ai` deb emas, talaffuz uchun
`"hangoma nuqta ay"` deb yoz (chunki TTS ".ai" ni harf-harflab yoki g'alati o'qishi
mumkin). Ekrandagi yozuvda esa aniq `hangoma.ai` deb ko'rsat.

**Muqobil yo'l (agar `edge-tts` internet/tarmoq sababli ishlamasa):** Agar senda
Azure Cognitive Services Speech API kaliti mavjud bo'lsa, xuddi shu ikkita ovozdan
(`uz-UZ-SardorNeural` / `uz-UZ-MadinaNeural`) API orqali foydalan. Boshqa hech qanday
holatda tilni almashtirma — agar umuman iloji bo'lmasa, "TO'XTASH SHARTLARI" bandiga qara.

---

## 6. VIZUAL USLUB — "Apple style" + trend Reels

**Fon va ranglar:**
- Calm off-white yoki to'q navy/qora fon, silliq gradient
- 2–3 tadan ortiq rang ishlatilmasin; bitta yorqin urg'u rang (masalan elektr moviy
  yoki neon sariq) qorong'i fonda kontrast uchun

**Tipografiya:**
- Qalin, zamonaviy sans-serif shrift (masalan **Inter Bold** yoki **Poppins Bold** —
  SF Pro litsenziyasi cheklangani uchun o'xshash bepul shriftlardan foydalan)
- Katta, markazlashgan matn bloklari, ko'p bo'sh joy (Apple uslubiga xos minimalizm)

**Harakat (motion):**
- Silliq easing (ease-in-out yoki spring animatsiya), keskin chiziqli emas
- Scale-punch effektlar (matn/element birdan sal kattalashib joyiga tushadi)
- Yengil parallax siljish, soft shadow yoki glassmorphism kartalar

**Reels trend elementlari:**
- Har 0.5–1 soniyada kesim (cut) — statik kadr uzoq turmasin
- Zoom-punch va whip-pan o'tishlar sahnalar orasida
- Urg'u so'zlarda yengil ekran silkinishi (screen shake)
- Kinetic typography — gap butunligicha emas, so'zlar birma-bir yoki juftlab
  "otilib chiqadi"

---

## 7. SOUND DESIGN

- **Fon musiqa:** energetik/hype beat, ~120–140 BPM, VO paytida ovoz balandligi
  pasaytirilgan (ducking) bo'lsin, VO tugagach biroz ko'tarilsin
- **SFX ro'yxati:** whoosh (har kesimda), whoop/rise (urg'u so'zlarda), pop/click
  (matn paydo bo'lganda), bass impact (statistika/raqam ko'rsatilganda), notification
  ping (oxirida `hangoma.ai` chiqqanda)
- **Manba:** CC0/bepul litsenziyali effektlarni yuklab ol (Pixabay Audio, Mixkit —
  ikkalasi ham reklama uchun bepul ishlatishga ruxsat beradi). Internetdan yuklab
  bo'lmasa, oddiy Python skript (`numpy`/`pydub` bilan chastota sweep) orqali
  whoosh/pop tovushlarini o'zing generatsiya qil — bu ishni to'xtatib qo'ymasin.
- **Muhim litsenziya eslatmasi:** Instagramning "trend audio"sini faylga bevosita
  qo'shma — bu alohida musiqa, ko'pincha mualliflik huquqi bilan himoyalangan va
  faqat Instagram ilovasi ichida, yuklangandan keyin qo'shiladi. Fayl ichiga faqat
  CC0/royalty-free hype trek qo'y; foydalanuvchi xohlasa, yuklagach Instagramning
  o'z trend ovozini alohida qo'shib olishi mumkin.

---

## 8. SAHNA-SAHNA TIMELINE (taxminiy, aniq VO uzunligiga moslashtir)

| Vaqt | Vizual | Ekrandagi matn | VO / SFX |
|---|---|---|---|
| 0.0–0.5s | Qora ekrandan portlash animatsiyasi bilan ochilish | — | Bass impact + whoosh |
| 0.5–3.0s | Katta raqamlar animatsiyasi: "3 SOAT" va "340" | "3 SOAT EDIT. 340 KO'RISH." | VO: "Haliyam soatlab montaj qilib, bir necha yuzta ko'rishga erishyapsizmi?" |
| 3.0–3.5s | Whip-pan o'tish, rang almashadi (qorong'idan yorqin urg'u rangga) | — | Whoosh |
| 3.5–8.0s | Tez, silliq motion graphic: soat tezlashib aylanadi → "AI" belgisi paydo bo'ladi → video ikonkasi porlaydi | "SUN'IY INTELLEKT. DAQIQALARDA. TAYYOR." | VO: "Endi kerak emas — sun'iy intellekt bilan, daqiqalarda trenddagi kuchli video tayyor." |
| 8.0–9.5s | Zoom-punch, ekran silkinishi | — | Whoop/rise |
| 9.5–13.0s | Instagram DM ikonkasi + `hangoma.ai` yozuvi kattalashib markazga keladi | "DIRECTGA YOZ 👉 hangoma.ai" | VO: "Narxi bilan tanishish uchun directga yoz." + notification ping |

---

## 9. TEXNIK AMALGA OSHIRISH YO'LI

**Asosiy tavsiya: Remotion (Node.js + React asosidagi video generatsiya framework)**
— chunki u to'liq kod bilan boshqariladi, audio/caption qo'shish va render qilish
avtomatlashtirilgan, odam aralashuvi shart emas.

Qadamlar:
1. Node loyihasini yarat, Remotion o'rnat (`npx create-video@latest`)
2. 5-bandda yozilgan usul bilan voiceover audio faylini generatsiya qil, `ffprobe`
   bilan aniq davomiyligini o'lcha
3. VO davomiyligi + boshlanish/tugash buferiga qarab, umumiy video davomiyligini
   10–13 sekund oralig'ida ushlab tur (agar VO uzun chiqsa, matnni qisqartirib
   qayta generatsiya qil)
4. Har bir sahna uchun Remotion komponent yoz: matn, animatsiya, timing (7-8-bandlarga
   asoslanib)
5. SFX va fon musiqani `<Audio>` komponenti bilan aniq vaqtlarga joylashtir
6. Captionlarni VO so'z-vaqtlariga sinxronlab kodda chiqar (`edge-tts`ning
   so'z chegarasi/`SubMaker` funksiyasidan yoki alohida forced-alignment vositasidan
   foydalanish mumkin — kutubxona hujjatini tekshirib eng qulayini tanla)
7. `npx remotion render` bilan yakuniy `.mp4` ni chiqar

**Muqobil yo'l** (agar Node/Chromium muhitda ishlamasa): Python + Pillow (har bir
kadrni rasm sifatida chizish) + `ffmpeg` bilan kadrlarni videoga birlashtirish va
audio qo'shish. Sifat va tezlik jihatidan Remotion'dan pastroq, lekin ishlaydigan
zaxira variant.

---

## 10. AVTONOMIYA QOIDALARI

- Hech qanday bosqichda oraliq savol berma — o'zing hal qilib davom et
- Har bir texnik to'siqni (kutubxona yo'q, ovoz ishlamayapti, shrift topilmadi va
  h.k.) uchun muqobil yechim top
- Ishni tugatgach, menga: (1) fayl joylashuvi, (2) aniq davomiyligi, (3) qaysi ovoz
  (Sardor/Madina) ishlatilgani, (4) qanday ijodiy qarorlar qabul qilganing haqida
  3–4 gapda qisqacha hisobot ber

**TO'XTASH SHARTLARI** (faqat shu holatlarda ishni to'xtatib, menga yoz):
- O'zbek tilida hech qanday sifatli AI ovoz manbasini (na `edge-tts`, na boshqa
  vosita orqali) topib bo'lmasa
- Barcha muqobil render usullari sinab ko'rilgandan keyin ham video umuman
  render bo'lmasa

---

## 11. YAKUNIY SIFAT NAZORATI (o'zing tekshir, keyin topshir)

- [ ] Davomiyligi 10–13 soniya oralig'ida (`ffprobe` bilan tasdiqlangan)
- [ ] O'lcham 1080×1920 (vertikal)
- [ ] Voiceover — faqat o'zbek tilida, aniq va tushunarli talaffuz bilan
- [ ] Captionlar VO bilan sinxron
- [ ] Kamida 4–5 xil trendy SFX (whoosh/whoop/pop/impact/ping) joyida ishlatilgan
- [ ] Fon musiqa bor va VO ni bosib ketmaydi
- [ ] Vizual uslub minimalist va premium (Apple uslubi), ortiqcha element yo'q
- [ ] Video oxirida `hangoma.ai` aniq va o'qilishi oson holatda ko'rinadi
- [ ] Watermark yoki boshqa tashqi logotip yo'q
- [ ] Video zerikarli emas — birinchi soniyalardayoq diqqatni tortadi
