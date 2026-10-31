/* Restore each history entry after the template finishes rebuilding its page. */
(() => {
  const field = '__sofianeEntry', storageKey = 'sofiane-scroll-history-v1';
  const positions = new Map();
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) saved.slice(-80).forEach(([id, point]) => {
      if (typeof id === 'string' && Number.isFinite(point?.y) && point.y >= 0) positions.set(id, point);
    });
  } catch (_) { /* History still works when browser storage is unavailable. */ }
  const push = history.pushState.bind(history), replace = history.replaceState.bind(history);
  const newId = () => crypto.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  const stateWithId = (state, id) => ({...(state && typeof state === 'object' ? state : {}), [field]:id});
  let currentId = history.state?.[field] || newId();
  let currentRoute = location.pathname + location.search;
  let suspended = false, pending = null, frame = 0, timer = 0;
  replace(stateWithId(history.state, currentId), '', location.href);
  history.scrollRestoration = 'manual';
  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify([...positions].slice(-80))); } catch (_) {}
  }
  function remember() {
    if (suspended) return;
    positions.delete(currentId);
    positions.set(currentId, {y:Math.max(0, window.scrollY), x:Math.max(0, window.scrollX)});
    while (positions.size > 80) positions.delete(positions.keys().next().value);
    persist();
  }
  function stopRestore() {
    cancelAnimationFrame(frame); frame = 0; pending = null;
  }
  function restore(point) {
    stopRestore();
    const id = currentId;
    // Refresh the existing scroll controller, including its pinned sections.
    window.lenis?.resize();
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (id !== currentId || suspended) return;
        const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        const y = Math.min(Math.max(0, point.y), max);
        if (window.lenis?.scrollTo) window.lenis.scrollTo(y, {immediate:true, force:true});
        else window.scrollTo({top:y, left:point.x || 0, behavior:'instant'});
        remember();
      });
    });
  }
  history.pushState = function(state, title, url) {
    remember();
    const id = newId();
    const result = push(stateWithId(state, id), title, url);
    stopRestore(); currentId = id;
    currentRoute = location.pathname + location.search;
    return result;
  };
  history.replaceState = function(state, title, url) {
    return replace(stateWithId(state, currentId), title, url);
  };
  window.addEventListener('popstate', event => {
    const previousRoute = currentRoute;
    // Fragment scrolling may start before popstate. The capture-phase click
    // already saved the departure point; do not overwrite it mid-scroll.
    if (previousRoute !== location.pathname + location.search) remember();
    stopRestore();
    currentId = event.state?.[field] || newId();
    currentRoute = location.pathname + location.search;
    if (!event.state?.[field]) replace(stateWithId(event.state, currentId), '', location.href);
    pending = positions.get(currentId) || {x:0, y:0};
    // A native fragment navigation has no recorded entry yet. Honour its
    // destination instead of treating it as a request to return to the top.
    if (previousRoute === currentRoute && !positions.has(currentId) && location.hash) {
      let target = null;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (_) {}
      if (target) {
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        pending = {x:0, y:Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin)};
      }
    }
    suspended = true;
    if (previousRoute === currentRoute) {
      suspended = false; restore(pending);
    }
  });
  window.addEventListener('page-transition-start', () => {
    remember(); suspended = true;
  });
  window.addEventListener('page-transition-end', () => {
    const point = pending || {x:0, y:0};
    suspended = false; currentRoute = location.pathname + location.search;
    restore(point);
  });
  window.addEventListener('scroll', () => {
    if (suspended || frame) return;
    clearTimeout(timer); timer = setTimeout(remember, 150);
  }, {passive:true});
  // Capture full-document links too (Projects deliberately bypasses Taxi).
  document.addEventListener('click', event => {
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const link = event.target.closest?.('a[href]');
      if (link && !link.download && (!link.target || link.target === '_self')) remember();
    }
  }, {capture:true});
  window.addEventListener('pagehide', remember);
  document.addEventListener('visibilitychange', () => { if (document.hidden) remember(); });
  // Restoring must yield immediately to an intentional user scroll.
  ['wheel', 'touchstart', 'pointerdown'].forEach(type => window.addEventListener(type, stopRestore, {passive:true}));
  window.addEventListener('keydown', event => {
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) stopRestore();
  });
  const initialPoint = positions.get(currentId);
  if (initialPoint) {
    const ready = () => {
      if (!window.lenis && document.querySelector('script[src^="/portfolio-runtime.js"]')) return false;
      restore(initialPoint); return true;
    };
    if (!ready()) {
      const observer = new MutationObserver(() => { if (ready()) observer.disconnect(); });
      observer.observe(document.documentElement, {attributes:true, attributeFilter:['class']});
      window.addEventListener('pagehide', () => observer.disconnect(), {once:true});
    }
  }
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      suspended = false;
      const point = positions.get(currentId);
      if (point) restore(point);
    }
  });
})();
