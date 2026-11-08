# BRVIN Teachers — Retrieval Provider Compatibility and UI Preservation

**Status:** Approved compatibility plan; Core M13 and M14 Core implementation are merged; live M14 corpus is verified and seven Qdrant points are indexed in isolated staging; the three-query retrieval check returned HTTP 400 and Core's nested-error diagnostics fix is deployed; no consumer/provider migration code implemented  
**Owner:** ashini-x/brvin-teachers  
**Core authority:** [BRVIN retrieval provider migration plan](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_RETRIEVAL_PROVIDER_MIGRATION.md)

## 1. Purpose

BRVIN Teachers is a downstream consumer of BRVIN Core. Core is planning to replace the current Cloudflare AI Search retrieval backend with Vertex AI embeddings and Qdrant hybrid retrieval after staged validation. The target is one unified math-aware retrieval path for theory, formulas, worked examples and numerical problems—not separate subject bots.

This repository must preserve the existing product experience. It must not become a second retrieval/indexing system.

The migration does not change student authentication, tenant/project mapping, final answer generation, conversation/session state or the existing BRVIN v2 trust boundary.

## 2. Invariants for this repository

- Continue to use the private BRVIN v2 Service Binding and the existing typed connector.
- Do not connect directly to Qdrant, Vertex AI, Cloudflare AI Search, GCS or Core D1.
- Do not add provider credentials, embedding generation, vector filters or source indexing code to the consumer.
- Continue to resolve the student's tenant and project on the server; never trust a browser-supplied project ID as authorization.
- Continue to let Core enforce app/environment identity, project grants, source grants, source readiness and Core retrieval quotas.
- Continue to let the consumer's own model produce the final answer from bounded BRVIN evidence.
- Keep source title and physical PDF page provenance intact in the student/teacher answer UI.
- Do not change the v2 request/response contract solely because the provider changes. If a genuinely required change emerges, coordinate a backwards-compatible Core-first change and update this repo against the exact Core revision.

## 3. Preserve the existing Operator Console experience

The following experience is a compatibility requirement, not an optional redesign:

1. Teacher directory and teacher workspace.
2. Classroom/project creation and selection.
3. Bookshelf/collection creation and management.
4. Source/PDF upload using the existing secure Core management flow.
5. The same five-step progress view: **Secure upload → OCR → Page indexing → Retrieval quality checks → Ready**.
6. The page-count-aware per-page indexing map with the existing visual state semantics.
7. Persisted stage status, stage errors and exact page failures after reopening a source.
8. Existing retry/recovery controls, with idempotent backend behavior.
9. Existing source readiness behavior and READY gating.
10. Existing real-consumer retrieval test and source/page citation display.

No redesign of navigation, cards, typography, layout, theme, upload interaction, progress animation or page-map geometry is part of this project.

## 4. Allowed wording and diagnostics changes

Use generic language in the normal workflow. The end user/operator should see what the system is doing, not need to understand which vendor supplies the vector database.

| Existing label/area | Required behavior |
|---|---|
| Page indexing | Keep unchanged. |
| Five top-level stage names | Keep unchanged. |
| Page N pending/indexing/complete/failed | Keep the existing status vocabulary and page-map behavior. |
| AI Search (if exposed as a user-facing capability label) | Change to Search index or Retrieval index. |
| Retrieval test | Keep the same task label; provider is transparent. |
| Expanded technical diagnostics | May identify Qdrant Cloud, Vertex embedding model/version, index generation, stage latency and provider health. |
| Student answer/citations | No visible change except any existing provider-specific label is replaced with neutral wording. |

Provider names should not appear on the default teacher workflow or student answer surface. They may appear in authenticated operator-only diagnostics when this helps support and audit.

## 5. Core-owned lifecycle contract

The consumer continues to read source status from Core's management integration. Core maps its internal operations—chunking, embedding, Qdrant upsert, retrieval QA—to the existing lifecycle and stage model.

The page map must not assume one page equals one vector or one search item. A page can produce multiple chunks. The map represents physical PDF pages and their indexing status, not Qdrant point count.

