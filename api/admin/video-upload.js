// Admin: lesson video upload.
// On Vercel the browser uploads the file straight into the private Blob store (the SDK's upload(),
// multipart, up to 5 GB): this route only hands out a one-time upload token for videos/<course>/...
// Locally (no Blob token) the admin page POSTs the raw file here instead and it is kept in memory.
// DELETE /api/admin/video-upload?p=videos/... removes a video.
import crypto from "node:crypto";
import { route, requireAdmin, readJson, send, putFile, delFile } from "../../lib/server.js";

const TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX = 5 * 1024 ** 3;

export default route(["POST", "DELETE"], requireAdmin(async (req, res) => {
  if (req.method === "DELETE") {
    const p = new URL(req.url, "http://x").searchParams.get("p") || "";
    if (!/^videos\/[\w./-]+$/.test(p) || p.includes("..")) return send(res, 400, { error: "Bad path" });
    await delFile(p);
    return send(res, 200, { ok: true });
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { handleUpload } = await import("@vercel/blob/client");
    const body = await readJson(req, 100_000);
    const result = await handleUpload({
      body, request: req,
      onBeforeGenerateToken: async pathname => {
        if (!/^videos\/[a-z0-9-]+\/[\w.-]+$/.test(pathname)) throw Object.assign(new Error("Bad path"), { status: 400 });
        return { allowedContentTypes: TYPES, maximumSizeInBytes: MAX, addRandomSuffix: true, validUntil: Date.now() + 6 * 3600e3 };
      },
    });
    return send(res, 200, result);
  }

  // local: raw body, file name in ?name=, course in ?c=
  const q = new URL(req.url, "http://x").searchParams;
  const type = String(req.headers["content-type"] || "");
  if (!TYPES.includes(type)) return send(res, 400, { error: "MP4, WebM or MOV only" });
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const safe = String(q.get("name") || "lesson").toLowerCase().replace(/\.\w+$/, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "lesson";
  const ext = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" }[type];
  const pathname = `videos/${String(q.get("c") || "misc").replace(/[^a-z0-9-]/g, "")}/${safe}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  await putFile(pathname, Buffer.concat(chunks), type);
  send(res, 200, { pathname });
}));
