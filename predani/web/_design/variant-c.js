window.k2ApplyVariantC = function () {
  if (document.documentElement.dataset.k2VariantCReady === '1') return;
  document.documentElement.dataset.k2VariantCReady = '1';

  const main = document.querySelector('.page-main');
  if (!main) return;

  // The current image path is the source of truth for a nested public base.
  const existingImage = main.querySelector('img[src*="/wp-content/"]');
  const imagePath = existingImage ? new URL(existingImage.getAttribute('src'), location.href).pathname : '';
  const imageBase = imagePath.includes('/wp-content/') ? imagePath.split('/wp-content/')[0] + '/' : '/';
  const currentWebBase = location.pathname.includes('/web/')
    ? location.pathname.slice(0, location.pathname.indexOf('/web/') + 5)
    : imageBase;
  const base = currentWebBase || imageBase;

  const hero = main.querySelector('.k2-hero');
  if (hero) {
    const copy = hero.querySelector('.k2-hero__copy');
    const photo = hero.querySelector('.k2-hero__photo');
    const heading = copy && copy.querySelector('h1');
    if (heading) heading.textContent = 'Koupelní 2.\nVyberte svůj prostor.';
    const existingLead = copy && copy.querySelector('.k2-lead');
    if (existingLead) existingLead.classList.add('k2-c-lead');
    if (copy && photo && !hero.querySelector('.k2-c-route')) {
      const route = document.createElement('nav');
      route.className = 'k2-c-route';
      route.setAttribute('aria-label', 'Vybrat prostor');
      route.innerHTML = '<span class="k2-c-route__label">Vybrat prostor</span>' +
        '<a href="' + base + 'cenik/">Seznam a cena jednotek <span aria-hidden="true">↗</span></a>' +
        '<a href="' + base + 'pudorysy/">Vybrat podle podlaží <span aria-hidden="true">↗</span></a>';
      photo.insertAdjacentElement('afterend', route);
    }
    const floorIntro = main.querySelector('.k2-floor-intro');
    const floor = main.querySelector('#pudorysy');
    const inside = main.querySelector('.k2-inside');
    if (floorIntro && floor && inside) {
      main.insertBefore(floorIntro, inside);
      main.insertBefore(floor, inside);
    }
  }

  document.querySelectorAll('.k2-page-header').forEach(function (header) {
    header.classList.add('k2-c-page-header');
  });
};
