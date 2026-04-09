# Voyage Analytics Tourism Dashboard

Proyek dashboard wisata ini berisi halaman statis `HTML/CSS/JS` dan server Node.js kecil yang memuat dataset CSV lokal.

**Repository:** https://github.com/claresnk04/travelling.git

## Isi Proyek

- `Datasettt baru banget dasbord (tourism dataset fiks).csv` — dataset wisata utama
- `Voyage_code/` — kode aplikasi web:
  - `home.html`, `dashboard.html`, `pipeline.html`
  - `common.css`, `dashboard.css`, `home.css`, `pipeline.css`, `style.css`
  - `script.js` — logika frontend dan visualisasi
  - `server.js` — server HTTP sederhana untuk melayani file statis dan endpoint dataset
  - `package.json` — definisi skrip Node.js
- `split_assets.py` — skrip bantu jika diperlukan

## Jalankan Aplikasi

1. Buka terminal di folder `Voyage_code`
2. Pastikan Node.js sudah terpasang
3. Jalankan:
   ```bash
   npm start
   ```
4. Buka browser:
   ```text
   http://localhost:3000
   ```

## Fitur

- Memuat dataset dari file CSV melalui endpoint `/tourism-data`
- Visualisasi data wisata dengan chart dan filter pada halaman dashboard
- Halaman pipeline yang menjelaskan alur data
- Navigasi antar halaman menggunakan JavaScript

## Catatan

- Jika server gagal memuat CSV, aplikasi akan menggunakan dataset default yang sudah disediakan di frontend.
- Data diambil secara dinamis dari CSV lokal agar lebih mudah diperbarui.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
