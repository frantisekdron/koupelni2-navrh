/* Approved v7 hero loop; full film is served by Vimeo, not downloaded locally. */
window.k2MountMedia = function (base) {
  const hero = document.querySelector('body.home .k2-hero');
  if (!hero || hero.dataset.videoReady) return;
  hero.dataset.videoReady = '1';
  const figure = hero.querySelector('.k2-hero__photo');
  const photo = figure.querySelector('img');
  const url = name => new URL('media/' + name, base).href;
  photo.src = url('hero-v7-poster.webp');
  photo.width = 1440; photo.height = 810;
  photo.alt = 'Koupelní 2 — skutečný záběr z dronu';
  figure.classList.add('k2-video-figure');
  figure.querySelector('figcaption').textContent = 'Koupelní 2 · skutečné záběry';
  const video = document.createElement('video');
  video.className = 'k2-hero-video';
  video.muted = true; video.defaultMuted = true; video.loop = true; video.playsInline = true;
  video.preload = 'none'; video.poster = photo.src; video.setAttribute('aria-hidden', 'true');
  figure.append(video);
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'k2-video-toggle'; button.textContent = 'Přehrát video';
  button.setAttribute('aria-label', 'Přehrát úvodní video bez zvuku'); figure.append(button);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const restricted = () => motion.matches || connection?.saveData || ['slow-2g','2g'].includes(connection?.effectiveType);
  let source = '', userPaused = false, started = false;
  const pick = () => innerWidth < 640 ? 'mobile' : innerWidth < 1100 ? 'tablet' : 'desktop';
  function setSource() {
    const next = pick();
    if (next === source) return;
    const time = video.currentTime;
    source = next; video.src = url('hero-v7-' + next + '.mp4');
    video.addEventListener('loadedmetadata', () => { if (time) video.currentTime = Math.min(time, video.duration - .1); }, {once:true});
  }
  function play() { started = true; setSource(); video.muted = true; video.play().catch(() => {}); }
  function label() { button.textContent = video.paused ? 'Přehrát video' : 'Pozastavit'; button.setAttribute('aria-label', video.paused ? 'Přehrát úvodní video bez zvuku' : 'Pozastavit úvodní video'); }
  video.addEventListener('playing', () => { figure.classList.add('is-playing'); label(); });
  video.addEventListener('pause', label);
  video.addEventListener('error', () => { figure.classList.remove('is-playing'); label(); });
  button.addEventListener('click', () => { if (video.paused) { userPaused=false; play(); } else { userPaused=true; video.pause(); } });
  const start = () => { if (!restricted()) { if ('requestIdleCallback' in window) requestIdleCallback(play, {timeout:1500}); else setTimeout(play, 400); } };
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, {once:true});
  let visible = true, timer;
  new IntersectionObserver(entries => { visible=entries[0].isIntersecting; if (!visible) video.pause(); else if(started && !userPaused && !restricted() && !document.hidden) play(); }, {threshold:.1}).observe(figure);
  document.addEventListener('visibilitychange', () => { if(document.hidden) video.pause(); else if(visible && started && !userPaused && !restricted()) play(); });
  motion.addEventListener('change', () => { if(restricted()) video.pause(); });
  window.addEventListener('resize', () => { clearTimeout(timer); timer=setTimeout(() => { if(started && !restricted()) { const playing=!video.paused; setSource(); if(playing) play(); } },250); });
  const cta = hero.querySelector('.k2-text-link');
  if (cta) { cta.href='#film'; cta.textContent='Přehrát celý film ↓'; }
  const film = document.querySelector('.k2-film');
  if (film) {
    film.id='film'; film.classList.remove('is-placeholder'); film.setAttribute('aria-labelledby','k2-film-title');
    film.innerHTML='<div class="k2-film__copy"><p class="k2-eyebrow">Dům v pohybu</p><h2 id="k2-film-title">Koupelní 2 a jeho okolí.</h2><p>Prohlédněte si dům i okolní město ve skutečných záběrech z dronu.</p></div><div class="k2-vimeo-frame"><iframe src="https://player.vimeo.com/video/1240197567?h=cdd743aece&dnt=1&title=0&byline=0&portrait=0" title="Koupelní 2 — celý film o domě a okolí" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
  }
};
