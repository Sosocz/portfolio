# Homepage media localization

All 59 remaining media/CSS/fallback resources referenced by the homepage were copied byte-for-byte to dist/assets/home-media. Provenance and SHA-256 are retained in home-media-manifest.json. Image srcset candidates, inline stylesheet backgrounds, shared stylesheet backgrounds, favicon/webclip and social preview images now use same-origin URLs. Source-site preconnect/dns-prefetch hints were removed from home. The Rive fallback WASM is the compatible @rive-app/canvas-lite 2.26.4 distribution, hosted locally; the unused source-site Rive base is local too.

External hyperlinks remain navigation links. Other pages' HTML media inventories were not replaced; their shared stylesheet/runtime receive the same cache-busted local dependencies. No layout, image pixels, model geometry, palette or animation timing changes.
