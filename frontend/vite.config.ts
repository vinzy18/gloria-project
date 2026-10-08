import { fileURLToPath } from "node:url";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

// Kode yang dipakai bareng dengan backend (mis. katalog permission RBAC)
const sharedDir = fileURLToPath(new URL("../backend/src/shared", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@shared": sharedDir },
  },
  server: {
    port: 5173,
    // Izinkan dev server membaca folder shared yang ada di luar root frontend
    fs: { allow: [searchForWorkspaceRoot(process.cwd()), sharedDir] },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
