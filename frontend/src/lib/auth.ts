export type AuthUser = {
  id: number;
  username: string;
  role: string;
};

export function getToken(): string | null {
  return localStorage.getItem("gloria_token");
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem("gloria_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem("gloria_token", token);
  localStorage.setItem("gloria_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("gloria_token");
  localStorage.removeItem("gloria_user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
