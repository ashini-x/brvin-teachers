# Repository Guide — Coordinating BRVIN Teachers and BRVIN Core

**Last reviewed:** 14 November 2026  
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
11. Read Core's docs/BRVIN_SCALE_AND_SEMANTIC_CACHE_PLAN.md when working on scale targets, semantic/exact caching, retrieval quotas, capacity, load testing or provider cost. It is the authority for those cross-repository requirements.
12. Read Core's docs/BRVIN_NEW_CHAT_CONTINUATION_PROMPT.md when resuming work in a fresh ChatGPT conversation; always verify its stated checkpoint against current GitHub and Cloudflare state.

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

**Current provider-migration checkpoint — 14 November 2026:** Core M13 is merged; M14 is complete only as a scoped non-production Vertex/Qdrant pilot. M15's live authorization/revocation (8/8), two-source Prepare and protected paired Core v2 staging evaluation after PR #247 have passed with documented limitations. The post-fix paired receipt `fa1b8076-9375-480b-bb4b-e22d1c13d9bb` confirms Qdrant 7/7 distinct expected source/page locations and 8/8 query-specific positive hits, including both MS03 M15 pages 2 and 3; AI Search has 7/7 distinct locations and 7/8 query-specific hits. Both providers have zero provenance violations and all seven structural/source/authorization/quota checks pass. Qdrant still returns three unrelated MN01 no-match candidates; AI Search returns none. The score-boundary fix is verified through the real Core v2 staging path, but M15 remains open for calibrated no-match/relevance gating, broader formula/claim grounding, recovery/throttling, representative HNSW-aware load, repeatable latency/cost, quota redesign and rollback. Production remains on Cloudflare AI Search. Teachers remains a private v2 consumer with no Qdrant/Vertex access or runtime changes.

The live Core v2 Qdrant/Vertex authorization action was run on 12 November. Persisted receipt `e305a581-3d3c-469c-b2b5-093598783df4` passed **8/8 checks**. See the [Core authorization runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_V2_AUTHORIZATION_STAGING_RUNBOOK.md).

