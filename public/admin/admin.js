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
      '<li><b>Хранилище</b> — Vercel → Storage → Blob (Private) → Connect к проекту. В нём лежат заявки, тексты и фото.</li><li><b>Пароль админки</b> — переменная <code>ADMIN_PASSWORD</code>.</li><li><b>Уведомления в Telegram</b> — создайте бота у @BotFather, добавьте переменные <code>TELEGRAM_BOT_TOKEN</code> и <code>TELEGRAM_CHAT_ID</code>.</li><li><b>Оплата курсов</b> — аккаунт на stripe.com → Developers → API keys → Secret key, переменная <code>STRIPE_SECRET_KEY</code>. Без неё курс можно открыть ученику вручную в разделе «Ученики».</li><li>После изменения переменных — Deployments → Redeploy.</li>',
      '<li><b>Storage</b> — Vercel → Storage → Blob (Private) → Connect to the project. It holds requests, texts and photos.</li><li><b>Admin password</b> — the <code>ADMIN_PASSWORD</code> variable.</li><li><b>Telegram notifications</b> — create a bot with @BotFather, add the <code>TELEGRAM_BOT_TOKEN</code> and <code>TELEGRAM_CHAT_ID</code> variables.</li><li><b>Course payments</b> — a stripe.com account → Developers → API keys → Secret key, the <code>STRIPE_SECRET_KEY</code> variable. Without it you can open a course for a student by hand in “Students”.</li><li>After changing variables — Deployments → Redeploy.</li>',
      '<li><b>Сховище</b> — Vercel → Storage → Blob (Private) → Connect до проєкту. У ньому зберігаються заявки, тексти та фото.</li><li><b>Пароль адмінки</b> — змінна <code>ADMIN_PASSWORD</code>.</li><li><b>Сповіщення в Telegram</b> — створіть бота в @BotFather, додайте змінні <code>TELEGRAM_BOT_TOKEN</code> і <code>TELEGRAM_CHAT_ID</code>.</li><li><b>Оплата курсів</b> — акаунт на stripe.com → Developers → API keys → Secret key, змінна <code>STRIPE_SECRET_KEY</code>. Без неї курс можна відкрити учню вручну в розділі «Учні».</li><li>Після зміни змінних — Deployments → Redeploy.</li>',
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
    navCourses: ['Курсы', 'Courses', 'Курси'],
    navStudents: ['Ученики', 'Students', 'Учні'],
    coursesHint: ['Видеокурсы Академии: уроки, видео, цена. Черновик не виден на сайте, пока не отмечено «Опубликован».', 'Academy video courses: lessons, videos, price. A draft is hidden on the site until “Published” is ticked.', 'Відеокурси Академії: уроки, відео, ціна. Чернетку не видно на сайті, доки не позначено «Опубліковано».'],
    courseSeed: ['Создать 3 курса Академии', 'Create the 3 Academy courses', 'Створити 3 курси Академії'],
    courseNew: ['Новый курс', 'New course', 'Новий курс'],
    cSeeded: ['Созданы черновики: Start Pack, PRO Master, True Expert. Укажите цены и добавьте уроки.', 'Drafts created: Start Pack, PRO Master, True Expert. Set prices and add lessons.', 'Створено чернетки: Start Pack, PRO Master, True Expert. Вкажіть ціни й додайте уроки.'],
    cFree: ['бесплатно', 'free', 'безкоштовно'],
    cPublished: ['Опубликован', 'Published', 'Опубліковано'],
    cPublishedLong: ['Опубликован — виден на сайте и доступен для покупки', 'Published — shown on the site and available to buy', 'Опубліковано — видно на сайті й доступно для покупки'],
    cDraft: ['Черновик', 'Draft', 'Чернетка'],
    cLessonsN: ['уроков: {n}', 'lessons: {n}', 'уроків: {n}'],
    cEdit: ['Редактировать', 'Edit', 'Редагувати'],
    cEmpty: ['Курсов пока нет. Нажмите «Новый курс» или «Создать 3 курса Академии».', 'No courses yet. Press “New course” or “Create the 3 Academy courses”.', 'Курсів поки немає. Натисніть «Новий курс» або «Створити 3 курси Академії».'],
    cBack: ['← Все курсы', '← All courses', '← Усі курси'],
    cOpen: ['Открыть на сайте ↗', 'Open on the site ↗', 'Відкрити на сайті ↗'],
    cMain: ['Основное', 'Main', 'Основне'],
    cSlug: ['Адрес (латиница)', 'URL name (latin)', 'Адреса (латиниця)'],
    cSlugBad: ['Адрес курса: латиница, цифры и дефис, например pro-master', 'Course URL name: latin letters, digits and dashes, e.g. pro-master', 'Адреса курсу: латиниця, цифри й дефіс, наприклад pro-master'],
    cSlugTaken: ['Курс с таким адресом уже есть', 'A course with this URL name already exists', 'Курс із такою адресою вже є'],
    cPrice: ['Цена, $', 'Price, $', 'Ціна, $'],
    cLevel: ['Уровень (метка)', 'Level (label)', 'Рівень (мітка)'],
    cOrder: ['Порядок в каталоге', 'Order in the catalog', 'Порядок у каталозі'],
    cTitle: ['Название', 'Title', 'Назва'],
    cDesc: ['Описание', 'Description', 'Опис'],
    cCover: ['Обложка', 'Cover', 'Обкладинка'],
    cNoCover: ['Нет обложки', 'No cover', 'Немає обкладинки'],
    cCoverUp: ['Загрузить обложку', 'Upload a cover', 'Завантажити обкладинку'],
    cCoverDel: ['Убрать обложку', 'Remove the cover', 'Прибрати обкладинку'],
    cCoverOk: ['Обложка загружена — нажмите «Сохранить»', 'Cover uploaded — press “Save”', 'Обкладинку завантажено — натисніть «Зберегти»'],
    cLessons: ['Уроки', 'Lessons', 'Уроки'],
    cAddLesson: ['Добавить урок', 'Add a lesson', 'Додати урок'],
    cVideoHint: ['Видео: MP4 (H.264) — лучше всего для всех телефонов, до 5 ГБ. Видео хранится закрыто: ученик получает временную ссылку, только если купил курс. «Бесплатно» — урок можно смотреть без покупки (пробный).', 'Video: MP4 (H.264) works best on every phone, up to 5 GB. Videos are private: a student gets a temporary link only after buying the course. “Free” — the lesson can be watched without buying (preview).', 'Відео: MP4 (H.264) — найкраще для всіх телефонів, до 5 ГБ. Відео зберігається закрито: учень отримує тимчасове посилання, лише якщо купив курс. «Безкоштовно» — урок можна дивитися без покупки (пробний).'],
    cLessonTitle: ['Название урока', 'Lesson title', 'Назва уроку'],
    cLessonDesc: ['Описание урока', 'Lesson description', 'Опис уроку'],
    cDuration: ['Длительность', 'Duration', 'Тривалість'],
    cFreeLesson: ['Бесплатно (пробный)', 'Free (preview)', 'Безкоштовно (пробний)'],
    cVideoOk: ['Видео загружено', 'Video uploaded', 'Відео завантажено'],
    cNoVideo: ['Видео нет', 'No video', 'Відео немає'],
    cVideoUp: ['Загрузить видео', 'Upload video', 'Завантажити відео'],
    cVideoReplace: ['Заменить видео', 'Replace video', 'Замінити відео'],
    cVideoDel: ['Удалить видео', 'Delete video', 'Видалити відео'],
    cPreview: ['Посмотреть', 'Preview', 'Переглянути'],
    cVideoUploaded: ['Видео загружено и сохранено в уроке', 'Video uploaded and saved to the lesson', 'Відео завантажено й збережено в уроці'],
    cNoLessons: ['Уроков пока нет — нажмите «Добавить урок».', 'No lessons yet — press “Add a lesson”.', 'Уроків поки немає — натисніть «Додати урок».'],
    cSaved: ['Курс сохранён', 'Course saved', 'Курс збережено'],
    cConfirmDel: ['Удалить курс? Ученики потеряют к нему доступ.', 'Delete the course? Students will lose access to it.', 'Видалити курс? Учні втратять до нього доступ.'],
    cDeleted: ['Курс удалён', 'Course deleted', 'Курс видалено'],
    cConfirmLessonDel: ['Удалить урок вместе с видео?', 'Delete the lesson together with its video?', 'Видалити урок разом із відео?'],
    cConfirmVideoDel: ['Удалить видео этого урока?', 'Delete this lesson’s video?', 'Видалити відео цього уроку?'],
    studentsHint: ['Аккаунты учеников. Здесь можно открыть курс вручную (например, оплата наличными) и задать новый пароль.', 'Student accounts. Open a course by hand here (e.g. paid in cash) and set a new password.', 'Акаунти учнів. Тут можна відкрити курс вручну (наприклад, оплата готівкою) і задати новий пароль.'],
    studentSearch: ['Поиск: имя, email, телефон…', 'Search: name, email, phone…', 'Пошук: імʼя, email, телефон…'],
    studentNew: ['Добавить ученика', 'Add a student', 'Додати учня'],
    orders: ['Оплаты', 'Payments', 'Оплати'],
    sSince: ['с', 'since', 'з'],
    sNoCourses: ['нет курсов', 'no courses', 'немає курсів'],
    sGrant: ['+ Открыть курс…', '+ Open a course…', '+ Відкрити курс…'],
    sRevoke: ['Закрыть доступ', 'Remove access', 'Закрити доступ'],
    sNewPw: ['Новый пароль', 'New password', 'Новий пароль'],
    sEmpty: ['Учеников пока нет. Они появятся после регистрации на сайте (страница «Кабинет»).', 'No students yet. They appear after signing up on the site (“My account” page).', 'Учнів поки немає. Вони зʼявляться після реєстрації на сайті (сторінка «Кабінет»).'],
    oDate: ['Дата', 'Date', 'Дата'],
    oCourse: ['Курс', 'Course', 'Курс'],
    oSum: ['Сумма', 'Amount', 'Сума'],
    oEmpty: ['Онлайн-оплат пока нет.', 'No online payments yet.', 'Онлайн-оплат поки немає.'],
    sGranted: ['Курс открыт ученику', 'Course opened for the student', 'Курс відкрито учню'],
    sRevoked: ['Доступ закрыт', 'Access removed', 'Доступ закрито'],
    sConfirmRevoke: ['Закрыть ученику доступ к курсу?', 'Remove the student’s access to this course?', 'Закрити учню доступ до курсу?'],
    sPwPrompt: ['Новый пароль (минимум 8 символов). Сообщите его ученику.', 'New password (at least 8 characters). Tell it to the student.', 'Новий пароль (щонайменше 8 символів). Повідомте його учню.'],
    sPwSet: ['Пароль изменён', 'Password changed', 'Пароль змінено'],
    sNamePrompt: ['Имя ученика:', 'Student name:', 'Імʼя учня:'],
    sCreated: ['Ученик добавлен', 'Student added', 'Учня додано'],
    sPayments: ['Онлайн-оплата курсов (Stripe)', 'Online course payments (Stripe)', 'Онлайн-оплата курсів (Stripe)'],
    g_acd: ['Курсы — каталог', 'Courses — catalog', 'Курси — каталог'], g_crs: ['Курсы — страница курса', 'Courses — course page', 'Курси — сторінка курсу'],
    g_acc: ['Личный кабинет', 'Student account', 'Особистий кабінет'], g_err: ['Сообщения об ошибках', 'Error messages', 'Повідомлення про помилки'],
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
      if (active === 'courses') { collectCourse(); renderCourses(); }
      if (active === 'students') renderStudents();
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
  const views = { leads: loadLeads, texts: loadTexts, gallery: loadGallery, courses: loadCourses, students: loadStudents, settings: loadStatus };
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
  const GROUPS = ['nav', 'hero', 'badge', 'brands', 'work', 'shot', 'ph', 'sv', 'how', 'why', 'unit', 'ac', 'so', 'faq', 'ct', 'fm', 'ai', 'ft', 'cb', 'acd', 'crs', 'acc', 'err'];
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

  /* ================= courses ================= */
  let courses = [], editing = null, storageMode = null;
  const rid = () => Math.random().toString(36).slice(2, 10);
  const money = c => (c.price ? `$${(c.price / 100).toFixed(c.price % 100 ? 2 : 0)}` : t('cFree'));
  const triInputs = (name, obj, { area = false, ph = '' } = {}) => LANGS.map(l => `
    <label>${LANG_NAMES[l]}${area
      ? `<textarea data-f="${name}.${l}" placeholder="${esc(ph)}">${esc(obj?.[l] || '')}</textarea>`
      : `<input data-f="${name}.${l}" value="${esc(obj?.[l] || '')}" placeholder="${esc(ph)}">`}</label>`).join('');

  async function loadCourses() {
    try {
      courses = (await api('/api/admin/courses')).courses;
      if (!storageMode) storageMode = (await api('/api/admin/status')).storage;
      renderCourses();
    } catch (e) { toast(e.message, true); }
  }
  function renderCourses() {
    $('#courseSeed').hidden = !!courses.length;
    $('#courseList').hidden = !!editing;
    $('#courseEdit').hidden = !editing;
    if (editing) return renderEditor();
    $('#courseList').innerHTML = courses.length ? courses.map(c => `
      <article class="course" data-slug="${esc(c.slug)}">
        <div class="course__cover">${c.cover ? `<img src="${esc(c.cover)}" alt="">` : ''}</div>
        <div class="course__body">
          <div class="course__top"><b>${esc(c.title?.[ui] || c.title?.ru || c.title?.en || c.slug)}</b>
            <span class="pill ${c.published ? 'pill--on' : ''}">${c.published ? t('cPublished') : t('cDraft')}</span></div>
          <span class="muted">/course?c=${esc(c.slug)} · ${t('cLessonsN', { n: c.lessons.length })} · ${money(c)}${c.level ? ' · ' + esc(c.level) : ''}</span>
        </div>
        <button class="btn" data-act="edit">${t('cEdit')}</button>
      </article>`).join('') : `<div class="empty">${t('cEmpty')}</div>`;
  }
  $('#courseList').addEventListener('click', e => {
    const card = e.target.closest('.course');
    if (card && e.target.dataset.act === 'edit') { editing = JSON.parse(JSON.stringify(courses.find(c => c.slug === card.dataset.slug))); editing.isNew = false; renderCourses(); }
  });
  $('#courseNew').addEventListener('click', () => {
    editing = { isNew: true, slug: '', published: false, order: courses.length + 1, level: '', price: 0, currency: 'usd', cover: '', title: {}, desc: {}, lessons: [] };
    renderCourses();
  });
  // three drafts matching the Academy levels on the home page; the owner fills in prices and lessons
  $('#courseSeed').addEventListener('click', async () => {
    const d = window.kmLang?.defaults || {};
    const pick = k => ({ ru: d[k]?.ru || '', en: d[k]?.en || '', uk: d[k]?.uk || '' });
    const seeds = [
      { slug: 'start-pack', level: 'Level 1', title: { ru: 'Start Pack', en: 'Start Pack', uk: 'Start Pack' }, desc: pick('ac.1p') },
      { slug: 'pro-master', level: 'Level 2', title: { ru: 'PRO Master', en: 'PRO Master', uk: 'PRO Master' }, desc: pick('ac.2p') },
      { slug: 'true-expert', level: 'Level 3', title: { ru: 'True Expert', en: 'True Expert', uk: 'True Expert' }, desc: pick('ac.3p') },
    ];
    try {
      for (const [i, s] of seeds.entries()) await api('/api/admin/courses', { method: 'PUT', body: JSON.stringify({ course: { ...s, order: i + 1, published: false, price: 0, currency: 'usd', lessons: [] } }) });
      toast(t('cSeeded')); loadCourses();
    } catch (e) { toast(e.message, true); }
  });

  function renderEditor() {
    const c = editing;
    $('#courseEdit').innerHTML = `
      <div class="cedit__bar">
        <button class="btn" data-act="back">${t('cBack')}</button>
        <div class="view__actions">
          ${c.isNew ? '' : `<a class="btn" href="/course?c=${esc(c.slug)}" target="_blank" rel="noopener">${t('cOpen')}</a>
          <button class="btn btn--danger" data-act="delete">${t('delete')}</button>`}
          <button class="btn btn--primary" data-act="save">${t('save')}</button>
        </div>
      </div>
      <div class="cedit__grid">
        <div class="panel">
          <h3>${t('cMain')}</h3>
          <label class="check"><input type="checkbox" data-f="published" ${c.published ? 'checked' : ''}> ${t('cPublishedLong')}</label>
          <div class="row3">
            <label>${t('cSlug')}<input data-f="slug" value="${esc(c.slug)}" ${c.isNew ? '' : 'disabled'} placeholder="pro-master"></label>
            <label>${t('cPrice')}<input data-f="priceUsd" type="number" min="0" step="0.01" value="${c.price ? (c.price / 100).toFixed(2) : ''}" placeholder="0 = ${esc(t('cFree'))}"></label>
            <label>${t('cLevel')}<input data-f="level" value="${esc(c.level)}" placeholder="Level 1"></label>
          </div>
          <div class="row3"><label>${t('cOrder')}<input data-f="order" type="number" value="${esc(c.order)}"></label></div>
          <h4>${t('cTitle')}</h4><div class="row3">${triInputs('title', c.title)}</div>
          <h4>${t('cDesc')}</h4><div class="row3">${triInputs('desc', c.desc, { area: true })}</div>
        </div>
        <div class="panel">
          <h3>${t('cCover')}</h3>
          <div class="cedit__cover">${c.cover ? `<img src="${esc(c.cover)}" alt="">` : `<span class="muted">${t('cNoCover')}</span>`}</div>
          <label class="btn"><span>${t('cCoverUp')}</span><input type="file" accept="image/*" data-act="cover" hidden></label>
          ${c.cover ? `<button class="link" data-act="coverDel">${t('cCoverDel')}</button>` : ''}
        </div>
      </div>
      <div class="panel">
        <div class="cedit__bar"><h3>${t('cLessons')} (${c.lessons.length})</h3><button class="btn" data-act="addLesson">${t('cAddLesson')}</button></div>
        <p class="muted">${t('cVideoHint')}</p>
        <div class="lessons">${c.lessons.map((l, i) => `
          <div class="lesson" data-i="${i}">
            <div class="lesson__num">${i + 1}</div>
            <div class="lesson__fields">
              <div class="row3">${triInputs(`l${i}.title`, l.title, { ph: t('cLessonTitle') })}</div>
              <details><summary>${t('cLessonDesc')}</summary><div class="row3">${triInputs(`l${i}.desc`, l.desc, { area: true })}</div></details>
              <div class="lesson__meta">
                <label>${t('cDuration')}<input data-f="l${i}.duration" value="${esc(l.duration)}" placeholder="12:30"></label>
                <label class="check"><input type="checkbox" data-f="l${i}.free" ${l.free ? 'checked' : ''}> ${t('cFreeLesson')}</label>
                <div class="lesson__video">
                  ${l.video ? `<span class="ok">${t('cVideoOk')}</span> <code>${esc(l.video.split('/').pop())}</code>
                    <button class="link" data-act="preview">${t('cPreview')}</button> <button class="link danger" data-act="videoDel">${t('cVideoDel')}</button>`
                  : `<span class="muted">${t('cNoVideo')}</span>`}
                  <label class="btn btn--sm"><span>${l.video ? t('cVideoReplace') : t('cVideoUp')}</span><input type="file" accept="video/mp4,video/webm,video/quicktime" data-act="video" hidden></label>
                  <progress max="100" value="0" hidden></progress>
                </div>
              </div>
            </div>
            <div class="gitem__tools">
              <button data-act="lUp" title="${esc(t('up'))}">↑</button><button data-act="lDown" title="${esc(t('down'))}">↓</button>
              <button class="del" data-act="lDel" title="${esc(t('delete'))}">✕</button>
            </div>
          </div>`).join('') || `<div class="empty">${t('cNoLessons')}</div>`}
        </div>
      </div>
      <video class="cedit__preview" id="adminPreview" controls hidden></video>`;
  }
  // copy what is typed into `editing` (called before every re-render and before saving)
  function collectCourse() {
    if (!editing) return;
    $('#courseEdit').querySelectorAll('[data-f]').forEach(el => {
      const f = el.dataset.f, v = el.type === 'checkbox' ? el.checked : el.value;
      const m = /^l(\d+)\.(\w+)(?:\.(\w+))?$/.exec(f);
      if (m) {
        const l = editing.lessons[+m[1]];
        if (m[3]) (l[m[2]] ||= {})[m[3]] = v; else l[m[2]] = v;
      } else if (f.includes('.')) {
        const [k, lang] = f.split('.');
        (editing[k] ||= {})[lang] = v;
      } else if (f === 'priceUsd') editing.price = Math.round((parseFloat(v) || 0) * 100);
      else if (f === 'slug') { if (editing.isNew) editing.slug = v.trim().toLowerCase(); }
      else editing[f] = v;
    });
  }
  const rerenderEditor = () => { collectCourse(); renderEditor(); };

  async function saveCourse({ quiet = false } = {}) {
    collectCourse();
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(editing.slug)) throw new Error(t('cSlugBad'));
    if (editing.isNew && courses.some(c => c.slug === editing.slug)) throw new Error(t('cSlugTaken'));
    const { isNew, ...course } = editing;
    const saved = (await api('/api/admin/courses', { method: 'PUT', body: JSON.stringify({ course }) })).course;
    editing = { ...saved, isNew: false };
    const i = courses.findIndex(c => c.slug === saved.slug);
    if (i >= 0) courses[i] = saved; else courses.push(saved);
    if (!quiet) toast(t('cSaved'));
  }

  // lesson video: straight to the private Blob store (big files, multipart) or, locally, to the dev server
  async function uploadVideo(file, onProgress) {
    const name = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+/, '').slice(-60) || 'lesson.mp4';
    if (storageMode === 'blob') {
      const { upload } = await import('https://cdn.jsdelivr.net/npm/@vercel/blob@2.8.2/dist/client.js/+esm');
      const r = await upload(`videos/${editing.slug}/${name}`, file, {
        access: 'private', handleUploadUrl: '/api/admin/video-upload', multipart: file.size > 50 * 1024 * 1024,
        contentType: file.type || 'video/mp4', onUploadProgress: p => onProgress(p.percentage),
      });
      return r.pathname;
    }
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open('POST', `/api/admin/video-upload?c=${encodeURIComponent(editing.slug)}&name=${encodeURIComponent(name)}`);
      x.setRequestHeader('Content-Type', file.type || 'video/mp4');
      x.upload.onprogress = e => e.lengthComputable && onProgress(e.loaded / e.total * 100);
      x.onload = () => { try { const d = JSON.parse(x.responseText); x.status === 200 ? resolve(d.pathname) : reject(new Error(d.error || x.status)); } catch { reject(new Error(x.status)); } };
      x.onerror = () => reject(new Error(t('error')));
      x.send(file);
    });
  }

  $('#courseEdit').addEventListener('click', async e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act || e.target.type === 'file') return;
    const row = e.target.closest('.lesson'), i = row ? +row.dataset.i : -1;
    try {
      if (act === 'back') { editing = null; return renderCourses(); }
      if (act === 'save') { await saveCourse(); return renderEditor(); }
      if (act === 'delete') {
        if (!confirm(t('cConfirmDel'))) return;
        await api('/api/admin/courses?c=' + encodeURIComponent(editing.slug), { method: 'DELETE' });
        courses = courses.filter(c => c.slug !== editing.slug); editing = null; renderCourses(); return toast(t('cDeleted'));
      }
      if (act === 'addLesson') { collectCourse(); editing.lessons.push({ id: rid(), title: {}, desc: {}, video: '', duration: '', free: false }); return renderEditor(); }
      if (act === 'coverDel') { collectCourse(); editing.cover = ''; return renderEditor(); }
      if (act === 'lUp' || act === 'lDown') {
        collectCourse();
        const j = act === 'lUp' ? i - 1 : i + 1;
        if (j < 0 || j >= editing.lessons.length) return;
        [editing.lessons[i], editing.lessons[j]] = [editing.lessons[j], editing.lessons[i]];
        return renderEditor();
      }
      if (act === 'lDel') {
        if (!confirm(t('cConfirmLessonDel'))) return;
        collectCourse();
        const [l] = editing.lessons.splice(i, 1);
        if (l.video) await api('/api/admin/video-upload?p=' + encodeURIComponent(l.video), { method: 'DELETE' }).catch(() => {});
        await saveCourse({ quiet: true }); return renderEditor();
      }
      if (act === 'videoDel') {
        if (!confirm(t('cConfirmVideoDel'))) return;
        collectCourse();
        const l = editing.lessons[i];
        await api('/api/admin/video-upload?p=' + encodeURIComponent(l.video), { method: 'DELETE' });
        l.video = ''; await saveCourse({ quiet: true }); return renderEditor();
      }
      if (act === 'preview') {
        if (editing.isNew) await saveCourse({ quiet: true });
        const { url } = await api(`/api/lesson?c=${encodeURIComponent(editing.slug)}&l=${encodeURIComponent(editing.lessons[i].id)}`);
        const v = $('#adminPreview'); v.hidden = false; v.src = url; v.play().catch(() => {}); v.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (x) { toast(x.message, true); }
  });
  $('#courseEdit').addEventListener('change', async e => {
    const act = e.target.dataset.act;
    if (act === 'cover') {
      const file = e.target.files[0]; if (!file) return;
      try {
        collectCourse(); toast(t('uploading', { name: file.name }));
        const { url } = await api('/api/admin/upload', { method: 'POST', body: JSON.stringify({ name: 'cover-' + file.name.replace(/\.\w+$/, '') + '.jpg', data: await shrink(file) }) });
        editing.cover = url; renderEditor(); toast(t('cCoverOk'));
      } catch (x) { toast(x.message, true); }
    }
    if (act === 'video') {
      const file = e.target.files[0]; if (!file) return;
      const row = e.target.closest('.lesson'), i = +row.dataset.i, bar = row.querySelector('progress');
      try {
        // the course must exist first: videos are stored under videos/<course>/
        await saveCourse({ quiet: true });
        bar.hidden = false; row.querySelectorAll('.lesson__video .btn').forEach(b => b.classList.add('is-busy'));
        toast(t('uploading', { name: file.name }));
        const pathname = await uploadVideo(file, p => { bar.value = p; });
        collectCourse();
        const l = editing.lessons[i], old = l.video;
        l.video = pathname;
        await saveCourse({ quiet: true });
        if (old && old !== pathname) api('/api/admin/video-upload?p=' + encodeURIComponent(old), { method: 'DELETE' }).catch(() => {});
        renderEditor(); toast(t('cVideoUploaded'));
      } catch (x) { bar.hidden = true; toast(x.message, true); }
    }
  });

  /* ================= students ================= */
  let students = [], orders = [];
  async function loadStudents() {
    try {
      const [s, c] = await Promise.all([api('/api/admin/students'), api('/api/admin/courses')]);
      students = s.users; orders = s.orders; courses = c.courses;
      renderStudents();
    } catch (e) { toast(e.message, true); }
  }
  const courseName = slug => { const c = courses.find(x => x.slug === slug); return c ? (c.title?.[ui] || c.title?.ru || c.title?.en || slug) : slug; };
  function renderStudents() {
    const q = $('#studentSearch').value.trim().toLowerCase();
    const list = students.filter(u => !q || [u.name, u.email, u.phone].join(' ').toLowerCase().includes(q));
    $('#students').innerHTML = list.length ? list.map(u => `
      <article class="student" data-id="${esc(u.id)}">
        <div class="student__who">
          <b>${esc(u.name || '—')}</b>
          <a href="mailto:${esc(u.email)}">${esc(u.email)}</a>
          ${u.phone ? `<a href="tel:${esc(u.phone.replace(/[^\d+]/g, ''))}">${esc(u.phone)}</a>` : ''}
          <span class="muted">${t('sSince')} ${new Date(u.createdAt).toLocaleDateString(locale())}</span>
        </div>
        <div class="student__courses">
          ${u.courses.map(s => `<span class="chip">${esc(courseName(s))}<button data-act="revoke" data-c="${esc(s)}" title="${esc(t('sRevoke'))}">✕</button></span>`).join('') || `<span class="muted">${t('sNoCourses')}</span>`}
        </div>
        <div class="student__tools">
          <select data-act="grantSel"><option value="">${t('sGrant')}</option>${courses.filter(c => !u.courses.includes(c.slug)).map(c => `<option value="${esc(c.slug)}">${esc(courseName(c.slug))}</option>`).join('')}</select>
          <button class="btn" data-act="password">${t('sNewPw')}</button>
        </div>
      </article>`).join('') : `<div class="empty">${students.length ? t('emptyFilter') : t('sEmpty')}</div>`;
    $('#orders').innerHTML = orders.length ? `<table class="otable"><tr><th>${t('oDate')}</th><th>Email</th><th>${t('oCourse')}</th><th>${t('oSum')}</th></tr>${orders.map(o => `
      <tr><td>${fmt(o.ts)}</td><td>${esc(o.email)}</td><td>${esc(courseName(o.course))}</td><td>${(o.amount / 100).toFixed(2)} ${esc(String(o.currency || '').toUpperCase())}</td></tr>`).join('')}</table>`
      : `<div class="empty">${t('oEmpty')}</div>`;
  }
  const patchStudent = async (id, body, msg) => {
    const { user } = await api('/api/admin/students', { method: 'PATCH', body: JSON.stringify({ id, ...body }) });
    students = students.map(u => (u.id === id ? user : u)); renderStudents(); toast(msg);
  };
  $('#studentSearch').addEventListener('input', renderStudents);
  $('#students').addEventListener('change', async e => {
    if (e.target.dataset.act !== 'grantSel' || !e.target.value) return;
    try { await patchStudent(e.target.closest('.student').dataset.id, { grant: e.target.value }, t('sGranted')); } catch (x) { toast(x.message, true); }
  });
  $('#students').addEventListener('click', async e => {
    const act = e.target.dataset.act, id = e.target.closest('.student')?.dataset.id;
    try {
      if (act === 'revoke' && confirm(t('sConfirmRevoke'))) await patchStudent(id, { revoke: e.target.dataset.c }, t('sRevoked'));
      if (act === 'password') {
        const pw = prompt(t('sPwPrompt'));
        if (pw) await patchStudent(id, { password: pw }, t('sPwSet'));
      }
    } catch (x) { toast(x.message, true); }
  });
  $('#studentNew').addEventListener('click', async () => {
    const email = prompt('Email:'); if (!email) return;
    const name = prompt(t('sNamePrompt')) || '';
    const password = prompt(t('sPwPrompt')); if (!password) return;
    try { await api('/api/admin/students', { method: 'POST', body: JSON.stringify({ email, name, password }) }); toast(t('sCreated')); loadStudents(); }
    catch (x) { toast(x.message, true); }
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
        row(t('sPayments'), s.payments, s.payments ? t('sOn') : t('sOff')),
      ].join('');
    } catch (e) { toast(e.message, true); }
  }

  /* ================= start ================= */
  applyUi();
  api('/api/admin/login').then(r => (r.admin ? showApp() : showLogin())).catch(showLogin);
})();
