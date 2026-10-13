# Porsche süper spor sitesi

911 GT3 RS, 911 Turbo S ve Taycan Turbo GT için hazırlanmış bir hayran/portföy projesi. Porsche AG ile bağlantısı yoktur. Fiyatlar örnektir, gerçek liste fiyatı değildir.

Düz HTML, CSS ve JavaScript. Derleme adımı yok, bir sunucuyla açmak yeterli.

## Sayfalar
- **Ana sayfa** (`index.html`): sayfa kaydırıldıkça GT3 RS'in etrafında dönen 3D sahne.
- **Modeller** (`models.html`): üç araç, karşılaştırma tablosu ve "İncele" penceresinde sürükleyerek çevrilen 3D model.
- **Ön sipariş** (`preorder.html`): model, renk, jant ve ekstra seçimi. Seçilen renk 3D modele yansır, fiyat anlık hesaplanır. Form hiçbir yere veri göndermez, sadece özet gösterir.

## Çalıştırma
Dosyaya çift tıklayarak açmak yetmez, tarayıcılar yerel 3D dosyasını engeller. Şunlardan biri:

- VS Code'da `index.html` üzerinde sağ tık → **Open with Live Server**
- Ya da proje klasöründe: `python -m http.server 8000` ve tarayıcıda `http://localhost:8000`

3D için tarayıcıda WebGL açık olmalı. Kapalıysa site fotoğrafa düşer.

## Yapı
- `js/cars.js`: araç verisi tek yerde. Araç eklemek ya da bir değeri düzeltmek için burası yeter.
- `js/showcase.js`: ana sayfadaki kaydırmalı kamera hareketi.
- `js/models.js`, `js/preorder.js`: Modeller ve Ön sipariş sayfaları.
- `models/`: 3D modeller (`.glb`). `js/vendor/`: Google `model-viewer` 3.5.0.
- Bootstrap 5.3.3 ve Google Fonts (Barlow) internetten yüklenir.

## Krediler
- **3D modeller**, Ddiaz Design, Sketchfab, [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): [911 GT3 RS](https://sketchfab.com/3d-models/2023-porsche-911-gt3-rs-27-carrera-tribute-992-f17a982d5d8a4d97baef4b00b51a4e9a), [911 Turbo S](https://sketchfab.com/3d-models/2021-porsche-911-turbo-s-992-b6756fc06654405a839bf14e931e4c83), [Taycan Turbo GT](https://sketchfab.com/3d-models/2025-porsche-taycan-turbo-gt-weissach-package-4e1abafe7cf5413587a421377624ba08). Ticari amaçla kullanılamaz.
- **Fotoğraflar**, Wikimedia Commons: Turbo S, [Alexander Migl](https://commons.wikimedia.org/wiki/File:Porsche_992_Turbo_S_1X7A0411.jpg) (CC BY-SA 4.0). Taycan, [David Merrett](https://commons.wikimedia.org/wiki/File:Porsche_Taycan_Turbo_GT_(53877763941).jpg) (CC BY 2.0).
- Tasarım ve kod: Ulaş Özgün Tiril.
