import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "tbi_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? process.env.DEVELOPER_PASSWORD ?? "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getAdminPassword();
}

export function getAdminConfigStatus() {
  return {
    hasPassword: Boolean(getAdminPassword()),
    hasSessionSecret: Boolean(process.env.ADMIN_SESSION_SECRET),
  };
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function signSession(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function createSessionValue() {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${expiresAt}`;

  return `${payload}.${signSession(payload)}`;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  if (!value || !getAdminPassword() || !getSessionSecret()) {
    return false;
  }

  const parts = value.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const expectedSignature = signSession(payload);

  if (!safeEqual(parts[2], expectedSignature)) {
    return false;
  }

  return Number(parts[1]) > Date.now();
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();

  if (!expected) {
    return false;
  }

  return safeEqual(password, expected);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
