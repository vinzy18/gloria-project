import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  ArrowLeft, Calculator, Check, CheckCircle2, Circle, PenLine, Plus, RotateCcw, Save, Send,
  Trash2, Undo2, X, XCircle, AlertTriangle,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import ConfirmDialog from "../../components/ConfirmDialog";
import RupiahInput from "../../components/RupiahInput";
import SignaturePad from "../../components/SignaturePad";
import {
  beritaAcaraApi,
  type BeritaAcaraKeuangan,
  type BeritaAcaraKeuanganPayload,
  type MasterPemasukanLain,
  type MasterPengeluaran,
  type PengeluaranStatus,
} from "../../lib/api";
import { hasPermission } from "../../lib/auth";
import { formatDate, formatHariTanggal, formatRupiah } from "../../lib/format";
import { terbilang } from "../../lib/terbilang";
import {
  JENIS_IBADAH_LAINNYA, JENIS_IBADAH_OPTIONS, PENGELUARAN_STATUS_META, STATUS_META,
  hitungPemasukan, hitungPengeluaran, isEditableStatus, labelPetugas,
} from "../../lib/beritaAcara";

// ─── Types & helpers ─────────────────────────────────────────────────────────

type PemasukanLainRow = { uid: number; masterId: number; jumlah: number | null; keterangan: string };

type PengeluaranRow = {
  uid: number;
  masterId: number;
  nama: string;
  jumlah: number | null;
  signature: string | null;
  signedAt: string | null;
  status: PengeluaranStatus;
  statusAt: string | null;
};

type Tab = "pemasukan" | "pengeluaran";
type CalcPemasukan = { jumlah: number; terbilang: string };
type CalcPengeluaran = { jumlahPemasukan: number; jumlahPengeluaran: number; totalSaldo: number };

let uidCounter = 0;
const nextUid = () => ++uidCounter;

const errMsg = (err: unknown) => {
  const error = (err as {
    response?: { data?: { error?: string | { issues?: { path?: (string | number)[]; message?: string }[] } } };
  })?.response?.data?.error;
  // Error validasi Zod dari zValidator berupa object { issues: [...] }, bukan string
  const issue = typeof error === "object" ? error?.issues?.[0] : undefined;
  return typeof error === "string" ? error :
    issue ? `${issue.path?.join(".") || "Data"}: ${issue.message ?? "tidak valid"}` :
    "Terjadi kesalahan";
};

const Card = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <section className="bg-white rounded-xl shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-gray-100">
      <h2 className="font-semibold text-primary-800">{title}</h2>
      {action}
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </section>
);

