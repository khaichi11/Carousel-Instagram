# Kredit & Lisensi Aset (Bukti Semua Free)

Semua aset di aplikasi ini **gratis dan boleh dipakai komersial**. Berkas lisensi
aslinya ada di folder ini (`fonts/` dan `libraries/`) sebagai bukti. Kalau ada yang
mengklaim aset ini tidak bebas, tunjukkan file lisensi di bawah.

## Font (semua SIL Open Font License 1.1 — gratis, boleh komersial, boleh embed)

| Font | Dipakai untuk | Lisensi | Sumber |
|------|---------------|---------|--------|
| Anton | Judul besar | OFL 1.1 | https://fonts.google.com/specimen/Anton |
| Bebas Neue | Judul (opsi) | OFL 1.1 | https://fonts.google.com/specimen/Bebas+Neue |
| Oswald | Judul (opsi) | OFL 1.1 | https://fonts.google.com/specimen/Oswald |
| Archivo Black | Judul (opsi) | OFL 1.1 | https://fonts.google.com/specimen/Archivo+Black |
| Montserrat | Judul (opsi) | OFL 1.1 | https://fonts.google.com/specimen/Montserrat |
| Archivo | Sub-judul/badge | OFL 1.1 | https://fonts.google.com/specimen/Archivo |
| Plus Jakarta Sans | Body text | OFL 1.1 | https://fonts.google.com/specimen/Plus+Jakarta+Sans |

File font di-host sendiri (folder `fonts/`) via paket [Fontsource](https://fontsource.org)
— jadi tidak ada panggilan ke server luar dan tidak ada tracking. Teks lisensi OFL
tiap font ada di `LICENSES/fonts/`.

## Library (semua open-source permisif)

| Library | Fungsi | Lisensi | Sumber |
|---------|--------|---------|--------|
| html-to-image | Render slide → PNG di browser | MIT | https://github.com/bubkoo/html-to-image |
| JSZip | Bikin file ZIP di browser | MIT | https://github.com/Stuk/jszip |
| PptxGenJS | Bikin file PPTX editable | MIT | https://github.com/gitbrent/PptxGenJS |
| pdf.js (pdfjs-dist) | Baca teks dari PDF di browser | Apache-2.0 | https://github.com/mozilla/pdf.js |

Teks lisisensi tiap library ada di `LICENSES/libraries/`.

## Aset lain

- **Logo Pasti Pintar** — milik kamu sendiri (bukan aset pihak ketiga).
- **Warna brand** (navy `#2F318B`, gold `#F7B400`, biru `#008FD7`) — diambil dari logo.
- **Texture/pattern & gradient** — dibuat pakai CSS/SVG di dalam kode ini sendiri,
  bukan gambar dari pihak lain, jadi bebas dipakai.

## Ikon Instagram di footer slide

**Bukan file download.** Ikonnya digambar langsung di kode (`docs/stage.js`, variabel
`IG_ICON`) memakai tiga bentuk dasar SVG: satu kotak sudut-tumpul (`<rect rx="5">`),
satu lingkaran di tengah, dan satu titik kecil di kanan atas — semuanya `stroke:
currentColor` jadi warnanya ikut tema. Tidak ada berkas gambar Instagram di repo ini
(cek: `find . -iname "*instagram*"` kosong), tidak ada request ke server Meta, dan
tidak ada aset brand resmi (logo gradasi ungu-oranye) yang dipakai.

Dua hal yang perlu dibedakan:

- **Hak cipta (copyright)** — aman. Bentuk geometris sederhana seperti ini umumnya
  tidak dilindungi hak cipta, dan gambarnya memang ditulis sendiri di source code,
  bukan disalin dari berkas brand asset Instagram. Rendisi outline yang mirip juga
  tersedia bebas di icon set open-source (mis. Feather/Lucide, lisensi MIT).
- **Merek dagang (trademark)** — glif kamera Instagram tetap merek dagang milik Meta.
  Memakainya untuk **menunjuk akun sendiri** ("ini handle IG kami") termasuk
  penggunaan referensial yang lazim diizinkan. Yang harus dihindari: memakainya
  sebagai logo/identitas produk sendiri, mengesankan carousel ini resmi/didukung
  Instagram, atau memodifikasi logo gradasi resmi mereka.

Pemakaian di sini — glif outline satu warna di dalam chip kuning, di sebelah handle
sendiri, di footer slide — masuk kategori aman. Kalau mau 100% bebas dari isu merek
dagang, kosongkan field handle Instagram atau ganti ikonnya jadi simbol netral
(mis. hanya teks "@").

Tidak ada watermark atau tanda copyright pihak ketiga yang tertanam di gambar hasil.
