export const ADMIN_USERNAME = "delster1";
export const ADMIN_SESSION_COOKIE = "d3llie_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

type AdminSession = {
  username: string;
  expiresAt: number;
};

function encodeBase64Url(value: Uint8Array) {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

function isAdminSession(value: unknown): value is AdminSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const session = value as Record<string, unknown>;
  return (
    session.username === ADMIN_USERNAME &&
    typeof session.expiresAt === "number" &&
    Number.isSafeInteger(session.expiresAt)
  );
}

function readSessionCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=");
    if (separator < 0) continue;
    if (cookie.slice(0, separator).trim() === ADMIN_SESSION_COOKIE) {
      return cookie.slice(separator + 1).trim();
    }
  }

  return null;
}

export function isAdminLoginConfigured(environment: {
  ADMIN_PASSWORD?: string;
  AUTH_SECRET?: string;
}) {
  return (
    typeof environment.ADMIN_PASSWORD === "string" &&
    encoder.encode(environment.ADMIN_PASSWORD).length >= 16 &&
    typeof environment.AUTH_SECRET === "string" &&
    encoder.encode(environment.AUTH_SECRET).length >= 32
  );
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
  configuredPassword: string
) {
  const [submittedDigest, configuredDigest] = await Promise.all([
    digest(password),
    digest(configuredPassword),
  ]);
  return username === ADMIN_USERNAME && constantTimeEqual(submittedDigest, configuredDigest);
}

export async function createAdminSessionCookie(secret: string, requestUrl: string) {
  const session: AdminSession = {
    username: ADMIN_USERNAME,
    expiresAt: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
  };
  const payload = encodeBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = encodeBase64Url(await sign(payload, secret));
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";

  return `${ADMIN_SESSION_COOKIE}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_TTL_SECONDS}${secure}`;
}

export async function isAdminRequest(request: Request, secret?: string) {
  if (!secret) return false;
  const token = readSessionCookie(request);
  if (!token) return false;

  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return false;

    const providedSignature = decodeBase64Url(signature);
    const expectedSignature = await sign(payload, secret);
    if (!constantTimeEqual(providedSignature, expectedSignature)) return false;

    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as unknown;
    return isAdminSession(session) && session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function clearAdminSessionCookie(requestUrl: string) {
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
