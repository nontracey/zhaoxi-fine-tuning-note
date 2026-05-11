/* ========================================
   大语言模型微调-02 教学演示 - JavaScript
   ======================================== */

/* ---- Intersection Observer for reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .stagger').forEach(el => revealObserver.observe(el));

/* ---- Active nav highlight ---- */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-item[data-section]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ---- Smooth scroll for nav links ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

/* ============================================
   ANIMATION 1: LoRA Architecture Flow
   ============================================ */
function initLoraAnimation() {
  const svg = document.getElementById('lora-canvas');
  if (!svg) return;

  const W = svg.clientWidth || 800;
  const H = 220;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const ns = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  function text(x, y, content, attrs = {}) {
    const t = el('text', { x, y, ...attrs });
    t.textContent = content;
    return t;
  }

  function rect(x, y, w, h, attrs = {}) {
    return el('rect', { x, y, width: w, height: h, rx: 6, ...attrs });
  }

  // defs
  const defs = el('defs', {});

  // Gradient: primary
  const gr1 = el('linearGradient', { id: 'gr-main', x1: '0', y1: '0', x2: '1', y2: '0' });
  gr1.appendChild(el('stop', { offset: '0%', 'stop-color': '#00d4ff', 'stop-opacity': '0.3' }));
  gr1.appendChild(el('stop', { offset: '100%', 'stop-color': '#7b61ff', 'stop-opacity': '0.3' }));
  defs.appendChild(gr1);

  const gr2 = el('linearGradient', { id: 'gr-lora', x1: '0', y1: '0', x2: '1', y2: '0' });
  gr2.appendChild(el('stop', { offset: '0%', 'stop-color': '#06d6a0', 'stop-opacity': '0.3' }));
  gr2.appendChild(el('stop', { offset: '100%', 'stop-color': '#00d4ff', 'stop-opacity': '0.3' }));
  defs.appendChild(gr2);

  svg.appendChild(defs);

  // Layout
  const pad = 20;
  const boxW = 90, boxH = 44;
  const mainY = 60, loraY = 145;
  const sumX = W - pad - 70, sumY = (mainY + loraY) / 2 + 10;

  // Input
  const inX = pad;
  const inY = (mainY + loraY) / 2 + 10 - boxH / 2;
  svg.appendChild(rect(inX, inY, boxW, boxH, { fill: 'url(#gr-main)', stroke: '#00d4ff', 'stroke-width': '1.5' }));
  svg.appendChild(text(inX + boxW / 2, inY + 26, 'Input x', { fill: '#00d4ff', 'font-size': '13', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));

  // W matrix (frozen)
  const wX = W * 0.32;
  svg.appendChild(rect(wX - boxW / 2, mainY - boxH / 2, boxW, boxH, { fill: 'rgba(255,77,109,0.15)', stroke: '#ff4d6d', 'stroke-width': '1.5' }));
  svg.appendChild(text(wX, mainY + 5, 'W (frozen)', { fill: '#ff6b9d', 'font-size': '12', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));
  svg.appendChild(text(wX, mainY + 19, '4096×4096', { fill: '#4a6a8a', 'font-size': '10', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));

  // A matrix
  const aX = W * 0.35, bX = W * 0.52;
  svg.appendChild(rect(aX - 40, loraY - 22, 78, 44, { fill: 'url(#gr-lora)', stroke: '#06d6a0', 'stroke-width': '1.5' }));
  svg.appendChild(text(aX - 1, loraY - 2, 'Matrix A', { fill: '#06d6a0', 'font-size': '12', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));
  svg.appendChild(text(aX - 1, loraY + 13, '4096×8', { fill: '#4a6a8a', 'font-size': '10', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));

  // B matrix
  svg.appendChild(rect(bX - 40, loraY - 22, 78, 44, { fill: 'url(#gr-lora)', stroke: '#00d4ff', 'stroke-width': '1.5' }));
  svg.appendChild(text(bX, loraY - 2, 'Matrix B', { fill: '#00d4ff', 'font-size': '12', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));
  svg.appendChild(text(bX, loraY + 13, '8×4096', { fill: '#4a6a8a', 'font-size': '10', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));

  // Sum circle
  const sumCx = sumX + 25, sumCy = sumY + 5;
  svg.appendChild(el('circle', { cx: sumCx, cy: sumCy, r: 20, fill: 'rgba(123,97,255,0.15)', stroke: '#7b61ff', 'stroke-width': '1.5' }));
  svg.appendChild(text(sumCx, sumCy + 6, '⊕', { fill: '#b8a9ff', 'font-size': '20', 'text-anchor': 'middle', 'font-family': 'monospace' }));

  // Output
  const outX = W - pad - boxW;
  const outY = sumCy - boxH / 2;
  svg.appendChild(rect(outX, outY, boxW, boxH, { fill: 'url(#gr-main)', stroke: '#7b61ff', 'stroke-width': '1.5' }));
  svg.appendChild(text(outX + boxW / 2, outY + 26, 'Output', { fill: '#b8a9ff', 'font-size': '13', 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace' }));

  // Labels
  svg.appendChild(text(wX, mainY - boxH / 2 - 8, '主干路', { fill: '#ff4d6d', 'font-size': '11', 'text-anchor': 'middle', 'font-family': 'Noto Sans SC, sans-serif' }));
  svg.appendChild(text((aX + bX) / 2, loraY + 32, 'LoRA 旁路', { fill: '#06d6a0', 'font-size': '11', 'text-anchor': 'middle', 'font-family': 'Noto Sans SC, sans-serif' }));

  // --- Animated particles ---
  const particles = [];
  let animId = null;
  let phase = 0;

  function createParticles() {
    particles.length = 0;
    // Main path particles
    for (let i = 0; i < 4; i++) {
      particles.push({ path: 'main', t: -i * 0.25, color: '#ff6b9d' });
    }
    // LoRA A particles
    for (let i = 0; i < 3; i++) {
      particles.push({ path: 'loraA', t: -i * 0.33, color: '#06d6a0' });
    }
    // LoRA B particles
    for (let i = 0; i < 3; i++) {
      particles.push({ path: 'loraB', t: -i * 0.33, color: '#00d4ff' });
    }
    // Sum to out particles
    for (let i = 0; i < 3; i++) {
      particles.push({ path: 'out', t: -i * 0.33, color: '#b8a9ff' });
    }
  }

  function getPos(p) {
    const t = ((p.t % 1) + 1) % 1;
    const inR = inX + boxW; // right edge of input
    const inMidY = inY + boxH / 2;

    if (p.path === 'main') {
      // input right → W left → W right → sum
      const segs = [
        { from: [inR, inMidY], to: [wX - boxW / 2, mainY] },
        { from: [wX - boxW / 2, mainY], to: [wX + boxW / 2, mainY] },
        { from: [wX + boxW / 2, mainY], to: [sumCx - 20, sumCy] },
      ];
      return interpolateSegs(segs, t);
    }
    if (p.path === 'loraA') {
      return lerp2([inR, inMidY], [aX - 40 + 78, loraY], t);
    }
    if (p.path === 'loraB') {
      return lerp2([aX - 40 + 78, loraY], [sumCx - 20, sumCy], t);
    }
    if (p.path === 'out') {
      return lerp2([sumCx + 20, sumCy], [outX, outY + boxH / 2], t);
    }
    return [0, 0];
  }

  function lerp2(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function interpolateSegs(segs, t) {
    const total = segs.length;
    const st = t * total;
    const idx = Math.min(Math.floor(st), total - 1);
    const lt = st - idx;
    return lerp2(segs[idx].from, segs[idx].to, lt);
  }

  // Create particle SVG circles
  const particleEls = [];
  createParticles();
  particles.forEach(() => {
    const c = el('circle', { r: 4, fill: '#fff', opacity: '0' });
    svg.appendChild(c);
    particleEls.push(c);
  });

  function animate() {
    phase += 0.006;
    particles.forEach((p, i) => {
      p.t = ((p.t + 0.006) % 1 + 1) % 1;
      const [x, y] = getPos(p);
      const c = particleEls[i];
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('fill', p.color);
      c.setAttribute('opacity', '0.9');
      c.setAttribute('filter', `drop-shadow(0 0 4px ${p.color})`);
    });
    animId = requestAnimationFrame(animate);
  }

  function start() {
    if (animId) cancelAnimationFrame(animId);
    createParticles();
    particles.forEach((p, i) => {
      particleEls[i].setAttribute('opacity', '0');
    });
    setTimeout(() => animate(), 100);
  }

  start();

  // Replay button
  const btn = document.getElementById('replay-lora');
  if (btn) btn.addEventListener('click', start);
}

/* ============================================
   ANIMATION 2: Parameter Comparison
   ============================================ */
function animateParamBars() {
  const fullBar = document.getElementById('bar-full');
  const loraBar = document.getElementById('bar-lora');
  const fullNum = document.getElementById('num-full');
  const loraNum = document.getElementById('num-lora');
  if (!fullBar) return;

  fullBar.style.width = '0%';
  loraBar.style.width = '0%';
  if (fullNum) fullNum.textContent = '0';
  if (loraNum) loraNum.textContent = '0';

  const fullTarget = 16777216;
  const loraTarget = 65536;
  const duration = 1800;
  const start = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOut(progress);

    fullBar.style.width = (eased * 100) + '%';
    loraBar.style.width = Math.max(eased * 0.39, 0.05) + '%';

    if (fullNum) fullNum.textContent = Math.floor(eased * fullTarget).toLocaleString();
    if (loraNum) loraNum.textContent = Math.floor(eased * loraTarget).toLocaleString();

    if (progress < 1) requestAnimationFrame(tick);
    else {
      fullBar.style.width = '100%';
      loraBar.style.width = '0.39%';
      fullBar.textContent = '全参数微调';
      loraBar.textContent = 'LoRA';
      if (fullNum) fullNum.textContent = '16,777,216';
      if (loraNum) loraNum.textContent = '65,536';
    }
  }

  requestAnimationFrame(tick);
}

const btn2 = document.getElementById('replay-params');
if (btn2) btn2.addEventListener('click', animateParamBars);

/* ============================================
   ANIMATION 3: VRAM Comparison
   ============================================ */
function animateVramBars() {
  const fullV = document.getElementById('vbar-full');
  const loraV = document.getElementById('vbar-lora');
  if (!fullV) return;

  fullV.style.width = '0%';
  loraV.style.width = '0%';

  const duration = 1600;
  const start = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  // full = 80GB out of 80 = 100%; lora = 16GB out of 80 = 20%
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOut(progress);

    fullV.style.width = (eased * 100) + '%';
    loraV.style.width = (eased * 20) + '%';

    if (progress < 1) requestAnimationFrame(tick);
    else {
      fullV.style.width = '100%';
      loraV.style.width = '20%';
    }
  }

  requestAnimationFrame(tick);
}

const btn3 = document.getElementById('replay-vram');
if (btn3) btn3.addEventListener('click', animateVramBars);

/* ============================================
   Init animations when section scrolls into view
   ============================================ */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    if (id === 'anim-lora') { initLoraAnimation(); animObserver.unobserve(e.target); }
    if (id === 'anim-params') { animateParamBars(); animObserver.unobserve(e.target); }
    if (id === 'anim-vram') { animateVramBars(); animObserver.unobserve(e.target); }
  });
}, { threshold: 0.3 });

['anim-lora', 'anim-params', 'anim-vram'].forEach(id => {
  const el = document.getElementById(id);
  if (el) animObserver.observe(el);
});

/* ---- Init LoRA SVG on window resize ---- */
window.addEventListener('resize', () => {
  const svg = document.getElementById('lora-canvas');
  if (svg) {
    initLoraAnimation();
  }
});
