export async function onRequestPost({ request, env }) {
  return new Response(
    JSON.stringify({ success: false, message: "Login அமைப்பு இன்னும் தயாராகவில்லை" }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" }
    }
  );
}