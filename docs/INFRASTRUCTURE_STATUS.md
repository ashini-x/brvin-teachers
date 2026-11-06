# Cloudflare Infrastructure Status

**Last verified:** 6 November 2026  
**Repository:** ashini-x/brvin-teachers  
**Account relationship:** Same Cloudflare account that contains the existing BRVIN Workers `parmar-ai` and `brvin-service`.

This is the live-resource status record, not a deployment configuration. Update it when a resource, binding, database schema or release changes.

## 1. Production application Worker

| Field | Verified value |
|---|---|
| Worker | `brvin-teachers` |
| Worker resource ID | `e0ccfe8aed524e119f91ab5f784bf5be` |
| Public URL | `https://brvin-teachers.thenewtongs.workers.dev` |
| State | PR #1 Operator Console foundation deployed |
| Compatibility date | `2026-11-06` |
| Observability | Enabled; invocation logs persisted; query strings redacted |
| Preview URLs | Disabled |
| D1 binding | `DB` → `brvin-teachers-app` (live and confirmed in Worker settings) |
| BRVIN management binding | Not yet deployed; PR #2 is pending merge/release |
| BRVIN v2 retrieval binding | Not yet configured |
| Custom domain/routes | None |

The protected Operator Console is served at `/operator`. The public `/health` endpoint is intentionally non-sensitive. GitHub Actions main-release run [#42165403713](https://github.com/ashini-x/brvin-teachers/actions/runs/42165403713) successfully applied the application D1 migration, deployed the Worker, passed health smoke checks and confirmed that Cloudflare Access protects the operator route.

Cloudflare Access application **BRVIN Teachers Operator Console** protects `brvin-teachers.thenewtongs.workers.dev/operator*` with the narrow configured operator allow policy. The root and `/health` routes remain outside the operator path.

## 2. Application D1

| Field | Verified value |
|---|---|
| Database | `brvin-teachers-app` |
| Database ID | `e1d4c754-7b89-45d0-9ee0-e8c0049a5ebf` |
| Created | 6 November 2026 |
| Location hint | APAC |
| Migration | `0001_operator_foundation.sql` applied by the production workflow |
| Live tables confirmed | `id_sequences`, `teachers`, `tenant_brvin_projects`, `operator_audit_events`, plus D1 system tables |

This database owns tenant profiles, tenant references, the app-to-BRVIN project mapping and application/operator metadata. It must never contain copies of source PDFs, OCR output, indexed passages or BRVIN grants. No teacher record has been seeded.

## 3. Existing BRVIN dependencies

The same Cloudflare account contains:
- `parmar-ai` — existing control/admin, ingestion and Parmar AI application Worker.
- `brvin-service` — private retrieval Worker exposing the frozen `BrvinRetrievalApi`.

The coordinated management implementation is in Core PR #107. The consumer binding configuration is in BRVIN Teachers PR #2. Both have passed their pull-request validation, but neither integration PR has been merged/deployed yet. The consumer config deliberately contains the fail-closed placeholder `BRVIN_TEACHERS_ENVIRONMENT_ID_REQUIRED`.

No BRVIN Teachers application/environment record has been registered in BRVIN Admin yet. This means the management entrypoint and v2 retrieval are not active for the app. Do not create classrooms or sources in production until the Core release and environment registration are completed.

## 4. CI/CD and deployment authority

- GitHub Actions is the sole release authority for this Worker.
- Pull requests run `npm ci`, tests, production build and deployment dry-run without production credentials.
- Main releases apply the checked-in application D1 migrations, build/deploy the Worker and run the public health and Access-protection smoke checks.
- Production Cloudflare credentials are stored in the GitHub `production` Environment, not in this repository.
- The existing GitHub Cloudflare token successfully applied the app D1 migration; no additional token permission is requested for this app database based on the observed release.

The Cloudflare Worker deployment and D1 migration permissions must remain narrowly scoped. Never use the Global API Key or broad account administration for routine releases.

## 5. Next setup sequence

1. Merge and release Core PR #107 in `ashini-x/parmar-ai`; verify the named management entrypoint is deployed in the existing `parmar-ai` Worker.
2. In BRVIN Admin, register application slug `brvin-teachers` and an active `production` environment with Worker name `brvin-teachers` and Worker URL `https://brvin-teachers.thenewtongs.workers.dev`.
3. Copy the generated environment UUID into the BRVIN Teachers Service Binding configuration, replacing the deliberate placeholder.
4. Merge and release consumer PR #2; verify the management binding's `health()` call returns ready.
5. Separately configure and verify the private `brvin-service` retrieval v2 binding before students are enabled.
6. Create the actual teacher/classroom/collection/source only after the binding is active and an approved PDF is available.

Students, channels, provider credentials and teaching flows remain unimplemented. No production teacher, project, collection, source, grant or student has been created by these changes.
