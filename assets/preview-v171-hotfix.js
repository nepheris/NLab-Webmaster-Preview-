(()=>{
'use strict';
const VERSION='V1.7.1';

// Hotfix V1.7.1
// V1.7 observe #gallery puis reordonne/modifie ses enfants. Sans garde,
// ces mutations peuvent rappeler l'observer en boucle. On laisse passer
// les mutations directes de #gallery (nouveau rendu) mais on ignore les
// mutations internes provoquees par la decoration/tri V1.7.
const NativeMutationObserver=window.MutationObserver;
if(NativeMutationObserver && !window.__nlabSafeGalleryObserver){
  window.__nlabSafeGalleryObserver=true;
  class SafeMutationObserver{
    constructor(callback){
      this._callback=callback;
      this._native=new NativeMutationObserver((records)=>{
        const filtered=records.filter(record=>{
          const target=record.target;
          if(!(target instanceof Element))return true;
          if(target.id==='gallery')return true;
          if(target.closest?.('#gallery'))return false;
          return true;
        });
        if(filtered.length)this._callback(filtered,this);
      });
    }
    observe(target,options){return this._native.observe(target,options)}
    disconnect(){return this._native.disconnect()}
    takeRecords(){return this._native.takeRecords()}
  }
  window.MutationObserver=SafeMutationObserver;
}

function paintVersion(){
  const badge=document.querySelector('.v14-version');
  if(badge)badge.textContent=VERSION;
  const foot=document.querySelector('.foot');
  if(foot)foot.innerHTML=`<span class="v14-foot-version">nLab Webmaster Preview · ${VERSION}</span> · Preview & review de projets.`;
}

function explainFreshBrowserFailure(){
  const status=document.querySelector('#statusText');
  const gallery=document.querySelector('#gallery');
  if(!status||!gallery)return;
  const text=status.textContent||'';
  const empty=!gallery.querySelector('.project-card');
  if(!empty)return;
  if(status.dataset.kind==='bad'||/indisponible|GitHub API|inventaire/i.test(text)){
    gallery.innerHTML='<div class="empty"><b>Inventaire public temporairement indisponible.</b><br>Le Login GitHub n’est pas requis pour la galerie publique. Sur un navigateur neuf, aucun cache local n’est encore disponible : si l’API publique GitHub ne répond pas, la galerie ne peut pas se reconstruire.</div>';
  }
}

function init(){
  // V1.7 initialise son interface apres DOMContentLoaded / timers ; repeindre
  // un peu apres garantit que le badge signale bien le hotfix actif.
  setTimeout(()=>{paintVersion();explainFreshBrowserFailure()},250);
  setTimeout(()=>{paintVersion();explainFreshBrowserFailure()},1200);
  const status=document.querySelector('#statusText');
  if(status)new NativeMutationObserver(()=>setTimeout(explainFreshBrowserFailure,0)).observe(status,{childList:true,subtree:true,attributes:true,attributeFilter:['data-kind']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
