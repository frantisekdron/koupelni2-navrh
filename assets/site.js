const menu=document.querySelector('.menu-toggle');if(menu){menu.addEventListener('click',()=>{const nav=document.querySelector('#nav');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))})}
const table=document.querySelector('#unit-table');
if(table){
  const rows=[...table.querySelectorAll('tbody tr')];
  const search=document.querySelector('#unit-search');
  const type=document.querySelector('#type-filter');
  const floor=document.querySelector('#floor-filter');
  const status=document.querySelector('#status-filter');
  const count=document.querySelector('#unit-count');
  const tabs=[...document.querySelectorAll('[data-category-button]')];
  const floorPicker=document.querySelector('.floor-picker');
  const floorLabel=document.querySelector('.floor-filter-label');
  let category='all';
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
  apply();
}
const galleryButtons=[...document.querySelectorAll('[data-gallery]')];if(galleryButtons.length){const cards=[...document.querySelectorAll('.gallery-card')];galleryButtons.forEach(button=>button.addEventListener('click',()=>{galleryButtons.forEach(x=>x.classList.toggle('selected',x===button));cards.forEach(x=>x.hidden=button.dataset.gallery!=='all'&&x.dataset.kind!==button.dataset.gallery)}));const dialog=document.querySelector('#lightbox');cards.forEach(card=>card.addEventListener('click',()=>{dialog.querySelector('img').src=card.dataset.full;dialog.showModal()}));document.querySelector('#lightbox-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})}
const floorButtons=[...document.querySelectorAll('[data-floor-button]')];if(floorButtons.length){const floorSelect=document.querySelector('#floor-filter');floorButtons.forEach(button=>button.addEventListener('click',()=>{const now=button.dataset.floorButton;floorSelect.value=floorSelect.value===now?'':now;floorSelect.dispatchEvent(new Event('input'));floorButtons.forEach(x=>x.classList.toggle('active',x.dataset.floorButton===floorSelect.value));document.querySelector('#unit-count').scrollIntoView({behavior:'smooth',block:'center'})}));floorSelect.addEventListener('input',()=>floorButtons.forEach(x=>x.classList.toggle('active',x.dataset.floorButton===floorSelect.value)))}
