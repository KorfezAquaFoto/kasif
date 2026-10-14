// ===== Görev / istasyon verisi =====
// Yeni görev eklemek için listeye bir satır ekleyin ve sw.js içindeki VERSION'ı artırın.
// code : QR içine yazılan gizli kod (benzersiz olmalı)
// region: regions içindeki bölge (pasaport sayfası, vize damgası ve harita bundan gelir)
// name : canlının adı      title: görevin adı      hint: kilitliyken görünen ipucu   where: QR'ın yeri
// quiz : null ise soru sorulmadan damga verilir; clue: yanlış cevapta gösterilen yönlendirici ipucu   factTitle: bilgi kartının başlığı (yoksa "Biliyor muydun?")
// art  : art.js içindeki çizimin adı   color/light: damga renkleri
window.KASIF = {
  aquarium: "Körfez Aqua",
  season: "2026 Sonbahar",
  // kind: kita = yuvarlak vize, korfez = köşeli vize, ozel = sekizgen vize. Kıtalar haritada yanar.
  regions: {
    "guney-amerika": { label: "Güney Amerika", kind: "kita" },
    "asya":          { label: "Asya",          kind: "kita" },
    "avustralya":    { label: "Avustralya",    kind: "kita" },
    "afrika":        { label: "Afrika",        kind: "kita" },
    "avrupa":        { label: "Avrupa",        kind: "kita" },
    "izmit":         { label: "İzmit Körfezi", kind: "korfez" },
    "kabuk":         { label: "Kabuk Sergisi", kind: "ozel" },
    "megalodon":     { label: "Megalodon",     kind: "ozel" },
    "tunel":         { label: "Büyük Tünel",   kind: "ozel" }
  },
  groups: [
    { kind: "kita",   label: "Kıtalar macerası", short: "Kıtalar", icon: "🌍" },
    { kind: "korfez", label: "Bizim körfez",     short: "Körfez",  icon: "⚓" },
    { kind: "ozel",   label: "Özel bölgeler",    short: "Özel",    icon: "⭐" }
  ],
  stations: [
    {
      id: "pirana", code: "PRN-3T9F", region: "guney-amerika", art: "pirana", color: "#8a2a2a", light: "#e0675a",
      name: "Pirana", title: "Amazon'un Dişlisi",
      hint: "Keskin dişlerimle tanınırım. Beni Güney Amerika bölümünde bul.",
      where: "Pirana tankının etrafına dikkatlice bak!",
      quiz: { q: "Piranalar neden sürü hâlinde yüzer?",
              options: ["Uyumak için", "Korunmak için", "Isınmak için"], answer: 1,
              clue: "Tanktaki piranalara bak: tek tek mi, hep birlikte mi yüzüyorlar?" },
      fact: "Piranalar sanıldığı kadar korkunç değildir. Çoğu ürkektir ve kendini korumak için sürü hâlinde yüzer. Akrabası pacu'nun dişleri ise insan dişine benzer!"
    },
    {
      id: "mersin", code: "MRS-4N7C", region: "asya", art: "mersin", color: "#2b4a6b", light: "#6f93b8",
      name: "Mersin Balığı", title: "Zırhlı Dev",
      hint: "Vücudumda zırh gibi sert plakalar taşırım. Çok uzun zamandır yaşıyorum. Asya bölümüne bak.",
      where: "Mersin balığı tankının etrafına dikkatlice bak!",
      quiz: { q: "Mersin balığının vücudundaki sert plakalar ne işe yarar?",
              options: ["Daha hızlı yüzmeye", "Renk değiştirmeye", "Korunmaya"], answer: 2,
              clue: "Bu plakalar bir şövalyenin zırhına benziyor. Zırh ne işe yarar?" },
      fact: "Mersin balıklarının ataları dinozorlar zamanında da yaşıyordu! Bugün ise çok avlandıkları için türlerinin çoğunun nesli tehlikede."
    },
    {
      id: "kesis", code: "KSY-2P6L", region: "avustralya", art: "kesis", color: "#b4532a", light: "#f29a5e",
      name: "Keşiş Yengeci", title: "Evini Taşıyan",
      hint: "Evimi sırtımda taşırım. Büyüdükçe yeni bir eve ihtiyacım olur. Avustralya bölümüne bak.",
      where: "Keşiş yengeci tankının etrafına dikkatlice bak!",
      quiz: { q: "Keşiş yengeci neden yeni bir kabuğa taşınır?",
              options: ["Büyüdüğü için", "Kabuğu kirlendiği için", "Renk değiştirmek için"], answer: 0,
              clue: "Ayakkabıların sana küçük gelince ne yaparsın?" },
      fact: "Keşiş yengecinin karnı yumuşaktır. Kendini korumak için boş deniz salyangozu kabuklarını ev olarak kullanır, büyüdükçe daha büyüğünü arar."
    },
    {
      id: "fosil", code: "FSL-8D3M", region: "afrika", art: "fosil", color: "#7d5d34", light: "#d2ad72",
      name: "Fosiller", title: "Taşlaşmış Sır",
      hint: "Afrika bölümünde başını kaldır! Duvarların yukarısındaki fosilleri bul.",
      where: "Afrika bölümünde başını kaldır: duvarların yukarısındaki fosilleri ara!",
      quiz: { q: "Fosiller bize en çok ne anlatır?",
              options: ["Yarın havanın nasıl olacağını", "Çok eski zamanlarda yaşamış canlıları", "Denizin bugünkü sıcaklığını"], answer: 1,
              clue: "Fosiller milyonlarca yıl önceden kalma. Geçmişi mi anlatır, geleceği mi?" },
      fact: "Fosiller, milyonlarca yıl önce yaşamış canlıların taşa dönüşmüş kalıntıları ve izleridir. Bilim insanları onlara bakarak geçmişi öğrenir."
    },
    {
      id: "orfoz", code: "ORF-5G2H", region: "avrupa", art: "orfoz", color: "#6b4a2e", light: "#b98a5e",
      name: "Orfoz", title: "Kaya Bekçisi",
      hint: "Kayalık alanlarda saklanırım. Beni fark etmek için dikkatli bakmalısın. Avrupa bölümüne bak.",
      where: "Orfoz tankını dikkatle incele; kayaların çevresine de bak!",
      quiz: { q: "Orfoz gün boyu en çok nerede saklanır?",
              options: ["Su yüzeyinde", "Kumun altında", "Kaya oyuklarında"], answer: 2,
              clue: "Görevin adı 'Kaya Bekçisi'. Tanktaki kayalara dikkatle bak!" },
      fact: "Orfozlar dişi olarak doğar, büyüyünce bazıları erkeğe dönüşür! Kayalık diplerdeki oyuklarda saklanarak yaşarlar."
    },
    {
      id: "korfez", code: "KRF-7S1B", region: "izmit", art: "karagoz", color: "#11707a", light: "#4cc3c9",
      name: "Körfez Balıkları", title: "Evimizin Denizi",
      hint: "Uzak denizlerde değil, yaşadığımız şehrin kıyısındayım! Karagöz, mırmır ve sargosları Körfez akvaryumunda bul.",
      where: "Körfez akvaryumunun etrafına dikkatlice bak!",
      quiz: { q: "İzmit Körfezi'nin dibindeki kirli çamur neden temizleniyor?",
              options: ["Gemiler daha hızlı gitsin diye", "Deniz canlıları daha sağlıklı yaşasın diye", "Deniz daha soğuk olsun diye"], answer: 1,
              clue: "Temiz bir ev, içinde yaşayanlar için neden iyidir?" },
      factTitle: "Temiz Körfez",
      fact: "İzmit Körfezi'nin dibinden yaklaşık 160 bin kamyon dolusu kirli çamur çıkarıldı! Temiz bir deniz dibi, karagöz, mırmır ve sargos gibi körfez balıkları için daha sağlıklı bir ev demek."
    },
    {
      id: "kabuk", code: "KAB-6R9T", region: "kabuk", art: "kabuk", color: "#a0527a", light: "#f0a6c4",
      name: "Deniz Kabukları", title: "Spiral Hazine",
      hint: "Bazılarımız spiral, bazılarımız pürüzlü, bazılarımız ise çok ince. Bizi vitrinde bul!",
      where: "Deniz kabukları vitrinlerinin çevresine dikkatlice bak!",
      quiz: { q: "Deniz kabuğunu kim yapar?",
              options: ["Deniz dalgaları", "İçinde yaşayan canlı", "Balıklar"], answer: 1,
              clue: "Salyangoz evini sırtında taşır. O evi kim yapmış olabilir?" },
      fact: "Her deniz kabuğu, içinde yaşayan salyangoz ya da midye gibi yumuşak gövdeli bir canlının kendi ördüğü evidir. Canlı büyüdükçe kabuğu da büyür."
    },
    {
      id: "megalodon", code: "MGL-8W4K", region: "megalodon", art: "megalodon", color: "#3b2f2a", light: "#8c6e5c",
      name: "Megalodon", title: "Devin Ağzı",
      hint: "Kocaman dişleri olan dev bir köpekbalığının ağzını görüyorum! Onu bulabilir misin? İçinde fotoğraf çekilmeyi unutma.",
      where: "Megalodon sergisinin etrafına dikkatlice bak!",
      quiz: { q: "Megalodonun bir dişi ne kadar büyüktü?",
              options: ["Bir yetişkinin eli kadar", "Bir pirinç tanesi kadar", "Bir otobüs kadar"], answer: 0,
              clue: "Sergideki dişlere bak: bir pirinç tanesinden çok büyük, değil mi?" },
      fact: "Megalodon yaklaşık 3,6 milyon yıl önce yok oldu. Bugünkü büyük beyaz köpekbalığından çok daha büyüktü!"
    },
    {
      id: "vatoz", code: "VTZ-9K3A", region: "tunel", art: "vatoz", color: "#24508f", light: "#6aa3e0",
      name: "Vatoz", title: "Suyun Kanatlısı",
      hint: "Kanatlarım varmış gibi görünür ama ben bir balığım. Beni büyük tünelde bul!",
      where: "Büyük tünelde etrafına ve yukarıya bak; vatozu ara!",
      quiz: { q: "Vatozun kanat gibi görünen geniş kısımları aslında nedir?",
              options: ["Kanatları", "Göğüs yüzgeçleri", "Kuyruğu"], answer: 1,
              clue: "Vatoz bir kuş değil, bir balık. Balıkların yüzmek için neleri vardır?" },
      fact: "Vatozlar köpekbalıklarının akrabasıdır; onların da iskeleti kemik değil, esnek kıkırdaktır. Göğüs yüzgeçlerini dalgalandırarak süzülürler."
    }
  ]
};


