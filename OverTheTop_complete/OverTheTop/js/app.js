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

// ── Ambient Mode ─────────────────────────────────────────────
function initAmbient() {
  const btn = document.getElementById('ambientBtn');
  if (!btn) return;
  let active = false;
  let audioCtx, windGain, masterGain;
  let animId, canvas, ctx, vignette;
  const particles = [];

  // Create canvas + vignette (no HTML edits needed on product pages)
  canvas = document.createElement('canvas');
  canvas.className = 'ambient-canvas';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  vignette = document.createElement('div');
  vignette.className = 'ambient-vignette';
  document.body.appendChild(vignette);

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  // ── Particles ──
  function spawn() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.8,
      vy: -(Math.random() * 0.25 + 0.08),
      vx: (Math.random() - 0.5) * 0.35,
      o: Math.random() * 0.35 + 0.08,
      hue: 30 + Math.random() * 25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.006
    };
  }
  for (let i = 0; i < 45; i++) particles.push(spawn());

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.phase += p.speed;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      const a = p.o * (0.55 + 0.45 * Math.sin(p.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowBlur = p.r * 5;
      ctx.shadowColor = 'hsl(' + p.hue + ',55%,68%)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(' + p.hue + ',55%,75%)';
      ctx.fill();
      ctx.restore();
    }
    animId = requestAnimationFrame(draw);
  }

  // ── Web Audio: brown-noise wind + bird chirps ──
  function bootAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);

    // Brown noise
    const len = 2 * audioCtx.sampleRate;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      d[i] = (last + 0.02 * w) / 1.02;
      last = d[i];
      d[i] *= 3.5;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 550;
    windGain = audioCtx.createGain();
    windGain.gain.value = 0;
    src.connect(lp); lp.connect(windGain); windGain.connect(masterGain);
    src.start();

    // Wind volume modulation
    (function modWind() {
      if (!active) { setTimeout(modWind, 2000); return; }
      windGain.gain.linearRampToValueAtTime(
        0.12 + Math.random() * 0.16,
        audioCtx.currentTime + 2 + Math.random() * 3
      );
      setTimeout(modWind, 3000 + Math.random() * 4000);
    })();

    // Bird chirps
    (function chirp() {
      if (!active) { setTimeout(chirp, 4000); return; }
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      const base = 1200 + Math.random() * 800;
      o.frequency.setValueAtTime(base, audioCtx.currentTime);
      o.frequency.linearRampToValueAtTime(base + 400, audioCtx.currentTime + 0.06);
      o.frequency.linearRampToValueAtTime(base - 100, audioCtx.currentTime + 0.14);
      g.gain.setValueAtTime(0.025, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      o.connect(g); g.connect(masterGain);
      o.start(); o.stop(audioCtx.currentTime + 0.2);
      // Double chirp sometimes
      if (Math.random() > 0.6) {
        const o2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        o2.type = 'sine';
        const b2 = base + 200;
        o2.frequency.setValueAtTime(b2, audioCtx.currentTime + 0.25);
        o2.frequency.linearRampToValueAtTime(b2 + 300, audioCtx.currentTime + 0.31);
        o2.frequency.linearRampToValueAtTime(b2 - 50, audioCtx.currentTime + 0.38);
        g2.gain.setValueAtTime(0.02, audioCtx.currentTime + 0.25);
        g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.42);
        o2.connect(g2); g2.connect(masterGain);
        o2.start(audioCtx.currentTime + 0.25);
        o2.stop(audioCtx.currentTime + 0.44);
      }
      setTimeout(chirp, 6000 + Math.random() * 15000);
    })();
  }

  btn.addEventListener('click', function() {
    active = !active;
    btn.classList.toggle('active', active);
    if (active) {
      if (!audioCtx) bootAudio();
      else if (audioCtx.state === 'suspended') audioCtx.resume();
      windGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.5);
      canvas.classList.add('visible');
      vignette.classList.add('visible');
      draw();
    } else {
      if (windGain) windGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
      canvas.classList.remove('visible');
      vignette.classList.remove('visible');
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    }
  });
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

  // Checkout — navigate to payment page
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (getCart().length === 0) { showToast('Your cart is empty!'); return; }
    close();
    window.location.href = 'payment.html';
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

