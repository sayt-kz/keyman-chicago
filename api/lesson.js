// GET /api/lesson?c=<course>&l=<lesson> → { url } short-lived signed link to the lesson video
// Given only to students who bought the course (free preview lessons: to anyone), and to the admin.
import { route, send, isAdmin } from "../lib/server.js";
import { getCourse, currentUserId, getUser, userHasCourse, lessonVideoUrl } from "../lib/academy.js";

export default route(["GET"], async (req, res) => {
  const q = new URL(req.url, "http://x").searchParams;
  const course = await getCourse(q.get("c"));
  const admin = isAdmin(req);
  if (!course || (!course.published && !admin)) return send(res, 404, { error: "not_found" });
  const lesson = course.lessons.find(l => l.id === q.get("l"));
  if (!lesson || !lesson.video) return send(res, 404, { error: "no_video" });
  if (!lesson.free && !admin) {
    const user = await getUser(currentUserId(req));
    if (!user) return send(res, 401, { error: "login" });
    if (!userHasCourse(user, course.slug)) return send(res, 403, { error: "buy" });
  }
  send(res, 200, { url: await lessonVideoUrl(lesson.video) }, { "Cache-Control": "no-store" });
});
