(()=>{
'use strict';

// V1.2 — correctifs de robustesse du viewer public.
document.documentElement.dataset.theme='dark';
const PREF_KEY='nlab-preview-prefs-v2';
if(!localStorage.getItem(PREF_KEY)) localStorage.setItem(PREF_KEY,JSON.stringify({theme:'dark',view:'gallery',card:320}));

const REPO='nepheris/nLab-Webmaster-Preview';
const ROOT='Preview-Web-Sandbox';
const API_ROOT=`https://api.github.com/repos/${REPO}`;
const nativeFetch=window.fetch.bind(window);
window.__nlabNativeFetch=nativeFetch;
let treeCache={at:0,data:null};
let lastRate={limit:null,remaining:null,reset:null,status:null};

const fmtPrecise=v=>{
  const d=new Date(v);
  if(Number.isNaN(d.getTime())) return String(v??'n.d.');
  return new Intl.DateTimeFormat('fr-FR',{
    day:'2-digit',month:'2-digit',year:'numeric',
    hour:'2-digit',minute:'2-digit',second:'2-digit'
  }).format(d);
};

function captureRate(response){
  const h=response?.headers;
  if(!h)return;
  const limit=h.get('x-ratelimit-limit');
  const remaining=h.get('x-ratelimit-remaining');
  const reset=h.get('x-ratelimit-reset');
  lastRate={
    limit:limit==null?lastRate.limit:Number(limit),
    remaining:remaining==null?lastRate.remaining:Number(remaining),
    reset:reset==null?lastRate.reset:new Date(Number(reset)*1000).toISOString(),
    status:response.status
  };
  document.dispatchEvent(new CustomEvent('nlab:github-rate',{detail:lastRate}));
}

async function fullTree(force=false){
  const fresh=treeCache.data&&(Date.now()-treeCache.at<1500)&&!force;
  if(fresh)return treeCache.data;
  const response=await nativeFetch(`${API_ROOT}/git/trees/main?recursive=1`,{
    headers:{Accept:'application/vnd.github+json'},cache:'no-store'
  });
  captureRate(response);
  if(!response.ok){
    const error=new Error(`GitHub API ${response.status}`);
    error.status=response.status;
    throw error;
  }
  const data=await response.json();
  if(data.truncated) console.warn('nLab Preview: arbre GitHub tronqué');
  treeCache={at:Date.now(),data};
  return data;
}

function jsonResponse(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{'Content-Type':'application/json; charset=utf-8'}
  });
}

function rootDirectoryResponse(tree){
  const prefix=`${ROOT}/`;
  const entries=tree.tree
    .filter(x=>x.type==='tree'&&x.path.startsWith(prefix)&&!x.path.slice(prefix.length).includes('/'))
    .map(x=>({name:x.path.slice(prefix.length),path:x.path,sha:x.sha,type:'dir',size:0}));
  return entries;
}

function subtreeResponse(tree,sha){
  const root=tree.tree.find(x=>x.type==='tree'&&x.sha===sha&&x.path.startsWith(`${ROOT}/`));
  if(!root)return null;
  const prefix=`${root.path}/`;
  return {
    sha,
    truncated:false,
    tree:tree.tree
      .filter(x=>x.path.startsWith(prefix))
      .map(x=>({...x,path:x.path.slice(prefix.length)}))
  };
}

async function staticProjectJson(apiUrl){
  const marker='/contents/';
  const pos=apiUrl.pathname.indexOf(marker);
  if(pos<0)return null;
  const rel=decodeURIComponent(apiUrl.pathname.slice(pos+marker.length));
  if(!rel.startsWith(`${ROOT}/`)||!rel.endsWith('/project.json'))return null;
  const staticUrl=new URL(rel,document.baseURI);
  staticUrl.searchParams.set('_',String(Date.now()));
  const response=await nativeFetch(staticUrl,{cache:'no-store'});
  if(!response.ok)return jsonResponse({message:`project.json HTTP ${response.status}`},response.status);
  const text=await response.text();
  const bytes=new TextEncoder().encode(text);
  let binary='';
  bytes.forEach(b=>binary+=String.fromCharCode(b));
  return jsonResponse({type:'file',encoding:'base64',content:btoa(binary)});
}

