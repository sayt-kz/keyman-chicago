// GET /api/content — public: text overrides and the gallery edited in the admin panel.
import { route, send, getJson, storageReady } from "../lib/server.js";

export default route(["GET"], async (req, res) => {
  if (!storageReady()) return send(res, 200, { texts: {}, gallery: null });
  const [texts, gallery] = await Promise.all([getJson("content/texts.json", {}), getJson("content/gallery.json", null)]);
  // browsers always revalidate; the Vercel CDN keeps it for a minute, so edits show up within ~1 min
  send(res, 200, { texts, gallery }, { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" });
});
