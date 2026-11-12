# BRVIN Teachers — Retrieval Provider Compatibility and UI Preservation

**Status (13 November 2026):** Core M14 is complete only as a scoped non-production Vertex/Qdrant pilot. Core M15's paired evaluations/assessment and live v2 authorization-revocation subgate are complete, with important limits: the 109 AI-assessed candidates are not independent human qrels. Core PRs [#237](https://github.com/ashini-x/parmar-ai/pull/237), [#238](https://github.com/ashini-x/parmar-ai/pull/238) and corrective [#241](https://github.com/ashini-x/parmar-ai/pull/241) are merged. The first protected multi-source Prepare attempt returned `AiSearchError: invalid_metadata_format`; the Items Workers binding needs string-valued upload metadata while the AI Search `pdf_page` custom schema remains numeric. PR #241 corrects the wire value, adds a regression test and is deployed as staging Worker `a1158a7c-4422-4768-93e0-140363e791c2` at 100% (workflow [#43317133051](https://github.com/ashini-x/parmar-ai/actions/runs/43317133051), deployment `b46a8d37-362c-4ac3-94f8-68f602d367a3`). Core Release validation [#43317133059](https://github.com/ashini-x/parmar-ai/actions/runs/43317133059) passed and production deployment/verification were skipped. The protected Prepare action must be retried; the paired evaluation has not passed. Production remains on Cloudflare AI Search. Teachers has no provider code or direct provider access; its private v2 contract and deployed Operator Console remain unchanged. No student/channel/model final-answer route is deployed.
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
