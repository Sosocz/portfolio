/* Scoped notes reader; native GSAP/Rive scroll and hover animations remain owners. */
(()=>{
 const wired=new WeakSet();let dataset,dialog,returnFocus,scheduled=false;
 const load=()=>dataset||(dataset=fetch('/assets/resolution-notes/cards.json').then(r=>{if(!r.ok)throw Error('Notes indisponibles');return r.json()}));
 const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
 async function openNotes(row){
  let entries;try{entries=await load()}catch{return}
  const item=entries.find(c=>c.id===row.dataset.resolutionId);if(!item)return;
  returnFocus=row;
  if(!dialog){dialog=node('dialog','resolution-notes-dialog');dialog.setAttribute('aria-label','Notes de résolution');dialog.setAttribute('data-lenis-prevent','');dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog.addEventListener('close',()=>returnFocus?.isConnected&&returnFocus.focus({preventScroll:true}));document.body.append(dialog)}
  dialog.replaceChildren();const bar=node('div','resolution-notes-bar');bar.append(node('strong','',item.title+' · '+(item.platform==='HTB'?'Hack The Box':'Root-Me')));const close=node('button','resolution-notes-close','×');close.type='button';close.setAttribute('aria-label','Fermer les notes');close.onclick=()=>dialog.close();bar.append(close);dialog.append(bar);
  const img=node('img','resolution-notes-full');img.src='/assets/resolution-notes/'+item.id+'-large.webp';img.alt='Fiche '+item.title+' : '+item.steps.join(' ; ');img.width=1536;img.height=1024;dialog.append(img);
  const details=node('details','resolution-notes-transcript');details.open=matchMedia('(max-width:767px)').matches;details.append(node('summary','','Étapes, indices et source'));const ol=node('ol');item.steps.forEach(s=>ol.append(node('li','',s)));details.append(ol,node('pre','',item.commands.map(s=>item.prompt+' '+s).join('\n')),node('p','',item.note));const link=node('a','','Consulter la source · '+item.source_name);link.href=item.source_url;link.target='_blank';link.rel='noopener noreferrer';details.append(link);dialog.append(details,node('p','resolution-notes-meta',item.methodological?'Repères méthodologiques : analyse du binaire local. Les commandes sont des indices, pas une capture de session.':'Synthèse de comptes rendus publics. Les commandes sont des pistes de recherche, pas une capture de session.'));
  if(!dialog.open)dialog.showModal();close.focus({preventScroll:true});
 }
 function init(){document.querySelectorAll('[data-resolution-id]').forEach(row=>{if(wired.has(row))return;wired.add(row);row.setAttribute('aria-haspopup','dialog');row.setAttribute('tabindex','0');row.title='Ouvrir les notes de résolution';row.addEventListener('click',()=>openNotes(row));row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openNotes(row)}})})}
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;init()})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true})},{once:true});else{init();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true})}
})();
