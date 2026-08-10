# TEXNIK TOPSHIRIQ (TZ)
## Kategoriyali onlayn savdo platformasi — davlat xarid birjalari bilan integratsiya

**Sana:** 2026-yil 10-avgust
**Hujjat versiyasi:** 1.0 (loyiha)

---

## 1. Loyiha haqida umumiy ma'lumot

Platforma — bu O'zbekiston bozori uchun mo'ljallangan onlayn savdo (e-commerce) sayti bo'lib, xaridorga mahsulotlarni kategoriyalar bo'yicha ko'rish va ikkita yo'nalishda sotib olish imkonini beradi:

1. **Naqd/to'g'ridan-to'g'ri xarid** — oddiy internet-do'kon tartibida.
2. **Birja orqali xarid** — mahsulot O'zbekistondagi rasmiy elektron savdo/xarid birjalaridan biriga (lot sifatida) bog'langan bo'lib, xaridor o'sha birjadagi tegishli lotga yo'naltiriladi.

Mahsulotlar admin tomonidan tayyor Excel fayl (rasmlari bilan) orqali ommaviy yuklanadi, va har bir mahsulotga kerak bo'lsa bitta yoki bir nechta birja loti biriktiriladi.

## 2. Loyihaning maqsadi va vazifalari

- Xaridor uchun bitta saytda ham oddiy xarid, ham birja orqali rasmiy xarid imkoniyatini birlashtirish.
- Sotuvchi/admin uchun mahsulotlarni Excel orqali tez va ommaviy joylash imkoniyatini yaratish.
- Har bir mahsulotni tegishli birja lotlari bilan bog'lab, xaridorni to'g'ri manzilga yo'naltirish.
- Kelgusida boshqa birjalar yoki to'lov tizimlarini qo'shish imkoniyatiga ega, kengaytiriladigan arxitektura qurish.

## 3. Foydalanuvchi rollari

| Rol | Tavsif |
|---|---|
| Xaridor (mehmon/ro'yxatdan o'tgan) | Kategoriyalarni ko'radi, mahsulot tanlaydi, naqd yoki birja orqali xarid qiladi |
| Admin/Sotuvchi | Kategoriya va mahsulotlarni boshqaradi, Excel import qiladi, birja lotlarini bog'laydi, buyurtmalarni kuzatadi |
| Super admin | Adminlarni boshqaradi, tizim sozlamalari, hisobotlar |

## 4. Funktsional talablar

### 4.1 Bosh sahifa va kategoriyalar
- Kategoriyalar ro'yxati (ko'p darajali: kategoriya → subkategoriya).
- Har bir kategoriya ichida mahsulotlar ro'yxati (grid ko'rinishida, rasm + nom + narx + xarid turi belgisi).
- Qidiruv paneli va filtrlar (narx oralig'i, kategoriya, xarid turi: naqd / birja / ikkalasi ham).

### 4.2 Mahsulot kartasi (sahifasi)
- Rasmlar galereyasi (bir nechta rasm, katta ko'rinishda ochish).
- Nomi, tavsifi, texnik xususiyatlari, narxi, o'lchov birligi, ombordagi miqdori.
- Xarid turi ko'rsatkichi: "Naqd sotib olish" va/yoki "Birja orqali xarid" tugmalari.
- Agar mahsulot bir nechta birjada bo'lsa — har biri alohida tugma/qator bilan ko'rsatiladi (birja nomi + lot raqami).

### 4.3 Mahsulotlarni Excel orqali yuklash (import)
- Admin panelda "Excel yuklash" bo'limi.
- Tizim Excel faylni o'qib, jadvaldagi har bir qatorni mahsulot sifatida bazaga yozadi.
- Rasm ustuni: fayl nomi (agar rasmlar alohida arxiv/papka bilan yuklansa) yoki to'g'ridan-to'g'ri havola.
- Import oldidan validatsiya: majburiy maydonlar to'ldirilganligini tekshirish, xato qatorlarni ro'yxat qilib ko'rsatish (xatoliklar hisobotini yuklab olish imkoniyati bilan).
- Import tarixi (qachon, kim, nechta mahsulot yuklandi) saqlanadi.

**Taklif etilayotgan Excel ustunlari:**

| Ustun | Tavsif | Majburiymi |
|---|---|---|
| Mahsulot nomi | | Ha |
| Kategoriya | | Ha |
| Narx | | Ha |
| O'lchov birligi | dona, kg, m² va h.k. | Ha |
| Miqdori (ombor) | | Ha |
| Tavsif | | Yo'q |
| Ishlab chiqaruvchi/brend | | Yo'q |
| Rasm fayl nomi/havolasi | bir nechta rasm uchun vergul bilan ajratiladi | Yo'q |
| Xarid turi | Naqd / Birja / Ikkalasi | Ha |
| Birja nomi | XT-Xarid / Uzex Xarid / Cooperation.uz | Xarid turi "Birja" bo'lsa — Ha |
| Lot raqami/ID | tegishli birjadagi lot identifikatori | Xarid turi "Birja" bo'lsa — Ha |
| Lot havolasi | to'g'ridan-to'g'ri lot sahifasiga havola | Tavsiya etiladi |

### 4.4 Xarid qilish jarayoni

**A) Naqd/to'g'ridan-to'g'ri xarid:**
1. Xaridor mahsulotni savatga qo'shadi.
2. Savatni ko'radi, miqdorni o'zgartiradi.
3. Yetkazib berish/olib ketish manzili va aloqa ma'lumotlarini kiritadi.
4. To'lov usulini tanlaydi (bo'lim 9 ga qarang).
5. Buyurtma tasdiqlanadi, xaridorga bildirishnoma yuboriladi.

