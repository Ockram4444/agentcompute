(()=>{
 const card=document.querySelector('.globe-card'),button=document.getElementById('globe-motion');
 if(!card||!button)return;
 const svg=card.querySelector('svg');let playing=true;
 function render(){
  const active=playing&&!document.hidden;
  card.dataset.motion=active?'on':'off';
  button.textContent=playing?'Pause animation':'Play animation';
  button.setAttribute('aria-label',playing?'Pause network animation':'Play network animation');
  button.setAttribute('aria-pressed',String(playing));
  if(active)svg?.unpauseAnimations?.();else svg?.pauseAnimations?.();
 }
 button.addEventListener('click',()=>{playing=!playing;render();});
 document.addEventListener('visibilitychange',render);
 render();
})();
