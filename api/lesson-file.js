// Local development only: streams a lesson video kept in memory (on Vercel videos come straight
// from the private Blob store through presigned URLs, so this route is not used there).
import { send } from "../lib/server.js";
import { checkLocalVideoSig, getFile } from "../lib/academy.js";

export default async (req, res) => {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) return send(res, 404, { error: "not_found" });
  const q = new URL(req.url, "http://x").searchParams;
  const p = q.get("p") || "";
  if (!checkLocalVideoSig(p, q.get("e"), q.get("s") || "")) return send(res, 403, { error: "expired" });
  const f = await getFile(p);
  if (!f) return send(res, 404, { error: "not_found" });
  const buf = f.buffer, size = buf.length;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (m) {
    const start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], size - 1) : size - 1;
    res.writeHead(206, { "Content-Type": f.type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    return res.end(buf.subarray(start, end + 1));
  }
  res.writeHead(200, { "Content-Type": f.type, "Content-Length": size, "Accept-Ranges": "bytes" });
  res.end(buf);
};
