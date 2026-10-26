// GET /api/account/me → { user, courses } (user: null when logged out)
// PATCH /api/account/me { name, phone } or { password, newPassword }
import { route, readJson, send } from "../../lib/server.js";
import { currentUserId, getUser, saveUser, publicUser, getCourse, publicCourse, verifyPassword, hashPassword } from "../../lib/academy.js";

export default route(["GET", "PATCH"], async (req, res) => {
  const user = await getUser(currentUserId(req));
  if (req.method === "GET") {
    if (!user) return send(res, 200, { user: null }, { "Cache-Control": "no-store" });
    const courses = (await Promise.all((user.courses || []).map(getCourse))).filter(Boolean).map(c => publicCourse(c, { hasAccess: true }));
    return send(res, 200, { user: publicUser(user), courses }, { "Cache-Control": "no-store" });
  }

  if (!user) return send(res, 401, { error: "login" });
  const b = await readJson(req, 4000);
  if (b.newPassword !== undefined) {
    if (!verifyPassword(b.password || "", user.pass)) return send(res, 401, { error: "bad_password" });
    if (String(b.newPassword).length < 8) return send(res, 400, { error: "short_password" });
    user.pass = hashPassword(b.newPassword);
  }
  if (b.name !== undefined) user.name = String(b.name).trim().slice(0, 80) || user.name;
  if (b.phone !== undefined) user.phone = String(b.phone).trim().slice(0, 40);
  await saveUser(user);
  send(res, 200, { user: publicUser(user) });
});
