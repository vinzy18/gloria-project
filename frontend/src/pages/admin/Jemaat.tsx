import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { jemaatApi, type Jemaat } from "../../lib/api";
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  X, Check, UserCheck, UserX, Eye,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import DetailModal, { DetailField, DetailGrid, DetailSection, StatusBadge } from "../../components/DetailModal";
import { formatDate } from "../../lib/format";

// ─── Jemaat Detail Modal ──────────────────────────────────────────────────────
function JemaatDetail({ jemaat: m, onClose, onEdit }: { jemaat: Jemaat; onClose: () => void; onEdit: () => void }) {
  const ttl = [m.tempatLahir, formatDate(m.tanggalLahir)].filter(Boolean).join(", ");
  return (
    <DetailModal
      size="3xl"
      title={m.nama}
      subtitle={m.idJemaat ?? "ID belum tersedia"}
      imageUrl={m.photoUrl}
      badge={<StatusBadge active={m.isActive} on="Aktif" off="Non-aktif" />}
      onClose={onClose}
      onEdit={onEdit}
    >
      <DetailSection title="Data Pribadi">
        <DetailGrid>
          <DetailField label="NIK" value={m.nik} />
          <DetailField label="Jenis Kelamin" value={m.gender} />
          <DetailField label="Tempat, Tanggal Lahir" value={ttl} />
          <DetailField label="Pekerjaan" value={m.pekerjaan} />
          <DetailField label="Alamat" value={m.alamat} full />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Kontak">
        <DetailGrid>
          <DetailField label="No. HP" value={m.phone} />
          <DetailField label="Email" value={m.email} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Keanggotaan Jemaat">
        <DetailGrid>
          <DetailField label="Kolom" value={m.kolom} />
          <DetailField label="BIPRA" value={m.bipra} />
          <DetailField label="Keluarga" value={m.keluarga} />
          <DetailField label="Tanggal Bergabung" value={formatDate(m.joinDate)} />
          <DetailField label="Tanggal Baptis" value={formatDate(m.tanggalBaptis)} />
          <DetailField label="Status Pernikahan" value={m.statusPernikahan} />
          {m.statusPernikahan === "Menikah" && (
            <DetailField label="Tanggal Pernikahan" value={formatDate(m.tanggalPernikahan)} />
          )}
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Lainnya">
        <DetailGrid>
          <DetailField label="Catatan" value={m.notes} full />
          <DetailField label="Dibuat" value={formatDate(m.createdAt, true)} />
          <DetailField label="Terakhir Diperbarui" value={formatDate(m.updatedAt, true)} />
        </DetailGrid>
      </DetailSection>
    </DetailModal>
  );
}

// ─── Jemaat Form Modal ────────────────────────────────────────────────────────
type JemaatFormData = Omit<Jemaat, "id" | "createdAt" | "updatedAt">;

const emptyForm: JemaatFormData = {
  idJemaat: null, nama: "", nik: null, gender: null, tempatLahir: null, tanggalLahir: null,
  alamat: null, phone: null, email: null, statusPernikahan: null, tanggalPernikahan: null,
  tanggalBaptis: null, kolom: "", pekerjaan: null, keluarga: null, bipra: null, joinDate: null, photoUrl: null, isActive: true, notes: null,
};

