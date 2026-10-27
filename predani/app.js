(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const gallery = $("#gallery-content");
  const nav = $("#section-nav");
  const viewer = $("#viewer");
  const galleryItems = [];
  let viewerIndex = 0;
  let showingBefore = false;
  let opener = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  }

  function localUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const path = value.trim();
    if (/^https:\/\/github\.com\/frantisekdron\/koupelni2-navrh\/releases\/download\//.test(path)) return path;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return "";
    try {
      const url = new URL(path, document.baseURI);
      if (url.origin !== location.origin || !["http:", "https:", "file:"].includes(url.protocol)) return "";
      return url.href;
    } catch {
      return "";
    }
  }

  function beforeMedia(item) {
    if (typeof item.before === "string") return { src: localUrl(item.before), thumb: localUrl(item.before), download: localUrl(item.before) };
    if (item.before && typeof item.before === "object") {
      return {
        src: localUrl(item.before.src || item.before.thumb),
        thumb: localUrl(item.before.thumb || item.before.src),
        download: localUrl(item.before.download || item.before.src),
      };
    }
    return null;
  }

  function kindLabel(value) {
    const kind = String(value || "").toLowerCase();
    if (/viz|visual|render/.test(kind)) return "Vizualizace";
    if (/mont|composit/.test(kind)) return "Fotomontáž";
    if (/retu|retouch|uprav|correct|edit/.test(kind)) return "Upravená fotografie";
    if (/foto|photo|real|skute/.test(kind)) return "Skutečná fotografie";
    if (/poi|map|okol/.test(kind)) return "Orientační grafika";
    return value ? String(value) : "Obrazový podklad";
  }

  function imageFile(url) {
    try { return /\.(?:jpe?g|png|webp|avif|gif)$/i.test(new URL(url).pathname); }
    catch { return false; }
  }

  function countLabel(count) {
    return `${count} ${count === 1 ? "snímek" : count >= 2 && count <= 4 ? "snímky" : "snímků"}`;
  }

  function downloadLink(url, label, className) {
    const link = element("a", className, label);
    link.href = url;
    link.setAttribute("download", "");
    return link;
  }

  function mediaCard(item, sectionTitle) {
    const title = String(item.title || "Snímek");
    const src = localUrl(item.src || item.thumb);
    const thumb = localUrl(item.thumb || item.src);
    const download = localUrl(item.download || item.src || item.thumb);
    const before = beforeMedia(item);
    const card = element("article", "media-card");
    const visual = src && imageFile(src);
    const open = visual ? element("button", "media-open") : element("div", "media-open");
    if (visual) {
      open.type = "button";
      open.setAttribute("aria-label", `Otevřít snímek: ${title}`);
    }
    if (thumb) {
      const image = element("img");
      image.src = thumb;
      image.alt = title;
      image.loading = "lazy";
      image.decoding = "async";
      open.append(image);
    } else {
      open.append(element("span", "media-placeholder", "Náhled není k dispozici"));
    }
    card.append(open);

    const body = element("div", "media-card-body");
    body.append(element("p", "kind", kindLabel(item.kind)));
    body.append(element("h4", "", title));
    if (Number(item.width) > 0 && Number(item.height) > 0) {
      body.append(element("div", "media-card-meta", `${item.width} × ${item.height} px`));
    }
    const actions = element("div", "media-card-actions");
    if (download) {
      const link = downloadLink(download, "Stáhnout ↓");
      link.setAttribute("aria-label", `Stáhnout: ${title}`);
      actions.append(link);
    }
    if (visual && before?.src) {
      const toggle = element("button", "", "Před úpravou");
      toggle.type = "button";
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", `Zobrazit původní snímek: ${title}`);
      toggle.addEventListener("click", () => {
        const pressed = toggle.getAttribute("aria-pressed") === "true";
        toggle.setAttribute("aria-pressed", String(!pressed));
        toggle.textContent = pressed ? "Před úpravou" : "Po úpravě";
        toggle.setAttribute("aria-label", `${pressed ? "Zobrazit původní" : "Zobrazit upravený"} snímek: ${title}`);
        const image = open.querySelector("img");
        if (image) image.src = pressed ? thumb : before.thumb || before.src;
      });
      actions.append(toggle);
    }
    if (actions.children.length) body.append(actions);
    card.append(body);

    if (visual) {
      const index = galleryItems.length;
      galleryItems.push({ title, src, thumb, download: download || src, before, kind: kindLabel(item.kind), sectionTitle });
      open.addEventListener("click", () => openViewer(index, open));
    }
    return card;
  }

  function renderSections(sections) {
    gallery.replaceChildren();
    nav.replaceChildren();
    galleryItems.length = 0;
    const usedIds = new Set();
    let total = 0;
    let actual = 0;
    for (const [index, section] of sections.entries()) {
      const items = Array.isArray(section.items) ? section.items.filter((item) => item && typeof item === "object") : [];
      if (!items.length) continue;
      const title = String(section.title || `Kategorie ${index + 1}`);
      let id = String(section.id || title).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "") || `kategorie-${index + 1}`;
      while (usedIds.has(id)) id += `-${index + 1}`;
      usedIds.add(id);

      const block = element("section", "gallery-section");
      block.id = id;
      block.setAttribute("aria-labelledby", `${id}-title`);
      const head = element("div", "category-head");
      const heading = element("div");
      const h = element("h3", "", title);
      h.id = `${id}-title`;
      heading.append(h);
      if (section.description) heading.append(element("p", "", section.description));
      head.append(heading, element("span", "category-count", countLabel(items.length)));
      block.append(head);
      const grid = element("div", "media-grid");
      for (const item of items) {
        grid.append(mediaCard(item, title));
        if (kindLabel(item.kind) === "Skutečná fotografie") actual++;
      }
      block.append(grid);
      gallery.append(block);
      const navLink = element("a", "", title);
      navLink.href = `#${id}`;
      nav.append(navLink);
      total += items.length;
    }
    nav.hidden = nav.children.length === 0;
    if (!total) gallery.append(element("p", "error-state", "V přehledu zatím nejsou snímky. Zkuste stránku znovu načíst."));
    const sectionCount = nav.children.length;
    const photoCount = actual === 1 ? "1 skutečná fotografie" : actual >= 2 && actual <= 4 ? `${actual} skutečné fotografie` : `${actual} skutečných fotografií`;
    $("#overview-count").textContent = actual
      ? `${photoCount} · ${sectionCount} ${sectionCount === 1 ? "kategorie" : sectionCount >= 2 && sectionCount <= 4 ? "kategorie" : "kategorií"}`
      : `${total} ${total === 1 ? "položka" : total >= 2 && total <= 4 ? "položky" : "položek"} · ${sectionCount} ${sectionCount === 1 ? "kategorie" : sectionCount >= 2 && sectionCount <= 4 ? "kategorie" : "kategorií"}`;

    const hero = galleryItems.find((item) => item.src.includes("DJI_0076_bez_ptaku")) || galleryItems.find((item) => item.kind === "Skutečná fotografie") || galleryItems[0];
    if (hero) {
      $("#hero-image").src = hero.src;
      $("#hero-image").alt = hero.title;
      $("#hero-caption").textContent = `${hero.kind} · ${hero.title}`;
      $("#hero-figure").hidden = false;
    }
  }

  function renderDownloads(downloads) {
    const list = $("#download-list");
    list.replaceChildren();
    let count = 0;
    for (const item of downloads) {
      const href = localUrl(item?.href);
      if (!href) continue;
      const row = element("div", "download-row");
      const copy = element("div");
      copy.append(element("h3", "", item.title || "Soubor"));
      if (item.detail) copy.append(element("p", "", item.detail));
      const link = downloadLink(href, "Stáhnout ↓");
      link.setAttribute("aria-label", `Stáhnout: ${item.title || "soubor"}`);
      row.append(copy, link);
      list.append(row);
      count++;
    }
    if (!count) list.append(element("p", "loading-state", "Soubory ke stažení zde zatím nejsou uvedené."));
  }

  function renderVideo(video) {
    const src = localUrl(video?.src);
    if (!src) return;
    const player = $("#project-video");
    player.src = src;
    const poster = localUrl(video.poster);
    if (poster) player.poster = poster;
    const download = localUrl(video.download || video.src);
    $("#video-download").href = download || src;
    $("#film").hidden = false;
    $("#nav-film").hidden = false;
  }

  function renderSitePreview(path) {
    const href = localUrl(path);
    if (!href) return;
    const link = $("#site-preview-link");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener";
    $("#web").hidden = false;
    $("#nav-web").hidden = false;
  }

  function updateViewer() {
    const item = galleryItems[viewerIndex];
    if (!item) return;
    const before = showingBefore && item.before?.src;
    $("#viewer-image").src = before ? item.before.src : item.src;
    $("#viewer-image").alt = `${item.title}${before ? " — původní snímek" : ""}`;
    $("#viewer-title").textContent = item.title;
    $("#viewer-kind").textContent = `${item.sectionTitle} · ${before ? "Původní snímek" : item.kind}`;
    $("#viewer-count").textContent = `${viewerIndex + 1} / ${galleryItems.length}`;
    $("#viewer-download").href = item.download;
    const beforeDownload = $("#viewer-before-download");
    beforeDownload.hidden = !item.before?.src;
    if (item.before?.src) beforeDownload.href = item.before.download || item.before.src;
    const toggle = $("#viewer-compare");
    toggle.hidden = !item.before?.src;
    toggle.setAttribute("aria-pressed", String(Boolean(before)));
    toggle.textContent = before ? "Ukázat upravený snímek" : "Ukázat původní snímek";
  }

  function openViewer(index, trigger) {
    viewerIndex = index;
    showingBefore = false;
    opener = trigger;
    updateViewer();
    if (!viewer.open) viewer.showModal();
    $("#viewer-close").focus();
  }

  function stepViewer(delta) {
    if (!galleryItems.length) return;
    viewerIndex = (viewerIndex + delta + galleryItems.length) % galleryItems.length;
    showingBefore = false;
    updateViewer();
  }

  $("#viewer-close").addEventListener("click", () => viewer.close());
  $("#viewer-prev").addEventListener("click", () => stepViewer(-1));
  $("#viewer-next").addEventListener("click", () => stepViewer(1));
  $("#viewer-compare").addEventListener("click", () => {
    showingBefore = !showingBefore;
    updateViewer();
  });
  viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener("close", () => { if (opener?.isConnected) opener.focus(); });
  document.addEventListener("keydown", (event) => {
    if (!viewer.open) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); stepViewer(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); stepViewer(1); }
  });

  async function start() {
    try {
      const inline = $("#handoff-data")?.textContent.trim();
      let data;
      if (inline) {
        data = JSON.parse(inline);
      } else {
        const response = await fetch("./data.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
      }
      if (!data || !Array.isArray(data.sections)) throw new Error("Chybí seznam kategorií");
      renderSections(data.sections);
      renderDownloads(Array.isArray(data.downloads) ? data.downloads : []);
      renderVideo(data.video);
      renderSitePreview(data.sitePreview);
    } catch {
      $("#overview-count").textContent = "Přehled podkladů se nepodařilo načíst.";
      gallery.replaceChildren(element("p", "error-state", "Galerii se nepodařilo načíst. Obnovte stránku nebo ověřte, že je soubor data.json ve stejné složce."));
      $("#download-list").replaceChildren(element("p", "error-state", "Seznam souborů není dostupný."));
    }
  }

  start();
})();
