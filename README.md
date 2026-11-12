# BRVIN Teachers

**Status (13 November 2026):** M11 real-consumer acceptance remains COMPLETE. Core M13 is merged; M14 is complete only as a scoped non-production Vertex/Qdrant Physics pilot. Core M15's existing evaluation/assessment work and live authorization/revocation subgate are complete with documented limitations (the 109 AI-assessed candidates are not independent human qrels). Core PRs #237/#238/#241 are merged. The corrected protected two-source Prepare action has now passed: the isolated project has exactly two mapped READY sources (8/8 and 3/3 pages), the second source has 7 Qdrant points and 3 completed AI Search page items, and the operator reported `authorizedReadySourceCount=2` with no prohibited side effects. Independent read-only checks confirm all three exact AI Search items are `completed`, no paired-evaluation receipt exists yet, and November query usage remains one. The next Core-only staging action is the five-case paired v2 evaluation (ten staging query reservations); Teachers itself needs no code, contract, binding or deployment change. Teachers remains a private v2 consumer with no Qdrant/Vertex access; its Operator Console, five-stage upload/progress, page map, READY gating and citations are unchanged. Core production, `brvin-service` and Teachers production remain on their existing 100% versions; Core production continues to use Cloudflare AI Search. M15 overall remains open.
**Repository:** ashini-x/brvin-teachers  
**Product role:** Multi-tenant teacher application platform and downstream BRVIN v2 consumer

BRVIN Teachers is a separate application platform for operating teacher-specific AI teaching experiences across supported channels. It owns its own tenant, student, channel and application-runtime concerns. It uses the existing BRVIN platform for governed teacher knowledge and private retrieval.

It is **not BRVIN core**, does not replace the existing Parmar AI application, and does not move BRVIN's current production infrastructure out of ashini-x/parmar-ai.

## Two repositories, two responsibilities

