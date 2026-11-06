import { defineConfig } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  accountId: "b34a6c0b7221454c5db977fe61ddf759",
  worker: {
    name: "brvin-teachers",
    entrypoint,
    compatibilityDate: "2026-11-06",
    workersDev: true,
    previewUrls: false,
    observability: {
      enabled: true,
      headSamplingRate: 1,
      redactQueryString: true,
      logs: {
        enabled: true,
        invocationLogs: true,
        persist: true
      },
      traces: {
        enabled: false
      }
    }
  }
});
