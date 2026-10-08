// Gagal saat startup kalau JWT_SECRET belum di-set, daripada diam-diam pakai secret lemah
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("Environment variable JWT_SECRET wajib di-set");
}

export const JWT_SECRET: string = jwtSecret;
