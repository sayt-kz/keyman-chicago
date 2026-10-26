// The only Vercel function: every /api/* request is rewritten here (vercel.json) and dispatched to
// a handler in routes/. One function instead of one per file keeps the project under the Hobby plan's
// function limit. The local dev server (server.js) uses this router too.
import { send } from "../lib/server.js";
import lead from "../routes/lead.js";
import content from "../routes/content.js";
import photo from "../routes/photo.js";
import courses from "../routes/courses.js";
import lesson from "../routes/lesson.js";
import lessonFile from "../routes/lesson-file.js";
import accountRegister from "../routes/account/register.js";
import accountLogin from "../routes/account/login.js";
import accountMe from "../routes/account/me.js";
import payCheckout from "../routes/pay/checkout.js";
import payConfirm from "../routes/pay/confirm.js";
import adminLogin from "../routes/admin/login.js";
import adminLeads from "../routes/admin/leads.js";
import adminContent from "../routes/admin/content.js";
import adminUpload from "../routes/admin/upload.js";
import adminStatus from "../routes/admin/status.js";
import adminCourses from "../routes/admin/courses.js";
import adminStudents from "../routes/admin/students.js";
import adminVideoUpload from "../routes/admin/video-upload.js";

const ROUTES = {
  "lead": lead, "content": content, "photo": photo, "courses": courses, "lesson": lesson, "lesson-file": lessonFile,
  "account/register": accountRegister, "account/login": accountLogin, "account/me": accountMe,
  "pay/checkout": payCheckout, "pay/confirm": payConfirm,
  "admin/login": adminLogin, "admin/leads": adminLeads, "admin/content": adminContent, "admin/upload": adminUpload,
  "admin/status": adminStatus, "admin/courses": adminCourses, "admin/students": adminStudents, "admin/video-upload": adminVideoUpload,
};

export default function handler(req, res) {
  const url = new URL(req.url, "http://x");
  // /api/admin/leads → "admin/leads"; after the Vercel rewrite the path may also arrive as ?__path=
  let path = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  if (!path || path === "index") path = url.searchParams.get("__path") || "";
  const fn = ROUTES[path];
  if (!fn) return send(res, 404, { error: "No such API" });
  return fn(req, res);
}
