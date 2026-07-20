import { cookie, error, json, sameOrigin } from "../_lib/http.js";
import { getSession, SESSION_COOKIE, verifyCsrf } from "../_lib/auth.js";

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return error(403, "请求来源无效。", "invalid_origin");
  const session = await getSession(context);
  if (session && !verifyCsrf(context, session)) return error(403, "安全校验失败。", "invalid_csrf");
  if (session) {
    await context.env.DB.prepare("DELETE FROM sessions WHERE id = ?1").bind(session.session_id).run();
  }
  return json({ ok: true }, {
    headers: { "set-cookie": cookie(SESSION_COOKIE, "", { maxAge: 0, expires: new Date(0) }) }
  });
}
