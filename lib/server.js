// Shared helpers for the /api functions (Vercel serverless, plain Node handlers).
// Storage:
//   - Upstash Redis (Vercel Storage → Upstash for Redis) for leads, texts and the gallery list.
//     Env: KV_REST_API_URL + KV_REST_API_TOKEN (set by the Vercel integration) or UPSTASH_REDIS_REST_URL/_TOKEN.
//   - Vercel Blob for uploaded photos. Env: BLOB_READ_WRITE_TOKEN (set when a Blob store is connected).
//   Locally (node server.js) both fall back to memory / public/uploads so everything can be tested offline.
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ON_VERCEL = !!process.env.VERCEL;

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

/* ---------------- Redis (Upstash REST) with an in-memory fallback ---------------- */
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const storageReady = () => !!(REDIS_URL && REDIS_TOKEN) || !ON_VERCEL;

const mem = globalThis.__kmMem ||= { kv: new Map(), hash: new Map(), zset: new Map(), exp: new Map() };
function memCmd([op, key, ...a]) {
  const now = Date.now();
  if (mem.exp.has(key) && mem.exp.get(key) < now) { mem.kv.delete(key); mem.exp.delete(key); }
  switch (op) {
    case "GET": return mem.kv.get(key) ?? null;
    case "SET": mem.kv.set(key, a[0]); return "OK";
    case "INCR": { const v = (+mem.kv.get(key) || 0) + 1; mem.kv.set(key, String(v)); return v; }
    case "EXPIRE": mem.exp.set(key, now + a[0] * 1000); return 1;
    case "HSET": { const h = mem.hash.get(key) || new Map(); for (let i = 0; i < a.length; i += 2) h.set(a[i], a[i + 1]); mem.hash.set(key, h); return 1; }
    case "HGET": return mem.hash.get(key)?.get(a[0]) ?? null;
    case "HMGET": return a.map(f => mem.hash.get(key)?.get(f) ?? null);
    case "HDEL": a.forEach(f => mem.hash.get(key)?.delete(f)); return 1;
    case "ZADD": { const z = mem.zset.get(key) || new Map(); z.set(a[1], +a[0]); mem.zset.set(key, z); return 1; }
    case "ZREM": mem.zset.get(key)?.delete(a[0]); return 1;
    case "ZREVRANGE": { const z = [...(mem.zset.get(key) || new Map())].sort((x, y) => y[1] - x[1]).map(x => x[0]); return z.slice(+a[0], +a[1] + 1); }
    case "ZCARD": return mem.zset.get(key)?.size || 0;
    default: throw new Error("memory store: unsupported " + op);
  }
}

export async function redis(...cmd) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    if (ON_VERCEL) throw Object.assign(new Error("Storage is not connected: add Upstash Redis in Vercel → Storage"), { status: 503 });
    return memCmd(cmd.map(String));
  }
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd.map(String)),
  });
  const data = await r.json();
  if (data.error) throw new Error("Redis: " + data.error);
  return data.result;
}

export async function getJson(key, fallback) {
  const v = await redis("GET", key);
  if (!v) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}
export const setJson = (key, value) => redis("SET", key, JSON.stringify(value));

// simple fixed-window rate limit; returns true when the caller is over the limit
export async function limited(bucket, max, windowSec) {
  const key = `rl:${bucket}`;
  const n = await redis("INCR", key);
  if (n === 1) await redis("EXPIRE", key, windowSec);
  return n > max;
}

/* ---------------- admin auth (signed cookie) ---------------- */
const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
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
  const value = `${exp}.${sign(exp)}`;
  const secure = ON_VERCEL ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${days * 86400}${secure}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

export function isAdmin(req) {
  if (!SECRET && ON_VERCEL) return false;
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

/* ---------------- photo uploads ---------------- */
export async function savePhoto(name, buffer, contentType) {
  const safe = name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "") || "photo.jpg";
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`gallery/${safe}`, buffer, { access: "public", contentType, addRandomSuffix: true });
    return blob.url;
  }
  if (ON_VERCEL) throw Object.assign(new Error("Photo storage is not connected: add Vercel Blob in Vercel → Storage"), { status: 503 });
  // local: save into public/uploads
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "uploads");
  await mkdir(dir, { recursive: true });
  const file = `${Date.now()}-${safe}`;
  await writeFile(path.join(dir, file), buffer);
  return `/uploads/${file}`;
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
  storage: !!(REDIS_URL && REDIS_TOKEN) ? "redis" : (ON_VERCEL ? "missing" : "memory (local)"),
  photos: process.env.BLOB_READ_WRITE_TOKEN ? "blob" : (ON_VERCEL ? "missing" : "local folder"),
  telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  password: !!process.env.ADMIN_PASSWORD,
});
