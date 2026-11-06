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

test("operator shell has a restrictive CSP", async () => {
  const response = await handleOperatorRequest(request("/operator"), {}, access);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.match(await response.text(), /Create teacher/);
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
