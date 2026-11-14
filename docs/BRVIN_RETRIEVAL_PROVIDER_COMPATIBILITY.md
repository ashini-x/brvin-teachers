# BRVIN Teachers — Retrieval Provider Compatibility and UI Preservation

**Status (14 November 2026):** Core M14 is complete only as a scoped non-production Vertex/Qdrant pilot. M15's authorization/revocation and two-source paired Core v2 gates passed, then the expanded two-source Physics evaluation passed its page-target/provenance checks under receipt 0f5f9769-452a-466e-b5ae-735ddba6378a. Both providers completed 12/12; all 11 expected page-target instances across seven source/page pairs were found; provenance violations were zero. AI Search returned no candidates on both expected no-match prompts; Qdrant returned five unrelated candidates. This is not independent human passage/span qrels or load evidence. The staging registry has only two Physics sources and the existing 109-candidate review pack remains ungraded by independent reviewers. Production stays on AI Search; M15 remains open and Teachers remains a private v2 consumer with no Qdrant/Vertex dependencies.

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

**Latest Core-only M15 checkpoint — 13 November 2026:** Core PR #241 is merged and staging Worker version `a1158a7c-4422-4768-93e0-140363e791c2` (version 98) is at 100% via deployment `b46a8d37-362c-4ac3-94f8-68f602d367a3`. The initial protected Prepare failure `AiSearchError: invalid_metadata_format` was traced to numeric page metadata sent to a Workers binding that accepts string-valued metadata. The fix sends `pdf_page` as a string while retaining the instance's numeric custom metadata schema. Full Core tests/build and focused staging validation passed; production jobs were skipped. The protected Prepare action still needs a successful rerun and its READY/index counts verified before the paired five-case evaluation. No Teachers code, v2 contract, binding, UI, or deployment change is required.

Post-merge 10 November 2026 live read-back: Core main includes merged PRs #194, #196, #199, #201, #203 and #205. PR #203 separates natural-language equation/formula discovery from explicit symbol/case/notation lookup; it is deployed only to isolated M14 staging Worker v78 (`842231fb-78ce-4791-a0b9-6b59e86eeb33`, deployment `817c9ad9-1722-4ffa-bc82-76d8878d01ca`) at 100%. PR #205 only corrects the staging operator's explanatory copy and adds a UI wording regression test. M14 workflow #76 and full Core Release validation #1071 passed. M14 pilot exit is complete: v78 covers 11/11 expected pages, qrels scoring is nDCG@5 0.8853 / MRR@5 0.9000 / grade-2+ recall 1.0000 / precision 0.4000, and negative/repeatability diagnostics are recorded. M15 is now active. Its first read-only AI Search baseline from the same source PDF covers 8/11 expected page targets; the uppercase-symbol and numerical-setup positives returned no candidates, and the exact-formula case returned a non-formula passage. This is a source/page comparison, not a matched-chunk qrels score because AI Search and Qdrant segment the source differently. All checks remain Core-only; there is still no Teachers answer/abstention route. Production `parmar-ai` v710 (`059c2495-1347-4fa0-89d3-2749f55b582a`) and private `brvin-service` v134 (`6f00da7e-c663-4d24-a509-0b5be5cc5215`) are both at 100% and explicitly configured to `cloudflare-ai-search`; Core corpus-manifest writes remain disabled and production has no Qdrant/Vertex bindings. Teachers production Worker v12 (`68d6694c-6371-4cae-8a25-4af40ca15706`) remains at 100%, with only `BRVIN_MANAGEMENT` and `BRVIN_SERVICE` Core bindings and its own D1; no Qdrant/Vertex SDKs, credentials or provider bindings are present. There is no consumer contract change, no Teachers code change and no Qdrant production cutover.

