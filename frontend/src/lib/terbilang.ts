// Salinan dari backend/src/lib/terbilang.ts — jaga supaya tetap sama
const SATUAN = [
  "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas",
];

function eja(n: number): string {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${eja(n - 10)} belas`;
  if (n < 100) return `${eja(Math.floor(n / 10))} puluh ${eja(n % 10)}`;
  if (n < 200) return `seratus ${eja(n - 100)}`;
  if (n < 1_000) return `${eja(Math.floor(n / 100))} ratus ${eja(n % 100)}`;
  if (n < 2_000) return `seribu ${eja(n - 1_000)}`;
  if (n < 1_000_000) return `${eja(Math.floor(n / 1_000))} ribu ${eja(n % 1_000)}`;
  if (n < 1_000_000_000) return `${eja(Math.floor(n / 1_000_000))} juta ${eja(n % 1_000_000)}`;
  if (n < 1_000_000_000_000) return `${eja(Math.floor(n / 1_000_000_000))} miliar ${eja(n % 1_000_000_000)}`;
  return `${eja(Math.floor(n / 1_000_000_000_000))} triliun ${eja(n % 1_000_000_000_000)}`;
}

// 1250000 -> "Satu Juta Dua Ratus Lima Puluh Ribu Rupiah"
export function terbilang(value: number): string {
  const n = Math.trunc(value);
  const words = n === 0 ? "nol" : `${n < 0 ? "minus " : ""}${eja(Math.abs(n))}`;
  return `${words} rupiah`
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}
