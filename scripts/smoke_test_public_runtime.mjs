import fs from 'node:fs';
import vm from 'node:vm';

const runtimePath=process.argv[2];
if(!runtimePath) throw new Error('Usage: node smoke_test_public_runtime.mjs <runtime-js>');
const code=fs.readFileSync(runtimePath,'utf8');
const store=new Map();
const network=[];
const context={
  console,
  URL,
  Response,
  TextEncoder,
  TextDecoder,
  btoa:s=>Buffer.from(s,'binary').toString('base64'),
  unescape,
  encodeURIComponent,
  document:{
    baseURI:'https://nepheris.github.io/nLab-Webmaster-Preview/',
    documentElement:{dataset:{}}
  },
  localStorage:{
    setItem:(k,v)=>store.set(k,v),
    getItem:k=>store.get(k)||null
  },
  fetch:async input=>{
    network.push(String(input));
    throw new Error('NETWORK_BLOCKED');
  }
};
context.window=context;
vm.createContext(context);
vm.runInContext(code,context,{filename:runtimePath});

const rootUrl='https://api.github.com/repos/nepheris/nLab-Webmaster-Preview/contents/Preview-Web-Sandbox?ref=main';
const roots=await (await context.fetch(rootUrl)).json();
if(roots.length<5) throw new Error(`Expected at least 5 public projects, got ${roots.length}`);
const cockpit=roots.find(x=>x.name==='cockpit-nlab');
if(!cockpit) throw new Error('cockpit-nlab missing from runtime');
const tree=await (await context.fetch(`https://api.github.com/repos/nepheris/nLab-Webmaster-Preview/git/trees/${cockpit.sha}`)).json();
if(!tree.tree.some(x=>x.path==='20260813_010956_V4/index.html')) throw new Error('Cockpit V4 preview missing from runtime');

const metaResponse=await context.fetch('https://api.github.com/repos/nepheris/nLab-Webmaster-Preview/contents/Preview-Web-Sandbox/recettes-du-coeur/project.json?ref=main');
const metaPayload=await metaResponse.json();
const meta=JSON.parse(Buffer.from(metaPayload.content,'base64').toString('utf8'));
if(meta.visual?.url!=='assets/runtime/images/recettes-du-coeur.png') throw new Error(`Recettes visual is not local: ${meta.visual?.url}`);

const cached=JSON.parse(store.get('nlab-preview-inventory-v3')||'null');
if(!cached||cached.projects.length!==roots.length) throw new Error('Runtime did not seed the public inventory cache');
if(network.some(x=>x.includes('/nLab-Webmaster-Preview/'))) throw new Error(`Public runtime unexpectedly called network: ${network.join(', ')}`);

let privateDelegated=false;
try{
  await context.fetch('https://api.github.com/repos/nepheris/nLab-Webmaster/contents/Data/poc/private-access-test.json');
}catch(e){
  privateDelegated=e.message==='NETWORK_BLOCKED';
}
if(!privateDelegated) throw new Error('Private Data Store request must remain delegated to real GitHub auth/network');
if(context.document.documentElement.dataset.publicInventory!=='pages-runtime') throw new Error('Runtime source marker missing');

console.log(JSON.stringify({
  status:'PASS',
  publicProjects:roots.length,
  publicNetworkCalls:network.filter(x=>x.includes('/nLab-Webmaster-Preview/')).length,
  privateDelegated,
  runtimeSource:context.document.documentElement.dataset.publicInventory
}));
