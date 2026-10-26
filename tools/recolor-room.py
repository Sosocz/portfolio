"""Blender-side preparation of UV masks and source atlas images."""
import bpy,json,tempfile,subprocess,os
from pathlib import Path
with tempfile.TemporaryDirectory(prefix='sxsx-room-palette-') as td:
 folder=Path(td);images={};regions={}
 for m in bpy.data.materials:
  if m.use_nodes and m.name.startswith('Atlas'):
   for n in m.node_tree.nodes:
    if n.type=='TEX_IMAGE' and n.image:images[n.image.name]=n.image;regions[n.image.name]={'cabinet':[],'rug':[],'sage':[],'surfaces':[],'walls':[]}
 for o in bpy.context.scene.objects:
  if o.type!='MESH' or not o.data.uv_layers.active or not any(m and m.name.startswith('Atlas')for m in o.data.materials):continue
  name=o.name;me=o.data;uv=me.uv_layers.active.data
  for p in me.polygons:
   points=[o.matrix_world@me.vertices[i].co for i in p.vertices]
   kind=None
   if name in ['First','Third','Fourth'] and all(-3.19<v.x<-1.78 and -1.96<v.y<-.44 and .50<v.z<2.30 for v in points):kind='cabinet'
   if name in ['First','Third','Fourth'] and all(.45<v.x<2.45 and -1.55<v.y<1.45 and .50<v.z<.70 for v in points):kind='rug'
   if not kind:kind='surfaces'
   if kind:
    mat=me.materials[p.material_index];image=next(n.image for n in mat.node_tree.nodes if n.type=='TEX_IMAGE' and n.image)
    regions[image.name][kind].append([list(uv[i].uv)for i in p.loop_indices])
    if name=='First' and all(.48<=v.z<=6.94 for v in points) and (all(-3.32<v.x<-3.28 for v in points) or all(4.18<v.y<4.23 and -3.14<v.x<2.67 for v in points)):
     regions[image.name]['walls'].append([list(uv[i].uv)for i in p.loop_indices])
 for name,im in images.items():im.filepath_raw=str(folder/(name+'.png'));im.file_format='PNG';im.save()
 (folder/'masks.json').write_text(json.dumps(regions))
 subprocess.run([os.environ.get('ROOM_PALETTE_PYTHON','python'),'tools/apply-room-palette.py',td],check=True)
 for name,im in images.items():
  im.filepath=str(folder/(name+'.png'));im.reload();im.pack()
