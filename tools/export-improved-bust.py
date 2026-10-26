"""Blender: bake uploaded lookdev into a web bust without recentering its geometry."""
import bpy,bmesh,json,os
from pathlib import Path
from mathutils import Vector,Matrix
out=Path('/tmp/sofiane-improved-web');out.mkdir(exist_ok=True)
scene=bpy.context.scene;main=bpy.data.objects['Sofiane_Working_Monolithic']
visible=[o for o in scene.objects if o.type=='MESH' and not o.hide_render and not o.hide_get()]
if not main.get('web_prepared'):
 # Freeze the file's evaluated shape keys/modifiers, retaining the authored improved pose.
 depsgraph=bpy.context.evaluated_depsgraph_get();evaluated=main.evaluated_get(depsgraph)
 main.data=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=depsgraph);main.modifiers.clear()
 uv_index=next((i for i,uv in enumerate(main.data.uv_layers) if uv.active_render),0);main.data.uv_layers.active_index=uv_index
 print('SOURCE_UV',[(uv.name,uv.active_render) for uv in main.data.uv_layers],flush=True)
 # The previous GLB's bottom is Y=-0.4 in glTF, equivalent to Blender Z=-0.4.
 bpy.ops.object.select_all(action='DESELECT');main.select_set(True);bpy.context.view_layer.objects.active=main
 bm=bmesh.new();bm.from_mesh(main.data)
 bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=1e-7,plane_co=(0,0,-.4),plane_no=(0,0,1),clear_inner=True,clear_outer=False)
 bm.to_mesh(main.data);bm.free();main.data.update()
 mod=main.modifiers.new('Web geometry budget','DECIMATE');mod.ratio=.4;mod.use_collapse_triangulate=True
 bpy.ops.object.modifier_apply(modifier=mod.name)
 for o in visible:
  if o!=main:
   o.data.transform(o.matrix_world);o.matrix_world=Matrix.Identity(4)
 for image in list(bpy.data.images):
  if max(image.size)>4096:image.scale(round(image.size[0]*4096/max(image.size)),round(image.size[1]*4096/max(image.size)))
 main['web_prepared']=True
 bpy.ops.wm.save_as_mainfile(filepath=str(out/'prepared.blend'),compress=True)
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=8
scene.render.bake.use_selected_to_active=False;scene.render.bake.margin=8
materials=[m for m in main.data.materials if m];states=[]
for mat in materials:
 nodes=mat.node_tree.nodes;links=mat.node_tree.links
 output=next(n for n in nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output)
 original=output.inputs['Surface'].links[0].from_socket
 shader=original.node
 emission=nodes.new('ShaderNodeEmission');target=nodes.new('ShaderNodeTexImage')
 states.append((mat,output,original,shader,emission,target))
def connect_input(links,source,destination):
 if source.is_linked:links.new(source.links[0].from_socket,destination)
 else:
  v=source.default_value;destination.default_value=v if hasattr(v,'__len__') else (v,v,v,1)
def property_output(mat,socket,kind):
 node=socket.node;nodes=mat.node_tree.nodes;links=mat.node_tree.links
 if node.type=='BSDF_PRINCIPLED':
  source=node.inputs[{'albedo':'Base Color','roughness':'Roughness','metallic':'Metallic'}[kind]]
  if source.is_linked:return source.links[0].from_socket
  value=nodes.new('ShaderNodeRGB');v=source.default_value;value.outputs[0].default_value=v if hasattr(v,'__len__') else (v,v,v,1);return value.outputs[0]
 if node.type=='MIX_SHADER':
  mix=nodes.new('ShaderNodeMixRGB');connect_input(links,node.inputs[0],mix.inputs[0])
  for i in [1,2]:links.new(property_output(mat,node.inputs[i].links[0].from_socket,kind),mix.inputs[i])
  return mix.outputs[0]
 raise ValueError(('Unsupported surface',mat.name,node.type))
properties={(mat.name,kind):property_output(mat,original,kind) for mat,output,original,shader,emission,target in states for kind in ['albedo','roughness','metallic']}
textures={}
for kind,dimension in [('albedo',4096),('normal',4096),('roughness',2048),('metallic',2048)]:
 path=out/(kind+'.png')
 image=bpy.data.images.new('WEB_'+kind,width=dimension,height=dimension,alpha=False)
 image.colorspace_settings.name='sRGB' if kind=='albedo' else 'Non-Color'
 if path.exists():
  bpy.data.images.remove(image);image=bpy.data.images.load(str(path));image.colorspace_settings.name='sRGB' if kind=='albedo' else 'Non-Color'
 else:
  for mat,output,original,shader,emission,target in states:
   links=mat.node_tree.links
   for l in list(output.inputs['Surface'].links):links.remove(l)
   if kind=='normal':links.new(original,output.inputs['Surface'])
   else:
    for l in list(emission.inputs['Color'].links):links.remove(l)
    links.new(properties[(mat.name,kind)],emission.inputs['Color'])
    links.new(emission.outputs[0],output.inputs['Surface'])
   target.image=image;mat.node_tree.nodes.active=target
  print('BAKE_START',kind,len(main.data.vertices),len(main.data.polygons),flush=True)
  bpy.ops.object.bake(type='NORMAL' if kind=='normal' else 'EMIT',normal_space='TANGENT')
  image.filepath_raw=str(path);image.file_format='PNG';image.save()
  print('BAKE_DONE',kind,path.stat().st_size,flush=True)
 textures[kind]=image
for mat,output,original,shader,emission,target in states:
 links=mat.node_tree.links
 for l in list(output.inputs['Surface'].links):links.remove(l)
 links.new(original,output.inputs['Surface'])
# A single PBR primitive retains the native head and hair animation's original lookup.
mat=bpy.data.materials.new('Sofiane_Improved_Baked_PBR');mat.use_nodes=True
nodes=mat.node_tree.nodes;links=mat.node_tree.links;principled=nodes.get('Principled BSDF')
for kind,image in textures.items():
 tex=nodes.new('ShaderNodeTexImage');tex.image=image
 if kind=='normal':
  normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=1;links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],principled.inputs['Normal'])
 else:links.new(tex.outputs['Color'],principled.inputs[{'albedo':'Base Color','roughness':'Roughness','metallic':'Metallic'}[kind]])
main.data.materials.clear();main.data.materials.append(mat)
for face in main.data.polygons:face.material_index=0
bpy.ops.object.select_all(action='DESELECT')
for o in visible:o.select_set(True)
bpy.context.view_layer.objects.active=main
# The web PBR uses UVMap only; discard the unused 8K authoring UV layer.
while len(main.data.uv_layers)>1:main.data.uv_layers.remove(main.data.uv_layers[-1])
bpy.ops.export_scene.gltf(filepath=str(out/'improved-bust-raw.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_image_format='AUTO',export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=10,export_draco_position_quantization=14,export_draco_normal_quantization=10,export_draco_texcoord_quantization=14)
report={'meshes':[{ 'name':o.name,'vertices':len(o.data.vertices),'triangles':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds':[[min((o.matrix_world@Vector(v))[i] for v in o.bound_box) for i in range(3)],[max((o.matrix_world@Vector(v))[i] for v in o.bound_box) for i in range(3)]]} for o in visible],'crop_bottom':-.4,'native_scale':.8,'native_position':[.025,-.44,-.5]}
(out/'report.json').write_text(json.dumps(report,indent=2))
# Render the exported material for inspection, using the file's authored camera and lights.
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.filepath=str(out/'preview.png');bpy.ops.render.render(write_still=True)
print('EXPORT_DONE',flush=True)
