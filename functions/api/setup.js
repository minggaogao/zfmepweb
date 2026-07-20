import { error, json, readJson, sameOrigin } from "../_lib/http.js";
import { hashPassword, randomToken } from "../_lib/crypto.js";

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return error(403, "请求来源无效。", "invalid_origin");
  if (!context.env.SETUP_SECRET) return error(404, "Not found.", "not_found");
  const supplied = context.request.headers.get("x-zf-setup-secret");
  if (!supplied || supplied !== context.env.SETUP_SECRET) return error(404, "Not found.", "not_found");
  const existing = await context.env.DB.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").first();
  if (existing) return error(409, "管理员已经建立。", "already_initialized");

  let body;
  try { body = await readJson(context.request); }
  catch (_) { return error(400, "初始化资料格式不正确。", "invalid_request"); }
  const account = String(body.account || "").trim();
  const password = String(body.password || "");
  const name = String(body.name || "泽丰管理员").trim();
  if (!/^[A-Za-z0-9_-]{4,40}$/.test(account) || password.length < 12) {
    return error(400, "管理员账号或密码不符合要求。", "invalid_admin");
  }
  const id = crypto.randomUUID();
  const salt = randomToken(16);
  const iterations = 100000;
  const passwordHash = await hashPassword(password, salt, iterations);
  await context.env.DB.prepare(
    `INSERT INTO users
     (id, account, display_name, role, password_hash, password_salt, password_iterations, must_change_password)
     VALUES (?1, ?2, ?3, 'admin', ?4, ?5, ?6, 0)`
  ).bind(id, account, name, passwordHash, salt, iterations).run();
  return json({ ok: true, admin: { id, account, name } }, { status: 201 });
}
