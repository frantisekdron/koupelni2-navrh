import fs from 'node:fs';
const base='/koupelni2-navrh/predani/web/';
const file=new URL('./media-manifest.json',import.meta.url);
const media=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const lookup=new Map();
for(const [url,item] of Object.entries(media)){
 lookup.set(url,item);if(url.startsWith('https://frantisekdron.github.io'))lookup.set(url.replace('https://frantisekdron.github.io',''),item);
 for(const url of [item.src,item.full,...item.srcset.split(', ').map(s=>s.split(' ')[0])])lookup.set(url,item);
}
const attr=(tag,key)=>tag.match(new RegExp('\\b'+key+'="([^"]*)"'))?.[1];
function set(tag,key,value){const re=new RegExp('\\s'+key+'="[^"]*"','g');return tag.replace(re,'').replace(/\s*\/?>$/,' '+key+'="'+String(value).replaceAll('&','&amp;').replaceAll('"','&quot;')+'">');}
export function optimizeMarkup(html,pagePath){
 // Use the unit's own spatial view from the first HTML response, avoiding a second hero download.
 if(pagePath.startsWith('flats/')){
  const render=html.match(/class="[^"]*wp-block-themeisle-blocks-slider[^>]*>[\s\S]*?(<img\b[^>]*>)/)?.[1];
  const plan=html.match(/class="floor_image[^>]*>[\s\S]*?(<img\b[^>]*>)/)?.[1];
  const source=render||plan;
  if(source){const src=attr(source,'src');if(src)html=html.replace(/(<header class="k2-page-header">[\s\S]*?<figure[^>]*>)(<img[^>]*>)/,(_,p,tag)=>p+set(set(tag,'src',src),'data-unit-hero','true'));}
 }
 let n=0;
 html=html.replace(/<img\b[^>]*>/g,tag=>{
  const original=attr(tag,'data-original-src')||attr(tag,'src');
  const item=lookup.get(original?.replaceAll('&amp;','&'));
  const hero=attr(tag,'fetchpriority')==='high'&&n++===0;
  tag=set(set(tag,'decoding','async'),'loading',hero?'eager':'lazy');
  if(!item)return tag;
  tag=set(set(set(set(set(tag,'src',item.src),'srcset',item.srcset),'width',item.width),'height',item.height),'data-original-src',original);
  tag=set(tag,'data-full-src',item.full);
  const sizes=hero?'(max-width: 767px) 100vw, (max-width: 1200px) 60vw, 800px':pagePath.startsWith('flats/')&&/wp-block-themeisle-blocks-slider-item/.test(tag)?'(max-width: 540px) 50vw, 250px':pagePath==='galerie/index.html'?'(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 430px':'(max-width: 767px) 100vw, 720px';
  return set(tag,'sizes',sizes);
 });
 // High resolution is fetched only when a visitor actually opens the detail.
 html=html.replace(/<a\b[^>]*>/g,tag=>{const item=lookup.get(attr(tag,'href')?.replaceAll('&amp;','&'));return item?set(tag,'href',item.full):tag;});
 html=html.replace(/<iframe\b[^>]*>/g,tag=>set(tag,'loading','lazy'));
 // Only B is the approved final design. Retain the previous variant files in history.
 html=html.replace(/<link\b[^>]*href="[^"]*\/variant-[ac]\.css"[^>]*>\s*/g,'');
 if(!html.includes('data-k2-performance'))html=html.replace('</head>',`<link data-k2-performance rel="stylesheet" href="${base}_design/performance.css?v=20261031-3"></head>`).replace('</body>',`<script src="${base}_design/performance.js?v=20261031-3" defer></script></body>`);
 html=html.replace(/(_design\/performance\.(?:js|css)\?v=)[^"\s]+/g,(_,prefix)=>prefix+'20261031-3');
 return html;
}
export function heroMarkup(base,old=""){
 const custom=attr(old,"src");
 if(custom&&!/hero-v[78]-(desktop|tablet|mobile)\.mp4/.test(custom)){return `<video class="k2-hero-video" data-native-hero autoplay muted loop playsinline webkit-playsinline preload="auto" poster="${attr(old,"poster")||base+"media/hero-v7-poster.webp"}" src="${custom}" aria-hidden="true"></video>`;}
 return `<video class="k2-hero-video" data-native-hero autoplay muted loop playsinline webkit-playsinline preload="auto" poster="${base}media/hero-v7-poster.webp" aria-hidden="true" width="1440" height="810">${[['mobile','(max-width: 639px)'],['tablet','(min-width: 640px) and (max-width: 1099px)'],['desktop','(min-width: 1100px)']].map(([size,query])=>`<source src="${base}media/hero-v8-${size}.mp4" type="video/mp4" media="${query}">`).join('')}</video>`;
}
export function filmCoverMarkup(base,old=""){const opening=old.match(/^<[^>]+>/)?.[0]||old;const candidate=attr(opening,"data-film-url")||attr(old.match(/<iframe\b[^>]*>/i)?.[0]||"","src");const url=candidate&&/^https:\/\/player\.vimeo\.com\/video\/\d+(?:\?|$)/.test(candidate)?candidate:"https://player.vimeo.com/video/1240197567?h=cdd743aece&amp;dnt=1&amp;title=0&amp;byline=0&amp;portrait=0";return `<div class="k2-vimeo-frame k2-film-player" data-film-url="${url}"><button class="k2-film-cover" type="button" aria-label="Přehrát celý film o domě Koupelní 2 se zvukem"><img src="${base}media/film-cover.webp" width="1600" height="900" loading="lazy" decoding="async" alt="Koupelní 2 — skutečný záběr dokončené fasády"><span class="k2-film-brand" aria-hidden="true">KOUPELNÍ <b>2</b><i>L</i></span><span class="k2-film-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l13 8-13 8z"/></svg></span><span class="k2-film-caption"><strong>Koupelní 2 a jeho okolí</strong><span>Přehrát celý film · se zvukem</span></span></button><noscript><a href="https://vimeo.com/1240197567/cdd743aece" target="_blank" rel="noopener">Přehrát celý film na Vimeo ↗</a></noscript></div>`;}
export function optimizeRuntime(code){return code.replace("document.querySelector('.k2-hero-video'),toggle=", "document.querySelector('.k2-hero-video:not([data-native-hero])'),toggle=");}
