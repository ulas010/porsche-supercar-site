// Araç verileri. Kartlar, tablo, detay penceresi ve ön sipariş buradan beslenir.
// Fiyatlar örnektir, gerçek liste fiyatı değil.
// glb: 3D model dosyası, paint: o modelde kaporta boyasının malzeme adı (renk seçimi için).

// 3D modelin açılış kamerası: önden hafif yandan, araba kutuya sığacak kadar uzakta.
window.CAR_ORBIT = '145deg 75deg 78%';

// Detay penceresi ve ön sipariş aynı ayarlarla bir <model-viewer> açar.
window.createCarViewer = (car, className) => {
  const mv = document.createElement('model-viewer');
  mv.className = className;
  const attrs = {
    src: car.glb,
    alt: `${car.name} 3D model`,
    'camera-controls': '',
    'auto-rotate': '',
    'auto-rotate-delay': '2500',
    'rotation-per-second': '14deg',
    'camera-orbit': window.CAR_ORBIT,
    'field-of-view': '30deg',
    'touch-action': 'pan-y',          // dikey kaydırma sayfaya, yatay sürükleme modele
    'environment-image': 'neutral',
    exposure: '1.15',
    'shadow-intensity': '1.2',
    'shadow-softness': '0.9',
    'interaction-prompt': 'none',
    'disable-pan': ''
  };
  Object.entries(attrs).forEach(([k, v]) => mv.setAttribute(k, v));
  return mv;
};

window.CARS = [
  {
    id: 'gt3rs',
    name: '911 GT3 RS',
    tagline: 'Pist için doğdu.',
    image: 'images/hero.webp',
    glb: 'models/gt3rs.glb',
    paint: 'New_Material',
    blurb: 'Atmosferik boxer motor, devasa kanat ve sürücüyü hiç yormayan bir şasi. GT3 RS, yol ruhsatlı bir yarış arabası olmaya en çok yaklaşan 911.',
    price: 245000,
    power: 525,
    accel: 3.2,
    top: 296,
    specs: [
      ['Motor', '4.0 L atmosferik boxer-6'],
      ['Tork', '465 Nm'],
      ['Şanzıman', '7 ileri PDK'],
      ['Çekiş', 'Arkadan itiş'],
      ['Ağırlık', '1.450 kg'],
      ['Yere basma kuvveti', '860 kg (285 km/s)']
    ]
  },
  {
    id: 'turbo-s',
    name: '911 Turbo S',
    tagline: 'Sessizce hızlı.',
    image: 'images/turbo-s.jpg',
    imagePosition: '25% center',        // yatay fotoğrafta öndeki kısmı göster
    glb: 'models/turbo-s.glb',
    paint: 'PorschePorsche_911TurboS992_2021RegionA1',
    blurb: 'Günlük kullanılabilen en hızlı 911. Dört tekerden çekiş ve çift turbo sayesinde hızlanması neredeyse ışınlanma gibi.',
    price: 262000,
    power: 650,
    accel: 2.7,
    top: 330,
    specs: [
      ['Motor', '3.8 L çift turbo boxer-6'],
      ['Tork', '800 Nm'],
      ['Şanzıman', '8 ileri PDK'],
      ['Çekiş', 'Dört tekerden çekiş'],
      ['Ağırlık', '1.640 kg'],
      ['Yakıt', 'Benzin']
    ]
  },
  {
    id: 'taycan',
    name: 'Taycan Turbo GT',
    tagline: 'Elektrikli geleceğin pisti.',
    image: 'images/taycan.jpg',
    glb: 'models/taycan.glb',
    paint: 'porschePorsche_TaycanTurboGTReward_2025Paint_Material1',
    blurb: 'Porsche\'nin en güçlü elektrikli arabası. Sessiz, ani ve rakipsiz ivmeli. Pist günleri için tasarlanmış bir elektrikli GT.',
    price: 235000,
    power: 1034,
    accel: 2.3,
    top: 305,
    specs: [
      ['Motor', 'Çift elektrik motoru'],
      ['Batarya', '105 kWh'],
      ['Şanzıman', 'Tek vitesli, 2 kademeli arka'],
      ['Çekiş', 'Dört tekerden çekiş'],
      ['Ağırlık', 'yaklaşık 2.290 kg'],
      ['Güç (overboost)', '1.034 PS']
    ]
  }
];
