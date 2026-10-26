// Admin: GET /api/admin/students → students, paid orders
//        POST  { email, name, phone, password } → create a student by hand (e.g. paid in cash)
//        PATCH { id, grant: slug } | { id, revoke: slug } | { id, password } → open/close a course, set a new password
import { route, requireAdmin, readJson, send, listFiles, getJson } from "../../lib/server.js";
import { listUsers, getUser, saveUser, publicUser, findUserByEmail, createUser, hashPassword, getCourse } from "../../lib/academy.js";

export default route(["GET", "POST", "PATCH"], requireAdmin(async (req, res) => {
  if (req.method === "GET") {
    const users = (await listUsers()).map(publicUser);
    const orders = (await Promise.all((await listFiles("orders/", 500)).map(p => getJson(p, null)))).filter(Boolean).sort((a, b) => b.ts - a.ts);
    return send(res, 200, { users, orders }, { "Cache-Control": "no-store" });
  }

  const b = await readJson(req, 4000);
  if (req.method === "POST") {
    const mail = String(b.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return send(res, 400, { error: "Неверный email" });
    if (String(b.password || "").length < 8) return send(res, 400, { error: "Пароль — минимум 8 символов" });
    if (await findUserByEmail(mail)) return send(res, 409, { error: "Такой email уже зарегистрирован" });
    const user = await createUser({ email: mail, name: b.name || mail.split("@")[0], phone: b.phone, password: b.password });
    return send(res, 200, { user: publicUser(user) });
  }

  const user = await getUser(b.id);
  if (!user) return send(res, 404, { error: "Ученик не найден" });
  if (b.grant) {
    if (!(await getCourse(b.grant))) return send(res, 404, { error: "Курс не найден" });
    user.courses = [...new Set([...(user.courses || []), b.grant])];
  }
  if (b.revoke) user.courses = (user.courses || []).filter(s => s !== b.revoke);
  if (b.password !== undefined) {
    if (String(b.password).length < 8) return send(res, 400, { error: "Пароль — минимум 8 символов" });
    user.pass = hashPassword(b.password);
  }
  await saveUser(user);
  send(res, 200, { user: publicUser(user) });
}));
