import { useEffect, type ReactNode } from "react";
import { X, Edit2, User, UserCheck, UserX } from "lucide-react";

// ─── Shell modal detail (read-only) untuk halaman admin ──────────────────────

export default function DetailModal({
  title,
  subtitle,
  imageUrl,
  imageShape = "circle",
  badge,
  onClose,
  onEdit,
  children,
  size = "lg",
}: {
  title: string;
  subtitle?: ReactNode;
  imageUrl?: string | null;
  // circle = foto orang, cover = banner (warta/kegiatan)
  imageShape?: "circle" | "cover";
  badge?: ReactNode;
  onClose: () => void;
  onEdit?: () => void;
  children: ReactNode;
  size?: "lg" | "3xl";
}) {
  // Tutup dengan Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${size === "3xl" ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {imageShape === "cover" && imageUrl && (
          <img src={imageUrl} alt={title} className="w-full h-48 object-cover flex-shrink-0" />
        )}

        <div className="flex items-start justify-between gap-4 p-4 sm:p-6 border-b">
          <div className="flex items-center gap-4 min-w-0">
            {imageShape === "circle" && (
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                {imageUrl
                  ? <img src={imageUrl} alt={title} className="object-cover w-full h-full" />
                  : <div className="w-full h-full bg-primary-100 flex items-center justify-center"><User className="w-7 h-7 text-primary-400" /></div>
                }
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-primary-800 break-words">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              {badge && <div className="mt-2">{badge}</div>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6">{children}</div>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t">
          <button onClick={onClose} className="btn-outline">Tutup</button>
          {onEdit && (
            <button onClick={onEdit} className="btn-primary flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function DetailGrid({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</dl>;
}

export function DetailField({
  label,
  value,
  full = false,
}: {
  label: string;
  value: ReactNode;
  full?: boolean;
}) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={`mt-1 text-sm break-words whitespace-pre-line ${empty ? "text-gray-400" : "text-gray-800"}`}>
        {empty ? "-" : value}
      </dd>
    </div>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">{title}</h3>
      {children}
    </section>
  );
}

export function StatusBadge({ active, on, off }: { active: boolean; on: string; off: string }) {
  return active
    ? <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full"><UserCheck className="w-3 h-3" /> {on}</span>
    : <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full"><UserX className="w-3 h-3" /> {off}</span>;
}
