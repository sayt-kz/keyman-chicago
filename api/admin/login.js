// POST /api/admin/login {password} · DELETE /api/admin/login (log out) · GET — am I logged in?
import { route, readJson, send, checkPassword, sessionCookie, clearCookie, isAdmin, limited, clientIp } from "../../lib/server.js";

export default route(["GET", "POST", "DELETE"], async (req, res) => {
  if (req.method === "GET") return send(res, 200, { admin: isAdmin(req) });
  if (req.method === "DELETE") return send(res, 200, { ok: true }, { "Set-Cookie": clearCookie() });

  if (limited(`login:${clientIp(req)}`, 6, 900)) return send(res, 429, { error: "Слишком много попыток, попробуйте через 15 минут" });
  const { password } = await readJson(req, 2000);
  if (!checkPassword(password || "")) return send(res, 401, { error: "Неверный пароль" });
  send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie() });
});
