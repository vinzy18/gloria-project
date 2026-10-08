import { useQuery } from "@tanstack/react-query";
import { authApi } from "./api";
import { getUser, isAuthenticated, setUser, type AuthUser } from "./auth";
import type { Permission } from "@shared/permissions";

// User yang sedang login, disinkronkan dari /auth/me supaya perubahan role/permission
// oleh admin langsung kebaca tanpa perlu login ulang. Fallback ke data di localStorage.
export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<AuthUser> => {
      const { data } = await authApi.me();
      setUser(data);
      return data;
    },
    enabled: isAuthenticated(),
    staleTime: 1000 * 60,
  });

  const user = query.data ?? getUser();
  const can = (...permissions: Permission[]) =>
    permissions.some((p) => user?.permissions.includes(p));

  return { user, can, isSynced: query.isSuccess };
}
