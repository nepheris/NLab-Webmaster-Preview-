(()=>{
'use strict';
const style=document.createElement('style');
style.textContent=`
.production-box{display:grid;gap:5px;padding:11px 13px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--surface) 74%,var(--surface2))}
.production-box .production-link{display:inline-flex;align-items:center;gap:6px;width:max-content;max-width:100%;padding:6px 9px;border-radius:9px;background:color-mix(in srgb,var(--green) 12%,var(--surface));border:1px solid color-mix(in srgb,var(--green) 36%,var(--line));color:var(--green);font-weight:800;text-decoration:none}
.production-box small{color:var(--muted)}
.production-link:hover{filter:brightness(.98)}
td>a{color:var(--accent);font-weight:700;text-decoration:none}td>a:hover{text-decoration:underline}
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