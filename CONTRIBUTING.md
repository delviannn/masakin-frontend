# Panduan Push untuk Kawan

Repo ini **tidak pakai build step dan tidak punya dependensi** — setelah `clone`,
langsung bisa dibuka dan dijalankan. Tidak perlu `npm install`.

---

## Sekali saja (saat pertama ikut)

```bash
# 1. clone
git clone https://github.com/delviannn/masakin-frontend.git
cd masakin-frontend

# 2. pasang identitas (kalau belum pernah di laptop ini)
git config --global user.name "Nama Kawan"
git config --global user.email "email@kawan.com"
```

> Kalau dia pakai **fork**, ganti URL clone dengan repo miliknya sendiri:
> `git clone https://github.com/namakawan/masakin-frontend.git`
> lalu tambahkan repo kamu sebagai `upstream` supaya mudah menarik update terbaru:
> ```bash
> git remote add upstream https://github.com/delviannn/masakin-frontend.git
> git fetch upstream
> ```

## Alur kerja setiap kali mau mengubah kode

**Selalu kerja di branch baru. Jangan commit langsung ke `main`.**

```bash
# 1. pastikan main ikut update
git checkout main
git pull origin main

# 2. buat branch baru
git checkout -b fitur/nama-fitur

# 3. ubah kodenya, lalu cek apa yang berubah
git status
git diff

# 4. simpan perubahan
git add .
git commit -m "feat: jelaskan fiturnya"

# 5. dorong ke GitHub
git push -u origin fitur/nama-fitur
```

Setelah `push`, muncul link di terminal untuk membuka Pull Request — klik, atau
buka halaman repo → tab **Pull requests** → **New pull request**.

## Kalau push ditolak karena main sudah berubah

```bash
git fetch origin
git rebase origin/main      # atau: git merge origin/main
# selesaikan konflik kalau ada, lalu:
git push
```

## Cara menjalankan project ini di laptopnya

```bash
npx serve .                   # lalu buka http://localhost:3000
# atau
python -m http.server 8000    # lalu buka http://localhost:8000
```

Atau paling gampang: double-click `index.html`.

## Yang perlu diperhatikan

- **Autentikasi:** Git for Windows sudah membawa Git Credential Manager. Saat push
  pertama, akan muncul popup login browser GitHub. Itu saja, tidak perlu token.
- **Jangan commit** `node_modules/`, file `.log`, atau `.DS_Store` — sudah di-ignore.
- **Teks yang masuk ke halaman** harus lewat `esc()` di `scripts/views.js`. Kalau
  menambah tempat baru yang menampilkan input pengguna, pakai helper itu.
- **Struktur file:** `styles/` untuk tampilan, `scripts/store.js` untuk data,
  `scripts/views.js` untuk halaman, `scripts/app.js` untuk logika. Kalau menambah
  halaman, daftarkan di `pages()` pada `scripts/app.js`.

## Pesan commit yang dipakai di repo ini

```
feat: menambah fitur
fix: memperbaiki bug
docs: mengubah README / komentar
refactor: merapikan kode tanpa mengubah perilaku
style: mengubah tampilan
```

---

Butuh bantuan? Buat issue baru di repo ini (tab **Issues** → **New issue**).
