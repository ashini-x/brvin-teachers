import assert from "node:assert/strict";
import test from "node:test";
import {
  handleBrvinConnectionProbe,
  listTeacherKnowledgeProjects,
  retrieveTeacherKnowledge,
} from "../src/brvin-v2.js";

const TENANT_A = "00000000-0000-4000-8000-000000000101";
const TENANT_B = "00000000-0000-4000-8000-000000000202";
const PROJECT_A = "physics-project";
const PROJECT_B = "legacy-opaque-project";
const CHALLENGE_ID = "00000000-0000-4000-8000-000000000303";
const NONCE = "a".repeat(64);
const PROOF = "b".repeat(64);

class FakeD1 {
  constructor(rows = []) {
    this.rows = rows;
    this.queries = [];
  }

  prepare(sql) {
    const db = this;
    const statement = {
      values: [],
      bind(...values) {
        this.values = values;
        return this;
      },
      async first() {
        db.queries.push({ sql, values: this.values, method: "first" });
        if (sql.includes("FROM tenant_brvin_projects")) {
          return db.rows.find(row =>
            row.tenant_id === this.values[0] &&
            row.brvin_project_id === this.values[1] &&
            row.provisioning_status === "active"
          ) ?? null;
        }
        return null;
      },
      async all() {
        db.queries.push({ sql, values: this.values, method: "all" });
        if (sql.includes("FROM tenant_brvin_projects")) {
          return {
            results: db.rows.filter(row =>
              row.tenant_id === this.values[0] && row.provisioning_status === "active"
            ),
          };
        }
        return { results: [] };
      },
    };
    return statement;
  }
}

function projectRow(tenantId, projectId, status = "active") {
  return {
    tenant_id: tenantId,
    brvin_project_id: projectId,
    project_ref: "TCH-000001-PRJ-001",
    provisioning_status: status,
  };
}

test("lists only Core-authorised projects that are also mapped to this teacher", async () => {
  const db = new FakeD1([
    projectRow(TENANT_A, PROJECT_A),
    projectRow(TENANT_A, PROJECT_B),
    projectRow(TENANT_A, "paused-project", "revoked"),
    projectRow(TENANT_B, "other-teacher-project"),
  ]);
  let listCalls = 0;
  const env = {
    DB: db,
    BRVIN_SERVICE: {
      async listAuthorizedProjectsV2() {
        listCalls += 1;
        return {
          ok: true,
          data: [
            { projectId: PROJECT_A, name: "Physics", ready: true },
            { projectId: "not-mapped", name: "Other", ready: true },
            { projectId: PROJECT_B, name: "Legacy classroom", ready: false },
          ],
        };
      },
    },
  };

  const result = await listTeacherKnowledgeProjects(env, TENANT_A);

  assert.deepEqual(result, {
    ok: true,
    data: [
      { projectId: PROJECT_A, name: "Physics", ready: true },
      { projectId: PROJECT_B, name: "Legacy classroom", ready: false },
    ],
  });
  assert.equal(listCalls, 1);
  assert.deepEqual(db.queries[0].values, [TENANT_A]);
});

test("does not call Core when the teacher has no active local project mapping", async () => {
  const db = new FakeD1([projectRow(TENANT_A, "revoked-project", "revoked")]);
  let listCalls = 0;
  const result = await listTeacherKnowledgeProjects({
    DB: db,
    BRVIN_SERVICE: { async listAuthorizedProjectsV2() { listCalls += 1; return { ok: true, data: [] }; } },
  }, TENANT_A);

  assert.deepEqual(result, { ok: true, data: [] });
  assert.equal(listCalls, 0);
});

test("requires a valid tenant and a configured private binding", async () => {
  assert.equal((await listTeacherKnowledgeProjects({}, "not-a-tenant")).code, "INVALID_REQUEST");
  assert.equal((await listTeacherKnowledgeProjects({ DB: new FakeD1() }, TENANT_A)).code, "BRVIN_UNAVAILABLE");
});

test("preserves Core's structured authorization failure without retrying", async () => {
  const db = new FakeD1([projectRow(TENANT_A, PROJECT_A)]);
  let retrievalCalls = 0;
  const coreFailure = {
    ok: false,
    code: "PROJECT_NOT_AUTHORIZED",
    message: "The project is not authorised.",
    retryable: false,
  };
  const result = await retrieveTeacherKnowledge({
    DB: db,
    BRVIN_SERVICE: {
      async retrieveProjectContextV2() { retrievalCalls += 1; return coreFailure; },
    },
  }, {
    tenantId: TENANT_A,
    projectId: PROJECT_A,
    queries: ["force and motion"],
  });

  assert.deepEqual(result, coreFailure);
  assert.equal(retrievalCalls, 1);
});

