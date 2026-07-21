/* Template library — ready-made deck presets for education / exam-prep creators.
 * PURELY ADDITIVE data: every preset builds slides from the existing layout types
 * (cover, highlight, list, table, compare, meme, cta, figure); no existing template
 * or layout is modified. Visual "styles" come from theme/texture/pattern/background
 * fields each slide already supports. */

const S = (o) => o; // readability helper

// Shared style shorthands (notebook, blackboard, STEM, campus, …)
const NOTEBOOK = { theme: "light", texture: "paper", textureTone: "dark", textureOpacity: 45 };
const BLACKBOARD = { theme: "dark", bgColorMode: "custom", bgFillType: "linear", bgC1: "#173B2C", bgC2: "#0B221A", bgAngle: 160, texture: "grain", textureTone: "light", textureOpacity: 35 };
const STEM = { theme: "dark", pattern: "grid" };
const CAMPUS = { theme: "dark", bgColorMode: "custom", bgFillType: "linear", bgC1: "#1D2E5C", bgC2: "#0E1638", bgAngle: 150 };
const MINIMAL = { theme: "light", texture: "none", pattern: "none" };
const WARM = { theme: "light", texture: "paper", textureTone: "light", textureOpacity: 40 };
const FOREST = { theme: "dark", bgColorMode: "custom", bgFillType: "linear", bgC1: "#1B4D3E", bgC2: "#0F2E25", bgAngle: 150, texture: "grain", textureTone: "light", textureOpacity: 30 };
const SUNSET = { theme: "dark", bgColorMode: "custom", bgFillType: "linear", bgC1: "#4A1C6F", bgC2: "#1A0F2E", bgAngle: 145 };

export const PRESET_CATEGORIES = [
  { id: "utbk", label: "UTBK & SNBT" },
  { id: "mapel", label: "Mata Pelajaran" },
  { id: "study", label: "Teknik Belajar" },
  { id: "ujian", label: "Persiapan Ujian" },
  { id: "bimbel", label: "Bimbel & Promo" },
  { id: "infografis", label: "Infografis Belajar" },
  { id: "flashcard", label: "Flashcard" },
  { id: "qna", label: "Kuis & Q&A" },
  { id: "productivity", label: "Produktivitas" },
  { id: "programming", label: "Programming" },
  { id: "university", label: "Kuliah" },
  { id: "finance", label: "Finansial" },
  { id: "career", label: "Karier" },
  { id: "business", label: "Bisnis" },
  { id: "motivasi", label: "Motivasi" },
  { id: "progress", label: "Progress Tracker" },
];

