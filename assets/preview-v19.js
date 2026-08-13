(()=>{
'use strict';

const VERSION='V1.9';
const AUTH_CFG='assets/config/private-data-auth.json';
const MODE_KEY='nlab-preview-github-mode-v19';
const LEGACY_TOKEN_KEY='nlab-preview-github-user-token';
const q=(s,r=document)=>r.querySelector(s);

const style=document.createElement('style');
style.textContent=`
.v19-mode-shell{display:grid;gap:9px;margin-bottom:10px}.v19-live{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:9px;border:1px solid var(--line);border-radius:11px;background:var(--surface2)}.v19-live>div{display:grid;gap:2px}.v19-live small{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}.v19-live b{font-size:11px}.v19-modes{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v19-mode{display:grid;gap:7px;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--surface2)}.v19-mode.active{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 16%,transparent)}.v19-mode.locked{opacity:.82}.v19-mode-head{display:flex;align-items:flex-start;gap:7px}.v19-mode-head>div{flex:1}.v19-mode h3{font-size:13px;margin:0}.v19-mode p{font-size:10px;color:var(--muted);margin:2px 0 0}.v19-badge{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:2px 6px;font-size:9px;font-weight:800}.v19-badge.ok{color:var(--green)}.v19-badge.warn{color:var(--amber)}.v19-mode ul{margin:0;padding-left:17px;color:var(--muted);font-size:10px}.v19-mode-actions{display:flex;gap:6px;flex-wrap:wrap}.v19-mode-actions button{border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);padding:6px 8px;cursor:pointer;font-weight:750}.v19-mode-actions button.primary{background:var(--accent);border-color:var(--accent);color:white}.v19-mode-actions button:disabled{opacity:.55;cursor:not-allowed}.v19-auth-note{padding:7px 8px;border-left:3px solid var(--amber);border-radius:7px;background:color-mix(in srgb,var(--amber) 9%,var(--surface));color:var(--muted);font-size:10px}.v19-security{font-size:9px;color:var(--muted)}#v15LoginToggle,.v17-quota-module{display:none!important}
@media(max-width:760px){.v19-live{grid-template-columns:1fr 1fr}.v19-modes{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

function safeSession(){
  try{return sessionStorage}catch{return null}
}
function clearLegacyToken(){
  try{safeSession()?.removeItem(LEGACY_TOKEN_KEY)}catch{}
}
function selectedMode(){
  try{return safeSession()?.getItem(MODE_KEY)==='authenticated'?'authenticated':'public'}catch{return 'public'}
}
function setSelectedMode(mode){
  try{safeSession()?.setItem(MODE_KEY,mode)}catch{}
}
function quotaText(){return q('#apiQuota')?.textContent?.replace(/^API GitHub\s*:\s*/,'').trim()||'non sollicité'}
function setResult(text,kind=''){
  const result=q('#v14Result');
  if(!result)return;
  result.textContent=text;
  result.className=`v14-result ${kind}`.trim();
}
async function readConfig(){
  const response=await fetch(`${AUTH_CFG}?v=${Date.now()}`,{cache:'no-store'});
  if(!response.ok)throw new Error(`configuration HTTP ${response.status}`);
  return response.json();
}
function safeOauthUrl(value){
  if(!value)return null;
  try{const url=new URL(value,document.baseURI);return url.protocol==='https:'?url:null}catch{return null}
}
function paintVersion(){
  const badge=q('.v14-version');if(badge)badge.textContent=VERSION;
  const foot=q('.foot');if(foot)foot.innerHTML=`<span class="v14-foot-version">nLab Webmaster Preview · ${VERSION}</span> · Preview & review de projets.`;
}
function paintToolbar(mode,authenticated){
  const label=q('#v14GithubCenter .v14-github-label');
  const button=q('#v14GithubCenter');
  if(label)label.textContent=authenticated?'GitHub · Authentifié':mode==='authenticated'?'GitHub · Configuration requise':'GitHub · Public rapide';
  button?.classList.toggle('auth',authenticated);
}
function shellHtml(config,session){
  const configured=!!(config?.client_id&&config?.oauth_start_url&&config?.session_status_url);
  const authenticated=!!session?.authenticated;
  const mode=authenticated?'authenticated':selectedMode();
  const authBadge=authenticated?'<span class="v19-badge ok">Connecté</span>':configured?'<span class="v19-badge warn">Disponible</span>':'<span class="v19-badge warn">Configuration requise</span>';
  return `<div class="v19-mode-shell">
    <div class="v19-live">
      <div><small>Mode actif</small><b data-v19-live="mode">${authenticated?'AUTHENTIFIÉ ÉTENDU':'PUBLIC RAPIDE'}</b></div>
      <div><small>Session GitHub</small><b data-v19-live="session">${authenticated?(session.login||'connectée'):'non connectée'}</b></div>
      <div><small>Données privées</small><b data-v19-live="private">${authenticated?'selon permissions':'verrouillées'}</b></div>
      <div><small>API publique</small><b data-v19-live="quota">${quotaText()}</b></div>
    </div>
    <div class="v19-modes">
      <article class="v19-mode ${mode==='public'?'active':''}" data-v19-mode="public">
        <div class="v19-mode-head"><div><h3>Public rapide</h3><p>Consultation et revue légère, actif par défaut.</p></div><span class="v19-badge ok">Sans connexion</span></div>
        <ul><li>Snapshot statique au chargement</li><li>Zéro appel API lors de la navigation</li><li>Actualisation publique uniquement sur demande</li></ul>
        <div class="v19-mode-actions"><button class="primary" data-v19-action="public">Utiliser le mode public</button></div>
      </article>
      <article class="v19-mode ${mode==='authenticated'?'active ':''}${configured?'':'locked'}" data-v19-mode="authenticated">
        <div class="v19-mode-head"><div><h3>Authentifié étendu</h3><p>Longues sessions, gros projets et ressources autorisées.</p></div>${authBadge}</div>
        <ul><li>GitHub App avec permissions minimales</li><li>Quota authentifié séparé</li><li>Session sécurisée côté serveur</li></ul>
        ${configured?'':`<div class="v19-auth-note">La GitHub App et la passerelle OAuth doivent être configurées avant activation.</div>`}
        <div class="v19-mode-actions">
          <button class="primary" data-v19-action="auth">${authenticated?'Session GitHub active':configured?'Se connecter avec GitHub':'Voir la configuration requise'}</button>
          ${authenticated?'<button data-v19-action="public">Revenir au mode public</button>':''}
        </div>
        <div class="v19-security">Aucun PAT, client secret ou jeton utilisateur n’est conservé dans le stockage JavaScript.</div>
      </article>
    </div>
  </div>`;
}
async function sessionState(config){
  if(!config?.session_status_url)return {authenticated:false};
  try{
    const url=new URL(config.session_status_url,document.baseURI);
    if(url.origin!==location.origin)return {authenticated:false,error:'origine de session refusée'};
    const response=await fetch(url,{credentials:'include',cache:'no-store'});
    if(!response.ok)return {authenticated:false};
    const data=await response.json();
    return {authenticated:!!data.authenticated,login:data.login||null};
  }catch{return {authenticated:false}}
}
async function renderCenter(){
  const body=q('#v14GithubPanel .v14-github-body');
  if(!body)return;
  let config={};
  try{config=await readConfig()}catch(error){config={status:'unavailable',error:error.message}}
  const session=await sessionState(config);
  const authenticated=!!session.authenticated;
  if(!authenticated)setSelectedMode('public');
  let shell=q('.v19-mode-shell',body);
  if(!shell){shell=document.createElement('div');body.prepend(shell)}
  shell.outerHTML=shellHtml(config,session);
  shell=q('.v19-mode-shell',body);
  paintToolbar(authenticated?'authenticated':'public',authenticated);
  const publicButtons=shell.querySelectorAll('[data-v19-action="public"]');
  publicButtons.forEach(button=>button.onclick=()=>{
    setSelectedMode('public');
    paintToolbar('public',false);
    setResult('MODE PUBLIC RAPIDE\nSnapshot public actif. Données privées verrouillées. Aucun appel API automatique.','ok');
    renderCenter();
  });
  const authButton=q('[data-v19-action="auth"]',shell);
  if(authButton)authButton.onclick=()=>{
    if(authenticated){setResult(`SESSION GITHUB ACTIVE\nCompte : ${session.login||'connecté'}\nLes permissions effectives restent limitées à celles accordées à la GitHub App.`,'ok');return}
    const oauth=safeOauthUrl(config?.oauth_start_url);
    if(!config?.client_id||!oauth||!config?.session_status_url){
      setResult(`MODE AUTHENTIFIÉ NON CONFIGURÉ\nGitHub App : ${config?.client_id?'Client ID présent':'Client ID absent'}\nPasserelle OAuth : ${oauth?'présente':'absente'}\nSession serveur : ${config?.session_status_url?'présente':'absente'}\nLe mode public reste actif.`,'warn');
      return;
    }
    setSelectedMode('authenticated');
    location.assign(oauth.href);
  };
  const quota=q('#apiQuota');
  if(quota&&!quota.dataset.v19Watch){
    quota.dataset.v19Watch='1';
    new MutationObserver(()=>{const target=q('[data-v19-live="quota"]');if(target)target.textContent=quotaText()}).observe(quota,{childList:true,subtree:true,characterData:true});
  }
}
function init(){
  clearLegacyToken();
  paintVersion();
  renderCenter();
  setTimeout(()=>{paintVersion();renderCenter()},400);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