// ── View Details buttons ──────────────────────────────────────
function initViewDetails() {
  const slugMap = {
    'Summit Explorer': 'product-summit-explorer.html',
    'Mountain Guardian': 'product-mountain-guardian.html',
    'Trail Voyager': 'product-trail-voyager.html',
    'Marathon Elite': 'product-marathon-elite.html',
    'Urban Pace': 'product-urban-pace.html',
    'Tempo Racer': 'product-tempo-racer.html',
    'Mountain Grip': 'product-mountain-grip.html',
    'Rock Climber': 'product-rock-climber.html',
    'Summit Apex': 'product-summit-apex.html'
  };

  document.querySelectorAll('.product-card').forEach(card => {
    const name = card.querySelector('.product-name')?.textContent?.trim();
    const slug = slugMap[name];
    if (!slug) return;

    const addBtn = card.querySelector('.btn-add-cart');
    if (!addBtn) return;

    const link = document.createElement('a');
    link.href = slug;
    link.className = 'btn-view-details';
    link.textContent = 'View Details';
    addBtn.after(link);
  });
}

// ── Wishlist (persistent) ────────────────────────────────────
const WISH_KEY = 'ott_wishlist';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; }
  catch { return []; }
}
function saveWishlist(list) {
  localStorage.setItem(WISH_KEY, JSON.stringify(list));
}
function addToWishlist(name, price, category) {
  const list = getWishlist();
  if (!list.find(i => i.name === name)) {
    list.push({ name, price, category });
    saveWishlist(list);
  }
}
function removeFromWishlist(name) {
  saveWishlist(getWishlist().filter(i => i.name !== name));
}

function initWishlist() {
  const wishlist = getWishlist();
  // Restore wished state on page load
  document.querySelectorAll('.btn-wish').forEach(btn => {
    const card = btn.closest('.product-card');
    const name = card?.querySelector('.product-name')?.textContent;
    if (name && wishlist.find(i => i.name === name)) {
      btn.classList.add('wished');
    }
    btn.addEventListener('click', function () {
      this.classList.toggle('wished');
      const n = this.closest('.product-card')?.querySelector('.product-name')?.textContent;
      const priceEl = this.closest('.product-card')?.querySelector('.product-price')?.textContent || '€0';
      const price = parseFloat(priceEl.replace(/[^0-9.]/g, '')) || 0;
      const cat = this.closest('.product-card')?.querySelector('.product-category')?.textContent?.trim() || '';
      if (this.classList.contains('wished')) {
        addToWishlist(n, price, cat);
        showToast(`${n} saved to wishlist`);
      } else {
        removeFromWishlist(n);
        showToast(`${n} removed from wishlist`);
      }
    });
  });
}

// ── Order History & Loyalty Points ───────────────────────────
const ORDERS_KEY = 'ott_orders';
const POINTS_KEY = 'ott_points';

function getOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
  catch { return []; }
}
function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
function getPoints() {
  try { return parseInt(localStorage.getItem(POINTS_KEY)) || 0; }
  catch { return 0; }
}
function addPoints(amount) {
  // 1 point per €1 spent
  const pts = getPoints() + Math.floor(amount);
  localStorage.setItem(POINTS_KEY, String(pts));
  return pts;
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

// ── Logo Dropdown Menu ───────────────────────────────────────
function initLogoMenu() {
  const toggle = document.getElementById('logoMenuToggle');
  const dropdown = document.getElementById('logoDropdown');
  if (!toggle || !dropdown) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== toggle) {
      dropdown.classList.remove('open');
    }
  });

  // Append ?action= to account links
  dropdown.querySelectorAll('a[data-action]').forEach(link => {
    const action = link.getAttribute('data-action');
    link.href = 'account.html?action=' + action;
  });

  // If user is logged in, add My Account link at top of dropdown
  try {
    const session = JSON.parse(localStorage.getItem('ott_session'));
    if (session) {
      const myAccLink = document.createElement('a');
      myAccLink.href = 'dashboard.html';
      myAccLink.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2"/><circle cx="12" cy="7" r="4"/></svg> My Account';
      myAccLink.style.fontWeight = '600';
      const firstLink = dropdown.querySelector('a');
      dropdown.insertBefore(myAccLink, firstLink);
    }
  } catch {}
}

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLogoMenu();
  initNavbar();
  initAmbient();
  initCart();
  initFilters();
  initAddToCart();
  initViewDetails();
  initWishlist();
  initNewsletter();
  initContactForm();
  updateCartUI();
  initScrollReveal();
});
