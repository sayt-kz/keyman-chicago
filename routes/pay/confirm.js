// POST /api/pay/confirm { session } — called by the account page after Stripe redirects back.
// Asks Stripe whether that checkout is paid, then opens the course for the student who paid.
// Each Stripe session is recorded in orders/, so it can be granted only once.
import { route, readJson, send } from "../../lib/server.js";
import { currentUserId, getUser, saveUser, getCourse, paymentsReady, getCheckout, getOrder, saveOrder } from "../../lib/academy.js";

export default route(["POST"], async (req, res) => {
  if (!paymentsReady()) return send(res, 503, { error: "payments_off" });
  const { session: id } = await readJson(req, 2000);
  if (!/^cs_[\w]{10,200}$/.test(id || "")) return send(res, 400, { error: "bad_session" });

  const done = await getOrder(id);
  if (done) return send(res, 200, { granted: true, course: done.course });

  const s = await getCheckout(id);
  if (s.payment_status !== "paid") return send(res, 402, { error: "not_paid" });
  const user = await getUser(s.metadata?.userId);
  const course = await getCourse(s.metadata?.course);
  if (!user || !course) return send(res, 404, { error: "not_found" });
  // the buyer is whoever started the checkout; a different logged-in account does not matter
  user.courses = [...new Set([...(user.courses || []), course.slug])];
  await saveUser(user);
  await saveOrder({ id, userId: user.id, email: user.email, course: course.slug, amount: s.amount_total, currency: s.currency, ts: Date.now(), by: currentUserId(req) || null });
  send(res, 200, { granted: true, course: course.slug });
});
