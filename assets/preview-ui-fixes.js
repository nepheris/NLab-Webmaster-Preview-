(()=>{
'use strict';
// V1.1: dark is the default for a fresh browser profile. User preference remains editable afterwards.
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
.dash-history{min-width:150px}.dash-history summary{cursor:pointer;font-weight:800;color:var(--accent);white-space:nowrap}
.dash-history-list{display:grid;gap:4px;margin-top:7px;min-width:230px}
.dash-history-list a{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;padding:6px 7px;border:1px solid var(--line);border-radius:8px;background:var(--surface2);text-decoration:none;color:var(--ink)}
.dash-history-list a:hover{border-color:var(--accent);background:var(--accent-soft)}
.dash-history-list a b{font-size:11px}.dash-history-list a span{color:var(--muted);font-size:11px}
.dash-table td>a{display:inline-block}.dash-table td>a small{display:block;color:var(--muted);font-weight:500}
@media(max-width:680px){.project-visual{width:34px;height:34px}.dash-history-list{min-width:0}.dash-history-list a{grid-template-columns:1fr}.project-identity{align-items:flex-start}}
`;
document.head.appendChild(style);
const table=document.getElementById('previewTable');
if(!table)return;
const rows=table.tHead?.rows;
if(!rows||rows.length<2)return;
const head=rows[0], filters=rows[1];
if(!head.querySelector('[data-sort="production"]')){
  const th=document.createElement('th');
  th.dataset.sort='production';
  th.innerHTML='Production<span class="col-resizer"></span>';
  head.insertBefore(th,head.children[4]||null);
  const f=document.createElement('th');
  f.innerHTML='<input data-col-filter="production" placeholder="Production">';
  filters.insertBefore(f,filters.children[4]||null);
}
})();
