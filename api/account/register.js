// POST /api/account/register { email, password, name, phone } → logs the new student in
// Errors are short codes; the account page translates them.
import { route, readJson, send, limited, clientIp, storageReady } from "../../lib/server.js";
import { findUserByEmail, createUser, userCookie, publicUser } from "../../lib/academy.js";

export default route(["POST"], async (req, res) => {
  if (!storageReady()) return send(res, 503, { error: "storage" });
  if (limited(`reg:${clientIp(req)}`, 5, 3600)) return send(res, 429, { error: "too_many" });
  const { email, password, name, phone, website } = await readJson(req, 4000);
  if (website) return send(res, 200, { ok: true }); // honeypot
  const mail = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail) || mail.length > 120) return send(res, 400, { error: "bad_email" });
  if (String(password || "").length < 8) return send(res, 400, { error: "short_password" });
  if (!String(name || "").trim()) return send(res, 400, { error: "no_name" });
  if (await findUserByEmail(mail)) return send(res, 409, { error: "email_taken" });
  const user = await createUser({ email: mail, password, name, phone });
  send(res, 200, { user: publicUser(user) }, { "Set-Cookie": userCookie(user.id) });
});
