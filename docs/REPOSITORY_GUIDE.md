# Repository Guide — Coordinating BRVIN Teachers and BRVIN Core

**Last reviewed:** 11 November 2026  
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

Core M13 is merged and the M14 Vertex/Qdrant non-production pilot is complete at the scoped milestone boundary (staging Worker v78). M15's read-only AI Search baseline from the same Physics PDF covered 8/11 expected page targets; uppercase-symbol and numerical-setup positives returned no candidates; exact-formula discovery returned a non-formula passage. Core PR #209 now adds the authenticated read-only paired shadow runner, deployed on staging Worker v79 at 100%; the 12-query operator receipt is pending. AI Search uses 11 chunks (3/4/4 per page) versus Qdrant's 7, so passage qrels require separate labels. Human qrels/expanded corpus, Worker-side latency/two-call cost, authorization/isolation, retained-vector revocation, retry/recovery and HNSW-aware load remain M15 gates. Production remains on AI Search; Teachers remains on v12 with no consumer code/deployment or provider access change.

Core main includes PR #203 and #205. Cloudflare read-back confirms M14 staging Worker v78 (`842231fb-78ce-4791-a0b9-6b59e86eeb33`, deployment `817c9ad9-1722-4ffa-bc82-76d8878d01ca`) at 100%; production `parmar-ai` v710 (`059c2495-1347-4fa0-89d3-2749f55b582a`) and private `brvin-service` v134 (`6f00da7e-c663-4d24-a509-0b5be5cc5215`) at 100%, both still selecting `cloudflare-ai-search` with corpus-manifest writes disabled. Core M14 staging workflow #76 and paired Core Release validation #1071 passed, including production deployment, smoke checks and live release acceptance. The current Teachers production Worker remains v12 (`68d6694c-6371-4cae-8a25-4af40ca15706`) at 100%; its live bindings remain only private Core `BRVIN_MANAGEMENT` and `BRVIN_SERVICE` plus Teachers D1. Teachers PRs #37 and #38 merged documentation only; there has been no Teachers Worker deployment for the provider modernization.

No consumer change is required. Keep the BRVIN Teachers v2 binding/typed connector, tenant mapping, retrieval evidence display, source/page citations and current Operator Console unchanged. Do not add Qdrant/Vertex SDKs, credentials, embeddings, retrieval logic or formula indexing to this repository.
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
