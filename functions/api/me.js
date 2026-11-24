
function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export async function onRequestGet({ request, env }) {
  try {
    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)muthu_admin_session=([^;]+)/);

    if (!match || !env.SESSION_SECRET) {
      return Response.json({ loggedIn: false }, { status: 401 });
    }

    const parts = match[1].split(".");
    if (parts.length !== 2) {
      return Response.json({ loggedIn: false }, { status: 401 });
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
      fromBase64Url(signature),
      new TextEncoder().encode(payload)
    );

    if (!valid) {
      return Response.json({ loggedIn: false }, { status: 401 });
    }

    const data = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload))
    );

    if (!Number.isFinite(data.exp) || data.exp <= Date.now() / 1000) {
      return Response.json({ loggedIn: false }, { status: 401 });
    }

    return Response.json({ loggedIn: true });
  } catch {
    return Response.json({ loggedIn: false }, { status: 401 });
  }
}
