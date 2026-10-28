window.k2ReviewDesign = function (base, variant) {
  document.body.classList.add('k2-review');
  const url = path => new URL(path, base).href;
  const knownRoutes=new Set(window.k2LocalRoutes||[]);
  const routeURL=raw=>{const u=new URL(raw,location.href);if(u.origin===location.origin&&u.pathname.startsWith(base.pathname)){
    const suffix='/'+u.pathname.slice(base.pathname.length).replace(/\/$/,'')+'/';
    if(suffix.startsWith('/flats/')&&knownRoutes.size&&!knownRoutes.has(suffix))return 'https://koupelni.hireal.cz'+suffix;
    u.searchParams.set('verze',variant);
  }return u.href;};
  const unitData=document.querySelector('#pixelvent-floor-data');
  if(unitData){const units=JSON.parse(unitData.textContent);units.forEach(u=>u.url=routeURL(u.url));unitData.textContent=JSON.stringify(units);}
  document.querySelectorAll('[data-href]').forEach(e=>e.dataset.href=routeURL(e.dataset.href));
  const approval = document.querySelector('.k2-approval');
  if (approval) {
    approval.className = 'k2-proof';
    approval.innerHTML = `<div class="k2-proof__inner"><div class="k2-proof__heading"><span class="k2-proof__check" aria-hidden="true">✓</span><div><p class="k2-proof__label">Aktuální stav domu</p><h2>První etapa je zkolaudovaná.</h2></div></div><div class="k2-proof__scope"><p><strong>19 ubytovacích jednotek</strong><br>a veškeré společné části domu.</p><a href="${url('o-projektu/')}">Podrobnosti o projektu <span aria-hidden="true">→</span></a></div></div>`;
  }
  // Keep the legacy architectural selector, but give it visible floor links on every device.
  const floors = document.querySelector('body.home #pudorysy');
  if (floors) {
    floors.classList.add('k2-floor-finder');
    const links = floors.querySelector('.k2-mobile-floors');
    if (links) {
      const aside = document.createElement('div'); aside.className = 'k2-floor-finder__nav';
      aside.innerHTML = '<p class="k2-eyebrow">Nabídka jednotek</p><h2>Začněte podlažím.</h2><p>Otevřete půdorys a prohlédněte si jednotlivé prostory.</p>';
      links.className = 'k2-floor-links'; aside.append(links); floors.prepend(aside);
      links.querySelectorAll('a').forEach((a,i) => {a.innerHTML = `<strong>${i===0?'1. podzemní':i+'. nadzemní'}</strong><span>podlaží <b aria-hidden="true">↗</b></span>`;});
    }
    const heading = floors.querySelector('.section-inteactive > .page__portfolio__head'); if(heading) heading.remove();
    const info = floors.querySelector('.info-floor'); if(info) info.setAttribute('aria-hidden','true');
  }
  document.querySelectorAll('.glide__bullet').forEach((b,i)=>b.setAttribute('aria-label',`Zobrazit fotografii ${i+1}`));
  const nameUnits=()=>document.querySelectorAll('[data-unit-url][role=link]').forEach(e=>e.setAttribute('aria-label',`Detail jednotky ${e.dataset.id||e.id||''}`));nameUnits();window.addEventListener('load',nameUnits,{once:true});
  const modal=document.querySelector('#form_lb');if(modal)modal.setAttribute('tabindex','0');

  // Remove empty legacy decoration, never substantive copy or media.
  document.querySelectorAll('.entry-content .wp-block-columns,.entry-content p').forEach(e=>{
    if(!e.textContent.trim()&&!e.querySelector('img,svg,video,iframe,input,button,a[href]'))e.remove();
  });
  const financing=location.pathname.includes('/zpusob-financovani');
  if(financing){
    const content=document.querySelector('.entry-content'),group=content?.querySelector('.wp-block-group');
    if(group){
      const options=document.createElement('div');options.className='k2-finance-options';
      ['Standardní','Individuální','Úvěrové financování'].forEach(title=>{
        const p=[...group.querySelectorAll(':scope>p')].find(e=>e.textContent.trim()===title);
        if(!p)return;const terms=p.nextElementSibling;const card=document.createElement('section');card.className='k2-finance-option';
        const h=document.createElement('h2');h.textContent=title;card.append(h);if(terms)card.append(terms);p.remove();options.append(card);
      });
      group.prepend(options);content.classList.add('k2-finance-content');
      const intro=[...group.querySelectorAll(':scope>p')].find(e=>e.textContent.trim()==='Možnosti financování');if(intro)intro.remove();
      group.querySelectorAll(':scope>p').forEach(p=>{if(p.children.length===1&&p.firstElementChild.tagName==='STRONG'){const h=document.createElement('h2');h.textContent=p.textContent==='SPOLUPRACUJTE S PROFESIONÁLY'?'Spolupracujte s profesionály':p.textContent;p.replaceWith(h);}});
      const link=document.createElement('a');link.className='k2-button';link.href=url('zkusebni-stranka/kontakt/');link.textContent='Domluvit schůzku →';group.append(link);
    }
  }
  const previewForm=document.querySelector('form[data-preview-disabled]');
  if(previewForm){
    const contact=document.querySelector('.page-main--contact');
    if(contact){
      const sales=contact.querySelector('.wp-block-columns.has-background');if(sales)sales.classList.add('k2-sales-contact');
      contact.querySelectorAll('a[data-lb="form_lb"]').forEach(a=>{a.removeAttribute('data-lb');a.className='k2-button';a.href='mailto:hazukova@hireal.cz';a.textContent='Napsat prodejci →';});
      contact.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()==='Případně můžete odeslat dotaz přímo zde z webu.')p.remove();});
      const holder=document.querySelector('#form_lb');if(holder)holder.remove();
    }
  }
  if(location.pathname.includes('/standardy/')){
    const old=document.querySelector('.entry-content .wp-block-gallery');
    if(old){
      const photo=document.querySelector('.k2-page-header img');const root=new URL('.',photo.src);
      const gallery=document.createElement('div');gallery.className='k2-standards-photos';
      [['DSC00910.jpg','Kuchyň'],['DSC00905.jpg','Koupelna'],['DSC01010.jpg','Společné prostory']].forEach(([file,caption])=>{const a=document.createElement('a');a.href=url('galerie/#interier');const img=document.createElement('img');img.src=new URL(file,root);img.alt=caption+' — skutečná fotografie';img.loading='lazy';const label=document.createElement('span');label.textContent=caption+' ↗';a.append(img,label);gallery.append(a);});old.replaceWith(gallery);
    }
  }

  // A visible current chapter and keyboard-dismissable menus, in addition to native details semantics.
  document.querySelectorAll('.k2-primary-nav a').forEach(a=>{if(new URL(a.href).pathname.replace(/\/$/,'')===location.pathname.replace(/\/$/,''))a.setAttribute('aria-current','page');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.k2-primary-nav details[open]').forEach(d=>{d.open=false;d.querySelector('summary').focus();});});
  document.addEventListener('click',e=>document.querySelectorAll('.k2-primary-nav details[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;}));
  const skip = document.createElement('a');skip.className='k2-skip';skip.href='#k2-main-content';skip.textContent='Přejít k obsahu';document.body.prepend(skip);
  const main=document.querySelector('.page-main');if(main){main.id='k2-main-content';main.setAttribute('tabindex','-1');}
  // Animate only after the content is present. No invisible scroll-gated content or motion dependency.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);entry.target.animate([{transform:'translateY(10px)',opacity:.86},{transform:'translateY(0)',opacity:1}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)'});}),{threshold:.12});
    document.querySelectorAll('.k2-proof,.k2-section-heading,.k2-film__copy,.standard__wrap,.k2-gallery-heading,.k2-floor-finder__nav').forEach(e=>observer.observe(e));
  }
};