**Core staging configuration repair (10 November 2026):** Core PR [#188](https://github.com/ashini-x/parmar-ai/pull/188) is merged. M14 staging workflow [#56](https://github.com/ashini-x/parmar-ai/actions/runs/42804774619) deployed Worker version 71 (`822cd50a-8483-486a-81f6-969ad2dfe9c3`) at 100%; Cloudflare read-back confirms the Vertex model/region/dimensions, Qdrant collection/HTTPS endpoint and separate secret bindings are present. The authenticated full-text diagnostic has now been run and reviewed (see the updated findings below). This remains a Core-only staging change and does not require a Teachers deployment. The Teachers v2 binding, tenant mapping, retrieval adapter, passage display and physical-page provenance remain unchanged.

Core M14 foundation/backfill/operator PRs [#148](https://github.com/ashini-x/parmar-ai/pull/148), [#149](https://github.com/ashini-x/parmar-ai/pull/149), [#152](https://github.com/ashini-x/parmar-ai/pull/152), [#155](https://github.com/ashini-x/parmar-ai/pull/155), [#156](https://github.com/ashini-x/parmar-ai/pull/156), [#157](https://github.com/ashini-x/parmar-ai/pull/157), [#159](https://github.com/ashini-x/parmar-ai/pull/159), [#160](https://github.com/ashini-x/parmar-ai/pull/160), [#169](https://github.com/ashini-x/parmar-ai/pull/169), [#171](https://github.com/ashini-x/parmar-ai/pull/171), [#174](https://github.com/ashini-x/parmar-ai/pull/174), [#177](https://github.com/ashini-x/parmar-ai/pull/177), [#182](https://github.com/ashini-x/parmar-ai/pull/182), [#186](https://github.com/ashini-x/parmar-ai/pull/186) and [#188](https://github.com/ashini-x/parmar-ai/pull/188) are merged. The live M14 Physics corpus generation `57129957231e548064e5594d8fb9f501` is independently verified: 3 physical pages, 7 chunks (2/2/3), with source hash, raw OCR hashes, normalized-text hashes and deterministic chunk metadata validated. The isolated staging Worker has the separate GCS corpus bucket and required staging credentials configured. Vertex is configured as `gemini-embedding-001` in `asia-south1` with 768 dimensions, and the separate Qdrant collection is `brvin_m14_physics_pilot_v1`.

The authenticated M14 staging operator's seven-point indexing action completed successfully after Vertex embeddings, Qdrant upserts and deterministic point read-back/provenance validation. The first three known-evidence Vertex/Qdrant hybrid queries then initially returned HTTP 400 because Qdrant lacked the exact-match payload indexes for `project_id` and `source_id`. Core PR [#171](https://github.com/ashini-x/parmar-ai/pull/171) added idempotent `keyword` payload-index creation and schema read-back before upsert, hybrid query and source-scoped deletion; it accepts existing `keyword`/`uuid` schemas and fails closed on incompatible schemas.

After that fix, the live three-query smoke test returned `ok: true`, five results per query and all 4/4 expected physical-page references in top five. Newton's second-law evidence covered page 2, the 4 kg worked example page 3, and bus-braking evidence pages 3 and 1. The original three-page Library PDF was inspected and its SHA-256 matches the immutable M14 manifest exactly. Its canonical equation is `Fnet = m × a` on physical page 2; the rough-floor 4 kg / 20 N / 8 N friction calculation is on page 3; bus braking is explained on page 1 and answered on page 3.

Core PR #174 deployed the ten-positive-case evaluator. The user has now run the ten-query suite twice; both receipts passed 10/10 page-coverage checks and found all 11/11 expected physical-page references in the top five. The latest receipt has 50 results, 20 expected-page-labeled results, strict page-label precision@5 of 0.40, and first-expected-page MRR of 0.7833333 (prior run 0.8333333). Only the friction/net-force expected page moved from rank 1 to rank 2; its top-five still contains page 3 once, so expected-page result count and aggregate precision did not change. These are page-label diagnostics, not human chunk-level relevance judgments.

Core PR #182 merged as `20a6a00` and introduced the authenticated, staging-only, non-gating negative/repeatability diagnostic. The user's receipt showed five candidates for each expected-no-match query; previews did not display the requested exact target. Three friction repeats returned one stable top-five set but two orderings because the top two tied at `0.6666667`; the page-3 expected chunk ranked 2/1/1. That diagnostic did not invoke Teachers' consumer-owned Gemini answer/abstention path, and RRF scores are not confidence probabilities. Core PR #186 merged as `0fa5b4c` and now returns complete text once per unique candidate in the authenticated staging-only `candidateEvidence` payload, including query/repeat/rank mapping. M14 staging workflow [#56](https://github.com/ashini-x/parmar-ai/actions/runs/42804774619) deployed Worker version 71 (`822cd50a-8483-486a-81f6-969ad2dfe9c3`) at 100%; Cloudflare version read-back verified the five non-secret Vertex/Qdrant settings and secret-binding separation. Core Release validation [#1031](https://github.com/ashini-x/parmar-ai/actions/runs/42804774993) passed paired production deploy and smoke/acceptance. Core production remains on AI Search. The next step is to run the authenticated staging diagnostic once, review the full candidate text for human chunk judgments, then separately test the existing consumer-owned Gemini answer/abstention behavior. No Teachers provider/contract change or deployment is required.

There is no M13/M14 consumer code change. Keep the existing private BRVIN v2 binding, typed connector, tenant-to-project mapping, retrieval evidence display and physical-page provenance unchanged. Core adds no request field, response field or consumer configuration. The consumer owns any future Gemini answer generation, but no live student/channel/model answer-generation route is deployed in this repository today. The deployed Teachers Operator Console and its five-stage progress/page-map experience remain unchanged. Do not update this repository merely to mirror Core-internal provider abstractions; coordinate a consumer change only if a future reviewed Core contract change actually requires it.

The latest Teachers production CI/CD run remains [#59](https://github.com/ashini-x/brvin-teachers/actions/runs/42423395691), which passed build, D1 migration, deployment, health and Access protection. Its deployed Worker version remains `68d6694c-6371-4cae-8a25-4af40ca15706` at 100% traffic; no Teachers code or deployment was required for Core PR #188. No consumer deployment was required for M14. This documentation-only update does not trigger another Teachers deployment.

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


## 9. M14 diagnostic outcome and current answer-path readiness — 10 November 2026

Core's authenticated staging diagnostic returned five candidates for each of the two expected-no-match prompts. None of the complete candidate texts contained exact lowercase f = ma; the nearest formula material is uppercase F/Fnet, with the corpus source equation recorded as Fnet = m × a. The Planck-constant prompt returned five unrelated Physics chunks. The friction query returned one stable top-five set but three different orderings; the directly relevant page-3 worked-example chunk ranked 1, 1 and 3 because leading candidates tied at RRF 0.6666667. RRF is a rank-fusion value, not a confidence probability. These are Core staging retrieval results only; they do not constitute a consumer answer or abstention test.

**The current Teachers Operator retrieval page is retrieval-only.** Source inspection on 10 November 2026 confirms:
- src/index.ts dispatches the application to the protected Operator Console/health handler (plus the connection-probe route).
- src/retrieval-test.js calls retrieveTeacherKnowledge through the private BRVIN_SERVICE binding and renders source passages, scores and physical PDF pages.
- src/brvin-v2.js implements the private v2 retrieval adapter; it does not call Gemini or produce a final answer.
- The repository README and v2 integration guide state that student/channel/model runtime is deferred.

Therefore, the currently deployed consumer has no Gemini answer/abstention endpoint to exercise with the two negative prompts. Do not treat the retrieval-test page as an answer test, and do not add direct Qdrant/Vertex access or alter the frozen v2 contract to work around this gap. A genuine M16 consumer answer/abstention test requires the student/channel/model runtime to be implemented, or a separately approved operator-only harness with its own security and cost boundaries. No such harness is introduced by this documentation update.

M16 remains open. Preserve the existing UI and private v2 boundary while Core continues M14/M15 retrieval validation. Answer correctness, citation behavior and abstention must be tested through an actual consumer-owned generation path before M16 acceptance.


## M14 version-72 component-rank diagnostic readout — 10 November 2026

Core's authenticated staging-only diagnostic now exposes the independent dense and sparse component ranks for the friction prompt. The receipt confirms that the direct page-3 worked-example chunk (4 kg box, 20 N pull, 8 N friction) ranked dense 1 / sparse 5; a broad page-1 force/net-force chunk ranked dense 5 / sparse 1; and the page-2 second-law context chunk ranked 2 / 2. Those complementary rank pairs all produce the same equal-weight RRF score of 0.6666667. The same top-five point set was returned in all three hybrid repeats, but the direct page-3 expected chunk moved through ranks 3, 1 and 2. This is tied-score ordering variation, not candidate-set drift.

No retrieval policy, weighting, point-ID ordering or consumer change is approved from this single query. Core should retain the baseline RRF while human chunk-level qrels are prepared; any weighting/fusion/tie policy must be benchmarked over the labelled query set and checked for per-query regressions. Raw dense and sparse scores are on different scales and must not be compared as calibrated confidence. This receipt is a Core M14 staging result, not a Teachers retrieval or answer-generation test.

The two expected-no-match prompts remain retrieval-only. The full candidate text did not contain the requested exact lowercase f = ma; the Planck-constant prompt returned unrelated Physics material. None of this demonstrates consumer answer abstention. Teachers still has no deployed student/channel/model Gemini generation route, so do not treat the protected retrieval-test page as a final-answer test. The private BRVIN v2 binding and existing Operator Console remain unchanged.


## 10. M14 v78 receipt review — 11 November 2026

Core's authenticated v78 ten-query receipt was matched to the seven immutable source-grounded chunk qrels. The resulting macro nDCG@5 is **0.8853**, MRR@5 **0.9000**, grade-2+ recall@5 **1.0000 (20/20)** and precision@5 **0.4000 (20/50)**, compared with v75 0.8556/0.8500/1.0000/0.4000. The exact natural-language formula-discovery case now returns both direct page-2 formula chunks at ranks 1 and 2; the other nine per-query qrels scores are unchanged. Qrels remain model-adjudicated and the pilot contains only seven chunks, so independent human labels and broader document coverage remain required.

The separate Core negative diagnostic returned five grade-0 candidates for each expected-no-match query (lowercase `f = ma`, top RRF 0.425; Planck constant, top RRF 0.5). This is not consumer answer behavior. The friction query's ordered top five was identical across three repeated calls, with the expected page-3 worked-example chunk rank 1 each time. RRF scores are not confidence probabilities.

No Teachers code, v2 contract, Operator Console, upload/index workflow, bindings or deployment changed. The current Teachers app still has no deployed Gemini final-answer/abstention route. Keep the private v2 binding, tenant/project mapping, source/page provenance and current UI unchanged; do not add provider credentials, SDKs, embeddings or direct Qdrant/Vertex access to this repository. M14 remains a Core staging experiment, not a production cutover.


## 11. M15 shadow benchmark handoff — 11 November 2026

Core has started the M15 current-provider baseline using read-only searches against the existing AI Search instance `fatman-2026-8b183803`, filtered to the Physics source folder only. The source is already indexed (page item chunk counts 3/4/4); Qdrant's same-PDF pilot has seven custom chunks. On the fixed 12-case suite, AI Search covered 8/11 expected physical-page targets; uppercase-symbol and numerical-setup positives returned no candidates; the exact-formula discovery prompt returned a general passage without the formula; both no-match prompts returned no candidates. These observations belong to the Core M15 benchmark, not the Teachers answer runtime.

No Teachers code, v2 contract, Operator Console, upload/index workflow, bindings or deployment changed. Keep the private v2 binding, tenant/project mapping, source/page provenance and current UI unchanged. Do not add Qdrant/Vertex credentials, SDKs, embeddings or provider access to this repository. M15 remains Core-owned until a contract or UI parity change is required; M16 remains later consumer/admin parity and answer-path work.


## 11 November 2026 — Core M15 shadow runner deployed

Core PR #209 is merged and its protected 12-case paired shadow runner is live on the isolated M14 staging operator (Worker v79, 100%). It calls the existing AI Search instance through a search-only binding scoped to the immutable Physics source folder, and Qdrant through query-only mode without collection/index preparation. It is Core-only; no Teachers code, v2 contract, Operator Console, upload/index workflow, bindings or production Worker changed. Production Core remains on AI Search.

The operator receipt is pending because its staging bearer token is entered locally in the operator page and is not shared with chat. M15 will continue with independent passage qrels, a broader corpus, authorization/revocation, latency/cost, recovery and load. Do not add Qdrant/Vertex SDKs, credentials or direct provider access to this repository. M16 remains later consumer/admin parity and real answer/abstention work.

## 11 November 2026 — Core M15 paired shadow receipt

Core's first 12-case read-only shadow run completed successfully on the pinned Physics source. It found stronger expected-page coverage/MRR from Qdrant, but Qdrant returned candidates for both expected-no-match questions while AI Search returned none. The scorecard denominator was corrected in Core PR #211; corrected metrics now distinguish fixed-cutoff page-label P@5 and no-match false-positive rates. Core staging Worker v80 carries that reporting fix. Production remains on AI Search. This is Core-only retrieval evidence: Teachers code, BRVIN v2 contract, Operator Console, tenant/project mapping, bindings and Worker v12 deployment remain unchanged. Independent human passage qrels, broader corpus, security/revocation, latency/cost and load gates remain open; no provider credentials or direct access belong in this repository.



## 11 November 2026 — Core M15 second-source staging operator

Core PR #213 added a dedicated eight-page synthetic Physics benchmark source pipeline, separate staging AI Search instance and Qdrant collection. Core PR #214 completed the production-scope allowlist, and Core PR #215 fixed source-stage monotonicity, partial AI Search resume and operator token handling. The isolated Core staging Worker is deployed at v82 (100%); the operator URL is [Core M15 benchmark staging](https://parmar-ai-m14-staging.thenewtongs.workers.dev/admin/m15/benchmark). The detailed source fingerprint and user runbook live in [Core BRVIN_M15_SECOND_SOURCE_BENCHMARK.md](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_SECOND_SOURCE_BENCHMARK.md).

This is a Core-only retrieval experiment. The new eight-page source has not been uploaded yet. Do not upload it through BRVIN Teachers or create a Teacher/Project/Collection/Source for this experiment. The source is meant for the isolated Core staging registry, private staging bucket, dedicated benchmark AI Search instance and dedicated Qdrant collection. The separate Test Card PDF is for evaluation and must never be indexed.

Teachers runtime remains unchanged: no code, private v2 contract, Operator Console, tenant/project mapping, source grants, upload/index workflow, D1 schema, service binding or Worker deployment has changed. Do not add Qdrant/Vertex SDKs, credentials, embeddings or direct provider access to this repository. The consumer-owned Gemini answer-generation and abstention path has not been exercised by this retrieval-only benchmark. M16 remains later admin/consumer parity work after Core M15 gates; production still selects Cloudflare AI Search.


## 13 November 2026 — Core M15 live authorization passed; multi-source gate pending

The Core v2 staging authorization/revocation action completed on 12 November. Persisted receipt `e305a581-3d3c-469c-b2b5-093598783df4` passed all eight named checks. The authorized retrieval returned three passages from physical PDF pages 4, 5 and 8 with valid source/project provenance. A wrong-project request and a request after grant revocation both returned `PROJECT_NOT_AUTHORIZED` before quota/provider retrieval. All 14 Qdrant points remained while the grant was revoked; the quota counter advanced from 0 to 1 only for the authorized query; and the temporary staging grant was restored. See the [Core authorization runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_V2_AUTHORIZATION_STAGING_RUNBOOK.md).

Core PRs [#237](https://github.com/ashini-x/parmar-ai/pull/237) and [#238](https://github.com/ashini-x/parmar-ai/pull/238) are merged. The final PR checks passed TypeScript, the full Core test/build, focused staging tests, provider configuration verification and the Wrangler dry-run; PR #238 additionally verifies numeric page metadata. The latest staging workflow [#43311490119](https://github.com/ashini-x/parmar-ai/actions/runs/43311490119) deployed Worker `8d732f8b-b14c-4e47-aeae-ce39d8db9f9f` at 100%; Release validation [#43311489792](https://github.com/ashini-x/parmar-ai/actions/runs/43311489792) passed and skipped production deployment/verification. The new operator is available at [the isolated Core multi-source page](https://parmar-ai-m14-staging.thenewtongs.workers.dev/admin/m15/benchmark/multi-source), but its protected preparation/evaluation actions have not yet been run. This gate reuses the immutable three-page M14 source as a second source in the existing isolated M15 project, verifies Qdrant and separate AI Search indexing, and queries both READY sources through the real Core `retrieveBrvinForApplicationV2` path with both providers. The five paired cases consume ten isolated staging query units. Use the [Core multi-source runbook](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_MULTI_SOURCE_CORE_V2_STAGING_RUNBOOK.md); do not re-upload the PDF or rerun Vision OCR.

**Consumer boundary:** this is a Core-only staging change. No Teachers code, v2 contract, tenant/project mapping, D1 schema, bindings, Operator Console, upload/index workflow or Worker deployment is required. Continue using only the private v2 Service Binding; keep Qdrant/Vertex SDKs, credentials, embeddings and provider-specific routes out of Teachers. Preserve teacher/project/collection management, secure PDF upload, the same five stages, page-count-aware page map, persisted errors, retry/resume, Core-owned READY gating and source/physical-page citations.

M15 remains **IN PROGRESS** after this subgate: broader formula/mixed-query and claim-to-passage grounding, recovery/throttling, HNSW-aware load, repeatable latency/throughput/cost and rollback remain open. M16 is the later coordinated UI/consumer compatibility acceptance. M17 remains a controlled production canary; AI Search must remain available as rollback provider during the required 14-day production soak. Production still selects Cloudflare AI Search and no provider cutover is authorized.


## 13 November 2026 — Core component diagnostic and score-floor follow-up

The Core-only staging diagnostic used the pinned two-source READY D1 allowlist and performed five query embeddings plus ten read-only Qdrant component searches. Its quota remained 11→11 with zero reservations. It made no vector upserts/deletes, no AI Search item uploads/deletes, no source/OCR changes and no production D1/provider access.

For MS01–MS04, both dense and sparse components returned every expected source/page target within their top 15 results. MS03's M15 page-2 target appeared at rank 4 in both components. Its semantic weighted-RRF score is mathematically 0.2; floating-point representation produced 0.19999999999999998, which the Core retrieval score-floor comparison incorrectly treated as below the default 0.2 boundary. Core PR [#247](https://github.com/ashini-x/parmar-ai/pull/247) adds a machine-precision-only comparison tolerance while continuing to reject materially lower scores. It does not alter the private v2 contract or require any Teachers-side change.

MN01 still returns unrelated candidates in both components. No uncalibrated threshold, RRF weight adjustment or reranker is being introduced. Core PR #247 has passed CI and is deployed; the next Core-only step is the protected paired Core v2 five-case staging evaluation on operator v101, not another component diagnostic. The normal Operator Console should remain unchanged: teachers/projects/collections, secure PDF upload, five-stage progress, physical-page map, retry/resume, Core-owned READY gating and source/page citations remain the product contract.


## 13 November 2026 — Core score-floor fix deployed; paired retrieval verification pending

Core PR [#247](https://github.com/ashini-x/parmar-ai/pull/247) merged as `cab5df42ef1ae16c6c21a52f6e77f3d9a3a74811`. Core Release validation [#43337071402](https://github.com/ashini-x/parmar-ai/actions/runs/43337071402) passed TypeScript, full Vitest, Node tests, both Worker bundle builds, production deployment and post-deploy smoke tests. The isolated M14/M15 staging workflow [#43337071263](https://github.com/ashini-x/parmar-ai/actions/runs/43337071263) passed the focused tests/configuration/dry-run checks and deployed staging operator v101. Cloudflare read-back shows Core `parmar-ai` v742 and private `brvin-service` v140 at 100%, both still selecting `cloudflare-ai-search`. Teachers remains v12 at 100% with only its private Core management/retrieval bindings and tenant D1; no Qdrant/Vertex access has been added.

The score-floor fix addresses only the MS03 exact-boundary issue. The paired Core v2 staging evaluation has not yet been rerun, so do not claim the expected page-2 passage has been restored until a new protected receipt verifies it. MN01 no-match false positives remain unresolved. Continue to preserve the Operator Console and private v2 consumer boundary.

## 10. Scale target and semantic-cache compatibility — 14 November 2026

The approved capacity target is 1,000 daily active aspirants using up to 10 questions per day: 10,000 questions/day and 300,000 questions per 30-day month. This is a planning and acceptance target; it is not a claim that the current Teachers deployment or Core Qdrant staging cluster has passed that load. Core must prove representative peak bursts, throughput, latency, error rates and recovery before production cutover.

The Core-owned provider direction remains Vertex AI embeddings plus Qdrant dense/BM25 hybrid retrieval and RRF. Qdrant Free is only for isolated staging/prototypes; production capacity and availability must be based on a measured Standard cluster. The fixed included monthly query allowance of Cloudflare AI Search is the reason for the provider change, but Qdrant is resource-bounded and must not be described as literally unlimited. Cloudflare AI Search remains the production rollback provider until the required 14-day soak and retirement review complete.

**Consumer invariants for caching:**

- Teachers must not access Qdrant, Vertex, embeddings or Core provider credentials to implement a cache.
- If Teachers later adds a final-answer cache, it belongs in the Teachers application answer orchestration, since the consumer owns Gemini generation. It is not a BRVIN Core feature.
- A Core retrieval-result cache remains Core-owned and may only return evidence after current Core authorization, project/source grant and READY checks; source/page provenance must be revalidated on every hit.
- Cache scope must include the authenticated tenant/application and authorized project/source scope, corpus generation and relevant model/prompt/policy versions. Grant revocation or source changes must immediately prevent stale cache reuse.
- Semantic answer reuse must be evaluated against near-miss questions. Bypass it for changed numerical operands, units or assumptions; time-sensitive, personalised or conversation-dependent questions; ambiguous questions; and uncalibrated no-match cases. Preserve valid source titles and physical PDF page citations.
- Exact normalized-question caching is the safe first stage. Semantic answer caching is not yet implemented or approved for production use.

The last verified Core system reference records an 800-query/month project-level limit with a code maximum of 800. This is independent of the student-facing 10/day allowance and cannot support the 300,000/month planning target. Core must redesign that shared quota and prove sufficient capacity before production cutover. Teachers must continue to enforce its own authenticated tenant/project mapping and may not rely on a Core quota or a cache key as tenant authorization.

See Core's [BRVIN scale and semantic-cache plan](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_SCALE_AND_SEMANTIC_CACHE_PLAN.md) for detailed acceptance criteria. This documentation update does not change the Teachers runtime, private v2 contract, D1 schema, bindings, UI or deployment.

## 11. Live Core state reconciliation — 14 November 2026

The current Cloudflare read-back confirms parmar-ai production v779, brvin-service production v156, isolated parmar-ai-m14-staging v103, and brvin-teachers production v12, all at 100%. Production Core continues selecting Cloudflare AI Search; Vertex/Qdrant configuration remains isolated to Core staging. The staging benchmark health endpoint is ready and Teachers /health returns ok. Teachers remains unchanged as a private v2 consumer with its two Core Service Bindings and own tenant D1 only.

Staging D1 contains three passed multi-source receipts: baseline 18728f63-e13d-4e73-880f-a2b980844d04, post-score-floor verification fa1b8076-9375-480b-bb4b-e22d1c13d9bb and expanded evaluation 0f5f9769-452a-466e-b5ae-735ddba6378a. The latest run used 24 reservations (21→45) and remains page-target rather than passage-qrels evidence. No consumer change is required or authorized for this Core-only gate.

## 12. Post-PR-247 paired Core v2 evaluation — 14 November 2026

The protected Core staging receipt `fa1b8076-9375-480b-bb4b-e22d1c13d9bb` passed the five-case paired v2 evaluation through the existing Core resolver. Qdrant now retrieves MS03 M15 pages 2 and 3; unique expected-page coverage is 7/7 and query-specific positive target coverage is 8/8. AI Search has 7/7 distinct coverage and 7/8 query-specific coverage. Both providers completed all five queries with zero provenance violations and all seven structural/authorization/provenance/quota checks passed. The ten reservations are recorded in staging D1 (11→21). Qdrant still returns three unrelated candidates for MN01; AI Search returns none. The n=5 sequential latency samples are not load/SLO evidence.

This is a Core-only staging receipt. No Teachers runtime, private v2 request/response contract, tenant/project mapping, D1 schema, binding, Operator Console, upload/index workflow or Worker deployment changed. Teachers must continue using only the private Core Service Bindings; do not add provider SDKs, credentials, embeddings or direct Qdrant/Vertex access.

The calibrated relevance/no-match offline feasibility ablation has since completed and selected no policy. The latest Core M15 action is independent human passage/span qrels, an approved non-Physics source family and source/query-family holdouts. Keep the existing five-stage source lifecycle, page-count-aware physical-page map, persisted progress/errors, retry/resume, Core-owned READY gate and source/page citations unchanged.

## 13. Initial M15 relevance-gate feasibility — 14 November 2026

Core's offline owner-waived 109-candidate evaluation found no safe simple filter: a fixed RRF cutoff that cleared all four out-of-corpus controls lost one held-out positive, while a leave-one-query-out lexical-coverage proxy cleared all four negatives but also falsely abstained on one held-out positive. H01's source-correcting near-miss remains a separate evidence case. No runtime gate, threshold or reranker was chosen. The owner-waived AI grades are not independent human qrels; Core's next task is broader independently labelled multi-document/query-family evidence and source-group held-out evaluation. See [Core's ablation report](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_M15_RELEVANCE_GATE_ABLATION.md).

This is Core-only offline evaluation work. Teachers' private v2 contract, tenant/project mapping, D1, Service Bindings, Operator Console, upload/index lifecycle, five stages, physical page map, retry/resume, Core-owned READY gate and citations remain unchanged. Do not add Qdrant/Vertex credentials, SDKs, embeddings or provider routes to Teachers.

## 14 November 2026 — Core M15 expanded staging evaluation

Core has completed its protected, Core-only 12-query two-source Physics evaluation under staging receipt 0f5f9769-452a-466e-b5ae-735ddba6378a. Both providers completed 12/12 with zero failures or provenance violations and found all 11 query-specific page targets across seven distinct source/page pairs. AI Search returned no candidates for both expected no-match prompts; Qdrant returned five unrelated candidates. Sequential n=12 p50/p95 was 3,333/6,762 ms for AI Search and 1,162/1,216 ms for Qdrant/Vertex, not load/SLO evidence. This remains page-target evidence, not independent passage/span qrels. M15 next needs independent human labels, another subject/source family, held-out groups and explicit no-match/near-miss precision. The staging source set is still two Physics sources. No Teachers implementation, runtime, private v2 contract, tenant/project mapping, D1 schema, bindings, Operator Console, upload/index workflow or deployment changed. Continue to use only the private Core Service Binding; production Core remains on Cloudflare AI Search.

No Teachers implementation, runtime, private v2 contract, tenant/project mapping, D1 schema, bindings, Operator Console, upload/index workflow or deployment changed. Continue to use only the private Core Service Binding. Do not add Qdrant/Vertex credentials, SDKs, embeddings or provider-specific routes to Teachers. Production Core remains on Cloudflare AI Search; M15 is still in progress, while M16 consumer parity and M17 canary/soak remain future gates.

## 14 November 2026 — Core staging quota plumbing read-back

Core PR #272 merged as `9bcae39f5e6b9deafd794da3ec1ec4a65922f4aa`; post-merge Release validation and the M14 staging workflow passed. Core's isolated M15 staging Worker is v104 at 100%, configured with a 300,000/month project ceiling and the emergency retrieval breaker disabled. Core production remains `parmar-ai` v779 and `brvin-service` v156 at 100%, with Cloudflare AI Search selected and the 800/month project allowance. The production deployment and production live-verification jobs were skipped. Teachers remains v12 and unchanged.

This is Core-only quota plumbing for staging. It does not change Teachers' private v2 contract, tenant/project mapping, Service Bindings, answer-generation ownership, Operator Console, five-stage upload/index lifecycle, citations or student allowance. M15 remains open for independent human passage/span qrels, an approved non-Physics source family, held-out groups, near-miss/no-match precision, load, recovery and cost evidence. Keep Teachers on the private Core Service Bindings only; no direct Qdrant/Vertex access or consumer change is needed.

## 14 November 2026 — Core offline qrels validation utility

Core now has an offline validator for its prepared 109-candidate passage-review pack. It checks that two reviewers attest to the same source fingerprint, validates grades/rationales/adjudication, and reports provider-local metrics only after annotation is complete. The review pack remains unannotated, so independent human qrels are still pending. This utility does not run in Teachers or change the private v2 boundary, Consumer Operator Console, or production provider.
