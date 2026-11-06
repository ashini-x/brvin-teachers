import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { sha256File } from "../src/sha256.js";

const expected = (value) => createHash("sha256").update(value).digest("hex").toUpperCase();

test("streaming PDF hash matches SHA-256 known answers", async () => {
  for (const value of ["", "abc", "The quick brown fox jumps over the lazy dog"]) {
    const blob = new Blob([value]);
    assert.equal(await sha256File(blob), expected(value));
  }
});

test("streaming PDF hash works across multiple 4 MiB reads and reports progress", async () => {
  const bytes = new Uint8Array(9 * 1024 * 1024 + 37);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = (index * 31 + 7) & 0xff;
  const blob = new Blob([bytes]);
  const progress = [];
  assert.equal(await sha256File(blob, (done, total) => progress.push([done, total])), expected(bytes));
  assert.deepEqual(progress.map(([done]) => done), [4 * 1024 * 1024, 8 * 1024 * 1024, bytes.length]);
  assert.ok(progress.every(([, total]) => total === bytes.length));
});
