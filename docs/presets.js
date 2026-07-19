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

export const PRESET_CATEGORIES = [
  { id: "utbk", label: "UTBK & SNBT" },
  { id: "mapel", label: "Mata Pelajaran" },
  { id: "ujian", label: "Persiapan Ujian" },
  { id: "bimbel", label: "Bimbel & Promo" },
  { id: "infografis", label: "Infografis Belajar" },
  { id: "flashcard", label: "Flashcard" },
  { id: "qna", label: "Kuis & Q&A" },
  { id: "motivasi", label: "Motivasi" },
  { id: "progress", label: "Progress Tracker" },
];

export const PRESETS = [
  /* ---------------- UTBK ---------------- */
  S({ id: "utbk-tips", cat: "utbk", name: "Tips UTBK", desc: "Hook + 5 tips + CTA — gaya kampus navy.", slides: [
    Object.assign({ type: "cover", topic: "UTBK 2026", eyebrow: "WAJIB TAHU", title: "5 Kebiasaan Kecil yang Naikin Skor **UTBK**", subtitle: "Bukan soal belajar lebih lama — tapi belajar lebih benar." }, CAMPUS),
    Object.assign({ type: "list", topic: "Tips", title: "Mulai dari sini", items: "⏰ Belajar 25 menit :: teknik pomodoro, istirahat 5 menit\n📝 Latihan soal tiap hari :: minimal 10 soal campuran\n📊 Review salah :: catat KENAPA salah, bukan cuma jawabannya\n😴 Tidur cukup :: memori dikunci waktu tidur\n📵 Jauhkan HP :: 1 notifikasi = 20 menit fokus hilang" }, CAMPUS),
    Object.assign({ type: "highlight", topic: "Ingat", eyebrow: "PALING PENTING", title: "Konsisten **15 hari** ngalahin sistem kebut **1 malam**.", subtitle: "Otak butuh pengulangan berkala, bukan panik massal." }, CAMPUS),
    Object.assign({ type: "cta", topic: "Closing", title: "Simpan &amp; mulai **hari ini**", subtitle: "Share ke teman seperjuangan UTBK-mu.", button: 'Komen "GAS" buat jadwal belajarnya 👇' }, CAMPUS),
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
];

export function presetById(id) { return PRESETS.find((p) => p.id === id) || null; }
