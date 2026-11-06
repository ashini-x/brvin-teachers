import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ENVIRONMENT_ID = "515e7752-20ff-42f9-b393-7c8130a64bf8";

test("management and retrieval Service Bindings use the BRVIN-issued production identity", async () => {
  const config = await readFile(new URL("../cloudflare.config.ts", import.meta.url), "utf8");
  assert.match(config, /worker:\s*"parmar-ai"[\s\S]*?exportName:\s*"BrvinTeachersManagementApi"[\s\S]*?props:\s*\{\s*applicationEnvironmentId:\s*"515e7752-20ff-42f9-b393-7c8130a64bf8"\s*\}/u);
  assert.match(config, /BRVIN_SERVICE:\s*bindings\.worker\(\{[\s\S]*?worker:\s*"brvin-service"[\s\S]*?exportName:\s*"BrvinRetrievalApi"[\s\S]*?props:\s*\{\s*applicationEnvironmentId:\s*"515e7752-20ff-42f9-b393-7c8130a64bf8"\s*\}/u);
  assert.equal((config.match(new RegExp(ENVIRONMENT_ID, "gu")) ?? []).length, 2);
});

test("the content-free connection probe accepts only challengeId and nonce", async () => {
  const source = await readFile(new URL("../src/brvin-v2.js", import.meta.url), "utf8");
  assert.match(source, /Object\.keys\(body\)\.length !== 2/u);
  assert.match(source, /key !== "challengeId" && key !== "nonce"/u);
  assert.match(source, /env\.BRVIN_SERVICE\.proveConnectionV2\(/u);
  assert.match(source, /safeResponse\(200, \{ ok: true, proof: result\.data\.proof \}/u);
});
