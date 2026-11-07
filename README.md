# BRVIN Teachers

**Status:** Production application/environment registered and private connection proof accepted; one real Physics project, collection and 3-page source exist; source indexing is failed pending OCR-output investigation. Student/channel/model runtime remains deferred  
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
- [x] Private `BRVIN_MANAGEMENT` Service Binding is deployed from `brvin-teachers` to `parmar-ai` / `BrvinTeachersManagementApi`.
- [x] Core ownership/reference metadata migration and management entrypoint are deployed in `parmar-ai`; existing GCS/Vision/Workflow ingestion is reused.
- [x] Register the `brvin-teachers` application and active production environment in BRVIN Admin.
- [x] Deploy both private bindings with the BRVIN-generated Production identity: `BRVIN_MANAGEMENT` → `parmar-ai` / `BrvinTeachersManagementApi` and `BRVIN_SERVICE` → `brvin-service` / `BrvinRetrievalApi` (PR #5, release #42181732210).
- [x] BRVIN Admin accepted the Production environment's one-time private connection proof; the registry reports `connected`.
- [x] Deploy the pinned BRVIN connector with deadline, response-size and no-automatic-retry handling (upstream commit `91b6a499bd782ae298b41e790157c23682f10881`).
- [ ] Confirm the Operator Console's live management-health indicator during the next authenticated operator session.
- [ ] Recover the existing Physics source: Vision reported completion, but the expected first-page OCR JSON object is missing from the registered GCS prefix. Inspect the operation destination and object inventory before any retry or re-OCR.
- [ ] Select the first student channel, define authentication and operating-cost limits, then implement student/channel/model workflows.

The protected Operator Console and tenant D1 foundation are deployed. Consumer main release [#42181732210](https://github.com/ashini-x/brvin-teachers/actions/runs/42181732210) deployed both private BRVIN bindings and the pinned v2 connector. The live Worker is version `f0942e0a-49f0-468f-b59c-e58d6eb7c16b` (deployment `73699f1d-f9da-4fe4-90bb-77bebc0daf64`, 100% traffic). The real teacher workspace and active BRVIN Production identity (`515e7752-20ff-42f9-b393-7c8130a64bf8`) exist, and the one-time private proof was accepted on 6 November 2026. App D1 has one teacher and one active Core-project mapping (`TCH-000001-PRJ-001`). Core has one active Physics project, one collection and one 3-page source (`TCH-000001-PRJ-001-COL-001-SRC-001`). The source is currently `failed` with 0/3 pages indexed because the expected first-page Vision OCR JSON object was not found; do not re-upload or resume until the Core operation destination and GCS prefix are inspected. No student records or student-facing channel/model runtime exist. See [BRVIN management integration](docs/BRVIN_MANAGEMENT_INTEGRATION.md) and [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md).

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

## Working principle

**One shared application platform; many isolated teacher experiences; one central operator console; BRVIN remains the knowledge authority.**

Start with a real pilot and the smallest complete, secure experience. Prefer tenant configuration and reusable modules over per-teacher code copies, Workers, databases or repositories. Keep documentation synchronized with accepted code and infrastructure changes.
