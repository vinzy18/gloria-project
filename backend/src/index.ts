import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import jemaatRoutes from "./routes/jemaat";
import newsRoutes from "./routes/news";
import eventsRoutes from "./routes/events";
import organizationRoutes from "./routes/organization";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("*", logger());

app.route("/api/auth", authRoutes);
app.route("/api/jemaat", jemaatRoutes);
app.route("/api/news", newsRoutes);
app.route("/api/events", eventsRoutes);
// app.route("/api/organization", organizationRoutes);

app.get("/", (c) => c.json({ message: "Gereja Gloria API v1.0" }));

app.notFound((c) => c.json({ error: "Route tidak ditemukan" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = parseInt(process.env.PORT ?? "3000");
console.log(`Server berjalan di http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
