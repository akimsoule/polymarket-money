import jwt from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const ALLOWED_EMAIL =
  process.env.DASHBOARD_LOGIN_EMAIL ?? "soule_akim@yahoo.fr";
const ALLOWED_PASSWORD = process.env.DASHBOARD_LOGIN_PASSWORD ?? "akimsoule";
const JWT_SECRET = process.env.JWT_SECRET ?? "please-change-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "12h";

interface TokenClaims {
  email: string;
}

function unauthorizedResponse(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export function validateCredentials(email: string, password: string): boolean {
  return email === ALLOWED_EMAIL && password === ALLOWED_PASSWORD;
}

export function createAuthToken(email: string): string {
  const options: SignOptions = {
    subject: email,
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign({ email }, JWT_SECRET as Secret, options);
}

export function requireAuth(
  req: Request,
): { ok: true; email: string } | { ok: false; response: Response } {
  const raw = req.headers.get("authorization") ?? "";
  const [scheme, token] = raw.split(" ");

  if (scheme !== "Bearer" || !token) {
    return {
      ok: false,
      response: unauthorizedResponse("Missing or invalid authorization token"),
    };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET as Secret);
    if (typeof payload !== "object" || payload === null) {
      return {
        ok: false,
        response: unauthorizedResponse("Invalid token payload"),
      };
    }

    const claims = payload as JwtPayload & TokenClaims;
    if (!claims.email || typeof claims.email !== "string") {
      return {
        ok: false,
        response: unauthorizedResponse("Invalid token payload"),
      };
    }

    return { ok: true, email: claims.email };
  } catch {
    return {
      ok: false,
      response: unauthorizedResponse("Invalid or expired token"),
    };
  }
}
