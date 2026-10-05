// ===== Görev / istasyon verisi =====
// Yeni istasyon eklemek için bu listeye bir satır ekleyin ve sw.js içindeki VERSION'ı artırın.
// code: QR içine yazılan gizli kod (benzersiz olmalı). quiz: null ise soru sorulmadan rozet verilir
// (ör. dokunmatik ekran ya da greenbox görevi bitince ekranda gösterilen QR).
window.KASIF = {
  aquarium: "Körfez Aqua",
  season: "2026 Sonbahar",
  stations: [
    {
      id: "kaplumbaga", code: "KPL-7Q2M", emoji: "🐢", color: "#3aa76d",
      title: "Kaplumbağayı Bul", hint: "Yeşil kabuklu yüzücüyü büyük havuzda ara.",
      quiz: { q: "Deniz kaplumbağaları nefes almak için ne yapar?",
              options: ["Solungaçla suda nefes alır", "Su yüzeyine çıkar", "Hiç nefes almaz"], answer: 1 },
      fact: "Deniz kaplumbağaları akciğerle nefes alır. Uyurken nefeslerini saatlerce tutabilirler!"
    },
    {
      id: "kopekbaligi", code: "KBK-3H8T", emoji: "🦈", color: "#3b6fb6",
      title: "Köpekbalığını İzle", hint: "Tünelin üstünden geçen gölgeye dikkat!",
      quiz: { q: "Köpekbalığının iskeleti neyden yapılmıştır?",
              options: ["Kemik", "Kıkırdak", "Kabuk"], answer: 1 },
      fact: "Köpekbalığının iskeleti, kulağındaki gibi esnek kıkırdaktan yapılmıştır. Bu yüzden çok hafiftir."
    },
    {
      id: "palyaco", code: "PLY-5K1R", emoji: "🐠", color: "#f08a24",
      title: "En Küçük Balığı Bul", hint: "Turuncu-beyaz çizgili minik balık, dokunaçların arasında saklanıyor.",
      quiz: { q: "Palyaço balığı hangi canlının arasında saklanır?",
              options: ["Deniz şakayığı (anemon)", "Deniz yıldızı", "Yengeç"], answer: 0 },
      fact: "Palyaço balığının üstündeki özel mukus, onu anemonun yakıcı dokunaçlarından korur."
    },
    {
      id: "ahtapot", code: "AHT-9B4W", emoji: "🐙", color: "#a04bb5",
      title: "Ahtapotun Rengini Öğren", hint: "Kayaların arasına dikkatli bak, renk değiştiriyor olabilir!",
      quiz: { q: "Ahtapotun kaç kalbi vardır?",
              options: ["1", "2", "3"], answer: 2 },
      fact: "Ahtapotun 3 kalbi ve mavi kanı vardır. Derisindeki hücrelerle saniyeler içinde renk değiştirir."
    },
    {
      id: "ekran", code: "EKR-2P6Z", emoji: "🎮", color: "#1f8fa8",
      title: "İnteraktif Ekranda Balıkları Yönlendir", hint: "Dokunmatik ekranda oyunu bitir, çıkan QR'ı okut.",
      quiz: null,
      fact: "Harika oynadın! Balık sürüleri birlikte yüzerek kendilerini avcılardan korur."
    },
    {
      id: "greenbox", code: "GRN-8D3V", emoji: "📸", color: "#2e9e4f",
      title: "Green Box'ta Fotoğraf Çek", hint: "Fotoğrafını çektir, ekrandaki QR'ı okut.",
      quiz: null,
      fact: "Artık bir okyanus fotoğrafın var! Hatıranı aileni göster."
    },
    {
      id: "balina", code: "BLN-4X7C", emoji: "🐋", color: "#2d5f9a",
      title: "Balina Videosunu İzle", hint: "Büyük ekranın önüne otur ve videoyu izle.",
      quiz: { q: "Mavi balina neyle ünlüdür?",
              options: ["Dünyanın en hızlı balığı", "Dünyanın en büyük hayvanı", "Karada da yaşayabilmesi"], answer: 1 },
      fact: "Mavi balina dünyada yaşamış en büyük hayvandır. Kalbi küçük bir araba kadar büyüktür!"
    }
  ]
};