const ViewRow = ({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm text-right tabular-nums ${strong ? "font-bold text-gray-900" : "text-gray-800"}`}>{value}</span>
  </div>
);

const StaleNote = ({ children }: { children: React.ReactNode }) => (
  <p className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {children}
  </p>
);

// ─── Page (loader) ───────────────────────────────────────────────────────────

export default function AdminBeritaAcaraKeuanganForm() {
  const { id } = useParams();
  const recordId = id && id !== "new" ? Number(id) : null;
  const canCreate = hasPermission("berita_acara.manage");
  // Tab disimpan di sini supaya tidak reset saat FormBody di-remount setelah simpan
  const [tab, setTab] = useState<Tab>("pemasukan");

  const masterLain = useQuery({
    queryKey: ["master-pemasukan-lain"],
    queryFn: () => beritaAcaraApi.masterPemasukanLain().then((r) => r.data),
  });
  const masterPengeluaran = useQuery({
    queryKey: ["master-pengeluaran"],
    queryFn: () => beritaAcaraApi.masterPengeluaran().then((r) => r.data),
  });
  const record = useQuery({
    queryKey: ["berita-acara-keuangan", "detail", recordId],
    queryFn: () => beritaAcaraApi.get(recordId!).then((r) => r.data),
    enabled: recordId != null,
  });

  const loading = masterLain.isLoading || masterPengeluaran.isLoading || (recordId != null && record.isLoading);
  const failed = masterLain.isError || masterPengeluaran.isError || record.isError;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-24 text-gray-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700 mb-2" />
            <p>Memuat data...</p>
          </div>
        ) : failed || (recordId == null && !canCreate) ? (
          <div className="text-center py-24 text-gray-500">
            <p>Gagal memuat berita acara.</p>
            <Link to="/admin/berita-acara/keuangan" className="text-primary-700 font-medium hover:underline">Kembali ke daftar</Link>
          </div>
        ) : (
          // key: reset state form setiap kali data dari server berubah (setelah simpan / approve)
          <FormBody
            key={record.data ? `${record.data.id}-${record.data.updatedAt}` : "new"}
            record={record.data ?? null}
            masterLain={masterLain.data!}
            masterPengeluaran={masterPengeluaran.data!}
            tab={tab}
            setTab={setTab}
          />
        )}
      </main>
    </div>
  );
}

// ─── Form body ───────────────────────────────────────────────────────────────

function FormBody({
  record,
  masterLain,
  masterPengeluaran,
  tab,
  setTab,
}: {
  record: BeritaAcaraKeuangan | null;
  masterLain: MasterPemasukanLain[];
  masterPengeluaran: MasterPengeluaran[];
  tab: Tab;
  setTab: (tab: Tab) => void;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  // isAdmin = boleh buat/ubah, isBendahara = boleh approve/tolak
  const isAdmin = hasPermission("berita_acara.manage");
  const isBendahara = hasPermission("berita_acara.approve");
  const status = record?.status ?? "draft";
  const readOnly = !isAdmin || !isEditableStatus(status);

  const masterById = useMemo(() => new Map(masterPengeluaran.map((m) => [m.id, m])), [masterPengeluaran]);
  const masterLainById = useMemo(() => new Map(masterLain.map((m) => [m.id, m])), [masterLain]);

  // Header
  const initialJenis = record?.jenisIbadah ?? JENIS_IBADAH_OPTIONS[0];
  const isPreset = (JENIS_IBADAH_OPTIONS as readonly string[]).includes(initialJenis);
  const [jenisSelect, setJenisSelect] = useState(isPreset ? initialJenis : JENIS_IBADAH_LAINNYA);
  const [jenisLainnya, setJenisLainnya] = useState(isPreset ? "" : initialJenis);
  const [tanggalIbadah, setTanggalIbadah] = useState(record?.tanggalIbadah ?? format(new Date(), "yyyy-MM-dd"));
  const [khadim, setKhadim] = useState(record?.khadim ?? "");
  const jenisIbadah = jenisSelect === JENIS_IBADAH_LAINNYA ? jenisLainnya.trim() : jenisSelect;

  // Pemasukan
  const [kantong, setKantong] = useState<number | null>(record ? record.kantongPersembahan : null);
  const [kotak, setKotak] = useState<number | null>(record ? record.kotakPersembahan : null);
  const [pembangunan, setPembangunan] = useState<number | null>(record ? record.kotakPembangunan : null);
  const [keteranganPemasukan, setKeteranganPemasukan] = useState(record?.keteranganPemasukan ?? "");
  const [pemasukanLain, setPemasukanLain] = useState<PemasukanLainRow[]>(
    () => record?.pemasukanLain.map((p) => ({ uid: nextUid(), masterId: p.masterId, jumlah: p.jumlah, keterangan: p.keterangan ?? "" })) ?? []
  );
  const [calcPemasukan, setCalcPemasukan] = useState<CalcPemasukan | null>(
    record ? { jumlah: record.jumlahPemasukan, terbilang: record.terbilangPemasukan ?? terbilang(record.jumlahPemasukan) } : null
  );

  // Pengeluaran
  const [rows, setRows] = useState<PengeluaranRow[]>(() =>
    record
      ? record.pengeluaran.map((p) => ({
          uid: nextUid(),
          masterId: p.masterId,
          nama: p.nama ?? "",
          jumlah: p.jumlah,
          signature: p.signature,
          signedAt: p.signedAt,
          status: p.status,
          statusAt: p.statusAt,
        }))
      : masterPengeluaran.filter((m) => m.isRequired).map((m) => emptyRow(m.id))
  );
  const [keteranganPengeluaran, setKeteranganPengeluaran] = useState(record?.keteranganPengeluaran ?? "");
  const [calcPengeluaran, setCalcPengeluaran] = useState<CalcPengeluaran | null>(
    record
      ? { jumlahPemasukan: record.jumlahPemasukan, jumlahPengeluaran: record.jumlahPengeluaran, totalSaldo: record.totalSaldo }
      : null
  );

  const [signingUid, setSigningUid] = useState<number | null>(null);
  const [addMasterId, setAddMasterId] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  // Hasil kalkulasi dianggap basi kalau input berubah setelah tombol Calculate ditekan
  const livePemasukan = hitungPemasukan({
    kantongPersembahan: kantong, kotakPersembahan: kotak, kotakPembangunan: pembangunan, pemasukanLain,
  });
  const livePengeluaran = hitungPengeluaran(rows);
  const pemasukanFresh = calcPemasukan?.jumlah === livePemasukan;
  const pengeluaranFresh =
    pemasukanFresh &&
    calcPengeluaran?.jumlahPengeluaran === livePengeluaran &&
    calcPengeluaran.jumlahPemasukan === calcPemasukan?.jumlah;

  // Nomor urut per master (Pemusik 1, Pemusik 2, ...) dihitung dari posisi baris
  const rowLabels = useMemo(() => {
    const counter = new Map<number, number>();
    return new Map(
      rows.map((r) => {
        const n = (counter.get(r.masterId) ?? 0) + 1;
        counter.set(r.masterId, n);
        const m = masterById.get(r.masterId);
        return [r.uid, labelPetugas(m?.name ?? "?", !!m?.isMultiple, n)];
      })
    );
  }, [rows, masterById]);

  function emptyRow(masterId: number): PengeluaranRow {
    return { uid: nextUid(), masterId, nama: "", jumlah: null, signature: null, signedAt: null, status: "pending", statusAt: null };
  }

  const updateRow = (uid: number, patch: Partial<PengeluaranRow>) =>
    setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));

  // Baris baru diletakkan setelah baris terakhir dengan master yang sama
  const addRow = (masterId: number) =>
    setRows((prev) => {
      const lastIdx = prev.map((r) => r.masterId).lastIndexOf(masterId);
      const next = [...prev];
      next.splice(lastIdx === -1 ? next.length : lastIdx + 1, 0, emptyRow(masterId));
      return next;
    });

  const canRemoveRow = (r: PengeluaranRow) =>
    !masterById.get(r.masterId)?.isRequired || rows.filter((x) => x.masterId === r.masterId).length > 1;

  const addableMasters = masterPengeluaran.filter((m) => m.isMultiple || !rows.some((r) => r.masterId === m.id));

  // ─── Calculate ─────────────────────────────────────────────────────────────

  const calculatePemasukan = () => {
    setCalcPemasukan({ jumlah: livePemasukan, terbilang: terbilang(livePemasukan) });
    toast.success("Pemasukan berhasil dihitung");
  };

  const calculatePengeluaran = () => {
    if (!pemasukanFresh) {
      toast.error("Klik Calculate di tab Pemasukan dulu");
      return;
    }
    setCalcPengeluaran({
      jumlahPemasukan: calcPemasukan!.jumlah,
      jumlahPengeluaran: livePengeluaran,
      totalSaldo: calcPemasukan!.jumlah - livePengeluaran,
    });
    toast.success("Pengeluaran berhasil dihitung");
  };

  // ─── Save / submit ─────────────────────────────────────────────────────────

  const signedCount = rows.filter((r) => r.signature).length;
  const decidedCount = rows.filter((r) => r.signature && r.status !== "pending").length;
  const missingRequired = masterPengeluaran.filter((m) => m.isRequired && !rows.some((r) => r.masterId === m.id));

  const checklist = [
    { ok: pemasukanFresh, label: "Pemasukan sudah di-Calculate" },
    { ok: pengeluaranFresh, label: "Pengeluaran sudah di-Calculate" },
    { ok: rows.length > 0 && rows.every((r) => r.nama.trim()), label: "Nama semua petugas terisi" },
    { ok: rows.length > 0 && signedCount === rows.length, label: `Tanda tangan (${signedCount}/${rows.length})` },
    { ok: rows.length > 0 && decidedCount === rows.length, label: `Confirm / Dikembalikan (${decidedCount}/${rows.length})` },
  ];
  const readyToSubmit = checklist.every((c) => c.ok) && missingRequired.length === 0;

  const validateBase = () => {
    if (!jenisIbadah) return "Jenis ibadah wajib diisi";
    if (!tanggalIbadah) return "Hari/Tanggal ibadah wajib diisi";
    if (!khadim.trim()) return "Khadim/Pemimpin ibadah wajib diisi";
    if (pemasukanLain.some((p) => !p.masterId)) return "Pilih jenis untuk setiap Pemasukan Lainnya";
    return null;
  };

  const buildPayload = (submit: boolean): BeritaAcaraKeuanganPayload => ({
    jenisIbadah,
    tanggalIbadah,
    khadim: khadim.trim(),
    kantongPersembahan: kantong ?? 0,
    kotakPersembahan: kotak ?? 0,
    kotakPembangunan: pembangunan ?? 0,
    keteranganPemasukan: keteranganPemasukan.trim() || null,
    keteranganPengeluaran: keteranganPengeluaran.trim() || null,
    pemasukanLain: pemasukanLain.map((p) => ({ masterId: p.masterId, jumlah: p.jumlah ?? 0, keterangan: p.keterangan.trim() || null })),
    pengeluaran: rows.map((r) => ({
      masterId: r.masterId,
      nama: r.nama.trim() || null,
      jumlah: r.jumlah ?? 0,
      signature: r.signature,
      signedAt: r.signedAt,
      status: r.status,
      statusAt: r.statusAt,
    })),
    submit,
  });

  const saveMutation = useMutation({
    mutationFn: (submit: boolean) =>
      record ? beritaAcaraApi.update(record.id, buildPayload(submit)) : beritaAcaraApi.create(buildPayload(submit)),
    onSuccess: ({ data }, submit) => {
      qc.invalidateQueries({ queryKey: ["berita-acara-keuangan"] });
      toast.success(submit ? "Berita acara disubmit, menunggu approval bendahara" : "Draft berhasil disimpan");
      if (!record) navigate(`/admin/berita-acara/keuangan/${data.id}`, { replace: true });
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  const saveDraft = () => {
    const err = validateBase();
    if (err) return toast.error(err);
    saveMutation.mutate(false);
  };

  const trySubmit = () => {
    const err = validateBase();
    if (err) return toast.error(err);
    if (missingRequired.length) return toast.error(`Pengeluaran wajib belum ada: ${missingRequired.map((m) => m.name).join(", ")}`);
    const failed = checklist.find((c) => !c.ok);
    if (failed) return toast.error(`Belum lengkap: ${failed.label}`);
    setConfirmSubmit(true);
  };

  const approveMutation = useMutation({
    mutationFn: () => beritaAcaraApi.approve(record!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["berita-acara-keuangan"] });
      toast.success("Berita acara di-approve dan sudah Posted");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: (catatan: string) => beritaAcaraApi.reject(record!.id, catatan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["berita-acara-keuangan"] });
      setRejectOpen(false);
      toast.success("Berita acara dikembalikan ke admin untuk direvisi");
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  const signingRow = rows.find((r) => r.uid === signingUid);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Title */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link to="/admin/berita-acara/keuangan" className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-200" title="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {record ? "Berita Acara Keuangan" : "Buat Berita Acara Keuangan"}
            </h1>
            <p className="text-gray-500 text-sm">Berita Acara Ibadah — Pemasukan &amp; Pengeluaran</p>
          </div>
        </div>
        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_META[status].cls}`}>
          {STATUS_META[status].label}
        </span>
      </div>

      {/* Catatan revisi dari bendahara */}
      {status === "rejected" && record?.catatanBendahara && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-800">
              Dikembalikan oleh {record.rejectedByName ?? "bendahara"}
              {record.rejectedAt && <span className="font-normal"> · {formatDate(record.rejectedAt, true)}</span>}
            </p>
            <p className="text-red-700 whitespace-pre-line mt-1">{record.catatanBendahara}</p>
          </div>
        </div>
      )}

      {/* Header ibadah — dipakai bersama oleh form Pemasukan & Pengeluaran */}
      <Card title="Data Ibadah">
        {readOnly ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-gray-500">Ibadah</p><p className="font-medium text-gray-800">{record?.jenisIbadah}</p></div>
            <div><p className="text-gray-500">Hari/Tanggal</p><p className="font-medium text-gray-800">{formatHariTanggal(record?.tanggalIbadah)}</p></div>
            <div><p className="text-gray-500">Khadim/Pemimpin Ibadah</p><p className="font-medium text-gray-800">{record?.khadim}</p></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Ibadah <span className="text-red-500">*</span></label>
              <select className="input-field" value={jenisSelect} onChange={(e) => setJenisSelect(e.target.value)}>
                {JENIS_IBADAH_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                <option value={JENIS_IBADAH_LAINNYA}>{JENIS_IBADAH_LAINNYA}</option>
              </select>
              {jenisSelect === JENIS_IBADAH_LAINNYA && (
                <input
                  className="input-field mt-2"
                  placeholder="Nama ibadah"
                  maxLength={100}
                  value={jenisLainnya}
                  onChange={(e) => setJenisLainnya(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="label-field">Hari/Tanggal Ibadah <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" value={tanggalIbadah} onChange={(e) => setTanggalIbadah(e.target.value)} />
              {tanggalIbadah && <p className="text-xs text-gray-500 mt-1">{formatHariTanggal(tanggalIbadah)}</p>}
            </div>
            <div>
              <label className="label-field">Khadim/Pemimpin Ibadah <span className="text-red-500">*</span></label>
              <input className="input-field" maxLength={255} value={khadim} onChange={(e) => setKhadim(e.target.value)} />
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1">
        {(["pemasukan", "pengeluaran"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? "bg-primary-700 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
          </button>
        ))}
      </div>

      {tab === "pemasukan" ? (
        <>
          {/* Rincian pemasukan */}
          <Card title="Rincian Pemasukan">
            {readOnly ? (
              <div className="divide-y divide-gray-100">
                <ViewRow label="Kantong/Sompoi Persembahan" value={formatRupiah(record?.kantongPersembahan)} />
                <ViewRow label="Kotak Persembahan" value={formatRupiah(record?.kotakPersembahan)} />
                <ViewRow label="Kotak Pembangunan" value={formatRupiah(record?.kotakPembangunan)} />
                {record?.keteranganPemasukan && (
                  <div className="py-2">
                    <p className="text-sm text-gray-500">Keterangan</p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{record.keteranganPemasukan}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Kantong/Sompoi Persembahan</label>
                  <RupiahInput value={kantong} onChange={setKantong} />
                  <p className="text-xs text-gray-400 mt-1">Akumulasi dari semua kantong</p>
                </div>
                <div>
                  <label className="label-field">Kotak Persembahan</label>
                  <RupiahInput value={kotak} onChange={setKotak} />
                </div>
                <div>
                  <label className="label-field">Kotak Pembangunan</label>
                  <RupiahInput value={pembangunan} onChange={setPembangunan} />
                </div>
                <div className="md:col-span-3">
                  <label className="label-field">Keterangan</label>
                  <textarea className="input-field" rows={2} value={keteranganPemasukan} onChange={(e) => setKeteranganPemasukan(e.target.value)} />
                </div>
              </div>
            )}
          </Card>

          {/* Pemasukan lainnya */}
          <Card
            title="Pemasukan Lainnya"
            action={!readOnly && (
              <button
                onClick={() => setPemasukanLain((p) => [...p, { uid: nextUid(), masterId: 0, jumlah: null, keterangan: "" }])}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            )}
          >
            {(readOnly ? record?.pemasukanLain.length : pemasukanLain.length) === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">Tidak ada pemasukan lainnya</p>
            ) : readOnly ? (
              <div className="divide-y divide-gray-100">
                {record!.pemasukanLain.map((p) => (
                  <div key={p.id} className="py-2">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-700">{p.masterName}</span>
                      <span className="tabular-nums text-gray-800">{formatRupiah(p.jumlah)}</span>
                    </div>
                    {/* Keterangan kosong tidak ditampilkan */}
                    {p.keterangan && <p className="text-xs text-gray-500 whitespace-pre-line mt-0.5">{p.keterangan}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pemasukanLain.map((p) => {
                  const patch = (v: Partial<PemasukanLainRow>) =>
                    setPemasukanLain((prev) => prev.map((x) => (x.uid === p.uid ? { ...x, ...v } : x)));
                  return (
                    <div key={p.uid} className="rounded-lg border border-gray-200 p-3 space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          className="input-field sm:flex-1"
                          value={p.masterId || ""}
                          onChange={(e) => patch({ masterId: Number(e.target.value) })}
                        >
                          <option value="" disabled>Pilih jenis pemasukan...</option>
                          {masterLain.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                          {/* Master yang sudah dinonaktifkan tetap tampil untuk data lama */}
                          {p.masterId > 0 && !masterLainById.has(p.masterId) && (
                            <option value={p.masterId}>
                              {record?.pemasukanLain.find((x) => x.masterId === p.masterId)?.masterName ?? "(tidak aktif)"}
                            </option>
                          )}
                        </select>
                        <div className="flex gap-2">
                          <RupiahInput className="flex-1 sm:w-48" value={p.jumlah} onChange={(v) => patch({ jumlah: v })} />
                          <button
                            onClick={() => setPemasukanLain((prev) => prev.filter((x) => x.uid !== p.uid))}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="input-field"
                        rows={1}
                        placeholder="Keterangan (opsional)"
                        value={p.keterangan}
                        onChange={(e) => patch({ keterangan: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Jumlah pemasukan */}
          <Card
            title="Jumlah Pemasukan"
            action={!readOnly && (
              <button onClick={calculatePemasukan} className="btn-secondary flex items-center gap-2 py-1.5 px-4 text-sm">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
            )}
          >
            <div className="space-y-3">
              {!readOnly && calcPemasukan && !pemasukanFresh && (
                <StaleNote>Ada perubahan angka setelah Calculate — klik Calculate lagi.</StaleNote>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Jumlah Pemasukan</label>
                  <div className="input-field bg-gray-50 text-right font-bold tabular-nums">
                    {calcPemasukan ? formatRupiah(calcPemasukan.jumlah) : <span className="text-gray-400 font-normal">Klik Calculate</span>}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="label-field">Terbilang</label>
                  <div className="input-field bg-gray-50 italic min-h-[38px]">
                    {calcPemasukan?.terbilang ?? <span className="text-gray-400 not-italic">-</span>}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Rincian pengeluaran */}
          <Card title="Rincian Pengeluaran">
            <div className="space-y-3">
              {rows.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Belum ada point pengeluaran</p>}
              {rows.map((r, idx) => {
                const master = masterById.get(r.masterId);
                const label = rowLabels.get(r.uid)!;
                const isLastOfMaster = rows.findIndex((x, i) => i > idx && x.masterId === r.masterId) === -1;
                const meta = PENGELUARAN_STATUS_META[r.status];
                const returned = r.status === "dikembalikan";
                return (
                  <div key={r.uid}>
                    <div className={`rounded-xl border p-4 ${returned ? "border-amber-200 bg-amber-50/40" : "border-gray-200"}`}>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-gray-800">{label}</h3>
                        <div className="flex items-center gap-2">
                          {r.signature && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                          )}
                          {!readOnly && canRemoveRow(r) && (
                            <button
                              onClick={() => setRows((prev) => prev.filter((x) => x.uid !== r.uid))}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Hapus point"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="label-field">Nama</label>
                          {readOnly ? (
                            <p className="text-sm text-gray-800">{r.nama || "-"}</p>
                          ) : (
                            <input
                              className="input-field disabled:bg-gray-50 disabled:text-gray-600"
                              maxLength={255}
                              value={r.nama}
                              disabled={!!r.signature}
                              onChange={(e) => updateRow(r.uid, { nama: e.target.value })}
                            />
                          )}
                        </div>
                        <div>
                          <label className="label-field">Jumlah</label>
                          {readOnly ? (
                            <p className={`text-sm tabular-nums ${returned ? "line-through text-gray-400" : "text-gray-800"}`}>
                              {formatRupiah(r.jumlah)}
                            </p>
                          ) : (
                            <RupiahInput value={r.jumlah} disabled={!!r.signature} onChange={(v) => updateRow(r.uid, { jumlah: v })} />
                          )}
                          {returned && <p className="text-xs text-amber-700 mt-1">Tidak dihitung ke pengeluaran</p>}
                        </div>
                        <div>
                          <label className="label-field">Sign</label>
                          {r.signature ? (
                            <div className="space-y-2">
                              <div className="rounded-lg border border-gray-200 bg-white h-20 flex items-center justify-center p-1">
                                <img src={r.signature} alt={`Tanda tangan ${label}`} className="max-h-full max-w-full object-contain" />
                              </div>
                              {r.signedAt && <p className="text-xs text-gray-400">Ditandatangani {formatDate(r.signedAt, true)}</p>}
                              {!readOnly && (
                                <div className="flex flex-wrap gap-2">
                                  {r.status === "pending" ? (
                                    <>
                                      <button
                                        onClick={() => updateRow(r.uid, { status: "confirmed", statusAt: new Date().toISOString() })}
                                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg"
                                      >
                                        <Check className="w-4 h-4" /> Confirm
                                      </button>
                                      <button
                                        onClick={() => updateRow(r.uid, { status: "dikembalikan", statusAt: new Date().toISOString() })}
                                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg"
                                      >
                                        <Undo2 className="w-4 h-4" /> Dikembalikan
                                      </button>
                                    </>
                                  ) : null}
                                  <button
                                    onClick={() => updateRow(r.uid, { signature: null, signedAt: null, status: "pending", statusAt: null })}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100"
                                    title="Hapus tanda tangan & ulangi"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" /> Ulangi
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : readOnly ? (
                            <p className="text-sm text-gray-400">Belum ditandatangani</p>
                          ) : (
                            <button
                              onClick={() => {
                                if (!r.nama.trim()) return toast.error(`Isi nama ${label} dulu`);
                                setSigningUid(r.uid);
                              }}
                              className="w-full h-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                            >
                              <PenLine className="w-5 h-5" /> Tanda Tangan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tombol tambah untuk master yang bisa lebih dari satu (Pemusik, Kantoria) */}
                    {!readOnly && master?.isMultiple && isLastOfMaster && (
                      <button
                        onClick={() => addRow(r.masterId)}
                        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg"
                      >
                        <Plus className="w-4 h-4" /> Tambah {master.name}
                      </button>
                    )}
                  </div>
                );
              })}

              {!readOnly && (
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                  <select className="input-field sm:flex-1" value={addMasterId} onChange={(e) => setAddMasterId(e.target.value)}>
                    <option value="">Pilih point pengeluaran lain...</option>
                    {addableMasters.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <button
                    disabled={!addMasterId}
                    onClick={() => { addRow(Number(addMasterId)); setAddMasterId(""); }}
                    className="btn-outline flex items-center justify-center gap-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" /> Tambah Point
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Rekap */}
          <Card
            title="Rekapitulasi"
            action={!readOnly && (
              <button onClick={calculatePengeluaran} className="btn-secondary flex items-center gap-2 py-1.5 px-4 text-sm">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
            )}
          >
            <div className="space-y-3">
              {!readOnly && !pemasukanFresh && (
                <StaleNote>Jumlah Pemasukan belum di-Calculate di tab Pemasukan.</StaleNote>
              )}
              {!readOnly && pemasukanFresh && calcPengeluaran && !pengeluaranFresh && (
                <StaleNote>Ada perubahan setelah Calculate — klik Calculate lagi.</StaleNote>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Jumlah Pemasukan</label>
                  <div className="input-field bg-gray-50 text-right tabular-nums">
                    {calcPemasukan ? formatRupiah(calcPemasukan.jumlah) : <span className="text-gray-400">-</span>}
                  </div>
                </div>
                <div>
                  <label className="label-field">Jumlah Pengeluaran</label>
                  <div className="input-field bg-gray-50 text-right tabular-nums">
                    {calcPengeluaran ? formatRupiah(calcPengeluaran.jumlahPengeluaran) : <span className="text-gray-400">Klik Calculate</span>}
                  </div>
                </div>
                <div>
                  <label className="label-field">Total Saldo</label>
                  <div className={`input-field bg-gray-50 text-right tabular-nums font-bold ${calcPengeluaran && calcPengeluaran.totalSaldo < 0 ? "text-red-600" : ""}`}>
                    {calcPengeluaran ? formatRupiah(calcPengeluaran.totalSaldo) : <span className="text-gray-400 font-normal">Klik Calculate</span>}
                  </div>
                </div>
              </div>
              {readOnly ? (
                record?.keteranganPengeluaran && (
                  <div>
                    <p className="text-sm text-gray-500">Keterangan</p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{record.keteranganPengeluaran}</p>
                  </div>
                )
              ) : (
                <div>
                  <label className="label-field">Keterangan</label>
                  <textarea className="input-field" rows={2} value={keteranganPengeluaran} onChange={(e) => setKeteranganPengeluaran(e.target.value)} />
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Checklist sebelum submit */}
      {!readOnly && (
        <Card title="Checklist Submit">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {checklist.map((c) => (
              <li key={c.label} className={`flex items-center gap-2 ${c.ok ? "text-green-700" : "text-gray-500"}`}>
                {c.ok ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />} {c.label}
              </li>
            ))}
            {missingRequired.length > 0 && (
              <li className="flex items-center gap-2 text-red-600 sm:col-span-2">
                <XCircle className="w-4 h-4" /> Point wajib belum ada: {missingRequired.map((m) => m.name).join(", ")}
              </li>
            )}
          </ul>
        </Card>
      )}

      {/* Riwayat */}
      {record && (
        <div className="text-xs text-gray-500 space-y-0.5 px-1">
          <p>Dibuat oleh {record.createdByName ?? "-"} · {formatDate(record.createdAt, true)}</p>
          {record.submittedAt && <p>Disubmit oleh {record.submittedByName ?? "-"} · {formatDate(record.submittedAt, true)}</p>}
          {record.approvedAt && <p>Di-approve oleh {record.approvedByName ?? "-"} · {formatDate(record.approvedAt, true)}</p>}
        </div>
      )}

      {/* Action bar */}
      {(!readOnly || (isBendahara && status === "submitted")) && (
        <div className="sticky bottom-4 z-30 bg-white rounded-xl border border-gray-200 shadow-lg">
          <div className="flex flex-wrap justify-end gap-3 p-3">
            {!readOnly ? (
              <>
                <button onClick={saveDraft} disabled={saveMutation.isPending} className="btn-outline flex items-center gap-2">
                  <Save className="w-4 h-4" /> Simpan Draft
                </button>
                <button
                  onClick={trySubmit}
                  disabled={saveMutation.isPending}
                  className={`btn-primary flex items-center gap-2 ${readyToSubmit ? "" : "opacity-60"}`}
                >
                  <Send className="w-4 h-4" /> {saveMutation.isPending ? "Menyimpan..." : "Submit"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setRejectOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Kembalikan
                </button>
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> {approveMutation.isPending ? "Memproses..." : "Approve & Post"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {signingRow && (
        <SignaturePad
          title={rowLabels.get(signingRow.uid)!}
          subtitle={`${signingRow.nama} · ${formatRupiah(signingRow.jumlah)}`}
          onCancel={() => setSigningUid(null)}
          onSave={(dataUrl) => {
            updateRow(signingRow.uid, { signature: dataUrl, signedAt: new Date().toISOString(), status: "pending", statusAt: null });
            setSigningUid(null);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmSubmit}
        variant="warning"
        title="Submit Berita Acara?"
        message="Setelah disubmit, berita acara tidak bisa diubah dan akan dicek oleh bendahara sebelum Posted."
        confirmLabel="Submit"
        onConfirm={() => { setConfirmSubmit(false); saveMutation.mutate(true); }}
        onCancel={() => setConfirmSubmit(false)}
      />

      {rejectOpen && (
        <RejectDialog
          pending={rejectMutation.isPending}
          onCancel={() => setRejectOpen(false)}
          onSubmit={(catatan) => rejectMutation.mutate(catatan)}
        />
      )}
    </div>
  );
}

function RejectDialog({ pending, onCancel, onSubmit }: { pending: boolean; onCancel: () => void; onSubmit: (catatan: string) => void }) {
  const [catatan, setCatatan] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-gray-900">Kembalikan untuk Revisi</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          <label className="label-field">Catatan untuk admin <span className="text-red-500">*</span></label>
          <textarea
            className="input-field"
            rows={4}
            autoFocus
            placeholder="Contoh: Jumlah kotak pembangunan tidak sesuai dengan fisik"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onCancel} className="btn-outline flex-1">Batal</button>
          <button
            disabled={!catatan.trim() || pending}
            onClick={() => onSubmit(catatan.trim())}
            className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "Memproses..." : "Kembalikan"}
          </button>
        </div>
      </div>
    </div>
  );
}
