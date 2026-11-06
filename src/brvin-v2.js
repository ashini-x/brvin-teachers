import { createBrvinConnector } from "./brvin-connector/src/index.ts";

const TENANT_UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/u;
const CHALLENGE_ID = TENANT_UUID;
const HEX_256 = /^[a-f0-9]{64}$/u;
const MAX_PROJECT_ID_LENGTH = 128;
const MAX_REQUEST_ID_LENGTH = 128;
const MAX_QUERY_LENGTH = 2000;
const MAX_QUERIES = 3;
const MAX_PAGE_NUMBERS = 3;
const MAX_PDF_PAGE = 100000;
const MAX_PROBE_BODY_BYTES = 4096;

function failure(code, message, retryable = false) {
  return { ok: false, code, message, retryable };
}

function validProjectId(value) {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_PROJECT_ID_LENGTH &&
    value.trim() === value &&
    !value.includes("\u0000");
}

function validRequestId(value) {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_REQUEST_ID_LENGTH &&
    value.trim() === value &&
    !/[\u0000-\u001f\u007f]/u.test(value);
}

function parseRetrievalInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (!validProjectId(input.projectId) || !Array.isArray(input.queries) || input.queries.length > MAX_QUERIES) return null;
  if (input.pageNumbers !== undefined && (!Array.isArray(input.pageNumbers) || input.pageNumbers.length > MAX_PAGE_NUMBERS)) return null;

  const queries = [];
  for (const value of input.queries) {
    if (typeof value !== "string" || value.includes("\u0000")) return null;
    const normalized = value.replace(/\s+/gu, " ").trim();
    if (normalized.length > MAX_QUERY_LENGTH) return null;
    if (normalized && !queries.includes(normalized)) queries.push(normalized);
  }
  if (queries.length > MAX_QUERIES) return null;

  const pageNumbers = [];
  for (const value of input.pageNumbers ?? []) {
    if (!Number.isSafeInteger(value) || value < 1 || value > MAX_PDF_PAGE) return null;
    if (!pageNumbers.includes(value)) pageNumbers.push(value);
  }
  if (pageNumbers.length > MAX_PAGE_NUMBERS || (!queries.length && !pageNumbers.length)) return null;

  if (input.requestId !== undefined && !validRequestId(input.requestId)) return null;

  return {
    projectId: input.projectId,
    queries,
    ...(pageNumbers.length ? { pageNumbers } : {}),
    ...(input.requestId === undefined ? {} : { requestId: input.requestId }),
  };
}

function safeResponse(status, body, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...headers,
    },
  });
}

const PROBE_CORS_HEADERS = Object.freeze({
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "300",
  vary: "Origin",
});

async function readJsonBodyLimited(request, maximumBytes) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return null;
  }
}

async function getMappedProject(env, tenantId, projectId) {
  if (!TENANT_UUID.test(String(tenantId)) || !validProjectId(projectId) || !env?.DB) return null;
  return env.DB.prepare(
    "SELECT brvin_project_id,project_ref,provisioning_status " +
    "FROM tenant_brvin_projects WHERE tenant_id=? AND brvin_project_id=? " +
    "AND provisioning_status='active' LIMIT 1"
  ).bind(tenantId, projectId).first();
}

/**
 * Server-side utility. The caller must resolve tenantId from an authenticated
 * application identity; this function is not an HTTP authorization boundary.
 */
export async function listTeacherKnowledgeProjects(env, tenantId) {
  if (!TENANT_UUID.test(String(tenantId))) {
    return failure("INVALID_REQUEST", "A valid teacher tenant is required.");
  }
  if (!env?.DB || !env?.BRVIN_SERVICE) {
    return failure("BRVIN_UNAVAILABLE", "The private BRVIN retrieval binding is not configured.", true);
  }

  try {
    const mapped = await env.DB.prepare(
      "SELECT brvin_project_id FROM tenant_brvin_projects " +
      "WHERE tenant_id=? AND provisioning_status='active' ORDER BY created_at DESC,project_ref"
    ).bind(tenantId).all();
    const mappedIds = new Set((mapped.results ?? [])
      .map(row => row?.brvin_project_id)
      .filter(value => typeof value === "string" && value.length > 0));

    if (mappedIds.size === 0) return { ok: true, data: [] };

    const connector = createBrvinConnector(env.BRVIN_SERVICE, {
      timeoutMs: 15_000,
      maxResponseBytes: 8 * 1024 * 1024,
    });
    const core = await connector.listAuthorizedProjects();
    if (!core || core.ok !== true || !Array.isArray(core.data)) {
      if (core?.ok === false) return core;
      return failure("BRVIN_UNAVAILABLE", "BRVIN returned an invalid authorised-project response.", true);
    }

    return {
      ok: true,
      data: core.data.filter(project =>
        project && typeof project.projectId === "string" && mappedIds.has(project.projectId)
      ),
    };
  } catch {
    return failure("BRVIN_UNAVAILABLE", "BRVIN could not list this teacher's authorised projects.", true);
  }
}

