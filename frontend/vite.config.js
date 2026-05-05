import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Cấu hình chuẩn cho React Router
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["mapbox-gl", "react-map-gl"],
  },
  server: {
    port: 5173,
    open: true, // tự mở trình duyệt khi chạy
    historyApiFallback: true,
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
