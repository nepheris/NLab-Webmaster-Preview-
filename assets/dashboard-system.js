(()=>{
  'use strict';
  const root=document.documentElement;
  const key='nlab-dashboard-theme';
  const saved=localStorage.getItem(key)||'dark';
  const setTheme=t=>{root.dataset.theme=t;localStorage.setItem(key,t);document.querySelectorAll('[data-theme-toggle]').forEach(b=>{b.setAttribute('aria-pressed',String(t==='light'));b.title=t==='dark'?'Passer au thème clair':'Passer au thème sombre'})};
  setTheme(saved);
  document.addEventListener('click',e=>{
    const theme=e.target.closest('[data-theme-toggle]');if(theme){setTheme(root.dataset.theme==='dark'?'light':'dark');return}
    const seg=e.target.closest('[data-view-target]');if(seg){const group=seg.closest('[data-view-group]')||document;group.querySelectorAll('[data-view-target]').forEach(b=>b.setAttribute('aria-pressed',String(b===seg)));group.querySelectorAll('[data-view]').forEach(v=>v.hidden=v.dataset.view!==seg.dataset.viewTarget);return}
    const all=e.target.closest('[data-sections]');if(all){const open=all.dataset.sections==='open';document.querySelectorAll('details.section').forEach(d=>d.open=open);return}
  });
  document.querySelectorAll('[data-filter]').forEach(input=>input.addEventListener('input',()=>{
    const q=input.value.trim().toLocaleLowerCase('fr');const scope=document.querySelector(input.dataset.filter)||document;
    scope.querySelectorAll('[data-search]').forEach(el=>el.classList.toggle('hide',q&&!el.dataset.search.toLocaleLowerCase('fr').includes(q)));
  }));
})();
