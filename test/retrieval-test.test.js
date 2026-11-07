import assert from "node:assert/strict";
import test from "node:test";
import {
  handleRetrievalTestRoute,
  parseRetrievalTestInput,
  safePassages,
} from "../src/retrieval-test.js";

const TENANT_ID = "031d5e49-4a29-41b4-a324-6be7f67d396f";
const PROJECT_ID = "448249b4-fed9-45f5-9137-6014f242ddbe";
const PROJECT_REF = "TCH-000001-PRJ-001";

function passage(overrides = {}) {
  return {
    id: "passage-2",
    bookId: "book-1",
    bookTitle: "Force and Laws of Motion - Class IX pilot handout",
    pdfPage: 2,
    text: "The force acting on an object is equal to the product of its mass and acceleration.",
    score: 0.87,
    ...overrides,
  };
}

class FakeD1 {
  constructor() {
    this.queries = [];
  }

  prepare(sql) {
    const db = this;
    return {
      values: [],
      bind(...values) {
        this.values = values;
        return this;
      },
      async first() {
        db.queries.push({ sql, values: this.values, method: "first" });
        if (sql.includes("JOIN teachers t")) {
          return {
            tenant_id: TENANT_ID,
            project_id: PROJECT_ID,
            project_ref: PROJECT_REF,
            name: "Physics - Newton's Laws of Motion",
          };
        }
        if (sql.includes("FROM tenant_brvin_projects")) {
          return {
            tenant_id: TENANT_ID,
            brvin_project_id: PROJECT_ID,
            project_ref: PROJECT_REF,
            provisioning_status: "active",
          };
        }
        return null;
      },
      async all() {
        db.queries.push({ sql, values: this.values, method: "all" });
        if (sql.includes("FROM teachers WHERE status='active'")) {
          return { results: [{ id: TENANT_ID, tenant_ref: "TCH-000001" }] };
        }
        if (sql.includes("FROM tenant_brvin_projects")) {
          return { results: [{
            tenant_id: TENANT_ID,
            brvin_project_id: PROJECT_ID,
            project_ref: PROJECT_REF,
            name: "Physics - Newton's Laws of Motion",
            subject: "Physics",
            provisioning_status: "active",
          }] };
        }
        return { results: [] };
      },
    };
  }
}

