// Eğitim metinlerinin tek kaynağı. QR kodlarını ve istasyon kimliklerini değiştirmeyin.
// Bölge, fiziksel akvaryum bölümünü gösterir; türün yalnızca o kıtada yaşadığı anlamına gelmez.
window.KASIF = {
  "aquarium": "Körfez Aqua",
  "season": "2026 Sonbahar",
  "regions": {
    "guney-amerika": {
      "label": "Güney Amerika",
      "kind": "kita"
    },
    "asya": {
      "label": "Asya",
      "kind": "kita"
    },
    "avustralya": {
      "label": "Avustralya",
      "kind": "kita"
    },
    "afrika": {
      "label": "Afrika",
      "kind": "kita"
    },
    "avrupa": {
      "label": "Avrupa",
      "kind": "kita"
    },
    "izmit": {
      "label": "İzmit Körfezi",
      "kind": "korfez"
    },
    "kabuk": {
      "label": "Kabuk Sergisi",
      "kind": "ozel"
    },
    "megalodon": {
      "label": "Megalodon",
      "kind": "ozel"
    },
    "tunel": {
      "label": "Büyük Tünel",
      "kind": "ozel"
    }
  },
  "groups": [
    {
      "kind": "kita",
      "label": "Kıtalar macerası",
      "short": "Kıtalar",
      "icon": "🌍"
    },
    {
      "kind": "korfez",
      "label": "Bizim körfez",
      "short": "Körfez",
      "icon": "⚓"
    },
    {
      "kind": "ozel",
      "label": "Özel bölgeler",
      "short": "Özel",
      "icon": "⭐"
    }
  ],
  "stations": [
    {
      "id": "pirana",
      "code": "PRN-3T9F",
      "region": "guney-amerika",
      "art": "pirana",
      "color": "#8a2a2a",
      "light": "#e0675a",
      "name": "Pirana",
      "title": "Amazon'un Dişlisi",
      "hint": "Keskin dişlerimle tanınırım. Güney Amerika bölümündeki tankımda beni bul!",
      "where": "Güney Amerika bölümündeki pirana tankını dikkatle incele!",
      "quiz": {
        "q": "Birlikte yüzmek piranaların ne yapmasına yardımcı olur?",
        "options": [
          "Uyumasına",
          "Tehlikelerden korunmasına",
          "Isınmasına"
        ],
        "answer": 1,
        "clue": "Bir tehlike olduğunda tek başına olmak mı, bir grupla birlikte olmak mı daha güvenli olabilir?"
      },
      "fact": "Piranalar da başka hayvanlara yem olabilir. Sürü hâlinde yüzmek, bir pirananın yakalanma riskini azaltabilir.",
      "reward": "Birlikte yüzmek, piranaların tehlikelerden korunmasına yardımcı olur.",
      "icons": [
        "💤",
        "🛡️",
        "🌡️"
      ],
      "tip": "Piranalar birlikte yüzerek korunabilir. Güney Amerika bölümünde onları izle: birbirlerine yakın mı yüzüyorlar?"
    },
    {
      "id": "mersin",
      "code": "MRS-4N7C",
      "region": "asya",
      "art": "mersin",
      "color": "#2b4a6b",
      "light": "#6f93b8",
      "name": "Mersin Balığı",
      "title": "Zırhlı Dev",
      "hint": "Vücudumda zırh gibi sert plakalar var. Asya bölümündeki tankta beni bul!",
      "where": "Asya bölümündeki mersin balığı tankını dikkatle incele!",
      "quiz": {
        "q": "Mersin balığının vücudundaki sert plakalar ne işe yarar?",
        "options": [
          "Daha hızlı yüzmeye",
          "Renk değiştirmeye",
          "Korunmaya"
        ],
        "answer": 2,
        "clue": "Bu sert plakaları bir zırh gibi düşün. Zırh ne işe yarar?"
      },
      "fact": "Mersin balığının sırtı ve yanları boyunca sert plakalar sıralanır. Bu plakalar, vücudunun korunmasına yardımcı olur.",
      "reward": "Zırh gibi sert plakalar, mersin balığının korunmasına yardımcı olur.",
      "icons": [
        "💨",
        "🎨",
        "🛡️"
      ],
      "tip": "Mersin balığının sert plakaları zırh gibidir. Asya bölümündeki tankta, sırtındaki ve yanlarındaki bu parçaları bul!"
    },
    {
      "id": "kesis",
      "code": "KSY-2P6L",
      "region": "avustralya",
      "art": "kesis",
      "color": "#b4532a",
      "light": "#f29a5e",
      "name": "Keşiş Yengeci",
      "title": "Evini Taşıyan",
      "hint": "Boş bir kabuğu ev olarak kullanırım. Büyüdükçe daha büyük bir kabuk ararım. Avustralya bölümünde beni bul!",
      "where": "Avustralya bölümündeki keşiş yengeci tankını dikkatle incele!",
      "quiz": {
        "q": "Keşiş yengeci büyüdükçe neden daha büyük bir kabuk arar?",
        "options": [
          "Eski kabuğuna sığamadığı için",
          "Kabuğu kirlendiği için",
          "Renk değiştirmek için"
        ],
        "answer": 0,
        "clue": "Ayakkabıların sana küçük gelince ne yaparsın?"
      },
      "fact": "Keşiş yengeci kabuğunu kendi yapmaz. Yumuşak karnını korumak için boş bir deniz salyangozu kabuğunu kullanır. Büyüdükçe daha büyük bir kabuk arar.",
      "reward": "Keşiş yengeci büyüyünce eski kabuğuna sığamaz ve daha büyük bir kabuk arar.",
      "icons": [
        "📏",
        "🫧",
        "🎨"
      ],
      "tip": "Keşiş yengeci, boş deniz salyangozu kabuğunu ev olarak kullanır. Avustralya bölümünde kabuğunu taşıyan bu küçük kaşifi ara!"
    },
    {
      "id": "fosil",
      "code": "FSL-8D3M",
      "region": "afrika",
      "art": "fosil",
      "color": "#7d5d34",
      "light": "#d2ad72",
      "name": "Fosiller",
      "title": "Geçmişin İzleri",
      "hint": "Afrika bölümünde başını kaldır! Duvarların yukarısındaki fosilleri bul.",
      "where": "Afrika bölümünde başını kaldır: duvarların yukarısındaki fosilleri ara!",
      "quiz": {
        "q": "Fosiller bize neyi tanımamızda yardımcı olur?",
        "options": [
          "Yarınki hava durumunu",
          "Çok eski zamanlarda yaşamış canlıları",
          "Denizin bugünkü sıcaklığını"
        ],
        "answer": 1,
        "clue": "Fosiller eski canlılardan kalan izler ve kalıntılardır. Bize geçmişi mi, geleceği mi anlatır?"
      },
      "fact": "Fosiller, çok eski canlıların korunmuş kalıntıları ve izleridir. Bir diş, kabuk veya ayak izi fosil olabilir. Bilim insanları fosilleri inceleyerek geçmişi araştırır.",
      "reward": "Fosiller, çok eski zamanlarda yaşamış canlıları tanımamıza yardım eder.",
      "icons": [
        "☁️",
        "🦕",
        "🌡️"
      ],
      "tip": "Fosiller, çok eski canlıların kalıntıları ve izleridir. Afrika bölümünde başını kaldır; duvarların yukarısındaki şekilleri incele!"
    },
    {
      "id": "orfoz",
      "code": "ORF-5G2H",
      "region": "avrupa",
      "art": "orfoz",
      "color": "#6b4a2e",
      "light": "#b98a5e",
      "name": "Orfoz",
      "title": "Kaya Bekçisi",
      "hint": "Kayaların çevresine dikkatle bak. Avrupa bölümündeki tankta beni bulabilir misin?",
      "where": "Avrupa bölümündeki orfoz tankını incele; kaya oyuklarına da bak!",
      "quiz": {
        "q": "Orfoz saklanmak için hangi yeri kullanabilir?",
        "options": [
          "Su yüzeyini",
          "Kumun altını",
          "Kaya oyuklarını"
        ],
        "answer": 2,
        "clue": "Görevin adı “Kaya Bekçisi”. Kayaların arasında saklanabileceği bir yer var mı?"
      },
      "fact": "Orfozlar kayalık alanlarda yaşar ve kaya oyuklarını saklanmak için kullanabilir. Tankta onu hemen göremezsen kayaların çevresini dikkatle incele.",
      "reward": "Kaya oyukları, orfozun saklanabileceği yerlerdir.",
      "icons": [
        "🌊",
        "🏖️",
        "🪨"
      ],
      "tip": "Orfozlar kaya oyuklarında saklanabilir. Avrupa bölümündeki tankta kayaların çevresine bak; orfozu bulabilir misin?"
    },
    {
      "id": "korfez",
      "code": "KRF-7S1B",
      "region": "izmit",
      "art": "karagoz",
      "color": "#11707a",
      "light": "#4cc3c9",
      "name": "Körfez Balıkları",
      "title": "Evimizin Denizi",
      "hint": "Karagöz, mırmır ve sargos, İzmit Körfezi’nde de yaşar. Körfez akvaryumunda bu balıkları bul!",
      "where": "Körfez akvaryumundaki balıkları dikkatle incele!",
      "quiz": {
        "q": "Denizi temiz tutmak balıklar için neden önemlidir?",
        "options": [
          "Gemiler daha hızlı gitsin diye",
          "Daha sağlıklı bir yaşam alanları olsun diye",
          "Deniz daha soğuk olsun diye"
        ],
        "answer": 1,
        "clue": "Balıkların evi denizdir. Temiz bir ev, içinde yaşayanlar için neden iyidir?"
      },
      "factTitle": "Temiz Körfez",
      "fact": "İzmit Körfezi pek çok deniz canlısının yaşam alanıdır. Çöpleri denize atmamak ve kıyıları temiz tutmak, onların evini korumaya yardımcı olur.",
      "reward": "Temiz bir deniz, balıklar için daha sağlıklı bir yaşam alanıdır.",
      "icons": [
        "🚢",
        "🐟",
        "❄️"
      ],
      "tip": "Karagöz, mırmır ve sargos İzmit Körfezi’nde de yaşar. Körfez akvaryumundaki balıkları izle; temiz bir deniz neden önemli?"
    },
    {
      "id": "kabuk",
      "code": "KAB-6R9T",
      "region": "kabuk",
      "art": "kabuk",
      "color": "#a0527a",
      "light": "#f0a6c4",
      "name": "Deniz Kabukları",
      "title": "Kabuk Hazinesi",
      "hint": "Kabuklarımız kıvrımlı ya da iki parçalı olabilir. Kabuk sergisindeki vitrinde bizi incele!",
      "where": "Kabuk sergisindeki vitrinleri dikkatle incele!",
      "quiz": {
        "q": "Deniz salyangozu ve midye kabuklarını kim oluşturur?",
        "options": [
          "Deniz dalgaları",
          "Salyangoz veya midyenin kendisi",
          "Keşiş yengeçleri"
        ],
        "answer": 1,
        "clue": "Keşiş yengeci boş bir kabuk bulur. Salyangoz ve midye ise kabuklarını kendileriyle birlikte büyütür."
      },
      "fact": "Deniz salyangozları ve midyeler kendi kabuklarını oluşturur. Canlı büyüdükçe kabuğuna yeni malzeme ekler. Keşiş yengeci ise başka bir canlının boş kabuğunu kullanır.",
      "reward": "Salyangoz kendi kabuğunu oluşturur. Keşiş yengeci ise boş kalmış bir kabuğu kullanır!",
      "icons": [
        "🌊",
        "🐚",
        "🦀"
      ],
      "tip": "Salyangoz ve midye kendi kabuklarını oluşturur. Kabuk sergisinde kıvrımlı ve iki parçalı kabukları bul!"
    },
    {
      "id": "megalodon",
      "code": "MGL-8W4K",
      "region": "megalodon",
      "art": "megalodon",
      "color": "#3b2f2a",
      "light": "#8c6e5c",
      "name": "Megalodon",
      "title": "Devin Ağzı",
      "hint": "Megalodonun kocaman çene modelini bul! Sergideki büyük dişleri dikkatle incele.",
      "where": "Megalodon sergisindeki çene modelini ve dişleri dikkatle incele!",
      "quiz": {
        "q": "Megalodonun büyük dişleri yaklaşık ne kadar olabiliyordu?",
        "options": [
          "Bir yetişkinin eli kadar",
          "Bir parmak ucu kadar",
          "Bir pirinç tanesi kadar"
        ],
        "answer": 0,
        "clue": "Sergideki büyük dişleri düşün. Bir parmak ucuna mı, bir yetişkinin eline mi daha yakın büyüklükteler?"
      },
      "fact": "Megalodonun büyük dişleri yaklaşık 18 santimetreye ulaşabiliyordu. Bugün yaşayan bir megalodon yok; onu fosillerinden tanıyoruz.",
      "reward": "Megalodonun büyük dişleri, yaklaşık bir yetişkinin eli kadar olabiliyordu.",
      "icons": [
        "✋",
        "☝️",
        "🍚"
      ],
      "tip": "Megalodon, eskiden yaşamış dev bir köpekbalığıydı. Sergideki çene modelinin dişlerini, dokunmadan elinle karşılaştır!"
    },
    {
      "id": "vatoz",
      "code": "VTZ-9K3A",
      "region": "tunel",
      "art": "vatoz",
      "color": "#24508f",
      "light": "#6aa3e0",
      "name": "Vatoz",
      "title": "Suyun Kanatlısı",
      "hint": "Kanatlarım varmış gibi görünür ama ben bir balığım. Beni büyük tünelde bul!",
      "where": "Büyük tünelde etrafına ve yukarıya bak; vatozu ara!",
      "quiz": {
        "q": "Vatozun kanat gibi görünen geniş kısımları aslında nedir?",
        "options": [
          "Kanatları",
          "Yüzgeçleri",
          "Kuyruğu"
        ],
        "answer": 1,
        "clue": "Vatoz bir kuş değil, bir balık. Balıkların yüzmek için neleri vardır?"
      },
      "fact": "Vatozun kanat gibi görünen geniş kısımları göğüs yüzgeçleridir. Vatozlar köpekbalıklarıyla akrabadır; iskeletleri kemik yerine esnek kıkırdaktan oluşur.",
      "reward": "Kanat gibi görünen bu geniş kısımlara göğüs yüzgeçleri denir.",
      "icons": [
        "🪽",
        "🐟",
        "〰️"
      ],
      "tip": "Vatoz, yassı gövdeli bir balıktır. Büyük tünelde etrafına ve yukarıya bak; kanat gibi görünen kısımlarını izle!"
    }
  ],
  "regionOrder": [
    "guney-amerika",
    "asya",
    "avustralya",
    "afrika",
    "avrupa",
    "izmit",
    "kabuk",
    "megalodon",
    "tunel"
  ]
};