function JemaatModal({
  jemaat,
  onClose,
  onSaved,
}: {
  jemaat: Jemaat | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!jemaat;
  const [form, setForm] = useState<JemaatFormData>(
    jemaat ? {
      idJemaat: jemaat.idJemaat ?? null,
      nama: jemaat.nama,
      nik: jemaat.nik ?? null,
      gender: jemaat.gender ?? null,
      tempatLahir: jemaat.tempatLahir ?? null,
      tanggalLahir: jemaat.tanggalLahir,
      alamat: jemaat.alamat ?? null,
      phone: jemaat.phone ?? null,
      email: jemaat.email ?? null,
      statusPernikahan: jemaat.statusPernikahan,
      tanggalPernikahan: jemaat.tanggalPernikahan,
      tanggalBaptis: jemaat.tanggalBaptis,
      kolom: jemaat.kolom,
      pekerjaan: jemaat.pekerjaan ?? null,
      keluarga: jemaat.keluarga ?? null,
      bipra: jemaat.bipra ?? null,
      joinDate: jemaat.joinDate,
      photoUrl: jemaat.photoUrl ?? null,
      isActive: jemaat.isActive,
      notes: jemaat.notes ?? null,
    } : emptyForm
  );

  const set = (key: keyof JemaatFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? jemaatApi.update(jemaat!.id, form)
        : jemaatApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jemaat"] });
      toast.success(isEdit ? "Data berhasil diperbarui" : "Data Jemaat berhasil ditambahkan");
      onSaved();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Terjadi kesalahan");
    },
  });

  const handleSubmit = () => {
    if (!form.nama.trim()) { toast.error("Nama Lengkap wajib diisi"); return; }
    if (!form.nik || form.nik.length !== 16) { toast.error("NIK wajib diisi dan harus 16 digit angka"); return; }
    if (!form.gender) { toast.error("Jenis Kelamin wajib diisi"); return; }
    if (!form.bipra) { toast.error("BIPRA wajib diisi"); return; }
    if (!form.joinDate) { toast.error("Tanggal Bergabung wajib diisi"); return; }
    mutation.mutate();
  };

  const inputCls = "input-field";
  const labelCls = "label-field";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">
            {isEdit ? "Edit Data Jemaat" : "Tambah Jemaat Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="overflow-y-auto flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Jemaat */}
            <div>
              <label className={labelCls}>ID Jemaat</label>
              <input
                className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}
                value={isEdit ? (form.idJemaat ?? "") : ""}
                readOnly
                placeholder={isEdit ? "" : "Akan di-generate otomatis"}
              />
            </div>

            {/* Nama */}
            <div>
              <label className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.nama} onChange={(e) => set("nama", e.target.value)} required />
            </div>

            {/* NIK */}
            <div>
              <label className={labelCls}>NIK <span className="text-red-500">*</span></label>
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.nik ?? ""}
                onChange={(e) => set("nik", e.target.value.replace(/\D/g, ""))}
                placeholder="16 digit NIK"
                maxLength={16}
                required
              />
              {!!form.nik && form.nik.length !== 16 && (
                <p className="text-xs text-red-500 mt-1">{form.nik.length}/16 digit</p>
              )}
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className={labelCls}>Jenis Kelamin <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.gender ?? ""} onChange={(e) => set("gender", e.target.value || null)} required>
                <option value="">-- Pilih --</option>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className={labelCls}>Tempat Lahir</label>
              <input className={inputCls} value={form.tempatLahir ?? ""} onChange={(e) => set("tempatLahir", e.target.value)} />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className={labelCls}>Tanggal Lahir</label>
              <input type="date" className={inputCls} value={form.tanggalLahir ?? ""} onChange={(e) => set("tanggalLahir", e.target.value || null)} />
            </div>

            {/* Alamat */}
            <div className="col-span-full">
              <label className={labelCls}>Alamat</label>
              <textarea className={inputCls} rows={2} value={form.alamat ?? ""} onChange={(e) => set("alamat", e.target.value)} />
            </div>

            {/* No. HP */}
            <div>
              <label className={labelCls}>No. HP</label>
              <input className={inputCls} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ''))} placeholder="08xx-xxxx-xxxx" />
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
            </div>

            {/* Status Pernikahan */}
            <div>
              <label className={labelCls}>Status Pernikahan</label>
              <select className={inputCls} value={form.statusPernikahan ?? ""} onChange={(e) => set("statusPernikahan", e.target.value || null)}>
                <option value="">-- Pilih --</option>
                <option>Belum Menikah</option>
                <option>Menikah</option>
                <option>Duda</option>
                <option>Janda</option>
                <option>Cerai</option>
              </select>
            </div>

            {/* Tanggal Pernikahan */}
            <div>
              <label className={labelCls}>Tanggal Pernikahan</label>
              <input type="date" className={inputCls} value={form.tanggalPernikahan ?? ""} onChange={(e) => set("tanggalPernikahan", e.target.value || null)} disabled={form.statusPernikahan !== "Menikah"}/>
            </div>

            {/* Tanggal Baptis */}
            <div>
              <label className={labelCls}>Tanggal Baptis</label>
              <input type="date" className={inputCls} value={form.tanggalBaptis ?? ""} onChange={(e) => set("tanggalBaptis", e.target.value || null)} />
            </div>

            {/* Kolom */}
            <div>
              <label className={labelCls}>Kolom</label>
              <input type="number" className={inputCls} value={form.kolom ?? ""} onChange={(e) => set("kolom", e.target.value)} placeholder="1" />
            </div>

            {/* Keluarga */}
            <div>
              <label className={labelCls}>Keluarga</label>
              <input className={inputCls} value={form.keluarga ?? ""} onChange={(e) => set("keluarga", e.target.value)} placeholder="Masukkan Keluarga" />
            </div>

            {/* Pekerjaan */}
            <div>
              <label className={labelCls}>Pekerjaan</label>
              <input className={inputCls} value={form.pekerjaan ?? ""} onChange={(e) => set("pekerjaan", e.target.value)} placeholder="Pendeta" />
            </div>

            {/* Bipra */}
            <div>
              <label className={labelCls}>BIPRA <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.bipra ?? ""} onChange={(e) => set("bipra", e.target.value || null)} required>
                <option value="">-- Pilih --</option>
                <option>PKB</option>
                <option>WKI</option>
                <option>Pemuda</option>
                <option>Remaja</option>
                <option>ASM</option>
              </select>
            </div>

            {/* Tanggal Bergabung */}
            <div>
              <label className={labelCls}>Tanggal Bergabung <span className="text-red-500">*</span></label>
              <input type="date" className={inputCls} value={form.joinDate ?? ""} onChange={(e) => set("joinDate", e.target.value || null)} required />
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="w-4 h-4 accent-primary-700"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Anggota Aktif</label>
            </div>
          </div>

          {/* Catatan */}
          <div className="mt-4">
            <label className={labelCls}>Catatan</label>
            <textarea className={inputCls} rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminJemaat() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modalJemaat, setModalJemaat] = useState<Jemaat | null | undefined>(undefined);
  // undefined = closed, null = new, Jemaat = edit
  const [detailJemaat, setDetailJemaat] = useState<Jemaat | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["jemaat", search, filterActive, page],
    queryFn: () =>
      jemaatApi.list({
        search: search || undefined,
        isActive: filterActive || undefined,
        page,
        limit: 15,
      }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jemaatApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jemaat"] });
      toast.success("Anggota berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus anggota"),
  });

  const handleDelete = (m: Jemaat) => {
    if (!confirm(`Hapus data "${m.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    deleteMutation.mutate(m.id);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Jemaat</h1>
            <p className="text-gray-500 text-sm">
              {data ? `${data.pagination.total} total anggota jemaat` : "Memuat..."}
            </p>
          </div>
          <button
            onClick={() => setModalJemaat(null)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Jemaat
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Cari nama, NIK, ID Jemaat, HP..."
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
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">ID Jemaat</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">NIK</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">L/P</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">TTL</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">No. HP</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Kolom</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">BIPRA</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status Nikah</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Keluarga</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
                      <p>Memuat data...</p>
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-gray-400">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                )}
                {data?.data.map((m) => (
                  <tr key={m.id} onClick={() => setDetailJemaat(m)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-gray-500">{m.idJemaat ?? "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{m.nik ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.gender == "Laki-laki" ? "L" : m.gender == "Perempuan" ? "P" : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.tempatLahir}, {m.tanggalLahir}</td>
                    <td className="px-4 py-3 text-gray-600">{m.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{m.kolom ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{m.bipra ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{m.statusPernikahan ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{m.keluarga ?? "-"}</td>
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
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailJemaat(m)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModalJemaat(m)}
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

      {/* Modal */}
      {detailJemaat && (
        <JemaatDetail
          jemaat={detailJemaat}
          onClose={() => setDetailJemaat(null)}
          onEdit={() => { setModalJemaat(detailJemaat); setDetailJemaat(null); }}
        />
      )}
      {modalJemaat !== undefined && (
        <JemaatModal
          jemaat={modalJemaat}
          onClose={() => setModalJemaat(undefined)}
          onSaved={() => setModalJemaat(undefined)}
        />
      )}
    </div>
  );
}