function postRequest(body, origin = "https://example.test") {
  return new Request("https://example.test/operator/api/retrieval-test", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("validates bounded retrieval input and up to three physical PDF pages", () => {
  assert.deepEqual(parseRetrievalTestInput({
    projectReference: PROJECT_REF,
    query: "  Explain Newton's   second law. ",
    pageNumbers: [1, 2, 3],
  }), {
    projectReference: PROJECT_REF,
    query: "Explain Newton's second law.",
    pageNumbers: [1, 2, 3],
  });

  assert.equal(parseRetrievalTestInput({ projectReference: PROJECT_REF, query: " " }), null);
  assert.equal(parseRetrievalTestInput({ projectReference: PROJECT_REF, query: "x".repeat(2001) }), null);
  assert.equal(parseRetrievalTestInput({ projectReference: PROJECT_REF, query: "force", pageNumbers: [1, 2, 3, 4] }), null);
  assert.equal(parseRetrievalTestInput({ projectReference: PROJECT_REF, query: "force", pageNumbers: [1, 2001] }), null);
  assert.equal(parseRetrievalTestInput({ projectReference: " " + PROJECT_REF, query: "force" }), null);
});

test("returns only page-grounded, bounded passage evidence", () => {
  const results = safePassages([
    passage(),
    passage({ pdfPage: 0 }),
    passage({ pdfPage: 3, text: "z".repeat(2000) }),
  ]);
  assert.equal(results.length, 2);
  assert.equal(results[0].pdfPage, 2);
  assert.equal(results[0].bookTitle, "Force and Laws of Motion - Class IX pilot handout");
  assert.equal(results[1].text.length, 1800);
});

test("protected diagnostic page uses no-store and a restrictive CSP", async () => {
  const response = await handleRetrievalTestRoute(
    new Request("https://example.test/operator/retrieval-test"),
    {},
    "/operator/retrieval-test",
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-security-policy"), /script-src 'self'/);
  const html = await response.text();
  assert.match(html, /PDF retrieval test/);
  assert.match(html, /value="" placeholder="Leave blank for semantic search"/);
  assert.match(html, /semantic search is the default/i);
  assert.match(html, /Exact-page lookup override/);
});

test("cross-origin diagnostic writes are rejected before accessing D1", async () => {
  let databaseCalls = 0;
  const response = await handleRetrievalTestRoute(
    postRequest({ projectReference: PROJECT_REF, query: "force" }, "https://attacker.test"),
    { get DB() { databaseCalls += 1; return new FakeD1(); } },
    "/operator/api/retrieval-test",
  );
  assert.equal(response.status, 403);
  assert.equal(databaseCalls, 0);
});

test("live test resolves project reference server-side and preserves Core PDF page provenance", async () => {
  const DB = new FakeD1();
  let received;
  let calls = 0;
  const BRVIN_SERVICE = {
    async retrieveProjectContextV2(input) {
      calls += 1;
      received = input;
      return {
        ok: true,
        data: {
          passages: [passage()],
          searchedSources: 1,
          searchCount: 1,
        },
      };
    },
  };
  const response = await handleRetrievalTestRoute(
    postRequest({
      projectReference: PROJECT_REF,
      query: "Explain Newton's second law.",
      pageNumbers: [1, 2, 3],
    }),
    { DB, BRVIN_SERVICE },
    "/operator/api/retrieval-test",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.projectReference, PROJECT_REF);
  assert.equal(body.retrievalMode, "semantic");
  assert.equal(body.pageLookupRequested, true);
  assert.equal(body.passages[0].pdfPage, 2);
  assert.equal(body.passages[0].bookTitle, "Force and Laws of Motion - Class IX pilot handout");
  assert.equal(calls, 1);
  assert.deepEqual(received, {
    projectId: PROJECT_ID,
    queries: ["Explain Newton's second law."],
    pageNumbers: [1, 2, 3],
    requestId: received.requestId,
  });
  assert.match(received.requestId, /^[a-f0-9-]{36}$/u);
});

test("reports exact-page retrieval separately and states semantic search was skipped", async () => {
  const DB = new FakeD1();
  let received;
  const BRVIN_SERVICE = {
    async retrieveProjectContextV2(input) {
      received = input;
      return {
        ok: true,
        data: {
          passages: [passage({ pdfPage: 1, text: "Full indexed text for PDF page one." })],
          searchedSources: 1,
          searchCount: 0,
        },
      };
    },
  };
  const response = await handleRetrievalTestRoute(
    postRequest({
      projectReference: PROJECT_REF,
      query: "Explain Newton's second law.",
      pageNumbers: [1, 2, 3],
    }),
    { DB, BRVIN_SERVICE },
    "/operator/api/retrieval-test",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.retrievalMode, "exact-page");
  assert.equal(body.pageLookupRequested, true);
  assert.equal(body.searchCount, 0);
  assert.equal(received.pageNumbers.length, 3);
  assert.match(body.passages[0].text, /Full indexed text/);
});

test("target list shows only projects confirmed by Core and mapped in app D1", async () => {
  const DB = new FakeD1();
  const BRVIN_SERVICE = {
    async listAuthorizedProjectsV2() {
      return {
        ok: true,
        data: [{
          projectId: PROJECT_ID,
          name: "Physics - Newton's Laws of Motion",
          ready: true,
          authorizedSourceCount: 1,
        }],
      };
    },
  };
  const response = await handleRetrievalTestRoute(
    new Request("https://example.test/operator/api/retrieval-test/targets"),
    { DB, BRVIN_SERVICE },
    "/operator/api/retrieval-test/targets",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.deepEqual(body.targets, [{
    projectReference: PROJECT_REF,
    projectName: "Physics - Newton's Laws of Motion",
    subject: "Physics",
    ready: true,
    authorizedSourceCount: 1,
  }]);
});

test("unknown paths are not intercepted", async () => {
  assert.equal(await handleRetrievalTestRoute(
    new Request("https://example.test/operator/other"),
    {},
    "/operator/other",
  ), null);
});
