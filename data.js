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
      where: "Pirana tankının yanında",
      quiz: { q: "Piranalar neden sürü hâlinde yüzer?",
              options: ["Uyumak için", "Korunmak için", "Isınmak için"], answer: 1,
              clue: "Tanktaki piranalara bak: tek tek mi, hep birlikte mi yüzüyorlar?" },
      fact: "Piranalar sanıldığı kadar korkunç değildir. Çoğu ürkektir ve kendini korumak için sürü hâlinde yüzer. Akrabası pacu'nun dişleri ise insan dişine benzer!"
    },
    {
      id: "mersin", code: "MRS-4N7C", region: "asya", art: "mersin", color: "#2b4a6b", light: "#6f93b8",
      name: "Mersin Balığı", title: "Zırhlı Dev",
      hint: "Vücudumda zırh gibi sert plakalar taşırım. Çok uzun zamandır yaşıyorum. Asya bölümüne bak.",
      where: "Mersin balığı tankının yanında",
      quiz: { q: "Mersin balığının vücudundaki sert plakalar ne işe yarar?",
              options: ["Daha hızlı yüzmeye", "Renk değiştirmeye", "Korunmaya"], answer: 2,
              clue: "Bu plakalar bir şövalyenin zırhına benziyor. Zırh ne işe yarar?" },
      fact: "Mersin balıklarının ataları dinozorlar zamanında da yaşıyordu! Bugün ise çok avlandıkları için türlerinin çoğunun nesli tehlikede."
    },
    {
      id: "kesis", code: "KSY-2P6L", region: "avustralya", art: "kesis", color: "#b4532a", light: "#f29a5e",
      name: "Keşiş Yengeci", title: "Evini Taşıyan",
      hint: "Evimi sırtımda taşırım. Büyüdükçe yeni bir eve ihtiyacım olur. Avustralya bölümüne bak.",
      where: "Keşiş yengeci tankının yanında",
      quiz: { q: "Keşiş yengeci neden yeni bir kabuğa taşınır?",
              options: ["Büyüdüğü için", "Kabuğu kirlendiği için", "Renk değiştirmek için"], answer: 0,
              clue: "Ayakkabıların sana küçük gelince ne yaparsın?" },
      fact: "Keşiş yengecinin karnı yumuşaktır. Kendini korumak için boş deniz salyangozu kabuklarını ev olarak kullanır, büyüdükçe daha büyüğünü arar."
    },
    {
      id: "fosil", code: "FSL-8D3M", region: "afrika", art: "fosil", color: "#7d5d34", light: "#d2ad72",
      name: "Fosiller", title: "Taşlaşmış Sır",
      hint: "Çok eski zamanlarda yaşayan canlıların izleri burada saklı! Afrika bölümünde taşa dönüşmüş şekilleri ara.",
      where: "Fosil sergi alanında",
      quiz: { q: "Fosiller bize en çok ne anlatır?",
              options: ["Yarın havanın nasıl olacağını", "Çok eski zamanlarda yaşamış canlıları", "Denizin bugünkü sıcaklığını"], answer: 1,
              clue: "Fosiller milyonlarca yıl önceden kalma. Geçmişi mi anlatır, geleceği mi?" },
      fact: "Fosiller, milyonlarca yıl önce yaşamış canlıların taşa dönüşmüş kalıntıları ve izleridir. Bilim insanları onlara bakarak geçmişi öğrenir."
    },
    {
      id: "orfoz", code: "ORF-5G2H", region: "avrupa", art: "orfoz", color: "#6b4a2e", light: "#b98a5e",
      name: "Orfoz", title: "Kaya Bekçisi",
      hint: "Kayalık alanlarda saklanırım. Beni fark etmek için dikkatli bakmalısın. Avrupa bölümüne bak.",
      where: "Orfoz tankının yanında",
      quiz: { q: "Orfoz gün boyu en çok nerede saklanır?",
              options: ["Su yüzeyinde", "Kumun altında", "Kaya oyuklarında"], answer: 2,
              clue: "Görevin adı 'Kaya Bekçisi'. Tanktaki kayalara dikkatle bak!" },
      fact: "Orfozlar dişi olarak doğar, büyüyünce bazıları erkeğe dönüşür! Kayalık diplerdeki oyuklarda saklanarak yaşarlar."
    },
    {
      id: "korfez", code: "KRF-7S1B", region: "izmit", art: "karagoz", color: "#11707a", light: "#4cc3c9",
      name: "Körfez Balıkları", title: "Evimizin Denizi",
      hint: "Uzak denizlerde değil, yaşadığımız şehrin kıyısındayım! Karagöz, mırmır ve sargosları Körfez akvaryumunda bul.",
      where: "Körfez akvaryumunun yanında",
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
      where: "Deniz kabukları sergisinin yanında",
      quiz: { q: "Deniz kabuğunu kim yapar?",
              options: ["Deniz dalgaları", "İçinde yaşayan canlı", "Balıklar"], answer: 1,
              clue: "Salyangoz evini sırtında taşır. O evi kim yapmış olabilir?" },
      fact: "Her deniz kabuğu, içinde yaşayan salyangoz ya da midye gibi yumuşak gövdeli bir canlının kendi ördüğü evidir. Canlı büyüdükçe kabuğu da büyür."
    },
    {
      id: "megalodon", code: "MGL-8W4K", region: "megalodon", art: "megalodon", color: "#3b2f2a", light: "#8c6e5c",
      name: "Megalodon", title: "Devin Ağzı",
      hint: "Kocaman dişleri olan dev bir köpekbalığının ağzını görüyorum! Onu bulabilir misin? İçinde fotoğraf çekilmeyi unutma.",
      where: "Megalodon sergisinin yanında",
      quiz: { q: "Megalodonun bir dişi ne kadar büyüktü?",
              options: ["Bir yetişkinin eli kadar", "Bir pirinç tanesi kadar", "Bir otobüs kadar"], answer: 0,
              clue: "Sergideki dişlere bak: bir pirinç tanesinden çok büyük, değil mi?" },
      fact: "Megalodon yaklaşık 3,6 milyon yıl önce yok oldu. Bugünkü büyük beyaz köpekbalığından çok daha büyüktü!"
    },
    {
      id: "vatoz", code: "VTZ-9K3A", region: "tunel", art: "vatoz", color: "#24508f", light: "#6aa3e0",
      name: "Vatoz", title: "Suyun Kanatlısı",
      hint: "Kanatlarım varmış gibi görünür ama ben bir balığım. Beni büyük tünelde bul!",
      where: "Büyük tünel bölgesinde",
      quiz: { q: "Vatozun kanat gibi görünen geniş kısımları aslında nedir?",
              options: ["Kanatları", "Göğüs yüzgeçleri", "Kuyruğu"], answer: 1,
              clue: "Vatoz bir kuş değil, bir balık. Balıkların yüzmek için neleri vardır?" },
      fact: "Vatozlar köpekbalıklarının akrabasıdır; onların da iskeleti kemik değil, esnek kıkırdaktır. Göğüs yüzgeçlerini dalgalandırarak süzülürler."
    }
  ]
};
