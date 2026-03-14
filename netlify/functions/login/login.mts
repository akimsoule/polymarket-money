import { createAuthToken, validateCredentials } from "../../app/src/auth.js";

export default async function login(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const payload = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  const email = payload.email?.trim() ?? "";
  const password = payload.password ?? "";

  if (!validateCredentials(email, password)) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const token = createAuthToken(email);
  return new Response(
    JSON.stringify({
      token,
      email,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );
}
