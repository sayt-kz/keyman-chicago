// Local dev server: serves public/ and runs the same /api functions Vercel runs.
// Without Redis/Blob env vars data is kept in memory and photos go to public/uploads.
// Admin password locally: ADMIN_PASSWORD env, or "admin" if not set.
// Run: node server.js  → http://localhost:3000  (admin: http://localhost:3000/admin/)
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const PORT = process.env.PORT || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".mp4": "video/mp4",
};

async function runApi(req, res, pathname) {
  const file = path.join(ROOT, pathname + ".js");
  if (!file.startsWith(path.join(ROOT, "api"))) { res.writeHead(404); return res.end(); }
  try { await stat(file); } catch { res.writeHead(404); return res.end("No such API"); }
  const mod = await import(pathToFileURL(file).href);
  return mod.default(req, res);
}

async function serveStatic(req, res, pathname) {
  let file = path.join(PUBLIC, pathname);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
  } catch {
    if (!path.extname(file)) file += ".html"; // clean URLs, like Vercel: /account → account.html
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("Not found");
  }
}

http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://x");
  const p = decodeURIComponent(pathname);
  if (p.startsWith("/api/")) return runApi(req, res, p.replace(/\/$/, ""));
  return serveStatic(req, res, p);
}).listen(PORT, () => console.log(`Key Man site: http://localhost:${PORT}  ·  admin: http://localhost:${PORT}/admin/`));
