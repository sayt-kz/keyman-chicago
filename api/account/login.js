// POST /api/account/login { email, password } · DELETE /api/account/login (log out)
import { route, readJson, send, limited, clientIp } from "../../lib/server.js";
import { findUserByEmail, verifyPassword, userCookie, clearUserCookie, publicUser } from "../../lib/academy.js";

export default route(["POST", "DELETE"], async (req, res) => {
  if (req.method === "DELETE") return send(res, 200, { ok: true }, { "Set-Cookie": clearUserCookie() });
  if (limited(`ulogin:${clientIp(req)}`, 10, 900)) return send(res, 429, { error: "too_many" });
  const { email, password } = await readJson(req, 2000);
  const user = await findUserByEmail(email || "");
  if (!user || !verifyPassword(password || "", user.pass)) return send(res, 401, { error: "bad_login" });
  send(res, 200, { user: publicUser(user) }, { "Set-Cookie": userCookie(user.id) });
});
