import assert from "node:assert/strict";
import test from "node:test";
import { handleOperatorRequest } from "../src/operator.js";

const access = { access: { async getIdentity() { return { email: "operator@example.test", name: "Operator" }; } } };

class FakeD1 {
  constructor() { this.sequence = 0; this.teachers = []; }
  prepare(sql) {
    const db = this;
    return {
      sql,
      values: [],
      bind(...values) { this.values = values; return this; },
      async first() {
        if (sql.includes("FROM teachers WHERE id=?")) return db.teachers.find((item) => item.id === this.values[0]) ?? null;
        return null;
      },
      async all() {
        if (sql.includes("FROM teachers t WHERE")) {
          const query = this.values[0] === "%" ? "" : this.values[0].slice(1, -1);
          return { results: db.teachers.filter((item) => item.name.toLowerCase().includes(query) || item.tenant_ref.toLowerCase().includes(query)).map((item) => ({ ...item, last_activity_at: item.updated_at })) };
        }
        return { results: [] };
      },
      async run() {
        if (sql.startsWith("UPDATE teachers SET")) {
          const [name, display, updated, id] = this.values;
          const item = db.teachers.find((teacher) => teacher.id === id);
          if (!item) return { meta: { changes: 0 } };
          item.name = name;
          item.student_display_name = display;
          item.updated_at = updated;
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 1 } };
      }
    };
  }
  async batch(statements) {
    for (const statement of statements) {
      if (statement.sql.startsWith("UPDATE id_sequences")) this.sequence += 1;
      if (statement.sql.startsWith("INSERT INTO teachers")) {
        const [id, name, display, created, updated] = statement.values;
        this.teachers.push({
          id, tenant_ref: "TCH-" + String(this.sequence).padStart(6, "0"),
          name, student_display_name: display, status: "active", created_at: created, updated_at: updated
        });
      }
    }
    return [];
  }
}

