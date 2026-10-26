// Exercise the real controller code with deterministic browser/ticker substitutes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../dist/portfolio-runtime.js'), 'utf8');
const slice = (start, end) => code.slice(code.indexOf(start), code.indexOf(end, code.indexOf(start)));
const listeners = new Map(), ticks = new Set(), frames = new Map();
let frameId = 0, refreshes = 0, updates = 0;
const window = {
  innerWidth: 1280, innerHeight: 800, devicePixelRatio: 2,
  addEventListener(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); },
  removeEventListener(name, callback) { listeners.get(name)?.delete(callback); }
};
const document = { documentElement: {}, body: {}, hidden: false };
const runFrames = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(100)); };
const emitResize = () => listeners.get('resize')?.forEach(callback => callback());
class Lenis {
  constructor(options) { this.options = options; this.events = new Map(); this.scroll = 0; this.isStopped = false; this.progress = 0; this.velocity = 0; this.rafCalls = 0; this.resizeCalls = 0; }
  on(name, callback) { this.events.set(name, callback); }
  off(name, callback) { if (this.events.get(name) === callback) this.events.delete(name); }
  raf(time) { this.rafCalls++; this.lastTime = time; }
  resize() { this.resizeCalls++; }
  scrollTo(value) { this.scroll = value; }
  stop() { this.isStopped = true; }
  start() { this.isStopped = false; }
  destroy() { this.destroyed = true; }
}
class Emitter { trigger() { this.resizeEvents = (this.resizeEvents || 0) + 1; } }
const context = vm.createContext({ window, document, u$: Lenis, PJ: Emitter,
  TA: { update() { updates++; }, refresh() { refreshes++; } },
  m: { ticker: { add(callback) { ticks.add(callback); }, remove(callback) { ticks.delete(callback); }, lagSmoothing() {} } },
  requestAnimationFrame(callback) { const id = ++frameId; frames.set(id, callback); return id; },
  cancelAnimationFrame(id) { frames.delete(id); }
});
vm.runInContext(slice('function queuePortfolioRefresh()', '// Preserve Rive state'), context);
vm.runInContext(slice('class QV {', 'var d$,p_;') + ';globalThis.Controller = QV;', context);
const controller = new context.Controller();
assert.equal(ticks.size, 1);
assert.equal(controller.lenis.options.lerp, 0.1);
assert.equal(controller.lenis.options.touchMultiplier, 1);
assert.equal(controller.lenis.options.syncTouch, false);
controller.lenis.resize();
assert.equal(controller.lenis.resizeCalls, 1, 'resize invokes the native method once, without recursion');
controller.lenis.scroll = 345;
controller.stop();
for (let i = 0; i < 40; i++) {
  const old = controller.lenis;
  window.innerWidth = i % 2 ? 1280 : 700;
  emitResize();
  assert(old.destroyed);
  assert.equal(old.events.size, 0);
  assert.equal(ticks.size, 1, 'breakpoint changes must not add ticker callbacks');
  assert.equal(controller.lenis.scroll, 345, 'scroll position survives recreation');
  assert.equal(controller.lenis.isStopped, true, 'menu/loader scroll lock survives recreation');
}
assert.equal(frames.size, 1, 'repeated layout refreshes share one animation frame');
runFrames();
assert.equal(refreshes, 1);
[...ticks][0](2);
assert.equal(controller.lenis.rafCalls, 1);
assert.equal(controller.lenis.lastTime, 2000);
document.hidden = true;
[...ticks][0](3);
assert.equal(controller.lenis.rafCalls, 1, 'hidden tabs do not run scroll work');
document.hidden = false;
controller.destroy();
assert.equal(ticks.size, 0);
assert.equal(listeners.get('resize').size, 0);

