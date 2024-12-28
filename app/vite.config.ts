/// <reference types="vitest" />
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  test: {
    coverage: {
      reporter: ["lcov", "text", "html"]
    },
    environment: "jsdom",
    globals: true,
    setupFiles: "vitest.setup.ts",
  }
});
