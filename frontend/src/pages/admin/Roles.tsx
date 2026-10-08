import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, X, Check, ShieldCheck, Lock, Users } from "lucide-react";
import { rbacApi, getApiError, type Role } from "../../lib/api";
import { PERMISSION_GROUPS, permissionLabel, type Permission } from "@shared/permissions";
import { useCurrentUser } from "../../lib/useCurrentUser";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";

function PermissionMatrix({
  value,
  onChange,
  locked,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  // Permission yang tidak boleh dilepas (mis. kelola role pada role sendiri)
  locked: Permission[];
}) {
  const toggle = (key: string) =>
    onChange(value.includes(key) ? value.filter((p) => p !== key) : [...value, key]);

  const toggleGroup = (g: (typeof PERMISSION_GROUPS)[number], checked: boolean) => {
    const keys: string[] = g.permissions.map((p) => p.key);
    onChange(
      checked
        ? Array.from(new Set([...value, ...keys]))
        : value.filter((p) => !keys.includes(p) || (locked as string[]).includes(p))
    );
  };

  return (
    <div className="space-y-3">
      {PERMISSION_GROUPS.map((g) => {
        const checkedCount = (g.permissions as readonly { key: Permission }[]).filter((p) => value.includes(p.key)).length;
        const all = checkedCount === g.permissions.length;
        return (
          <div key={g.module} className="border border-gray-200 rounded-xl overflow-hidden">
            <label className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={all}
                ref={(el) => { if (el) el.indeterminate = checkedCount > 0 && !all; }}
                onChange={(e) => toggleGroup(g, e.target.checked)}
                className="w-4 h-4 accent-primary-700"
              />
              <span className="flex-1 font-semibold text-sm text-gray-700">{g.label}</span>
              <span className="text-xs text-gray-400">{checkedCount}/{g.permissions.length}</span>
            </label>
            <div className="divide-y divide-gray-100">
              {(g.permissions as readonly { key: Permission; label: string }[]).map((p) => {
                const isLocked = locked.includes(p.key);
                return (
                  <label
                    key={p.key}
                    className={`flex items-center gap-3 px-4 py-2 pl-11 text-sm ${isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(p.key)}
                      disabled={isLocked}
                      onChange={() => toggle(p.key)}
                      className="w-4 h-4 accent-primary-700"
                    />
                    <span className="flex-1 text-gray-700">{p.label}</span>
                    {isLocked && (
                      <span className="flex items-center gap-1 text-xs text-gray-400" title="Tidak bisa dilepas dari role Anda sendiri">
                        <Lock className="w-3 h-3" /> Role Anda
                      </span>
                    )}
                    <code className="hidden sm:inline text-[11px] text-gray-400">{p.key}</code>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleModal({ role, allRoles, onClose }: { role: Role | null; allRoles: Role[]; onClose: () => void }) {
  const qc = useQueryClient();
  const { user: me } = useCurrentUser();
  const isEdit = !!role;
  // Akses kelola role dikunci kalau role ini satu-satunya role milik user sendiri yang memberi akses tersebut
  const isOwnRole = isEdit && !!me?.roles.some((r) => r.name === role.name);
  const otherOwnRoleCanManage = allRoles.some(
    (r) => r.id !== role?.id && me?.roles.some((mr) => mr.name === r.name) && r.permissions.includes("roles.manage")
  );

  const [name, setName] = useState(role?.name ?? "");
  const [label, setLabel] = useState(role?.label ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { label: label.trim(), description: description.trim() || null, permissions };
      return isEdit ? rbacApi.updateRole(role.id, payload) : rbacApi.createRole({ ...payload, name: name.trim() });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(isEdit ? "Role berhasil diperbarui" : "Role baru berhasil ditambahkan");
      onClose();
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const handleSubmit = () => {
    if (!isEdit && !/^[a-z0-9_]{2,20}$/.test(name.trim())) {
      toast.error("Kode role 2-20 karakter: huruf kecil, angka, atau underscore");
      return;
    }
    if (!label.trim()) { toast.error("Nama role wajib diisi"); return; }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">{isEdit ? `Edit Role: ${role.label}` : "Tambah Role"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Nama Role <span className="text-red-500">*</span></label>
              <input
                className="input-field"
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  // Bantu isi kode otomatis saat tambah baru
                  if (!isEdit) setName(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 20));
                }}
                placeholder="mis. Sekretaris"
              />
            </div>
            <div>
              <label className="label-field">Kode Role {!isEdit && <span className="text-red-500">*</span>}</label>
              <input
                className="input-field font-mono disabled:bg-gray-100 disabled:text-gray-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEdit}
                placeholder="sekretaris"
              />
              {isEdit && <p className="text-xs text-gray-400 mt-1">Kode role tidak bisa diubah</p>}
            </div>
          </div>

          <div>
            <label className="label-field">Deskripsi</label>
            <input className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-field !mb-0">Hak Akses</label>
              <span className="text-xs text-gray-500">{permissions.length} dipilih</span>
            </div>
            <PermissionMatrix
              value={permissions}
              onChange={setPermissions}
              locked={isOwnRole && !otherOwnRoleCanManage ? ["roles.manage"] : []}
            />
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

export default function AdminRoles() {
  const qc = useQueryClient();
  const { user: me } = useCurrentUser();
  // undefined = tertutup, null = tambah baru, object = edit
  const [modalRole, setModalRole] = useState<Role | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const { data: roles, isLoading } = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: () => rbacApi.roles().then((r) => r.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => rbacApi.deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rbac"] });
      toast.success("Role berhasil dihapus");
    },
    onError: (err) => toast.error(getApiError(err, "Gagal menghapus role")),
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Role & Hak Akses</h1>
            <p className="text-gray-500 text-sm">Atur menu dan aksi yang boleh diakses tiap role</p>
          </div>
          <button
            onClick={() => setModalRole(null)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Role
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
            <p>Memuat data...</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {roles?.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-gray-800">{r.label}</h2>
                    <code className="text-xs text-gray-400">{r.name}</code>
                    {r.isSystem && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">Bawaan</span>
                    )}
                    {me?.roles.some((mr) => mr.name === r.name) && (
                      <span className="text-[11px] bg-primary-50 text-primary-700 font-semibold px-2 py-0.5 rounded-full">Role Anda</span>
                    )}
                  </div>
                  {r.description && <p className="text-sm text-gray-500 mt-0.5">{r.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setModalRole(r)}
                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(r)}
                    disabled={r.isSystem}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={r.isSystem ? "Role bawaan tidak bisa dihapus" : "Hapus"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {r.permissions.length === 0 && <span className="text-sm text-gray-400 italic">Belum ada hak akses</span>}
                {r.permissions.map((p) => (
                  <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                    {permissionLabel(p)}
                  </span>
                ))}
              </div>

              <p className="mt-auto flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5" /> {r.userCount} user
              </p>
            </div>
          ))}
        </div>
      </main>

      {modalRole !== undefined && (
        <RoleModal role={modalRole} allRoles={roles ?? []} onClose={() => setModalRole(undefined)} />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Hapus Role?"
        message={`Role "${deleting?.label}" akan dihapus permanen.`}
        onConfirm={() => { if (deleting) deleteMutation.mutate(deleting.id); setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
