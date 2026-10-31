/* Native muted autoplay starts before site scripts; this controller only adds controls/resume. */
(()=>{
 const v=document.querySelector('[data-native-hero]'),b=document.querySelector('.k2-video-toggle');if(!v||!b)return;
 const figure=v.closest('figure'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let pausedByUser=false,manual=false;
 const restricted=()=>motion.matches||navigator.connection?.saveData;
 const visible=()=>{const r=figure.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;};
 const label=()=>{b.textContent=v.paused?'Přehrát video':'Pozastavit';b.setAttribute('aria-label',v.paused?'Přehrát úvodní video bez zvuku':'Pozastavit úvodní video');};
 function play(){
  if(pausedByUser||document.hidden||!visible()||(restricted()&&!manual))return;
  v.muted=v.defaultMuted=true;
  if(!v.currentSrc&&!v.getAttribute('src')){const size=innerWidth<640?'mobile':innerWidth<1100?'tablet':'desktop';v.src=[...v.querySelectorAll('source')].find(s=>s.src.includes(size))?.src||v.querySelector('source').src;}
  v.play().catch(label);
 }
 v.addEventListener('playing',()=>{figure.classList.add('is-playing');label();});v.addEventListener('pause',label);
 v.addEventListener('error',label);
 b.onclick=()=>{if(v.paused){pausedByUser=false;manual=true;play();}else{pausedByUser=true;v.pause();}};
 if(restricted()){v.autoplay=false;v.pause();}else play();
 if(!v.paused)figure.classList.add('is-playing');label();
 new IntersectionObserver(()=>visible()?play():v.pause(),{threshold:0}).observe(figure);
 document.addEventListener('visibilitychange',()=>document.hidden?v.pause():play());
 window.addEventListener('pageshow',play);
 // Retry after the first permitted gesture if the browser blocks background autoplay.
 document.addEventListener('pointerdown',play,{passive:true});
 document.addEventListener('keydown',play);
 motion.addEventListener('change',()=>{if(restricted()){manual=false;v.pause();}else play();});
})();
