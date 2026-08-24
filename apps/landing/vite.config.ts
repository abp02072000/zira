import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "../../packages/ui/src/components"),
      "@/hooks": path.resolve(__dirname, "../../packages/ui/src/hooks"),
      "@/contexts": path.resolve(__dirname, "../../packages/shared/src/contexts"),
      "@/lib": path.resolve(__dirname, "../../packages/shared/src/lib"),
      "@/types": path.resolve(__dirname, "../../packages/shared/src/types.ts"),
      "@": path.resolve(__dirname, "./src"),
      "@zira/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@zira/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@zira/app-porteur": path.resolve(__dirname, "../porteur/src"),
      "@zira/app-investisseur": path.resolve(__dirname, "../investisseur/src"),
      "@zira/app-moderateur": path.resolve(__dirname, "../moderateur/src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../../dist"),
    emptyOutDir: true,
  },
});
