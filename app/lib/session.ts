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

export async function parseSession(
  request: Request,
): Promise<AuthSession | null> {
  const parsed = await sessionCookie.parse(request.headers.get("Cookie"));
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const session = parsed as Partial<AuthSession>;
  if (typeof session.accessToken !== "string" || !session.user) {
    return null;
  }

  return session as AuthSession;
}
