import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  accountId: "b34a6c0b7221454c5db977fe61ddf759",
  worker: {
    name: "brvin-teachers",
    entrypoint,
    compatibilityDate: "2026-11-06",
    workersDev: true,
    previewUrls: false,
    env: {
      DB: bindings.d1({ id: "e1d4c754-7b89-45d0-9ee0-e8c0049a5ebf", name: "brvin-teachers-app" }),
      // Replace this deliberately unregistered placeholder after creating the
      // brvin-teachers / production environment in BRVIN Admin.
      BRVIN_MANAGEMENT: bindings.worker({
        worker: "parmar-ai",
        exportName: "BrvinTeachersManagementApi",
        props: { applicationEnvironmentId: "BRVIN_TEACHERS_ENVIRONMENT_ID_REQUIRED" }
      })
    },
    observability: {
      enabled: true,
      headSamplingRate: 1,
      redactQueryString: true,
      logs: { enabled: true, invocationLogs: true, persist: true },
      traces: { enabled: false }
    }
  }
});
