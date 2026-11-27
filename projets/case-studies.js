/* Re-read the three documented HSRP test stages. No live network action. */
(() => {
  const stages = [
    'Le routeur principal est actif. Le test nominal relève 4 réponses sur 4.',
    'Une interface du routeur principal est arrêtée. Le secondaire devient actif : 4 paquets sont perdus pendant la transition, sur 107 envoyés.',
    'Le lien est rétabli. La préemption permet au routeur principal de reprendre son rôle ; les réponses ont repris automatiquement.'
  ];
  document.querySelectorAll('[data-case-replay]').forEach(root => {
    const output = root.querySelector('[data-case-output]');
    const controls = [...root.querySelectorAll('[data-case-stage]')];
    controls.forEach(button => button.addEventListener('click', () => {
      controls.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      output.textContent = stages[Number(button.dataset.caseStage)];
    }));
  });
})();
