import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@features": resolve(__dirname, "./src/features"),
      "@components": resolve(__dirname, "./src/components"),
      "@composables": resolve(__dirname, "./src/composables"),
      "@services": resolve(__dirname, "./src/services"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@constants": resolve(__dirname, "./src/constants"),
      "@types": resolve(__dirname, "./src/types"),
      "@assets": resolve(__dirname, "./src/assets"),
      "@app": resolve(__dirname, "./src/app"),
      "@tests": resolve(__dirname, "./tests"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://api.foodics.dev/v5",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
