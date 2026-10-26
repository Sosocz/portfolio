# Startup reliability

Original scene classes, timing, model geometry and textures preserved. Runtime and font dependencies are now same-origin (desktop WebP and mobile KTX2, HDR, GLTF, Draco/Basis, Webflow/jQuery and Mona/Brier). See startup-dependencies.json for source provenance and checksums.

All four animated entry routes share the corrected runtime; projects remains its existing standalone page. Asset promises now settle on errors, retry once with a bounded timeout and assign data before readiness. Mobile compressed textures retry as WebP if decoding fails. The personal bust is included in critical readiness. Startup no longer waits for unrelated images/window.load. Rive preloading settles once per file; a watchdog prevents permanent stalls. Lenis initializes before page animations. Route changes rebind and clean up handwritten signatures. Renderer clears targets before drawing and skips inactive scenes, and reads input before rendering. Versioned URLs prevent stale runtime/CSS combinations.

Checks: node tools/check-startup.cjs and node tools/check-runtime-performance.cjs. Browser: initial home and direct Labo route startup; no application errors. Native GPU rendering could not be verified because cloud Chrome reports WebGL2 unavailable. No performance percentage or GPU framerate claim is made.

## Non-blocking startup

The page no longer waits for GLTF, textures, decoder workers or Rive preloads. Rive subscriptions attach animations as files arrive. Native scenes initialize asynchronously after graphics readiness; generation tokens cancel obsolete world mounts when users navigate during download. A font-only layout wait is capped at 600ms. The SG overlay has an unconditional 2.5s escape after its script starts, rather than the former 32s watchdog. Slow WASM arrival no longer resets its minimum display time. Identical texture aliases share one fetch/decode promise. Native model geometry and original effect timing are unchanged. Tests simulate permanently pending graphics/Rive, navigation during loading and overlay escape. This bounds the overlay only, not network transfer or 3D readiness.
