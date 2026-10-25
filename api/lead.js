// POST /api/lead — requests from the contact form, the chat bot and the "Quick request" tab.
import crypto from "node:crypto";
import { route, readJson, send, redis, limited, clientIp, notifyTelegram } from "../lib/server.js";

const clip = (v, n) => String(v ?? "").trim().slice(0, n);

export default route(["POST"], async (req, res) => {
  const ip = clientIp(req);
  if (await limited(`lead:${ip}`, 8, 600)) return send(res, 429, { error: "Too many requests, please call us" });

  const b = await readJson(req, 20_000);
  const lead = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    status: "new",
    source: clip(b.source || "form", 20),
    name: clip(b.name, 80),
    phone: clip(b.phone, 40),
    email: clip(b.email, 120),
    service: clip(b.service, 80),
    vehicle: clip(b.vehicle, 120),
    location: clip(b.location, 160),
    message: clip(b.message, 1500),
    lang: clip(b.lang, 5),
  };
  if (lead.phone.replace(/\D/g, "").length < 10) return send(res, 400, { error: "Phone number is required" });
  if (b.website) return send(res, 200, { ok: true }); // honeypot field — silently drop bots

  await redis("HSET", "leads", lead.id, JSON.stringify(lead));
  await redis("ZADD", "leads:idx", lead.ts, lead.id);

  const lines = [
    "Новая заявка Key Man",
    lead.name && `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.service && `Услуга: ${lead.service}`,
    lead.vehicle && `Авто: ${lead.vehicle}`,
    lead.location && `Где: ${lead.location}`,
    lead.message && `Сообщение: ${lead.message}`,
    `Источник: ${lead.source}${lead.lang ? " · " + lead.lang : ""}`,
  ].filter(Boolean);
  await notifyTelegram(lines.join("\n"));

  send(res, 200, { ok: true });
});
