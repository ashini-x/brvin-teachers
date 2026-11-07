import assert from "node:assert/strict";
import test from "node:test";
import { buildSourceProgressModel } from "../src/operator-client.js";

const source = {
  id: "cbe1dc5d-ac02-4809-ac18-7e00ac305c96",
  reference: "TCH-000001-PRJ-001-COL-001-SRC-001",
  title: "Physics Notes",
  filename: "physics.pdf",
  size: 77384,
  pageCount: 3,
  status: "processing",
  indexedPages: 0
};

test("the stepper reaches Ready only after Core confirms completed status and all gates", () => {
  const model = buildSourceProgressModel({
    import: { status: "completed", expectedSize: source.size, uploadedBytes: source.size, indexedPages: 3, expectedPages: 3, updatedAt: 1793952632673 },
    pipeline: { vision: { status: "completed" }, workflow: { status: "complete" } },
    events: [
      { phase: "verification", type: "qa.passed", status: "completed", message: "Page-grounded retrieval QA passed.", createdAt: 1793952632000 },
      { phase: "index", type: "index.progress", status: "completed", message: "Indexed all 3 pages.", createdAt: 1793952631000 }
    ]
  }, source);

  assert.equal(model.overallState, "ready");
  assert.equal(model.overallLabel, "Ready");
  assert.equal(model.progressPercent, 100);
  assert.deepEqual(model.stages.map(stage => stage.state), ["completed", "completed", "completed", "completed", "completed"]);
});

test("an index chunk failure marks Page indexing red and preserves the precise Core error", () => {
  const message = "Could not read Vision OCR output for page 1. No such object: bucket/brvin/temporary-vision-ocr/source/ocr/output-1-to-1.json";
  const model = buildSourceProgressModel({
    import: { status: "failed", expectedSize: source.size, uploadedBytes: source.size, indexedPages: 0, expectedPages: 3, error: message },
    pipeline: { vision: { status: "completed" }, workflow: { status: "errored", error: { message } } },
    events: [
      { phase: "workflow", type: "workflow.exception", status: "failed", message, details: { task: "index_chunk" }, createdAt: 1793952633084 },
      { phase: "index", type: "index.chunk_started", status: "running", message: "Indexing PDF pages 1–3.", details: { task: "index_chunk" }, createdAt: 1793952312431 }
    ]
  }, source);

  assert.equal(model.overallState, "failed");
  assert.equal(model.failureStage, 2);
  assert.equal(model.stages[0].state, "completed");
  assert.equal(model.stages[1].state, "completed");
  assert.equal(model.stages[2].state, "failed");
  assert.equal(model.stages[2].error, message);
  assert.equal(model.stages[3].state, "pending");
  assert.equal(model.stages[4].state, "pending");
});

test("a Retrieval QA failure is assigned to the verification step, not indexing", () => {
  const message = "Retrieval verification could not find a page-grounded passage for PDF page 2.";
  const model = buildSourceProgressModel({
    import: { status: "failed", expectedSize: source.size, uploadedBytes: source.size, indexedPages: 3, expectedPages: 3 },
    pipeline: { vision: { status: "completed" }, workflow: { status: "errored", error: { message } } },
    events: [
      { phase: "verification", type: "workflow.exception", status: "failed", message, details: { task: "quality_check" }, createdAt: 1793952633084 },
      { phase: "index", type: "index.completed", status: "completed", message: "All 3 pages indexed.", createdAt: 1793952632000 }
    ]
  }, source);

  assert.equal(model.failureStage, 3);
  assert.equal(model.stages[2].state, "completed");
  assert.equal(model.stages[3].state, "failed");
  assert.equal(model.stages[3].error, message);
  assert.equal(model.stages[4].state, "pending");
});

test("Vision OCR errors are shown at the OCR step", () => {
  const message = "Google Vision OCR failed: permission denied writing output";
  const model = buildSourceProgressModel({
    import: { status: "failed", expectedSize: source.size, uploadedBytes: source.size, indexedPages: 0, expectedPages: 3, error: message },
    pipeline: { vision: { status: "completed", error: message }, workflow: { status: "errored", error: { message } } },
    events: [
      { phase: "ocr", type: "workflow.exception", status: "failed", message, details: { task: "vision" }, createdAt: 1793952633084 }
    ]
  }, source);

  assert.equal(model.failureStage, 1);
  assert.equal(model.stages[1].state, "failed");
  assert.equal(model.stages[1].error, message);
});

test("a partial transfer displays the server-saved offset and asks for the same PDF to resume", () => {
  const model = buildSourceProgressModel({
    import: { status: "uploading", expectedSize: 1000, uploadedBytes: 400, indexedPages: 0, expectedPages: 4 }
  }, { ...source, status: "uploading", size: 1000, pageCount: 4 });

  assert.equal(model.overallState, "uploading");
  assert.equal(model.uploadPercent, 40);
  assert.equal(model.uploadPaused, true);
  assert.match(model.stages[0].detail, /select the same PDF again/i);
  assert.equal(model.stages[0].state, "active");
});

test("the live chunk-transfer model uses browser byte progress while Core status is catching up", () => {
  const transfer = { id: source.id, totalBytes: 1000, uploadedBytes: 650, active: true };
  const model = buildSourceProgressModel({
    import: { status: "uploading", expectedSize: 1000, uploadedBytes: 500, indexedPages: 0, expectedPages: 4 }
  }, { ...source, status: "uploading", size: 1000, pageCount: 4 }, transfer);

  assert.equal(model.transferActive, true);
  assert.equal(model.uploadedBytes, 650);
  assert.equal(model.uploadPercent, 65);
  assert.equal(model.stages[0].state, "active");
});

test("active Vision OCR advances the stepper after secure upload", () => {
  const model = buildSourceProgressModel({
    import: { status: "processing", expectedSize: source.size, uploadedBytes: source.size, indexedPages: 0, expectedPages: 3 },
    pipeline: { vision: { status: "running" }, workflow: { status: "running" } },
    events: [{ phase: "ocr", type: "ocr.submitted", status: "running", message: "Google Cloud Vision accepted the PDF.", createdAt: 1793952273977 }]
  }, source);

  assert.equal(model.stages[0].state, "completed");
  assert.equal(model.stages[1].state, "active");
});