test("requires an active local mapping before calling Core", async () => {
  const db = new FakeD1([projectRow(TENANT_B, PROJECT_A)]);
  let retrievalCalls = 0;
  const result = await retrieveTeacherKnowledge({
    DB: db,
    BRVIN_SERVICE: {
      async retrieveProjectContextV2() { retrievalCalls += 1; return { ok: true, data: {} }; },
    },
  }, {
    tenantId: TENANT_A,
    projectId: PROJECT_A,
    queries: ["force"],
  });

  assert.equal(result.code, "PROJECT_NOT_MAPPED_TO_TENANT");
  assert.equal(retrievalCalls, 0);
});

test("normalizes bounded queries and preserves opaque project IDs and PDF pages", async () => {
  const db = new FakeD1([projectRow(TENANT_A, PROJECT_B)]);
  let received;
  const expected = { ok: true, data: { passages: [], searchedSources: 1, searchCount: 1 } };
  const result = await retrieveTeacherKnowledge({
    DB: db,
    BRVIN_SERVICE: {
      async retrieveProjectContextV2(input) { received = input; return expected; },
    },
  }, {
    tenantId: TENANT_A,
    projectId: PROJECT_B,
    queries: ["  Newton's   second law  ", "Newton's second law"],
    pageNumbers: [3],
    requestId: "pilot-request-03",
  });

  assert.deepEqual(result, expected);
  assert.deepEqual(received, {
    projectId: PROJECT_B,
    queries: ["Newton's second law"],
    pageNumbers: [3],
    requestId: "pilot-request-03",
  });
});

test("rejects malformed, unbounded or contract-incompatible retrieval inputs before Core", async () => {
  const db = new FakeD1([projectRow(TENANT_A, PROJECT_A)]);
  let retrievalCalls = 0;
  const env = {
    DB: db,
    BRVIN_SERVICE: {
      async retrieveProjectContextV2() { retrievalCalls += 1; return { ok: true, data: {} }; },
    },
  };
  const invalidInputs = [
    { tenantId: TENANT_A, projectId: PROJECT_A },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: "force" },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: ["a", "b", "c", "d"] },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: ["x".repeat(2001)] },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: ["bad\u0000query"] },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: [], pageNumbers: [] },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: [], pageNumbers: [0] },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: [], pageNumbers: [100001] },
    { tenantId: TENANT_A, projectId: PROJECT_A, queries: ["force"], requestId: "bad\nrequest" },
    { tenantId: TENANT_A, projectId: " padded ", queries: ["force"] },
    { tenantId: TENANT_A, projectId: "x".repeat(129), queries: ["force"] },
    { tenantId: "not-a-tenant", projectId: PROJECT_A, queries: ["force"] },
  ];

  for (const input of invalidInputs) {
    const result = await retrieveTeacherKnowledge(env, input);
    assert.equal(result.ok, false, JSON.stringify(input));
    assert.equal(result.code, "INVALID_REQUEST", JSON.stringify(input));
  }
  assert.equal(retrievalCalls, 0);
});

test("does not retry a thrown retrieval call and returns a safe unavailable result", async () => {
  const db = new FakeD1([projectRow(TENANT_A, PROJECT_A)]);
  let calls = 0;
  const result = await retrieveTeacherKnowledge({
    DB: db,
    BRVIN_SERVICE: {
      async retrieveProjectContextV2() { calls += 1; throw new Error("private service detail"); },
    },
  }, {
    tenantId: TENANT_A,
    projectId: PROJECT_A,
    queries: ["force"],
  });

  assert.deepEqual(result, {
    ok: false,
    code: "BRVIN_UNAVAILABLE",
    message: "The private BRVIN retrieval service is temporarily unavailable.",
    retryable: true,
  });
  assert.equal(calls, 1);
});

