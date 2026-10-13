(() => {
  const cars = window.CARS;
  const grid = document.getElementById('car-grid');
  const tableBody = document.getElementById('compare-body');
  const modalEl = document.getElementById('carModal');
  const viewerBox = document.getElementById('carViewer');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  const fmt = n => n.toLocaleString('tr-TR');
  const fmtDec = n => n.toString().replace('.', ',');

  const photoOf = car =>
    `<img class="viewer-photo" src="${car.image}" alt="${car.name}" style="object-position: ${car.imagePosition || 'center'}">`;

  function cardHTML(car) {
    return `
      <div class="col-md-6 col-lg-4">
        <article class="car-card h-100">
          <div class="car-media">
            <img src="${car.image}" alt="${car.name}" loading="lazy" style="object-position: ${car.imagePosition || 'center'}" onerror="this.remove()">
            <span class="car-media-name">${car.name}</span>
          </div>
          <div class="car-body">
            <h2 class="car-name">${car.name}</h2>
            <p class="car-tagline">${car.tagline}</p>
            <ul class="car-stats">
              <li><strong>${fmt(car.power)}</strong><span>PS</span></li>
              <li><strong>${fmtDec(car.accel)}</strong><span>0-100 sn</span></li>
              <li><strong>${car.top}</strong><span>km/s</span></li>
            </ul>
            <button class="btn btn-outline-light rounded-pill w-100" data-car="${car.id}">İncele</button>
          </div>
        </article>
      </div>`;
  }

  // data-label: telefonda tablo dikey açılınca hücrenin hangi araca ait olduğunu gösterir
  function barCell(car, value, max, label) {
    const pct = Math.round((value / max) * 100);
    return `<td data-label="${car.name}"><div class="cmp-bar"><span style="width:${pct}%"></span></div>${label}</td>`;
  }

  function renderTable() {
    const maxPower = Math.max(...cars.map(c => c.power));
    const maxTop = Math.max(...cars.map(c => c.top));
    const minAccel = Math.min(...cars.map(c => c.accel));
    // 0-100'de düşük süre iyi olduğu için çubuk ters hesaplanıyor
    const rows = [
      ['Güç', c => barCell(c, c.power, maxPower, `${fmt(c.power)} PS`)],
      ['0-100 km/s', c => barCell(c, minAccel, c.accel, `${fmtDec(c.accel)} sn`)],
      ['Azami hız', c => barCell(c, c.top, maxTop, `${c.top} km/s`)]
    ];
    tableBody.innerHTML = rows
      .map(([label, cell]) => `<tr><th scope="row">${label}</th>${cars.map(cell).join('')}</tr>`)
      .join('');
  }

  function openCar(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    document.getElementById('carModalTitle').textContent = car.name;
    document.getElementById('carBlurb').textContent = car.blurb;
    document.getElementById('carSpecs').innerHTML = car.specs
      .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
      .join('');
    document.getElementById('carOrder').href = `preorder.html?model=${car.id}`;

    // model gelene kadar fotoğraf durur
    viewerBox.innerHTML = photoOf(car);
    if (car.glb) {
      const mv = window.createCarViewer(car, '');
      mv.addEventListener('load', () => viewerBox.querySelector('.viewer-photo')?.remove());
      viewerBox.appendChild(mv);
    } else {
      viewerBox.insertAdjacentHTML('beforeend', '<span class="viewer-badge">3D model yakında</span>');
    }
    modal.show();
  }

  // pencere kapanınca model arka planda çalışmasın
  modalEl.addEventListener('hidden.bs.modal', () => { viewerBox.innerHTML = ''; });

  grid.innerHTML = cars.map(cardHTML).join('');
  renderTable();

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-car]');
    if (btn) openCar(btn.dataset.car);
  });
})();
