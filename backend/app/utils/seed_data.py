"""
`flask --app run.py seed-categories` buyrug'i uchun namunaviy 3 bosqichli
kategoriya daraxti (ildiz -> guruh -> element), uch tilda (uz/ru/en).
Ofis-kanselyariya bozori uchun mo'ljallangan boshlang'ich to'plam - admin
panelidan istalgan vaqt tahrirlash/o'chirish mumkin.
"""


def _c(uz, ru, en, items=None):
    node = {"uz": uz, "ru": ru, "en": en}
    if items is not None:
        node["items"] = items
    return node


CATALOG = [
    _c("Qog'oz", "Бумага", "Paper", [
        _c("Ofis qog'ozi", "Офисная бумага", "Office paper", [
            _c("Ofis qog'ozi", "Офисная бумага", "Office paper"),
            _c("Gazeta qog'ozi", "Газетная бумага", "Newsprint paper"),
            _c("Eslatma qog'ozi", "Бумага для заметок", "Note paper"),
            _c("(Rulonli) ofset qog'ozi", "(Рулонная) офсетная бумага", "(Roll) offset paper"),
        ]),
        _c("Maxsus qog'oz", "Специальная бумага", "Specialty paper", [
            _c("Foto qog'oz", "Фотобумага", "Photo paper"),
            _c("Flipchart uchun qog'oz", "Бумага для флипчарта", "Flipchart paper"),
            _c("Keng formatli qog'oz", "Широкоформатная бумага", "Wide-format paper"),
            _c("Stickerlar", "Стикеры", "Stickers"),
        ]),
        _c("Ijod uchun qog'oz", "Бумага для творчества", "Craft paper", [
            _c("Chizmachilik va rasm chizish uchun qog'oz", "Бумага для черчения и рисования", "Drawing & sketching paper"),
            _c("Rangli qog'oz", "Цветная бумага", "Colored paper"),
            _c("Karton", "Картон", "Cardboard"),
            _c("Rangli folga", "Цветная фольга", "Colored foil"),
            _c("Xolstlar va albomlar", "Холсты и альбомы", "Canvases & albums"),
        ]),
    ]),
    _c("Qog'oz mahsulotlari", "Бумажная продукция", "Paper products", [
        _c("Daftar va bloknotlar", "Тетради и блокноты", "Notebooks & notepads", [
            _c("Daftarlar", "Тетради", "Notebooks"),
            _c("Bloknotlar", "Блокноты", "Notepads"),
        ]),
        _c("Rasmiy hujjatlar", "Официальные документы", "Official documents", [
            _c("Mehnat daftarchalari", "Трудовые книжки", "Employment record books"),
            _c("Guvohnomalar", "Свидетельства", "Certificates"),
            _c("Telefon ma'lumotnomalari", "Телефонные книжки", "Phone directories"),
            _c("Qolganlar", "Остальное", "Others"),
        ]),
        _c("Rejalashtirish mahsulotlari", "Продукция для планирования", "Planning products", [
            _c("Kundalik reja daftarlar", "Ежедневники", "Daily planners"),
            _c("Planinglar", "Планинги", "Planners"),
            _c("Taqvimlar", "Календари", "Calendars"),
        ]),
        _c("Poligrafiya", "Полиграфия", "Printing products", [
            _c("Blankalar, vizitkalar va sertifikatlar", "Бланки, визитки и сертификаты", "Forms, business cards & certificates"),
            _c("Kitob belgilari", "Закладки", "Bookmarks"),
            _c("Dunyo xaritalari", "Карты мира", "World maps"),
            _c("Konvertlar", "Конверты", "Envelopes"),
            _c("Yorliqlar", "Этикетки", "Labels"),
        ]),
        _c("Anketa va hisob hujjatlari", "Анкеты и учётные документы", "Forms & record books", [
            _c("Anketalar va kundaliklar", "Анкеты и дневники", "Forms & diaries"),
            _c("Hisob-kitob kitoblari", "Расчётные книжки", "Account books"),
        ]),
    ]),
    _c("Papkalar va fayllar", "Папки и файлы", "Folders & files", [
        _c("Papkalar", "Папки", "Folders", [
            _c("Hujjat papkalari", "Папки для документов", "Document folders"),
            _c("Arxiv papkalari", "Архивные папки", "Archive folders"),
            _c("Portfellar", "Портфели", "Briefcases"),
            _c("Portfel papkalar", "Папки-портфели", "Portfolio folders"),
            _c("Registr papkalar", "Регистраторы", "Ring binders"),
        ]),
        _c("Fayllar va ajratkichlar", "Файлы и разделители", "Files & dividers", [
            _c("Fayllar", "Файлы", "Files"),
            _c("Ajratuvchilar", "Разделители", "Dividers"),
        ]),
        _c("Pereplyot va laminatsiya", "Переплёт и ламинация", "Binding & lamination", [
            _c("Pereplyotlar uchun prujinalar", "Пружины для переплёта", "Binding coils"),
            _c("Pereplyotlar uchun jildlar", "Обложки для переплёта", "Binding covers"),
            _c("Laminatsiya plyonkalari", "Плёнки для ламинации", "Lamination film"),
            _c("Muqovalar", "Обложки", "Covers"),
            _c("Chexol", "Чехол", "Case"),
        ]),
    ]),
    _c("Yozuv qurollari", "Пишущие принадлежности", "Writing supplies", [
        _c("Asosiy yozuv qurollari", "Основные пишущие принадлежности", "Basic writing tools", [
            _c("Ruchkalar", "Ручки", "Pens"),
            _c("Markerlar", "Маркеры", "Markers"),
            _c("Matn uchun markerlar", "Текстовыделители", "Highlighters"),
            _c("Qalamlar", "Карандаши", "Pencils"),
            _c("Flomasterlar", "Фломастеры", "Felt-tip pens"),
        ]),
        _c("Aksessuar va sarf materiallari", "Аксессуары и расходные материалы", "Accessories & consumables", [
            _c("Qalamlar uchun aksessuar va sarf materiallari", "Аксессуары для карандашей", "Pencil accessories & supplies"),
            _c("Ruchkalar uchun aksessuar va sarf materiallari", "Аксессуары для ручек", "Pen accessories & supplies"),
            _c("Markerlar uchun aksessuar va sarf materiallari", "Аксессуары для маркеров", "Marker accessories & supplies"),
            _c("Qalamdon", "Пенал", "Pencil case"),
        ]),
        _c("To'plamlar", "Наборы", "Sets", [
            _c("Kanselyariya to'plamlari", "Канцелярские наборы", "Stationery sets"),
            _c("Bo'rlar va pastellar", "Мелки и пастель", "Chalk & pastels"),
        ]),
    ]),
    _c("Namoyish doskalari", "Демонстрационные доски", "Display boards", []),
    _c("Ofis anjomlari", "Офисные принадлежности", "Office accessories", []),
    _c("Ofis texnikasi", "Офисная техника", "Office equipment", [
        _c("Aksessuarlar", "Аксессуары", "Accessories", [
            _c("Klaviaturalar va sichqonchalar", "Клавиатуры и мыши", "Keyboards & mice"),
            _c("Kassa lentasi", "Кассовая лента", "Receipt tape"),
            _c("Quloqchinlar va audio texnikalar", "Наушники и аудиотехника", "Headphones & audio devices"),
            _c("Xotira kartalari va flesh-disklar", "Карты памяти и флешки", "Memory cards & flash drives"),
            _c("Batareykalar", "Батарейки", "Batteries"),
        ]),
        _c("Texnika", "Техника", "Equipment", [
            _c("Bog'lash uchun mashinasi", "Машина для переплёта", "Binding machine"),
            _c("Printerlar va aksessuarlar", "Принтеры и аксессуары", "Printers & accessories"),
            _c("Qog'oz maydalagich", "Шредер", "Paper shredder"),
            _c("Iqlim texnikasi", "Климатическая техника", "Climate equipment"),
            _c("Maishiy texnika", "Бытовая техника", "Household appliances"),
        ]),
        _c("Elektronika", "Электроника", "Electronics", [
            _c("Kabellar, adapterlar va quvvatlantirish bloklari", "Кабели, адаптеры и блоки питания", "Cables, adapters & power supplies"),
            _c("ShK va butlovchi qismlar", "ПК и комплектующие", "PCs & components"),
            _c("Smartfonlar uchun aksessuarlar", "Аксессуары для смартфонов", "Smartphone accessories"),
        ]),
    ]),
    _c("Ofis mebellari", "Офисная мебель", "Office furniture", []),
    _c("Muhrlar va shtamplar", "Печати и штампы", "Seals & stamps", [
        _c("Muhrlar va shtamplar", "Печати и штампы", "Seals & stamps", [
            _c("Shtamplar", "Штампы", "Stamps"),
            _c("Muhrlar", "Печати", "Seals"),
            _c("Sana qo'yuvchi shtamplar", "Датеры", "Date stamps"),
            _c("Numeratorlar", "Нумераторы", "Numbering stamps"),
        ]),
        _c("Aksessuarlar", "Аксессуары", "Accessories", [
            _c("Shtempel yostiqchalari", "Штемпельные подушки", "Stamp pads"),
            _c("Muhr bo'yoqlari", "Краска для печатей", "Stamp ink"),
            _c("Shtamplar uchun osnastkalar va futlyarlar", "Оснастки и футляры для штампов", "Stamp mounts & cases"),
        ]),
    ]),
    _c("Oziq-ovqat mahsulotlari", "Продукты питания", "Food products", [
        _c("Choy, qahva va ichimliklar", "Чай, кофе и напитки", "Tea, coffee & beverages", [
            _c("Choylar", "Чай", "Tea"),
            _c("Choy to'plamlari", "Наборы чая", "Tea sets"),
            _c("Qahva", "Кофе", "Coffee"),
            _c("Kapsulalardagi qahva", "Кофе в капсулах", "Capsule coffee"),
            _c("Suv", "Вода", "Water"),
        ]),
        _c("Sneklar", "Снеки", "Snacks", [
            _c("Shirinliklar", "Сладости", "Sweets"),
            _c("Quruq mevalar", "Сухофрукты", "Dried fruits"),
            _c("Chips va boshqa", "Чипсы и прочее", "Chips & other"),
        ]),
        _c("Shakar va tuz", "Сахар и соль", "Sugar & salt", [
            _c("Kiloli shakar", "Сахар весовой", "Sugar (bulk)"),
            _c("Qand", "Рафинад", "Sugar cubes"),
            _c("Qadoqlangan shakar", "Сахар в упаковке", "Packaged sugar"),
            _c("Tuz", "Соль", "Salt"),
            _c("Shakar o'rnini bosuvchi", "Заменитель сахара", "Sugar substitute"),
        ]),
        _c("Sut mahsulotlari", "Молочные продукты", "Dairy products", [
            _c("Sut", "Молоко", "Milk"),
            _c("Quruq sut", "Сухое молоко", "Powdered milk"),
        ]),
    ]),
    _c("Parvarish va tozalik", "Уход и чистота", "Care & cleaning", [
        _c("Yuvish va tozalash vositalari", "Средства для мытья и чистки", "Washing & cleaning products", [
            _c("Idish yuvish mashinalari uchun vositalar", "Средства для посудомоечных машин", "Dishwasher products"),
            _c("Idishlarni qo'lda yuvish vositalari", "Средства для мытья посуды вручную", "Hand dishwashing products"),
            _c("Tozalash vositalari", "Чистящие средства", "Cleaning products"),
            _c("Kir yuvish kukunlari", "Стиральные порошки", "Laundry powders"),
        ]),
        _c("Qog'oz gigiyena mahsulotlari", "Бумажная гигиеническая продукция", "Paper hygiene products", [
            _c("Pishirish qog'ozi", "Бумага для выпечки", "Baking paper"),
            _c("Qog'oz sochiqlar", "Бумажные полотенца", "Paper towels"),
            _c("Qog'oz salfetkalar", "Бумажные салфетки", "Paper napkins"),
            _c("Nam salfetkalar", "Влажные салфетки", "Wet wipes"),
            _c("Tualet qog'ozi", "Туалетная бумага", "Toilet paper"),
        ]),
        _c("Musaffolashtirish vositalari", "Средства для освежения и очистки", "Freshening & cleaning agents", [
            _c("Avtomatik havo spreyi", "Автоматический освежитель воздуха", "Automatic air freshener"),
            _c("Xona uchun havo spreyi", "Освежитель воздуха для комнаты", "Room air freshener"),
            _c("Kiyim va poyabzal parvarish vositalari", "Средства по уходу за одеждой и обувью", "Clothing & footwear care products"),
            _c("Gilam va mebel parvarish vositalari", "Средства по уходу за коврами и мебелью", "Carpet & furniture care products"),
            _c("Avtomobil parvarish vositalari", "Средства по уходу за автомобилем", "Car care products"),
        ]),
        _c("Sovun va gigiyena vositalari", "Мыло и средства гигиены", "Soap & hygiene products", [
            _c("Suyuq sovun", "Жидкое мыло", "Liquid soap"),
            _c("Xo'jalik sovuni", "Хозяйственное мыло", "Household soap"),
            _c("Shaxsiy gigiyena vositalari", "Средства личной гигиены", "Personal hygiene products"),
        ]),
    ]),
    _c("Xo'jalik buyumlari", "Хозяйственные товары", "Household goods", [
        _c("Tozalash uchun", "Для уборки", "For cleaning", [
            _c("Chiqindi chelaklari", "Мусорные ведра", "Trash bins"),
            _c("Tozalash inventarlari", "Инвентарь для уборки", "Cleaning tools"),
            _c("Tozalash salfetkalari va lattalar", "Салфетки и тряпки для уборки", "Cleaning cloths & rags"),
            _c("Qo'lqoplar", "Перчатки", "Gloves"),
            _c("Matolar, lentalar va arqonlar", "Ткани, ленты и верёвки", "Fabrics, tapes & ropes"),
        ]),
        _c("Ta'mirlash", "Ремонт", "Repair", [
            _c("Yoritish", "Освещение", "Lighting"),
            _c("Rozetkalar, vilkalar va o'chirgichlar", "Розетки, вилки и выключатели", "Sockets, plugs & switches"),
            _c("Qurilish va ta'mirlash buyumlari", "Строительные и ремонтные товары", "Construction & repair goods"),
            _c("O'lchash asboblari", "Измерительные инструменты", "Measuring tools"),
            _c("Uzaytirgichlar", "Удлинители", "Extension cords"),
        ]),
        _c("Idishlar", "Посуда", "Dishware", [
            _c("Choy va ichimlik idishlari", "Посуда для чая и напитков", "Tea & beverage ware"),
            _c("Oshxona va stol asboblari", "Кухонные и столовые приборы", "Kitchen & table utensils"),
            _c("Oshxona idishlari", "Кухонная посуда", "Kitchenware"),
            _c("Bir martali ishlatiladigan idishlar", "Одноразовая посуда", "Disposable dishware"),
            _c("Qadoqlash va saqlash", "Упаковка и хранение", "Packaging & storage"),
        ]),
    ]),
]
