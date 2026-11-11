/* Floor labels come from the card title mapped to each SVG area, never its Illustrator ID. */
(()=>{'use strict';
 const titleFor=(unit)=>{
  if(!unit||typeof unit.svgId!=='string'||typeof unit.title!=='string'||typeof unit.url!=='string')return '';
  const slug=unit.svgId.toLowerCase();
  if(!new RegExp('/flats/'+slug+'(?:-2)?/?(?:[?#]|$)').test(unit.url))return '';
  let m=unit.title.match(/^Ubyt\.j\. č\.\s*(\d{1,2})$/i);
  if(m&&unit.svgId.startsWith('NP_'))return 'UJ '+m[1].padStart(2,'0');
  m=unit.title.match(/^Kom\.j\. č\.\s*(\d{1,2})$/i);
  if(m&&unit.svgId.startsWith('NP_'))return 'KJ '+m[1].padStart(2,'0');
  m=unit.title.match(/^Garážové stání\s+(\d+)$/i);
  if(m&&unit.svgId.startsWith('GS_'))return 'G '+m[1];
  m=unit.title.match(/^Stání v hromadné garáži\s+(\d+)$/i);
  if(m&&unit.svgId.startsWith('GH_'))return 'H '+m[1];
  m=unit.title.match(/^Stání pro motocykl\s+(\d+)$/i);
  if(m&&unit.svgId.startsWith('GM_'))return 'M '+m[1];
  // A cellar SVG area represents a whole floor of cages, not one numbered cage.
  return '';
 };
 const fit=(label,shape)=>{
  if(!label||!shape||typeof shape.getBBox!=='function')return;
  const box=shape.getBBox(),width=label.getComputedTextLength?.()||0;
  if(width>box.width-8)label.style.fontSize=Math.max(11,Math.floor(21*(box.width-8)/width))+'px';
 };
 const patch=()=>{
  const data=document.querySelector('#cms-floor-data'),active=document.querySelector('.floor-blocks .floor-active');
  if(!data||!active)return;
  let units;try{units=JSON.parse(data.textContent);}catch{return;}
  const ids=new Set([...active.querySelectorAll('.floor_area')].map(item=>item.dataset.id));
  units=units.filter(unit=>ids.has(unit.svgId));
  const labels=new Map(units.map(unit=>[unit.svgId.replace(/^NP_\d+_/,'').replaceAll('_',' '),unit]));
  active.querySelectorAll('.k2-svg-unit-label').forEach(label=>{
   const unit=units.find(item=>item.svgId===label.dataset.svgId)||labels.get(label.textContent.trim());
   if(!unit)return;
   const text=titleFor(unit);if(!text){label.remove();return;}
   label.textContent=text;label.dataset.svgId=unit.svgId;
   const shape=[...active.querySelectorAll('.floor_area')].filter(item=>item.dataset.id===unit.svgId).sort((a,b)=>{const x=a.getBBox(),y=b.getBBox();return y.width*y.height-x.width*x.height;})[0];
   fit(label,shape);
  });
 };
 window.K2FloorLabels={label:titleFor,fit,patch};
 const later=()=>queueMicrotask(patch);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later,{once:true});else later();
 window.addEventListener('hashchange',later);document.addEventListener('koupelni:availability',later);
})();
