// ==============================
// HAMBURGER MENU (Mobile)
// ==============================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

// Chiudi il menu mobile quando si clicca un link
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
});

// ==============================
// SEARCH OVERLAY
// ==============================
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');

searchBtn.addEventListener('click', function () {
  searchOverlay.classList.add('active');
  setTimeout(function () {
    searchInput.focus();
  }, 100);
});

searchClose.addEventListener('click', function () {
  searchOverlay.classList.remove('active');
  searchInput.value = '';
});

// Chiudi l'overlay cliccando fuori dal box
searchOverlay.addEventListener('click', function (e) {
  if (e.target === searchOverlay) {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
  }
});

// Chiudi con il tasto Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
  }
});

// ==============================
// ANIMAZIONI ALLO SCROLL (Fade in)
// ==============================
function handleScrollAnimations() {
  var elements = document.querySelectorAll(
    '.category-card, .lifestyle-card, .app-download-inner'
  );

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  elements.forEach(function (el) {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

handleScrollAnimations();

// ==============================
// STILI PER LE ANIMAZIONI (iniettati via JS)
// ==============================
var style = document.createElement('style');
style.textContent =
  '.fade-in {' +
  '  opacity: 0;' +
  '  transform: translateY(24px);' +
  '  transition: opacity 0.6s ease, transform 0.6s ease;' +
  '}' +
  '.fade-in.visible {' +
  '  opacity: 1;' +
  '  transform: translateY(0);' +
  '}';
document.head.appendChild(style);