# NEXT_STEPS.md — Diyor uchun, keyingi qadamlar

Loyiha tayyor: bot ishlaydi, admin panel ishlaydi, sotuv materiallari
tayyor. Quyidagi qadamlarni tartib bilan bajar.

## 1. Loyihani ko'rib chiq

- [ ] `SUMMARY.md`'ni o'qi — nima qurilganini umumiy ko'rish uchun
- [ ] `TODO.md`'ni o'qi — nima to'liq tugallanmagani/bilib qo'yish kerak
      bo'lgan cheklovlarni bilish uchun

## 2. Botni lokal sinab ko'r

- [ ] Telegram'da @BotFather'ga yoz, `/newbot` bilan test bot yarat
- [ ] `.env.example`'ni `.env`ga nusxala, `BOT_TOKEN`ni qo'y
- [ ] `pip install -r requirements.txt`, `python seed_data.py`,
      `python -m bot.main` — botni ishga tushir
- [ ] Telegram'da botga `/start` yoz — asosiy oqimni sinab ko'r: til
      tanlash → mahsulotlar → buyurtma → FAQ
- [ ] Ikkinchi terminalda `uvicorn admin.main:app --reload --port 8000`,
      `http://localhost:8000/admin`'ga kirib admin panelni ko'r

To'liq buyruqlar `README.md`'da.

## 3. O'zining ishlaydigan demo-botini tayyorla

Sotuvdan oldin, o'zingning namoyish uchun bot va admin panelingni doimiy
serverda ishlab turgan holga keltir (mijozga jonli demo ko'rsatish uchun):

- [ ] `DEPLOY.md`'dagi Railway yoki Docker/VPS yo'riqnomasidan birini tanla
- [ ] `seed_data.py`dagi demo mahsulotlarni haqiqiyroq/jozibaliroq
      qilib almashtirish mumkin (ixtiyoriy)

## 4. Sotuv materiallarini o'zingga moslashtir

- [ ] `sales/landing.html`'ni ochib ko'r, kontakt email/telegram
      handle'ni haqiqiysiga almashtir (hozir `hello@example.com` va
      `your_agency_handle` — placeholder)
- [ ] `sales/one_pager.html`'da ham xuddi shu kontakt ma'lumotlarini yangila
- [ ] Ikkalasini brauzerda ochib ko'rib chiq, ko'rinishidan mamnun bo'lsang
      xosting joyiga qo'y (yoki to'g'ridan-to'g'ri email'ga ilova qil)

## 5. Birinchi 20-30 potentsial mijozni top

- [ ] `sales/icp.md`'ni o'qi — qanday do'konlarni qidirish kerakligini
      tushunish uchun
- [ ] `sales/finding_first_20_leads.md` bo'yicha qidiruvni boshla
- [ ] Har bir nomzodni `sales/leads_template.csv`'ga qo'sh

## 6. Cold email yuborishni boshla

- [ ] Agar hali qilmagan bo'lsang — email deliverability bo'yicha
      `agency-growth-mentor` skill'idagi maslahatga amal qil: alohida
      domen, sekin boshlash, avval kichik partiyalarda sinash
- [ ] `sales/cold_email_templates.md`dagi 3 ta shablonni har bir lead uchun
      moslashtirib yubor (Email 1 → 3-4 kundan keyin Email 2 agar javob
      bo'lmasa → 7 kundan keyin Email 3)
- [ ] Har bir yuborilgan email holatini `leads_template.csv`'da yangilab bor

## 7. Birinchi javob kelganda

- [ ] Demo botingni ko'rsat (2-qadamda tayyorlagan)
- [ ] `PAYMENTS_GUIDE.md`dagi variantlardan (USDT/Wise/Payoneer) birini
      tanlab, to'lovni qabul qil
- [ ] `NEW_CLIENT_SETUP.md` bo'yicha ularning botini sozla va joylashtir

## 8. Birinchi mijozdan keyin

- [ ] 2-4 haftadan keyin `sales/case_study_template.md`'ni haqiqiy
      natijalar bilan to'ldir — bu keyingi cold emaillaringni ancha
      kuchaytiradi
- [ ] `FUTURE_IDEAS.md`'ni ko'rib chiq — mijozlar so'ragan narsalarga
      qarab keyingi funksiyalarni ustuvorlashtir

---

**Eslatma:** $5,000-10,000 — muntazam cold email va tezkor follow-up
natijasida bir necha oy ichida erishiladigan maqsad, kafolatlangan tezkor
natija emas. Eng katta ta'sir — izchillik: har kuni/har hafta yangi
lead qo'shish va follow-up qilishda.
