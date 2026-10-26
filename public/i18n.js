/* Site translations: EN / RU / UA / ES.
   Elements carry data-i18n="key" (inner HTML is replaced) or data-i18n-attr="attr:key;attr2:key2".
   The chosen language is shared with the chat bot through localStorage ("km-lang")
   and the "km:lang" event on window. */
(() => {
  const LANGS = ['ru', 'en', 'uk']; // Russian is the main language
  const KEY = 'km-lang';

  const T = {
    'nav.services': { en: 'Services', ru: 'Услуги', uk: 'Послуги', es: 'Servicios' },
    'nav.work': { en: 'Our work', ru: 'Наши работы', uk: 'Наші роботи', es: 'Trabajos' },
    'nav.how': { en: 'How it works', ru: 'Как мы работаем', uk: 'Як ми працюємо', es: 'Cómo funciona' },
    'nav.why': { en: 'Why us', ru: 'Почему мы', uk: 'Чому ми', es: 'Por qué nosotros' },
    'nav.academy': { en: 'Academy', ru: 'Академия', uk: 'Академія', es: 'Academia' },
    'nav.faq': { en: 'FAQ', ru: 'Вопросы', uk: 'Питання', es: 'Preguntas' },
    'nav.contacts': { en: 'Contacts', ru: 'Контакты', uk: 'Контакти', es: 'Contacto' },
    'nav.call': { en: 'Call now', ru: 'Позвонить', uk: 'Подзвонити', es: 'Llamar' },

    'hero.pill': { en: 'Mobile team on the road across Chicago', ru: 'Выездная бригада по всему Чикаго', uk: 'Виїзна бригада по всьому Чикаго', es: 'Equipo móvil en todo Chicago' },
    'hero.h1a': { en: 'Need keys?', ru: 'Нужны ключи?', uk: 'Потрібні ключі?', es: '¿Necesita llaves?' },
    'hero.h1b': { en: 'No problem.', ru: 'Без проблем.', uk: 'Без проблем.', es: 'Sin problema.' },
    'hero.lead': {
      en: 'Lost key, lockout or a spare smart key — we come to your home, office or roadside and program it on the spot. Response <b>from 30 minutes</b>.',
      ru: 'Потеряли ключ, захлопнули машину или нужен запасной смарт-ключ — приедем домой, в офис или на дорогу и пропишем ключ на месте. Приезд <b>от 30 минут</b>.',
      uk: 'Загубили ключ, зачинили машину чи потрібен запасний смарт-ключ — приїдемо додому, в офіс або на дорогу й пропишемо ключ на місці. Приїзд <b>від 30 хвилин</b>.',
      es: 'Llave perdida, carro cerrado o una llave inteligente de repuesto: vamos a su casa, oficina o carretera y la programamos en el lugar. Llegamos <b>desde 30 minutos</b>.',
    },
    'hero.call': { en: 'Call 224-253-3252', ru: 'Звонить 224-253-3252', uk: 'Дзвонити 224-253-3252', es: 'Llamar 224-253-3252' },
    'hero.chat': { en: 'Chat with us', ru: 'Написать в чат', uk: 'Написати в чат', es: 'Escríbanos' },
    'hero.s1': { en: 'min response time', ru: 'минут — время приезда', uk: 'хвилин — час приїзду', es: 'min de tiempo de llegada' },
    'hero.s2': { en: 'month warranty on keys', ru: 'месяцев гарантии на ключи', uk: 'місяців гарантії на ключі', es: 'meses de garantía en llaves' },
    'hero.s3': { en: 'equipment &amp; programming', ru: 'оборудование и прошивка', uk: 'обладнання та програмування', es: 'equipo y programación' },
    'badge.a': { en: 'Smart key', ru: 'Смарт-ключ', uk: 'Смарт-ключ', es: 'Llave inteligente' },
    'badge.as': { en: 'programmed on site', ru: 'прописываем на месте', uk: 'прописуємо на місці', es: 'programada en el lugar' },
    'badge.b': { en: '12-mo', ru: '12 мес.', uk: '12 міс.', es: '12 meses' },
    'badge.bs': { en: 'warranty', ru: 'гарантия', uk: 'гарантія', es: 'de garantía' },

    'brands.eyebrow': { en: 'Most car brands supported', ru: 'Работаем с большинством марок', uk: 'Працюємо з більшістю марок', es: 'Trabajamos con la mayoría de marcas' },
    'brands.title': { en: 'Domestic, Asian &amp; European', ru: 'Американские, азиатские и европейские', uk: 'Американські, азійські та європейські', es: 'Americanas, asiáticas y europeas' },

    'work.eyebrow': { en: 'Our work', ru: 'Наши работы', uk: 'Наші роботи', es: 'Nuestro trabajo' },
    'work.title': { en: 'Project showcase', ru: 'Реальные выезды', uk: 'Реальні виїзди', es: 'Trabajos reales' },
    'work.more': { en: 'More on YouTube →', ru: 'Больше на YouTube →', uk: 'Більше на YouTube →', es: 'Más en YouTube →' },
    'shot.t1': { en: 'Key cutting', ru: 'Нарезка', uk: 'Нарізання', es: 'Corte' },
    'shot.c1': { en: 'Car key copy on the spot', ru: 'Дубликат ключа на месте', uk: 'Дублікат ключа на місці', es: 'Copia de llave en el lugar' },
    'shot.c2': { en: 'Key for a BMW M6', ru: 'Ключ для BMW M6', uk: 'Ключ для BMW M6', es: 'Llave para BMW M6' },
    'shot.c3': { en: 'Mercedes FSB4 key programming', ru: 'Прошивка ключа Mercedes FSB4', uk: 'Програмування ключа Mercedes FSB4', es: 'Programación de llave Mercedes FSB4' },
    'shot.t4': { en: 'Programming', ru: 'Прошивка', uk: 'Програмування', es: 'Programación' },
    'shot.c4': { en: 'Key programming without the dealership', ru: 'Прошивка ключа без дилера', uk: 'Програмування ключа без дилера', es: 'Programación sin concesionario' },
    'shot.c5': { en: 'New key for a 2016 Volvo XC90', ru: 'Новый ключ для Volvo XC90 2016', uk: 'Новий ключ для Volvo XC90 2016', es: 'Llave nueva para Volvo XC90 2016' },
    'shot.t6': { en: 'Smart keys', ru: 'Смарт-ключи', uk: 'Смарт-ключі', es: 'Llaves inteligentes' },
    'shot.c6': { en: 'Extra key for a luxury car', ru: 'Запасной ключ для премиум-авто', uk: 'Запасний ключ для преміум-авто', es: 'Llave extra para auto de lujo' },
    'shot.c7': { en: 'Keys for any Ford and Lincoln', ru: 'Ключи для любых Ford и Lincoln', uk: 'Ключі для будь-яких Ford і Lincoln', es: 'Llaves para cualquier Ford y Lincoln' },
    'shot.t8': { en: 'Mobile', ru: 'Выезд', uk: 'Виїзд', es: 'Móvil' },
    'shot.c8': { en: 'Car keys at your doorstep', ru: 'Ключи прямо у вашего дома', uk: 'Ключі просто біля вашого дому', es: 'Llaves en la puerta de su casa' },
    'shot.t9': { en: 'On the job', ru: 'В работе', uk: 'У роботі', es: 'En acción' },
    'shot.c9': { en: 'Work never stops', ru: 'Работаем без остановок', uk: 'Працюємо без зупинок', es: 'El trabajo nunca para' },
    'shot.c10': { en: 'Need keys? No problem!', ru: 'Нужны ключи? Без проблем!', uk: 'Потрібні ключі? Без проблем!', es: '¿Llaves? ¡Sin problema!' },

    'sv.h2a': { en: 'Everything for your car keys —', ru: 'Всё для ваших автоключей —', uk: 'Усе для ваших автоключів —', es: 'Todo para las llaves de su carro —' },
    'sv.h2b': { en: 'on the spot', ru: 'на месте', uk: 'на місці', es: 'en el lugar' },
    'sv.p': { en: 'Our mobile team handles smart keys, fobs and high-security programming with speed and precision.', ru: 'Наша выездная бригада быстро и точно работает со смарт-ключами, брелоками и сложной прошивкой.', uk: 'Наша виїзна бригада швидко й точно працює зі смарт-ключами, брелоками та складним програмуванням.', es: 'Nuestro equipo móvil trabaja con llaves inteligentes, fobs y programación de alta seguridad con rapidez y precisión.' },
    'sv.cta': { en: 'Request a quote', ru: 'Узнать цену', uk: 'Дізнатися ціну', es: 'Pedir precio' },
    'sv.badge': { en: 'Emergency', ru: 'Срочно', uk: 'Терміново', es: 'Urgente' },
    'sv.1h': { en: 'Car Key Duplication', ru: 'Дубликаты ключей', uk: 'Дублікати ключів', es: 'Copias de llaves' },
    'sv.1p': { en: 'Precise cutting of standard and high-security keys. A spare made in minutes, not days.', ru: 'Точная нарезка обычных и высокозащищённых ключей. Запасной ключ за минуты, а не за дни.', uk: 'Точне нарізання звичайних і високозахищених ключів. Запасний ключ за хвилини, а не за дні.', es: 'Corte preciso de llaves normales y de alta seguridad. Una copia en minutos, no en días.' },
    'sv.2h': { en: 'Smart Keys &amp; Remotes', ru: 'Смарт-ключи и пульты', uk: 'Смарт-ключі та пульти', es: 'Llaves inteligentes y controles' },
    'sv.2p': { en: 'Proximity keys, push-to-start fobs and remotes — supplied, cut and programmed to your car.', ru: 'Бесключевой доступ, брелоки для кнопки Start и пульты — поставим, нарежем и пропишем под вашу машину.', uk: 'Безключовий доступ, брелоки для кнопки Start і пульти — постачимо, наріжемо й пропишемо під вашу машину.', es: 'Llaves de proximidad, fobs push-to-start y controles: los suministramos, cortamos y programamos para su carro.' },
    'sv.3h': { en: 'OEM Equipment', ru: 'OEM-оборудование', uk: 'OEM-обладнання', es: 'Equipo OEM' },
    'sv.3p': { en: 'Professional diagnostic and programming tools, the same class dealerships use.', ru: 'Профессиональное диагностическое и программирующее оборудование того же класса, что у дилеров.', uk: 'Професійне діагностичне й програмувальне обладнання того ж класу, що в дилерів.', es: 'Herramientas profesionales de diagnóstico y programación, de la misma clase que usan los concesionarios.' },
    'sv.4h': { en: 'Emergency Lockouts', ru: 'Вскрытие авто', uk: 'Відкриття авто', es: 'Aperturas de emergencia' },
    'sv.4p': { en: 'Keys locked inside? We open your car without damage — home, office or roadside.', ru: 'Ключи остались внутри? Откроем машину без повреждений — у дома, офиса или на дороге.', uk: 'Ключі залишилися всередині? Відкриємо машину без пошкоджень — біля дому, офісу чи на дорозі.', es: '¿Llaves adentro? Abrimos su carro sin daños: en casa, en la oficina o en la carretera.' },
    'sv.5h': { en: 'Lost Key Replacement', ru: 'Восстановление ключа', uk: 'Відновлення ключа', es: 'Reemplazo de llave perdida' },
    'sv.5p': { en: 'No key at all? We make and program a new one from scratch, even when all keys are lost.', ru: 'Ключей нет совсем? Сделаем и пропишем новый с нуля, даже если все ключи утеряны.', uk: 'Ключів немає зовсім? Зробимо й пропишемо новий з нуля, навіть якщо всі ключі загублено.', es: '¿No tiene ninguna llave? Hacemos y programamos una nueva desde cero, aunque se hayan perdido todas.' },
    'sv.6h': { en: 'Most Car Brands', ru: 'Большинство марок', uk: 'Більшість марок', es: 'La mayoría de marcas' },
    'sv.6p': { en: 'Domestic, Asian and European — including BMW, Mercedes-Benz and Volvo.', ru: 'Американские, азиатские и европейские — включая BMW, Mercedes-Benz и Volvo.', uk: 'Американські, азійські та європейські — зокрема BMW, Mercedes-Benz і Volvo.', es: 'Americanas, asiáticas y europeas, incluidas BMW, Mercedes-Benz y Volvo.' },

    'how.h2a': { en: 'Back on the road in', ru: 'Снова в пути за', uk: 'Знову в дорозі за', es: 'De vuelta al camino en' },
    'how.h2b': { en: '3 steps', ru: '3 шага', uk: '3 кроки', es: '3 pasos' },
    'how.1h': { en: 'Call or message', ru: 'Позвоните или напишите', uk: 'Зателефонуйте або напишіть', es: 'Llame o escriba' },
    'how.1p': { en: "Tell us your car's make, model, year and where you are. Get a price upfront.", ru: 'Назовите марку, модель, год машины и где вы находитесь. Цену скажем заранее.', uk: 'Назвіть марку, модель, рік машини та де ви знаходитеся. Ціну скажемо заздалегідь.', es: 'Díganos marca, modelo y año de su carro y dónde está. Le damos el precio por adelantado.' },
    'how.2h': { en: 'We drive to you', ru: 'Мы приезжаем', uk: 'Ми приїжджаємо', es: 'Vamos a usted' },
    'how.2p': { en: 'A fully equipped mobile van arrives — typically from 30 minutes.', ru: 'Полностью оборудованный фургон приезжает — обычно от 30 минут.', uk: 'Повністю обладнаний фургон приїжджає — зазвичай від 30 хвилин.', es: 'Llega una camioneta totalmente equipada, normalmente desde 30 minutos.' },
    'how.3h': { en: 'Key ready on site', ru: 'Ключ готов на месте', uk: 'Ключ готовий на місці', es: 'Llave lista en el lugar' },
    'how.3p': { en: 'We cut, program and test the key with you. Covered by a 12-month warranty.', ru: 'Нарезаем, прописываем и проверяем ключ при вас. Гарантия 12 месяцев.', uk: 'Нарізаємо, прописуємо й перевіряємо ключ при вас. Гарантія 12 місяців.', es: 'Cortamos, programamos y probamos la llave con usted. Con 12 meses de garantía.' },

    'why.eyebrow': { en: 'Why Key Man', ru: 'Почему Key Man', uk: 'Чому Key Man', es: 'Por qué Key Man' },
    'why.h2a': { en: 'Fast. Fair.', ru: 'Быстро. Честно.', uk: 'Швидко. Чесно.', es: 'Rápido. Justo.' },
    'why.h2b': { en: 'Guaranteed.', ru: 'С гарантией.', uk: 'З гарантією.', es: 'Garantizado.' },
    'why.p': { en: "Lost your key? Locked out? Need a spare? We've got you covered. Trusted by drivers, dealerships and businesses across Chicago.", ru: 'Потеряли ключ? Захлопнули машину? Нужен запасной? Мы поможем. Нам доверяют водители, дилеры и компании по всему Чикаго.', uk: 'Загубили ключ? Зачинили машину? Потрібен запасний? Ми допоможемо. Нам довіряють водії, дилери та компанії по всьому Чикаго.', es: '¿Perdió la llave? ¿Se quedó afuera? ¿Necesita una copia? Nosotros nos encargamos. Conductores, concesionarios y empresas de Chicago confían en nosotros.' },
    'unit.min': { en: 'min', ru: 'мин', uk: 'хв', es: 'min' },
    'unit.mo': { en: 'mo', ru: 'мес', uk: 'міс', es: 'meses' },
    'why.1': { en: 'Fast response — from 30 minutes', ru: 'Быстрый приезд — от 30 минут', uk: 'Швидкий приїзд — від 30 хвилин', es: 'Llegada rápida, desde 30 minutos' },
    'why.2': { en: 'Best prices in Chicago — no dealership markup', ru: 'Лучшие цены в Чикаго — без дилерской наценки', uk: 'Найкращі ціни в Чикаго — без дилерської націнки', es: 'Mejores precios de Chicago, sin recargo de concesionario' },
    'why.3': { en: 'Warranty on all keys', ru: 'Гарантия на все ключи', uk: 'Гарантія на всі ключі', es: 'Garantía en todas las llaves' },
    'why.4': { en: 'Mobile service — home, office, roadside', ru: 'Выезд — дом, офис, дорога', uk: 'Виїзд — дім, офіс, дорога', es: 'Servicio móvil: casa, oficina, carretera' },

    'ac.h2a': { en: 'Become a pro', ru: 'Станьте профи —', uk: 'Станьте профі —', es: 'Conviértase en' },
    'ac.h2b': { en: 'auto locksmith', ru: 'автослесарем по ключам', uk: 'автослюсарем по ключах', es: 'cerrajero automotriz' },
    'ac.p': { en: 'Stop working for someone else and start building your own future. Hands-on training: cut, program and repair car keys, and open locks like a pro — then start your own business or get hired right away.', ru: 'Хватит работать на кого-то — стройте своё будущее. Практическое обучение: нарезка, прошивка и ремонт автоключей, профессиональное вскрытие замков — а потом своё дело или работа сразу после курса.', uk: 'Годі працювати на когось — будуйте своє майбутнє. Практичне навчання: нарізання, програмування й ремонт автоключів, професійне відкриття замків — а потім власна справа або робота одразу після курсу.', es: 'Deje de trabajar para otros y construya su futuro. Formación práctica: cortar, programar y reparar llaves y abrir cerraduras como un profesional; después, su propio negocio o trabajo de inmediato.' },
    'ac.l1': { en: 'Level 1', ru: 'Уровень 1', uk: 'Рівень 1', es: 'Nivel 1' },
    'ac.l2': { en: 'Level 2 · Popular', ru: 'Уровень 2 · Популярный', uk: 'Рівень 2 · Популярний', es: 'Nivel 2 · Popular' },
    'ac.l3': { en: 'Level 3', ru: 'Уровень 3', uk: 'Рівень 3', es: 'Nivel 3' },
    'ac.1p': { en: 'Key cutting, duplication and basic transponders.', ru: 'Нарезка ключей, дубликаты и базовые транспондеры.', uk: 'Нарізання ключів, дублікати та базові транспондери.', es: 'Corte de llaves, copias y transpondedores básicos.' },
    'ac.1a': { en: 'Key cutting machines', ru: 'Станки для нарезки', uk: 'Верстати для нарізання', es: 'Máquinas de corte' },
    'ac.1b': { en: 'Duplication workflow', ru: 'Изготовление дубликатов', uk: 'Виготовлення дублікатів', es: 'Proceso de copias' },
    'ac.1c': { en: 'Basic transponders', ru: 'Базовые транспондеры', uk: 'Базові транспондери', es: 'Transpondedores básicos' },
    'ac.2p': { en: 'Immobilizers, key cloning and working with dealer software.', ru: 'Иммобилайзеры, клонирование ключей и дилерский софт.', uk: 'Іммобілайзери, клонування ключів і дилерське ПЗ.', es: 'Inmovilizadores, clonación de llaves y software de concesionario.' },
    'ac.2a': { en: 'Immobilizer systems', ru: 'Системы иммобилайзера', uk: 'Системи іммобілайзера', es: 'Sistemas inmovilizadores' },
    'ac.2b': { en: 'Key cloning', ru: 'Клонирование ключей', uk: 'Клонування ключів', es: 'Clonación de llaves' },
    'ac.2c': { en: 'Dealer software', ru: 'Дилерский софт', uk: 'Дилерське ПЗ', es: 'Software de concesionario' },
    'ac.3p': { en: 'BMW, Mercedes, Volvo, advanced security systems and high-end equipment.', ru: 'BMW, Mercedes, Volvo, сложные системы безопасности и профессиональное оборудование.', uk: 'BMW, Mercedes, Volvo, складні системи безпеки та професійне обладнання.', es: 'BMW, Mercedes, Volvo, sistemas de seguridad avanzados y equipo de alta gama.' },
    'ac.3a': { en: 'European premium brands', ru: 'Европейский премиум', uk: 'Європейський преміум', es: 'Marcas premium europeas' },
    'ac.3b': { en: 'Advanced security', ru: 'Сложная защита', uk: 'Складний захист', es: 'Seguridad avanzada' },
    'ac.3c': { en: 'High-end equipment', ru: 'Топовое оборудование', uk: 'Топове обладнання', es: 'Equipo de alta gama' },
    'ac.cta': { en: 'Get more info', ru: 'Узнать подробнее', uk: 'Дізнатися більше', es: 'Más información' },

    'so.yt': { en: 'Watch real jobs and key programming', ru: 'Реальные выезды и прошивка ключей', uk: 'Реальні виїзди та програмування ключів', es: 'Trabajos reales y programación de llaves' },

    'faq.h2': { en: 'Questions drivers ask', ru: 'Частые вопросы', uk: 'Часті питання', es: 'Preguntas frecuentes' },
    'faq.1q': { en: 'How fast can you get to me?', ru: 'Как быстро вы приедете?', uk: 'Як швидко ви приїдете?', es: '¿Qué tan rápido pueden llegar?' },
    'faq.1a': { en: "Response time starts from 30 minutes depending on your location in the Chicago area and traffic. Call us and we'll give you a real ETA.", ru: 'Приезжаем от 30 минут — зависит от вашего адреса в районе Чикаго и пробок. Позвоните, и мы назовём точное время.', uk: 'Приїжджаємо від 30 хвилин — залежить від вашої адреси в районі Чикаго та заторів. Зателефонуйте, і ми назвемо точний час.', es: 'Llegamos desde 30 minutos, según su ubicación en el área de Chicago y el tráfico. Llámenos y le daremos un tiempo real.' },
    'faq.2q': { en: 'Can you make a key if I lost all my keys?', ru: 'Сделаете ключ, если потеряны все ключи?', uk: 'Зробите ключ, якщо загублено всі ключі?', es: '¿Pueden hacer una llave si perdí todas?' },
    'faq.2a': { en: 'Yes. We can create and program a brand-new key for most vehicles even when no working key is available.', ru: 'Да. Мы сделаем и пропишем новый ключ для большинства автомобилей, даже если рабочего ключа нет.', uk: 'Так. Ми виготовимо й пропишемо новий ключ для більшості автомобілів, навіть якщо робочого ключа немає.', es: 'Sí. Podemos hacer y programar una llave nueva para la mayoría de vehículos aunque no haya ninguna llave funcional.' },
    'faq.3q': { en: 'Is it cheaper than the dealership?', ru: 'Это дешевле, чем у дилера?', uk: 'Це дешевше, ніж у дилера?', es: '¿Es más barato que el concesionario?' },
    'faq.3a': { en: "Usually, yes — and you don't need to tow your car. We come to you with OEM-grade equipment.", ru: 'Обычно да — и не нужен эвакуатор. Мы приезжаем к вам с оборудованием уровня OEM.', uk: 'Зазвичай так — і не потрібен евакуатор. Ми приїжджаємо до вас з обладнанням рівня OEM.', es: 'Normalmente sí, y no necesita remolcar su carro. Vamos a usted con equipo de nivel OEM.' },
    'faq.4q': { en: 'Will you damage my car during a lockout?', ru: 'Не повредите машину при вскрытии?', uk: 'Не пошкодите машину під час відкриття?', es: '¿Dañarán mi carro al abrirlo?' },
    'faq.4a': { en: 'No. We use professional tools and techniques designed to open vehicles without damage.', ru: 'Нет. Мы используем профессиональные инструменты и методы для вскрытия без повреждений.', uk: 'Ні. Ми використовуємо професійні інструменти та методи для відкриття без пошкоджень.', es: 'No. Usamos herramientas y técnicas profesionales para abrir vehículos sin daños.' },
    'faq.5q': { en: 'Is there a warranty?', ru: 'Есть ли гарантия?', uk: 'Чи є гарантія?', es: '¿Hay garantía?' },
    'faq.5a': { en: 'Every key we make is covered by a 12-month warranty.', ru: 'На каждый наш ключ — гарантия 12 месяцев.', uk: 'На кожен наш ключ — гарантія 12 місяців.', es: 'Cada llave que hacemos tiene 12 meses de garantía.' },
    'faq.6q': { en: 'What info do you need for a quote?', ru: 'Что нужно, чтобы узнать цену?', uk: 'Що потрібно, щоб дізнатися ціну?', es: '¿Qué datos necesitan para el precio?' },
    'faq.6a': { en: 'Make, model and year of the vehicle, the type of key (regular, remote, smart/push-to-start), and your location.', ru: 'Марка, модель и год машины, тип ключа (обычный, с пультом, смарт-ключ) и ваше местоположение.', uk: 'Марка, модель і рік машини, тип ключа (звичайний, з пультом, смарт-ключ) і ваше місцезнаходження.', es: 'Marca, modelo y año del vehículo, tipo de llave (normal, con control, inteligente) y su ubicación.' },

    'ct.h2a': { en: 'Ask a question or', ru: 'Задайте вопрос или', uk: 'Поставте питання або', es: 'Haga una pregunta o' },
    'ct.h2b': { en: 'order a key', ru: 'закажите ключ', uk: 'замовте ключ', es: 'pida una llave' },
    'ct.p': { en: "Leave your details and we'll call you back — or just call us now.", ru: 'Оставьте контакты — мы перезвоним. Или просто позвоните нам.', uk: 'Залиште контакти — ми передзвонимо. Або просто зателефонуйте нам.', es: 'Deje sus datos y le llamamos, o llámenos ahora mismo.' },
    'ct.l1': { en: 'Mobile service across Chicago', ru: 'Выезд по всему Чикаго', uk: 'Виїзд по всьому Чикаго', es: 'Servicio móvil en todo Chicago' },
    'ct.l2': { en: 'Home · Office · Roadside', ru: 'Дом · Офис · Дорога', uk: 'Дім · Офіс · Дорога', es: 'Casa · Oficina · Carretera' },
    'ct.l3': { en: '12-month warranty on all keys', ru: 'Гарантия 12 месяцев на все ключи', uk: 'Гарантія 12 місяців на всі ключі', es: '12 meses de garantía en todas las llaves' },
    'fm.title': { en: 'Get a free quote', ru: 'Бесплатный расчёт', uk: 'Безкоштовний розрахунок', es: 'Presupuesto gratis' },
    'fm.name': { en: 'Name *', ru: 'Имя *', uk: "Ім'я *", es: 'Nombre *' },
    'fm.namePh': { en: 'John', ru: 'Иван', uk: 'Іван', es: 'Juan' },
    'fm.phone': { en: 'Phone *', ru: 'Телефон *', uk: 'Телефон *', es: 'Teléfono *' },
    'fm.service': { en: 'Service', ru: 'Услуга', uk: 'Послуга', es: 'Servicio' },
    'fm.vehicle': { en: 'Vehicle', ru: 'Автомобиль', uk: 'Автомобіль', es: 'Vehículo' },
    'fm.message': { en: 'Message', ru: 'Сообщение', uk: 'Повідомлення', es: 'Mensaje' },
    'fm.messagePh': { en: 'What happened? Where are you?', ru: 'Что случилось? Где вы находитесь?', uk: 'Що сталося? Де ви знаходитеся?', es: '¿Qué pasó? ¿Dónde está?' },
    'fm.other': { en: 'Other / not sure', ru: 'Другое / не знаю', uk: 'Інше / не знаю', es: 'Otro / no estoy seguro' },
    'fm.send': { en: 'Send request', ru: 'Отправить заявку', uk: 'Надіслати заявку', es: 'Enviar solicitud' },
    'fm.note': {
      en: 'By sending, you agree to our <a href="https://keymanchicago.com/privacy">Personal Data Processing Policy</a>.',
      ru: 'Отправляя заявку, вы соглашаетесь с <a href="https://keymanchicago.com/privacy">политикой обработки персональных данных</a>.',
      uk: 'Надсилаючи заявку, ви погоджуєтеся з <a href="https://keymanchicago.com/privacy">політикою обробки персональних даних</a>.',
      es: 'Al enviar, acepta nuestra <a href="https://keymanchicago.com/privacy">política de tratamiento de datos personales</a>.',
    },
    'fm.ok': { en: "Thanks! We'll call you back shortly.", ru: 'Спасибо! Скоро перезвоним.', uk: 'Дякуємо! Незабаром передзвонимо.', es: '¡Gracias! Le llamaremos pronto.' },

    'ft.copy': { en: '© 2026 Key Man Chicago. Copying of materials is prohibited.', ru: '© 2026 Key Man Chicago. Копирование материалов запрещено.', uk: '© 2026 Key Man Chicago. Копіювання матеріалів заборонено.', es: '© 2026 Key Man Chicago. Prohibida la copia de materiales.' },
    'ft.privacy': { en: 'Privacy policy', ru: 'Политика конфиденциальности', uk: 'Політика конфіденційності', es: 'Política de privacidad' },
    'badge.c': { en: 'On the way', ru: 'Уже в пути', uk: 'Вже в дорозі' },
    'badge.cs': { en: 'from 30 minutes', ru: 'от 30 минут', uk: 'від 30 хвилин' },
    'ph.1': { en: 'Smart key programming', ru: 'Прошивка смарт-ключа', uk: 'Програмування смарт-ключа' },
    'ph.2': { en: 'Precision key cutting', ru: 'Точная нарезка ключа', uk: 'Точне нарізання ключа' },
    'ph.3': { en: 'On-site job at the client’s car', ru: 'Работа прямо у машины клиента', uk: 'Робота просто біля машини клієнта' },
    'ph.4': { en: 'Dealer-level programming tools', ru: 'Оборудование дилерского уровня', uk: 'Обладнання дилерського рівня' },
    'ph.5': { en: 'Workshop on wheels', ru: 'Мастерская на колёсах', uk: 'Майстерня на колесах' },
    'ph.6': { en: 'Module and immobilizer work', ru: 'Работа с блоками и иммобилайзером', uk: 'Робота з блоками та іммобілайзером' },
    'ph.7': { en: 'New key in your hands', ru: 'Новый ключ у вас в руках', uk: 'Новий ключ у ваших руках' },
    'ph.8': { en: 'Hundreds of keys in stock', ru: 'Сотни ключей в наличии', uk: 'Сотні ключів у наявності' },
    'why.cap': { en: 'Your mobile locksmith', ru: 'Ваш выездной мастер', uk: 'Ваш виїзний майстер' },
    'ai.tab1': { en: 'AI assistant', ru: 'ИИ-ассистент', uk: 'ШІ-асистент' },
    'ai.tab2': { en: 'Quick request', ru: 'Быстрая заявка', uk: 'Швидка заявка' },
    'ai.disc': { en: 'Assistant answers are general guidance. The technician will confirm the exact price by phone.', ru: 'Ответы ассистента носят справочный характер. Точную цену мастер назовёт по телефону.', uk: 'Відповіді асистента мають довідковий характер. Точну ціну майстер назве телефоном.' },
    'ai.l.name': { en: 'Your name', ru: 'Ваше имя', uk: 'Ваше імʼя' },
    'ai.l.contact': { en: 'How can we reach you? *', ru: 'Как с вами связаться? *', uk: 'Як з вами звʼязатися? *' },
    'ai.l.need': { en: 'What do you need? *', ru: 'Что нужно сделать? *', uk: 'Що потрібно зробити? *' },
    'ai.l.needPh': { en: '2019 Toyota Camry — lost key, I’m in Logan Square', ru: 'Toyota Camry 2019 — потерял ключ, я в Logan Square', uk: 'Toyota Camry 2019 — загубив ключ, я в Logan Square' },
    'ai.l.consent': { en: 'I consent to the processing of my personal data. <a href="https://keymanchicago.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>', ru: 'Я согласен на обработку персональных данных. <a href="https://keymanchicago.com/privacy" target="_blank" rel="noopener">Политика конфиденциальности</a>', uk: 'Я погоджуюся на обробку персональних даних. <a href="https://keymanchicago.com/privacy" target="_blank" rel="noopener">Політика конфіденційності</a>' },
    'ai.l.send': { en: 'Send request', ru: 'Отправить заявку', uk: 'Надіслати заявку' },
    'ai.l.ok': { en: 'Thank you! We will call you back shortly.', ru: 'Спасибо! Скоро перезвоним.', uk: 'Дякуємо! Незабаром передзвонимо.' },
    'ai.l.err': { en: 'Please enter a phone number, describe what you need and tick the consent box.', ru: 'Укажите телефон, опишите задачу и отметьте согласие.', uk: 'Вкажіть телефон, опишіть завдання й позначте згоду.' },
    'cb.chat': { en: 'Chat', ru: 'Чат', uk: 'Чат', es: 'Chat' },

    /* ---- Academy pages: course catalog, course page, student account ---- */
    'nav.home': { en: 'Home', ru: 'Главная', uk: 'Головна' },
    'nav.courses': { en: 'Courses', ru: 'Курсы', uk: 'Курси' },
    'nav.cabinet': { en: 'My account', ru: 'Кабинет', uk: 'Кабінет' },
    'ac.courses': { en: 'Online video courses', ru: 'Онлайн-видеокурсы', uk: 'Онлайн-відеокурси' },
    'acd.title': { en: 'Key Man Academy — online courses for auto locksmiths', ru: 'Key Man Academy — онлайн-курсы автослесаря по ключам', uk: 'Key Man Academy — онлайн-курси автослюсаря по ключах' },
    'acd.eyebrow': { en: 'Online training', ru: 'Онлайн-обучение', uk: 'Онлайн-навчання' },
    'acd.h1a': { en: 'Video courses', ru: 'Видеокурсы', uk: 'Відеокурси' },
    'acd.p': { en: 'Learn from working locksmiths in Chicago at your own pace: video lessons on cutting, programming and repairing car keys. Lifetime access in your personal account.', ru: 'Учитесь у практиков из Чикаго в своём темпе: видеоуроки по нарезке, программированию и ремонту автоключей. Доступ навсегда — в личном кабинете.', uk: 'Навчайтеся у практиків із Чикаго у своєму темпі: відеоуроки з нарізання, програмування та ремонту автоключів. Доступ назавжди — в особистому кабінеті.' },
    'acd.list': { en: 'All courses', ru: 'Все курсы', uk: 'Усі курси' },
    'acd.empty': { en: 'Courses are coming soon. Leave a request and we will tell you when they start.', ru: 'Курсы скоро появятся. Оставьте заявку — сообщим о старте.', uk: 'Курси незабаром зʼявляться. Залиште заявку — повідомимо про старт.' },
    'acd.emptyCta': { en: 'Leave a request', ru: 'Оставить заявку', uk: 'Залишити заявку' },
    'acd.lessonsN': { en: 'Lessons: {n}', ru: 'Уроков: {n}', uk: 'Уроків: {n}' },
    'acd.free': { en: 'Free', ru: 'Бесплатно', uk: 'Безкоштовно' },
    'acd.more': { en: 'View course', ru: 'Подробнее', uk: 'Детальніше' },
    'acd.owned': { en: 'In your account', ru: 'Уже в кабинете', uk: 'Вже в кабінеті' },
    'acd.howh': { en: 'How it works', ru: 'Как это работает', uk: 'Як це працює' },
    'acd.how1': { en: 'Sign up', ru: 'Регистрация', uk: 'Реєстрація' },
    'acd.how1p': { en: 'Create an account in a minute — all you need is an email.', ru: 'Создайте аккаунт за минуту — нужен только email.', uk: 'Створіть акаунт за хвилину — потрібен лише email.' },
    'acd.how2': { en: 'Pay', ru: 'Оплата', uk: 'Оплата' },
    'acd.how2p': { en: 'Secure card payment through Stripe.', ru: 'Безопасная оплата картой через Stripe.', uk: 'Безпечна оплата карткою через Stripe.' },
    'acd.how3': { en: 'Learn', ru: 'Учёба', uk: 'Навчання' },
    'acd.how3p': { en: 'The course opens in your account right away. Watch on any device.', ru: 'Курс сразу открывается в личном кабинете. Смотрите с любого устройства.', uk: 'Курс одразу відкривається в особистому кабінеті. Дивіться з будь-якого пристрою.' },

    'crs.back': { en: '← All courses', ru: '← Все курсы', uk: '← Усі курси' },
    'crs.buy': { en: 'Buy course', ru: 'Купить курс', uk: 'Купити курс' },
    'crs.getFree': { en: 'Get it free', ru: 'Получить бесплатно', uk: 'Отримати безкоштовно' },
    'crs.watch': { en: 'Watch lessons', ru: 'Смотреть уроки', uk: 'Дивитися уроки' },
    'crs.loginToBuy': { en: 'Sign in or create an account to buy the course.', ru: 'Войдите или зарегистрируйтесь, чтобы купить курс.', uk: 'Увійдіть або зареєструйтеся, щоб купити курс.' },
    'crs.program': { en: 'Course program', ru: 'Программа курса', uk: 'Програма курсу' },
    'crs.preview': { en: 'Free preview', ru: 'Бесплатно', uk: 'Безкоштовно' },
    'crs.locked': { en: 'This lesson opens after you buy the course.', ru: 'Урок откроется после покупки курса.', uk: 'Урок відкриється після покупки курсу.' },
    'crs.noVideo': { en: 'The video for this lesson is coming soon.', ru: 'Видео к этому уроку скоро появится.', uk: 'Відео до цього уроку незабаром зʼявиться.' },
    'crs.payOff': { en: 'Online payment is not switched on yet. Call us to buy the course: 224-253-3252', ru: 'Онлайн-оплата пока не подключена. Позвоните нам, чтобы купить курс: 224-253-3252', uk: 'Онлайн-оплату ще не підключено. Зателефонуйте нам, щоб купити курс: 224-253-3252' },
    'crs.notFound': { en: 'Course not found.', ru: 'Курс не найден.', uk: 'Курс не знайдено.' },
    'crs.access': { en: 'Lifetime access · any device', ru: 'Доступ навсегда · с любого устройства', uk: 'Доступ назавжди · з будь-якого пристрою' },
    'crs.pick': { en: 'Choose a lesson from the list', ru: 'Выберите урок из списка', uk: 'Оберіть урок зі списку' },
    'crs.redirect': { en: 'Opening the payment page…', ru: 'Переходим к оплате…', uk: 'Переходимо до оплати…' },

    'acc.title': { en: 'My account — Key Man Academy', ru: 'Личный кабинет — Key Man Academy', uk: 'Особистий кабінет — Key Man Academy' },
    'acc.h1': { en: 'My account', ru: 'Личный кабинет', uk: 'Особистий кабінет' },
    'acc.intro': { en: 'Your courses, progress and profile in one place.', ru: 'Ваши курсы и профиль — в одном месте.', uk: 'Ваші курси та профіль — в одному місці.' },
    'acc.login': { en: 'Sign in', ru: 'Вход', uk: 'Вхід' },
    'acc.register': { en: 'Create account', ru: 'Регистрация', uk: 'Реєстрація' },
    'acc.email': { en: 'Email', ru: 'Email', uk: 'Email' },
    'acc.password': { en: 'Password', ru: 'Пароль', uk: 'Пароль' },
    'acc.name': { en: 'Name', ru: 'Имя', uk: 'Імʼя' },
    'acc.phone': { en: 'Phone (optional)', ru: 'Телефон (необязательно)', uk: 'Телефон (необовʼязково)' },
    'acc.pwHint': { en: 'at least 8 characters', ru: 'минимум 8 символов', uk: 'щонайменше 8 символів' },
    'acc.loginBtn': { en: 'Sign in', ru: 'Войти', uk: 'Увійти' },
    'acc.regBtn': { en: 'Create account', ru: 'Создать аккаунт', uk: 'Створити акаунт' },
    'acc.forgot': { en: 'Forgot your password? Call or text us at 224-253-3252 and we will restore access.', ru: 'Забыли пароль? Позвоните или напишите нам: 224-253-3252 — восстановим доступ.', uk: 'Забули пароль? Зателефонуйте або напишіть нам: 224-253-3252 — відновимо доступ.' },
    'acc.hello': { en: 'Hello, {name}!', ru: 'Здравствуйте, {name}!', uk: 'Вітаємо, {name}!' },
    'acc.my': { en: 'My courses', ru: 'Мои курсы', uk: 'Мої курси' },
    'acc.none': { en: 'You have no courses yet.', ru: 'У вас пока нет курсов.', uk: 'У вас поки немає курсів.' },
    'acc.browse': { en: 'Browse courses', ru: 'Смотреть курсы', uk: 'Переглянути курси' },
    'acc.open': { en: 'Open course', ru: 'Открыть курс', uk: 'Відкрити курс' },
    'acc.profile': { en: 'Profile', ru: 'Профиль', uk: 'Профіль' },
    'acc.save': { en: 'Save', ru: 'Сохранить', uk: 'Зберегти' },
    'acc.saved': { en: 'Saved', ru: 'Сохранено', uk: 'Збережено' },
    'acc.changePw': { en: 'Change password', ru: 'Сменить пароль', uk: 'Змінити пароль' },
    'acc.curPw': { en: 'Current password', ru: 'Текущий пароль', uk: 'Поточний пароль' },
    'acc.newPw': { en: 'New password', ru: 'Новый пароль', uk: 'Новий пароль' },
    'acc.logout': { en: 'Sign out', ru: 'Выйти', uk: 'Вийти' },
    'acc.paidWait': { en: 'Checking your payment…', ru: 'Проверяем оплату…', uk: 'Перевіряємо оплату…' },
    'acc.paidOk': { en: 'Payment received! The course is now in your account.', ru: 'Оплата прошла! Курс добавлен в ваш кабинет.', uk: 'Оплата пройшла! Курс додано до вашого кабінету.' },
    'acc.paidErr': { en: 'We could not confirm the payment. If your card was charged, call us and we will open the course.', ru: 'Не удалось подтвердить оплату. Если деньги списались — позвоните нам, мы откроем доступ.', uk: 'Не вдалося підтвердити оплату. Якщо гроші списано — зателефонуйте нам, ми відкриємо доступ.' },

    'err.bad_email': { en: 'Please enter a valid email.', ru: 'Проверьте email.', uk: 'Перевірте email.' },
    'err.short_password': { en: 'The password must be at least 8 characters.', ru: 'Пароль — минимум 8 символов.', uk: 'Пароль — щонайменше 8 символів.' },
    'err.no_name': { en: 'Please enter your name.', ru: 'Укажите имя.', uk: 'Вкажіть імʼя.' },
    'err.email_taken': { en: 'This email is already registered. Sign in instead.', ru: 'Этот email уже зарегистрирован — войдите.', uk: 'Цей email уже зареєстровано — увійдіть.' },
    'err.bad_login': { en: 'Wrong email or password.', ru: 'Неверный email или пароль.', uk: 'Невірний email або пароль.' },
    'err.bad_password': { en: 'The current password is wrong.', ru: 'Текущий пароль неверный.', uk: 'Поточний пароль невірний.' },
    'err.too_many': { en: 'Too many attempts. Try again in 15 minutes.', ru: 'Слишком много попыток. Попробуйте через 15 минут.', uk: 'Забагато спроб. Спробуйте за 15 хвилин.' },
    'err.generic': { en: 'Something went wrong. Please try again.', ru: 'Что-то пошло не так. Попробуйте ещё раз.', uk: 'Щось пішло не так. Спробуйте ще раз.' },
  };

  const TITLES = {
    en: 'Key Man Chicago — Mobile Car Key & Lockout Service',
    ru: 'Key Man Chicago — автоключи и вскрытие авто с выездом',
    uk: 'Key Man Chicago — автоключі та відкриття авто з виїздом',
    es: 'Key Man Chicago — llaves de carro y aperturas a domicilio',
  };
  const LABELS = { en: 'EN', ru: 'RU', uk: 'UA' };

  const storage = {
    get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
    set: v => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } },
  };
  let current = LANGS.includes(storage.get()) ? storage.get() : 'ru';

  const apply = lang => {
    document.documentElement.lang = lang === 'uk' ? 'uk' : lang;
    // sub-pages name their title key: <html data-title="acd.title">
    const tk = document.documentElement.dataset.title;
    document.title = tk && T[tk] ? T[tk][lang] ?? T[tk].en : TITLES[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const entry = T[el.dataset.i18n];
      if (entry) el.innerHTML = entry[lang] ?? entry.en;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':');
        if (T[key]) el.setAttribute(attr, T[key][lang] ?? T[key].en);
      });
    });
    // header switcher
    const sw = document.getElementById('langSwitch');
    if (sw) {
      sw.querySelector('.lang__code').textContent = LABELS[lang];
      sw.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-selected', b.dataset.lang === lang));
    }
  };

  const set = (lang, { silent = false } = {}) => {
    if (!LANGS.includes(lang) || lang === current) return;
    current = lang;
    storage.set(lang);
    apply(lang);
    if (!silent) dispatchEvent(new CustomEvent('km:lang', { detail: { lang, from: 'site' } }));
  };

  // built-in texts, before admin-panel edits (the admin page compares against these)
  const DEFAULTS = JSON.parse(JSON.stringify(T));
  window.kmLang = { get: () => current, set, t: (key, lang = current) => T[key]?.[lang] || T[key]?.en || key, defaults: DEFAULTS, langs: LANGS };

  // the chat bot switched language → follow it
  addEventListener('km:lang', e => { if (e.detail.from !== 'site') set(e.detail.lang, { silent: true }); });

  /* ---------- header dropdown ---------- */
  const sw = document.getElementById('langSwitch');
  if (sw) {
    const btn = sw.querySelector('.lang__btn');
    const toggle = open => {
      sw.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
    };
    btn.addEventListener('click', e => { e.stopPropagation(); toggle(!sw.classList.contains('is-open')); });
    sw.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { set(b.dataset.lang); toggle(false); }));
    addEventListener('click', e => { if (!sw.contains(e.target)) toggle(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  apply(current);

  /* ---------- edits from the admin panel (/api/content on Vercel) ----------
     On static hosting the request just fails and the built-in texts/gallery stay. */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const buildGallery = items => {
    const track = document.getElementById('showcase');
    if (!track || !items?.length) return;
    track.innerHTML = items.map((it, i) => {
      T[`g.${i}.tag`] = it.tag || {};
      T[`g.${i}.cap`] = it.cap || {};
      const yt = it.type === 'youtube';
      const thumb = yt ? `https://i.ytimg.com/vi/${encodeURIComponent(it.src)}/${it.vertical ? 'oar2' : 'hqdefault'}.jpg` : it.src;
      return `<button class="shot" data-type="${yt ? 'youtube' : 'image'}"${it.vertical ? ' data-vertical' : ''} data-src="${esc(it.src)}">
        <img src="${esc(thumb)}" alt="" loading="lazy">
        <span class="shot__tag" data-i18n="g.${i}.tag"></span><span class="shot__cap" data-i18n="g.${i}.cap"></span></button>`;
    }).join('');
    dispatchEvent(new CustomEvent('km:gallery'));
  };

  if (location.protocol.startsWith('http') && !document.documentElement.hasAttribute('data-admin')) {
    fetch('/api/content', { headers: { Accept: 'application/json' }, cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        for (const [key, val] of Object.entries(data.texts || {})) {
          T[key] = { ...(T[key] || {}) };
          for (const l of LANGS) if (val?.[l]) T[key][l] = val[l];
        }
        if (Array.isArray(data.gallery)) buildGallery(data.gallery);
        apply(current);
      })
      .catch(() => { /* static hosting: no API */ });
  }
})();
