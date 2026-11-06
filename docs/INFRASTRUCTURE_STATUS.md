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
| Production version | `5067ed6c-f8b7-47f8-afd0-59942422e6d4` |
| Deployment ID | `25bf26f3-afad-4bea-812c-e17d254e3ba2` |
| Deployed | `2026-11-06T06:31:26.715656Z` |
| Release | [GitHub Actions #42174893189](https://github.com/ashini-x/brvin-teachers/actions/runs/42174893189) |
| Compatibility date | `2026-11-06` |
| Observability | Enabled; invocation logs persisted; query strings redacted |
| Preview URLs | Disabled |
| D1 binding | `DB` → `brvin-teachers-app` (live and verified) |
| Management binding | `BRVIN_MANAGEMENT` → service `parmar-ai`, entrypoint `BrvinTeachersManagementApi` (declared in the pending activation PR; not yet live with the registered ID) |
| Retrieval binding | `BRVIN_SERVICE` → `brvin-service` / `BrvinRetrievalApi` (declared in the pending activation PR; not yet live) |
| Custom domains/routes | None |

The current deployed Worker version is the main-release baseline. The pending activation PR adds the generated BRVIN identity to both service bindings; do not record either binding as active with the new identity until the production release and live verification complete.

The protected Operator Console is served at `/operator`; public `/health` is non-sensitive. The release workflow applied application D1 migrations, deployed the Worker, passed public health and confirmed Cloudflare Access protects the operator route.

The live Worker currently has the management Service Binding and app D1 binding, but the deployed binding still carries the fail-closed placeholder from the preceding release. BRVIN Admin registration is now complete; this PR sets the generated trusted identity on both private Service Bindings. The Worker will not use the new identity until the PR is merged and the existing GitHub Actions production release succeeds.

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
| Current Core-project mappings | 0 |

This database owns tenant profiles, tenant references, the app-to-BRVIN project mapping and application/operator metadata. It must never contain copies of source PDFs, OCR output, indexed passages or BRVIN grants. No teacher record has been seeded.

## 3. Existing BRVIN dependencies

The same Cloudflare account contains:
- `parmar-ai` — existing control/admin and ingestion Worker, now also hosting the separate named `BrvinTeachersManagementApi` entrypoint.
- `brvin-service` — private retrieval Worker exposing the frozen `BrvinRetrievalApi`.

The paired Core release [#42171109140](https://github.com/ashini-x/parmar-ai/actions/runs/42171109140) passed validation, deployed both existing Workers, and passed live root/health/private BRVIN/Fatman smoke acceptance. Read-only Cloudflare account verification confirms the consumer and both Core Workers are in account `b34a6c0b7221454c5db977fe61ddf759`. The `brvin-service` workers.dev subdomain is disabled and its Worker script has no public routes.

Current Core versions:
- `parmar-ai`: `a6febaa0-7b2e-4387-878b-d4a63d16fb8f`, deployment `f1072878-ee8e-4bec-9872-965816358f03`.
- `brvin-service`: `72760779-3e3a-4a53-ad15-23b2a621a444`, deployment `2d812a4f-569f-484b-983d-dfaedd8c016f`.

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

The actual target Worker and Core Workers are in Cloudflare account `b34a6c0b7221454c5db977fe61ddf759`; this was verified through the authenticated Cloudflare account connection and matches BRVIN's account ID in the handoff. `brvin-service` has its workers.dev subdomain disabled and no public route. The pending consumer PR adds both private Service Bindings with this exact trusted environment ID. Do not supply it from browser state or HTTP input.

## 5. CI/CD and deployment authority

- GitHub Actions is the sole release authority for this Worker.
- Pull requests run `npm ci`, tests, production build and deployment dry-run without production credentials.
- Main releases apply checked-in application D1 migrations, build/deploy the Worker and run public health and Access-protection smoke checks.
- Production Cloudflare credentials are stored in the GitHub `production` Environment, not in this repository.
- Release #42171352464 is the first deployed classroom/source-management release and passed all required steps.

## 6. Next setup sequence

1. Merge and deploy the reviewed consumer binding/connector PR through the existing GitHub Actions pipeline.
2. Confirm the Operator Console's management health is ready and run **Applications → Production → Verify connection** in BRVIN Admin. Do not mark Connected manually.
3. Create the Physics knowledge project and collection from the existing real teacher workspace in BRVIN Teachers.
4. Upload the teacher-approved, legitimately licensed PDF. Wait for `READY` and full page indexing.
5. Verify source status and citations. Student retrieval acceptance, grant revocation denial and student/channel workflows remain separate later gates.

The production teacher row exists (one); no Core project mapping, BRVIN project, collection, PDF source, application-project retrieval grant or student has been created by this integration. Students, channels, model workflows and student authentication remain unimplemented.
