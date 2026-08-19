import {$,state,icon} from './core.js';
import {bindSearchInput,openSearchConfig,resetSearch,syncSearchInputs} from './search.js';

const labels={recipes:'Rechercher dans les recettes…',ingredients:'Rechercher dans les ingrédients…',techniques:'Rechercher dans les techniques…',equipment:'Rechercher dans le matériel…',library:'Rechercher dans la bibliothèque…'};

export function mountCollectionSearch(render){
  if(state.detail||!labels[state.section])return;
  const app=$('#app');if(!app||$('#collectionSearch'))return;
  const heading=app.querySelector(':scope > .panel');
  const bar=document.createElement('div');bar.id='collectionSearch';bar.className='collection-search-wrap no-print';
  bar.innerHTML=`<div class="collection-search"><input id="collectionSearchInput" type="search" placeholder="${labels[state.section]}" autocomplete="off"><button class="icon-btn" id="collectionSearchConfig" title="Configurer la recherche">${icon('sliders')}</button><button class="icon-btn" id="collectionSearchReset" title="Réinitialiser">${icon('reset')}</button></div>`;
  if(heading)heading.insertAdjacentElement('afterend',bar);else app.prepend(bar);
  const input=$('#collectionSearchInput');bindSearchInput(input,'section');syncSearchInputs();
  $('#collectionSearchConfig').onclick=()=>openSearchConfig('section');
  $('#collectionSearchReset').onclick=()=>{state.searchContext='section';resetSearch();render()};
}
