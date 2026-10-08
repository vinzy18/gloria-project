import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { beritaAcaraApi, type BeritaAcaraKeuanganSummary } from "../../lib/api";
import { hasPermission } from "../../lib/auth";
import { formatHariTanggal, formatRupiah } from "../../lib/format";
import { STATUS_META, isEditableStatus } from "../../lib/beritaAcara";

export default function AdminBeritaAcaraKeuangan() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  // isAdmin = boleh buat/ubah, isBendahara = boleh approve/tolak
  const isAdmin = hasPermission("berita_acara.manage");
  const isBendahara = hasPermission("berita_acara.approve");

  const [search, setSearch] = useState("");
  // Bendahara langsung melihat yang perlu di-approve
  const [filterStatus, setFilterStatus] = useState(isBendahara ? "submitted" : "");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<BeritaAcaraKeuanganSummary | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["berita-acara-keuangan", search, filterStatus, page],
    queryFn: () =>
      beritaAcaraApi
        .list({ search: search || undefined, status: filterStatus || undefined, page, limit: 10 })
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => beritaAcaraApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["berita-acara-keuangan"] });
      toast.success("Berita acara berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus berita acara"),
  });

  const open = (id: number) => navigate(`/admin/berita-acara/keuangan/${id}`);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Berita Acara Keuangan</h1>
            <p className="text-gray-500 text-sm">
              {data ? `${data.pagination.total} total berita acara` : "Memuat..."}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => navigate("/admin/berita-acara/keuangan/new")} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Buat Berita Acara
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Cari ibadah atau khadim..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-field w-full sm:w-auto sm:min-w-[180px]"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_META).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Hari/Tanggal</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Ibadah</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Khadim</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Pemasukan</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Pengeluaran</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Saldo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
                      <p>Memuat data...</p>
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">Tidak ada data yang ditemukan</td>
                  </tr>
                )}
                {data?.data.map((m) => {
                  const editable = isAdmin && isEditableStatus(m.status);
                  return (
                    <tr key={m.id} onClick={() => open(m.id)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{formatHariTanggal(m.tanggalIbadah)}</td>
                      <td className="px-4 py-3 text-gray-600">{m.jenisIbadah}</td>
                      <td className="px-4 py-3 text-gray-600">{m.khadim}</td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatRupiah(m.jumlahPemasukan)}</td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatRupiah(m.jumlahPengeluaran)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums whitespace-nowrap font-semibold ${m.totalSaldo < 0 ? "text-red-600" : "text-gray-800"}`}>
                        {formatRupiah(m.totalSaldo)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_META[m.status].cls}`}>
                          {STATUS_META[m.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => open(m.id)}
                            className={`p-1.5 rounded-lg transition-colors ${editable ? "text-primary-600 hover:bg-primary-50" : "text-gray-500 hover:bg-gray-100"}`}
                            title={editable ? "Edit" : "Detail"}
                          >
                            {editable ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {editable && (
                            <button
                              onClick={() => setToDelete(m)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      <ConfirmDialog
        open={!!toDelete}
        title="Hapus Berita Acara?"
        message={toDelete ? `Berita acara ${toDelete.jenisIbadah} (${formatHariTanggal(toDelete.tanggalIbadah)}) akan dihapus permanen.` : ""}
        onConfirm={() => { deleteMutation.mutate(toDelete!.id); setToDelete(null); }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
