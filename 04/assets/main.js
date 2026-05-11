/* ============================================================
   大语言模型微调-04 · main.js
   All animations, interactions, canvas drawings
   ============================================================ */

'use strict';

// ── DPR-aware canvas setup helper ────────────────────────────
// Fills the parent container's full width, scales height to maintain
// the logical aspect ratio, and applies dpr+scale in one ctx.scale()
// so all drawing code can use fixed logical coordinates (logicalW × logicalH).
function setupCanvas(canvas, logicalW, logicalH) {
  const dpr = window.devicePixelRatio || 1;
  const parent = canvas.parentElement;
  const displayW = (parent && parent.clientWidth > 0)
    ? Math.floor(parent.clientWidth)
    : logicalW;
  const scale    = displayW / logicalW;
  const displayH = Math.round(logicalH * scale);
  canvas.width        = displayW * dpr;
  canvas.height       = displayH * dpr;
  canvas.style.width  = displayW + 'px';
  canvas.style.height = displayH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr * scale, dpr * scale);
  return { ctx, W: logicalW, H: logicalH };
}

// ── Smooth scroll helper ──────────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: offset, behavior: 'smooth' });
}

// ── Scroll-reveal observer ────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll(
    '.step-card, .param-card, .file-card, .dimension-card, .compare-card, .toc-item, .benefit-item, .flow-step, .dtype-item, .phase-item'
  );
  els.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

