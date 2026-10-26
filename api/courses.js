// GET /api/courses → published courses for the catalog
// GET /api/courses?c=<slug> → one course with its lesson list (no video links) and whether the visitor has access
import { route, send } from "../lib/server.js";
import { listCourses, getCourse, publicCourse, currentUserId, getUser, userHasCourse, paymentsReady } from "../lib/academy.js";

export default route(["GET"], async (req, res) => {
  const slug = new URL(req.url, "http://x").searchParams.get("c");
  const user = await getUser(currentUserId(req));
  const headers = { "Cache-Control": "no-store" };
  if (!slug) {
    const courses = (await listCourses()).map(c => publicCourse(c, { hasAccess: userHasCourse(user, c.slug) }));
    return send(res, 200, { courses, loggedIn: !!user, payments: paymentsReady() }, headers);
  }
  const c = await getCourse(slug);
  if (!c || !c.published) return send(res, 404, { error: "not_found" });
  send(res, 200, { course: publicCourse(c, { hasAccess: userHasCourse(user, c.slug) }), loggedIn: !!user, payments: paymentsReady() }, headers);
});
