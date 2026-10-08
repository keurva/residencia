import { createCookie } from "react-router";

import type { UserRead } from "./api.types";

export const SESSION_COOKIE_NAME = "cosa_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AuthSession = {
  accessToken: string;
  user: UserRead;
};

export const sessionCookie = createCookie(SESSION_COOKIE_NAME, {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
  secure: import.meta.env.PROD,
  maxAge: SESSION_MAX_AGE_SECONDS,
});

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }
  const session = value as Partial<AuthSession>;
  return typeof session.accessToken === "string" && Boolean(session.user);
}

export async function parseSession(
  request: Request,
): Promise<AuthSession | null> {
  const parsed = await sessionCookie.parse(request.headers.get("Cookie"));
  return isValidSession(parsed) ? parsed : null;
}

export async function readClientSession(): Promise<AuthSession | null> {
  if (typeof document === "undefined") {
    return null;
  }
  const parsed = await sessionCookie.parse(document.cookie);
  return isValidSession(parsed) ? parsed : null;
}

export async function writeClientSession(session: AuthSession): Promise<void> {
  document.cookie = await sessionCookie.serialize(session);
}

export function clearClientSession(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
