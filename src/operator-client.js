import { sha256File } from "./sha256.js";

export export function buildSourceProgressModel(payload, fallbackSource = {}, transfer = null) {
  const body = payload && typeof payload === "object" && payload.result && typeof payload.result === "object"
    ? payload.result : payload && typeof payload === "object" ? payload : {};
  const job = body.import && typeof body.import === "object" ? body.import : {};
  const pipeline = body.pipeline && typeof body.pipeline === "object" ? body.pipeline : {};
  const vision = pipeline.vision && typeof pipeline.vision === "object" ? pipeline.vision : {};
  const workflow = pipeline.workflow && typeof pipeline.workflow === "object" ? pipeline.workflow : {};
  const events = Array.isArray(body.events) ? body.events.filter(event => event && typeof event === "object") : [];
  const status = String(job.status || fallbackSource.status || "unknown").toLowerCase();
  const expectedBytes = Math.max(0, Number(job.expectedSize ?? transfer?.totalBytes ?? fallbackSource.size ?? 0) || 0);
  const serverBytes = Math.max(0, Number(job.uploadedBytes ?? 0) || 0);
  const localBytes = transfer && transfer.active ? Math.max(0, Number(transfer.uploadedBytes ?? 0) || 0) : 0;
  const uploadedBytes = Math.min(expectedBytes || Number.MAX_SAFE_INTEGER, Math.max(serverBytes, localBytes));
  const uploadComplete = expectedBytes > 0
    ? uploadedBytes >= expectedBytes
    : ["uploaded", "processing", "completed", "ready"].includes(status);
  const expectedPages = Math.max(0, Number(job.expectedPages ?? fallbackSource.pageCount ?? 0) || 0);
  const indexedPages = Math.max(0, Number(job.indexedPages ?? fallbackSource.indexedPages ?? 0) || 0);
  const indexComplete = expectedPages > 0 ? indexedPages >= expectedPages : ["completed", "ready"].includes(status);
  const eventType = event => String(event.type || event.eventType || "").toLowerCase();
  const eventPhase = event => String(event.phase || "").toLowerCase();
  const eventTask = event => String(event.details?.task || "").toLowerCase();
  const latestEvent = events[0] || null;
  const latestFailure = status === "failed"
    ? events.find(event => ["failed", "error"].includes(String(event.status || "").toLowerCase()) &&
        !["retention", "cleanup", "deletion"].includes(eventPhase(event)))
    : null;
  const ocrVerified = events.some(event => eventType(event) === "ocr.output_verified" &&
    String(event.status || "").toLowerCase() === "completed");
  const visionDone = (String(vision.status || "").toLowerCase() === "completed" && !vision.error) ||
    ocrVerified || events.some(event => eventType(event).startsWith("index.") || eventType(event) === "qa.started");
  const qaDone = events.some(event => eventType(event) === "qa.passed" &&
    String(event.status || "").toLowerCase() === "completed") || ["completed", "ready"].includes(status);
  const readyDone = ["completed", "ready"].includes(status) ||
    String(fallbackSource.status || "").toLowerCase() === "ready";

  let failureStage = null;
  if (latestFailure) {
    const combined = [
      eventTask(latestFailure), eventPhase(latestFailure), eventType(latestFailure),
      String(latestFailure.message || "")
    ].join(" ").toLowerCase();
    if (/quality_check|verification|retrieval qa|\bqa\b/u.test(combined)) failureStage = 3;
    else if (/index_chunk|retry_page|repair_chunk|resume_index|index|page/u.test(combined)) failureStage = 2;
    else if (/vision|ocr/u.test(combined)) failureStage = 1;
    else if (/upload|transfer|sha-?256/u.test(combined)) failureStage = 0;
    else if (vision.error) failureStage = 1;
    else if (!uploadComplete) failureStage = 0;
    else if (indexComplete) failureStage = 3;
    else if (visionDone) failureStage = 2;
    else failureStage = 1;
  } else if (status === "failed") {
    if (!uploadComplete) failureStage = 0;
    else if (vision.error) failureStage = 1;
    else if (indexComplete) failureStage = 3;
    else if (visionDone) failureStage = 2;
    else failureStage = 1;
  }

  const uploadPercent = expectedBytes > 0 ? Math.max(0, Math.min(100, Math.floor(uploadedBytes / expectedBytes * 100))) : 0;
  const indexPercent = expectedPages > 0 ? Math.max(0, Math.min(100, Math.floor(indexedPages / expectedPages * 100))) : 0;
  const findEvent = predicate => events.find(predicate) || null;
  const uploadEvent = findEvent(event => eventPhase(event).includes("upload") || eventType(event).includes("upload"));
  const visionEvent = findEvent(event => eventPhase(event) === "ocr" || eventType(event).includes("ocr"));
  const indexEvent = findEvent(event => eventPhase(event) === "index" || eventType(event).includes("index") ||
    ["index_chunk", "retry_page", "repair_chunk", "resume_index"].includes(eventTask(event)));
  const qaEvent = findEvent(event => eventPhase(event) === "verification" || eventType(event).startsWith("qa."));
  const readyEvent = findEvent(event => eventType(event).includes("ready") || eventType(event).includes("completed"));

  const bytesLabel = value => {
    if (!Number.isFinite(value) || value <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = value, unit = 0;
    while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
    return (unit === 0 ? String(Math.round(size)) : size.toFixed(1)) + " " + units[unit];
  };
  const uploadDetail = uploadComplete
    ? bytesLabel(uploadedBytes) + " of " + bytesLabel(expectedBytes) + " transferred to private storage."
    : transfer?.active
      ? "Uploading PDF · " + uploadPercent + "% · " + bytesLabel(uploadedBytes) + " of " + bytesLabel(expectedBytes) + "."
      : uploadedBytes > 0
        ? "Upload paused at " + uploadPercent + "% · " + bytesLabel(uploadedBytes) + " of " + bytesLabel(expectedBytes) + ". Select the same PDF again to resume from this saved offset."
        : "Waiting for the secure PDF transfer to finish.";
  const visionDetail = visionEvent?.message || (visionDone
    ? "Google Cloud Vision completed document text detection. BRVIN is moving the saved page output through indexing."
    : String(vision.status || "").toLowerCase() === "running"
      ? "Google Cloud Vision is processing the PDF. This runs in the background on BRVIN Core."
      : uploadComplete
        ? "The secure upload is complete. BRVIN is preparing the Vision OCR job."
        : "Starts automatically after the secure PDF upload completes.");
  const indexDetail = indexEvent?.message || (indexComplete
    ? "All " + expectedPages + " expected pages have been indexed."
    : visionDone
      ? "Indexed " + indexedPages + " of " + (expectedPages || "the expected") + " pages. BRVIN is processing the remaining pages."
      : "Page indexing starts after Vision OCR output is available.");
  const qaDetail = qaEvent?.message || (qaDone
    ? "Page-grounded retrieval QA passed."
    : indexComplete
      ? "All pages are indexed. BRVIN is checking that retrieved answers retain their original PDF-page provenance."
      : "Starts automatically after every expected page has been indexed.");
  const readyDetail = readyDone
    ? readyEvent?.message || "All required ingestion and retrieval checks passed. This source is READY for its authorized projects."
    : qaDone
      ? "Retrieval checks passed. BRVIN is finalizing the source's READY state."
      : "The source becomes READY only after page indexing and retrieval QA both pass.";

  const definitions = [
    { key: "upload", title: "Secure PDF upload", detail: uploadDetail },
    { key: "vision", title: "Vision OCR", detail: visionDetail },
    { key: "index", title: "Page indexing", detail: indexDetail },
    { key: "qa", title: "Retrieval quality checks", detail: qaDetail },
    { key: "ready", title: "Ready", detail: readyDetail }
  ];
  const done = [uploadComplete, visionDone, indexComplete, qaDone, readyDone];
  let activeStage = failureStage === null
    ? done.findIndex(value => !value)
    : -1;
  if (activeStage < 0 && failureStage === null && !readyDone) activeStage = 4;
  const failureMessage = latestFailure?.message || String(job.error || vision.error || workflow.error || fallbackSource.error || "");
  const stages = definitions.map((definition, index) => {
    let state = done[index] ? "completed" : "pending";
    if (failureStage !== null) {
      state = index < failureStage ? "completed" : index === failureStage ? "failed" : "pending";
    } else if (index === activeStage) {
      state = "active";
    }
    return {
      ...definition,
      state,
      error: state === "failed" ? (failureMessage || "BRVIN stopped at this stage without returning an error message.") : "",
      detail: state === "failed" && failureMessage ? failureMessage : definition.detail
    };
  });
  const completedStages = stages.filter(stage => stage.state === "completed").length;
  const progressFraction = failureStage === null
    ? activeStage === 0 ? uploadPercent / 100
      : activeStage === 2 ? indexPercent / 100
      : 0
    : 0;
  const progressPercent = readyDone ? 100 : Math.max(0, Math.min(100,
    Math.round((completedStages + progressFraction) / stages.length * 100)));
  const overallState = readyDone ? "ready" : failureStage !== null ? "failed" :
    !uploadComplete ? "uploading" : "processing";
  const overallLabel = overallState === "ready" ? "Ready" :
    overallState === "failed" ? "Failed" :
    overallState === "uploading" ? "Uploading" : "Processing";
  const updatedAt = Number(job.updatedAt || latestEvent?.createdAt || fallbackSource.updatedAt || 0) || 0;
  return {
    status, overallState, overallLabel, stages, progressPercent, completedStages,
    expectedBytes, uploadedBytes, uploadPercent, expectedPages, indexedPages, indexPercent,
    failureStage, failureMessage, updatedAt, latestEvent,
    workflowStatus: String(workflow.status || ""),
    visionStatus: String(vision.status || ""),
    transferActive: Boolean(transfer?.active),
    uploadPaused: !uploadComplete && !transfer?.active && uploadedBytes > 0
  };
}

export const OPERATOR_CLIENT_JS = `(() => {
"use strict";
const sha256File = ${sha256File.toString()};
const buildSourceProgressModel = ${buildSourceProgressModel.toString()};

const $=id=>document.getElementById(id),content=$("content"),dialog=$("create-dialog"),form=$("create-form");let teachers=[],toastTimer=null,sourceProgressState=null,sourceProgressTimer=null,sourceProgressSequence=0;
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n}
function btn(text,cls,action){const n=el("button",cls,text);n.type="button";if(action)n.addEventListener("click",action);return n}
async function api(path,options){const r=await fetch("/operator/api/"+path,{credentials:"same-origin",cache:"no-store",...options,headers:{...(options&&options.headers?options.headers:{})}});let d={};try{d=await r.json()}catch{}if(r.status===401)throw new Error("Your operator session expired. Refresh and sign in again.");if(!r.ok||d.ok!==true)throw new Error(d.message||d.error||"Request failed.");return d}
async function refreshCoreStatus(){const card=$("core-status"),label=$("core-status-text");if(!card||!label)return;card.dataset.status="checking";label.textContent="Checking management link…";try{await api("brvin-management/health");card.dataset.status="connected";label.textContent="Management connected";card.setAttribute("aria-label","BRVIN Core management connected")}catch{card.dataset.status="unavailable";label.textContent="Management unavailable";card.setAttribute("aria-label","BRVIN Core management unavailable")}}
async function apiBinary(path,bytes,headers){const r=await fetch("/operator/api/"+path,{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"content-type":"application/octet-stream",...(headers||{})},body:bytes});let d={};try{d=await r.json()}catch{}if(r.status===401)throw new Error("Your operator session expired. Refresh and sign in again.");if(!r.ok||d.ok!==true)throw new Error(d.message||d.error||"The source chunk could not be uploaded.");return d}

function stopSourceProgressPolling(){if(sourceProgressTimer!==null){clearTimeout(sourceProgressTimer);sourceProgressTimer=null}}
function sourceProgressIsOpen(){const modal=$("source-progress-dialog");return Boolean(modal&&modal.open)}
function sourceProgressRoute(state){const c=state.context,s=state.source;return "teachers/"+encodeURIComponent(c.tenantId)+"/projects/"+encodeURIComponent(c.projectId)+"/collections/"+encodeURIComponent(c.collectionId)+"/sources/"+encodeURIComponent(s.id)+"/status"}
function sourceProgressTimestamp(value){const date=new Date(Number(value)||0);if(!Number.isFinite(date.getTime())||date.getTime()<=0)return "Waiting for the first server update";return "Updated "+new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(date)}
function sourceProgressSpinner(){const spin=el("span","source-step-spinner");spin.setAttribute("aria-label","In progress");for(let i=0;i<4;i++)spin.append(el("i"));return spin}
function renderSourceProgress(){
 const state=sourceProgressState;if(!state)return;
 const model=buildSourceProgressModel(state.data||{},state.source,state.transfer);
 const subtitle=$("source-progress-subtitle"),summary=$("source-progress-summary"),steps=$("source-progress-steps"),updated=$("source-progress-updated"),footnote=$("source-progress-footnote");
 if(!summary||!steps)return;
 subtitle.textContent=[state.source.title||state.source.filename||"PDF source",state.source.reference||""].filter(Boolean).join(" · ");
 summary.replaceChildren();
 const main=el("div","source-progress-summary-main");
 main.append(el("strong","",model.overallLabel+" · "+model.completedStages+" of 5 stages complete"));
 const pageLabel=model.expectedPages>0?(model.indexedPages+"/"+model.expectedPages+" pages indexed"):"Awaiting page metadata";
 const uploadLabel=model.expectedBytes>0?(model.uploadPercent+"% PDF transfer"):"Secure upload";
 main.append(el("small","",pageLabel+" · "+uploadLabel));
 const bar=el("div","source-progress-count"),fill=el("i");fill.style.width=model.progressPercent+"%";bar.append(fill);main.append(bar);
 const badge=el("span","source-progress-status",model.overallLabel);badge.dataset.state=model.overallState;
 summary.append(main,badge);
 const oldNotice=summary.nextElementSibling;
 if(oldNotice&&oldNotice.classList.contains("source-progress-connection"))oldNotice.remove();
 if(state.connectionProblem){
  const notice=el("p","source-progress-connection",state.connectionProblem);
  notice.dataset.state="error";notice.setAttribute("role","status");summary.after(notice);
 }
 steps.replaceChildren();
 model.stages.forEach((stage,index)=>{
  const row=el("article","source-step");row.dataset.state=stage.state;
  const marker=el("span","source-step-marker");
  if(stage.state==="active")marker.append(sourceProgressSpinner());
  else marker.textContent=stage.state==="completed"?"✓":stage.state==="failed"?"!":String(index+1);
  const copy=el("div","source-step-copy"),head=el("div","source-step-head");
  head.append(el("strong","",stage.title),el("span","source-step-state",stage.state==="completed"?"Complete":stage.state==="active"?"In progress":stage.state==="failed"?"Failed":"Waiting"));
  copy.append(head);
  if(stage.state==="failed"){
   copy.append(el("div","source-step-error",stage.error||stage.detail||"This stage failed without a returned error message."));
  }else{
   copy.append(el("p","source-step-detail",stage.detail));
  }
  row.append(marker,copy);steps.append(row);
 });
 if(model.overallState==="ready"){
  footnote.textContent="Ready. The server confirmed that page indexing and retrieval quality checks passed. The source is now available to authorized projects.";
 }else if(model.uploadPaused){
  footnote.textContent="The partial PDF transfer is saved in BRVIN Core. To continue a transfer interrupted before completion, select the same PDF again in this collection; BRVIN will resume from the saved byte offset.";
 }else if(model.transferActive){
  footnote.textContent="The browser is transferring the PDF in resumable chunks. Once secure upload completes, OCR, indexing and quality checks continue on BRVIN Core even when this window is closed.";
 }else if(model.overallState==="failed"){
  footnote.textContent="BRVIN has recorded this failure against the stage shown in red. Closing this window will not change the saved source or its processing history.";
 }else{
  footnote.textContent="The secure PDF upload has completed. OCR, page indexing and retrieval quality checks continue in a server-side BRVIN Workflow. Close this window and reopen View progress later to see the latest saved state.";
 }
 updated.textContent=sourceProgressTimestamp(model.updatedAt);
}
async function pollSourceProgress(sequence){
 const state=sourceProgressState;if(!state||sequence!==sourceProgressSequence||!sourceProgressIsOpen())return;
 stopSourceProgressPolling();
 try{
  const response=await api(sourceProgressRoute(state));
  if(!sourceProgressState||sequence!==sourceProgressSequence)return;
  state.data=response.result||response;state.connectionProblem="";
  renderSourceProgress();
  const model=buildSourceProgressModel(state.data,state.source,state.transfer);
  if(model.overallState==="ready")return;
 }catch(error){
  if(!sourceProgressState||sequence!==sourceProgressSequence)return;
  state.connectionProblem=error.message||"Could not refresh the BRVIN status. Retrying…";
  renderSourceProgress();
 }
 if(sourceProgressState&&sequence===sourceProgressSequence&&sourceProgressIsOpen()){
  const hidden=document.visibilityState==="hidden";
  const delay=hidden?12000:state.connectionProblem?6000:4000;
  sourceProgressTimer=setTimeout(()=>void pollSourceProgress(sequence),delay);
 }
}
function openSourceProgress(source,context,transfer=null){
 const modal=$("source-progress-dialog");if(!modal)return;
 stopSourceProgressPolling();
 const same=sourceProgressState&&sourceProgressState.source.id===source.id;
 sourceProgressSequence+=1;
 sourceProgressState={
  source:{...source},
  context:{...context},
  transfer:transfer||(same?sourceProgressState.transfer:null),
  data:same?sourceProgressState.data:null,
  connectionProblem:""
 };
 if(!modal.open)modal.showModal();
 renderSourceProgress();
 void pollSourceProgress(sourceProgressSequence);
}
function updateSourceProgressTransfer(transfer){
 if(!sourceProgressState||sourceProgressState.source.id!==transfer.id)return;
 sourceProgressState.transfer={...transfer};
 renderSourceProgress();
}
function toast(msg){const n=$("toast");n.textContent=msg;n.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.classList.remove("visible"),2500)}
function metric(label,value,caption){const m=el("article","metric");m.append(el("small","",label),el("strong","",value),el("em","",caption));return m}
function teacherCard(t){const c=el("article","teacher"),main=el("div"),meta=el("div","meta"),actions=el("div","teacher-actions");main.append(el("h3","",t.name));meta.append(el("span","ref",t.reference),el("span","","·"),el("span","","Student display: "+t.studentDisplayName));main.append(meta);actions.append(el("span","pill",t.status),btn("Open workspace →","text-btn",()=>workspace(t.id)));c.append(main,actions);return c}
function directory(){$("page-title").textContent="Teachers";content.replaceChildren();const intro=el("div","intro"),txt=el("div"),search=el("input","search");txt.append(el("h2","","Teacher workspaces"),el("p","","Create and manage individual teacher environments from one place."));search.type="search";search.placeholder="Search by name or reference";intro.append(txt,search);const metrics=el("div","metrics");metrics.append(metric("Total teachers",teachers.length,"Real workspaces"),metric("Active workspaces",teachers.filter(t=>t.status==="active").length,"Currently enabled"),metric("Knowledge projects","—","After BRVIN management connects"));const panel=el("section","panel"),head=el("div","panel-head"),text=el("div"),list=el("div","teacher-list");text.append(el("h3","","All teachers"),el("p","","Names may repeat. Each workspace has its own permanent reference."));head.append(text,el("small","",teachers.length+" records"));panel.append(head,list);content.append(intro,metrics,panel);search.addEventListener("input",()=>searchList(search.value,list));if(!teachers.length){const empty=el("div","empty");empty.append(el("h3","","No teachers yet"),el("p","","Create your first teacher workspace. The ID and reference are generated automatically."),btn("Create first teacher","primary",openDialog));list.append(empty)}else teachers.forEach(t=>list.append(teacherCard(t)))}
async function searchList(q,list){try{const d=await api("teachers"+(q?"?q="+encodeURIComponent(q):""));list.replaceChildren();if(!d.teachers.length){const empty=el("div","empty");empty.append(el("h3","","No matching teachers"),el("p","","Try another name or reference."));list.append(empty)}else d.teachers.forEach(t=>list.append(teacherCard(t)))}catch(e){list.replaceChildren(el("div","empty",e.message))}}
function fail(e){content.replaceChildren();const empty=el("div","empty");empty.append(el("h3","","Could not load workspace"),el("p","",e.message));content.append(empty)}
function openDialog(){$("form-error").hidden=true;form.reset();dialog.showModal();$("name").focus()}
function closeDialog(){dialog.close()}
async function create(e){e.preventDefault();const save=$("save"),err=$("form-error");save.disabled=true;save.textContent="Creating…";err.hidden=true;try{const d=await api("teachers",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:$("name").value,studentDisplayName:$("student-name").value})});closeDialog();toast(d.teacher.reference+" created");teachers=(await api("teachers")).teachers;directory();await workspace(d.teacher.id)}catch(x){err.textContent=x.message;err.hidden=false}finally{save.disabled=false;save.textContent="Create workspace"}}
function pending(title,desc,note){const c=el("article","workspace-card");c.append(el("h3","",title),el("p","",desc),el("div","note",note));return c}
async function rename(e,t){e.preventDefault();const save=e.currentTarget.querySelector("button[type=submit]");save.disabled=true;save.textContent="Saving…";try{await api("teachers/"+encodeURIComponent(t.id),{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({name:$("edit-name").value,studentDisplayName:$("edit-student").value})});teachers=(await api("teachers")).teachers;toast("Saved; tenant reference unchanged.");await workspace(t.id)}catch(x){toast(x.message);save.disabled=false;save.textContent="Save changes"}}
async function workspace(id){
try{
const t=(await api("teachers/"+encodeURIComponent(id))).teacher;
content.replaceChildren();$("page-title").textContent=t.name;
const head=el("div","workspace-head");head.append(btn("← Teachers","back",directory));
const title=el("div","workspace-title");title.append(el("h2","",t.name));
const sub=el("div","workspace-sub");sub.append(el("span","ref",t.reference),el("span","pill",t.status),el("span","","Created "+new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(t.createdAt)));
title.append(sub);head.append(title);content.append(head);
const tabs=el("div","tabs"),grid=el("div","grid");content.append(tabs,grid);
let classroomRequestId=null,collectionRequestId=null;
function choose(name){tabs.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.textContent===name))}
function pending(title,desc,note){const c=el("article","workspace-card");c.append(el("h3","",title),el("p","",desc),el("div","note",note));return c}
function field(label,id,type="text",value=""){const wrap=el("div","field-group");const l=el("label","",label);l.htmlFor=id;const input=el("input","field-input");input.id=id;input.type=type;input.value=value;input.maxLength=type==="number"?undefined:120;wrap.append(l,input);return{wrap,input}}
function overview(){
choose("Overview");grid.replaceChildren();
const profile=el("section","workspace-card");profile.append(el("h3","","Teacher profile"),el("p","","Edit the workspace name and student-facing name."));
const f=el("form","edit-form"),a=field("Teacher name","edit-name","text",t.name),b=field("Student-facing name","edit-student","text",t.studentDisplayName);
a.input.required=true;b.input.required=true;const save=el("button","primary","Save changes");save.type="submit";f.append(a.wrap,b.wrap,save);f.addEventListener("submit",e=>rename(e,t));profile.append(f);
grid.append(profile,pending("Classrooms","Subject-specific BRVIN knowledge projects with their own collections and sources.","Create and manage real classrooms from the Classrooms tab."),pending("Students","Student identities and enrolments belong to this teacher workspace.","Not implemented yet."),pending("Channels","Connect supported teaching channels.","No channel credentials have been collected."),pending("Usage","Usage and costs appear once student and model workflows are active.","No fabricated totals."),pending("Activity","Tenant-scoped administrative history.","Create/rename events are stored in the application audit table."));
}
async function classrooms(){
choose("Classrooms");grid.replaceChildren();
const intro=el("section","workspace-card");intro.append(el("h3","","Classrooms"),el("p","","Each classroom is a BRVIN Core knowledge project. It is the subject-specific retrieval boundary."));
const form=el("form","class-form"),name=field("Classroom name","class-name"),subject=field("Subject","class-subject"),description=field("Description","class-description");
name.input.placeholder="e.g. Physics — Newton's Laws of Motion";subject.input.placeholder="e.g. Physics";description.input.placeholder="What this classroom covers";description.input.maxLength=500;
const create=el("button","primary","Create classroom");create.type="submit";form.append(name.wrap,subject.wrap,description.wrap,create);intro.append(form);
const list=el("div","classroom-list");grid.append(intro,list);list.append(el("div","loading","Loading classrooms…"));
try{
const result=await api("teachers/"+encodeURIComponent(t.id)+"/projects");list.replaceChildren();
if(!result.projects.length){const empty=el("div","empty");empty.append(el("h3","","No classrooms yet"),el("p","","Create the first subject classroom for this teacher."));list.append(empty)}
else result.projects.forEach(project=>{const c=el("article","teacher"),left=el("div"),right=el("div","teacher-actions"),meta=el("div","meta");left.append(el("h3","",project.name));meta.append(el("span","ref",project.reference),el("span","","·"),el("span","",project.subject),el("span","","·"),el("span","",Number(project.collectionCount||0)+" collections"),el("span","","·"),el("span","",Number(project.sourceCount||0)+" sources"));left.append(meta);right.append(el("span","pill",project.status),btn("Open classroom →","text-btn",()=>classroom(project)));c.append(left,right);list.append(c)});
}catch(error){list.replaceChildren(pending("BRVIN management is not ready",error.message,"Register and activate the BRVIN Teachers application environment in BRVIN Admin, then connect its ID in the deployment configuration."))}
form.addEventListener("submit",async e=>{
e.preventDefault();create.disabled=true;create.textContent="Creating…";
try{
const requestId=classroomRequestId||(classroomRequestId=crypto.randomUUID());
await api("teachers/"+encodeURIComponent(t.id)+"/projects",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:name.input.value,subject:subject.input.value,description:description.input.value,requestId})});
classroomRequestId=null;toast("Classroom created");classrooms();
}catch(error){toast(error.message)}finally{create.disabled=false;create.textContent="Create classroom"}
});
}
async function classroom(project){
choose("Classrooms");grid.replaceChildren();
const top=el("div","workspace-card");top.append(btn("← Classrooms","text-btn",classrooms),el("h3","",project.name),el("p","",project.reference+" · "+project.subject),el("div","note","This project is the retrieval boundary. Only its explicitly granted collections and sources can be retrieved."));
const editCard=el("section","workspace-card");editCard.append(el("h3","","Edit classroom"),el("p","","Change its display name or subject; its BRVIN ID and reference stay the same."));
const editForm=el("form","class-form"),editName=field("Classroom name","edit-class-name"),editSubject=field("Subject","edit-class-subject"),editDescription=field("Description","edit-class-description");
editName.input.value=project.name;editSubject.input.value=project.subject;editDescription.input.value=project.description||"";editDescription.input.maxLength=500;
const editSave=el("button","primary","Save classroom");editSave.type="submit";editForm.append(editName.wrap,editSubject.wrap,editDescription.wrap,editSave);editCard.append(editForm);
const createCard=el("section","workspace-card");createCard.append(el("h3","","Create collection"),el("p","","A collection is a named bookshelf inside this classroom."));
const form=el("form","class-form"),name=field("Collection name","collection-name"),desc=field("Description","collection-description");
name.input.placeholder="e.g. Teacher Notes";desc.input.placeholder="e.g. Chapter notes and worked examples";desc.input.maxLength=500;
const save=el("button","primary","Create collection");save.type="submit";form.append(name.wrap,desc.wrap,save);createCard.append(form);
const list=el("div","collection-list");grid.append(top,editCard,createCard,list);list.append(el("div","loading","Loading collections…"));
editForm.addEventListener("submit",async e=>{e.preventDefault();editSave.disabled=true;editSave.textContent="Saving…";try{const updated=await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id),{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({name:editName.input.value,subject:editSubject.input.value,description:editDescription.input.value})});toast("Classroom details saved; reference unchanged.");await classrooms()}catch(error){toast(error.message)}finally{editSave.disabled=false;editSave.textContent="Save classroom"}});
async function refresh(){
try{
const result=await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections");list.replaceChildren();
if(!result.collections.length){const empty=el("div","empty");empty.append(el("h3","","No collections yet"),el("p","","Create a collection such as Notes or Shortcuts, then add approved PDF sources."));list.append(empty)}
else result.collections.forEach(c=>{const card=el("article","teacher"),main=el("div"),actions=el("div","teacher-actions"),meta=el("div","meta");main.append(el("h3","",c.name));meta.append(el("span","ref",c.reference),el("span","","·"),el("span","",c.ownership),el("span","","·"),el("span","",c.sourceCount+" sources"));main.append(meta);actions.append(btn("Open bookshelf →","text-btn",()=>collection(project,c)));card.append(main,actions);list.append(card)})
}catch(error){list.replaceChildren(pending("Collections unavailable",error.message,"The request is tenant-scoped and requires the active registered BRVIN management environment."))}
}
form.addEventListener("submit",async e=>{e.preventDefault();save.disabled=true;save.textContent="Creating…";try{await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:name.input.value,description:desc.input.value,requestId:(collectionRequestId||(collectionRequestId=crypto.randomUUID()))})});collectionRequestId=null;toast("Collection created");await refresh()}catch(error){toast(error.message)}finally{save.disabled=false;save.textContent="Create collection"}});
await refresh();
}
async function collection(project,c){
choose("Classrooms");grid.replaceChildren();
const top=el("div","workspace-card");top.append(btn("← "+project.name,"text-btn",()=>classroom(project)),el("h3","",c.name),el("p","",c.reference+" · "+c.ownership+" collection"),el("div","note","PDF sources stay in BRVIN private storage. OCR and indexing run in the existing BRVIN workflow."));
const manage=el("section","workspace-card");
if(c.ownership==="owned"){
manage.append(el("h3","","Edit bookshelf"),el("p","","Change the collection display name without changing its origin or reference."));
const editForm=el("form","class-form"),editName=field("Collection name","edit-collection-name"),editDescription=field("Description","edit-collection-description");
editName.input.value=c.name;editDescription.input.value=c.description||"";editDescription.input.maxLength=500;
const editSave=el("button","primary","Save bookshelf");editSave.type="submit";editForm.append(editName.wrap,editDescription.wrap,editSave);manage.append(editForm);
editForm.addEventListener("submit",async e=>{e.preventDefault();editSave.disabled=true;editSave.textContent="Saving…";try{await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections/"+encodeURIComponent(c.id),{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({name:editName.input.value,description:editDescription.input.value})});c.name=editName.input.value;c.description=editDescription.input.value;toast("Bookshelf updated; reference unchanged.");await collection(project,c)}catch(error){toast(error.message)}finally{editSave.disabled=false;editSave.textContent="Save bookshelf"}});
const shareHead=el("h3","","Share bookshelf"),shareText=el("p","","Share this collection with another classroom belonging to the same teacher. Its source references stay tied to this bookshelf.");
manage.append(shareHead,shareText);
const shareForm=el("form","class-form"),shareWrap=el("div","field-group"),shareLabel=el("label","","Classroom"),shareSelect=el("select","field-input");shareLabel.htmlFor="share-project";shareSelect.id="share-project";shareWrap.append(shareLabel,shareSelect);const shareButton=el("button","primary","Share collection");shareButton.type="submit";shareForm.append(shareWrap,shareButton);manage.append(shareForm);
try{
const projects=(await api("teachers/"+encodeURIComponent(t.id)+"/projects")).projects||[];
const targets=projects.filter(p=>p.id!==project.id);
targets.forEach(p=>{const option=el("option","",p.name+" · "+p.reference);option.value=p.id;shareSelect.append(option)});
if(!targets.length){shareSelect.disabled=true;shareButton.disabled=true;shareSelect.append(el("option","","No other classrooms yet"))}
}catch(error){shareSelect.disabled=true;shareButton.disabled=true;toast("Could not load classrooms for sharing: "+error.message)}
shareForm.addEventListener("submit",async e=>{e.preventDefault();if(!shareSelect.value)return;shareButton.disabled=true;shareButton.textContent="Sharing…";try{await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(shareSelect.value)+"/collections/"+encodeURIComponent(c.id)+"/share",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});toast("Collection shared with the selected classroom.");await collection(project,c)}catch(error){toast(error.message)}finally{shareButton.disabled=false;shareButton.textContent="Share collection"}});
}else{
manage.append(el("h3","","Shared bookshelf"),el("p","","This collection belongs to another classroom in the same teacher workspace. It retains its original name and reference."));
const revoke=el("button","secondary","Remove from this classroom");revoke.type="button";revoke.addEventListener("click",async()=>{revoke.disabled=true;try{await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections/"+encodeURIComponent(c.id)+"/share",{method:"DELETE",headers:{"content-type":"application/json"},body:"{}"});toast("Collection access removed from this classroom.");await classrooms()}catch(error){toast(error.message);revoke.disabled=false}});manage.append(revoke);
}
const upload=el("section","workspace-card");
if(c.ownership==="owned")upload.append(el("h3","","Add PDF source"),el("p","","Choose an approved PDF. Its page count is entered below; Google Cloud OCR may incur usage charges."));
else upload.append(el("h3","","Source uploads restricted"),el("p","","Upload is available only from the collection's originating classroom. You can still view its sources here."));

const form=el("form","upload-form"),titleField=field("Source title","source-title"),fileWrap=el("div","field-group"),fileLabel=el("label","","PDF file");fileLabel.htmlFor="source-file";const file=el("input","field-input");file.id="source-file";file.type="file";file.accept="application/pdf,.pdf";file.required=true;fileWrap.append(fileLabel,file);
const page=field("PDF page count","source-pages","number");page.input.min="1";page.input.max="2000";page.input.required=true;
const checkWrap=el("label","check-row"),check=el("input");check.type="checkbox";check.required=true;const checkText=el("span","","I understand that Google Cloud OCR may incur usage charges.");checkWrap.append(check,checkText);
const submit=el("button","primary","Start secure upload");submit.type="submit";const progress=el("div","upload-progress");progress.hidden=true;form.append(titleField.wrap,fileWrap,page.wrap,checkWrap,submit,progress);if(c.ownership==="owned")upload.append(form);
const sourceList=el("div","source-list"),heading=el("div","panel-head"),refreshBtn=btn("↻ Refresh status","text-btn",refreshSources);heading.append(el("h3","","Sources"),refreshBtn);sourceList.append(heading);
grid.append(top,manage,upload,sourceList);

async function refreshSources(){
sourceList.querySelectorAll(".source-row,.empty,.loading,.error").forEach(x=>x.remove());
try{
const result=await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections/"+encodeURIComponent(c.id)+"/sources");
if(!result.sources.length){const empty=el("div","empty");empty.append(el("h3","","No sources yet"),el("p","","Upload the first teacher-approved PDF into this collection."));sourceList.append(empty)}
else result.sources.forEach(source=>{const row=el("article","teacher source-row"),main=el("div"),meta=el("div","meta"),status=el("span","pill",source.status);main.append(el("h3","",source.title));meta.append(el("span","ref",source.reference||"Reference pending"),el("span","","·"),el("span","",source.filename),el("span","","·"),el("span","",source.indexedPages+"/"+source.pageCount+" pages indexed"));main.append(meta);if(source.error)main.append(el("div","error",source.error));row.append(main,status);sourceList.append(row)})
}catch(error){sourceList.append(el("div","error",error.message))}
}
form.addEventListener("submit",async e=>{
e.preventDefault();const selected=file.files&&file.files[0];if(!selected||c.ownership!=="owned")return;
if(selected.type!=="application/pdf"&&!selected.name.toLowerCase().endsWith(".pdf")){toast("Select a PDF file.");return}
if(selected.size<8||selected.size>1024*1024*1024){toast("PDF must be between 8 bytes and 1 GB.");return}
const pageCount=Number(page.input.value);if(!Number.isSafeInteger(pageCount)||pageCount<1||pageCount>2000){toast("Enter a valid PDF page count.");return}
submit.disabled=true;submit.textContent="Preparing PDF…";progress.hidden=false;progress.textContent="Calculating the PDF fingerprint…";
try{
const sha=await sha256File(selected,(done,total)=>{progress.textContent="Calculating PDF fingerprint · "+Math.floor(done/total*100)+"%";});
const started=await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections/"+encodeURIComponent(c.id)+"/sources",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:titleField.input.value||selected.name.replace(/\.pdf$/iu,""),filename:selected.name,sha256:sha,size:selected.size,pageCount,costConfirmed:check.checked})});
const uploadInfo=started.upload||{},importId=uploadInfo.importId;if(typeof importId!=="string")throw new Error("BRVIN did not return an upload identifier.");
let uploaded=Number(uploadInfo.uploadedBytes||0);const chunkSize=8*1024*1024;
while(uploaded<selected.size){
const next=Math.min(selected.size,uploaded+chunkSize),chunk=selected.slice(uploaded,next),bytes=await chunk.arrayBuffer();
progress.textContent="Uploading PDF · "+Math.floor(uploaded/selected.size*100)+"%";
const part=await apiBinary("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections/"+encodeURIComponent(c.id)+"/sources/"+encodeURIComponent(importId)+"/chunk",bytes,{"x-upload-start":String(uploaded),"x-upload-total-size":String(selected.size)});
uploaded=Number(part.upload?.uploadedBytes??next);
}
progress.textContent="PDF uploaded. Starting OCR and indexing…";
if(uploadInfo.status==="failed"&&uploadInfo.canResume){
await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections/"+encodeURIComponent(c.id)+"/sources/"+encodeURIComponent(importId)+"/resume",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});
}else{
await api("teachers/"+encodeURIComponent(t.id)+"/projects/"+encodeURIComponent(project.id)+"/collections/"+encodeURIComponent(c.id)+"/sources/"+encodeURIComponent(importId)+"/complete",{method:"POST",headers:{"content-type":"application/json"},body:"{}"});
}
progress.textContent="BRVIN processing has started. The source will become available only after indexing and quality checks complete.";
toast("Secure upload completed");form.reset();await refreshSources();
}catch(error){progress.textContent="Upload stopped: "+error.message;toast(error.message)}finally{submit.disabled=false;submit.textContent="Start secure upload"}
});
await refreshSources();
}
tabs.append(btn("Overview","tab active",overview),btn("Classrooms","tab",classrooms),btn("Students","tab",()=>{choose("Students");grid.replaceChildren(pending("Students","Student identities and enrolments will be added in the next implementation phase.","Not implemented yet."))}),btn("Channels","tab",()=>{choose("Channels");grid.replaceChildren(pending("Channels","Channel setup follows the first-channel and credential decisions.","Not implemented yet."))}),btn("Configuration","tab",()=>{choose("Configuration");grid.replaceChildren(pending("Configuration","Teacher-specific teaching settings will be configurable here.","Not implemented yet."))}),btn("Usage","tab",()=>{choose("Usage");grid.replaceChildren(pending("Usage","Usage and model cost reporting requires live student workflows.","Not implemented yet."))}),btn("Activity","tab",()=>{choose("Activity");grid.replaceChildren(pending("Activity","A scoped activity view will follow the ingestion and student workflows.","Not implemented yet."))}));
overview();
}catch(e){fail(e)}
}
function overviewPage(){$("page-title").textContent="Overview";content.replaceChildren();const intro=el("div","intro");intro.append(el("h2","","Platform overview"));const metrics=el("div","metrics");metrics.append(metric("Total teachers",teachers.length,"Database-backed"),metric("Active teachers",teachers.filter(t=>t.status==="active").length,"Currently enabled"),metric("BRVIN projects","—","Management pending"));const panel=el("section","panel"),head=el("div","panel-head"),list=el("div","teacher-list");head.append(el("h3","","Recently created"),btn("View all →","text-btn",directory));teachers.slice(0,5).forEach(t=>list.append(teacherCard(t)));if(!teachers.length){const empty=el("div","empty");empty.append(el("h3","","Workspace ready"),el("p","","No teacher records yet."),btn("Create teacher","primary",openDialog));list.append(empty)}panel.append(head,list);content.append(intro,metrics,panel)}
function bind(){$("source-progress-close").addEventListener("click",()=>{$("source-progress-dialog").close()});$("source-progress-dialog").addEventListener("click",e=>{if(e.target===$("source-progress-dialog"))$("source-progress-dialog").close()});$("source-progress-dialog").addEventListener("close",()=>stopSourceProgressPolling());$("add").addEventListener("click",openDialog);$("close").addEventListener("click",closeDialog);$("cancel").addEventListener("click",closeDialog);form.addEventListener("submit",create);$("menu").addEventListener("click",()=>{$("sidebar").classList.toggle("open");$("scrim").classList.toggle("open")});$("scrim").addEventListener("click",()=>{$("sidebar").classList.remove("open");$("scrim").classList.remove("open")});document.querySelectorAll("nav button:not(:disabled)").forEach(n=>n.addEventListener("click",()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===n));n.dataset.page==="overview"?overviewPage():directory();$("sidebar").classList.remove("open");$("scrim").classList.remove("open")}))}
async function start(){bind();try{const s=await api("session");$("operator-name").textContent=s.operator.name||s.operator.email;$("operator-foot").textContent=s.operator.email;void refreshCoreStatus();teachers=(await api("teachers")).teachers;directory()}catch(e){fail(e)}}
start();
})();`;
