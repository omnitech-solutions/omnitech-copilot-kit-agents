import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "katex/dist/katex.min.css": fileURLToPath(
        new URL("./src/test/styleStub.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.tsx"],
    css: true,
  },
  server: {
    deps: {
      inline: ["primereact", "@rjsf/primereact"],
    },
  },
});
