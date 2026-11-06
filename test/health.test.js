import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../src/health.js";

test("GET /health returns a safe bootstrap health response", async () => {
  const response = handleRequest(new Request("https://example.test/health"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");

  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.app, "brvin-teachers");
  assert.equal(body.status, "bootstrap");
  assert.equal(body.version, "0.1.0-bootstrap");
});

test("GET / returns the bootstrap application status", async () => {
  const response = handleRequest(new Request("https://example.test/"));

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.app, "brvin-teachers");
  assert.equal(body.status, "bootstrap");
});

test("unknown routes return JSON 404", async () => {
  const response = handleRequest(new Request("https://example.test/not-found"));

  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.error, "NOT_FOUND");
});