// ── Cover canvas: particles ──────────────────────────────────
function initCoverCanvas() {
  const canvas = document.getElementById('coverCanvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  let W, H, particles;
  let ctx;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  }

  function buildParticles() {
    particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
      hue: Math.random() < 0.6 ? 170 : (Math.random() < 0.5 ? 210 : 40)
    }));
  }

  function drawConnections() {
    const dist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < dist) {
          const alpha = (1 - d / dist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(170,80%,50%,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},80%,65%,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
}

// ── Learning Rate Animation (Loss Curves) ────────────────────
// Shows how different LRs affect training loss over time:
// too large → oscillates, good → smooth decay, too small → barely moves
function createLRAnimation() {
  const canvas = document.getElementById('lrCanvas');
  if (!canvas) return null;
  const { ctx, W, H } = setupCanvas(canvas, 640, 300);
  let rafId = null, progress = 0;

  const padL = 58, padR = 30, padT = 55, padB = 50;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const STEPS = 60;

  // Pre-compute deterministic loss curves
  const curveLarge = Array.from({ length: STEPS }, (_, i) =>
    Math.max(0.08, 0.62 + 0.36 * Math.cos(i * 1.1) - 0.003 * i));
  const curveGood  = Array.from({ length: STEPS }, (_, i) =>
    0.95 * Math.pow(0.91, i) + 0.05);
  const curveSmall = Array.from({ length: STEPS }, (_, i) =>
    0.9  * Math.pow(0.9992, i) + 0.04);

  const curves = [
    { data: curveLarge, color: '#ff5e5e', label: '学习率过大', sub: '震荡剧烈，无法收敛' },
    { data: curveGood,  color: '#00c9a7', label: '学习率合适', sub: '平滑下降，顺利收敛' },
    { data: curveSmall, color: '#5b9ef9', label: '学习率过小', sub: '几乎不变，极其缓慢' }
  ];

  const MAX_LOSS = 1.15, MIN_LOSS = 0;
  function yToS(v) {
    const clamped = Math.min(MAX_LOSS, Math.max(MIN_LOSS, v));
    return padT + plotH - ((clamped - MIN_LOSS) / (MAX_LOSS - MIN_LOSS)) * plotH;
  }
  function xToS(i) { return padL + (i / (STEPS - 1)) * plotW; }

  function draw(prog) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);

    // Horizontal grid lines
    [0.25, 0.5, 0.75, 1.0].forEach(v => {
      const sy = yToS(v);
      ctx.strokeStyle = 'rgba(120,160,180,0.1)';
      ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(padL, sy); ctx.lineTo(padL + plotW, sy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(120,160,180,0.45)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(v.toFixed(2), 4, sy + 3);
    });

    // Axes
    ctx.strokeStyle = 'rgba(120,160,180,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'rgba(120,160,180,0.65)';
    ctx.font = '11px Noto Sans SC, sans-serif';
    ctx.fillText('训练步数（Iterations）', padL + plotW / 2 - 55, H - 10);
    ctx.save(); ctx.translate(13, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2); ctx.fillText('损失值 Loss', -28, 0); ctx.restore();

    // Title
    ctx.fillStyle = 'rgba(180,220,230,0.55)';
    ctx.font = '11px Noto Sans SC, sans-serif';
    ctx.fillText('学习率大小 → 对训练收敛过程的影响', padL, padT - 20);

    // Draw curves up to current progress
    const visSteps = Math.max(2, Math.floor(prog * STEPS));
    curves.forEach(c => {
      ctx.beginPath();
      for (let i = 0; i < visSteps; i++) {
        const sx = xToS(i), sy = yToS(c.data[i]);
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Animated head dot
      const last = visSteps - 1;
      ctx.beginPath();
      ctx.arc(xToS(last), yToS(c.data[last]), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
    });

    // Legend (top-right inset)
    curves.forEach((c, i) => {
      const lx = padL + plotW - 162, ly = padT + 8 + i * 40;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.roundRect(lx - 8, ly - 4, 168, 36, 5); ctx.fill();
      ctx.strokeStyle = c.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(lx, ly + 10); ctx.lineTo(lx + 22, ly + 10); ctx.stroke();
      ctx.fillStyle = c.color;
      ctx.font = 'bold 11px Noto Sans SC, sans-serif';
      ctx.fillText(c.label, lx + 28, ly + 14);
      ctx.fillStyle = 'rgba(150,190,210,0.6)';
      ctx.font = '9px Noto Sans SC, sans-serif';
      ctx.fillText(c.sub, lx + 28, ly + 27);
    });
  }

  function step() {
    progress += 0.013;
    if (progress >= 1) { progress = 1; draw(1); return; }
    draw(progress);
    rafId = requestAnimationFrame(step);
  }

  return {
    replay() { cancelAnimationFrame(rafId); progress = 0; rafId = requestAnimationFrame(step); }
  };
}

// ── Epoch / Fitting Animation (3 curves accumulate on one canvas) ─────────
// Curves drawn sequentially and kept visible for direct comparison
function createEpochAnimation() {
  const canvas = document.getElementById('epochCanvas');
  if (!canvas) return null;
  const { ctx, W, H } = setupCanvas(canvas, 640, 300);
  let rafId = null;

  const stages = [
    { label: '欠拟合   Epoch = 1',    color: '#ff5e5e', degree: 1, lw: 2.5 },
    { label: '好拟合   Epoch ≈ 3~6',  color: '#00c9a7', degree: 4, lw: 3   },
    { label: '过拟合   Epoch = 15+',  color: '#f5a623', degree: 9, lw: 2   }
  ];

  // Fixed data points (deterministic – no Math.random)
  const fixedOffsets = [8, -12, 15, -8, 10, -14, 11, -9, 13, -7, 10, -11];
  const DATA_X0 = 55, DATA_X1 = W - 55;
  const pts = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    return {
      x: DATA_X0 + t * (DATA_X1 - DATA_X0),
      y: 150 + 60 * Math.sin(t * Math.PI * 1.8 + 0.4) + fixedOffsets[i]
    };
  });

  // Polynomial least-squares fit with normalized x ∈ [-1, 1]
  const xMid = (DATA_X0 + DATA_X1) / 2, xHalf = (DATA_X1 - DATA_X0) / 2;
  function norm(x) { return (x - xMid) / xHalf; }

  function polyFit(rawXs, ys, deg) {
    const xs = rawXs.map(norm), m = deg + 1;
    const A = xs.map(x => Array.from({ length: m }, (_, k) => Math.pow(x, k)));
    const AtA = Array.from({ length: m }, (_, i) =>
      Array.from({ length: m }, (_, j) => A.reduce((s, r) => s + r[i] * r[j], 0)));
    const Aty = Array.from({ length: m }, (_, i) =>
      A.reduce((s, r, ri) => s + r[i] * ys[ri], 0));
    const aug = AtA.map((row, i) => [...row, Aty[i]]);
    for (let col = 0; col < m; col++) {
      let mx = col;
      for (let r = col + 1; r < m; r++)
        if (Math.abs(aug[r][col]) > Math.abs(aug[mx][col])) mx = r;
      [aug[col], aug[mx]] = [aug[mx], aug[col]];
      if (Math.abs(aug[col][col]) < 1e-10) continue;
      for (let r = col + 1; r < m; r++) {
        const f = aug[r][col] / aug[col][col];
        for (let c2 = col; c2 <= m; c2++) aug[r][c2] -= f * aug[col][c2];
      }
    }
    const c = new Array(m).fill(0);
    for (let i = m - 1; i >= 0; i--) {
      c[i] = aug[i][m] / aug[i][i];
      for (let r = i - 1; r >= 0; r--) aug[r][m] -= aug[r][i] * c[i];
    }
    return c;
  }

  function evalPoly(coeff, rawX) {
    const nx = norm(rawX);
    return coeff.reduce((s, ci, i) => s + ci * Math.pow(nx, i), 0);
  }

  const rawXs = pts.map(p => p.x), rawYs = pts.map(p => p.y);
  const coeffs = stages.map(s => polyFit(rawXs, rawYs, s.degree));

  // Draw one curve up to `prog` (0..1) across the data x-range
  function drawCurve(si, prog) {
    const c = coeffs[si], s = stages[si];
    const DRAW_STEPS = 240;
    const visSt = Math.floor(prog * DRAW_STEPS);
    if (visSt < 1) return;
    ctx.beginPath();
    for (let i = 0; i <= visSt; i++) {
      const t = i / DRAW_STEPS;
      const x = DATA_X0 + t * (DATA_X1 - DATA_X0);
      const y = Math.max(8, Math.min(H - 20, evalPoly(c, x)));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.lw;
    ctx.stroke();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, W, H);

    // Data points (drawn beneath curves)
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,225,242,0.9)'; ctx.fill();
      ctx.strokeStyle = 'rgba(100,160,200,0.4)'; ctx.lineWidth = 1; ctx.stroke();
    });

    // Fully completed curves
    for (let si = 0; si < phase; si++) drawCurve(si, 1);
    // Currently animating curve
    if (phase < stages.length) drawCurve(phase, progress);

    // Legend – appear as each curve starts
    stages.forEach((s, i) => {
      if (i > phase || (i === phase && progress < 0.05)) return;
      const alpha = i < phase ? 1 : Math.min(1, progress / 0.15);
      const lx = 20, ly = H - 30 - (stages.length - 1 - i) * 30;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = s.color; ctx.lineWidth = s.lw;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 26, ly); ctx.stroke();
      ctx.fillStyle = s.color;
      ctx.font = 'bold 12px Noto Sans SC, sans-serif';
      ctx.fillText(s.label, lx + 32, ly + 4);
      ctx.globalAlpha = 1;
    });

    // Axis hints
    ctx.fillStyle = 'rgba(120,160,180,0.45)';
    ctx.font = '11px Noto Sans SC, sans-serif';
    ctx.fillText('训练样本', W / 2 - 25, H - 8);
    ctx.save(); ctx.translate(14, H / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('预测输出', -25, 0); ctx.restore();

    // Title
    ctx.fillStyle = 'rgba(180,220,230,0.5)';
    ctx.font = '11px Noto Sans SC, sans-serif';
    ctx.fillText('训练轮数（Epoch）→ 拟合程度对比（同一画布）', 20, 22);
  }

  let phase = 0, progress = 0;
  function step() {
    progress += 0.016;
    if (progress >= 1) {
      progress = 1; drawFrame();
      setTimeout(() => {
        phase++;
        if (phase < stages.length) { progress = 0; rafId = requestAnimationFrame(step); }
      }, 700);
      return;
    }
    drawFrame();
    rafId = requestAnimationFrame(step);
  }

  return {
    replay() {
      cancelAnimationFrame(rafId);
      phase = 0; progress = 0;
      rafId = requestAnimationFrame(step);
    }
  };
}

