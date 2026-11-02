/* Prepare certificate pixels before the original CSS hover opens its mask. */
(() => {
  const observed = new WeakSet(), decoded = new WeakSet();
  const prepare = image => {
    if (decoded.has(image)) return;
    decoded.add(image);
    image.loading = 'eager';
    if (typeof image.decode === 'function') image.decode().catch(() => decoded.delete(image));
  };
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.helmet-grid-item-reveal-img').forEach(prepare);
      observer.unobserve(entry.target);
    });
  }, {rootMargin:'1600px 0px'}) : null;
  function init() {
    document.querySelectorAll('[data-helmet-item]').forEach(card => {
      if (observed.has(card)) return;
      observed.add(card);
      card.querySelectorAll('.helmet-grid-item-reveal-img').forEach(image => {image.loading='eager';});
      if (observer) observer.observe(card);
      else card.querySelectorAll('.helmet-grid-item-reveal-img').forEach(prepare);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.addEventListener('page-transition-end', init);
})();
