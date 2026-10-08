import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { pelsusApi, type Pelsus } from "../../lib/api";
import {
  Plus, Search, Edit2, Trash2,
  X, Check, UserCheck, UserX, User, Eye,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";
import DetailModal, { DetailField, DetailGrid, StatusBadge } from "../../components/DetailModal";
import { formatDate } from "../../lib/format";

type PelsusFormData = Omit<Pelsus, "id" | "createdAt">;

const baseEmpty: PelsusFormData = {
  name: "", positionId: null, positionName: "", pelsus: null, pelayanan: null, photoUrl: null, isActive: true,
};

const PENDETA_POSITIONS = [
  { id: 1, name: "Pendeta Ketua" },
  { id: 2, name: "Pendeta Pelayan" }
];

const PELSUS_POSITIONS = [
  { id: 3, name: "Penatua" },
  { id: 4, name: "Diaken" },
];

type ModalState =
  | undefined
  | { mode: "new"; defaultPelsus: string | null }
  | { mode: "edit"; item: Pelsus };

type ConfirmState = { open: boolean; title: string; message: string; onConfirm: () => void };
const closedConfirm: ConfirmState = { open: false, title: "", message: "", onConfirm: () => {} };

// ─── Modal ────────────────────────────────────────────────────────────────────

function PelsusModal({
  state,
  onClose,
  onSaved,
}: {
  state: Exclude<ModalState, undefined>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = state.mode === "edit";

  const [form, setForm] = useState<PelsusFormData>(() =>
    isEdit
      ? {
          name: state.item.name,
          positionId: state.item.positionId ?? null,
          positionName: state.item.positionName ?? null,
          pelsus: state.item.pelsus,
          pelayanan: state.item.pelayanan,
          photoUrl: state.item.photoUrl,
          isActive: state.item.isActive,
        }
      : { ...baseEmpty, pelsus: state.defaultPelsus }
  );

  const set = (key: keyof PelsusFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      isEdit ? pelsusApi.update(state.item.id, form) : pelsusApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pelsus"] });
      toast.success(isEdit ? "Data berhasil diperbarui" : "Data Pelsus berhasil ditambahkan");
      onSaved();
    },
    onError: (err: unknown) => {
      const error = (err as {
        response?: { data?: { error?: string | { issues?: { path?: (string | number)[]; message?: string }[] } } };
      })?.response?.data?.error;
      // Error validasi Zod dari zValidator berupa object { issues: [...] }, bukan string
      const issue = typeof error === "object" ? error?.issues?.[0] : undefined;
      const msg =
        typeof error === "string" ? error :
        issue ? `${issue.path?.join(".") || "Data"}: ${issue.message ?? "tidak valid"}` :
        undefined;
      toast.error(msg ?? "Terjadi kesalahan");
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nama wajib diisi"); return; }
    if (!form.positionId) { toast.error("Jabatan wajib diisi"); return; }
    mutation.mutate();
  };

  const sectionLabel =
    form.pelsus === "kolom" ? "Pelsus Kolom" :
    form.pelsus === "bipra" ? "Pelsus BIPRA" : "Pendeta";

  const positions = form.pelsus === null ? PENDETA_POSITIONS : PELSUS_POSITIONS;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">
            {isEdit ? "Edit Data Pelsus" : `Tambah ${sectionLabel}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4"
        >
          <div>
            <label className="label-field">Nama Lengkap <span className="text-red-500">*</span></label>
            <input className="input-field" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Jabatan <span className="text-red-500">*</span></label>
            <select
              className="input-field"
              value={form.positionId ?? ""}
              onChange={(e) => set("positionId", e.target.value ? parseInt(e.target.value) : null)}
              required
            >
              <option value="">-- Pilih Jabatan --</option>
              {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {form.pelsus !== null && (
            <div>
              <label className="label-field">Pelayanan</label>
              <input
                className="input-field"
                value={form.pelayanan ?? ""}
                onChange={(e) => set("pelayanan", e.target.value || null)}
                placeholder={form.pelsus === "kolom" ? "Contoh: Kolom 1, Kolom 2..." : "Contoh: PKB, WKI, Pemuda..."}
              />
            </div>
          )}
          <div>
            <label className="label-field">URL Foto</label>
            <input
              className="input-field"
              value={form.photoUrl ?? ""}
              onChange={(e) => set("photoUrl", e.target.value || null)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActivePelsus"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="w-4 h-4 accent-primary-700"
            />
            <label htmlFor="isActivePelsus" className="text-sm font-medium text-gray-700">Aktif</label>
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

// ─── Detail ───────────────────────────────────────────────────────────────────

function PelsusDetail({ item: m, onClose, onEdit }: { item: Pelsus; onClose: () => void; onEdit: () => void }) {
  const kategori =
    m.pelsus === "kolom" ? "Pelsus Kolom" :
    m.pelsus === "bipra" ? "Pelsus BIPRA" : "Pendeta";
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
        <DetailField label="Kategori" value={kategori} />
        <DetailField label="Jabatan" value={m.positionName} />
        {m.pelsus !== null && <DetailField label="Pelayanan" value={m.pelayanan} />}
        <DetailField label="Dibuat" value={formatDate(m.createdAt, true)} />
      </DetailGrid>
    </DetailModal>
  );
}

// ─── Section Table ────────────────────────────────────────────────────────────

function PelsusTable({
  title,
  items,
  showPelayanan = true,
  isLoading,
  colSpan,
  onView,
  onEdit,
  onDelete,
  onAdd,
}: {
  title: string;
  items: Pelsus[];
  showPelayanan?: boolean;
  isLoading: boolean;
  colSpan: number;
  onView: (m: Pelsus) => void;
  onEdit: (m: Pelsus) => void;
  onDelete: (m: Pelsus) => void;
  onAdd: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-700">{title}</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>
      <div className="overflow-x-auto">
<table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Nama</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Jabatan</th>
            {showPelayanan && <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Pelayanan</th>}
            <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && (
            <tr>
              <td colSpan={colSpan} className="text-center py-8 text-gray-400">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary-200 border-t-primary-700" />
              </td>
            </tr>
          )}
          {!isLoading && items.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="text-center py-8 text-gray-400 text-sm">
                Belum ada data
              </td>
            </tr>
          )}
          {items.map((m) => (
            <tr key={m.id} onClick={() => onView(m)} className="hover:bg-gray-50 transition-colors cursor-pointer">
              <td className="px-4 py-3 font-medium text-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    {m.photoUrl
                      ? <img src={m.photoUrl} alt={m.name} className="object-cover w-full h-full" />
                      : <div className="w-full h-full bg-primary-100 flex items-center justify-center"><User className="w-4 h-4 text-primary-400" /></div>
                    }
                  </div>
                  <span>{m.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{m.positionName || "-"}</td>
              {showPelayanan && <td className="px-4 py-3 text-gray-600">{m.pelayanan || "-"}</td>}
              <td className="px-4 py-3">
                {m.isActive
                  ? <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full"><UserCheck className="w-3 h-3" /> Aktif</span>
                  : <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full"><UserX className="w-3 h-3" /> Non-aktif</span>
                }
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => onView(m)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Detail"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => onEdit(m)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(m)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrganizationPelsus() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(undefined);
  const [detail, setDetail] = useState<Pelsus | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(closedConfirm);

  const { data: allItems, isLoading } = useQuery({
    queryKey: ["pelsus", search],
    queryFn: () =>
      pelsusApi.adminList({ search: search || undefined, limit: 100 }).then((r) => r.data.data),
  });

  const pendeta = allItems?.filter((m) => !m.pelsus) ?? [];
  const kolom   = allItems?.filter((m) => m.pelsus === "kolom") ?? [];
  const bipra   = allItems?.filter((m) => m.pelsus === "bipra") ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pelsusApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pelsus"] });
      toast.success("Anggota Pelsus berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus data"),
  });

  const handleDelete = (m: Pelsus) => {
    setConfirm({
      open: true,
      title: "Hapus Anggota Pelsus?",
      message: `Data "${m.name}" akan dihapus permanen dan tidak dapat dikembalikan.`,
      onConfirm: () => { deleteMutation.mutate(m.id); setConfirm(closedConfirm); },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Pelsus</h1>
          <p className="text-gray-500 text-sm">
            {allItems ? `${allItems.length} total anggota` : "Memuat..."}
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Cari nama anggota Pelsus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <PelsusTable
            title="Pendeta"
            items={pendeta}
            showPelayanan={false}
            isLoading={isLoading}
            colSpan={4}
            onView={setDetail}
            onEdit={(m) => setModal({ mode: "edit", item: m })}
            onDelete={handleDelete}
            onAdd={() => setModal({ mode: "new", defaultPelsus: null })}
          />
          <PelsusTable
            title="Pelsus Kolom"
            items={kolom}
            isLoading={isLoading}
            colSpan={5}
            onView={setDetail}
            onEdit={(m) => setModal({ mode: "edit", item: m })}
            onDelete={handleDelete}
            onAdd={() => setModal({ mode: "new", defaultPelsus: "kolom" })}
          />
          <PelsusTable
            title="Pelsus BIPRA"
            items={bipra}
            isLoading={isLoading}
            colSpan={5}
            onView={setDetail}
            onEdit={(m) => setModal({ mode: "edit", item: m })}
            onDelete={handleDelete}
            onAdd={() => setModal({ mode: "new", defaultPelsus: "bipra" })}
          />
        </div>
      </main>

      {detail && (
        <PelsusDetail
          item={detail}
          onClose={() => setDetail(null)}
          onEdit={() => { setModal({ mode: "edit", item: detail }); setDetail(null); }}
        />
      )}
      {modal !== undefined && (
        <PelsusModal
          state={modal}
          onClose={() => setModal(undefined)}
          onSaved={() => setModal(undefined)}
        />
      )}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(closedConfirm)}
      />
    </div>
  );
}
