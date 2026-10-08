import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning";
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  onConfirm,
  onCancel,
  variant = "danger",
}: Props) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDanger ? "bg-red-100" : "bg-yellow-100"
            }`}
          >
            <AlertTriangle
              className={`w-7 h-7 ${isDanger ? "text-red-600" : "text-yellow-600"}`}
            />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="btn-outline flex-1">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                : "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