test("connection probe preflight is no-store and does not enable credentialed CORS", async () => {
  const response = await handleBrvinConnectionProbe(
    new Request("https://app.example/brvin/connection-probe", { method: "OPTIONS" }),
    {},
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.headers.get("access-control-allow-methods"), "POST, OPTIONS");
  assert.equal(response.headers.get("access-control-allow-credentials"), null);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("connection probe accepts only POST and OPTIONS", async () => {
  const response = await handleBrvinConnectionProbe(
    new Request("https://app.example/brvin/connection-probe", { method: "GET" }),
    {},
  );
  assert.equal(response.status, 405);
  assert.deepEqual(await response.json(), { ok: false, error: "METHOD_NOT_ALLOWED" });
});

test("connection probe fails safely when the private binding is absent", async () => {
  const response = await handleBrvinConnectionProbe(
    new Request("https://app.example/brvin/connection-probe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId: CHALLENGE_ID, nonce: NONCE }),
    }),
    {},
  );
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: "BRVIN_UNAVAILABLE" });
});

test("connection probe rejects malformed, extra, oversized and non-JSON requests", async () => {
  const binding = { async proveConnectionV2() { throw new Error("must not be called"); } };
  const cases = [
    { headers: { "content-type": "application/json" }, body: "not-json" },
    { headers: { "content-type": "text/plain" }, body: "{}" },
    { headers: { "content-type": "application/json" }, body: JSON.stringify({ challengeId: CHALLENGE_ID }) },
    { headers: { "content-type": "application/json" }, body: JSON.stringify({ challengeId: "wrong", nonce: NONCE }) },
    { headers: { "content-type": "application/json" }, body: JSON.stringify({ challengeId: CHALLENGE_ID, nonce: "short" }) },
    { headers: { "content-type": "application/json" }, body: JSON.stringify({ challengeId: CHALLENGE_ID, nonce: NONCE, projectId: PROJECT_A }) },
    { headers: { "content-type": "application/json" }, body: "x".repeat(5000) },
  ];

  for (const input of cases) {
    const response = await handleBrvinConnectionProbe(
      new Request("https://app.example/brvin/connection-probe", {
        method: "POST",
        headers: input.headers,
        body: input.body,
      }),
      { BRVIN_SERVICE: binding },
    );
    assert.ok(response.status === 400 || response.status === 413);
    assert.deepEqual(await response.json(), { ok: false, error: "INVALID_REQUEST" });
  }
});

test("connection probe sends only challenge and nonce and returns only the proof", async () => {
  let received;
  const response = await handleBrvinConnectionProbe(
    new Request("https://app.example/brvin/connection-probe", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ challengeId: CHALLENGE_ID, nonce: NONCE }),
    }),
    {
      BRVIN_SERVICE: {
        async proveConnectionV2(input) {
          received = input;
          return {
            ok: true,
            data: { challengeId: CHALLENGE_ID, proof: PROOF, ready: true, authorizedSourceCount: 1 },
          };
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(received, { challengeId: CHALLENGE_ID, nonce: NONCE });
  assert.deepEqual(await response.json(), { ok: true, proof: PROOF });
});

test("connection probe never exposes Core failure details", async () => {
  const response = await handleBrvinConnectionProbe(
    new Request("https://app.example/brvin/connection-probe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId: CHALLENGE_ID, nonce: NONCE }),
    }),
    {
      BRVIN_SERVICE: {
        async proveConnectionV2() {
          return {
            ok: false,
            code: "INVALID_REQUEST",
            message: "Internal identity and challenge details",
            retryable: false,
          };
        },
      },
    },
  );

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { ok: false, error: "PROBE_REJECTED" });
});

test("connection probe maps a private service outage to a safe retryable response", async () => {
  const response = await handleBrvinConnectionProbe(
    new Request("https://app.example/brvin/connection-probe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId: CHALLENGE_ID, nonce: NONCE }),
    }),
    {
      BRVIN_SERVICE: {
        async proveConnectionV2() {
          return { ok: false, code: "BRVIN_UNAVAILABLE", message: "private detail", retryable: true };
        },
      },
    },
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: "BRVIN_UNAVAILABLE" });
});

test("connection probe rejects a mismatched or malformed proof response", async () => {
  const invalidResults = [
    { ok: true, data: { challengeId: "another-challenge", proof: PROOF } },
    { ok: true, data: { challengeId: CHALLENGE_ID, proof: "not-a-proof" } },
  ];

  for (const result of invalidResults) {
    const response = await handleBrvinConnectionProbe(
      new Request("https://app.example/brvin/connection-probe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: CHALLENGE_ID, nonce: NONCE }),
      }),
      { BRVIN_SERVICE: { async proveConnectionV2() { return result; } } },
    );
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false, error: "PROBE_REJECTED" });
  }
});
