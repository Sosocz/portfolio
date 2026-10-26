const fs=require('node:fs'),path=require('node:path'),sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const {execFileSync}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'../dist');
 const files=JSON.parse(execFileSync('python',['-c',`from pathlib import Path;from lxml import html;import json
r=Path('${root}');print(json.dumps(sorted({str((r/x.lstrip('/')) if x.startswith('/') else p.parent/x) for p in r.rglob('*.html') for x in html.fromstring(p.read_text()).xpath('//img[not(@width) or not(@height)]/@src') if x and not x.startswith(('http:','https:','data:','blob:'))})))`]).toString());
 const dims={};for(const file of files){try{const m=await sharp(file).metadata();if(m.width&&m.height)dims[file]={width:m.width,height:m.height}}catch{}}
 fs.writeFileSync(path.resolve(__dirname,'../source-assets/quality-checks/image-dimensions.json'),JSON.stringify(dims));
})();
