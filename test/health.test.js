import assert from "node:assert/strict";
import test from "node:test";
import { handleRequest } from "../src/health.js";

test("health is safe and reports operator runtime", async () => {
  const response = handleRequest(new Request("https://example.test/health"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.app, "brvin-teachers");
  assert.equal(body.status, "operator-console");
  assert.equal(body.version, "0.2.0-operator-foundation");
  assert.equal("tenantCount" in body, false);
});

test("root advertises the protected operator route", async () => {
  const body = await (await handleRequest(new Request("https://example.test/"))).json();
  assert.equal(body.operatorPath, "/operator");
});

test("unknown routes return 404", async () => {
  const response = handleRequest(new Request("https://example.test/nope"));
  assert.equal(response.status, 404);
});