// ── dtype Memory Bar Animation ───────────────────────────────
function createDtypeAnimation() {
  const canvas = document.getElementById('dtypeCanvas');
  if (!canvas) return null;
  const { ctx, W, H } = setupCanvas(canvas, 640, 240);
  let rafId = null, progress = 0;

  const formats = [
    { label: 'FP32', bits: '32位', relative: 1.0, color: '#ff5e5e', desc: '基准 · 显存100%' },
    { label: 'FP16', bits: '16位', relative: 0.5, color: '#f5a623', desc: '显存 50% · 易溢出' },
    { label: 'BF16', bits: '16位', relative: 0.5, color: '#00c9a7', desc: '显存 50% · 训练稳定 ★' }
  ];

  const barH = 40, gap = 22, startY = 50, startX = 130, maxW = 380;

  function draw(prog) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(120,160,180,0.5)';
    ctx.font = '11px Noto Sans SC, sans-serif';
    ctx.fillText('7B 参数模型显存占用对比（BF16/FP16 可将显存需求减半）', 18, 24);

    formats.forEach((fmt, i) => {
      const y = startY + i * (barH + gap);
      const targetW = fmt.relative * maxW * prog;

      ctx.fillStyle = '#d4e8f0';
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.fillText(fmt.label, 14, y + barH / 2 + 5);
      ctx.fillStyle = 'rgba(120,160,180,0.6)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(fmt.bits, 14, y + barH / 2 + 18);

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.roundRect(startX, y, maxW, barH, 6);
      ctx.fill();

      ctx.fillStyle = fmt.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(startX, y, Math.max(0, targetW), barH, 6);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (targetW > 40) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillText(Math.round(fmt.relative * 100 * prog) + '%', startX + targetW - 40, y + barH / 2 + 5);
      }

      ctx.fillStyle = fmt.color;
      ctx.font = '11px Noto Sans SC, sans-serif';
      ctx.fillText(fmt.desc, startX + maxW + 14, y + barH / 2 + 5);
    });
  }

  function step() {
    progress += 0.018;
    if (progress >= 1) { progress = 1; draw(1); return; }
    draw(progress);
    rafId = requestAnimationFrame(step);
  }

  return {
    replay() { cancelAnimationFrame(rafId); progress = 0; rafId = requestAnimationFrame(step); }
  };
}

