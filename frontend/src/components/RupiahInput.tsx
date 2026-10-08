type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

// Input angka rupiah dengan pemisah ribuan (1.250.000); value disimpan sebagai integer
export default function RupiahInput({ value, onChange, disabled, placeholder = "0", className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        className="input-field pl-9 text-right tabular-nums disabled:bg-gray-50 disabled:text-gray-600"
        value={value == null ? "" : value.toLocaleString("id-ID")}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          const n = digits ? Number(digits) : null;
          // Batas kolom integer Postgres
          onChange(n != null && n > 2_147_483_647 ? 2_147_483_647 : n);
        }}
      />
    </div>
  );
}