function request(path, method = "GET", body) {
  const headers = body === undefined ? {} : { origin: "https://example.test", "content-type": "application/json" };
  return new Request("https://example.test" + path, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

test("Access identity is required", async () => {
  const response = await handleOperatorRequest(request("/operator"), {}, {});
  assert.equal(response.status, 401);
});

test("temporary retrieval diagnostic page remains behind Cloudflare Access", async () => {
  const denied = await handleOperatorRequest(request("/operator/retrieval-test"), {}, {});
  assert.equal(denied.status, 401);

  const allowed = await handleOperatorRequest(request("/operator/retrieval-test"), {}, access);
  assert.equal(allowed.status, 200);
  assert.match(await allowed.text(), /PDF retrieval test/);
});

test("operator shell has a restrictive CSP", async () => {
  const response = await handleOperatorRequest(request("/operator"), {}, access);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  const html = await response.text();
  assert.match(html, /Create teacher/);
  assert.match(html, /core-status-text/);
  assert.match(html, /Checking management link/);
  assert.match(html, /source-progress-dialog/);
  assert.doesNotMatch(html, /Management link pending/);
});

test("tenant references are generated and duplicate names are allowed", async () => {
  const db = new FakeD1();
  const first = await handleOperatorRequest(request("/operator/api/teachers", "POST", { name: "Aditya Ranjan", studentDisplayName: "Aditya Sir" }), { DB: db }, access);
  const firstBody = await first.json();
  const second = await handleOperatorRequest(request("/operator/api/teachers", "POST", { name: "Aditya Ranjan" }), { DB: db }, access);
  const secondBody = await second.json();
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(firstBody.teacher.reference, "TCH-000001");
  assert.equal(secondBody.teacher.reference, "TCH-000002");
  assert.notEqual(firstBody.teacher.id, secondBody.teacher.id);
  assert.equal(secondBody.teacher.studentDisplayName, "Aditya Ranjan");
});

test("invalid names and cross-origin writes are rejected", async () => {
  const db = new FakeD1();
  assert.equal((await handleOperatorRequest(request("/operator/api/teachers", "POST", { name: " " }), { DB: db }, access)).status, 400);
  const attack = new Request("https://example.test/operator/api/teachers", {
    method: "POST",
    headers: { origin: "https://attacker.test", "content-type": "application/json" },
    body: JSON.stringify({ name: "Other User" })
  });
  assert.equal((await handleOperatorRequest(attack, { DB: db }, access)).status, 403);
  assert.equal(db.teachers.length, 0);
});

test("rename preserves tenant UUID and reference", async () => {
  const db = new FakeD1();
  const created = await handleOperatorRequest(request("/operator/api/teachers", "POST", { name: "Radhika Goel" }), { DB: db }, access);
  const teacher = (await created.json()).teacher;
  const edited = await handleOperatorRequest(request("/operator/api/teachers/" + teacher.id, "PATCH", { name: "Radhika G.", studentDisplayName: "Radhika Ma'am" }), { DB: db }, access);
  const body = await edited.json();
  assert.equal(edited.status, 200);
  assert.equal(body.teacher.id, teacher.id);
  assert.equal(body.teacher.reference, teacher.reference);
  assert.equal(body.teacher.name, "Radhika G.");
});

test("operator API requires D1", async () => {
  const response = await handleOperatorRequest(request("/operator/api/teachers"), {}, access);
  assert.equal(response.status, 503);
});


test("teacher classroom APIs fail closed until the trusted BRVIN management binding is active", async () => {
  const db = new FakeD1();
  const created = await handleOperatorRequest(
    request("/operator/api/teachers", "POST", { name: "Physics Teacher" }),
    { DB: db },
    access
  );
  const teacher = (await created.json()).teacher;
  const response = await handleOperatorRequest(
    request("/operator/api/teachers/" + teacher.id + "/projects"),
    { DB: db },
    access
  );
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error, "BRVIN_MANAGEMENT_NOT_CONFIGURED");
  assert.equal(db.teachers.length, 1);
});


test("BRVIN management status is connected only after the private health RPC succeeds", async () => {
  const response = await handleOperatorRequest(
    request("/operator/api/brvin-management/health"),
    {
      DB: new FakeD1(),
      BRVIN_MANAGEMENT: {
        async health() {
          return { ok: true, application: "brvin-teachers", management: "ready" };
        }
      }
    },
    access
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    ok: true,
    status: "connected",
    application: "brvin-teachers",
    management: "ready"
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("BRVIN management status fails closed for missing or rejected health binding", async () => {
  const missing = await handleOperatorRequest(
    request("/operator/api/brvin-management/health"),
    { DB: new FakeD1() },
    access
  );
  assert.equal(missing.status, 503);
  assert.equal((await missing.json()).error, "BRVIN_MANAGEMENT_NOT_CONFIGURED");

  const rejected = await handleOperatorRequest(
    request("/operator/api/brvin-management/health"),
    {
      DB: new FakeD1(),
      BRVIN_MANAGEMENT: {
        async health() {
          return {
            ok: false,
            code: "APPLICATION_ENVIRONMENT_NOT_REGISTERED",
            message: "The BRVIN Teachers application environment is not registered or active."
          };
        }
      }
    },
    access
  );
  assert.equal(rejected.status, 502);
  assert.equal((await rejected.json()).error, "APPLICATION_ENVIRONMENT_NOT_REGISTERED");
});

test("source status is fetched through the tenant-scoped private BRVIN management binding", async () => {
  const db = new FakeD1();
  const created = await handleOperatorRequest(
    request("/operator/api/teachers", "POST", { name: "Physics Teacher" }),
    { DB: db },
    access
  );
  const teacher = (await created.json()).teacher;
  const projectId = "00000000-0000-4000-8000-000000000001";
  const collectionId = "00000000-0000-4000-8000-000000000002";
  const importId = "00000000-0000-4000-8000-000000000003";
  let received = null;
  const response = await handleOperatorRequest(
    request("/operator/api/teachers/" + teacher.id + "/projects/" + projectId + "/collections/" + collectionId + "/sources/" + importId + "/status"),
    {
      DB: db,
      BRVIN_MANAGEMENT: {
        async health() {
          return { ok: true, application: "brvin-teachers", management: "ready" };
        },
        async getTeacherSourceStatus(input) {
          received = input;
          return {
            ok: true,
            result: {
              import: { id: importId, status: "processing", uploadedBytes: 1000, expectedSize: 1000, indexedPages: 2, expectedPages: 4 },
              pipeline: { vision: { status: "completed" }, workflow: { status: "running" } },
              events: []
            }
          };
        }
      }
    },
    access
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(received, {
    tenantReference: teacher.reference,
    projectId,
    collectionId,
    importId
  });
  assert.equal(body.result.import.status, "processing");
  assert.equal(body.result.import.indexedPages, 2);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("source progress assets expose the accessible stepper and rotating-dot loader", async () => {
  const js = await handleOperatorRequest(request("/operator/assets/app.js"), { DB: new FakeD1() }, access);
  const css = await handleOperatorRequest(request("/operator/assets/app.css"), { DB: new FakeD1() }, access);
  assert.equal(js.status, 200);
  assert.equal(css.status, 200);
  const jsText = await js.text();
  const cssText = await css.text();
  assert.match(jsText, /buildSourceProgressModel/);
  assert.match(jsText, /getTeacherSourceStatus|\/status/);
  assert.match(cssText, /source-step-spinner/);
  assert.match(cssText, /@keyframes source-step-rotate/);
  assert.match(cssText, /prefers-reduced-motion/);
});
