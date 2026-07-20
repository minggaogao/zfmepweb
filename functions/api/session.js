import { error, json } from "../_lib/http.js";
import { getSession } from "../_lib/auth.js";

export async function onRequestGet(context) {
  const session = await getSession(context);
  if (!session) return error(401, "未登录。", "authentication_required");
  const homes = session.role === "customer"
    ? await context.env.DB.prepare(
        `SELECT h.id, h.name, h.address, hm.member_role, hm.is_primary
           FROM homes h JOIN home_members hm ON hm.home_id = h.id
          WHERE hm.user_id = ?1 ORDER BY hm.is_primary DESC, h.name`
      ).bind(session.user_id).all()
    : { results: [] };
  return json({
    ok: true,
    csrf: session.csrf_token,
    user: {
      account: session.account,
      name: session.display_name,
      role: session.role,
      mustChangePassword: Boolean(session.must_change_password)
    },
    homes: homes.results || []
  });
}
