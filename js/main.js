/* ============================================================
   MILUCA&CO — Main JS
   ============================================================ */

/* ── SCROLL: Header ─────────────────────────────────────── */
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── NAV TOGGLE (mobile) ─────────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    // Animate hamburger → X
    const spans = navToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    })
  );

  // Close on outside click
  document.addEventListener('click', e => {
    if (!header.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

/* ── REVEAL ON SCROLL (Intersection Observer) ───────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Small stagger for sibling cards
      const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
      if (siblings) {
        let idx = 0;
        siblings.forEach((el, j) => { if (el === entry.target) idx = j; });
        entry.target.style.transitionDelay = `${idx * 0.08}s`;
      }
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── PRODUCT MODAL ──────────────────────────────────��────── */
const WHATSAPP_NUMBER = '34662062157'; // sin + ni espacios

function openModal(data) {
  const overlay  = document.getElementById('product-modal');
  if (!overlay) return;

  // Populate fields
  document.getElementById('modal-img').style.backgroundImage   = `url('${data.img}')`;
  document.getElementById('modal-title').textContent            = data.name;
  document.getElementById('modal-type').textContent             = data.type;
  document.getElementById('modal-desc').textContent             = data.desc;
  document.getElementById('modal-price').textContent            = data.price.replace('EUR','€');

  const badge = document.getElementById('modal-badge');
  badge.textContent = data.badge || '';
  badge.style.display = data.badge ? '' : 'none';

  // WhatsApp link with pre-filled message
  const msg = encodeURIComponent(`Hola! Me interesa la ${data.name} (${data.price.replace('EUR','€')}). ¿Está disponible?`);
  document.getElementById('modal-whatsapp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

  // Open
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.focus();
}

function closeModal() {
  const overlay = document.getElementById('product-modal');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Wire up close button & overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('product-modal');
  const closeBtn = document.getElementById('modal-close');
  if (!overlay) return;

  closeBtn?.addEventListener('click', closeModal);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Wire all "Ver Pieza" buttons via data attributes
  document.querySelectorAll('.product-btn[data-img]').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal({
        img:   btn.dataset.img,
        name:  btn.dataset.name,
        type:  btn.dataset.type,
        badge: btn.dataset.badge,
        price: btn.dataset.price,
        desc:  btn.dataset.desc,
      });
    });
  });
});

/* ── PRODUCT FILTER (shop page) ─────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.shop-product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    productCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
        requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(1rem)';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });
  });
});

/* ── SORT (shop page) ─────────────────────────────────────── */
const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    const grid = document.querySelector('.shop-products-grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.shop-product-card')];

    cards.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price || 0);
      const priceB = parseFloat(b.dataset.price || 0);
      if (sortSelect.value === 'price-asc')  return priceA - priceB;
      if (sortSelect.value === 'price-desc') return priceB - priceA;
      return 0;
    });

    cards.forEach(c => grid.appendChild(c));
  });
}

/* ── CONTACT FORM ─────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    // Simulate send (replace with real fetch to backend/formspree/etc.)
    setTimeout(() => {
      btn.textContent = '¡Mensaje enviado!';
      contactForm.reset();
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
    }, 1800);
  });
}

/* ── MARQUEE pause on hover ──────────────────────────────── */
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => { marqueeTrack.style.animationPlayState = 'paused'; });
  marqueeTrack.addEventListener('mouseleave', () => { marqueeTrack.style.animationPlayState = 'running'; });
}

/* ── SMOOTH SCROLL for anchor links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
