(()=>{
'use strict';
const API_PREFIX='https://api.github.com/repos/nepheris/nLab-Webmaster-Preview';
const CACHE_KEY='nlab-preview-api-cache-v1';
const TTL_MS=5*60*1000;
const MAX_CONCURRENT=2;
const nativeFetch=window.fetch.bind(window);
let active=0, forceUntil=0;
const queue=[];
function readCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch{return {}}}
function writeCache(c){try{localStorage.setItem(CACHE_KEY,JSON.stringify(c))}catch{}}
function cachedResponse(entry){return new Response(entry.body,{status:200,headers:{'Content-Type':entry.contentType||'application/json','X-nLab-Cache':'HIT'}})}
function run(task){return new Promise((resolve,reject)=>{queue.push({task,resolve,reject});pump()})}
function pump(){while(active<MAX_CONCURRENT&&queue.length){const item=queue.shift();active++;Promise.resolve().then(item.task).then(item.resolve,item.reject).finally(()=>{active--;pump()})}}
window.fetch=async(input,init={})=>{
 const url=typeof input==='string'?input:input?.url;
 if(!url?.startsWith(API_PREFIX)||(init.method&&String(init.method).toUpperCase()!=='GET'))return nativeFetch(input,init);
 const cache=readCache(), key=url, entry=cache[key], now=Date.now(), force=now<forceUntil;
 if(entry&&!force&&now-entry.ts<TTL_MS)return cachedResponse(entry);
 return run(async()=>{
   const headers=new Headers(init.headers||{});
   if(entry?.etag)headers.set('If-None-Match',entry.etag);
   if(entry?.lastModified)headers.set('If-Modified-Since',entry.lastModified);
   const res=await nativeFetch(input,{...init,headers,cache:'default'});
   if(res.status===304&&entry){entry.ts=Date.now();cache[key]=entry;writeCache(cache);return cachedResponse(entry)}
   if(res.ok){const body=await res.clone().text();cache[key]={body,ts:Date.now(),etag:res.headers.get('etag'),lastModified:res.headers.get('last-modified'),contentType:res.headers.get('content-type')};writeCache(cache)}
   if(res.status===403||res.status===429){const retry=res.headers.get('retry-after'),remaining=res.headers.get('x-ratelimit-remaining'),reset=res.headers.get('x-ratelimit-reset');console.warn('GitHub API rate limit',{status:res.status,retry,remaining,reset})}
   return res;
 });
};

document.addEventListener('click',e=>{if(e.target.closest?.('#refreshBtn'))forceUntil=Date.now()+15000},{capture:true});

const svg=(id)=>`<svg class="icon" aria-hidden="true"><use href="#${id}"></use></svg>`;
const q=(s)=>document.querySelector(s);
const qa=(s)=>[...document.querySelectorAll(s)];

function installPreviewSectionLayout(){
 if(q('#v25-runtime-style'))return;
 const style=document.createElement('style');
 style.id='v25-runtime-style';
 style.textContent=`
 .global-module,.workspace-module,.project-controls{scroll-margin-top:78px}
 .global-module>summary,.workspace-module>summary,.project-controls>summary{font-size:14px}
 .global-toolbar{position:sticky;top:0;z-index:35;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px;background:color-mix(in srgb,var(--surface) 94%,transparent);backdrop-filter:blur(14px)}
 .toolbar-group{display:inline-flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--line);border-radius:12px;background:var(--surface2)}
 .toolbar-group-label{padding:0 4px 0 6px;color:var(--muted);font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}
 .lighthouse-main{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}
 .lighthouse-emblem{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(145deg,#173d65,#2f8bd2);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
 .lighthouse-emblem .icon{width:17px;height:17px;stroke-width:1.65}
 .github-connection{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:10px;padding:7px 9px;background:var(--surface);font-weight:760}
 .github-dot{width:8px;height:8px;border-radius:999px;background:var(--green);box-shadow:0 0 0 3px color-mix(in srgb,var(--green) 16%,transparent)}
 .github-connection[data-kind="warn"] .github-dot{background:var(--amber)}
 .github-connection[data-kind="bad"] .github-dot{background:var(--red)}
 .section-tabs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:10px}
 .section-tab{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:11px;padding:8px 11px;background:var(--surface2);color:var(--ink);font-weight:800;cursor:pointer;text-decoration:none}
 .section-tab.primary{background:var(--accent);border-color:var(--accent);color:#fff}
 .module-subhead{display:flex;align-items:center;gap:8px;padding:9px 11px 5px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
 .module-subhead:after{content:"";height:1px;background:var(--line);flex:1}
 .project-controls>.panel{margin:8px 10px 10px;box-shadow:none}
 .project-controls .project-filter-bar{padding-bottom:7px}
 .workspace-section{scroll-margin-top:82px}
 .workspace-placeholder{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start}
 .workspace-placeholder>.workspace-icon{width:48px;height:48px;border-radius:14px;background:var(--accent-soft);display:grid;place-items:center;color:var(--accent)}
 .workspace-placeholder>.workspace-icon .icon{width:26px;height:26px}
 .workspace-placeholder h2{margin:0 0 3px;font-size:18px}
 .workspace-placeholder p{margin:0;color:var(--muted)}
 .sandbox-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
 .sandbox-compact{margin-top:10px;padding:12px;border:1px dashed var(--line);border-radius:12px;background:var(--surface2);color:var(--muted)}
 .sandbox-fullscreen{position:fixed!important;inset:12px;z-index:80;margin:0!important;overflow:auto;border:2px solid var(--accent)!important;box-shadow:0 24px 80px rgba(0,0,0,.38)!important;background:var(--surface)!important}
 .sandbox-fullscreen[hidden]{display:none!important}
 .sandbox-fullscreen .sandbox-full-head{display:flex;align-items:center;gap:10px;position:sticky;top:0;background:var(--surface);padding-bottom:10px;border-bottom:1px solid var(--line);z-index:2}
 .sandbox-fullscreen .sandbox-full-head h2{margin:0;flex:1}
 .sandbox-full-body{min-height:calc(100vh - 120px);padding:14px 0;color:var(--muted)}
 .settings-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .settings-summary>div{border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--surface2)}
 .settings-summary b{display:block;margin-bottom:3px}
 @media(max-width:760px){.global-toolbar,.section-tabs{align-items:stretch}.toolbar-group{flex:1 1 100%;flex-wrap:wrap}.toolbar-group .btn{flex:1 1 auto}.section-tab{flex:1 1 auto}.settings-summary{grid-template-columns:1fr}.workspace-placeholder{grid-template-columns:1fr}.workspace-placeholder>.workspace-icon{width:42px;height:42px}}
 `;
 document.head.appendChild(style);

 const global=q('.global-module');
 const globalSummary=global?.querySelector(':scope > summary');
 const toolbar=global?.querySelector('.toolbar');
 if(globalSummary)globalSummary.innerHTML='<span>Site · commandes globales</span><small>Audits, GitHub, enregistrement et paramètres</small>';
 if(toolbar){
   toolbar.className='global-toolbar';
   toolbar.innerHTML=`
    <button class="btn" id="saveLocal" title="Consolider les modifications locales et synchroniser un seul lot si la session authentifiée est disponible">${svg('i-save')}Enregistrer</button>
    <span class="toolbar-group" aria-label="Audits Lighthouse">
      <span class="toolbar-group-label">Audit</span>
      <a class="btn lighthouse-main" id="lighthouseDefault" href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fnepheris.github.io%2FnLab-Webmaster-Preview%2F&category=performance&category=accessibility&category=best-practices&category=seo&hl=fr-FR" target="_blank" rel="noopener noreferrer" title="Lancer Lighthouse avec le profil par défaut"><span class="lighthouse-emblem">${svg('i-lighthouse')}</span>Lighthouse</a>
      <a class="btn" id="lighthouseMobile" href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fnepheris.github.io%2FnLab-Webmaster-Preview%2F&category=performance&category=accessibility&category=best-practices&category=seo&form_factor=mobile&hl=fr-FR" target="_blank" rel="noopener noreferrer" title="Lighthouse Mobile">${svg('i-monitor')}Mobile</a>
      <a class="btn" id="lighthouseDesktop" href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fnepheris.github.io%2FnLab-Webmaster-Preview%2F&category=performance&category=accessibility&category=best-practices&category=seo&form_factor=desktop&hl=fr-FR" target="_blank" rel="noopener noreferrer" title="Lighthouse Bureau">${svg('i-monitor')}Bureau</a>
    </span>
    <span class="github-connection" id="githubConnection" data-kind="ok" title="État de lecture de la source GitHub"><span class="github-dot"></span><span>GitHub · connecté</span></span>
    <button class="btn" id="sandboxQuickBtn" title="Accès rapide au bac à sable">${svg('i-code')}Bac à sable</button>
    <button class="btn" id="globalSettingsBtn" title="Paramètres globaux du site">${svg('i-edit')}Paramètres</button>
    <div class="switch" title="Thème clair / sombre">${svg('i-sun')}<button id="themeToggle" aria-pressed="false" aria-label="Basculer le thème"></button>${svg('i-moon')}</div>`;
 }

 const workspace=q('.workspace-module');
 const workspaceSummary=workspace?.querySelector(':scope > summary');
 if(workspaceSummary)workspaceSummary.innerHTML='<span>Sections du site</span><small>Navigation fonctionnelle</small>';
 if(workspace){
   const oldNav=workspace.querySelector('.workspace-nav');
   const oldFuture=workspace.querySelector('.future-strip');
   oldNav?.remove();oldFuture?.remove();
   const nav=document.createElement('nav');
   nav.className='section-tabs';
   nav.setAttribute('aria-label','Sections Webmaster Preview');
   nav.innerHTML=`
    <button class="section-tab primary" id="workspacePreview" data-section-target="gallerySection">${svg('i-grid')}Galerie de projets</button>
    <button class="section-tab" data-section-target="cockpitSection">${svg('i-cockpit')}Cockpit projet</button>
    <button class="section-tab" data-section-target="roadmapSection">${svg('i-roadmap')}Roadmap</button>
    <button class="section-tab" data-section-target="ganttSection">${svg('i-gantt')}Gantt</button>
    <button class="section-tab" id="sandboxCenterBtn" data-section-target="sandboxSection">${svg('i-code')}Bac à sable</button>`;
   workspace.appendChild(nav);
 }

 const controls=q('.project-controls');
 const controlsSummary=controls?.querySelector(':scope > summary');
 if(controlsSummary)controlsSummary.innerHTML='<span>Galerie de projets</span><small>Panneau de commande + visualisation</small>';
 if(controls){
   controls.id='gallerySection';
   const toolbar=controls.querySelector('.project-toolbar');
   const filters=controls.querySelector('#projectFilters');
   if(toolbar)toolbar.insertAdjacentHTML('beforebegin','<div class="module-subhead">Panneau de commande</div>');
   if(filters)filters.insertAdjacentHTML('afterend','<div class="module-subhead">Visualisation</div>');
   const views=qa('[data-view]');
   views.forEach(view=>controls.appendChild(view));
 }

 const anchor=controls;
 if(anchor){
   const sections=[
    ['cockpitSection','i-cockpit','Cockpit projet','Pilotage global du projet sélectionné. La section est préparée pour accueillir les indicateurs, décisions et accès rapides du cockpit.'],
    ['roadmapSection','i-roadmap','Roadmap','Vue dédiée à la feuille de route du projet sélectionné. Le contenu sera branché sur la source roadmap lorsque le contrat correspondant sera disponible.'],
    ['ganttSection','i-gantt','Gantt','Vue chronologique dédiée aux jalons et dépendances. La section est créée sans inventer de données tant que la source Gantt n’est pas branchée.']
   ];
   let after=anchor;
   sections.forEach(([id,iconId,title,text])=>{
     if(q('#'+id))return;
     const section=document.createElement('section');
     section.className='panel workspace-section';section.id=id;
     section.innerHTML=`<div class="workspace-placeholder"><div class="workspace-icon">${svg(iconId)}</div><div><h2>${title}</h2><p>${text}</p></div></div>`;
     after.insertAdjacentElement('afterend',section);after=section;
   });
   if(!q('#sandboxSection')){
     const sandbox=document.createElement('section');
     sandbox.className='panel workspace-section';sandbox.id='sandboxSection';
     sandbox.innerHTML=`<div class="workspace-placeholder"><div class="workspace-icon">${svg('i-code')}</div><div><h2>Bac à sable</h2><p>Accès rapide en mode compact ou ouverture dans une vue de travail plein écran.</p><div class="sandbox-actions"><button class="btn" id="sandboxCompactBtn">${svg('i-code')}Vue compacte</button><button class="btn" id="sandboxFullscreenBtn">${svg('i-external')}Plein écran</button></div><div class="sandbox-compact" id="sandboxCompact">Bac à sable compact · espace réservé aux outils et expérimentations du Webmaster Preview.</div></div></div>`;
     after.insertAdjacentElement('afterend',sandbox);after=sandbox;
   }
   if(!q('#sandboxCenter')){
     const full=document.createElement('section');
     full.className='panel sandbox-fullscreen';full.id='sandboxCenter';full.hidden=true;
     full.innerHTML=`<div class="sandbox-full-head"><div class="lighthouse-emblem">${svg('i-code')}</div><h2>Bac à sable · vue complète</h2><button class="btn" id="sandboxFullscreenClose">Fermer</button></div><div class="sandbox-full-body">Espace plein écran prêt à accueillir les outils, visualisations et expérimentations du bac à sable sans encombrer le cockpit principal.</div>`;
     document.body.appendChild(full);
   }
 }

 if(!q('#globalSettingsDialog')){
   const dialog=document.createElement('dialog');dialog.className='dialog';dialog.id='globalSettingsDialog';
   dialog.innerHTML=`<div class="dialog-head">${svg('i-edit')}<h3>Paramètres globaux du site</h3><button class="btn" id="globalSettingsClose">Fermer</button></div><div class="dialog-body"><div class="settings-summary"><div><b>Thème</b><span>Le thème clair/sombre reste piloté depuis la barre globale.</span></div><div><b>GitHub</b><span>État de lecture et synchronisation affiché dans la barre globale.</span></div><div><b>Audits</b><span>Lighthouse par défaut, Mobile et Bureau sont accessibles séparément.</span></div><div><b>Enregistrement</b><span>Les changements locaux restent consolidés via le bouton Enregistrer global.</span></div></div></div>`;
   document.body.appendChild(dialog);
 }

 const scrollToSection=(id)=>q('#'+id)?.scrollIntoView({behavior:'smooth',block:'start'});
 qa('[data-section-target]').forEach(btn=>btn.addEventListener('click',()=>scrollToSection(btn.dataset.sectionTarget)));
 q('#sandboxQuickBtn')?.addEventListener('click',()=>scrollToSection('sandboxSection'));
 q('#sandboxCompactBtn')?.addEventListener('click',()=>{q('#sandboxCenter')?.setAttribute('hidden','');scrollToSection('sandboxSection')});
 const openSandbox=()=>{const center=q('#sandboxCenter');if(center){center.hidden=false;center.classList.add('sandbox-fullscreen')}};
 q('#sandboxFullscreenBtn')?.addEventListener('click',openSandbox);
 q('#sandboxCenterBtn')?.addEventListener('dblclick',openSandbox);
 q('#sandboxFullscreenClose')?.addEventListener('click',()=>q('#sandboxCenter')?.setAttribute('hidden',''));
 q('#globalSettingsBtn')?.addEventListener('click',()=>q('#globalSettingsDialog')?.showModal());
 q('#globalSettingsClose')?.addEventListener('click',()=>q('#globalSettingsDialog')?.close());

 const status=q('#statusText'),github=q('#githubConnection');
 const paintGitHub=()=>{if(!status||!github)return;const kind=status.dataset.kind||'ok';github.dataset.kind=kind==='loading'?'warn':kind;const label=kind==='ok'?'GitHub · connecté':kind==='bad'?'GitHub · indisponible':'GitHub · dégradé';const span=github.querySelector('span:last-child');if(span)span.textContent=label};
 paintGitHub();
 if(status&&github)new MutationObserver(paintGitHub).observe(status,{attributes:true,childList:true,subtree:true,attributeFilter:['data-kind']});
}

installPreviewSectionLayout();
const core=document.createElement('script');core.src='assets/preview-browser-core.js';core.defer=false;document.head.appendChild(core);
})();
