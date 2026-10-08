import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { wartaApi, type Warta } from "../../lib/api";
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  X, Check, UserCheck, UserX, User, Eye, ExternalLink,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";
import RichTextEditor from "../../components/RichTextEditor";
import DetailModal, { DetailField, DetailGrid, DetailSection, StatusBadge } from "../../components/DetailModal";
import { formatDate, renderContent } from "../../lib/format";

function WartaDetailModal({ warta: m, onClose, onEdit }: { warta: Warta; onClose: () => void; onEdit: () => void }) {
  return (
    <DetailModal
      size="3xl"
      title={m.title}
      subtitle={`/warta/${m.slug}`}
      imageUrl={m.coverImage}
      imageShape="cover"
      badge={<StatusBadge active={m.isPublished} on="Published" off="Not Published" />}
      onClose={onClose}
      onEdit={onEdit}
    >
      <DetailSection title="Informasi">
        <DetailGrid>
          <DetailField label="Tanggal Publish" value={m.isPublished ? formatDate(m.publishedAt, true) : null} />
          <DetailField label="Dibuat" value={formatDate(m.createdAt, true)} />
          <DetailField label="Highlight/Kutipan" value={m.excerpt} full />
          {m.isPublished && (
            <DetailField
              label="Link Publik"
              full
              value={
                <a href={`/warta/${m.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-700 hover:underline">
                  Buka halaman warta <ExternalLink className="w-3.5 h-3.5" />
                </a>
              }
            />
          )}
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Konten">
        <div
          className="prose prose-sm max-w-none text-gray-700 prose-headings:text-primary-800 prose-a:text-primary-700 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: renderContent(m.content) }}
        />
      </DetailSection>
    </DetailModal>
  );
}

type WartaFormData = Omit<Warta, "id" | "createdAt">;

const emptyForm: WartaFormData = {
  title: "", slug: "", excerpt: "", content: "", coverImage: "", authorId: 0, isPublished: false, publishedAt: "2999-12-31"
};

function WartaModal({
  warta,
  onClose,
  onSaved,
}: {
  warta: Warta | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!warta;
  const [form, setForm] = useState<WartaFormData>(
    warta ? {
      title: warta.title,
      slug: warta.slug ?? null,
      excerpt: warta.excerpt ?? null,
      content: warta.content ?? null,
      coverImage: warta.coverImage ?? null,
      authorId: warta.authorId ?? 0,
      isPublished: warta.isPublished,
      publishedAt: warta.publishedAt ?? null,
    } : emptyForm
  );

  const set = (key: keyof WartaFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? wartaApi.update(warta!.id, form)
        : wartaApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warta"] });
      toast.success(isEdit ? "Data berhasil diperbarui" : "Warta baru berhasil ditambahkan");
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
    if (!form.title.trim()) { toast.error("Judul wajib diisi"); return; }
    if (!form.slug) { toast.error("Slug wajib diisi"); return; }
    if (!form.excerpt) { toast.error("Excerpt wajib diisi"); return; }
    if (!form.content) { toast.error("Konten wajib diisi"); return; }
    mutation.mutate();
  };

  const inputCls = "input-field";
  const labelCls = "label-field";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <h2 className="text-xl font-bold text-primary-800">
            {isEdit ? "Edit Data Warta" : "Tambah Warta Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="overflow-y-auto flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className={labelCls}>Judul <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>

            {/* Image */}
            <div>
                <label className="label-field">Image</label>
                <input className="input-field" value={form.coverImage ?? ""} onChange={(e) => set("coverImage", e.target.value || null)} placeholder="https://..." />
            </div>

            {/* Slug */}
            <div>
              <label className={labelCls}>Judul URL <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
            </div>

            {/* Excerpt */}
            <div>
              <label className={labelCls}>Highlight/Kutipan <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} required />
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label className={labelCls}>Konten <span className="text-red-500">*</span></label>
              <RichTextEditor value={form.content ?? ""} onChange={(html) => set("content", html)} />
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isPublishedWarta"
                checked={form.isPublished}
                onChange={(e) => set("isPublished", e.target.checked)}
                className="w-4 h-4 accent-primary-700"
              />
              <label htmlFor="isPublishedWarta" className="text-sm font-medium text-gray-700">Publish</label>
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

export default function AdminWarta() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterPublish, setFilterPublish] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modalWarta, setModalWarta] = useState<Warta | null | undefined>(undefined);
  const [confirm, setConfirm] = useState<ConfirmState>(closedConfirm);
  // undefined = closed, null = new, object = edit
  const [detailWarta, setDetailWarta] = useState<Warta | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["warta", search, filterPublish, page],
    queryFn: () =>
      wartaApi.adminList({
        search: search || undefined,
        isPublish: filterPublish || undefined,
        page,
        limit: 10,
      }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => wartaApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warta"] });
      toast.success("Warta berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus warta"),
  });

  const handleDelete = (m: Warta) => {
    setConfirm({
      open: true,
      title: "Hapus Data BPMJ?",
      message: `Data "${m.title}" akan dihapus permanen dan tidak dapat dikembalikan.`,
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
            <h1 className="text-2xl font-bold text-gray-800">Data Warta</h1>
            <p className="text-gray-500 text-sm">
              {data ? `${data.pagination.total} total Warta` : "Memuat..."}
            </p>
          </div>
          <button
            onClick={() => setModalWarta(null)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Warta
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Cari Warta..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-field w-full sm:w-auto sm:min-w-[150px]"
            value={filterPublish}
            onChange={(e) => { setFilterPublish(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            <option value="true">Published</option>
            <option value="false">Not Published</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Judul</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Judul URL</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Highlight/Kutipan</th>
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
                  <tr key={m.id} onClick={() => setDetailWarta(m)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0">
                          {m.coverImage ? (
                            <img width={40} height={40} src={m.coverImage} alt={m.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-400" />
                            </div>
                          )}
                        </div>
                        <span>{m.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.slug || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{m.excerpt || "-"}</td>
                    <td className="px-4 py-3">
                      {m.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                          <UserX className="w-3 h-3" /> Not Published
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailWarta(m)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModalWarta(m)}
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
      {detailWarta && (
        <WartaDetailModal
          warta={detailWarta}
          onClose={() => setDetailWarta(null)}
          onEdit={() => { setModalWarta(detailWarta); setDetailWarta(null); }}
        />
      )}
      {modalWarta !== undefined && (
        <WartaModal
          warta={modalWarta}
          onClose={() => setModalWarta(undefined)}
          onSaved={() => setModalWarta(undefined)}
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
      {modalWarta !== undefined && null}
    </div>
  );
}

