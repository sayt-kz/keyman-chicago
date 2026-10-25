/* Key Man admin panel: leads, site texts (RU/EN/UA), gallery, settings. Talks to /api/admin/*.
   The panel itself can be shown in Russian, English or Ukrainian (switcher in the sidebar / login card). */
(() => {
  const $ = s => document.querySelector(s);
  const LANGS = ['ru', 'en', 'uk'];
  const LANG_NAMES = { ru: 'RU', en: 'EN', uk: 'UA' };
  const DEFAULTS = window.kmLang?.defaults || {};

  /* ================= interface language ================= */
  // key: [ru, en, uk]
  const A = {
    title: ['Key Man — админ-панель', 'Key Man — admin panel', 'Key Man — адмін-панель'],
    panel: ['админ-панель', 'admin panel', 'адмін-панель'],
    password: ['Пароль', 'Password', 'Пароль'],
    signIn: ['Войти', 'Sign in', 'Увійти'],
    badPass: ['Неверный пароль', 'Wrong password', 'Невірний пароль'],
    tooMany: ['Слишком много попыток, попробуйте через 15 минут', 'Too many attempts, try again in 15 minutes', 'Забагато спроб, спробуйте через 15 хвилин'],
    relogin: ['Нужно войти заново', 'Please sign in again', 'Потрібно увійти знову'],
    error: ['Ошибка', 'Error', 'Помилка'],
    navLeads: ['Заявки', 'Requests', 'Заявки'],
    navTexts: ['Тексты сайта', 'Site texts', 'Тексти сайту'],
    navGallery: ['Галерея', 'Gallery', 'Галерея'],
    navSettings: ['Настройки', 'Settings', 'Налаштування'],
    openSite: ['Открыть сайт ↗', 'Open site ↗', 'Відкрити сайт ↗'],
    logout: ['Выйти', 'Sign out', 'Вийти'],
    leadsHint: ['Из формы на сайте, чата и «Быстрой заявки». Обновляются каждую минуту.', 'From the site form, the chat and “Quick request”. Refreshed every minute.', 'З форми на сайті, чату та «Швидкої заявки». Оновлюються щохвилини.'],
    refresh: ['Обновить', 'Refresh', 'Оновити'],
    csv: ['Скачать CSV', 'Download CSV', 'Завантажити CSV'],
    fAll: ['Все', 'All', 'Усі'],
    fNew: ['Новые', 'New', 'Нові'],
    st_new: ['Новая', 'New', 'Нова'],
    st_work: ['В работе', 'In progress', 'В роботі'],
    st_done: ['Выполнено', 'Done', 'Виконано'],
    st_spam: ['Спам', 'Spam', 'Спам'],
    src_form: ['Форма на сайте', 'Site form', 'Форма на сайті'],
    src_chat: ['Чат-бот', 'Chat bot', 'Чат-бот'],
    src_widget: ['Быстрая заявка', 'Quick request', 'Швидка заявка'],
    chicago: ['Чикаго', 'Chicago', 'Чикаго'],
    noName: ['Без имени', 'No name', 'Без імені'],
    lService: ['Услуга:', 'Service:', 'Послуга:'],
    lVehicle: ['Авто:', 'Vehicle:', 'Авто:'],
    lWhere: ['Где:', 'Location:', 'Де:'],
    delete: ['Удалить', 'Delete', 'Видалити'],
    notePh: ['Заметка мастера…', 'Technician note…', 'Нотатка майстра…'],
    emptyFilter: ['В этом разделе пусто', 'Nothing here', 'У цьому розділі порожньо'],
    emptyLeads: ['Заявок пока нет. Они появятся здесь, когда клиенты отправят форму на сайте или в чате.', 'No requests yet. They will appear here when customers send the form on the site or in the chat.', 'Заявок поки немає. Вони зʼявляться тут, коли клієнти надішлють форму на сайті або в чаті.'],
    statusSaved: ['Статус обновлён', 'Status updated', 'Статус оновлено'],
    noteSaved: ['Заметка сохранена', 'Note saved', 'Нотатку збережено'],
    confirmDelLead: ['Удалить заявку навсегда?', 'Delete this request permanently?', 'Видалити заявку назавжди?'],
    leadDeleted: ['Заявка удалена', 'Request deleted', 'Заявку видалено'],
    textsHint: ['Русский, английский и украинский. Изменённые поля подсвечены; пустое поле = текст по умолчанию.', 'Russian, English and Ukrainian. Changed fields are highlighted; an empty field = the default text.', 'Російська, англійська та українська. Змінені поля підсвічено; порожнє поле = текст за замовчуванням.'],
    search: ['Поиск по тексту…', 'Search texts…', 'Пошук за текстом…'],
    save: ['Сохранить', 'Save', 'Зберегти'],
    resetText: ['Вернуть текст по умолчанию', 'Restore the default text', 'Повернути текст за замовчуванням'],
    textsSaved: ['Сохранено. Изменённых текстов: {n}. На сайте — в течение минуты.', 'Saved. Changed texts: {n}. Live on the site within a minute.', 'Збережено. Змінених текстів: {n}. На сайті — протягом хвилини.'],
    galleryTitle: ['Галерея «Реальные выезды»', 'Gallery “Real jobs”', 'Галерея «Реальні виїзди»'],
    galleryHint: ['Фото и видео с YouTube. Порядок — как на сайте. Не забудьте нажать «Сохранить».', 'Photos and YouTube videos. The order is the same as on the site. Don’t forget to press “Save”.', 'Фото та відео з YouTube. Порядок — як на сайті. Не забудьте натиснути «Зберегти».'],
    addPhoto: ['Добавить фото', 'Add photos', 'Додати фото'],
    addVideo: ['Добавить видео YouTube', 'Add a YouTube video', 'Додати відео YouTube'],
    galleryReset: ['Вернуть исходную галерею сайта', 'Restore the site’s original gallery', 'Повернути початкову галерею сайту'],
    gPhoto: ['Фото', 'Photo', 'Фото'],
    gVideo: ['Видео YouTube', 'YouTube video', 'Відео YouTube'],
    gTag: ['Метка', 'Label', 'Мітка'],
    gCap: ['Подпись', 'Caption', 'Підпис'],
    up: ['Выше', 'Move up', 'Вище'],
    down: ['Ниже', 'Move down', 'Нижче'],
    confirmDelItem: ['Убрать этот элемент из галереи?', 'Remove this item from the gallery?', 'Прибрати цей елемент з галереї?'],
    emptyGallery: ['В галерее пусто — добавьте фото или видео.', 'The gallery is empty — add photos or videos.', 'Галерея порожня — додайте фото або відео.'],
    readFail: ['Не удалось прочитать фото', 'Could not read the photo', 'Не вдалося прочитати фото'],
    uploading: ['Загружаю {name}…', 'Uploading {name}…', 'Завантажую {name}…'],
    photosAdded: ['Фото добавлены. Впишите подписи и нажмите «Сохранить».', 'Photos added. Fill in the captions and press “Save”.', 'Фото додано. Впишіть підписи й натисніть «Зберегти».'],
    ytPrompt: ['Ссылка на видео YouTube или Shorts:', 'Link to a YouTube video or Short:', 'Посилання на відео YouTube або Shorts:'],
    ytBad: ['Не похоже на ссылку YouTube', 'That doesn’t look like a YouTube link', 'Не схоже на посилання YouTube'],
    ytVertical: ['Это вертикальное видео (Shorts)?', 'Is this a vertical video (Short)?', 'Це вертикальне відео (Shorts)?'],
    ytTag: ['Видео', 'Video', 'Відео'],
    gallerySaved: ['Галерея сохранена. На сайте — в течение минуты.', 'Gallery saved. Live on the site within a minute.', 'Галерею збережено. На сайті — протягом хвилини.'],
    confirmReset: ['Вернуть галерею, встроенную в сайт? Ваши изменения галереи пропадут.', 'Restore the gallery built into the site? Your gallery changes will be lost.', 'Повернути галерею, вбудовану в сайт? Ваші зміни галереї зникнуть.'],
    resetDone: ['Исходная галерея возвращена', 'Original gallery restored', 'Початкову галерею повернуто'],
    settingsHint: ['Что подключено на сервере (Vercel → Settings → Environment Variables / Storage).', 'What is connected on the server (Vercel → Settings → Environment Variables / Storage).', 'Що підключено на сервері (Vercel → Settings → Environment Variables / Storage).'],
    howTo: ['Как подключить', 'How to connect', 'Як підключити'],
    howToList: [
      '<li><b>Хранилище</b> — Vercel → Storage → Blob (Private) → Connect к проекту. В нём лежат заявки, тексты и фото.</li><li><b>Пароль админки</b> — переменная <code>ADMIN_PASSWORD</code>.</li><li><b>Уведомления в Telegram</b> — создайте бота у @BotFather, добавьте переменные <code>TELEGRAM_BOT_TOKEN</code> и <code>TELEGRAM_CHAT_ID</code>.</li><li>После изменения переменных — Deployments → Redeploy.</li>',
      '<li><b>Storage</b> — Vercel → Storage → Blob (Private) → Connect to the project. It holds requests, texts and photos.</li><li><b>Admin password</b> — the <code>ADMIN_PASSWORD</code> variable.</li><li><b>Telegram notifications</b> — create a bot with @BotFather, add the <code>TELEGRAM_BOT_TOKEN</code> and <code>TELEGRAM_CHAT_ID</code> variables.</li><li>After changing variables — Deployments → Redeploy.</li>',
      '<li><b>Сховище</b> — Vercel → Storage → Blob (Private) → Connect до проєкту. У ньому зберігаються заявки, тексти та фото.</li><li><b>Пароль адмінки</b> — змінна <code>ADMIN_PASSWORD</code>.</li><li><b>Сповіщення в Telegram</b> — створіть бота в @BotFather, додайте змінні <code>TELEGRAM_BOT_TOKEN</code> і <code>TELEGRAM_CHAT_ID</code>.</li><li>Після зміни змінних — Deployments → Redeploy.</li>',
    ],
    sStorage: ['Хранилище (заявки, тексты, фото)', 'Storage (requests, texts, photos)', 'Сховище (заявки, тексти, фото)'],
    sStorageOk: ['Подключено (Vercel Blob, приватное)', 'Connected (Vercel Blob, private)', 'Підключено (Vercel Blob, приватне)'],
    sMissing: ['Не подключено', 'Not connected', 'Не підключено'],
    sLocal: ['Локальный режим (память)', 'Local mode (memory)', 'Локальний режим (памʼять)'],
    sTelegram: ['Уведомления в Telegram', 'Telegram notifications', 'Сповіщення в Telegram'],
    sOn: ['Включены', 'On', 'Увімкнено'],
    sOff: ['Не настроены', 'Not set up', 'Не налаштовано'],
    sPassword: ['Свой пароль админки', 'Own admin password', 'Власний пароль адмінки'],
    sSet: ['Задан', 'Set', 'Задано'],
    sNotSet: ['Не задан', 'Not set', 'Не задано'],
    g_nav: ['Меню и кнопки', 'Menu and buttons', 'Меню та кнопки'], g_hero: ['Главный экран', 'Hero', 'Головний екран'],
    g_badge: ['Плашки у фургона', 'Van badges', 'Плашки біля фургона'], g_brands: ['Марки', 'Brands', 'Марки'],
    g_work: ['Галерея (заголовки)', 'Gallery (headings)', 'Галерея (заголовки)'], g_shot: ['Галерея — видео', 'Gallery — videos', 'Галерея — відео'],
    g_ph: ['Галерея — фото', 'Gallery — photos', 'Галерея — фото'], g_sv: ['Услуги', 'Services', 'Послуги'],
    g_how: ['Как мы работаем', 'How it works', 'Як ми працюємо'], g_why: ['Почему мы', 'Why us', 'Чому ми'],
    g_unit: ['Единицы', 'Units', 'Одиниці'], g_ac: ['Академия', 'Academy', 'Академія'], g_so: ['Соцсети', 'Social', 'Соцмережі'],
    g_faq: ['Вопросы и ответы', 'FAQ', 'Питання та відповіді'], g_ct: ['Контакты', 'Contacts', 'Контакти'],
    g_fm: ['Форма заявки', 'Request form', 'Форма заявки'], g_ai: ['Чат-виджет', 'Chat widget', 'Чат-віджет'],
    g_ft: ['Подвал', 'Footer', 'Підвал'], g_cb: ['Нижняя панель (телефон)', 'Bottom bar (phone)', 'Нижня панель (телефон)'],
  };
  const storage = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
  let ui = LANGS.includes(storage.get('km-admin-lang')) ? storage.get('km-admin-lang') : 'ru';
  const t = (key, vars = {}) => (A[key]?.[LANGS.indexOf(ui)] ?? A[key]?.[0] ?? key).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');

  // the switcher appears on the login card and in the sidebar
  document.querySelectorAll('.lang-slot').forEach(slot => slot.append($('#langTpl').content.cloneNode(true)));
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ui-lang]');
    if (b) setUi(b.dataset.uiLang);
  });
  function applyUi() {
    document.documentElement.lang = ui;
    document.title = t('title');
    document.querySelectorAll('[data-a]').forEach(el => { el.innerHTML = t(el.dataset.a); });
    document.querySelectorAll('[data-a-ph]').forEach(el => { el.placeholder = t(el.dataset.aPh); });
    document.querySelectorAll('[data-ui-lang]').forEach(b => b.classList.toggle('is-active', b.dataset.uiLang === ui));
  }
  function setUi(lang) {
    if (!LANGS.includes(lang)) return;
    ui = lang; storage.set('km-admin-lang', lang);
    applyUi();
    // re-render what is on screen
    if (!$('#app').hidden) {
      renderLeads();
      const active = document.querySelector('.side__nav .is-active')?.dataset.view;
      if (active === 'texts') renderTexts();
      if (active === 'gallery') renderGallery();
      if (active === 'settings') loadStatus();
    }
  }

  /* ================= helpers ================= */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (text, err = false) => {
    const el = $('#toast');
    el.textContent = text; el.className = 'toast' + (err ? ' is-err' : ''); el.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, 3200);
  };
  const api = async (url, opts = {}) => {
    const r = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opts });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && !url.endsWith('/login')) { showLogin(); throw new Error(t('relogin')); }
    if (!r.ok) throw Object.assign(new Error(data.error || `${t('error')} ${r.status}`), { status: r.status });
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
    } catch (x) {
      err.textContent = x.status === 401 ? t('badPass') : x.status === 429 ? t('tooMany') : x.message;
      err.hidden = false;
    }
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
  const STATUSES = ['new', 'work', 'done', 'spam'];
  const locale = () => ({ ru: 'ru-RU', en: 'en-US', uk: 'uk-UA' }[ui]);
  const fmt = ts => new Date(ts).toLocaleString(locale(), { timeZone: 'America/Chicago', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ` (${t('chicago')})`;

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
          <span class="lead__name">${esc(l.name || t('noName'))}</span>
          <a class="lead__phone" href="tel:${esc(l.phone.replace(/[^\d+]/g, ''))}">${esc(l.phone)}</a>
          <span class="lead__meta">${fmt(l.ts)} · ${esc(A['src_' + l.source] ? t('src_' + l.source) : l.source)}${l.lang ? ' · ' + esc(LANG_NAMES[l.lang] || l.lang) : ''}</span>
        </div>
        <div class="lead__body">
          ${l.service ? `<div><b>${t('lService')}</b> ${esc(l.service)}</div>` : ''}
          ${l.vehicle ? `<div><b>${t('lVehicle')}</b> ${esc(l.vehicle)}</div>` : ''}
          ${l.location ? `<div><b>${t('lWhere')}</b> ${esc(l.location)}</div>` : ''}
          ${l.email ? `<div><b>Email:</b> ${esc(l.email)}</div>` : ''}
          ${l.message ? `<div class="lead__msg">${esc(l.message)}</div>` : ''}
        </div>
        <div class="lead__side">
          <select data-act="status">${STATUSES.map(k => `<option value="${k}"${k === l.status ? ' selected' : ''}>${t('st_' + k)}</option>`).join('')}</select>
          <button class="btn btn--danger" data-act="del">${t('delete')}</button>
        </div>
        <div class="lead__note"><textarea data-act="note" placeholder="${esc(t('notePh'))}">${esc(l.note || '')}</textarea></div>
      </article>`).join('') : `<div class="empty">${leads.length ? t('emptyFilter') : t('emptyLeads')}</div>`;
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
      if (e.target.dataset.act === 'status') { lead.status = e.target.value; await api('/api/admin/leads', { method: 'PATCH', body: JSON.stringify({ id, status: lead.status }) }); renderLeads(); toast(t('statusSaved')); }
      if (e.target.dataset.act === 'note') { lead.note = e.target.value; await api('/api/admin/leads', { method: 'PATCH', body: JSON.stringify({ id, note: lead.note }) }); toast(t('noteSaved')); }
    } catch (x) { toast(x.message, true); }
  });
  $('#leads').addEventListener('click', async e => {
    if (e.target.dataset.act !== 'del') return;
    const id = e.target.closest('.lead').dataset.id;
    if (!confirm(t('confirmDelLead'))) return;
    try { await api('/api/admin/leads?id=' + encodeURIComponent(id), { method: 'DELETE' }); leads = leads.filter(l => l.id !== id); renderLeads(); toast(t('leadDeleted')); }
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
  const GROUPS = ['nav', 'hero', 'badge', 'brands', 'work', 'shot', 'ph', 'sv', 'how', 'why', 'unit', 'ac', 'so', 'faq', 'ct', 'fm', 'ai', 'ft', 'cb'];
  let overrides = {};
  const value = (key, l) => overrides[key]?.[l] || DEFAULTS[key]?.[l] || '';
  const collectTexts = () => {
    // keep what is typed in the editor when it is re-rendered (e.g. after switching the interface language)
    document.querySelectorAll('.trow').forEach(row => {
      const k = row.dataset.key, val = {};
      LANGS.forEach(l => { const v = row.querySelector(`[data-lang=${l}]`).value; val[l] = v === (DEFAULTS[k]?.[l] || '') ? '' : v; });
      if (LANGS.some(l => val[l])) overrides[k] = val; else delete overrides[k];
    });
  };

  async function loadTexts() {
    try { overrides = (await api('/api/admin/content')).texts || {}; renderTexts(true); }
    catch (e) { toast(e.message, true); }
  }
  function renderTexts(fresh = false) {
    if (!fresh) collectTexts();
    const keys = Object.keys(DEFAULTS);
    $('#texts').innerHTML = GROUPS.map(prefix => {
      const ks = keys.filter(k => k.split('.')[0] === prefix);
      if (!ks.length) return '';
      return `<details class="tgroup" ${prefix === 'hero' ? 'open' : ''}><summary>${t('g_' + prefix)} <small class="muted">(${ks.length})</small></summary>
        ${ks.map(k => `<div class="trow${overrides[k] ? ' is-changed' : ''}" data-key="${esc(k)}">
          <div class="trow__key">${esc(k)}</div>
          ${LANGS.map(l => `<label>${LANG_NAMES[l]}<textarea data-lang="${l}" rows="${(DEFAULTS[k]?.[l] || '').length > 70 ? 3 : 1}">${esc(value(k, l))}</textarea></label>`).join('')}
          <button class="trow__reset" title="${esc(t('resetText'))}">↺</button>
        </div>`).join('')}</details>`;
    }).join('');
  }
  $('#texts').addEventListener('input', e => {
    const row = e.target.closest('.trow'); if (!row) return;
    const k = row.dataset.key;
    row.classList.toggle('is-changed', LANGS.some(l => row.querySelector(`[data-lang=${l}]`).value !== (DEFAULTS[k]?.[l] || '')));
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
      row.hidden = !(!q || row.dataset.key.includes(q) || [...row.querySelectorAll('textarea')].some(x => x.value.toLowerCase().includes(q)));
    });
    if (q) document.querySelectorAll('.tgroup').forEach(g => { g.open = !!g.querySelector('.trow:not([hidden])'); });
  });
  $('#textsSave').addEventListener('click', async () => {
    collectTexts();
    try { await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ texts: overrides }) }); toast(t('textsSaved', { n: Object.keys(overrides).length })); }
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
          <div class="gitem__type">${it.type === 'youtube' ? `${t('gVideo')}${it.vertical ? ' (Shorts)' : ''} · ${esc(it.src)}` : t('gPhoto')}</div>
          <div class="gitem__row"><span>${t('gTag')}</span>${LANGS.map(l => `<input data-f="tag" data-lang="${l}" placeholder="${LANG_NAMES[l]}" value="${esc(it.tag?.[l])}">`).join('')}</div>
          <div class="gitem__row"><span>${t('gCap')}</span>${LANGS.map(l => `<input data-f="cap" data-lang="${l}" placeholder="${LANG_NAMES[l]}" value="${esc(it.cap?.[l])}">`).join('')}</div>
        </div>
        <div class="gitem__tools">
          <button data-act="up" title="${esc(t('up'))}">↑</button><button data-act="down" title="${esc(t('down'))}">↓</button><button class="del" data-act="del" title="${esc(t('delete'))}">×</button>
        </div>
      </div>`).join('') : `<div class="empty">${t('emptyGallery')}</div>`;
  }
  $('#gallery').addEventListener('input', e => {
    const i = +e.target.closest('.gitem')?.dataset.i, f = e.target.dataset.f;
    if (!f) return;
    gallery[i][f] = { ...tri(gallery[i][f]), [e.target.dataset.lang]: e.target.value };
  });
  $('#gallery').addEventListener('click', e => {
    const act = e.target.dataset.act; if (!act) return;
    const i = +e.target.closest('.gitem').dataset.i;
    if (act === 'del' && !confirm(t('confirmDelItem'))) return;
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
    img.onerror = () => reject(new Error(t('readFail')));
    img.src = URL.createObjectURL(file);
  });
  $('#photoInput').addEventListener('change', async e => {
    const files = [...e.target.files]; e.target.value = '';
    for (const file of files) {
      try {
        toast(t('uploading', { name: file.name }));
        const data = await shrink(file);
        const { url } = await api('/api/admin/upload', { method: 'POST', body: JSON.stringify({ name: file.name.replace(/\.\w+$/, '') + '.jpg', data }) });
        gallery.unshift({ type: 'image', src: url, vertical: false, tag: tri({ ru: 'Key Man', en: 'Key Man', uk: 'Key Man' }), cap: tri() });
        renderGallery();
      } catch (x) { toast(x.message, true); }
    }
    if (files.length) toast(t('photosAdded'));
  });
  $('#ytAdd').addEventListener('click', () => {
    const input = prompt(t('ytPrompt'));
    if (!input) return;
    const m = input.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/) || input.match(/^([\w-]{11})$/);
    if (!m) return toast(t('ytBad'), true);
    gallery.unshift({ type: 'youtube', src: m[1], vertical: /shorts\//.test(input) || confirm(t('ytVertical')), tag: tri({ ru: A.ytTag[0], en: A.ytTag[1], uk: A.ytTag[2] }), cap: tri() });
    renderGallery();
  });
  $('#gallerySave').addEventListener('click', async () => {
    try { await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ gallery }) }); toast(t('gallerySaved')); }
    catch (e) { toast(e.message, true); }
  });
  $('#galleryReset').addEventListener('click', async () => {
    if (!confirm(t('confirmReset'))) return;
    try { await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ gallery: null }) }); gallery = await siteGallery(); renderGallery(); toast(t('resetDone')); }
    catch (e) { toast(e.message, true); }
  });

  /* ================= settings ================= */
  async function loadStatus() {
    try {
      const s = await api('/api/admin/status');
      const row = (title, ok, text) => `<div class="stat"><b>${title}</b><span class="${ok ? 'ok' : 'bad'}">${text}</span></div>`;
      $('#status').innerHTML = [
        row(t('sStorage'), s.storage !== 'missing', s.storage === 'blob' ? t('sStorageOk') : s.storage === 'missing' ? t('sMissing') : t('sLocal')),
        row(t('sTelegram'), s.telegram, s.telegram ? t('sOn') : t('sOff')),
        row(t('sPassword'), s.password, s.password ? t('sSet') : t('sNotSet')),
      ].join('');
    } catch (e) { toast(e.message, true); }
  }

  /* ================= start ================= */
  applyUi();
  api('/api/admin/login').then(r => (r.admin ? showApp() : showLogin())).catch(showLogin);
})();