The consumer must not calculate READY from vector counts. It displays Core's persisted source state and page statuses. READY remains a Core decision gated by all expected pages and retrieval QA.

## 6. Math-aware retrieval compatibility

A student query may combine a concept explanation, an equation and a numerical example. Core must be able to return relevant evidence from these content types together through the same v2 request and bounded-evidence response; the consumer must not select a separate theory/maths bot or provider. Preserve formula text as supplied by Core, source titles and physical PDF page citations. Do not silently repair or invent a formula when OCR evidence is uncertain; surface the retrieved evidence and its citations so the consumer answer workflow can handle uncertainty transparently.

This is a retrieval compatibility requirement only. It does not move embedding, indexing, formula extraction, Qdrant access or answer generation into this repository. Consumer code continues to call only the private v2 binding.

If a provider is temporarily unavailable:
- the UI shows the existing in-progress/failed stage and a useful provider-neutral error;
- retry resumes from persisted OCR/chunk/embedding/index checkpoints;
- the consumer must not re-upload the PDF or re-run OCR unless Core explicitly reports that the OCR artifact itself is missing and the Core recovery procedure requires it;
- the UI must not show READY until Core confirms readiness.

## 7. Consumer acceptance for M16

Before production cutover, verify against the Qdrant shadow/canary provider through the real production-like BRVIN v2 consumer path:

- Existing teacher, project, collection and source screens remain usable.
- A PDF upload completes the same five visible stages.
- The page map shows the physical page count and correct per-page statuses.
- Reopening the source restores persisted progress and errors.
- Retry after an injected transient Vertex/Qdrant error resumes safely without duplicate chunks or a new Vision OCR operation.
- READY appears only after Core's retrieval QA passes.
- Existing retrieval test returns bounded, relevant evidence with the same source title and physical PDF page values.
- Mixed theory+formula and numerical queries can return both explanatory and mathematical evidence through the same v2 path, with exact source/page provenance.
- Symbol-sensitive formula cases do not silently substitute a different expression; OCR uncertainty remains attributable to the source page.
- Revoking the Core application-project grant produces the same Not Authorised outcome; restoring the grant allows a subsequent valid request.
- The final student/teacher answer experience and citations remain unchanged.
- No consumer bundle, config, logs or D1 row contains Qdrant/Vertex credentials or raw embeddings.

M16 is complete only after the Core and consumer tests pass together. A UI screenshot alone is not proof of backend readiness or authorization.

## 8. Current Core provider-modernization status — no consumer change

