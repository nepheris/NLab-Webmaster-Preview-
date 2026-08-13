(()=>{
'use strict';
const VERSION='V1.6';
const AUTH_CFG='assets/config/private-data-auth.json';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const icon=(d,cls='v16-icon')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const I={close:'M6 6l12 12M18 6L6 18'};

function addStyles(){const s=document.createElement('style');s.textContent=`
.v16-icon{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
/* Historique des previews : une ligne compacte, récente en haut. */
.project-card .version-list{display:flex;flex-direction:column}
.project-card .version-line{grid-template-columns:minmax(0,1fr) auto auto;gap:6px;align-items:center;padding:6px 8px;min-height:34px}
.project-card .version-line>div:first-child{min-width:0;display:flex;align-items:baseline;gap:7px;overflow:hidden}
.project-card .version-line>div:first-child b{font-size:11.5px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.project-card .version-line>div:first-child small{font-size:9.5px;line-height:1.15;white-space:nowrap;color:var(--muted)}
.project-card .version-line .version-state{gap:3px;flex-wrap:nowrap;overflow:hidden}
.project-card .version-line .badge{font-size:8.5px;padding:1px 5px;white-space:nowrap}
.project-card .version-line .actions{gap:4px;flex-wrap:nowrap}
.project-card .version-line .actions a,.project-card .version-line .actions button{width:27px;height:27px;display:grid;place-items:center;padding:0;border-radius:7px;font-size:0}
.project-card .version-line .actions .icon{width:13px;height:13px;font-size:13px}
.project-card .version-line.v16-latest-row{background:color-mix(in srgb,var(--accent) 5%,var(--surface))}
.project-card .version-line.v16-latest-row>div:first-child b:after{content:' · récent';color:var(--accent);font-size:8px;text-transform:uppercase;letter-spacing:.04em}
/* Centre GitHub : connexion sur une ligne, tests DATA côte à côte. */
#v14GithubPanel .v14-controls{display:grid!important;grid-template-columns:1fr!important;gap:7px!important}
#v15LoginToggle{width:100%;justify-content:flex-start!important}
.v16-data-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;width:100%}
.v16-data-row>button{width:100%;justify-content:center!important}
.v16-auth-note{border:1px solid var(--line);border-left:3px solid var(--amber);border-radius:9px;background:var(--surface2);padding:8px 9px;color:var(--muted);font-size:10.5px;line-height:1.4}
.v16-auth-note b{color:var(--amber)}
/* Review : deux conventions de fermeture côte à côte pendant la démo. */
#reviewDialog .v16-review-x{display:inline-grid;place-items:center;width:34px;height:32px;border:1px solid var(--line);border-radius:9px;background:var(--surface2);color:var(--muted);cursor:pointer;padding:0}
#reviewDialog .v16-review-x:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
@media(max-width:680px){.project-card .version-line{grid-template-columns:minmax(0,1fr) auto}.project-card .version-line .version-state{grid-column:1/-1}.project-card .version-line>div:first-child{display:grid;gap:2px}.v16-data-row{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

function updateVersion(){const badge=q('.v14-version');if(badge)badge.textContent=VERSION;const foot=q('.foot');if(foot)foot.innerHTML=`<span class="v14-foot-version">nLab Webmaster Preview · ${VERSION}</span> · Preview & review de projets.`}

function compactVersionRows(){qa('.project-card .version-list').forEach(list=>{const rows=qa('.version-line',list);rows.forEach((row,i)=>{row.classList.toggle('v16-latest-row',i===0);const main=row.children[0],small=main?.querySelector('small');if(small&&!small.dataset.v16Compact){small.dataset.v16Compact='1';const full=small.textContent.trim();small.title=full;const parts=full.split(' · ');small.textContent=parts[0]||full}
  const open=row.querySelector('.actions a');if(open){open.title='Ouvrir cette preview';open.setAttribute('aria-label','Ouvrir cette preview')}
  const review=row.querySelector('.actions button[data-review]');if(review){review.title='Ouvrir la review';review.setAttribute('aria-label','Ouvrir la review')}
 })})}

function installReviewCloseDemo(){const dlg=q('#reviewDialog'),close=q('#reviewClose');if(!dlg||!close||q('.v16-review-x',dlg))return;close.textContent='Fermer';close.title='Fermer la fenêtre';const x=document.createElement('button');x.type='button';x.className='v16-review-x';x.title='Fermer (croix)';x.setAttribute('aria-label','Fermer');x.innerHTML=icon(I.close);close.insertAdjacentElement('afterend',x);x.onclick=()=>close.click()}

function alignGithubDataButtons(){const controls=q('#v14GithubPanel .v14-controls'),pub=q('#v14PublicTest'),priv=q('#v14PrivateTest');if(!controls||!pub||!priv)return;let row=q('.v16-data-row',controls);if(!row){row=document.createElement('div');row.className='v16-data-row';controls.appendChild(row)}if(pub.parentElement!==row)row.appendChild(pub);if(priv.parentElement!==row)row.appendChild(priv)}

async function clarifyAuthState(){const panel=q('#v14GithubPanel'),toggle=q('#v15LoginToggle');if(!panel||!toggle)return;let cfg=null;try{const r=await fetch(`${AUTH_CFG}?_=${Date.now()}`,{cache:'no-store'});if(r.ok)cfg=await r.json()}catch{}
 const token=!!sessionStorage.getItem('nlab-preview-github-user-token');let note=q('.v16-auth-note',panel);if(!note){note=document.createElement('div');note.className='v16-auth-note';q('.v14-status-grid',panel)?.insertAdjacentElement('afterend',note)}
 if(token){note.innerHTML='<b>Authentification active.</b> La session peut tester l’accès au Data Store privé.';return}
 if(!cfg?.client_id){toggle.title='GitHub App non configurée : Client ID manquant';const label=toggle.querySelector('span:last-child');if(label)label.textContent='Connexion GitHub · Configuration requise';const state=q('#v14AuthState');if(state)state.textContent='Configuration requise';note.innerHTML='<b>Login non activable pour l’instant.</b> La GitHub App doit d’abord être enregistrée et son Client ID ajouté à la configuration. Aucun PAT ou token manuel n’est demandé.'}
 else{note.innerHTML='<b>GitHub App détectée.</b> Le Login nécessite la passerelle OAuth sécurisée pour échanger le code sans exposer le secret dans GitHub Pages.'}
}

function observeGallery(){const g=q('#gallery');if(!g)return;new MutationObserver(()=>queueMicrotask(compactVersionRows)).observe(g,{childList:true,subtree:true});compactVersionRows()}
function init(){addStyles();updateVersion();installReviewCloseDemo();alignGithubDataButtons();clarifyAuthState();observeGallery();setTimeout(()=>{installReviewCloseDemo();alignGithubDataButtons();clarifyAuthState();compactVersionRows()},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));else setTimeout(init,50);
})();
