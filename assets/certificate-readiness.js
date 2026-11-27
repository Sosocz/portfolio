/* Decode the original full-resolution certificates before their section enters view. */
(()=>{
 const observed=new WeakSet(),prepared=new WeakSet();
 const prepare=image=>{
  if(prepared.has(image))return;prepared.add(image);
  image.loading='eager';image.decoding='async';
  if(image.dataset.certificateSrcset){image.srcset=image.dataset.certificateSrcset;delete image.dataset.certificateSrcset;}
  if(image.dataset.certificateSrc){image.src=image.dataset.certificateSrc;delete image.dataset.certificateSrc;}
  if(typeof image.decode==='function')image.decode().catch(()=>prepared.delete(image));
 };
 const prepareCard=card=>card.querySelectorAll('.helmet-grid-item-reveal-img').forEach(prepare);
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){prepareCard(entry.target);observer.unobserve(entry.target);}},{rootMargin:'1600px 0px'}):null;
 function init(){
  document.querySelectorAll('[data-helmet-item]').forEach(card=>{
   if(observed.has(card))return;observed.add(card);
   card.addEventListener('pointerenter',()=>prepareCard(card),{once:true,passive:true});
   card.addEventListener('focusin',()=>prepareCard(card),{once:true});
   if(observer)observer.observe(card);else prepareCard(card);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('page-transition-end',init);
})();
