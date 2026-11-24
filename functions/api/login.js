
function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
      return Response.json(
        { success: false, message: "Server அமைப்பு முழுமையடையவில்லை" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const password = body.password;

    if (
      typeof password !== "string" ||
      password !== env.ADMIN_PASSWORD
    ) {
      return Response.json(
        { success: false, message: "தவறான Password" },
        { status: 401 }
      );
    }

    const expires = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
    const payload = toBase64Url(
      new TextEncoder().encode(JSON.stringify({ exp: expires }))
    );

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );

    const token = payload + "." + toBase64Url(new Uint8Array(signature));

    return new Response(
      JSON.stringify({ success: true, message: "Login வெற்றி" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `muthu_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
        }
      }
    );
  } catch {
    return Response.json(
      { success: false, message: "Login கோளாறு" },
      { status: 400 }
    );
  }
}
