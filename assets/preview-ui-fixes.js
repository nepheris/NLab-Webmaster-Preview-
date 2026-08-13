(()=>{
'use strict';
// V1.1+: dark is the default for a fresh browser profile. User preference remains editable afterwards.
document.documentElement.dataset.theme='dark';
const PREF_KEY='nlab-preview-prefs-v2';
if(!localStorage.getItem(PREF_KEY)) localStorage.setItem(PREF_KEY,JSON.stringify({theme:'dark',view:'gallery',card:320}));
const style=document.createElement('style');
style.textContent=`
.production-box{display:grid;gap:5px;padding:11px 13px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--surface) 74%,var(--surface2))}
.production-box .production-link{display:inline-flex;align-items:center;gap:6px;width:max-content;max-width:100%;padding:6px 9px;border-radius:9px;background:color-mix(in srgb,var(--green) 12%,var(--surface));border:1px solid color-mix(in srgb,var(--green) 36%,var(--line));color:var(--green);font-weight:800;text-decoration:none}
.production-box small{color:var(--muted)}
.production-link:hover{filter:brightness(.98)}
td>a{color:var(--accent);font-weight:700;text-decoration:none}td>a:hover{text-decoration:underline}td>a small{margin-top:2px}
.project-identity{display:inline-flex;align-items:center;gap:8px;min-width:0;font-weight:780}
.project-visual{display:inline-grid;place-items:center;flex:0 0 auto;width:42px;height:42px;border:1px solid var(--line);border-radius:11px;background:var(--surface);overflow:hidden;color:var(--accent)}
.project-visual.compact{width:28px;height:28px;border-radius:8px}
.project-visual img{display:block;width:100%;height:100%;object-fit:contain;padding:3px}
.project-visual.nlab{width:auto;min-width:54px;padding:0 8px;font-size:17px;font-weight:900;letter-spacing:-.7px;overflow:visible}
.project-visual.nlab.compact{min-width:43px;font-size:13px;padding:0 6px}
.project-visual.nlab b{color:#3282ca}.project-visual.nlab strong{color:var(--muted)}
.project-visual.emoji{font-size:23px}.project-visual.emoji.compact{font-size:17px}
.project-visual.generic svg{width:22px;height:22px}.project-visual.generic.compact svg{width:16px;height:16px}
.project-card header>.project-visual{margin-right:2px}
.hero-wordmark{display:inline-flex;align-items:baseline;font-weight:900;letter-spacing:-1px}.hero-wordmark .n{color:#3282ca}.hero-wordmark .lab{color:var(--muted)}
.dash-history{min-width:150px}.dash-history summary{cursor:pointer;font-weight:800;color:var(--accent);white-space:nowrap}
.dash-history-list{display:grid;gap:4px;margin-top:7px;min-width:230px}
.dash-history-list a{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;padding:6px 7px;border:1px solid var(--line);border-radius:8px;background:var(--surface2);text-decoration:none;color:var(--ink)}
.dash-history-list a:hover{border-color:var(--accent);background:var(--accent-soft)}
.dash-history-list a b{font-size:11px}.dash-history-list a span{color:var(--muted);font-size:11px}
.dash-table td>a{display:inline-block}.dash-table td>a small{display:block;color:var(--muted);font-weight:500}
.github-test.pass{border-color:var(--green);color:var(--green)}.github-test.fail{border-color:var(--red);color:var(--red)}
#refreshBtn.refreshing{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
#refreshBtn.refreshing svg{animation:nlab-refresh-spin .8s linear infinite}@keyframes nlab-refresh-spin{to{transform:rotate(360deg)}}
@media(max-width:680px){.project-visual{width:34px;height:34px}.dash-history-list{min-width:0}.dash-history-list a{grid-template-columns:1fr}.project-identity{align-items:flex-start}}
`;
document.head.appendChild(style);

// Même identité visuelle nLab dans le titre principal que dans le cartouche de marque à gauche.
const heroTitle=document.querySelector('.hero h1');
if(heroTitle&&/^nLab\s+Webmaster Preview\s*$/.test(heroTitle.textContent.trim())){
  heroTitle.innerHTML='<span class="hero-wordmark" aria-label="nLab"><span class="n">n</span><span class="lab">Lab</span></span> Webmaster Preview';
}

const table=document.getElementById('previewTable');
if(table){const rows=table.tHead?.rows;if(rows&&rows.length>=2){const head=rows[0],filters=rows[1];if(!head.querySelector('[data-sort="production"]')){const th=document.createElement('th');th.dataset.sort='production';th.innerHTML='Production<span class="col-resizer"></span>';head.insertBefore(th,head.children[4]||null);const f=document.createElement('th');f.innerHTML='<input data-col-filter="production" placeholder="Production">';filters.insertBefore(f,filters.children[4]||null)}}}

// Rend le rafraîchissement vérifiable visuellement et affiche l'horodatage à la seconde.
const INVENTORY_KEY='nlab-preview-inventory-v3';
const fmtSecond=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d)};
const cachedTimestamp=()=>{try{return JSON.parse(localStorage.getItem(INVENTORY_KEY)||'null')?.fetched_at||null}catch{return null}};
const refreshBtn=document.getElementById('refreshBtn');
const statusText=document.getElementById('statusText');
let statusGuard=false;
function normalizePreciseStatus(){
  if(!statusText||statusGuard)return;
  const text=statusText.textContent||'';
  let next=text;
  if(/^Cache\s/.test(text)&&text.includes('actualisation GitHub')){
    const ts=cachedTimestamp();
    if(ts) next=`Cache ${fmtSecond(ts)} · actualisation GitHub…`;
  }else if(statusText.dataset.kind==='ok'&&text.includes(' · GitHub ')){
    if(!/\d{2}:\d{2}:\d{2}/.test(text)) next=text.replace(/ · GitHub .*$/,` · GitHub ${fmtSecond(new Date())}`);
  }else if(/^GitHub indisponible — cache\s/.test(text)){
    const ts=cachedTimestamp();
    if(ts) next=`GitHub indisponible — cache ${fmtSecond(ts)}`;
  }
  if(next!==text){statusGuard=true;statusText.textContent=next;statusGuard=false}
  if(statusText.dataset.kind==='ok'||statusText.dataset.kind==='warn'||statusText.dataset.kind==='bad'){
    refreshBtn?.classList.remove('refreshing');refreshBtn?.setAttribute('aria-busy','false');
  }
  if(statusText.textContent) statusText.title=statusText.textContent;
}
if(statusText){new MutationObserver(normalizePreciseStatus).observe(statusText,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-kind']});normalizePreciseStatus()}
if(refreshBtn){refreshBtn.addEventListener('click',()=>{refreshBtn.classList.add('refreshing');refreshBtn.setAttribute('aria-busy','true');refreshBtn.title=`Actualisation GitHub demandée à ${fmtSecond(new Date())}`;if(statusText)statusText.title=refreshBtn.title})}

// Diagnostic distinct du futur bouton d'écriture authentifiée.
const toolbar=document.querySelector('.toolbar');
if(toolbar&&!document.getElementById('githubTestBtn')){
  const disabled=[...toolbar.querySelectorAll('button')].find(b=>b.textContent.includes('Enregistrer sur GitHub'));
  const btn=document.createElement('button');btn.id='githubTestBtn';btn.className='btn github-test';btn.type='button';btn.innerHTML='GitHub · Tester le POC';btn.title='Vérifie la présence du POC de persistance dans .reviews/ ; ne réalise pas encore une écriture authentifiée depuis le navigateur.';
  if(disabled) toolbar.insertBefore(btn,disabled); else toolbar.appendChild(btn);
  btn.addEventListener('click',async()=>{btn.disabled=true;btn.textContent='GitHub · Test…';btn.classList.remove('pass','fail');try{const url='https://api.github.com/repos/nepheris/nLab-Webmaster-Preview/contents/Preview-Web-Sandbox/.reviews/_poc/github-write-test.json?ref=main';const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);btn.textContent='GitHub · POC PASS';btn.classList.add('pass')}catch(e){console.error(e);btn.textContent='GitHub · POC ÉCHEC';btn.classList.add('fail')}finally{btn.disabled=false}});
}
})();
