const NO_STORE = "no-store";
const PAGE = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>BRVIN Teachers · Operator</title><link rel="stylesheet" href="/operator/assets/app.css"></head>
<body><div class="shell"><aside id="sidebar"><a class="brand" href="/operator"><b>B</b><span><strong>BRVIN</strong><small>Teachers</small></span></a><p class="nav-label">WORKSPACE</p><nav><button data-page="overview">⌂ Overview</button><button class="active" data-page="teachers">♙ Teachers</button><button disabled>▤ Knowledge <em>Soon</em></button><button disabled>◷ Processing <em>Soon</em></button><button disabled>⌁ Usage <em>Soon</em></button><button disabled>≋ Activity <em>Soon</em></button></nav><div class="side-bottom"><div class="core">● <span><b>BRVIN Core</b><small>Management link pending</small></span></div><small id="operator-foot"></small></div></aside>
<main><header><div><button id="menu">☰</button><small>BRVIN Teachers / Operator</small><h1 id="page-title">Teachers</h1></div><div><span id="operator-name"></span> <button class="primary" id="add">＋ Add teacher</button></div></header><section id="content"><p class="loading">Loading teacher workspaces…</p></section></main></div><div id="scrim"></div>
<dialog id="create-dialog"><form id="create-form"><h2>Create teacher</h2><button type="button" id="close" class="close">×</button><label for="name">Teacher name</label><input id="name" maxlength="120" placeholder="e.g. Aditya Ranjan" required><p>Names are custom and may repeat.</p><label for="student-name">Student-facing name (optional)</label><input id="student-name" maxlength="120" placeholder="e.g. Aditya Sir"><p>Defaults to teacher name.</p><div class="note">The system generates the permanent tenant ID and reference automatically.</div><div class="actions"><button type="button" id="cancel" class="secondary">Cancel</button><button type="submit" id="save" class="primary">Create workspace</button></div><p id="form-error" class="error" hidden></p></form></dialog><div id="toast" class="toast"></div><script src="/operator/assets/app.js" defer></script></body></html>`;

const CSS = String.raw`*{box-sizing:border-box}:root{color-scheme:dark;--bg:#212121;--side:#171717;--panel:#2f2f2f;--line:#424242;--text:#ececec;--muted:#a3a3a3}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}button,input{font:inherit;color:inherit}button:focus-visible,input:focus-visible{outline:2px solid #bbb;outline-offset:2px}.shell{min-height:100vh;display:grid;grid-template-columns:240px 1fr}aside{height:100vh;position:sticky;top:0;background:var(--side);border-right:1px solid #303030;padding:22px 14px;display:flex;flex-direction:column;z-index:5}.brand{display:flex;align-items:center;gap:10px;padding:0 10px 28px;color:inherit;text-decoration:none}.brand b{width:29px;height:29px;border:1px solid #777;border-radius:9px;display:grid;place-items:center}.brand strong,.brand small,.core b,.core small{display:block}.brand small{color:var(--muted);font-size:11px}aside>p{font-size:10px;letter-spacing:.1em;color:var(--muted);padding-left:10px}nav{display:grid;gap:4px}nav button{border:0;background:transparent;color:#bbb;border-radius:8px;text-align:left;padding:9px;cursor:pointer}nav button.active{background:#303030;color:#fff}nav button:disabled{opacity:.4}nav em{float:right;font-size:10px;font-style:normal;color:#888}.side-bottom{margin-top:auto}.core{border:1px solid #343434;background:#202020;border-radius:8px;padding:11px;color:#777}.core span{display:inline-block;vertical-align:middle;margin-left:5px}.core b{font-size:12px;color:#ddd}.core small{font-size:10px;color:#999}.side-bottom>small{display:block;padding:11px 10px;color:#777;font-size:10px}main{min-width:0}header{min-height:86px;border-bottom:1px solid #333;padding:18px clamp(18px,4vw,50px);display:flex;align-items:center;justify-content:space-between;gap:12px}header small{font-size:11px;color:#888}h1{font-size:22px;line-height:1.2;margin:3px 0 0;font-weight:600}header>div:last-child{display:flex;align-items:center;gap:12px;font-size:11px;color:#aaa}.primary,.secondary{border:1px solid var(--line);border-radius:8px;padding:8px 12px;min-height:36px;cursor:pointer}.primary{background:#e8e8e8;color:#191919;border-color:#eee;font-weight:600}.primary:disabled{opacity:.5}.secondary{background:#303030}.content{padding:28px clamp(18px,4vw,50px) 50px;max-width:1400px;margin:auto}.intro{display:flex;justify-content:space-between;gap:18px;margin-bottom:20px}.intro h2{font-size:17px;margin:0 0 4px}.intro p{color:var(--muted);font-size:12px;margin:0}.search{width:min(100%,340px);height:38px;background:#242424;border:1px solid #4a4a4a;border-radius:8px;padding:0 11px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}.metric,.panel,.teacher,.workspace-card{border:1px solid var(--line);background:var(--panel);border-radius:10px}.metric{padding:14px}.metric small{display:block;color:var(--muted);font-size:11px}.metric strong{display:block;font-size:24px;margin-top:4px}.metric em{font-style:normal;font-size:10px;color:#888}.panel{padding:16px}.panel-head{display:flex;justify-content:space-between;margin-bottom:12px}.panel-head h3{font-size:13px;margin:0}.panel-head p{font-size:11px;color:var(--muted);margin:3px 0}.teacher-list{display:grid;gap:8px}.teacher{padding:13px;display:flex;justify-content:space-between;align-items:center;gap:10px}.teacher h3{font-size:14px;margin:0 0 3px}.meta{font-size:11px;color:var(--muted);display:flex;gap:8px;flex-wrap:wrap}.ref{font:11px ui-monospace,monospace;color:#c4c4c4}.pill{border:1px solid #4b6950;background:#29372d;color:#a6c6ad;border-radius:20px;padding:3px 8px;font-size:10px}.teacher-actions{display:flex;gap:8px;align-items:center}.text-btn{border:0;background:transparent;color:#ddd;cursor:pointer;font-size:12px}.empty{padding:45px 18px;text-align:center;border:1px dashed #4b4b4b;border-radius:10px;color:var(--muted)}.empty h3{font-size:14px;color:#eee;margin:0 0 5px}.empty p{font-size:11px;max-width:420px;margin:0 auto 14px}.workspace-head{display:flex;gap:12px;margin-bottom:18px}.back{border:1px solid var(--line);background:#2c2c2c;border-radius:8px;padding:7px 10px;cursor:pointer;height:36px}.workspace-title h2{margin:0 0 5px;font-size:20px}.workspace-sub{display:flex;gap:9px;align-items:center;font-size:11px;color:var(--muted);flex-wrap:wrap}.tabs{display:flex;gap:5px;overflow:auto;border-bottom:1px solid #414141;padding-bottom:9px;margin-bottom:18px}.tab{background:transparent;border:0;color:#999;border-radius:6px;padding:7px 10px;font-size:11px;white-space:nowrap;cursor:pointer}.tab.active{background:#383838;color:#fff}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.workspace-card{padding:15px}.workspace-card h3{font-size:13px;margin:0 0 4px}.workspace-card p{font-size:11px;color:var(--muted);margin:0}.note{font-size:10px;color:#999;border-top:1px solid #444;padding-top:10px;margin-top:12px}.edit-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.edit-form label{display:block;font-size:11px;color:#bbb;margin-bottom:6px}.edit-form input,dialog input{width:100%;height:39px;border:1px solid #505050;background:#212121;border-radius:8px;padding:0 10px;color:#eee}dialog{width:min(440px,calc(100% - 28px));padding:0;border:1px solid #505050;border-radius:13px;background:#2d2d2d;color:#eee}dialog::backdrop{background:#0009}dialog form{padding:21px}dialog h2{font-size:19px;margin:0 0 18px}dialog label{display:block;font-size:11px;color:#bbb;margin:13px 0 6px}dialog p{font-size:10px;color:#888;margin:5px 0}.close{float:right;margin-top:-44px;border:0;background:transparent;color:#aaa;font-size:22px}.note{background:#252525;border:1px solid #444;border-radius:8px;padding:10px}.actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.error{font-size:11px;color:#e99}.toast{position:fixed;bottom:22px;left:50%;transform:translate(-50%,14px);opacity:0;pointer-events:none;background:#383838;border:1px solid #555;border-radius:8px;padding:9px 14px;font-size:12px;transition:.15s}.toast.visible{opacity:1;transform:translate(-50%,0)}#menu{display:none}.scrim{display:none}@media(max-width:820px){.shell{grid-template-columns:205px 1fr}}@media(max-width:650px){.shell{display:block}aside{position:fixed;left:0;top:0;width:250px;transform:translateX(-102%);transition:transform .18s;height:100dvh}aside.open{transform:translateX(0)}.scrim.open{display:block;position:fixed;inset:0;background:#0009;z-index:4}#menu{display:inline-block;background:#2c2c2c;border:1px solid var(--line);border-radius:7px;padding:7px 9px;margin-right:8px}header{min-height:76px;padding:13px 15px}header>div:last-child span{display:none}h1{font-size:18px}.content{padding:20px 14px 40px}.intro{display:block}.search{width:100%;margin-top:13px}.metrics{gap:7px}.metric{padding:10px 8px}.metric strong{font-size:19px}.metric small,.metric em{font-size:9px}.teacher{padding:11px}.teacher-actions .pill{display:none}.grid,.edit-form{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important}}
`;

const CSS_EXTRA = `.classroom-list,.collection-list,.source-list{display:grid;gap:9px;margin-top:12px}.class-form,.upload-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin-top:14px}.field-group{min-width:0}.field-group label{display:block;font-size:11px;color:#bcbcbc;margin-bottom:6px}.field-group .field-input{width:100%;height:38px;border:1px solid #4a4a4a;background:#242424;color:#eee;border-radius:8px;padding:0 10px}.field-group input[type=file]{padding:7px 9px}.class-form button,.upload-form button{align-self:end;justify-self:start}.upload-form .field-group:nth-child(2),.upload-form .check-row,.upload-form .upload-progress{grid-column:1/-1}.check-row{display:flex;align-items:flex-start;gap:9px;color:#bbb;font-size:11px}.check-row input{margin-top:2px;accent-color:#ddd}.upload-progress{border:1px solid #454545;background:#262626;padding:10px;border-radius:8px;color:#ccc;font-size:11px;white-space:normal}.loading{font-size:11px;color:#999;padding:15px 3px}.source-row{align-items:flex-start}.source-row .meta{margin-top:4px}.source-row .pill{white-space:nowrap}.source-row .error{margin-top:6px}.classroom-list .teacher,.collection-list .teacher{cursor:default}.classroom-list .teacher:hover,.collection-list .teacher:hover{background:#353535}@media(max-width:650px){.class-form,.upload-form{grid-template-columns:1fr}.upload-form .field-group:nth-child(2),.upload-form .check-row,.upload-form .upload-progress{grid-column:auto}.class-form button,.upload-form button{width:100%}}`;
function json(data,status=200){return Response.json(data,{status,headers:{"cache-control":NO_STORE,"x-content-type-options":"nosniff","referrer-policy":"no-referrer"}})}
function page(body){return new Response(body,{headers:{"content-type":"text/html; charset=utf-8","cache-control":NO_STORE,"x-content-type-options":"nosniff","referrer-policy":"no-referrer","content-security-policy":"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'","x-frame-options":"DENY"}})}
function asset(body,type){return new Response(body,{headers:{"content-type":type,"cache-control":NO_STORE,"x-content-type-options":"nosniff"}})}
async function identity(ctx){if(!ctx?.access||typeof ctx.access.getIdentity!=="function")return null;try{const i=await ctx.access.getIdentity();if(typeof i?.email!=="string"||!i.email.includes("@"))return null;return{email:i.email.slice(0,254).toLowerCase(),name:typeof i.name==="string"?i.name.slice(0,120):""}}catch{return null}}
function clean(value){return typeof value==="string"?value.replace(/\s+/gu," ").trim().slice(0,120):""}
function sameOrigin(req){const origin=req.headers.get("origin");if(!origin)return false;try{return new URL(origin).origin===new URL(req.url).origin}catch{return false}}
function validWrite(req){const origin=req.headers.get("origin");if(!origin)return false;try{return new URL(origin).origin===new URL(req.url).origin&&(req.headers.get("content-type")||"").toLowerCase().startsWith("application/json")}catch{return false}}
async function readBody(req){const n=Number(req.headers.get("content-length")||0);if(n>16000)return null;try{const v=await req.json();return v&&typeof v==="object"&&!Array.isArray(v)?v:null}catch{return null}}
async function list(db,q){const v=typeof q==="string"?q.replace(/\s+/gu," ").trim().slice(0,80).toLowerCase():"",like=v?"%"+v+"%":"%";const r=await db.prepare("SELECT t.id,t.tenant_ref,t.name,t.student_display_name,t.status,t.created_at,t.updated_at,COALESCE((SELECT MAX(a.created_at) FROM operator_audit_events a WHERE a.tenant_id=t.id),t.updated_at) AS last_activity_at FROM teachers t WHERE lower(t.name) LIKE ? OR lower(t.tenant_ref) LIKE ? ORDER BY t.created_at DESC,t.tenant_ref DESC LIMIT 100").bind(like,like).all();return(r.results||[]).map(x=>({id:String(x.id),reference:String(x.tenant_ref),name:String(x.name),studentDisplayName:String(x.student_display_name),status:String(x.status),createdAt:Number(x.created_at),updatedAt:Number(x.updated_at),lastActivityAt:Number(x.last_activity_at)}))}
async function get(db,id){const r=await db.prepare("SELECT id,tenant_ref,name,student_display_name,status,created_at,updated_at FROM teachers WHERE id=? LIMIT 1").bind(id).first();if(!r)return null;const p=await db.prepare("SELECT brvin_project_id,project_ref,name,subject,provisioning_status FROM tenant_brvin_projects WHERE tenant_id=? ORDER BY created_at DESC").bind(id).all();return{id:String(r.id),reference:String(r.tenant_ref),name:String(r.name),studentDisplayName:String(r.student_display_name),status:String(r.status),createdAt:Number(r.created_at),updatedAt:Number(r.updated_at),projects:(p.results||[]).map(x=>({id:String(x.brvin_project_id),reference:String(x.project_ref),name:String(x.name),subject:String(x.subject),status:String(x.provisioning_status)}))}}
async function create(db,actor,b){const name=clean(b.name),display=clean(b.studentDisplayName)||name;if(name.length<2||display.length<2)return json({ok:false,error:"Enter valid teacher and student-facing names."},400);const id=crypto.randomUUID().toLowerCase(),now=Date.now();try{await db.batch([db.prepare("UPDATE id_sequences SET current_value=current_value+1,updated_at=? WHERE scope_key='tenant'").bind(now),db.prepare("INSERT INTO teachers(id,tenant_ref,name,student_display_name,status,created_at,updated_at) SELECT ?, 'TCH-' || printf('%06d',current_value), ?, ?, 'active', ?, ? FROM id_sequences WHERE scope_key='tenant'").bind(id,name,display,now,now),db.prepare("INSERT INTO operator_audit_events(id,actor_email,event_type,entity_type,entity_id,reference,details_json,created_at,tenant_id) SELECT ?,?,'teacher.created','teacher',id,tenant_ref,'{}',?,id FROM teachers WHERE id=?").bind(crypto.randomUUID().toLowerCase(),actor.email,now,id)]);const teacher=await get(db,id);if(!teacher)throw new Error();return json({ok:true,teacher},201)}catch{return json({ok:false,error:"The teacher could not be created. Check the application database and retry."},503)}}
async function rename(db,actor,id,b){const name=clean(b.name),display=clean(b.studentDisplayName)||name;if(name.length<2||display.length<2)return json({ok:false,error:"Enter valid teacher and student-facing names."},400);const now=Date.now();try{const r=await db.prepare("UPDATE teachers SET name=?,student_display_name=?,updated_at=? WHERE id=?").bind(name,display,now,id).run();if(Number(r.meta?.changes||0)!==1)return json({ok:false,error:"Teacher workspace not found."},404);await db.prepare("INSERT INTO operator_audit_events(id,actor_email,event_type,entity_type,entity_id,reference,details_json,created_at,tenant_id) SELECT ?,?,'teacher.renamed','teacher',id,tenant_ref,'{}',?,id FROM teachers WHERE id=?").bind(crypto.randomUUID().toLowerCase(),actor.email,now,id).run();return json({ok:true,teacher:await get(db,id)})}catch{return json({ok:false,error:"The teacher details could not be saved."},503)}}
async function getTenantRecord(db, tenantId) {
  if (!/^[a-f0-9-]{36}$/iu.test(tenantId)) return null;
  const row = await db.prepare(
    "SELECT id,tenant_ref,name,student_display_name,status FROM teachers WHERE id=? LIMIT 1"
  ).bind(tenantId).first();
  return row ? {
    id: String(row.id),
    reference: String(row.tenant_ref),
    name: String(row.name),
    studentDisplayName: String(row.student_display_name),
    status: String(row.status)
  } : null;
}

function coreFailure(result, fallback) {
  const code = typeof result?.code === "string" ? result.code : "BRVIN_MANAGEMENT_FAILED";
  const message = typeof result?.message === "string" ? result.message.slice(0, 220) : fallback;
  const status = code === "PROJECT_NOT_FOUND" || code === "RESOURCE_NOT_FOUND" ? 404 :
    code === "IDEMPOTENCY_CONFLICT" || code === "COLLECTION_NOT_GRANTED" ? 409 :
    code === "INVALID_REQUEST" ? 400 : 502;
  return json({ ok: false, error: code, message, retryable: result?.retryable === true }, status);
}

async function storeProjectMapping(db, tenant, project, requestId) {
  const id = typeof project?.id === "string" ? project.id : "";
  const reference = typeof project?.reference === "string" ? project.reference : "";
  const name = clean(project?.name);
  const subject = clean(project?.subject) || name;
  if (!id || !reference || !name || !subject) throw new Error("BRVIN returned an incomplete project identity.");
  const now = Date.now();
  await db.prepare(
    "INSERT OR IGNORE INTO tenant_brvin_projects(id,tenant_id,brvin_project_id,project_ref,name,subject,provisioning_status,operation_id,created_at,updated_at) " +
    "VALUES(?,?,?,?,?,?,'active',?,?,?)"
  ).bind(crypto.randomUUID().toLowerCase(), tenant.id, id, reference, name, subject, requestId || null, now, now).run();
  const mapped = await db.prepare(
    "SELECT tenant_id,project_ref FROM tenant_brvin_projects WHERE brvin_project_id=? LIMIT 1"
  ).bind(id).first();
  if (!mapped || mapped.tenant_id !== tenant.id || mapped.project_ref !== reference) {
    throw new Error("A BRVIN project is already mapped to a different teacher workspace.");
  }
  await db.prepare(
    "UPDATE tenant_brvin_projects SET name=?,subject=?,provisioning_status='active',updated_at=? WHERE brvin_project_id=? AND tenant_id=?"
  ).bind(name, subject, now, id, tenant.id).run();
}

async function requireManagement(env) {
  if (!env?.BRVIN_MANAGEMENT) return { error: json({ ok: false, error: "BRVIN_MANAGEMENT_NOT_CONFIGURED", message: "The private BRVIN management binding is not configured." }, 503) };
  try {
    const health = await env.BRVIN_MANAGEMENT.health();
    if (!health?.ok) return { error: coreFailure(health, "The BRVIN application environment is not registered or active.") };
    return { management: env.BRVIN_MANAGEMENT };
  } catch {
    return { error: json({ ok: false, error: "BRVIN_MANAGEMENT_UNAVAILABLE", message: "The private BRVIN management service is temporarily unavailable." }, 503) };
  }
}

async function listTeacherProjects(env, tenant) {
  const connection = await requireManagement(env);
  if (connection.error) return connection.error;
  const result = await connection.management.listTeacherProjects({ tenantReference: tenant.reference });
  if (!result?.ok) return coreFailure(result, "BRVIN could not list classrooms.");
  const projects = Array.isArray(result.projects) ? result.projects : [];
  try {
    await env.DB.prepare(
      "UPDATE tenant_brvin_projects SET provisioning_status='revoked',updated_at=? WHERE tenant_id=? AND provisioning_status<>'revoked'"
    ).bind(Date.now(), tenant.id).run();
    for (const project of projects) await storeProjectMapping(env.DB, tenant, project, "");
    return json({ ok: true, projects: projects.map(project => ({
      id: String(project.id),
      reference: String(project.reference),
      name: String(project.name),
      subject: String(project.subject),
      description: String(project.description ?? ""),
      status: String(project.status),
      collectionCount: Number(project.collectionCount ?? 0),
      sourceCount: Number(project.sourceCount ?? 0),
      updatedAt: Number(project.updatedAt ?? 0)
    })) });
  } catch {
    return json({ ok: false, error: "PROJECT_MAPPING_RECONCILIATION_REQUIRED", message: "BRVIN listed the project, but the application mapping could not be reconciled. Retry this request." }, 503);
  }
}

async function createTeacherProject(env, tenant, body) {
  const name = clean(body.name);
  const subject = clean(body.subject);
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : "";
  const requestId = typeof body.requestId === "string" && /^[a-f0-9-]{36}$/iu.test(body.requestId)
    ? body.requestId.toLowerCase() : "";
  if (name.length < 2 || !subject || !requestId) return json({ ok: false, error: "Enter a classroom name, subject and valid request ID." }, 400);
  const connection = await requireManagement(env);
  if (connection.error) return connection.error;
  try {
    const result = await connection.management.createTeacherProject({
      tenantReference: tenant.reference,
      name,
      subject,
      description,
      ownerLabel: tenant.name,
      requestId
    });
    if (!result?.ok) return coreFailure(result, "BRVIN could not create this classroom.");
    await storeProjectMapping(env.DB, tenant, result.project, requestId);
    return json({ ok: true, project: result.project }, 201);
  } catch {
    return json({
      ok: false,
      error: "PROJECT_MAPPING_PENDING",
      message: "BRVIN created the classroom, but its application mapping could not be confirmed. Retry the same request so the operation can be reconciled."
    }, 503);
  }
}

async function updateTeacherProject(env,tenant,projectId,body){
const name=clean(body.name),subject=clean(body.subject),description=typeof body.description==="string"?body.description.trim().slice(0,500):"";
if(name.length<2||!subject)return json({ok:false,error:"Enter a classroom name and subject."},400);
const connection=await requireManagement(env);if(connection.error)return connection.error;
const result=await connection.management.updateTeacherProject({tenantReference:tenant.reference,projectId,name,subject,description});
if(!result?.ok)return coreFailure(result,"BRVIN could not update this classroom.");
try{await storeProjectMapping(env.DB,tenant,result.project,"");return json({ok:true,project:result.project})}
catch{return json({ok:false,error:"PROJECT_MAPPING_RECONCILIATION_REQUIRED",message:"BRVIN updated the classroom, but the application mapping could not be reconciled."},503)}
}

async function updateTeacherCollection(env,tenant,projectId,collectionId,body){
const name=clean(body.name),description=typeof body.description==="string"?body.description.trim().slice(0,500):"";
if(name.length<2)return json({ok:false,error:"Enter a collection name."},400);
const connection=await requireManagement(env);if(connection.error)return connection.error;
const result=await connection.management.updateTeacherCollection({tenantReference:tenant.reference,projectId,collectionId,name,description});
return result?.ok?json({ok:true,collection:result.collection}):coreFailure(result,"BRVIN could not update this collection.");
}

async function changeTeacherCollectionGrant(env,tenant,projectId,collectionId,grant){
const connection=await requireManagement(env);if(connection.error)return connection.error;
const method=grant?"grantTeacherCollection":"revokeTeacherCollection";
const result=await connection.management[method]({tenantReference:tenant.reference,projectId,collectionId});
return result?.ok?json({ok:true,projectId,collectionId,grant}):coreFailure(result,"BRVIN could not update this collection grant.");
}

async function listTeacherCollections(env, tenant, projectId) {
  const connection = await requireManagement(env);
  if (connection.error) return connection.error;
  const result = await connection.management.listTeacherCollections({
    tenantReference: tenant.reference,
    projectId
  });
  return result?.ok ? json({ ok: true, collections: result.collections }) : coreFailure(result, "BRVIN could not list collections.");
}

async function createTeacherCollection(env, tenant, projectId, body) {
  const name = clean(body.name);
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : "";
  const requestId = typeof body.requestId === "string" && /^[a-f0-9-]{36}$/iu.test(body.requestId)
    ? body.requestId.toLowerCase() : "";
  if (name.length < 2 || !requestId) return json({ ok: false, error: "Enter a collection name and valid request ID." }, 400);
  const connection = await requireManagement(env);
  if (connection.error) return connection.error;
  const result = await connection.management.createTeacherCollection({
    tenantReference: tenant.reference, projectId, name, description, requestId
  });
  return result?.ok ? json({ ok: true, collection: result.collection }, 201) : coreFailure(result, "BRVIN could not create this collection.");
}

async function listTeacherSources(env, tenant, projectId, collectionId) {
  const connection = await requireManagement(env);
  if (connection.error) return connection.error;
  const result = await connection.management.listTeacherSources({
    tenantReference: tenant.reference, projectId, collectionId
  });
  return result?.ok ? json({ ok: true, sources: result.sources }) : coreFailure(result, "BRVIN could not list sources.");
}

async function startTeacherSourceUpload(env, tenant, projectId, collectionId, body) {
  const title = clean(body.title);
  const filename = typeof body.filename === "string" ? body.filename.split(/[\\/]/u).pop()?.slice(0, 255) || "" : "";
  const sha256 = typeof body.sha256 === "string" ? body.sha256.toUpperCase() : "";
  const size = Number(body.size);
  const pageCount = Number(body.pageCount);
  if (!title || !filename || !/^[A-F0-9]{64}$/u.test(sha256) ||
      !Number.isSafeInteger(size) || size < 8 || size > 1024 * 1024 * 1024 ||
      !Number.isSafeInteger(pageCount) || pageCount < 1 || pageCount > 2000 ||
      body.costConfirmed !== true) {
    return json({ ok: false, error: "INVALID_UPLOAD_DETAILS", message: "Check the PDF name, fingerprint, file size, page count and OCR cost confirmation." }, 400);
  }
  const connection = await requireManagement(env);
  if (connection.error) return connection.error;
  const result = await connection.management.startTeacherSourceUpload({
    tenantReference: tenant.reference, projectId, collectionId,
    title, filename, sha256, size, pageCount, costConfirmed: true
  });
  return result?.ok ? json({ ok: true, source: result.source, upload: result.upload }, 201) : coreFailure(result, "BRVIN could not start this upload.");
}

async function handleTeacherSourceLifecycle(req, env, tenant, projectId, collectionId, importId, action) {
  const connection = await requireManagement(env);
  if (connection.error) return connection.error;
  if (action === "chunk") {
    if (!sameOrigin(req) || !req.headers.get("content-type")?.toLowerCase().startsWith("application/octet-stream")) {
      return json({ ok: false, error: "INVALID_CHUNK_REQUEST" }, 403);
    }
    const start = Number(req.headers.get("x-upload-start"));
    const totalSize = Number(req.headers.get("x-upload-total-size"));
    if (!Number.isSafeInteger(start) || start < 0 || !Number.isSafeInteger(totalSize) || totalSize < 8) {
      return json({ ok: false, error: "INVALID_CHUNK_RANGE" }, 400);
    }
    const bytes = await req.arrayBuffer();
    if (bytes.byteLength < 1 || bytes.byteLength > 8 * 1024 * 1024) return json({ ok: false, error: "CHUNK_SIZE_INVALID" }, 413);
    const result = await connection.management.uploadTeacherSourceChunk({
      tenantReference: tenant.reference, projectId, collectionId, importId, start, totalSize, bytes
    });
    return result?.ok ? json({ ok: true, upload: result.upload }) : coreFailure(result, "BRVIN could not accept this upload chunk.");
  }
  const input = { tenantReference: tenant.reference, projectId, collectionId, importId };
  const result = action === "complete"
    ? await connection.management.completeTeacherSourceUpload(input)
    : action === "resume"
      ? await connection.management.resumeTeacherSourceUpload(input)
      : await connection.management.getTeacherSourceStatus(input);
  return result?.ok ? json({ ok: true, result: result.result }) : coreFailure(result, "BRVIN could not complete this source operation.");
}

export async function handleOperatorRequest(req,env,ctx){const path=new URL(req.url).pathname;if(path!=="/operator"&&!path.startsWith("/operator/"))return null;const actor=await identity(ctx);if(!actor)return json({ok:false,error:"OPERATOR_AUTH_REQUIRED"},401);if(req.method==="GET"&&(path==="/operator"||path==="/operator/"))return page(PAGE);if(req.method==="GET"&&path==="/operator/assets/app.css")return asset(CSS+CSS_EXTRA,"text/css; charset=utf-8");if(req.method==="GET"&&path==="/operator/assets/app.js"){const{OPERATOR_CLIENT_JS}=await import("./operator-client.js");return asset(OPERATOR_CLIENT_JS,"application/javascript; charset=utf-8")}if(!path.startsWith("/operator/api/"))return json({ok:false,error:"NOT_FOUND"},404);if(!env?.DB)return json({ok:false,error:"APP_DATABASE_NOT_CONFIGURED"},503);if(req.method==="GET"&&path==="/operator/api/session")return json({ok:true,operator:{name:actor.name,email:actor.email}});if(req.method==="GET"&&path==="/operator/api/teachers"){try{return json({ok:true,teachers:await list(env.DB,new URL(req.url).searchParams.get("q")||"")})}catch{return json({ok:false,error:"TEACHER_DIRECTORY_UNAVAILABLE"},503)}}if(req.method==="POST"&&path==="/operator/api/teachers"){if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);const b=await readBody(req);return b?create(env.DB,actor,b):json({ok:false,error:"INVALID_REQUEST_BODY"},400)}const m=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})$/iu);if(m&&req.method==="GET"){try{const t=await get(env.DB,m[1]);return t?json({ok:true,teacher:t}):json({ok:false,error:"TEACHER_NOT_FOUND"},404)}catch{return json({ok:false,error:"TEACHER_WORKSPACE_UNAVAILABLE"},503)}}if(m&&req.method==="PATCH"){if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);const b=await readBody(req);return b?rename(env.DB,actor,m[1],b):json({ok:false,error:"INVALID_REQUEST_BODY"},400)}
const projectsMatch=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})\/projects$/iu);
if(projectsMatch){
  const tenant=await getTenantRecord(env.DB,projectsMatch[1]);
  if(!tenant)return json({ok:false,error:"TEACHER_NOT_FOUND"},404);
  if(req.method==="GET")return listTeacherProjects(env,tenant);
  if(req.method==="POST"){
    if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);
    const body=await readBody(req);return body?createTeacherProject(env,tenant,body):json({ok:false,error:"INVALID_REQUEST_BODY"},400);
  }
}
const projectDetailMatch=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})\/projects\/([a-f0-9-]{36})$/iu);
if(projectDetailMatch&&req.method==="PATCH"){
  if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);
  const tenant=await getTenantRecord(env.DB,projectDetailMatch[1]);if(!tenant)return json({ok:false,error:"TEACHER_NOT_FOUND"},404);
  const body=await readBody(req);return body?updateTeacherProject(env,tenant,projectDetailMatch[2],body):json({ok:false,error:"INVALID_REQUEST_BODY"},400);
}
const collectionsMatch=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})\/projects\/([a-f0-9-]{36})\/collections$/iu);
if(collectionsMatch){
  const tenant=await getTenantRecord(env.DB,collectionsMatch[1]);
  if(!tenant)return json({ok:false,error:"TEACHER_NOT_FOUND"},404);
  if(req.method==="GET")return listTeacherCollections(env,tenant,collectionsMatch[2]);
  if(req.method==="POST"){
    if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);
    const body=await readBody(req);return body?createTeacherCollection(env,tenant,collectionsMatch[2],body):json({ok:false,error:"INVALID_REQUEST_BODY"},400);
  }
}
const collectionShareMatch=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})\/projects\/([a-f0-9-]{36})\/collections\/([a-f0-9-]{36})\/share$/iu);
if(collectionShareMatch&&(req.method==="POST"||req.method==="DELETE")){
  if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);
  const tenant=await getTenantRecord(env.DB,collectionShareMatch[1]);if(!tenant)return json({ok:false,error:"TEACHER_NOT_FOUND"},404);
  return changeTeacherCollectionGrant(env,tenant,collectionShareMatch[2],collectionShareMatch[3],req.method==="POST");
}
const collectionDetailMatch=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})\/projects\/([a-f0-9-]{36})\/collections\/([a-f0-9-]{36})$/iu);
if(collectionDetailMatch&&req.method==="PATCH"){
  if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);
  const tenant=await getTenantRecord(env.DB,collectionDetailMatch[1]);if(!tenant)return json({ok:false,error:"TEACHER_NOT_FOUND"},404);
  const body=await readBody(req);return body?updateTeacherCollection(env,tenant,collectionDetailMatch[2],collectionDetailMatch[3],body):json({ok:false,error:"INVALID_REQUEST_BODY"},400);
}
const sourcesMatch=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})\/projects\/([a-f0-9-]{36})\/collections\/([a-f0-9-]{36})\/sources$/iu);
if(sourcesMatch){
  const tenant=await getTenantRecord(env.DB,sourcesMatch[1]);
  if(!tenant)return json({ok:false,error:"TEACHER_NOT_FOUND"},404);
  if(req.method==="GET")return listTeacherSources(env,tenant,sourcesMatch[2],sourcesMatch[3]);
  if(req.method==="POST"&&path.endsWith("/sources")){
    if(!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);
    const body=await readBody(req);return body?startTeacherSourceUpload(env,tenant,sourcesMatch[2],sourcesMatch[3],body):json({ok:false,error:"INVALID_REQUEST_BODY"},400);
  }
}
const sourceLifecycleMatch=path.match(/^\/operator\/api\/teachers\/([a-f0-9-]{36})\/projects\/([a-f0-9-]{36})\/collections\/([a-f0-9-]{36})\/sources\/([a-f0-9-]{36})\/(chunk|complete|resume|status)$/iu);
if(sourceLifecycleMatch){
  const tenant=await getTenantRecord(env.DB,sourceLifecycleMatch[1]);
  if(!tenant)return json({ok:false,error:"TEACHER_NOT_FOUND"},404);
  const action=sourceLifecycleMatch[5].toLowerCase();
  if(action==="status"&&req.method==="GET")return handleTeacherSourceLifecycle(req,env,tenant,sourceLifecycleMatch[2],sourceLifecycleMatch[3],sourceLifecycleMatch[4],"status");
  if(action!=="status"&&req.method==="POST"){
    if(action!=="chunk"&&!validWrite(req))return json({ok:false,error:"INVALID_ORIGIN_OR_CONTENT_TYPE"},403);
    return handleTeacherSourceLifecycle(req,env,tenant,sourceLifecycleMatch[2],sourceLifecycleMatch[3],sourceLifecycleMatch[4],action);
  }
}
return json({ok:false,error:"NOT_FOUND"},404)}
