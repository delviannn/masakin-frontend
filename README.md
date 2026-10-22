# MASAKin — Buku Resep & Menu Masakan Keluarga

Frontend **statis** (tanpa build step, tanpa framework) untuk aplikasi buku resep
keluarga. Dibangun dari wireframe `titel.html` — tampilan mengikuti palet dan tata
letak wireframe, tapi strukturnya dipisah menjadi CSS + JS supaya gampang dikembangkan
dan di-review.

🔗 **Live preview:** https://delviannn.github.io/masakin-frontend/

---

## Cara menjalankan

Tidak perlu install apa pun.

**Cara paling gampang:** double-click `index.html`.

**Cara yang direkomendasikan** (server lokal, biar tidak ada batasan browser):

```bash
# dari folder project
npx serve .          # lalu buka http://localhost:3000
# atau
python -m http.server 8000   # lalu buka http://localhost:8000
```

> Semua data disimpan di `localStorage` browser. Menghapus data site akan menghapus
> resep, kategori, dan daftar belanja.

---

## Struktur folder

```
masakin-frontend/
├── index.html            # titik masuk, cuma nge-load CSS + 3 file JS
├── styles/
│   └── styles.css        # design system (palet, layout, komponen, responsive)
├── scripts/
│   ├── store.js          # state + localStorage + data contoh
│   ├── views.js          # fungsi render tiap halaman (mengembalikan HTML string)
│   └── app.js            # controller: routing, event, aksi CRUD
└── README.md
```

Pemisahan ini sengaja: `views.js` cuma urus tampilan, `app.js` cuma urus logika.
Kalau mau pindah ke React/Vue/Next, `views.js` bisa dipetakan jadi komponen.

---

## Fitur

| Halaman | Isi |
|---|---|
| Login / Daftar | Form auth (demo, belum tersambung server) |
| Beranda | Statistik, resep terbaru, menu favorit, pencarian |
| Resep | Daftar resep + cari & filter kategori, tambah/edit/hapus |
| Detail Resep | Foto, info, daftar bahan, langkah memasak, favorit, bagikan, tambah ke belanja |
| Form Resep | Tambah/edit resep, dynamic field bahan & langkah, upload foto |
| Kategori | Tabel kategori + jumlah resep, tambah/edit/hapus |
| Favorit | Kumpulan resep yang ditandai ☆ |
| Daftar Belanja | Bahan gabungan dari resep, checkbox, cetak, kosongkan |
| Laporan | Total resep/kategori, bar chart per kategori, daftar favorit, cetak |
| Profil | Nama, email, foto, ganti password (demo), logout |

---

## Catatan untuk kolaborasi

- **Tanpa build step** — `git clone` lalu buka `index.html`, langsung jalan.
- **Tidak ada dependensi** — jadi tidak perlu `npm install`.
- Data contoh ada di `scripts/store.js` (`initialRecipes`). Kalau `localStorage` sudah
  berisi data, data contoh tidak dipakai.
- Semua teks keluar-masuk halaman lewat `esc()` di `views.js` supaya aman dari XSS.
- Responsive: sidebar jadi menu geser di bawah 700px.
- Kontribusi: baca [`CONTRIBUTING.md`](CONTRIBUTING.md) — isinya perintah `git`
  langkah demi langkah untuk kawan yang ikut mengembangkan repo ini. Singkatnya:
  kerja di branch baru (`git checkout -b fitur/nama-fitur`), jangan commit langsung
  ke `main`.

---

## Ide pengembangan berikutnya

- Sambungkan ke backend (API resep + autentikasi sungguhan).
- Pindah ke React/Next.js dengan state management.
- Komentar & rating resep antar anggota keluarga.
- Ekspor resep ke PDF.
