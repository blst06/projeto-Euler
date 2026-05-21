import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Em dev local, proxy de /api para o backend rodando em localhost:3000
  // Em produção (Vercel), o frontend usa VITE_API_BASE com a URL do Render
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
