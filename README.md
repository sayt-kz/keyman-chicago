# Key Man Chicago — redesign

```
keyman/
  public/          the website — upload this folder to any hosting as-is
    index.html
    styles.css
    app.js         nav, scroll reveals, hero canvas animation, lead form
    assistant.js   chat bot (no AI / no API keys): answers in EN / RU / ES,
                   remembers the car, takes callback requests in the chat
  server.js        optional Node server: serves public/ + receives leads at POST /api/lead
  package.json
```

## Run locally

```bash
node server.js
# open http://localhost:3000
```

## Editing the bot
All answers live in the `I` object at the top of `public/assistant.js`:
- `kw` — words that trigger the answer (any language, lower case);
- `r` — the reply in `en`, `ru`, `es`;
- `chips` — quick-reply buttons shown after the answer.

## Before going live
- `/api/lead` only logs requests to the console. Connect it to email, a CRM or Telegram.
  On static hosting without the server, point the `fetch('/api/lead')` calls
  (in `app.js` and `assistant.js`) to a form service such as Formspree.
- Logo and privacy-policy link point to the current keymanchicago.com WordPress files.
