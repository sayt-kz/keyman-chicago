// Shared helpers for the /api functions (Vercel serverless, plain Node handlers).
// Storage: one PRIVATE Vercel Blob store (env BLOB_READ_WRITE_TOKEN, added when the store is connected
// to the project). Leads, texts and the gallery are JSON blobs; photos are blobs served through /api/photo.
// Locally (node server.js, no token) everything is kept in memory so the admin panel can be tested offline.
import crypto from "node:crypto";

const ON_VERCEL = !!process.env.VERCEL;
const BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

/* ---------------- HTTP helpers ---------------- */
export async function readJson(req, limit = 6_000_000) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body; // already parsed by the platform
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw Object.assign(new Error("Body too large"), { status: 413 });
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error("Bad JSON"), { status: 400 }); }
}

export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

// wraps a handler: method check + error handling
export function route(methods, fn) {
  return async (req, res) => {
    if (!methods.includes(req.method)) return send(res, 405, { error: "Method not allowed" });
    try { await fn(req, res); }
    catch (e) {
      console.error(e);
      send(res, e.status || 500, { error: e.status ? e.message : "Server error" });
    }
  };
}

/* ---------------- storage: private Vercel Blob, or memory locally ---------------- */
export const storageReady = () => BLOB || !ON_VERCEL;
const notConnected = () => Object.assign(new Error("Storage is not connected: create a private Blob store in Vercel → Storage and connect it"), { status: 503 });

const mem = globalThis.__kmMem ||= new Map(); // pathname → { body: Buffer, type, ts }
const blob = () => import("@vercel/blob");

export async function putFile(pathname, body, contentType) {
  if (BLOB) {
    const { put } = await blob();
    await put(pathname, body, { access: "private", contentType, addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
    return;
  }
  if (ON_VERCEL) throw notConnected();
  mem.set(pathname, { body: Buffer.from(body), type: contentType, ts: Date.now() });
}

// returns { stream|buffer, type } or null
export async function getFile(pathname, { fresh = true } = {}) {
  if (BLOB) {
    const { get } = await blob();
    const r = await get(pathname, { access: "private", useCache: !fresh });
    if (!r || r.statusCode !== 200) return null;
    return { stream: r.stream, type: r.blob.contentType };
  }
  if (ON_VERCEL) throw notConnected();
  const f = mem.get(pathname);
  return f ? { buffer: f.body, type: f.type } : null;
}

export async function delFile(pathname) {
  if (BLOB) { const { del } = await blob(); return del(pathname); }
  if (ON_VERCEL) throw notConnected();
  mem.delete(pathname);
}

// pathnames under a prefix, newest first
export async function listFiles(prefix, limit = 1000) {
  if (BLOB) {
    const { list } = await blob();
    const out = [];
    let cursor;
    do {
      const r = await list({ prefix, limit: Math.min(1000, limit - out.length), cursor });
      out.push(...r.blobs.map(b => ({ pathname: b.pathname, ts: +new Date(b.uploadedAt) })));
      cursor = r.hasMore ? r.cursor : null;
    } while (cursor && out.length < limit);
    return out.sort((a, b) => b.ts - a.ts).map(b => b.pathname);
  }
  if (ON_VERCEL) throw notConnected();
  return [...mem].filter(([p]) => p.startsWith(prefix)).sort((a, b) => b[1].ts - a[1].ts).map(([p]) => p);
}

const toText = async f => (f.buffer ? f.buffer.toString("utf8") : new Response(f.stream).text());

export async function getJson(name, fallback) {
  if (!storageReady()) return fallback;
  const f = await getFile(name);
  if (!f) return fallback;
  try { return JSON.parse(await toText(f)); } catch { return fallback; }
}
export const setJson = (name, value) => putFile(name, JSON.stringify(value), "application/json");

/* ---------------- leads (one JSON blob per request) ---------------- */
const leadPath = id => `leads/${id}.json`;
export const saveLead = lead => setJson(leadPath(lead.id), lead);
export const getLead = id => getJson(leadPath(id), null);
export const deleteLead = id => delFile(leadPath(id));
export async function listLeads(limit = 300) {
  const paths = await listFiles("leads/", limit);
  const rows = await Promise.all(paths.map(p => getJson(p, null)));
  return rows.filter(Boolean).sort((a, b) => b.ts - a.ts);
}

/* ---------------- best-effort rate limit (per server instance) ---------------- */
const hits = globalThis.__kmHits ||= new Map();
export function limited(bucket, max, windowSec) {
  const now = Date.now();
  const list = (hits.get(bucket) || []).filter(t => now - t < windowSec * 1000);
  list.push(now);
  hits.set(bucket, list);
  return list.length > max;
}

/* ---------------- admin auth (signed cookie) ---------------- */
const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || (ON_VERCEL ? "" : "local-dev");
const COOKIE = "km_admin";
const sign = v => crypto.createHmac("sha256", SECRET).update(v).digest("base64url");

export function checkPassword(given) {
  const real = process.env.ADMIN_PASSWORD || (ON_VERCEL ? "" : "admin"); // local default for testing only
  if (!real) return false;
  const a = crypto.createHash("sha256").update(String(given)).digest();
  const b = crypto.createHash("sha256").update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

export function sessionCookie(days = 14) {
  const exp = String(Date.now() + days * 864e5);
  const secure = ON_VERCEL ? "; Secure" : "";
  return `${COOKIE}=${exp}.${sign(exp)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${days * 86400}${secure}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

export function isAdmin(req) {
  if (!SECRET) return false;
  const raw = String(req.headers.cookie || "").split(/;\s*/).find(c => c.startsWith(COOKIE + "="));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!exp || !sig || +exp < Date.now()) return false;
  const good = sign(exp);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

export function requireAdmin(fn) {
  return async (req, res) => {
    if (!isAdmin(req)) return send(res, 401, { error: "Not logged in" });
    return fn(req, res);
  };
}

/* ---------------- Telegram notifications (optional) ---------------- */
export async function notifyTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    return r.ok;
  } catch (e) {
    console.error("Telegram:", e.message);
    return false;
  }
}

export const integrations = () => ({
  storage: BLOB ? "blob" : (ON_VERCEL ? "missing" : "memory (local)"),
  telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  password: !!process.env.ADMIN_PASSWORD,
});
