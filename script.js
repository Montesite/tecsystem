// ===== HEADER: sombra ao rolar =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ===== BARRA DE PROGRESSO DE ROLAGEM =====
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

// ===== LINK ATIVO NO MENU CONFORME A SEÇÃO VISÍVEL =====
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = Array.from(navAnchors)
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach((sec) => sectionObserver.observe(sec));

// ===== MENU MOBILE =====
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

function closeMobileNav() {
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.querySelector('i').className = 'fas fa-bars';
}

hamburger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  hamburger.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
});

mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileNav);
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 900) closeMobileNav();
});

// ===== ANIMAÇÃO FADE-IN / ESCALONADA AO SCROLL =====
const fadeEls = document.querySelectorAll('.fade-in, .stagger');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach((el) => observer.observe(el));

// ===== TILT 3D NOS CARDS (segue o cursor) =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

if (!reduceMotion && !isTouch) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    const strength = 8;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== FORMULÁRIO DE CONTATO =====
const formContato = document.getElementById('form-contato');

if (formContato) {
  const statusEl = formContato.querySelector('.form-status');
  const botaoEnviar = formContato.querySelector('button[type="submit"]');

  formContato.addEventListener('submit', async (e) => {
    e.preventDefault();

    statusEl.textContent = '';
    statusEl.className = 'form-status';
    botaoEnviar.disabled = true;
    const textoOriginal = botaoEnviar.innerHTML;
    botaoEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
      const resposta = await fetch('enviar-contato.php', {
        method: 'POST',
        body: new FormData(formContato),
      });
      const dados = await resposta.json();

      statusEl.textContent = dados.mensagem;
      statusEl.classList.add(dados.sucesso ? 'sucesso' : 'erro');

      if (dados.sucesso) {
        formContato.reset();
      }
    } catch (erro) {
      statusEl.textContent = 'Não foi possível enviar sua mensagem. Tente novamente mais tarde.';
      statusEl.classList.add('erro');
    } finally {
      botaoEnviar.disabled = false;
      botaoEnviar.innerHTML = textoOriginal;
    }
  });
}
