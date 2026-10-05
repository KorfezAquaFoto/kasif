// ===== Görev / istasyon verisi =====
// Yeni görev eklemek için listeye bir satır ekleyin ve sw.js içindeki VERSION'ı artırın.
// code : QR içine yazılan gizli kod (benzersiz olmalı)
// name : canlının adı      title: görevin adı      hint: kilitliyken görünen ipucu
// quiz : null ise soru sorulmadan damga verilir
// art  : art.js içindeki çizimin adı   color/light: damga renkleri
window.KASIF = {
  aquarium: "Körfez Aqua",
  season: "2026 Sonbahar",
  stations: [
    {
      id: "kopekbaligi", code: "KBK-3H8T", art: "kopekbaligi", color: "#1f5fa8", light: "#5fa3e6",
      name: "Köpekbalığı", title: "Dişli Muhafız",
      hint: "Tünelin üstünden süzülen büyük gölgeyi takip et.",
      quiz: { q: "Köpekbalığının iskeleti neyden yapılmıştır?",
              options: ["Kemik", "Kıkırdak", "Kabuk"], answer: 1 },
      fact: "Köpekbalığının iskeleti, kulağındaki gibi esnek kıkırdaktan yapılmıştır. Bu yüzden çok hafif ve çeviktir."
    },
    {
      id: "palyaco", code: "PLY-5K1R", art: "palyaco", color: "#0f8a8f", light: "#4fd1c5",
      name: "Palyaço Balığı", title: "Minik Saklambaç",
      hint: "Turuncu-beyaz çizgili minik balık, dokunaçların arasında saklanıyor.",
      quiz: { q: "Palyaço balığı hangi canlının arasında saklanır?",
              options: ["Deniz şakayığı (anemon)", "Deniz yıldızı", "Yengeç"], answer: 0 },
      fact: "Palyaço balığının üstündeki özel mukus, onu anemonun yakıcı dokunaçlarından korur."
    },
    {
      id: "ahtapot", code: "AHT-9B4W", art: "ahtapot", color: "#4b2a7a", light: "#8e63d1",
      name: "Ahtapot", title: "Renk Büyücüsü",
      hint: "Kayaların arasına dikkatli bak, renk değiştiriyor olabilir!",
      quiz: { q: "Ahtapotun kaç kalbi vardır?",
              options: ["1", "2", "3"], answer: 2 },
      fact: "Ahtapotun 3 kalbi ve mavi kanı vardır. Derisindeki hücrelerle saniyeler içinde renk değiştirir."
    },
    {
      id: "muren", code: "MRN-6J2Q", art: "muren", color: "#2f5d3a", light: "#6fae6a",
      name: "Müren", title: "İki Çeneli Avcı",
      hint: "Kayaların arasındaki deliklere bak, biri seni izliyor olabilir!",
      quiz: { q: "Mürenin ağzında kaç çene vardır?",
              options: ["1", "2", "4"], answer: 1 },
      fact: "Mürenin boğazında ikinci bir çene var! Avını yakalayınca bu çene öne fırlar. Ağzını sürekli açıp kapatması ise saldırı değil, böyle nefes alıyor."
    },
    {
      id: "pirana", code: "PRN-3T9F", art: "pirana", color: "#8a2a2a", light: "#e0675a",
      name: "Pirana", title: "Amazon'un Dişlisi",
      hint: "Güney Amerika nehirlerinden gelen kırmızı karınlı balıkları bul.",
      quiz: { q: "Piranalar hangi kıtanın nehirlerinde yaşar?",
              options: ["Afrika", "Güney Amerika", "Avrupa"], answer: 1 },
      fact: "Piranalar sanıldığı kadar korkunç değildir. Çoğu aslında ürkektir ve kendini korumak için sürü halinde yüzer."
    },
    {
      id: "mercan", code: "MRC-7L5D", art: "mercan", color: "#0b6e8a", light: "#38b6d8",
      name: "Mercan", title: "Hayvan mı Bitki mi?",
      hint: "Rengarenk, dallı 'kayalara' yakından bak.",
      quiz: { q: "Mercan aslında nedir?",
              options: ["Bir bitki", "Bir taş", "Bir hayvan"], answer: 2 },
      fact: "Mercanlar, polip denen minicik hayvanlardan oluşur. Mercan resifleri denizdeki canlıların yaklaşık dörtte birine ev sahipliği yapar!"
    },
    {
      id: "megalodon", code: "MGL-8W4K", art: "megalodon", color: "#3b2f2a", light: "#8c6e5c",
      name: "Megalodon", title: "Devin Ağzı",
      hint: "Akvaryumdaki dev çeneyi bul. İçinde fotoğraf çekilmeyi unutma!",
      quiz: { q: "Megalodon bugün yaşıyor mu?",
              options: ["Evet, derin denizlerde", "Hayır, nesli milyonlarca yıl önce tükendi", "Sadece geceleri ortaya çıkar"], answer: 1 },
      fact: "Megalodon yaklaşık 3,6 milyon yıl önce yok oldu. Dişleri bir yetişkinin eli kadar büyüktü!"
    }
  ]
};
