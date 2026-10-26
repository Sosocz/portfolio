const fs=require('fs'),os=require('os'),path=require('path'),{spawnSync}=require('child_process'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'..');process.chdir(root);const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sxsx-room-qa-'));
try{
 const bundle=fs.readFileSync('dist/chambre-sxsx/assets/interactive-room-Chi5jqhe.js','utf8');
 const maths=bundle.slice(bundle.indexOf('/**'),bundle.indexOf('const Uu='));
 const vendor=path.join(temp,'vendor.mjs');fs.writeFileSync(vendor,maths+'\nexport {kv as GLTFLoader,L as Vector3,Ee as Vector2,kt as PerspectiveCamera,e_ as Raycaster,Pn as Box3,om as Scene,eS as createRoomMotion,My as OrbitControls};\n');
 for(const args of [[path.join(__dirname,'room-qa/geometry.mjs'),pathToFileURL(vendor).href],[path.join(__dirname,'room-qa/links.cjs')]]){
  const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(result.status!==0)throw Error('Room QA failed');
 }
}finally{fs.rmSync(temp,{recursive:true,force:true})}
