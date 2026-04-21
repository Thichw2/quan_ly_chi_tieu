import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, // Ép Vite luôn chạy ở cổng này
    strictPort: true, // Nếu cổng 5175 bị chiếm, nó sẽ báo lỗi chứ không tự nhảy cổng khác
  },
})
