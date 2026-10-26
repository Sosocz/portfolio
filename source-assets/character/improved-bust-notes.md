# Improved Sofiane bust

Source: user upload Sofiane_PNG_MATCH_BACKUP(20261024-141646).blend; original file remains unchanged. Its persistent attachment identity and SHA-256 are in improved-bust-report.json.

The visible evaluated shape keys/modifiers are frozen, the same Z=-0.4 lower cut as the old web bust is retained, and no model recentering/scaling is applied. The source UVMap stays active for baking. Procedural cloth and mixed hair materials are converted to albedo, tangent normal, roughness and metallic maps; source hair infill transforms are baked into their meshes, retaining the native HAIR object names. Geometry is reduced to approximately the original web model budget. The unused hair authoring UV layer is removed after baking.

Blender 5.0.1 exports Draco level 10 with 14-bit positions, 10-bit normals and 14-bit UVs. Color remains 4096px; web normal is 2048px and metallic/roughness 1024px, encoded WebP quality 96. Final GLB: 5,882,648 bytes. A single Sofiane_Working_Monolithic primitive preserves the existing native head/hair lookup. All textures are embedded and all decoder/runtime files remain locally hosted.

The runtime differs only by the cache-busted model URL: scale 0.8, position [0.025,-0.44,-0.5], root rotation [0,0,0], camera, responsive settings and interactions are unchanged. Old/new head width, top and cut match within 0.001 Blender/glTF units. Authored-camera material render inspected. Startup and runtime performance checks pass. Native browser GPU rendering remains unavailable in cloud Chrome; placement is verified by GLB bounds and unchanged native transforms.

Reproduce with Blender -b SOURCE.blend -t 8 --python tools/export-improved-bust.py, then node tools/optimize-improved-bust.cjs. The intermediate bake cache and prepared Blender checkpoint are in /tmp/sofiane-improved-web; original upload and runtime asset are not overwritten by baking. The optimizer writes the published GLB.
