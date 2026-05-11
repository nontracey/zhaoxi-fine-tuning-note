// 大语言模型微调-01 · 交互与动画逻辑

// =============================================
// 1. NAVIGATION
// =============================================
(function initNav() {
  const nav      = document.getElementById('side-nav');
  const backdrop = document.getElementById('nav-backdrop');
  const openBtn  = document.getElementById('nav-open-btn');
  if (!nav || !backdrop || !openBtn) return;

  function openNav() {
    nav.classList.add('open');
    backdrop.classList.add('visible');
  }

  function closeNav() {
    nav.classList.remove('open');
    backdrop.classList.remove('visible');
  }

  openBtn.addEventListener('click', openNav);
  backdrop.addEventListener('click', closeNav);

  // Close on nav link click (mobile UX)
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  // Chapter sub-menu toggles
  document.querySelectorAll('.nav-chapter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.nextElementSibling;
      const isOpen = sub.classList.contains('open');
      document.querySelectorAll('.nav-sub-list.open').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.nav-chapter-btn.open').forEach(b => b.classList.remove('open'));
      if (!isOpen) { sub.classList.add('open'); btn.classList.add('open'); }
    });
  });

  // Highlight active nav item on scroll
  const sections = document.querySelectorAll('[data-section]');
  const navLinks = document.querySelectorAll('#nav-list a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
        const active = document.querySelector('#nav-list a[href="#' + id + '"]');
        if (active) {
          const sub = active.closest('.nav-sub-list');
          if (sub && !sub.classList.contains('open')) {
            sub.classList.add('open');
            const prevBtn = sub.previousElementSibling;
            if (prevBtn) prevBtn.classList.add('open');
          }
          const chapterBtn = active.closest('.nav-chapter') && active.closest('.nav-chapter').querySelector('.nav-chapter-btn');
          if (chapterBtn) {
            document.querySelectorAll('.nav-chapter-btn.active').forEach(b => b.classList.remove('active'));
            chapterBtn.classList.add('active');
          }
        }
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
})();


// =============================================
// 2. SCROLL REVEAL
// =============================================
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));
})();


// =============================================
// 3. STEP CARDS STAGGER REVEAL
// =============================================
(function initStepCards() {
  document.querySelectorAll('.step-list').forEach(list => {
    const first = list.querySelector('.step-card');
    if (!first) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = list.querySelectorAll('.step-card');
          cards.forEach((card, i) => setTimeout(() => card.classList.add('visible'), i * 120));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    io.observe(first);
  });
})();


// =============================================
// 4. ANIMATION: TOKENIZATION
// =============================================
function runTokenAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const arrowLine = container.querySelector('.arrow-line');

  // Token data split into three rows
  const rows = [
    {
      id: 'token-row-instruction',
      tokens: [
        { text: '[指令]',  type: 'special', id: 'SYS' },
        { text: '请提取',  type: 'word',    id: '1421' },
        { text: '以下',    type: 'word',    id: '782' },
        { text: '文本',    type: 'word',    id: '534' },
        { text: '中的',    type: 'sub',     id: '109' },
        { text: '地名',    type: 'word',    id: '3024' },
      ]
    },
    {
      id: 'token-row-input',
      tokens: [
        { text: '[输入]',  type: 'special', id: 'CTX' },
        { text: '我',      type: 'word',    id: '45' },
        { text: '明天',    type: 'word',    id: '891' },
        { text: '要去',    type: 'sub',     id: '2033' },
        { text: '上海',    type: 'word',    id: '7201' },
        { text: '出差',    type: 'word',    id: '3411' },
      ]
    },
    {
      id: 'token-row-output',
      tokens: [
        { text: '[输出]',  type: 'special', id: 'ANS' },
        { text: '上海',    type: 'word',    id: '7201' },
        { text: '。',      type: 'punct',   id: '4' },
      ]
    }
  ];

  // Clear all rows
  rows.forEach(row => {
    const el = document.getElementById(row.id);
    if (el) el.querySelector('.token-row-chips').innerHTML = '';
  });

  // Animate arrow
  if (arrowLine) {
    arrowLine.classList.remove('animate');
    void arrowLine.offsetWidth;
    arrowLine.classList.add('animate');
  }

  // Stagger all tokens globally across rows
  let globalIndex = 0;
  rows.forEach(row => {
    const chipsEl = document.getElementById(row.id) && document.getElementById(row.id).querySelector('.token-row-chips');
    if (!chipsEl) return;
    row.tokens.forEach(t => {
      const chip = document.createElement('div');
      chip.className = 'token-chip type-' + t.type;
      const idEl = document.createElement('span');
      idEl.className = 'token-id';
      idEl.textContent = '#' + t.id;
      chip.appendChild(idEl);
      chip.appendChild(document.createTextNode(t.text));
      chipsEl.appendChild(chip);
      setTimeout(() => chip.classList.add('show'), 200 + globalIndex * 220);
      globalIndex++;
    });
  });
}


