/* ==========================================================================
   MASAKin — controller & event wiring.
   Semua aksi UI dipetakan di ACTIONS supaya tidak ada inline handler.
   ========================================================================== */

let page = "login";
let selectedId = null;
let searchTerm = "";
let categoryFilter = "Semua kategori";
let sidebarOpen = false;

/* ---------- Navigasi ----------------------------------------------------- */

const go = target => {
  page = target;
  sidebarOpen = false;
  render();
  window.scrollTo(0, 0);
};

const render = () => {
  const root = document.getElementById("app");
  root.innerHTML = (page === "login" || page === "register")
    ? loginPage(page === "register")
    : shell(pages()[page]());
  bindForms(root);
};

const pages = () => ({
  dashboard, recipes: recipeList, detail: recipeDetail, form: () => recipeForm(selectedId),
  categories: categoriesPage, favorites: favoritesPage, shopping: shoppingPage,
  reports: reportsPage, profile: profilePage
});

/* ---------- Formulir ----------------------------------------------------- */

function bindForms(root) {
  root.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (form.id === "auth-form") return authSubmit(form);
      if (form.id === "search-form") return onSearch(form);
      if (form.id === "filter-form") return onFilter(form);
      if (form.id === "recipe-form") return saveRecipe(form);
    });
  });
}

function authSubmit(form) {
  const data = new FormData(form);
  const registering = form.dataset.register === "1";
  if (registering) {
    if (data.get("password") !== data.get("confirm")) return toast("Password dan konfirmasi password tidak sama.");
    profile = { ...profile, name: data.get("name").trim() || profile.name, email: data.get("email").trim() };
    save();
    toast(`Akun dibuat. Selamat datang, ${profile.name}!`);
  } else {
    const email = data.get("email").trim();
    if (email) { profile = { ...profile, email }; save(); }
    toast(`Masuk sebagai ${profile.name}`);
  }
  go("dashboard");
}

function onSearch(form) {
  searchTerm = new FormData(form).get("q")?.trim() || "";
  categoryFilter = "Semua kategori";
  go("recipes");
}

function onFilter(form) {
  const data = new FormData(form);
  searchTerm = data.get("q")?.trim() || "";
  categoryFilter = data.get("category") || "Semua kategori";
  render();
}

function saveRecipe(form) {
  const data = new FormData(form);
  const editId = form.dataset.id ? Number(form.dataset.id) : null;
  const old = editId ? recipeById(editId) : null;

  const ingredients = [...form.querySelectorAll(".ingredient-row")].map(row => ({
    name: row.querySelector('[name="ingredientName"]').value.trim(),
    amount: row.querySelector('[name="ingredientAmount"]').value.trim(),
    unit: row.querySelector('[name="ingredientUnit"]').value.trim()
  })).filter(i => i.name);

  const steps = [...form.querySelectorAll('[name="instruction"]')].map(x => x.value.trim()).filter(Boolean);

  const file = data.get("photo");
  const commit = photo => {
    const recipe = {
      id: old ? old.id : nextId(),
      name: data.get("name").trim(),
      category: data.get("category"),
      servings: Number(data.get("servings")) || 1,
      time: Number(data.get("time")) || 1,
      description: data.get("description")?.trim() || "",
      ingredients, steps, photo: photo ?? old?.photo ?? null,
      favorite: old?.favorite || false
    };
    if (old) recipes = recipes.map(r => r.id === old.id ? recipe : r);
    else recipes.unshift(recipe);
    save();
    toast(old ? `Resep “${recipe.name}” diperbarui.` : `Resep “${recipe.name}” ditambahkan.`);
    searchTerm = "";
    categoryFilter = "Semua kategori";
    go("recipes");
  };

  if (file && file.size) {
    if (file.size > 2 * 1024 * 1024) return toast("Ukuran foto maksimal 2 MB.");
    const reader = new FileReader();
    reader.onload = () => commit(reader.result);
    reader.readAsDataURL(file);
  } else {
    commit(null);
  }
}

/* ---------- Aksi --------------------------------------------------------- */

