import { audit, requireSession, verifyCsrf } from "../../_lib/auth.js";
import { error, json, readJson, sameOrigin } from "../../_lib/http.js";
import { hashPassword, randomToken } from "../../_lib/crypto.js";

export async function onRequestGet(context) {
  const auth = await requireSession(context, ["admin", "technician"]);
  if (auth.response) return auth.response;
  const rows = await context.env.DB.prepare(
    `SELECT u.id, u.account, u.display_name, u.status, u.last_login_at,
            h.id AS home_id, h.name AS home_name,
            COUNT(DISTINCT d.id) AS device_count
       FROM users u
       LEFT JOIN home_members hm ON hm.user_id = u.id
       LEFT JOIN homes h ON h.id = hm.home_id
       LEFT JOIN devices d ON d.home_id = h.id
      WHERE u.role = 'customer'
      GROUP BY u.id, h.id
      ORDER BY u.created_at DESC`
  ).all();
  return json({ ok: true, customers: rows.results || [] });
}

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return error(403, "请求来源无效。", "invalid_origin");
  const auth = await requireSession(context, ["admin"]);
  if (auth.response) return auth.response;
  if (!verifyCsrf(context, auth.session)) return error(403, "安全校验失败。", "invalid_csrf");

  let body;
  try { body = await readJson(context.request); }
  catch (_) { return error(400, "客户资料格式不正确。", "invalid_request"); }
  const account = String(body.account || "").trim();
  const displayName = String(body.displayName || "").trim();
  const homeName = String(body.homeName || "").trim();
  const initialPassword = String(body.initialPassword || "");
  if (!/^[A-Za-z0-9_-]{4,40}$/.test(account) || !displayName || !homeName || initialPassword.length < 10) {
    return error(400, "账号、客户名称、住宅名称或初始密码不符合要求。", "invalid_customer");
  }

  const userId = crypto.randomUUID();
  const homeId = crypto.randomUUID();
  const salt = randomToken(16);
  const iterations = 100000;
  const passwordHash = await hashPassword(initialPassword, salt, iterations);
  try {
    await context.env.DB.batch([
      context.env.DB.prepare(
        `INSERT INTO users (id, account, display_name, role, password_hash, password_salt, password_iterations)
         VALUES (?1, ?2, ?3, 'customer', ?4, ?5, ?6)`
      ).bind(userId, account, displayName, passwordHash, salt, iterations),
      context.env.DB.prepare(
        `INSERT INTO homes (id, name, address) VALUES (?1, ?2, ?3)`
      ).bind(homeId, homeName, String(body.address || "")),
      context.env.DB.prepare(
        `INSERT INTO home_members (home_id, user_id, member_role, is_primary) VALUES (?1, ?2, 'owner', 1)`
      ).bind(homeId, userId)
    ]);
  } catch (_) {
    return error(409, "客户账号已存在，或资料无法保存。", "customer_conflict");
  }
  await audit(context, auth.session, "customer.create", "user", userId, JSON.stringify({ homeId }));
  return json({ ok: true, customer: { id: userId, account, displayName, homeId, homeName } }, { status: 201 });
}
