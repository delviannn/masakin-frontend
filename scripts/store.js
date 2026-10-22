/* ==========================================================================
   MASAKin — data & store (localStorage)
   Semua data disimpan di perangkat ini dengan prefix "masakin_".
   ========================================================================== */

const STORE_PREFIX = "masakin_";

const initialRecipes = [
  {
    id: 1, name: "Soto Ayam Keluarga", category: "Masakan Utama",
    servings: 4, time: 50, description: "Soto hangat dengan kuah gurih untuk makan bersama keluarga.",
    ingredients: [
      { name: "Ayam", amount: "500", unit: "gram" },
      { name: "Bihun", amount: "100", unit: "gram" },
      { name: "Bawang putih", amount: "4", unit: "siung" }
    ],
    steps: ["Rebus ayam hingga empuk, lalu suwir.", "Haluskan bumbu dan tumis hingga harum.", "Masukkan bumbu ke kaldu, sajikan dengan pelengkap."],
    favorite: true, photo: null
  },
  {
    id: 2, name: "Pisang Goreng", category: "Camilan",
    servings: 5, time: 25, description: "Camilan sederhana untuk teman minum teh.",
    ingredients: [{ name: "Pisang", amount: "5", unit: "buah" }, { name: "Tepung", amount: "150", unit: "gram" }],
    steps: ["Campur tepung dengan air secukupnya.", "Celupkan pisang lalu goreng sampai keemasan."],
    favorite: false, photo: null
  },
  {
    id: 3, name: "Sayur Lodeh", category: "Sayuran",
    servings: 4, time: 35, description: "Sayuran berkuah santan dengan bumbu rumahan.",
    ingredients: [{ name: "Labu siam", amount: "1", unit: "buah" }, { name: "Santan", amount: "400", unit: "ml" }],
    steps: ["Potong semua sayuran.", "Rebus bersama bumbu dan santan hingga matang."],
    favorite: true, photo: null
  }
];

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(STORE_PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
  }
};

let recipes = store.get("recipes", initialRecipes);
let categories = store.get("categories", ["Masakan Utama", "Camilan", "Sayuran"]);
let shopping = store.get("shopping", []);
let profile = store.get("profile", { name: "Anggota Keluarga", email: "keluarga@example.com", photo: null });

/** Simpan seluruh state ke localStorage. */
function save() {
  store.set("recipes", recipes);
  store.set("categories", categories);
  store.set("shopping", shopping);
  store.set("profile", profile);
}

const recipeById = id => recipes.find(r => r.id === Number(id));
const nextId = () => (recipes.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
