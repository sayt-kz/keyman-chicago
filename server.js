// Key Man Chicago — optional Node server: serves public/ and receives leads at POST /api/lead.
// The site itself (including the chat bot) also works on any static hosting without this server.
// Run: node server.js  → http://localhost:3000
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const MAX_BODY = 16_000;

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > MAX_BODY) { reject(new Error("too large")); req.destroy(); }
    });
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch (e) { reject(e); } });
  });
}

async function handleLead(req, res) {
  let lead;
  try { lead = await readJson(req); } catch { res.writeHead(400); return res.end(); }
  // TODO: forward to email / CRM / Telegram. For now leads are logged on the server.
  console.log(new Date().toISOString(), "New lead:", JSON.stringify(lead));
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end('{"ok":true}');
}

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(PUBLIC, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("Not found");
  }
}

http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/lead") return handleLead(req, res);
  if (req.method === "GET") return serveStatic(req, res);
  res.writeHead(405); res.end();
}).listen(PORT, () => console.log(`Key Man site running on http://localhost:${PORT}`));
