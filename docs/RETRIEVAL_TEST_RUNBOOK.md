# BRVIN Teachers — Temporary Retrieval Test

**Purpose:** Verify that an indexed teacher PDF can be searched through the production BRVIN v2 retrieval path and that matching passages retain their physical PDF page provenance.

## Access

Open:

`https://brvin-teachers.thenewtongs.workers.dev/operator/retrieval-test`

The route is part of the existing Operator Console Worker and is protected by the same Cloudflare Access identity check. It is not a public API and does not expose a standalone endpoint on the private `brvin-service` Worker.

## Two different retrieval modes

**Semantic search (default)**

Leave **Exact-page lookup override** completely blank. Enter a natural-language question. BRVIN runs hybrid AI Search over the authorised source folders and returns relevant indexed text excerpts with physical PDF page citations. This is the mode to use when checking whether BRVIN understands what a question is asking.

**Exact-page lookup (manual override)**

Enter up to three physical PDF page numbers, such as `2` or `1,2,3`. This asks BRVIN to retrieve those exact page records. If the page records are found, BRVIN returns their indexed page text directly and skips semantic AI Search for that request. The question does not filter the exact page content. If no exact page item is found, the service can fall back to the semantic query.

Do not combine the modes when measuring question relevance. Supplying page numbers is not an extra filter on the semantic search; it activates the exact-page retrieval path first.

## Semantic test procedure

1. Sign in through Cloudflare Access as an authorized operator.
2. Open the retrieval test page and select the authorised project. Projects are shown only when they are both mapped in the Teachers application D1 and returned by BRVIN's authorised-project RPC.
3. Enter one focused question grounded in the uploaded PDF. For the three-page Newton pilot, a suitable example is:  
   `According to the document, what is the relationship between force, mass and acceleration?`
4. **Leave the exact-page lookup field blank.** This is essential for a semantic relevance test.
5. Confirm the quota notice and select **Run one retrieval test** once.
6. Inspect the returned excerpt, source title and **PDF page N**. Compare the excerpt with the cited page in the original PDF.

The result summary must say **Semantic search** and show at least one search operation for a completed semantic search. Returned text should be a relevant excerpt, not simply all pages because they were explicitly requested.

## Exact-page test procedure

Use this only when checking the page extraction/provenance mechanism independently from semantic relevance:

1. Enter one or more known physical PDF page numbers (maximum three).
2. Confirm the quota notice and select **Run one retrieval test** once.
3. The result summary should say **Exact-page lookup · semantic search skipped** when the requested page content was found.
4. Verify that each returned passage belongs to the requested physical PDF page.

Exact-page results can contain substantially more text than a semantic excerpt because the operation retrieves the specified page record.

## Precision baseline for the three-page Newton pilot

