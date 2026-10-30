/* Reattach playback to CMS-rendered markup, including after returning to a tab. */
(() => {
  const video = document.querySelector('.k2-hero--video-first .k2-hero-video');
  const button = document.querySelector('.k2-hero--video-first .k2-video-toggle');
  if (!video || !button) return;
  const figure = video.closest('figure');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const restricted = () => motion.matches || connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);
  const inView = () => { const r = figure.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  let userPaused = false, manualPlay = false, resizeTimer;
  const originalSource = video.getAttribute('src');
  video.muted = video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = restricted() ? 'none' : 'metadata';

  function source() {
    if (!/hero-v7-(desktop|tablet|mobile)\.mp4/.test(originalSource)) return;
    const size = innerWidth < 640 ? 'mobile' : innerWidth < 1100 ? 'tablet' : 'desktop';
    const next = originalSource.replace(/hero-v7-(desktop|tablet|mobile)\.mp4/, 'hero-v7-' + size + '.mp4');
    if (new URL(next, location.href).href !== video.src) video.src = next;
  }
  function label() {
    button.textContent = video.paused ? 'Přehrát video' : 'Pozastavit';
    button.setAttribute('aria-label', video.paused ? 'Přehrát úvodní video bez zvuku' : 'Pozastavit úvodní video');
  }
  function resume() {
    if (userPaused || document.hidden || !inView() || (restricted() && !manualPlay)) return;
    source();
    video.muted = true;
    video.play().catch(label); // Browser autoplay restrictions retain the usable play button.
  }
  video.onplaying = () => { figure.classList.add('is-playing'); label(); };
  video.onpause = label;
  video.onerror = () => { figure.classList.remove('is-playing'); label(); };
  button.onclick = () => {
    if (video.paused) { userPaused = false; manualPlay = true; resume(); }
    else { userPaused = true; video.pause(); }
  };
  source();
  video.autoplay = !restricted();
  if (restricted()) video.pause(); else resume();
  new IntersectionObserver(() => { if (inView()) resume(); else video.pause(); }, {threshold: 0}).observe(figure);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else resume(); });
  window.addEventListener('pageshow', resume);
  motion.addEventListener('change', () => { if (restricted()) { manualPlay = false; video.pause(); } else resume(); });
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { source(); resume(); }, 200); });
  label();
})();
