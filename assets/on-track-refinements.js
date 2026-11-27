/* Keep native calendar, GSAP reveal and scroll interactions as owners. */
(() => {
  const connected = new WeakSet();
  function init() {
    const page = document.querySelector('.on-track');
    if (!page || connected.has(page)) return;
    connected.add(page);
    const rows = [...page.querySelectorAll('[data-cal-item][data-htb-machine-id]')];
    const hover = page.querySelector('.on-track-machine-preview');
    const hoverLabel = page.querySelector('[data-machine-hover-label]');
    const main = page.querySelector('.on-track-machine-main');
    const caption = page.querySelector('[data-machine-caption]');
    const name = page.querySelector('[data-cal-target="circuit-name"]');
    const machines = rows.map(row => ({row, image: row.querySelector('img[data-cal-list="circuit-flag"]')})).filter(item => item.image);
    let selectedIndex = Math.max(0, machines.findIndex(item => item.image.alt.toLowerCase() === name?.textContent.trim().toLowerCase()));
    function selectMachine(item) {
      selectedIndex = machines.indexOf(item);
      const cells = [...item.row.children].filter(el => el.classList.contains('f1-highlight-grid-item'));
      const text = i => cells[i]?.querySelector('.text-on-t-stat-label-major')?.textContent.trim() || '';
      const week = text(0), os = text(2), difficulty = text(3);
      const flags = (cells[4]?.querySelector('.text-on-t-stat-label-reg')?.textContent || '— / —').split('/').map(value => value.trim());
      const status = flag => flag === '☑' ? 'validé' : flag === '☐' ? 'non validé' : 'non renseigné au 23.10.2026';
      const fields = {
        'date-from-to-num':week, 'date-from-to-month':'SEMAINE',
        'circuit-lap-length':flags[0], 'first-competed-date':difficulty,
        'circuit-distance':flags[1], 'circuit-lap-amount':'12',
        'circuit-name':item.image.alt,
        'circuit-about':`${item.image.alt} · ${os} · ${difficulty}. Mon flag user : ${status(flags[0])}. Mon flag root : ${status(flags[1])}.`,
        'prac1-date':'HTB', 'prac1-time':'LABS', 'prac2-date':os, 'prac2-time':'OS',
        'prac3-date':difficulty, 'prac3-time':'NIVEAU',
        'qual-date':flags.includes('—') ? 'Non renseignée au relevé' : 'Publiée', 'qual-time':'MACHINE',
        'race-date':'12', 'race-time':'AERO'
      };
      Object.entries(fields).forEach(([key,value]) => page.querySelectorAll(`[data-cal-target="${key}"]`).forEach(el => { el.textContent = value; }));
      page.querySelectorAll('[data-cal-target="circuit-flag"]').forEach(el => {
        const img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (img) { img.src = item.image.getAttribute('src'); img.alt = item.image.alt; }
      });
      syncMain();
    }
    function showPreview(item) {
      if (!hover) return;
      hover.src = item.image.getAttribute('src');
      hover.alt = 'Aperçu de la machine ' + item.image.alt;
      if (hoverLabel) hoverLabel.textContent = item.image.alt + ' · HTB';
    }
    function syncMain() {
      const selected = name?.textContent.trim().toLowerCase();
      const item = machines.find(item => item.image.alt.toLowerCase() === selected);
      if (!item || !main) return;
      const src = item.image.getAttribute('src');
      if (main.getAttribute('src') !== src) main.src = src;
      main.alt = 'Machine HTB ' + item.image.alt;
      if (caption) caption.textContent = item.image.alt + ' · HACK THE BOX';
    }
    machines.forEach(item => {
      item.row.addEventListener('pointerenter', () => showPreview(item));
      item.row.addEventListener('click', () => selectMachine(item));
      item.row.addEventListener('focusin', () => showPreview(item));
    });
    page.querySelectorAll('[data-cal-control]').forEach(control => {
      const direction = control.getAttribute('data-cal-control') === 'next-item' ? 1 : control.getAttribute('data-cal-control') === 'previous-item' ? -1 : 0;
      if (!direction) return;
      control.addEventListener('click', event => {
        event.preventDefault(); event.stopImmediatePropagation();
        const next = (selectedIndex + direction + machines.length) % machines.length;
        machines[next]?.row.click();
      }, true);
    });
    syncMain();
    if (name) {
      const observer = new MutationObserver(() => {
        if (!page.isConnected) { observer.disconnect(); return; }
        syncMain();
      });
      observer.observe(name, {subtree:true, childList:true, characterData:true});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.addEventListener('page-transition-end', init);
})();
