(()=>{
'use strict';

const VERSION='V2.4';
const CATALOG_URL='assets/config/sandbox-features.json';
const AUTH_URL='assets/config/private-data-auth.json';
const STORE_KEY='nlab-preview-sandbox-reviews-v1';
const BATCH_KEY='nlab-preview-sync-batch-v1';
const PREVIEW_REVIEWS_KEY='nlab-preview-reviews-v1';
const PREFS_KEY='nlab-preview-prefs-v2';
const DECISIONS={
  review:{label:'À examiner',tone:'muted',icon:'●'},
  modify:{label:'À modifier',tone:'warn',icon:'↻'},
  validate:{label:'À valider',tone:'ok',icon:'✓'},
  reject:{label:'Rejeter',tone:'bad',icon:'×'},
  failure:{label:'Échec',tone:'bad',icon:'!'},
  archive:{label:'Archiver',tone:'ok',icon:'▣'},
  delete:{label:'Supprimer',tone:'bad',icon:'⌫'}
};
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6l2 2h8v12H4zM8 11h8M8 15h5"/><path d="M7 3v4M17 3v4"/></svg>';
let catalog={categories:[],features:[]};
let currentFeature=null,sandboxDirty=false,pendingFeature=null;

const style=document.createElement('style');
style.textContent=`
.sandbox-center-btn{position:relative}.sandbox-center-btn svg,.sandbox-head svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.sandbox-count{display:none;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:var(--amber);color:#111;font-size:9px;font-weight:900;place-items:center}.sandbox-count.show{display:inline-grid}.sandbox-panel{margin:12px 0;overflow:hidden;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:0 24px 80px rgba(0,0,0,.42);color:var(--ink)}.sandbox-panel[hidden]{display:none}.sandbox-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);background:var(--surface2)}.sandbox-head b{flex:1}.sandbox-head button{display:grid;place-items:center;width:31px;height:31px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--muted);cursor:pointer}.sandbox-body{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:560px;max-height:72vh}.sandbox-book{overflow:auto;padding:10px;border-right:1px solid var(--line);background:var(--surface2)}.sandbox-category{margin:8px 0 5px;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:850}.sandbox-tab{position:relative;width:100%;display:grid;gap:3px;text-align:left;margin:4px 0;padding:9px 10px;border:1px solid var(--line);border-right:4px solid var(--tab-color,var(--accent));border-radius:9px 2px 2px 9px;background:var(--surface);color:var(--ink);cursor:pointer}.sandbox-tab.active{border-color:var(--accent);background:var(--accent-soft)}.sandbox-tab b{font-size:11px}.sandbox-tab small{color:var(--muted);font-size:9px}.sandbox-work{overflow:auto;padding:14px}.sandbox-feature-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:11px}.sandbox-feature-head>div{flex:1}.sandbox-feature-head h2{margin:0;font-size:20px}.sandbox-feature-head p{margin:3px 0;color:var(--muted)}.sandbox-status,.sandbox-decision-badge{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:3px 7px;font-size:9px;font-weight:850}.sandbox-status{color:var(--accent)}.sandbox-decision-badge.ok{color:var(--green)}.sandbox-decision-badge.warn{color:var(--amber)}.sandbox-decision-badge.bad{color:var(--red)}.sandbox-decision-badge.muted{color:var(--muted)}.sandbox-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:10px}.sandbox-card{border:1px solid var(--line);border-radius:12px;background:var(--surface2);padding:11px}.sandbox-card h3{font-size:13px;margin:0 0 8px}.sandbox-checks{display:grid;gap:6px;margin:0;padding:0;list-style:none}.sandbox-checks li{display:flex;gap:7px;align-items:flex-start;color:var(--muted);font-size:11px}.sandbox-checks li:before{content:'□';color:var(--accent);font-weight:900}.sandbox-preview-list{display:grid;gap:6px}.sandbox-preview{display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);text-decoration:none}.sandbox-preview b{flex:1}.sandbox-decisions{display:flex;align-items:stretch;gap:4px;flex-wrap:wrap}.sandbox-choice{display:inline-flex;align-items:center;gap:4px;min-height:34px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);cursor:pointer;text-align:center;font-size:9px;font-weight:800}.sandbox-choice input{position:absolute;opacity:0;pointer-events:none}.sandbox-choice .sandbox-choice-dot{font-size:12px}.sandbox-choice:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}.sandbox-instructions{width:100%;min-height:120px;resize:vertical;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);padding:8px}.sandbox-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.sandbox-actions button,.sandbox-actions label{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);padding:7px 9px;cursor:pointer;font-weight:760}.sandbox-actions .primary{background:var(--accent);border-color:var(--accent);color:white}.sandbox-sync{display:grid;gap:4px;margin-top:8px;padding:8px;border-left:3px solid var(--amber);border-radius:7px;background:color-mix(in srgb,var(--amber) 9%,var(--surface));font-size:10px;color:var(--muted)}.sandbox-notifications{margin-top:8px;border:1px solid var(--line);border-radius:9px;background:var(--surface)}.sandbox-notifications summary{padding:8px;cursor:pointer;font-weight:800}.sandbox-notifications>div{padding:0 8px 8px;color:var(--muted);font-size:10px}.sandbox-unsaved{color:var(--amber);font-weight:850}.sandbox-notification-actions{display:flex;gap:6px;margin-top:7px}.sandbox-empty{padding:24px;border:1px dashed var(--line);border-radius:12px;color:var(--muted)}
@media(max-width:850px){.sandbox-body{grid-template-columns:1fr;max-height:92vh}.sandbox-book{display:flex;gap:6px;overflow:auto;border-right:0;border-bottom:1px solid var(--line)}.sandbox-category{display:none}.sandbox-tab{min-width:190px}.sandbox-grid{grid-template-columns:1fr}.sandbox-decisions{grid-template-columns:1fr 1fr}}
`;
document.head.appendChild(style);

function readStore(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{"items":{}}')}catch{return {items:{}}}}
function writeStore(data){localStorage.setItem(STORE_KEY,JSON.stringify(data));paintPending()}
function reviewFor(id){const saved=readStore().items?.[id];if(saved)return saved;const validated=featureById(id)?.status==='validated';return {decision:validated?'validate':'review',instructions:validated?'Validation humaine détectée dans le registre canonique.':'',updated_at:validated?'2026-08-13T10:00:00.000Z':null,sync_state:validated?'validated':'local'} }
function saveReview(id,decision,instructions){
  const store=readStore();store.items=store.items||{};
  store.items[id]={decision,instructions:instructions.trim(),updated_at:new Date().toISOString(),sync_state:'pending'};
  writeStore(store);sandboxDirty=false;renderFeature(id);
}
function pendingCount(){return Object.values(readStore().items||{}).filter(x=>x.sync_state==='pending').length}
function paintPending(){const n=pendingCount(),badge=q('.sandbox-count'),btn=q('#sandboxCenterBtn');if(badge){badge.textContent=String(n);badge.classList.toggle('show',n>0)}if(btn)btn.title=n?`Centre Bac à sable · ${n} avis à synchroniser`:'Centre Bac à sable'}
function decisionBadge(review){const d=DECISIONS[review.decision]||DECISIONS.review;return `<span class="sandbox-decision-badge ${d.tone}">${esc(d.label)}</span>`}
function categoryLabel(id){return catalog.categories.find(x=>x.id===id)?.label||id}
function featureById(id){return catalog.features.find(x=>x.id===id)||null}
function renderBook(){
  const host=q('#sandboxBook');if(!host)return;
  host.innerHTML=catalog.categories.map((cat,index)=>`<div class="sandbox-category">${esc(cat.label)}</div>${catalog.features.filter(f=>f.category===cat.id).map(f=>{const r=reviewFor(f.id);return `<button class="sandbox-tab ${f.id===currentFeature?'active':''}" style="--tab-color:hsl(${(index*97+205)%360} 58% 48%)" data-sandbox-feature="${esc(f.id)}"><b>${esc(f.name)}</b><small>${esc(f.version)} · ${esc((DECISIONS[r.decision]||DECISIONS.review).label)}</small></button>`}).join('')}`).join('');
  qa('[data-sandbox-feature]',host).forEach(b=>b.onclick=()=>{if(sandboxDirty){pendingFeature=b.dataset.sandboxFeature;showSandboxNotice('Modifications non enregistrées avant de changer de fiche.');return}renderFeature(b.dataset.sandboxFeature)});
}
function renderFeature(id){
  const feature=featureById(id);if(!feature)return;currentFeature=id;sandboxDirty=false;renderBook();
  const host=q('#sandboxWork');if(!host)return;const review=reviewFor(id);
  host.innerHTML=`<div class="sandbox-feature-head"><div><div><span class="sandbox-status">${esc(feature.status)} · ${esc(feature.version)}</span> ${decisionBadge(review)}</div><h2>${esc(feature.name)}</h2><p>${esc(feature.summary)}</p></div></div>
  <div class="sandbox-grid">
    <div class="sandbox-card"><h3>Critères du POC</h3><ul class="sandbox-checks">${(feature.acceptance||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3 style="margin-top:13px">Rendus et previews</h3><div class="sandbox-preview-list">${(feature.previews||[]).map(p=>`<a class="sandbox-preview" target="_blank" rel="noopener" href="${esc(p.url)}"><b>${esc(p.label)}</b><span>↗</span></a>`).join('')||'<div class="sandbox-empty">Aucun rendu lié.</div>'}</div></div>
    <div class="sandbox-card"><h3>Décision humaine</h3><div class="sandbox-decisions" role="radiogroup" aria-label="Décision humaine">${Object.entries(DECISIONS).map(([value,d])=>`<label class="sandbox-choice ${d.tone==='bad'?'danger':''}"><input type="radio" name="sandboxDecision" value="${value}" ${review.decision===value?'checked':''}><span class="sandbox-choice-dot" aria-hidden="true">${d.icon}</span><span>${esc(d.label)}</span></label>`).join('')}</div><h3 style="margin-top:12px">Instructions / modifications</h3><textarea class="sandbox-instructions" id="sandboxInstructions" placeholder="Décrire les corrections ou conditions de validation…">${esc(review.instructions)}</textarea><div class="sandbox-actions"><button class="primary" id="sandboxSave">Ajouter au lot</button><button id="sandboxExportOne">Exporter cette fiche</button></div><details class="sandbox-notifications" id="sandboxNotifications"><summary>Notifications et synchronisation</summary><div><div id="sandboxNotice">${review.sync_state==='pending'?'En attente de synchronisation':review.sync_state==='validated'?'Validation canonique détectée':'État local'}</div><span>${review.updated_at?`Dernière modification : ${new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short'}).format(new Date(review.updated_at))}`:'Aucune décision enregistrée.'}</span><div class="sandbox-notification-actions" id="sandboxNoticeActions" hidden><button type="button" id="sandboxDiscard">Ignorer les modifications</button><button type="button" id="sandboxContinue">Continuer</button></div></div></details></div>
  </div>`;
  q('#sandboxSave').onclick=()=>saveReview(id,q('input[name="sandboxDecision"]:checked')?.value||'review',q('#sandboxInstructions').value);
  q('#sandboxExportOne').onclick=()=>downloadJson(buildExport([id]),`sandbox-${id}.json`);
  qa('input[name="sandboxDecision"],#sandboxInstructions',host).forEach(el=>el.addEventListener('input',()=>{sandboxDirty=true;const note=q('#sandboxNotice');if(note)note.innerHTML='<span class="sandbox-unsaved">Modifications non enregistrées.</span>'}));
  q('#sandboxDiscard').onclick=()=>{sandboxDirty=false;const next=pendingFeature;pendingFeature=null;if(next)renderFeature(next);else showPreviewWorkspace()};
  q('#sandboxContinue').onclick=()=>{pendingFeature=null;q('#sandboxNoticeActions').hidden=true;q('#sandboxNotifications').open=false};
}
function buildExport(ids=catalog.features.map(x=>x.id)){
  const store=readStore();
  return {metadonnees:{schema_version:'1.0.0',document_type:'SANDBOX_REVIEW',generated_at:new Date().toISOString(),source:'nLab Webmaster Preview'},contenu:{reviews:ids.map(id=>({feature_id:id,feature:featureById(id),review:store.items?.[id]||reviewFor(id)}))},dictionnaire_donnees:{feature_id:'Identifiant stable du POC.',feature:'Définition et critères du POC.',review:'Décision humaine, instructions, date et état de synchronisation.'}};
}
function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function importJson(file){
  try{const data=JSON.parse(await file.text()),incoming=data?.contenu?.reviews||[],store=readStore();store.items=store.items||{};for(const row of incoming){if(!featureById(row.feature_id)||!row.review)continue;store.items[row.feature_id]={...row.review,sync_state:'pending',updated_at:new Date().toISOString()}}writeStore(store);renderFeature(currentFeature||catalog.features[0]?.id)}catch(error){alert(`Import impossible : ${error.message}`)}
}
function safeLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function captureOpenFeature(){const instructions=q('#sandboxInstructions'),choice=q('input[name="sandboxDecision"]:checked');if(currentFeature&&instructions&&choice){const store=readStore();store.items=store.items||{};store.items[currentFeature]={decision:choice.value,instructions:instructions.value.trim(),updated_at:new Date().toISOString(),sync_state:'pending'};writeStore(store)}}
function buildBatch(requestedAt){
  return {metadonnees:{schema_version:'1.0.0',document_type:'WEBMASTER_PREVIEW_SAVE_BATCH',created_at:requestedAt||new Date().toISOString(),mode:'manual-batch'},contenu:{preview_reviews:safeLocal(PREVIEW_REVIEWS_KEY,{}),sandbox_reviews:readStore(),preferences:safeLocal(PREFS_KEY,{})},dictionnaire_donnees:{preview_reviews:'Avis de la galerie principale.',sandbox_reviews:'Décisions et instructions du Centre Bac à sable.',preferences:'Préférences locales utiles à la reprise de session.'}};
}
function queueBatch(requestedAt){captureOpenFeature();const batch=buildBatch(requestedAt);localStorage.setItem(BATCH_KEY,JSON.stringify(batch));paintPending();return batch}
async function syncBatch(batch){
  const state=window.__nlabGithubState;
  const endpoint=state?.config?.feedback_sync_url;
  if(!state?.authenticated||!endpoint)return {status:'queued',message:'Enregistré localement · lot en attente de connexion'};
  const syncUrl=new URL(endpoint,document.baseURI);
  if(syncUrl.origin!==location.origin)return {status:'queued',message:'Enregistré localement · endpoint de synchronisation refusé'};
  try{
    const response=await fetch(syncUrl,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(batch)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    localStorage.removeItem(BATCH_KEY);
    const store=readStore();Object.values(store.items||{}).forEach(x=>{if(x.sync_state==='pending')x.sync_state='synced'});writeStore(store);if(currentFeature)renderFeature(currentFeature);
    return {status:'synced',message:'Enregistré · lot synchronisé en une seule demande'};
  }catch(error){return {status:'queued',message:`Enregistré localement · synchronisation différée (${error.message})`}}
}
async function handleSaveRequest(event){const batch=queueBatch(event.detail?.requested_at);const result=await syncBatch(batch);document.dispatchEvent(new CustomEvent('nlab:save-result',{detail:result}))}
function showSandboxNotice(message){const details=q('#sandboxNotifications'),note=q('#sandboxNotice'),actions=q('#sandboxNoticeActions');if(details)details.open=true;if(note)note.innerHTML=`<span class="sandbox-unsaved">${esc(message)}</span>`;if(actions)actions.hidden=false}
function showPreviewWorkspace(){if(sandboxDirty){showSandboxNotice('Modifications non enregistrées avant de fermer le Bac à sable.');return}q('#sandboxCenter')?.setAttribute('hidden','');q('.project-controls')?.removeAttribute('hidden');qa('[data-view]').forEach(x=>x.hidden=x.dataset.view!==(JSON.parse(localStorage.getItem('nlab-preview-prefs-v2')||'{}').view||'gallery'));q('#workspacePreview')?.classList.add('active');q('#sandboxCenterBtn')?.classList.remove('active')}
function makePanel(){
  let panel=q('#sandboxCenter');if(panel)return panel;
  panel=document.createElement('section');panel.id='sandboxCenter';panel.className='sandbox-panel panel';panel.hidden=true;
  panel.innerHTML=`<div class="sandbox-head">${icon()}<b>Centre Bac à sable · POC et validations</b><button id="sandboxExport" title="Exporter toutes les décisions">⇩</button><button id="sandboxClose" title="Revenir aux previews">×</button></div><div class="sandbox-body"><aside class="sandbox-book" id="sandboxBook"></aside><main class="sandbox-work" id="sandboxWork"><div class="sandbox-empty">Chargement du catalogue…</div></main></div><input id="sandboxImportFile" type="file" accept="application/json" hidden>`;
  q('.wrap')?.appendChild(panel);q('#sandboxClose').onclick=showPreviewWorkspace;q('#sandboxExport').onclick=()=>downloadJson(buildExport(),'nlab-sandbox-reviews.json');return panel;
}
function installButton(){
  const toolbar=q('.workspace-nav');if(!toolbar||q('#sandboxCenterBtn'))return;
  const button=document.createElement('button');button.id='sandboxCenterBtn';button.className='workspace-btn sandbox-center-btn';button.type='button';button.innerHTML=`${icon()}<span>Bac à sable</span><span class="sandbox-count"></span>`;
  toolbar.appendChild(button);
  button.onclick=async()=>{const panel=makePanel();q('.project-controls')?.setAttribute('hidden','');qa('[data-view]').forEach(x=>x.hidden=true);panel.hidden=false;q('#workspacePreview')?.classList.remove('active');button.classList.add('active');if(!catalog.features.length)await loadCatalog();renderBook();renderFeature(currentFeature||catalog.features[0]?.id)};paintPending();
}
async function loadCatalog(){
  try{const response=await fetch(`${CATALOG_URL}?v=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);catalog=await response.json();currentFeature=catalog.features[0]?.id||null}catch(error){catalog={categories:[],features:[]};const host=q('#sandboxWork');if(host)host.innerHTML=`<div class="sandbox-empty">Catalogue indisponible : ${esc(error.message)}</div>`}
}
function paintVersion(){const badge=q('.v14-version');if(badge)badge.textContent=VERSION;const foot=q('.foot');if(foot)foot.innerHTML=`<span class="v14-foot-version">nLab Webmaster Preview · ${VERSION}</span> · Preview, POC et validation.`}
function init(){paintVersion();installButton();document.addEventListener('nlab:save-request',handleSaveRequest);setTimeout(()=>{paintVersion();installButton()},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
