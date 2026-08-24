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
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3003,
  },
});
