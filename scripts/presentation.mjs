import fs from 'node:fs';
const building=fs.readFileSync(new URL('../predani/web/_design/building.svg',import.meta.url),'utf8');
const aliases=JSON.parse(fs.readFileSync(new URL('./unit-aliases.json',import.meta.url),'utf8'));
export const presentationRevision='20261030-design-3';
export function present(html,pagePath,sourcePages){
 const base='/koupelni2-navrh/predani/web/';
 html=html.replaceAll('https://koupelni.hireal.cz/wp-content/uploads/2026/03/STANDARDY_new-new-05032026.pdf','https://frantisekdron.github.io/koupelni2-navrh/predani/downloads/Koupelni_2_katalog_standardu.pdf').replaceAll('>STANDARDY</a>','>Stáhnout katalog standardů · PDF</a>');
 html=html.replaceAll('https://frantisekdron.github.io/wp-content/','https://koupelni.hireal.cz/wp-content/').replaceAll('https://frantisekdron.github.io//maps.googleapis.com','https://maps.googleapis.com').replaceAll('https://frantisekdron.github.io/site.webmanifest',base+'site.webmanifest');
 html=html.replace(/http:\/\/(?:127\.0\.0\.1|localhost):\d+\/pudorysy\//g,base+'pudorysy/').replaceAll('https://koupelni.hireal.cz/flats/',base+'flats/');
 for(const [from,to] of Object.entries(aliases))html=html.replaceAll(from,to);
 if(pagePath==='galerie/index.html')html=html.replace(/(<header class="k2-page-header">[\s\S]*?<img)([^>]*)(>)/,(_,start,attrs,end)=>!attrs.includes('DSC00910.jpg')?start+attrs+end:start+attrs.replace(/src="[^"]*"/,'src="https://frantisekdron.github.io'+base+'wp-content/themes/pixelvent/img/reality-2026/DJI_20261016113702_0116_D-HDR.jpg"').replace(/alt="[^"]*"/,'alt="Dokončená fasáda domu Koupelní 2 — skutečná fotografie"')+end);
 if(pagePath==='pudorysy/index.html'&&!html.includes('class="k2-building-hero"'))html=html.replace(/(<header class="k2-page-header">[\s\S]*?)<figure>[\s\S]*?<\/figure>/,'$1<div class="k2-building-hero"><p class="info-floor" aria-live="polite">Vyberte podlaží přímo na domě</p>'+building+'</div>');
 if(pagePath==='index.html')html=html.replace(/(<div class="section-inteactive">[\s\S]*?)<svg[\s\S]*?<\/svg>/,'$1'+building);
 if(pagePath==='parkovani/index.html'&&!html.includes('k2-parking-interactive')){
  const plans=sourcePages?.find(p=>p.path==='pudorysy/index.html')?.html||fs.readFileSync(new URL('../predani/web/pudorysy/index.html',import.meta.url),'utf8');
  const svg=plans.slice(plans.indexOf('data-floor="0"')).match(/<svg[\s\S]*?<\/svg>/)?.[0],data=plans.match(/<script[^>]*id="cms-floor-data"[^>]*>[\s\S]*?<\/script>/)?.[0];
  if(svg&&data){const section=`<section class="k2-parking-interactive"><p class="k2-eyebrow">Parkování v domě</p><h2>Vyberte si garáž nebo stání.</h2><p class="k2-plan-instructions">Klikněte na vyznačené místo. Otevře se jeho detail s cenou a půdorysem.</p><div class="floor-blocks"><div class="floor floor-active" data-floor="0">${svg}</div></div>${data}</section>`;html=html.replace(/(<div class="container-width-content">)/,'$1'+section);}
 }
 html=html.replace(/<template id="k2-building-template">[\s\S]*?<\/template>/g,'');
 html=html.replace(/(finish\.(?:css|js)\?v=)[^"']+/g,'$1'+presentationRevision);
 if(!html.includes('data-k2-presentation'))html=html.replace('</head>',`<link data-k2-presentation rel="stylesheet" href="${base}_design/finish.css?v=${presentationRevision}"></head>`).replace('</body>',`<script src="${base}_design/finish.js?v=${presentationRevision}" defer></script></body>`);
 return html;
}
