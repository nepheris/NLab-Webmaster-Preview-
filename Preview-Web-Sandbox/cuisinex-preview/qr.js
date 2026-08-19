import {$,esc} from './core.js';
import {openFloating} from './floating.js';

function currentShareUrl(){const u=new URL(location.href);u.searchParams.set('view','current');return u.toString()}
export function qrMarkup(){return `<aside id="qrPanel" class="qr-panel" data-floating-key="qr" aria-hidden="true"><div class="floating-head"><strong>QR code de la page</strong></div><div class="floating-body qr-body"><img id="qrImage" alt="QR code de la page"><p class="muted small">Prototype : QR généré à la demande à partir de l’URL courante.</p><a id="qrOpenUrl" class="btn" target="_blank" rel="noopener">Ouvrir l’URL</a></div></aside>`}
export function openQr(){const panel=$('#qrPanel'),img=$('#qrImage'),link=$('#qrOpenUrl');if(!panel||!img)return;const url=currentShareUrl();img.src=`https://quickchart.io/qr?size=220&text=${encodeURIComponent(url)}`;link.href=url;link.textContent=url;openFloating('qr')}
export function initQr(){const b=$('#openQr');if(b)b.onclick=openQr}
