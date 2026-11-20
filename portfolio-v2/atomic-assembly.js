(() => {
  'use strict';
  const host=document.getElementById('ac-artboard');
  if(!host || !window.AtomicCherryAssembly) return;
  const $=id=>document.getElementById(id);
  const english=document.documentElement.lang==='en';
  const text=(pl,en)=>english?en:pl;
  const format=ms=>(ms/1000).toFixed(1).replace('.',english?'.':',');
  const poster=host.querySelector('.ac-poster');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let player,ready=false,started=false,inView=false,userControlled=false,disposed=false;
  const status=value=>{$('ac-status').textContent=value;};
  const beginWhenVisible=()=>{
    if(ready && inView && !started && !userControlled && !reduced.matches){
      started=true;player.play();
      status(text('Składanie maszyny Atomic Cherry.','Assembling the Atomic Cherry machine.'));
    }
  };
  function initialize(){
    if(player || disposed) return;
    status(text('Przygotowywanie animacji…','Preparing the animation…'));
    player=new AtomicCherryAssembly(host,{autoplay:false});
    player.setRate($('ac-speed').value);
    host.setAttribute('aria-label',text('Animacja składania maszyny Atomic Cherry','Atomic Cherry machine assembly animation'));
    player.addEventListener('timeupdate',event=>{
      const {time,duration,playing}=event.detail;
      $('ac-seek').value=String(time);
      $('ac-time').textContent=`${format(time)} / ${format(duration)} s`;
      $('ac-play').textContent=playing?text('Wstrzymaj','Pause'):time>=duration?text('Odtwórz ponownie','Replay assembly'):text('Odtwórz składanie','Play assembly');
    });
    player.addEventListener('ended',()=>status(text('Maszyna złożona. Możesz odtworzyć animację ponownie.','Assembly complete. You can replay the animation.')));
    player.ready.then(()=>{
      if(disposed)return;
      ready=true;poster?.remove();
      for(const id of ['ac-play','ac-replay','ac-seek'])$(id).disabled=false;
      status(reduced.matches?text('Maszyna złożona. Odtwórz animację, jeśli chcesz.','Assembly complete. Play the animation if you wish.'):text('Animacja gotowa do odtworzenia.','The animation is ready to play.'));
      beginWhenVisible();
    }).catch(()=>{
      if(disposed)return;
      player.destroy();if(poster)host.append(poster);
      host.setAttribute('aria-busy','false');
      status(text('Animacja jest niedostępna. Wyświetlam gotowy render maszyny.','The animation is unavailable. Showing the finished machine render.'));
    });
  }
  const preload=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){initialize();preload.disconnect();}
  },{rootMargin:'200px 0px'});
  const visibility=new IntersectionObserver(entries=>{
    inView=entries[0].isIntersecting && entries[0].intersectionRatio>=.2;
    if(inView)beginWhenVisible();
    else if(ready && player.playing)player.pause();
  },{threshold:[0,.2]});
  preload.observe(host);visibility.observe(host);
  $('ac-play').addEventListener('click',()=>{
    if(!ready)return;userControlled=true;
    if(player.playing){player.pause();status(text('Animacja wstrzymana.','Animation paused.'));}
    else{player.play();status(text('Składanie maszyny Atomic Cherry.','Assembling the Atomic Cherry machine.'));}
  });
  $('ac-replay').addEventListener('click',()=>{
    if(!ready)return;userControlled=true;player.replay();status(text('Odtwarzanie składania od początku.','Replaying assembly from the beginning.'));
  });
  $('ac-seek').addEventListener('input',event=>{
    if(!ready)return;const position=event.target.value;userControlled=true;player.pause();player.seek(position);status(text('Podgląd wybranego momentu animacji.','Previewing the selected moment.'));
  });
  $('ac-speed').addEventListener('change',event=>{if(player)player.setRate(event.target.value);});
  window.addEventListener('pagehide',event=>{
    if(event.persisted){if(ready)player.pause();return;}
    disposed=true;preload.disconnect();visibility.disconnect();if(player)player.destroy();
  });
})();
