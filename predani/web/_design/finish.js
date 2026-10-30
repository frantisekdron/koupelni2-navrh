/* Koupelní B: shared content presentation, with the existing CMS as source. */
(async()=>{'use strict';
 const main=document.querySelector('#k2-main-content');if(!main)return;
 const base=document.querySelector('meta[name="cms-base"]')?.content||'/koupelni2-navrh/predani/web/';
 const designBase=new URL('.',document.currentScript.src).href;
 const route=location.pathname.replace(base,'').replace(/\/+$/,'');
 document.body.classList.add('k2-finished');document.body.dataset.chapter=route.split('/')[0]||'home';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
 const link=(text,url,cls='k2-button')=>{const a=el('a',cls,text);a.href=url;return a;};
 const lightbox=img=>{if(img.closest('a'))return;const a=link('',img.src||img.currentSrc,'k2-plan-link');a.dataset.lightbox='plans';a.setAttribute('aria-label','Zvětšit: '+(img.alt||'plán'));img.before(a);a.append(img);};
 // The inherited slider requires WordPress JS; render its actual images as a gallery instead.
 main.querySelectorAll('.wp-block-themeisle-blocks-slider').forEach(slider=>{const gallery=el('div','k2-render-grid');const seen=new Set();slider.querySelectorAll('img').forEach(img=>{if(seen.has(img.src))return;seen.add(img.src);img.removeAttribute('style');img.removeAttribute('sizes');img.loading='lazy';const f=el('figure');img.className='';f.append(img);lightbox(img);gallery.append(f);});slider.replaceWith(gallery);});
 main.querySelectorAll('.wp-block-spacer, .wp-lightbox-container>button').forEach(n=>n.remove());
 main.querySelectorAll('p,h2,h3').forEach(n=>{if(!n.textContent.trim()&&!n.querySelector('img,input,iframe,svg'))n.remove();});
 main.querySelectorAll('a[href$=".pdf"]').forEach(a=>{a.classList.add('k2-document-link');a.setAttribute('target','_blank');a.setAttribute('rel','noopener');});
 main.querySelectorAll('.wp-block-image img').forEach(img=>{img.removeAttribute('sizes');if(!img.alt)img.alt='Podklad projektu Koupelní 2';lightbox(img);});
 if(route.startsWith('flats/')){
  const table=main.querySelector('table.tableSaved'),facts=table?.parentElement,grid=facts?.parentElement;
  if(grid){grid.classList.add('k2-unit-overview');facts.classList.add('k2-unit-facts');const plan=grid.children[1];plan?.classList.add('k2-unit-plan');
   const img=plan?.querySelector('img');if(img){lightbox(img);plan.append(el('p','k2-plan-hint','Kliknutím půdorys zvětšíte. Rozměry a vybavení uvádí karta jednotky.'));}
   const h=[...facts.querySelectorAll(':scope > h2')].find(x=>x.querySelector('b'));if(h){const state=h.querySelector('b').textContent.trim();h.className='k2-unit-state';h.textContent=state;h.dataset.status=state;}
   const ask=facts.querySelector('a[data-lb]');if(ask){ask.removeAttribute('data-lb');ask.href='mailto:hazukova@hireal.cz?subject='+encodeURIComponent('Zájem o '+document.querySelector('h1').textContent.trim()+' — Koupelní 2');ask.textContent='Zeptat se na jednotku ↗';}
   facts.querySelector('.form-lb-holder')?.remove();
  }
  main.querySelectorAll('h3').forEach(h=>{if(h.textContent.trim()==='3D model'){h.textContent='Návrh interiéru';h.after(el('p','k2-render-note','Vizualizace možného zařízení. Nejde o fotografii současného stavu ani interaktivní 3D prohlídku.'));}if(h.textContent.trim()==='Podlaží')h.textContent='Umístění v podlaží';});
  main.querySelector('.wp-block-columns')?.classList.add('k2-unit-support');
  main.querySelectorAll('.k2-unit-support img').forEach(lightbox);
  const render=main.querySelector('.k2-render-grid img'),hero=main.querySelector('.k2-page-header figure'),heroImg=hero?.querySelector('img');
  const source=render||main.querySelector('.floor_image img');
  if(source&&heroImg){hero.classList.add('k2-unit-hero');heroImg.src=source.src;heroImg.removeAttribute('srcset');heroImg.removeAttribute('sizes');heroImg.alt=(render?'Prostorová vizualizace — ':'Půdorys — ')+document.querySelector('h1').textContent.trim();heroImg.style.objectPosition='center';hero.querySelector('figcaption').textContent=render?'Prostorová vizualizace jednotky':'Půdorys jednotky';lightbox(heroImg);}
  const rows=[...main.querySelectorAll('.k2-unit-facts tr')];const get=label=>rows.find(r=>r.cells[0]?.textContent.trim()===label)?.cells[1]?.textContent.trim();
  const h1=main.querySelector('h1'),meta=el('div','k2-unit-hero-meta');[get('Dispozice'),get('Podlaží'),get('Plocha (čistá)')].filter(Boolean).forEach(v=>meta.append(el('span','',v)));h1?.after(meta);
  const floorText=get('Podlaží')||'',n=/\d/.test(floorText)?(/(?:1S|PP|suter)/i.test(floorText)?'0':floorText.match(/\d+/)[0]):null;
  if(n&&!document.querySelector('#k2-building-template'))try{const r=await fetch(designBase+'building.svg');if(r.ok){const parsed=new DOMParser().parseFromString(await r.text(),'image/svg+xml').documentElement;if(parsed.tagName==='svg'&&!parsed.querySelector('script,foreignObject,image')){const t=el('template');t.id='k2-building-template';t.content.append(document.importNode(parsed,true));document.body.append(t);}}}catch{}
  const floorColumn=[...main.querySelectorAll('.k2-unit-support>div')].find(c=>c.querySelector('h3')?.textContent.includes('Umístění'));
  if(floorColumn&&n&&document.querySelector('#k2-building-template')){const box=el('div','k2-unit-location');box.append(document.querySelector('#k2-building-template').content.cloneNode(true));box.querySelectorAll('[data-href]').forEach(z=>{const floor=z.dataset.href.match(/#df(\d+)/)?.[1];z.classList.toggle('is-selected',floor===n);z.setAttribute('tabindex','0');z.setAttribute('role','link');z.setAttribute('aria-label','Zobrazit '+floor+'. podlaží');const go=()=>location.assign(base+'pudorysy/#df'+floor);z.onclick=go;z.onkeydown=e=>{if(e.key==='Enter')go();};});const old=floorColumn.querySelector('.wp-block-image');if(old)old.replaceWith(box);floorColumn.append(link(n==='0'?'Otevřít půdorys suterénu ↗':'Otevřít půdorys '+n+'. NP ↗',base+'pudorysy/#df'+n,'k2-outline-button'));}
 }
 if(route==='faq'){
  const root=main.querySelector('.container-width-content'),headings=[...root.querySelectorAll('h2')],items=[];
  headings.forEach((h,i)=>{const range=document.createRange();range.setStartAfter(h);if(headings[i+1])range.setEndBefore(headings[i+1]);else range.setEnd(root,root.childNodes.length);items.push({title:h.textContent,body:range.cloneContents()});});
  const list=el('div','k2-faq-list');items.forEach((item,i)=>{const d=el('details','k2-faq-item');d.open=i===0;d.append(el('summary','',item.title));const b=el('div','k2-faq-answer');b.append(item.body);d.append(b);list.append(d);});
  root.replaceChildren(list);root.classList.add('k2-faq-layout');const aside=el('aside','k2-help-card');aside.append(el('p','k2-eyebrow','Osobně a konkrétně'),el('h2','','Máte další otázku?'),el('p','','Prodejce s vámi projde konkrétní jednotku i další postup.'),link('Kontaktovat prodejce ↗',base+'zkusebni-stranka/kontakt/'));root.append(aside);
 }
 if(route==='parkovani'){
  const root=main.querySelector('.container-width-content'),p=[...root.querySelectorAll(':scope > p')];
  const total=p[0],list=p[1];if(total&&list){const s=el('section','k2-parking-summary');const headline=el('div','k2-parking-total');const n=total.textContent.match(/\d+/)?.[0];headline.append(el('strong','',n||''),el('p','','parkovacích míst celkem'));s.append(headline);const stats=el('div','k2-parking-stats');list.innerHTML.split(/<br\s*\/?\s*>/i).forEach(t=>{const clean=t.replace(/<[^>]*>/g,'').replace(/^\s*•\s*/,'').trim(),m=clean.match(/^(\d+)\s+(.+)$/);if(m){const item=el('div');item.append(el('strong','',m[1]),el('span','',m[2]));stats.append(item);}});s.append(stats);total.before(s);total.remove();list.remove();}
  const actions=el('nav','k2-parking-actions');actions.setAttribute('aria-label','Nabídka parkování');p.slice(2,4).forEach((p,i)=>{const a=p.querySelector('a');if(a){a.className=i?'k2-outline-button':'k2-button';a.textContent=i?'Vybrat garáž v půdorysu ↗':'Dostupnost parkovacích míst ↗';a.removeAttribute('target');actions.append(a);p.remove();}});root.querySelector('.k2-parking-summary')?.after(actions);
  const situation=root.querySelector('figure');if(situation){situation.classList.add('k2-parking-plan');const caption=el('figcaption');caption.append(el('strong','','Parkování kolem domu'),el('p','','Přehled rezidenčního parkoviště, stání před domem a ve dvoře. Kliknutím plán zvětšíte.'),link('Garáže v suterénu ↗',base+'pudorysy/#df0','k2-outline-button'));situation.append(caption);}
 }
 if(route==='parkovani'){const node=main.querySelector('.k2-parking-interactive');if(node)main.querySelector('.k2-parking-actions')?.after(node);}
 if(route==='standardy'){
  const cols=main.querySelector('.wp-block-columns');if(cols){const sections=el('div','k2-specifications');let section,body;[...cols.querySelectorAll(':scope > .wp-block-column')].forEach(col=>{[...col.children].forEach(n=>{if(n.matches('p')&&n.children.length===1&&n.firstElementChild.matches('strong')&&n.textContent.length<110){section=el('section','k2-spec-row');section.append(el('h2','',n.textContent));body=el('div','k2-spec-copy');section.append(body);sections.append(section);}else if(n.matches('.k2-standard-update')){sections.append(n);section=null;body=null;}else if(body)body.append(n);else{n.classList.add('k2-spec-intro');sections.append(n);}});});cols.replaceWith(sections);}
 }
 if(route==='zkusebni-stranka/kontakt'){
  const contact=main.querySelector('.contact');const grid=main.querySelector('article>.master-padding>.master-margin>.pure-g');if(grid){grid.classList.add('k2-contact-grid');[...grid.children].forEach(c=>c.classList.add('k2-contact-panel'));const seller=grid.querySelector('.k2-sales-contact')?.closest('.pure-u-lg-1-2');if(seller)grid.prepend(seller);}
  main.querySelectorAll('[style*="text-align: center"]').forEach(n=>n.style.textAlign='left');
  main.querySelectorAll('.entry-content.monly').forEach(n=>n.classList.remove('monly'));
  const office=main.querySelector('.contact__wrap h2');if(office)office.before(el('p','k2-eyebrow','Sídlo společnosti · Brno'));
  main.querySelectorAll('a[href^="tel:420"]').forEach(a=>a.href=a.href.replace('tel:420','tel:+420'));
 }
 // Clickable building works on touch, keyboard and mouse; never sends visitors to localhost.
 const finder=document.querySelector('#pudorysy.k2-floor-finder, .k2-building-hero');if(finder){
  if(finder.querySelector('h2'))finder.querySelector('h2').textContent='Vyberte si podlaží.';
  const info=finder.querySelector('.info-floor');if(info){info.removeAttribute('aria-hidden');info.setAttribute('aria-live','polite');info.textContent='Zvolte podlaží v domě';}
  const zones=[...finder.querySelectorAll('[data-href]')];
  const highlight=n=>{zones.forEach(z=>z.classList.toggle('is-selected',z.dataset.href.endsWith('#df'+n)));finder.querySelectorAll('.k2-floor-links a').forEach(a=>a.classList.toggle('is-selected',a.hash==='#df'+n));if(info)info.textContent=n==='0'?'Suterén · garáže':n+'. nadzemní podlaží';};
  zones.forEach(z=>{const n=z.dataset.href.match(/#df(\d+)/)?.[1];if(!n)return;const url=base+'pudorysy/#df'+n;z.dataset.href=url;z.setAttribute('role','link');z.setAttribute('tabindex','0');z.setAttribute('aria-label',n==='0'?'Otevřít garáže v suterénu':'Vybrat jednotku v '+n+'. nadzemním podlaží');const go=()=>{if(route==='pudorysy'){location.hash='df'+n;highlight(n);document.querySelector('.k2-plan-instructions')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}else location.assign(url);};z.onclick=go;z.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};z.onmouseenter=z.onfocus=()=>highlight(n);});
  finder.querySelectorAll('.k2-floor-links a').forEach(a=>{a.onmouseenter=a.onfocus=()=>highlight(a.hash.replace('#df',''));});
  if(route==='pudorysy'){const sync=()=>highlight(location.hash.replace('#df',''));window.addEventListener('hashchange',sync);sync();}
 }
 if(route==='pudorysy'||route==='parkovani'){
  if(route==='parkovani')location.hash='df0';else if(!/^#df[0-7]$/.test(location.hash))location.hash='df1';
  const nav=main.querySelector('.floor-blocks__nav');if(nav&&!main.querySelector('.k2-plan-instructions'))nav.before(el('p','k2-plan-instructions','Vyberte podlaží. Kliknutím na vyznačenou jednotku otevřete její půdorys, parametry a cenu.'));
  main.querySelectorAll('.floor_area').forEach(a=>{if(a.dataset.unitUrl?.includes('/flats/'))a.dataset.unitUrl=base+'flats/'+a.dataset.unitUrl.split('/flats/')[1];});
  const plans=main.querySelector('.floor-blocks'),data=document.querySelector('#cms-floor-data');
  if(plans&&data){const bar=el('div','k2-plan-heading'),title=el('h2'),legend=el('div','k2-plan-legend');['Na prodej','Rezervováno','Prodáno'].forEach(t=>legend.append(el('span','',t)));bar.append(title,legend);plans.before(bar);const list=el('nav','k2-floor-unit-list');list.setAttribute('aria-label','Jednotky ve vybraném podlaží');plans.after(list);const update=()=>{const n=location.hash.replace('#df','');title.textContent=n==='0'?'Suterén · garáže':n+'. nadzemní podlaží';const units=JSON.parse(data.textContent),active=main.querySelector('.floor-active');const ids=new Set([...main.querySelectorAll('.floor-active .floor_area')].map(x=>x.dataset.id));list.replaceChildren();plans.querySelectorAll('.k2-svg-unit-label').forEach(x=>x.remove());for(const u of units.filter(u=>ids.has(u.svgId))){const a=link(u.title,u.url,'');a.append(el('span','',u.status+' ↗'));list.append(a);const shape=[...active.querySelectorAll('.floor_area')].filter(x=>x.dataset.id===u.svgId).sort((a,b)=>{let aa=a.getBBox(),bb=b.getBBox();return bb.width*bb.height-aa.width*aa.height})[0];if(shape){const b=shape.getBBox();if(b.width>45&&b.height>35){const label=document.createElementNS('http://www.w3.org/2000/svg','text');label.classList.add('k2-svg-unit-label');label.setAttribute('x',b.x+b.width/2);label.setAttribute('y',b.y+b.height/2);label.setAttribute('text-anchor','middle');label.setAttribute('dominant-baseline','central');label.textContent=u.svgId.replace(/^NP_\d+_/,'').replaceAll('_',' ');shape.parentElement.append(label);}}}};window.addEventListener('hashchange',update);document.addEventListener('koupelni:availability',update);update();}
 }
 if(!route)document.querySelector('.k2-floor-intro')?.remove();
 // Keep the original long text inside an explicit disclosure, without deleting it.
 main.querySelectorAll('.k2-spec-copy>p,.wp-block-media-text__content p').forEach(p=>{if(p.textContent.length<650||p.querySelector('a'))return;const text=p.textContent.trim(),at=text.indexOf('. ',100);if(at<0)return;const d=el('details','k2-full-copy');d.append(el('summary','','Celé znění'));p.before(el('p','k2-short-copy',text.slice(0,at+1)),d);d.append(p);});
 document.querySelectorAll('.k2-desktop-links,.k2-mobile-links .k2-more-links').forEach(nav=>{if(!nav.querySelector('[data-interactive-link]')){const a=link('Interaktivní výběr',base+'#pudorysy','');a.dataset.interactiveLink='true';nav.insertBefore(a,nav.children[1]||null);}});
 const footer=document.querySelector('.site-footer .master-margin');if(footer&&!footer.querySelector('.k2-credit')){const a=link('made by frantisekdron.cz','https://frantisekdron.cz/','k2-credit');a.rel='noopener';a.target='_blank';footer.append(a);}
})();
