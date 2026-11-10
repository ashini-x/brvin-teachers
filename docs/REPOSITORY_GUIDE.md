# Repository Guide — Coordinating BRVIN Teachers and BRVIN Core

**Last reviewed:** 9 November 2026  
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

Core M13 is merged. Core M14 PRs #148, #149, #152, #155, #156, #157, #159, #160, #169, #171, #174, #177, #182 and #186 are merged. The recovered Physics corpus is verified at 3 physical pages/7 chunks (2/2/3), with seven deterministic Qdrant points passing completed-write and exact read-back/provenance checks. Both ten-query Vertex/Qdrant hybrid receipts passed 10/10 query coverage and found all 11/11 expected physical-page references in the top five. The latest receipt returned 50 results, 20 expected-page-labeled results, strict page-label precision@5 of 0.40 and first-expected-page MRR of 0.7833333 (first run 0.8333333); these are page-label diagnostics, not chunk-level relevance judgments. The negative/repeatability diagnostic has now run: both expected-no-match queries returned five candidates, and three friction repeats had one top-five set but two orderings due to a tie at the top. Full-text human chunk judgments and consumer answer-abstention testing are still pending. The source PDF SHA matches the immutable manifest; its canonical equation is `Fnet = m × a` on page 2, the 4 kg/friction example is on page 3, and bus-braking evidence is on pages 1/3.

Core PR #177 adds expected-page precision@5 and first-expected-page MRR to receipts. Core PR #182 adds the authenticated non-gating negative/repeatability diagnostic; both expected-no-match prompts returned five candidates, while three friction repeats returned one stable top-five set with two orderings (tied top two swapped once; expected page-3 rank 2/1/1). These results do not test consumer answer abstention. Core PR #186 now exposes complete text once per unique returned candidate in the authenticated staging-only `candidateEvidence` payload, with query/rank mappings. M14 staging workflow #49 deployed version `f43676e0-d97b-492d-af6c-3495897e3f7b` (version 70) at 100%; Core Release validation #1021 passed its paired production deployment and smoke/acceptance. Next Core step is to rerun the updated diagnostic for full text and create human chunk-level judgments, then separately test the consumer Gemini answer/abstention path. Remaining M14 quality, security and performance gates remain open; no Teachers code or deployment is required.

Core's 10 November staging read-back detected that Worker version 70 lost five non-secret Vertex/Qdrant settings because they existed only as dashboard vars before the workflow deployment. Core PR [#188](https://github.com/ashini-x/parmar-ai/pull/188) versions them in the staging Wrangler config and adds a regression test. Hold the staging full-text diagnostic until that repair deploys and the active config is verified. This is a Core-only staging repair; no consumer integration or deployment is needed.

No consumer change is required. Keep the BRVIN Teachers v2 binding/typed connector, tenant mapping, student answer generation, citations and current Operator Console unchanged.

Core production remains on `cloudflare-ai-search`, with `BRVIN_CORPUS_MANIFEST_ENABLED=false`; Release validation #1021 passed its paired deployment and live smoke/acceptance checks. Current Core production versions are `parmar-ai` `cb3016b7-57f5-4d12-9d0b-e652c355af49` and `brvin-service` `5cbbd904-726d-4215-acbd-b97de7a7742f`, both at 100%. These are Core-internal changes and require no consumer code or deployment. Keep the BRVIN Teachers v2 binding/typed connector, tenant mapping, student answer generation, citations and current Operator Console unchanged unless a later, separately reviewed contract change actually requires coordination.

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
