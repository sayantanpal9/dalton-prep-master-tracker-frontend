import { defineConfig } from "vite";

const API_TARGET = "https://dalton-prep-backend.onrender.com";

export default defineConfig({
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
      },
      "/backend-health": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: () => "/",
      },
    },
  },
});
