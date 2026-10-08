import { useEffect, useRef, useState } from "react";
import { Check, Eraser, X } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string | null;
  onCancel: () => void;
  // data URL PNG (latar transparan, sudah di-crop ke area coretan)
  onSave: (dataUrl: string) => void;
};

// Crop canvas ke bounding box coretan supaya PNG yang disimpan kecil
function exportTrimmed(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  // Simpan di skala 1x (bukan devicePixelRatio) supaya ukuran base64 tetap kecil
  const ratio = window.devicePixelRatio || 1;
  const out = document.createElement("canvas");
  out.width = Math.ceil((maxX - minX + 1) / ratio);
  out.height = Math.ceil((maxY - minY + 1) / ratio);
  out.getContext("2d")!.drawImage(canvas, minX, minY, maxX - minX + 1, maxY - minY + 1, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

export default function SignaturePad({ title, subtitle, onCancel, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Sesuaikan resolusi canvas dengan ukuran tampilan & devicePixelRatio
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      setIsEmpty(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const point = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    last.current = p;
    // Titik tunggal (tap) tetap tergambar
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    setIsEmpty(false);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col">
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-primary-800">Tanda Tangan — {title}</h2>
            {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <canvas
              ref={canvasRef}
              className="w-full h-56 sm:h-64 touch-none cursor-crosshair rounded-xl"
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            />
            {isEmpty && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 pointer-events-none">
                Tanda tangan di sini
              </p>
            )}
            <div className="absolute left-6 right-6 bottom-10 border-b border-gray-300 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-5 border-t">
          <button onClick={clear} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100">
            <Eraser className="w-4 h-4" /> Hapus
          </button>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-outline">Batal</button>
            <button
              onClick={() => onSave(exportTrimmed(canvasRef.current!))}
              disabled={isEmpty}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" /> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
