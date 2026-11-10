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

Core M13 is merged. Core M14 provider, corpus, staging operator, evaluation and diagnostic changes are merged, including PRs #148, #149, #152, #155, #156, #157, #159, #160, #169, #171, #174, #177, #182, #186 and #188. The recovered Physics corpus remains verified at 3 physical pages/7 chunks (2/2/3), with seven deterministic Qdrant points passing completed-write and exact provenance read-back. Both ten-query Vertex/Qdrant hybrid receipts covered all 11/11 expected physical-page references; the latest page-label precision@5 was 0.40 and first-expected-page MRR 0.7833333. These are diagnostics, not chunk-level human relevance judgments. The negative/repeatability diagnostic returned five candidates for each no-answer prompt; three friction repeats retained one top-five set with two orderings due to a tied top pair. Full-text candidate evidence is available from Core PR #186, but human chunk judgments and the consumer answer-abstention test remain open.

Core PR #188 fixed a staging config continuity issue: Worker version 70 had lost five non-secret Vertex/Qdrant vars because they were dashboard-only. The settings now live in `wrangler.m14-staging.jsonc`, and the M14 deploy workflow validates them before deployment while ensuring the Qdrant API key is not a plain-text variable. M14 staging workflow #56 [passed](https://github.com/ashini-x/parmar-ai/actions/runs/42804774619) and deployed version 71 (`822cd50a-8483-486a-81f6-969ad2dfe9c3`) at 100%; Cloudflare read-back confirms the model/region/dimensions, collection, HTTPS endpoint and secret bindings. The next Core operator action is to run the authenticated full-text candidate diagnostic once, review complete chunks and create human qrels; do not rerun OCR or re-index.

Core main is now `7607e7c6793cdaa14ce1439333deeb46bdb555a7` after docs PR #189 merged. Paired Core Release validation #1031 [passed](https://github.com/ashini-x/parmar-ai/actions/runs/42804774993). Production `parmar-ai` version `6350d704-5c4f-493b-bf11-9b3f8dd88a56` and `brvin-service` version `cbb94155-58bc-41c1-b585-40718c505580` are both at 100% and explicitly remain on `cloudflare-ai-search`; Core's corpus-manifest flag remains `false`. No Qdrant provider routing is enabled in production.

No consumer change is required. Keep the BRVIN Teachers v2 binding/typed connector, tenant mapping, student answer generation, citations and current Operator Console unchanged. Do not add Qdrant/Vertex SDKs, credentials, embeddings, retrieval logic or formula indexing to this repository. No Teachers deployment is required for the Core-only staging repair; the current Teachers production Worker remains version `68d6694c-6371-4cae-8a25-4af40ca15706` at 100%.

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
