# Repository Guide — Coordinating BRVIN Teachers and BRVIN Core

**Last reviewed:** 12 November 2026  
**Application repository:** ashini-x/brvin-teachers  
**Core repository:** ashini-x/parmar-ai

## 1. Why there are two repositories

The repositories represent separate product and trust boundaries, not two copies of one codebase.

| Concern | Owner |
|---|---|
| BRVIN Teachers tenant, student, channel and session identities | brvin-teachers |
| Teacher profiles, configuration and feature entitlements | brvin-teachers |
| Application AI orchestration and final answer | brvin-teachers |
| Shared teaching modules and channel adapters | brvin-teachers |
| BRVIN Teachers Operator Console | brvin-teachers |
| Teacher knowledge projects, collections and source registry | BRVIN in parmar-ai |
| PDF ingestion, private storage, OCR, indexing and readiness | BRVIN in parmar-ai |
| Application/environment registration and app-project grants | BRVIN in parmar-ai |
| Private retrieval, quotas, audit and connection proof | BRVIN in parmar-ai |
| Existing Parmar AI, Fatman and AskMoina production behavior | parmar-ai |

BRVIN Teachers is a downstream consumer of BRVIN v2. It is not a BRVIN subsystem or a replacement for Parmar AI.

## 2. Mandatory reading order for a new session

### In this repository

1. AGENTS.md
2. README.md
3. docs/REPOSITORY_GUIDE.md
4. docs/ARCHITECTURE.md
5. docs/DEVELOPMENT_PLAN.md
6. docs/IDENTIFIER_POLICY.md when working on tenant, project, collection or source identity/reference handling.
7. docs/OPERATOR_CONSOLE_DESIGN.md when working on the Operator Console, tenant workspace, admin UX or BRVIN management handoff.
8. docs/BRVIN_MANAGEMENT_INTEGRATION.md when implementing classroom, collection, source, upload, Core management or cross-repository handoff.
9. The relevant contract, security, operations or decision document.
10. docs/BRVIN_RETRIEVAL_PROVIDER_COMPATIBILITY.md for any Core retrieval provider, indexing, source-progress UI or v2 consumer compatibility work.

### In ashini-x/parmar-ai

1. docs/BRVIN_2_MASTER_PLAN.md — canonical current BRVIN state and continuation.
2. docs/BRVIN_2_PRODUCT_SCOPE_AND_FINAL_MILESTONES.md — approved BRVIN scope and milestone acceptance.
3. docs/BRVIN_SYSTEM_REFERENCE.md — as-built infrastructure and trust boundaries.
4. docs/BRVIN_2_RPC_V2_CONTRACT.md — frozen v2 contract.
5. docs/BRVIN_INTEGRATION_GUIDE.md — same-account consumer setup and verification.
6. docs/BRVIN_2_ARCHITECTURE_DECISIONS.md — accepted core decisions.
7. docs/BRVIN_ADMIN_RUNBOOK.md when registering BRVIN Teachers application/environment or operating knowledge ingestion.
8. The relevant BRVIN admin or operations runbook.

The master plan identifies the canonical active references. If a link or path changes, inspect the current documentation index rather than reviving old milestone drafts or superseded proposals.

## 3. Rules for cross-repository changes

A normal BRVIN Teachers feature should stay in this repository.

A cross-repository change is required only when the feature depends on a BRVIN-owned contract or capability that does not already exist. In that case:

1. Identify the missing capability and why the existing contract cannot satisfy it.
2. Inspect the current implementation and frozen contract in parmar-ai.
3. Propose the smallest backward-compatible BRVIN change.
4. Implement and test the BRVIN change in a separate branch/PR in parmar-ai.
5. Coordinate the consumer update in this repository against the exact contract revision.
6. Validate both sides, including authorization, failure and revocation behavior.
7. Update the canonical docs in both repositories.
8. Deploy in the sequence required by the compatibility plan; do not deploy an incompatible consumer first.

Never use a BRVIN core change as a shortcut for missing tenant authorization in the consumer. BRVIN app-project grants are application-wide; this application must still enforce the authenticated student's server-side tenant/project mapping.

For the approved provider migration, use the Core plan [BRVIN_RETRIEVAL_PROVIDER_MIGRATION.md](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_RETRIEVAL_PROVIDER_MIGRATION.md) as the backend source of truth and this repository's [BRVIN_RETRIEVAL_PROVIDER_COMPATIBILITY.md](BRVIN_RETRIEVAL_PROVIDER_COMPATIBILITY.md) for UI/consumer acceptance. The unified retrieval target includes theory, formulas, worked examples and numerical problems in one math-aware hybrid path. Do not start consumer-side Qdrant, Vertex, embedding or formula-indexing integration.

