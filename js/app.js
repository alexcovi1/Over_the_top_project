/* ============================================================
   OVER THE TOP — app.js
   Global JS: navbar, search, cart sidebar, wishlist, toast,
   product filters, checkout modal, newsletter
   ============================================================ */

// ── Per-account data helper ──────────────────────────────────
function getSessionEmail() {
  try {
    const s = JSON.parse(localStorage.getItem('ott_session'));
    return s ? s.email : '';
  } catch { return ''; }
}
function userKey(base) {
  const email = getSessionEmail();
  return email ? base + '_' + email : base;
}

// ── Animal Theme System ──────────────────────────────────────
const ANIMAL_THEMES = {
  fox: {
    gold: '#e8914c',
    goldDark: '#c46d2e',
    particleA: 'rgba(232,145,76,0.9)',
    particleB: 'rgba(196,109,46,0.4)',
    glowColor: 'rgba(232,145,76,0.15)',
    emoji: '🦊',
    name: 'Fox',
    personality: 'Clever'
  },
  panda: {
    gold: '#4ECDC4',
    goldDark: '#36a89f',
    particleA: 'rgba(78,205,196,0.9)',
    particleB: 'rgba(54,168,159,0.4)',
    glowColor: 'rgba(78,205,196,0.15)',
    emoji: '🐼',
    name: 'Panda',
    personality: 'Zen'
  },
  owl: {
    gold: '#9B7FCC',
    goldDark: '#7B5EA7',
    particleA: 'rgba(155,127,204,0.9)',
    particleB: 'rgba(123,94,167,0.4)',
    glowColor: 'rgba(155,127,204,0.15)',
    emoji: '🦉',
    name: 'Owl',
    personality: 'Wise'
  },
  bunny: {
    gold: '#FF6B9D',
    goldDark: '#e04a7e',
    particleA: 'rgba(255,107,157,0.9)',
    particleB: 'rgba(224,74,126,0.4)',
    glowColor: 'rgba(255,107,157,0.15)',
    emoji: '🐰',
    name: 'Bunny',
    personality: 'Happy'
  },
  parrot: {
    gold: '#2ECC71',
    goldDark: '#27ae60',
    particleA: 'rgba(46,204,113,0.9)',
    particleB: 'rgba(39,174,96,0.4)',
    glowColor: 'rgba(46,204,113,0.15)',
    emoji: '🦜',
    name: 'Parrot',
    personality: 'Adventurous'
  }
};

let activeAnimalTheme = null;

function getAnimalTheme() {
  const email = getSessionEmail();
  if (!email) return null;
  try {
    const session = JSON.parse(localStorage.getItem('ott_session'));
    return session && session.avatar ? ANIMAL_THEMES[session.avatar] || null : null;
  } catch { return null; }
}

function initAnimalTheme() {
  activeAnimalTheme = getAnimalTheme();
  const root = document.documentElement;
  if (!activeAnimalTheme) {
    // Reset to defaults when not logged in
    root.style.removeProperty('--gold');
    root.style.removeProperty('--gold-dark');
    updateParticleStyles(null);
    return;
  }
  const t = activeAnimalTheme;
  root.style.setProperty('--gold', t.gold);
  root.style.setProperty('--gold-dark', t.goldDark);
  updateParticleStyles(t);
}

