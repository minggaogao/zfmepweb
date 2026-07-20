import { clientIpPrefix, error, getCookie } from "./http.js";
import { sha256 } from "./crypto.js";

export const SESSION_COOKIE = "zf_session";

export async function getSession(context) {
  const token = getCookie(context.request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await context.env.DB.prepare(
    `SELECT s.id AS session_id, s.csrf_token, s.expires_at,
            u.id AS user_id, u.account, u.display_name, u.role, u.status, u.must_change_password
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?1 AND s.expires_at > CURRENT_TIMESTAMP
      LIMIT 1`
  ).bind(tokenHash).first();
  if (!row || row.status !== "active") return null;
  return row;
}

export async function requireSession(context, roles = []) {
  const session = await getSession(context);
  if (!session) return { response: error(401, "请先登录。", "authentication_required") };
  if (roles.length && !roles.includes(session.role)) {
    return { response: error(403, "没有权限执行此操作。", "forbidden") };
  }
  return { session };
}

export function verifyCsrf(context, session) {
  const received = context.request.headers.get("x-zf-csrf");
  return Boolean(received && received === session.csrf_token);
}

export async function audit(context, session, action, entityType = null, entityId = null, detail = null) {
  await context.env.DB.prepare(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, detail, ip_prefix)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  ).bind(session?.user_id || null, action, entityType, entityId, detail, clientIpPrefix(context.request)).run();
}
