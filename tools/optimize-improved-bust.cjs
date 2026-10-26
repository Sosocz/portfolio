const fs=require('fs'),sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
(async()=>{
 const source='/tmp/sofiane-improved-web/improved-bust-raw.glb',target='dist/assets/sofiane-bust-web.glb';
 const data=fs.readFileSync(source),jn=data.readUInt32LE(12),doc=JSON.parse(data.subarray(20,20+jn)),bin=data.subarray(28+jn);
 const images=new Map(doc.images.map(i=>[i.bufferView,i])),chunks=[];let offset=0;
 for(let index=0;index<doc.bufferViews.length;index++){
  const view=doc.bufferViews[index];let bytes=bin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
  if(images.has(index)){const name=images.get(index).name||'';let pipeline=sharp(bytes);if(name==='normal')pipeline=pipeline.resize({width:2048,height:2048,fit:'inside',withoutEnlargement:true});if(name==='metallic-roughness')pipeline=pipeline.resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true});bytes=await pipeline.webp({quality:96,alphaQuality:100,effort:6}).toBuffer();images.get(index).mimeType='image/webp'}
  view.byteOffset=offset;view.byteLength=bytes.length;chunks.push(bytes);offset+=bytes.length;
  const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding}
 }
 doc.buffers[0].byteLength=offset;
 for(const tex of doc.textures||[])if(tex.source!=null){tex.extensions={...tex.extensions,EXT_texture_webp:{source:tex.source}};delete tex.source;}
 for(const key of ['extensionsUsed','extensionsRequired'])doc[key]=[...new Set([...(doc[key]||[]),'EXT_texture_webp'])];
 let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
 const head=Buffer.alloc(20);head.write('glTF');head.writeUInt32LE(2,4);head.writeUInt32LE(28+json.length+offset,8);head.writeUInt32LE(json.length,12);head.writeUInt32LE(0x4e4f534a,16);
 const binHead=Buffer.alloc(8);binHead.writeUInt32LE(offset);binHead.writeUInt32LE(0x004e4942,4);
 if(!fs.existsSync('/tmp/sofiane-bust-previous.glb'))fs.copyFileSync(target,'/tmp/sofiane-bust-previous.glb');fs.writeFileSync(target,Buffer.concat([head,json,binHead,...chunks]));
 console.log('Optimized improved bust:',data.length,'->',fs.statSync(target).size,'bytes');
})().catch(e=>{console.error(e);process.exitCode=1});