function updateParticleStyles(theme) {
  let styleEl = document.getElementById('animalThemeStyle');
  if (!theme) {
    if (styleEl) styleEl.remove();
    return;
  }
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'animalThemeStyle';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    .cursor-particle { background: radial-gradient(circle, ${theme.particleA}, ${theme.particleB}) !important; }
    .cursor-glow { background: radial-gradient(circle, ${theme.glowColor}, transparent 70%) !important; }
    .toast { border-left-color: ${theme.gold} !important; }
  `;
}

// ── Cart State (localStorage, per-account) ───────────────────
const CART_KEY = 'ott_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(userKey(CART_KEY))) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(userKey(CART_KEY), JSON.stringify(cart));
}

function addToCart(name, price, category, size, image) {
  const cart = getCart();
  const key = `${name}__${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += 1;
    if (image && !existing.image) existing.image = image;
  } else {
    cart.push({ key, name, price, category, size, qty: 1, image: image || '' });
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
      <div class="cart-item-img" style="width:80px;height:80px;border-radius:4px;overflow:hidden;background:#1a1a1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;"/>` : `<svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 45 Q20 20 50 18 Q70 16 90 28 L92 40 Q80 48 60 46 L10 48 Z" stroke="#c8a882" stroke-width="2" fill="none"/>
          <path d="M20 40 Q40 22 65 22" stroke="#c8a882" stroke-width="1.5" fill="none" opacity="0.5"/>
        </svg>`}
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
  const theme = activeAnimalTheme || getAnimalTheme();
  const prefix = theme ? theme.emoji + ' ' : '';
  toast.textContent = prefix + msg;
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

// ── Ambient Mode (3 modes: Forest / Rain / Flute) ───────────
function initAmbient() {
  const btn = document.getElementById('ambientBtn');
  if (!btn) return;
  const label = btn.querySelector('span');
  let mode = 0; // 0=off, 1=forest, 2=rain, 3=flute
  const NAMES = ['Ambient', 'Forest', 'Rain', 'Flute'];
  let audioCtx, masterGain;
  let animId, canvas, ctx, vignette;
  const particles = [];
  let forestNodes = null, rainNodes = null, fluteNodes = null;
  let forestTimers = [], rainTimers = [], fluteTimers = [];

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

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.3;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  // ── Particle configs per mode ──
  var modeCfg = {
    forest: {
      count: 45,
      spawn: function() {
        return { x: Math.random()*canvas.width, y: Math.random()*canvas.height,
          r: Math.random()*2.5+0.8, vy: -(Math.random()*0.25+0.08),
          vx: (Math.random()-0.5)*0.35, o: Math.random()*0.35+0.08,
          hue: 30+Math.random()*25, phase: Math.random()*Math.PI*2,
          speed: Math.random()*0.015+0.006 };
      },
      draw: function(p) {
        p.x+=p.vx; p.y+=p.vy; p.phase+=p.speed;
        if(p.y<-10){p.y=canvas.height+10;p.x=Math.random()*canvas.width;}
        if(p.x<-10)p.x=canvas.width+10; if(p.x>canvas.width+10)p.x=-10;
        var a=p.o*(0.55+0.45*Math.sin(p.phase));
        ctx.save(); ctx.globalAlpha=a; ctx.shadowBlur=p.r*5;
        ctx.shadowColor='hsl('+p.hue+',55%,68%)';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle='hsl('+p.hue+',55%,75%)'; ctx.fill(); ctx.restore();
      }
    },
    rain: {
      count: 80,
      spawn: function() {
        return { x: Math.random()*canvas.width, y: Math.random()*canvas.height,
          r: Math.random()*1.2+0.4, vy: Math.random()*3+2,
          vx: -0.3-Math.random()*0.5, o: Math.random()*0.3+0.1,
          hue: 200+Math.random()*20, len: Math.random()*12+6,
          phase: Math.random()*Math.PI*2, speed: Math.random()*0.02+0.01 };
      },
      draw: function(p) {
        p.x+=p.vx; p.y+=p.vy; p.phase+=p.speed;
        if(p.y>canvas.height+10){p.y=-10;p.x=Math.random()*canvas.width;}
        if(p.x<-20)p.x=canvas.width+10;
        var a=p.o*(0.6+0.4*Math.sin(p.phase));
        ctx.save(); ctx.globalAlpha=a;
        ctx.strokeStyle='hsl('+p.hue+',60%,72%)'; ctx.lineWidth=p.r;
        ctx.shadowBlur=p.r*3; ctx.shadowColor='hsl('+p.hue+',60%,67%)';
        ctx.beginPath(); ctx.moveTo(p.x,p.y);
        ctx.lineTo(p.x+p.vx*2,p.y-p.len); ctx.stroke(); ctx.restore();
      }
    },
    flute: {
      count: 35,
      spawn: function() {
        return { x: Math.random()*canvas.width, y: Math.random()*canvas.height,
          r: Math.random()*3.5+1.2, vy: -(Math.random()*0.15+0.03),
          vx: (Math.random()-0.5)*0.2, o: Math.random()*0.25+0.05,
          hue: 270+Math.random()*40, phase: Math.random()*Math.PI*2,
          speed: Math.random()*0.008+0.003, breathe: Math.random()*0.5+0.5 };
      },
      draw: function(p) {
        p.x+=p.vx; p.y+=p.vy; p.phase+=p.speed;
        if(p.y<-20){p.y=canvas.height+20;p.x=Math.random()*canvas.width;}
        if(p.x<-20)p.x=canvas.width+20; if(p.x>canvas.width+20)p.x=-20;
        var br=p.r*(0.8+0.2*Math.sin(p.phase*p.breathe));
        var a=p.o*(0.4+0.6*Math.sin(p.phase));
        ctx.save(); ctx.globalAlpha=a; ctx.shadowBlur=br*6;
        ctx.shadowColor='hsl('+p.hue+',45%,70%)';
        var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,br*2);
        g.addColorStop(0,'hsla('+p.hue+',45%,75%,0.6)');
        g.addColorStop(0.5,'hsla('+p.hue+',35%,80%,0.2)');
        g.addColorStop(1,'hsla('+p.hue+',45%,75%,0)');
        ctx.beginPath(); ctx.arc(p.x,p.y,br*2,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill(); ctx.restore();
      }
    }
  };

  function resetParticles(name) {
    particles.length = 0;
    var c = modeCfg[name];
    for (var i = 0; i < c.count; i++) particles.push(c.spawn());
  }

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var name = NAMES[mode].toLowerCase();
    if (mode !== 0 && modeCfg[name]) {
      for (var i = 0; i < particles.length; i++) modeCfg[name].draw(particles[i]);
    }
    animId = requestAnimationFrame(drawFrame);
  }

  // ── Audio: Forest (brown-noise wind + bird chirps) ──
  function bootForest() {
    ensureAudio();
    var len = 2 * audioCtx.sampleRate;
    var buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    var d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random()*2-1; d[i]=(last+0.02*w)/1.02; last=d[i]; d[i]*=3.5;
    }
    var src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    var lp = audioCtx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=550;
    var gain = audioCtx.createGain(); gain.gain.value = 0;
    src.connect(lp); lp.connect(gain); gain.connect(masterGain); src.start();
    gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.5);
    forestNodes = { src: src, gain: gain };

    (function modWind() {
      if (mode !== 1) return;
      gain.gain.linearRampToValueAtTime(0.12+Math.random()*0.16, audioCtx.currentTime+2+Math.random()*3);
      forestTimers.push(setTimeout(modWind, 3000+Math.random()*4000));
    })();

    (function chirp() {
      if (mode !== 1) return;
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type='sine'; var base=1200+Math.random()*800;
      o.frequency.setValueAtTime(base,audioCtx.currentTime);
      o.frequency.linearRampToValueAtTime(base+400,audioCtx.currentTime+0.06);
      o.frequency.linearRampToValueAtTime(base-100,audioCtx.currentTime+0.14);
      g.gain.setValueAtTime(0.025,audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.18);
      o.connect(g); g.connect(masterGain); o.start(); o.stop(audioCtx.currentTime+0.2);
      if (Math.random()>0.6) {
        var o2=audioCtx.createOscillator(),g2=audioCtx.createGain();
        o2.type='sine'; var b2=base+200;
        o2.frequency.setValueAtTime(b2,audioCtx.currentTime+0.25);
        o2.frequency.linearRampToValueAtTime(b2+300,audioCtx.currentTime+0.31);
        o2.frequency.linearRampToValueAtTime(b2-50,audioCtx.currentTime+0.38);
        g2.gain.setValueAtTime(0.02,audioCtx.currentTime+0.25);
        g2.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.42);
        o2.connect(g2); g2.connect(masterGain);
        o2.start(audioCtx.currentTime+0.25); o2.stop(audioCtx.currentTime+0.44);
      }
      forestTimers.push(setTimeout(chirp, 6000+Math.random()*15000));
    })();
  }

  function stopForest() {
    forestTimers.forEach(clearTimeout); forestTimers=[];
    if (forestNodes) {
      forestNodes.gain.gain.linearRampToValueAtTime(0,audioCtx.currentTime+0.8);
      var fn=forestNodes; setTimeout(function(){try{fn.src.stop();}catch(e){}},1000);
      forestNodes=null;
    }
  }

  // ── Audio: Rain (pink noise + distant thunder) ──
  function bootRain() {
    ensureAudio();
    var len = 2*audioCtx.sampleRate;
    var buf = audioCtx.createBuffer(1,len,audioCtx.sampleRate);
    var d = buf.getChannelData(0);
    var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (var i=0;i<len;i++) {
      var white=Math.random()*2-1;
      b0=0.99886*b0+white*0.0555179; b1=0.99332*b1+white*0.0750759;
      b2=0.96900*b2+white*0.1538520; b3=0.86650*b3+white*0.3104856;
      b4=0.55000*b4+white*0.5329522; b5=-0.7616*b5-white*0.0168980;
      d[i]=(b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.11; b6=white*0.115926;
    }
    var src = audioCtx.createBufferSource(); src.buffer=buf; src.loop=true;
    var bp = audioCtx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=800; bp.Q.value=0.5;
    var gain = audioCtx.createGain(); gain.gain.value=0;
    src.connect(bp); bp.connect(gain); gain.connect(masterGain); src.start();
    gain.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime+2);
    rainNodes = { src: src, gain: gain };

    (function modRain() {
      if (mode !== 2) return;
      gain.gain.linearRampToValueAtTime(0.15+Math.random()*0.12, audioCtx.currentTime+3+Math.random()*2);
      rainTimers.push(setTimeout(modRain, 4000+Math.random()*3000));
    })();

    (function thunder() {
      if (mode !== 2) return;
      var o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.type='sawtooth';
      o.frequency.setValueAtTime(40+Math.random()*20,audioCtx.currentTime);
      o.frequency.linearRampToValueAtTime(25,audioCtx.currentTime+1.5);
      var lp=audioCtx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=150;
      g.gain.setValueAtTime(0.04,audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(0.08,audioCtx.currentTime+0.3);
      g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+2.5);
      o.connect(lp); lp.connect(g); g.connect(masterGain);
      o.start(); o.stop(audioCtx.currentTime+2.8);
      rainTimers.push(setTimeout(thunder, 12000+Math.random()*20000));
    })();
  }

  function stopRain() {
    rainTimers.forEach(clearTimeout); rainTimers=[];
    if (rainNodes) {
      rainNodes.gain.gain.linearRampToValueAtTime(0,audioCtx.currentTime+0.8);
      var rn=rainNodes; setTimeout(function(){try{rn.src.stop();}catch(e){}},1000);
      rainNodes=null;
    }
  }

  // ── Audio: Flute (pentatonic melody + pad drone) ──
  function bootFlute() {
    ensureAudio();
    var notes = [392.0,440.0,493.9,523.3,587.3,659.3,784.0];

    // Soft pad drone (root + fifth)
    var padOsc1 = audioCtx.createOscillator(), padOsc2 = audioCtx.createOscillator();
    var padGain = audioCtx.createGain();
    padOsc1.type='sine'; padOsc2.type='sine';
    padOsc1.frequency.value=196.0; padOsc2.frequency.value=293.7;
    padGain.gain.value=0;
    padOsc1.connect(padGain); padOsc2.connect(padGain); padGain.connect(masterGain);
    padOsc1.start(); padOsc2.start();
    padGain.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime+2);
    fluteNodes = { padOsc1: padOsc1, padOsc2: padOsc2, padGain: padGain };

    // Flute melody notes — layered harmonics for realistic timbre
    (function playNote() {
      if (mode !== 3) return;
      var freq = notes[Math.floor(Math.random()*notes.length)];
      var dur = 1.2+Math.random()*1.5, t = audioCtx.currentTime;
      var peak = 0.14;

      // Fundamental (loudest)
      var osc1 = audioCtx.createOscillator(); osc1.type='sine';
      osc1.frequency.setValueAtTime(freq, t);
      var g1 = audioCtx.createGain();
      g1.gain.setValueAtTime(0,t);
      g1.gain.linearRampToValueAtTime(peak,t+0.08);
      g1.gain.setValueAtTime(peak*0.85,t+0.15);
      g1.gain.linearRampToValueAtTime(peak*0.7,t+dur*0.6);
      g1.gain.exponentialRampToValueAtTime(0.001,t+dur);
      osc1.connect(g1); g1.connect(masterGain);
      osc1.start(t); osc1.stop(t+dur+0.05);

      // 2nd harmonic (gives body — flute characteristic)
      var osc2 = audioCtx.createOscillator(); osc2.type='sine';
      osc2.frequency.setValueAtTime(freq*2, t);
      var g2 = audioCtx.createGain();
      g2.gain.setValueAtTime(0,t);
      g2.gain.linearRampToValueAtTime(peak*0.35,t+0.06);
      g2.gain.linearRampToValueAtTime(peak*0.25,t+dur*0.5);
      g2.gain.exponentialRampToValueAtTime(0.001,t+dur);
      osc2.connect(g2); g2.connect(masterGain);
      osc2.start(t); osc2.stop(t+dur+0.05);

      // 3rd harmonic (brightness/edge)
      var osc3 = audioCtx.createOscillator(); osc3.type='sine';
      osc3.frequency.setValueAtTime(freq*3, t);
      var g3 = audioCtx.createGain();
      g3.gain.setValueAtTime(0,t);
      g3.gain.linearRampToValueAtTime(peak*0.12,t+0.05);
      g3.gain.exponentialRampToValueAtTime(0.001,t+dur*0.7);
      osc3.connect(g3); g3.connect(masterGain);
      osc3.start(t); osc3.stop(t+dur+0.05);

      // Vibrato on all oscillators
      var vib = audioCtx.createOscillator(), vibG1 = audioCtx.createGain();
      var vibG2 = audioCtx.createGain(), vibG3 = audioCtx.createGain();
      vib.frequency.value = 4.5+Math.random()*1.5;
      vibG1.gain.value = freq*0.012; vibG2.gain.value = freq*2*0.012; vibG3.gain.value = freq*3*0.012;
      vib.connect(vibG1); vibG1.connect(osc1.frequency);
      vib.connect(vibG2); vibG2.connect(osc2.frequency);
      vib.connect(vibG3); vibG3.connect(osc3.frequency);
      vib.start(t+0.15); vib.stop(t+dur+0.05);

      // Breathy attack (louder, wider band)
      var bLen = Math.ceil((dur+0.2)*audioCtx.sampleRate);
      var bBuf = audioCtx.createBuffer(1,bLen,audioCtx.sampleRate);
      var bd = bBuf.getChannelData(0);
      for (var i=0;i<bLen;i++) bd[i]=(Math.random()*2-1);
      var bSrc = audioCtx.createBufferSource(); bSrc.buffer=bBuf;
      var bFilt = audioCtx.createBiquadFilter();
      bFilt.type='bandpass'; bFilt.frequency.value=freq*1.5; bFilt.Q.value=1.2;
      var bGain = audioCtx.createGain();
      bGain.gain.setValueAtTime(0,t);
      bGain.gain.linearRampToValueAtTime(0.035,t+0.04);
      bGain.gain.linearRampToValueAtTime(0.015,t+0.2);
      bGain.gain.linearRampToValueAtTime(0.008,t+dur*0.5);
      bGain.gain.exponentialRampToValueAtTime(0.001,t+dur);
      bSrc.connect(bFilt); bFilt.connect(bGain); bGain.connect(masterGain);
      bSrc.start(t); bSrc.stop(t+dur+0.2);

      // Harmony note sometimes (a third or fifth above)
      if (Math.random()>0.6) {
        var intervals = [1.25, 1.333, 1.5];
        var hFreq = freq * intervals[Math.floor(Math.random()*intervals.length)];
        var ho = audioCtx.createOscillator(); ho.type='sine'; ho.frequency.value=hFreq;
        var ho2 = audioCtx.createOscillator(); ho2.type='sine'; ho2.frequency.value=hFreq*2;
        var hg = audioCtx.createGain();
        hg.gain.setValueAtTime(0,t+0.3);
        hg.gain.linearRampToValueAtTime(peak*0.4,t+0.45);
        hg.gain.linearRampToValueAtTime(peak*0.3,t+dur*0.5);
        hg.gain.exponentialRampToValueAtTime(0.001,t+dur-0.1);
        ho.connect(hg); ho2.connect(hg); hg.connect(masterGain);
        ho.start(t+0.3); ho.stop(t+dur);
        ho2.start(t+0.3); ho2.stop(t+dur);
      }
      fluteTimers.push(setTimeout(playNote, (dur+0.3+Math.random()*1.5)*1000));
    })();

    // Pad drift
    (function padDrift() {
      if (mode !== 3) return;
      padGain.gain.linearRampToValueAtTime(0.015+Math.random()*0.02, audioCtx.currentTime+3);
      fluteTimers.push(setTimeout(padDrift, 5000+Math.random()*3000));
    })();
  }

  function stopFlute() {
    fluteTimers.forEach(clearTimeout); fluteTimers=[];
    if (fluteNodes) {
      fluteNodes.padGain.gain.linearRampToValueAtTime(0,audioCtx.currentTime+0.8);
      var fn=fluteNodes;
      setTimeout(function(){try{fn.padOsc1.stop();}catch(e){} try{fn.padOsc2.stop();}catch(e){}},1000);
      fluteNodes=null;
    }
  }

  // ── Mode switching ──
  function stopCurrent() {
    if (mode===1) stopForest();
    else if (mode===2) stopRain();
    else if (mode===3) stopFlute();
    canvas.classList.remove('visible');
    vignette.classList.remove('visible');
    if (animId) { cancelAnimationFrame(animId); animId=null; }
    btn.classList.remove('active','mode-forest','mode-rain','mode-flute');
    vignette.classList.remove('mode-forest','mode-rain','mode-flute');
  }

  function startMode(m) {
    var name = NAMES[m].toLowerCase();
    btn.classList.add('active','mode-'+name);
    vignette.classList.add('mode-'+name);
    if (label) label.textContent = NAMES[m];
    resetParticles(name);
    canvas.classList.add('visible');
    vignette.classList.add('visible');
    drawFrame();
    if (m===1) bootForest();
    else if (m===2) bootRain();
    else if (m===3) bootFlute();
  }

  btn.addEventListener('click', function() {
    stopCurrent();
    mode = (mode+1) % 4;
    if (mode === 0) {
      if (label) label.textContent = NAMES[0];
      try { localStorage.removeItem('ott_ambient'); } catch(e) {}
    } else {
      startMode(mode);
      try { localStorage.setItem('ott_ambient', String(mode)); } catch(e) {}
    }
  });

  // Resume mode from previous page
  try {
    var saved = parseInt(localStorage.getItem('ott_ambient'), 10);
    if (saved >= 1 && saved <= 3) {
      mode = saved;
      // Start visuals immediately
      var name = NAMES[mode].toLowerCase();
      btn.classList.add('active','mode-'+name);
      vignette.classList.add('mode-'+name);
      if (label) label.textContent = NAMES[mode];
      resetParticles(name);
      canvas.classList.add('visible');
      vignette.classList.add('visible');
      drawFrame();
      // Audio needs a user gesture — boot on first interaction
      function unlockAudio() {
        if (mode===1) bootForest();
        else if (mode===2) bootRain();
        else if (mode===3) bootFlute();
        document.removeEventListener('click', unlockAudio, true);
        document.removeEventListener('touchstart', unlockAudio, true);
        document.removeEventListener('keydown', unlockAudio, true);
        document.removeEventListener('scroll', unlockAudio, true);
      }
      document.addEventListener('click', unlockAudio, true);
      document.addEventListener('touchstart', unlockAudio, true);
      document.addEventListener('keydown', unlockAudio, true);
      document.addEventListener('scroll', unlockAudio, true);
    }
  } catch(e) {}
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
  document.getElementById('continueBtn')?.addEventListener('click', close);

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
      const imgEl   = card?.querySelector('.product-img-wrapper img, .product-image img');
      const image   = imgEl ? imgEl.getAttribute('src') : '';

      addToCart(name, price, cat, size, image);

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

// ── Wishlist (persistent, per-account) ───────────────────────
const WISH_KEY = 'ott_wishlist';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(userKey(WISH_KEY))) || []; }
  catch { return []; }
}
function saveWishlist(list) {
  localStorage.setItem(userKey(WISH_KEY), JSON.stringify(list));
}
function addToWishlist(name, price, category, image) {
  const list = getWishlist();
  if (!list.find(i => i.name === name)) {
    list.push({ name, price, category, image: image || '' });
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
      const n = this.closest('.product-card')?.querySelector('.product-name')?.textContent?.trim();
      const priceEl = this.closest('.product-card')?.querySelector('.product-price')?.textContent || '€0';
      const price = parseFloat(priceEl.replace(/[^0-9.]/g, '')) || 0;
      const cat = this.closest('.product-card')?.querySelector('.product-category')?.textContent?.trim() || '';
      const imgEl = this.closest('.product-card')?.querySelector('.product-image img');
      const image = imgEl ? imgEl.getAttribute('src') : '';
      if (this.classList.contains('wished')) {
        addToWishlist(n, price, cat, image);
        showToast(`${n} saved to wishlist`);
      } else {
        removeFromWishlist(n);
        showToast(`${n} removed from wishlist`);
      }
    });
  });
}

// ── Order History & Loyalty Points (per-account) ────────────
const ORDERS_KEY = 'ott_orders';
const POINTS_KEY = 'ott_points';

function getOrders() {
  try { return JSON.parse(localStorage.getItem(userKey(ORDERS_KEY))) || []; }
  catch { return []; }
}
function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(userKey(ORDERS_KEY), JSON.stringify(orders));
}
function getPoints() {
  try { return parseInt(localStorage.getItem(userKey(POINTS_KEY))) || 0; }
  catch { return 0; }
}
function addPoints(amount) {
  // 1 point per €1 spent
  const pts = getPoints() + Math.floor(amount);
  localStorage.setItem(userKey(POINTS_KEY), String(pts));
  return pts;
}

// ── Customer Reviews Carousel ─────────────────────────────────
function initReviews() {
  const cards = document.querySelectorAll('.review-card');
  if (!cards.length) return;

  const dotsWrap = document.getElementById('reviewDots');
  const sparksEl = document.getElementById('reviewSparks');
  const total = cards.length;
  let current = 0;
  let autoTimer = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragDelta = 0;

  // Build dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'review-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Review ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function positionClass(offset) {
    if (offset === 0) return 'active';
    if (offset === 1) return 'next';
    if (offset === -1) return 'prev';
    if (offset >= 2) return 'far-next';
    return 'far-prev';
  }

  function update() {
    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');
      let offset = i - current;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      card.classList.add(positionClass(offset));
    });
    dotsWrap.querySelectorAll('.review-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function emitSparks() {
    if (!sparksEl) return;
    const rect = sparksEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    for (let i = 0; i < 12; i++) {
      const spark = document.createElement('div');
      spark.className = 'review-spark';
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 80;
      spark.style.left = cx + 'px';
      spark.style.top = cy + 'px';
      spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
      spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
      spark.style.width = (2 + Math.random() * 4) + 'px';
      spark.style.height = spark.style.width;
      sparksEl.appendChild(spark);
      setTimeout(() => spark.remove(), 800);
    }
  }

  function goTo(idx) {
    if (idx === current) return;
    current = ((idx % total) + total) % total;
    update();
    emitSparks();
    resetAuto();
  }

  function advance(dir) { goTo(current + dir); }

  // Nav buttons
  document.getElementById('reviewPrev')?.addEventListener('click', () => advance(-1));
  document.getElementById('reviewNext')?.addEventListener('click', () => advance(1));

  // Keyboard
  const section = document.getElementById('reviewsSection');
  section?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') advance(-1);
    if (e.key === 'ArrowRight') advance(1);
  });

  // Drag / swipe on the stage
  const stage = document.querySelector('.reviews-stage');
  if (stage) {
    stage.addEventListener('pointerdown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragDelta = 0;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      dragDelta = e.clientX - dragStartX;
    });
    stage.addEventListener('pointerup', () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(dragDelta) > 50) {
        advance(dragDelta < 0 ? 1 : -1);
      }
      dragDelta = 0;
    });
  }

  // Click on prev/next cards to navigate
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index);
      if (idx !== current) goTo(idx);
    });
  });

  // Auto-rotate
  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => advance(1), 5000);
  }

  // Pause on hover
  section?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  section?.addEventListener('mouseleave', resetAuto);

  update();
  resetAuto();
}

// ── Contact Form ─────────────────────────────────────────────
function initContactForm() {
  // Contact form logic is now handled inline in contact.html (multi-step trail form)
}

// ── Scroll reveal ─────────────────────────────────────────────
function initScrollReveal() {
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .value-card, .stat-item, .feature-item, .river-chapter, .river-stones, .river-values').forEach(el => {
    el.style.animationPlayState = 'paused';
    el.classList.add('fade-up');
    observer.observe(el);
  });

  // ── River path draw-on-scroll ──
  initRiverScroll();
}

function initRiverScroll() {
  const riverPath = document.querySelector('.river-path');
  const riverGlow = document.querySelector('.river-glow');
  const journey = document.querySelector('.river-journey');
  if (!riverPath || !journey) return;

  const totalLen = riverPath.getTotalLength();
  riverPath.style.strokeDasharray = totalLen;
  riverPath.style.strokeDashoffset = totalLen;
  if (riverGlow) {
    riverGlow.style.strokeDasharray = totalLen;
    riverGlow.style.strokeDashoffset = totalLen;
  }

  function onScroll() {
    const rect = journey.getBoundingClientRect();
    const winH = window.innerHeight;
    const journeyTop = -rect.top;
    const journeyH = rect.height - winH;
    if (journeyH <= 0) return;
    const pct = Math.min(Math.max(journeyTop / journeyH, 0), 1);
    const offset = totalLen * (1 - pct);
    riverPath.style.strokeDashoffset = offset;
    if (riverGlow) riverGlow.style.strokeDashoffset = offset;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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

// ── Interactive Terrain Canvas ───────────────────────────────
function initTerrain() {
  const canvas = document.getElementById('terrainCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const altEl = document.getElementById('terrainAlt');
  let W, H, mouseX = 0.5, mouseY = 0.5, animId;
  const peaks = [];
  const particles = [];
  const LAYERS = 4;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    buildPeaks();
  }

  function buildPeaks() {
    peaks.length = 0;
    for (let l = 0; l < LAYERS; l++) {
      const pts = [];
      const segments = 80;
      const baseY = H * (0.45 + l * 0.14);
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * W;
        const noise = Math.sin(i * 0.15 + l * 2) * 30 +
                      Math.sin(i * 0.07 + l * 5) * 20 +
                      Math.cos(i * 0.23 + l * 3) * 15;
        pts.push({ x, baseY: baseY + noise });
      }
      peaks.push({ pts, depth: l });
    }
  }

  function spawnParticle() {
    if (particles.length > 40) return;
    particles.push({
      x: Math.random() * W,
      y: H * (0.15 + Math.random() * 0.5),
      r: 1 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.15 - Math.random() * 0.3,
      life: 1,
      decay: 0.003 + Math.random() * 0.004
    });
  }

  function getAltitudeAt(mx) {
    const layer = peaks[0];
    if (!layer) return 0;
    const frac = mx / W;
    const idx = frac * (layer.pts.length - 1);
    const i = Math.floor(idx);
    const t = idx - i;
    const a = layer.pts[Math.min(i, layer.pts.length - 1)];
    const b = layer.pts[Math.min(i + 1, layer.pts.length - 1)];
    const peakY = a.baseY * (1 - t) + b.baseY * t;
    const normAlt = 1 - (peakY / H);
    return Math.round(normAlt * 4800 + 200);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw mountain layers back-to-front
    for (let l = LAYERS - 1; l >= 0; l--) {
      const layer = peaks[l];
      const parallax = (mouseX - 0.5) * (12 + l * 8);
      const liftY = (mouseY - 0.5) * (3 + l * 2);
      const alpha = 0.12 + l * 0.08;
      const g = l * 15;

      ctx.beginPath();
      ctx.moveTo(-10, H + 10);
      for (const p of layer.pts) {
        ctx.lineTo(p.x + parallax, p.baseY + liftY);
      }
      ctx.lineTo(W + 10, H + 10);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, H * 0.3, 0, H);
      grad.addColorStop(0, `rgba(${140 + g},${120 + g},${90 + g},${alpha})`);
      grad.addColorStop(1, `rgba(10,10,10,0)`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Ridge highlight on front layer
      if (l === 0) {
        ctx.beginPath();
        for (let i = 0; i < layer.pts.length; i++) {
          const p = layer.pts[i];
          if (i === 0) ctx.moveTo(p.x + parallax, p.baseY + liftY);
          else ctx.lineTo(p.x + parallax, p.baseY + liftY);
        }
        ctx.strokeStyle = 'rgba(200,168,130,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Glow at cursor
    const gx = mouseX * W;
    const gy = mouseY * H;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 120);
    glow.addColorStop(0, 'rgba(200,168,130,0.08)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,168,130,${p.life * 0.35})`;
      ctx.fill();
    }

    if (Math.random() < 0.3) spawnParticle();

    // Altitude
    const alt = getAltitudeAt(mouseX * W);
    if (altEl) altEl.textContent = alt.toLocaleString() + ' m';

    animId = requestAnimationFrame(draw);
  }

  const strip = document.getElementById('terrainStrip');
  strip.addEventListener('mousemove', e => {
    const r = strip.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / r.width;
    mouseY = (e.clientY - r.top) / r.height;
  });
  strip.addEventListener('mouseleave', () => {
    mouseX = 0.5;
    mouseY = 0.5;
  });
  // Touch support
  strip.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const r = strip.getBoundingClientRect();
    mouseX = (t.clientX - r.left) / r.width;
    mouseY = (t.clientY - r.top) / r.height;
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  draw();
}

