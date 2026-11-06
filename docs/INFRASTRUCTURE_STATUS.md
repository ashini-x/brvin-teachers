# Cloudflare Infrastructure Status

**Last verified:** 6 November 2026  
**Repository:** `ashini-x/brvin-teachers`  
**Account relationship:** Same Cloudflare account that contains the existing BRVIN Workers `parmar-ai` and `brvin-service`.

This is a live-resource status record, not deployment configuration. Update it whenever a resource, binding, database schema or release changes.

## 1. Production application Worker

| Field | Verified value |
|---|---|
| Worker | `brvin-teachers` |
| Worker resource ID | `e0ccfe8aed524e119f91ab5f784bf5be` |
| Public URL | `https://brvin-teachers.thenewtongs.workers.dev` |
| Production version | `961500a1-462f-46aa-9fc6-6d02fdafc09a` |
| Deployment ID | `ed86feab-8ea8-47ec-ac98-4c460ecb90d6` |
| Deployed | `2026-11-06T05:57:03.276918Z` |
| Release | [GitHub Actions #42171352464](https://github.com/ashini-x/brvin-teachers/actions/runs/42171352464) |
| Compatibility date | `2026-11-06` |
| Observability | Enabled; invocation logs persisted; query strings redacted |
| Preview URLs | Disabled |
| D1 binding | `DB` → `brvin-teachers-app` (live and verified) |
| Management binding | `BRVIN_MANAGEMENT` → service `parmar-ai`, entrypoint `BrvinTeachersManagementApi` (live and verified) |
| Retrieval binding | `BRVIN_SERVICE` → `brvin-service` / `BrvinRetrievalApi` (not yet configured) |
| Custom domains/routes | None |

The protected Operator Console is served at `/operator`; public `/health` is non-sensitive. The release workflow applied application D1 migrations, deployed the Worker, passed public health and confirmed Cloudflare Access protects the operator route.

The live Worker settings show the `BRVIN_MANAGEMENT` Service Binding and `DB` D1 binding. The management entrypoint is deployed to the existing `parmar-ai` Worker. The consumer binding's configured `applicationEnvironmentId` remains the non-UUID placeholder `BRVIN_TEACHERS_ENVIRONMENT_ID_REQUIRED` in source, so Core authorization deliberately fails closed until the real ID is registered and released.

Cloudflare Access application **BRVIN Teachers Operator Console** protects `brvin-teachers.thenewtongs.workers.dev/operator*` using its configured operator allow policy. The production release smoke check verified that the protected path requires Access identity.

## 2. Application D1

| Field | Verified value |
|---|---|
| Database | `brvin-teachers-app` |
| Database ID | `e1d4c754-7b89-45d0-9ee0-e8c0049a5ebf` |
| Created | 6 November 2026 |
| Location hint | APAC |
| Migration | `0001_operator_foundation.sql` applied by the production release |
| Live tables confirmed | `id_sequences`, `teachers`, `tenant_brvin_projects`, `operator_audit_events`, plus D1 system tables |
| Current teacher rows | 0 |
| Current Core-project mappings | 0 |

This database owns tenant profiles, tenant references, the app-to-BRVIN project mapping and application/operator metadata. It must never contain copies of source PDFs, OCR output, indexed passages or BRVIN grants. No teacher record has been seeded.

## 3. Existing BRVIN dependencies

The same Cloudflare account contains:
- `parmar-ai` — existing control/admin and ingestion Worker, now also hosting the separate named `BrvinTeachersManagementApi` entrypoint.
- `brvin-service` — private retrieval Worker exposing the frozen `BrvinRetrievalApi`.

The paired Core release [#42171109140](https://github.com/ashini-x/parmar-ai/actions/runs/42171109140) passed validation, deployed both existing Workers, and passed live root/health/private BRVIN/Fatman smoke acceptance.

Current Core versions:
- `parmar-ai`: `a6febaa0-7b2e-4387-878b-d4a63d16fb8f`, deployment `f1072878-ee8e-4bec-9872-965816358f03`.
- `brvin-service`: `72760779-3e3a-4a53-ad15-23b2a621a444`, deployment `2d812a4f-569f-484b-983d-dfaedd8c016f`.

The private retrieval API and v2 methods were not changed by the management release.

## 4. Production BRVIN application registration

A read-only query against the production Core D1 registry returned no application row with slug `brvin-teachers` and no child environment row. The management entrypoint therefore rejects this consumer until registration is completed.

Register in BRVIN Admin:
- Application slug: `brvin-teachers`
- Application name: `BRVIN Teachers`
- Repository: `https://github.com/ashini-x/brvin-teachers`
- Default branch: `main`
- Runtime: Cloudflare Workers
- Production environment key: `production`
- Display name: `BRVIN Teachers Production`
- Worker name: `brvin-teachers`
- Worker URL: `https://brvin-teachers.thenewtongs.workers.dev`

After BRVIN Admin creates the environment, replace `BRVIN_TEACHERS_ENVIRONMENT_ID_REQUIRED` in the deployment-controlled `BRVIN_MANAGEMENT` binding props with the generated UUID and ship the normal GitHub Actions release. Do not supply this identity from browser state or HTTP input.

## 5. CI/CD and deployment authority

- GitHub Actions is the sole release authority for this Worker.
- Pull requests run `npm ci`, tests, production build and deployment dry-run without production credentials.
- Main releases apply checked-in application D1 migrations, build/deploy the Worker and run public health and Access-protection smoke checks.
- Production Cloudflare credentials are stored in the GitHub `production` Environment, not in this repository.
- Release #42171352464 is the first deployed classroom/source-management release and passed all required steps.

## 6. Next setup sequence

1. Register `brvin-teachers` and its production environment in BRVIN Admin using the exact Worker name/URL above.
2. Replace the `BRVIN_MANAGEMENT` environment-ID placeholder with the generated UUID and deploy the consumer config.
3. Verify `BRVIN_MANAGEMENT.health()` returns ready.
4. Add the separate private `BRVIN_SERVICE` binding to `brvin-service` / `BrvinRetrievalApi` using that deployment-controlled environment UUID; implement/verify the typed v2 retrieval adapter.
5. Create the actual teacher/classroom/collection/source only after the management binding is active and an approved source is available.
6. Verify useful retrieval with physical PDF page provenance, then revoke the grant and verify subsequent retrieval is denied before any student traffic.

Students, channels, model workflows and student authentication remain unimplemented. No production teacher, project, collection, source, grant or student has been created.
