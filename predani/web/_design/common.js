(() => {
  const script = document.currentScript;
  const base = new URL('../', script.src);
  const variant = ['a','b','c'].includes(new URLSearchParams(location.search).get('verze')) ? new URLSearchParams(location.search).get('verze') : 'b';
  document.documentElement.dataset.k2Variant = variant;
  const el = (tag, cls, text) => { const e=document.createElement(tag); if(cls)e.className=cls; if(text)e.textContent=text;return e; };
  const localLink = (suffix) => {const u=new URL(suffix,base);u.searchParams.set('verze',variant);return u.href;};
  function setup(){
    const bar=el('aside','k2-design-switch');bar.setAttribute('aria-label','Výběr grafického návrhu');
    const chooser=el('a','','Všechny návrhy');chooser.href=new URL('../navrhy/',base);bar.append(chooser);
    const links=el('nav','','');links.setAttribute('aria-label','Grafická varianta');
    for(const [v,label]of [['a','A · Dům'],['b','B · Město'],['c','C · Výběr']]){const a=el('a','',label),u=new URL(location.href);u.searchParams.set('verze',v);a.href=u.href;if(v===variant)a.setAttribute('aria-current','page');links.append(a);}bar.append(links);if(variant!=='b')document.body.prepend(bar);
    const header=document.querySelector('.site-header');const originals=[...header.querySelectorAll('.main-navigation > ul > li > a')];
    const primary=[],other=[];const routeNames=[['o-projektu','Projekt'],['cenik','Jednotky'],['galerie','Galerie'],['lokalita','Lokalita'],['kontakt','Kontakt']];
    for(const a of originals){const key=routeNames.find(([s])=>new URL(a.href).pathname.replace(/\/$/,'').endsWith('/'+s));const copy=a.cloneNode(true);copy.className='';if(key){copy.textContent=key[1];primary.push([key[0],copy]);}else{copy.textContent=copy.textContent.trim().replace('Aktuality a zajímavosti','Aktuality');other.push(copy);}}
    primary.sort((a,b)=>routeNames.findIndex(r=>r[0]===a[0])-routeNames.findIndex(r=>r[0]===b[0]));
    const nav=el('nav','k2-primary-nav');nav.setAttribute('aria-label','Hlavní navigace');const desktop=el('div','k2-desktop-links');primary.forEach(([,a])=>desktop.append(a));const more=el('details','k2-more');more.append(el('summary','','Další'));const moreLinks=el('div','k2-more-links');other.forEach(a=>moreLinks.append(a));more.append(moreLinks);desktop.append(more);nav.append(desktop);
    const mobile=el('details','k2-mobile-links');mobile.append(el('summary','','Menu'));const menu=el('div','k2-more-links');[...primary.map(x=>x[1]),...other].forEach(a=>menu.append(a.cloneNode(true)));mobile.append(menu);nav.append(mobile);header.append(nav);header.classList.add('k2-simple-nav');
    const logo=header.querySelector('.site-logo');if(logo)logo.href=base.href;
    document.querySelectorAll('.site-logo').forEach(a=>a.href=base.href);
    const apply=window['k2ApplyVariant'+variant.toUpperCase()];if(apply)apply();
    if(window.k2ReviewDesign)window.k2ReviewDesign(base,variant);
    if(window.k2MountMedia)window.k2MountMedia(base);
    if(window.k2EnergyCalc)window.k2EnergyCalc(base);
    document.querySelectorAll('table.cenik').forEach(table=>{
      const heads=[...table.querySelectorAll('tr:first-child th')].map(x=>x.textContent.trim());const di=heads.indexOf('Dispozice');if(di<0)return;
      const rows=[...table.querySelectorAll('tr')].filter(r=>r.querySelector('td'));
      const controls=el('div','k2-unit-filters'),label=el('label','','Dispozice '),select=el('select');select.setAttribute('aria-label','Filtrovat dispozici');
      [['','Všechny dispozice'],...[...new Set(rows.map(r=>r.cells[di]?.textContent.trim()).filter(Boolean))].sort().map(x=>[x,x])].forEach(([v,t])=>{const o=el('option','',t);o.value=v;select.append(o)});label.append(select);controls.append(label);
      const avail=el('label','k2-available-toggle'),cb=el('input');cb.type='checkbox';avail.append(cb,document.createTextNode('Jen na prodej'));controls.append(avail);const count=el('span','k2-filter-count');count.setAttribute('aria-live','polite');controls.append(count);table.before(controls);
      const empty=el('p','k2-filter-empty','Pro tuto kombinaci není v nabídce žádná jednotka. Změňte filtr.');empty.hidden=true;table.after(empty);
      function update(){let n=0;rows.forEach(r=>{const show=(!select.value||r.cells[di].textContent.trim()===select.value)&&(!cb.checked||!!r.querySelector('.stav-volne'));r.hidden=!show;if(show)n++;});count.textContent=n+' z '+rows.length+' jednotek';empty.hidden=n>0;}
      select.addEventListener('change',update);cb.addEventListener('change',update);update();
    });
    function rewrite(a){const raw=a.getAttribute('href');if(!raw||/^(mailto:|tel:|javascript:)/i.test(raw))return;let u=new URL(raw,location.href);if(u.origin==='https://koupelni.hireal.cz'&&!/\.[a-z\d]+$/i.test(u.pathname)){u=new URL(u.pathname.replace(/^\//,'')+u.search+u.hash,base);}if(u.origin===location.origin&&u.pathname.startsWith(base.pathname)&&!(/\.(?:jpg|jpeg|png|pdf|zip|mp4|svg|webp)$/i.test(u.pathname))){u.searchParams.set('verze',variant);u.searchParams.set('rev','6');a.href=u.href;}}
    document.querySelectorAll('a[href]').forEach(a=>{if(!a.closest('.k2-design-switch'))rewrite(a)});
    document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(a&&!a.closest('.k2-design-switch'))rewrite(a)});
    document.querySelectorAll('.k2-preview-note,.preview-status').forEach(n=>n.remove());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