vm.runInContext('globalThis.Sizes = ' + slice('o9=class o9', '}}});function Kj').replace(/^o9=/, '') + '}};', context);
const sizes = new context.Sizes();
window.innerWidth = 1000;
for (let i = 0; i < 100; i++) emitResize();
assert.equal(frames.size, 1, 'a resize burst schedules one GPU resize');
runFrames();
assert.equal(sizes.resizeEvents, 1);
emitResize(); runFrames();
assert.equal(sizes.resizeEvents, 1, 'unchanged dimensions do not reallocate GPU buffers');
assert.equal(sizes.pixelRatio, 1.25, 'render quality is preserved');

vm.runInContext(slice('function lR()', 'function IH(') + ';globalThis.resizeRive = lR;', context);
let riveResizes = 0;
context.UI = [{ resizeDrawingSurfaceToCanvas() { riveResizes++; } }];
for (let i = 0; i < 100; i++) context.resizeRive();
assert.equal(frames.size, 1);
runFrames();
assert.equal(riveResizes, 1);

// The visual clock advances with the renderer, rather than an additional RAF loop.
assert(!slice('s9=class s9', 'var o9;').includes('requestAnimationFrame'));
assert(code.includes('if(this.isLoaded&&!document.hidden){this.time.tick();'));
assert(code.includes('else if(A.has(C))A.get(C).pause()'));

// The hover follows the latest pointer position once per frame, with its
// original easing/duration and no competing tweens for the same properties.
const documentEvents = new Map();
const hover = { querySelector() { return {}; } };
const row = {
  hasAttribute() { return false; },
  querySelector() { return hover; }, querySelectorAll() { return []; },
  addEventListener() {}, getBoundingClientRect() { return { left: 0, top: 0, right: 200, bottom: 200 }; }
};
const chain = { to() { return this; }, timeScale() { return this; }, play() { return this; }, reverse() { return this; } };
document.querySelectorAll = () => [row];
document.addEventListener = (name, callback) => documentEvents.set(name, callback);
document.removeEventListener = (name, callback) => { if (documentEvents.get(name) === callback) documentEvents.delete(name); };
context.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(target) { this.callback([{ target, isIntersecting: true }]); }
  disconnect() {}
};
let pointerTweens = [];
context.m.set = () => {};
context.m.timeline = () => chain;
context.m.to = (target, options) => pointerTweens.push(options);
vm.runInContext(slice('function T$()', 'function V_(') + ';globalThis.initHover = T$;', context);
const cleanupHover = context.initHover();
for (let i = 0; i < 100; i++) documentEvents.get('mousemove')({ clientX: i, clientY: 50 });
assert.equal(frames.size, 1);
runFrames();
assert.equal(pointerTweens.length, 1);
assert.equal(pointerTweens[0].x, 119);
assert.equal(pointerTweens[0].duration, 0.5);
assert.equal(pointerTweens[0].ease, 'power2.out');
assert.equal(pointerTweens[0].overwrite, 'auto');
cleanupHover();
assert.equal(documentEvents.size, 0);

// Report cards stay entirely within the viewport at all four pointer corners.
row.hasAttribute = name => name === 'data-resolution-list';
for (const [width, height, cardWidth, cardHeight] of [[1280, 900, 620, 413], [390, 844, 358, 239]]) {
  context.innerWidth = width; context.innerHeight = height;
  row.getBoundingClientRect = () => ({ left: 0, top: 0, right: width, bottom: height });
  hover.getBoundingClientRect = () => ({ width: cardWidth, height: cardHeight });
  const cleanupNotes = context.initHover();
  for (const [clientX, clientY] of [[1, 1], [width - 1, 1], [1, height - 1], [width - 1, height - 1]]) {
    pointerTweens = [];
    documentEvents.get('mousemove')({ clientX, clientY }); runFrames();
    const point = pointerTweens.at(-1);
    assert(point.x >= 16 && point.x + cardWidth <= width - 16, 'note card fits horizontally');
    assert(point.y >= 82 && point.y + cardHeight <= height - 16, 'note card fits vertically below navigation');
    assert.equal(point.duration, 0.5, 'native follow easing is retained');
  }
  cleanupNotes();
}


