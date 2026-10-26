// Admin: GET/PUT site texts and gallery.
//   texts:   { "hero.h1a": { ru: "...", en: "...", uk: "..." }, ... }  — only the keys that differ from the defaults
//   gallery: [ { type: "image"|"youtube", src, vertical, tag: {ru,en,uk}, cap: {ru,en,uk} }, ... ]  — null = use the built-in one
import { route, requireAdmin, readJson, send, getJson, setJson } from "../../lib/server.js";

const LANGS = ["ru", "en", "uk"];
const str = (v, n) => String(v ?? "").slice(0, n);
const tri = (o, n) => Object.fromEntries(LANGS.map(l => [l, str(o?.[l], n)]));

export default route(["GET", "PUT"], requireAdmin(async (req, res) => {
  if (req.method === "GET") {
    const [texts, gallery] = await Promise.all([getJson("content/texts.json", {}), getJson("content/gallery.json", null)]);
    return send(res, 200, { texts, gallery }, { "Cache-Control": "no-store" });
  }

  const body = await readJson(req, 400_000);
  if (body.texts && typeof body.texts === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(body.texts).slice(0, 500)) {
      if (/^[\w.-]{1,40}$/.test(key) && val && typeof val === "object") clean[key] = tri(val, 2000);
    }
    await setJson("content/texts.json", clean);
  }
  if ("gallery" in body) {
    const g = Array.isArray(body.gallery) ? body.gallery.slice(0, 60).map(it => ({
      type: it.type === "youtube" ? "youtube" : "image",
      src: str(it.src, 600),
      vertical: !!it.vertical,
      tag: tri(it.tag, 40),
      cap: tri(it.cap, 120),
    })).filter(it => it.src) : null;
    await setJson("content/gallery.json", g);
  }
  send(res, 200, { ok: true });
}));
