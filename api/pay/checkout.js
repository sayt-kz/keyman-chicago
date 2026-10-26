// POST /api/pay/checkout { course, lang } → { url } of the Stripe payment page
// A free course (price 0) is simply added to the account: { granted: true }.
import { route, readJson, send } from "../../lib/server.js";
import { currentUserId, getUser, saveUser, getCourse, userHasCourse, paymentsReady, createCheckout, siteOrigin, LANGS } from "../../lib/academy.js";

export default route(["POST"], async (req, res) => {
  const user = await getUser(currentUserId(req));
  if (!user) return send(res, 401, { error: "login" });
  const { course: slug, lang } = await readJson(req, 2000);
  const course = await getCourse(slug);
  if (!course || !course.published) return send(res, 404, { error: "not_found" });
  if (userHasCourse(user, course.slug)) return send(res, 200, { granted: true });

  if (!course.price) {
    user.courses = [...new Set([...(user.courses || []), course.slug])];
    await saveUser(user);
    return send(res, 200, { granted: true });
  }
  if (!paymentsReady()) return send(res, 503, { error: "payments_off" });
  const session = await createCheckout({ course, user, origin: siteOrigin(req), lang: LANGS.includes(lang) ? lang : "en" });
  send(res, 200, { url: session.url });
});
