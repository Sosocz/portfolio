# Opening room

Source: owner upload `chambre-sxsx-animee.blend` (kept in the original upload, not duplicated in the site repository).
SHA256: `08c2097a6f65eed5375734b8ce968dbf9cc1520b2589c1cd7b9c9b79a4e44f8c`.

Exported with official Blender 5.0.1. The file reports Blender 5.2; Blender opened it with a newer-version warning. Inspect the original with that version before future edits that depend on newer features.

From the checkout, run:

```sh
blender -b -t 6 --python tools/inspect-room.py -- /absolute/path/chambre-sxsx-animee.blend
blender -b -t 6 --python tools/export-room.py -- /absolute/path/chambre-sxsx-animee.blend
node tools/optimize-room.cjs
```

Export keeps the authored UVs, materials, camera orientation and nine object animation clips. Decorative high-poly meshes are decimated and textures preserved up to 4096px. Draco geometry and WebP textures keep full-resolution detail with high-quality (98) WebP encoding. Blender shader/material animation is not exported; object animations are retained.

`dist/lando-custom.js`, class O9, loads the room using the existing native Three loader. It plays the exported tracks, fits the room to the existing hero camera, adds subtle eased pointer rotation, and keeps the native scroll/cursor compositing. The previous bust and helmet meshes are hidden. Motion respects reduced-motion preferences and pauses with the original scene visibility lifecycle.

Retina rendering uses up to 2× resolution and four-sample MSAA, with a six-million-pixel budget. Other scenes retain the existing resolution.

The transparent 2400px / 64-sample Blender render is shown while loading and when WebGL2 is unavailable. No opaque rectangle is used. CSS and loader handling are included on all main routes for client-side navigation.

## Muted palette

`tools/recolor-room.py` derives UV masks from the original mesh geometry, then calls `tools/apply-room-palette.py` with host Python (Pillow, NumPy and SciPy). It recolors only the original atlas images before export: muted sage mint (base #526E62), off-white drawer cabinet, dusty rose rug (#A8808C), with the existing WELCOME lettering darkened for contrast. Baked illumination, UVs, geometry, Kirby, wooden surfaces and animation clips are retained. Generated intermediate atlases remain temporary. Set `ROOM_PALETTE_PYTHON` if host Python is not named `python`.

Walls only: a separate geometry-based UV mask applies the site accent #38E4B2 to the two architectural wall panels, retaining baked shading. All other colors remain in the muted palette described above.

## Interaction and runtime performance

`dist/assets/room-hero.js` binds to the existing native O9 scene via `sxsx-room-ready`. It uses the bundled Three Ray and mesh raycast methods, with cached candidate meshes and at most one hover pick every 50 ms while the pointer moves. No second renderer, Three copy or animation ticker is added. The existing frame loop drives the nine authored clips, eased drag rotation, bounded zoom, two-pointer pinch and reversible object hover offsets. Keyboard controls and HTML navigation remain available. Internal project links use the template's existing anchor navigation; About uses its actual Lenis instance.

The native renderer now clears each active scene buffer before drawing it, never after drawing, and updates the mouse and scene before composing the frame. Offscreen scene buffers are skipped. The room's projection/fit calculation is cached until its aspect or camera distance changes. Navigation aborts room input listeners, removes the document disco listener and disposes room-owned textures, materials, geometry and render target once. Late model loads after navigation are released immediately. Native shared assets, Retina resolution and the room's framing/colors are preserved.

Checks: `node tools/check-room-interactions.cjs`, `node tools/check-room.cjs`, `node tools/check-runtime-performance.cjs`. The cloud browser has no WebGL2; fallback rendering and the About link were verified with real browser input, while native interaction and rendering/disposal behavior were exercised by the deterministic checks. Verify GPU rendering on a WebGL2-capable device.

Presentation: the supplemental HTML toolbar, instructions and tooltips are hidden, retaining the original room composition. Ray-picked object links, drag, wheel/pinch zoom, keyboard controls and hover animations remain active directly in the 3D scene.
