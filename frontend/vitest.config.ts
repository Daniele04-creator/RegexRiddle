import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      fileParallelism: false,
      setupFiles: "./src/test/setup.ts",
      testTimeout: 15000
    }
  })
);
