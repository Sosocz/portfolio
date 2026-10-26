# Loader source

`page-transition-original.riv` is the original export referenced by `lando-custom.js` in the supplied `live-test(1).zip` (`https://lando.itsoffbrand.io/rive/page-transition.riv`).

Run `python tools/adapt-sg-loader.py` to regenerate `dist/assets/sg-page-transition.riv` from the SG SVG. The adapter retains the original initial/transition-out/transition-in state machine, frame positions, interpolators and two-letter stroke animations. It changes the logo geometry, color values and magnification required to cover the viewport through SG's narrower stroke. Existing component IDs remain stable; added vertices are appended before animation records.

The website uses its existing Rive runtime. The local controller automatically requests transition-in when page initialization finishes, handles reduced motion and releases the overlay if optional assets fail.
