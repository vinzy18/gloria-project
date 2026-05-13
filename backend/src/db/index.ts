import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "postgresql://gloria:gloria123@localhost:5432/gloria_db";

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
