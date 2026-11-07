# Cloudflare Infrastructure Status

**Last verified:** 8 November 2026  
**Repository:** `ashini-x/brvin-teachers`  
**Account relationship:** Same Cloudflare account that contains the existing BRVIN Workers `parmar-ai` and `brvin-service`.

This is a live-resource status record, not deployment configuration. Update it whenever a resource, binding, database schema or release changes.

## 1. Production application Worker

| Field | Verified value |
|---|---|
| Worker | `brvin-teachers` |
| Worker resource ID | `e0ccfe8aed524e119f91ab5f784bf5be` |
| Public URL | `https://brvin-teachers.thenewtongs.workers.dev` |
| Production version | `7719a4fb-9711-4181-ab67-4326cc146b9d` |
| Deployment ID | `c9b12c36-8080-45c8-877c-bbd939edff7a` |
| Deployed | `2026-11-07T21:48:02.091428Z` |
| Release | [GitHub Actions #42417513862](https://github.com/ashini-x/brvin-teachers/actions/runs/42417513862) |
| Compatibility date | `2026-11-06` |
| Observability | Enabled; invocation logs persisted; query strings redacted |
| Preview URLs | Disabled |
| D1 binding | `DB` → `brvin-teachers-app` (live and verified) |
| Management binding | `BRVIN_MANAGEMENT` → service `parmar-ai`, entrypoint `BrvinTeachersManagementApi` (deployed with active registered Production identity; authenticated UI health indicator still to be checked) |
| Retrieval binding | `BRVIN_SERVICE` → `brvin-service` / `BrvinRetrievalApi` (deployed with active registered Production identity; one-time proof accepted 6 November 2026) |
| Custom domains/routes | None |

The current deployed Worker version includes both private Service Bindings configured with the BRVIN-generated Production identity, the five-stage source progress stepper, automatic page-count handling for new BRVIN Teachers uploads and the per-page map inside the same scrollable progress dialog. PR #10 / release #42417513862 deployed this feature; tests, production build, dry-run, D1 migration step, public health and Access-protection checks all passed. The page map is rendered below the five-stage stepper and reads BRVIN Core's saved per-page status snapshot; it does not trigger its own AI Search scans. BRVIN Admin accepted the one-time private retrieval proof on 6 November 2026; a read-only registry check on 7 November confirmed the environment remains `active` and its latest proof status is `connected`. The proof snapshot recorded zero ready sources because it preceded creation of the Physics project and source. It does not establish source readiness or student retrieval acceptance.

The protected Operator Console is served at `/operator`; public `/health` is non-sensitive. The release workflow applied application D1 migrations, deployed the Worker, passed public health and confirmed Cloudflare Access protects the operator route.

The live Worker settings show `BRVIN_MANAGEMENT` → `parmar-ai` / `BrvinTeachersManagementApi` and `BRVIN_SERVICE` → `brvin-service` / `BrvinRetrievalApi`, alongside the existing `DB` binding. Production release [#42181732210](https://github.com/ashini-x/brvin-teachers/actions/runs/42181732210) deployed the generated trusted environment identity on both bindings. The one-time retrieval proof was subsequently accepted. The separate management-health badge still requires an authenticated visual check.

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
| Current teacher rows | 1 (`TCH-000001`, the real teacher workspace shown in the Operator Console) |
| Current Core-project mappings | 1 (`TCH-000001-PRJ-001`, Physics) |

This database owns tenant profiles, tenant references, the app-to-BRVIN project mapping and application/operator metadata. It must never contain copies of source PDFs, OCR output, indexed passages or BRVIN grants. One real teacher profile (`TCH-000001`) and one active Physics project mapping (`TCH-000001-PRJ-001`) are present. Core, not this database, remains authoritative for project/collection/source records and grants.

## 3. Existing BRVIN dependencies

The same Cloudflare account contains:
- `parmar-ai` — existing control/admin and ingestion Worker, now also hosting the separate named `BrvinTeachersManagementApi` entrypoint.
- `brvin-service` — private retrieval Worker exposing the frozen `BrvinRetrievalApi`.

The paired Core release [#42417392419](https://github.com/ashini-x/parmar-ai/actions/runs/42417392419) passed typecheck, full tests, Node tests, both Worker dry-runs, paired deployment, root/health, private BRVIN connectivity and Fatman source-readiness smoke acceptance. Read-only Cloudflare account verification confirms the consumer and both Core Workers are in account `b34a6c0b7221454c5db977fe61ddf759`. The `brvin-service` workers.dev subdomain is disabled and its Worker script has no public routes.

Current Core versions (8 November 2026):
- `parmar-ai`: `5eead825-46cb-4122-a351-634865696142`, deployment `045e0ef6-12cc-44fd-bc72-f0e4bec9940e`.
- `brvin-service`: `5ad1f448-1700-4e06-abdc-0b39287b89b8`, deployment `e04a9792-941b-4d64-bed0-02bfea96d53c`.

The private retrieval API and v2 methods were not changed by the management release.

## 4. Production BRVIN application registration

BRVIN Admin registration is complete. The active application and Production environment are:

| Field | Value |
|---|---|
| Application | `BRVIN Teachers` (`brvin-teachers`) |
| Application ID | `6f97e2a7-0c5a-4a1c-a318-03977c4cec37` |
| Environment | `Production` (`production`) |
| Environment ID | `515e7752-20ff-42f9-b393-7c8130a64bf8` |
| Worker | `brvin-teachers` |
| Worker URL | `https://brvin-teachers.thenewtongs.workers.dev` |
| Registry status | Active |

The actual target Worker and Core Workers are in Cloudflare account `b34a6c0b7221454c5db977fe61ddf759`; this was verified through the authenticated Cloudflare account connection and matches BRVIN's account ID in the handoff. `brvin-service` has its workers.dev subdomain disabled and no public route. Production release #42181732210 now includes both private Service Bindings with this exact trusted environment ID. Do not supply it from browser state or HTTP input.

## 5. CI/CD and deployment authority

- GitHub Actions is the sole release authority for this Worker.
- Pull requests run `npm ci`, tests, production build and deployment dry-run without production credentials.
- Main releases apply checked-in application D1 migrations, build/deploy the Worker and run public health and Access-protection smoke checks.
- Production Cloudflare credentials are stored in the GitHub `production` Environment, not in this repository.
- Release #42171352464 is the first deployed classroom/source-management release and passed all required steps.
- Release [#42417513862](https://github.com/ashini-x/brvin-teachers/actions/runs/42417513862) deployed PR #10; version `7719a4fb-9711-4181-ab67-4326cc146b9d` is at 100% traffic via deployment `c9b12c36-8080-45c8-877c-bbd939edff7a`. The paired Core release #42417392419 has `parmar-ai` version `5eead825-46cb-4122-a351-634865696142` / deployment `045e0ef6-12cc-44fd-bc72-f0e4bec9940e` and `brvin-service` version `5ad1f448-1700-4e06-abdc-0b39287b89b8` / deployment `e04a9792-941b-4d64-bed0-02bfea96d53c`, each at 100% traffic.

## 6. Next setup sequence

1. The one-time Production proof is complete; registry status is `connected`. Its zero-ready-source snapshot predates the project and PDF that were created later.
2. Open the existing teacher workspace in the BRVIN Teachers Operator Console and visually confirm its independent management-health indicator.
3. Inspect the saved Vision operation response and exact temporary GCS output prefix for the existing 3-page Physics source. The first expected `output-1-to-1.json` object was not found; do not re-upload or resume indexing until the destination/prefix/object state is understood.
4. Recover indexing using the existing resumable Workflow path if the saved OCR output is intact; only consider a new OCR operation after confirming the output is unrecoverable and obtaining approval for any repeat Vision charge.
5. Verify `READY` with all 3 pages indexed, then complete useful v2 retrieval/provenance testing and grant-revocation denial. Student/channel/model workflows remain separate later gates.

The production teacher row, active Physics project mapping, Core project, teacher-notes collection, collection/project link, application-project grant and 3-page PDF source now exist. The existing Physics pilot source remains `failed`, with `indexed_pages=0` of 3: Vision reports operation completion, but the expected first-page output object is missing from the temporary OCR prefix. This feature does not retroactively rewrite that source's registered three-page count or retry its OCR/indexing; do not re-upload or resume it until the existing output-prefix issue is inspected and repeat OCR is explicitly approved. New BRVIN Teachers uploads no longer ask the operator for a page count: Core determines it from a complete Vision output inventory before page indexing begins. The original source record remains registered; no re-upload or retry has been performed. No student record, channel runtime, model workflow or student authentication has been created.
