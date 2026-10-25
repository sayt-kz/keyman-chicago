(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); }
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const siblings = [...en.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      en.target.style.transitionDelay = Math.min(siblings.indexOf(en.target), 5) * 80 + 'ms';
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Card spotlight ---------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });

  /* ---------- "Order" buttons prefill the form ---------- */
  const select = document.getElementById('serviceSelect');
  const pickService = name => {
    const opt = [...select.options].find(o => o.text === name);
    if (opt) select.value = opt.value;
  };
  document.querySelectorAll('[data-service]').forEach(btn => btn.addEventListener('click', () => {
    pickService(btn.dataset.service);
    document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.querySelector('#leadForm input[name=name]').focus({ preventScroll: true }), 600);
  }));
  document.querySelectorAll('[data-service-link]').forEach(a => a.addEventListener('click', () => pickService(a.dataset.serviceLink)));

  /* ---------- Lead form ---------- */
  const form = document.getElementById('leadForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 10);
      f.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } catch { /* static hosting: no backend */ }
    form.querySelector('.form__ok').hidden = false;
    form.reset();
    btn.disabled = false;
  });

  /* ---------- Scene parallax ---------- */
  const scene = document.querySelector('.scene');
  if (scene && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5) * 2, y = (e.clientY / innerHeight - .5) * 2;
      scene.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`;
    });
  }

  /* ---------- Hero canvas: glowing dots draw key profiles and key outlines ---------- */
  const canvas = document.getElementById('bitting');
  const ctx = canvas.getContext('2d');
  let W, H, tracers = [], sparks = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  // a key blade edge across the screen: flat cuts at different depths joined by 45° slopes
  const profilePath = () => {
    const y = rand(H * .08, H * .92), step = 9, ltr = Math.random() < .5;
    const pts = [];
    let x = -40, depth = 0;
    pts.push([x, y]);
    while (x < W + 40) {
      const next = Math.floor(rand(0, 5));
      const slope = Math.abs(next - depth) * step;
      x += slope; depth = next;
      pts.push([x, y + depth * step]);
      x += rand(18, 46);
      pts.push([x, y + depth * step]);
    }
    return ltr ? pts : pts.map(([px, py]) => [W - px, py]);
  };

  // a whole key silhouette: round bow with a hole, then the blade with bitting and a tip
  const keyPath = () => {
    const s = rand(.7, 1.15), cx = rand(W * .1, W * .75), cy = rand(H * .15, H * .85), rot = rand(-.5, .5);
    const R = 34 * s, bladeLen = 190 * s, bh = 26 * s, pts = [];
    for (let a = .35; a <= Math.PI * 2 - .35; a += .12) pts.push([-Math.cos(a) * R, Math.sin(a) * R]);
    const x0 = R * Math.cos(.35);
    pts.push([x0, -bh / 2], [x0 + bladeLen, -bh / 2], [x0 + bladeLen + 14 * s, 0], [x0 + bladeLen, bh / 2]);
    let x = x0 + bladeLen, d = 0;
    while (x > x0 + 24 * s) {            // bitting cuts along the bottom edge, going back to the bow
      const nd = Math.floor(rand(0, 4)) * 4 * s;
      x -= Math.abs(nd - d) + 4; d = nd;
      pts.push([x, bh / 2 + d]);
      x -= rand(8, 16) * s;
      pts.push([x, bh / 2 + d]);
    }
    pts.push([x0 + 10 * s, bh / 2], [x0, bh / 2]);
    for (let a = 0; a <= Math.PI * 2 + .01; a += .3) pts.push([Math.cos(a) * R * .38, Math.sin(a) * R * .38]); // hole
    const c = Math.cos(rot), sn = Math.sin(rot);
    return pts.map(([px, py]) => [cx + px * c - py * sn, cy + px * sn + py * c]);
  };

  const makeTracer = (delay = 0) => {
    const isKey = Math.random() < .3;
    const pts = isKey ? keyPath() : profilePath();
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, total: cum[cum.length - 1], prog: 0, speed: isKey ? rand(2.2, 3) : rand(2.8, 4.5), wait: delay, hold: 0, alpha: 1, isKey };
  };

  const pointAt = (tr, d) => {
    let lo = 1, hi = tr.cum.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; tr.cum[mid] < d ? lo = mid + 1 : hi = mid; }
    const [x0, y0] = tr.pts[lo - 1], [x1, y1] = tr.pts[lo];
    const seg = tr.cum[lo] - tr.cum[lo - 1] || 1, k = (d - tr.cum[lo - 1]) / seg;
    return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, lo];
  };

  const strokeRange = (tr, from, to) => {
    from = Math.max(0, from); to = Math.min(tr.total, to);
    if (to <= from) return;
    const [sx, sy, i0] = pointAt(tr, from), [ex, ey] = pointAt(tr, to);
    ctx.beginPath(); ctx.moveTo(sx, sy);
    for (let i = i0; i < tr.pts.length && tr.cum[i] < to; i++) ctx.lineTo(tr.pts[i][0], tr.pts[i][1]);
    ctx.lineTo(ex, ey); ctx.stroke();
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // phones fire resize when the address bar hides — keep the lines unless the width changed
    if (tracers.length && W === resize.lastW) return;
    resize.lastW = W;
    const count = W < 720 ? 3 : 6;
    tracers = Array.from({ length: count }, (_, i) => makeTracer(i * 70));
    if (reduceMotion) tracers.forEach(tr => { tr.prog = tr.total; tr.wait = 0; });
  };

  const draw = () => {
    if (scrollY > H) { requestAnimationFrame(draw); return; } // hero off-screen: skip work
    ctx.clearRect(0, 0, W, H);

    // dot grid
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let gx = 0; gx < W; gx += 36) for (let gy = 0; gy < H; gy += 36) ctx.fillRect(gx, gy, 1.2, 1.2);

    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    tracers.forEach((tr, i) => {
      if (tr.wait > 0) { tr.wait--; return; }
      const drawing = tr.prog < tr.total;
      if (drawing) tr.prog = Math.min(tr.total, tr.prog + tr.speed);
      else if (tr.hold < 90) tr.hold++;
      else if ((tr.alpha -= .012) <= 0) { tracers[i] = makeTracer(rand(10, 80)); return; }

      // the line already drawn
      ctx.lineWidth = tr.isKey ? 1.6 : 1.3;
      ctx.strokeStyle = `rgba(245,165,28,${(tr.isKey ? .32 : .2) * tr.alpha})`;
      strokeRange(tr, 0, tr.prog);

      if (!drawing) return;
      // bright fresh segment right behind the dot
      ctx.save();
      ctx.shadowColor = 'rgba(245,165,28,.9)'; ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,205,100,.85)';
      strokeRange(tr, tr.prog - 70, tr.prog);
      ctx.strokeStyle = 'rgba(255,190,70,.35)';
      strokeRange(tr, tr.prog - 200, tr.prog - 70);
      ctx.restore();

      // the dot itself
      const [hx, hy] = pointAt(tr, tr.prog);
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 22);
      g.addColorStop(0, 'rgba(255,215,110,.75)');
      g.addColorStop(1, 'rgba(245,165,28,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hx, hy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff4d6';
      ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, Math.PI * 2); ctx.fill();

      if (Math.random() < .3) sparks.push({ x: hx, y: hy, vx: rand(-1.4, 1.4), vy: rand(-2, -.3), life: 1 });
    });

    sparks = sparks.filter(s => (s.life -= .03) > 0);
    sparks.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.vy += .07;
      ctx.fillStyle = `rgba(255,${180 + 60 * s.life | 0},80,${s.life * .8})`;
      ctx.fillRect(s.x, s.y, 1.6, 1.6);
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  };

  addEventListener('resize', resize);
  resize();
  draw();
})();
