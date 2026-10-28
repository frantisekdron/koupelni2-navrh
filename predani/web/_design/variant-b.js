(function () {
  "use strict";

  window.k2ApplyVariantB = function () {
    document.documentElement.dataset.k2Variant = "b";
    const hero = document.querySelector("body.home .k2-hero");
    if (!hero || hero.dataset.k2bReady === "true") return;
    hero.dataset.k2bReady = "true";

    const heading = hero.querySelector("h1");
    const lead = hero.querySelector(".k2-lead");
    const note = hero.querySelector(".k2-intro-note");
    const eyebrow = hero.querySelector(".k2-eyebrow");
    const house = hero.querySelector(".k2-hero__photo img");
    if (heading) heading.textContent = "Hodonín, Koupelní 2.";
    if (eyebrow) eyebrow.textContent = "Město a domov · současná podoba domu";
    if (lead) lead.textContent = "Dokončená revitalizace fasády. Dům i Hodonín ve skutečných fotografiích.";
    if (note) note.textContent = "První etapa je zkolaudovaná: 19 ubytovacích jednotek a veškeré společné části domu.";

    if (house?.src) {
      const city = document.createElement("figure");
      city.className = "k2b-city";
      const image = document.createElement("img");
      image.src = new URL("DJI_20261016114011_0151_D-HDR.jpg", house.src).href;
      image.alt = "Centrum Hodonína z výšky — skutečná fotografie";
      image.loading = "eager";
      image.decoding = "async";
      const caption = document.createElement("figcaption");
      caption.textContent = "Hodonín · skutečná fotografie";
      city.append(image, caption);
      hero.append(city);
    }
  };
})();