**Current provider-migration checkpoint — 12 November 2026:** Core M13 is merged; M14 is complete only as a scoped non-production Vertex/Qdrant pilot. M15 remains **IN PROGRESS**. The eight-page second Physics source is isolated to Core staging. Its paired 17-query retrieval / 34-generation OCR-only evaluation, five-query/ten-generation original-PDF-assisted notation audit and 109-candidate owner-waived AI passage assessment are complete. The AI assessment is not independent human qrels; original human-review fields remain blank. Core PR [#234](https://github.com/ashini-x/parmar-ai/pull/234) added a protected staging action that calls the real Core `retrieveBrvinForApplicationV2` path with a query-only Qdrant/Vertex override. Core PR [#235](https://github.com/ashini-x/parmar-ai/pull/235) merged D1 receipt persistence and tests. The action is deployed but not yet run; live wrong-project/no-grant, revoked-grant denial while vector points remain and quota behavior are still unaccepted. The receipt schema is created lazily during the first operator action, so its absence before that run is expected.

The one-time operator action belongs only in Core: open the [M14 staging operator](https://parmar-ai-m14-staging.thenewtongs.workers.dev/admin/m14), enter the existing `BRVIN_M14_ADMIN_TOKEN` into its password field locally, and click **Run Core v2 Qdrant authorization + revocation proof** once. Never paste the token into chat or GitHub. Follow [the Core runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_V2_AUTHORIZATION_STAGING_RUNBOOK.md); Core can read the saved D1 receipt afterward.

Core production `parmar-ai` and `brvin-service` are both at 100% and still select `cloudflare-ai-search`; neither has production Qdrant/Vertex bindings. Their current versions are `5c55b8a6-151b-4d21-8748-30d221507923` and `e59d976e-07ba-4974-b1bd-56a9a48e5555`. Isolated Core staging Worker is `ffbaa06f-e2ca-46e4-8e82-7516c6738555` at 100%. Teachers remains on Worker `68d6694c-6371-4cae-8a25-4af40ca15706` at 100%, with only its private `BRVIN_MANAGEMENT` and `BRVIN_SERVICE` bindings plus Teachers D1. No Teachers code, contract, configuration, runtime or deployment change is needed for this Core-only gate.

After a green v2 receipt, Core M15 continues with broader multi-document formula/mixed-query grounding, throttling/retry/recovery, HNSW-aware representative load, repeatable latency/throughput/cost and rollback rehearsal. M16 consumer/admin parity and M17 canary/14-day soak remain later gates. Preserve the frozen v2 contract and do not add Qdrant/Vertex SDKs, credentials, embeddings, provider routing or Core data access to Teachers.
## 4. Session handoff and status discipline

At the start of every session, establish:
- current commit and branch in both repositories;
- whether there are uncommitted changes or open PRs relevant to the task;
- latest CI and production deployment status;
- exact task and acceptance criteria;
- which repository is expected to change.

After each accepted change, update documentation in the same PR. The top-level README should remain a concise current index, not an append-only diary.

Do not infer that an implementation is deployed because it exists on main; do not infer that deployment is healthy because CI passed. Record code, CI, deployment and production verification separately.

## 5. Canonical external references

- [BRVIN Teachers architecture in core planning docs](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_TEACHERS_ARCHITECTURE.md)
- [BRVIN Teachers identifier policy](https://github.com/ashini-x/brvin-teachers/blob/main/docs/IDENTIFIER_POLICY.md)
- [BRVIN core master plan](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_2_MASTER_PLAN.md)
- [BRVIN system reference](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_SYSTEM_REFERENCE.md)
- [BRVIN frozen RPC v2 contract](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_2_RPC_V2_CONTRACT.md)
- [BRVIN integration guide](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_INTEGRATION_GUIDE.md)
- [BRVIN Admin runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_ADMIN_RUNBOOK.md)
- [BRVIN Operations runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_OPERATIONS_RUNBOOK.md)


## 6. Current management handoff

Consumer PR #2 and Core PR #107 are merged and deployed; consumer PR #4 / release #42174893189 deployed tenant-scoped project/retrieval helpers and the content-free probe. BRVIN Admin registered the active `brvin-teachers` Production environment. Consumer PR #5 / release #42181732210 deployed both private Service Bindings with the generated trusted environment ID and pinned BRVIN connector; the one-time proof is accepted. Consumer PR #8 / release #42403048998 deployed the persistent five-stage source progress stepper using the existing tenant-scoped Core status RPC. The current Teachers production Worker is version `68d6694c-6371-4cae-8a25-4af40ca15706` (CI/CD run #59, 100% traffic). The existing teacher profile is real; do not create duplicates. The Physics source is READY at 3/3 indexed pages in Core; the M11 real-consumer retrieval test returned relevant evidence with physical PDF page-2 citations, access revocation produced Not Authorised, and retrieval worked again after the grant was restored. These existing acceptance checks do not constitute M14 Qdrant retrieval acceptance. No student channel/model/authentication flow exists yet. Read [BRVIN_MANAGEMENT_INTEGRATION.md](BRVIN_MANAGEMENT_INTEGRATION.md) and [BRVIN_V2_INTEGRATION.md](BRVIN_V2_INTEGRATION.md) before changing either side.


## Core M15 checkpoint — 11 November 2026

The protected Core M15 paired shadow runner has merged in Core PR #209 and is deployed to staging Worker v79 (100%). It is exposed on the existing M14 operator page as **Run AI Search vs Qdrant shadow benchmark**. The route is admin-token protected, source-confirmed, source-filtered and read-only. The 12-case receipt is pending. No direct AI Search/Qdrant/Vertex access, code, secrets or bindings have been added to BRVIN Teachers; preserve the private BRVIN v2 contract, tenant/project mapping and Teacher Operator Console unchanged.

## Core M15 shadow receipt — 11 November 2026

Core's first 12-case paired receipt has been captured. Qdrant covered all 11 expected page targets and had higher page MRR, but it returned five candidates on each of two no-match queries; AI Search returned zero on both. Core's page-label scorecard was corrected in PR #211 and is deployed to staging Worker v80. These are page-level proxies, not independent passage qrels or answer-abstention evidence. The production provider remains AI Search. No Teachers runtime, v2 contract, Operator Console or provider binding changed.



## Core M15 second-source staging checkpoint — 11 November 2026

Core now has a separate staging-only operator at https://parmar-ai-m14-staging.thenewtongs.workers.dev/admin/m15/benchmark for the generated eight-page Physics benchmark source. See the Core runbook at https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_SECOND_SOURCE_BENCHMARK.md before using it. The PDF must not be uploaded through this Teachers repository or any Teachers production tenant/project/collection. The separate test-card PDF is evaluation-only and must not be indexed.

Core staging Worker v82 contains the new benchmark-specific AI Search binding and Qdrant collection. Teachers remains on its current production Worker and private BRVIN v2 binding; no runtime, contract, upload/index flow, tenant/project mapping, auth, D1, or secrets were changed. Keep Qdrant and Vertex dependencies/credentials out of Teachers. The 17-query run is Core retrieval-only and does not test the Teachers-owned Gemini answer/abstention path.


## Core M15 current status — 12 November 2026

The latest authoritative status and technical acceptance sequence are in the Core [master plan](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_2_MASTER_PLAN.md) and [provider migration plan](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_RETRIEVAL_PROVIDER_MIGRATION.md). The second eight-page benchmark source and its OCR/corpus/index artifacts remain isolated to Core staging. Paired retrieval and OCR-only answer evaluation, bounded PDF-assisted notation audit and the owner-waived AI passage assessment are complete; the AI labels are not independent human qrels and do not prove multi-document claim grounding.

Core PR #234 deployed the protected query-only v2 Qdrant/Vertex authorization path to isolated staging. Core PR #235 merged receipt persistence and focused tests. The route still needs its one-time authenticated operator run. The read-only D1 receipt table is created lazily when the handler starts; a pre-run missing-table response is expected. The action checks a real authorized v2 retrieval, wrong-project/no-grant denial before quota, revoked-grant denial while Qdrant vectors remain, unchanged quota for denied requests, vector retention and restoration of the staging grant. See the [Core runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_V2_AUTHORIZATION_STAGING_RUNBOOK.md).

Core's remaining M15 work after that receipt: broader mixed-content/formula and claim-grounding evidence, retry/recovery/throttling, HNSW-aware load, repeatable Worker-side latency/throughput and full cost accounting, and rollback rehearsal. Production remains on Cloudflare AI Search. M16 is the later coordinated UI/consumer compatibility milestone; M17 is the controlled canary and 14-day soak. Teachers remains a private v2 consumer only: keep the two Core service bindings, tenant/project mapping, source/page citations and existing Operator Console. Do not add provider SDKs, keys, embeddings or provider-specific routes to this repository. No Teachers runtime or deployment change is part of M15.
