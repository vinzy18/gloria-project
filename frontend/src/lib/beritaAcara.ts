import type { BeritaAcaraStatus, PengeluaranStatus } from "./api";

export const JENIS_IBADAH_OPTIONS = ["Ibadah Minggu Pagi", "Ibadah Minggu Sore"] as const;
export const JENIS_IBADAH_LAINNYA = "Lainnya";

export const STATUS_META: Record<BeritaAcaraStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
  submitted: { label: "Menunggu Approval", cls: "bg-amber-100 text-amber-700" },
  posted: { label: "Posted", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Perlu Revisi", cls: "bg-red-100 text-red-700" },
};

export const PENGELUARAN_STATUS_META: Record<PengeluaranStatus, { label: string; cls: string }> = {
  pending: { label: "Belum Konfirmasi", cls: "bg-gray-100 text-gray-600" },
  confirmed: { label: "Confirmed", cls: "bg-green-100 text-green-700" },
  dikembalikan: { label: "Dikembalikan", cls: "bg-amber-100 text-amber-700" },
};

export const isEditableStatus = (status: BeritaAcaraStatus) => status === "draft" || status === "rejected";

// Sama dengan perhitungan di backend (routes/beritaAcara.ts -> hitung)
export function hitungPemasukan(input: {
  kantongPersembahan: number | null;
  kotakPersembahan: number | null;
  kotakPembangunan: number | null;
  pemasukanLain: { jumlah: number | null }[];
}) {
  return (
    (input.kantongPersembahan ?? 0) +
    (input.kotakPersembahan ?? 0) +
    (input.kotakPembangunan ?? 0) +
    input.pemasukanLain.reduce((sum, p) => sum + (p.jumlah ?? 0), 0)
  );
}

// Point yang "Dikembalikan" tidak ikut dihitung
export function hitungPengeluaran(rows: { jumlah: number | null; status: PengeluaranStatus }[]) {
  return rows.filter((r) => r.status !== "dikembalikan").reduce((sum, r) => sum + (r.jumlah ?? 0), 0);
}

// Label petugas: "Pemusik 2" untuk master yang bisa lebih dari satu, selain itu nama master saja
export function labelPetugas(name: string, isMultiple: boolean, nomor: number) {
  return isMultiple ? `${name} ${nomor}` : name;
}
