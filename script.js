
/* ===== PRODUCT DATA ===== */

const products = [
  {
    id: 1,
    name: "Air Runner Red",
    category: "Running",
    price: 2499,
    rating: 4.8,
    tag: "BESTSELLER",
    image: "photo-1542291026-7eec264c27ff"
  },
  {
    id: 2,
    name: "Classic White Sneaker",
    category: "Sneakers",
    price: 1999,
    rating: 4.6,
    tag: "POPULAR",
    image: "photo-1549298916-b41d501d3772"
  },
  {
    id: 3,
    name: "Urban Street Shoe",
    category: "Casual",
    price: 1799,
    rating: 4.5,
    tag: "TRENDING",
    image: "photo-1525966222134-fcfa99b8ae77"
  },
  {
    id: 4,
    name: "Sport Pro Runner",
    category: "Running",
    price: 2999,
    rating: 4.9,
    tag: "TOP RATED",
    image: "photo-1460353581641-37baddab0fa2"
  },
  {
    id: 5,
    name: "Everyday Black",
    category: "Sneakers",
    price: 2199,
    rating: 4.7,
    tag: "NEW",
    image: "photo-1495555961986-6d4c1ecb7be3"
  },
  {
    id: 6,
    name: "Street Flex",
    category: "Casual",
    price: 1599,
    rating: 4.4,
    tag: "VALUE PICK",
    image: "photo-1552346154-21d32810aba3"
  },
  {
    id: 7,
    name: "Speed Trainer",
    category: "Running",
    price: 2699,
    rating: 4.8,
    tag: "SPORT",
    image: "photo-1539185441755-769473a23570"
  },
  {
    id: 8,
    name: "Premium Court Shoe",
    category: "Sneakers",
    price: 3499,
    rating: 4.9,
    tag: "PREMIUM",
    image: "photo-1551107696-a4b0c5a0d9a2"
  }
];

/* ===== ELEMENTS ===== */

const productGrid = document.getElementById("productGrid");
const emptyMessage = document.getElementById("emptyMessage");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

let selectedCategory = "All";
let searchTerm = "";
let cart = [];
let toastTimer;

/* ===== FORMAT PRICE ===== */

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

/* ===== PRODUCT IMAGES ===== */

function getImageUrl(imageId) {
  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=600&q=80`;
}

/* ===== DISPLAY PRODUCTS ===== */

function renderProducts() {
  let filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  const sortType = document.getElementById("sortSelect").value;

  if (sortType === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortType === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortType === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  productGrid.innerHTML = "";

  emptyMessage.hidden = filteredProducts.length > 0;

  filteredProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img
          src="${getImageUrl(product.image)}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/600x450/f2f0ec/171717?text=Shoe'">
        <span class="product-tag">${product.tag}</span>
      </div>

      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>
        <div class="rating">
          ★★★★★ <span>${product.rating.toFixed(1)}</span>
        </div>
        <div class="product-bottom">
          <span class="product-price">
            ${formatPrice(product.price)}
          </span>
          <button class="add-btn" data-add="${product.id}">
            + Add
          </button>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

/* ===== CATEGORY FILTER ===== */

document.querySelectorAll(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    document.querySelectorAll(".category-card").forEach(card => {
      card.classList.toggle("active", card === button);
    });

    renderProducts();
  });
});

/* ===== SEARCH ===== */

document.getElementById("searchToggle").addEventListener("click", () => {
  searchBar.hidden = !searchBar.hidden;

  if (!searchBar.hidden) {
    searchInput.focus();
  }
});

document.getElementById("closeSearch").addEventListener("click", () => {
  searchBar.hidden = true;
  searchInput.value = "";
  searchTerm = "";
  renderProducts();
});

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

document.getElementById("sortSelect").addEventListener("change", renderProducts);

/* ===== CART OPERATIONS ===== */

function addToCart(productId) {
  const product = products.find(item => item.id === productId);

  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  renderCart();
  showToast(`${product.name} added to cart!`);
}

function changeQuantity(productId, amount) {
  const item = cart.find(item => item.id === productId);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  }

  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  renderCart();
  showToast("Item removed from cart.");
}

function renderCart() {
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatPrice(totalPrice);

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="cart-empty">
        Your cart is empty.<br>
        Find your perfect pair!
      </p>
    `;
    return;
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <img
        src="${getImageUrl(product.image)}"
        alt="${product.name}"
        onerror="this.onerror=null;this.src='https://placehold.co/150x150/f2f0ec/171717?text=Shoe'">

      <div>
        <h3>${product.name}</h3>
        <p>${formatPrice(product.price)}</p>

        <div class="quantity-controls">
          <button data-decrease="${product.id}"
            aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-increase="${product.id}"
            aria-label="Increase quantity">+</button>
        </div>
      </div>

      <button class="remove-btn"
        data-remove="${product.id}">Remove</button>
    `;

    cartItems.appendChild(row);
  });
}

/* Event delegation for product and cart buttons */

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }

  if (increaseButton) {
    changeQuantity(Number(increaseButton.dataset.increase), 1);
  }

  if (decreaseButton) {
    changeQuantity(Number(decreaseButton.dataset.decrease), -1);
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

/* ===== OPEN AND CLOSE CART ===== */

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    searchBar.hidden = true;
  }
});

/* ===== CHECKOUT DEMO ===== */

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  showToast("Demo checkout: no payment has been made.");
});

/* ===== MOBILE MENU ===== */

document.getElementById("menuToggle").addEventListener("click", () => {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("navLinks").classList.remove("show");
  });
});

/* ===== NEWSLETTER DEMO ===== */

document.getElementById("newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const emailInput = document.getElementById("emailInput");
  const message = document.getElementById("newsletterMessage");

  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }

  message.textContent =
    "Thanks for subscribing! This is a demo form.";
  emailInput.value = "";
});

/* ===== TOAST MESSAGE ===== */

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ===== INITIALIZE WEBSITE ===== */

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
