import {$,state,icon} from './core.js';
import {bindSearchInput,openSearchConfig,resetSearch,syncSearchInputs} from './search.js';

const labels={recipes:'Rechercher dans les recettes…',ingredients:'Rechercher dans les ingrédients…',techniques:'Rechercher dans les techniques…',equipment:'Rechercher dans le matériel…',library:'Rechercher dans la bibliothèque…'};

export function mountCollectionSearch(render){
  if(state.detail||!labels[state.section]||(state.searchContext==='global'&&state.query))return;
  const app=$('#app'),heading=app?.querySelector(':scope > .collection-heading');if(!app||!heading||$('#collectionSearch'))return;
  const wrap=document.createElement('div');wrap.id='collectionSearch';wrap.className='collection-search-wrap no-print';
  wrap.innerHTML=`<div class="collection-search"><input id="collectionSearchInput" data-search-input data-search-context="section" type="search" placeholder="${labels[state.section]}" autocomplete="off"><button class="icon-btn" id="collectionSearchConfig" title="Configurer la recherche">${icon('sliders')}</button><button class="icon-btn" id="collectionSearchReset" title="Réinitialiser">${icon('reset')}</button></div>`;
  heading.insertAdjacentElement('afterend',wrap);
  const input=$('#collectionSearchInput');bindSearchInput(input,'section');syncSearchInputs();
  $('#collectionSearchConfig').onclick=()=>openSearchConfig('section');
  $('#collectionSearchReset').onclick=()=>{state.searchContext='section';resetSearch();render()};
}
