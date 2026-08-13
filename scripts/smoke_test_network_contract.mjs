import fs from 'node:fs';

const root=process.argv[2]||'.';
const read=path=>fs.readFileSync(`${root}/${path}`,'utf8');
const html=read('index.html');
const core=read('assets/preview-browser-core.js');
const sandbox=read('assets/preview-sandbox-center.js');
const github=read('assets/preview-v19.js');

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
assert(html.includes('Actualiser l’arborescence'),'Manual tree refresh label missing');
assert(html.includes('>Enregistrer</button>'),'Global save label missing');
assert(core.includes('window.__nlabPublicRuntime'),'Static snapshot boot missing');
assert(core.includes('lighthouseAuditUrl'),'Per-version Lighthouse URL builder missing');
assert(core.includes('lighthouseVersionLink'),'Per-version Lighthouse action missing');
assert(core.includes("audit.searchParams.set('url',target)"),'Lighthouse target URL must be computed lazily without fetching');
assert(core.includes("document.dispatchEvent(new CustomEvent('nlab:save-request'"),'Explicit save event missing');
assert(!sandbox.includes('trySync()'),'Automatic sandbox sync call remains');
assert(sandbox.includes('button.onclick=async()=>'),'Sandbox catalog must load only after an explicit click');
assert(!/function init\(\)\{[^}]*loadCatalog/.test(sandbox),'Sandbox catalog still loads during startup');
assert(sandbox.includes("document.addEventListener('nlab:save-request',handleSaveRequest)"),'Manual batch listener missing');
assert((sandbox.match(/fetch\(syncUrl/g)||[]).length===1,'Expected exactly one browser sync request site');
assert(sandbox.includes("localStorage.setItem(BATCH_KEY"),'Local batch queue missing');
assert(!github.includes('setTimeout(()=>{paintVersion();renderCenter()}'),'Automatic repeated auth render remains');
assert(github.includes("event.target.closest?.('#v14GithubCenter')"),'Lazy GitHub center initialization missing');

console.log(JSON.stringify({status:'PASS',snapshotBoot:true,automaticSync:false,browserSyncSites:1,manualTreeRefresh:true,perVersionLighthouse:true,lazySandbox:true,minimalStartup:true}));
