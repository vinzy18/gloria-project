import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bpmjApi, type Bpmj } from "../../lib/api";
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  X, Check, UserCheck, UserX, User, Eye,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";
import DetailModal, { DetailField, DetailGrid, StatusBadge } from "../../components/DetailModal";
import { formatDate } from "../../lib/format";

type BpmjFormData = Omit<Bpmj, "id" | "createdAt">;

const emptyForm: BpmjFormData = {
  name: "", positionId: null, positionName: "", photoUrl: "", displayOrder: 0, isActive: true,
};

const BPMJ_POSITIONS = [
  { id: 1, name: "Ketua BPMJ" },
  { id: 2, name: "Wakil Ketua BPMJ" },
  { id: 3, name: "Sekretaris BPMJ" },
  { id: 4, name: "Wakil Sekretaris BPMJ" },
  { id: 5, name: "Bendahara BPMJ" },
  { id: 6, name: "Wakil Bendahara BPMJ" },
  { id: 7, name: "Anggota BPMJ" },
];

function BpmjModal({ bpmj, onClose, onSaved }: { bpmj: Bpmj | null; onClose: () => void; onSaved: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!bpmj;
  const [form, setForm] = useState<BpmjFormData>(
    bpmj
      ? { name: bpmj.name, positionId: bpmj.positionId ?? null, positionName: bpmj.positionName ?? null, displayOrder: bpmj.displayOrder ?? 0, photoUrl: bpmj.photoUrl ?? null, isActive: bpmj.isActive }
      : emptyForm
  );

  const set = (key: keyof BpmjFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () => isEdit ? bpmjApi.update(bpmj!.id, form) : bpmjApi.create(form),
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
    if (!form.positionId) { toast.error("Jabatan wajib diisi"); return; }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">
            {isEdit ? "Edit Data BPMJ" : "Tambah Anggota BPMJ"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          <div>
            <label className="label-field">Nama Lengkap <span className="text-red-500">*</span></label>
            <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Jabatan <span className="text-red-500">*</span></label>
            <select className="input-field" value={form.positionId ?? ""} onChange={(e) => set("positionId", e.target.value ? parseInt(e.target.value) : null)} required>
              <option value="">-- Pilih Jabatan --</option>
              {BPMJ_POSITIONS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Urutan Tampil</label>
            <input type="number" className="input-field" value={form.displayOrder} onChange={(e) => set("displayOrder", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label-field">URL Foto</label>
            <input className="input-field" value={form.photoUrl ?? ""} onChange={(e) => set("photoUrl", e.target.value || null)} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActiveBpmj" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-primary-700" />
            <label htmlFor="isActiveBpmj" className="text-sm font-medium text-gray-700">Anggota Aktif</label>
          </div>
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

function BpmjDetail({ bpmj: m, onClose, onEdit }: { bpmj: Bpmj; onClose: () => void; onEdit: () => void }) {
  return (
    <DetailModal
      title={m.name}
      subtitle={m.positionName ?? "Jabatan belum diisi"}
      imageUrl={m.photoUrl}
      badge={<StatusBadge active={m.isActive} on="Aktif" off="Non-aktif" />}
      onClose={onClose}
      onEdit={onEdit}
    >
      <DetailGrid>
        <DetailField label="Jabatan" value={m.positionName} />
        <DetailField label="Urutan Tampil" value={m.displayOrder} />
        <DetailField label="Dibuat" value={formatDate(m.createdAt, true)} />
      </DetailGrid>
    </DetailModal>
  );
}

type ConfirmState = { open: boolean; title: string; message: string; onConfirm: () => void };
const closedConfirm: ConfirmState = { open: false, title: "", message: "", onConfirm: () => {} };

export default function AdminOrganizationBPMJ() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<Bpmj | null | undefined>(undefined);
  const [detail, setDetail] = useState<Bpmj | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(closedConfirm);

  const { data, isLoading } = useQuery({
    queryKey: ["bpmj", search, filterActive, page],
    queryFn: () => bpmjApi.adminList({ search: search || undefined, isActive: filterActive || undefined, page, limit: 10 }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bpmjApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bpmj"] }); toast.success("Anggota BPMJ berhasil dihapus"); },
    onError: () => toast.error("Gagal menghapus data"),
  });

  const handleDelete = (m: Bpmj) => {
    setConfirm({
      open: true,
      title: "Hapus Anggota BPMJ?",
      message: `Data "${m.name}" akan dihapus permanen dan tidak dapat dikembalikan.`,
      onConfirm: () => { deleteMutation.mutate(m.id); setConfirm(closedConfirm); },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data BPMJ</h1>
            <p className="text-gray-500 text-sm">{data ? `${data.pagination.total} anggota` : "Memuat..."}</p>
          </div>
          <button onClick={() => setModal(null)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Anggota
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Cari nama anggota BPMJ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-field w-full sm:w-auto sm:min-w-[150px]" value={filterActive} onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}>
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Non-aktif</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Jabatan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
                  <p>Memuat data...</p>
                </td></tr>
              )}
              {!isLoading && data?.data.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">Tidak ada data ditemukan</td></tr>
              )}
              {data?.data.map((m) => (
                <tr key={m.id} onClick={() => setDetail(m)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {m.photoUrl
                          ? <img src={m.photoUrl} alt={m.name} className="object-cover w-full h-full" />
                          : <div className="w-full h-full bg-primary-100 flex items-center justify-center"><User className="w-5 h-5 text-primary-400" /></div>
                        }
                      </div>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.positionName || "-"}</td>
                  <td className="px-4 py-3">
                    {m.isActive
                      ? <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full"><UserCheck className="w-3 h-3" /> Aktif</span>
                      : <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full"><UserX className="w-3 h-3" /> Non-aktif</span>
                    }
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setDetail(m)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Detail"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setModal(m)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(m)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Halaman {data.pagination.page} dari {data.pagination.totalPages} ({data.pagination.total} data)</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page === data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      {detail && <BpmjDetail bpmj={detail} onClose={() => setDetail(null)} onEdit={() => { setModal(detail); setDetail(null); }} />}
      {modal !== undefined && <BpmjModal bpmj={modal} onClose={() => setModal(undefined)} onSaved={() => setModal(undefined)} />}
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(closedConfirm)} />
    </div>
  );
}
