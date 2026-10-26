# Window name: sxsx

Raised lowercase lettering generated locally with Blender using macOS Arial Rounded Bold, matching the original letter height (0.1627 scene units), depth (0.0738), and original Light Wooden material albedo.

The original Name_Platform_Third remains unchanged in the live scene. Eight old Name_Letter nodes are hidden and excluded from picking; only the new four-letter GLB is shown. The word starts at the original left margin (X 0.4409), so the complete name remains visible beside the server rack.

Rebuild asset: tools/build_window_name.py, using tools/window_name_geometry.py. That helper also replaces only the letters in the source baking scene, preserving the connected platform component.

Source lighting bakes for wall, sill and namebase use tools/bake_rack_floor.py with RACK_SURFACE set accordingly, then tools/denoise_rack_floor.py with the same value. The packager replaces only their UV islands; the rack, Kirby, poster, social cards and other furniture remain unchanged.
