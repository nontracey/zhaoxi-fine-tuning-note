/* ============================================================
   大语言模型微调-05 | Teaching Demo Page
   JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.chapter');

  // Scroll handler for navbar shadow and active state
  function handleScroll() {
    // Navbar shadow
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link
    let currentSection = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ============================================================
  // COVER PARTICLES
  // ============================================================

  const particlesContainer = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'cover-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (6 + Math.random() * 6) + 's';
    particle.style.width = (2 + Math.random() * 4) + 'px';
    particle.style.height = particle.style.width;
    particle.style.opacity = 0.2 + Math.random() * 0.4;
    particlesContainer.appendChild(particle);
  }

  // ============================================================
  // SCROLL REVEAL (Intersection Observer)
  // ============================================================

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe chapters and subsections
  document.querySelectorAll('.chapter, .reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ============================================================
  // ANIMATION: LoRA Mechanism
  // ============================================================

  function animateLoraMechanism(container) {
    if (!container) return;

    // Reset
    container.querySelectorAll('.lora-node, .lora-edge, .lora-connector, .lora-merge-node').forEach(el => {
      el.classList.remove('visible');
    });
    container.classList.remove('animated');

    // Stagger animation
    const nodes = container.querySelectorAll('.lora-node');
    const edges = container.querySelectorAll('.lora-edge');
    const connector = container.querySelector('.lora-connector');
    const merge = container.querySelector('.lora-merge-node');

    const timings = [
      () => nodes[0]?.classList.add('visible'),           // Input
      () => edges[0]?.classList.add('visible'),            // Edge down from input
      () => edges[1]?.classList.add('visible'),            // Edge to frozen
      () => nodes[1]?.classList.add('visible'),            // Frozen weight
      () => edges[2]?.classList.add('visible'),            // Edge to lora
      () => nodes[2]?.classList.add('visible'),            // A matrix
      () => connector?.classList.add('visible'),           // x
      () => nodes[3]?.classList.add('visible'),            // B matrix
      () => edges[3]?.classList.add('visible'),            // Edge from frozen
      () => edges[4]?.classList.add('visible'),            // Edge from lora
      () => merge?.classList.add('visible'),               // Merge
      () => nodes[4]?.classList.add('visible'),            // Output
      () => container.classList.add('animated'),
    ];

    timings.forEach((fn, i) => {
      setTimeout(fn, i * 200);
    });
  }

  // ============================================================
  // ANIMATION: Rank Demo
  // ============================================================

  function animateRankDemo(container) {
    if (!container) return;

    const panels = container.querySelectorAll('.rank-panel');
    const bars = container.querySelectorAll('.channel-bar');

    // Reset
    panels.forEach(p => p.classList.remove('visible'));
    bars.forEach(b => {
      b.classList.remove('animated');
      b.style.width = '0%';
    });

    // Animate
    setTimeout(() => panels[0]?.classList.add('visible'), 200);
    setTimeout(() => panels[1]?.classList.add('visible'), 500);

    setTimeout(() => {
      const lowBar = container.querySelector('.low-rank .channel-bar');
      if (lowBar) {
        lowBar.classList.add('animated');
        lowBar.style.setProperty('--target-width', '20%');
        lowBar.style.width = '20%';
      }
    }, 800);

    setTimeout(() => {
      const highBar = container.querySelector('.high-rank .channel-bar');
      if (highBar) {
        highBar.classList.add('animated');
        highBar.style.setProperty('--target-width', '80%');
        highBar.style.width = '80%';
      }
    }, 1200);
  }

  // ============================================================
  // ANIMATION: Scale Demo
  // ============================================================

  function animateScaleDemo(container) {
    if (!container) return;

    const cards = container.querySelectorAll('.scale-card');
    cards.forEach(c => c.classList.remove('visible'));

    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 300);
    });
  }

  // ============================================================
  // ANIMATION: Dropout Demo
  // ============================================================

  let dropoutInterval = null;

  function animateDropoutDemo(container) {
    if (!container) return;

    // Clear existing interval
    if (dropoutInterval) {
      clearInterval(dropoutInterval);
      dropoutInterval = null;
    }

    const grid = container.querySelector('#dropout-grid');
    if (!grid) return;

    // Create cells
    grid.innerHTML = '';
    const totalCells = 20;
    const rate = 0.1;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'dropout-cell';
      grid.appendChild(cell);
    }

    function randomizeDropout() {
      const cells = grid.querySelectorAll('.dropout-cell');
      let activeCount = 0;

      cells.forEach(cell => {
        cell.classList.remove('dropped', 'active');
        if (Math.random() < rate) {
          cell.classList.add('dropped');
        } else {
          activeCount++;
          cell.classList.add('active');
        }
      });

      const rateEl = container.querySelector('#dropout-rate');
      const activeEl = container.querySelector('#dropout-active');
      if (rateEl) rateEl.textContent = rate;
      if (activeEl) activeEl.textContent = activeCount;
    }

    randomizeDropout();
    dropoutInterval = setInterval(randomizeDropout, 1200);
  }

  // ============================================================
  // ANIMATION: DoRA Demo
  // ============================================================

  function animateDoraDemo(container) {
    if (!container) return;

    const steps = container.querySelectorAll('.dora-step');
    const arrows = container.querySelectorAll('.dora-arrow');
    const split = container.querySelector('.dora-split');

    // Reset
    steps.forEach(s => s.classList.remove('visible'));
    arrows.forEach(a => a.classList.remove('visible'));
    if (split) split.classList.remove('visible');

    // Stagger
    const sequence = [
      () => steps[0]?.classList.add('visible'),
      () => arrows[0]?.classList.add('visible'),
      () => steps[1]?.classList.add('visible'),
      () => arrows[1]?.classList.add('visible'),
      () => split?.classList.add('visible'),
    ];

    sequence.forEach((fn, i) => {
      setTimeout(fn, i * 400);
    });
  }

  // ============================================================
  // ANIMATION: Module Demo
  // ============================================================

  function animateModuleDemo(container) {
    if (!container) return;

    const cells = container.querySelectorAll('.module-cell');
    cells.forEach(c => c.classList.remove('visible', 'highlight-cell'));

    cells.forEach((cell, i) => {
      setTimeout(() => {
        cell.classList.add('visible');
        // Highlight all cells (all-layer mode)
        setTimeout(() => cell.classList.add('highlight-cell'), 200);
      }, i * 120);
    });
  }

  // ============================================================
  // ANIMATION: Loss Chart
  // ============================================================

  function animateLossChart(container) {
    if (!container) return;

    const line = container.querySelector('#loss-line');
    const area = container.querySelector('#loss-area');
    const smooth = container.querySelector('#loss-smooth');
    const pointsGroup = container.querySelector('#loss-points');

    if (!line || !area || !smooth) return;

    // Reset
    line.classList.remove('animated');
    area.classList.remove('animated');
    smooth.classList.remove('animated');
    if (pointsGroup) pointsGroup.innerHTML = '';

    // Loss data points (approximating training curve)
    const lossData = [
      { x: 0.2, y: 1.93 },
      { x: 0.5, y: 1.65 },
      { x: 0.8, y: 1.45 },
      { x: 1.2, y: 1.25 },
      { x: 1.5, y: 1.12 },
      { x: 2.0, y: 0.98 },
      { x: 2.5, y: 0.88 },
      { x: 3.0, y: 0.82 },
      { x: 3.5, y: 0.76 },
      { x: 4.0, y: 0.71 },
      { x: 4.5, y: 0.66 },
      { x: 5.0, y: 0.62 },
      { x: 5.5, y: 0.58 },
      { x: 6.0, y: 0.55 },
    ];

    // Scale to SVG coordinates
    const svgW = 500;
    const svgH = 250;
    const padL = 50;
    const padT = 20;
    const padB = 220; // y axis goes down
    const padR = 480;

    function toSvg(epoch, loss) {
      const x = padL + (epoch / 6.5) * (padR - padL);
      const y = padT + (1 - loss / 2.2) * (padB - padT);
      return { x, y };
    }

    // Build path
    let pathD = '';
    lossData.forEach((d, i) => {
      const pt = toSvg(d.x, d.y);
      pathD += (i === 0 ? 'M' : 'L') + pt.x.toFixed(1) + ',' + pt.y.toFixed(1);
    });

    // Smooth path (simplified cubic bezier)
    let smoothD = `M${toSvg(lossData[0].x, lossData[0].y).x.toFixed(1)},${toSvg(lossData[0].x, lossData[0].y).y.toFixed(1)}`;
    for (let i = 1; i < lossData.length; i++) {
      const prev = toSvg(lossData[i - 1].x, lossData[i - 1].y);
      const curr = toSvg(lossData[i].x, lossData[i].y);
      const cpx = (prev.x + curr.x) / 2;
      smoothD += ` C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${curr.y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
    }

    // Area path
    const lastPt = toSvg(lossData[lossData.length - 1].x, lossData[lossData.length - 1].y);
    const firstPt = toSvg(lossData[0].x, lossData[0].y);
    const areaD = pathD + ` L${lastPt.x},${padB} L${firstPt.x},${padB} Z`;

    line.setAttribute('d', pathD);
    smooth.setAttribute('d', smoothD);
    area.setAttribute('d', areaD);

    // Create data points
    lossData.forEach((d, i) => {
      const pt = toSvg(d.x, d.y);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('class', 'loss-point');
      circle.setAttribute('data-index', i);
      pointsGroup.appendChild(circle);
    });

    // Trigger animation
    requestAnimationFrame(() => {
      line.classList.add('animated');
      area.classList.add('animated');
      smooth.classList.add('animated');

      // Reveal points along the path
      const points = pointsGroup.querySelectorAll('.loss-point');
      points.forEach((pt, i) => {
        setTimeout(() => pt.classList.add('visible'), i * 200);
      });
    });
  }

  // ============================================================
  // ANIMATION OBSERVER (trigger on scroll into view)
  // ============================================================

  const animationMap = {
    'lora-mechanism': animateLoraMechanism,
    'rank-demo': animateRankDemo,
    'scale-demo': animateScaleDemo,
    'dropout-demo': animateDropoutDemo,
    'dora-demo': animateDoraDemo,
    'module-demo': animateModuleDemo,
    'loss-demo': animateLossChart,
  };

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const demoId = entry.target.id;
        if (animationMap[demoId]) {
          animationMap[demoId](entry.target);
        }
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -80px 0px'
  });

  // Observe all demo containers
  Object.keys(animationMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) animObserver.observe(el);
  });

  // ============================================================
  // REPLAY BUTTONS
  // ============================================================

  document.querySelectorAll('.replay-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const demoId = btn.dataset.demo;

      // Map button demo ID to container ID
      const containerMap = {
        'lora-mechanism': 'lora-mechanism',
        'rank-demo': 'rank-demo',
        'scale-demo': 'scale-demo',
        'dropout-demo': 'dropout-demo',
        'dora-demo': 'dora-demo',
        'module-demo': 'module-demo',
        'loss-demo': 'loss-demo',
      };

      const containerId = containerMap[demoId];
      const container = document.getElementById(containerId);

      if (container && animationMap[containerId]) {
        animationMap[containerId](container);
      }
    });
  });

  // ============================================================
  // SCROLL HINT FADE OUT
  // ============================================================

  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollHint.style.opacity = '0';
        scrollHint.style.transition = 'opacity 0.5s';
      }
    }, { passive: true });
  }

  // ============================================================
  // COVER SCROLL - FADE OUT
  // ============================================================

  const cover = document.getElementById('cover');
  if (cover) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const coverHeight = cover.offsetHeight;
      if (scrolled < coverHeight) {
        const opacity = 1 - (scrolled / coverHeight) * 1.2;
        cover.style.opacity = Math.max(0, opacity);
      }
    }, { passive: true });
  }

  // ============================================================
  // SMOOTH SCROLL FOR TOC LINKS
  // ============================================================

  document.querySelectorAll('.toc-list a, .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

});