**B) Birja orqali xarid:**
1. Xaridor mahsulot kartasida "Birja orqali xarid" tugmasini bosadi.
2. Agar mahsulot faqat bitta birjada bo'lsa — tizim to'g'ridan-to'g'ri o'sha birjaning tegishli lot sahifasiga (yangi oynada) yo'naltiradi.
3. Agar bir nechta birjada bo'lsa — birjalar ro'yxati ko'rsatiladi, xaridor birini tanlaydi va o'sha lot sahifasiga o'tadi.
4. Bitim va to'lov tegishli birjaning o'z tizimida amalga oshiriladi (birja saytida) — bu bosqich sayt nazoratidan tashqarida.

> Izoh: bu yo'nalish "ko'rgazma/katalog + yo'naltirish" tamoyiliga asoslangan, chunki quyida (bo'lim 5) tushuntirilganidek, uchala birjaning ham ochiq (public) API'si topilmadi.

### 4.5 Admin panel
- Kategoriyalarni boshqarish (qo'shish/tahrirlash/o'chirish, tartib).
- Mahsulotlarni qo'lda qo'shish/tahrirlash va Excel orqali ommaviy import.
- Har bir mahsulotga birja lot(lar)ini biriktirish/uzish (mahsulot ↔ lot bog'lanishi — ko'p-ko'pga munosabat).
- Buyurtmalar ro'yxati, holati (yangi/jarayonda/yetkazilgan/bekor qilingan).
- Statistik hisobotlar (sotuvlar, ko'p sotilgan mahsulotlar, birja bo'yicha yo'naltirishlar soni).

### 4.6 Foydalanuvchi kabineti
- Ro'yxatdan o'tish/kirish (telefon raqami + SMS-kod yoki email).
- Buyurtmalar tarixi va holati.
- Sevimlilar ro'yxati.

### 4.7 Bildirishnomalar
- Buyurtma holati o'zgarganda SMS/Telegram-bot orqali xabar (loyihalaringizdagi Telegram-bot tajribasidan foydalanish mumkin).
- Admin uchun yangi buyurtma haqida bildirishnoma.

## 5. Uch birja bilan ishlash tartibi

| Birja | Manzil | Holat |
|---|---|---|
| XT-Xarid (Hayot Birja) | xt-xarid.uz | Ochiq (public) API topilmadi |
| Uzex Xarid | xarid.uzex.uz | Ochiq (public) API topilmadi |
| Elektron kooperatsiya portali | new.cooperation.uz | Ochiq (public) API topilmadi |

Qidiruv natijasida uchala platforma ham davlat xaridlari/kooperatsiya elektron savdo maydonchalari bo'lib, ommaga ochiq texnik hujjatlashtirilgan API topilmadi. Shu sababli TZda ikki xil yondashuv taklif qilinadi:

1. **Havola asosidagi integratsiya (tavsiya etiladi, hoziroq amalga oshiriladi):** admin har bir mahsulotga tegishli lot raqami va to'g'ridan-to'g'ri havolani qo'lda yoki Excel orqali kiritadi, sayt xaridorni shu havolaga yo'naltiradi.
2. **API integratsiyasi (kelajakda, agar mavjud bo'lsa):** birjalarning rasmiy vakillari bilan bog'lanib, hamkorlik/API kaliti so'rash kerak (aloqa: XT-Xarid uchun Telegram — t.me/xtxariduz). API mavjud bo'lsa, lot holati (faolmi, narxi, muddati) avtomatik yangilanadi.

## 6. Texnik arxitektura va stack

| Qatlam | Tavsiya |
|---|---|
| Backend | Flask (Python) yoki Node.js/Express — mavjud tajribangizga mos ravishda tanlanadi |
| Frontend | React |
| Ma'lumotlar bazasi | PostgreSQL |
| Excel import | Python: `openpyxl`/`pandas`; Node: `exceljs`/`xlsx` |
| Rasmlarni saqlash | Server diski yoki S3-mos obyekt xotira (masalan, Cloudflare R2) |
| Bildirishnoma | Telegram Bot API / SMS-shlyuz (Eskiz.uz, Playmobile va h.k.) |
| Hosting | Railway yoki Render.com |

## 7. Ma'lumotlar bazasi tuzilishi (asosiy jadvallar)

- **users** — id, ism, telefon, email, parol_hash, rol
- **categories** — id, nomi, parent_id
- **products** — id, nomi, tavsif, narx, birlik, miqdor, category_id, xarid_turi (naqd/birja/ikkalasi)
- **product_images** — id, product_id, rasm_havolasi, tartib
- **exchange_lots** — id, product_id, birja_nomi, lot_raqami, lot_havolasi, holati
- **orders** — id, user_id, holat, umumiy_summa, yaratilgan_sana
- **order_items** — id, order_id, product_id, miqdor, narx
- **excel_imports** — id, admin_id, fayl_nomi, muvaffaqiyatli_qator, xatolik_qator, sana

## 8. To'lov tizimlari integratsiyasi (naqd yo'nalish uchun)

- Payme
- Click
- Naqd/yetkazib berishda to'lash (agar kerak bo'lsa)

## 9. Xavfsizlik talablari

- Parollar hash qilinib saqlanadi (bcrypt/argon2).
- Admin panelga kirish uchun autentifikatsiya va rol asosidagi ruxsatlar (RBAC).
- Excel import paytida fayl turi va hajmi tekshiriladi (zararli fayl yuklanishining oldini olish).
- HTTPS majburiy.

## 10. Dizayn talablari

- O'zbek milliy uslubi va ranglaridan foydalanish (avvalgi loyihalaringizdagi kabi).
- Zamonaviy, tushunarli interfeys; mobil qurilmalarga moslashuvchan (responsive) dizayn.

## 11. Ishlab chiqish bosqichlari (taklif)

1. **1-bosqich (MVP):** kategoriyalar, mahsulot katalogi, Excel import, naqd xarid jarayoni, admin panel asoslari.
2. **2-bosqich:** birja lotlarini bog'lash va yo'naltirish funksiyasi, bildirishnomalar.
3. **3-bosqich:** statistika, kengaytirilgan filtrlar, birjalar bilan rasmiy hamkorlik/API (agar imkon bo'lsa).

## 12. Aniqlashtirish talab qiladigan ochiq savollar

- Naqd xarid uchun qaysi to'lov tizimlari ulanishi kerak (Payme, Click, ikkalasi ham)?
- Yetkazib berish xizmati saytning o'zida rejalashtiriladimi yoki tashqi kuryer xizmati orqalimi?
- Sayt faqat o'zbek tilidamimi yoki rus/ingliz tili ham qo'shiladimi?
- Birjalar bilan rasmiy hamkorlik/API imkoniyatini tekshirish kerakmi (aloqaga chiqish)?
- Mobil ilova ham kerakmi, yoki faqat veb-sayt (responsive) yetarlimi?

---

*Ushbu hujjat loyihaning boshlang'ich texnik topshirig'i bo'lib, yuqoridagi ochiq savollarga javob olingach yakuniy versiyaga aylantiriladi.*
