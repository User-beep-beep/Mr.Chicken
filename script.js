const products = [
    { 
        id: 1, 
        name: "Chicken Blood", 
        prices: { wholesale: 20.00, retail: 25.00 }, 
        image: "pics/blood.jpg",
        description: "Freshly harvested and chilled immediately for peak quality."
    },
    { 
        id: 2, 
        name: "Chicken Feet", 
        prices: { wholesale: 65.00, retail: 70.00 }, 
        image: "pics/feet.jpg",
        description: "Cleaned and sorted. Rich in collagen for slow-cooked stews."
    },
    { 
        id: 3, 
        name: "Chicken Head", 
        prices: { wholesale: 20.00, retail: 25.00 }, 
        image: "pics/head.jpg",
        description: "Premium selection for broth and specialized recipes."
    },
    { 
        id: 4, 
        name: "Small Intestine", 
        prices: { wholesale: 60.00, retail: 65.00 }, 
        image: "pics/intestine.jpg",
        description: "Carefully cleaned. Ideal for grilling or deep-frying."
    },
    { 
        id: 5, 
        name: "Provent", 
        prices: { wholesale: 80.00, retail: 85.00 }, 
        image: "pics/provent.jpg",
        description: "High-quality proventriculus favorite for specific textures."
    },
    { 
        id: 7, 
        name: "Crops", 
        prices: { wholesale: 60.00, retail: 65.00 }, 
        image: "pics/crops.jpg",
        description: "Freshly prepared chicken crops, cleaned and ready."
    },
    { 
        id: 6, 
        name: "Chicken Fats", 
        prices: { wholesale: 60.00, retail: 60.00 }, 
        image: "pics/fats.jpg",
        description: "Pure fat for rendering or enhancing cooking flavor."
    }
];

const messages = [
    "Buy Now",
    "Premium Quality available at your touch",
    "Fresh from the farm to your doorstep",
    "Shop with us"
];

let cart = [];
let lastScrollY = window.scrollY;
let messageIndex = 0;

function rotateText() {
    const textElement = document.getElementById("rotating-text");
    if (!textElement) return;
    textElement.style.opacity = 0; 
    setTimeout(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        textElement.innerText = messages[messageIndex];
        textElement.style.opacity = 1;
    }, 500);
}
setInterval(rotateText, 5000);

function displayProducts() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;
    grid.innerHTML = products.map(item => `
        <div class="product-card">
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <h3>${item.name}</h3>
            <p class="product-description">${item.description}</p>
            
            <div class="type-selector">
                <label class="type-option">
                    <input type="radio" name="type-${item.id}" value="wholesale" checked> 
                    Wholesale (₱${item.prices.wholesale})
                </label>
                <label class="type-option">
                    <input type="radio" name="type-${item.id}" value="retail"> 
                    Retail (₱${item.prices.retail})
                </label>
            </div>

            <div class="qty-input-wrapper">
                <label style="font-size: 0.8rem; color: #888; display: block; margin-bottom: 5px;">Kilos:</label>
                <input type="number" id="qty-${item.id}" value="1" min="1">
            </div>
            <button onclick="addToCart(${item.id})" style="background:#d32f2f; color:white; border:none; padding:12px 20px; cursor:pointer; border-radius:5px; font-weight:bold; width: 100%; transition: opacity 0.2s;">
                Add to Cart
            </button>
        </div>
    `).join('');
}

function showToast() {
    const toast = document.getElementById("toast-notification");
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`qty-${productId}`);
    const typeInput = document.querySelector(`input[name="type-${productId}"]:checked`);
    
    const quantity = parseInt(quantityInput.value);
    const priceType = typeInput.value; 
    const pricePerUnit = product.prices[priceType];
    
    if (isNaN(quantity) || quantity < 1) return;

    const cartItemId = `${productId}-${priceType}`;
    const existing = cart.find(item => item.cartId === cartItemId);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ 
            ...product, 
            cartId: cartItemId, 
            quantity: quantity, 
            priceType: priceType,
            currentPrice: pricePerUnit
        });
    }
    
    quantityInput.value = 1; 
    updateUI();
    showToast();
}

function changeQuantity(cartId, amount) {
    const item = cart.find(p => p.cartId === cartId);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) removeFromCart(cartId);
    }
    updateUI();
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    updateUI();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

function showCheckoutForm() {
    if (cart.length === 0) return alert("Your cart is empty!");
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('checkout-modal').style.display = 'block';
    
    const total = cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    document.getElementById('checkout-total-price').innerText = total.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function handleOrderSubmit(event) {
    event.preventDefault();
    const orderId = "MC-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    document.getElementById('order-ref').innerText = orderId;
    document.getElementById('checkout-modal').style.display = 'none';
    document.getElementById('confirmation-modal').style.display = 'block';
    cart = [];
    updateUI();
}

function closeConfirmation() {
    document.getElementById('confirmation-modal').style.display = 'none';
    document.getElementById('checkout-form').reset();
}

function updateUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.innerText = count;

    const list = document.getElementById('cart-items-list');
    const totalDisplay = document.getElementById('cart-total-price');
    
    if (!list || !totalDisplay) return;

    if (cart.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding: 20px; color: #888;'>Your cart is empty.</p>";
    } else {
        list.innerHTML = cart.map(item => `
            <div class="cart-item-row">
                <div>
                    <strong>${item.name}</strong> 
                    <span class="cart-type-badge badge-${item.priceType}">${item.priceType}</span><br>
                    <small>₱${item.currentPrice.toFixed(2)} / kilo</small>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="changeQuantity('${item.cartId}', -1)">-</button>
                    <span>${item.quantity} kg</span>
                    <button class="qty-btn" onclick="changeQuantity('${item.cartId}', 1)">+</button>
                    <span style="margin-left:10px; font-weight:bold; min-width: 80px; text-align: right;">₱${(item.currentPrice * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    totalDisplay.innerText = total.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

window.addEventListener("scroll", () => {
    const preHeader = document.getElementById("pre-header");
    if (!preHeader) return;
    if (window.scrollY > lastScrollY && window.scrollY > 50) {
        preHeader.classList.add("hidden");
    } else {
        preHeader.classList.remove("hidden");
    }
    lastScrollY = window.scrollY;
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === "#top") {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({ top: targetElement.offsetTop - 70, behavior: 'smooth' });
        }
    });
});

displayProducts();