// =============================================
// 5. ANIMATION: VECTOR SPACE
// =============================================
function runVectorAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Reset all elements
  container.querySelectorAll('.scatter-dot').forEach(d => { d.style.opacity = 0; d.style.transition = 'none'; });
  container.querySelectorAll('.scatter-cluster').forEach(c => { c.style.opacity = 0; c.style.transition = 'none'; });
  const distLine = container.querySelector('#sc-dist');
  if (distLine) { distLine.style.opacity = 0; distLine.style.transition = 'none'; }

  // Phase 1: reveal cluster A dots (fruit) staggered
  const dotsA = Array.from(container.querySelectorAll('.scatter-dot[data-cluster="a"]'));
  dotsA.forEach((dot, i) => {
    setTimeout(() => {
      dot.style.transition = 'opacity .4s ease';
      dot.style.opacity = 1;
    }, 200 + i * 180);
  });

  // Phase 2: show cluster A halo
  const haloA = container.querySelector('#sc-halo-a');
  setTimeout(() => {
    if (haloA) { haloA.style.transition = 'opacity .6s ease'; haloA.style.opacity = 1; }
  }, 200 + dotsA.length * 180 + 100);

  // Phase 3: reveal cluster B dots (machines) staggered
  const dotsB = Array.from(container.querySelectorAll('.scatter-dot[data-cluster="b"]'));
  const phaseB = 200 + dotsA.length * 180 + 500;
  dotsB.forEach((dot, i) => {
    setTimeout(() => {
      dot.style.transition = 'opacity .4s ease';
      dot.style.opacity = 1;
    }, phaseB + i * 180);
  });

  // Phase 4: show cluster B halo
  const haloB = container.querySelector('#sc-halo-b');
  setTimeout(() => {
    if (haloB) { haloB.style.transition = 'opacity .6s ease'; haloB.style.opacity = 1; }
  }, phaseB + dotsB.length * 180 + 100);

  // Phase 5: draw distance line
  setTimeout(() => {
    if (distLine) { distLine.style.transition = 'opacity .5s ease'; distLine.style.opacity = 1; }
  }, phaseB + dotsB.length * 180 + 400);
}


// =============================================
// 6. ANIMATION: PROBABILITY DISTRIBUTION
// =============================================
function runProbAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const fills = container.querySelectorAll('.prob-bar-fill');
  // Reset to zero-width first, then animate in
  fills.forEach(f => {
    f.classList.remove('show');
    f.style.transition = 'none';
    void f.offsetWidth;
    f.style.transition = '';
  });
  fills.forEach((fill, i) => setTimeout(() => fill.classList.add('show'), 300 + i * 250));
}


// =============================================
// 7. ANIMATION: TRAINING LOOP
// =============================================
var loopTimer = null;

function runTrainingLoop(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (loopTimer) { clearInterval(loopTimer); loopTimer = null; }

  const steps = container.querySelectorAll('.loop-step');
  const lossEl = container.querySelector('.loss-number');
  let current = 0;
  let lossVal = 2.85;

  steps.forEach(s => s.classList.remove('active'));

  function advance() {
    steps.forEach(s => s.classList.remove('active'));
    steps[current].classList.add('active');
    if (current === steps.length - 1) {
      lossVal = Math.max(0.06, lossVal * 0.72 + (Math.random() - 0.5) * 0.05);
      if (lossEl) {
        lossEl.textContent = lossVal.toFixed(3);
        lossEl.classList.toggle('decreasing', lossVal < 1.0);
      }
    }
    current = (current + 1) % steps.length;
  }

  advance();
  loopTimer = setInterval(advance, 750);
  setTimeout(() => { if (loopTimer) { clearInterval(loopTimer); loopTimer = null; } }, 750 * steps.length * 6);
}


// =============================================
// 8. ANIMATION: LOSS MASKING
// =============================================
function runMaskAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const tokens = container.querySelectorAll('.mask-token');
  tokens.forEach(t => t.classList.remove('masked'));
  setTimeout(() => {
    tokens.forEach(t => { if (t.classList.contains('instruction')) t.classList.add('masked'); });
  }, 700);
}


// =============================================
// 9. ANIMATION: LOSS CURVE SVG
// =============================================
function runLossCurve(svgId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const path = svg.querySelector('.loss-path');
  const dot  = svg.querySelector('.loss-dot');
  if (!path || !dot) return;

  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  path.style.transition = 'none';
  void path.offsetWidth;
  path.style.transition = 'stroke-dashoffset 2.5s cubic-bezier(.4,0,.2,1)';
  path.style.strokeDashoffset = 0;

  let start = null;
  const dur = 2500;
  function animDot(ts) {
    if (!start) start = ts;
    const t = Math.min((ts - start) / dur, 1);
    const pt = path.getPointAtLength(t * len);
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
    if (t < 1) requestAnimationFrame(animDot);
  }
  requestAnimationFrame(animDot);
}


// =============================================
// 10. REPLAY BUTTON WIRING + AUTO-RUN
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Wire replay buttons
  document.querySelectorAll('[data-replay]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.replay;
      const type   = btn.dataset.type;
      if (type === 'token')  runTokenAnimation(target);
      if (type === 'vector') runVectorAnimation(target);
      if (type === 'prob')   runProbAnimation(target);
      if (type === 'loop')   runTrainingLoop(target);
      if (type === 'mask')   runMaskAnimation(target);
      if (type === 'loss')   runLossCurve(btn.dataset.svg);
    });
  });

  // Auto-run when entering viewport
  var animDefs = [
    { id: 'anim-token',  fn: function() { runTokenAnimation('anim-token'); } },
    { id: 'anim-vector', fn: function() { runVectorAnimation('anim-vector'); } },
    { id: 'anim-prob',   fn: function() { runProbAnimation('anim-prob'); } },
    { id: 'anim-loop',   fn: function() { runTrainingLoop('anim-loop'); } },
    { id: 'anim-mask',   fn: function() { runMaskAnimation('anim-mask'); } },
    { id: 'anim-loss',   fn: function() { runLossCurve('loss-svg'); } },
  ];

  animDefs.forEach(function(def) {
    var el = document.getElementById(def.id);
    if (!el) return;
    var io = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { def.fn(); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
  });
});
