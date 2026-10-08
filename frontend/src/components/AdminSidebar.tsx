import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  UsersRound,
  LogOut,
  ChevronDown,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import { clearAuth } from "../lib/auth";
import { useCurrentUser } from "../lib/useCurrentUser";
import type { Permission } from "@shared/permissions";
import LogoGMIM from "./LogoGMIM";

type NavChild = { to: string; label: string; exact: boolean; permission?: Permission[] };
type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  exact: boolean;
  children?: NavChild[];
  // Kosong = tampil untuk semua user yang login; diisi = butuh salah satu permission
  permission?: Permission[];
};

const navItems: NavItem[] = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: <LogoGMIM width={16} height={16} />,
    exact: true,
  },
  {
    to: "/admin/organization",
    label: "Manage BPMJ dan Pelsus",
    icon: <UsersRound className="w-4 h-4" />,
    exact: false,
    permission: ["organization.manage"],
    children: [
      { to: "/admin/organization/bpmj", label: "BPMJ", exact: true },
      { to: "/admin/organization/pelsus", label: "Pelsus", exact: true },
    ],
  },
  {
    to: "/admin/jemaat",
    label: "Data Jemaat",
    icon: <Users className="w-4 h-4" />,
    exact: false,
    permission: ["jemaat.view"],
  },
  {
    to: "/admin/warta",
    label: "Warta",
    icon: <BookOpen className="w-4 h-4" />,
    exact: false,
    permission: ["warta.manage"],
  },
  {
    to: "/admin/events",
    label: "Kegiatan",
    icon: <CalendarDays className="w-4 h-4" />,
    exact: false,
    permission: ["events.manage"],
  },
  {
    to: "/admin/berita-acara",
    label: "Berita Acara Ibadah",
    icon: <ClipboardList className="w-4 h-4" />,
    exact: false,
    permission: ["berita_acara.view"],
    children: [
      { to: "/admin/berita-acara/keuangan", label: "Keuangan", exact: false },
    ],
  },
  {
    to: "/admin/akses",
    label: "Pengaturan Akses",
    icon: <ShieldCheck className="w-4 h-4" />,
    exact: false,
    permission: ["users.manage", "roles.manage"],
    children: [
      { to: "/admin/users", label: "User", exact: false, permission: ["users.manage"] },
      { to: "/admin/roles", label: "Role & Hak Akses", exact: false, permission: ["roles.manage"] },
    ],
  },
];

const COLLAPSED_KEY = "admin-sidebar-collapsed";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, can } = useCurrentUser();

  // Sembunyikan menu (dan sub-menu) yang tidak boleh diakses role user
  const visibleItems = navItems
    .filter((item) => !item.permission || can(...item.permission))
    .map((item) => ({
      ...item,
      children: item.children?.filter((c) => !c.permission || can(...c.permission)),
    }));

  // Mobile: drawer open/closed. Desktop: expanded/collapsed (icons only).
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore storage errors
    }
  }, [collapsed]);

  // Close the mobile drawer whenever the route changes
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  // Pre-open any group whose child is currently active
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navItems.forEach((item) => {
      if (item.children?.some((c) => isActive(c.to, c.exact))) {
        initial.add(item.to);
      }
    });
    return initial;
  });

  const toggle = (to: string) => {
    // When collapsed, clicking a group expands the sidebar and opens that group
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((prev) => new Set(prev).add(to));
      return;
    }
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(to) ? next.delete(to) : next.add(to);
      return next;
    });
  };

  // Labels hide only on desktop when collapsed; the mobile drawer is always full width
  const hideWhenCollapsed = collapsed ? "lg:hidden" : "";

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center gap-3 h-14 px-4 bg-primary-800 text-white flex-shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-primary-700 transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <LogoGMIM width={22} height={22} />
        <span className="font-bold text-sm truncate">GMIM Gloria Jakarta Selatan</span>
      </header>

      {/* Mobile backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white flex flex-col flex-shrink-0 transition-[transform,width] duration-200 ease-in-out lg:static lg:translate-x-0 ${
          collapsed ? "lg:w-16" : "lg:w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`border-b border-primary-700 flex items-start gap-2 p-6 ${
            collapsed ? "lg:p-3 lg:justify-center" : ""
          }`}
        >
          <div className={`flex-1 min-w-0 ${hideWhenCollapsed}`}>
            <div className="flex items-center gap-2 font-bold text-lg">
              <LogoGMIM width={24} height={24} />
              GMIM Gloria Jakarta Selatan
            </div>
            <p className="text-xs text-gray-400 mt-1">Panel Admin</p>
          </div>

          {/* Close (mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 -mr-2 rounded-lg text-gray-300 hover:bg-primary-700 hover:text-white transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse / expand (desktop) */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:block p-1.5 rounded-lg text-gray-300 hover:bg-primary-700 hover:text-white transition-colors"
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <nav className={`flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 ${collapsed ? "lg:p-2" : ""}`}>
          {visibleItems.map(({ to, label, icon, exact, children }) => {
            const hasChildren = !!children?.length;
            // Sub-menus stay hidden on desktop while collapsed
            const isOpen = openGroups.has(to);
            const active = hasChildren
              ? children!.some((c) => isActive(c.to, c.exact))
              : isActive(to, exact);
            const itemCls = `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              collapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : ""
            } ${
              active
                ? "bg-primary-700 text-white font-medium"
                : "text-gray-300 hover:bg-primary-700 hover:text-white"
            }`;

            return (
              <div key={to}>
                {hasChildren ? (
                  <button onClick={() => toggle(to)} className={itemCls} title={collapsed ? label : undefined}>
                    <span className="flex-shrink-0">{icon}</span>
                    <span className={`flex-1 text-left ${hideWhenCollapsed}`}>{label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${hideWhenCollapsed} ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link to={to} className={itemCls} title={collapsed ? label : undefined}>
                    <span className="flex-shrink-0">{icon}</span>
                    <span className={hideWhenCollapsed}>{label}</span>
                  </Link>
                )}

                {hasChildren && (
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${hideWhenCollapsed} ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-4 mt-1 space-y-0.5 pb-1 border-l border-primary-600 pl-3">
                        {children!.map((child) => (
                          <Link
                            key={child.to + child.label}
                            to={child.to}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              isActive(child.to, child.exact)
                                ? "bg-primary-600 text-white font-medium"
                                : "text-gray-400 hover:bg-primary-700 hover:text-white"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-primary-700 ${collapsed ? "lg:p-2" : ""}`}>
          <div className={`flex items-center gap-3 mb-3 ${collapsed ? "lg:justify-center" : ""}`}>
            <div
              className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0"
              title={collapsed ? user?.username : undefined}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className={`min-w-0 ${hideWhenCollapsed}`}>
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-gray-400 truncate">{user?.roles.map((r) => r.label).join(", ")}</p>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); navigate("/admin/login"); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-primary-700 rounded-lg transition-colors ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title={collapsed ? "Keluar" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={hideWhenCollapsed}>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
