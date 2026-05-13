import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jemaatApi, newsApi, eventsApi } from "../../lib/api";
import { clearAuth, getUser } from "../../lib/auth";
import { Users, Newspaper, Calendar, LogOut, UserCheck, UserX } from "lucide-react";
import LogoGMIM from "../../components/LogoGMIM";

function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 bg-primary-800 text-white flex flex-col">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-2 font-bold text-lg">
          <LogoGMIM width={24} height={24} />
          Gereja Gloria
        </div>
        <p className="text-xs text-gray-400 mt-1">Panel Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-700 text-white text-sm font-medium"
        >
          <LogoGMIM width={16} height={16} /> Dashboard
        </Link>
        <Link
          to="/admin/jemaat"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-700 text-gray-300 hover:text-white text-sm transition-colors"
        >
          <Users className="w-4 h-4" /> Data Jemaat
        </Link>
      </nav>

      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-primary-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
    </aside>
  );
}

export default function AdminDashboard() {
  const { data: membersData } = useQuery({
    queryKey: ["members", "dashboard"],
    queryFn: () => jemaatApi.list({ limit: 1000 }).then((r) => r.data),
  });
  const { data: newsData } = useQuery({
    queryKey: ["news", "admin"],
    queryFn: () => newsApi.adminList().then((r) => r.data),
  });
  const { data: eventsData } = useQuery({
    queryKey: ["events", "admin"],
    queryFn: () => eventsApi.adminList().then((r) => r.data),
  });

  const activeMembers = membersData?.data.filter((m) => m.isActive).length ?? 0;
  const inactiveMembers = membersData?.data.filter((m) => !m.isActive).length ?? 0;

  const stats = [
    {
      label: "Total Jemaat",
      value: membersData?.pagination.total ?? "-",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      label: "Jemaat Aktif",
      value: activeMembers,
      icon: <UserCheck className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      label: "Jemaat Non-aktif",
      value: inactiveMembers,
      icon: <UserX className="w-6 h-6" />,
      color: "bg-gray-400",
    },
    {
      label: "Berita Diterbitkan",
      value: newsData?.filter((n) => n.isPublished).length ?? "-",
      icon: <Newspaper className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      label: "Kegiatan Aktif",
      value: eventsData?.filter((e) => e.isActive).length ?? "-",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-gold-500",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Selamat datang, ringkasan data gereja</p>
        </div>

        {/* Stats */}
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

        {/* Quick actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Link
              to="/"
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
