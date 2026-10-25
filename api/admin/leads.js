// Admin: GET list of leads · PATCH {id, status, note} · DELETE ?id=
import { route, requireAdmin, readJson, send, listLeads, getLead, saveLead, deleteLead } from "../../lib/server.js";

const STATUSES = ["new", "work", "done", "spam"];
const validId = id => /^[\w-]{6,60}$/.test(String(id || ""));

export default route(["GET", "PATCH", "DELETE"], requireAdmin(async (req, res) => {
  if (req.method === "GET") return send(res, 200, { leads: await listLeads() }, { "Cache-Control": "no-store" });

  if (req.method === "PATCH") {
    const { id, status, note } = await readJson(req, 5000);
    const lead = validId(id) && await getLead(id);
    if (!lead) return send(res, 404, { error: "Not found" });
    if (status && STATUSES.includes(status)) lead.status = status;
    if (typeof note === "string") lead.note = note.slice(0, 1000);
    await saveLead(lead);
    return send(res, 200, { lead });
  }

  const id = new URL(req.url, "http://x").searchParams.get("id");
  if (!validId(id)) return send(res, 400, { error: "id required" });
  await deleteLead(id);
  send(res, 200, { ok: true });
}));
