import { DatabaseService } from "./database.service";

// fetch desserts from JSON
async function fetchDesserts() {
  try {
    const response = await fetch('./data.json');
    if (!response.ok) throw new Error("Failed to fetch desserts");
    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Response is not JSON");
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

// render desserts to the UI
async function renderDesserts() {
  const desserts = await fetchDesserts();
  const dessertGrid = document.getElementById("dessert-grid");
  if (!dessertGrid) throw new Error("Dessert grid not found");
  dessertGrid.innerHTML = "";

  desserts.forEach((dessert: any) => {
    const dessertCard = document.createElement("div");
    dessertCard.style.background = "white";
    dessertCard.style.borderRadius = "1rem";
    dessertCard.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
    dessertCard.style.padding = "1rem";
    dessertCard.style.textAlign = "center";

    dessertCard.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img 
          src="${dessert.image.thumbnail}" 
          alt="${dessert.name}" 
          onerror="this.src='https://via.placeholder.com/160x160?text=No+Image'"
          style="width: 100%; height: 160px; object-fit: cover; border-radius: 0.75rem; margin-bottom: 1rem;"
        />
        <p style="margin: 0; font-size: 0.85rem; color: #a29e9e; text-transform: uppercase; letter-spacing: 0.5px;">${dessert.category}</p>
        <h3 style="font-size: 1rem; font-weight: 600; margin: 0.25rem 0; color: #2c2c2c; text-align: center;">${dessert.name}</h3>
        <p style="font-size: 1rem; font-weight: 500; color: #d54b1a; margin-bottom: 0.75rem;">$${dessert.price.toFixed(2)}</p>
        <button 
          class="add-to-cart" 
          data-id="${dessert.id}"
          style="
            padding: 0.5rem 1.25rem;
            font-size: 0.9rem;
            font-weight: 500;
            background: white;
            color: #e05a47;
            border: 1px solid #e05a47;
            border-radius: 2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s ease-in-out;
          "
          onmouseover="this.style.background='#e05a47'; this.style.color='white';"
          onmouseout="this.style.background='white'; this.style.color='#e05a47';"
        >
          Add to Cart
        </button>
      </div>
    `;

    dessertGrid.appendChild(dessertCard);
  });
}

// render cart items dynamically with total sum
async function renderCart() {
  const dbService = new DatabaseService();
  const cartItems = await dbService.getAllDesserts();
  const cartContainer = document.getElementById("your-cart-items");
  const cartCount = document.querySelector("h2"); // Your Cart (0)
  const totalPriceEl = document.getElementById("total-price");

  if (!cartContainer || !cartCount) return;

  cartContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartContainer.innerHTML = `<p style="color: #777;">Your added items will appear here</p>`;
  } else {
    cartItems.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.style.display = "flex";
      itemDiv.style.justifyContent = "space-between";
      itemDiv.style.alignItems = "center";
      itemDiv.style.marginBottom = "0.5rem";

      itemDiv.innerHTML = `
        <span>${item.name} - $${item.price.toFixed(2)}</span>
        <button data-id="${item.id}" class="remove-from-cart" style="background: transparent; border: none; color: #e05a47; cursor: pointer; font-size: 1.25rem;">&times;</button>
      `;

      cartContainer.appendChild(itemDiv);
    });
  }

  // Update cart count
  cartCount.innerText = `Your Cart (${cartItems.length})`;

  // Calculate and update total price
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  if (totalPriceEl) {
    totalPriceEl.innerText = `Total: $${total.toFixed(2)}`;
  }
}

// initialize the app
async function initDatabase() {
  const dbService = new DatabaseService();
  await dbService.intDatabase();

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div style="display: flex; gap: 2rem; padding: 2rem; font-family: 'Segoe UI', sans-serif; background: #fdf7f4;">
      <div style="flex: 3;">
        <h1 style="font-size: 2rem; margin-bottom: 1.5rem;">Desserts</h1>
        <div id="dessert-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem;">
          <!-- Desserts will be injected here -->
        </div>
      </div>
      <div style="flex: 1; background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #e05a47;">Your Cart (0)</h2>
        <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="cake" style="width: 100px; margin-bottom: 1rem;" />
        <div id="your-cart-items" style="margin-top: 1rem; max-height: 300px; overflow-y: auto;">
          <p style="color: #777;">Your added items will appear here</p>
        </div>
        <p id="total-price" style="font-weight: 600; margin-top: 1rem; font-size: 1.1rem; color: #e05a47;">Total: $0.00</p>
        <div style="margin-top: 2rem;">
          <button id="clear-cart" style="margin-bottom: 0.5rem; width: 100%; padding: 0.75rem; border: none; background: #f4f4f4; border-radius: 0.5rem;">Clear Cart</button>
          <button id="checkout" style="width: 100%; padding: 0.75rem; border: none; background: #e05a47; color: white; border-radius: 0.5rem;">Checkout</button>
        </div>
        <div id="checkout-message" style="margin-top: 1rem;"></div>
      </div>
    </div>
  `;

  await renderDesserts();
  await renderCart();
}

initDatabase().catch(console.error);

// handle cart buttons
document.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;

  if (target.classList.contains("add-to-cart")) {
    const dessertId = target.getAttribute("data-id");
    if (dessertId) {
      const dbService = new DatabaseService();
      const desserts = await fetchDesserts();
      const dessertToAdd = desserts.find((dessert: any) => dessert.id === Number(dessertId));
      if (dessertToAdd) {
        await dbService.addDessert(dessertToAdd);
        alert("Dessert added to cart!");
        await renderCart();
      } else {
        alert("Dessert not found!");
      }
    }
  }

  if (target.classList.contains("remove-from-cart")) {
    const dessertId = target.getAttribute("data-id");
    if (dessertId) {
      const dbService = new DatabaseService();
      await dbService.deleteDessert(Number(dessertId));
      alert("Dessert removed from cart!");
      await renderCart();
    }
  }

  if (target.id === "clear-cart") {
    const dbService = new DatabaseService();
    await dbService.clearCart();
    alert("Cart cleared!");
    await renderCart();
  }

  if (target.id === "checkout") {
    const dbService = new DatabaseService();
    const message = await dbService.checkout();
    document.getElementById("checkout-message")!.innerText = message;
  }
});
