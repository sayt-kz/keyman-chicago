# Key Man Chicago — website + admin panel

```
keyman/
  public/            the website (static)
    index.html, styles.css, app.js, gallery.js, i18n.js (RU/EN/UA texts), assistant.js (chat bot)
    img/             van photo, logo, photos from the Key Man shoot (resized for web)
    admin/           admin panel UI  →  /admin/
  api/               serverless functions (Vercel)
    lead.js          POST  /api/lead            requests from the form, chat bot and quick-request tab
    content.js       GET   /api/content         texts + gallery edited in the admin panel
    admin/login.js   GET/POST/DELETE            sign in / out (password = ADMIN_PASSWORD)
    admin/leads.js   GET/PATCH/DELETE           list leads, change status / note, delete
    admin/content.js GET/PUT                    site texts (RU/EN/UA) and gallery
    admin/upload.js  POST                       photo upload (to Vercel Blob)
    admin/status.js  GET                        which integrations are connected
  lib/server.js      shared helpers (Redis, auth, uploads, Telegram)
  server.js          local dev server that runs the same API (data in memory)
  vercel.json
```

## Deploy on Vercel (US hosting)
1. vercel.com → Sign up / Log in **with GitHub** → *Add New… → Project* → import `sayt-kz/keyman-chicago`.
   Framework preset: **Other**. Leave build settings as they are (`vercel.json` sets `public/` as output). Deploy.
2. Project → **Storage** → *Upstash for Redis* (free) → Create → Connect to the project (adds `KV_REST_API_URL`, `KV_REST_API_TOKEN`).
3. Project → **Storage** → *Blob* → Create → Connect (adds `BLOB_READ_WRITE_TOKEN`) — needed for photo uploads.
4. Project → **Settings → Environment Variables**:
   - `ADMIN_PASSWORD` — password for /admin/ (required)
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — optional, new requests are sent to Telegram
5. **Deployments → Redeploy**. Admin panel: `https://<project>.vercel.app/admin/`
6. Own domain: Settings → Domains → add `keymanchicago.com` and follow the DNS instructions.

Every `git push` to `main` redeploys automatically.

## Run locally
```bash
node server.js
```
Site: http://localhost:3000 · admin: http://localhost:3000/admin/ (password `admin` unless `ADMIN_PASSWORD` is set).
Without Redis/Blob variables data lives in memory and photos go to `public/uploads/`.

## Editing the chat bot
Answers live in the `I` object in `public/assistant.js` (`kw` — trigger words, `r` — replies per language, `chips` — quick buttons).