// ── Page Loading Animation ───────────────────────────────────
function initLoader() {
  // Only show once per session
  if (sessionStorage.getItem('ott_loaded')) return;

  // Inject loader HTML
  const loader = document.createElement('div');
  loader.className = 'ott-loader';
  loader.innerHTML =
    '<div class="ott-loader-mountain">' +
      '<svg viewBox="0 0 120 80" fill="none">' +
        '<path class="peak-line" d="M10 70 L40 20 L55 45 L70 25 L110 70" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path class="peak-line-2" d="M25 70 L50 35 L65 50" stroke="rgba(200,168,130,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle class="peak-sun" cx="90" cy="22" r="6" stroke="rgba(200,168,130,0.8)" stroke-width="1.5" fill="none"/>' +
      '</svg>' +
    '</div>' +
    '<div class="ott-loader-text">Over The Top</div>' +
    '<div class="ott-loader-bar"><div class="ott-loader-bar-fill"></div></div>';

  document.body.prepend(loader);

  // Prevent scroll while loading
  document.body.style.overflow = 'hidden';

  // Dismiss after animation completes
  setTimeout(function() {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('ott_loaded', '1');
    // Remove from DOM after fade
    setTimeout(function() { loader.remove(); }, 600);
  }, 2000);
}

// ── Magnetic Cursor & Golden Particle Trail ──────────────────
function initCursorEffects() {
  // Skip on touch-only devices
  if (window.matchMedia('(hover: none)').matches) return;

  // --- Golden Particle Trail on Hero Sections ---
  const heroSelectors = '.home-hero, .ct-hero, .about-hero, .product-hero, .category-hero';
  const POOL_SIZE = 40;
  const pool = [];
  let poolIdx = 0;
  let lastX = 0, lastY = 0;
  let trailActive = false;
  let rafId = null;

  // Pre-create particle pool
  for (let i = 0; i < POOL_SIZE; i++) {
    const p = document.createElement('div');
    p.className = 'cursor-particle';
    p.style.opacity = '0';
    document.body.appendChild(p);
    pool.push({ el: p, active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0 });
  }

  // Cursor glow follower
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.style.opacity = '0';
  document.body.appendChild(glow);

  function spawnParticle(x, y) {
    const p = pool[poolIdx];
    poolIdx = (poolIdx + 1) % POOL_SIZE;
    const size = 3 + Math.random() * 5;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.8;
    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 0.5;
    p.life = 1;
    p.size = size;
    p.active = true;
    p.el.style.width = size + 'px';
    p.el.style.height = size + 'px';
  }

  function animateParticles() {
    let anyActive = false;
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = pool[i];
      if (!p.active) continue;
      anyActive = true;
      p.life -= 0.025;
      if (p.life <= 0) {
        p.active = false;
        p.el.style.opacity = '0';
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      const scale = p.life;
      p.el.style.transform = 'translate(' + (p.x - p.size / 2) + 'px,' + (p.y - p.size / 2) + 'px) scale(' + scale + ')';
      p.el.style.opacity = String(p.life * 0.7);
    }
    if (anyActive || trailActive) {
      rafId = requestAnimationFrame(animateParticles);
    } else {
      rafId = null;
    }
  }

  document.addEventListener('mousemove', function(e) {
    const overHero = e.target.closest && e.target.closest(heroSelectors);
    if (overHero) {
      trailActive = true;
      glow.style.opacity = '1';
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 4) {
        const count = Math.min(Math.floor(dist / 6), 3);
        for (let i = 0; i < count; i++) {
          spawnParticle(
            e.clientX + (Math.random() - 0.5) * 8,
            e.clientY + (Math.random() - 0.5) * 8
          );
        }
        lastX = e.clientX;
        lastY = e.clientY;
      }
      if (!rafId) rafId = requestAnimationFrame(animateParticles);
    } else {
      trailActive = false;
      glow.style.opacity = '0';
    }
  });

  // --- Magnetic Buttons ---
  function addMagnetic(selector) {
    document.querySelectorAll(selector).forEach(function(btn) {
      if (btn.dataset.magneticBound) return;
      btn.dataset.magneticBound = '1';
      btn.dataset.magnetic = '';

      btn.addEventListener('mousemove', function(e) {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.max(rect.width, rect.height);
        const strength = Math.max(0, 1 - dist / maxDist) * 0.35;
        btn.style.transform = 'translate(' + (dx * strength) + 'px,' + (dy * strength) + 'px)';
      });

      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
      });
    });
  }

  // Apply magnetic to key interactive elements
  addMagnetic('.btn-primary, .btn-secondary, .ct-btn, .ct-btn-new, .cart-btn, .ambient-btn, .logo');
  addMagnetic('.home-hero-actions a, .ct-info-card-icon, .ct-faq-toggle');

  // Re-apply after dynamic content loads
  const observer = new MutationObserver(function() {
    addMagnetic('.btn-primary, .btn-secondary, .ct-btn, .ct-btn-new');
  });
  observer.observe(document.body, { childList: true, subtree: true });
}



