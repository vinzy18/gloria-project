import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import DOMPurify from "dompurify";

// Konten lama berupa teks biasa, konten baru berupa HTML dari editor
export function renderContent(content: string | null | undefined) {
  if (!content) return "";
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const html = isHtml
    ? content
    : content
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
        .join("");
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
}

// "2026-10-01" / ISO -> "1 Oktober 2026" (null kalau kosong / tidak valid)
export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return format(d, withTime ? "d MMMM yyyy, HH:mm" : "d MMMM yyyy", { locale: id });
}

// 1250000 -> "Rp 1.250.000"
export function formatRupiah(value: number | null | undefined) {
  const n = value ?? 0;
  return `${n < 0 ? "-" : ""}Rp ${Math.abs(n).toLocaleString("id-ID")}`;
}

// "2026-10-04" -> "Minggu, 4 Oktober 2026" (tanggal tanpa jam diparse sebagai tanggal lokal)
export function formatHariTanggal(value: string | null | undefined) {
  if (!value) return null;
  const d = parseISO(value);
  if (isNaN(d.getTime())) return null;
  return format(d, "EEEE, d MMMM yyyy", { locale: id });
}
