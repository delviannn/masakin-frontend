# Flowchart MASAKin

## Alur navigasi aplikasi

MASAKin langsung menampilkan Beranda tanpa proses login. Setelah melihat halaman
yang dipilih, pengguna dapat memilih menu lain atau meninggalkan aplikasi.

```mermaid
flowchart TD
    A([Mulai]) --> B[Tampilkan Beranda]
    B --> C{Pilih menu}

    C -->|Beranda| D[Tampilkan ringkasan, resep terbaru, dan favorit]
    C -->|Resep| E[Tampilkan daftar, pencarian, dan filter resep]
    C -->|Kategori| F[Tampilkan dan kelola kategori]
    C -->|Favorit| G[Tampilkan resep favorit]
    C -->|Daftar Belanja| H[Tampilkan dan kelola daftar belanja]
    C -->|Laporan| I[Tampilkan ringkasan dan laporan]
    C -->|Profil Lokal| J[Tampilkan profil lokal]

    D -->|Cari resep| E
    D -->|Tambah resep| M[Ikuti flowchart tambah atau edit resep]
    E -->|Buka resep| R[Tampilkan detail resep]
    E -->|Tambah atau edit resep| M
    R -->|Tambah bahan ke belanja| H
    R -->|Tandai atau hapus favorit| G
    R -->|Bagikan resep| S[Bagikan nama resep]
    S --> R
    R -->|Kembali ke daftar resep| E

    D --> K{Lanjut menggunakan aplikasi?}
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    K -->|Ya, pilih menu lain| C
    K -->|Tidak| L([Selesai])

    M --> E
```

## Alur tambah atau edit resep

Form yang sama digunakan untuk menambah resep baru maupun mengedit resep yang
sudah ada. Nama resep dan kategori wajib diisi. Foto bersifat opsional dan
dibatasi maksimal 2 MB. Data disimpan di `localStorage` browser, bukan database
server, sehingga perubahan hanya tersedia di browser/perangkat tersebut.

```mermaid
flowchart TD
    A([Mulai]) --> B{Pilih tindakan}
    B -->|Tambah| C[Buka formulir resep baru]
    B -->|Edit| D[Pilih resep lalu buka formulir edit]
    C --> E[Isi nama, kategori, porsi, waktu, deskripsi, bahan, dan langkah]
    D --> E
    E --> F[Validasi formulir oleh browser]
    F --> G{Nama dan kategori valid?}
    G -->|Tidak| H[Tampilkan validasi browser]
    H --> E
    G -->|Ya| I{Foto dipilih?}
    I -->|Tidak| M[Simpan tanpa foto baru, pertahankan foto lama jika edit]
    I -->|Ya| J{Ukuran foto lebih dari 2 MB?}
    J -->|Ya| K[Tampilkan pesan batas ukuran]
    K --> E
    J -->|Tidak| L[Baca foto di browser]
    L --> N[Simpan data resep ke localStorage]
    M --> N
    N --> O[Tampilkan notifikasi berhasil]
    O --> P[Kembali ke daftar resep]
    P --> Q([Selesai])
```
