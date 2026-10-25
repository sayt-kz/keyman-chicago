// Admin: GET list of leads · PATCH {id, status, note} · DELETE ?id=
import { route, requireAdmin, readJson, send, redis } from "../../lib/server.js";

const STATUSES = ["new", "work", "done", "spam"];

export default route(["GET", "PATCH", "DELETE"], requireAdmin(async (req, res) => {
  if (req.method === "GET") {
    const ids = await redis("ZREVRANGE", "leads:idx", 0, 499);
    if (!ids?.length) return send(res, 200, { leads: [] });
    const rows = await redis("HMGET", "leads", ...ids);
    const leads = rows.filter(Boolean).map(r => JSON.parse(r));
    return send(res, 200, { leads }, { "Cache-Control": "no-store" });
  }

  if (req.method === "PATCH") {
    const { id, status, note } = await readJson(req, 5000);
    const raw = id && await redis("HGET", "leads", id);
    if (!raw) return send(res, 404, { error: "Not found" });
    const lead = JSON.parse(raw);
    if (status && STATUSES.includes(status)) lead.status = status;
    if (typeof note === "string") lead.note = note.slice(0, 1000);
    await redis("HSET", "leads", id, JSON.stringify(lead));
    return send(res, 200, { lead });
  }

  const id = new URL(req.url, "http://x").searchParams.get("id");
  if (!id) return send(res, 400, { error: "id required" });
  await redis("HDEL", "leads", id);
  await redis("ZREM", "leads:idx", id);
  send(res, 200, { ok: true });
}));
