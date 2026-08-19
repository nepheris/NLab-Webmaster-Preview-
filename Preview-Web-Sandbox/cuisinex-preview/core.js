export const STORAGE={prefs:'cuisinex.preview.prefs.v3',data:'cuisinex.preview.data.v3'};
export const DEFAULT_PREFS={
  theme:'light',primary:'#2563eb',secondary:'#0ea5e9',bg1:'#eef5ff',bg2:'#dcecff',
  headerSticky:true,headerShadow:true,footerMode:'minimal',toolbar:true,
  languages:{fr:true,en:true},defaultLanguage:'fr',view:'cards',pageSize:'auto',
  searchMode:'free',searchOperator:'and',searchScopes:['recipes','ingredients','techniques','equipment','library'],
  ingredientSources:['personal','ciqual'],settingsPinned:false,settingsPosition:null
};
export const state={data:null,lang:'fr',section:'home',detail:null,query:'',tokens:[],statusFilter:null,page:1,prefs:null,help:null};
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
export function loadPrefs(){
  try{state.prefs={...DEFAULT_PREFS,...JSON.parse(localStorage.getItem(STORAGE.prefs)||'{}')}}catch{state.prefs={...DEFAULT_PREFS}}
  state.lang=state.prefs.defaultLanguage||'fr';
  return state.prefs;
}
export function savePrefs(){localStorage.setItem(STORAGE.prefs,JSON.stringify(state.prefs));}
export function loadSavedData(){try{return JSON.parse(localStorage.getItem(STORAGE.data)||'null')}catch{return null}}
export function saveData(){if(state.data)localStorage.setItem(STORAGE.data,JSON.stringify(state.data));}
export function clearSavedData(){localStorage.removeItem(STORAGE.data);}
export function downloadJSON(filename,obj){
  const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
}
export function readJSONFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve(JSON.parse(r.result))}catch(e){reject(e)}};r.onerror=reject;r.readAsText(file,'utf-8')})}
export function toast(message){let n=$('.toast');if(n)n.remove();n=document.createElement('div');n.className='toast';n.textContent=message;document.body.append(n);setTimeout(()=>n.remove(),2200)}
export function icon(name){const paths={
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.6v.1h-4V21a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.1 17l.1-.1A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.4-1.9l-.1-.1L7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 4.6 1.4c-.8 1-2.3 1.4-2.3 3.1M12 17h.01"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  sliders:'<path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="13" cy="18" r="2"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  pin:'<path d="m14 4 6 6-3 1-4 4-1 5-3-3-5-5 5-1 4-4 1-3Z"/>',
  save:'<path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
  upload:'<path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 14v6h16v-6"/>',
  download:'<path d="M12 4v12M8 12l4 4 4-4"/><path d="M4 18v2h16v-2"/>',
  up:'<path d="m6 14 6-6 6 6"/>',
  expand:'<path d="m7 10 5 5 5-5"/>',
  collapse:'<path d="m7 14 5-5 5 5"/>',
  external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/>',
  local:'<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/>',
  reduce:'<path d="M7 12h10"/>',
  reset:'<path d="M4 7v5h5"/><path d="M5 12a7 7 0 1 0 2-5"/>'
};return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||''}</svg>`}
export function formatDuration(min){const n=Number(min)||0;const h=Math.floor(n/60),m=n%60;return h?`${h} h${m?` ${m} min`:''}`:`${m} min`}
export function allObjects(){if(!state.data)return[];const types=['recipes','ingredients','techniques','equipment','library'];return types.flatMap(type=>(state.data[type]||[]).map(x=>({...x,__type:type})));}
export function findObject(type,id){return (state.data?.[type]||[]).find(x=>x.id===id)||null;}