// ── Cutoff Length / Quadratic Growth Animation ───────────────
function createCutoffAnimation() {
  const canvas = document.getElementById('cutoffCanvas');
  if (!canvas) return null;
  const { ctx, W, H } = setupCanvas(canvas, 640, 260);
  let rafId = null, progress = 0;

  const padL = 70, padR = 30, padT = 30, padB = 50;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxX = 4096, maxYquad = maxX * maxX / 1000;

  function xToS(x) { return padL + (x / maxX) * plotW; }
  function linToS(y) { return padT + plotH - Math.min(1, y / maxX) * plotH; }
  function quadToS(y) { return padT + plotH - Math.min(1, y / maxYquad) * plotH; }

  function draw(prog) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(120,160,180,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    ctx.fillStyle = 'rgba(120,160,180,0.7)';
    ctx.font = '11px Noto Sans SC, sans-serif';
    ctx.fillText('截断长度 (Tokens)', padL + plotW / 2 - 50, H - 8);
    ctx.save(); ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2); ctx.fillText('显存占用', -20, 0); ctx.restore();

    [1024, 2048, 4096].forEach(v => {
      const sx = xToS(v);
      ctx.fillStyle = 'rgba(120,160,180,0.5)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(v, sx - 15, padT + plotH + 16);
      ctx.strokeStyle = 'rgba(120,160,180,0.1)';
      ctx.beginPath(); ctx.moveTo(sx, padT); ctx.lineTo(sx, padT + plotH); ctx.stroke();
    });

    const steps = Math.floor(prog * 200);

    // linear (ideal, dashed blue)
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = (i / 200) * maxX;
      const sx = xToS(x), sy = linToS(x);
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = '#5b9ef9';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // quadratic (real, solid red)
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = (i / 200) * maxX;
      const sx = xToS(x), sy = quadToS(x * x / 1000);
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = '#ff5e5e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (prog > 0.85) {
      ctx.fillStyle = '#ff5e5e';
      ctx.font = '11px Noto Sans SC, sans-serif';
      ctx.fillText('截断长度 ×2 → 注意力层显存 ×4！', padL + plotW * 0.35, padT + 20);
    }

    ctx.fillStyle = 'rgba(120,160,180,0.5)';
    ctx.font = '10px Noto Sans SC, sans-serif';
    ctx.fillText('自注意力机制的平方级显存增长 vs. 理想线性增长', 18, 18);
  }

  function step() {
    progress += 0.012;
    if (progress >= 1) { progress = 1; draw(1); return; }
    draw(progress);
    rafId = requestAnimationFrame(step);
  }

  return {
    replay() { cancelAnimationFrame(rafId); progress = 0; rafId = requestAnimationFrame(step); }
  };
}

