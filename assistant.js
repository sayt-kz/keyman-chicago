/* Key Man chat bot — fully client-side, no AI API.
   Answers in English, Russian, Ukrainian and Spanish (switcher in the chat header or auto-detect),
   remembers the car the visitor mentioned, and can take a callback request right in the chat. */
(() => {
  const PHONE = '224-253-3252';
  const TEL = 'tel:+12242533252';
  const LANGS = ['en', 'ru', 'uk', 'es'];

  const panel = document.getElementById('ai');
  const body = document.getElementById('aiBody');
  const form = document.getElementById('aiForm');
  const input = document.getElementById('aiInput');
  const fab = document.getElementById('aiFab');
  const chipsEl = document.getElementById('aiChips');
  const langsEl = document.getElementById('aiLangs');
  const statusEl = document.getElementById('aiStatus');

  const storage = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const browserLang = () => {
    const l = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.includes(l) ? l : 'en';
  };
  const saved = storage.get('km-chat-lang');
  const ctx = {
    lang: LANGS.includes(saved) ? saved : browserLang(),
    locked: LANGS.includes(saved), // the visitor picked a language → don't auto-switch
    brand: null, year: null, model: null, service: null, flow: null, misses: 0,
  };
  let busy = false;

  /* ================= Interface texts ================= */
  const UI = {
    placeholder: { en: 'Ask anything about car keys…', ru: 'Спросите что угодно про ключи…', uk: 'Запитайте будь-що про ключі…', es: 'Pregunte lo que quiera sobre llaves…' },
    status: { en: 'Online · replies instantly', ru: 'Онлайн · отвечаем сразу', uk: 'Онлайн · відповідаємо одразу', es: 'En línea · respuesta inmediata' },
    greet: {
      en: "Hi! I'm the Key Man assistant 👋\nLocked out, lost your key, or need a spare smart key? Ask me anything.",
      ru: 'Здравствуйте! Я ассистент Key Man 👋\nЗакрыли ключи в машине, потеряли ключ или нужен запасной смарт-ключ? Спрашивайте.',
      uk: 'Вітаю! Я асистент Key Man 👋\nЗачинили ключі в машині, загубили ключ чи потрібен запасний смарт-ключ? Питайте.',
      es: '¡Hola! Soy el asistente de Key Man 👋\n¿Se quedó afuera, perdió la llave o necesita una llave inteligente de repuesto? Pregúnteme.',
    },
    switched: {
      en: 'Switched to English 🇺🇸 How can I help?',
      ru: 'Переключил на русский 🇷🇺 Чем помочь?',
      uk: 'Перемкнув на українську 🇺🇦 Чим допомогти?',
      es: 'Cambiado a español 🇪🇸 ¿En qué le ayudo?',
    },
  };

  /* ================= Language detection ================= */
  const ES_WORDS = /\b(hola|llave|llaves|carro|coche|auto|necesito|quiero|cu[aá]nto|gracias|perd[ií]|tengo|puedo|c[oó]mo|d[oó]nde|cu[aá]ndo|precio|por favor|buenas|ayuda|mi|est[aá]n|se me)\b/i;
  const EN_WORDS = /\b(i|my|me|the|key|keys|how|what|need|lost|locked|can|you|is|do|hi|hello|hey|car|price|want|please|thanks|have)\b/i;
  const detectLang = t => {
    if (ctx.locked) return ctx.lang;
    if (/[іїєґ]/i.test(t)) return 'uk';
    if (/[ыэъё]/i.test(t)) return 'ru';
    if (/[а-я]/i.test(t)) return ctx.lang === 'uk' ? 'uk' : 'ru';
    if (/[ñ¿¡]/.test(t) || ES_WORDS.test(t)) return 'es';
    if (EN_WORDS.test(t)) return 'en';
    return ctx.lang;
  };
  const L = '[^a-zа-яёіїєґ0-9]'; // "not a letter" for whole-word matching in all four languages

  /* ================= Vehicle detection ================= */
  const BRANDS = [
    ['Toyota', ['toyota', 'тойот']], ['Honda', ['honda', 'хонд']], ['Ford', ['ford', 'форд']],
    ['Chevrolet', ['chevrolet', 'chevy', 'шевроле']], ['Nissan', ['nissan', 'ниссан', 'ніссан']],
    ['Hyundai', ['hyundai', 'хендай', 'хёндай', 'хюндай', 'хундай']], ['Kia', ['kia', 'киа', 'кіа']],
    ['Jeep', ['jeep', 'джип']], ['Dodge', ['dodge', 'додж']], ['Ram', ['ram 1500', 'ram 2500', 'dodge ram']],
    ['Chrysler', ['chrysler', 'крайслер']], ['GMC', ['gmc']], ['Cadillac', ['cadillac', 'кадиллак', 'кадилак']],
    ['Buick', ['buick', 'бьюик', "б'юїк"]], ['Lincoln', ['lincoln', 'линкольн', 'лінкольн']],
    ['BMW', ['bmw', 'бмв', 'бэха', 'беха']], ['Mercedes-Benz', ['mercedes', 'benz', 'мерседес', 'мерс']],
    ['Volvo', ['volvo', 'вольво']], ['Audi', ['audi', 'ауди', 'ауді']], ['Volkswagen', ['volkswagen', 'vw', 'фольксваген']],
    ['Porsche', ['porsche', 'порше']], ['Land Rover', ['land rover', 'range rover', 'ленд ровер', 'рендж ровер']],
    ['Jaguar', ['jaguar', 'ягуар']], ['Mini', ['mini cooper']], ['Lexus', ['lexus', 'лексус']],
    ['Acura', ['acura', 'акура']], ['Infiniti', ['infiniti', 'инфинити', 'інфініті']], ['Mazda', ['mazda', 'мазда']],
    ['Subaru', ['subaru', 'субару']], ['Mitsubishi', ['mitsubishi', 'мицубиси', 'митсубиси', 'мітсубісі']],
    ['Tesla', ['tesla', 'тесла']], ['Genesis', ['genesis']],
  ];
  const EUROPEAN = ['BMW', 'Mercedes-Benz', 'Volvo', 'Audi', 'Volkswagen', 'Porsche', 'Land Rover', 'Jaguar', 'Mini'];

  const NOT_MODEL = new Set(['is', 'and', 'the', 'with', 'key', 'keys', 'locked', 'lost', 'car', 'need', 'smart', 'remote', 'fob', 'has', 'was', 'it', 'a', 'my', 'for', 'or', 'y', 'es', 'de', 'la', 'el', 'con', 'no', 'not', 'doesn', 'won', 'i', 'please', 'thanks']);
  const detectVehicle = t => {
    const s = ' ' + t.toLowerCase() + ' ';
    let found = false;
    for (const [name, aliases] of BRANDS) {
      if (aliases.some(a => new RegExp(`${L}${a}`, 'i').test(s))) {
        ctx.brand = name; found = true;
        const after = s.split(new RegExp(aliases.find(a => s.includes(a)), 'i'))[1] || '';
        const m = after.trim().match(/^([a-z0-9-]{1,12})/i);
        if (m && !/^(19|20)\d\d$/.test(m[1]) && !NOT_MODEL.has(m[1].toLowerCase())) ctx.model = m[1].toUpperCase().length <= 3 ? m[1].toUpperCase() : m[1][0].toUpperCase() + m[1].slice(1);
        break;
      }
    }
    const y = t.match(/\b(19[89]\d|20[0-3]\d)\b/);
    if (y) { ctx.year = y[1]; found = true; }
    return found;
  };
  const car = () => [ctx.year, ctx.brand, ctx.model].filter(Boolean).join(' ');

  /* ================= Knowledge base ================= */
  // kw: substrings to look for (longer matches weigh more). r: replies per language.
  const I = {
    greet: {
      kw: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'привет', 'здравств', 'добрый', 'доброе утро', 'хай',
        'привіт', 'вітаю', 'добрий день', 'доброго дня', 'добрий вечір', 'hola', 'buenas', 'buenos días', 'buenos dias'],
      r: {
        en: 'Hi there! 👋 How can I help — locked out, lost a key, or need a spare?',
        ru: 'Здравствуйте! 👋 Чем помочь — закрыли ключи в машине, потеряли ключ или нужен запасной?',
        uk: 'Вітаю! 👋 Чим допомогти — зачинили ключі в машині, загубили ключ чи потрібен запасний?',
        es: '¡Hola! 👋 ¿En qué le ayudo? ¿Se quedó afuera, perdió la llave o necesita una copia?',
      },
      chips: ['lockout', 'lost', 'spare', 'price'],
    },
    thanks: {
      kw: ['thank', 'thx', 'appreciate', 'спасиб', 'благодар', 'дякую', 'дяки', 'gracias'],
      r: {
        en: 'You\'re welcome! If you need us, we\'re one call away: ' + PHONE + '. Drive safe! 🚗',
        ru: 'Пожалуйста! Если понадобимся — звоните: ' + PHONE + '. Хорошей дороги! 🚗',
        uk: 'Будь ласка! Якщо знадобимося — телефонуйте: ' + PHONE + '. Гарної дороги! 🚗',
        es: '¡De nada! Si nos necesita, llámenos: ' + PHONE + '. ¡Buen camino! 🚗',
      },
      chips: ['book', 'call'],
    },
    bye: {
      kw: ['bye', 'see you', 'goodbye', 'пока', 'до свидан', 'всего доброго', 'бувай', 'до побачення', 'на все добре', 'adios', 'adiós', 'hasta luego'],
      r: {
        en: 'Have a great day! Save our number just in case: ' + PHONE + ' 🔑',
        ru: 'Хорошего дня! Сохраните наш номер на всякий случай: ' + PHONE + ' 🔑',
        uk: 'Гарного дня! Збережіть наш номер про всяк випадок: ' + PHONE + ' 🔑',
        es: '¡Que tenga un buen día! Guarde nuestro número por si acaso: ' + PHONE + ' 🔑',
      },
      chips: [],
    },
    lockout: {
      service: 'Emergency Lockout',
      kw: ['locked out', 'lock out', 'lockout', 'locked', 'lock my', 'locked my key', 'locked the key', 'keys inside', 'key inside', 'keys in the car', 'keys in car', 'key in the car', "can't get in", 'cant get in', 'open my car', 'open the car', 'open car', 'unlock my car', 'unlock car', 'locked in',
        'закрыл', 'захлопн', 'заперл', 'ключи внутри', 'ключ внутри', 'ключи в машине', 'ключ в машине', 'ключи в салоне', 'вскры', 'открыть машину', 'открыть авто', 'открыть дверь', 'не могу открыть', 'не могу попасть',
        'зачинив', 'зачинила', 'замкнув', 'зачинилас', 'ключі всередині', 'ключі в машині', 'ключ в машині', 'ключі в салоні', 'розкри', 'відкрити машину', 'відкрити авто', 'не можу відкрити', 'не можу потрапити',
        'me quedé afuera', 'me quede afuera', 'llaves adentro', 'llaves dentro', 'llave adentro', 'abrir mi carro', 'abrir el carro', 'abrir carro', 'encerr', 'cerrado'],
      r: {
        en: 'Sorry you\'re stuck! 🚨 We handle **emergency lockouts** and open cars **without damage** — at home, at the office or on the roadside. Response time is **from 30 minutes**.\n\nFastest way: call **' + PHONE + '** and tell us where you are. Or leave your number here and we\'ll call you.',
        ru: 'Неприятная ситуация, но решаемая! 🚨 Мы **вскрываем авто без повреждений** — у дома, офиса или на дороге. Приезд **от 30 минут**.\n\nБыстрее всего — позвонить **' + PHONE + '** и назвать адрес. Или оставьте номер здесь, и мы перезвоним.',
        uk: 'Неприємна ситуація, але розв\'язувана! 🚨 Ми **відкриваємо авто без пошкоджень** — біля дому, офісу чи на дорозі. Приїзд **від 30 хвилин**.\n\nНайшвидше — зателефонувати **' + PHONE + '** і назвати адресу. Або залиште номер тут, і ми передзвонимо.',
        es: '¡Lamentamos el problema! 🚨 Abrimos carros **sin daños** — en casa, en la oficina o en la carretera. Llegamos **desde 30 minutos**.\n\nLo más rápido: llame al **' + PHONE + '** y díganos dónde está. O deje su número aquí y le llamamos.',
      },
      chips: ['call', 'book', 'damage', 'ownership'],
    },
    lost: {
      service: 'Lost Key Replacement',
      kw: ['lost', "can't find", 'cant find', 'no key', "don't have a key", 'dont have a key', 'all keys', 'only key', 'stolen', 'missing',
        'потерял', 'потеря', 'утерян', 'нет ключ', 'не могу найти', 'украли', 'пропал', 'единственный ключ', 'все ключи',
        'загубив', 'загубила', 'втратив', 'втратила', 'немає ключ', 'не можу знайти', 'вкрали', 'зник', 'єдиний ключ', 'всі ключі', 'усі ключі',
        'perdí', 'perdi', 'perdida', 'perdido', 'extravi', 'no tengo llave', 'robaron', 'no encuentro'],
      r: {
        en: 'No worries — we can make and program a **brand-new key even if all keys are lost**. No tow to the dealership needed: we come to your car.\n\nTo give you a price, tell me the **make, model and year** — or call **' + PHONE + '**.',
        ru: 'Не страшно — мы сделаем и пропишем **новый ключ, даже если все ключи утеряны**. Эвакуатор и дилер не нужны: мы приедем к машине.\n\nДля расчёта цены напишите **марку, модель и год** — или позвоните **' + PHONE + '**.',
        uk: 'Не страшно — ми виготовимо й пропишемо **новий ключ, навіть якщо всі ключі загублено**. Евакуатор і дилер не потрібні: ми приїдемо до машини.\n\nЩоб розрахувати ціну, напишіть **марку, модель і рік** — або зателефонуйте **' + PHONE + '**.',
        es: 'No se preocupe — hacemos y programamos una **llave nueva aunque haya perdido todas**. No necesita grúa ni concesionario: vamos a donde está su carro.\n\nPara darle precio, dígame **marca, modelo y año** — o llame al **' + PHONE + '**.',
      },
      chips: ['book', 'price', 'eta', 'ownership'],
    },
    spare: {
      service: 'Car Key Duplication',
      kw: ['spare', 'duplicate', 'duplication', 'copy', 'extra key', 'second key', 'another key', 'backup key', 'one more key',
        'запасн', 'дубликат', 'дублик', 'копи', 'второй ключ', 'ещё один ключ', 'еще один ключ', 'сделать ключ', 'резервн',
        'дублікат', 'другий ключ', 'ще один ключ', 'зробити ключ', 'виготовити ключ',
        'copia', 'duplicad', 'otra llave', 'llave extra', 'segunda llave', 'repuesto'],
      r: {
        en: 'Smart move! 👍 A spare key costs much less than replacing a lost one. We **cut and program duplicates on the spot** — regular keys, remotes and smart keys.\n\nWhat\'s your **make, model and year**?',
        ru: 'Отличное решение! 👍 Запасной ключ стоит гораздо дешевле, чем восстановление утерянного. Делаем **дубликаты на месте** — обычные ключи, с пультом и смарт-ключи.\n\nКакая у вас **марка, модель и год**?',
        uk: 'Чудове рішення! 👍 Запасний ключ коштує набагато дешевше, ніж відновлення загубленого. Робимо **дублікати на місці** — звичайні ключі, з пультом і смарт-ключі.\n\nЯка у вас **марка, модель і рік**?',
        es: '¡Buena idea! 👍 Una copia cuesta mucho menos que reemplazar una llave perdida. **Cortamos y programamos copias en el lugar** — llaves normales, con control y llaves inteligentes.\n\n¿Cuál es la **marca, modelo y año**?',
      },
      chips: ['price', 'smart', 'book'],
    },
    smart: {
      service: 'Smart Keys & Remotes',
      kw: ['smart key', 'smartkey', 'smart', 'proximity', 'push to start', 'push-to-start', 'push start', 'keyless', 'key fob', 'fob', 'transponder', 'chip key',
        'смарт', 'бесключ', 'кнопка старт', 'старт-стоп', 'брелок', 'чип', 'транспондер', 'ключ с кнопк',
        'безключ', 'брелк', 'ключ з кнопк',
        'inteligente', 'proximidad', 'sin llave', 'llave con chip', 'chip'],
      r: {
        en: 'Yes — we supply, cut and **program smart keys, proximity fobs, push-to-start keys and remotes** right at your car using **OEM-grade equipment**. Most brands are supported, including BMW, Mercedes-Benz and Volvo.\n\nTell me your **make, model and year** and I\'ll pass it to the technician.',
        ru: 'Да — поставляем, нарезаем и **программируем смарт-ключи, брелоки, ключи для кнопки Start и пульты** прямо у машины на **OEM-оборудовании**. Работаем с большинством марок, включая BMW, Mercedes-Benz и Volvo.\n\nНапишите **марку, модель и год** — передам мастеру.',
        uk: 'Так — постачаємо, нарізаємо й **програмуємо смарт-ключі, брелоки, ключі для кнопки Start і пульти** просто біля машини на **OEM-обладнанні**. Працюємо з більшістю марок, зокрема BMW, Mercedes-Benz і Volvo.\n\nНапишіть **марку, модель і рік** — передам майстру.',
        es: 'Sí — suministramos, cortamos y **programamos llaves inteligentes, fobs de proximidad, llaves push-to-start y controles** junto a su carro con **equipo de nivel OEM**. Trabajamos con la mayoría de marcas, incluidas BMW, Mercedes-Benz y Volvo.\n\nDígame **marca, modelo y año**.',
      },
      chips: ['price', 'spare', 'book'],
    },
    remote: {
      service: 'Smart Keys & Remotes',
      kw: ['not working', "doesn't work", 'doesnt work', 'stopped working', "won't unlock", 'wont unlock', 'dead fob', 'battery', 'reprogram', 'program', 'remote', 'buttons',
        'не работает', 'перестал', 'батарейк', 'сел', 'прошить', 'перепрошив', 'программир', 'прописать', 'пульт', 'кнопки не',
        'не працює', 'перестав', 'батарейк', 'сіла', 'програмув', 'прописати', 'кнопки не',
        'no funciona', 'dejó de funcionar', 'dejo de funcionar', 'batería', 'bateria', 'programar', 'control remoto', 'control'],
      r: {
        en: 'First, a quick tip: if the remote suddenly stopped working, **try a fresh battery** — that\'s the most common cause. 🔋\n\nIf it still doesn\'t work, the key may need **reprogramming or replacement** — we do both on site with OEM equipment.\n\nWhat\'s your **make, model and year**?',
        ru: 'Сначала простой совет: если пульт внезапно перестал работать, **попробуйте заменить батарейку** — это самая частая причина. 🔋\n\nЕсли не помогло, ключу может понадобиться **перепрограммирование или замена** — делаем это на месте на OEM-оборудовании.\n\nКакая **марка, модель и год**?',
        uk: 'Спершу проста порада: якщо пульт раптом перестав працювати, **спробуйте замінити батарейку** — це найчастіша причина. 🔋\n\nЯкщо не допомогло, ключу може знадобитися **перепрограмування або заміна** — робимо це на місці на OEM-обладнанні.\n\nЯка **марка, модель і рік**?',
        es: 'Primero un consejo: si el control dejó de funcionar de repente, **pruebe con una batería nueva** — es la causa más común. 🔋\n\nSi sigue sin funcionar, puede necesitar **reprogramación o reemplazo** — lo hacemos en el lugar con equipo OEM.\n\n¿Cuál es la **marca, modelo y año**?',
      },
      chips: ['price', 'smart', 'book'],
    },
    broken: {
      kw: ['broken', 'broke', 'snapped', 'bent', 'cracked', 'stuck in', 'ignition', "won't turn", 'wont turn', 'key stuck', 'worn',
        'сломал', 'слом', 'погнул', 'треснул', 'застрял', 'зажиган', 'не поворач', 'не провор', 'стёрся', 'стерся', 'развалил',
        'зламав', 'злама', 'зігнув', 'тріснув', 'застряг', 'запалюван', 'не поверта', 'стерся',
        'rota', 'roto', 'quebr', 'atasc', 'encendido', 'doblad', 'no gira'],
      r: {
        en: 'Sorry to hear that! In many cases the easiest fix is a **new key cut and programmed for your car** — and you\'ll get a 12-month warranty on it.\n\nIf the key is stuck or the ignition won\'t turn, please **call ' + PHONE + '** and describe what\'s happening — the technician will tell you right away how we can help.',
        ru: 'Сочувствую! Часто самое простое решение — **новый ключ, нарезанный и прописанный под вашу машину**, с гарантией 12 месяцев.\n\nЕсли ключ застрял или замок зажигания не поворачивается — **позвоните ' + PHONE + '** и опишите ситуацию, мастер сразу скажет, чем можем помочь.',
        uk: 'Співчуваю! Часто найпростіше рішення — **новий ключ, нарізаний і прописаний під вашу машину**, з гарантією 12 місяців.\n\nЯкщо ключ застряг або замок запалювання не повертається — **зателефонуйте ' + PHONE + '** й опишіть ситуацію, майстер одразу скаже, чим можемо допомогти.',
        es: '¡Lo sentimos! Muchas veces la solución más fácil es una **llave nueva cortada y programada para su carro** — con garantía de 12 meses.\n\nSi la llave está atascada o el encendido no gira, **llame al ' + PHONE + '** y describa el problema — el técnico le dirá enseguida cómo ayudarle.',
      },
      chips: ['call', 'book', 'price'],
    },
    price: {
      kw: ['price', 'cost', 'how much', 'quote', 'estimate', 'cheap', 'expensive', '$',
        'цен', 'стоим', 'сколько стоит', 'сколько будет', 'почём', 'почем', 'дорого', 'дешев', 'прайс', 'расценк',
        'ціна', 'ціни', 'ціну', 'вартість', 'скільки коштує', 'скільки буде', 'дорого', 'дешев',
        'precio', 'cuánto cuesta', 'cuanto cuesta', 'cuánto', 'cuanto', 'cuesta', 'costo', 'cotiza', 'barato', 'caro'],
      r: {
        en: () => 'The price depends on the **vehicle and the key type** (regular, remote, or smart/push-to-start). We aim for the **best prices in Chicago**, with no dealership markup, and every key has a **12-month warranty**.\n\n' +
          (car() ? `For your **${car()}**, the technician will give you an exact price by phone: **${PHONE}**. Or leave your number and we'll call you.` : 'Tell me your **make, model and year**, or call **' + PHONE + '** for an exact quote.'),
        ru: () => 'Цена зависит от **автомобиля и типа ключа** (обычный, с пультом или смарт-ключ). У нас **лучшие цены в Чикаго**, без дилерской наценки, и **гарантия 12 месяцев** на каждый ключ.\n\n' +
          (car() ? `Для вашего **${car()}** мастер назовёт точную цену по телефону: **${PHONE}**. Или оставьте номер — перезвоним.` : 'Напишите **марку, модель и год** или позвоните **' + PHONE + '** для точной цены.'),
        uk: () => 'Ціна залежить від **автомобіля та типу ключа** (звичайний, з пультом або смарт-ключ). У нас **найкращі ціни в Чикаго**, без дилерської націнки, і **гарантія 12 місяців** на кожен ключ.\n\n' +
          (car() ? `Для вашого **${car()}** майстер назве точну ціну телефоном: **${PHONE}**. Або залиште номер — передзвонимо.` : 'Напишіть **марку, модель і рік** або зателефонуйте **' + PHONE + '**, щоб дізнатися точну ціну.'),
        es: () => 'El precio depende del **vehículo y del tipo de llave** (normal, con control o inteligente). Tenemos los **mejores precios de Chicago**, sin el recargo del concesionario, y **12 meses de garantía** en cada llave.\n\n' +
          (car() ? `Para su **${car()}**, el técnico le dará el precio exacto por teléfono: **${PHONE}**. O deje su número y le llamamos.` : 'Dígame **marca, modelo y año**, o llame al **' + PHONE + '** para un precio exacto.'),
      },
      chips: ['book', 'call', 'dealer'],
    },
    eta: {
      kw: ['how fast', 'how soon', 'how long', 'eta', 'when can', 'arrive', 'come today', 'today', 'urgent', 'asap', 'right now', 'quick', 'take long', 'wait',
        'быстро', 'когда приед', 'через сколько', 'сколько ехать', 'сколько ждать', 'срочно', 'сейчас', 'сегодня', 'долго', 'сколько времени', 'сколько займ',
        'швидко', 'коли приїд', 'через скільки', 'скільки їхати', 'скільки чекати', 'терміново', 'зараз', 'сьогодні', 'довго', 'скільки часу',
        'rápido', 'rapido', 'cuándo', 'cuando', 'urgente', 'hoy', 'ahora', 'cuánto tarda', 'cuanto tarda', 'tarda', 'demora'],
      r: {
        en: 'Our mobile team arrives **from 30 minutes**, depending on your location and traffic. The key is usually made, programmed and tested **during the same visit** — you drive away with it.\n\nFor a real ETA right now, call **' + PHONE + '**.',
        ru: 'Мобильная бригада приезжает **от 30 минут** — зависит от адреса и пробок. Ключ обычно делается, прописывается и проверяется **за один визит** — уезжаете уже с ним.\n\nЧтобы узнать точное время прямо сейчас, звоните **' + PHONE + '**.',
        uk: 'Мобільна бригада приїжджає **від 30 хвилин** — залежить від адреси та заторів. Ключ зазвичай виготовляють, прописують і перевіряють **за один візит** — їдете вже з ним.\n\nЩоб дізнатися точний час просто зараз, телефонуйте **' + PHONE + '**.',
        es: 'Nuestro equipo móvil llega **desde 30 minutos**, según su ubicación y el tráfico. La llave normalmente se hace, programa y prueba **en la misma visita** — se va manejando con ella.\n\nPara el tiempo exacto ahora mismo, llame al **' + PHONE + '**.',
      },
      chips: ['call', 'book', 'area'],
    },
    area: {
      kw: ['where are you', 'where', 'how close', 'how far', 'far from', 'near', 'chicago', 'area', 'location', 'serve', 'service area', 'suburb', 'near me', 'come to', 'neighborhood', 'address', 'office', 'roadside', 'highway',
        'где вы', 'где', 'далеко', 'близко', 'чикаго', 'район', 'город', 'приезжаете', 'пригород', 'выезд', 'адрес', 'находитесь', 'на дороге', 'трасс',
        'де ви', 'далеко', 'близько', 'місто', 'приїжджаєте', 'передмісті', 'виїзд', 'адреса', 'знаходитесь', 'на дорозі',
        'dónde', 'donde', 'lejos', 'cerca', 'zona', 'área', 'vienen', 'ubicación', 'dirección', 'carretera'],
      r: {
        en: 'We\'re a **fully mobile** service across **Chicago** — we come to your **home, office or roadside**. No need to tow your car anywhere.\n\nIf you\'re outside the city, call **' + PHONE + '** and we\'ll confirm.',
        ru: 'Мы работаем **полностью выездом** по **Чикаго** — приезжаем **домой, в офис или на дорогу**. Машину никуда везти не нужно.\n\nЕсли вы за городом — позвоните **' + PHONE + '**, уточним.',
        uk: 'Ми працюємо **повністю з виїздом** по **Чикаго** — приїжджаємо **додому, в офіс або на дорогу**. Машину нікуди везти не потрібно.\n\nЯкщо ви за містом — зателефонуйте **' + PHONE + '**, уточнимо.',
        es: 'Somos un servicio **100% móvil** en **Chicago** — vamos a su **casa, oficina o carretera**. No necesita remolcar su carro.\n\nSi está fuera de la ciudad, llame al **' + PHONE + '** y le confirmamos.',
      },
      chips: ['eta', 'book', 'call'],
    },
    hours: {
      kw: ['hours', 'open now', 'are you open', 'opening', '24/7', '24 7', 'weekend', 'sunday', 'saturday', 'night', 'holiday', 'schedule',
        'часы работы', 'график', 'работаете', 'выходн', 'ночью', 'круглосуточ', 'суббот', 'воскрес', 'праздник', 'до скольки',
        'години роботи', 'графік', 'працюєте', 'вихідн', 'вночі', 'цілодобово', 'субот', 'неділ', 'свят', 'до котрої',
        'horario', 'abierto', 'abren', 'noche', 'fin de semana', 'domingo', 'sábado', 'sabado'],
      r: {
        en: 'For the current availability (including evenings and weekends), the fastest way is to call **' + PHONE + '** — we\'ll tell you right away when the team can be there.',
        ru: 'Чтобы узнать, когда бригада свободна (в том числе вечером и в выходные), быстрее всего позвонить **' + PHONE + '** — сразу скажем, когда сможем приехать.',
        uk: 'Щоб дізнатися, коли бригада вільна (зокрема ввечері та у вихідні), найшвидше зателефонувати **' + PHONE + '** — одразу скажемо, коли зможемо приїхати.',
        es: 'Para saber la disponibilidad actual (también noches y fines de semana), lo más rápido es llamar al **' + PHONE + '** — le diremos enseguida cuándo podemos llegar.',
      },
      chips: ['call', 'book'],
    },
    warranty: {
      kw: ['warranty', 'guarantee', 'guaranteed', 'гарант', 'garantía', 'garantia'],
      r: {
        en: 'Every key we make comes with a **12-month warranty**. ✅ If something goes wrong with it, just call us.',
        ru: 'На каждый наш ключ — **гарантия 12 месяцев**. ✅ Если что-то пойдёт не так, просто позвоните нам.',
        uk: 'На кожен наш ключ — **гарантія 12 місяців**. ✅ Якщо щось піде не так, просто зателефонуйте нам.',
        es: 'Cada llave que hacemos tiene **12 meses de garantía**. ✅ Si algo falla, solo llámenos.',
      },
      chips: ['price', 'book'],
    },
    payment: {
      kw: ['pay', 'payment', 'card', 'cash', 'credit', 'zelle', 'venmo', 'apple pay', 'оплат', 'карт', 'налич', 'платить', 'готівк', 'платити', 'pago', 'pagar', 'tarjeta', 'efectivo'],
      r: {
        en: 'Please confirm payment options with the technician when you call **' + PHONE + '** — you\'ll know the price before any work starts.',
        ru: 'Способы оплаты уточните у мастера по телефону **' + PHONE + '** — цену вы узнаете до начала работ.',
        uk: 'Способи оплати уточніть у майстра телефоном **' + PHONE + '** — ціну ви дізнаєтеся до початку робіт.',
        es: 'Confirme las formas de pago con el técnico al llamar al **' + PHONE + '** — sabrá el precio antes de empezar el trabajo.',
      },
      chips: ['price', 'call'],
    },
    brands: {
      kw: ['brand', 'which cars', 'what cars', 'what makes', 'which makes', 'european', 'german', 'japanese', 'korean', 'american', 'luxury', 'do you work with', 'do you do',
        'марк', 'какие машины', 'какие авто', 'с какими', 'европей', 'немец', 'японск', 'корейск', 'американ', 'премиум',
        'які машини', 'які авто', 'з якими', 'європей', 'німець', 'японськ', 'корейськ', 'американськ', 'преміум',
        'marca', 'qué carros', 'que carros', 'qué autos', 'europeo', 'alemán', 'japonés', 'trabajan con'],
      r: {
        en: 'We support **most car brands** — domestic, Asian and European: Toyota, Honda, Ford, Chevrolet, Nissan, Hyundai, Kia, Jeep, Dodge, Lexus and more — including premium **BMW, Mercedes-Benz and Volvo**.\n\nWhat do you drive?',
        ru: 'Работаем с **большинством марок** — американскими, азиатскими и европейскими: Toyota, Honda, Ford, Chevrolet, Nissan, Hyundai, Kia, Jeep, Dodge, Lexus и другими — включая премиальные **BMW, Mercedes-Benz и Volvo**.\n\nКакая у вас машина?',
        uk: 'Працюємо з **більшістю марок** — американськими, азійськими та європейськими: Toyota, Honda, Ford, Chevrolet, Nissan, Hyundai, Kia, Jeep, Dodge, Lexus та іншими — зокрема з преміальними **BMW, Mercedes-Benz і Volvo**.\n\nЯка у вас машина?',
        es: 'Trabajamos con **la mayoría de marcas** — americanas, asiáticas y europeas: Toyota, Honda, Ford, Chevrolet, Nissan, Hyundai, Kia, Jeep, Dodge, Lexus y más — incluidas **BMW, Mercedes-Benz y Volvo**.\n\n¿Qué carro tiene?',
      },
      chips: ['spare', 'smart', 'price'],
    },
    dealer: {
      kw: ['dealer', 'dealership', 'cheaper than', 'vs dealer', 'дилер', 'официал', 'дешевле чем', 'офіціал', 'дешевше ніж', 'concesionario', 'agencia'],
      r: {
        en: 'Usually we\'re **cheaper and faster than the dealership** — and you **don\'t need to tow** your car. We come to you with the same class of professional OEM equipment. Dealerships and businesses across Chicago trust us too.',
        ru: 'Обычно мы **дешевле и быстрее дилера** — и **не нужен эвакуатор**. Мы приезжаем к вам с профессиональным OEM-оборудованием того же класса. Нам доверяют и дилерские центры, и компании Чикаго.',
        uk: 'Зазвичай ми **дешевші й швидші за дилера** — і **не потрібен евакуатор**. Ми приїжджаємо до вас із професійним OEM-обладнанням того ж класу. Нам довіряють і дилерські центри, і компанії Чикаго.',
        es: 'Normalmente somos **más baratos y rápidos que el concesionario** — y **no necesita grúa**. Vamos a usted con equipo OEM profesional de la misma clase. Concesionarios y empresas de Chicago también confían en nosotros.',
      },
      chips: ['price', 'book'],
    },
    damage: {
      kw: ['damage', 'scratch', 'is it safe', 'break my', 'harm', 'поврежд', 'царап', 'сломаете', 'испорт', 'безопасно', 'пошкод', 'подряп', 'зламаєте', 'зіпсу', 'безпечно', 'daño', 'dañ', 'rayar', 'rayón', 'seguro'],
      r: {
        en: 'No damage — we use **professional tools and techniques** made to open vehicles safely. Your doors, locks and paint stay intact.',
        ru: 'Без повреждений — используем **профессиональные инструменты и методы**, созданные для безопасного вскрытия. Двери, замки и краска останутся целыми.',
        uk: 'Без пошкоджень — використовуємо **професійні інструменти й методи**, створені для безпечного відкриття. Двері, замки та фарба залишаться цілими.',
        es: 'Sin daños — usamos **herramientas y técnicas profesionales** hechas para abrir vehículos de forma segura. Puertas, cerraduras y pintura quedan intactas.',
      },
      chips: ['lockout', 'book'],
    },
    ownership: {
      kw: ['id', 'proof', 'ownership', 'registration', 'title', 'documents', 'license', 'not my car', 'докум', 'паспорт', 'владел', 'водительск', 'техпаспорт', 'документ', 'власник', 'посвідчен', 'водійськ', 'documentos', 'identificación', 'identificacion', 'título', 'registro'],
      r: {
        en: 'For security, please have your **ID and car documents** (registration or title) ready — the technician will verify that the car is yours before opening it or making a key.',
        ru: 'Для безопасности подготовьте **удостоверение личности и документы на машину** (регистрацию или title) — мастер проверит, что автомобиль ваш, прежде чем вскрывать его или делать ключ.',
        uk: 'Для безпеки підготуйте **посвідчення особи та документи на машину** (реєстрацію або title) — майстер перевірить, що автомобіль ваш, перш ніж відкривати його чи робити ключ.',
        es: 'Por seguridad, tenga a mano su **identificación y los documentos del carro** (registro o título) — el técnico verificará que el carro es suyo antes de abrirlo o hacer una llave.',
      },
      chips: ['book', 'call'],
    },
    academy: {
      service: 'Key Man Academy',
      kw: ['academy', 'course', 'courses', 'training', 'train', 'learn', 'school', 'teach', 'become a locksmith', 'study', 'student',
        'академ', 'курс', 'обучен', 'учить', 'учиться', 'научит', 'стать слесар', 'стать мастер', 'профессия', 'ученик',
        'навчан', 'навчит', 'вчитися', 'стати майстр', 'професія', 'учень',
        'academia', 'curso', 'aprender', 'entrenamiento', 'escuela', 'estudiar'],
      r: {
        en: '🎓 **Key Man Academy** turns you into a professional automotive locksmith — one of the most in-demand trades in America. Hands-on training in cutting, programming and repairing car keys, and opening locks like a pro.\n\nThere are **3 levels**: Start Pack → PRO Master → True Expert.',
        ru: '🎓 **Key Man Academy** — обучение профессии автослесаря по ключам, одной из самых востребованных в США. Практика: нарезка, программирование и ремонт автоключей, профессиональное вскрытие замков.\n\n**3 уровня**: Start Pack → PRO Master → True Expert.',
        uk: '🎓 **Key Man Academy** — навчання професії автослюсаря по ключах, однієї з найзатребуваніших у США. Практика: нарізання, програмування й ремонт автоключів, професійне відкриття замків.\n\n**3 рівні**: Start Pack → PRO Master → True Expert.',
        es: '🎓 **Key Man Academy** le convierte en cerrajero automotriz profesional — uno de los oficios más demandados en EE. UU. Práctica real: cortar, programar y reparar llaves y abrir cerraduras como un profesional.\n\n**3 niveles**: Start Pack → PRO Master → True Expert.',
      },
      chips: ['levels', 'career', 'academyPrice', 'book'],
    },
    levels: {
      service: 'Key Man Academy',
      kw: ['levels', 'level', 'start pack', 'pro master', 'true expert', 'program of', 'curriculum', 'what will i learn', 'уровн', 'программа курс', 'чему науч', 'рівн', 'програма курс', 'чого навч', 'niveles', 'nivel', 'qué aprend', 'que aprend'],
      r: {
        en: '**1. Start Pack** — key cutting, duplication and basic transponders.\n**2. PRO Master** — immobilizers, key cloning and working with dealer software.\n**3. True Expert** — BMW, Mercedes, Volvo, advanced security systems and high-end equipment.',
        ru: '**1. Start Pack** — нарезка ключей, дубликаты и базовые транспондеры.\n**2. PRO Master** — иммобилайзеры, клонирование ключей и дилерский софт.\n**3. True Expert** — BMW, Mercedes, Volvo, сложные системы безопасности и профессиональное оборудование.',
        uk: '**1. Start Pack** — нарізання ключів, дублікати та базові транспондери.\n**2. PRO Master** — іммобілайзери, клонування ключів і дилерське ПЗ.\n**3. True Expert** — BMW, Mercedes, Volvo, складні системи безпеки та професійне обладнання.',
        es: '**1. Start Pack** — corte de llaves, copias y transpondedores básicos.\n**2. PRO Master** — inmovilizadores, clonación de llaves y software de concesionario.\n**3. True Expert** — BMW, Mercedes, Volvo, sistemas de seguridad avanzados y equipo de alta gama.',
      },
      chips: ['career', 'academyPrice', 'book'],
    },
    career: {
      service: 'Key Man Academy',
      kw: ['job', 'earn', 'money', 'income', 'business', 'hire', 'hired', 'own business', 'salary', 'работа', 'работу', 'заработ', 'доход', 'бизнес', 'трудоустр', 'зарплат',
        'робота', 'роботу', 'заробі', 'заробля', 'дохід', 'бізнес', 'працевлашт', 'trabajo', 'ganar', 'dinero', 'negocio', 'empleo', 'salario'],
      r: {
        en: 'After the course you\'ll have the skills to **start your own business** or **get hired immediately** — and start earning much more than before. Stop working for someone else and build your own future. 💪',
        ru: 'После курса у вас будут навыки, чтобы **открыть своё дело** или **сразу устроиться на работу** — и зарабатывать заметно больше, чем раньше. Хватит работать на кого-то — стройте своё будущее. 💪',
        uk: 'Після курсу у вас будуть навички, щоб **відкрити власну справу** або **одразу влаштуватися на роботу** — і заробляти помітно більше, ніж раніше. Годі працювати на когось — будуйте своє майбутнє. 💪',
        es: 'Al terminar tendrá las habilidades para **abrir su propio negocio** o **conseguir trabajo de inmediato** — y ganar mucho más que antes. Deje de trabajar para otros y construya su futuro. 💪',
      },
      chips: ['levels', 'academyPrice', 'book'],
    },
    academyPrice: {
      service: 'Key Man Academy',
      kw: [],
      r: {
        en: 'Course prices, schedule and duration depend on the level. Leave your number and we\'ll send you the details — or call **' + PHONE + '**.',
        ru: 'Стоимость, расписание и длительность зависят от уровня. Оставьте номер — пришлём подробности, или позвоните **' + PHONE + '**.',
        uk: 'Вартість, розклад і тривалість залежать від рівня. Залиште номер — надішлемо подробиці, або зателефонуйте **' + PHONE + '**.',
        es: 'El precio, horario y duración dependen del nivel. Deje su número y le enviamos los detalles — o llame al **' + PHONE + '**.',
      },
      chips: ['book', 'levels'],
    },
    contact: {
      kw: ['phone', 'number', 'call you', 'contact', 'reach you', 'email', 'телефон', 'номер', 'позвонить', 'контакт', 'связаться', 'почта', 'зателефонувати', 'звʼязатися', "зв'язатися", 'пошта', 'teléfono', 'telefono', 'número', 'numero', 'llamar', 'contacto'],
      r: {
        en: '📞 Phone: **' + PHONE + '**\n📍 Mobile service across Chicago\n▶️ YouTube: @KeyManChicago\n📸 Instagram: @keyman.chicago',
        ru: '📞 Телефон: **' + PHONE + '**\n📍 Выезд по всему Чикаго\n▶️ YouTube: @KeyManChicago\n📸 Instagram: @keyman.chicago',
        uk: '📞 Телефон: **' + PHONE + '**\n📍 Виїзд по всьому Чикаго\n▶️ YouTube: @KeyManChicago\n📸 Instagram: @keyman.chicago',
        es: '📞 Teléfono: **' + PHONE + '**\n📍 Servicio móvil en todo Chicago\n▶️ YouTube: @KeyManChicago\n📸 Instagram: @keyman.chicago',
      },
      chips: ['call', 'book', 'social'],
    },
    social: {
      kw: ['instagram', 'insta', 'youtube', 'video', 'shorts', 'tiktok', 'social', 'инстаграм', 'инста', 'ютуб', 'видео', 'соцсет', 'інстаграм', 'відео', 'соцмереж', 'redes', 'vídeo', 'videos'],
      r: {
        en: 'Watch real jobs and key programming on our channels:\n▶️ YouTube & Shorts: youtube.com/@KeyManChicago\n📸 Instagram: @keyman.chicago',
        ru: 'Реальные выезды и программирование ключей — на наших каналах:\n▶️ YouTube и Shorts: youtube.com/@KeyManChicago\n📸 Instagram: @keyman.chicago',
        uk: 'Реальні виїзди та програмування ключів — на наших каналах:\n▶️ YouTube і Shorts: youtube.com/@KeyManChicago\n📸 Instagram: @keyman.chicago',
        es: 'Vea trabajos reales y programación de llaves en nuestros canales:\n▶️ YouTube y Shorts: youtube.com/@KeyManChicago\n📸 Instagram: @keyman.chicago',
      },
      chips: ['academy', 'book'],
    },
    human: {
      kw: ['human', 'person', 'operator', 'manager', 'real person', 'talk to someone', 'agent', 'человек', 'оператор', 'менеджер', 'живой', 'мастером', 'людин', 'живий', 'майстром', 'persona', 'humano', 'agente', 'alguien'],
      r: {
        en: 'Of course! Call **' + PHONE + '** to talk to the technician directly — or leave your number and we\'ll call you back.',
        ru: 'Конечно! Позвоните **' + PHONE + '**, чтобы поговорить с мастером напрямую, — или оставьте номер, и мы перезвоним.',
        uk: 'Звісно! Зателефонуйте **' + PHONE + '**, щоб поговорити з майстром напряму, — або залиште номер, і ми передзвонимо.',
        es: '¡Claro! Llame al **' + PHONE + '** para hablar directamente con el técnico — o deje su número y le llamamos.',
      },
      chips: ['call', 'book'],
    },
    other: {
      kw: ['house', 'home lock', 'door lock', 'apartment', 'a safe', 'motorcycle', 'garage', 'mailbox', 'residential', 'квартир', 'дома замок', 'дверь квартиры', 'входную дверь', 'сейф', 'мотоцикл', 'гараж', 'вхідні двері', 'двері квартири', 'casa', 'apartamento', 'caja fuerte', 'moto', 'garaje'],
      r: {
        en: 'We specialize in **car keys and vehicle lockouts**. For other locks, please call **' + PHONE + '** and ask — we\'ll tell you honestly if we can help.',
        ru: 'Мы специализируемся на **автомобильных ключах и вскрытии авто**. По другим замкам позвоните **' + PHONE + '** и спросите — честно скажем, сможем ли помочь.',
        uk: 'Ми спеціалізуємося на **автомобільних ключах і відкритті авто**. Щодо інших замків зателефонуйте **' + PHONE + '** і запитайте — чесно скажемо, чи зможемо допомогти.',
        es: 'Nos especializamos en **llaves de carro y aperturas de vehículos**. Para otras cerraduras, llame al **' + PHONE + '** y pregunte — le diremos con honestidad si podemos ayudar.',
      },
      chips: ['call', 'lockout', 'spare'],
    },
    book: {
      kw: ['book', 'appointment', 'schedule a', 'call me', 'callback', 'call back', 'order', 'request', 'come out', 'send someone', 'i need a key', 'need a locksmith',
        'перезвон', 'заказ', 'записа', 'заявк', 'вызвать', 'вызов', 'приезжайте', 'нужен мастер', 'оформить',
        'передзвон', 'замов', 'записат', 'викликати', 'виклик', 'приїжджайте', 'потрібен майстер', 'оформити',
        'cita', 'agendar', 'llámame', 'llamame', 'pedido', 'ordenar', 'solicitar', 'necesito un cerrajero', 'vengan'],
      r: null, // handled by the booking flow
      chips: [],
    },
  };

  const CHIP_LABEL = {
    lockout: { en: "🚨 I'm locked out", ru: '🚨 Закрыл ключи в машине', uk: '🚨 Зачинив ключі в машині', es: '🚨 Me quedé afuera' },
    lost: { en: '🔍 Lost my key', ru: '🔍 Потерял ключ', uk: '🔍 Загубив ключ', es: '🔍 Perdí la llave' },
    spare: { en: '🔑 Spare key', ru: '🔑 Запасной ключ', uk: '🔑 Запасний ключ', es: '🔑 Llave de repuesto' },
    smart: { en: '📡 Smart key / fob', ru: '📡 Смарт-ключ', uk: '📡 Смарт-ключ', es: '📡 Llave inteligente' },
    price: { en: '💲 Price', ru: '💲 Цена', uk: '💲 Ціна', es: '💲 Precio' },
    eta: { en: '⏱ How fast?', ru: '⏱ Как быстро?', uk: '⏱ Як швидко?', es: '⏱ ¿Qué tan rápido?' },
    area: { en: '📍 Service area', ru: '📍 Где работаете', uk: '📍 Де працюєте', es: '📍 Zona de servicio' },
    dealer: { en: 'vs Dealership', ru: 'Дешевле дилера?', uk: 'Дешевше за дилера?', es: '¿vs concesionario?' },
    damage: { en: 'Any damage?', ru: 'Без повреждений?', uk: 'Без пошкоджень?', es: '¿Sin daños?' },
    ownership: { en: 'What docs needed?', ru: 'Какие документы?', uk: 'Які документи?', es: '¿Qué documentos?' },
    academy: { en: '🎓 Academy', ru: '🎓 Академия', uk: '🎓 Академія', es: '🎓 Academia' },
    levels: { en: 'Course levels', ru: 'Уровни курса', uk: 'Рівні курсу', es: 'Niveles' },
    career: { en: 'Jobs after course', ru: 'Работа после курса', uk: 'Робота після курсу', es: 'Trabajo después' },
    academyPrice: { en: 'Course price', ru: 'Цена курса', uk: 'Ціна курсу', es: 'Precio del curso' },
    social: { en: '▶️ Videos', ru: '▶️ Видео', uk: '▶️ Відео', es: '▶️ Videos' },
    book: { en: '📝 Request a callback', ru: '📝 Заказать звонок', uk: '📝 Замовити дзвінок', es: '📝 Pedir llamada' },
    call: { en: `📞 Call ${PHONE}`, ru: '📞 Позвонить', uk: '📞 Зателефонувати', es: '📞 Llamar' },
  };
  const START_CHIPS = ['lockout', 'lost', 'spare', 'price', 'eta', 'academy'];

  /* ================= Matching ================= */
  const norm = t => ' ' + t.toLowerCase().replace(/[.,!?;:()"«»]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const SHORT = new Set(['hi', 'hey', 'id', 'vw', 'eta', 'сел', 'mi', 'хай']); // match only as whole words

  const score = (text, kws) => kws.reduce((sum, k) => {
    const hit = SHORT.has(k) || k.length <= 3 ? new RegExp(`(^|${L})${k.replace(/[$/]/g, '\\$&')}(${L}|$)`, 'i').test(text) : text.includes(k);
    return hit ? sum + k.length : sum;
  }, 0);

  const classify = raw => {
    const t = norm(raw);
    const scores = Object.entries(I).map(([id, it]) => [id, score(t, it.kw)]);
    const s = Object.fromEntries(scores);
    // combos that need a more specific answer
    if (s.academy && s.price) return 'academyPrice';
    if ((s.academy || s.levels) && s.career) return 'career';
    scores.sort((a, b) => b[1] - a[1]);
    // greeting + real question → answer the question
    const best = scores.find(([id, v]) => v > 0 && !(id === 'greet' && scores.some(([j, w]) => j !== 'greet' && w > 0)));
    return best ? best[0] : null;
  };

  /* ================= Rendering ================= */
  const escape = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const format = text => escape(text)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/224-253-3252/g, `<a href="${TEL}">${PHONE}</a>`)
    .replace(/(youtube\.com\/@KeyManChicago)/g, '<a href="https://www.youtube.com/@KeyManChicago" target="_blank" rel="noopener">$1</a>')
    .replace(/@keyman\.chicago/g, '<a href="https://www.instagram.com/keyman.chicago" target="_blank" rel="noopener">@keyman.chicago</a>');

  const add = (role, text) => {
    const el = document.createElement('div');
    el.className = `msg msg--${role}`;
    el.innerHTML = role === 'user' ? escape(text) : format(text);
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  };

  const typing = () => {
    const el = document.createElement('div');
    el.className = 'msg msg--bot typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  };

  let currentChips = [];
  const setChips = ids => {
    currentChips = ids;
    chipsEl.innerHTML = '';
    ids.forEach(id => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = CHIP_LABEL[id][ctx.lang];
      b.addEventListener('click', () => {
        if (id === 'call') { location.href = TEL; return; }
        handle(b.textContent, id);
      });
      chipsEl.appendChild(b);
    });
    chipsEl.style.display = ids.length ? '' : 'none';
  };

  const say = async (text, chips = []) => {
    const dots = typing();
    await new Promise(r => setTimeout(r, Math.min(450 + text.length * 4, 1300)));
    dots.remove();
    add('bot', text);
    setChips(chips);
  };

  /* ================= Language switcher ================= */
  const applyUi = () => {
    input.placeholder = UI.placeholder[ctx.lang];
    if (statusEl) statusEl.textContent = UI.status[ctx.lang];
    langsEl?.querySelectorAll('button').forEach(b => {
      const on = b.dataset.lang === ctx.lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
  };
  const setLang = async lang => {
    if (busy || !LANGS.includes(lang)) return;
    const changed = lang !== ctx.lang;
    ctx.lang = lang;
    ctx.locked = true;
    storage.set('km-chat-lang', lang);
    applyUi();
    if (!changed) return;
    if (body.children.length <= 1) { // only the greeting so far → just re-greet in the new language
      body.innerHTML = '';
      add('bot', UI.greet[lang]);
      setChips(START_CHIPS);
      return;
    }
    setChips(currentChips); // relabel the visible chips
    busy = true;
    await say(UI.switched[lang], ctx.flow ? [] : START_CHIPS);
    busy = false;
  };
  langsEl?.addEventListener('click', e => {
    const b = e.target.closest('button[data-lang]');
    if (b) setLang(b.dataset.lang);
  });

  /* ================= Booking flow ================= */
  const F = {
    vehicle: { en: 'Great, let\'s get you a callback. 📝 What car is it? (make, model, year)', ru: 'Отлично, оформим обратный звонок. 📝 Какая машина? (марка, модель, год)', uk: 'Чудово, оформимо зворотний дзвінок. 📝 Яка машина? (марка, модель, рік)', es: 'Perfecto, pidamos su llamada. 📝 ¿Qué carro es? (marca, modelo, año)' },
    vehicleAcademy: { en: 'Great! 📝 I\'ll pass your request to the Academy.', ru: 'Отлично! 📝 Передам заявку в Академию.', uk: 'Чудово! 📝 Передам заявку до Академії.', es: '¡Perfecto! 📝 Pasaré su solicitud a la Academia.' },
    location: { en: 'Where are you located? (address, intersection or neighborhood)', ru: 'Где вы находитесь? (адрес, перекрёсток или район)', uk: 'Де ви знаходитеся? (адреса, перехрестя або район)', es: '¿Dónde se encuentra? (dirección, cruce de calles o barrio)' },
    name: { en: 'What\'s your name?', ru: 'Как к вам обращаться?', uk: 'Як до вас звертатися?', es: '¿Cuál es su nombre?' },
    phone: { en: 'And your phone number?', ru: 'И ваш номер телефона?', uk: 'І ваш номер телефону?', es: '¿Y su número de teléfono?' },
    badPhone: { en: 'Hmm, that doesn\'t look like a full US phone number. Please enter 10 digits, e.g. 312-555-0123.', ru: 'Похоже, номер неполный. Введите 10 цифр, например 312-555-0123.', uk: 'Схоже, номер неповний. Введіть 10 цифр, наприклад 312-555-0123.', es: 'Parece que el número está incompleto. Escriba 10 dígitos, por ejemplo 312-555-0123.' },
    cancel: { en: 'No problem, request cancelled. Anything else I can help with?', ru: 'Хорошо, заявку отменил. Чем ещё помочь?', uk: 'Добре, заявку скасовано. Чим ще допомогти?', es: 'Sin problema, solicitud cancelada. ¿Algo más en lo que pueda ayudar?' },
  };
  const done = d => {
    const lines = `\n• ${d.service}${d.vehicle ? '\n• ' + d.vehicle : ''}${d.location ? '\n• ' + d.location : ''}\n• ${d.phone}`;
    return {
      en: `✅ Thank you, ${d.name}! Your request is sent:${lines}\n\nWe'll call you back shortly. If it's urgent, call **${PHONE}** now.`,
      ru: `✅ Спасибо, ${d.name}! Заявка отправлена:${lines}\n\nСкоро перезвоним. Если срочно — звоните **${PHONE}**.`,
      uk: `✅ Дякуємо, ${d.name}! Заявку надіслано:${lines}\n\nНезабаром передзвонимо. Якщо терміново — телефонуйте **${PHONE}**.`,
      es: `✅ ¡Gracias, ${d.name}! Su solicitud fue enviada:${lines}\n\nLe llamaremos pronto. Si es urgente, llame al **${PHONE}** ahora.`,
    }[ctx.lang];
  };

  const CANCEL = /^(cancel|stop|never ?mind|nevermind|отмена|отменить|стоп|не надо|скасувати|відміна|не треба|cancelar|olvídalo|olvidalo)(?![a-zа-яёіїєґ])/i;

  const nextStep = async () => {
    const f = ctx.flow;
    const academy = f.data.service === 'Key Man Academy';
    if (!academy && !f.data.vehicle) { f.step = 'vehicle'; return say(F.vehicle[ctx.lang]); }
    if (!academy && !f.data.location) { f.step = 'location'; return say(F.location[ctx.lang]); }
    if (!f.data.name) { f.step = 'name'; return say((academy && !f.greeted ? F.vehicleAcademy[ctx.lang] + ' ' : '') + F.name[ctx.lang]); }
    if (!f.data.phone) { f.step = 'phone'; return say(F.phone[ctx.lang]); }
    return submitLead();
  };

  const startFlow = async (prefill = {}) => {
    ctx.flow = {
      step: null,
      data: { service: ctx.service || 'Other / not sure', vehicle: car() || null, ...prefill },
    };
    setChips([]);
    if (ctx.flow.data.service !== 'Key Man Academy' && !ctx.flow.data.vehicle) {
      ctx.flow.step = 'vehicle';
      return say(F.vehicle[ctx.lang]);
    }
    if (ctx.flow.data.service === 'Key Man Academy') ctx.flow.greeted = false;
    return nextStep();
  };

  const flowAnswer = async text => {
    const f = ctx.flow;
    if (CANCEL.test(text.trim())) { ctx.flow = null; return say(F.cancel[ctx.lang], ['lockout', 'lost', 'spare', 'price']); }
    if (f.step === 'vehicle') { detectVehicle(text); f.data.vehicle = car() || text.trim().slice(0, 80); }
    else if (f.step === 'location') f.data.location = text.trim().slice(0, 120);
    else if (f.step === 'name') { f.data.name = text.trim().slice(0, 60); f.greeted = true; }
    else if (f.step === 'phone') {
      const digits = text.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) return say(F.badPhone[ctx.lang]);
      f.data.phone = text.trim();
    }
    return nextStep();
  };

  const submitLead = async () => {
    const d = ctx.flow.data;
    ctx.flow = null;
    // mirror into the page form, so the request is never lost
    const pageForm = document.getElementById('leadForm');
    if (pageForm) {
      pageForm.name.value = d.name;
      pageForm.phone.value = d.phone;
      if (pageForm.vehicle) pageForm.vehicle.value = d.vehicle || '';
      if (pageForm.message) pageForm.message.value = `[via chat] ${d.location || ''}`.trim();
      const sel = document.getElementById('serviceSelect');
      const opt = sel && [...sel.options].find(o => o.text === d.service);
      if (opt) sel.value = opt.value;
    }
    try {
      await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, lang: ctx.lang, source: 'chat' }) });
    } catch { /* static hosting: no backend yet */ }
    return say(done(d), ['call']);
  };

  /* ================= Main handler ================= */
  const CAR_QUESTION = /\n\n[^\n]*(make, model and year|марку, модель и год|марка, модель и год|марку, модель і рік|марка, модель і рік|marca, modelo y año)[^\n]*$/i;

  const handle = async (text, forcedIntent = null) => {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    input.disabled = true;
    add('user', text);
    setChips([]);
    if (!forcedIntent) {
      const lang = detectLang(text);
      if (lang !== ctx.lang) { ctx.lang = lang; applyUi(); }
    }

    try {
      if (ctx.flow && !forcedIntent) return await flowAnswer(text);

      const hasVehicle = detectVehicle(text);
      const phoneDigits = text.replace(/\D/g, '');
      let id = forcedIntent || classify(text);

      // visitor just typed their phone number → start a callback request with it
      if (!id && phoneDigits.length >= 10 && phoneDigits.length <= 11) return await startFlow({ phone: text });

      if (id && I[id].service) ctx.service = I[id].service;
      if (id === 'book') return await startFlow();

      if (!id && hasVehicle) {
        ctx.misses = 0;
        const eu = EUROPEAN.includes(ctx.brand);
        const v = car();
        return await say({
          en: `Got it — **${v}**. ✅ ${ctx.brand ? `We work with ${ctx.brand}${eu ? ', including high-security European systems' : ''}.` : ''}\n\nWhat do you need: a spare, a lost key replaced, a smart key, or a lockout?`,
          ru: `Понял — **${v}**. ✅ ${ctx.brand ? `С ${ctx.brand} работаем${eu ? ', в том числе с европейскими системами повышенной защиты' : ''}.` : ''}\n\nЧто нужно: дубликат, восстановление утерянного ключа, смарт-ключ или вскрытие?`,
          uk: `Зрозумів — **${v}**. ✅ ${ctx.brand ? `З ${ctx.brand} працюємо${eu ? ', зокрема з європейськими системами підвищеного захисту' : ''}.` : ''}\n\nЩо потрібно: дублікат, відновлення загубленого ключа, смарт-ключ чи відкриття авто?`,
          es: `Entendido — **${v}**. ✅ ${ctx.brand ? `Trabajamos con ${ctx.brand}${eu ? ', incluidos sistemas europeos de alta seguridad' : ''}.` : ''}\n\n¿Qué necesita: una copia, reemplazar una llave perdida, una llave inteligente o abrir el carro?`,
        }[ctx.lang], ['spare', 'lost', 'smart', 'lockout']);
      }

      if (!id) {
        ctx.misses++;
        return await say(ctx.misses > 1 ? {
          en: `I may not have understood that one 🙈 The technician can answer anything by phone: **${PHONE}**. Or pick a topic below.`,
          ru: `Кажется, я не совсем понял 🙈 Мастер ответит на любой вопрос по телефону: **${PHONE}**. Или выберите тему ниже.`,
          uk: `Здається, я не зовсім зрозумів 🙈 Майстер відповість на будь-яке питання телефоном: **${PHONE}**. Або оберіть тему нижче.`,
          es: `Creo que no entendí bien 🙈 El técnico puede responder cualquier pregunta por teléfono: **${PHONE}**. O elija un tema abajo.`,
        }[ctx.lang] : {
          en: 'I can help with **lockouts, lost keys, spare keys, smart keys & remotes**, prices, timing, and our locksmith **Academy**. What happened — and what car do you drive?',
          ru: 'Я помогу с **вскрытием авто, утерей ключей, дубликатами, смарт-ключами и пультами**, ценами, сроками и нашей **Академией**. Что случилось и какая у вас машина?',
          uk: 'Я допоможу з **відкриттям авто, втратою ключів, дублікатами, смарт-ключами й пультами**, цінами, термінами та нашою **Академією**. Що сталося і яка у вас машина?',
          es: 'Puedo ayudar con **aperturas, llaves perdidas, copias, llaves inteligentes y controles**, precios, tiempos y nuestra **Academia**. ¿Qué pasó y qué carro tiene?',
        }[ctx.lang], ctx.misses > 1 ? ['call', 'book', 'lockout', 'lost'] : START_CHIPS);
      }

      ctx.misses = 0;
      const r = I[id].r[ctx.lang];
      let reply = typeof r === 'function' ? r() : r;
      // the visitor already told us the car → don't ask for it again
      if (car()) reply = reply.replace(CAR_QUESTION, {
        en: `\n\nFor your **${car()}** — want us to call you back with a price?`,
        ru: `\n\nДля вашего **${car()}** — перезвонить вам с ценой?`,
        uk: `\n\nДля вашого **${car()}** — передзвонити вам із ціною?`,
        es: `\n\nPara su **${car()}** — ¿le llamamos con el precio?`,
      }[ctx.lang]);
      await say(reply, I[id].chips);
    } finally {
      busy = false;
      input.disabled = false;
      input.focus();
    }
  };

  /* ================= Open / close ================= */
  const greet = () => {
    add('bot', UI.greet[ctx.lang]);
    setChips(START_CHIPS);
  };
  const open = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    fab.classList.add('is-hidden');
    if (!body.children.length) greet();
    setTimeout(() => input.focus(), 250);
  };
  const close = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    fab.classList.remove('is-hidden');
  };
  document.querySelectorAll('[data-open-assistant]').forEach(b => b.addEventListener('click', open));
  document.getElementById('aiClose').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; handle(v); });
  applyUi();
})();
