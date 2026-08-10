"""
`flask --app run.py seed-categories` buyrug'i uchun namunaviy 3 bosqichli
kategoriya daraxti (ildiz -> guruh -> element). Ofis-kanselyariya bozori
uchun mo'ljallangan boshlang'ich to'plam - admin panelidan istalgan vaqt
tahrirlash/o'chirish mumkin.
"""

CATALOG = {
    "Qog'oz": {
        "Ofis qog'ozi": [
            "Ofis qog'ozi",
            "Gazeta qog'ozi",
            "Eslatma qog'ozi",
            "(Rulonli) ofset qog'ozi",
        ],
        "Maxsus qog'oz": [
            "Foto qog'oz",
            "Flipchart uchun qog'oz",
            "Keng formatli qog'oz",
            "Stickerlar",
        ],
        "Ijod uchun qog'oz": [
            "Chizmachilik va rasm chizish uchun qog'oz",
            "Rangli qog'oz",
            "Karton",
            "Rangli folga",
            "Xolstlar va albomlar",
        ],
    },
    "Qog'oz mahsulotlari": {
        "Daftar va bloknotlar": ["Daftarlar", "Bloknotlar"],
        "Rasmiy hujjatlar": [
            "Mehnat daftarchalari",
            "Guvohnomalar",
            "Telefon ma'lumotnomalari",
            "Qolganlar",
        ],
        "Rejalashtirish mahsulotlari": ["Kundalik reja daftarlar", "Planinglar", "Taqvimlar"],
        "Poligrafiya": [
            "Blankalar, vizitkalar va sertifikatlar",
            "Kitob belgilari",
            "Dunyo xaritalari",
            "Konvertlar",
            "Yorliqlar",
        ],
        "Anketa va hisob hujjatlari": ["Anketalar va kundaliklar", "Hisob-kitob kitoblari"],
    },
    "Papkalar va fayllar": {
        "Papkalar": [
            "Hujjat papkalari",
            "Arxiv papkalari",
            "Portfellar",
            "Portfel papkalar",
            "Registr papkalar",
        ],
        "Fayllar va ajratkichlar": ["Fayllar", "Ajratuvchilar"],
        "Pereplyot va laminatsiya": [
            "Pereplyotlar uchun prujinalar",
            "Pereplyotlar uchun jildlar",
            "Laminatsiya plyonkalari",
            "Muqovalar",
            "Chexol",
        ],
    },
    "Yozuv qurollari": {
        "Asosiy yozuv qurollari": ["Ruchkalar", "Markerlar", "Matn uchun markerlar", "Qalamlar", "Flomasterlar"],
        "Aksessuar va sarf materiallari": [
            "Qalamlar uchun aksessuar va sarf materiallari",
            "Ruchkalar uchun aksessuar va sarf materiallari",
            "Markerlar uchun aksessuar va sarf materiallari",
            "Qalamdon",
        ],
        "To'plamlar": ["Kanselyariya to'plamlari", "Bo'rlar va pastellar"],
    },
    "Namoyish doskalari": {},
    "Ofis anjomlari": {},
    "Ofis texnikasi": {
        "Aksessuarlar": [
            "Klaviaturalar va sichqonchalar",
            "Kassa lentasi",
            "Quloqchinlar va audio texnikalar",
            "Xotira kartalari va flesh-disklar",
            "Batareykalar",
        ],
        "Texnika": [
            "Bog'lash uchun mashinasi",
            "Printerlar va aksessuarlar",
            "Qog'oz maydalagich",
            "Iqlim texnikasi",
            "Maishiy texnika",
        ],
        "Elektronika": [
            "Kabellar, adapterlar va quvvatlantirish bloklari",
            "ShK va butlovchi qismlar",
            "Smartfonlar uchun aksessuarlar",
        ],
    },
    "Ofis mebellari": {},
    "Muhrlar va shtamplar": {
        "Muhrlar va shtamplar": ["Shtamplar", "Muhrlar", "Sana qo'yuvchi shtamplar", "Numeratorlar"],
        "Aksessuarlar": [
            "Shtempel yostiqchalari",
            "Muhr bo'yoqlari",
            "Shtamplar uchun osnastkalar va futlyarlar",
        ],
    },
    "Oziq-ovqat mahsulotlari": {
        "Choy, qahva va ichimliklar": ["Choylar", "Choy to'plamlari", "Qahva", "Kapsulalardagi qahva", "Suv"],
        "Sneklar": ["Shirinliklar", "Quruq mevalar", "Chips va boshqa"],
        "Shakar va tuz": ["Kiloli shakar", "Qand", "Qadoqlangan shakar", "Tuz", "Shakar o'rnini bosuvchi"],
        "Sut mahsulotlari": ["Sut", "Quruq sut"],
    },
    "Parvarish va tozalik": {
        "Yuvish va tozalash vositalari": [
            "Idish yuvish mashinalari uchun vositalar",
            "Idishlarni qo'lda yuvish vositalari",
            "Tozalash vositalari",
            "Kir yuvish kukunlari",
        ],
        "Qog'oz gigiyena mahsulotlari": [
            "Pishirish qog'ozi",
            "Qog'oz sochiqlar",
            "Qog'oz salfetkalar",
            "Nam salfetkalar",
            "Tualet qog'ozi",
        ],
        "Musaffolashtirish vositalari": [
            "Avtomatik havo spreyi",
            "Xona uchun havo spreyi",
            "Kiyim va poyabzal parvarish vositalari",
            "Gilam va mebel parvarish vositalari",
            "Avtomobil parvarish vositalari",
        ],
        "Sovun va gigiyena vositalari": ["Suyuq sovun", "Xo'jalik sovuni", "Shaxsiy gigiyena vositalari"],
    },
    "Xo'jalik buyumlari": {
        "Tozalash uchun": [
            "Chiqindi chelaklari",
            "Tozalash inventarlari",
            "Tozalash salfetkalari va lattalar",
            "Qo'lqoplar",
            "Matolar, lentalar va arqonlar",
        ],
        "Ta'mirlash": [
            "Yoritish",
            "Rozetkalar, vilkalar va o'chirgichlar",
            "Qurilish va ta'mirlash buyumlari",
            "O'lchash asboblari",
            "Uzaytirgichlar",
        ],
        "Idishlar": [
            "Choy va ichimlik idishlari",
            "Oshxona va stol asboblari",
            "Oshxona idishlari",
            "Bir martali ishlatiladigan idishlar",
            "Qadoqlash va saqlash",
        ],
    },
}
