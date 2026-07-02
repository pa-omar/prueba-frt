import { useEffect, useState } from "react";

export type AuthUser = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: "customer" | "admin" | string;
} | null;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("farmacorp_token");
}

export function getUser(): AuthUser {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("farmacorp_user");
  return raw ? JSON.parse(raw) : null;
}

export function getRole(): "customer" | "admin" | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem("farmacorp_role") as any) || null;
}

export function buildAuthUser(data: any, fallback: Partial<NonNullable<AuthUser>> = {}) {
  const user = data?.user ?? data ?? {};

  return {
    id: user.id ?? user.customerId ?? user.customer_id ?? fallback.id,
    email: user.email ?? fallback.email,
    name: user.fullName ?? user.full_name ?? user.name ?? fallback.name,
    role: user.role ?? fallback.role,
  };
}

export function setAuth(token: string, user: any, role: "customer" | "admin") {
  localStorage.setItem("farmacorp_token", token);
  localStorage.setItem("farmacorp_user", JSON.stringify(user));
  localStorage.setItem("farmacorp_role", role);
  window.dispatchEvent(new Event("farmacorp_auth"));
}

export function clearAuth() {
  localStorage.removeItem("farmacorp_token");
  localStorage.removeItem("farmacorp_user");
  localStorage.removeItem("farmacorp_role");
  window.dispatchEvent(new Event("farmacorp_auth"));
}

export function useAuth() {
  const [state, setState] = useState<{ user: AuthUser; role: ReturnType<typeof getRole> }>({
    user: null,
    role: null,
  });

  useEffect(() => {
    const sync = () => setState({ user: getUser(), role: getRole() });
    sync();
    window.addEventListener("farmacorp_auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("farmacorp_auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
