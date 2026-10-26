/* Original placement and triggers, with sXsx vector ink instead of Lando's Rive art. */
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const starts = [0, .20, .45, .53, .76, .86];
  const spans = [.24, .29, .13, .31, .14, .14];
  const clamp = value => Math.max(0, Math.min(1, value));
  let scrollSignatures = [];
  let scrollTarget = null;
  const ink = new WeakMap();
  let scrollFrame = 0;
  let observer, cleanup = () => {};
  function paint(svg, progress) {
    let state = ink.get(svg);
    if (!state) {
      state = {paths: [...svg.querySelectorAll('[data-sxsx-guide]')], progress: -1};
      ink.set(svg, state);
    }
    // Completed or stationary strokes do not need another DOM write.
    if (state.progress === progress) return;
    state.progress = progress;
    state.paths.forEach((path, i) => {
      const drawn = clamp((progress - starts[i]) / spans[i]);
      path.style.opacity = drawn > 0 ? '1' : '0';
      path.style.strokeDashoffset = String(1 - drawn);
    });
  }
  function updateScroll() {
    scrollFrame = 0;
    if (document.hidden || !scrollSignatures.length) return;
    // Read geometry once, before touching any SVG styles.
    const rect = scrollTarget.getBoundingClientRect();
    const height = window.innerHeight;
    const distance = Math.max(1, rect.height - height * .30);
    const progress = motion.matches ? 1 : clamp((height * .5 - rect.top) / distance);
    scrollSignatures.forEach(svg => paint(svg, progress));
  }
  function scheduleScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  function init() {
    cleanup();
    if(observer) observer.disconnect();
    cancelAnimationFrame(scrollFrame);scrollFrame=0;
    const signatures = [...document.querySelectorAll('[data-sxsx-signature]')];
    if (motion.matches || !('IntersectionObserver' in window)) {
      signatures.forEach(svg => paint(svg, 1));
      return;
    }
    scrollSignatures = signatures.filter(svg => svg.dataset.sxsxSignature === 'scroll');
    scrollTarget = document.querySelector('.hero-rive-tracker') || scrollSignatures[0];
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const svg = entry.target;
        observer.unobserve(svg);
        if (svg.closest('[data-hero-animation-container]')) {
          paint(svg, 1); return;
        }
        const began = performance.now();
        function draw(now) {
          const progress = motion.matches ? 1 : clamp((now - began) / 1500);
          paint(svg, progress);
          if (progress < 1) requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
      });
    }, {rootMargin: '0px 0px -20% 0px', threshold: 0});
    signatures.filter(svg => svg.dataset.sxsxSignature === 'play').forEach(svg => {
      paint(svg, 0); observer.observe(svg);
    });
    window.addEventListener('scroll', scheduleScroll, {passive: true});
    window.addEventListener('resize', scheduleScroll, {passive: true});
    const onMotion = () => {
      if (motion.matches) signatures.forEach(svg => paint(svg, 1));
      else scheduleScroll();
    };
    motion.addEventListener('change', onMotion);
    cleanup = () => {window.removeEventListener('scroll',scheduleScroll);window.removeEventListener('resize',scheduleScroll);motion.removeEventListener('change',onMotion);window.removeEventListener('load',scheduleScroll)};
    updateScroll();
    // Lenis moves through native scroll, and the initial hero's geometry settles after load.
    window.addEventListener('load', scheduleScroll, {once: true});
  }
  window.addEventListener('page-transition-end',init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
