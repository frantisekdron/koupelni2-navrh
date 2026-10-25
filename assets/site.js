const menu=document.querySelector('.menu-toggle');if(menu){menu.addEventListener('click',()=>{const nav=document.querySelector('#nav');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))})}
const table=document.querySelector('#unit-grid');
if(table){
  const rows=[...table.querySelectorAll('.unit-card')];
  const search=document.querySelector('#unit-search');
  const type=document.querySelector('#type-filter');
  const floor=document.querySelector('#floor-filter');
  const status=document.querySelector('#status-filter');
  const count=document.querySelector('#unit-count');
  const tabs=[...document.querySelectorAll('[data-category-button]')];
  const floorPicker=document.querySelector('.floor-picker');
  const floorLabel=document.querySelector('.floor-filter-label');
  let category='ubytovani';
  const lower=value=>(value||'').toLocaleLowerCase('cs');
  function apply(){
    const q=lower(search.value).trim(),t=lower(type.value),f=lower(floor.value),s=lower(status.value);
    let visible=0;
    for(const row of rows){
      const ok=(category==='all'||row.dataset.category===category)
        &&(!q||lower(row.dataset.search).includes(q))
        &&(!t||lower(row.dataset.type)===t)
        &&(!f||lower(row.dataset.floor)===f)
        &&(!s||lower(row.dataset.status)===s);
      row.hidden=!ok;if(ok)visible++;
    }
    const total=category==='all'?rows.length:rows.filter(row=>row.dataset.category===category).length;
    count.textContent=visible+' z '+total+' položek nabídky';
    document.querySelector('#unit-empty').hidden=visible!==0;
  }
  [search,type,floor,status].forEach(input=>input.addEventListener('input',apply));
  tabs.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.categoryButton;
    tabs.forEach(tab=>{const active=tab===button;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active))});
    type.value='';floor.value='';
    const hasFloors=category==='all'||category==='ubytovani'||category==='sklepy';
    floorPicker.hidden=!hasFloors;floorLabel.hidden=!hasFloors;
    document.querySelectorAll('[data-floor-button]').forEach(x=>x.classList.remove('active'));
    for(const option of [...type.options].slice(1)){
      option.hidden=category!=='all'&&!rows.some(row=>row.dataset.category===category&&row.dataset.type===option.value);
    }
    apply();
  }));
  document.querySelector('#unit-reset').addEventListener('click',()=>{search.value='';type.value='';floor.value='';status.value='';document.querySelectorAll('[data-floor-button]').forEach(x=>x.classList.remove('active'));apply()});
  tabs.find(x=>x.dataset.categoryButton==='ubytovani').click();
}
const galleryButtons=[...document.querySelectorAll('[data-gallery]')];
if(galleryButtons.length){
 const cards=[...document.querySelectorAll('.gallery-card')],visuals=[...document.querySelectorAll('.visual-preview')];
 const dialog=document.querySelector('#lightbox'),picture=dialog.querySelector('img');let group=[],position=0;
 const nouns={interier:'Interiéry',exterier:'Exteriéry',dron:'Z výšky',all:'Celý výběr'};
 galleryButtons.forEach(button=>button.addEventListener('click',()=>{
  galleryButtons.forEach(x=>{const selected=x===button;x.classList.toggle('selected',selected);x.setAttribute('aria-pressed',String(selected))});
  cards.forEach(x=>x.hidden=button.dataset.gallery!=='all'&&x.dataset.kind!==button.dataset.gallery);
  const count=cards.filter(x=>!x.hidden).length;
  document.querySelector('#gallery-count').textContent=nouns[button.dataset.gallery]+' · '+count+' fotografií';
 }));
 function show(){
  const card=group[position],visual=card.classList.contains('visual-preview');
  picture.src=card.dataset.full;picture.alt=card.querySelector('img').alt;
  document.querySelector('#lightbox-title').textContent=visual?'Vizualizace návrhu':card.querySelector('span').textContent;
  document.querySelector('#lightbox-kind').textContent=visual?'Obrazový návrh · není aktuální skutečný stav':'Skutečná fotografie · říjen 2026';
  document.querySelector('#lightbox-count').textContent=(position+1)+' / '+group.length;
 }
 [...cards,...visuals].forEach(card=>card.addEventListener('click',()=>{
  group=card.classList.contains('visual-preview')?[...card.closest('.visual-grid').querySelectorAll('.visual-preview')]:cards.filter(x=>!x.hidden);
  position=group.indexOf(card);show();dialog.showModal();
 }));
 function step(delta){position=(position+delta+group.length)%group.length;show()}
 document.querySelector('#lightbox-prev').addEventListener('click',()=>step(-1));
 document.querySelector('#lightbox-next').addEventListener('click',()=>step(1));
 document.querySelector('#lightbox-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();step(1)}if(event.key==='ArrowLeft'){event.preventDefault();step(-1)}});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
 galleryButtons[0].click();
}
const floorButtons=[...document.querySelectorAll('[data-floor-button]')];if(floorButtons.length){const floorSelect=document.querySelector('#floor-filter');floorButtons.forEach(button=>button.addEventListener('click',()=>{const now=button.dataset.floorButton;floorSelect.value=floorSelect.value===now?'':now;floorSelect.dispatchEvent(new Event('input'));floorButtons.forEach(x=>x.classList.toggle('active',x.dataset.floorButton===floorSelect.value));document.querySelector('#unit-count').scrollIntoView({behavior:'smooth',block:'center'})}));floorSelect.addEventListener('input',()=>floorButtons.forEach(x=>x.classList.toggle('active',x.dataset.floorButton===floorSelect.value)))}

if(location.hash==="#interiery")document.querySelector('[data-gallery="interier"]')?.click();

const planDialog=document.querySelector('#unit-plan-dialog');
if(planDialog){
  document.querySelectorAll('[data-plan]').forEach(button=>button.addEventListener('click',()=>{
    planDialog.querySelector('#unit-plan-heading').textContent=button.dataset.planTitle;
    const img=planDialog.querySelector('img');img.src=button.dataset.plan;img.alt='Půdorys '+button.dataset.planTitle;
    planDialog.querySelector('footer a').href=button.dataset.planPdf;planDialog.showModal();
  }));
  document.querySelector('#unit-plan-close').addEventListener('click',()=>planDialog.close());
  planDialog.addEventListener('click',event=>{if(event.target===planDialog){const r=planDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)planDialog.close()}});
}

document.querySelector('#unit-reset-top')?.addEventListener('click',()=>document.querySelector('#unit-reset').click());
document.querySelector('#nav')?.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelector('#nav').classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.focus()}});
