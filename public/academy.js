/* Key Man Academy pages: course catalog (/academy), course page with the player (/course?c=slug)
   and the student account (/account). Texts come from i18n.js (kmLang); course data from /api. */
(() => {
  const page = document.body.dataset.page;
  const $ = s => document.querySelector(s);
  const t = (k, vars = {}) => window.kmLang.t(k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');
  const lang = () => window.kmLang.get();
  const tr = o => (o && (o[lang()] || o.ru || o.en || o.uk)) || '';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const price = c => (c.price ? new Intl.NumberFormat(lang() === 'uk' ? 'uk-UA' : lang(), { style: 'currency', currency: (c.currency || 'usd').toUpperCase(), maximumFractionDigits: c.price % 100 ? 2 : 0 }).format(c.price / 100) : t('acd.free'));
  const api = async (url, opts = {}) => {
    const r = await fetch(url, { cache: 'no-store', ...opts, headers: { Accept: 'application/json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data.error || 'generic'), { code: data.error || 'generic', status: r.status });
    return data;
  };
  const errText = e => {
    const k = 'err.' + e.code;
    return window.kmLang.t(k) !== k ? t(k) : e.code === 'payments_off' ? t('crs.payOff') : t('err.generic');
  };
  const rerender = [];
  addEventListener('km:lang', () => rerender.forEach(f => f()));

  /* ---------- header: shadow, burger, current page ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', links.classList.toggle('is-open')));
  document.querySelectorAll(`[data-nav="${page === 'course' ? 'catalog' : page}"]`).forEach(a => a.classList.add('is-current'));

  /* ---------- a course card (catalog and "my courses") ---------- */
  const card = (c, { owned = c.hasAccess } = {}) => `
    <a class="ccard" href="/course?c=${encodeURIComponent(c.slug)}">
      <div class="ccard__cover">${c.cover ? `<img src="${esc(c.cover)}" alt="" loading="lazy">` : '<span>KEY<b>MAN</b></span>'}
        ${c.level ? `<em>${esc(c.level)}</em>` : ''}</div>
      <div class="ccard__body">
        <h3>${esc(tr(c.title) || c.slug)}</h3>
        <p>${esc(tr(c.desc)).slice(0, 180)}</p>
        <div class="ccard__foot">
          <span>${t('acd.lessonsN', { n: c.lessons.length })}</span>
          ${owned ? `<b class="ccard__owned">${t('acd.owned')}</b>` : `<b>${price(c)}</b>`}
        </div>
      </div>
    </a>`;

  /* ================= catalog ================= */
  if (page === 'catalog') {
    let courses = null;
    const render = () => {
      if (!courses) return;
      $('#courseList').innerHTML = courses.map(c => card(c)).join('');
      $('#courseList').hidden = !courses.length;
      $('#courseEmpty').hidden = !!courses.length;
    };
    rerender.push(render);
    api('/api/courses').then(d => { courses = d.courses; render(); }).catch(() => { courses = []; render(); });
  }

  /* ================= course page ================= */
  if (page === 'course') {
    const slug = new URLSearchParams(location.search).get('c');
    let data = null, currentId = null;
    const video = $('#video'), msg = $('#screenMsg');

    const showMsg = text => { video.pause(); video.hidden = true; video.removeAttribute('src'); msg.hidden = false; msg.textContent = text; };

    const render = () => {
      if (!data) return;
      const c = data.course;
      document.title = `${tr(c.title)} — Key Man Academy`;
      $('#cLevel').textContent = c.level || 'Key Man Academy';
      $('#cTitle').textContent = tr(c.title) || c.slug;
      $('#cDesc').textContent = tr(c.desc);
      $('#buyBox').hidden = false;
      $('#cCover').hidden = !c.cover;
      if (c.cover) $('#cCover').src = c.cover;
      $('#cPrice').textContent = c.hasAccess ? t('acd.owned') : price(c);
      $('#cCount').textContent = t('acd.lessonsN', { n: c.lessons.length });
      $('#buyBtn').textContent = c.hasAccess ? t('crs.watch') : c.price ? t('crs.buy') : t('crs.getFree');
      const note = $('#buyNote');
      note.hidden = c.hasAccess || data.loggedIn;
      note.textContent = t('crs.loginToBuy');
      $('#lessonList').innerHTML = c.lessons.map((l, i) => {
        const open = c.hasAccess || l.free;
        return `<li><button type="button" data-lesson="${esc(l.id)}" class="${open ? '' : 'is-locked'} ${l.id === currentId ? 'is-active' : ''}">
          <i>${open ? i + 1 : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'}</i>
          <span>${esc(tr(l.title) || '—')}${l.free && !c.hasAccess ? ` <em>${t('crs.preview')}</em>` : ''}</span>
          ${l.duration ? `<small>${esc(l.duration)}</small>` : ''}
        </button></li>`;
      }).join('');
      const l = c.lessons.find(x => x.id === currentId);
      $('#lTitle').textContent = l ? tr(l.title) : '';
      $('#lDesc').textContent = l ? tr(l.desc) : '';
      if (!currentId) msg.textContent = t('crs.pick');
    };
    rerender.push(render);

    const play = async id => {
      const c = data.course, l = c.lessons.find(x => x.id === id);
      if (!l) return;
      currentId = id;
      render();
      if (!c.hasAccess && !l.free) return showMsg(t('crs.locked'));
      if (!l.hasVideo) return showMsg(t('crs.noVideo'));
      try {
        const { url } = await api(`/api/lesson?c=${encodeURIComponent(slug)}&l=${encodeURIComponent(id)}`);
        msg.hidden = true; video.hidden = false; video.src = url;
        video.play().catch(() => {});
      } catch (e) { showMsg(e.code === 'buy' || e.code === 'login' ? t('crs.locked') : t('err.generic')); }
    };

    $('#lessonList').addEventListener('click', e => {
      const b = e.target.closest('[data-lesson]');
      if (b) { play(b.dataset.lesson); if (innerWidth < 900) $('#screen').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
    video.addEventListener('contextmenu', e => e.preventDefault());

    $('#buyBtn').addEventListener('click', async () => {
      const c = data.course, btn = $('#buyBtn'), note = $('#buyNote');
      if (c.hasAccess) { const first = c.lessons[0]; if (first) play(first.id); return $('#lessons').scrollIntoView({ behavior: 'smooth' }); }
      if (!data.loggedIn) return (location.href = `/account?next=${encodeURIComponent(location.pathname + location.search)}`);
      btn.disabled = true;
      try {
        const r = await api('/api/pay/checkout', { method: 'POST', body: JSON.stringify({ course: slug, lang: lang() }) });
        if (r.url) { btn.textContent = t('crs.redirect'); return (location.href = r.url); }
        await load();
      } catch (e) { note.hidden = false; note.textContent = errText(e); }
      btn.disabled = false;
    });

    const load = async () => {
      try { data = await api(`/api/courses?c=${encodeURIComponent(slug || '')}`); render(); }
      catch { $('#cTitle').textContent = t('crs.notFound'); $('#lessons').hidden = true; }
    };
    load();
  }

  /* ================= account ================= */
  if (page === 'account') {
    const q = new URLSearchParams(location.search);
    let me = null;
    const formErr = (form, text) => { const p = form.querySelector('.aform__err'); p.hidden = !text; p.textContent = text || ''; };
    const fields = form => Object.fromEntries(new FormData(form));

    const render = () => {
      $('#authBox').hidden = !!me?.user;
      $('#cabinet').hidden = !me?.user;
      if (!me?.user) return;
      $('#hello').textContent = t('acc.hello', { name: me.user.name || me.user.email });
      $('#myCourses').innerHTML = me.courses.map(c => card(c, { owned: true })).join('');
      $('#myEmpty').hidden = !!me.courses.length;
      const pf = $('#profileForm');
      pf.email.value = me.user.email;
      if (document.activeElement?.form !== pf) { pf.name.value = me.user.name || ''; pf.phone.value = me.user.phone || ''; }
    };
    rerender.push(render);
    const load = async () => { me = await api('/api/account/me').catch(() => ({ user: null })); render(); };
    const loggedIn = () => {
      const next = q.get('next');
      if (next && next.startsWith('/') && !next.startsWith('//')) return (location.href = next);
      load();
    };

    // login / register tabs
    document.querySelectorAll('[data-auth]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-auth]').forEach(x => x.classList.toggle('is-active', x === b));
      document.querySelectorAll('[data-auth-pane]').forEach(p => { p.hidden = p.dataset.authPane !== b.dataset.auth; });
    }));

    const submit = (form, fn) => form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; formErr(form, '');
      try { await fn(fields(form)); } catch (err) { formErr(form, errText(err)); }
      btn.disabled = false;
    });
    submit($('#loginForm'), async f => { await api('/api/account/login', { method: 'POST', body: JSON.stringify(f) }); loggedIn(); });
    submit($('#registerForm'), async f => { await api('/api/account/register', { method: 'POST', body: JSON.stringify(f) }); loggedIn(); });
    submit($('#profileForm'), async f => {
      const r = await api('/api/account/me', { method: 'PATCH', body: JSON.stringify({ name: f.name, phone: f.phone }) });
      me.user = r.user; render(); formErr($('#profileForm'), t('acc.saved'));
    });
    submit($('#passwordForm'), async f => {
      await api('/api/account/me', { method: 'PATCH', body: JSON.stringify(f) });
      $('#passwordForm').reset(); formErr($('#passwordForm'), t('acc.saved'));
    });
    $('#logout').addEventListener('click', async () => { await api('/api/account/login', { method: 'DELETE' }).catch(() => {}); me = null; render(); });

    // back from Stripe: /account?paid=cs_...
    const paid = q.get('paid');
    if (paid) {
      const box = $('#payNotice');
      box.hidden = false; box.textContent = t('acc.paidWait');
      history.replaceState(null, '', '/account');
      api('/api/pay/confirm', { method: 'POST', body: JSON.stringify({ session: paid }) })
        .then(() => { box.classList.add('is-ok'); box.textContent = t('acc.paidOk'); load(); })
        .catch(() => { box.classList.add('is-err'); box.textContent = t('acc.paidErr'); });
    }
    load();
  }
})();
