/* ==========================================================================
   MASAKin — views (render functions).
   Setiap fungsi mengembalikan string HTML; state ada di store.js.
   ========================================================================== */

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

/** placeholder thumbnail — kalau resep punya foto, tampilkan fotonya. */
function thumb(recipe, extraClass = "") {
  if (recipe.photo) {
    return `<div class="food-placeholder ${extraClass}"><img src="${esc(recipe.photo)}" alt="Foto ${esc(recipe.name)}" loading="lazy"></div>`;
  }
  return `<div class="food-placeholder ${extraClass}">Thumbnail foto masakan</div>`;
}

function recipeCard(r, options = {}) {
  return `<article class="card recipe-card">
    ${thumb(r)}
    <div class="card-body">
      <h3>${esc(r.name)}</h3>
      <div class="recipe-meta"><span class="tag">${esc(r.category)}</span> · ${r.time} menit · ${r.servings} porsi</div>
      <div class="actions">
        <button class="btn small-btn primary" data-action="open" data-id="${r.id}">${options.detailLabel || "Detail"}</button>
        ${options.edit ? `<button class="btn small-btn" data-action="edit" data-id="${r.id}">Edit</button><button class="btn small-btn danger" data-action="delete" data-id="${r.id}">Hapus</button>` : ""}
        ${options.favorite ? `<button class="btn small-btn" data-action="unfavorite" data-id="${r.id}">Hapus Favorit</button>` : ""}
      </div>
    </div>
  </article>`;
}

/* ---------- Shell -------------------------------------------------------- */

const navItems = [
  ["dashboard", "⌂", "Beranda"], ["recipes", "▤", "Resep"], ["categories", "▦", "Kategori"],
  ["favorites", "☆", "Favorit"], ["shopping", "☷", "Daftar Belanja"],
  ["reports", "▥", "Laporan"], ["profile", "○", "Profil"]
];