// ── Fix footer Assistance links ─────────────────────────────
function initFooterLinks() {
  document.querySelectorAll('.footer-col a[href="#"]').forEach(function(a) {
    a.href = 'contact.html';
  });
}

// ── Boot ─────────────────────────────────────────────────────
// ── Radial Categories Dropdown ───────────────────────────────
function initCatDropdown() {
  var wraps = document.querySelectorAll('.cat-dropdown-wrap');
  var backdrops = document.querySelectorAll('.cat-backdrop');

  wraps.forEach(function(wrap) {
    var btn = wrap.querySelector('.cat-dropdown-btn');
    if (!btn) return;

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = wrap.classList.contains('open');
      // Close all first
      wraps.forEach(function(w) { w.classList.remove('open'); });
      backdrops.forEach(function(b) { b.classList.remove('open'); });
      if (!isOpen) {
        wrap.classList.add('open');
        var bd = wrap.parentElement.querySelector('.cat-backdrop') || document.querySelector('.cat-backdrop');
        if (bd) bd.classList.add('open');
      }
    });
  });

  // Close on backdrop click or outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.cat-dropdown-wrap')) {
      wraps.forEach(function(w) { w.classList.remove('open'); });
      backdrops.forEach(function(b) { b.classList.remove('open'); });
    }
  });
  backdrops.forEach(function(bd) {
    bd.addEventListener('click', function() {
      wraps.forEach(function(w) { w.classList.remove('open'); });
      backdrops.forEach(function(b) { b.classList.remove('open'); });
    });
  });

  // Mobile category accordion
  document.querySelectorAll('.mobile-cat-header').forEach(function(h) {
    h.addEventListener('click', function() {
      h.parentElement.classList.toggle('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAnimalTheme();
  initLoader();

  initFooterLinks();
  initLogoMenu();
  initNavbar();
  initAmbient();
  initTerrain();
  initCart();
  initFilters();
  initAddToCart();
  initViewDetails();
  initWishlist();
  initReviews();
  initContactForm();
  updateCartUI();
  initScrollReveal();
  initCursorEffects();
  initCatDropdown();
});
