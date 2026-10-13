(() => {
  const cars = window.CARS;

  // Seçenekler ve örnek fiyatlar (EUR)
  const COLORS = [
    { id: 'yellow', name: 'Racing Yellow', hex: '#f2b90c', price: 0 },
    { id: 'white', name: 'Carrara White', hex: '#e9e9e6', price: 0 },
    { id: 'black', name: 'Jet Black', hex: '#101012', price: 0 },
    { id: 'grey', name: 'Arctic Grey', hex: '#9aa1a6', price: 2400 },
    { id: 'blue', name: 'Shark Blue', hex: '#1f4aa8', price: 3500 },
    { id: 'red', name: 'Guards Red', hex: '#d5001c', price: 0 }
  ];
  const WHEELS = [
    { id: 'std', name: 'Standart jant', note: '20/21 inç', price: 0 },
    { id: 'forged', name: 'Dövme hafif jant', note: 'Daha az ağırlık', price: 4800 },
    { id: 'magnesium', name: 'Magnezyum jant', note: 'Pist için', price: 14000 }
  ];
  const EXTRAS = [
    { id: 'ceramic', name: 'Seramik fren', note: 'Yüksek fren dayanımı', price: 9500 },
    { id: 'carbon', name: 'Karbon iç mekân', note: 'Hafif ve spor', price: 6200 }
  ];

  const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const $ = id => document.getElementById(id);
  const form = $('po-form');

  const params = new URLSearchParams(location.search);
  const state = {
    model: cars.some(c => c.id === params.get('model')) ? params.get('model') : cars[0].id,
    color: COLORS[0].id,
    wheels: WHEELS[0].id,
    extras: new Set()
  };

  const carOf = id => cars.find(c => c.id === id);
  const colorOf = id => COLORS.find(c => c.id === id);
  const wheelOf = id => WHEELS.find(w => w.id === id);

  function optionHTML(name, type, item, checked) {
    const price = item.price ? '+' + money.format(item.price) : item.base ? money.format(item.base) : 'Dahil';
    return `
      <div class="po-option">
        <input type="${type}" name="${name}" id="${name}-${item.id}" value="${item.id}" ${checked ? 'checked' : ''}>
        <label for="${name}-${item.id}">
          <span class="po-opt-text"><strong>${item.name}</strong>${item.note ? `<small>${item.note}</small>` : ''}</span>
          <span class="po-opt-price">${price}</span>
        </label>
      </div>`;
  }

  function buildOptions() {
    $('opt-model').innerHTML = cars
      .map(c => optionHTML('model', 'radio', { id: c.id, name: c.name, note: c.tagline, base: c.price }, c.id === state.model))
      .join('');

    $('opt-color').innerHTML = COLORS.map(c => `
      <div class="po-swatch">
        <input type="radio" name="color" id="color-${c.id}" value="${c.id}" ${c.id === state.color ? 'checked' : ''}>
        <label for="color-${c.id}" title="${c.name}${c.price ? ' (+' + money.format(c.price) + ')' : ''}">
          <span class="po-swatch-dot" style="background:${c.hex}"></span>
          <span class="visually-hidden">${c.name}</span>
        </label>
      </div>`).join('');

    $('opt-wheels').innerHTML = WHEELS
      .map(w => optionHTML('wheels', 'radio', w, w.id === state.wheels))
      .join('');

    $('opt-extras').innerHTML = EXTRAS
      .map(x => optionHTML('extras', 'checkbox', x, state.extras.has(x.id)))
      .join('');
  }

  // Seçimlerden fiyat satırlarını ve toplamı çıkarır
  function lines() {
    const car = carOf(state.model);
    const color = colorOf(state.color);
    const wheel = wheelOf(state.wheels);
    const extras = EXTRAS.filter(x => state.extras.has(x.id));
    const rows = [
      ['Model', car.name, car.price],
      ['Renk', color.name, color.price],
      ['Jant', wheel.name, wheel.price],
      ...extras.map(x => ['Ekstra', x.name, x.price])
    ];
    const total = rows.reduce((sum, r) => sum + r[2], 0);
    return { rows, total, car, color };
  }

  // ---- 3D önizleme ----
  // Model yüklenene kadar fotoğraf görünür. Renk seçilince kaporta malzemesinin rengi değişir.
  let paintMaterial = null;
  let viewerReady = false;
  let loadToken = 0;   // hızlı model değiştirilirse eski yüklemenin sonucu yok sayılır

  function applyPaint() {
    if (!viewerReady || !paintMaterial) return;
    paintMaterial.pbrMetallicRoughness.setBaseColorFactor(colorOf(state.color).hex);
  }

  function loadViewer(car) {
    const token = ++loadToken;
    viewerReady = false;
    paintMaterial = null;
    const box = $('po-media');
    box.classList.remove('has-3d');
    box.querySelector('model-viewer')?.remove();
    if (!car.glb) return;

    // model-viewer modül olarak geliyor, tanımlanmasını beklemek gerekiyor
    customElements.whenDefined('model-viewer').then(() => {
      if (token !== loadToken) return;
      const mv = window.createCarViewer(car, 'po-viewer');
      box.appendChild(mv);
      mv.addEventListener('load', () => {
        if (token !== loadToken) return;
        paintMaterial = mv.model.materials.find(m => m.name === car.paint) || null;
        viewerReady = true;
        applyPaint();
        box.classList.add('has-3d');
      });
    });
  }

  function render() {
    const { rows, total, car, color } = lines();

    const img = $('po-img');
    img.src = car.image;
    img.alt = car.name;
    img.style.objectPosition = car.imagePosition || 'center';
    $('po-media').style.setProperty('--tint', color.hex);

    $('po-model').textContent = car.name;
    $('po-dot').style.background = color.hex;
    $('po-colorname').textContent = color.name;

    $('po-lines').innerHTML = rows
      .map(([label, value, price]) => `
        <dt>${label}</dt>
        <dd>${value}<small>${price ? (label === 'Model' ? money.format(price) : '+' + money.format(price)) : 'Dahil'}</small></dd>`)
      .join('');
    $('po-total').textContent = money.format(total);

    history.replaceState(null, '', `?model=${state.model}`);
  }

  form.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'model') {
      state.model = t.value;
      loadViewer(carOf(state.model));
    }
    if (t.name === 'color') {
      state.color = t.value;
      applyPaint();
    }
    if (t.name === 'wheels') state.wheels = t.value;
    if (t.name === 'extras') t.checked ? state.extras.add(t.value) : state.extras.delete(t.value);
    if (['model', 'color', 'wheels', 'extras'].includes(t.name)) render();
  });

  // Telefonda yazı yazarken klavye ekranın yarısını alıyor. Yapışkan önizleme de yer
  // kaplamasın diye yazı alanlarına odaklanınca serbest bırakıyoruz.
  const isTextField = el => el?.matches?.('input:not([type=radio]):not([type=checkbox]), textarea');
  form.addEventListener('focusin', e => {
    if (isTextField(e.target)) document.body.classList.add('po-typing');
  });
  form.addEventListener('focusout', e => {
    if (!isTextField(e.relatedTarget)) document.body.classList.remove('po-typing');
  });

  function fillSummary(pairs) {
    const list = $('done-lines');
    list.replaceChildren();
    pairs.forEach(([k, v]) => {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;      // kullanıcının yazdığı metin HTML olarak yorumlanmasın
      list.append(dt, dd);
    });
  }

  // Form hiçbir yere gönderilmez, sadece özet penceresi açılır.
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      form.querySelector('input:invalid, textarea:invalid')?.focus();
      return;
    }

    const { rows, total } = lines();
    $('done-ref').textContent = 'PRS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    fillSummary([
      ['Ad soyad', form.elements.name.value.trim()],
      ['Şehir', form.elements.city.value.trim()],
      ...rows.map(r => [r[0], r[1]]),
      ['Tahmini toplam', money.format(total)]
    ]);
    bootstrap.Modal.getOrCreateInstance($('doneModal')).show();
  });

  buildOptions();
  render();
  loadViewer(carOf(state.model));
})();