Core PRs [#237](https://github.com/ashini-x/parmar-ai/pull/237), [#238](https://github.com/ashini-x/parmar-ai/pull/238) and corrective [#241](https://github.com/ashini-x/parmar-ai/pull/241) are merged. The first two-source Prepare failure `AiSearchError: invalid_metadata_format` was fixed by sending string-valued upload metadata while preserving the numeric AI Search `pdf_page` custom schema. The corrected protected Prepare action now passes. Independent Core staging D1 read-back confirms exactly two project-mapped READY sources (the original M15 source 8/8 and M14 handout 3/3 pages), a second-source Qdrant checkpoint with seven points/READY, and three exact AI Search items all `completed` with numeric physical page metadata 1–3. The operator returned `authorizedReadySourceCount=2` and all prohibited-side-effect flags false. No paired evaluation receipt exists yet; the next Core-only action is the five-case paired Core v2 evaluation (ten staging query reservations).

Core Release validation [#43317133059](https://github.com/ashini-x/parmar-ai/actions/runs/43317133059) passed full typecheck/tests/build with production jobs skipped. Staging workflow [#43317133051](https://github.com/ashini-x/parmar-ai/actions/runs/43317133051) deployed Worker version `a1158a7c-4422-4768-93e0-140363e791c2` at 100%, deployment `b46a8d37-362c-4ac3-94f8-68f602d367a3`. The protected multi-source operator is at [the isolated Core page](https://parmar-ai-m14-staging.thenewtongs.workers.dev/admin/m15/benchmark/multi-source). Re-enter the staging token locally and run the paired evaluation once; save the complete JSON receipt. Do not repeat Prepare now that both sources and provider indexes are independently verified READY.

Cloudflare read-back confirms Core production `parmar-ai`, private `brvin-service` and Teachers production remain on their previous versions at 100%. Core continues selecting `cloudflare-ai-search`; production has no Qdrant/Vertex retrieval bindings. Teachers remains a private v2 consumer with only the private management/retrieval bindings and its own D1; no Qdrant/Vertex credentials, SDKs, embeddings or direct provider access. No Teachers code, contract, configuration, UI, runtime or deployment change is required for this Core-only M15 gate. Preserve the Operator Console and existing workflows.

After the paired multi-source staging gate, remaining M15 work includes broader claim-to-passage/formula grounding, retry/recovery/throttling, HNSW-aware representative load, repeatable Worker latency/throughput/cost and rollback rehearsal. M16 remains the coordinated Core Admin / Teachers Operator Console compatibility and consumer acceptance milestone. M17 remains the controlled canary with the required 14-day production soak. No production cutover is authorized.

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


## Core M15 current status — 13 November 2026

**Current provider-migration checkpoint — 13 November 2026:** Core M13 is merged; M14 is complete only as a scoped non-production Vertex/Qdrant pilot. M15 remains **IN PROGRESS**. The eight-page second Physics source, paired 17-query retrieval / 34-generation OCR-only evaluation, five-query/ten-generation original-PDF-assisted notation audit and 109-candidate owner-waived AI passage assessment are complete. The AI assessment is not independent human qrels; original human-review fields remain blank.

The real Core v2 Qdrant/Vertex authorization action was run on 12 November. Persisted receipt `e305a581-3d3c-469c-b2b5-093598783df4` passed **8/8 checks**: authorized retrieval returned three passages from pages 4/5/8 with valid provenance; wrong-project and revoked-grant calls were denied before quota; all 14 Qdrant points remained during revocation; exactly one authorized query quota unit was consumed; and the staging grant was restored. See the [Core authorization runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_V2_AUTHORIZATION_STAGING_RUNBOOK.md).

Core PRs [#237](https://github.com/ashini-x/parmar-ai/pull/237) and [#238](https://github.com/ashini-x/parmar-ai/pull/238) are merged. PR #238 corrected the numeric physical-page metadata type; its staging validation and full Core test/build passed. Latest post-merge M14 staging workflow [#43311490119](https://github.com/ashini-x/parmar-ai/actions/runs/43311490119) deployed Worker `8d732f8b-b14c-4e47-aeae-ce39d8db9f9f` at 100%. Release validation [#43311489792](https://github.com/ashini-x/parmar-ai/actions/runs/43311489792) passed and skipped production deployment/verification. The protected multi-source operator is deployed at [the isolated Core multi-source page](https://parmar-ai-m14-staging.thenewtongs.workers.dev/admin/m15/benchmark/multi-source), but its prepare/evaluate actions have not yet been run. It reuses the immutable three-page M14 source, indexes only into the dedicated M15 staging provider resources, then runs five paired cases through the real Core v2 resolver. Do not re-upload the PDF or rerun Vision OCR. The paired evaluation consumes ten isolated staging project-query reservations. Follow the [Core multi-source runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_MULTI_SOURCE_CORE_V2_STAGING_RUNBOOK.md).

Core production still selects `cloudflare-ai-search`; production has no Qdrant/Vertex retrieval bindings. Teachers remains a private v2 consumer: its production Worker has only the `BRVIN_MANAGEMENT` and `BRVIN_SERVICE` bindings plus Teachers D1, with no Qdrant/Vertex credentials, SDKs, embeddings or direct provider access. No Teachers code, contract, configuration, UI, runtime or deployment change is required for this Core-only M15 gate. Preserve the Operator Console, tenant/project mapping, five-stage secure upload/OCR/indexing/quality/READY lifecycle, page-count-aware map, persisted errors, retry/resume and source/physical-page citations.

After the two-source staging gate, remaining M15 work includes broader claim-to-passage/formula grounding, retry/recovery/throttling, HNSW-aware representative load, repeatable Worker latency/throughput/cost and rollback rehearsal. M16 remains the coordinated Core Admin / Teachers Operator Console compatibility and consumer acceptance milestone. M17 remains the controlled canary; AI Search must remain available as rollback provider through the required 14-day production soak. No production cutover is authorized.


## Core M15 latest checkpoint — 13 November 2026

Core's read-only component diagnostic is complete. It used the exact two-source READY staging allowlist, performed five Vertex embeddings and ten Qdrant dense/sparse searches, and left quota at 11→11 with zero reservations. No vector, AI Search item, source/OCR or production state was mutated.

The component lists locate all MS01–MS04 expected pages, including MS03 page 2 at rank 4 in both dense and sparse. The paired Core v2 path drops that page because semantic RRF yields a mathematical score of 0.2 that is represented as 0.19999999999999998 and fails the strict 0.2 floor. Core PR [#247](https://github.com/ashini-x/parmar-ai/pull/247) adds a tiny floating-point tolerance and a regression test proving materially sub-threshold scores remain rejected. MN01 continues to return unrelated candidates in both components; this needs a broader calibrated no-match study, not a guessed threshold.

This follow-up is Core-only. Teachers must continue to call only the private v2 Service Binding and must not receive Qdrant/Vertex dependencies or credentials. No Teachers runtime, RPC, UI or deployment change is required. Preserve the teacher/project/collection management, secure PDF upload, five lifecycle stages, physical page map, retries, Core READY gating and citations.


## Post-merge M15 continuation — 13 November 2026

Core PR #247 and its post-merge Release/staging workflows have passed. Core production `parmar-ai` v742 and private `brvin-service` v140 remain at 100% on Cloudflare AI Search; the isolated staging operator is v101. Teachers remains on v12 and has no provider dependencies or direct Qdrant/Vertex access.

The next Core-owned step is the protected five-case paired Core v2 staging evaluation, reserving ten staging project-query units, to verify that MS03 now returns the expected physical page 2. Do not rerun the component diagnostic or two-source Prepare. MN01 no-match calibration, broader quality/grounding, recovery, representative load, repeatable latency/cost and rollback remain open. Keep all existing Teachers workflows and private v2 boundary unchanged.

## 14 November 2026 — capacity and cache design handoff

The approved shared planning target is 1,000 daily active aspirants × 10 questions/day (10,000/day; 300,000 per 30-day month). This is not a Teachers load-test result and does not authorize a provider cutover. Core owns Qdrant/Vertex retrieval and the shared 800/month quota redesign; Teachers remains a private v2 consumer and retains its own tenant/project mapping and Gemini answer ownership.

Any final-answer cache added to Teachers must remain consumer-owned, enforce tenant/project/source scope and keep citations current. Teachers must not add provider credentials or direct Qdrant/Vertex dependencies. See the Core scale/cache plan for invalidation, numeric near-miss bypasses, capacity tests and M15–M17 rollout gates.

## 14 November 2026 — post-score-floor live-state reconciliation

The latest Cloudflare read-back confirms Core production `parmar-ai` v779 and private `brvin-service` v156, isolated Core staging `parmar-ai-m14-staging` v102, and Teachers production v12, all at 100%. Both production Core provider selectors remain `cloudflare-ai-search`. Teachers still has only the `BRVIN_MANAGEMENT` and `BRVIN_SERVICE` Core Service Bindings plus its own D1; it has no Qdrant/Vertex credentials, SDKs, embeddings or direct provider route.

The only isolated staging paired Core v2 receipt is `18728f63-e13d-4e73-880f-a2b980844d04`, completed 12 November before PR #247. It passed structural, source authorization, provenance and quota checks, but Qdrant missed the M15 physical page-2 target for MS03 and returned three unrelated MN01 no-match candidates. The fix is deployed to staging v102, but no post-fix paired receipt exists yet. The immediate Core-only next action is the protected five-case paired Core v2 evaluation (ten staging reservations), with the staging token entered locally in the operator page; never put the token in this repository or chat. No Teachers code, contract, UI, D1, binding or deployment change is needed.

## 14 November 2026 — paired Core v2 score-floor verification passed

Core's protected five-case/two-provider evaluation after PR #247 is persisted as `fa1b8076-9375-480b-bb4b-e22d1c13d9bb`. It passed all seven structural, authorization, two-source discovery, provenance and quota checks. Qdrant now returns all seven distinct expected source/page locations and all eight query-specific positive targets, including MS03 M15 pages 2 and 3; AI Search returns all seven distinct locations and seven of eight query-specific targets. Both have zero provenance violations. Qdrant still returns three irrelevant MN01 Planck/photon no-match candidates, while AI Search returns none. This is Core-only staging evidence; it does not authorize a provider cutover or require any Teachers change.

The next Core-owned M15 task is a calibrated relevance/no-match gating ablation using the existing positive, out-of-corpus negative, exact-symbol near-miss and owner-waived candidate evaluation set, plus the two-source cases. Compare no gate, feature-based evidence sufficiency and calibrated reranking/relevance; preserve positive recall and measure false-abstention, negative false acceptance, formula/symbol quality, latency and cost. Do not invent an RRF cutoff. Keep the private v2 consumer contract, Operator Console, five-stage lifecycle, tenant/project mapping, page map, Core-owned READY gate and citations unchanged.