const ACTIONS = {
  nav: el => go(el.dataset.page),
  "open-menu": () => { sidebarOpen = true; render(); },
  "close-menu": () => { sidebarOpen = false; render(); },
  "toggle-auth": () => go(page === "register" ? "login" : "register"),

  open: el => { selectedId = Number(el.dataset.id); go("detail"); },
  new: () => { selectedId = null; go("form"); },
  edit: el => { selectedId = Number(el.dataset.id); go("form"); },

  delete: el => {
    const r = recipeById(el.dataset.id);
    if (!r) return;
    if (!confirm(`Hapus resep “${r.name}”?`)) return;
    recipes = recipes.filter(item => item.id !== r.id);
    save();
    toast(`Resep “${r.name}” dihapus.`);
    render();
  },

  "toggle-favorite": el => {
    const r = recipeById(el.dataset.id);
    if (!r) return;
    r.favorite = !r.favorite;
    save();
    toast(r.favorite ? `“${r.name}” masuk favorit.` : `“${r.name}” keluar dari favorit.`);
    render();
  },
  unfavorite: el => ACTIONS["toggle-favorite"](el),

  share: el => {
    const r = recipeById(el.dataset.id);
    const text = `Resep keluarga: ${r?.name || ""}`;
    if (navigator.share) navigator.share({ title: "MASAKin", text }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast("Info resep disalin."));
    else toast(text);
  },

  "add-shopping": el => {
    const r = recipeById(el.dataset.id);
    if (!r) return;
    r.ingredients.forEach(i => shopping.push({ ...i, checked: false, recipe: r.name }));
    save();
    toast(`${r.ingredients.length} bahan ditambahkan ke daftar belanja.`);
    go("shopping");
  },
  "check-shopping": el => {
    const item = shopping[Number(el.dataset.index)];
    if (!item) return;
    item.checked = el.checked;
    save();
  },
  "clear-shopping": () => {
    if (!shopping.length) return toast("Daftar belanja sudah kosong.");
    if (!confirm("Hapus semua bahan dari daftar belanja?")) return;
    shopping = [];
    save();
    toast("Daftar belanja dikosongkan.");
    render();
  },

  "add-category": () => {
    const name = prompt("Nama kategori baru:");
    const value = name?.trim();
    if (!value) return;
    if (categories.includes(value)) return toast("Kategori sudah ada.");
    categories.push(value);
    save();
    toast(`Kategori “${value}” ditambahkan.`);
    render();
  },
  "edit-category": el => {
    const i = Number(el.dataset.index);
    const name = prompt("Ubah nama kategori:", categories[i]);
    const value = name?.trim();
    if (!value) return;
    const old = categories[i];
    categories[i] = value;
    recipes.forEach(r => { if (r.category === old) r.category = value; });
    save();
    toast("Kategori diperbarui.");
    render();
  },
  "delete-category": el => {
    const i = Number(el.dataset.index);
    const name = categories[i];
    if (recipes.some(r => r.category === name)) return toast("Kategori masih digunakan oleh resep.");
    if (!confirm(`Hapus kategori “${name}”?`)) return;
    categories.splice(i, 1);
    save();
    toast(`Kategori “${name}” dihapus.`);
    render();
  },

  "add-ingredient": () => {
    document.getElementById("ingredients").insertAdjacentHTML("beforeend", ingredientFields({ name: "", amount: "", unit: "" }, 0));
  },
  "add-step": () => {
    const box = document.getElementById("steps");
    const n = box.querySelectorAll(".step-row").length;
    box.insertAdjacentHTML("beforeend", stepFields("", n));
  },
  "remove-row": el => el.closest(".ingredient-row, .step-row")?.remove(),

  "edit-profile": () => {
    const name = prompt("Nama lengkap:", profile.name);
    if (name?.trim()) profile.name = name.trim();
    const email = prompt("Email:", profile.email);
    if (email?.trim()) profile.email = email.trim();
    save();
    toast("Profil diperbarui.");
    render();
  },
  "change-password": () => toast("Demo frontend: alur ganti password belum terhubung ke server."),
  logout: () => { sidebarOpen = false; go("login"); },

  print: () => window.print()
};

/* ---------- Dispatcher --------------------------------------------------- */

document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const handler = ACTIONS[el.dataset.action];
  if (handler) { e.preventDefault(); handler(el); }
});

/* ---------- Start -------------------------------------------------------- */

render();
