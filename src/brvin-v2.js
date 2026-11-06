const TENANT_UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/iu;
const PROJECT_ID = /^[^\\u0000\\s](?:[^\\u0000]*[^\\u0000\\s])?$/u;
const CHALLENGE_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/iu;
const NONCE = /^[a-f0-9]{64}$/iu;
const HEX_PROOF = /^[a-f0-9]{64}$/iu;

function response(status, body, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...extraHeaders,
    },
  });
}

function failure(code, message, retryable = false) {
  return { ok: false, code, message, retryable };
}

function validProjectId(value) {
  return typeof value === "string" && value.length <= 128 &&
    value.trim() === value && !value.includes("\\u0000") && value.length > 0;
}

function parseRetrievalInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (!validProjectId(input.projectId)) return null;
  const queries = input.queries === undefined ? [] : input.queries;
  const pageNumbers = input.pageNumbers === undefined ? [] : input.pageNumbers;
  if (!Array.isArray(queries) || queries.length > 8 ||
      queries.some(value => typeof value !== "string" || !value.trim() || value.length > 2000)) return null;
  if (!Array.isArray(pageNumbers) || pageNumbers.length > 3 ||
      pageNumbers.some(value => !Number.isSafeInteger(value) || value < 1) ||
      new Set(pageNumbers).size !== pageNumbers.length) return null;
  if (queries.length === 0 && pageNumbers.length === 0) return null;
  const requestId = input.requestId;
  if (requestId !== undefined && (typeof requestId !== "string" || requestId.length < 1 ||
      requestId.length > 128 || /[\\u0000-\\u001f\\u007f]/u.test(requestId))) return null;
  return {
    projectId: input.projectId,
    queries: queries.map(value => value.trim()),
    ...(pageNumbers.length ? { pageNumbers: [...pageNumbers] } : {}),
    ...(requestId === undefined ? {} : { requestId }),
  };
}

async function getMappedProject(env, tenantId, projectId) {
  if (!TENANT_UUID.test(String(tenantId)) || !validProjectId(projectId)) return null;
  if (!env?.DB) return null;
  return env.DB.prepare(
    "SELECT brvin_project_id,project_ref,provisioning_status " +
    "FROM tenant_brvin_projects WHERE tenant_id=? AND brvin_project_id=? " +
    "AND provisioning_status='active' LIMIT 1"
  ).bind(tenantId, projectId).first();
}

/**
 * List only the Core-authorised projects that the local application has
 * explicitly mapped to this tenant. This is a server-side utility; callers
 * must resolve tenantId from an authenticated application identity.
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
      "SELECT brvin_project_id,project_ref,name,subject,provisioning_status " +
      "FROM tenant_brvin_projects WHERE tenant_id=? AND provisioning_status='active' " +
      "ORDER BY created_at DESC,project_ref"
    ).bind(tenantId).all();
    const allowedIds = new Set((mapped.results || []).map(row => String(row.brvin_project_id)));
    if (allowedIds.size === 0) return { ok: true, data: [] };
    const core = await env.BRVIN_SERVICE.listAuthorizedProjectsV2();
    if (!core?.ok) return core ?? failure("BRVIN_UNAVAILABLE", "BRVIN did not return an authorised project list.", true);
    return {
      ok: true,
      data: core.data.filter(project => allowedIds.has(project.projectId)),
    };
  } catch {
    return failure("BRVIN_UNAVAILABLE", "BRVIN could not list this teacher's authorised projects.", true);
  }
}

/**
 * Retrieve only against an opaque BRVIN project ID mapped to the supplied
 * tenant UUID in app D1. Never accept tenantId or projectId directly from an
 * unauthenticated browser request.
 */
export async function retrieveTeacherKnowledge(env, input) {
  if (!input || !TENANT_UUID.test(String(input.tenantId))) {
    return failure("INVALID_REQUEST", "A valid teacher tenant is required.");
  }
  const retrieval = parseRetrievalInput(input);
  if (!retrieval) return failure("INVALID_REQUEST", "A valid project and bounded knowledge query are required.");
  if (!env?.DB || !env?.BRVIN_SERVICE) {
    return failure("BRVIN_UNAVAILABLE", "The private BRVIN retrieval binding is not configured.", true);
  }
  try {
    const mapped = await getMappedProject(env, input.tenantId, retrieval.projectId);
    if (!mapped) return failure("PROJECT_NOT_MAPPED_TO_TENANT", "This BRVIN project is not mapped to the selected teacher workspace.");
    return await env.BRVIN_SERVICE.retrieveProjectContextV2(retrieval);
  } catch {
    return failure("BRVIN_UNAVAILABLE", "The private BRVIN retrieval service is temporarily unavailable.", true);
  }
}

/**
 * Public, content-free, one-time BRVIN application verification endpoint.
 * The challenge+nonce are short-lived and the proof is issued only by the
 * private BRVIN retrieval binding using its deployment-controlled identity.
 */
export async function handleBrvinConnectionProbe(request, env) {
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "300",
    "vary": "Origin",
  };
  if (request.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...cors,
    },
  });
  if (request.method !== "POST") {
    return response(405, { ok: false, error: "METHOD_NOT_ALLOWED" }, { ...cors, allow: "POST, OPTIONS" });
  }
  if (!env?.BRVIN_SERVICE) return response(503, { ok: false, error: "BRVIN_UNAVAILABLE" }, cors);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096 || !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return response(400, { ok: false, error: "INVALID_REQUEST" }, cors);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return response(400, { ok: false, error: "INVALID_REQUEST" }, cors);
  }
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).some(key => key !== "challengeId" && key !== "nonce") ||
      typeof body.challengeId !== "string" || !CHALLENGE_ID.test(body.challengeId) ||
      typeof body.nonce !== "string" || !NONCE.test(body.nonce)) {
    return response(400, { ok: false, error: "INVALID_REQUEST" }, cors);
  }
  try {
    const result = await env.BRVIN_SERVICE.proveConnectionV2({
      challengeId: body.challengeId,
      nonce: body.nonce,
    });
    if (!result?.ok) return response(403, { ok: false, error: result?.code || "PROBE_REJECTED" }, cors);
    if (result.data?.challengeId !== body.challengeId || typeof result.data.proof !== "string" ||
        !HEX_PROOF.test(result.data.proof)) {
      return response(502, { ok: false, error: "PROBE_REJECTED" }, cors);
    }
    return response(200, { ok: true, proof: result.data.proof }, cors);
  } catch {
    return response(503, { ok: false, error: "BRVIN_UNAVAILABLE" }, cors);
  }
}