/**
 * Retrieve only against an opaque BRVIN project ID mapped to the supplied
 * tenant UUID in app D1. The tenant and project must come from trusted
 * server-side resolution, never directly from a browser or student payload.
 */
export async function retrieveTeacherKnowledge(env, input) {
  if (!input || !TENANT_UUID.test(String(input.tenantId))) {
    return failure("INVALID_REQUEST", "A valid teacher tenant is required.");
  }

  const retrieval = parseRetrievalInput(input);
  if (!retrieval) {
    return failure("INVALID_REQUEST", "A valid project and bounded query or PDF page are required.");
  }
  if (!env?.DB || !env?.BRVIN_SERVICE) {
    return failure("BRVIN_UNAVAILABLE", "The private BRVIN retrieval binding is not configured.", true);
  }

  try {
    const mapped = await getMappedProject(env, input.tenantId, retrieval.projectId);
    if (!mapped) {
      return failure("PROJECT_NOT_MAPPED_TO_TENANT", "This BRVIN project is not mapped to the selected teacher workspace.");
    }
    // Core rechecks the trusted environment, active project grant, source grants,
    // readiness and quota on every request. No result is cached or retried here.
    const connector = createBrvinConnector(env.BRVIN_SERVICE, {
      timeoutMs: 15_000,
      maxResponseBytes: 8 * 1024 * 1024,
    });
    return await connector.retrieveProjectContext(retrieval);
  } catch {
    return failure("BRVIN_UNAVAILABLE", "The private BRVIN retrieval service is temporarily unavailable.", true);
  }
}

/**
 * Content-free connection verification endpoint. The private binding supplies
 * the trusted applicationEnvironmentId; this route accepts only the
 * short-lived challenge and nonce and returns only the one-time proof.
 */
export async function handleBrvinConnectionProbe(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        ...PROBE_CORS_HEADERS,
      },
    });
  }

  if (request.method !== "POST") {
    return safeResponse(
      405,
      { ok: false, error: "METHOD_NOT_ALLOWED" },
      { ...PROBE_CORS_HEADERS, allow: "POST, OPTIONS" },
    );
  }

  if (!env?.BRVIN_SERVICE) {
    return safeResponse(503, { ok: false, error: "BRVIN_UNAVAILABLE" }, PROBE_CORS_HEADERS);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;|$)/iu.test(contentType)) {
    return safeResponse(400, { ok: false, error: "INVALID_REQUEST" }, PROBE_CORS_HEADERS);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength) || declaredLength < 0 || declaredLength > MAX_PROBE_BODY_BYTES) {
      return safeResponse(413, { ok: false, error: "INVALID_REQUEST" }, PROBE_CORS_HEADERS);
    }
  }

  const body = await readJsonBodyLimited(request, MAX_PROBE_BODY_BYTES);
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 2 ||
      Object.keys(body).some(key => key !== "challengeId" && key !== "nonce") ||
      typeof body.challengeId !== "string" || !CHALLENGE_ID.test(body.challengeId) ||
      typeof body.nonce !== "string" || !HEX_256.test(body.nonce)) {
    return safeResponse(400, { ok: false, error: "INVALID_REQUEST" }, PROBE_CORS_HEADERS);
  }

  try {
    const result = await env.BRVIN_SERVICE.proveConnectionV2({
      challengeId: body.challengeId,
      nonce: body.nonce,
    });

    if (!result || result.ok !== true) {
      return safeResponse(
        result?.retryable === true ? 503 : 403,
        { ok: false, error: result?.retryable === true ? "BRVIN_UNAVAILABLE" : "PROBE_REJECTED" },
        PROBE_CORS_HEADERS,
      );
    }

    if (result.data?.challengeId !== body.challengeId ||
        typeof result.data.proof !== "string" || !HEX_256.test(result.data.proof)) {
      return safeResponse(502, { ok: false, error: "PROBE_REJECTED" }, PROBE_CORS_HEADERS);
    }

    return safeResponse(200, { ok: true, proof: result.data.proof }, PROBE_CORS_HEADERS);
  } catch {
    return safeResponse(503, { ok: false, error: "BRVIN_UNAVAILABLE" }, PROBE_CORS_HEADERS);
  }
}
