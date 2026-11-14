export async function onRequestGet() {
  return new Response(
    JSON.stringify({ loggedIn: false }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}