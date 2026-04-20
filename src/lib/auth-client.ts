"use client";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_PROXY_URL || "/api/proxy";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  locationId: string | null;
  location: {
    id: string;
    name: string;
  } | null;
};

type LoginResponse = {
  token: string;
  refreshToken?: string;
  user: AuthUser;
};

export function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem("authToken") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("accessToken") ||
    ""
  );
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem("authUser");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeLoginSession(data: LoginResponse) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("authToken", data.token);
  if (data.refreshToken) {
    window.localStorage.setItem("refreshToken", data.refreshToken);
  }
  window.localStorage.setItem("authUser", JSON.stringify(data.user));
}

export function clearLoginSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("authToken");
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("authUser");
  window.localStorage.removeItem("refreshToken");
}

export function getFirstName(name: string | undefined) {
  if (!name) return "User";
  const trimmed = name.trim();
  if (!trimmed) return "User";
  return trimmed.split(/\s+/)[0];
}