// ── Batch Size Animation ──────────────────────────────────────
function createBatchAnimation() {
  const canvas = document.getElementById('batchCanvas');
  if (!canvas) return null;
  const { ctx, W, H } = setupCanvas(canvas, 640, 240);
  let rafId = null;

  const PHASES = [
    { size: 1,  label: 'Batch=1  每本改完立刻更新', color: '#ff5e5e' },
    { size: 4,  label: 'Batch=4  四本一起综合评估', color: '#f5a623' },
    { size: 16, label: 'Batch=16  大批量稳定学习',  color: '#00c9a7' }
  ];

  function drawPapers(count, color, label, prog) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = color;
    ctx.font = 'bold 12px Noto Sans SC, sans-serif';
    ctx.fillText(label, 18, 26);

    const w = 38, h = 50, gap = 10;
    const cols = Math.min(count, 16);
    const rows = Math.ceil(count / cols);
    const totalW = cols * w + (cols - 1) * gap;
    const startX = (W - totalW) / 2;
    const startY = (H - rows * (h + 8)) / 2 + 20;
    const visibleCount = Math.floor(count * prog);

    for (let i = 0; i < visibleCount; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = startX + col * (w + gap);
      const y = startY + row * (h + 8);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5 + 0.5 * (i / Math.max(visibleCount - 1, 1));
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.stroke();
      ctx.globalAlpha = 1;
      for (let l = 0; l < 4; l++) {
        ctx.strokeStyle = 'rgba(200,220,230,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 8 + l * 10);
        ctx.lineTo(x + w - 5, y + 8 + l * 10);
        ctx.stroke();
      }
    }

    const vmW = 160, vmH = 16;
    const vmX = W - vmW - 20, vmY = H - 36;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.roundRect(vmX, vmY, vmW, vmH, 4); ctx.fill();
    const fillRatio = Math.min(1, (count / 16) * prog);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.roundRect(vmX, vmY, vmW * fillRatio, vmH, 4); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(180,210,230,0.6)';
    ctx.font = '10px Noto Sans SC, sans-serif';
    ctx.fillText('显存占用', vmX, vmY - 6);
  }

  let phase = 0, phaseT = 0;
  function step() {
    phaseT += 0.022;
    if (phaseT >= 1) {
      phaseT = 1;
      const ph = PHASES[phase];
      drawPapers(ph.size, ph.color, ph.label, 1);
      setTimeout(() => {
        phase = (phase + 1) % PHASES.length;
        phaseT = 0;
        rafId = requestAnimationFrame(step);
      }, 1200);
      return;
    }
    const ph = PHASES[phase];
    drawPapers(ph.size, ph.color, ph.label, phaseT);
    rafId = requestAnimationFrame(step);
  }

  return {
    replay() { cancelAnimationFrame(rafId); phase = 0; phaseT = 0; rafId = requestAnimationFrame(step); }
  };
}

