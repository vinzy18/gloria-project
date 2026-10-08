import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bpmjApi, pelsusApi, type Bpmj, type Pelsus } from "../../lib/api";
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  X, Check, UserCheck, UserX, User,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";

type BpmjFormData = Omit<Bpmj, "id" | "createdAt">;

const emptyForm: BpmjFormData = {
  name: "", positionId: null, positionName: "", photoUrl: "", displayOrder: 0, isActive: true
};

function BpmjModal({
  bpmj,
  onClose,
  onSaved,
}: {
  bpmj: Bpmj | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!bpmj;
  const [form, setForm] = useState<BpmjFormData>(
    bpmj ? {
      name: bpmj.name,
      positionId: bpmj.positionId ?? null,
      positionName: bpmj.positionName ?? null,
      displayOrder: bpmj.displayOrder ?? 0,
      photoUrl: bpmj.photoUrl ?? null,
      isActive: bpmj.isActive,
    } : emptyForm
  );

  const set = (key: keyof BpmjFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? bpmjApi.update(bpmj!.id, form)
        : bpmjApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bpmj"] });
      toast.success(isEdit ? "Data berhasil diperbarui" : "Data BPMJ berhasil ditambahkan");
      onSaved();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Terjadi kesalahan");
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nama wajib diisi"); return; }
    if (!form.positionId) { toast.error("Posisi wajib diisi"); return; }
    mutation.mutate();
  };

  const inputCls = "input-field";
  const labelCls = "label-field";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">
            {isEdit ? "Edit Data BPMJ" : "Tambah BPMJ Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="overflow-y-auto flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>

            {/* Position */}
            <div>
              <label className={labelCls}>Jabatan <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.positionId ?? ""} onChange={(e) => set("positionId", e.target.value ? parseInt(e.target.value) : null)} required>
                <option value=""></option>
                <option value="1">Ketua</option>
                <option value="2">Wakil Ketua</option>
                <option value="3">Sekretaris</option>
                <option value="4">Wakil Sekretaris</option>
                <option value="5">Bendahara</option>
                <option value="6">Wakil Bendahara</option>
                <option value="7">Anggota</option>
              </select>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isActiveBpmj"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="w-4 h-4 accent-primary-700"
              />
              <label htmlFor="isActiveBpmj" className="text-sm font-medium text-gray-700">Anggota Aktif</label>
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t">
          <button onClick={onClose} className="btn-outline">Batal</button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PelsusModal({
  pelsus,
  onClose,
  onSaved,
}: {
  pelsus: Pelsus | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!pelsus;
  const [form, setForm] = useState<PelsusFormData>(
    pelsus ? {
      name: pelsus.name,
      positionId: pelsus.positionId ?? null,
      positionName: pelsus.positionName ?? null,
      displayOrder: pelsus.displayOrder ?? 0,
      photoUrl: pelsus.photoUrl ?? null,
      isActive: pelsus.isActive,
    } : emptyForm
  );

  const set = (key: keyof PelsusFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? pelsusApi.update(pelsus!.id, form)
        : pelsusApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pelsus"] });
      toast.success(isEdit ? "Data berhasil diperbarui" : "Data Pelsus berhasil ditambahkan");
      onSaved();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Terjadi kesalahan");
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nama wajib diisi"); return; }
    if (!form.positionId) { toast.error("Posisi wajib diisi"); return; }
    if (!form.kolom) { toast.error("Kolom wajib diisi"); return; }
    mutation.mutate();
  };

  const inputCls = "input-field";
  const labelCls = "label-field";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">
            {isEdit ? "Edit Data BPMJ" : "Tambah BPMJ Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="overflow-y-auto flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>

            {/* Position */}
            <div>
              <label className={labelCls}>Jabatan <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.positionId ?? ""} onChange={(e) => set("positionId", e.target.value ? parseInt(e.target.value) : null)} required>
                <option value=""></option>
                <option value="1">Ketua</option>
                <option value="2">Wakil Ketua</option>
                <option value="3">Sekretaris</option>
                <option value="4">Wakil Sekretaris</option>
                <option value="5">Bendahara</option>
                <option value="6">Wakil Bendahara</option>
                <option value="7">Anggota</option>
              </select>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isActiveBpmj"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="w-4 h-4 accent-primary-700"
              />
              <label htmlFor="isActiveBpmj" className="text-sm font-medium text-gray-700">Anggota Aktif</label>
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t">
          <button onClick={onClose} className="btn-outline">Batal</button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
};

const closedConfirm: ConfirmState = { open: false, title: "", message: "", onConfirm: () => {} };

export default function AdminOrganizationBPMJ() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modalBpmj, setModalBpmj] = useState<Bpmj | null | undefined>(undefined);
  const [modalPelsus, setModalPelsus] = useState<Pelsus | null | undefined>(undefined);
  const [confirm, setConfirm] = useState<ConfirmState>(closedConfirm);
  // undefined = closed, null = new, object = edit

  const { data, isLoading } = useQuery({
    queryKey: ["bpmj", search, filterActive, page],
    queryFn: () =>
      bpmjApi.adminList({
        search: search || undefined,
        isActive: filterActive || undefined,
        page,
        limit: 10,
      }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bpmjApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bpmj"] });
      toast.success("BPMJ berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus BPMJ"),
  });

  const handleDelete = (m: Bpmj) => {
    setConfirm({
      open: true,
      title: "Hapus Data BPMJ?",
      message: `Data "${m.name}" akan dihapus permanen dan tidak dapat dikembalikan.`,
      onConfirm: () => {
        deleteMutation.mutate(m.id);
        setConfirm(closedConfirm);
      },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data BPMJ</h1>
            <p className="text-gray-500 text-sm">
              {data ? `${data.pagination.total} total BPMJ` : "Memuat..."}
            </p>
          </div>
          <button
            onClick={() => setModalBpmj(null)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah BPMJ
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Cari nama anggota BPMJ..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-field w-full sm:w-auto sm:min-w-[150px]"
            value={filterActive}
            onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Non-aktif</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Jabatan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
                      <p>Memuat data...</p>
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
                {data?.data.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0">
                          {m.photoUrl ? (
                            <img width={40} height={40} src={m.photoUrl} alt={m.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-400" />
                            </div>
                          )}
                        </div>
                        <span>{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.positionName || "-"}</td>
                    <td className="px-4 py-3">
                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                          <UserX className="w-3 h-3" /> Non-aktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModalBpmj(m)}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
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
                Halaman {data.pagination.page} dari {data.pagination.totalPages}
                {" "}({data.pagination.total} data)
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

      {/* Modals */}
      {modalBpmj !== undefined && (
        <BpmjModal
          bpmj={modalBpmj}
          onClose={() => setModalBpmj(undefined)}
          onSaved={() => setModalBpmj(undefined)}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(closedConfirm)}
      />

      {/* Pelsus modal placeholder */}
      {modalPelsus !== undefined && null}
    </div>
  );
}

export default function AdminOrganizationPelsus() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modalBpmj, setModalBpmj] = useState<Bpmj | null | undefined>(undefined);
  const [modalPelsus, setModalPelsus] = useState<Pelsus | null | undefined>(undefined);
  const [confirm, setConfirm] = useState<ConfirmState>(closedConfirm);
  // undefined = closed, null = new, object = edit

  const { data, isLoading } = useQuery({
    queryKey: ["bpmj", search, filterActive, page],
    queryFn: () =>
      bpmjApi.adminList({
        search: search || undefined,
        isActive: filterActive || undefined,
        page,
        limit: 10,
      }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bpmjApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bpmj"] });
      toast.success("BPMJ berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus BPMJ"),
  });

  const handleDelete = (m: Bpmj) => {
    setConfirm({
      open: true,
      title: "Hapus Data BPMJ?",
      message: `Data "${m.name}" akan dihapus permanen dan tidak dapat dikembalikan.`,
      onConfirm: () => {
        deleteMutation.mutate(m.id);
        setConfirm(closedConfirm);
      },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data BPMJ</h1>
            <p className="text-gray-500 text-sm">
              {data ? `${data.pagination.total} total BPMJ` : "Memuat..."}
            </p>
          </div>
          <button
            onClick={() => setModalBpmj(null)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah BPMJ
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Cari nama anggota BPMJ..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-field w-full sm:w-auto sm:min-w-[150px]"
            value={filterActive}
            onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Non-aktif</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Jabatan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
                      <p>Memuat data...</p>
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
                {data?.data.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0">
                          {m.photoUrl ? (
                            <img width={40} height={40} src={m.photoUrl} alt={m.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-400" />
                            </div>
                          )}
                        </div>
                        <span>{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.positionName || "-"}</td>
                    <td className="px-4 py-3">
                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                          <UserX className="w-3 h-3" /> Non-aktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModalBpmj(m)}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
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
                Halaman {data.pagination.page} dari {data.pagination.totalPages}
                {" "}({data.pagination.total} data)
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

      {/* Modals */}
      {modalBpmj !== undefined && (
        <BpmjModal
          bpmj={modalBpmj}
          onClose={() => setModalBpmj(undefined)}
          onSaved={() => setModalBpmj(undefined)}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(closedConfirm)}
      />

      {/* Pelsus modal placeholder */}
      {modalPelsus !== undefined && null}
    </div>
  );
}

