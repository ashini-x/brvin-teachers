import { listTeacherKnowledgeProjects, retrieveTeacherKnowledge } from "./brvin-v2.js";

const NO_STORE = "no-store";
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const MAX_BODY_BYTES = 12_000;
const MAX_QUERY_LENGTH = 2_000;
const MAX_PAGES = 3;
const MAX_PDF_PAGE = 2_000;
const MAX_PASSAGES = 8;
const MAX_PASSAGE_CHARS = 1_800;

const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>BRVIN · Retrieval test</title>
  <link rel="stylesheet" href="/operator/assets/retrieval-test.css">
  <script src="/operator/assets/retrieval-test.js" defer></script>
</head>
<body>
  <main class="shell">
    <header class="top">
      <a href="/operator" class="back">← Operator Console</a>
      <span class="tag">PRIVATE OPERATOR TOOL</span>
    </header>
    <section class="intro">
      <p class="eyebrow">BRVIN V2 · LIVE EVIDENCE CHECK</p>
      <h1>PDF retrieval test</h1>
      <p class="lead">Run one real search against an authorised teacher knowledge project. BRVIN returns the matching passage with its physical PDF page number.</p>
    </section>
    <section class="notice">
      <strong>Before running</strong>
      <p>This calls the production private retrieval service. It does not upload, OCR, re-index or modify the PDF. A valid retrieval can consume project search quota. Run one test first; do not click repeatedly.</p>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><h2>Test request</h2><p id="target-status" role="status">Checking authorised projects…</p></div>
      </div>
      <form id="retrieval-form">
        <label for="project">Authorised knowledge project</label>
        <select id="project" name="project" required disabled><option value="">Loading…</option></select>
        <label for="query">Question or search phrase</label>
        <textarea id="query" name="query" maxlength="2000" rows="3" required>According to the document, what is the relationship between force, mass and acceleration?</textarea>
        <label for="pages">Exact PDF pages to include <span>(optional, up to 3)</span></label>
        <input id="pages" name="pages" type="text" value="1,2,3" inputmode="numeric" autocomplete="off">
        <p class="hint">Use physical PDF page numbers, not the printed page labels. Leaving this blank tests semantic search only.</p>
        <label class="confirm"><input id="confirm" type="checkbox" required> I understand this runs one live retrieval and may use project quota.</label>
        <button id="run" type="submit" disabled>Run one retrieval test</button>
      </form>
    </section>
    <section id="results" class="results" aria-live="polite" aria-atomic="false"></section>
    <footer>Evidence is returned by BRVIN Core. The page number shown is the source PDF page provenance, not an AI-generated guess.</footer>
  </main>
