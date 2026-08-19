import {$,$$,state,savePrefs,icon,toast} from './core.js';

export function toolbarMarkup(){return `<div id="quickTools" class="quick-tools" aria-label="Barre d’outils"><button class="icon-btn tool-extra" id="goTop" title="Retour en haut">${icon('up')}</button><button class="icon-btn tool-extra" id="toggleSections" title="État des sections">${icon('mixed')}</button><button class="icon-btn tool-extra" id="openHelp" title="Aide contextuelle">${icon('help')}</button><button class="icon-btn tool-extra" id="openQr" title="QR code de la page">${icon('qr')}</button><button class="icon-btn tool-extra" id="openSettingsBottom" title="Paramètres">${icon('gear')}</button><button class="icon-btn" id="reduceTools" title="Réduire / développer la barre">${icon('more')}</button></div>`}

export function captureSectionDefaults(){
  $$('.section').forEach(s=>{if(s.dataset.defaultCollapsed==null)s.dataset.defaultCollapsed=String(s.classList.contains('collapsed'))});
  applySectionPreset();syncSectionButton();
}
function applySectionPreset(){
  const mode=state.prefs.sectionPreset||'default';
  $$('.section').forEach(s=>{
    if(mode==='expanded')s.classList.remove('collapsed');
    else if(mode==='collapsed')s.classList.add('collapsed');
    else s.classList.toggle('collapsed',s.dataset.defaultCollapsed==='true');
  });
}
function syncSectionButton(){
  const b=$('#toggleSections');if(!b)return;const mode=state.prefs.sectionPreset||'default';
  b.innerHTML=icon(mode==='expanded'?'collapse':mode==='collapsed'?'expand':'mixed');
  b.title=mode==='default'?'Sections : état par défaut — cliquer pour tout déplier':mode==='expanded'?'Sections : tout déplié — cliquer pour tout replier':'Sections : tout replié — cliquer pour revenir à l’état par défaut';
}
function cycleSections(){
  const current=state.prefs.sectionPreset||'default';
  state.prefs.sectionPreset=current==='default'?'expanded':current==='expanded'?'collapsed':'default';
  savePrefs();applySectionPreset();syncSectionButton();
  toast(state.prefs.sectionPreset==='default'?'Sections : état par défaut':state.prefs.sectionPreset==='expanded'?'Sections : tout déplié':'Sections : tout replié');
}
export function initToolbar(){
  $('#goTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});
  $('#toggleSections').onclick=cycleSections;
  $('#openHelp').onclick=()=>$('#helpDrawer')?.classList.toggle('open');
  $('#openSettingsBottom').onclick=()=>$('#openSettings')?.click();
  $('#reduceTools').onclick=()=>$('#quickTools').classList.toggle('reduced');
  document.addEventListener('cuisinex:sections-rendered',captureSectionDefaults);
  syncSectionButton();
}
