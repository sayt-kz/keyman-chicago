// Admin: GET /api/admin/courses → all courses (drafts too, with video paths)
//        PUT /api/admin/courses { course }  → create or update one course
//        DELETE /api/admin/courses?c=<slug> → delete a course (its videos stay in storage)
import { route, requireAdmin, readJson, send } from "../../lib/server.js";
import { listCourses, getCourse, saveCourse, deleteCourse, validSlug, cleanCourse, paymentsReady } from "../../lib/academy.js";

export default route(["GET", "PUT", "DELETE"], requireAdmin(async (req, res) => {
  if (req.method === "GET") return send(res, 200, { courses: await listCourses({ all: true }), payments: paymentsReady() }, { "Cache-Control": "no-store" });

  if (req.method === "DELETE") {
    const slug = new URL(req.url, "http://x").searchParams.get("c");
    if (!(await getCourse(slug))) return send(res, 404, { error: "Курс не найден" });
    await deleteCourse(slug);
    return send(res, 200, { ok: true });
  }

  const { course } = await readJson(req, 400_000);
  if (!course || !validSlug(course.slug)) return send(res, 400, { error: "Адрес курса: латиница, цифры и дефис (например pro-master)" });
  await saveCourse(course);
  send(res, 200, { course: cleanCourse(course) });
}));