</body>
</html>`;

const CSS = String.raw`*{box-sizing:border-box} :root{color-scheme:dark;--bg:#111318;--panel:#1c2028;--line:#343b47;--text:#edf0f5;--muted:#a0a9b7;--accent:#a8c5ed} html,body{margin:0;min-height:100%;background:radial-gradient(ellipse at top,#202735 0,#111318 56%);color:var(--text);font:14px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif} .shell{width:min(860px,calc(100% - 36px));margin:0 auto;padding:28px 0 60px}.top{display:flex;justify-content:space-between;align-items:center;gap:12px}.back{color:#c8d1df;text-decoration:none;font-size:12px}.back:hover{text-decoration:underline}.tag,.eyebrow{color:#9fb8dc;letter-spacing:.14em;font-size:10px;font-weight:650}.intro{padding:48px 0 22px}.eyebrow{margin:0 0 10px}.intro h1{font-size:clamp(28px,5vw,42px);line-height:1.08;margin:0 0 13px;letter-spacing:-.035em}.lead{margin:0;color:#b3bdca;max-width:650px;font-size:15px}.notice{border:1px solid #6d6045;background:#282519;border-radius:12px;padding:14px 17px;margin:4px 0 20px}.notice strong{font-size:12px;color:#e6c888}.notice p{font-size:12px;color:#c9c1a9;margin:5px 0 0}.panel,.result{background:rgba(28,32,40,.94);border:1px solid var(--line);border-radius:14px;padding:20px}.panel-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}.panel h2{font-size:16px;margin:0}.panel-head p{font-size:11px;color:var(--muted);margin:3px 0 0}form{display:grid;gap:9px}form>label{font-size:12px;color:#cbd3df;font-weight:600;margin-top:9px}form>label span,.hint{font-weight:400;color:#8c96a5;font-size:11px}select,input[type=text],textarea{width:100%;border:1px solid #46505f;background:#12161d;color:#edf0f5;border-radius:8px;padding:11px 12px;font:inherit}textarea{resize:vertical;min-height:92px}input:focus,textarea:focus,select:focus{outline:2px solid #7697c6;outline-offset:1px}.hint{margin:-5px 0 2px}.confirm{display:flex;align-items:flex-start;gap:9px;color:#cbd3df;font-size:11px;font-weight:400!important}.confirm input{margin-top:3px;accent-color:#a8c5ed}button{margin-top:8px;background:#dfe9f7;color:#162031;border:0;border-radius:8px;padding:12px 15px;font-weight:700;cursor:pointer}button:disabled{opacity:.5;cursor:not-allowed}.results{display:grid;gap:12px;margin-top:18px}.result{padding:17px}.result h3{font-size:14px;margin:0}.result .meta{font-size:11px;color:#aeb8c7;margin:5px 0 12px}.result pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.65 ui-monospace,SFMono-Regular,Consolas,monospace;color:#e3e8f1;margin:0;background:#12161d;border-radius:8px;padding:13px}.result-summary{font-size:12px;color:#b9c5d4}.state{border:1px solid #43566f;border-radius:9px;padding:12px;color:#c9d9ee;background:#1b2635;font-size:12px}.state.error{border-color:#704e4e;background:#2a1d20;color:#eab4b4}.state.empty{border-color:#6d6045;background:#282519;color:#e6d6b5}footer{margin-top:24px;color:#7e8999;font-size:10px;text-align:center}@media(max-width:560px){.shell{width:calc(100% - 24px);padding-top:18px}.intro{padding-top:35px}.panel,.result{padding:15px}.tag{font-size:8px}}`;

const JS = String.raw`const form = document.querySelector("#retrieval-form");
const projectSelect = document.querySelector("#project");
const targetStatus = document.querySelector("#target-status");
const queryField = document.querySelector("#query");
const pagesField = document.querySelector("#pages");
const confirmField = document.querySelector("#confirm");
const runButton = document.querySelector("#run");
const results = document.querySelector("#results");
let requestAttempted = false;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function showState(message, type = "") {
  results.replaceChildren(node("div", "state " + type, message));
}

function parsePages(value) {
  const input = value.trim();
  if (!input) return [];
  const pieces = input.split(",").map(part => part.trim());
  if (!pieces.length || pieces.length > 3 || pieces.some(part => !/^[1-9]\d{0,3}$/.test(part))) return null;
  const pages = [...new Set(pieces.map(Number))];
  return pages.length <= 3 && pages.every(page => page <= 2000) ? pages : null;
}

async function loadTargets() {
  try {
    const response = await fetch("/operator/api/retrieval-test/targets", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok || body.ok !== true) throw new Error(body.message || "Could not load authorised projects.");
    projectSelect.replaceChildren();
    for (const target of body.targets || []) {
      const option = document.createElement("option");
      option.value = target.projectReference;
      option.textContent = target.projectName + " · " + target.projectReference +
        (target.ready ? " · Ready (" + target.authorizedSourceCount + " source)" : " · No ready source");
      option.dataset.ready = target.ready ? "true" : "false";
      projectSelect.append(option);
    }
    if (!projectSelect.options.length) {
      projectSelect.add(new Option("No authorised projects found", ""));
      targetStatus.textContent = "No project is currently available to this application.";
      return;
    }
    projectSelect.disabled = false;
    const ready = [...projectSelect.options].filter(option => option.dataset.ready === "true").length;
    targetStatus.textContent = ready + " authorised project(s) with ready knowledge.";
    runButton.disabled = ready === 0;
  } catch (error) {
    targetStatus.textContent = "Could not verify authorised projects.";
    projectSelect.replaceChildren(new Option("Project check failed", ""));
    showState(error.message || "BRVIN is unavailable.", "error");
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const projectReference = projectSelect.value;
  const query = queryField.value.replace(/\s+/g, " ").trim();
  const pageNumbers = parsePages(pagesField.value);
  if (!projectReference) return showState("Select an authorised project.", "error");
  if (!query || query.length > 2000) return showState("Enter a search question of up to 2,000 characters.", "error");
  if (pageNumbers === null) return showState("Enter up to three comma-separated physical PDF pages (maximum 2,000).", "error");
  if (!confirmField.checked) return showState("Confirm the quota notice before running the live retrieval.", "error");

  requestAttempted = true;
  runButton.disabled = true;
  runButton.textContent = "Retrieving evidence…";
  showState("Sending one request through the private BRVIN v2 retrieval service…");
  try {
    const response = await fetch("/operator/api/retrieval-test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ projectReference, query, pageNumbers })
    });
    const body = await response.json();
    if (!response.ok || body.ok !== true) {
      const detail = [body.code, body.message].filter(Boolean).join(" — ");
      throw new Error(detail || "BRVIN did not return evidence.");
    }

    results.replaceChildren();
    const summary = node("div", "result-summary",
      "Search complete · " + body.searchCount + " search operation(s) · " +
      body.searchedSources + " authorised source(s) · " + body.passages.length + " passage(s) returned.");
    results.append(summary);
    if (!body.passages.length) {
      results.append(node("div", "state empty", "The request succeeded, but BRVIN found no matching passage for this query/page selection. Try a more distinctive phrase from the PDF."));
      return;
    }

    for (const passage of body.passages) {
      const card = node("article", "result");
      card.append(node("h3", "", passage.bookTitle + " · PDF page " + passage.pdfPage));
      const metadata = [
        passage.section ? "Section: " + passage.section : "",
        passage.printedPage ? "Printed page: " + passage.printedPage : "",
        Number.isFinite(passage.score) ? "Relevance score: " + passage.score.toFixed(3) : ""
      ].filter(Boolean).join(" · ");
      if (metadata) card.append(node("p", "meta", metadata));
      card.append(node("pre", "", passage.text));
      results.append(card);
    }
  } catch (error) {
    showState(error.message || "The retrieval test failed.", "error");
  } finally {
    runButton.disabled = requestAttempted || projectSelect.disabled || ![...projectSelect.options].some(option => option.dataset.ready === "true");
    runButton.textContent = "Run one retrieval test";
  }
});

loadTargets();`;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": NO_STORE,
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}

