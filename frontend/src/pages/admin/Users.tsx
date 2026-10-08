import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, Check, UserCheck, UserX, Eye, EyeOff,
} from "lucide-react";
import { rbacApi, getApiError, type AdminUser, type AdminUserPayload } from "../../lib/api";
import { useCurrentUser } from "../../lib/useCurrentUser";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../lib/format";

function UserModal({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { user: me } = useCurrentUser();
  const isEdit = !!user;
  const isSelf = isEdit && user.id === me?.id;

  const [form, setForm] = useState<AdminUserPayload>({
    username: user?.username ?? "",
    fullName: user?.fullName ?? "",
    roles: user?.roles.map((r) => r.name) ?? [],
    isActive: user?.isActive ?? true,
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const set = <K extends keyof AdminUserPayload>(key: K, value: AdminUserPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleRole = (name: string) =>
    set("roles", form.roles.includes(name) ? form.roles.filter((r) => r !== name) : [...form.roles, name]);

  const { data: roles } = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: () => rbacApi.roles().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, fullName: form.fullName?.trim() || null };
      return isEdit ? rbacApi.updateUser(user.id, payload) : rbacApi.createUser(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac"] });
      // Kalau mengubah akun sendiri, sinkronkan role/permission di sidebar
      if (isSelf) qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(isEdit ? "User berhasil diperbarui" : "User baru berhasil ditambahkan");
      onClose();
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const handleSubmit = () => {
    if (form.username.trim().length < 3) { toast.error("Username minimal 3 karakter"); return; }
    if (!form.roles.length) { toast.error("Pilih minimal satu role"); return; }
    if (!isEdit && !form.password) { toast.error("Password wajib diisi"); return; }
    if (form.password && form.password.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    if (form.password !== confirmPassword) { toast.error("Konfirmasi password tidak sama"); return; }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">{isEdit ? "Edit User" : "Tambah User"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          <div>
            <label className="label-field">Username <span className="text-red-500">*</span></label>
            <input
              className="input-field"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="label-field">Nama Lengkap</label>
            <input className="input-field" value={form.fullName ?? ""} onChange={(e) => set("fullName", e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label-field">Role <span className="text-red-500">*</span></label>
              <span className="text-xs text-gray-500">{form.roles.length} dipilih</span>
            </div>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-56 overflow-y-auto">
              {roles?.map((r) => (
                <label key={r.id} className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.roles.includes(r.name)}
                    onChange={() => toggleRole(r.name)}
                    className="w-4 h-4 mt-0.5 accent-primary-700"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-700">{r.label}</span>
                    {r.description && <span className="block text-xs text-gray-500">{r.description}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">
                Password {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-9"
                  value={form.password ?? ""}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={isEdit ? "Kosongkan jika tidak diganti" : ""}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label-field">Konfirmasi Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActiveUser"
              checked={form.isActive}
              disabled={isSelf}
              onChange={(e) => set("isActive", e.target.checked)}
              className="w-4 h-4 accent-primary-700"
            />
            <label htmlFor="isActiveUser" className="text-sm font-medium text-gray-700">
              Aktif {isSelf && <span className="text-gray-400 font-normal">(tidak bisa menonaktifkan akun sendiri)</span>}
            </label>
          </div>
          <button type="submit" hidden />
        </form>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t">
          <button onClick={onClose} className="btn-outline">Batal</button>
          <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
            <Check className="w-4 h-4" />
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: me } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);
  // undefined = tertutup, null = tambah baru, object = edit
  const [modalUser, setModalUser] = useState<AdminUser | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["rbac", "users", search, filterRole, page],
    queryFn: () =>
      rbacApi.users({ search: search || undefined, role: filterRole || undefined, page, limit: 10 }).then((r) => r.data),
  });

  const { data: roles } = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: () => rbacApi.roles().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rbacApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac"] });
      toast.success("User berhasil dihapus");
    },
    onError: (err) => toast.error(getApiError(err, "Gagal menghapus user")),
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User</h1>
            <p className="text-gray-500 text-sm">
              {data ? `${data.pagination.total} total user` : "Memuat..."}
            </p>
          </div>
          <button onClick={() => setModalUser(null)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Cari username atau nama..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-field w-full sm:w-auto sm:min-w-[180px]"
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          >
            <option value="">Semua Role</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.name}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Dibuat</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
                      <p>Memuat data...</p>
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">Tidak ada data yang ditemukan</td>
                  </tr>
                )}
                {data?.data.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold flex-shrink-0">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800">
                            {u.fullName || u.username}
                            {u.id === me?.id && <span className="ml-2 text-xs text-primary-600 font-normal">(Anda)</span>}
                          </p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 && <span className="text-xs text-gray-400 italic">Tanpa role</span>}
                        {u.roles.map((r) => (
                          <span key={r.name} className="inline-flex text-xs bg-primary-50 text-primary-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                            {r.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                          <UserX className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModalUser(u)}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(u)}
                          disabled={u.id === me?.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          title={u.id === me?.id ? "Tidak bisa menghapus akun sendiri" : "Hapus"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Halaman {data.pagination.page} dari {data.pagination.totalPages} ({data.pagination.total} data)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {modalUser !== undefined && <UserModal user={modalUser} onClose={() => setModalUser(undefined)} />}

      <ConfirmDialog
        open={!!deleting}
        title="Hapus User?"
        message={`Akun "${deleting?.username}" akan dihapus permanen. Jika akun ini sudah punya riwayat data, nonaktifkan saja.`}
        onConfirm={() => { if (deleting) deleteMutation.mutate(deleting.id); setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
