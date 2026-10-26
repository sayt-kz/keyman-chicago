// Key Man Academy: student accounts, courses, lesson access and payments.
// Everything is stored in the same private Vercel Blob store as the rest of the site:
//   users/<id>.json            { id, email, name, phone, pass, courses: [slug], createdAt }
//   emails/<sha256(email)>.json { id }                     — lookup by email
//   courses/<slug>.json        { slug, published, price (cents), currency, level, cover, title{ru,en,uk}, desc{…}, lessons: [...] }
//   orders/<stripeSessionId>.json                          — paid Stripe checkouts (each is granted once)
//   videos/<slug>/<file>       lesson videos (private; played through short-lived signed URLs)
import crypto from "node:crypto";
import { getJson, setJson, delFile, listFiles, getFile } from "./server.js";

const ON_VERCEL = !!process.env.VERCEL;
const BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
export const LANGS = ["ru", "en", "uk"];

/* ---------------- passwords ---------------- */
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(String(pw), salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}
export function verifyPassword(pw, stored) {
  const [, salt, key] = String(stored || "").split("$");
  if (!salt || !key) return false;
  const got = crypto.scryptSync(String(pw), Buffer.from(salt, "hex"), 64);
  const want = Buffer.from(key, "hex");
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

/* ---------------- student session (signed cookie, separate from the admin one) ---------------- */
// own secret, so changing the admin password does not log students out
const USER_SECRET = process.env.SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN || (ON_VERCEL ? "" : "local-dev-users");
const UCOOKIE = "km_user";
const usign = v => crypto.createHmac("sha256", USER_SECRET + ":students").update(v).digest("base64url");

export function userCookie(id, days = 30) {
  const exp = String(Date.now() + days * 864e5);
  const v = `${id}.${exp}`;
  const secure = ON_VERCEL ? "; Secure" : "";
  // Lax: the cookie must survive the redirect back from the Stripe payment page
  return `${UCOOKIE}=${v}.${usign(v)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${days * 86400}${secure}`;
}
export const clearUserCookie = () => `${UCOOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

export function currentUserId(req) {
  if (!USER_SECRET) return null;
  const raw = String(req.headers.cookie || "").split(/;\s*/).find(c => c.startsWith(UCOOKIE + "="));
  if (!raw) return null;
  const [id, exp, sig] = raw.slice(UCOOKIE.length + 1).split(".");
  if (!id || !exp || !sig || +exp < Date.now()) return null;
  const good = usign(`${id}.${exp}`);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)) ? id : null;
}

/* ---------------- users ---------------- */
const emailKey = email => `emails/${crypto.createHash("sha256").update(String(email).trim().toLowerCase()).digest("hex")}.json`;
export const validId = id => /^[a-f0-9]{16,40}$/.test(String(id || ""));
export const getUser = id => (validId(id) ? getJson(`users/${id}.json`, null) : null);
export const saveUser = u => setJson(`users/${u.id}.json`, u);
export async function findUserByEmail(email) {
  const ref = await getJson(emailKey(email), null);
  return ref ? getUser(ref.id) : null;
}
export async function createUser({ email, name, phone, password }) {
  const user = {
    id: crypto.randomBytes(12).toString("hex"),
    email: String(email).trim().toLowerCase(),
    name: String(name || "").trim().slice(0, 80),
    phone: String(phone || "").trim().slice(0, 40),
    pass: hashPassword(password),
    courses: [],
    createdAt: Date.now(),
  };
  await saveUser(user);
  await setJson(emailKey(user.email), { id: user.id });
  return user;
}
export async function listUsers() {
  const paths = await listFiles("users/", 2000);
  const rows = await Promise.all(paths.map(p => getJson(p, null)));
  return rows.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
}
export const publicUser = u => u && ({ id: u.id, email: u.email, name: u.name, phone: u.phone, courses: u.courses || [], createdAt: u.createdAt });

/* ---------------- courses ---------------- */
export const validSlug = s => /^[a-z0-9][a-z0-9-]{1,40}$/.test(String(s || ""));
export const getCourse = slug => (validSlug(slug) ? getJson(`courses/${slug}.json`, null) : null);
export async function listCourses({ all = false } = {}) {
  const paths = await listFiles("courses/", 200);
  const rows = (await Promise.all(paths.map(p => getJson(p, null)))).filter(Boolean);
  return rows.filter(c => all || c.published).sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.slug.localeCompare(b.slug));
}
const tri = (o, n) => Object.fromEntries(LANGS.map(l => [l, String(o?.[l] ?? "").slice(0, n)]));
export function cleanCourse(c) {
  return {
    slug: String(c.slug),
    published: !!c.published,
    order: Number.isFinite(+c.order) ? +c.order : 99,
    level: String(c.level || "").slice(0, 30),
    price: Math.max(0, Math.round(+c.price || 0)),        // cents
    currency: /^[a-z]{3}$/.test(c.currency || "") ? c.currency : "usd",
    cover: String(c.cover || "").slice(0, 600),
    title: tri(c.title, 120),
    desc: tri(c.desc, 3000),
    lessons: (Array.isArray(c.lessons) ? c.lessons : []).slice(0, 200).map(l => ({
      id: /^[\w-]{1,40}$/.test(l.id || "") ? l.id : crypto.randomBytes(5).toString("hex"),
      title: tri(l.title, 160),
      desc: tri(l.desc, 2000),
      video: /^videos\/[\w./-]{1,200}$/.test(l.video || "") ? l.video : "",
      duration: String(l.duration || "").slice(0, 12),
      free: !!l.free,
    })),
  };
}
export const saveCourse = c => setJson(`courses/${c.slug}.json`, cleanCourse(c));
export const deleteCourse = slug => delFile(`courses/${slug}.json`);

// what visitors may see about a course (no video paths)
export function publicCourse(c, { hasAccess = false } = {}) {
  return {
    slug: c.slug, level: c.level, price: c.price, currency: c.currency, cover: c.cover, title: c.title, desc: c.desc,
    hasAccess,
    lessons: c.lessons.map(l => ({ id: l.id, title: l.title, desc: l.desc, duration: l.duration, free: l.free, hasVideo: !!l.video })),
  };
}

export const userHasCourse = (user, slug) => !!user && (user.courses || []).includes(slug);

/* ---------------- lesson video: short-lived signed URL ---------------- */
const LOCAL_SECRET = "local-video";
export async function lessonVideoUrl(pathname, hours = 3) {
  const validUntil = Date.now() + hours * 3600e3;
  if (BLOB) {
    const { issueSignedToken, presignUrl } = await import("@vercel/blob");
    const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
    const { presignedUrl } = await presignUrl(token, { operation: "get", pathname, validUntil, access: "private" });
    return presignedUrl;
  }
  // local dev: our own signed URL served by /api/lesson-file
  const sig = crypto.createHmac("sha256", LOCAL_SECRET).update(`${pathname}.${validUntil}`).digest("base64url");
  return `/api/lesson-file?p=${encodeURIComponent(pathname)}&e=${validUntil}&s=${sig}`;
}
export function checkLocalVideoSig(p, e, s) {
  if (+e < Date.now()) return false;
  const good = crypto.createHmac("sha256", LOCAL_SECRET).update(`${p}.${e}`).digest("base64url");
  return String(s).length === good.length && crypto.timingSafeEqual(Buffer.from(String(s)), Buffer.from(good));
}
export { getFile };

/* ---------------- Stripe (optional: env STRIPE_SECRET_KEY) ---------------- */
export const paymentsReady = () => !!process.env.STRIPE_SECRET_KEY;
async function stripe(path, { method = "GET", form } = {}) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: form ? new URLSearchParams(form) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw Object.assign(new Error(data.error?.message || "Stripe error"), { status: 502 });
  return data;
}
export function siteOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || (ON_VERCEL ? "https" : "http");
  return `${proto}://${host}`;
}
export function createCheckout({ course, user, origin, lang }) {
  const title = course.title?.[lang] || course.title?.en || course.title?.ru || course.slug;
  return stripe("checkout/sessions", {
    method: "POST",
    form: {
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": course.currency || "usd",
      "line_items[0][price_data][unit_amount]": String(course.price),
      "line_items[0][price_data][product_data][name]": `Key Man Academy — ${title}`,
      customer_email: user.email,
      client_reference_id: user.id,
      "metadata[userId]": user.id,
      "metadata[course]": course.slug,
      success_url: `${origin}/account?paid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/course?c=${course.slug}`,
    },
  });
}
export const getCheckout = id => stripe(`checkout/sessions/${encodeURIComponent(id)}`);
export const getOrder = id => getJson(`orders/${id}.json`, null);
export const saveOrder = o => setJson(`orders/${o.id}.json`, o);
