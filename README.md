# Carousel Studio — Pasti Pintar

Web app buat bikin carousel IG/TikTok yang **modern & rapi** dari naskah.
Output bisa **PNG** (siap upload) atau **PPTX** (semua elemen editable di Canva/PowerPoint).

## Fitur Utama
- **7 layout**: Cover, Highlight (stabilo), List, Tabel/Ranking, Komparasi, Meme, CTA.
- **Dukungan Aspek Rasio**: 1:1, 4:5, 3:4, 9:16.
- **Customisasi Mendalam**: posisi teks, warna, texture (bisa digeser & di-scale), pattern, dan background gambar (pan/crop).
- **Custom Font**: Bisa paste link dari Google Fonts langsung di web.
- **Export PPTX Native**: Elemen seperti text, background, dan kotak-kotak bisa dipindah/diedit terpisah di Canva.
- **Import Brief (PDF/TXT/MD)**: slide kebentuk otomatis — komparasi (`kiri:`/`kanan:` atau dua judul kolom diakhiri `:`) dan meme (`captop:`/`capbawah:`) terdeteksi sendiri. Aturan lengkap tiap field (topik, eyebrow, judul, dst.) ada di tombol **"Lihat contoh format"** di web; PDF harus PDF teks (bukan scan).

## Coba lokal

Butuh Node cuma buat server file statis (biar font & modul kebaca lewat http):
```bash
npm start
```
Lalu buka **http://localhost:4173**. (Alternatif tanpa Node: `python3 -m http.server -d docs 4173`.)

## Cara bikin file buat di-import

Paling rapi pakai format contoh di `docs/contoh-brief.txt`.
Tiap slide dipisah `=== Slide ===`, lalu:
```
=== Slide ===
layout: cover        # cover | highlight | list | table | compare | meme | cta
theme: dark          # dark | light | photo
topik: Hook
judul: Jangan pilih jurusan cuma karena **gengsi**
sub: Karena yang menjalani kuliahnya nanti… kamu.
```
- `**kata**` → efek stabilo. List: tiap poin diawali `-`. Tabel: `Nama :: Nilai`.
- Komparasi: pakai `kiri:` / `kanan:` buat judul kolom, poinnya diawali `-`.
