export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(status, message, code = "request_error") {
  return json({ ok: false, error: code, message }, { status });
}

export async function readJson(request) {
  const type = request.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new Error("invalid_content_type");
  return request.json();
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return new URL(origin).host === new URL(request.url).host;
}

export function cookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
  if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  return parts.join("; ");
}

export function getCookie(request, name) {
  const source = request.headers.get("cookie") || "";
  for (const part of source.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function clientIpPrefix(request) {
  const raw = request.headers.get("cf-connecting-ip") || "unknown";
  if (raw.includes(":")) return raw.split(":").slice(0, 4).join(":");
  const segments = raw.split(".");
  return segments.length === 4 ? `${segments[0]}.${segments[1]}.${segments[2]}.0/24` : raw;
}
