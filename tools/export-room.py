import bpy,json,math,sys
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=sys.argv[sys.argv.index('--')+1],load_ui=False,use_scripts=False)
s=bpy.context.scene;s.frame_set(1)
exec(compile(open('tools/recolor-room.py').read(),'tools/recolor-room.py','exec'))
print('CAMERA',list(s.camera.location),list(s.camera.rotation_euler),s.camera.data.type,s.camera.data.ortho_scale)
print('MATERIALS',[(m.name,len(m.node_tree.nodes) if m.use_nodes else 0)for m in bpy.data.materials])
# Keep UVs and all animated object transforms; reduce costly decorative meshes only.
for o in s.objects:
 if o.type=='MESH' and len(o.data.polygons)>18000:
  mod=o.modifiers.new('Web detail budget','DECIMATE');mod.ratio=max(.22,14000/len(o.data.polygons))
for im in bpy.data.images:
 if im.type=='IMAGE' and max(im.size)>4096:
  factor=4096/max(im.size);im.scale(round(im.size[0]*factor),round(im.size[1]*factor))
props=bpy.ops.export_scene.gltf.get_rna_type().properties
opts=dict(filepath='dist/assets/chambre-sxsx-mint-walls.glb',export_format='GLB',export_apply=True,export_cameras=True,export_lights=False,export_animations=True,export_force_sampling=True,export_frame_range=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
opts={k:v for k,v in opts.items() if k in props}
bpy.ops.export_scene.gltf(**opts)
s.render.engine='CYCLES';s.cycles.samples=64;s.cycles.use_denoising=True;s.render.resolution_x=2400;s.render.resolution_y=2400;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.filepath='source-assets/room/poster.png'
bpy.ops.render.render(write_still=True)
