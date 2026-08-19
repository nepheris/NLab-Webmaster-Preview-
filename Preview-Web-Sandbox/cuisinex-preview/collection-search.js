import {$,state,icon} from './core.js';
import {bindSearchInput,openSearchConfig,resetSearch,syncSearchInputs} from './search.js';

const labels={recipes:'Rechercher dans les recettes…',ingredients:'Rechercher dans les ingrédients…',techniques:'Rechercher dans les techniques…',equipment:'Rechercher dans le matériel…',library:'Rechercher dans la bibliothèque…'};

export function mountCollectionSearch(render){
  const host=$('#collectionSearchHost');if(!host)return;
  if(state.detail||!labels[state.section]||(state.searchContext==='global'&&state.query)){host.innerHTML='';host.dataset.section='';return}
  if(host.dataset.section===state.section&&$('#collectionSearchInput')){syncSearchInputs();return}
  host.dataset.section=state.section;
  host.innerHTML=`<div id="collectionSearch" class="collection-search-wrap no-print"><div class="collection-search"><input id="collectionSearchInput" data-search-input data-search-context="section" type="search" placeholder="${labels[state.section]}" autocomplete="off"><button class="icon-btn" id="collectionSearchConfig" title="Configurer la recherche">${icon('sliders')}</button><button class="icon-btn" id="collectionSearchReset" title="Réinitialiser">${icon('reset')}</button></div></div>`;
  const input=$('#collectionSearchInput');bindSearchInput(input,'section');syncSearchInputs();
  $('#collectionSearchConfig').onclick=()=>openSearchConfig('section');
  $('#collectionSearchReset').onclick=()=>{state.searchContext='section';resetSearch();render()};
}
