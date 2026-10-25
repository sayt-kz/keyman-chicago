/* Key Man admin panel: leads, site texts (RU/EN/UA), gallery, settings. Talks to /api/admin/*. */
(() => {
  const $ = s => document.querySelector(s);
  const LANGS = ['ru', 'en', 'uk'];
  const LANG_NAMES = { ru: 'RU', en: 'EN', uk: 'UA' };
  const DEFAULTS = window.kmLang?.defaults || {};
  document.title = 'Key Man — админ-панель'; // i18n.js renames the page; keep ours

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (text, err = false) => {
    const t = $('#toast');
    t.textContent = text; t.className = 'toast' + (err ? ' is-err' : ''); t.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 3200);
  };
  const api = async (url, opts = {}) => {
    const r = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opts });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && !url.endsWith('/login')) { showLogin(); throw new Error('Нужно войти заново'); }
    if (!r.ok) throw new Error(data.error || `Ошибка ${r.status}`);
    return data;
  };

  /* ================= login ================= */
  const showLogin = () => { $('#app').hidden = true; $('#login').hidden = false; };
  const showApp = () => { $('#login').hidden = true; $('#app').hidden = false; loadLeads(); };

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#loginErr'); err.hidden = true;
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: e.target.password.value }) });
      e.target.reset(); showApp();
    } catch (x) { err.textContent = x.message; err.hidden = false; }
  });
  $('#logout').addEventListener('click', async () => { await api('/api/admin/login', { method: 'DELETE' }).catch(() => {}); showLogin(); });

  /* ================= navigation ================= */
  const views = { leads: loadLeads, texts: loadTexts, gallery: loadGallery, settings: loadStatus };
  document.querySelectorAll('.side__nav [data-view]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.side__nav [data-view]').forEach(x => x.classList.toggle('is-active', x === b));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === b.dataset.view));
    views[b.dataset.view]();
  }));

  /* ================= leads ================= */
  let leads = [], filter = 'all';
  const STATUS = { new: 'Новая', work: 'В работе', done: 'Выполнено', spam: 'Спам' };
  const SOURCE = { form: 'Форма на сайте', chat: 'Чат-бот', widget: 'Быстрая заявка' };
  const fmt = ts => new Date(ts).toLocaleString('ru-RU', { timeZone: 'America/Chicago', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' (Чикаго)';

  async function loadLeads() {
    try { leads = (await api('/api/admin/leads')).leads; renderLeads(); }
    catch (e) { toast(e.message, true); }
  }
  function renderLeads() {
    const n = leads.filter(l => l.status === 'new').length;
    $('#newCount').hidden = !n; $('#newCount').textContent = n;
    const list = leads.filter(l => filter === 'all' || l.status === filter);
    $('#leads').innerHTML = list.length ? list.map(l => `
      <article class="lead" data-status="${esc(l.status)}" data-id="${esc(l.id)}">
        <div class="lead__top">
          <span class="lead__name">${esc(l.name || 'Без имени')}</span>
          <a class="lead__phone" href="tel:${esc(l.phone.replace(/[^\d+]/g, ''))}">${esc(l.phone)}</a>
          <span class="lead__meta">${fmt(l.ts)} · ${esc(SOURCE[l.source] || l.source)}${l.lang ? ' · ' + esc(LANG_NAMES[l.lang] || l.lang) : ''}</span>
        </div>
        <div class="lead__body">
          ${l.service ? `<div><b>Услуга:</b> ${esc(l.service)}</div>` : ''}
          ${l.vehicle ? `<div><b>Авто:</b> ${esc(l.vehicle)}</div>` : ''}
          ${l.location ? `<div><b>Где:</b> ${esc(l.location)}</div>` : ''}
          ${l.email ? `<div><b>Email:</b> ${esc(l.email)}</div>` : ''}
          ${l.message ? `<div class="lead__msg">${esc(l.message)}</div>` : ''}
        </div>
        <div class="lead__side">
          <select data-act="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === l.status ? ' selected' : ''}>${v}</option>`).join('')}</select>
          <button class="btn btn--danger" data-act="del">Удалить</button>
        </div>
        <div class="lead__note"><textarea data-act="note" placeholder="Заметка мастера…">${esc(l.note || '')}</textarea></div>
      </article>`).join('') : `<div class="empty">${leads.length ? 'В этом разделе пусто' : 'Заявок пока нет. Они появятся здесь, когда клиенты отправят форму на сайте или в чате.'}</div>`;
  }
  $('#leadFilters').addEventListener('click', e => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll('#leadFilters [data-f]').forEach(x => x.classList.toggle('is-active', x === b));
    renderLeads();
  });
  $('#leads').addEventListener('change', async e => {
    const card = e.target.closest('.lead'); if (!card) return;
    const id = card.dataset.id, lead = leads.find(l => l.id === id);
    try {
      if (e.target.dataset.act === 'status') { lead.status = e.target.value; await api('/api/admin/leads', { method: 'PATCH', body: JSON.stringify({ id, status: lead.status }) }); renderLeads(); toast('Статус обновлён'); }
      if (e.target.dataset.act === 'note') { lead.note = e.target.value; await api('/api/admin/leads', { method: 'PATCH', body: JSON.stringify({ id, note: lead.note }) }); toast('Заметка сохранена'); }
    } catch (x) { toast(x.message, true); }
  });
  $('#leads').addEventListener('click', async e => {
    if (e.target.dataset.act !== 'del') return;
    const id = e.target.closest('.lead').dataset.id;
    if (!confirm('Удалить заявку навсегда?')) return;
    try { await api('/api/admin/leads?id=' + encodeURIComponent(id), { method: 'DELETE' }); leads = leads.filter(l => l.id !== id); renderLeads(); toast('Заявка удалена'); }
    catch (x) { toast(x.message, true); }
  });
  $('#leadsRefresh').addEventListener('click', loadLeads);
  $('#leadsCsv').addEventListener('click', () => {
    const cols = ['ts', 'status', 'source', 'name', 'phone', 'email', 'service', 'vehicle', 'location', 'message', 'note', 'lang'];
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [cols.join(','), ...leads.map(l => cols.map(c => q(c === 'ts' ? new Date(l.ts).toISOString() : l[c])).join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = `keyman-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  });
  setInterval(() => { if (!$('#app').hidden && document.visibilityState === 'visible') loadLeads(); }, 60_000);

  /* ================= texts ================= */
  const GROUPS = [
    ['nav', 'Меню и кнопки'], ['hero', 'Главный экран'], ['badge', 'Плашки у фургона'], ['brands', 'Марки'],
    ['work', 'Галерея (заголовки)'], ['shot', 'Галерея — видео'], ['ph', 'Галерея — фото'], ['sv', 'Услуги'],
    ['how', 'Как мы работаем'], ['why', 'Почему мы'], ['unit', 'Единицы'], ['ac', 'Академия'], ['so', 'Соцсети'],
    ['faq', 'Вопросы и ответы'], ['ct', 'Контакты'], ['fm', 'Форма заявки'], ['ai', 'Чат-виджет'], ['ft', 'Подвал'], ['cb', 'Нижняя панель (телефон)'],
  ];
  let overrides = {};
  const value = (key, l) => overrides[key]?.[l] || DEFAULTS[key]?.[l] || '';

  async function loadTexts() {
    try { overrides = (await api('/api/admin/content')).texts || {}; renderTexts(); }
    catch (e) { toast(e.message, true); }
  }
  function renderTexts() {
    const keys = Object.keys(DEFAULTS);
    $('#texts').innerHTML = GROUPS.map(([prefix, title]) => {
      const ks = keys.filter(k => k.split('.')[0] === prefix);
      if (!ks.length) return '';
      return `<details class="tgroup" ${prefix === 'hero' ? 'open' : ''}><summary>${title} <small class="muted">(${ks.length})</small></summary>
        ${ks.map(k => `<div class="trow${overrides[k] ? ' is-changed' : ''}" data-key="${esc(k)}">
          <div class="trow__key">${esc(k)}</div>
          ${LANGS.map(l => `<label>${LANG_NAMES[l]}<textarea data-lang="${l}" rows="${(DEFAULTS[k]?.[l] || '').length > 70 ? 3 : 1}">${esc(value(k, l))}</textarea></label>`).join('')}
          <button class="trow__reset" title="Вернуть текст по умолчанию">↺</button>
        </div>`).join('')}</details>`;
    }).join('');
  }
  $('#texts').addEventListener('input', e => {
    const row = e.target.closest('.trow'); if (!row) return;
    const k = row.dataset.key;
    const changed = LANGS.some(l => row.querySelector(`[data-lang=${l}]`).value !== (DEFAULTS[k]?.[l] || ''));
    row.classList.toggle('is-changed', changed);
  });
  $('#texts').addEventListener('click', e => {
    if (!e.target.classList.contains('trow__reset')) return;
    const row = e.target.closest('.trow'), k = row.dataset.key;
    LANGS.forEach(l => { row.querySelector(`[data-lang=${l}]`).value = DEFAULTS[k]?.[l] || ''; });
    row.classList.remove('is-changed');
  });
  $('#textSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.trow').forEach(row => {
      const hit = !q || row.dataset.key.includes(q) || [...row.querySelectorAll('textarea')].some(t => t.value.toLowerCase().includes(q));
      row.hidden = !hit;
    });
    if (q) document.querySelectorAll('.tgroup').forEach(g => { g.open = !!g.querySelector('.trow:not([hidden])'); });
  });
  $('#textsSave').addEventListener('click', async () => {
    const texts = {};
    document.querySelectorAll('.trow').forEach(row => {
      const k = row.dataset.key, val = {};
      let diff = false;
      LANGS.forEach(l => {
        const v = row.querySelector(`[data-lang=${l}]`).value;
        val[l] = v === (DEFAULTS[k]?.[l] || '') ? '' : v;
        if (val[l]) diff = true;
      });
      if (diff) texts[k] = val;
    });
    try { await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ texts }) }); overrides = texts; toast(`Сохранено. Изменённых текстов: ${Object.keys(texts).length}. На сайте — в течение минуты.`); }
    catch (e) { toast(e.message, true); }
  });

  /* ================= gallery ================= */
  let gallery = [];
  const tri = v => Object.fromEntries(LANGS.map(l => [l, v?.[l] || '']));
  const thumb = it => it.type === 'youtube' ? `https://i.ytimg.com/vi/${encodeURIComponent(it.src)}/${it.vertical ? 'oar2' : 'hqdefault'}.jpg` : (it.src.startsWith('http') || it.src.startsWith('/') ? it.src : '../' + it.src);

  // the gallery that is built into the site (used until one is saved here)
  async function siteGallery() {
    const html = await (await fetch('../', { cache: 'no-store' })).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textOf = el => el?.dataset.i18n ? tri(DEFAULTS[el.dataset.i18n]) : tri(Object.fromEntries(LANGS.map(l => [l, el?.textContent.trim() || ''])));
    return [...doc.querySelectorAll('#showcase .shot')].map(s => ({
      type: s.dataset.type === 'youtube' ? 'youtube' : 'image',
      src: s.dataset.src,
      vertical: s.hasAttribute('data-vertical'),
      tag: textOf(s.querySelector('.shot__tag')),
      cap: textOf(s.querySelector('.shot__cap')),
    }));
  }

  async function loadGallery() {
    try {
      const saved = (await api('/api/admin/content')).gallery;
      gallery = saved?.length ? saved : await siteGallery();
      renderGallery();
    } catch (e) { toast(e.message, true); }
  }
  function renderGallery() {
    $('#gallery').innerHTML = gallery.length ? gallery.map((it, i) => `
      <div class="gitem" data-i="${i}">
        <img class="gitem__thumb" src="${esc(thumb(it))}" alt="" loading="lazy">
        <div class="gitem__fields">
          <div class="gitem__type">${it.type === 'youtube' ? `Видео YouTube${it.vertical ? ' (Shorts)' : ''} · ${esc(it.src)}` : 'Фото'}</div>
          <div class="gitem__row"><span>Метка</span>${LANGS.map(l => `<input data-f="tag" data-lang="${l}" placeholder="${LANG_NAMES[l]}" value="${esc(it.tag?.[l])}">`).join('')}</div>
          <div class="gitem__row"><span>Подпись</span>${LANGS.map(l => `<input data-f="cap" data-lang="${l}" placeholder="${LANG_NAMES[l]}" value="${esc(it.cap?.[l])}">`).join('')}</div>
        </div>
        <div class="gitem__tools">
          <button data-act="up" title="Выше">↑</button><button data-act="down" title="Ниже">↓</button><button class="del" data-act="del" title="Удалить">×</button>
        </div>
      </div>`).join('') : '<div class="empty">В галерее пусто — добавьте фото или видео.</div>';
  }
  $('#gallery').addEventListener('input', e => {
    const i = +e.target.closest('.gitem')?.dataset.i, f = e.target.dataset.f;
    if (!f) return;
    gallery[i][f] = { ...tri(gallery[i][f]), [e.target.dataset.lang]: e.target.value };
  });
  $('#gallery').addEventListener('click', e => {
    const act = e.target.dataset.act; if (!act) return;
    const i = +e.target.closest('.gitem').dataset.i;
    if (act === 'del' && !confirm('Убрать этот элемент из галереи?')) return;
    if (act === 'del') gallery.splice(i, 1);
    if (act === 'up' && i > 0) [gallery[i - 1], gallery[i]] = [gallery[i], gallery[i - 1]];
    if (act === 'down' && i < gallery.length - 1) [gallery[i + 1], gallery[i]] = [gallery[i], gallery[i + 1]];
    renderGallery();
  });

  // shrink a photo in the browser to ≤1600px JPEG before uploading
  const shrink = file => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', .84));
    };
    img.onerror = () => reject(new Error('Не удалось прочитать фото'));
    img.src = URL.createObjectURL(file);
  });
  $('#photoInput').addEventListener('change', async e => {
    const files = [...e.target.files]; e.target.value = '';
    for (const file of files) {
      try {
        toast(`Загружаю ${file.name}…`);
        const data = await shrink(file);
        const { url } = await api('/api/admin/upload', { method: 'POST', body: JSON.stringify({ name: file.name.replace(/\.\w+$/, '') + '.jpg', data }) });
        gallery.unshift({ type: 'image', src: url, vertical: false, tag: tri({ ru: 'Key Man', en: 'Key Man', uk: 'Key Man' }), cap: tri() });
        renderGallery();
      } catch (x) { toast(x.message, true); }
    }
    if (files.length) toast('Фото добавлены. Впишите подписи и нажмите «Сохранить».');
  });
  $('#ytAdd').addEventListener('click', () => {
    const input = prompt('Ссылка на видео YouTube или Shorts:');
    if (!input) return;
    const m = input.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/) || input.match(/^([\w-]{11})$/);
    if (!m) return toast('Не похоже на ссылку YouTube', true);
    gallery.unshift({ type: 'youtube', src: m[1], vertical: /shorts\//.test(input) || confirm('Это вертикальное видео (Shorts)?'), tag: tri({ ru: 'Видео', en: 'Video', uk: 'Відео' }), cap: tri() });
    renderGallery();
  });
  $('#gallerySave').addEventListener('click', async () => {
    try { await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ gallery }) }); toast('Галерея сохранена. На сайте — в течение минуты.'); }
    catch (e) { toast(e.message, true); }
  });
  $('#galleryReset').addEventListener('click', async () => {
    if (!confirm('Вернуть галерею, встроенную в сайт? Ваши изменения галереи пропадут.')) return;
    try { await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ gallery: null }) }); gallery = await siteGallery(); renderGallery(); toast('Исходная галерея возвращена'); }
    catch (e) { toast(e.message, true); }
  });

  /* ================= settings ================= */
  async function loadStatus() {
    try {
      const s = await api('/api/admin/status');
      const row = (title, ok, text) => `<div class="stat"><b>${title}</b><span class="${ok ? 'ok' : 'bad'}">${text}</span></div>`;
      $('#status').innerHTML = [
        row('Хранилище (заявки, тексты, фото)', s.storage !== 'missing', s.storage === 'blob' ? 'Подключено (Vercel Blob, приватное)' : s.storage === 'missing' ? 'Не подключено' : 'Локальный режим (память)'),
        row('Уведомления в Telegram', s.telegram, s.telegram ? 'Включены' : 'Не настроены'),
        row('Свой пароль админки', s.password, s.password ? 'Задан' : 'Не задан'),
      ].join('');
    } catch (e) { toast(e.message, true); }
  }

  /* ================= start ================= */
  api('/api/admin/login').then(r => (r.admin ? showApp() : showLogin())).catch(showLogin);
})();
