/* Local, illustrative portfolio interactions. No network calls or command execution. */
(() => {
  const root = document.getElementById('personnels');
  if (!root) return;
  root.querySelectorAll('[data-lab-demo]').forEach(demo => {
    const buttons = [...demo.querySelectorAll('[data-lab-step]')];
    const panels = [...demo.querySelectorAll('[data-lab-panel]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const selected = button.dataset.labStep;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      panels.forEach(panel => { panel.hidden = panel.dataset.labPanel !== selected; });
    }));
  });
  root.querySelectorAll('[data-lab-filter]').forEach(demo => {
    const input = demo.querySelector('textarea');
    const initial = input.value;
    const output = demo.querySelector('[data-filter-output]');
    const stat = demo.querySelector('[data-filter-stat]');
    demo.querySelector('[data-filter-run]').addEventListener('click', () => {
      const raw = input.value;
      const lines = raw.split(/\r?\n/).filter(line => /^\s*\d+\/(?:tcp|udp)\s+open\s+\S+/i.test(line));
      const result = lines.map(line => line.trim().replace(/\s+/g, ' ')).join('\n');
      output.textContent = result || 'Aucun port explicitement ouvert dans cet exemple.';
      if (!raw.trim()) { stat.textContent = 'Ajoute une sortie d’exemple avant de lancer le filtre.'; return; }
      const reduction = Math.max(0, Math.round((1 - result.length / raw.length) * 100));
      stat.textContent = `${lines.length} port${lines.length > 1 ? 's' : ''} ouvert${lines.length > 1 ? 's' : ''} · ${raw.length} → ${result.length} caractères · ${reduction} % de réduction sur cet exemple`;
    });
    demo.querySelector('[data-filter-reset]').addEventListener('click', () => {
      input.value = initial;
      output.textContent = 'Prêt à filtrer l’exemple.';
      stat.textContent = 'Le filtre conserve uniquement les lignes explicitement marquées « open ».';
    });
  });
})();
