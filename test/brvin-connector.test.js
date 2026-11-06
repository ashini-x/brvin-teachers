import assert from "node:assert/strict";
import test from "node:test";
import {
  createBrvinConnector,
  formatBrvinCitation,
  formatBrvinEvidence,
} from "../src/brvin-connector/src/index.ts";

const PASSAGE = {
  id: "passage-1",
  bookId: "source-1",
  bookTitle: "Newton's Laws — Teacher Pilot",
  pdfPage: 3,
  printedPage: "12",
  section: "Newton's second law",
  text: "Force equals mass multiplied by acceleration.",
  score: 0.91,
};

test("connector preserves source and physical PDF-page provenance", async () => {
  const connector = createBrvinConnector({
    async retrieveProjectContextV2(input) {
      assert.equal(input.projectId, "opaque-project");
      assert.deepEqual(input.queries, ["Newton's second law"]);
      assert.equal(input.requestId, "pilot-request-03");
      return { ok: true, data: { passages: [PASSAGE], searchedSources: 1, searchCount: 1 } };
    },
    async listAuthorizedProjectsV2() { return { ok: true, data: [] }; },
    async getProjectStatusV2() { return { ok: true, data: { projectId: "opaque-project", ready: true, authorizedSourceCount: 1 } }; },
  });
  const result = await connector.retrieveProjectContext({
    projectId: "opaque-project",
    queries: [" Newton's   second law "],
    requestId: "pilot-request-03",
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.passages[0].bookId, "source-1");
  assert.equal(result.data.passages[0].pdfPage, 3);
  assert.equal(formatBrvinCitation(PASSAGE), "Newton's Laws — Teacher Pilot — PDF page 3 (printed page 12) — Newton's second law");
  assert.match(formatBrvinEvidence([PASSAGE]), /PDF page 3/u);
  assert.match(formatBrvinEvidence([PASSAGE]), /Force equals mass/u);
});

test("connector enforces its response-size bound", async () => {
  const connector = createBrvinConnector({
    async retrieveProjectContextV2() {
      return { ok: true, data: { passages: [], payload: "x".repeat(4096) } };
    },
    async listAuthorizedProjectsV2() { return { ok: true, data: [] }; },
    async getProjectStatusV2() { return { ok: true, data: { projectId: "p", ready: true, authorizedSourceCount: 1 } }; },
  }, { maxResponseBytes: 1024 });
  const result = await connector.retrieveProjectContext({ projectId: "p", queries: ["force"] });
  assert.equal(result.ok, false);
  assert.equal(result.code, "RETRIEVAL_FAILED");
  assert.equal(result.retryable, false);
});

test("connector applies a deadline and never automatically retries", async () => {
  let calls = 0;
  const connector = createBrvinConnector({
    async retrieveProjectContextV2() {
      calls += 1;
      return new Promise(() => {});
    },
    async listAuthorizedProjectsV2() { return { ok: true, data: [] }; },
    async getProjectStatusV2() { return { ok: true, data: { projectId: "p", ready: true, authorizedSourceCount: 1 } }; },
  }, { timeoutMs: 1 });
  const result = await connector.retrieveProjectContext({ projectId: "p", queries: ["force"] });
  assert.equal(result.ok, false);
  assert.equal(result.code, "BRVIN_UNAVAILABLE");
  assert.equal(result.retryable, false);
  assert.equal(calls, 1);
  assert.match(result.userMessage, /Do not automatically repeat/u);
});