As of 9 November 2026, Core M13 PR [#147](https://github.com/ashini-x/parmar-ai/pull/147) remains merged to `main` as `4ab292ff57addef051b28e32477e2136d91add8d`. Core's latest main revision is `26a2e0128e4259c0811bdaa66d73ec6e3ab83107`, including M14 diagnostic PR [#169](https://github.com/ashini-x/parmar-ai/pull/169). Core production remains pinned to `cloudflare-ai-search`; `BRVIN_CORPUS_MANIFEST_ENABLED=false` is explicit. Core Release validation [#990](https://github.com/ashini-x/parmar-ai/actions/runs/42535365195) passed the paired production deployment and live health/retrieval smoke checks. Current production Worker versions are `parmar-ai` `91cd86b2-4f3e-4fe8-9186-f33fe8fbdeed` and private `brvin-service` `ec386c3a-f87b-42c0-a830-c7e68f9eddaf`, both at 100% traffic. This was a routine Core release, not a provider cutover.

Core M14 foundation/backfill/operator PRs [#148](https://github.com/ashini-x/parmar-ai/pull/148), [#149](https://github.com/ashini-x/parmar-ai/pull/149), [#152](https://github.com/ashini-x/parmar-ai/pull/152), [#155](https://github.com/ashini-x/parmar-ai/pull/155), [#156](https://github.com/ashini-x/parmar-ai/pull/156), [#157](https://github.com/ashini-x/parmar-ai/pull/157), [#159](https://github.com/ashini-x/parmar-ai/pull/159) and [#160](https://github.com/ashini-x/parmar-ai/pull/160) are merged. The live M14 Physics corpus generation `57129957231e548064e5594d8fb9f501` is independently verified: 3 physical pages, 7 chunks (2/2/3), with source hash, raw OCR hashes, normalized-text hashes and deterministic chunk metadata validated. The isolated staging Worker has the separate GCS corpus bucket and required staging credentials configured. Vertex is configured as `gemini-embedding-001` in `asia-south1` with 768 dimensions, and the separate Qdrant collection is `brvin_m14_physics_pilot_v1`.

The authenticated staging operator's seven-point indexing action returned success after Vertex embeddings, completed Qdrant upserts and deterministic point read-back/provenance checks. The subsequent three-query known-evidence retrieval action returned HTTP 400. Core PR #169 fixed the adapter's parsing of Qdrant's nested `status.error` response; M14 staging workflow [#30](https://github.com/ashini-x/parmar-ai/actions/runs/42535365154) deployed staging Worker version `f6850b66-6299-426f-b533-df52f9e35e66` at 100% traffic. The newly surfaced Qdrant message identified a missing payload index for `project_id`; the same authorized filter also requires `source_id`. This is a Core collection-schema issue, not a consumer contract or embedding issue.

Core PR [#171](https://github.com/ashini-x/parmar-ai/pull/171) creates and verifies exact-match `keyword` payload indexes for `project_id` and `source_id` before upsert, hybrid query or source-scoped deletion; it accepts existing `keyword`/`uuid` indexes and fails closed on incompatible schemas. It repairs the already-populated collection without changing/deleting the seven deterministic points or altering the server-authorized filters. Core PR #171 is now merged as `957e02f`; M14 staging workflow [#36](https://github.com/ashini-x/parmar-ai/actions/runs/42537138225) passed and deployed Worker version `16b83f28-cd77-44e3-b1af-69a4de6da09a` at 100% traffic. **The next Core action is to rerun the three known-evidence Physics queries in the staging operator.** The first query creates/verifies both payload indexes before executing the unchanged hybrid query; no OCR or vector re-index is needed. No successful live hybrid query evaluation or full M14 acceptance is claimed yet. Do not repeat OCR or re-index to diagnose this filter-schema failure.

There is no M13/M14 consumer code change. Keep the existing private BRVIN v2 binding, typed connector, tenant-to-project mapping, answer generation and citations exactly as deployed. Core adds no request field, response field or consumer configuration. The deployed Teachers Operator Console and its five-stage progress/page-map experience remain unchanged. Do not update this repository merely to mirror Core-internal provider abstractions; coordinate a consumer change only if a future reviewed Core contract change actually requires it.

The latest Teachers production CI/CD run remains [#59](https://github.com/ashini-x/brvin-teachers/actions/runs/42423395691), which passed build, D1 migration, deployment, health and Access protection. Its deployed Worker version is `68d6694c-6371-4cae-8a25-4af40ca15706` at 100% traffic. No consumer deployment was required for M14. This documentation-only update does not trigger another Teachers deployment.

## 9. Coordination and references

M16 consumer tracking: [BRVIN Teachers issue #18](https://github.com/ashini-x/brvin-teachers/issues/18), coordinated with [Core issue #145](https://github.com/ashini-x/parmar-ai/issues/145).

Core implementation and rollout are tracked in [BRVIN_RETRIEVAL_PROVIDER_MIGRATION.md](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_RETRIEVAL_PROVIDER_MIGRATION.md). Core owns M13–M15 and the provider cutover; M16 is coordinated across both repositories.

Before coding, read:
- the Core migration plan above;
- [BRVIN v2 integration](BRVIN_V2_INTEGRATION.md);
- [BRVIN management integration](BRVIN_MANAGEMENT_INTEGRATION.md);
- [Operator Console design](OPERATOR_CONSOLE_DESIGN.md);
- [retrieval test runbook](RETRIEVAL_TEST_RUNBOOK.md);
- [repository guide](REPOSITORY_GUIDE.md).

Record code, CI, deployment and production verification separately. Do not mark the provider migration complete when only the Core pilot has passed.