function shell(content) {
  const favoriteCount = recipes.filter(r => r.favorite).length;
  const navHtml = navItems.map(([id, icon, label]) => {
    const badge = id === "favorites" && favoriteCount ? `<span class="nav-badge">${favoriteCount}</span>` : "";
    return `<button class="nav-link ${page === id ? "active" : ""}" data-action="nav" data-page="${id}">
      <span class="nav-icon">${icon}</span>${label}${badge}</button>`;
  }).join("");

  return `<div class="app-shell">
    ${sidebarOpen ? `<div class="backdrop" data-action="close-menu"></div>` : ""}
    <aside class="sidebar ${sidebarOpen ? "open" : ""}" id="sidebar">
      <div class="brand"><img class="brand-logo" src="assets/logo-masakin.jpeg" alt="Logo MASAKin"></div>
      <p class="nav-section-label">Menu</p>
      <nav class="nav-list" aria-label="Navigasi utama">${navHtml}</nav>
      <div class="sidebar-note"><strong>Aplikasi umum</strong><br>Data tersimpan di perangkat ini</div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="row">
          <button class="btn mobile-menu" data-action="open-menu" aria-label="Buka menu">☰</button>
          <img class="topbar-logo" src="assets/logo-masakin.jpeg" alt="">
          <span class="topbar-title">MASAKin</span>
        </div>
        <div class="topbar-right">
          <span class="muted small">${esc(profile.name)}</span>
          <button class="avatar" data-action="nav" data-page="profile" aria-label="Buka profil">
            ${profile.photo ? `<img src="${esc(profile.photo)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : esc(profile.name.charAt(0).toUpperCase())}
          </button>
        </div>
      </header>
      <section class="content">${content}</section>
    </main>
  </div>`;
}

/* ---------- Dashboard ---------------------------------------------------- */

function dashboard() {
  const latest = [...recipes].slice(-3).reverse();
  const favorites = recipes.filter(r => r.favorite).slice(0, 3);
  const cards = [
    ["Jumlah resep", recipes.length, "Resep keluarga tersimpan"],
    ["Kategori", categories.length, "Kelompok resep"],
    ["Resep favorit", recipes.filter(r => r.favorite).length, "Ditandai keluarga"],
    ["Daftar belanja", shopping.length, "Bahan yang perlu disiapkan"]
  ];

  return `<h1 class="page-heading">Beranda</h1>
    <p class="subtitle">Kelola resep dan rencanakan menu keluarga dari satu tempat.</p>
    <form class="search-row" id="search-form">
      <label>Cari resep<input class="input" name="q" placeholder="Cari resep berdasarkan nama, kategori, atau bahan…"></label>
      <button class="btn primary" type="submit">Cari resep</button>
      <button type="button" class="btn" data-action="new">＋ Tambah resep</button>
    </form>
    <div class="grid grid-4" style="margin-bottom:24px">
      ${cards.map(([label, value, note]) => `<div class="card"><div class="muted">${label}</div><div class="stat-value">${value}</div><span class="small muted">${note}</span></div>`).join("")}
    </div>
    <div class="grid grid-2">
      <section>
        <div class="row between"><h2 class="section-title">Resep terbaru</h2><button class="link-btn" data-action="nav" data-page="recipes">Lihat semua</button></div>
        <div class="grid">${latest.length ? latest.map(r => recipeCard(r)).join("") : `<div class="notice">Belum ada resep.</div>`}</div>
      </section>
      <section>
        <div class="row between"><h2 class="section-title">Menu favorit</h2><button class="link-btn" data-action="nav" data-page="favorites">Lihat semua</button></div>
        <div class="grid">${favorites.length ? favorites.map(r => recipeCard(r)).join("") : `<div class="notice">Tandai resep sebagai favorit untuk ditampilkan di sini.</div>`}</div>
      </section>
    </div>`;
}

/* ---------- Daftar resep ------------------------------------------------- */

function recipeList() {
  const filtered = recipes.filter(r => {
    const text = [r.name, r.category, r.description, ...r.ingredients.map(i => i.name)].join(" ").toLowerCase();
    return text.includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "Semua kategori" || r.category === categoryFilter);
  });

  return `<div class="row between"><div><h1 class="page-heading">Daftar Resep</h1><p class="subtitle">Cari, lihat, dan kelola resep keluarga.</p></div>
    <button class="btn primary" data-action="new">＋ Tambah resep</button></div>
    <form class="search-row" id="filter-form">
      <label>Cari resep<input class="input" name="q" value="${esc(searchTerm)}" placeholder="Cari nama resep atau bahan…"></label>
      <label>Kategori<select name="category">${["Semua kategori", ...categories].map(c => `<option ${c === categoryFilter ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>
      <button class="btn" type="submit">Cari / Filter</button>
    </form>
    <p class="small muted">${filtered.length} resep ditemukan${searchTerm ? ` untuk “${esc(searchTerm)}”` : ""}.</p>
    ${filtered.length ? `<div class="grid grid-3">${filtered.map(r => recipeCard(r, { edit: true })).join("")}</div>` : `<div class="notice">Tidak ada resep yang cocok dengan pencarian.</div>`}`;
}

/* ---------- Detail resep ------------------------------------------------- */

function recipeDetail() {
  const r = recipeById(selectedId);
  if (!r) return `<div class="notice">Resep tidak ditemukan. <button class="link-btn" data-action="nav" data-page="recipes">Kembali ke daftar</button></div>`;

  return `<button class="link-btn" data-action="nav" data-page="recipes">← Kembali ke daftar resep</button>
    <div class="grid grid-2" style="margin-top:16px">
      ${thumb(r, "large")}
      <div class="card">
        <span class="tag">${esc(r.category)}</span>
        <h1 class="page-heading" style="margin-top:12px">${esc(r.name)}</h1>
        <p class="muted">${r.servings} porsi · ${r.time} menit memasak</p>
        <p>${esc(r.description || "Belum ada deskripsi.")}</p>
        <div class="actions">
          <button class="btn" data-action="toggle-favorite" data-id="${r.id}">${r.favorite ? "★ Hapus Favorit" : "☆ Jadikan Favorit"}</button>
          <button class="btn" data-action="share" data-id="${r.id}">Bagikan</button>
          <button class="btn primary" data-action="add-shopping" data-id="${r.id}">Tambah ke Daftar Belanja</button>
        </div>
      </div>
    </div>
    <div class="grid grid-2" style="margin-top:20px">
      <section class="card"><h2 class="section-title">Daftar bahan</h2>
        ${r.ingredients.length ? r.ingredients.map(i => `<div class="check-row"><span>${esc(i.name)}</span><span class="muted">${esc(i.amount)} ${esc(i.unit)}</span></div>`).join("") : `<p class="muted">Belum ada bahan.</p>`}
      </section>
      <section class="card"><h2 class="section-title">Langkah memasak</h2>
        ${r.steps.length ? `<ol>${r.steps.map(s => `<li style="padding:0 0 12px 5px">${esc(s)}</li>`).join("")}</ol>` : `<p class="muted">Belum ada langkah memasak.</p>`}
      </section>
    </div>`;
}

/* ---------- Form resep --------------------------------------------------- */

function ingredientFields(i, n) {
  return `<div class="ingredient-row">
    <label>Nama Bahan<input class="input" name="ingredientName" value="${esc(i.name)}" placeholder="Nama bahan"></label>
    <label>Jumlah<input class="input" name="ingredientAmount" value="${esc(i.amount)}" placeholder="Jumlah"></label>
    <label>Satuan<input class="input" name="ingredientUnit" value="${esc(i.unit)}" placeholder="gram, buah…"></label>
    <button type="button" class="btn small-btn danger" data-action="remove-row" aria-label="Hapus bahan">Hapus</button>
  </div>`;
}

function stepFields(value, n) {
  return `<div class="step-row">
    <label>Nomor<input class="input" value="${n + 1}" readonly></label>
    <label>Instruksi<textarea name="instruction" placeholder="Tulis instruksi langkah">${esc(value)}</textarea></label>
    <button type="button" class="btn small-btn danger" data-action="remove-row">Hapus</button>
  </div>`;
}

function recipeForm(id = null) {
  const r = id ? recipeById(id) : null;
  const ingredients = r?.ingredients?.length ? r.ingredients : [{ name: "", amount: "", unit: "" }];
  const steps = r?.steps?.length ? r.steps : [""];

  return `<h1 class="page-heading">${r ? "Edit Resep" : "Tambah Resep"}</h1>
    <p class="subtitle">Lengkapi informasi resep, bahan, dan langkah memasak.</p>
    <form class="card stack" id="recipe-form" data-id="${r ? r.id : ""}">
      <div class="form-grid">
        <label>Nama Resep<input class="input" name="name" required value="${esc(r?.name || "")}" placeholder="Contoh: Soto Ayam"></label>
        <label>Kategori<select name="category" required>${categories.map(c => `<option ${r?.category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>
        <label>Jumlah Porsi<input class="input" name="servings" type="number" min="1" value="${r?.servings || 4}"></label>
        <label>Waktu Memasak (menit)<input class="input" name="time" type="number" min="1" value="${r?.time || 30}"></label>
        <label class="field-full">Upload Foto<input class="input" name="photo" type="file" accept="image/*"><span class="hint">Opsional — foto dipakai sebagai thumbnail &amp; gambar detail.</span></label>
        <label class="field-full">Deskripsi<textarea name="description" placeholder="Ceritakan resep ini…">${esc(r?.description || "")}</textarea></label>
      </div>
      <hr class="divider">
      <div class="row between"><h2 class="section-title">Bahan resep</h2><button type="button" class="btn small-btn" data-action="add-ingredient">＋ Tambah bahan</button></div>
      <div id="ingredients">${ingredients.map((i, n) => ingredientFields(i, n)).join("")}</div>
      <hr class="divider">
      <div class="row between"><h2 class="section-title">Langkah memasak</h2><button type="button" class="btn small-btn" data-action="add-step">＋ Tambah langkah</button></div>
      <div id="steps">${steps.map((s, n) => stepFields(s, n)).join("")}</div>
      <div class="actions"><button class="btn primary" type="submit">Simpan resep</button><button type="button" class="btn" data-action="nav" data-page="recipes">Batal</button></div>
    </form>`;
}

/* ---------- Kategori ----------------------------------------------------- */

function categoriesPage() {
  const rows = categories.map((c, i) => {
    const count = recipes.filter(r => r.category === c).length;
    const used = recipes.some(r => r.category === c);
    return `<tr><td>${esc(c)}</td><td>${count} resep</td>
      <td><button class="btn small-btn" data-action="edit-category" data-index="${i}">Edit</button>
      <button class="btn small-btn danger" data-action="delete-category" data-index="${i}" ${used ? 'title="Kategori masih dipakai resep"' : ""}>Hapus</button></td></tr>`;
  }).join("");

  return `<div class="row between"><div><h1 class="page-heading">Kategori Resep</h1><p class="subtitle">Kelola pengelompokan resep keluarga.</p></div>
    <button class="btn primary" data-action="add-category">＋ Tambah kategori</button></div>
    <div class="card table-wrap"><table><thead><tr><th>Nama Kategori</th><th>Jumlah Resep</th><th>Aksi</th></tr></thead><tbody>
      ${rows || `<tr><td colspan="3" class="empty-state">Belum ada kategori.</td></tr>`}
    </tbody></table></div>`;
}

/* ---------- Favorit ------------------------------------------------------ */

function favoritesPage() {
  const items = recipes.filter(r => r.favorite);
  return `<h1 class="page-heading">Resep Favorit</h1><p class="subtitle">Kumpulan menu pilihan keluarga.</p>
    ${items.length ? `<div class="grid grid-3">${items.map(r => recipeCard(r, { favorite: true })).join("")}</div>` : `<div class="notice">Belum ada resep favorit. Tandai resep dengan tombol ☆.</div>`}`;
}

/* ---------- Daftar belanja ---------------------------------------------- */

function shoppingPage() {
  const checkedCount = shopping.filter(s => s.checked).length;
  return `<div class="row between"><div><h1 class="page-heading">Daftar Belanja</h1><p class="subtitle">Bahan otomatis dari resep yang dipilih.</p></div>
    <div class="actions" style="margin:0"><button class="btn" data-action="print">Cetak</button><button class="btn danger" data-action="clear-shopping">Hapus List</button></div></div>
    <div class="card"><p class="small muted">${shopping.length} bahan · ${checkedCount} sudah dibeli. Centang bahan yang sudah tersedia.</p>
      ${shopping.length ? shopping.map((item, i) => `<label class="check-row ${item.checked ? "checked" : ""}">
        <input type="checkbox" ${item.checked ? "checked" : ""} data-action="check-shopping" data-index="${i}">
        <span>${esc(item.name)}</span><span class="muted">${esc(item.amount)} ${esc(item.unit)}</span>
        <span class="muted small">— ${esc(item.recipe)}</span></label>`).join("")
      : `<div class="notice">Daftar masih kosong. Buka detail resep lalu pilih “Tambah ke Daftar Belanja”.</div>`}
    </div>`;
}

/* ---------- Laporan ----------------------------------------------------- */

function reportsPage() {
  const max = Math.max(1, ...categories.map(c => recipes.filter(r => r.category === c).length));
  const favorites = recipes.filter(r => r.favorite);

  return `<div class="row between"><div><h1 class="page-heading">Laporan</h1><p class="subtitle">Ringkasan koleksi resep keluarga.</p></div>
    <button class="btn primary" data-action="print">Export PDF / Cetak</button></div>
    <div class="grid grid-2" style="margin-bottom:18px">
      <div class="card"><div class="muted">Total resep</div><div class="stat-value">${recipes.length}</div></div>
      <div class="card"><div class="muted">Total kategori</div><div class="stat-value">${categories.length}</div></div>
    </div>
    <div class="grid grid-2">
      <section class="card"><h2 class="section-title">Jumlah resep per kategori</h2>
        ${categories.map(c => { const count = recipes.filter(r => r.category === c).length; return `<div class="bar-row"><span>${esc(c)}</span><div class="bar-track"><div class="bar-fill" style="width:${count / max * 100}%"></div></div><span>${count}</span></div>`; }).join("") || `<p class="muted">Belum ada kategori.</p>`}
      </section>
      <section class="card"><h2 class="section-title">Resep favorit</h2>
        ${favorites.length ? favorites.map(r => `<div class="check-row"><span>☆ ${esc(r.name)}</span><span class="tag">${esc(r.category)}</span></div>`).join("") : `<p class="muted">Belum ada resep favorit.</p>`}
      </section>
    </div>`;
}

/* ---------- Profil ------------------------------------------------------- */

function profilePage() {
  return `<h1 class="page-heading">Profil Lokal</h1><p class="subtitle">Informasi untuk pengalaman penggunaan di perangkat ini.</p>
    <div class="card" style="max-width:700px">
      <div class="row" style="align-items:flex-start;gap:20px">
        <div class="profile-photo">${profile.photo ? `<img src="${esc(profile.photo)}" alt="Foto profil">` : "Foto Profil"}</div>
        <div><h2 style="margin:0">${esc(profile.name)}</h2><div class="muted">${esc(profile.email)}</div></div>
      </div>
      <hr class="divider">
      <div class="actions">
        <button class="btn" data-action="edit-profile">Edit Profil</button>
      </div>
      <p class="small muted">MASAKin dapat digunakan tanpa akun. Data profil ini hanya disimpan di browser ini.</p>
    </div>`;
}

/* ---------- Toast -------------------------------------------------------- */

function toast(message) {
  let host = document.querySelector(".toast-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "toast-host";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 200);
  }, 2600);
}
