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
    const opt = [...select.options].find(o => o.value === name);
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
  const scene = document.querySelector('.vanstage');
  if (scene && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5) * 2, y = (e.clientY / innerHeight - .5) * 2;
      scene.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`;
    });
  }

  /* ---------- Hero background video (like samalconstruction.com) ----------
     Plays a muted, looping segment of a Key Man YouTube video behind the hero.
     With data-mp4 set, a local file is used instead. If nothing can play
     (blocked autoplay, data saver, reduced motion) the canvas animation stays. */
  const hero = document.getElementById('hero');
  const heroVideo = document.getElementById('heroVideo');
  const saveData = navigator.connection?.saveData;
  // the video fades in only after the intro key has been drawn (or after 2.6 s at most)
  let introResolve;
  const introDone = new Promise(r => { introResolve = r; });
  setTimeout(introResolve, reduceMotion ? 0 : 2600);
  let revealTimer, looping = false, wantVideo = false;
  const showVideo = () => { wantVideo = true; introDone.then(() => { if (wantVideo) hero.classList.add('has-video'); }); };
  const hideVideo = () => { wantVideo = false; clearTimeout(revealTimer); hero.classList.remove('has-video'); };
  // the headline and the van come in right after the key is drawn
  introDone.then(() => hero.classList.remove('hero--intro'));

  if (heroVideo && !reduceMotion && !saveData) {
    const { yt, mp4 } = heroVideo.dataset;
    const start = +heroVideo.dataset.start || 0;
    const end = +heroVideo.dataset.end || 0;

    if (mp4) {
      const v = document.createElement('video');
      Object.assign(v, { src: mp4, muted: true, autoplay: true, loop: true, playsInline: true });
      v.addEventListener('playing', showVideo, { once: true });
      heroVideo.replaceChildren(v);
    } else if (yt) {
      window.onYouTubeIframeAPIReady = () => {
        const player = new YT.Player('heroPlayer', {
          host: 'https://www.youtube-nocookie.com',
          videoId: yt,
          playerVars: {
            autoplay: 1, mute: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1,
            iv_load_policy: 3, modestbranding: 1, start, ...(end ? { end } : {}),
          },
          events: {
            onReady: e => { e.target.mute(); e.target.playVideo(); },
            onStateChange: e => {
              // YouTube draws its own play/pause icon and spinner for a moment whenever playback
              // starts, buffers or restarts — and it can't be switched off. So the video is shown
              // only after it has been playing smoothly for a few seconds, and hidden in every
              // other state (the animated background stays underneath).
              clearTimeout(revealTimer);
              if (e.data === YT.PlayerState.PLAYING) { looping = false; revealTimer = setTimeout(showVideo, 3200); }
              else hideVideo();
              if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(start, true); e.target.playVideo(); }
            },
          },
        });
        // restart the segment shortly before its end — hidden, so the restart icon is never seen
        setInterval(() => {
          if (!end || looping || player.getPlayerState?.() !== YT.PlayerState.PLAYING) return;
          if (player.getCurrentTime() > end - 1.6) {
            looping = true;
            hideVideo();
            setTimeout(() => player.seekTo(start, true), 1500); // after the fade-out
          }
        }, 400);
        // pause while the hero is off-screen
        new IntersectionObserver(([en]) => {
          if (!player.getPlayerState) return;
          en.isIntersecting ? player.playVideo() : player.pauseVideo();
        }).observe(hero);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }

  /* ---------- Hero canvas: a glowing dot draws a realistic key in the centre ----------
     Outline (head, shoulder, blade with cuts, tip), then the hole, the head rim and the two milled
     grooves; then the key is filled with a brass sheen, stays for a few seconds, fades and is redrawn
     with new cuts. It is visible until the background video takes over. */
  const canvas = document.getElementById('bitting');
  const ctx = canvas.getContext('2d');
  const DRAW_MS = 1500, FILL_MS = 500, HOLD_MS = 4000, FADE_MS = 800;
  let W, H, key = null, sparks = [], cycleStart = null, resolved = false;
  const rand = (a, b) => a + Math.random() * (b - a);

  const arc = (pts, cx, cy, r, a0, a1, n = 14) => {
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  };
  const roundRect = (x0, y0, x1, y1, r) => {
    const p = [];
    arc(p, x1 - r, y0 + r, r, 0, -Math.PI / 2);
    arc(p, x0 + r, y0 + r, r, -Math.PI / 2, -Math.PI);
    arc(p, x0 + r, y1 - r, r, Math.PI, Math.PI / 2);
    arc(p, x1 - r, y1 - r, r, Math.PI / 2, 0);
    p.push(p[0]);
    return p;
  };

  // key geometry in "key units" (about 340 wide, head on the left, y grows downwards)
  const buildKey = () => {
    const outline = [];
    // head (bow): a rounded square, starting where the blade joins, going up and around
    arc(outline, 70, -22, 34, 0, -Math.PI / 2);
    arc(outline, 34, -22, 34, -Math.PI / 2, -Math.PI);
    arc(outline, 34, 22, 34, Math.PI, Math.PI / 2);
    arc(outline, 70, 22, 34, Math.PI / 2, 0);
    // shoulder stop and the bottom edge of the blade
    outline.push([116, 22], [116, 17], [316, 17]);
    // tip
    outline.push([338, 3], [338, -5], [326, -17]);
    // top edge with the cuts (bitting), back towards the shoulder
    let x = 326;
    while (x > 134) {
      const depth = Math.round(rand(1, 5)) * 2.2;
      outline.push([x, -17]);
      x -= rand(5, 9); outline.push([x, -17]);          // flat between cuts
      x -= depth * .9; outline.push([x, -17 + depth]);  // slope down
      x -= rand(2, 4); outline.push([x, -17 + depth]);  // bottom of the cut
      x -= depth * .9; outline.push([x, -17]);          // slope up
    }
    outline.push([116, -17], [116, -22], [104, -22]);

    const hole = []; arc(hole, 30, 0, 13, 0, Math.PI * 2, 28);
    const rim = roundRect(9, -47, 95, 47, 26);
    const groove1 = [[124, -3], [304, -3]];
    const groove2 = [[124, 8], [310, 8], [322, 2]];
    return [outline, hole, rim, groove1, groove2];
  };

  const measure = pts => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return cum;
  };

  // scale the key to the hero and centre it, slightly tilted
  const layoutKey = () => {
    const keyW = Math.min(W * (W < 720 ? .84 : .56), 820);
    const s = keyW / 340, rot = -.06, c = Math.cos(rot), sn = Math.sin(rot);
    const paths = buildKey().map(raw => {
      const pts = raw.map(([px, py]) => {
        const x = (px - 169) * s, y = py * s;
        return [W / 2 + x * c - y * sn, H / 2 + x * sn + y * c];
      });
      const cum = measure(pts);
      return { pts, cum, len: cum[cum.length - 1] };
    });
    return { paths, total: paths.reduce((a, p) => a + p.len, 0) };
  };

  const pointAt = (p, d) => {
    let lo = 1, hi = p.cum.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; p.cum[mid] < d ? lo = mid + 1 : hi = mid; }
    const [x0, y0] = p.pts[lo - 1], [x1, y1] = p.pts[lo];
    const seg = p.cum[lo] - p.cum[lo - 1] || 1, k = (d - p.cum[lo - 1]) / seg;
    return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, lo];
  };
  const strokeRange = (p, from, to) => {
    from = Math.max(0, from); to = Math.min(p.len, to);
    if (to <= from) return;
    const [sx, sy, i0] = pointAt(p, from), [ex, ey] = pointAt(p, to);
    ctx.beginPath(); ctx.moveTo(sx, sy);
    for (let i = i0; i < p.pts.length && p.cum[i] < to; i++) ctx.lineTo(p.pts[i][0], p.pts[i][1]);
    ctx.lineTo(ex, ey); ctx.stroke();
  };
  const addPolygon = pts => { pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // phones fire resize when the address bar hides: keep the drawing unless the width changed
    if (key && W === resize.lastW) return;
    resize.lastW = W;
    key = layoutKey();
  };

  const draw = now => {
    requestAnimationFrame(draw);
    // hero off-screen, or the background video is playing: skip the work
    if (scrollY > H || hero.classList.contains('has-video')) return;
    if (cycleStart === null) cycleStart = now;
    let t = reduceMotion ? DRAW_MS + FILL_MS : now - cycleStart;
    if (!reduceMotion && t > DRAW_MS + HOLD_MS + FADE_MS) { key = layoutKey(); cycleStart = now; t = 0; } // redraw with new cuts
    const alpha = reduceMotion ? 1 : Math.max(0, Math.min(1, 1 - (t - DRAW_MS - HOLD_MS) / FADE_MS));
    if (!resolved && t >= DRAW_MS + 300) { resolved = true; introResolve(); }

    ctx.clearRect(0, 0, W, H);
    // faint dot grid
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let gx = 0; gx < W; gx += 36) for (let gy = 0; gy < H; gy += 36) ctx.fillRect(gx, gy, 1.2, 1.2);

    const [outline, hole] = key.paths;
    // brass fill once the outline is complete (the hole stays open)
    const fill = Math.max(0, Math.min(1, (t - DRAW_MS) / FILL_MS)) * alpha;
    if (fill > 0) {
      const ys = outline.pts.map(p => p[1]);
      const g = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
      g.addColorStop(0, `rgba(255,226,150,${.42 * fill})`);
      g.addColorStop(.45, `rgba(255,176,60,${.22 * fill})`);
      g.addColorStop(.55, `rgba(255,236,180,${.36 * fill})`);
      g.addColorStop(1, `rgba(214,128,20,${.3 * fill})`);
      ctx.beginPath();
      addPolygon(outline.pts);
      addPolygon(hole.pts);
      ctx.fillStyle = g;
      ctx.fill('evenodd');
    }

    // the lines drawn so far: one dot travels through all parts of the key in order
    let budget = Math.min(1, t / DRAW_MS) * key.total;
    let head = null, current = null, currentDrawn = 0;
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,170,50,.55)'; ctx.shadowBlur = 12;
    key.paths.forEach((p, i) => {
      const d = Math.min(p.len, budget);
      budget -= d;
      if (d <= 0) return;
      ctx.lineWidth = i === 0 ? 2.8 : 1.8;
      ctx.strokeStyle = i === 0 ? `rgba(255,178,70,${.95 * alpha})` : `rgba(255,196,110,${.7 * alpha})`;
      strokeRange(p, 0, d);
      if (d < p.len && !head) { head = pointAt(p, d); current = p; currentDrawn = d; }
    });
    ctx.restore();

    if (head && alpha > 0) {
      // bright fresh segment right behind the dot
      ctx.save();
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(245,165,28,.9)'; ctx.shadowBlur = 18;
      ctx.lineWidth = 3.4; ctx.strokeStyle = 'rgba(255,225,140,.95)';
      strokeRange(current, currentDrawn - 110, currentDrawn);
      ctx.restore();
      // the dot
      const [hx, hy] = head;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 34);
      g.addColorStop(0, 'rgba(255,225,130,.8)');
      g.addColorStop(1, 'rgba(245,165,28,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hx, hy, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff6dc';
      ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
      if (Math.random() < .9) sparks.push({ x: hx, y: hy, vx: rand(-1.8, 1.8), vy: rand(-2.4, -.3), life: 1 });
    }

    sparks = sparks.filter(sp => (sp.life -= .03) > 0);
    sparks.forEach(sp => {
      sp.x += sp.vx; sp.y += sp.vy; sp.vy += .07;
      ctx.fillStyle = `rgba(255,${180 + 60 * sp.life | 0},80,${sp.life * .8})`;
      ctx.fillRect(sp.x, sp.y, 1.6, 1.6);
    });
  };

  addEventListener('resize', resize);
  resize();
  if (reduceMotion) introResolve();
  requestAnimationFrame(draw);
  /* ---------- Service area map: Google Maps labels in the site language ---------- */
  const mapFrame = document.getElementById('mapFrame');
  if (mapFrame) {
    const setMapLang = lang => {
      const src = mapFrame.src.replace(/hl=w+/, 'hl=' + (lang || 'ru'));
      if (src !== mapFrame.src) mapFrame.src = src;
    };
    setMapLang(window.kmLang?.get());
    addEventListener('km:lang', e => setMapLang(e.detail.lang));
  }
})();
