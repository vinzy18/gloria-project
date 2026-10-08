import type { Permission } from "@shared/permissions";

export type RoleRef = { name: string; label: string };

export type AuthUser = {
  id: number;
  username: string;
  fullName?: string | null;
  roles: RoleRef[];
  permissions: string[];
};

export function getToken(): string | null {
  return localStorage.getItem("gloria_token");
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem("gloria_user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    // Sesi lama (sebelum RBAC multi-role) belum menyimpan roles/permissions
    return { ...user, roles: user.roles ?? [], permissions: user.permissions ?? [] };
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem("gloria_token", token);
  localStorage.setItem("gloria_user", JSON.stringify(user));
}

export function setUser(user: AuthUser) {
  localStorage.setItem("gloria_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("gloria_token");
  localStorage.removeItem("gloria_user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// true jika user punya salah satu permission yang diminta
export function hasPermission(...permissions: Permission[]): boolean {
  const owned = getUser()?.permissions ?? [];
  return permissions.some((p) => owned.includes(p));
}
