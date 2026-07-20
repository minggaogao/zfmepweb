import { cookie, clientIpPrefix, error, json, readJson, sameOrigin } from "../_lib/http.js";
import { hashPassword, randomToken, safeEqual, sha256 } from "../_lib/crypto.js";
import { SESSION_COOKIE } from "../_lib/auth.js";

const SESSION_SECONDS = 60 * 60 * 24 * 7;
const MAX_ATTEMPTS = 5;

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return error(403, "请求来源无效。", "invalid_origin");
  let body;
  try { body = await readJson(context.request); }
  catch (_) { return error(400, "登录信息格式不正确。", "invalid_request"); }

  const account = String(body.account || "").trim().slice(0, 80);
  const password = String(body.password || "");
  if (!account || password.length < 8 || password.length > 128) {
    return error(400, "账号或密码不正确。", "invalid_credentials");
  }

  const ip = clientIpPrefix(context.request);
  const recent = await context.env.DB.prepare(
    `SELECT COUNT(*) AS count
       FROM login_attempts
      WHERE account = ?1 COLLATE NOCASE
        AND ip_prefix = ?2
        AND succeeded = 0
        AND attempted_at > datetime('now', '-15 minutes')`
  ).bind(account, ip).first();
  if (Number(recent?.count || 0) >= MAX_ATTEMPTS) {
    return error(429, "登录尝试过多，请15分钟后重试。", "too_many_attempts");
  }

  const user = await context.env.DB.prepare(
    `SELECT id, account, display_name, role, status, password_hash, password_salt,
            password_iterations, locked_until, failed_attempts, must_change_password
       FROM users WHERE account = ?1 COLLATE NOCASE LIMIT 1`
  ).bind(account).first();

  let valid = false;
  if (user && user.status === "active" && (!user.locked_until || user.locked_until <= new Date().toISOString())) {
    const candidate = await hashPassword(password, user.password_salt, Number(user.password_iterations));
    valid = safeEqual(candidate, user.password_hash);
  }

  await context.env.DB.prepare(
    `INSERT INTO login_attempts (account, ip_prefix, succeeded) VALUES (?1, ?2, ?3)`
  ).bind(account, ip, valid ? 1 : 0).run();

  if (!valid) {
    if (user) {
      const failures = Number(user.failed_attempts || 0) + 1;
      const lock = failures >= MAX_ATTEMPTS ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await context.env.DB.prepare(
        `UPDATE users SET failed_attempts = ?1, locked_until = COALESCE(?2, locked_until), updated_at = CURRENT_TIMESTAMP WHERE id = ?3`
      ).bind(failures, lock, user.id).run();
    }
    return error(401, "账号或密码不正确。", "invalid_credentials");
  }

  const rawToken = randomToken(32);
  const tokenHash = await sha256(rawToken);
  const csrf = randomToken(24);
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  const userAgentHash = await sha256(context.request.headers.get("user-agent") || "");

  await context.env.DB.batch([
    context.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, token_hash, csrf_token, user_agent_hash, ip_prefix, expires_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
    ).bind(sessionId, user.id, tokenHash, csrf, userAgentHash, ip, expires),
    context.env.DB.prepare(
      `UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?1`
    ).bind(user.id),
    context.env.DB.prepare(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, ip_prefix)
       VALUES (?1, 'login', 'user', ?1, ?2)`
    ).bind(user.id, ip)
  ]);

  return json({
    ok: true,
    csrf,
    user: {
      account: user.account,
      name: user.display_name,
      role: user.role,
      mustChangePassword: Boolean(user.must_change_password)
    }
  }, { headers: { "set-cookie": cookie(SESSION_COOKIE, rawToken, { maxAge: SESSION_SECONDS }) } });
}
