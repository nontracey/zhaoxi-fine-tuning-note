/* ===================================================
   大语言模型微调-03 教学演示网页 - JavaScript
   =================================================== */

'use strict';

// ===================================================
// PARTICLE CANVAS
// ===================================================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let width, height, animId;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3 - 0.15;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.6 ? '0,229,192' : '59,139,235';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y < -10 || this.x < -10 || this.x > width + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticleArray() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 8000), 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,229,192,${0.06 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  // Only run on cover visible
  const cover = document.getElementById('cover');
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) animate();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0.01 });

  observer.observe(cover);

  resize();
  initParticleArray();
  animate();

  window.addEventListener('resize', () => {
    resize();
    initParticleArray();
  });
})();


// ===================================================
// NAVBAR SCROLL EFFECT
// ===================================================
(function initNavbar() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
})();


// ===================================================
// SMOOTH SCROLL FOR NAV LINKS
// ===================================================
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"], .toc-item[data-href]').forEach(el => {
    el.addEventListener('click', e => {
      const href = el.getAttribute('href') || el.dataset.href;
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-h')) || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();


// ===================================================
// ACTIVE NAV HIGHLIGHTING
// ===================================================
(function initActiveNav() {
  const sections = document.querySelectorAll('.chapter');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const parent = link.parentElement;
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            parent.classList.add('active');
          } else {
            parent.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: `-${64}px 0px -50% 0px`,
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));
})();


// ===================================================
// REVEAL ON SCROLL
// ===================================================
(function initReveal() {
  const items = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger within same batch
        const delay = (Array.from(entry.target.parentElement.children)
          .filter(el => el.classList.contains('reveal'))
          .indexOf(entry.target)) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  });

  items.forEach(item => observer.observe(item));
})();


// ===================================================
// ANIMATION ENGINE
// ===================================================
const AnimEngine = {
  // Reset all animation children in a container
  reset(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.classList.remove('playing');
    // Force reflow
    void el.offsetWidth;
  },

  // Play animations
  play(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.classList.remove('playing');
    void el.offsetWidth; // reflow
    el.classList.add('playing');
  },

  // Auto-play when scrolled into view (once)
  autoPlay(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setTimeout(() => AnimEngine.play(containerId), 200);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
  }
};

// Register all animated containers for auto-play
const animContainers = [
  'threeFieldDiagram',
  'trainingLoop',
  'tensorSequence',
  'chatDemo',
  'analogyAnim',
  'pipeline'
];

animContainers.forEach(id => AnimEngine.autoPlay(id));


// ===================================================
// REPLAY BUTTONS
// ===================================================
document.querySelectorAll('.replay-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (target) AnimEngine.play(target);
  });
});