// Kısa tanışma bilgileri ve yerinde gözlem yönlendirmesi.
const LESSONS = {
  "pirana": {
    "intro": [
      "Piranalar Güney Amerika’da yaşayan balıklardır.",
      "Keskin dişleriyle tanınırlar. Hepsi aynı büyüklükte değildir."
    ],
    "observe": "Tanktaki piranaları izle. Tek başlarına mı, birlikte mi yüzüyorlar?",
    "reward": "Piranalar sürü hâlinde yüzerek kendilerini koruyabilir.",
    "icons": [
      "💤",
      "🛡️",
      "🌡️"
    ]
  },
  "mersin": {
    "intro": [
      "Mersin balığının uzun bir gövdesi vardır.",
      "Ağzının yakınındaki küçük bıyıklar yiyecek bulmasına yardımcı olur."
    ],
    "observe": "Mersin balığının vücuduna dikkatle bak. Sert plakaları fark edebiliyor musun?",
    "reward": "Vücudundaki sert plakalar mersin balığını korur.",
    "icons": [
      "💨",
      "🎨",
      "🛡️"
    ]
  },
  "kesis": {
    "intro": [
      "Keşiş yengeci, boş bir deniz salyangozu kabuğunu ev olarak kullanır.",
      "Kabuğunu yanında taşıyarak dolaşır."
    ],
    "observe": "Sırtındaki kabuğa bak. Yengeç büyürse bu eve hâlâ sığabilir mi?",
    "reward": "Büyüyen keşiş yengeci, sığabileceği daha büyük bir kabuk arar.",
    "icons": [
      "📏",
      "🫧",
      "🎨"
    ]
  },
  "fosil": {
    "intro": [
      "Çok eski canlılar bazen taşların içinde iz bırakır.",
      "Bu izleri inceleyen bilim insanları geçmişi araştırır."
    ],
    "observe": "Afrika bölümündeki duvarların yukarısına bak. Fosillerde bir kabuk, canlı şekli veya iz fark edebiliyor musun?",
    "reward": "Fosiller, çok eski zamanlarda yaşamış canlıları tanımamıza yardım eder.",
    "icons": [
      "☁️",
      "🦕",
      "🌡️"
    ]
  },
  "orfoz": {
    "intro": [
      "Orfoz, iri gövdeli bir balıktır.",
      "Onu fark etmek için tankın farklı köşelerine dikkatle bak."
    ],
    "observe": "Orfozu bulmaya çalış. Tankın hangi bölümünde duruyor? Kayalara da bak.",
    "reward": "Orfozlar kaya oyuklarını saklanacak bir yer olarak kullanır.",
    "icons": [
      "🌊",
      "🏖️",
      "🪨"
    ]
  },
  "korfez": {
    "intro": [
      "İzmit Körfezi, yaşadığımız şehrin denizidir.",
      "Karagöz, mırmır ve sargos gibi balıklar bu denizde yaşar."
    ],
    "observe": "Körfez akvaryumundaki balıkları izle. Temiz bir deniz, onlar için neden önemli olabilir?",
    "reward": "Temiz bir deniz dibi, Körfez balıkları için daha sağlıklı bir yaşam alanıdır.",
    "icons": [
      "🚢",
      "🐟",
      "❄️"
    ]
  },
  "kabuk": {
    "intro": [
      "Deniz kabuklarının pek çok rengi ve şekli vardır.",
      "Bazıları spiral kıvrımlı, bazıları iki parçalıdır."
    ],
    "observe": "Vitrindeki kabuklara bak. Bu kabuklardan birinde nasıl bir canlı yaşamış olabilir?",
    "reward": "Deniz kabuğunu, içinde yaşayan yumuşak gövdeli canlı oluşturur.",
    "icons": [
      "🌊",
      "🐚",
      "🐟"
    ]
  },
  "megalodon": {
    "intro": [
      "Megalodon, çok eskiden yaşamış dev bir köpekbalığıydı.",
      "Bugün yaşayan bir megalodon yok. Onu fosillerinden tanıyoruz."
    ],
    "observe": "Sergideki dişlere bak. Kendi elinle karşılaştır: sence ne kadar büyükler?",
    "reward": "Megalodonun büyük dişleri bir yetişkinin eli kadar olabiliyordu.",
    "icons": [
      "✋",
      "🍚",
      "🚌"
    ]
  },
  "vatoz": {
    "intro": [
      "Vatozun vücudu geniş ve yassıdır.",
      "Köpekbalıklarıyla akrabadır. Ama görünüşleri çok farklıdır!"
    ],
    "observe": "Tüneldeki vatozu izle. Vücudunun iki yanındaki geniş kısımlar nasıl hareket ediyor?",
    "reward": "Kanat gibi görünen geniş kısımlar, vatozun göğüs yüzgeçleridir.",
    "icons": [
      "🪽",
      "🐟",
      "〰️"
    ]
  }
};
KASIF.stations.forEach(st => Object.assign(st, LESSONS[st.id]));

