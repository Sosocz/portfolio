/* Independent of graphics readiness and preserved across template navigations. */
(()=>{
 const init=()=>{
  const button=document.querySelector('[data-nav-ham]'),menu=document.querySelector('[data-nav-m]');
  if(!button||!menu||button.dataset.a11yWired)return;button.dataset.a11yWired='true';
  const main=document.querySelector('main');
  const sync=()=>{const open=button.getAttribute('aria-expanded')==='true';if(main)main.inert=open;menu.inert=!open;button.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu')};
  new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['aria-expanded']});sync();
  button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')e.stopImmediatePropagation()});
  const keys=e=>{
   if(!button.isConnected){document.removeEventListener('keydown',keys);return}
   if(button.getAttribute('aria-expanded')!=='true')return;
   if(e.key==='Escape'){e.preventDefault();window.closeNavigation?.();button.focus();return}
   if(e.key!=='Tab')return;
   const links=[button,...menu.querySelectorAll('a[href],button,[tabindex="0"]')].filter(x=>x.getClientRects().length&&!x.closest('[inert]'));
   const index=links.indexOf(document.activeElement);
   if(e.shiftKey&&(index<=0)){e.preventDefault();links.at(-1)?.focus()}
   else if(!e.shiftKey&&index===links.length-1){e.preventDefault();button.focus()}
  };
  document.addEventListener('keydown',keys);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('page-transition-end',init);
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-taxi-ignore]');if(a&&a.getAttribute('href')?.startsWith('/')&&!a.getAttribute('href').startsWith('/#'))window.closeNavigation?.()},{capture:true});
 new MutationObserver(()=>queueMicrotask(init)).observe(document.documentElement,{childList:true,subtree:true});
})();
