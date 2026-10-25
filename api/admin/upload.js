// Admin: POST /api/admin/upload { name, data: "data:image/jpeg;base64,..." } → { url }
// The admin page shrinks photos in the browser first (≤1600px JPEG), so the body stays small.
import { route, requireAdmin, readJson, send, savePhoto } from "../../lib/server.js";

export default route(["POST"], requireAdmin(async (req, res) => {
  const { name, data } = await readJson(req, 4_200_000);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data || "");
  if (!m) return send(res, 400, { error: "Only JPEG, PNG or WebP images" });
  const buffer = Buffer.from(m[2], "base64");
  if (buffer.length > 3_000_000) return send(res, 413, { error: "Image is too large" });
  const url = await savePhoto(String(name || "photo.jpg"), buffer, m[1]);
  send(res, 200, { url });
}));
