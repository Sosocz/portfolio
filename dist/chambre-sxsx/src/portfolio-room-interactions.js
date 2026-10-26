export const socialLinks={
  GitHub:'https://github.com/Sosocz',
  YouTube:'https://www.linkedin.com/in/sofiane-ghazal-6b561639a', // Replace with your personal LinkedIn URL.
  Twitter:'https://profile.hackthebox.com/profile/019c8eba-ab79-7249-ac7d-9eeeb8b6f581?utm_medium=copy_url',
};

export async function createRoomInteractions(controls){
  if(window.parent!==window){
    return {isBlocked:()=>false,activate(node){
      for(const[key,url]of Object.entries(socialLinks))if(node.name.includes(key)){window.open(url,'_blank','noopener,noreferrer');return;}
      const action=node.name.includes('My_Work_Button')?'work':node.name.includes('About_Button')?'about':node.name.includes('Contact_Button')?'contact':null;
      if(action)window.parent.postMessage({type:'sxsx-room-navigate',action},location.origin);
    }};
  }

  const response=await fetch(new URL('content/panels.html',document.baseURI));
  if(!response.ok)throw new Error('Panneaux du portfolio indisponibles');
  const parsed=new DOMParser().parseFromString(await response.text(),'text/html');
  const dialogs=new Map();let active=null,previousFocus;
  function close(){if(active){active.close();active=null;}controls.enabled=true;previousFocus?.focus();}
  function open(key){
    close();const dialog=dialogs.get(key);if(!dialog)return;
    previousFocus=document.activeElement;active=dialog;controls.enabled=false;dialog.showModal();
    document.dispatchEvent(new CustomEvent('room-panel',{detail:{panel:key}}));
  }
  for(const key of ['work','about','contact']){
    const source=parsed.querySelector(`.${key}.modal`);if(!source)throw new Error(`Panneau manquant : ${key}`);
    const dialog=document.createElement('dialog');dialog.className='room-panel';dialog.setAttribute('aria-label',source.getAttribute('aria-label'));dialog.innerHTML=source.innerHTML;
    dialog.querySelector('.modal-exit-button').addEventListener('click',close);
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
    document.body.append(dialog);dialogs.set(key,dialog);
  }
  const contact=dialogs.get('contact').querySelector('.paragraph-section');
  contact.querySelector('.modal-paragraph-text').textContent='Retrouve mes profils GitHub et Hack The Box ci-dessous. Mon lien LinkedIn personnel et mon adresse professionnelle restent à renseigner.';
  contact.querySelector('.brand-tags').textContent='LinkedIn personnel · à compléter / E-mail · à compléter';
  const links=document.createElement('p');
  for(const[key,label]of [['GitHub','GitHub'],['Twitter','Hack The Box'],['YouTube','LinkedIn']]){
    const anchor=document.createElement('a');anchor.href=socialLinks[key];anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.textContent=label;links.append(anchor,document.createTextNode(' · '));
  }
  contact.append(links);
  for(const button of document.querySelectorAll('[data-panel]'))button.addEventListener('click',()=>open(button.dataset.panel));
  return {isBlocked:()=>Boolean(active),activate(node){
    for(const[key,url]of Object.entries(socialLinks))if(node.name.includes(key)){
      window.open(url,'_blank','noopener,noreferrer');return;
    }
    if(node.name.includes('My_Work_Button'))open('work');
    else if(node.name.includes('About_Button'))open('about');
    else if(node.name.includes('Contact_Button'))open('contact');
  }};
}