// ── Scheduler (Cosine) Animation ─────────────────────────────
function createSchedulerAnimation() {
  const canvas = document.getElementById('schedulerCanvas');
  if (!canvas) return null;
  const { ctx, W, H } = setupCanvas(canvas, 640, 240);
  let rafId = null, progress = 0;

  const padL = 60, padR = 20, padT = 30, padB = 48;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  function cosineSchedule(t) {
    const warmup = 0.1;
    if (t < warmup) return t / warmup;
    return 0.5 * (1 + Math.cos(Math.PI * (t - warmup) / (1 - warmup)));
  }

  const curves = [
    { fn: cosineSchedule,            color: '#00c9a7', label: 'cosine（余弦退火）', lw: 2.5 },
    { fn: t => Math.max(0, 1 - t),   color: '#5b9ef9', label: 'linear（线性）',     lw: 1.5 },
    { fn: () => 1,                   color: '#7a9eb5', label: 'constant（恒定）',   lw: 1.5 }
  ];

  function draw(prog) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, W, H);

    [0.25, 0.5, 0.75, 1.0].forEach(v => {
      const sy = padT + plotH - v * plotH;
      ctx.strokeStyle = 'rgba(120,160,180,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, sy); ctx.lineTo(padL + plotW, sy); ctx.stroke();
      ctx.fillStyle = 'rgba(120,160,180,0.4)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText((v * 100).toFixed(0) + '%', 4, sy + 4);
    });

    ctx.strokeStyle = 'rgba(120,160,180,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    ctx.fillStyle = 'rgba(120,160,180,0.5)';
    ctx.font = '11px Noto Sans SC, sans-serif';
    ctx.fillText('训练进度', padL + plotW / 2 - 20, H - 8);
    ctx.save(); ctx.translate(12, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2); ctx.fillText('学习率', -15, 0); ctx.restore();

    const steps = Math.floor(prog * 300);
    curves.forEach((curve, ci) => {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / 300;
        const lr = curve.fn(t);
        const sx = padL + t * plotW;
        const sy = padT + plotH - lr * plotH;
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = curve.lw;
      if (ci > 0) ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    if (prog > 0.15) {
      const warmupX = padL + 0.1 * plotW;
      ctx.strokeStyle = 'rgba(0,201,167,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(warmupX, padT); ctx.lineTo(warmupX, padT + plotH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0,201,167,0.6)';
      ctx.font = '10px Noto Sans SC, sans-serif';
      ctx.fillText('预热', warmupX + 4, padT + 18);
    }

    curves.forEach((c, i) => {
      const lx = W - 160, ly = padT + i * 22;
      ctx.strokeStyle = c.color;
      ctx.lineWidth = c.lw;
      if (i > 0) ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(lx, ly + 6); ctx.lineTo(lx + 18, ly + 6); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.color;
      ctx.font = '10px Noto Sans SC, sans-serif';
      ctx.fillText(c.label, lx + 22, ly + 10);
    });
  }

  function step() {
    progress += 0.010;
    if (progress >= 1) { progress = 1; draw(1); return; }
    draw(progress);
    rafId = requestAnimationFrame(step);
  }

  return {
    replay() { cancelAnimationFrame(rafId); progress = 0; rafId = requestAnimationFrame(step); }
  };
}

// ── Expose animations globally for replay buttons ────────────
let lrAnimation, epochAnimation, dtypeAnimation, cutoffAnimation, batchAnimation, schedulerAnimation;

// ── IntersectionObserver auto-start animations ────────────────
function observeAndPlay(canvasId, creator, varSetter) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  let started = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      const anim = creator();
      varSetter(anim);
      if (anim) anim.replay();
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(el);
}

// ── File tree click scroll ────────────────────────────────────
function initFileTree() {
  document.querySelectorAll('.tree-line[data-target]').forEach(el => {
    el.addEventListener('click', () => {
      const target = document.getElementById(el.dataset.target);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        target.classList.add('highlight-pulse');
        setTimeout(() => target.classList.remove('highlight-pulse'), 1200);
      }
    });
  });
}

// ── Active nav link on scroll ─────────────────────────────────
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.dropdown li a, .nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === '#' + entry.target.id) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('section[id], div[id]').forEach(s => obs.observe(s));
}

// ── Main init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCoverCanvas();
  initFileTree();
  initScrollSpy();

  observeAndPlay('lrCanvas',        createLRAnimation,        a => lrAnimation = a);
  observeAndPlay('epochCanvas',     createEpochAnimation,     a => epochAnimation = a);
  observeAndPlay('dtypeCanvas',     createDtypeAnimation,     a => dtypeAnimation = a);
  observeAndPlay('cutoffCanvas',    createCutoffAnimation,    a => cutoffAnimation = a);
  observeAndPlay('batchCanvas',     createBatchAnimation,     a => batchAnimation = a);
  observeAndPlay('schedulerCanvas', createSchedulerAnimation, a => schedulerAnimation = a);
});