| Repository | Responsibility |
|---|---|
| [ashini-x/brvin-teachers](https://github.com/ashini-x/brvin-teachers) | New downstream application: tenant/student/channel identities, teacher configuration, AI orchestration, reusable teaching features, operator console and application operations |
| [ashini-x/parmar-ai](https://github.com/ashini-x/parmar-ai) | Existing Parmar AI application and BRVIN core/admin/ingestion/private retrieval implementation |

The current BRVIN contract and production facts remain authoritative in parmar-ai. This repository documents how the new consumer must use them; it must not create a competing copy of BRVIN's knowledge registry, source ingestion or retrieval authorization.

## Current status

- [x] Separate public repository and two-repository architecture established.
- [x] Shared Worker, Cloudflare Access and GitHub Actions deployment path verified.
- [x] Application D1 and tenant/audit schema deployed; one real teacher profile and one active Core-project mapping are present.
- [x] Protected Operator Console deployed: teacher directory/search, custom-name creation, generated UUID/reference, workspace overview and rename.
- [x] Classroom/project, collection/bookshelf and source/PDF workflows are deployed in the protected Operator Console.
- [x] Persistent five-stage PDF progress stepper deployed: secure upload, Vision OCR, page indexing, retrieval quality checks and Ready; reopening a source fetches persisted Core status and displays exact stage errors.
- [x] Private `BRVIN_MANAGEMENT` Service Binding is deployed from `brvin-teachers` to `parmar-ai` / `BrvinTeachersManagementApi`.
- [x] Core ownership/reference metadata migration and management entrypoint are deployed in `parmar-ai`; existing GCS/Vision/Workflow ingestion is reused.
- [x] Register the `brvin-teachers` application and active production environment in BRVIN Admin.
- [x] Deploy both private bindings with the BRVIN-generated Production identity: `BRVIN_MANAGEMENT` → `parmar-ai` / `BrvinTeachersManagementApi` and `BRVIN_SERVICE` → `brvin-service` / `BrvinRetrievalApi` (PR #5, release #42181732210).
- [x] BRVIN Admin accepted the Production environment's one-time private connection proof; the registry reports `connected`.
- [x] Deploy the pinned BRVIN connector with deadline, response-size and no-automatic-retry handling (upstream commit `91b6a499bd782ae298b41e790157c23682f10881`).
- [ ] Confirm the Operator Console's live management-health indicator during the next authenticated operator session.
- [x] Verify the existing Physics pilot PDF is READY with 3/3 indexed pages and all three page-map tiles green; no re-upload or re-OCR was needed.
- [x] Verify useful semantic retrieval through the protected production BRVIN v2 Service Binding; the 8 November 2026 operator result returned two relevant passages citing physical PDF page 2 (displayed scores 0.993 and 0.960).
- [x] Revoke BRVIN Teachers Production's access to Physics and confirm the consumer displays **Not Authorised** on a subsequent request.
- [x] Restore Physics access and confirm the same consumer answers again.
- [ ] Select the first student channel, define authentication and operating-cost limits, then implement student/channel/model workflows.

The protected Operator Console, tenant D1 foundation and both private BRVIN bindings are deployed. Consumer PR [#10](https://github.com/ashini-x/brvin-teachers/pull/10) / release [#42417513862](https://github.com/ashini-x/brvin-teachers/actions/runs/42417513862) deployed automatic PDF page-count detection and the per-page status map inside the existing progress dialog; validation, tests, production build, deployment, public health and Access-protection smoke checks passed. The latest verified Teachers production push remains CI/CD run [#59](https://github.com/ashini-x/brvin-teachers/actions/runs/42423395691), with Worker version `68d6694c-6371-4cae-8a25-4af40ca15706` at 100%; this M14 update is Core-only and does not require another Teachers deploy. Core M14 staging Worker `parmar-ai-m14-staging` is version `5bb5c0af-6c11-4157-8f67-838a9e418866` at 100%. The ten positive Qdrant hybrid queries returned all 11/11 expected page references in top five. Strict expected-page-label precision@5 is 0.40 and first-expected-page MRR is 0.8333; these are page-label diagnostics rather than human chunk-level relevance judgments. Core PR #176 adds the metrics to future receipts. The two negative/no-answer cases and the remaining formula-fidelity, security/isolation and performance gates are still pending. Core production release validation #1004 passed, with `parmar-ai` version `5a11c524-db32-4ee1-b74f-edfbaaaa8c37` and `brvin-service` version `66c26c42-697f-4e80-ac5b-113553bd467f`, both 100%; both still use Cloudflare AI Search and production corpus-manifest writes remain disabled. App D1 has one active teacher/project mapping (`TCH-000001-PRJ-001`). Core has the active Physics project, the Newton's Laws teacher-notes collection and the 3-page source `TCH-000001-PRJ-001-COL-001-SRC-003`. Production D1 confirms the source is `ready`, with `page_count=3` and `indexed_pages=3`; the Operator screenshot shows all three page-map tiles green. Useful v2 semantic retrieval with correct source title, relevant passage text and physical PDF page provenance has passed. The operator then revoked Physics access and confirmed Not Authorised; after restoring access, the same consumer answered again. The real-consumer M11 acceptance is complete. No student records or student-facing channel/model runtime exist. See [BRVIN management integration](docs/BRVIN_MANAGEMENT_INTEGRATION.md), [temporary retrieval test runbook](docs/RETRIEVAL_TEST_RUNBOOK.md) and [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md).

## Start here

1. [Repository guide](docs/REPOSITORY_GUIDE.md) — two-repository workflow and required reading.
2. [Architecture](docs/ARCHITECTURE.md) — product boundaries, tenant model and target topology.
3. [Development plan](docs/DEVELOPMENT_PLAN.md) — phases and release gates.
4. [Pilot brief](docs/PILOT_BRIEF.md) — current real teacher-led Physics onboarding and Phase 0 decisions.
5. [BRVIN v2 integration](docs/BRVIN_V2_INTEGRATION.md) — exact consumer contract and trust boundary.
6. [Identifier policy](docs/IDENTIFIER_POLICY.md) — approved hierarchical human-readable references for tenants, projects, collections and sources.
7. [BRVIN management integration](docs/BRVIN_MANAGEMENT_INTEGRATION.md) — private Core management binding, operations and release/activation steps.
8. [Operator Console design](docs/OPERATOR_CONSOLE_DESIGN.md) — custom teacher names, workspaces, automatic identities and the approved ChatGPT-inspired dark UI direction.
9. [Security](docs/SECURITY.md) — identity, isolation, secrets and evidence handling.
10. [Operations](docs/OPERATIONS.md) — CI/CD, release, logging and recovery.
11. [Architecture decisions](docs/DECISIONS.md) — accepted decisions and deferred questions.
12. [Agent instructions](AGENTS.md) — mandatory instructions for coding assistants.
13. [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md) — actual provisioned resources and remaining setup.
14. [Temporary retrieval test runbook](docs/RETRIEVAL_TEST_RUNBOOK.md) — one-request, Access-protected live passage/page verification.
15. [Retrieval provider compatibility](docs/BRVIN_RETRIEVAL_PROVIDER_COMPATIBILITY.md) — preserve the current Operator Console, five-stage upload, per-page map and v2 consumer while Core modernizes retrieval behind the API.

## Working principle

**One shared application platform; many isolated teacher experiences; one central operator console; BRVIN remains the knowledge authority.**

**Retrieval-provider migration rule:** BRVIN Core owns Vertex AI embeddings and Qdrant, using one unified math-aware hybrid retrieval path for theory, formulas, worked examples and numerical problems. This app continues using the private v2 binding and its existing answer workflow. No direct Qdrant/Vertex/formula-indexing access or admin UI redesign is permitted. The current AI Search production path remains active until the Core M12–M17 gates pass.

Start with a real pilot and the smallest complete, secure experience. Prefer tenant configuration and reusable modules over per-teacher code copies, Workers, databases or repositories. Keep documentation synchronized with accepted code and infrastructure changes.
