// Admin: GET which integrations are connected (shown on the "Settings" tab).
import { route, requireAdmin, send, integrations } from "../../lib/server.js";

export default route(["GET"], requireAdmin(async (req, res) => send(res, 200, integrations())));
