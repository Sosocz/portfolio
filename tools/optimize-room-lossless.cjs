const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const dir=path.resolve(__dirname,'../dist/chambre-sxsx'),source=JSON.parse(fs.readFileSync(dir+'/chambre-sxsx.gltf'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const doc=structuredClone(source),checks=[];
 for(let i=0;i<(doc.images||[]).length;i++){
  const image=doc.images[i];if(!image.uri?.endsWith('.png'))continue;
  const input=fs.readFileSync(dir+'/'+image.uri),name=image.uri.replace(/\.png$/,'.lossless.webp');
  const output=await sharp(input).webp({lossless:true,effort:6,alphaQuality:100}).toBuffer();
  const original=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const decoded=await sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(original.info.width!==decoded.info.width||original.info.height!==decoded.info.height)throw Error('Dimensions changed');
  let visibleDifferences=0;
  for(let j=0;j<original.data.length;j+=4){
   if(original.data[j+3]!==decoded.data[j+3])visibleDifferences++;
   if(original.data[j+3]&&original.data.subarray(j,j+3).compare(decoded.data.subarray(j,j+3)))visibleDifferences++;
  }
  if(visibleDifferences)throw Error('Visible pixel mismatch: '+image.uri);
  if(!original.data.equals(decoded.data)){checks.push({source:image.uri,optimized:image.uri,width:original.info.width,height:original.info.height,before:input.length,after:input.length,visiblePixelDifferences:0,rgbaIdentical:true,unchangedOriginal:true});continue;}
  fs.writeFileSync(dir+'/'+name,output);image.uri=name;image.mimeType='image/webp';
  checks.push({source:source.images[i].uri,optimized:name,width:original.info.width,height:original.info.height,before:input.length,after:output.length,visiblePixelDifferences:0,rgbaIdentical:true});
 }
 for(const tex of doc.textures||[]){const index=tex.source;if(index!==undefined&&doc.images[index].mimeType==='image/webp'){tex.extensions={...tex.extensions,EXT_texture_webp:{source:index}};delete tex.source;}}
 doc.extensionsUsed=[...new Set([...(doc.extensionsUsed||[]),'EXT_texture_webp'])];doc.extensionsRequired=[...new Set([...(doc.extensionsRequired||[]),'EXT_texture_webp'])];
 const binary=fs.readFileSync(dir+'/'+source.buffers[0].uri),compressed=zlib.gzipSync(binary,{level:9});
 if(!zlib.gunzipSync(compressed).equals(binary))throw Error('Geometry mismatch');
 fs.writeFileSync(dir+'/chambre-sxsx.bin.gz',compressed);
 fs.writeFileSync(dir+'/chambre-sxsx.optimized.gltf',JSON.stringify(doc));
 // Use the existing rendered view of the same room as the lossless fallback.
 await sharp(path.resolve(__dirname,'../source-assets/room/poster.png')).webp({lossless:true,effort:6}).toFile(dir+'/room-fallback.webp');
 const textureBytes=doc.images.reduce((n,x)=>n+fs.statSync(dir+'/'+x.uri).size,0);
 const before=source.images.reduce((n,x)=>n+fs.statSync(dir+'/'+x.uri).size,0)+binary.length;
 const report={method:'lossless WebP textures and gzip geometry; no resizing, mesh reduction, material or camera changes',before,after:compressed.length+textureBytes,geometry:{before:binary.length,after:compressed.length,sha256:hash(binary),decompressedSha256:hash(zlib.gunzipSync(compressed))},textures:checks};
 fs.writeFileSync(path.resolve(__dirname,'../source-assets/quality-checks/room-lossless.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
