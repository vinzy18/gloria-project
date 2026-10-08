import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jemaatApi, wartaApi, eventsApi } from "../../lib/api";
import { Users, Newspaper, Calendar, UserCheck, UserX } from "lucide-react";
import { getUser, hasPermission } from "../../lib/auth";
import LogoGMIM from "../../components/LogoGMIM";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminDashboard() {
  const canJemaat = hasPermission("jemaat.view");
  const canWarta = hasPermission("warta.manage");
  const canEvents = hasPermission("events.manage");

  const { data: membersData } = useQuery({
    queryKey: ["members", "dashboard"],
    queryFn: () => jemaatApi.list({ limit: 1000 }).then((r) => r.data),
    enabled: canJemaat,
  });
  const { data: wartaData } = useQuery({
    queryKey: ["warta", "admin", "published-count"],
    queryFn: () => wartaApi.adminList({ isPublish: "true", limit: 1 }).then((r) => r.data),
    enabled: canWarta,
  });
  const { data: eventsData } = useQuery({
    queryKey: ["events", "admin"],
    queryFn: () => eventsApi.adminList().then((r) => r.data),
    enabled: canEvents,
  });

  const user = getUser();
  const activeMembers = membersData?.data.filter((m) => m.isActive).length ?? 0;
  const inactiveMembers = membersData?.data.filter((m) => !m.isActive).length ?? 0;

  const stats = [
    {
      label: "Total Jemaat",
      value: membersData?.pagination.total ?? "-",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      show: canJemaat,
    },
    {
      label: "Jemaat Aktif",
      value: activeMembers,
      icon: <UserCheck className="w-6 h-6" />,
      color: "bg-green-500",
      show: canJemaat,
    },
    {
      label: "Jemaat Non-aktif",
      value: inactiveMembers,
      icon: <UserX className="w-6 h-6" />,
      color: "bg-gray-400",
      show: canJemaat,
    },
    {
      label: "Warta Diterbitkan",
      value: wartaData?.pagination.total ?? "-",
      icon: <Newspaper className="w-6 h-6" />,
      color: "bg-purple-500",
      show: canWarta,
    },
    {
      label: "Kegiatan Aktif",
      value: eventsData?.data.filter((e) => e.isActive).length ?? "-",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-gold-500",
      show: canEvents,
    },
  ].filter((s) => s.show);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Selamat datang, <b>{user?.username}</b></p>
        </div>

        {/* Stats (sesuai hak akses) */}
        {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className={`${s.color} text-white w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Fast Act</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {canJemaat && (
            <Link
              to="/admin/jemaat"
              className="flex items-center gap-4 p-4 rounded-lg border border-primary-100 hover:bg-primary-50 transition-colors"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <Users className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Kelola Data Jemaat</p>
                <p className="text-sm text-gray-500">Tambah, edit, atau hapus data anggota jemaat</p>
              </div>
            </Link>
            )}
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="bg-gray-100 p-3 rounded-lg">
                <LogoGMIM width={20} height={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Lihat Website</p>
                <p className="text-sm text-gray-500">Buka halaman publik website gereja</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
