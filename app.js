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

  /* ---------- Hero canvas: key bitting profiles being "cut" ---------- */
  const canvas = document.getElementById('bitting');
  const ctx = canvas.getContext('2d');
  let W, H, lanes = [], sparks = [], t = 0;

  const makeProfile = len => {
    // a key blade: flat segments at random cut depths with angled transitions
    const pts = [];
    let x = 0;
    while (x < len) {
      const depth = Math.floor(Math.random() * 5);
      const flat = 26 + Math.random() * 30;
      pts.push([x, depth], [x + flat, depth]);
      x += flat + 16;
    }
    return pts;
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(5, Math.round(H / 110));
    lanes = Array.from({ length: count }, (_, i) => ({
      y: (H / (count + 1)) * (i + 1),
      speed: .25 + Math.random() * .5,
      dir: i % 2 ? 1 : -1,
      offset: Math.random() * 1000,
      pts: makeProfile(W * 2 + 400),
      len: 0,
      alpha: .05 + Math.random() * .07,
      cutter: .12 + Math.random() * .76,
      lit: Math.random() < .5,
    }));
    lanes.forEach(l => l.len = l.pts[l.pts.length - 1][0]);
  };

  const laneY = (lane, x) => {
    // y of the profile at screen x (for the cutter dot)
    const px = ((x - lane.offset) % lane.len + lane.len) % lane.len;
    for (let i = 1; i < lane.pts.length; i++) {
      const [x0, d0] = lane.pts[i - 1], [x1, d1] = lane.pts[i];
      if (px >= x0 && px <= x1) {
        const k = x1 === x0 ? 0 : (px - x0) / (x1 - x0);
        return lane.y + (d0 + (d1 - d0) * k) * 7;
      }
    }
    return lane.y;
  };

  const draw = () => {
    if (scrollY > H) { requestAnimationFrame(draw); return; } // hero off-screen: skip work
    ctx.clearRect(0, 0, W, H);

    // dot grid
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    for (let gx = 0; gx < W; gx += 36) for (let gy = 0; gy < H; gy += 36) ctx.fillRect(gx, gy, 1.2, 1.2);

    lanes.forEach((lane, li) => {
      lane.offset += lane.speed * lane.dir;
      const cutterX = W * lane.cutter;
      ctx.lineWidth = 1.5;

      // uncut part (right of cutter for even lanes) dim; cut part brighter
      ['dim', 'cut'].forEach(pass => {
        ctx.beginPath();
        let started = false;
        for (let rep = -1; rep <= 1; rep++) {
          lane.pts.forEach(([px, d]) => {
            const sx = px + lane.offset + rep * lane.len;
            if (sx < -60 || sx > W + 60) return;
            const isCut = lane.dir < 0 ? sx < cutterX : sx > cutterX;
            if ((pass === 'cut') !== isCut) { started = false; return; }
            const sy = lane.y + d * 7;
            started ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
            started = true;
          });
          started = false;
        }
        ctx.strokeStyle = pass === 'cut' ? `rgba(245,165,28,${lane.alpha * 2.4})` : `rgba(255,255,255,${lane.alpha * .8})`;
        ctx.stroke();
      });

      // cutter glow (only on some lanes, so it doesn't look like a grid of dots)
      if (!lane.lit) return;
      const cy = laneY(lane, cutterX);
      const g = ctx.createRadialGradient(cutterX, cy, 0, cutterX, cy, 26);
      g.addColorStop(0, 'rgba(255,210,90,.55)');
      g.addColorStop(1, 'rgba(255,184,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cutterX, cy, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe39a';
      ctx.beginPath(); ctx.arc(cutterX, cy, 2.2, 0, Math.PI * 2); ctx.fill();

      if (Math.random() < .35) sparks.push({
        x: cutterX, y: cy, vx: (Math.random() - .5) * 2.4 - lane.dir * 1.2, vy: -Math.random() * 2.2, life: 1,
      });
    });

    sparks = sparks.filter(s => (s.life -= .025) > 0);
    sparks.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.vy += .08;
      ctx.fillStyle = `rgba(255,${180 + 60 * s.life | 0},80,${s.life * .8})`;
      ctx.fillRect(s.x, s.y, 1.6, 1.6);
    });

    t++;
    if (!reduceMotion) requestAnimationFrame(draw);
  };

  addEventListener('resize', resize);
  resize();
  draw();
})();
