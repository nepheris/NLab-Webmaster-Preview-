(()=>{
'use strict';
const src='assets/preview-v17.js';
if(document.querySelector(`script[src="${src}"]`))return;
const s=document.createElement('script');
s.src=`${src}?v=1.7`;
s.defer=true;
s.onerror=()=>console.error('nLab Preview: impossible de charger la couche V1.7');
document.head.appendChild(s);
})();