The Core precision update is deployed (Core PR [#135](https://github.com/ashini-x/parmar-ai/pull/135)). The shared AI Search index uses hybrid vector + BM25 retrieval, 256-token chunks with 10% overlap, RRF fusion and BGE cross-encoder reranking. The three existing pilot pages have been re-indexed from the stored OCR text (page 1: 3 chunks; page 2: 4; page 3: 4). No PDF upload or Google Vision OCR rerun was required.

Use one focused query at a time, with the exact-page override blank:

| Test question | Expected primary physical PDF page | What to verify |
|---|---:|---|
| `Explain Newton's second law: how do net force, mass and acceleration relate?` | 2 | The result explains that acceleration is in the direction of net force, increases with net force, and decreases with mass for the same net force. |
| `A 4 kg box is pulled with 20 N to the right while friction is 8 N to the left. Calculate net force and acceleration.` | 3 | The result supports 12 N to the right and 3 m/s² to the right. |
| `Why does a passenger move forward when a moving bus brakes suddenly? Which law explains it?` | 3 (answer key); page 1 also contains the explanation | The result identifies inertia and Newton's first law. |

The expected pages above are a baseline for checking the source citation, not a hard-coded routing rule. A passage is acceptable only when its text actually supports the answer and its returned **PDF page N** matches the original physical PDF page. Do not enter the expected page number in the exact-page override while running a semantic test.

A direct AI Search engine smoke check produced the expected top page for each of these questions. That is a retrieval-index check only; the final acceptance must still be performed through this protected page so the real v2 Service Binding, application/environment identity, project grant, ready-source checks and quota are exercised together. Each live retrieval test can consume project quota, and this page intentionally allows only one request per load.

## What constitutes useful semantic-search evidence

- The endpoint returns `ok: true` through the private BRVIN v2 binding.
- The result summary says **Semantic search** (not exact-page lookup).
- At least one passage is returned for a relevant question.
- Each passage has the expected source title and a positive physical `pdfPage` value.
- The text actually answers or supports the question, and the cited page points to the corresponding location in the original PDF.

A successful HTTP/RPC response with zero passages proves that the private service was reached, but it does **not** prove that useful retrieval worked. A relevant passage with a plausible page number is not a substitute for checking the page against the original PDF when validating strict citation accuracy.

## Recorded consumer semantic retrieval — 8 November 2026

The operator supplied a screenshot from the Access-protected `/operator/retrieval-test` page after running the recommended Newton second-law question. The route returned two relevant passages from `Force and Laws of Motion - Class IX pilot handout`; both cite physical PDF page 2. The displayed relevance scores were **0.993** and **0.960**. The excerpts explain that acceleration is in the direction of net force, increases with net force, and is smaller for greater mass under the same net force. This is accepted as the useful semantic-retrieval portion of M11. The screenshot records the returned evidence; it does not itself show the submitted query or exact-page field, which should be left blank in future semantic runs.

## Recorded authorization acceptance — 8 November 2026

The real BRVIN Teachers Production consumer passed the complete authorization check. After useful semantic retrieval had returned two relevant passages from physical PDF page 2 (displayed scores **0.993** and **0.960**), the operator revoked the Production application's access to Physics and submitted another request through the consumer. The page displayed **Not Authorised**. The operator then restored access to Physics, and the same consumer successfully answered again.

This verifies three distinct outcomes through the real consumer path: relevant semantic evidence with correct source-page provenance, denial after access revocation, and retrieval restoration after a valid re-grant. The denial/restoration outcomes are recorded from the operator's explicit confirmation; no separate screenshot or raw HTTP status was supplied for those two actions. M11 real-consumer acceptance is complete.

## Safety and limits

- The diagnostic calls `retrieveTeacherKnowledge`, which uses the existing app-to-project mapping and private `BRVIN_SERVICE` binding. BRVIN Core rechecks the active application/environment, project grant, ready source grants, and monthly quota on every retrieval.
- Do not call Cloudflare AI Search directly, query Core D1 from the consumer, or use Google Colab to bypass the binding. Those routes do not exercise the production authorisation boundary.
- No PDF is uploaded, downloaded, modified, re-OCRed or re-indexed by this diagnostic.
- The endpoint accepts one query up to 2,000 characters and up to three exact physical page numbers (maximum 2,000 each). It returns at most eight bounded passage excerpts and omits page-image payloads.
- Both semantic and exact-page requests pass through the BRVIN retrieval quota check and may consume a project retrieval allowance. A timeout can occur after quota has been reserved.
- The test page deliberately permits only one retrieval attempt per page load and does not automatically retry. Avoid repeated tests; reopening and submitting is a new request.
- The query and returned passage text are not written to the Teachers application D1 or intentionally logged by this diagnostic. BRVIN's normal retrieval accounting and content-free audit/diagnostic behavior still apply.
- The useful-retrieval and grant-revocation acceptance has been recorded. Remove this temporary diagnostic route when no longer needed for operator support, unless it is deliberately retained as an operator-only diagnostic.
