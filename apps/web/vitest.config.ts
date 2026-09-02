import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // The e2e/ directory holds Playwright specs (its own test runner, own
    // `test`/`expect` globals) — vitest's default include glob would
    // otherwise also pick up its *.spec.ts files.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