// A marquee keeps the same tween and speed as it leaves/reenters the viewport.
let observer, marqueeTweens = [];
context.IntersectionObserver = class {
  constructor(callback) { observer = callback; }
  observe() {}
};
const collection = { offsetWidth: 1000 }, track = { style: {} };
const marquee = {
  closest() { return null; },
  dataset: { marqueeSpeed: '30', marqueeDirection: 'left', marqueeDuplicate: '0', marqueeScrollSpeed: '5' },
  querySelector(selector) { return selector.includes('collection') ? collection : track; },
  querySelectorAll() { return [collection]; }, setAttribute() {}
};
document.querySelectorAll = () => [marquee];
context.TA.create = () => {};
context.m.timeline = () => ({ fromTo() {} });
context.m.to = (target, options) => {
  const tween = { options, paused: false, totalProgress() { return this; }, timeScale() { return this; }, play() { return this; }, resume() { this.paused = false; }, pause() { this.paused = true; } };
  marqueeTweens.push(tween); return tween;
};
vm.runInContext(slice('function O$()', 'function LL(') + ';globalThis.initMarquee = O$;', context);
context.initMarquee();
observer([{ target: marquee, isIntersecting: true }]);
assert.equal(marqueeTweens.length, 1);
observer([{ target: marquee, isIntersecting: false }]);
assert.equal(marqueeTweens[0].paused, true);
observer([{ target: marquee, isIntersecting: true }]);
assert.equal(marqueeTweens.length, 1);
assert.equal(marqueeTweens[0].paused, false);
assert.equal(marqueeTweens[0].options.repeat, -1);
console.log('PASS: one scroll ticker after 40 breakpoint changes; no resize recursion; 100 resize/pointer events coalesce to one update; offscreen marquees pause and resume; rendering quality and interaction settings preserved.');

// Real Rive playback requests stay paused offscreen and retain state/arguments.
let riveObserver, visibility;
const riveRecords = [], riveUI = [];
context.UI = riveUI;
context.document.addEventListener = (name, cb) => { if (name === 'visibilitychange') visibility = cb; };
context.IntersectionObserver = class {
  constructor(cb) { riveObserver = cb; }
  observe() {} unobserve() {}
};
vm.runInContext(slice('function registerPortfolioRive(', 'function lR()') + ';globalThis.registerRive = registerPortfolioRive;', context);
const canvas = {};
const rive = { isPlaying: true, plays: 0, pauses: 0, cleaned: false,
  play(...args) { this.isPlaying = true; this.plays++; this.lastArgs = args; },
  pause() { this.isPlaying = false; this.pauses++; }, cleanup() { this.cleaned = true; } };
context.registerRive(rive, canvas);
assert.equal(riveUI.length, 1);
const visible = value => riveObserver([{ target: canvas, isIntersecting: value }]);
visible(false);
assert.equal(rive.isPlaying, false);
assert.equal(rive.pauses, 1);
rive.play('hover', true);
assert.equal(rive.plays, 0, 'offscreen playback requests do not start rendering');
visible(true);
assert.equal(rive.plays, 1);
assert.deepEqual(rive.lastArgs, ['hover', true]);
document.hidden = true; visibility();
assert.equal(rive.isPlaying, false);
document.hidden = false; visibility();
assert.equal(rive.plays, 2);
visible(false); rive.pause(); visible(true);
assert.equal(rive.plays, 2, 'explicit pauses must not resume on reentry');
rive.play(); rive.isPlaying = false; // completed, rather than suspended
visible(false); visible(true);
assert.equal(rive.plays, 3, 'completed one-shot animations must not restart');
rive.cleanup();
assert.equal(rive.cleaned, true);
assert.equal(context.registerRive.records.size, 0);
console.log('PASS: Rive pauses offscreen/hidden; exact play arguments resume; explicit pauses and completed animations stay stopped; cleanup releases observer records.');