// Le moteur historique continue de fonctionner tel quel, mais ses appels REST sont consolidés :
// 1 appel arbre récursif par actualisation, puis réponses synthétiques en mémoire.
window.fetch=async function(input,init){
  const url=new URL(typeof input==='string'?input:input.url,document.baseURI);
  if(url.origin==='https://api.github.com'&&url.pathname.startsWith(`/repos/${REPO}/`)){
    const projectJson=await staticProjectJson(url);
    if(projectJson)return projectJson;

    const rootPath=`/repos/${REPO}/contents/${ROOT}`;
    if(url.pathname===rootPath){
      try{return jsonResponse(rootDirectoryResponse(await fullTree()))}
      catch(e){return jsonResponse({message:e.message},e.status||503)}
    }

    const match=url.pathname.match(new RegExp(`^/repos/${REPO.replace('/','\\/')}/git/trees/([0-9a-f]{40})$`));
    if(match){
      try{
        const data=subtreeResponse(await fullTree(),match[1]);
        return data?jsonResponse(data):jsonResponse({message:'Tree not found'},404);
      }catch(e){return jsonResponse({message:e.message},e.status||503)}
    }
  }
  const response=await nativeFetch(input,init);
  if(url.origin==='https://api.github.com')captureRate(response);
  return response;
};

const style=document.createElement('style');
style.textContent=`
.production-box{display:grid;gap:5px;padding:11px 13px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--surface) 74%,var(--surface2))}
.production-box .production-link{display:inline-flex;align-items:center;gap:6px;width:max-content;max-width:100%;padding:6px 9px;border-radius:9px;background:color-mix(in srgb,var(--green) 12%,var(--surface));border:1px solid color-mix(in srgb,var(--green) 36%,var(--line));color:var(--green);font-weight:800;text-decoration:none}
.production-box small{color:var(--muted)}.production-link:hover{filter:brightness(.98)}
td>a{color:var(--accent);font-weight:700;text-decoration:none}td>a:hover{text-decoration:underline}td>a small{margin-top:2px}
.project-identity{display:inline-flex;align-items:center;gap:8px;min-width:0;font-weight:780}
.project-visual{display:inline-grid;place-items:center;flex:0 0 auto;width:42px;height:42px;border:1px solid var(--line);border-radius:11px;background:var(--surface);overflow:hidden;color:var(--accent)}
.project-visual.compact{width:28px;height:28px;border-radius:8px}.project-visual img{display:block;width:100%;height:100%;object-fit:contain;padding:3px}
.project-visual.nlab{width:48px;min-width:48px;height:30px;border:0;border-radius:7px;background:transparent url('assets/nlab-wordmark.svg') center/44px auto no-repeat;padding:0;overflow:hidden}
.project-visual.nlab.compact{width:38px;min-width:38px;height:24px;background-size:36px auto;padding:0}.project-visual.nlab b,.project-visual.nlab strong{display:none}
.project-visual.emoji{font-size:23px}.project-visual.emoji.compact{font-size:17px}.project-visual.generic svg{width:22px;height:22px}.project-visual.generic.compact svg{width:16px;height:16px}
.project-card header>.project-visual{margin-right:2px}
.nlab-wordmark-img{display:inline-block;width:74px;height:auto;vertical-align:-.18em;margin-right:5px}.brand-wordmark-img{display:block;width:78px;height:auto}
.dash-history{min-width:150px}.dash-history summary{cursor:pointer;font-weight:800;color:var(--accent);white-space:nowrap}.dash-history-list{display:grid;gap:4px;margin-top:7px;min-width:230px}
.dash-history-list a{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;padding:6px 7px;border:1px solid var(--line);border-radius:8px;background:var(--surface2);text-decoration:none;color:var(--ink)}
.dash-history-list a:hover{border-color:var(--accent);background:var(--accent-soft)}.dash-history-list a b{font-size:11px}.dash-history-list a span{color:var(--muted);font-size:11px}
.dash-table td>a{display:inline-block}.dash-table td>a small{display:block;color:var(--muted);font-weight:500}
.github-test.pass{border-color:var(--green);color:var(--green)}.github-test.fail{border-color:var(--red);color:var(--red)}
#apiQuota{font-size:10px;color:var(--muted)}#apiQuota.warn{color:var(--amber)}#apiQuota.bad{color:var(--red)}
#refreshBtn.refreshing{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}#refreshBtn.refreshing svg{animation:nlab-refresh-spin .8s linear infinite}@keyframes nlab-refresh-spin{to{transform:rotate(360deg)}}
@media(max-width:680px){.project-visual{width:34px;height:34px}.project-visual.nlab{width:42px;height:26px}.dash-history-list{min-width:0}.dash-history-list a{grid-template-columns:1fr}.project-identity{align-items:flex-start}.nlab-wordmark-img{width:62px}}
`;
document.head.appendChild(style);

// Même SVG nLab partout : cartouche gauche, titre et cartes nLab.
const heroTitle=document.querySelector('.hero h1');
if(heroTitle&&/^nLab\s+Webmaster Preview\s*$/.test(heroTitle.textContent.trim())){
  heroTitle.innerHTML='<img class="nlab-wordmark-img" src="assets/nlab-wordmark.svg" alt="nLab"> Webmaster Preview';
}
const brandName=document.querySelector('.brand-name');
if(brandName)brandName.innerHTML='<img class="brand-wordmark-img" src="assets/nlab-wordmark.svg" alt="nLab">';

