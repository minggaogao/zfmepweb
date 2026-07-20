import { audit, requireSession, verifyCsrf } from "../../_lib/auth.js";
import { error, json, readJson, sameOrigin } from "../../_lib/http.js";

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return error(403, "请求来源无效。", "invalid_origin");
  const auth = await requireSession(context, ["admin", "technician"]);
  if (auth.response) return auth.response;
  if (!verifyCsrf(context, auth.session)) return error(403, "安全校验失败。", "invalid_csrf");
  let body;
  try { body = await readJson(context.request); }
  catch (_) { return error(400, "设备资料格式不正确。", "invalid_request"); }

  const homeId = String(body.homeId || "");
  const internalCode = String(body.internalCode || "").trim();
  const type = String(body.deviceType || "").trim();
  if (!homeId || !internalCode || !type || !Array.isArray(body.components)) {
    return error(400, "住宅、设备编号、设备类型和部件明细不能为空。", "invalid_device");
  }
  const home = await context.env.DB.prepare("SELECT id FROM homes WHERE id = ?1").bind(homeId).first();
  if (!home) return error(404, "住宅不存在。", "home_not_found");

  const deviceId = crypto.randomUUID();
  const statements = [
    context.env.DB.prepare(
      `INSERT INTO devices
       (id, home_id, system_id, internal_code, device_type, brand, model, serial_number,
        manufacturer_barcode, location, commissioned_on, warranty_until, status, notes)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`
    ).bind(
      deviceId, homeId, body.systemId || null, internalCode, type, body.brand || null,
      body.model || null, body.serialNumber || null, body.manufacturerBarcode || null,
      body.location || null, body.commissionedOn || null, body.warrantyUntil || null,
      body.status || "active", body.notes || null
    )
  ];
  body.components.slice(0, 100).forEach((component, index) => {
    const componentId = crypto.randomUUID();
    statements.push(context.env.DB.prepare(
      `INSERT INTO components
       (id, device_id, kind, name, brand, model, specification, barcode, quantity,
        position_index, default_cycle_months, status)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 'active')`
    ).bind(
      componentId, deviceId, component.kind || "component", String(component.name || ""),
      component.brand || null, component.model || null, component.specification || null,
      component.barcode || null, Number(component.quantity || 1), index,
      component.cycleMonths ? Number(component.cycleMonths) : null
    ));
  });
  try { await context.env.DB.batch(statements); }
  catch (_) { return error(409, "设备编号可能重复，资料未保存。", "device_conflict"); }
  await audit(context, auth.session, "device.create", "device", deviceId, JSON.stringify({ internalCode, componentCount: body.components.length }));
  return json({ ok: true, device: { id: deviceId, internalCode }, componentCount: body.components.length }, { status: 201 });
}
