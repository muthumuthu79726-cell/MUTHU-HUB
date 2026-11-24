
function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export async function onRequest(context) {
  const { request, env } = context;

  try {
    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)muthu_admin_session=([^;]+)/);

    if (!match || !env.SESSION_SECRET) {
      return Response.redirect(new URL("/admin.html", request.url), 302);
    }

    const parts = match[1].split(".");
    if (parts.length !== 2) {
      return Response.redirect(new URL("/admin.html", request.url), 302);
    }

    const [payload, signature] = parts;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(signature),
      new TextEncoder().encode(payload)
    );

    if (!valid) {
      return Response.redirect(new URL("/admin.html", request.url), 302);
    }

    const data = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(payload))
    );

    if (!Number.isFinite(data.exp) || data.exp <= Date.now() / 1000) {
      return Response.redirect(new URL("/admin.html", request.url), 302);
    }

    return await context.next();
  } catch {
    return Response.redirect(new URL("/admin.html", request.url), 302);
  }
}

