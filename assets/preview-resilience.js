(()=>{
'use strict';
const ROOT='Preview-Web-Sandbox';
const INVENTORY_KEY='nlab-preview-inventory-v3';
const baseFetch=window.fetch.bind(window);
const fakeShaMap=new Map();
let fallbackSourceAt=null;

const fmt=v=>{
  const d=new Date(v);
  if(Number.isNaN(d.getTime()))return String(v??'n.d.');
  return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d);
};
const cached=()=>{try{return JSON.parse(localStorage.getItem(INVENTORY_KEY)||'null')}catch{return null}};
const jsonResponse=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});
function fakeSha(id){let h=2166136261;for(const c of id){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,'0').repeat(5)}
function rootFromCache(){
  const c=cached();
  if(!c?.projects?.length)return null;
  fakeShaMap.clear();fallbackSourceAt=c.fetched_at||null;
  const rows=c.projects.map(p=>{const sha=fakeSha(p.id);fakeShaMap.set(sha,p.id);return {name:p.id,path:`${ROOT}/${p.id}`,sha,type:'dir',size:0}});
  window.__nlabPreviewFallback={active:true,source_at:fallbackSourceAt};
  document.dispatchEvent(new CustomEvent('nlab:preview-fallback',{detail:window.__nlabPreviewFallback}));
  return rows;
}
function treeFromCache(projectId,sha){
  const c=cached();const p=c?.projects?.find(x=>x.id===projectId);if(!p)return null;
  const tree=[];
  const blob=(path)=>tree.push({path,type:'blob',mode:'100644',sha:fakeSha(`${projectId}:${path}`),size:0});
  const dir=(path)=>tree.push({path,type:'tree',mode:'040000',sha:fakeSha(`${projectId}:dir:${path}`)});
  (p.root_files||[]).forEach(blob);
  if((p.production_files||[]).length){dir('production-current');(p.production_files||[]).forEach(f=>blob(`production-current/${f}`))}
  (p.previews||[]).forEach(v=>{dir(v.iteration);(v.files||[]).forEach(f=>blob(`${v.iteration}/${f}`))});
  return {sha,truncated:false,tree};
}
window.fetch=async function(input,init){
  const url=new URL(typeof input==='string'?input:input.url,document.baseURI);
  const rootPath='/repos/nepheris/nLab-Webmaster-Preview/contents/Preview-Web-Sandbox';
  if(url.origin==='https://api.github.com'&&url.pathname===rootPath){
    const response=await baseFetch(input,init);
    if(response.ok){window.__nlabPreviewFallback={active:false,source_at:null};return response}
    const rows=rootFromCache();return rows?jsonResponse(rows,200):response;
  }
  const m=url.origin==='https://api.github.com'&&url.pathname.match(/^\/repos\/nepheris\/nLab-Webmaster-Preview\/git\/trees\/([0-9a-f]{40})$/);
  if(m&&fakeShaMap.has(m[1])){
    const data=treeFromCache(fakeShaMap.get(m[1]),m[1]);return data?jsonResponse(data,200):jsonResponse({message:'Cached tree unavailable'},404);
  }
  return baseFetch(input,init);
};

function showFallback(){
  const state=window.__nlabPreviewFallback;if(!state?.active)return;
  const status=document.getElementById('statusText');if(!status)return;
  const current=status.textContent||'';
  if(status.dataset.kind==='ok'||current.includes('GitHub indisponible')){
    status.dataset.kind='warn';
    status.textContent=`API GitHub indisponible — inventaire cache ${fmt(state.source_at)} · métadonnées Pages rechargées`;
    status.title=status.textContent;
  }
}
document.addEventListener('nlab:preview-fallback',()=>setTimeout(showFallback,0));
document.addEventListener('DOMContentLoaded',()=>{
  const status=document.getElementById('statusText');
  if(status)new MutationObserver(()=>setTimeout(showFallback,0)).observe(status,{childList:true,subtree:true,attributes:true,attributeFilter:['data-kind']});
});
})();
