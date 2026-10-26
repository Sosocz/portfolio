const fs=require('node:fs'),path=require('node:path');
module.exports=function readRoomSource(dir){
 const model=JSON.parse(fs.readFileSync(path.join(dir,'chambre-sxsx.gltf'),'utf8'));
 const parts=model.buffers.map(b=>fs.readFileSync(path.join(dir,b.uri)));
 const offsets=[];let size=0;for(const part of parts){offsets.push(size);size+=part.length;}
 for(const view of model.bufferViews||[]){view.byteOffset=(view.byteOffset||0)+offsets[view.buffer||0];view.buffer=0;}
 model.buffers=[{byteLength:size,uri:'chambre-sxsx.bin'}];
 return {model,binary:Buffer.concat(parts)};
};
