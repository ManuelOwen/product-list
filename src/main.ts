
import type { Desserts } from "./database.interface";

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = "DessertsDB";
  private readonly STORE_NAME = "desserts";

  constructor() {}

  intDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, {
            keyPath: "id",
          });
          store.createIndex("name", "name", { unique: false });
        }
      };
    });
  }

  addDessert(dessert: Desserts): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not initialized");
      const tx = this.db.transaction(this.STORE_NAME, "readwrite");
      const store = tx.objectStore(this.STORE_NAME);
      
      const request = store.put(dessert);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getAllDesserts(): Promise<Desserts[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not initialized");
      const tx = this.db.transaction(this.STORE_NAME, "readonly");
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  deleteDessert(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not initialized");
      const tx = this.db.transaction(this.STORE_NAME, "readwrite");
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  clearCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("DB not initialized");
      const tx = this.db.transaction(this.STORE_NAME, "readwrite");
      const store = tx.objectStore(this.STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

async function fetchDesserts(): Promise<Desserts[]> {
  try {
    const response = await fetch('./data/data.json');
    if (!response.ok) throw new Error("Failed to fetch desserts");
    const desserts = await response.json();
    return desserts as Desserts[];
  } catch (e) {
    console.error(e);
    return [];
  }
}
// function to render desserts
async function renderDesserts(desserts: Desserts[]) {
  const grid = document.getElementById("dessert-grid");
  if (!grid) return;
  grid.innerHTML = "";

  desserts.forEach((dessert) => {
    const card = document.createElement("div");
    card.style.background = "white";
    card.style.borderRadius = "1rem";
    card.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
    card.style.padding = "1rem";
    card.style.textAlign = "center";

    // Use the thumbnail image path from data.json
    card.innerHTML = `
      <img src="${dessert.image.thumbnail}" alt="${dessert.name}" style="width:100%;height:160px;object-fit:cover;border-radius:0.75rem;margin-bottom:1rem;" />
      <p style="margin:0;color:#a29e9e;text-transform:uppercase;">${dessert.category}</p>
      <h3 style="margin:0.25rem 0;color:#2c2c2c;">${dessert.name}</h3>
      <p style="color:#d54b1a;margin-bottom:0.75rem;">$${dessert.price.toFixed(2)}</p>
      <button class="add-to-cart" data-id="${dessert.id}" style="
        padding:0.5rem 1.25rem;
        font-weight:500;
        background:white;
        color:#e05a47;
        border:1px solid #e05a47;
        border-radius:2rem;
        cursor:pointer;
        transition:all 0.2s ease-in-out;
      ">Add to Cart</button>
    `;
    grid.appendChild(card);
  });
}

async function renderCart(dbService: DatabaseService) {
  const cartContainer = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const totalPriceEl = document.getElementById("total-price");
  if (!cartContainer || !cartCount || !totalPriceEl) return;

  const items = await dbService.getAllDesserts();
  cartContainer.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.marginBottom = "0.5rem";

    div.innerHTML = `
      <span>${item.name} - $${item.price.toFixed(2)}</span>
      <button class="remove-from-cart" data-id="${item.id}" style="
        background: transparent; border:none; color:#e05a47; cursor:pointer;">Cancel</button>
    `;
    cartContainer.appendChild(div);
  });

  cartCount.textContent = `Your Cart (${items.length})`;
  const total = items.reduce((sum, i) => sum + i.price, 0);
  totalPriceEl.textContent = `Total: $${total.toFixed(2)}`;
}

async function init() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div style="display:flex; gap:2rem; font-family:'Segoe UI', sans-serif; padding:2rem;">
      <div style="flex:3;">
        <h1>Desserts</h1>
        <div id="dessert-grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1.5rem;"></div>
      </div>
      <div style="flex:1; background:white; padding:1.5rem; border-radius:1rem; box-shadow:0 0 10px rgba(0,0,0,0.1);">
        <h2 id="cart-count">Your Cart (0)</h2>
        <div id="cart-items" style="margin-bottom:1rem; max-height:300px; overflow-y:auto;"></div>
        <div id="total-price" style="font-weight:bold; margin-bottom:1rem;">Total: $0.00</div>
        <button id="clear-cart" style="
          width:100%; padding:0.75rem; border:none; background:#f4f4f4; border-radius:0.5rem; margin-bottom:0.5rem; cursor:pointer;">Clear Cart</button>
        <button id="checkout" style="
          width:100%; padding:0.75rem; border:none; background:#e05a47; color:white; border-radius:0.5rem; cursor:pointer;">Checkout</button>
        <div id="checkout-message" style="margin-top:1rem;"></div>
      </div>
    </div>
  `;

  const dbService = new DatabaseService();
  await dbService.intDatabase();

  const desserts = await fetchDesserts();
  await renderDesserts(desserts);
  await renderCart(dbService);

  // Event delegation for buttons
  document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    // Add to cart
    if (target.classList.contains("add-to-cart")) {
      const idStr = target.getAttribute("data-id");
      if (!idStr) return;
      const id = Number(idStr);
      const dessertToAdd = desserts.find((d) => d.id === id);
      if (!dessertToAdd) return alert("Dessert not found");

      await dbService.addDessert(dessertToAdd);
      alert(`Added "${dessertToAdd.name}" to cart!`);
      await renderCart(dbService);
    }

    // Remove from cart
    if (target.classList.contains("remove-from-cart")) {
      const idStr = target.getAttribute("data-id");
      if (!idStr) return;
      const id = Number(idStr);
      await dbService.deleteDessert(id);
      await renderCart(dbService);
    }

    // Clear cart
    if (target.id === "clear-cart") {
      await dbService.clearCart();
      alert("Cart cleared!");
      await renderCart(dbService);
    }

    // Checkout
    if (target.id === "checkout") {
      const items = await dbService.getAllDesserts();
      if (items.length === 0) {
        alert("Cart is empty!");
        return;
      }
      alert(`Thank you for your purchase! Total: $${items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}`);
      await dbService.clearCart();
      await renderCart(dbService);
      const msgEl = document.getElementById("checkout-message");
      if (msgEl) msgEl.textContent = "Checkout successful!";
    }
  });
}

init().catch(console.error);
