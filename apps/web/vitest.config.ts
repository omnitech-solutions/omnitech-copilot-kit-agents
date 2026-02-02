import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      uuid: path.resolve(__dirname, "src/test/__mocks__/uuid.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.tsx"],
    css: false,
    logHeapUsage: false,
    isolate: false,
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
  ssr: {
    noExternal: true,
  },
  esbuild: {
    sourcemap: false,
  },
});
