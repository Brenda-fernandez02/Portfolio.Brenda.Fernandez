// CAROUSEL
const cards = document.querySelectorAll('#carrusel .project-card');
const dotsContainer = document.getElementById('dots');
const liveRegion = document.getElementById('carousel-live');
let current = 0;
const total = cards.length;

const cardTitles = Array.from(cards).map(c => {
  const title = c.querySelector('.project-title');
  return title ? title.textContent.trim() : '';
});

// Create dots as buttons for accessibility
cards.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
  d.setAttribute('aria-label', `Ir al proyecto ${i + 1}`);
  d.setAttribute('aria-current', i === 0 ? 'true' : 'false');
  d.addEventListener('click', () => irA(i));
  dotsContainer.appendChild(d);
});

function aplicarCoverflow() {
  const isMobile = window.innerWidth <= 768;
  const GAP = isMobile ? window.innerWidth * 0.7 : 300;
  const ROT = isMobile ? 25 : 40;
  const SCALE_SIDE = 0.72;
  const OPACITY_SIDE = 0.55;
  const OPACITY_FAR = 0.25;

  cards.forEach((card, i) => {
    const diff = i - current;
    const absDiff = Math.abs(diff);
    const tx = diff * GAP;
    const ry = diff < 0 ? ROT : diff > 0 ? -ROT : 0;
    const scale = absDiff === 0 ? 1 : absDiff === 1 ? SCALE_SIDE : 0.55;
    let opacity = absDiff === 0 ? 1 : absDiff === 1 ? OPACITY_SIDE : OPACITY_FAR;
    const zIndex = absDiff === 0 ? 10 : absDiff === 1 ? 5 : 1;
    const shadow = absDiff === 0
      ? '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(200,240,96,0.12)'
      : 'none';

    if (absDiff > 2) opacity = 0;

    card.style.transform = `translateX(${tx}px) rotateY(${ry}deg) scale(${scale})`;
    card.style.opacity = opacity;
    card.style.zIndex = zIndex;
    card.style.boxShadow = shadow;
    card.style.pointerEvents = absDiff === 0 ? 'auto' : 'none';
    card.setAttribute('aria-hidden', absDiff !== 0 ? 'true' : 'false');
  });

  dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
    d.setAttribute('aria-current', i === current ? 'true' : 'false');
  });

  document.getElementById('prev').disabled = current === 0;
  document.getElementById('next').disabled = current === total - 1;
}

function irA(idx) {
  current = Math.max(0, Math.min(idx, total - 1));
  aplicarCoverflow();
  if (liveRegion && cardTitles[current]) {
    liveRegion.textContent = `Proyecto ${current + 1} de ${total}: ${cardTitles[current]}`;
  }
}

function moverCarrusel(dir) { irA(current + dir); }

document.getElementById('prev').addEventListener('click', () => moverCarrusel(-1));
document.getElementById('next').addEventListener('click', () => moverCarrusel(1));

// Touch swipe
let startX = 0;
document.getElementById('carrusel').addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('carrusel').addEventListener('touchend', e => {
  const diff = startX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) moverCarrusel(diff > 0 ? 1 : -1);
});

// Keyboard navigation when projects section is visible
document.addEventListener('keydown', e => {
  const section = document.getElementById('proyectos');
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); moverCarrusel(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); moverCarrusel(1); }
  }
});

// Click on side cards to navigate
cards.forEach((card, i) => {
  card.addEventListener('click', () => { if (i !== current) irA(i); });
});

aplicarCoverflow();
window.addEventListener('resize', aplicarCoverflow);

// ANIMATED COUNTER
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(el => {
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        const suffix = raw.replace(/[0-9.]/g, '');
        if (isNaN(num) || raw === 'B2') return;
        let start = 0;
        const duration = 1400;
        const step = 16;
        const increment = num / (duration / step);
        const timer = setInterval(() => {
          start += increment;
          if (start >= num) { start = num; clearInterval(timer); }
          el.textContent = Math.floor(start) + suffix;
        }, step);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) statsObserver.observe(statsGrid);

// MOBILE NAV TOGGLE
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// CHATBASE
(function () {
  if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
    window.chatbase = (...args) => {
      if (!window.chatbase.q) window.chatbase.q = [];
      window.chatbase.q.push(args);
    };
    window.chatbase = new Proxy(window.chatbase, {
      get(target, prop) {
        if (prop === 'q') return target.q;
        return (...args) => target(prop, ...args);
      }
    });
  }
  const onLoad = () => {
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.id = 'iN0moiTO7qqHP2qdaosSr';
    script.domain = 'www.chatbase.co';
    document.body.appendChild(script);
  };
  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad);
})();
