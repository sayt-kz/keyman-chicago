// GET /api/photo?p=photos/... — serves a gallery photo from the private Blob store.
// File names are unique (timestamp + random), so they are cached by browsers and the CDN for a year.
import { Readable } from "node:stream";
import { route, send, getFile } from "../lib/server.js";

export default route(["GET"], async (req, res) => {
  const p = new URL(req.url, "http://x").searchParams.get("p") || "";
  if (!/^photos\/[\w.-]{1,120}$/.test(p)) return send(res, 400, { error: "Bad photo path" });
  const f = await getFile(p, { fresh: false });
  if (!f) return send(res, 404, { error: "Not found" });
  res.statusCode = 200;
  res.setHeader("Content-Type", f.type || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  if (f.buffer) return res.end(f.buffer);
  Readable.fromWeb(f.stream).pipe(res);
});
