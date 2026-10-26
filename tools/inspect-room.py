import bpy,json,sys
bpy.ops.wm.open_mainfile(filepath=sys.argv[sys.argv.index('--')+1],load_ui=False,use_scripts=False)
s=bpy.context.scene
report={'version':bpy.data.version,'frames':[s.frame_start,s.frame_end,s.render.fps],'camera':s.camera.name if s.camera else None,'objects':[],'images':[],'actions':[]}
for o in s.objects:
 report['objects'].append({'name':o.name,'type':o.type,'hidden':o.hide_render,'location':list(o.location),'dimensions':list(o.dimensions),'polygons':len(o.data.polygons) if o.type=='MESH' else 0,'animated':bool(o.animation_data),'modifiers':[m.type for m in o.modifiers]})
for i in bpy.data.images:report['images'].append({'name':i.name,'size':list(i.size),'packed':bool(i.packed_file),'path':i.filepath})
for a in bpy.data.actions:report['actions'].append({'name':a.name,'range':list(a.frame_range)})
open('source-assets/room/inspection.json','w').write(json.dumps(report,indent=2))
print('ROOM_REPORT',json.dumps({'objects':len(report['objects']),'polygons':sum(x['polygons'] for x in report['objects']),'images':len(report['images']),'actions':report['actions'],'camera':report['camera']}))
