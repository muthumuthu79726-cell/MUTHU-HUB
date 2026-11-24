
export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Logout வெற்றி"
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "muthu_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
      }
    }
  );
}
