// Admin: POST /api/admin/upload { name, data: "data:image/jpeg;base64,..." } → { url }
// The admin page shrinks photos in the browser first (≤1600px JPEG), so the body stays small.
// Photos live in the private Blob store and are shown on the site through /api/photo.
import crypto from "node:crypto";
import { route, requireAdmin, readJson, send, putFile } from "../../lib/server.js";

export default route(["POST"], requireAdmin(async (req, res) => {
  const { name, data } = await readJson(req, 4_200_000);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data || "");
  if (!m) return send(res, 400, { error: "Only JPEG, PNG or WebP images" });
  const buffer = Buffer.from(m[2], "base64");
  if (buffer.length > 3_000_000) return send(res, 413, { error: "Image is too large" });
  const safe = String(name || "photo").toLowerCase().replace(/\.\w+$/, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "photo";
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[m[1]];
  const pathname = `photos/${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safe}.${ext}`;
  await putFile(pathname, buffer, m[1]);
  send(res, 200, { url: `/api/photo?p=${encodeURIComponent(pathname)}` });
}));
