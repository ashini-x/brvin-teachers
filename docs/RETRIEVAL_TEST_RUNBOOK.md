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

## What constitutes useful semantic-search evidence

- The endpoint returns `ok: true` through the private BRVIN v2 binding.
- The result summary says **Semantic search** (not exact-page lookup).
- At least one passage is returned for a relevant question.
- Each passage has the expected source title and a positive physical `pdfPage` value.
- The text actually answers or supports the question, and the cited page points to the corresponding location in the original PDF.

A successful HTTP/RPC response with zero passages proves that the private service was reached, but it does **not** prove that useful retrieval worked. A relevant passage with a plausible page number is not a substitute for checking the page against the original PDF when validating strict citation accuracy.

## Safety and limits

- The diagnostic calls `retrieveTeacherKnowledge`, which uses the existing app-to-project mapping and private `BRVIN_SERVICE` binding. BRVIN Core rechecks the active application/environment, project grant, ready source grants, and monthly quota on every retrieval.
- Do not call Cloudflare AI Search directly, query Core D1 from the consumer, or use Google Colab to bypass the binding. Those routes do not exercise the production authorisation boundary.
- No PDF is uploaded, downloaded, modified, re-OCRed or re-indexed by this diagnostic.
- The endpoint accepts one query up to 2,000 characters and up to three exact physical page numbers (maximum 2,000 each). It returns at most eight bounded passage excerpts and omits page-image payloads.
- Both semantic and exact-page requests pass through the BRVIN retrieval quota check and may consume a project retrieval allowance. A timeout can occur after quota has been reserved.
- The test page deliberately permits only one retrieval attempt per page load and does not automatically retry. Avoid repeated tests; reopening and submitting is a new request.
- The query and returned passage text are not written to the Teachers application D1 or intentionally logged by this diagnostic. BRVIN's normal retrieval accounting and content-free audit/diagnostic behavior still apply.
- Remove this temporary diagnostic route after the pilot retrieval acceptance has been recorded, unless it is deliberately retained as an operator-only support tool.
