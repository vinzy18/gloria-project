import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { isAuthenticated } from "../lib/auth";
import { useCurrentUser } from "../lib/useCurrentUser";
import type { Permission } from "@shared/permissions";
import AdminSidebar from "./AdminSidebar";

type Props = {
  children: React.ReactNode;
  // Kosong = cukup login. Diisi = butuh salah satu permission tersebut
  permission?: Permission[];
};

export default function ProtectedRoute({ children, permission }: Props) {
  const { can, isSynced } = useCurrentUser();

  if (!isAuthenticated()) return <Navigate to="/admin/login" replace />;
  if (!permission?.length || can(...permission)) return <>{children}</>;

  // Permission di localStorage bisa basi; tunggu sinkron dari server sebelum menolak
  if (!isSynced) return null;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
          <p className="text-sm text-gray-500 mb-6">
            Role Anda tidak memiliki hak akses ke halaman ini. Hubungi administrator jika Anda membutuhkannya.
          </p>
          <Link to="/admin" className="btn-primary inline-flex">Kembali ke Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
