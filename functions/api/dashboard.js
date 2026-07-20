import { error, json } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";

export async function onRequestGet(context) {
  const auth = await requireSession(context, ["customer"]);
  if (auth.response) return auth.response;
  const { session } = auth;
  const requestedHome = new URL(context.request.url).searchParams.get("home");

  const home = await context.env.DB.prepare(
    `SELECT h.id, h.name, h.address
       FROM homes h JOIN home_members hm ON hm.home_id = h.id
      WHERE hm.user_id = ?1 AND (?2 IS NULL OR h.id = ?2)
      ORDER BY hm.is_primary DESC LIMIT 1`
  ).bind(session.user_id, requestedHome).first();
  if (!home) return error(404, "没有可访问的住宅。", "home_not_found");

  const [devices, components, tasks, recent] = await Promise.all([
    context.env.DB.prepare(
      `SELECT id, internal_code, device_type, brand, model, serial_number, location, status
         FROM devices WHERE home_id = ?1 ORDER BY device_type`
    ).bind(home.id).all(),
    context.env.DB.prepare(
      `SELECT c.id, c.device_id, c.kind, c.name, c.specification, c.barcode, c.quantity,
              c.last_serviced_on, c.next_due_on, c.status
         FROM components c JOIN devices d ON d.id = c.device_id
        WHERE d.home_id = ?1 ORDER BY d.internal_code, c.position_index, c.name`
    ).bind(home.id).all(),
    context.env.DB.prepare(
      `SELECT p.id, p.title, p.task_type, p.due_on, p.risk_level, p.status,
              d.device_type, d.location
         FROM maintenance_plans p LEFT JOIN devices d ON d.id = p.device_id
        WHERE p.home_id = ?1 AND p.status = 'active'
        ORDER BY CASE p.risk_level WHEN 'safety' THEN 0 WHEN 'overflow' THEN 1 WHEN 'property' THEN 2 ELSE 3 END,
                 p.due_on LIMIT 12`
    ).bind(home.id).all(),
    context.env.DB.prepare(
      `SELECT id, title, status, completed_at
         FROM work_orders WHERE home_id = ?1 AND completed_at IS NOT NULL
        ORDER BY completed_at DESC LIMIT 6`
    ).bind(home.id).all()
  ]);

  return json({
    ok: true,
    home,
    summary: {
      devices: devices.results?.length || 0,
      components: components.results?.length || 0,
      due: tasks.results?.filter((task) => task.due_on && task.due_on <= new Date().toISOString().slice(0, 10)).length || 0,
      completed: recent.results?.length || 0
    },
    devices: devices.results || [],
    components: components.results || [],
    tasks: tasks.results || [],
    recentServices: recent.results || []
  });
}
