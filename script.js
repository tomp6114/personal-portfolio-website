/* =============================================
   script.js — Tom P Varghese Portfolio
   ============================================= */

'use strict';

/* ==========================================
   1. HERO CANVAS — Animated Particle Mesh
   ========================================== */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 140;
  const SPEED = 0.35;

  let W, H, particles, animId;
  let prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 2 + 1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    if (prefersReduced) return;

    // Update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(138, 99, 39, ${alpha})`; /* Bronze Accent */
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(138, 99, 39, 0.5)';
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  // Pause when off-screen (performance)
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!animId) animId = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });

  function init() {
    resize();
    createParticles();
    io.observe(canvas);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  }, { passive: true });

  // Listen for reduced-motion changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReduced = e.matches;
  });

  init();
})();

/* ==========================================
   2. NAVBAR — scroll state + mobile menu
   ========================================== */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = navLinks ? navLinks.querySelectorAll('.nav-link') : [];

  if (!navbar) return;

  // Scrolled class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && navLinks) {
    const toggleMenu = (state) => {
      const isOpen = state !== undefined ? state : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', isOpen);
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => toggleMenu());

    // Close on link click
    allNavLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        toggleMenu(false);
        hamburger.focus();
      }
    });
  }

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const linkMap = {};
  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const id = href.slice(1);
      linkMap[id] = link;
    }
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const active = linkMap[entry.target.id];
        allNavLinks.forEach(l => l.classList.remove('active'));
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ==========================================
   3. SCROLL REVEAL — IntersectionObserver
   ========================================== */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  let staggerIndex = 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Find siblings in same parent for stagger
        const siblings = Array.from(el.parentElement.querySelectorAll('.reveal-item:not(.visible)'));
        const idx = siblings.indexOf(el);
        const delay = Math.min(idx * 50, 250);
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ==========================================
   4. TYPING ANIMATION — Hero headline
   ========================================== */
(function initTyping() {
  const roleEl = document.querySelector('.hero-role');
  if (!roleEl) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const roles = [
    'Flutter Developer | Mobile Application Engineer',
    'Android & iOS App Specialist',
    'Clean Architecture Advocate',
    'Performance Optimization Expert',
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseCount = 0;
  const PAUSE_FRAMES = 50;
  const ACCENT_DIVIDER = '<span class="primary-accent">|</span>';

  function type() {
    const current = roles[roleIdx];
    const displayed = deleting ? current.slice(0, charIdx--) : current.slice(0, charIdx++);

    roleEl.innerHTML = displayed + ACCENT_DIVIDER;

    if (!deleting && charIdx > current.length) {
      if (pauseCount++ < PAUSE_FRAMES) { setTimeout(type, 30); return; }
      pauseCount = 0;
      deleting = true;
    } else if (deleting && charIdx < 0) {
      deleting = false;
      charIdx = 0;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(type, 400);
      return;
    }

    const speed = deleting ? 28 : 52;
    setTimeout(type, speed);
  }

  // Small delay before starting
  setTimeout(type, 1200);
})();

/* ==========================================
   5. DOWNLOAD RESUME — placeholder handler
   ========================================== */
(function initResumeBtn() {
  const btn = document.getElementById('download-resume-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // Graceful no-op — swap with actual PDF link when available
    btn.textContent = 'Resume coming soon!';
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.innerHTML = 'Download Resume';
      btn.style.opacity = '';
    }, 2500);
  });
})();

/* ==========================================
   6. CONTACT FORM — validation + success
   ========================================== */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const msgInput = document.getElementById('form-message');
  const nameErr = document.getElementById('name-error');
  const emailErr = document.getElementById('email-error');
  const msgErr = document.getElementById('message-error');
  const submitBtn = document.getElementById('form-submit');
  const successMsg = document.getElementById('form-success');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(input, errEl, msg) {
    errEl.textContent = msg;
    input.classList.add('input-error');
  }
  function clearError(input, errEl) {
    errEl.textContent = '';
    input.classList.remove('input-error');
  }

  // Live validation on blur
  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) showError(nameInput, nameErr, 'Name is required.');
    else clearError(nameInput, nameErr);
  });
  emailInput.addEventListener('blur', () => {
    if (!emailInput.value.trim()) showError(emailInput, emailErr, 'Email is required.');
    else if (!emailRegex.test(emailInput.value.trim())) showError(emailInput, emailErr, 'Please enter a valid email address.');
    else clearError(emailInput, emailErr);
  });
  msgInput.addEventListener('blur', () => {
    if (!msgInput.value.trim()) showError(msgInput, msgErr, 'Message cannot be empty.');
    else if (msgInput.value.trim().length < 10) showError(msgInput, msgErr, 'Message should be at least 10 characters.');
    else clearError(msgInput, msgErr);
  });

  // Clear errors on input
  [nameInput, emailInput, msgInput].forEach(input => {
    input.addEventListener('input', () => input.classList.remove('input-error'));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Validate all
    if (!nameInput.value.trim()) {
      showError(nameInput, nameErr, 'Name is required.'); valid = false;
    } else clearError(nameInput, nameErr);

    if (!emailInput.value.trim()) {
      showError(emailInput, emailErr, 'Email is required.'); valid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, emailErr, 'Please enter a valid email address.'); valid = false;
    } else clearError(emailInput, emailErr);

    if (!msgInput.value.trim()) {
      showError(msgInput, msgErr, 'Message cannot be empty.'); valid = false;
    } else if (msgInput.value.trim().length < 10) {
      showError(msgInput, msgErr, 'Message should be at least 10 characters.'); valid = false;
    } else clearError(msgInput, msgErr);

    if (!valid) {
      // Focus first error field
      const firstErr = form.querySelector('.input-error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Simulate send (no backend)
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';
    if (btnIcon) btnIcon.style.opacity = '0';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
      if (btnIcon) btnIcon.style.opacity = '';
      successMsg.hidden = false;
      successMsg.focus();
      setTimeout(() => { successMsg.hidden = true; }, 5000);
    }, 1200);
  });
})();

/* ==========================================
   7. SKILL TAGS — staggered float-in
   ========================================== */
(function initSkillTagsStagger() {
  const cats = document.querySelectorAll('.skill-category');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const catObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skill-tag');
        tags.forEach((tag, i) => {
          tag.style.opacity = '0';
          tag.style.transform = 'translateY(10px)';
          setTimeout(() => {
            tag.style.transition = `opacity 200ms ease ${i * 40}ms, transform 200ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 40}ms`;
            tag.style.opacity = '';
            tag.style.transform = '';
          }, 50);
        });
        catObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cats.forEach(c => catObserver.observe(c));
})();
