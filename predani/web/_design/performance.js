/* Light media, consistent architectural viewers, no geometric changes to source drawings. */
(()=>{
 const base=document.querySelector('meta[name="cms-base"]')?.content||'/koupelni2-navrh/predani/web/';
 const film=document.querySelector('.k2-film-player');
 if(film)film.querySelector('button')?.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src=film.dataset.filmUrl+'&autoplay=1';frame.title='Koupelní 2 — celý film o domě a okolí';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;film.replaceChildren(frame);frame.focus();});
 const filters=document.createElementNS('http://www.w3.org/2000/svg','svg');filters.setAttribute('class','k2-image-filters');filters.setAttribute('aria-hidden','true');filters.innerHTML='<defs><filter id="k2-architectural-colors" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".898 0 .102 0 0 0 .769 .231 0 0 .155 .155 .69 0 0 0 0 0 1 0"/></filter></defs>';document.body.append(filters);
 const plans=document.querySelectorAll('.chapter-parking-site img,.chapter-garage-stage img');
 plans.forEach(img=>{img.classList.add('k2-architectural-image');const a=img.closest('a');if(a){a.dataset.architectural='true';if(img.dataset.fullSrc)a.href=img.dataset.fullSrc;}});
 // Apply the same non-destructive display palette to the full-size lightbox.
 document.addEventListener('click',ev=>{const a=ev.target.closest('a[data-lightbox],a.k2-photo-link,a[data-fancybox]');if(!a)return;requestAnimationFrame(()=>{const img=document.querySelector('dialog[open] img');if(img)img.classList.toggle('k2-architectural-image',a.dataset.architectural==='true');});});
 const garage=document.querySelector('.chapter-garage-views');
 if(garage){const tabs=garage.querySelector('.chapter-view-tabs'),stage=garage.querySelector('.chapter-garage-stage');if(tabs&&stage){const shell=document.createElement('div');shell.className='k2-architecture-viewer';tabs.before(shell);shell.append(stage,tabs);const figures=[...stage.children];[...tabs.children].forEach((button,i)=>{const label=button.textContent,src=figures[i]?.querySelector('img');if(!src)return;const thumb=src.cloneNode();thumb.removeAttribute('id');thumb.removeAttribute('srcset');thumb.src=src.src.replace(/-\d+\.webp$/,'-480.webp');thumb.loading='lazy';thumb.alt='';thumb.width=160;thumb.height=100;thumb.className='k2-architectural-image';const text=document.createElement('span');text.textContent=label;button.replaceChildren(thumb,text);});}}
 // Keep the large render out of the content flow; detail remains one click away.
 document.querySelectorAll('.k2-render-grid img,.k2-unit-plan img').forEach(img=>{img.decoding='async';img.loading='lazy';});
})();
