export const OPERATOR_CLIENT_JS = `(() => {
"use strict";
const $=id=>document.getElementById(id),content=$("content"),dialog=$("create-dialog"),form=$("create-form");let teachers=[],toastTimer=null;
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n}
function btn(text,cls,action){const n=el("button",cls,text);n.type="button";if(action)n.addEventListener("click",action);return n}
async function api(path,options){const r=await fetch("/operator/api/"+path,{credentials:"same-origin",cache:"no-store",...options,headers:{...(options&&options.headers?options.headers:{})}});let d={};try{d=await r.json()}catch{}if(r.status===401)throw new Error("Your operator session expired. Refresh and sign in again.");if(!r.ok||d.ok!==true)throw new Error(d.message||d.error||"Request failed.");return d}
async function apiBinary(path,bytes,headers){const r=await fetch("/operator/api/"+path,{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"content-type":"application/octet-stream",...(headers||{})},body:bytes});let d={};try{d=await r.json()}catch{}if(r.status===401)throw new Error("Your operator session expired. Refresh and sign in again.");if(!r.ok||d.ok!==true)throw new Error(d.message||d.error||"The source chunk could not be uploaded.");return d}
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
const submit=el("button","primary","Start secure upload");submit.type="submit";const progress=el("div","upload-progress");progress.hidden=true;form.append(titleField.wrap,fileWrap,page.wrap,checkWrap,submit,progress);upload.append(form);
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
const buffer=await selected.arrayBuffer(),digest=await crypto.subtle.digest("SHA-256",buffer),sha=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();
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
function bind(){$("add").addEventListener("click",openDialog);$("close").addEventListener("click",closeDialog);$("cancel").addEventListener("click",closeDialog);form.addEventListener("submit",create);$("menu").addEventListener("click",()=>{$("sidebar").classList.toggle("open");$("scrim").classList.toggle("open")});$("scrim").addEventListener("click",()=>{$("sidebar").classList.remove("open");$("scrim").classList.remove("open")});document.querySelectorAll("nav button:not(:disabled)").forEach(n=>n.addEventListener("click",()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===n));n.dataset.page==="overview"?overviewPage():directory();$("sidebar").classList.remove("open");$("scrim").classList.remove("open")}))}
async function start(){bind();try{const s=await api("session");$("operator-name").textContent=s.operator.name||s.operator.email;$("operator-foot").textContent=s.operator.email;teachers=(await api("teachers")).teachers;directory()}catch(e){fail(e)}}
start();
})();`;
