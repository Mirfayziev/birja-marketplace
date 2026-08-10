# BirjaMarket — kategoriyali onlayn savdo platformasi

Bu repozitoriy TZ (texnik topshiriq) asosida qurilgan to'liq ishlaydigan veb-ilova:
**backend** (Flask REST API) va **frontend** (React + Vite + Tailwind, uz/ru/en tillarida)
alohida papkalarda joylashgan.

```
birja-marketplace/
  backend/     - Flask REST API (mahsulotlar, kategoriyalar, buyurtmalar, Excel import, Payme/Click)
  frontend/    - React ilova (do'kon + admin panel)
```

Backend allaqachon avtomatik testlardan o'tkazilgan (login, kategoriya, mahsulot, birja lot
bog'lash, Excel import, buyurtma yaratish). Frontend `npm run build` orqali muvaffaqiyatli
build qilinishi tekshirilgan.

---

## 1. Loyiha imkoniyatlari (qisqacha)

- Kategoriyalar va mahsulotlar katalogi, qidiruv va filtrlar
- Har bir mahsulotda ikki xarid yo'li: **naqd** (savat → checkout → Payme/Click/naqd) va
  **birja orqali** (tegishli lotga to'g'ridan-to'g'ri yo'naltirish)
- Bitta mahsulotni bir nechta birjaga (XT-Xarid, Uzex Xarid, Cooperation.uz) bog'lash
- Admin panelda Excel orqali mahsulotlarni ommaviy yuklash (rasm havolalari va birja
  lotlari bilan birga)
- Uch tillilik: o'zbekcha, ruscha, inglizcha (interfeys va mahsulot/kategoriya nomlari)
- Yetkazib berish sayt ichida rejalashtiriladi (manzil, viloyat, izoh maydonlari bilan)
- JWT asosidagi autentifikatsiya — kelajakda mobil ilova shu API'ning o'zidan foydalanadi

## 2. Ochiq qolgan/kengaytiriladigan joylar

- **Birjalar bilan rasmiy API integratsiyasi**: hozircha faqat lot havolasiga yo'naltirish
  ishlaydi (TZ bo'lim 5 ga qarang). Agar XT-Xarid/Uzex/Cooperation.uz rasmiy API taqdim
  etsa, `backend/app/models.py` dagi `ExchangeLot` jadvaliga `synced_at`, `external_status`
  kabi ustunlar qo'shib, avtomatik sinxronizatsiya qo'shish mumkin.
- **Mobil ilova**: backend allaqachon toza REST/JSON API bo'lgani uchun mobil ilova (React
  Native/Flutter) shu API'ni to'g'ridan-to'g'ri ishlatishi mumkin — alohida backend
  o'zgarishi shart emas.
- **Payme/Click**: kod ikkala tizimning standart oqimini to'g'ri tuzilishda amalga
  oshiradi, lekin ishga tushirishdan oldin haqiqiy merchant kalitlari bilan sandboxda
  sinovdan o'tkazish kerak (`backend/app/routes/payments.py` boshidagi izohga qarang).

---

## 3. Lokal ishga tushirish

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # qiymatlarni to'ldiring
python run.py                    # http://localhost:5000 da ishga tushadi, jadvallarni avtomatik yaratadi

# Birinchi superadminni yaratish (alohida terminalda):
flask --app run.py seed-admin
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_URL ni backend manziliga moslang
npm run dev                      # http://localhost:5173 da ishga tushadi
```

---

## 4. Railway.app ga joylashtirish (backend)

1. Railway'da yangi loyiha yarating, GitHub repozitoriyangizni ulang (yoki
   `railway up` orqali `backend/` papkasidan to'g'ridan-to'g'ri deploy qiling).
2. **Root Directory** ni `backend` qilib belgilang.
3. Railway PostgreSQL plaginini qo'shing — `DATABASE_URL` avtomatik beriladi.
4. Quyidagi Environment Variable larni qo'shing (`.env.example` asosida):
   `SECRET_KEY`, `JWT_SECRET_KEY`, `CORS_ORIGINS` (frontend domeningiz),
   `PAYME_MERCHANT_ID`, `PAYME_SECRET_KEY`, `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`,
   `CLICK_SECRET_KEY`, `ADMIN_PHONE`, `ADMIN_PASSWORD`.
5. `Procfile` allaqachon mavjud (`web: gunicorn run:app`) — Railway buni avtomatik taniydi.
6. Birinchi deploydan keyin Railway konsolida bir marta:
   `flask --app run.py seed-admin` buyrug'ini ishga tushiring (superadmin yaratish uchun).

## 5. Render.com ga joylashtirish (backend)

1. **New → Web Service** → repozitoriyangizni tanlang, **Root Directory**: `backend`.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `gunicorn run:app`
4. **PostgreSQL** — Render'da alohida PostgreSQL instance yarating, `DATABASE_URL` ni
   Environment bo'limiga qo'shing.
5. Yuqoridagi (4-bo'limdagi) barcha Environment Variable larni qo'shing.
6. Deploy tugagach, Render Shell orqali `flask --app run.py seed-admin` ni ishga tushiring.

## 6. Frontend'ni joylashtirish

Frontend statik build (`npm run build` → `dist/` papkasi) bo'lgani uchun uni Railway/Render
Static Site sifatida, yoki Vercel/Netlify orqali osongina joylashtirish mumkin:

- **Build Command**: `npm run build`
- **Publish/Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL` = backendning production manzili
  (masalan, `https://sizning-backend.up.railway.app`)

`vercel.json` fayli SPA routing (sahifani yangilaganda 404 bo'lmasligi) uchun allaqachon
tayyorlangan; Render Static Site'da xuddi shu qoidani "Redirect/Rewrite" bo'limida qo'lda
qo'shish kerak: `/* → /index.html`.

---

## 7. Excel import formati (eslatma)

Admin panel → Excel import bo'limiga yuklanadigan faylda quyidagi ustunlar bo'lishi kerak
(katta-kichik harflar va tartib muhim emas, lekin nomlar aynan shunday yozilishi kerak):

| Ustun | Majburiymi |
|---|---|
| Mahsulot nomi | Ha |
| Kategoriya | Ha |
| Narx | Ha |
| O'lchov birligi | Ha |
| Xarid turi (Naqd / Birja / Ikkalasi) | Ha |
| Miqdori (ombor) | Yo'q |
| Tavsif | Yo'q |
| Ishlab chiqaruvchi | Yo'q |
| Rasm fayl nomi/havolasi | Yo'q |
| Birja nomi (XT-Xarid / Uzex Xarid / Cooperation.uz) | Birja bo'lsa — Ha |
| Lot raqami/ID | Yo'q |
| Lot havolasi | Birja bo'lsa — Ha |

Bitta mahsulot bir nechta birjada bo'lsa, o'sha mahsulot uchun bir nechta qator yozing
(Mahsulot nomi va Kategoriya bir xil bo'lsin, faqat Birja nomi/Lot ma'lumotlari farqlansin) —
tizim ularni avtomatik bitta mahsulotga birlashtirib, barcha lotlarni bog'laydi.

To'liq TZ hujjati asosiy suhbatda taqdim etilgan `TZ_onlayn_savdo_platformasi.md` faylida.
