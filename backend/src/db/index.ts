import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "postgresql://gloria:gloria123@localhost:5432/gloria_db";

// Tutup koneksi idle supaya tidak tersisa koneksi basi saat function Vercel / Neon tidur
const client = postgres(connectionString, { idle_timeout: 20 });

export const db = drizzle(client, { schema });
