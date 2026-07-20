import { error } from "./_lib/http.js";

export async function onRequest(context) {
  if (!context.env.DB) return error(503, "维保数据库尚未连接。", "database_unavailable");
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(self), geolocation=(), microphone=()");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("content-security-policy", "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.open-meteo.com https://formsubmit.co; form-action 'self' https://formsubmit.co; frame-ancestors 'self'; base-uri 'self'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
