(()=>{
'use strict';
const VERSION='V1.8';
const NativeMutationObserver=window.MutationObserver;

// Le script V1.7 est déjà injecté par Pages. V1.6 possède encore un loader
// de compatibilité qui cherche ce marqueur avant de charger V1.7 une seconde fois.
for(const script of document.scripts){
  if(/\/preview-v17\.js(?:\?|$)/.test(script.src||'')) script.dataset.nlabV17='1';
}

// Boot public 100 % GitHub Pages : le runtime généré seed le cache et intercepte
// uniquement les lectures d'inventaire public. Il doit être chargé avant
// DOMContentLoaded, donc avant preview-browser.load().
if(document.readyState==='loading'&&!window.__nlabPublicRuntime){
  document.write('<script src="assets/runtime/public-inventory.js?v=1.8"><\/script>');
}

// Protection des observers de galerie.
// - les mutations internes provoquées par les décorateurs ne réarment pas la boucle ;
// - V1.7 crée deux observers dans son init : on n'en garde qu'un seul.
if(NativeMutationObserver&&!window.__nlabSafeGalleryObserver){
  window.__nlabSafeGalleryObserver=true;
  window.__nlabGalleryObserverKeys=window.__nlabGalleryObserverKeys||new Set();
  class SafeMutationObserver{
    constructor(callback){
      this._callback=callback;
      this._source=(new Error().stack||'');
      this._key=null;
      this._native=new NativeMutationObserver((records)=>{
        const filtered=records.filter(record=>{
          const target=record.target;
          if(!(target instanceof Element)) return true;
          if(target.id==='gallery') return true;
          if(target.closest?.('#gallery')) return false;
          return true;
        });
        if(filtered.length) this._callback(filtered,this);
      });
    }
    observe(target,options){
      if(target instanceof Element&&target.id==='gallery'&&/preview-v17\.js/.test(this._source)){
        const key='preview-v17::gallery';
        if(window.__nlabGalleryObserverKeys.has(key)) return;
        window.__nlabGalleryObserverKeys.add(key);
        this._key=key;
      }
      return this._native.observe(target,options);
    }
    disconnect(){
      if(this._key) window.__nlabGalleryObserverKeys.delete(this._key);
      this._key=null;
      return this._native.disconnect();
    }
    takeRecords(){return this._native.takeRecords();}
  }
  window.MutationObserver=SafeMutationObserver;
}

const fmt=v=>{
  const d=new Date(v);
  if(Number.isNaN(d.getTime())) return String(v||'n.d.');
  return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d);
};

function paintVersion(){
  const badge=document.querySelector('.v14-version');
  if(badge) badge.textContent=VERSION;
  const foot=document.querySelector('.foot');
  if(foot) foot.innerHTML=`<span class="v14-foot-version">nLab Webmaster Preview · ${VERSION}</span> · Preview & review de projets.`;
}

function paintRuntimeState(){
  const snap=window.__nlabPublicRuntime;
  if(!snap) return;
  const gallery=document.querySelector('#gallery');
  const status=document.querySelector('#statusText');
  const quota=document.querySelector('#apiQuota');
  const cards=gallery?.querySelectorAll('.project-card').length||0;
  const previews=snap.projects.reduce((n,p)=>n+(p.previews?.length||0),0);
  if(status&&cards){
    status.dataset.kind='ok';
    status.textContent=`${snap.projects.length} projets · ${previews} preview${previews>1?'s':''} · Snapshot Pages ${fmt(snap.generated_at)}`;
    status.title='Inventaire public généré lors du déploiement GitHub Pages. Aucun Login GitHub requis.';
  }
  if(quota&&(/quota non lu|non lu|0\/0/i.test(quota.textContent||'')||!quota.textContent.trim())){
    quota.textContent='API GitHub : non sollicitée au chargement';
    quota.className='';
    quota.title='La galerie publique démarre depuis le snapshot GitHub Pages ; le quota REST n’est pas consommé au chargement.';
  }
}

function explainFailure(){
  const status=document.querySelector('#statusText');
  const gallery=document.querySelector('#gallery');
  if(!status||!gallery||gallery.querySelector('.project-card')) return;
  const text=status.textContent||'';
  if(status.dataset.kind==='bad'||/indisponible|GitHub API|inventaire/i.test(text)){
    gallery.innerHTML='<div class="empty"><b>Inventaire public indisponible.</b><br>Le Login GitHub n’est pas requis pour la galerie publique. Le runtime Pages n’a pas pu être chargé ; le diagnostic est affiché dans le Centre GitHub.</div>';
  }
}

function init(){
  const repaint=()=>{paintVersion();paintRuntimeState();explainFailure();};
  repaint();
  setTimeout(repaint,100);
  setTimeout(repaint,350);
  setTimeout(repaint,900);
  const status=document.querySelector('#statusText');
  if(status){
    let guard=false;
    new NativeMutationObserver(()=>{
      if(guard) return;
      guard=true;
      queueMicrotask(()=>{paintRuntimeState();explainFailure();guard=false;});
    }).observe(status,{childList:true,subtree:true,attributes:true,attributeFilter:['data-kind']});
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
