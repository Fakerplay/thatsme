(()=>{
const key='shubham-home-intro-v1';
if(matchMedia('(prefers-reduced-motion: reduce)').matches || (location.hash && !['#/', '#/home'].includes(location.hash)))return;
try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'seen');}catch{}
const overlay=document.createElement('div');overlay.id='home-intro';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Welcome to Shubham Shinde’s portfolio');
overlay.innerHTML='<div class="intro-centre"><div class="intro-symbols" aria-hidden="true"></div><span class="intro-name">Shubham Shinde</span><span class="intro-caption">Making things make sense.</span></div><button type="button">Skip intro</button>';
document.body.append(overlay);document.documentElement.classList.add('home-intro-active');
let ended=false;const animations=[];const cleanup=()=>{if(ended)return;ended=true;clearTimeout(failsafe);animations.forEach(a=>a.cancel());overlay.remove();document.documentElement.classList.remove('home-intro-active');document.removeEventListener('keydown',onKey);};
const onKey=e=>{if(e.key==='Escape'||e.key==='Tab')cleanup();};document.addEventListener('keydown',onKey);overlay.querySelector('button').onclick=cleanup;window.addEventListener('pagehide',cleanup,{once:true});const failsafe=setTimeout(cleanup,4000);
const symbols=overlay.querySelector('.intro-symbols'),nameText=overlay.querySelector('.intro-name');
const icon=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const leaf=icon('<path d="M5 20C-1 8 8 2 21 3c1 12-5 20-14 15" fill="currentColor" stroke="none"/><path d="M3 22 17 7" stroke="#f5ff00" stroke-width="1.5"/>');
const flower=icon('<path d="M12 8C5-4-2 8 8 12c-12 7 0 14 4 4 7 12 14 0 4-4 12-7 0-14-4-4Z" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2" fill="#f5ff00" stroke="none"/>');
const sun=icon('<path d="m12 1 2 5 5-3-1 6 5 3-5 2 2 6-6-2-2 5-2-5-6 2 2-6-5-2 5-3-2-6 6 3Z" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="3" fill="#f5ff00" stroke="none"/>');
const sprout=icon('<path d="M12 22V10"/><path d="M12 15C4 16 1 11 2 5c7 0 11 3 10 10Zm0-4C11 4 16 1 22 2c0 7-4 10-10 9Z" fill="currentColor" stroke="none"/>');
const bloom=icon('<path d="M12 7C3-3 0 4 7 10-5 9 0 18 8 15c-7 11 5 12 5 3 8 10 14 0 4-4 12-1 6-12-2-6 3-12-9-9-3-1Z" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2" fill="#f5ff00" stroke="none"/>');
const wave=icon('<path d="M2 8c4-8 7 8 11 0s7 4 9 0M2 14c4-8 7 8 11 0s7 4 9 0M2 20c4-8 7 8 11 0s7 4 9 0" stroke-width="2.5"/>');
const sets=[[leaf,flower,sun],[sprout,wave,bloom],[bloom,leaf,flower]];


const pause=ms=>new Promise(r=>setTimeout(r,ms));
const animate=(el,frames,options)=>{const a=el.animate(frames,options);animations.push(a);return a.finished;};
(async()=>{try{
for(const set of sets){if(ended)return;symbols.innerHTML=set.join('');await pause(420);}
if(ended)return;symbols.style.display='none';nameText.style.opacity='1';await animate(nameText,[{opacity:0},{opacity:1}],{duration:150,fill:'both'});await pause(310);if(ended)return;
await animate(overlay.querySelector('.intro-centre'),[{opacity:1},{opacity:0}],{duration:180,fill:'both'});if(ended)return;
await animate(overlay,[{transform:'translateY(0)'},{transform:'translateY(-101%)'}],{duration:650,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});cleanup();
}catch{cleanup();}})();
})();
