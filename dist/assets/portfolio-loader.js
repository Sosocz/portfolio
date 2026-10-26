/* Original Rive state machine: automatic initial reveal, same route transitions. */
(function () {
  'use strict';
  var inputs, instance, readyAt = performance.now(), initial = true, finishing = false;
  var watchdog = setTimeout(hide, 2500), revealTimer, hideTimer;
  function overlay() { return document.querySelector('.transition-w[data-sofiane-loader]'); }
  function reduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function hide() {
    clearTimeout(watchdog);clearTimeout(revealTimer);clearTimeout(hideTimer);
    var element = overlay();
    if (element) { element.style.visibility = 'hidden'; element.style.pointerEvents = 'none'; }
    if (instance) instance.pause();
    initial = false;
    finishing = false;
    if (typeof window.lenisStart === 'function') window.lenisStart();
  }
  function finish() {
    if (finishing) return;
    finishing = true;
    clearTimeout(watchdog);
    revealTimer = setTimeout(function () {
      if (inputs && !reduced()) {
        inputs.initialInput.value = false;
        inputs.transitionOutInput.value = false;
        inputs.transitionInInput.value = true;
        instance.play();
        hideTimer = setTimeout(hide, 550);
      } else hide();
    }, initial && !reduced() ? Math.max(0, 1400 - (performance.now() - readyAt)) : 0);
  }
  window.sofianeLoader = {
    attach: function (rive, stateInputs) {
      instance = rive;
      inputs = stateInputs;
      if (!initial && overlay()?.style.visibility === 'hidden') instance.pause();
    },
    finish: finish,
    beginNavigation: function () {
      clearTimeout(revealTimer);
      clearTimeout(hideTimer);
      initial = false;
      finishing = false;
      if (instance) instance.play();
    }
  };
})();
