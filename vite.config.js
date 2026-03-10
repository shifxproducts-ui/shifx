import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    // ── Dev proxy: all API calls go to FastAPI on :8000 ──
    // This means the frontend can call  fetch("/auth/login")
    // instead of  fetch("http://localhost:8000/auth/login")
    // — no CORS issues in development.
    proxy: {
      "/auth":     { target: "http://localhost:8000", changeOrigin: true },
      "/products": { target: "http://localhost:8000", changeOrigin: true },
      "/orders":   { target: "http://localhost:8000", changeOrigin: true },
      "/reviews":  { target: "http://localhost:8000", changeOrigin: true },
      "/wishlist": { target: "http://localhost:8000", changeOrigin: true },
      "/admin":    { target: "http://localhost:8000", changeOrigin: true },
      "/company":  { target: "http://localhost:8000", changeOrigin: true },
      "/health":   { target: "http://localhost:8000", changeOrigin: true },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
  },
});
