import { redirect } from "react-router";

import { ApiError } from "./api";
import { readClientSession, type AuthSession } from "./session";

export async function requireClientSession(): Promise<AuthSession> {
  const session = await readClientSession();
  if (!session) {
    throw redirect("/login");
  }
  return session;
}

export function redirectOnAuthError(error: unknown): never {
  if (error instanceof ApiError && error.status === 401) {
    throw redirect("/login");
  }
  throw error;
}
