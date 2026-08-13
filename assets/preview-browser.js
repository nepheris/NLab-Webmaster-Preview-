(()=>{
'use strict';
const API_PREFIX='https://api.github.com/repos/nepheris/nLab-Webmaster-Preview';
const CACHE_KEY='nlab-preview-api-cache-v1';
const TTL_MS=5*60*1000;
const MAX_CONCURRENT=2;
const nativeFetch=window.fetch.bind(window);
function reportBootFailure(message){
 const status=document.getElementById('statusText');
 if(status){status.dataset.kind='bad';status.textContent=`Erreur de démarrage : ${message}`;status.title=status.textContent}
 document.documentElement.dataset.previewBoot='failed';
}
window.addEventListener('error',event=>{if(/preview-browser-core/.test(event.filename||'')||event.message)reportBootFailure(event.message||'script principal indisponible')});
window.addEventListener('unhandledrejection',event=>reportBootFailure(event.reason?.message||String(event.reason||'promesse rejetée')));
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


const core=document.createElement('script');core.src='assets/preview-browser-core.js';core.defer=false;core.addEventListener('load',()=>{document.documentElement.dataset.previewBoot='loaded'});core.addEventListener('error',()=>reportBootFailure('preview-browser-core.js indisponible'));document.head.appendChild(core);
})();
