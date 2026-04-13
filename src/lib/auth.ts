import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Type: UserRole enum (Prisma generation required for full types)
export type UserRole = "SUPER_ADMIN" | "BUSINESS_ADMIN" | "WAITER" | "KITCHEN";

// JWT secrets validation
function validateAndEncodeSecret(secret: string | undefined, name: string): Uint8Array {
  const secretValue = secret ?? "fallback-secret-key-min-32-chars-long";

  if (secretValue.length < 32) {
    throw new Error(
      `${name} must be at least 32 characters long. ` +
      `Got ${secretValue.length} chars. Please set ${name.includes("REFRESH") ? "JWT_REFRESH_SECRET" : "JWT_SECRET"} in .env.local`
    );
  }

  return new TextEncoder().encode(secretValue);
}

const JWT_SECRET = validateAndEncodeSecret(
  process.env.JWT_SECRET,
  "JWT_SECRET"
);
const JWT_REFRESH_SECRET = validateAndEncodeSecret(
  process.env.JWT_REFRESH_SECRET,
  "JWT_REFRESH_SECRET"
);

export interface JWTPayload {
  userId: string;
  tenantId: string | null;
  role: UserRole;
  email: string;
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "1h")
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d")
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    // Silently fail for expired/invalid tokens (expected during auth flow)
    // Don't log here as it creates noise; logging happens at API route level
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    // Silently fail for expired/invalid tokens
    return null;
  }
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch (error) {
    // Error getting cookies (e.g., in API route without proper context)
    return null;
  }
}

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = "Lax";
  const path = "/";
  const secure = isProduction ? "; Secure" : "";

  response.headers.append(
    "Set-Cookie",
    `access_token=${accessToken}; HttpOnly; Path=${path}; Max-Age=3600; SameSite=${sameSite}${secure}`
  );
  response.headers.append(
    "Set-Cookie",
    `refresh_token=${refreshToken}; HttpOnly; Path=${path}; Max-Age=604800; SameSite=${sameSite}${secure}`
  );
}
