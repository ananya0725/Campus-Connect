
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // API requests
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },

      // Event poster/image requests
      "/uploads": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    },
  },
});
