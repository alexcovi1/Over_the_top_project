// cart.js - Gestione del carrello

document.addEventListener('DOMContentLoaded', function() {
    // Pulizia: rimuove oggetti senza nome
    let cart = getCart();
    cart = cart.filter(item => item.name && item.name.trim() !== '' && item.name !== 'undefined');
    setCart(cart);
    renderCart();

    document.getElementById('cart-table').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', function() {
        alert('Checkout function coming soon!');
    });
});

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();
    const tbody = document.querySelector('#cart-table tbody');
    tbody.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
    } else {
        cart.forEach(item => {
            const row = document.createElement('tr');
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>€${item.price.toFixed(2)}</td>
                <td>€${itemTotal.toFixed(2)}</td>
                <td><button class="remove-btn" data-id="${item.id}">Remove</button></td>
            `;
            tbody.appendChild(row);
        });
    }
    document.getElementById('cart-total').textContent = `€${total.toFixed(2)}`;
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    setCart(cart);
    renderCart();
}

function showCartNotification(message) {
    let notif = document.createElement('div');
    notif.className = 'cart-notification';
    notif.innerHTML = `<span style='font-size:1.2rem;'>🛒</span> <span>${message}</span>`;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.classList.add('show');
    }, 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 400);
    }, 2200);
}

function addToCart(product) {
    let cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += product.quantity;
    } else {
        cart.push(product);
    }
    setCart(cart);
    showCartNotification(`Added <b>${product.name}</b> to your cart!`);
}

// Funzione per collegare i pulsanti Add to cart
function setupAddToCartButtons() {
    const buttons = document.querySelectorAll('.btn-add-cart');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = btn.closest('.product-card');
            const name = card.querySelector('.product-name').textContent;
            const description = card.querySelector('.product-description').textContent;
            const priceText = card.querySelector('.product-price').textContent.replace('€', '').replace(',', '.');
            const price = parseFloat(priceText);
            const id = name.replace(/\s+/g, '-').toLowerCase();
            const product = {
                id,
                name,
                description,
                price,
                quantity: 1
            };
            addToCart(product);
        });
    });
}

// Esegui la funzione su tutte le pagine prodotto
if (document.querySelector('.btn-add-cart')) {
    setupAddToCartButtons();
}

// Mini cart overlay logic
function updateMiniCart() {
    const cart = getCart();
    const miniCartItems = document.getElementById('miniCartItems');
    const miniCartTotal = document.getElementById('miniCartTotal');
    const cartCount = document.getElementById('cart-count');
    if (!miniCartItems || !miniCartTotal || !cartCount) return;
    miniCartItems.innerHTML = '';
    let total = 0;
    let count = 0;
    if (cart.length === 0) {
        miniCartItems.innerHTML = '<p>Il carrello è vuoto.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            count += item.quantity;
            miniCartItems.innerHTML += `<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;'>
                <span>${item.name ? item.name : ''}</span>
                <div style='display:flex;align-items:center;gap:4px;'>
                    <button class='mini-cart-qty-btn' data-id='${item.id}' data-action='decrease' style='background:#eee;border:none;border-radius:50%;width:22px;height:22px;font-weight:bold;cursor:pointer;'>-</button>
                    <span style='min-width:24px;text-align:center;'>${item.quantity}</span>
                    <button class='mini-cart-qty-btn' data-id='${item.id}' data-action='increase' style='background:#eee;border:none;border-radius:50%;width:22px;height:22px;font-weight:bold;cursor:pointer;'>+</button>
                    <button class='mini-cart-remove-btn' data-id='${item.id}' style='background:#dc3545;color:#fff;border:none;border-radius:50%;width:22px;height:22px;font-weight:bold;cursor:pointer;margin-left:4px;'>&times;</button>
                </div>
                <span>€${itemTotal.toFixed(2)}</span>
            </div>`;
        });
    }
    miniCartTotal.textContent = `€${total.toFixed(2)}`;
    cartCount.textContent = count;
}

// Gestione click su bottoni della tendina
if (document.getElementById('miniCart')) {
    document.getElementById('miniCart').addEventListener('click', function(e) {
        // Impedisce la chiusura della tendina durante le azioni
        e.stopPropagation();
        if (e.target.classList.contains('mini-cart-qty-btn')) {
            const id = e.target.dataset.id;
            const action = e.target.dataset.action;
            let cart = getCart();
            const item = cart.find(i => i.id === id);
            if (item) {
                if (action === 'increase') item.quantity += 1;
                if (action === 'decrease' && item.quantity > 1) item.quantity -= 1;
                setCart(cart);
                updateMiniCart();
            }
        }
        if (e.target.classList.contains('mini-cart-remove-btn')) {
            const id = e.target.dataset.id;
            let cart = getCart();
            cart = cart.filter(i => i.id !== id);
            setCart(cart);
            updateMiniCart();
        }
    });
}

function showMiniCart() {
    updateMiniCart();
    document.getElementById('miniCart').style.display = 'block';
}
function hideMiniCart() {
    document.getElementById('miniCart').style.display = 'none';
}

const cartBtn = document.getElementById('cartBtn');
if (cartBtn) {
    cartBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const miniCart = document.getElementById('miniCart');
        if (miniCart.style.display === 'block') {
            hideMiniCart();
        } else {
            showMiniCart();
        }
    });
    document.addEventListener('click', function(e) {
        const miniCart = document.getElementById('miniCart');
        if (miniCart && miniCart.style.display === 'block' && !miniCart.contains(e.target) && e.target !== cartBtn) {
            hideMiniCart();
        }
    });
    updateMiniCart();
}

const cartBtnFixed = document.getElementById('cartBtnFixed');
if (cartBtnFixed) {
    cartBtnFixed.addEventListener('click', function(e) {
        e.stopPropagation();
        const miniCart = document.getElementById('miniCart');
        if (miniCart.style.display === 'block') {
            hideMiniCart();
        } else {
            showMiniCart();
        }
    });
    // Aggiorna il conteggio
    function updateFixedCartCount() {
        const cart = getCart();
        let count = 0;
        cart.forEach(item => count += item.quantity);
        const cartCountFixed = document.getElementById('cart-count-fixed');
        if (cartCountFixed) cartCountFixed.textContent = count;
    }
    updateFixedCartCount();
    // Aggiorna quando cambia il carrello
    const origSetCart = window.setCart;
    window.setCart = function(cart) {
        origSetCart(cart);
        updateFixedCartCount();
    };
}

// Aggiorna mini cart quando si aggiunge un prodotto
if (typeof setupAddToCartButtons === 'function') {
    const origAddToCart = window.addToCart;
    window.addToCart = function(product) {
        origAddToCart(product);
        updateMiniCart();
    };
}
