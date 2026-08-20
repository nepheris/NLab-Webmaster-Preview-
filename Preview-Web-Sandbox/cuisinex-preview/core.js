export const STORAGE={prefs:'cuisinex.preview.prefs.v4',data:'cuisinex.preview.data.v4'};
export const UX_PREFS_VERSION=9;
export const DEFAULT_WINDOWS={
  settings:{locked:false,docked:false,collapsed:false,scrollbars:true,position:null},
  help:{locked:true,docked:true,collapsed:false,scrollbars:true,position:null},
  search:{locked:false,docked:false,collapsed:false,scrollbars:true,position:null},
  qr:{locked:false,docked:false,collapsed:false,scrollbars:true,position:null},
  toolbar:{locked:true,docked:true,collapsed:false,position:null,dockX:.5}
};
export const DEFAULT_CONTEXT_THEME={enabled:false,scope:'item',global:{},types:{},items:{}};
export const DEFAULT_PREFS={
  uxPrefsVersion:UX_PREFS_VERSION,
  theme:'light',primary:'#2563eb',secondary:'#0ea5e9',systemColor:'#64748b',bg1:'#eef5ff',bg2:'#dcecff',
  gradientEnabled:true,gradientAngle:135,headerSticky:true,headerShadow:true,headerTransparent:false,searchShadow:true,
  footerMode:'minimal',toolbar:true,languages:{fr:true,en:true,es:true,ru:true,ar:true,ps:true},sourceLanguage:'fr',secondaryLanguage:'en',defaultLanguage:'fr',
  view:'cards',pageSize:'auto',searchMode:'free',searchOperator:'and',
  searchScopes:['recipes','ingredients','techniques','equipment','library'],ingredientSources:['personal','ciqual'],
  sectionPreset:'default',logoMode:'emoji',logoText:'🍽️',logoUrl:'',windows:DEFAULT_WINDOWS,contextTheme:DEFAULT_CONTEXT_THEME
};
export const state={data:null,lang:'fr',section:'home',detail:null,query:'',tokens:[],searchContext:'global',statusFilter:null,page:1,prefs:null,help:null,themeTarget:null};
export const $=(s,r=document)=>r.querySelector(s);
export const $$=(s,r=document)=>[...r.querySelectorAll(s)];
export const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
export const text=value=>{
  if(value==null)return'';
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value[state.lang]??value.fr??value.en??Object.values(value)[0]??'';
};
export const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const uid=()=>Math.random().toString(36).slice(2,10);
function mergeWindows(raw={}){const out={};for(const [k,v] of Object.entries(DEFAULT_WINDOWS))out[k]={...v,...(raw?.[k]||{})};return out}
function mergeContext(raw={}){return {...DEFAULT_CONTEXT_THEME,...raw,global:{...(raw.global||{})},types:{...(raw.types||{})},items:{...(raw.items||{})}}}
function mergePrefs(raw={}){
  const windows=mergeWindows(raw.windows);
  if(raw.settingsLocked!=null)windows.settings.locked=!!raw.settingsLocked;
  if(raw.settingsDocked!=null)windows.settings.docked=!!raw.settingsDocked;
  if(raw.settingsPosition)windows.settings.position=raw.settingsPosition;
  if(Number(raw.uxPrefsVersion||0)<8){windows.help.locked=true;windows.help.docked=true}
  const merged={...DEFAULT_PREFS,...raw,uxPrefsVersion:UX_PREFS_VERSION,languages:{...DEFAULT_PREFS.languages,...(raw.languages||{})},searchScopes:[...(raw.searchScopes||DEFAULT_PREFS.searchScopes)],ingredientSources:[...(raw.ingredientSources||DEFAULT_PREFS.ingredientSources)],windows,contextTheme:mergeContext(raw.contextTheme)};
  merged.sourceLanguage='fr';merged.defaultLanguage='fr';merged.languages.fr=true;
  const alternates=['en','es','ru','ar','ps'];
  if(!merged.languages[merged.secondaryLanguage]||merged.secondaryLanguage==='fr')merged.secondaryLanguage=alternates.find(k=>merged.languages[k])||'en';
  return merged;
}
export function loadPrefs(){
  try{state.prefs=mergePrefs(JSON.parse(localStorage.getItem(STORAGE.prefs)||'{}'))}catch{state.prefs=mergePrefs()}
  state.lang='fr';localStorage.setItem(STORAGE.prefs,JSON.stringify(state.prefs));
  return state.prefs;
}
export function normalizePrefs(raw){return mergePrefs(raw)}
export function savePrefs(){localStorage.setItem(STORAGE.prefs,JSON.stringify(state.prefs));}
export function loadSavedData(){try{return JSON.parse(localStorage.getItem(STORAGE.data)||'null')}catch{return null}}
export function saveData(){if(state.data)localStorage.setItem(STORAGE.data,JSON.stringify(state.data));}
export function clearSavedData(){localStorage.removeItem(STORAGE.data);}
export function downloadJSON(filename,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}
export function readJSONFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve(JSON.parse(r.result))}catch(e){reject(e)}};r.onerror=reject;r.readAsText(file,'utf-8')})}
export function toast(message){let n=$('.toast');if(n)n.remove();n=document.createElement('div');n.className='toast';n.textContent=message;document.body.append(n);setTimeout(()=>n.remove(),2200)}
export function icon(name){const paths={
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.6v.1h-4V21a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.1 17l.1-.1A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.4-1.9l-.1-.1L7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 4.6 1.4c-.8 1-2.3 1.4-2.3 3.1M12 17h.01"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  sliders:'<path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="13" cy="18" r="2"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  pin:'<path d="m14 4 6 6-3 1-4 4-1 5-3-3-5-5 5-1 4-4 1-3Z"/>',
  anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 7v13M5 12H2a10 10 0 0 0 20 0h-3M8 20h8"/>',
  lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/>',
  unlock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7-2.6M12 14v2"/>',
  minimize:'<path d="M6 12h12"/>',
  maximize:'<path d="m7 14 5-5 5 5"/>',
  save:'<path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
  upload:'<path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 14v6h16v-6"/>',
  download:'<path d="M12 4v12M8 12l4 4 4-4"/><path d="M4 18v2h16v-2"/>',
  top:'<path d="M5 5h14M12 20V8M8 12l4-4 4 4"/>',
  expand:'<path d="m7 10 5 5 5-5"/>',
  collapse:'<path d="m7 14 5-5 5 5"/>',
  mixed:'<path d="M5 8h14M8 12h8M5 16h14"/>',
  more:'<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',
  external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/>',
  local:'<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/>',
  reset:'<path d="M4 7v5h5"/><path d="M5 12a7 7 0 1 0 2-5"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 4 4 2-2 5 5"/>',
  qr:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2M14 18h2"/>',
  grip:'<path d="M8 7h.01M12 7h.01M16 7h.01M8 12h.01M12 12h.01M16 12h.01M8 17h.01M12 17h.01M16 17h.01" stroke-width="3"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.3-3l-.5-.5a1.5 1.5 0 0 1 1.1-2.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.8" r=".8"/><circle cx="14" cy="6.5" r=".8"/><circle cx="17" cy="9.5" r=".8"/>',
  scrollbars:'<path d="M5 4v16M19 4v16M8 6h8M8 18h8"/><path d="m10 9-2-3 2-3M14 15l2 3-2 3"/>',
  burger:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  utensils:'<path d="M7 3v7M4.5 3v4.5A2.5 2.5 0 0 0 7 10a2.5 2.5 0 0 0 2.5-2.5V3M7 10v11M16 3c-1.6 2-2.2 4.2-1.8 6.4.2 1.2.9 2.1 1.8 2.6V21M16 3v9"/>'
};return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||''}</svg>`}
export function formatDuration(min){const n=Number(min)||0,h=Math.floor(n/60),m=n%60;return h?`${h} h${m?` ${m} min`:''}`:`${m} min`}
export function allObjects(){if(!state.data)return[];const types=['recipes','ingredients','techniques','equipment','library','trials'];return types.flatMap(type=>(state.data[type]||[]).map(x=>({...x,__type:type})))}
export function findObject(type,id){return (state.data?.[type]||[]).find(x=>x.id===id)||null}
