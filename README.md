# Carousel Studio — Pasti Pintar

Web app buat bikin carousel IG/TikTok yang **modern & rapi** dari naskah. Semua jalan
di **browser** (static, tanpa server), jadi bisa langsung dipakai lewat GitHub Pages.
Output bisa **PNG** (siap upload) atau **PPTX** (semua elemen editable di Canva/PowerPoint).

**Aplikasinya ada di folder [`docs/`](docs/)** — itu yang di-deploy ke GitHub Pages.

## Fitur

- **7 layout** yang bisa dicampur: Cover, Highlight (stabilo), List, Tabel/Ranking,
  **Komparasi** (2 kolom, mis. "yang dilihat" vs "yang dijalani"), Meme/Gambar, CTA.
- **3 tema**: Navy (gelap), Terang (krem), Foto (background gambar sendiri).
- **Custom** per slide: posisi teks (atas/tengah/bawah), warna teks, warna stabilo,
  texture (grain/paper/noise), pattern garis (grid/dots/diagonal/waves), topik badge.
- **Font judul** bisa diganti: Anton, Bebas Neue, Oswald, Archivo Black, Montserrat.
- **Logo & handle IG/website** otomatis di tiap slide. Warna diambil dari logo biar
  nggak nabrak.
- **Import PDF / TXT / MD** → slide kebentuk otomatis (jumlah slide ngikut file).
- **Export**: PNG per slide / ZIP semua, atau **PPTX editable**.
- **Semua aset gratis** (font Open Font License, library MIT/Apache). Bukti lisensi ada
  di [`docs/LICENSES/`](docs/LICENSES/).

## Coba lokal

Butuh Node cuma buat server file statis (biar font & modul kebaca lewat http):

```bash
npm start
```

Lalu buka **http://localhost:4173**. (Alternatif tanpa Node: `python3 -m http.server -d docs 4173`.)

## Deploy ke GitHub Pages

Repo ini sudah disusun supaya Pages tinggal diarahkan ke folder `docs/`:

1. Push ke GitHub (branch `main`).
2. Buka **Settings → Pages**.
3. **Source: Deploy from a branch** → Branch: `main`, Folder: **`/docs`** → Save.
4. Tunggu ~1 menit, situsnya muncul di `https://<username>.github.io/<nama-repo>/`.

## Cara bikin file buat di-import

Paling rapi pakai format contoh di [`docs/contoh-brief.txt`](docs/contoh-brief.txt)
(bisa dilihat/di-download dari tombol di web). Tiap slide dipisah `=== Slide ===`, lalu:

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
- Bisa juga paste naskah bebas (tiap slide diawali `Slide 1 — ...`); layout ditebak otomatis.

## Struktur

- `docs/` — aplikasinya (yang di-deploy). Isi: `index.html`, `app.js`, `stage.*`,
  `pptx-export.js`, `import-brief.js`, `fonts/`, `vendor/`, `logo/`, `LICENSES/`.
- `serve.js` — server file statis buat lokal (opsional, nggak dipakai di Pages).
- `legacy/` — versi lama (CLI + server Puppeteer), disimpan buat arsip.
