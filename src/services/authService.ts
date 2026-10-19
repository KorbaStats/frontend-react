import type { AuthSession, Credentials, User } from "@/data/types";
import { apiRequest, setAccessToken } from "@/services/http";

// POST /api/auth/register
export async function register(
  credentials: Credentials,
): Promise<Pick<User, "id" | "email">> {
  return apiRequest<Pick<User, "id" | "email">>("/api/auth/register", {
    method: "POST",
    body: credentials,
  });
}

// POST /api/auth/login
export async function login(credentials: Credentials): Promise<AuthSession> {
  const session = await apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
  setAccessToken(session.accessToken);
  return session;
}

// POST /api/auth/refresh
export async function refreshSession(): Promise<AuthSession> {
  const session = await apiRequest<AuthSession>("/api/auth/refresh", {
    method: "POST",
  });
  setAccessToken(session.accessToken);
  return session;
}

// POST /api/auth/logout
export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

// GET /api/auth/me
export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/api/auth/me");
}