// Fiziksel gezi sırası netleşince yalnızca bu listeyi değiştirin.
// Kıtalar, Körfez ve özel bölümler ayrı kimliklerini korur; görevler kilitlenmez.
KASIF.regionOrder = ["guney-amerika", "asya", "avustralya", "afrika", "avrupa", "izmit", "kabuk", "megalodon", "tunel"];

// Tek kısa ipucu: bilgi ve yerinde gözlem aynı metinde.
const QUICK_TIPS = {
  "pirana": "Piranalar Güney Amerika’da yaşar. Bu bölümdeki pirana tankına bak: tek tek mi, birlikte mi yüzüyorlar?",
  "mersin": "Mersin balığının vücudunda sert plakalar vardır. Asya bölümündeki tankta bu plakaları dikkatle incele!",
  "kesis": "Keşiş yengeci boş bir kabuğu ev olarak kullanır. Avustralya bölümünde kabuğunu taşıyan bu küçük kaşifi ara!",
  "fosil": "Fosiller, çok eski canlıların izleridir. Afrika bölümünde başını kaldır; duvarların yukarısındaki şekilleri incele!",
  "orfoz": "Orfoz, iri gövdeli bir balıktır. Avrupa bölümündeki tankı incele; kayaların çevresinde onu bulabilir misin?",
  "korfez": "Karagöz, mırmır ve sargos bizim Körfez’imizde yaşar. Körfez akvaryumundaki balıkları izle: temiz bir deniz onlar için neden önemli?",
  "kabuk": "Deniz kabuklarının pek çok şekli vardır. Vitrindeki kıvrımlı ve iki parçalı kabukları incele; içlerinde kim yaşamış olabilir?",
  "megalodon": "Megalodon, çok eskiden yaşamış dev bir köpekbalığıydı. Sergideki dişlerini kendi elinle karşılaştır; ne kadar büyükler?",
  "vatoz": "Vatoz, geniş ve yassı gövdeli bir balıktır. Büyük tünelde yukarıya bak; kanat gibi görünen kısımlarının hareketini izle!"
};
KASIF.stations.forEach(st => st.tip = QUICK_TIPS[st.id]);
