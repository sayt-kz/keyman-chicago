# Key Man Chicago — website, admin panel and online academy

```
keyman/
  public/              the website (static)
    index.html, styles.css, app.js, gallery.js, i18n.js (RU/EN/UA texts), assistant.js (chat bot)
    academy.html       /academy   — catalog of video courses
    course.html        /course?c=<slug> — course page, lesson list and video player
    account.html       /account   — student sign-in / sign-up, "my courses", profile
    academy.js, academy.css   scripts and styles of the three pages above
    img/               van photo, logo, photos from the Key Man shoot (resized for web)
    admin/             admin panel UI  →  /admin/
  api/index.js         the single Vercel function: routes every /api/* request (vercel.json rewrite)
  routes/              API handlers, path = /api/<file name>
    lead.js            POST  /api/lead            requests from the form, chat bot and quick-request tab
    content.js         GET   /api/content         texts + gallery edited in the admin panel
    photo.js           GET   /api/photo?p=        photos from the private Blob store
    courses.js         GET   /api/courses[?c=]    published courses (no video links)
    lesson.js          GET   /api/lesson?c=&l=    short-lived signed video link — only for buyers (or free lessons)
    lesson-file.js     local development only: serves videos kept in memory
    account/           register, login (POST/DELETE), me (GET/PATCH)
    pay/checkout.js    POST  Stripe Checkout for a course (free courses are added directly)
    pay/confirm.js     POST  after Stripe redirects back: checks the payment and opens the course
    admin/login.js     GET/POST/DELETE            sign in / out (password = ADMIN_PASSWORD)
    admin/leads.js     GET/PATCH/DELETE           list leads, change status / note, delete
    admin/content.js   GET/PUT                    site texts (RU/EN/UA) and gallery
    admin/upload.js    POST                       photo upload
    admin/courses.js   GET/PUT/DELETE             courses and lessons
    admin/video-upload.js POST/DELETE             lesson videos (browser uploads straight to Blob, up to 5 GB)
    admin/students.js  GET/POST/PATCH             students, open/close a course by hand, new password, payments
    admin/status.js    GET                        which integrations are connected
  lib/server.js        shared helpers (Blob storage, admin auth, Telegram)
  lib/academy.js       students, courses, signed video links, Stripe
  server.js            local dev server that runs the same API (data in memory)
  vercel.json
```

All data lives in one **private** Vercel Blob store: `leads/`, `content/`, `photos/`, `users/`, `emails/`,
`courses/`, `orders/`, `videos/`. Lesson videos are never public: a buyer's browser gets a signed link
that expires after 3 hours.

## Deploy on Vercel (US hosting)
1. vercel.com → *Add New… → Project* → import `sayt-kz/keyman-chicago`. Framework preset: **Other**. Deploy.
2. Project → **Storage** → *Blob* → Create (**Private**) → Connect to the project (adds `BLOB_READ_WRITE_TOKEN`).
3. Project → **Settings → Environment Variables**:
   - `ADMIN_PASSWORD` — password for /admin/ (required)
   - `STRIPE_SECRET_KEY` — Stripe secret key (`sk_live_…`, or `sk_test_…` to try it) — online payments for courses
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — optional, new requests are sent to Telegram
   - `SESSION_SECRET` — optional, any long random string; signs admin and student sessions
4. **Deployments → Redeploy**. Admin panel: `https://<project>.vercel.app/admin/`
5. Own domain: Settings → Domains → add `keymanchicago.com` and follow the DNS instructions.

Every `git push` to `main` redeploys automatically.

**Selling courses:** Vercel's free Hobby plan is for non-commercial use only — switch the project to **Pro**
before taking payments. Video traffic from the Blob store is billed by Vercel after the included amount.

## Courses: how it works
1. Admin → **Курсы** → *Новый курс* (or *Создать 3 курса Академии* for Start Pack / PRO Master / True Expert drafts).
2. Fill in titles and descriptions (RU/EN/UA), price, cover; add lessons and upload an MP4 for each one.
   Tick *Бесплатно* on a lesson to make it a free preview. Tick *Опубликован* and save.
3. A visitor opens /academy → course → *Купить курс* → signs up → pays on Stripe → comes back to /account,
   where the course is opened automatically.
4. Paid in cash or by transfer? Admin → **Ученики** → *Открыть курс…* for that student.
   Forgotten password: *Новый пароль* there.

## Run locally
```bash
node server.js
```
Site: http://localhost:3000 · admin: http://localhost:3000/admin/ (password `admin` unless `ADMIN_PASSWORD` is set).
Without the Blob variable everything (including uploaded videos) lives in memory until the server stops.

## Editing the chat bot
Answers live in the `I` object in `public/assistant.js` (`kw` — trigger words, `r` — replies per language, `chips` — quick buttons).
