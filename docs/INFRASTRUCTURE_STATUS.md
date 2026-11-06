# Cloudflare Infrastructure Status

**Last verified:** 6 November 2026  
**Repository:** ashini-x/brvin-teachers  
**Account relationship:** Same Cloudflare account that contains the existing BRVIN Workers `parmar-ai` and `brvin-service`.

This file records observed Cloudflare resources. It is a status record, not a deployment configuration. Update it whenever an infrastructure resource is created, changed, deployed or removed.

## 1. Runtime Worker resource

| Field | Verified value |
|---|---|
| Worker name | `brvin-teachers` |
| Worker resource ID | `e0ccfe8aed524e119f91ab5f784bf5be` |
| Created | 6 November 2026 |
| Resource state | Bootstrap version deployed to production |
| `deployed_on` | `2026-11-06T02:01:54.572431Z` |
| Observability | Enabled |
| Invocation logs | Enabled and persisted |
| Query-string redaction | Enabled |
| Traces | Disabled |
| `workers.dev` | Enabled — `https://brvin-teachers.thenewtongs.workers.dev` |
| Preview URLs | Disabled |
| Service bindings | None |
| D1 bindings | None |
| Custom domains/routes | None |

Current deployed Worker version: `dc86a9d6-ee31-4165-a9fe-34a22a792955` (version 3; deployment ID `aa621a40-5cc5-4788-9504-ec80fd2c8c43`).

The public [health endpoint](https://brvin-teachers.thenewtongs.workers.dev/health) returns a non-sensitive bootstrap status. The root route describes the runtime as a bootstrap only. No teaching, tenant or student features are exposed yet.

## 2. Existing BRVIN dependency

The same account contains:
- `parmar-ai` — existing control/admin and ingestion/application Worker.
- `brvin-service` — existing private retrieval Worker exposing `BrvinRetrievalApi`.

BRVIN Teachers will later use a private same-account Service Binding named `BRVIN_SERVICE` targeting `brvin-service` and the `BrvinRetrievalApi` entrypoint. The binding has **not** been configured yet.

Do not change either existing Worker as part of BRVIN Teachers setup.

## 3. Verified CI/CD integration

- Workflow: [BRVIN Teachers CI/CD](https://github.com/ashini-x/brvin-teachers/actions/workflows/deploy.yml).
- Latest verified run: [Run #4 — successful](https://github.com/ashini-x/brvin-teachers/actions/runs/42147596916).
- Source commit: `0bc0f95946a765ed181506f0ad5c3e03d62113d7`.
- Dependency installation: committed `package-lock.json`; both CI validation and deployment use `npm ci`. The run restored the npm cache and installed 55 packages from the lockfile.
- Validation: all three Node tests passed; Cloudflare production build and no-deploy dry-run passed.
- Deployment: GitHub Actions deployed the existing Worker through the `production` Environment. Cloudflare confirms version `dc86a9d6-ee31-4165-a9fe-34a22a792955`, deployment ID `aa621a40-5cc5-4788-9504-ec80fd2c8c43`, deployed at `2026-11-06T02:01:54.572431Z`.
- Live smoke test: `/health` returned `{"ok":true,"app":"brvin-teachers","status":"bootstrap","version":"0.1.0-bootstrap"}`.
- Runtime: Node.js `22.23.0`; Cloudflare CLI `1.0.0-beta.28`; Vite `7.3.7`; Cloudflare Vite plugin `2.0.0-beta.v.12`.
- The successful deploy confirms the GitHub Environment's `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` were resolved. The token value is not stored in this repository or exposed in logs.
- Pull requests validate without production credentials. A push to `main` runs validation first and automatically deploys only after all validation steps pass; no manual human approval is required for routine releases.

## 4. Not yet provisioned

- BRVIN Teachers application D1 database and migration history.
- Private BRVIN Service Binding.
- Generated BRVIN `applicationEnvironmentId` and BRVIN application/environment registration.
- Tenant/student/channel identity implementation and first channel integration.
- Channel credentials, bot/webhook registrations or model-provider credentials.
- Custom domain, routes, Durable Objects, Queues or other optional services.

## 5. Next setup sequence

1. Define the real pilot (teacher, subject, source/project, first channel and student authentication) before implementing runtime behavior.
2. Design the tenant/student/channel data model and D1 migration plan against that pilot.
3. Implement the Phase 1 application foundation, tests and operator access; keep the existing bootstrap deployment safe while features are added.
4. Register BRVIN Teachers and the exact deployed environment in BRVIN Admin, obtain the generated `applicationEnvironmentId`, configure the private Service Binding and verify the connection.
5. Implement the selected channel and BRVIN v2 retrieval, then complete real teacher retrieval and grant-revocation acceptance.

The deployment token does not need D1 access merely to deploy a Worker that has a D1 binding. Add narrowly scoped D1 permissions only if CI is later responsible for creating or directly migrating the remote database.