const table=document.getElementById('previewTable');
if(table){const rows=table.tHead?.rows;if(rows&&rows.length>=2){const head=rows[0],filters=rows[1];if(!head.querySelector('[data-sort="production"]')){const th=document.createElement('th');th.dataset.sort='production';th.innerHTML='Production<span class="col-resizer"></span>';head.insertBefore(th,head.children[4]||null);const f=document.createElement('th');f.innerHTML='<input data-col-filter="production" placeholder="Production">';filters.insertBefore(f,filters.children[4]||null)}}}

const INVENTORY_KEY='nlab-preview-inventory-v3';
const cachedTimestamp=()=>{try{return JSON.parse(localStorage.getItem(INVENTORY_KEY)||'null')?.fetched_at||null}catch{return null}};
const refreshBtn=document.getElementById('refreshBtn');
const statusText=document.getElementById('statusText');
let statusGuard=false;

let apiQuota=document.getElementById('apiQuota');
if(!apiQuota&&statusText){apiQuota=document.createElement('span');apiQuota.id='apiQuota';statusText.insertAdjacentElement('afterend',apiQuota);apiQuota.insertAdjacentHTML('beforebegin','<br>')}
function renderRate(rate=lastRate){
  if(!apiQuota)return;
  if(rate.limit==null){apiQuota.textContent='API GitHub : quota non lu';apiQuota.className='';return}
  const reset=rate.reset?fmtPrecise(rate.reset):'n.d.';
  apiQuota.textContent=`API GitHub : ${rate.remaining}/${rate.limit} · reset ${reset}`;
  apiQuota.className=rate.remaining===0?'bad':rate.remaining<=10?'warn':'';
  apiQuota.title='Quota REST public non authentifié. Aucun scan automatique : une actualisation manuelle consolide la découverte en un seul appel d’arbre.';
}
document.addEventListener('nlab:github-rate',e=>renderRate(e.detail));
renderRate();

function normalizePreciseStatus(){
  if(!statusText||statusGuard)return;
  const text=statusText.textContent||'';
  let next=text;
  if(/^Cache\s/.test(text)&&text.includes('actualisation GitHub')){
    const ts=cachedTimestamp();if(ts)next=`Cache ${fmtPrecise(ts)} · actualisation GitHub…`;
  }else if(statusText.dataset.kind==='ok'&&text.includes(' · GitHub ')){
    next=text.replace(/ · GitHub .*$/,` · GitHub ${fmtPrecise(new Date())}`);
  }else if(/^GitHub indisponible — cache\s/.test(text)){
    const ts=cachedTimestamp();if(ts)next=`GitHub indisponible — cache ${fmtPrecise(ts)}`;
  }
  if(next!==text){statusGuard=true;statusText.textContent=next;statusGuard=false}
  if(statusText.dataset.kind==='ok'||statusText.dataset.kind==='warn'||statusText.dataset.kind==='bad'){
    refreshBtn?.classList.remove('refreshing');refreshBtn?.setAttribute('aria-busy','false');
  }
  statusText.title=statusText.textContent||'';
}
if(statusText){new MutationObserver(normalizePreciseStatus).observe(statusText,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-kind']});normalizePreciseStatus()}
if(refreshBtn){refreshBtn.addEventListener('click',()=>{treeCache={at:0,data:null};refreshBtn.classList.add('refreshing');refreshBtn.setAttribute('aria-busy','true');refreshBtn.title=`Actualisation manuelle de l’arborescence demandée à ${fmtPrecise(new Date())}`})}

// Diagnostic du fichier de persistance publié : lecture Pages, donc aucune consommation du quota REST.
const toolbar=document.querySelector('.toolbar');
if(toolbar&&!document.getElementById('githubTestBtn')){
  const disabled=[...toolbar.querySelectorAll('button')].find(b=>b.textContent.includes('Enregistrer sur GitHub'));
  const btn=document.createElement('button');btn.id='githubTestBtn';btn.className='btn github-test';btn.type='button';btn.textContent='GitHub · Tester DATA';
  btn.title='Vérifie le fichier POC publié dans .reviews via GitHub Pages ; ce test ne consomme pas le quota REST.';
  if(disabled)toolbar.insertBefore(btn,disabled);else toolbar.appendChild(btn);
  btn.addEventListener('click',async()=>{
    btn.disabled=true;btn.textContent='GitHub · Test…';btn.classList.remove('pass','fail');
    try{
      const url=new URL(`${ROOT}/.reviews/_poc/github-write-test.json`,document.baseURI);url.searchParams.set('_',String(Date.now()));
      const r=await nativeFetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);await r.json();
      btn.textContent='GitHub · DATA PASS';btn.classList.add('pass');
    }catch(e){console.error(e);btn.textContent='GitHub · DATA ÉCHEC';btn.classList.add('fail')}
    finally{btn.disabled=false}
  });
}
})();
