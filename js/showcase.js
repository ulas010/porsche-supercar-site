(() => {
  const section = document.getElementById('showcase');
  const viewer = document.getElementById('car-viewer');
  const loader = document.getElementById('car-loader');
  const loaderText = document.getElementById('car-loader-text');
  const loaderBar = document.getElementById('car-loader-bar');
  const retryBtn = document.getElementById('car-retry');
  const note = document.getElementById('car-note');
  const panels = [...section.querySelectorAll('.panel')];

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);

  const TAN_HALF_FOV = Math.tan((30 * Math.PI) / 360);   // görüş açısı 30°
  const FRONT_THETA = Math.PI;   // kamera bu açıdayken arabanın önünü görür
  const SMOOTHING = 0.16;        // büyüdükçe kamera kaydırmayı daha çabuk yakalar

  // Model yüklenince gerçek ölçüleriyle değişir; o zamana kadar tahmini değerler
  let dims = { x: 8, y: 5.3, z: 18 };   // genişlik, yükseklik, uzunluk
  let center = { x: 0, y: 0, z: 0 };

  // Kaydırma oranına (0-1) göre kameranın yönü, yüksekliği ve uzaklığı
  const path = p => ({
    theta: FRONT_THETA - 0.7 + p * Math.PI * 2.1,
    elevation: lerp(1.1, 0.14, ease(clamp(p * 1.5, 0, 1))),
    zoom: lerp(1.1, 1, ease(clamp(p * 2, 0, 1)))
  });

  // Arabayı ekrana sığdıran kamera mesafesi. Araba önden dar, yandan uzun göründüğü için açıya göre değişir.
  function fitRadius(theta, e) {
    const aspect = window.innerWidth / window.innerHeight;
    const marginW = 1.1;   // yatayda sıkı: arkadaki dev rakam zaten arabayı çevreliyor
    const marginH = 1.35;
    const sinT = Math.abs(Math.sin(theta));
    const cosT = Math.abs(Math.cos(theta));

    const screenW = dims.z * sinT + dims.x * cosT;   // ekranda kapladığı genişlik
    const depth = dims.z * cosT + dims.x * sinT;     // kameradan uzaklaşan boyu
    const screenH = dims.y * Math.cos(e) + depth * Math.sin(e);

    const byWidth = (screenW * marginW) / (2 * TAN_HALF_FOV * aspect);
    const byHeight = (screenH * marginH) / (2 * TAN_HALF_FOV);
    const sideWidth = (dims.z * marginW) / (2 * TAN_HALF_FOV * aspect);

    // tam önden ya da arkadan bakarken çok yaklaşmasın
    return Math.max(byWidth, byHeight, sideWidth * 0.7);
  }

  // CSS'teki "yazı altta" düzeninin media query'siyle aynı koşul olmalı
  const bottomCards = () => window.innerWidth / window.innerHeight < 1.55;

  let ready = false;
  let ticking = false;
  let scrollP = 0;
  let currentP = 0;
  let lastP = -1;

  function sectionProgress() {
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    return clamp(-rect.top / total, 0, 1);
  }

  function placeCamera(p) {
    if (!ready) return;
    const { theta, elevation, zoom } = path(p);
    const r = fitRadius(theta, elevation) * zoom;

    // Arabayı biraz yukarı kaydırıyoruz ki alttaki yazıya yer kalsın
    const shift = 2 * TAN_HALF_FOV * r * (bottomCards() ? 0.2 : 0.09);

    viewer.cameraTarget = `${center.x}m ${center.y - shift}m ${center.z}m`;
    viewer.cameraOrbit = `${theta}rad ${Math.PI / 2 - elevation}rad ${r}m`;
    viewer.jumpCameraToGoal();
  }

  function updatePanels(p) {
    panels.forEach(panel => {
      const start = parseFloat(panel.dataset.start);
      const end = parseFloat(panel.dataset.end);
      panel.classList.toggle('is-active', p >= start && p <= end);
    });
  }

  function tick() {
    currentP += (scrollP - currentP) * SMOOTHING;
    if (Math.abs(scrollP - currentP) < 0.0004) currentP = scrollP;
    if (currentP !== lastP) {
      placeCamera(currentP);
      updatePanels(currentP);
      section.style.setProperty('--p', currentP.toFixed(4));
      lastP = currentP;
    }
    requestAnimationFrame(tick);
  }

  function startTick() {
    if (ticking) return;
    ticking = true;
    scrollP = sectionProgress();
    currentP = scrollP;
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', () => { scrollP = sectionProgress(); }, { passive: true });
  window.addEventListener('resize', () => { lastP = -1; });

  // Model gelene kadar fotoğraf görünür
  section.classList.add('is-fallback');

  // WebGL yoksa (eski ekran kartı sürücüsü, kapalı donanım hızlandırma) 3D hiç açılmaz.
  // Bekletmeden fotoğrafla devam ediyoruz.
  const hasWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  })();
  if (!hasWebGL) {
    loader.hidden = true;
    note.hidden = false;
    startTick();
    return;
  }

  viewer.addEventListener('progress', e => {
    const pct = Math.round(e.detail.totalProgress * 100);
    loaderBar.style.width = `${pct}%`;
    if (pct < 100) {
      loaderText.textContent = `3D model yükleniyor %${pct}`;
    } else {
      // dosya indi, ekran kartı modeli hazırlıyor
      loaderText.textContent = '3D model hazırlanıyor...';
      loader.classList.add('is-preparing');
    }
  });

  viewer.addEventListener('load', () => {
    const d = viewer.getDimensions();
    const c = viewer.getBoundingBoxCenter();
    dims = { x: d.x, y: d.y, z: d.z };
    center = { x: c.x, y: c.y, z: c.z };
    ready = true;
    lastP = -1;
    scrollP = sectionProgress();
    currentP = scrollP;
    placeCamera(currentP);
    retryBtn.hidden = true;
    loader.hidden = true;
    section.classList.remove('is-fallback');
    section.classList.add('is-ready');
    startTick();
  });

  // Model okunamazsa fotoğraf kalır, bilgi kartları yine çalışır
  viewer.addEventListener('error', e => {
    if (e.detail?.sourceError) console.error('3D model hatası:', e.detail.sourceError);
    ready = false;
    retryBtn.textContent = '3D model yüklenemedi. Yeniden dene';
    loader.hidden = true;
    retryBtn.hidden = false;
    section.classList.remove('is-ready');
    section.classList.add('is-fallback');
    startTick();
  });

  retryBtn.addEventListener('click', () => {
    const src = viewer.getAttribute('src');
    retryBtn.hidden = true;
    loader.hidden = false;
    loader.classList.remove('is-preparing');
    loaderBar.style.width = '0%';
    loaderText.textContent = '3D model yükleniyor...';
    viewer.removeAttribute('src');
    requestAnimationFrame(() => viewer.setAttribute('src', src));
  });

  if (!customElements.get('model-viewer')) {
    // model-viewer betiği hiç yüklenmediyse 8 saniye sonra vazgeç
    setTimeout(() => {
      if (!customElements.get('model-viewer')) viewer.dispatchEvent(new Event('error'));
    }, 8000);
  }
})();