function pageResponse(body, type, withCsp = false) {
  const headers = {
    "content-type": type,
    "cache-control": NO_STORE,
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
  };
  if (withCsp) {
    headers["content-security-policy"] = CSP;
    headers["x-frame-options"] = "DENY";
  }
  return new Response(body, { headers });
}

function sameOriginJson(req) {
  const origin = req.headers.get("origin");
  if (!origin || !(req.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return false;
  try {
    return new URL(origin).origin === new URL(req.url).origin;
  } catch {
    return false;
  }
}

async function readBody(req) {
  const declaredLength = req.headers.get("content-length");
  if (declaredLength !== null) {
    const length = Number(declaredLength);
    if (!Number.isSafeInteger(length) || length < 0 || length > MAX_BODY_BYTES) return null;
  }
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return null;
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export function parseRetrievalTestInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const projectReference = typeof body.projectReference === "string" ? body.projectReference.trim() : "";
  const query = typeof body.query === "string" ? body.query.replace(/\s+/gu, " ").trim() : "";
  if (!projectReference || projectReference.length > 128 || projectReference !== body.projectReference) return null;
  if (!query || query.length > MAX_QUERY_LENGTH || query.includes("\u0000")) return null;
  if (body.pageNumbers !== undefined && !Array.isArray(body.pageNumbers)) return null;
  const pageNumbers = [];
  for (const page of body.pageNumbers ?? []) {
    if (!Number.isSafeInteger(page) || page < 1 || page > MAX_PDF_PAGE || pageNumbers.includes(page)) return null;
    pageNumbers.push(page);
  }
  if (pageNumbers.length > MAX_PAGES) return null;
  return { projectReference, query, pageNumbers };
}

export function safePassages(passages) {
  if (!Array.isArray(passages)) return [];
  return passages.slice(0, MAX_PASSAGES).flatMap((passage) => {
    if (!passage || typeof passage !== "object") return [];
    const pdfPage = Number(passage.pdfPage);
    const text = typeof passage.text === "string" ? passage.text.trim().slice(0, MAX_PASSAGE_CHARS) : "";
    if (!Number.isSafeInteger(pdfPage) || pdfPage < 1 || !text) return [];
    return [{
      bookTitle: typeof passage.bookTitle === "string" ? passage.bookTitle.slice(0, 180) : "Untitled source",
      pdfPage,
      ...(typeof passage.printedPage === "string" ? { printedPage: passage.printedPage.slice(0, 80) } : {}),
      ...(typeof passage.section === "string" ? { section: passage.section.slice(0, 180) } : {}),
      ...(Number.isFinite(passage.score) ? { score: Number(passage.score) } : {}),
      text,
    }];
  });
}

export async function handleRetrievalTestRoute(req, env, path) {
  if (req.method === "GET" && path === "/operator/retrieval-test") {
    return pageResponse(PAGE, "text/html; charset=utf-8", true);
  }
  if (req.method === "GET" && path === "/operator/assets/retrieval-test.css") {
    return pageResponse(CSS, "text/css; charset=utf-8");
  }
  if (req.method === "GET" && path === "/operator/assets/retrieval-test.js") {
    return pageResponse(JS, "application/javascript; charset=utf-8");
  }
  if (req.method === "GET" && path === "/operator/api/retrieval-test/targets") {
    if (!env?.DB || !env?.BRVIN_SERVICE) return json({ ok: false, code: "BRVIN_UNAVAILABLE", message: "The private retrieval binding is not available." }, 503);
    try {
      const teachers = await env.DB.prepare(
        "SELECT id,tenant_ref FROM teachers WHERE status='active' ORDER BY tenant_ref"
      ).all();
      const targets = [];
      for (const teacher of teachers.results ?? []) {
        const result = await listTeacherKnowledgeProjects(env, String(teacher.id));
        if (!result?.ok || !Array.isArray(result.data)) {
          return json({ ok: false, code: result?.code || "BRVIN_UNAVAILABLE", message: "BRVIN could not verify this application's authorised projects." }, 503);
        }
        const mappings = await env.DB.prepare(
          "SELECT brvin_project_id,project_ref,name,subject FROM tenant_brvin_projects WHERE tenant_id=? AND provisioning_status='active' ORDER BY project_ref"
        ).bind(teacher.id).all();
        const byId = new Map((mappings.results ?? []).map(row => [String(row.brvin_project_id), row]));
        for (const project of result.data) {
          const mapped = byId.get(String(project.projectId));
          if (!mapped) continue;
          targets.push({
            projectReference: String(mapped.project_ref),
            projectName: String(mapped.name),
            subject: String(mapped.subject || ""),
            ready: project.ready === true,
            authorizedSourceCount: Math.max(0, Number(project.authorizedSourceCount) || 0),
          });
        }
      }
      return json({ ok: true, targets });
    } catch {
      return json({ ok: false, code: "BRVIN_UNAVAILABLE", message: "BRVIN could not verify authorised projects." }, 503);
    }
  }
  if (req.method === "POST" && path === "/operator/api/retrieval-test") {
    if (!sameOriginJson(req)) return json({ ok: false, code: "INVALID_REQUEST", message: "Use the authenticated Operator Console on the same origin." }, 403);
    if (!env?.DB || !env?.BRVIN_SERVICE) return json({ ok: false, code: "BRVIN_UNAVAILABLE", message: "The private retrieval binding is not available." }, 503);
    const body = await readBody(req);
    const input = parseRetrievalTestInput(body);
    if (!input) return json({ ok: false, code: "INVALID_REQUEST", message: "Enter a project, one search question and up to three valid physical PDF pages." }, 400);

    try {
      const project = await env.DB.prepare(
        "SELECT t.id AS tenant_id,p.brvin_project_id AS project_id,p.project_ref,p.name " +
        "FROM tenant_brvin_projects p JOIN teachers t ON t.id=p.tenant_id " +
        "WHERE p.project_ref=? AND t.status='active' AND p.provisioning_status='active' LIMIT 1"
      ).bind(input.projectReference).first();
      if (!project) return json({ ok: false, code: "PROJECT_NOT_MAPPED_TO_TENANT", message: "That project is not mapped to an active teacher workspace." }, 404);

      const result = await retrieveTeacherKnowledge(env, {
        tenantId: String(project.tenant_id),
        projectId: String(project.project_id),
        queries: [input.query],
        ...(input.pageNumbers.length ? { pageNumbers: input.pageNumbers } : {}),
        requestId: crypto.randomUUID(),
      });
      if (!result?.ok || !result.data) {
        const code = result?.code || "BRVIN_UNAVAILABLE";
        const message = code === "MONTHLY_LIMIT_REACHED"
          ? "The project's monthly BRVIN retrieval allowance has been reached."
          : code === "PROJECT_NOT_AUTHORIZED" || code === "PROJECT_NOT_MAPPED_TO_TENANT"
            ? "The application is not authorised to retrieve this project."
            : code === "PROJECT_INACTIVE"
              ? "This knowledge project is inactive."
              : "BRVIN could not return evidence for this request.";
        return json({ ok: false, code, message }, code === "INVALID_REQUEST" ? 400 : code === "PROJECT_NOT_AUTHORIZED" || code === "PROJECT_NOT_MAPPED_TO_TENANT" ? 403 : code === "MONTHLY_LIMIT_REACHED" ? 429 : 502);
      }

      const passages = safePassages(result.data.passages);
      return json({
        ok: true,
        projectName: String(project.name),
        projectReference: String(project.project_ref),
        searchedSources: Math.max(0, Number(result.data.searchedSources) || 0),
        searchCount: Math.max(0, Number(result.data.searchCount) || 0),
        passages,
      });
    } catch {
      return json({ ok: false, code: "BRVIN_UNAVAILABLE", message: "The private BRVIN retrieval service is temporarily unavailable." }, 503);
    }
  }
  return null;
}