export const PRESETS = [
  /* ---------------- UTBK ---------------- */
  S({ id: "utbk-tips", cat: "utbk", name: "Tips UTBK", desc: "Hook + 5 tips + CTA — gaya kampus navy.", slides: [
    Object.assign({ type: "cover", topic: "UTBK 2026", eyebrow: "WAJIB TAHU", title: "5 Kebiasaan Kecil yang Naikin Skor **UTBK**", subtitle: "Bukan soal belajar lebih lama — tapi belajar lebih benar." }, CAMPUS),
    Object.assign({ type: "list", topic: "Tips", title: "Mulai dari sini", items: "⏰ Belajar 25 menit :: teknik pomodoro, istirahat 5 menit\n📝 Latihan soal tiap hari :: minimal 10 soal campuran\n📊 Review salah :: catat KENAPA salah, bukan cuma jawabannya\n😴 Tidur cukup :: memori dikunci waktu tidur\n📵 Jauhkan HP :: 1 notifikasi = 20 menit fokus hilang" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Ingat", eyebrow: "PALING PENTING", title: "Konsisten **15 hari** ngalahin sistem kebut **1 malam**.", subtitle: "Otak butuh pengulangan berkala, bukan panik massal." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Closing", title: "SIMPAN & BAGIKAN SEKARANG", subtitle: "Bantu temanmu juga lolos UTBK.", button: 'Tulis "GAS" untuk dapat jadwal belajarnya 👇' }, CAMPUS),
  ]}),
  S({ id: "utbk-tryout", cat: "utbk", name: "Hasil Tryout & Analisis Skor", desc: "Tabel skor + analisis + rencana.", slides: [
    Object.assign({ type: "cover", topic: "Tryout #4", eyebrow: "HASIL TRYOUT", title: "Skor Rata-rata **Tryout Nasional** Minggu Ini", subtitle: "Cek posisimu — lalu lihat cara naikin skornya." }, STEM),
    Object.assign({ type: "table", topic: "Skor", title: "Rata-rata per subtes", items: "🧮 Penalaran Matematika :: 612\n📖 Literasi B. Indonesia :: 598\n🇬🇧 Literasi B. Inggris :: 571\n🧠 Penalaran Umum :: 640\n📚 Pengetahuan Kuantitatif :: 555" }, STEM),
    Object.assign({ type: "compare", topic: "Analisis", title: "Skormu vs Target", colA: "Kalau skormu di bawah rata-rata", itemsA: "📌 Fokus 2 subtes terlemah\n📝 Drill 20 soal/hari subtes itu\n⏱️ Latih manajemen waktu", colB: "Kalau sudah di atas rata-rata", itemsB: "🎯 Pertahankan ritme\n🔁 Simulasi full 7 subtes\n📈 Kejar konsistensi antar-tryout" }, STEM),
    Object.assign({ type: "cta", topic: "Next", title: "Tryout berikutnya: **Minggu depan**", subtitle: "Daftar gratis, kuota terbatas.", button: "Link di bio 🎯" }, STEM),
  ]}),
  S({ id: "utbk-jurusan", cat: "utbk", name: "Komparasi Jurusan", desc: "Dua jurusan dibandingkan apa adanya.", slides: [
    Object.assign({ type: "cover", topic: "Pilih Jurusan", eyebrow: "GALAU CHECK", title: "**Informatika** vs **Sistem Informasi**, bedanya apa?", subtitle: "Sering ketukar — padahal arah kariernya beda." }, CAMPUS),
    Object.assign({ type: "compare", topic: "Bedanya", title: "Sekilas beda fokusnya", colA: "Informatika", itemsA: "💻 Fokus: algoritma & software\n🧮 Banyak matematika & logika\n🛠️ Karier: software engineer, AI\n📚 Cocok kalau suka ngoding dalam", colB: "Sistem Informasi", itemsB: "🏢 Fokus: IT untuk bisnis\n📊 Campuran IT + manajemen\n🛠️ Karier: analis, product, konsultan\n📚 Cocok kalau suka jembatan bisnis-IT" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Kuncinya", eyebrow: "JANGAN SALAH PILIH", title: "Pilih dari **prosesnya**, bukan gengsi namanya.", subtitle: "Baca kurikulumnya, tanya kakak tingkat, coba materinya dulu." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Closing", title: "Masih bingung? **Tanya di komen**", subtitle: "Kita bahas jurusan lain di seri berikutnya.", button: "Follow biar nggak ketinggalan ✨" }, CAMPUS),
  ]}),
  S({ id: "utbk-roadmap", cat: "utbk", name: "Roadmap & Jadwal Belajar", desc: "Rencana belajar bertahap sampai hari-H.", slides: [
    Object.assign({ type: "cover", topic: "Roadmap", eyebrow: "STUDY PLAN", title: "Roadmap **90 Hari** Menuju UTBK", subtitle: "Biar belajarmu ada arah, bukan asal buka buku." }, NOTEBOOK),
    Object.assign({ type: "list", topic: "Fase 1", title: "Hari 1–30 · Fondasi", items: "📚 Kuasai materi dasar tiap subtes\n🗂️ Buat rangkuman + rumus cepat\n🧪 1 mini-tryout tiap minggu" }, NOTEBOOK),
    Object.assign({ type: "list", topic: "Fase 2", title: "Hari 31–60 · Latihan berat", items: "📝 30 soal campuran per hari\n⏱️ Mulai latihan pakai timer\n🔁 Review semua jawaban salah" }, NOTEBOOK),
    Object.assign({ type: "list", topic: "Fase 3", title: "Hari 61–90 · Simulasi", items: "🖥️ Full tryout 2× per minggu\n📊 Analisis skor antar-tryout\n😌 Minggu terakhir: jaga kondisi" }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Mulai", title: "Save dulu, **jalanin pelan-pelan**", subtitle: "90 hari itu cukup — kalau dimulai sekarang.", button: "Share ke study buddy-mu 🤝" }, NOTEBOOK),
  ]}),
  /* ---------------- Mata pelajaran ---------------- */
  S({ id: "mapel-rangkuman", cat: "mapel", name: "Rangkuman Materi (Papan Tulis)", desc: "Ringkasan konsep gaya blackboard.", slides: [
    Object.assign({ type: "cover", topic: "Fisika", eyebrow: "RANGKUMAN KILAT", title: "**Hukum Newton** dalam 3 Slide", subtitle: "Konsep inti + contoh + jebakan soal." }, BLACKBOARD),
    Object.assign({ type: "list", topic: "Konsep", title: "Tiga hukumnya", items: "1️⃣ Inersia :: benda mempertahankan keadaannya (ΣF = 0)\n2️⃣ F = m·a :: percepatan sebanding resultan gaya\n3️⃣ Aksi-Reaksi :: gaya selalu berpasangan, beda benda" }, BLACKBOARD),
    Object.assign({ type: "highlight", topic: "Awas Jebakan", eyebrow: "SERING KETUKAR", title: "Aksi-reaksi **tidak saling meniadakan** — bekerja di **benda berbeda**.", subtitle: "Kalau di benda yang sama, itu kesetimbangan (Hukum I), bukan Hukum III." }, BLACKBOARD),
    Object.assign({ type: "cta", topic: "Latihan", title: "Mau **latihan soalnya**?", subtitle: "10 soal Hukum Newton + pembahasan.", button: 'Komen "NEWTON" 👇' }, BLACKBOARD),
  ]}),
  S({ id: "mapel-soal", cat: "mapel", name: "Contoh Soal & Pembahasan", desc: "Soal → opsi → pembahasan → intinya.", slides: [
    Object.assign({ type: "cover", topic: "Matematika", eyebrow: "BEDAH SOAL", title: "Soal **Barisan Aritmetika** yang Sering Muncul", subtitle: "Coba jawab dulu sebelum swipe ➡️" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Soal", eyebrow: "SOAL", title: "U3 = 11 dan U7 = 23. Berapa **U15**?", subtitle: "A. 41    B. 44    C. 47    D. 50\n\nHitung dulu — jangan langsung swipe 😉" }, NOTEBOOK),
    Object.assign({ type: "list", topic: "Pembahasan", title: "Cara cepatnya", items: "1️⃣ Selisih indeks :: U7 − U3 = 4b → 12 = 4b → b = 3\n2️⃣ Cari a :: U3 = a + 2b → 11 = a + 6 → a = 5\n3️⃣ U15 :: a + 14b = 5 + 42 = **47** ✅" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Intinya", eyebrow: "KEY TAKEAWAY", title: "Selisih dua suku = **(selisih indeks) × b**", subtitle: "Nggak perlu sistem persamaan panjang — langsung dari selisihnya." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Closing", title: "Jawabanmu **benar**?", subtitle: "Tulis di komen — besok bedah soal lagi.", button: "Follow untuk soal harian 📚" }, NOTEBOOK),
  ]}),
  S({ id: "mapel-rumus", cat: "mapel", name: "Kumpulan Rumus / Cheat Sheet", desc: "Tabel rumus cepat siap-screenshot.", slides: [
    Object.assign({ type: "cover", topic: "Cheat Sheet", eyebrow: "SIMPAN INI", title: "Rumus Cepat **Bangun Ruang**", subtitle: "Satu slide, semua rumus. Screenshot-able ✅" }, STEM),
    Object.assign({ type: "table", topic: "Volume", title: "Volume bangun ruang", items: "🧊 Kubus :: s³\n📦 Balok :: p×l×t\n🔺 Limas :: ⅓×La×t\n🥫 Tabung :: πr²t\n🍦 Kerucut :: ⅓πr²t\n⚽ Bola :: 4/3 πr³" }, STEM),
    Object.assign({ type: "highlight", topic: "Trik", eyebrow: "POLA HAFAL", title: "Yang **lancip** (limas/kerucut) selalu **⅓** dari tabung/prismanya.", subtitle: "Hafalin polanya, bukan satu-satu rumusnya." }, STEM),
    Object.assign({ type: "cta", topic: "Closing", title: "Mau cheat sheet **mapel lain**?", subtitle: "Sebut mapelnya di komen.", button: "Save biar nggak hilang 🔖" }, STEM),
  ]}),
  /* ---------------- Persiapan ujian ---------------- */
  S({ id: "ujian-uas", cat: "ujian", name: "Persiapan UTS / UAS", desc: "Checklist H-7 sampai hari-H.", slides: [
    Object.assign({ type: "cover", topic: "UAS", eyebrow: "H-7 UJIAN", title: "Checklist **7 Hari** Sebelum Ujian", subtitle: "Biar nggak sistem kebut semalam (lagi)." }, MINIMAL),
    Object.assign({ type: "list", topic: "H-7 s/d H-4", title: "Minggu awal", items: "🗂️ Kumpulin semua materi & catatan\n📌 Tandai bab yang bobotnya besar\n📝 Kerjakan soal tahun lalu" }, MINIMAL),
    Object.assign({ type: "list", topic: "H-3 s/d H-1", title: "Injury time", items: "🔁 Ulang bab yang masih sering salah\n👥 Belajar bareng: saling jelasin\n😴 H-1: tutup buku jam 9 malam" }, MINIMAL),
    Object.assign({ type: "cta", topic: "Semangat", title: "Kamu **lebih siap** dari yang kamu kira", subtitle: "Good luck! Share ke teman sekelasmu.", button: "Save checklist ini ✅" }, MINIMAL),
  ]}),
  S({ id: "ujian-toefl", cat: "ujian", name: "TOEFL / IELTS Vocab", desc: "Flash-style kosakata + tips skor.", slides: [
    Object.assign({ type: "cover", topic: "TOEFL", eyebrow: "VOCAB BOOSTER", title: "8 Kata yang **Sering Muncul** di TOEFL", subtitle: "Plus cara ingatnya — bukan cuma arti." }, CAMPUS),
    Object.assign({ type: "list", topic: "Vocab 1–4", title: "Set pertama", items: "📈 Significant :: penting/berarti — “signifikan”\n🔁 Consequently :: akibatnya — sebab→akibat\n⚖️ Adequate :: memadai — “ada + kuat”\n🎯 Precise :: tepat/akurat — presisi" }, CAMPUS),
    Object.assign({ type: "list", topic: "Vocab 5–8", title: "Set kedua", items: "🧩 Comprise :: terdiri dari\n🚀 Enhance :: meningkatkan\n🔍 Assess :: menilai/mengukur\n🌱 Sustain :: mempertahankan" }, CAMPUS),
    Object.assign({ type: "cta", topic: "Latihan", title: "Tes dirimu **besok pagi**", subtitle: "Recall tanpa lihat slide = masuk memori jangka panjang.", button: "Save buat review 🔁" }, CAMPUS),
  ]}),
  /* ---------------- Bimbel ---------------- */
  S({ id: "bimbel-promo", cat: "bimbel", name: "Promo & Pendaftaran Bimbel", desc: "Paket program + harga + CTA daftar.", slides: [
    Object.assign({ type: "cover", topic: "Promo", eyebrow: "DIBUKA!", title: "Kelas Intensif **UTBK 2026** Batch 3", subtitle: "Kuota 40 kursi — 28 sudah terisi." }, CAMPUS),
    Object.assign({ type: "table", topic: "Paket", title: "Pilih paketmu", items: "🥉 Reguler (online) :: 299rb\n🥈 Intensif (online + modul) :: 499rb\n🥇 Premium (+ mentoring 1-on-1) :: 899rb" }, CAMPUS),
    Object.assign({ type: "list", topic: "Fasilitas", title: "Semua paket dapat", items: "🎥 Rekaman semua pertemuan\n📚 Bank soal 2.000+ butir\n📊 Tryout bulanan + analisis skor\n💬 Grup diskusi dengan tutor" }, CAMPUS),
    Object.assign({ type: "cta", topic: "Daftar", title: "Daftar sebelum **Jumat** = potongan **20%**", subtitle: "Sisa kursi terbatas.", button: 'DM "DAFTAR" sekarang 📩' }, CAMPUS),
  ]}),
  S({ id: "bimbel-testimoni", cat: "bimbel", name: "Testimoni & Success Story", desc: "Cerita murid + hasil nyata.", slides: [
    Object.assign({ type: "cover", topic: "Alumni", eyebrow: "SUCCESS STORY", title: "Dari Skor 480 ke **712** dalam 4 Bulan", subtitle: "Cerita Nadia, diterima di jurusan impiannya." }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Katanya", eyebrow: "KATA NADIA", title: '"Aku nggak nambah jam belajar — aku **ganti cara** belajarnya."', subtitle: "Dari baca ulang materi → drill soal + review salah tiap hari." }, MINIMAL),
    Object.assign({ type: "table", topic: "Progress", title: "Perjalanan skornya", items: "📅 Tryout 1 (Sep) :: 480\n📅 Tryout 3 (Okt) :: 561\n📅 Tryout 6 (Nov) :: 645\n📅 UTBK (Des) :: 712" }, MINIMAL),
    Object.assign({ type: "cta", topic: "Kamu Next", title: "Mau jadi **cerita berikutnya**?", subtitle: "Program yang sama, dibuka lagi bulan ini.", button: "Cek link di bio ✨" }, MINIMAL),
  ]}),
  S({ id: "bimbel-jadwal", cat: "bimbel", name: "Jadwal Kelas & Pengajar", desc: "Jadwal mingguan + kenalan tutor.", slides: [
    Object.assign({ type: "cover", topic: "Jadwal", eyebrow: "MINGGU INI", title: "Jadwal Kelas **13–18 Januari**", subtitle: "Semua kelas ada rekamannya — santai kalau bentrok." }, MINIMAL),
    Object.assign({ type: "table", topic: "Jadwal", title: "Kelas live minggu ini", items: "📐 Senin 19.00 :: Matematika\n🧪 Selasa 19.00 :: Kimia\n📖 Rabu 19.00 :: Literasi\n⚡ Kamis 19.00 :: Fisika\n🧠 Jumat 19.00 :: Penalaran" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Tutor", eyebrow: "KENALAN DULU", title: "Semua tutor = **alumni PTN top** + 3 tahun+ ngajar", subtitle: "Bukan cuma pintar — tapi bisa bikin kamu paham." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Join", title: "Kelas percobaan **gratis** Sabtu ini", subtitle: "Tanpa komitmen — cobain dulu.", button: 'Komen "TRIAL" 👇' }, MINIMAL),
  ]}),
  /* ---------------- Infografis ---------------- */
  S({ id: "info-belajar", cat: "infografis", name: "Teknik Belajar Efektif", desc: "Metode + fakta otak + cara pakai.", slides: [
    Object.assign({ type: "cover", topic: "Study Hack", eyebrow: "SCIENCE-BASED", title: "Teknik Belajar yang **Terbukti** Secara Riset", subtitle: "Bukan mitos belajar sambil dengerin musik klasik." }, NOTEBOOK),
    Object.assign({ type: "list", topic: "Teknik", title: "Empat teknik terkuat", items: "🔁 Active recall :: uji ingatan, jangan baca ulang\n📅 Spaced repetition :: ulang berkala 1-3-7 hari\n🗣️ Feynman :: jelaskan seolah ke anak 12 tahun\n🔀 Interleaving :: campur topik saat latihan" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Fakta", eyebrow: "FAKTA OTAK", title: "Baca ulang materi terasa paham — **itu ilusi**.", subtitle: "Familiarity ≠ mastery. Ujiannya: tutup buku, tulis ulang isinya." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Praktik", title: "Coba **satu teknik** malam ini", subtitle: "Mulai dari active recall — paling gampang.", button: "Save biar inget 🔖" }, NOTEBOOK),
  ]}),
  S({ id: "info-waktu", cat: "infografis", name: "Manajemen Waktu Pelajar", desc: "Kesalahan umum + solusi praktis.", slides: [
    Object.assign({ type: "cover", topic: "Time Management", eyebrow: "RELATE?", title: "Sibuk Seharian tapi **Nggak Ada yang Selesai**", subtitle: "Masalahnya bukan waktumu — tapi cara bagimu." }, MINIMAL),
    Object.assign({ type: "compare", topic: "Bedanya", title: "Sibuk vs Produktif", colA: "Sibuk", itemsA: "📱 Multitasking terus\n📋 To-do list 20 item\n🌙 Begadang biar 'kekejar'", colB: "Produktif", itemsB: "🎯 1 prioritas per sesi\n📋 3 item penting saja\n😴 Tidur cukup, fokus penuh" }, MINIMAL),
    Object.assign({ type: "list", topic: "Praktik", title: "Mulai besok pagi", items: "🌅 Tentukan 3 prioritas sebelum buka HP\n⏰ Blok 2 jam fokus tanpa notifikasi\n📵 HP di ruangan lain saat belajar" }, MINIMAL),
    Object.assign({ type: "cta", topic: "Closing", title: "Waktumu cukup — **asal dibagi benar**", subtitle: "Coba 3 hari, rasakan bedanya.", button: "Share ke yang suka begadang 😴" }, MINIMAL),
  ]}),
  /* ---------------- Flashcard ---------------- */
  S({ id: "flash-kosakata", cat: "flashcard", name: "Flashcard Kosakata", desc: "Satu kartu satu konsep — swipe untuk jawab.", slides: [
    Object.assign({ type: "cover", topic: "Flashcard", eyebrow: "QUICK REVIEW", title: "5 Istilah **Biologi** dalam 60 Detik", subtitle: "Tebak dulu, swipe untuk cek. Siap?" }, STEM),
    Object.assign({ type: "highlight", topic: "Kartu 1", eyebrow: "APA ITU…", title: "**Osmosis**?", subtitle: "Perpindahan air lewat membran semipermeabel, dari larutan encer ke pekat." }, STEM),
    Object.assign({ type: "highlight", topic: "Kartu 2", eyebrow: "APA ITU…", title: "**Fotosintesis**?", subtitle: "6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂ — energi cahaya jadi glukosa." }, STEM),
    Object.assign({ type: "highlight", topic: "Kartu 3", eyebrow: "APA ITU…", title: "**Mitosis**?", subtitle: "Pembelahan sel jadi 2 sel identik — untuk pertumbuhan & regenerasi." }, STEM),
    Object.assign({ type: "cta", topic: "Review", title: "Besok, **coba ingat lagi** tanpa buka ini", subtitle: "Spaced repetition — cara hafalan yang bertahan.", button: "Save deck-nya 🗂️" }, STEM),
  ]}),
  S({ id: "flash-tahukah", cat: "flashcard", name: "Tahukah Kamu?", desc: "Fakta menarik penarik engagement.", slides: [
    Object.assign({ type: "cover", topic: "Fun Fact", eyebrow: "TAHUKAH KAMU?", title: "Fakta Otak yang Bikin Kamu **Pintar Belajar**", subtitle: "Nomor 3 paling sering disepelekan." }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Fakta 1", eyebrow: "FAKTA #1", title: "Otak menghapus **70%** info baru dalam 24 jam", subtitle: "Kecuali kamu me-review-nya. (Kurva lupa Ebbinghaus)" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Fakta 2", eyebrow: "FAKTA #2", title: "Menulis tangan > mengetik untuk **mengingat**", subtitle: "Gerakan menulis memaksa otak memproses ulang materi." }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Fakta 3", eyebrow: "FAKTA #3", title: "Tidur adalah **bagian dari belajar**", subtitle: "Memori dipindah ke penyimpanan jangka panjang saat tidur dalam." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Closing", title: "Fakta mana yang **baru kamu tahu**?", subtitle: "Tulis nomornya di komen.", button: "Follow untuk fakta harian 🧠" }, CAMPUS),
  ]}),
  /* ---------------- Kuis ---------------- */
  S({ id: "quiz-pg", cat: "qna", name: "Kuis Pilihan Ganda", desc: "Soal → mikir → jawaban di slide berikut.", slides: [
    Object.assign({ type: "cover", topic: "Kuis", eyebrow: "BERANI COBA?", title: "3 Soal Cepat — **Berapa Skormu?**", subtitle: "Jawab dulu di kepala sebelum swipe. Jujur ya 😌" }, STEM),
    Object.assign({ type: "highlight", topic: "Soal 1", eyebrow: "SOAL 1", title: "Hasil dari **15% × 80**?", subtitle: "A. 10        B. 12        C. 14        D. 16" }, STEM),
    Object.assign({ type: "highlight", topic: "Jawaban 1", eyebrow: "JAWABAN", title: "**B. 12** — 10%×80 = 8, 5%×80 = 4 → 8+4", subtitle: "Trik: pecah persen jadi 10% + 5%. Tanpa kalkulator." }, STEM),
    Object.assign({ type: "highlight", topic: "Soal 2", eyebrow: "SOAL 2", title: "Sinonim kata **'lugas'**?", subtitle: "A. Rumit        B. Apa adanya        C. Bertele-tele        D. Kiasan" }, STEM),
    Object.assign({ type: "highlight", topic: "Jawaban 2", eyebrow: "JAWABAN", title: "**B. Apa adanya** — langsung, tidak berbelit", subtitle: "Lugas ≠ lugu. Dua kata ini sering ketukar di soal." }, STEM),
    Object.assign({ type: "cta", topic: "Skor", title: "Berapa yang **benar**?", subtitle: "Tulis skormu di komen — jujur 😄", button: "Follow untuk kuis mingguan 🎯" }, STEM),
  ]}),
  S({ id: "quiz-bs", cat: "qna", name: "Benar atau Salah", desc: "Mitos vs fakta seputar belajar.", slides: [
    Object.assign({ type: "cover", topic: "Mitos/Fakta", eyebrow: "BENAR ATAU SALAH?", title: "Mitos Belajar yang **Masih Kamu Percaya**", subtitle: "Tebak dulu: benar atau salah?" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Pernyataan 1", eyebrow: "BENAR / SALAH?", title: '"SKS (sistem kebut semalam) itu **efektif**"', subtitle: "Mikir dulu… lalu swipe ➡️" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Jawaban 1", eyebrow: "❌ SALAH", title: "Info masuk **memori pendek** — hilang setelah ujian", subtitle: "Bisa lulus ujiannya, tapi nol untuk ujian berikutnya." }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Pernyataan 2", eyebrow: "BENAR / SALAH?", title: '"Istirahat pendek justru **mempercepat** belajar"', subtitle: "Benar atau salah?" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Jawaban 2", eyebrow: "✅ BENAR", title: "Otak **mengkonsolidasi** materi saat jeda", subtitle: "25 menit fokus + 5 menit jeda > 3 jam maraton." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Closing", title: "Kamu kejebak di **nomor berapa**?", subtitle: "Share ke teman yang masih percaya SKS 😆", button: "Save biar inget 📌" }, NOTEBOOK),
  ]}),
  /* ---------------- Motivasi ---------------- */
  S({ id: "motiv-quotes", cat: "motivasi", name: "Motivasi Belajar", desc: "Quote + reframe + aksi kecil.", slides: [
    Object.assign({ type: "cover", topic: "Motivasi", eyebrow: "BUAT KAMU", title: "Buat yang Lagi **Capek Belajar**", subtitle: "Baca pelan-pelan. Ini buat kamu." }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Reframe", eyebrow: "INGAT INI", title: "Kamu nggak harus **hebat** untuk mulai — kamu harus **mulai** untuk hebat.", subtitle: "Satu halaman hari ini > rencana sempurna yang nggak jalan." }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Perspektif", eyebrow: "PELAN ITU OKE", title: "Lambat itu tetap **maju**.", subtitle: "Bandingkan dirimu dengan dirimu kemarin — bukan dengan orang lain." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Aksi", title: "Buka bukumu **15 menit** aja dulu", subtitle: "Momentum lebih penting dari motivasi.", button: "Share ke yang lagi berjuang 🤍" }, CAMPUS),
  ]}),
  /* ---------------- Progress ---------------- */
  S({ id: "progress-mingguan", cat: "progress", name: "Progress Mingguan", desc: "Recap target vs realisasi + streak.", slides: [
    Object.assign({ type: "cover", topic: "Weekly Recap", eyebrow: "MINGGU #6", title: "Progress Belajar **Minggu Ini**", subtitle: "Kecil tapi konsisten — begini rekapnya." }, MINIMAL),
    Object.assign({ type: "table", topic: "Realisasi", title: "Target vs realisasi", items: "📝 Soal dikerjakan :: 142\n⏱️ Jam fokus :: 11,5\n🔁 Review salah :: 38\n🔥 Streak harian :: 6 hari" }, MINIMAL),
    Object.assign({ type: "compare", topic: "Evaluasi", title: "Evaluasi minggu ini", colA: "Yang berhasil", itemsA: "✅ Rutin pagi 25 menit\n✅ Review salah tiap malam\n✅ Nggak buka HP saat fokus", colB: "Yang perlu dibenahi", itemsB: "⚠️ Weekend bolong terus\n⚠️ Subtes literasi kurang porsi\n⚠️ Tidur masih jam 12+" }, MINIMAL),
    Object.assign({ type: "cta", topic: "Next", title: "Target minggu depan: **streak 7 hari**", subtitle: "Ikut challenge-nya? Post progressmu, tag kami.", button: "Mulai streak-mu hari ini 🔥" }, MINIMAL),
  ]}),

  // ── Teknik Belajar ──
  S({ id: "active-recall", cat: "study", name: "Active Recall", desc: "Teknik mengingat tanpa membuka catatan.", slides: [
    Object.assign({ type: "cover", topic: "Teknik Belajar", eyebrow: "STUDY TIPS", title: "Active Recall: **Cara Belajar Paling Efektif**", subtitle: "Jangan baca ulang. Tutup catatan, lalu ingat." }, NOTEBOOK),
    Object.assign({ type: "list", topic: "Langkah", title: "3 langkah active recall", items: "1️⃣ Baca materi sekali\n2️⃣ Tutup catatan, tulis apa yang diingat\n3️⃣ Cek jawaban, ulangi bagian yang salah" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Kenapa Efektif", title: "Mengapa lebih baik dari rereading?", body: "Otak butuh usaha untuk mengingat. Semakin sulit, semakin kuat ingatanmu." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Coba Sekarang", title: "Latih active recall hari ini", subtitle: "Ambil topik, tutup catatan, lalu jelaskan dengan kata-katamu sendiri.", button: "Mulai latihan 🧠" }, NOTEBOOK),
  ]}),
  S({ id: "pomodoro", cat: "study", name: "Teknik Pomodoro", desc: "Fokus 25 menit, istirahat 5 menit.", slides: [
    Object.assign({ type: "cover", topic: "Fokus", eyebrow: "STUDY TIPS", title: "Teknik **Pomodoro**", subtitle: "25 menit fokus, 5 menit rehat. Ulangi." }, MINIMAL),
    Object.assign({ type: "list", topic: "Cara Kerja", title: "Cara pakai Pomodoro", items: "1️⃣ Pilih satu tugas\n2️⃣ Set timer 25 menit\n3️⃣ Fokus tanpa gangguan\n4️⃣ Istirahat 5 menit\n5️⃣ Setelah 4 sesi, rehat panjang 15-30 menit" }, MINIMAL),
    Object.assign({ type: "compare", topic: "Tips", title: "Biar nggak gampang bosan", colA: "Lakukan", itemsA: "✅ Satu tugas per sesi\n✅ Matikan notifikasi\n✅ Catat distraksi untuk nanti", colB: "Hindari", itemsB: "❌ Multitasking\n❌ Skip istirahat\n❌ Terlalu keras pada diri sendiri" }, MINIMAL),
    Object.assign({ type: "cta", topic: "Mulai", title: "Siap fokus 25 menit?", subtitle: "Download timer atau pakai aplikasi favoritmu.", button: "Mulai sesi pertama 🍅" }, MINIMAL),
  ]}),
  S({ id: "mind-mapping", cat: "study", name: "Mind Mapping", desc: "Visualisasi hubungan antar konsep.", slides: [
    Object.assign({ type: "cover", topic: "Visualisasi", eyebrow: "STUDY TIPS", title: "Belajar dengan **Mind Map**", subtitle: "Hubungkan ide besar dan detail dalam satu gambar." }, WARM),
    Object.assign({ type: "list", topic: "Langkah", title: "Cara membuat mind map", items: "1️⃣ Tulis topik utama di tengah\n2️⃣ Cabangkan subtopik utama\n3️⃣ Tambahkan keyword, simbol, warna\n4️⃣ Hubungkan ide yang berkaitan\n5️⃣ Sederhanakan, jangan copy-paste paragraf" }, WARM),
    Object.assign({ type: "highlight", topic: "Manfaat", title: "Kenapa mind map membantu?", body: "Otak menyimpan informasi dalam jaringan, bukan daftar. Mind map meniru cara kerja otak." }, WARM),
    Object.assign({ type: "cta", topic: "Coba", title: "Buat mind map pertamamu", subtitle: "Ambil kertas kosong atau aplikasi digital, mulai dari topik hari ini.", button: "Mulai mapping 🗺️" }, WARM),
  ]}),
  S({ id: "feynman", cat: "study", name: "Teknik Feynman", desc: "Jelaskan sederhana seolah mengajar anak kecil.", slides: [
    Object.assign({ type: "cover", topic: "Pemahaman", eyebrow: "STUDY TIPS", title: "Teknik **Feynman**", subtitle: "Kalau kamu paham, kamu bisa jelaskan dengan sederhana." }, NOTEBOOK),
    Object.assign({ type: "list", topic: "4 Langkah", title: "4 langkah teknik Feynman", items: "1️⃣ Pilih konsep\n2️⃣ Jelaskan seperti ke anak 12 tahun\n3️⃣ Identifikasi bagian yang masih ragu\n4️⃣ Ulangi dan sederhanakan lagi" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Tanda Paham", title: "Kamu belum paham kalau…", body: "…masih pakai bahasa rumit, banyak ‘jadi’, atau nggak bisa kasih contoh konkret." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Latihan", title: "Ajarin konsep ini ke teman", subtitle: "Cari partner, jelaskan topik hari ini dalam 3 menit.", button: "Cari partner belajar 🎓" }, NOTEBOOK),
  ]}),
  S({ id: "spaced-repetition", cat: "study", name: "Spaced Repetition", desc: "Ulangi materi pada interval waktu tertentu.", slides: [
    Object.assign({ type: "cover", topic: "Ingatan", eyebrow: "STUDY TIPS", title: "**Spaced Repetition**", subtitle: "Ulangi di waktu tepat, ingat lebih lama." }, CAMPUS),
    Object.assign({ type: "list", topic: "Jadwal", title: "Jadwal ulang ideal", items: "Hari 1 :: belajar pertama\nHari 2 :: ulang singkat\nHari 4 :: ulang lagi\nHari 7 :: review mingguan\nHari 14 :: review dua mingguan\nHari 30 :: review bulanan" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Prinsip", title: "Lupakan curve lupa", body: "Setiap kali ulang sebelum lupa, ingatanmu semakin kuat dan intervalnya semakin panjang." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Tools", title: "Pakai flashcard digital", subtitle: "Anki, Quizlet, atau buat sendiri di buku.", button: "Buat deck hari ini 🗂️" }, CAMPUS),
  ]}),

  // ── Produktivitas ──
  S({ id: "deep-work", cat: "productivity", name: "Deep Work", desc: "Fokus tanpa distraksi untuk hasil berkualitas.", slides: [
    Object.assign({ type: "cover", topic: "Fokus", eyebrow: "PRODUCTIVITY", title: "**Deep Work**", subtitle: "Kerja berkualitas tinggi di dunia penuh notifikasi." }, MINIMAL),
    Object.assign({ type: "list", topic: "Aturan", title: "Aturan deep work", items: "1️⃣ Blok waktu khusus\n2️⃣ Matikan semua distraksi\n3️⃣ Tentukan target jelas\n4️⃣ Istirahat setelah sesi\n5️⃣ Ulangi secara konsisten" }, MINIMAL),
    Object.assign({ type: "compare", topic: "Deep vs Shallow", title: "Deep work vs shallow work", colA: "Deep work", itemsA: "✅ Fokus penuh\n✅ Hasil bermakna\n✅ Butuh energi tinggi", colB: "Shallow work", itemsB: "⚠️ Email, chat\n⚠️ Administrasi\n⚠️ Bisa dilakukan saat lelah" }, MINIMAL),
    Object.assign({ type: "cta", topic: "Mulai", title: "Jadwalkan deep work besok", subtitle: "Mulai dari 60 menit, lalu tambah perlahan.", button: "Blok kalender 🕰️" }, MINIMAL),
  ]}),
  S({ id: "morning-routine", cat: "productivity", name: "Morning Routine", desc: "Rutinitas pagi untuk hari yang produktif.", slides: [
    Object.assign({ type: "cover", topic: "Habit", eyebrow: "PRODUCTIVITY", title: "Bangun & **Langsung On Fire**", subtitle: "Rutinitas pagi yang bikin hari lebih terkontrol." }, WARM),
    Object.assign({ type: "list", topic: "Rutinitas", title: "Morning routine 30 menit", items: "⏰ 05:00 Bangun & minum air\n⏰ 05:10 Olahraga ringan 10 menit\n⏰ 05:20 Mandi & siap-siap\n⏰ 05:30 Tulis 3 prioritas hari\n⏰ 05:40 Mulai deep work pertama" }, WARM),
    Object.assign({ type: "highlight", topic: "Tips", title: "Kunci keberhasilan", body: "Bukan durasi, tapi konsistensi. Mulai dari 3 kebiasaan kecil, lalu tambah." }, WARM),
    Object.assign({ type: "cta", topic: "Coba", title: "Desain morning routine-mu", subtitle: "Tulis 3 hal yang bisa kamu lakukan besok pagi.", button: "Mulai besok ☀️" }, WARM),
  ]}),
  S({ id: "time-blocking", cat: "productivity", name: "Time Blocking", desc: "Bagi hari menjadi blok waktu tertentu.", slides: [
    Object.assign({ type: "cover", topic: "Jadwal", eyebrow: "PRODUCTIVITY", title: "**Time Blocking**", subtitle: "Setiap jam punya tugas. Setiap tugas punya batas waktu." }, MINIMAL),
    Object.assign({ type: "table", topic: "Contoh", title: "Contoh time blocking", items: "06:00-07:00 :: Morning routine\n07:00-09:00 :: Deep work utama\n09:00-09:30 :: Break & snack\n09:30-11:00 :: Tugas sekunder\n11:00-12:00 :: Meeting/review" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Manfaat", title: "Kenapa time blocking works?", body: "Kamu nggak lagi memutuskan tiap jam mau ngapain. Keputusan sudah dibuat sebelumnya." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Mulai", title: "Blok jadwalmu malam ini", subtitle: "Rencanakan besok sebelum tidur.", button: "Buka kalender 📅" }, MINIMAL),
  ]}),
  S({ id: "eisenhower", cat: "productivity", name: "Eisenhower Matrix", desc: "Prioritaskan tugas berdasarkan urgensi & pentingnya.", slides: [
    Object.assign({ type: "cover", topic: "Prioritas", eyebrow: "PRODUCTIVITY", title: "**Eisenhower Matrix**", subtitle: "Penting vs Urgent: mana yang dulu?" }, MINIMAL),
    Object.assign({ type: "table", topic: "Matriks", title: "4 kuadran prioritas", items: "Urgent + Penting :: Lakukan sekarang\nTidak Urgent + Penting :: Jadwalkan\nUrgent + Tidak Penting :: Delegasikan\nTidak Urgent + Tidak Penting :: Hapus" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Fokus", title: "Rahasia produktivitas", body: "Orang sukses menghabiskan lebih banyak waktu di kuadran ‘penting tapi tidak urgent’." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Latihan", title: "Kategorikan tugasmu hari ini", subtitle: "Tulis 6 tugas, lalu masukkan ke matriks.", button: "Buat matriks 🎯" }, MINIMAL),
  ]}),
  S({ id: "second-brain", cat: "productivity", name: "Second Brain", desc: "Sistem menyimpan dan mengelola pengetahuan.", slides: [
    Object.assign({ type: "cover", topic: "Knowledge", eyebrow: "PRODUCTIVITY", title: "**Bangun Second Brain**", subtitle: "Jangan andalkan ingatan. Simpan ide di sistem terpercaya." }, NOTEBOOK),
    Object.assign({ type: "list", topic: "CODE", title: "Metode CODE", items: "C :: Capture (tangkap ide)\nO :: Organize (kelompokkan)\nD :: Distill (sederhanakan)\nE :: Express (bagikan/terapkan)" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Manfaat", title: "Otak kedua untuk ide", body: "Dengan sistem, kamu bisa fokus berpikir, bukan mengingat." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Mulai", title: "Pilih satu tempat catatan", subtitle: "Notion, Obsidian, atau buku fisik. Yang penting konsisten.", button: "Mulai capture 📝" }, NOTEBOOK),
  ]}),

  // ── Programming ──
  S({ id: "programming-roadmap", cat: "programming", name: "Roadmap Programmer", desc: "Jalur belajar programming dari nol.", slides: [
    Object.assign({ type: "cover", topic: "Coding", eyebrow: "PROGRAMMING", title: "**Roadmap Jadi Programmer**", subtitle: "Dari nol sampai bisa bikin project sendiri." }, STEM),
    Object.assign({ type: "list", topic: "Tahap", title: "5 tahap belajar coding", items: "1️⃣ Logika & algoritma dasar\n2️⃣ Satu bahasa pemrograman\n3️⃣ Struktur data & OOP\n4️⃣ Framework & tools\n5️⃣ Bangun portofolio project" }, STEM),
    Object.assign({ type: "highlight", topic: "Tips", title: "Jangan tersesat di tutorial hell", body: "Setiap belajar sesuatu baru, langsung praktikkan dalam project kecil." }, STEM),
    Object.assign({ type: "cta", topic: "Mulai", title: "Pilih bahasa pertamamu", subtitle: "Python untuk data/AI, JavaScript untuk web, Dart untuk mobile.", button: "Mulai coding 💻" }, STEM),
  ]}),
  S({ id: "cheat-sheet", cat: "programming", name: "Cheat Sheet", desc: "Referensi cepat sintaks populer.", slides: [
    Object.assign({ type: "cover", topic: "Referensi", eyebrow: "PROGRAMMING", title: "**Cheat Sheet Programmer**", subtitle: "Referensi cepat yang wajib disimpan." }, STEM),
    Object.assign({ type: "table", topic: "Git", title: "Git commands wajib", items: "git init :: inisialisasi repo\ngit add . :: stage semua\ngit commit -m :: simpan perubahan\ngit push :: kirim ke remote\ngit pull :: ambil update" }, STEM),
    Object.assign({ type: "table", topic: "Terminal", title: "Terminal commands", items: "ls :: list file\ncd :: pindah direktori\nmkdir :: buat folder\nrm :: hapus file\ncode . :: buka VS Code" }, STEM),
    Object.assign({ type: "cta", topic: "Simpan", title: "Buat cheat sheet pribadi", subtitle: "Kumpulkan perintah yang sering kamu lupa.", button: "Simpan catatan 📌" }, STEM),
  ]}),
  S({ id: "ai-tools", cat: "programming", name: "AI Tools Coding", desc: "Manfaatkan AI untuk belajar dan ngoding.", slides: [
    Object.assign({ type: "cover", topic: "AI", eyebrow: "PROGRAMMING", title: "**Ngoding Bareng AI**", subtitle: "AI bukan pengganti, tapi asisten yang powerful." }, STEM),
    Object.assign({ type: "list", topic: "Use Case", title: "Cara pakai AI saat coding", items: "1️⃣ Jelaskan error message\n2️⃣ Refactor kode jadi lebih bersih\n3️⃣ Buat dokumentasi\n4️⃣ Generate test case\n5️⃣ Belajar konsep baru dengan contoh" }, STEM),
    Object.assign({ type: "highlight", topic: "Etika", title: "Jangan copy-paste buta", body: "Pahami setiap baris kode. AI bisa salah, kamu yang bertanggung jawab." }, STEM),
    Object.assign({ type: "cta", topic: "Coba", title: "Tanya AI tentang bug-mu", subtitle: "Paste error message, minta penjelasan dan solusi.", button: "Tanya AI 🤖" }, STEM),
  ]}),
  S({ id: "git-workflow", cat: "programming", name: "Git Workflow", desc: "Cara kerja tim dengan Git.", slides: [
    Object.assign({ type: "cover", topic: "Version Control", eyebrow: "PROGRAMMING", title: "**Git Workflow untuk Tim**", subtitle: "Kerja sama tanpa saling timpa kode." }, STEM),
    Object.assign({ type: "list", topic: "Alur", title: "Alur kerja standar", items: "1️⃣ Pull latest dari main\n2️⃣ Buat branch fitur baru\n3️⃣ Commit perubahan\n4️⃣ Push branch ke remote\n5️⃣ Buat Pull Request\n6️⃣ Review & merge" }, STEM),
    Object.assign({ type: "highlight", topic: "Tips", title: "Commit yang baik", body: "Satu commit = satu perubahan logis. Pesan commit jelas dan ringkas." }, STEM),
    Object.assign({ type: "cta", topic: "Latihan", title: "Buat branch pertama-mu", subtitle: "Latihan di repo pribadi sebelum kerja tim.", button: "Coba git branch 🌿" }, STEM),
  ]}),
  S({ id: "clean-code", cat: "programming", name: "Clean Code", desc: "Menulis kode yang mudah dibaca dan dirawat.", slides: [
    Object.assign({ type: "cover", topic: "Quality", eyebrow: "PROGRAMMING", title: "**Clean Code 101**", subtitle: "Kode yang baik adalah kode yang mudah dipahami." }, STEM),
    Object.assign({ type: "list", topic: "Prinsip", title: "Prinsip clean code", items: "✅ Nama variabel jelas\n✅ Fungsi kecil & satu tugas\n✅ Hindari komentar yang tidak perlu\n✅ Konsisten dalam gaya\n✅ Hapus kode yang tidak dipakai" }, STEM),
    Object.assign({ type: "highlight", topic: "Manfaat", title: "Kenapa clean code penting?", body: "Kamu akan menghabiskan lebih banyak waktu membaca kode daripada menulisnya." }, STEM),
    Object.assign({ type: "cta", topic: "Refactor", title: "Refactor satu file hari ini", subtitle: "Pilih kode lama, perbaiki nama dan struktur.", button: "Buka editor 🧹" }, STEM),
  ]}),

  // ── Kuliah ──
  S({ id: "semester-plan", cat: "university", name: "Rencana Semester", desc: "Atur target dan jadwal semester.", slides: [
    Object.assign({ type: "cover", topic: "Perencanaan", eyebrow: "KULIAH", title: "**Rencana Semester Anti-Burnout**", subtitle: "Target jelas, jadwal realistis, evaluasi rutin." }, CAMPUS),
    Object.assign({ type: "list", topic: "Langkah", title: "5 langkah rencana semester", items: "1️⃣ Catat semua mata kuliah & deadline\n2️⃣ Tetapkan target IPK/ nilai\n3️⃣ Bagi tugas besar jadi milestone\n4️⃣ Jadwalkan review mingguan\n5️⃣ Sisihkan waktu istirahat" }, CAMPUS),
    Object.assign({ type: "table", topic: "Milestone", title: "Contoh milestone tugas", items: "Minggu 1-2 :: Research & outline\nMinggu 3-4 :: Draft pertama\nMinggu 5 :: Revisi\nMinggu 6 :: Finalisasi & submit" }, CAMPUS),
    Object.assign({ type: "cta", topic: "Mulai", title: "Buat rencana semester-mu", subtitle: "Satu halaman cukup. Yang penting dieksekusi.", button: "Mulai merencanakan 📚" }, CAMPUS),
  ]}),
  S({ id: "note-taking", cat: "university", name: "Catatan Kuliah", desc: "Sistem mencatat efektif di perkuliahan.", slides: [
    Object.assign({ type: "cover", topic: "Notes", eyebrow: "KULIAH", title: "**Catatan Kuliah yang Efektif**", subtitle: "Bukan soal lengkap, tapi soal bisa dipakai." }, NOTEBOOK),
    Object.assign({ type: "list", topic: "Metode", title: "Metode catatan terbaik", items: "📝 Cornell Notes :: pertanyaan + catatan + ringkasan\n📝 Mind Map :: visualisasi hubungan\n📝 Outline :: hierarki topik\n📝 Flowchart :: untuk proses dan algoritma" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Tips", title: "Catat dengan tujuan", body: "Tanyakan: ‘Apa yang mungkin keluar di ujian?’ Catat itu." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Coba", title: "Revisi catatan minggu ini", subtitle: "Ubah catatan panjang jadi ringkasan dan pertanyaan.", button: "Buka catatan 📖" }, NOTEBOOK),
  ]}),
  S({ id: "kuliah-organisasi", cat: "university", name: "Organisasi Kuliah", desc: "Balance akademik dan organisasi.", slides: [
    Object.assign({ type: "cover", topic: "Balance", eyebrow: "KULIAH", title: "**Kuliah + Organisasi: Bisa Balance**", subtitle: "Bukan soal waktu, tapi soal prioritas." }, CAMPUS),
    Object.assign({ type: "compare", topic: "Tips", title: "Agar nggak saling bentrok", colA: "Lakukan", itemsA: "✅ Kalender gabungan\n✅ Komunikasikan deadline\n✅ Delegasi tugas", colB: "Hindari", itemsB: "❌ Ambil semua proker\n❌ Skip kelas untuk rapat\n❌ Tidur terlalu larut" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Prioritas", title: "Akademik tetap nomor satu", body: "Organisasi adalah investasi soft skill, tapi IPK adalah tiket peluang." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Evaluasi", title: "Cek komitmenmu bulan ini", subtitle: "Apakah akademik masih aman? Kalau tidak, kurangi proker.", button: "Evaluasi sekarang ⚖️" }, CAMPUS),
  ]}),
  S({ id: "skripsi-timeline", cat: "university", name: "Timeline Skripsi", desc: "Rencana penyelesaian skripsi 6 bulan.", slides: [
    Object.assign({ type: "cover", topic: "Skripsi", eyebrow: "KULIAH", title: "**Timeline Skripsi 6 Bulan**", subtitle: "Dari proposal sampai sidang, langkah demi langkah." }, CAMPUS),
    Object.assign({ type: "table", topic: "Timeline", title: "Rencana 6 bulan", items: "Bulan 1 :: Proposal & ACC judul\nBulan 2 :: Studi literatur\nBulan 3 :: Metodologi & data\nBulan 4 :: Implementasi\nBulan 5 :: Bab 4 & 5\nBulan 6 :: Revisi & sidang" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Tips", title: "Agar lancar", body: "Komunikasi rutin dengan dosen pembimbing. Jangan menunggu sempurna untuk bertemu." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Mulai", title: "Buat timeline pribadimu", subtitle: "Sesuaikan dengan topik dan kecepatanmu.", button: "Mulai draft 🎓" }, CAMPUS),
  ]}),
  S({ id: "kuliah-online", cat: "university", name: "Kuliah Online", desc: "Tips tetap produktif saat kuliah daring.", slides: [
    Object.assign({ type: "cover", topic: "Online", eyebrow: "KULIAH", title: "**Kuliah Online Tetap Produktif**", subtitle: "Ciptakan ruang dan ritual belajar di rumah." }, MINIMAL),
    Object.assign({ type: "list", topic: "Setup", title: "Setup belajar di rumah", items: "🪑 Meja khusus belajar\n💡 Pencahayaan cukup\n🎧 Headphone untuk fokus\n📵 HP di luar jangkauan\n📝 Catatan tetap ditulis tangan" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Ritual", title: "Bedakan mode kerja & santai", body: "Ganti baju, duduk di meja, mulai timer. Tubuhmu akan mengenali sinyal fokus." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Coba", title: "Rapikan sudut belajarmu", subtitle: "Hari ini, bersihkan meja dan siapkan perlengkapan.", button: "Siapkan ruang 🏠" }, MINIMAL),
  ]}),

  // ── Finansial ──
  S({ id: "budgeting", cat: "finance", name: "Budgeting Pelajar", desc: "Atur uang saku dan pengeluaran.", slides: [
    Object.assign({ type: "cover", topic: "Uang", eyebrow: "FINANSIAL", title: "**Budgeting untuk Pelajar**", subtitle: "Uang saku terbatas tetap bisa cukup." }, MINIMAL),
    Object.assign({ type: "list", topic: "Langkah", title: "3 langkah budgeting", items: "1️⃣ Catat semua pemasukan\n2️⃣ Kelompokkan pengeluaran\n3️⃣ Tetapkan batas per kategori" }, MINIMAL),
    Object.assign({ type: "table", topic: "Contoh", title: "Alokasi uang saku", items: "Makan :: 40%\nTransport :: 20%\nBelanja :: 15%\nTabungan :: 15%\nHiburan :: 10%" }, MINIMAL),
    Object.assign({ type: "cta", topic: "Mulai", title: "Catat pengeluaran hari ini", subtitle: "Aplikasi atau notes, pilih yang nyaman.", button: "Mulai catat 💰" }, MINIMAL),
  ]}),
  S({ id: "investing", cat: "finance", name: "Investasi Pemula", desc: "Kenalan dengan instrumen investasi sederhana.", slides: [
    Object.assign({ type: "cover", topic: "Investasi", eyebrow: "FINANSIAL", title: "**Investasi untuk Pemula**", subtitle: "Mulai dari yang sederhana dan aman." }, MINIMAL),
    Object.assign({ type: "list", topic: "Instrumen", title: "Instrumen pemula", items: "🏦 Tabungan :: paling aman, return rendah\n📈 Reksadana :: diversifikasi, mudah\n🪙 Emas :: lindung nilai jangka panjang\n📊 Saham :: return tinggi, risiko tinggi" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Prinsip", title: "Aturan dasar investasi", body: "Jangan investasi uang yang akan kamu butuhkan dalam waktu dekat." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Belajar", title: "Pelajari satu instrumen dulu", subtitle: "Pahami risiko sebelum mulai.", button: "Mulai belajar 📈" }, MINIMAL),
  ]}),
  S({ id: "saving-money", cat: "finance", name: "Menabung Cepat", desc: "Tips menabung meski penghasilan kecil.", slides: [
    Object.assign({ type: "cover", topic: "Tabungan", eyebrow: "FINANSIAL", title: "**Cara Menabung Lebih Cepat**", subtitle: "Bukan soal besar, tapi soal konsisten." }, WARM),
    Object.assign({ type: "list", topic: "Tips", title: "5 tips menabung", items: "1️⃣ Tabung dulu, habiskan kemudian\n2️⃣ Tentukan tujuan spesifik\n3️⃣ Kurangi pengeluaran kecil\n4️⃣ Cari pemasukan tambahan\n5️⃣ Review keuangan tiap minggu" }, WARM),
    Object.assign({ type: "highlight", topic: "Mindset", title: "Bayar diri sendiri dulu", body: "Sisihkan minimal 10% pemasukan begitu gajian/uang saku masuk." }, WARM),
    Object.assign({ type: "cta", topic: "Mulai", title: "Buka tabungan khusus", subtitle: "Pisahkan uang tabungan dari uang harian.", button: "Mulai nabung 🏦" }, WARM),
  ]}),
  S({ id: "emergency-fund", cat: "finance", name: "Dana Darurat", desc: "Pentingnya dan cara membangun dana darurat.", slides: [
    Object.assign({ type: "cover", topic: "Keamanan", eyebrow: "FINANSIAL", title: "**Dana Darurat: Wajib Punya**", subtitle: "Jaring pengaman sebelum mulai investasi." }, MINIMAL),
    Object.assign({ type: "list", topic: "Target", title: "Target dana darurat", items: "🎯 Pemula :: 1x pengeluaran bulanan\n🎯 Aman :: 3x pengeluaran bulanan\n🎯 Ideal :: 6-12x pengeluaran bulanan" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Prioritas", title: "Sebelum investasi", body: "Pastikan dana darurat sudah terbentuk. Ini melindungi investasi jangka panjangmu." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Hitung", title: "Hitung kebutuhan daruratmu", subtitle: "Total pengeluaran wajib per bulan x target bulan.", button: "Hitung sekarang 🧮" }, MINIMAL),
  ]}),
  S({ id: "rule-503020", cat: "finance", name: "Aturan 50/30/20", desc: "Alokasi keuangan sederhana.", slides: [
    Object.assign({ type: "cover", topic: "Alokasi", eyebrow: "FINANSIAL", title: "**Aturan 50/30/20**", subtitle: "Cara mudah membagi pemasukan." }, MINIMAL),
    Object.assign({ type: "list", topic: "Pembagian", title: "50/30/20 itu apa?", items: "50% :: Kebutuhan (makan, transport, kos)\n30% :: Keinginan (hiburan, jajan)\n20% :: Tabungan & investasi" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Fleksibel", title: "Sesuaikan kondisimu", body: "Pelajar bisa mulai 70/20/10. Yang penting ada alokasi tabungan." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Terapkan", title: "Bagi pemasukan bulan ini", subtitle: "Hitung nominalnya, lalu sisihkan tabungan.", button: "Hitung alokasi 💵" }, MINIMAL),
  ]}),

  // ── Karier ──
  S({ id: "resume-tips", cat: "career", name: "Tips CV", desc: "Membuat resume yang menarik recruiter.", slides: [
    Object.assign({ type: "cover", topic: "CV", eyebrow: "KARIER", title: "**CV yang Dilirik Recruiter**", subtitle: "Jeda 7 detik. Buat setiap detiknya berharga." }, MINIMAL),
    Object.assign({ type: "list", topic: "Struktur", title: "Struktur CV yang efektif", items: "1️⃣ Ringkasan profil singkat\n2️⃣ Pengalaman relevan + hasil\n3️⃣ Skill yang sesuai job desc\n4️⃣ Pendidikan & sertifikasi\n5️⃣ Portofolio/link" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Hasil", title: "Tunjukkan dampak", body: "Jangan hanya tulis tugas. Tulis hasil: ‘Meningkatkan engagement 30%’." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Revisi", title: "Perbarui CV-mu malam ini", subtitle: "Sesuaikan dengan satu lowongan yang kamu incar.", button: "Buka CV 📄" }, MINIMAL),
  ]}),
  S({ id: "interview-prep", cat: "career", name: "Persiapan Wawancara", desc: "Tips lolos wawancara kerja.", slides: [
    Object.assign({ type: "cover", topic: "Interview", eyebrow: "KARIER", title: "**Persiapan Wawancara Kerja**", subtitle: "Persiapan 80%, eksekusi 20%." }, CAMPUS),
    Object.assign({ type: "list", topic: "Persiapan", title: "Cara prepare wawancara", items: "1️⃣ Pelajari perusahaan & role\n2️⃣ Latih STAR method\n3️⃣ Siapkan pertanyaan untuk interviewer\n4️⃣ Ucapkan jawaban dengan suara keras\n5️⃣ Tidur cukup sebelum hari H" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "STAR", title: "Jawab dengan STAR", body: "Situation, Task, Action, Result. Ceritakan pengalaman dengan struktur." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Latihan", title: "Latih 5 pertanyaan umum", subtitle: "Rekam diri sendiri, evaluasi bahasa tubuh dan intonasi.", button: "Mulai latihan 🎤" }, CAMPUS),
  ]}),
  S({ id: "skill-development", cat: "career", name: "Pengembangan Skill", desc: "Strategi belajar skill yang dibutuhkan industri.", slides: [
    Object.assign({ type: "cover", topic: "Skill", eyebrow: "KARIER", title: "**Kembangkan Skill yang Dibutuhkan**", subtitle: "Hard skill buka pintu, soft skill buat kamu bertahan." }, CAMPUS),
    Object.assign({ type: "list", topic: "Framework", title: "T-shaped skills", items: "📌 Keahlian utama (deep)\n📌 Pengetahuan luas (broad)\n📌 Komunikasi\n📌 Problem solving\n📌 Adaptabilitas" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Aksi", title: "Cari tahu skill yang dicari", body: "Buka 10 job desc role impianmu. Catat skill yang paling sering muncul." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Mulai", title: "Pilih satu skill bulan ini", subtitle: "Fokus 30 hari, lalu tunjukkan hasilnya.", button: "Mulai upskill 🚀" }, CAMPUS),
  ]}),
  S({ id: "linkedin-tips", cat: "career", name: "LinkedIn Profile", desc: "Optimalkan profil LinkedIn.", slides: [
    Object.assign({ type: "cover", topic: "LinkedIn", eyebrow: "KARIER", title: "**LinkedIn yang Menarik Opportunity**", subtitle: "Profilmu adalah personal branding 24 jam." }, CAMPUS),
    Object.assign({ type: "list", topic: "Optimasi", title: "Optimasi LinkedIn", items: "1️⃣ Foto profesional\n2️⃣ Headline jelas & spesifik\n3️⃣ About story yang autentik\n4️⃣ Experience dengan hasil\n5️⃣ Aktif posting & berkomentar" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Networking", title: "Bangun relasi sebelum butuh", body: "Jangan baru aktif LinkedIn saat cari kerja. Mulai berbagi insight sekarang." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Update", title: "Perbarui profil LinkedIn-mu", subtitle: "Mulai dari headline dan foto profil.", button: "Buka LinkedIn 💼" }, CAMPUS),
  ]}),
  S({ id: "portfolio", cat: "career", name: "Portofolio", desc: "Membangun portofolio yang meyakinkan.", slides: [
    Object.assign({ type: "cover", topic: "Portfolio", eyebrow: "KARIER", title: "**Portofolio yang Bicara**", subtitle: "Tunjukkan bukan hanya skill, tapi cara berpikir." }, MINIMAL),
    Object.assign({ type: "list", topic: "Struktur", title: "Struktur case study", items: "1️⃣ Konteks & masalah\n2️⃣ Peran & tanggung jawab\n3️⃣ Proses & keputusan\n4️⃣ Hasil & dampak\n5️⃣ Pelajaran" }, MINIMAL),
    Object.assign({ type: "highlight", topic: "Kualitas", title: "Lebih baik sedikit, tapi kuat", body: "3 project bagus lebih baik dari 10 project setengah-setengah." }, MINIMAL),
    Object.assign({ type: "cta", topic: "Mulai", title: "Dokumentasikan satu project", subtitle: "Pilih project terbaik, tulis case study lengkap.", button: "Mulai portofolio 🌟" }, MINIMAL),
  ]}),

  // ── Bisnis ──
  S({ id: "marketing", cat: "business", name: "Marketing Dasar", desc: "Konsep dasar marketing untuk pemula.", slides: [
    Object.assign({ type: "cover", topic: "Marketing", eyebrow: "BISNIS", title: "**Marketing 101**", subtitle: "Bukan sekadar jualan, tapi memahami pelanggan." }, SUNSET),
    Object.assign({ type: "list", topic: "4P", title: "Marketing Mix 4P", items: "Product :: apa yang kamu jual?\nPrice :: berapa harganya?\nPlace :: di mana dijual?\nPromotion :: bagaimana dikenal?" }, SUNSET),
    Object.assign({ type: "highlight", topic: "Fokus", title: "Mulai dari masalah", body: "Produk terbaik adalah solusi untuk masalah yang benar-benar dialami pelanggan." }, SUNSET),
    Object.assign({ type: "cta", topic: "Aksi", title: "Identifikasi masalah pelanggan", subtitle: "Wawancara 3 calon pelanggan, catat pain points-nya.", button: "Mulai riset 🎯" }, SUNSET),
  ]}),
  S({ id: "branding", cat: "business", name: "Personal Branding", desc: "Membangun brand pribadi yang kuat.", slides: [
    Object.assign({ type: "cover", topic: "Branding", eyebrow: "BISNIS", title: "**Personal Branding**", subtitle: "Orang percaya pada orang, bukan hanya produk." }, SUNSET),
    Object.assign({ type: "list", topic: "Pilar", title: "3 pilar personal branding", items: "1️⃣ Keahlian yang bisa dibuktikan\n2️⃣ Narasi & nilai yang konsisten\n3️⃣ Kehadiran di platform yang tepat" }, SUNSET),
    Object.assign({ type: "highlight", topic: "Konsistensi", title: "Brand = janji yang konsisten", body: "Setiap konten, interaksi, dan hasil kerja harus mencerminkan nilai yang kamu bangun." }, SUNSET),
    Object.assign({ type: "cta", topic: "Mulai", title: "Tentukan 3 topik keahlianmu", subtitle: "Fokus pada niche yang ingin dikenal.", button: "Tentukan niche 🎨" }, SUNSET),
  ]}),
  S({ id: "content-strategy", cat: "business", name: "Strategi Konten", desc: "Merencanakan konten yang konsisten.", slides: [
    Object.assign({ type: "cover", topic: "Konten", eyebrow: "BISNIS", title: "**Strategi Konten Konsisten**", subtitle: "Rencana matang, eksekusi rutin, evaluasi berkala." }, SUNSET),
    Object.assign({ type: "list", topic: "Framework", title: "Content pillars", items: "🎓 Edukasi :: ajarkan sesuatu\n🤝 Engagement :: ajak berdiskusi\n💼 Authority :: tunjukkan keahlian\n🛒 Promosi :: tawarkan produk" }, SUNSET),
    Object.assign({ type: "highlight", topic: "Rasio", title: "Rasio konten ideal", body: "80% value, 20% promosi. Jual setelah memberi banyak nilai." }, SUNSET),
    Object.assign({ type: "cta", topic: "Rencana", title: "Buat content plan mingguan", subtitle: "Tentukan 3 pillars untuk minggu ini.", button: "Buat jadwal 📅" }, SUNSET),
  ]}),
  S({ id: "customer-journey", cat: "business", name: "Customer Journey", desc: "Memahami perjalanan pelanggan.", slides: [
    Object.assign({ type: "cover", topic: "Journey", eyebrow: "BISNIS", title: "**Customer Journey**", subtitle: "Dari tidak tahu sampai jadi pelanggan setia." }, SUNSET),
    Object.assign({ type: "list", topic: "Tahap", title: "5 tahap customer journey", items: "1️⃣ Awareness :: tahu ada masalah\n2️⃣ Consideration :: cari solusi\n3️⃣ Decision :: pilih produk\n4️⃣ Retention :: pakai lagi\n5️⃣ Advocacy :: rekomendasikan" }, SUNSET),
    Object.assign({ type: "highlight", topic: "Optimasi", title: "Perbaiki titik lemah", body: "Cari tahu di tahap mana banyak orang berhenti, lalu perbaiki pengalaman di sana." }, SUNSET),
    Object.assign({ type: "cta", topic: "Mapping", title: "Gambar journey pelangganmu", subtitle: "Tulis 1-2 touchpoint di setiap tahap.", button: "Mulai mapping 🗺️" }, SUNSET),
  ]}),
  S({ id: "value-proposition", cat: "business", name: "Value Proposition", desc: "Menyusun nilai unik produk/jasa.", slides: [
    Object.assign({ type: "cover", topic: "Value", eyebrow: "BISNIS", title: "**Value Proposition**", subtitle: "Mengapa pelanggan harus memilihmu?" }, SUNSET),
    Object.assign({ type: "list", topic: "Canvas", title: "Value proposition canvas", items: "🎯 Customer jobs :: apa yang ingin dicapai?\n😣 Pains :: masalah yang dialami\n😊 Gains :: manfaat yang diinginkan\n💡 Your solution :: bagaimana kamu membantu?" }, SUNSET),
    Object.assign({ type: "highlight", topic: "Klaritas", title: "Jelaskan dalam satu kalimat", body: "Kami membantu [siapa] untuk [masalah] dengan [solusi] sehingga [hasil]." }, SUNSET),
    Object.assign({ type: "cta", topic: "Buat", title: "Tulis value proposition-mu", subtitle: "Uji ke 3 orang, apakah mereka paham?", button: "Mulai draft ✍️" }, SUNSET),
  ]}),

  // ── Motivasi & Progress ──
  S({ id: "growth-mindset", cat: "motivasi", name: "Growth Mindset", desc: "Pola pikir yang membuatmu terus berkembang.", slides: [
    Object.assign({ type: "cover", topic: "Mindset", eyebrow: "MOTIVASI", title: "**Growth Mindset**", subtitle: "Skill bukan bawaan lahir, tapi hasil latihan." }, FOREST),
    Object.assign({ type: "compare", topic: "Fixed vs Growth", title: "Fixed vs Growth Mindset", colA: "Growth mindset", itemsA: "✅ Usaha = hasil\n✅ Gagal = belajar\n✅ Terima feedback", colB: "Fixed mindset", itemsB: "❌ Talent = batas\n❌ Gagal = aib\n❌ Hindari tantangan" }, FOREST),
    Object.assign({ type: "highlight", topic: "Latihan", title: "Ganti kata-katamu", body: "Dari ‘aku nggak bisa’ jadi ‘aku belum bisa’. Satu kata, dampak besar." }, FOREST),
    Object.assign({ type: "cta", topic: "Mulai", title: "Tantang dirimu minggu ini", subtitle: "Pilih satu hal yang selama ini kamu hindari.", button: "Terima tantangan 🌱" }, FOREST),
  ]}),
  S({ id: "daily-habits", cat: "motivasi", name: "Kebiasaan Sukses", desc: "Habit kecil yang membawa hasil besar.", slides: [
    Object.assign({ type: "cover", topic: "Habit", eyebrow: "MOTIVASI", title: "**Kebiasaan Kecil, Hasil Besar**", subtitle: "Sukses adalah hasil dari rutinitas yang terus diulang." }, WARM),
    Object.assign({ type: "list", topic: "Habits", title: "5 kebiasaan produktif", items: "1️⃣ Bangun jam sama setiap hari\n2️⃣ Tulis 3 prioritas\n3️⃣ Blok waktu fokus\n4️⃣ Review hari sebelum tidur\n5️⃣ Tidur cukup" }, WARM),
    Object.assign({ type: "highlight", topic: "Konsistensi", title: "1% lebih baik setiap hari", body: "Perbaikan kecil yang konsisten akan mengalahkan lonjakan besar yang tidak bertahan." }, WARM),
    Object.assign({ type: "cta", topic: "Pilih", title: "Pilih satu habit baru", subtitle: "Lakukan selama 21 hari, lalu tambah habit berikutnya.", button: "Mulai habit 🔄" }, WARM),
  ]}),
  S({ id: "discipline", cat: "motivasi", name: "Disiplin", desc: "Motivasi pudar, disiplin bertahan.", slides: [
    Object.assign({ type: "cover", topic: "Disiplin", eyebrow: "MOTIVASI", title: "**Motivasi Pudar, Disiplin Bertahan**", subtitle: "Bangun sistem, bukan andalkan mood." }, FOREST),
    Object.assign({ type: "list", topic: "Sistem", title: "Cara membangun disiplin", items: "1️⃣ Jadikan kebiasaan mudah dimulai\n2️⃣ Buat lingkungan mendukung\n3️⃣ Pantau streak harian\n4️⃣ Punya accountability partner\n5️⃣ Reward diri setelah milestone" }, FOREST),
    Object.assign({ type: "highlight", topic: "Identitas", title: "Jadi tipe orang yang…", body: "Jangan bilang ‘aku harus belajar’. Bilang ‘aku adalah tipe orang yang belajar setiap hari’." }, FOREST),
    Object.assign({ type: "cta", topic: "Mulai", title: "Lakukan 1 hal kecil hari ini", subtitle: "Tidak perlu sempurna, yang penting konsisten.", button: "Lakukan sekarang 💪" }, FOREST),
  ]}),
  S({ id: "success-story", cat: "motivasi", name: "Kisah Sukses", desc: "Template berbagi cerita inspiratif.", slides: [
    Object.assign({ type: "cover", topic: "Story", eyebrow: "MOTIVASI", title: "**Dari Gagal ke Berhasil**", subtitle: "Cerita perjalanan yang menginspirasi." }, WARM),
    Object.assign({ type: "list", topic: "Struktur", title: "Struktur storytelling", items: "1️⃣ Latar belakang & struggle\n2️⃣ Titik balik\n3️⃣ Tindakan yang diambil\n4️⃣ Hasil yang dicapai\n5️⃣ Pelajaran untuk pembaca" }, WARM),
    Object.assign({ type: "highlight", topic: "Autentik", title: "Jangan takut cerita gagal", body: "Kisah kegagalan seringkali lebih menginspirasi daripada kisah kesuksesan instan." }, WARM),
    Object.assign({ type: "cta", topic: "Bagikan", title: "Bagikan kisahmu", subtitle: "Satu cerita bisa mengubah hari seseorang.", button: "Tulis cerita 📖" }, WARM),
  ]}),
  S({ id: "quotes", cat: "motivasi", name: "Kutipan Motivasi", desc: "Template quote card estetik.", slides: [
    Object.assign({ type: "cover", topic: "Quote", eyebrow: "MOTIVASI", title: "**Kutipan Hari Ini**", subtitle: "Satu kalimat yang mengingatkanmu untuk terus maju." }, FOREST),
    Object.assign({ type: "highlight", topic: "Quote", title: "‘Jangan menunggu mood. Bangun disiplin.’", body: "— Unknown" }, FOREST),
    Object.assign({ type: "highlight", topic: "Refleksi", title: "Apa artinya bagimu?", body: "Tulis satu tindakan kecil yang bisa kamu lakukan hari ini berdasarkan kutipan ini." }, FOREST),
    Object.assign({ type: "cta", topic: "Bagikan", title: "Bagikan ke temanmu", subtitle: "Siapa tahu mereka juga butuh semangat.", button: "Share sekarang ✨" }, FOREST),
  ]}),

  // ── UTBK & Infografis tambahan ──
  S({ id: "utbk-tps", cat: "utbk", name: "Panduan TPS", desc: "Struktur dan tips TPS UTBK.", slides: [
    Object.assign({ type: "cover", topic: "UTBK", eyebrow: "TPS", title: "**Panduan Lengkap TPS UTBK**", subtitle: "Kenali subtes, strategi, dan pola latihan." }, CAMPUS),
    Object.assign({ type: "list", topic: "Subtes", title: "4 subtes TPS", items: "PU :: Penalaran Umum\nPPU :: Pengetahuan & Penalaran Umum\nPK :: Pengetahuan Kuantitatif\nLBI :: Literasi Bahasa Indonesia\nLBE :: Literasi Bahasa Inggris" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Strategi", title: "Kunci TPS", body: "Bukan hanya pintar, tapi cepat dan teliti. Latih soal dengan timer setiap hari." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Latihan", title: "Kerjakan 20 soal TPS hari ini", subtitle: "Catat waktu dan review kesalahan.", button: "Mulai latihan 📝" }, CAMPUS),
  ]}),
  S({ id: "utbk-tka", cat: "utbk", name: "Panduan TKA", desc: "Struktur dan tips TKA Saintek/Soshum.", slides: [
    Object.assign({ type: "cover", topic: "UTBK", eyebrow: "TKA", title: "**Panduan TKA UTBK**", subtitle: "Saintek atau Soshum, persiapkan dengan fokus." }, CAMPUS),
    Object.assign({ type: "list", topic: "Saintek", title: "TKA Saintek", items: "Matematika\nFisika\nKimia\nBiologi" }, CAMPUS),
    Object.assign({ type: "list", topic: "Soshum", title: "TKA Soshum", items: "Matematika\nGeografi\nSejarah\nSosiologi\nEkonomi" }, CAMPUS),
    Object.assign({ type: "cta", topic: "Fokus", title: "Pilih paket latihan sesuai jurusan", subtitle: "Kuasai konsep dasar dulu, baru ke soal sulit.", button: "Mulai belajar 📚" }, CAMPUS),
  ]}),
  S({ id: "study-schedule", cat: "utbk", name: "Jadwal Belajar UTBK", desc: "Template jadwal harian UTBK.", slides: [
    Object.assign({ type: "cover", topic: "Jadwal", eyebrow: "UTBK", title: "**Jadwal Belajar UTBK Harian**", subtitle: "Konsisten tiap hari lebih baik dari marathon semalam." }, CAMPUS),
    Object.assign({ type: "table", topic: "Jadwal", title: "Contoh jadwal", items: "06:00-07:00 :: Review materi kemarin\n07:00-09:00 :: Latihan soal PU\n09:00-09:30 :: Istirahat\n09:30-11:30 :: Latihan soal PK\n13:00-15:00 :: Pembahasan & catat\n19:00-20:00 :: Drill 20 soal" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Tips", title: "Sesuaikan energimu", body: "Kerjakan subtes tersulit saat energi tertinggi, biasanya pagi hari." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Mulai", title: "Buat jadwal versimu", subtitle: "Cetak dan tempel di meja belajar.", button: "Buat jadwal 📅" }, CAMPUS),
  ]}),
  S({ id: "tryout-review", cat: "utbk", name: "Review Tryout", desc: "Evaluasi hasil tryout UTBK.", slides: [
    Object.assign({ type: "cover", topic: "Tryout", eyebrow: "UTBK", title: "**Cara Review Tryout yang Efektif**", subtitle: "Jangan hanya lihat skor, lihat pola kesalahan." }, CAMPUS),
    Object.assign({ type: "list", topic: "Langkah", title: "4 langkah review", items: "1️⃣ Catat skor per subtes\n2️⃣ Identifikasi tipe soal yang salah\n3️⃣ Cari tahu alasannya (konsep/waktu/ceroboh)\n4️⃣ Buat daftar materi yang harus diperbaiki" }, CAMPUS),
    Object.assign({ type: "table", topic: "Analisis", title: "Contoh analisis", items: "PU :: 65% :: kesalahan logika\nPK :: 50% :: rumus belang\nLBI :: 70% :: detail bacaan" }, CAMPUS),
    Object.assign({ type: "cta", topic: "Aksi", title: "Review tryout terakhirmu", subtitle: "Jangan lanjut ke tryout baru sebelum yang lama tuntas.", button: "Mulai review 🔍" }, CAMPUS),
  ]}),
  S({ id: "infografis-metode", cat: "infografis", name: "Metode Belajar", desc: "Infografis perbandingan metode belajar.", slides: [
    Object.assign({ type: "cover", topic: "Infografis", eyebrow: "BELAJAR", title: "**Metode Belajar Populer**", subtitle: "Cari tahu metode yang paling cocok untukmu." }, NOTEBOOK),
    Object.assign({ type: "table", topic: "Perbandingan", title: "Metode vs efektivitas", items: "Active Recall :: Sangat tinggi\nSpaced Repetition :: Sangat tinggi\nPomodoro :: Tinggi\nRereading :: Rendah\nHighlight :: Rendah" }, NOTEBOOK),
    Object.assign({ type: "highlight", topic: "Kombinasi", title: "Kombinasi terbaik", body: "Active Recall + Spaced Repetition + Pomodoro = belajar efisien dan ingat lama." }, NOTEBOOK),
    Object.assign({ type: "cta", topic: "Coba", title: "Coba kombinasi ini minggu ini", subtitle: "Catat perbedaan pemahaman dan retensimu.", button: "Mulai eksperimen 🧪" }, NOTEBOOK),
  ]}),
  S({ id: "infografis-otak", cat: "infografis", name: "Cara Kerja Otak", desc: "Infografis memori dan belajar.", slides: [
    Object.assign({ type: "cover", topic: "Neuroscience", eyebrow: "INFOGRAFIS", title: "**Cara Otak Menyimpan Pelajaran**", subtitle: "Pahami otak, belajar jadi lebih efektif." }, STEM),
    Object.assign({ type: "list", topic: "Proses", title: "3 tahap memori", items: "1️⃣ Encoding :: informasi masuk\n2️⃣ Storage :: informasi disimpan\n3️⃣ Retrieval :: informasi diambil kembali" }, STEM),
    Object.assign({ type: "highlight", topic: "Tips", title: "Retrieval practice", body: "Semakin sering kamu mengambil kembali informasi, semakin kuat jalur ingatan." }, STEM),
    Object.assign({ type: "cta", topic: "Terapkan", title: "Latih retrieval hari ini", subtitle: "Tutup catatan, tulis semua yang ingat.", button: "Mulai latihan 🧠" }, STEM),
  ]}),
];

export function presetById(id) { return PRESETS.find((p) => p.id === id) || null; }
