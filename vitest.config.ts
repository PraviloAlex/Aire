import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    __DEV__: true,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      include: ["src/data/**/*.ts", "src/features/session/timerCore.ts", "src/utils/**/*.ts"],
      reporter: ["text"]
    }
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
