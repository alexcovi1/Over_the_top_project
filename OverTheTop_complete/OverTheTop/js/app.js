/* ============================================================
   OVER THE TOP — app.js
   Global JS: navbar, search, cart sidebar, wishlist, toast,
   product filters, checkout modal, newsletter
   ============================================================ */

// ── Cart State (localStorage) ────────────────────────────────
const CART_KEY = 'ott_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(name, price, category, size) {
  const cart = getCart();
  const key = `${name}__${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ key, name, price, category, size, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  showToast(`${name} (size ${size}) added to cart`);
}

function removeFromCart(key) {
  const cart = getCart().filter(i => i.key !== key);
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}

function updateQty(key, delta) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}

function getTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function getItemCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

// ── Cart UI ──────────────────────────────────────────────────
function updateCartUI() {
  const count = getItemCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = '';
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img shoe-placeholder" style="width:80px;height:80px;border-radius:4px;overflow:hidden;">
        <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 45 Q20 20 50 18 Q70 16 90 28 L92 40 Q80 48 60 46 L10 48 Z" stroke="#c8a882" stroke-width="2" fill="none"/>
          <path d="M20 40 Q40 22 65 22" stroke="#c8a882" stroke-width="1.5" fill="none" opacity="0.5"/>
        </svg>
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">${item.category} · Size ${item.size}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.key}', -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.key}', 1)">+</button>
          <span class="cart-item-price">€${(item.price * item.qty).toFixed(0)}</span>
          <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" title="Remove">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('cartTotal').textContent = `€${getTotal().toFixed(0)}`;
}

// ── Toast ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  clearTimeout(toastTimer);
  toast.classList.remove('show');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add('show'); });
  });
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Navbar ───────────────────────────────────────────────────
function initNavbar() {
  // Scroll shadow
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  // Active link highlight
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-categories a, .nav-links a').forEach(a => {
    if (a.getAttribute('href') === path || a.href === window.location.href) {
      a.classList.add('active');
    }
  });
}

// ── Search ───────────────────────────────────────────────────
function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const openBtn = document.getElementById('searchBtn');
  const closeBtn = document.getElementById('searchClose');
  const input   = document.getElementById('searchInput');

  openBtn?.addEventListener('click', () => {
    overlay?.classList.add('open');
    setTimeout(() => input?.focus(), 200);
  });
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      // Search across products on the current page
      const q = input.value.trim().toLowerCase();
      overlay?.classList.remove('open');
      filterBySearch(q);
    }
    if (e.key === 'Escape') overlay?.classList.remove('open');
  });
}

function filterBySearch(q) {
  const cards = document.querySelectorAll('.product-card');
  if (!cards.length) return;
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.classList.toggle('hidden', !text.includes(q));
  });
  if (q === '') cards.forEach(c => c.classList.remove('hidden'));
}

// ── Cart Sidebar ─────────────────────────────────────────────
function initCart() {
  const overlay   = document.getElementById('cartOverlay');
  const sidebar   = document.getElementById('cartSidebar');
  const openBtns  = document.querySelectorAll('.cart-btn');
  const closeBtn  = document.getElementById('cartClose');

  function open() {
    overlay?.classList.add('open');
    sidebar?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartItems();
  }
  function close() {
    overlay?.classList.remove('open');
    sidebar?.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(b => b.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  // Checkout
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (getCart().length === 0) { showToast('Your cart is empty!'); return; }
    close();
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.add('open');
      saveCart([]);
      updateCartUI();
    }
  });

  document.getElementById('closeCheckout')?.addEventListener('click', () => {
    document.getElementById('checkoutModal')?.classList.remove('open');
  });
}

// ── Product Filter Bar ───────────────────────────────────────
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else {
          const cat = card.querySelector('.product-category')?.textContent?.trim().toUpperCase();
          card.classList.toggle('hidden', cat !== filter.toUpperCase());
        }
      });
    });
  });
}

// ── Add-to-cart buttons ───────────────────────────────────────
function initAddToCart() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      const card    = this.closest('.product-card');
      const name    = card?.querySelector('.product-name')?.textContent || 'Product';
      const priceEl = card?.querySelector('.product-price')?.textContent || '€0';
      const price   = parseFloat(priceEl.replace(/[^0-9.]/g, '')) || 0;
      const cat     = card?.querySelector('.product-category')?.textContent?.trim() || '';
      const sel     = card?.querySelector('.size-select');
      const size    = sel ? sel.value : '42';

      addToCart(name, price, cat, size);

      this.textContent = 'Added ✓';
      this.classList.add('added');
      setTimeout(() => {
        this.textContent = 'Add to cart';
        this.classList.remove('added');
      }, 1800);
    });
  });
}

// ── Wishlist ────────────────────────────────────────────────
function initWishlist() {
  document.querySelectorAll('.btn-wish').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('wished');
      const name = this.closest('.product-card')?.querySelector('.product-name')?.textContent;
      showToast(this.classList.contains('wished') ? `${name} saved to wishlist` : `${name} removed from wishlist`);
    });
  });
}

// ── Newsletter ────────────────────────────────────────────────
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input?.value.trim()) {
        showToast('Thanks for subscribing!');
        input.value = '';
      }
    });
  });
}

// ── Contact Form ─────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('formSuccess')?.classList.add('visible');
    form.reset();
    setTimeout(() => document.getElementById('formSuccess')?.classList.remove('visible'), 4000);
  });
}

// ── Scroll reveal ─────────────────────────────────────────────
function initScrollReveal() {
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .value-card, .stat-item, .feature-item').forEach(el => {
    el.style.animationPlayState = 'paused';
    el.classList.add('fade-up');
    observer.observe(el);
  });
}

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSearch();
  initCart();
  initFilters();
  initAddToCart();
  initWishlist();
  initNewsletter();
  initContactForm();
  updateCartUI();
  initScrollReveal();
});
