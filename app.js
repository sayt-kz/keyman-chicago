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
  // opts.center: the big intro key in the middle of the hero
  const keyPath = (opts = {}) => {
    const s = opts.scale ?? rand(.7, 1.15);
    const rot = opts.rot ?? rand(-.5, .5);
    const R = 34 * s, bladeLen = 190 * s, bh = 26 * s, pts = [];
    // centre the whole key (bow + blade) on the point, or drop it somewhere random
    const halfW = (R + R * Math.cos(.35) + bladeLen + 14 * s) / 2;
    const cx = opts.center ? W / 2 - halfW + R : rand(W * .1, W * .75);
    const cy = opts.center ? H / 2 : rand(H * .15, H * .85);
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

  const measure = pts => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return cum;
  };

  const makeTracer = (delay = 0) => {
    const isKey = Math.random() < .3;
    const pts = isKey ? keyPath() : profilePath();
    const cum = measure(pts);
    return { pts, cum, total: cum[cum.length - 1], prog: 0, speed: isKey ? rand(4.5, 6) : rand(6, 9), wait: delay, hold: 0, alpha: 1, isKey };
  };

  // the big key in the middle, drawn in ~1.3 s while the video loads
  const makeIntro = () => {
    const keyW = Math.min(W * (W < 720 ? .86 : .62), 860);
    const pts = keyPath({ center: true, scale: keyW / 290, rot: -.06 });
    const cum = measure(pts);
    const total = cum[cum.length - 1];
    return { pts, cum, total, prog: 0, speed: total / 78, wait: 6, hold: 0, alpha: 1, isKey: true, intro: true };
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
    // a single animation: the big key in the middle (no other lines)
    tracers = [makeIntro()];
    if (reduceMotion) { tracers.forEach(tr => { tr.prog = tr.total; tr.wait = 0; }); introResolve(); }
  };

  const draw = () => {
    // hero off-screen, or the background video is playing: skip the work
    if (scrollY > H || hero.classList.contains('has-video')) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, W, H);

    // dot grid
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let gx = 0; gx < W; gx += 36) for (let gy = 0; gy < H; gy += 36) ctx.fillRect(gx, gy, 1.2, 1.2);

    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    tracers.forEach((tr, i) => {
      if (tr.wait > 0) { tr.wait--; return; }
      const drawing = tr.prog < tr.total;
      if (drawing) {
        // the intro key is time-based (~1.3 s on any device); the others move per frame
        if (tr.intro) tr.prog = Math.min(tr.total, tr.total * (performance.now() - (tr.t0 ??= performance.now())) / 1300);
        else tr.prog = Math.min(tr.total, tr.prog + tr.speed);
        if (tr.intro && tr.prog >= tr.total) setTimeout(introResolve, 350); // key finished → let the video in
      } else if (tr.hold < 240) tr.hold++;               // the finished key stays for ~4 s…
      else if ((tr.alpha -= .02) <= 0) { tracers[i] = makeIntro(); return; } // …then fades and is drawn again

      // the line already drawn (the intro key is bolder and glows)
      ctx.save();
      if (tr.intro) { ctx.shadowColor = 'rgba(255,170,50,.55)'; ctx.shadowBlur = 14; }
      ctx.lineWidth = tr.intro ? 3 : tr.isKey ? 1.6 : 1.3;
      ctx.strokeStyle = `rgba(255,170,50,${(tr.intro ? .95 : tr.isKey ? .5 : .34) * tr.alpha})`;
      strokeRange(tr, 0, tr.prog);
      ctx.restore();

      if (!drawing) return;
      // bright fresh segment right behind the dot
      const tail = tr.intro ? 2.2 : 1;
      ctx.save();
      ctx.shadowColor = 'rgba(245,165,28,.9)'; ctx.shadowBlur = tr.intro ? 18 : 10;
      ctx.lineWidth = tr.intro ? 3.4 : 2;
      ctx.strokeStyle = 'rgba(255,215,120,.95)';
      strokeRange(tr, tr.prog - 70 * tail, tr.prog);
      ctx.strokeStyle = 'rgba(255,190,70,.35)';
      strokeRange(tr, tr.prog - 200 * tail, tr.prog - 70 * tail);
      ctx.restore();

      // the dot itself
      const [hx, hy] = pointAt(tr, tr.prog);
      const glow = tr.intro ? 34 : 22;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, glow);
      g.addColorStop(0, 'rgba(255,215,110,.75)');
      g.addColorStop(1, 'rgba(245,165,28,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hx, hy, glow, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff4d6';
      ctx.beginPath(); ctx.arc(hx, hy, tr.intro ? 4 : 2.6, 0, Math.PI * 2); ctx.fill();

      const sparkChance = tr.intro ? .9 : .3;
      if (Math.random() < sparkChance) sparks.push({ x: hx, y: hy, vx: rand(-1.8, 1.8), vy: rand(-2.4, -.3), life: 1 });
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
