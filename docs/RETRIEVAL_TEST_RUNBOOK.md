# BRVIN Teachers — Temporary Retrieval Test

**Purpose:** Verify that an indexed teacher PDF can be searched through the actual production BRVIN v2 retrieval path and that returned passages retain their physical PDF page provenance.

## Access

After the feature is deployed, open:

`https://brvin-teachers.thenewtongs.workers.dev/operator/retrieval-test`

The route is part of the existing Operator Console Worker and is protected by the same Cloudflare Access identity check. It is not a public API and does not expose a standalone endpoint on the private `brvin-service` Worker.

## Test procedure

1. Sign in through Cloudflare Access as an authorized operator.
2. Open the retrieval test page.
3. Select the authorised project. Projects are shown only when they are both mapped in the Teachers application D1 and returned by BRVIN's authorised-project RPC.
4. Use one question grounded in the uploaded PDF. For the three-page Newton pilot, the initial question is:  
   `According to the document, what is the relationship between force, mass and acceleration?`
5. Keep the physical-page selection as `1,2,3` to combine semantic search with exact-page retrieval for each page. Clear the field to test semantic retrieval only.
6. Confirm the quota notice and select **Run one retrieval test** once.
7. Inspect each result's source title, **PDF page N**, section/printed-page metadata when present, and returned passage text.

The page permits one request per page load. A request is not automatically retried. Reloading the page and submitting again is another retrieval request.

## What constitutes useful evidence

For a successful source-level check:

- The endpoint returns `ok: true` through the private BRVIN v2 binding.
- At least one passage is returned for a relevant question.
- Each passage has the expected source title and a positive physical `pdfPage` value.
- The passage text actually supports the question, and the page number points to the corresponding page in the original PDF.
- For the initial three-page exact-page check, returned pages should fall within pages 1–3. Empty output is not a pass.

A successful HTTP/RPC response with zero passages proves that the private service was reached, but it does **not** prove that useful retrieval worked. A relevant passage with a plausible page number is not a substitute for checking the page against the original PDF when validating strict citation accuracy.

## Safety and limits

- The diagnostic calls `retrieveTeacherKnowledge`, which uses the existing app-to-project mapping and private `BRVIN_SERVICE` binding. BRVIN Core rechecks the active application/environment, project grant, ready source grants, and monthly quota on every retrieval.
- Do not call Cloudflare AI Search directly, query Core D1 from the consumer, or use Google Colab to bypass the binding. Those routes do not exercise the production authorisation boundary.
- No PDF is uploaded, downloaded, modified, re-OCRed or re-indexed by this diagnostic.
- The endpoint accepts one query up to 2,000 characters and up to three exact physical page numbers (maximum 2,000 each). It returns at most eight bounded passage excerpts and omits page-image payloads.
- A valid retrieval may consume the project's BRVIN search quota. The test page deliberately disables repeated clicks for that page load. Avoid repeated tests; the Core contract disables automatic retries because a timed-out request may already have reserved quota.
- The query and returned passage text are not written to the Teachers application D1 or intentionally logged by this diagnostic. BRVIN's normal retrieval accounting and content-free audit/diagnostic behavior still apply.
- Remove this temporary diagnostic route after the pilot retrieval acceptance has been recorded, unless it is deliberately retained as an operator-only support tool.