// ===================================================
// CODE BLOCK COPY (optional UX enhancement)
// ===================================================
document.querySelectorAll('.code-block, .json-viewer').forEach(block => {
  block.style.position = 'relative';
  const copyBtn = document.createElement('button');
  copyBtn.textContent = '复制';
  copyBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 10px;
    padding: 3px 10px;
    background: rgba(0,229,192,0.1);
    border: 1px solid rgba(0,229,192,0.2);
    border-radius: 6px;
    color: rgba(0,229,192,0.6);
    font-size: 11px;
    font-family: var(--font-display, sans-serif);
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
  `;
  copyBtn.addEventListener('mouseenter', () => {
    copyBtn.style.color = 'rgba(0,229,192,1)';
    copyBtn.style.background = 'rgba(0,229,192,0.2)';
  });
  copyBtn.addEventListener('mouseleave', () => {
    if (copyBtn.textContent !== '已复制!') {
      copyBtn.style.color = 'rgba(0,229,192,0.6)';
      copyBtn.style.background = 'rgba(0,229,192,0.1)';
    }
  });
  copyBtn.addEventListener('click', () => {
    const pre = block.querySelector('pre');
    const text = pre ? pre.innerText : '';
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = '已复制!';
      copyBtn.style.color = '#00e5c0';
      setTimeout(() => {
        copyBtn.textContent = '复制';
        copyBtn.style.color = 'rgba(0,229,192,0.6)';
        copyBtn.style.background = 'rgba(0,229,192,0.1)';
      }, 2000);
    });
  });
  block.appendChild(copyBtn);
});


// ===================================================
// CHAPTER ENTRY ANIMATION (scan line effect)
// ===================================================
document.querySelectorAll('.chapter-num').forEach(el => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      el.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
      el.style.opacity = '0.15';
      el.style.transform = 'translateX(0)';
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  el.style.opacity = '0';
  el.style.transform = 'translateX(-24px)';
  observer.observe(el);
});


// ===================================================
// TENSOR SEQUENCE — ensure plus signs also get reset
// ===================================================
(function fixTensorPlusSigns() {
  const seq = document.getElementById('tensorSequence');
  if (!seq) return;
  // Plus signs start hidden, reappear via animation class
  // The CSS already handles this, but we ensure reset on replay
  const btn = document.querySelector('[data-target="tensorSequence"]');
  if (btn) {
    btn.addEventListener('click', () => {
      // Already handled by AnimEngine.play via CSS class toggle
    });
  }
})();


// ===================================================
// PROGRESS BAR
// ===================================================
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, #00e5c0, #3b8beb);
    z-index: 9999;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(0,229,192,0.5);
    pointer-events: none;
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();


// ===================================================
// INSTALL TABS
// ===================================================
(function initInstallTabs() {
  const tabBar = document.querySelector('.install-tab-bar');
  if (!tabBar) return;

  const tabs = tabBar.querySelectorAll('.install-tab');
  const panels = document.querySelectorAll('.install-tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      // Update tab buttons
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panels
      panels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
})();


// ===================================================
// MOBILE NAV TOGGLE (hamburger for small screens)
// ===================================================
(function initMobileNav() {
  const navbar = document.getElementById('navbar');
  const navCenter = navbar.querySelector('.navbar-center');

  // Only add hamburger on mobile
  if (window.innerWidth > 900) return;

  const hamburger = document.createElement('button');
  hamburger.innerHTML = '☰';
  hamburger.style.cssText = `
    background: none;
    border: 1px solid rgba(0,229,192,0.3);
    border-radius: 6px;
    color: var(--accent, #00e5c0);
    font-size: 18px;
    padding: 4px 10px;
    cursor: pointer;
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
  `;

  navbar.style.position = 'relative';
  navbar.appendChild(hamburger);

  let mobileMenu = null;

  hamburger.addEventListener('click', () => {
    if (mobileMenu) {
      mobileMenu.remove();
      mobileMenu = null;
      hamburger.innerHTML = '☰';
      return;
    }

    mobileMenu = document.createElement('div');
    mobileMenu.style.cssText = `
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      background: rgba(8,13,20,0.97);
      border-bottom: 1px solid rgba(0,229,192,0.15);
      padding: 16px 24px;
      z-index: 999;
      max-height: calc(100vh - 64px);
      overflow-y: auto;
    `;

    const links = [
      { href: '#section-1', text: '01 · 指令微调数据的标准逻辑结构' },
      { href: '#section-2', text: '02 · 认识微调数据集格式' },
      { href: '#section-3', text: '03 · 准备微调原始业务数据' },
      { href: '#section-4', text: '04 · 认识 Easy DataSet' },
    ];

    links.forEach(l => {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.text;
      a.style.cssText = `
        display: block;
        padding: 12px 0;
        font-family: var(--font-display, sans-serif);
        font-size: 14px;
        color: rgba(226,234,244,0.8);
        border-bottom: 1px solid rgba(0,229,192,0.08);
        text-decoration: none;
      `;
      a.addEventListener('click', () => {
        mobileMenu.remove();
        mobileMenu = null;
        hamburger.innerHTML = '☰';
      });
      mobileMenu.appendChild(a);
    });

    document.body.appendChild(mobileMenu);
    hamburger.innerHTML = '✕';
  });
})();
