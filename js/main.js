/* ============================================================
   MILUCA&CO — Main JS
   Carrito · Modal · Nav · Animaciones
   ============================================================ */

const WHATSAPP_NUMBER = '34662062157';

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
    const spans = navToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    })
  );

  document.addEventListener('click', e => {
    if (!header.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

/* ── REVEAL ON SCROLL ─────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
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

/* ── MARQUEE pause on hover ──────────────────────────────── */
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => { marqueeTrack.style.animationPlayState = 'paused'; });
  marqueeTrack.addEventListener('mouseleave', () => { marqueeTrack.style.animationPlayState = 'running'; });
}

/* ── SMOOTH SCROLL ────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   CARRITO — localStorage persistente entre páginas
   ============================================================ */

const CART_KEY = 'milucandco_cart';

/* Lee el carrito del localStorage */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

/* Guarda y dispara actualización de UI */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

/* Añade una pieza (cada pieza es única, no permite duplicados) */
function addToCart(item) {
  const cart = getCart();
  const exists = cart.find(i => i.id === item.id);
  if (exists) {
    showCartToast('Esta pieza ya está en tu selección');
    openCart();
    return;
  }
  cart.push(item);
  saveCart(cart);
  showCartToast(`"${item.name}" añadida al carrito`);
  openCart();
}

/* Elimina una pieza */
function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

/* Vacía el carrito */
function clearCart() {
  saveCart([]);
}

/* ── RENDER del carrito ────────────────────────────────────── */
function renderCart() {
  const cart   = getCart();
  const total  = cart.reduce((s, i) => s + i.price, 0);
  const count  = cart.length;

  // Badge del nav
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }

  // Label de cantidad
  const countLabel = document.getElementById('cart-count-label');
  if (countLabel) countLabel.textContent = count === 1 ? '1 pieza' : `${count} piezas`;

  // Total
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `${total} €`;

  // Items container
  const itemsEl  = document.getElementById('cart-items');
  const emptyEl  = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');

  if (!itemsEl) return;

  // Limpiar items previos (excepto el empty)
  itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (count === 0) {
    if (emptyEl)  emptyEl.style.display  = '';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl)  emptyEl.style.display  = 'none';
  if (footerEl) footerEl.style.display = '';

  // Renderizar cada item
  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-img" style="background-image:url('${item.img}')"></div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.type}</p>
        <span class="cart-item-price">${item.price} €</span>
      </div>
      <button class="cart-item-remove" aria-label="Eliminar" onclick="removeFromCart('${item.id}')">×</button>
    `;
    itemsEl.appendChild(el);
  });

  // WhatsApp link con resumen del pedido
  const waEl = document.getElementById('cart-whatsapp');
  if (waEl) {
    const lines = cart.map(i => `• ${i.name} — ${i.price}€`).join('\n');
    const msg = encodeURIComponent(
      `Hola Miluca&Co! Me gustaría reservar estas piezas:\n\n${lines}\n\nTotal: ${total}€\n\n¿Están disponibles?`
    );
    waEl.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }
}

/* ── ABRIR / CERRAR DRAWER ─────────────────────────────────── */
function openCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── TOAST de confirmación ─────────────────────────────────── */
function showCartToast(msg) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.style.cssText = `
      position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(4rem);
      background:var(--cream); color:var(--bg);
      font-family:var(--font-sans); font-size:0.78rem; font-weight:500;
      padding:0.75rem 1.5rem; z-index:500;
      transition:transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s;
      opacity:0; white-space:nowrap; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity   = '1';
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(4rem)';
    toast.style.opacity   = '0';
  }, 2800);
}

/* ============================================================
   MODAL DE PRODUCTO
   ============================================================ */

let _currentModalData = null;

function openModal(data) {
  const overlay = document.getElementById('product-modal');
  if (!overlay) return;

  _currentModalData = data;

  document.getElementById('modal-img').style.backgroundImage = `url('${data.img}')`;
  document.getElementById('modal-title').textContent = data.name;
  document.getElementById('modal-type').textContent  = data.type;
  document.getElementById('modal-desc').textContent  = data.desc;
  document.getElementById('modal-price').textContent = data.price.replace('EUR', '€').replace('EUR', '€');

  const badge = document.getElementById('modal-badge');
  if (badge) { badge.textContent = data.badge || ''; badge.style.display = data.badge ? '' : 'none'; }

  // WhatsApp directo desde modal
  const waEl = document.getElementById('modal-whatsapp');
  if (waEl) {
    const msg = encodeURIComponent(`Hola! Me interesa la ${data.name} (${data.price.replace('EUR','€')}). ¿Está disponible?`);
    waEl.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  // Botón añadir — indicar si ya está en el carrito
  updateAddCartBtn();

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateAddCartBtn() {
  const btn = document.getElementById('modal-add-cart');
  if (!btn || !_currentModalData) return;
  const inCart = getCart().find(i => i.id === _currentModalData.id);
  btn.textContent = inCart ? '✓ En tu selección' : 'Añadir al Carrito';
  btn.disabled = !!inCart;
  btn.style.opacity = inCart ? '0.6' : '1';
}

function addToCartFromModal() {
  if (!_currentModalData) return;
  const priceNum = parseFloat(_currentModalData.price.replace(/[^\d.]/g, ''));
  addToCart({
    id:    _currentModalData.id || _currentModalData.img,
    img:   _currentModalData.img,
    name:  _currentModalData.name,
    type:  _currentModalData.type,
    price: priceNum,
  });
  updateAddCartBtn();
  closeModal();
}

function closeModal() {
  const overlay = document.getElementById('product-modal');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── PRODUCT FILTER (shop page) ─────────────────────────── */
const filterBtns   = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.shop-product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    productCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      if (show) {
        card.style.display = '';
        requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
      } else {
        card.style.opacity   = '0';
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
      const pa = parseFloat(a.dataset.price || 0);
      const pb = parseFloat(b.dataset.price || 0);
      if (sortSelect.value === 'price-asc')  return pa - pb;
      if (sortSelect.value === 'price-desc') return pb - pa;
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
    setTimeout(() => {
      btn.textContent = '¡Mensaje enviado!';
      contactForm.reset();
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
    }, 1800);
  });
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Cargar estado del carrito al arrancar
  renderCart();

  // Botón abrir carrito (nav)
  document.getElementById('cart-btn')?.addEventListener('click', openCart);

  // Cerrar carrito
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('cart-overlay')) closeCart();
  });

  // Cerrar modal producto
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('product-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('product-modal')) closeModal();
  });

  // ESC cierra lo que esté abierto
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeCart(); }
  });

  // Wire "Ver Pieza" buttons con data attributes
  document.querySelectorAll('.product-btn[data-img]').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal({
        id:    btn.dataset.img,
        img:   btn.dataset.img,
        name:  btn.dataset.name,
        type:  btn.dataset.type,
        badge: btn.dataset.badge,
        price: btn.dataset.price,
        desc:  btn.dataset.desc,
      });
    });
  });

  // Sincronizar carrito entre pestañas
  window.addEventListener('storage', e => {
    if (e.key === CART_KEY) renderCart();
  });
});
