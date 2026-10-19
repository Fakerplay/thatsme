const {A,PROJECTS}=JSON.parse(document.getElementById('portfolio-client-data').textContent);
const app=document.querySelector('#app'),dialog=document.querySelector('#lightbox'),searchDialog=document.querySelector('#search-dialog');let routeCleanup=()=>{};
function refineIcons(){document.querySelectorAll('a,button,.art-caption').forEach(el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())if(/[↗↘→←↑]/.test(walker.currentNode.textContent))nodes.push(walker.currentNode);nodes.forEach(node=>{const frag=document.createDocumentFragment();node.textContent.split(/([↗↘→←↑])/).forEach(part=>{if(!/[↗↘→←↑]/.test(part)){frag.append(document.createTextNode(part));return}const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','cta-icon');svg.setAttribute('aria-hidden','true');svg.innerHTML='<path d="M6 18 18 6M6 6h12v12"/>';if(part==='←'){svg.innerHTML='<path d="M18 12H6m6-6-6 6 6 6"/>';}if(part==='→'){svg.innerHTML='<path d="M6 12h12m-6-6 6 6-6 6"/>';}if(part==='↑'){svg.innerHTML='<path d="M12 18V6m-6 6 6-6 6 6"/>';}frag.append(svg)});node.replaceWith(frag)})})}
function hydrate(){document.querySelectorAll('[data-asset]').forEach(i=>{i.src=A[i.dataset.asset];if(i.tagName==='VIDEO')i.muted=true});}

function aboutStackPanels(){
 const folio=document.querySelector('.about-personal');if(!folio||folio.classList.contains('about-editorial'))return ()=>{};
 const panels=[...folio.querySelectorAll(':scope > .ae')];
 const measure=()=>panels.forEach(panel=>panel.style.setProperty('--panel-top',Math.min(16,innerHeight-panel.offsetHeight-16)+'px'));
 const observer=new ResizeObserver(measure);panels.forEach(panel=>observer.observe(panel));window.addEventListener('resize',measure);measure();
 return ()=>{observer.disconnect();window.removeEventListener('resize',measure)};
}

// Scroll reveals: text rises out of a slight blur, visuals uncover through a soft mask,
// units entering together stagger in reading order, all on a long ease-out.
// JS adds the hiding classes itself, so with JS off or failed everything stays readable.
function entranceMotion(){
 const root=document.documentElement;
 const release=()=>root.classList.remove('reveal-pending');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches||!('IntersectionObserver' in window)||!Element.prototype.animate){release();return ()=>{};}
 const EASE='cubic-bezier(.16,1,.3,1)',STEP=90,MAX_WAIT=360;
 const VISUAL='.rail,figure,.film-card,.index-card img,.case-media,.story-object';
 const UNIT=VISUAL+',h1,h2,h3,p,dl,ul,ol,.project-tags,.pf-navigation,.pf-bottom,.pf-name,.pf-label,.btn,.text-link,.back-link,.case-all-work,.case-detail-links,.case-icon,.case-decision-number,.intro-links,.story-bottom,.motion-toggle,.rail-prev,.rail-next';
 const hero=document.querySelector('#app .hero-storymaker');
 const candidates=[...document.querySelectorAll('#app :is('+UNIT+')')].filter(el=>!el.closest('[hidden]')&&!(hero&&hero.contains(el)));
 // Only the outermost unit animates, so nothing moves twice.
 const units=candidates.filter(el=>{for(let p=el.parentElement;p&&p!==app;p=p.parentElement)if(p.matches(UNIT))return false;return true});
 const animations=new Map(),waiting=new Set();
 let queueEnd=0;
 const show=el=>el.classList.remove('reveal-wait');
 const reveal=el=>{
  if(preference.matches||el.contains(document.activeElement)){show(el);return}
  const now=performance.now();
  const start=Math.max(now,Math.min(queueEnd,now+MAX_WAIT));
  queueEnd=start+STEP;
  const visual=el.matches(VISUAL);
  // Opacity/translate/blur have no end value, so each element settles on its own styles (rotations, faded text) without a snap.
  const frames=visual
   ?[{opacity:0,translate:'0 18px',clipPath:'inset(14% 4% 14% 4% round 14px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)'}]
   :[{opacity:0,translate:'0 18px',filter:'blur(14px)'},{}];
  const animation=el.animate(frames,{duration:visual?1200:900,delay:start-now,easing:EASE,fill:'backwards'});
  show(el);
  animations.set(el,animation);
  animation.finished.catch(()=>{}).finally(()=>animations.delete(el));
 };
 const introActive=()=>root.classList.contains('home-intro-active');
 const observer=new IntersectionObserver(entries=>{
  // Reading order: top to bottom, then left to right.
  entries.sort((a,b)=>(a.boundingClientRect.top-b.boundingClientRect.top)||(a.boundingClientRect.left-b.boundingClientRect.left)).forEach(entry=>{
   const el=entry.target;
   // Already scrolled past (reload mid-page, anchor jump): leave it visible, never animate it.
   if(entry.boundingClientRect.bottom<=0){observer.unobserve(el);show(el);return}
   if(!entry.isIntersecting)return;
   observer.unobserve(el);
   if(introActive()&&el.closest('.hero-option'))waiting.add(el);else reveal(el);
  });
 },{threshold:0,rootMargin:'0px 0px -6% 0px'});
 // Hide before anything can be seen, so a unit never shows, vanishes, then fades back in.
 units.forEach(el=>{if(el.getBoundingClientRect().bottom>0)el.classList.add('reveal-wait');observer.observe(el)});
 requestAnimationFrame(()=>requestAnimationFrame(release));
 // Hero: the headline builds word by word out of a heavy blur, then the line, the button and the illustration follow.
 const heroParts=[];let morphTarget=null,morphTimer=0,morphStopped=false;
 // Text morph: letters keyed by character + occurrence; shared letters glide (FLIP), others blur in/out.
 const MORPH_WORDS=['design lead','art director','hands-on designer'];
 const startMorph=(box,delay)=>{
  let index=0;const letters=new Map();
  const keysFor=word=>{const seen={};return [...word].map(c=>{seen[c]=(seen[c]||0)+1;return c+'#'+seen[c]})};
  const build=word=>{box.textContent='';letters.clear();keysFor(word).forEach((k,i)=>{const el=document.createElement('span');el.className='morph-letter';el.textContent=word[i]===' '?'\u00a0':word[i];letters.set(k,el);box.append(el)})};
  build(MORPH_WORDS[0]);
  const change=()=>{
   if(morphStopped)return;
   if(document.hidden||preference.matches||box.getBoundingClientRect().bottom<0){morphTimer=setTimeout(change,2600);return}
   index=(index+1)%MORPH_WORDS.length;const word=MORPH_WORDS[index];
   const boxRect=box.getBoundingClientRect(),oldWidth=boxRect.width;
   const before=new Map();letters.forEach((el,k)=>{const r=el.getBoundingClientRect();before.set(k,{x:r.left-boxRect.left,y:r.top-boxRect.top})});
   const keys=keysFor(word),next=new Map();
   keys.forEach((k,i)=>{let el=letters.get(k);if(!el){el=document.createElement('span');el.className='morph-letter';el.textContent=word[i]===' '?'\u00a0':word[i];el.dataset.fresh='1'}next.set(k,el)});
   const leaving=[...letters].filter(([k])=>!next.has(k));
   box.style.width='';box.replaceChildren(...next.values());
   const newRect=box.getBoundingClientRect(),newWidth=newRect.width;
   // Width eases so the centred line re-centres smoothly instead of jumping.
   box.animate([{width:oldWidth+'px'},{width:newWidth+'px'}],{duration:700,easing:EASE});
   leaving.forEach(([k,el])=>{const b=before.get(k);el.style.cssText='position:absolute;left:'+b.x+'px;top:'+b.y+'px';box.append(el);el.animate([{opacity:1,filter:'blur(0px)'},{opacity:0,filter:'blur(10px)',translate:'0 -0.25em'}],{duration:380,easing:'ease-in',fill:'forwards'}).finished.then(()=>el.remove()).catch(()=>{})});
   let fresh=0;
   next.forEach((el,k)=>{
    if(el.dataset.fresh){delete el.dataset.fresh;el.animate([{opacity:0,filter:'blur(10px)',translate:'0 0.3em'},{}],{duration:620,delay:160+fresh++*28,easing:EASE,fill:'backwards'});return}
    const b=before.get(k),r=el.getBoundingClientRect(),dx=b.x-(r.left-newRect.left),dy=b.y-(r.top-newRect.top);
    if(dx||dy)el.animate([{translate:dx+'px '+dy+'px'},{translate:'0 0'}],{duration:700,easing:EASE});
   });
   letters.clear();next.forEach((el,k)=>letters.set(k,el));
   morphTimer=setTimeout(change,3200);
  };
  morphTimer=setTimeout(change,delay+2200);
 };
 const playHero=()=>{
  if(!hero||preference.matches)return;
  const h1=hero.querySelector('h1'),support=hero.querySelector('.story-support'),cta=hero.querySelector('.story-bottom'),art=hero.querySelector('.story-object');
  const run=(el,frames,opts)=>{if(!el)return;const a=el.animate(frames,{easing:EASE,fill:'backwards',...opts});heroParts.push(a);el.classList.remove('reveal-wait')};
  let wordsEnd=0;
  if(h1){
   if(!h1.dataset.split){h1.dataset.split='1';const full=h1.textContent.trim();h1.setAttribute('aria-label',full);
    const m=full.match(/^(.*?\breliable)\s/);const prefix=m?m[1]:full;
    h1.textContent='';
    prefix.split(/\s+/).forEach((w,i)=>{if(i)h1.append(' ');const span=document.createElement('span');span.className='hero-word';span.setAttribute('aria-hidden','true');span.textContent=w;h1.append(span)});
    if(m){h1.append(' ');const morph=document.createElement('span');morph.className='hero-word text-morph';morph.setAttribute('aria-hidden','true');h1.append(morph);const dot=document.createElement('span');dot.className='hero-word';dot.setAttribute('aria-hidden','true');dot.textContent='.';h1.append(dot);morphTarget=morph;}
   }
   h1.classList.remove('reveal-wait');
   const spans=[...h1.querySelectorAll('.hero-word')];
   spans.forEach((span,i)=>run(span,[{opacity:0,translate:'0 0.5em',filter:'blur(18px)'},{}],{duration:1300,delay:120+i*65}));
   wordsEnd=120+spans.length*65;
  }
  run(support,[{opacity:0,translate:'0 16px',filter:'blur(14px)'},{}],{duration:1100,delay:wordsEnd+150});
  run(cta,[{opacity:0,translate:'0 14px',filter:'blur(10px)'},{}],{duration:1000,delay:wordsEnd+320});
  if(morphTarget)startMorph(morphTarget,wordsEnd+1400);
  run(art,[{opacity:0,scale:'1.04',clipPath:'inset(14% 6% 14% 6% round 24px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)'}],{duration:1600,delay:wordsEnd+200});
 };
 if(hero&&hero.getBoundingClientRect().bottom>0){hero.querySelectorAll('h1,.story-support,.story-bottom,.story-object').forEach(el=>el.classList.add('reveal-wait'))}
 const introObserver=new MutationObserver(()=>{if(introActive())return;queueEnd=0;[...waiting].forEach(reveal);waiting.clear();playHero();introObserver.disconnect()});
 if(introActive())introObserver.observe(root,{attributes:true,attributeFilter:['class']});
 else if(hero&&hero.getBoundingClientRect().bottom>0)playHero();
 const onFocus=event=>{const el=event.target.closest?.('.reveal-wait');if(el){observer.unobserve(el);show(el)}animations.forEach((a,el)=>{if(el.contains(event.target))a.finish()})};
 const stop=()=>{observer.disconnect();introObserver.disconnect();waiting.clear();animations.forEach(a=>a.cancel());animations.clear();heroParts.forEach(a=>a.cancel());morphStopped=true;clearTimeout(morphTimer);units.forEach(show);hero?.querySelectorAll('.reveal-wait').forEach(show);release()};
 const reduce=()=>{if(preference.matches)stop()};
 document.addEventListener('focusin',onFocus);preference.addEventListener('change',reduce);
 return ()=>{stop();document.removeEventListener('focusin',onFocus);preference.removeEventListener('change',reduce)};
}

function bindHeroOption(){
 const section=document.querySelector('.hero-option');if(!section||section.classList.contains('hero-storymaker'))return ()=>{};
 const preference=matchMedia('(prefers-reduced-motion: reduce)');const animations=new Set();const timers=new Set();let interval=null,stopped=false,index=0;
 const animate=(el,frames,options)=>{if(!el||preference.matches)return null;const a=el.animate(frames,{fill:'backwards',...options});animations.add(a);a.finished.then(()=>animations.delete(a)).catch(()=>{});return a};
 const later=(fn,delay)=>{const t=setTimeout(()=>{timers.delete(t);if(!stopped)fn()},delay);timers.add(t);return t};
 const easing='cubic-bezier(.16,1,.3,1)';
 if(section.classList.contains('hero-storymaker')){
  animate(section.querySelector('.story-object'),[{opacity:0,transform:'translateY(22px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:1400,delay:100,easing});
  animate(section.querySelector('.hello-note'),[{opacity:0,transform:'translateY(8px) rotate(0deg)'},{opacity:1,transform:'translateY(0) rotate(6deg)'}],{duration:900,delay:650,easing});
  animate(section.querySelector('.story-kicker'),[{opacity:0},{opacity:1}],{duration:850,delay:450,easing});
  animate(section.querySelector('h1'),[{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 50% 0)',offset:.43},{opacity:1,clipPath:'inset(0 0 0% 0)'}],{duration:1450,delay:420,easing:'cubic-bezier(.25,.8,.25,1)'});
  for(const [selector,delay] of [['.story-support',1050],['.story-modes',1300],['.story-bottom',1500]])animate(section.querySelector(selector),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay,easing});
  const phrases=['identities with character.','stories that move.','websites with purpose.'];
  const descriptions=['I’m currently Graphic Design Lead at WizCommerce. My work spans brand identities, films and websites.','I bring stories to life through art direction,<br>documentary frames and considered motion.','I turn a brand’s story into a digital experience,<br>with clear structure and purposeful design.'];
  const text=section.querySelector('.changing-story'),support=section.querySelector('.story-support'),modes=[...section.querySelectorAll('[data-story-mode]')];
  const change=()=>{if(preference.matches||document.hidden||!section.isConnected||section.getBoundingClientRect().bottom<0||section.contains(document.activeElement))return;
   animate(text,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-7px)'}],{duration:260,fill:'forwards',easing:'ease-in'});
   animate(support,[{opacity:1},{opacity:0}],{duration:260,fill:'forwards',easing:'ease-in'});
   later(()=>{index=(index+1)%3;text.getAnimations().forEach(a=>a.cancel());support.getAnimations().forEach(a=>a.cancel());text.textContent=phrases[index];support.innerHTML=descriptions[index];modes.forEach((b,i)=>b.classList.toggle('selected',i===index));animate(text,[{opacity:0,transform:'translateY(9px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}],{duration:800,easing});animate(support,[{opacity:0},{opacity:1}],{duration:750,delay:120,easing});},270);
  };
  if(text&&!preference.matches)later(()=>{change();interval=setInterval(change,6500)},6500);
 }
 const reduce=()=>{if(!preference.matches)return;clearInterval(interval);timers.forEach(clearTimeout);timers.clear();section.querySelectorAll('*').forEach(el=>el.getAnimations().forEach(a=>a.cancel()))};preference.addEventListener('change',reduce);
 return ()=>{stopped=true;clearInterval(interval);timers.forEach(clearTimeout);section.querySelectorAll('*').forEach(el=>el.getAnimations().forEach(a=>a.cancel()));preference.removeEventListener('change',reduce)};
}

function bindInteractions(){const disposers=[entranceMotion(),bindHeroOption(),aboutStackPanels()];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelectorAll('.rail').forEach(rail=>{const row=rail.closest('.project-row'),prev=row.querySelector('.rail-prev'),next=row.querySelector('.rail-next');let holdUntil=0;const hold=()=>{holdUntil=performance.now()+1800};const update=()=>{prev.disabled=rail.scrollLeft<4;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4};const move=n=>{hold();rail.scrollBy({left:n*Math.max(280,rail.clientWidth*.7),behavior:reduced?'instant':'smooth'})};prev.onclick=()=>move(-1);next.onclick=()=>move(1);rail.addEventListener('scroll',update,{passive:true});rail.addEventListener('dragstart',e=>e.preventDefault());rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});let start=0,left=0,drag=false,moved=false;rail.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;start=e.clientX;left=rail.scrollLeft;drag=true;moved=false});const pointermove=e=>{if(!drag)return;const delta=e.clientX-start;if(Math.abs(delta)>6){moved=true;rail.classList.add('dragging');rail.scrollLeft=left-delta;e.preventDefault()}};const pointerup=()=>{drag=false;rail.classList.remove('dragging')};window.addEventListener('pointermove',pointermove,{passive:false});window.addEventListener('pointerup',pointerup);rail.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);disposers.push(()=>{window.removeEventListener('pointermove',pointermove);window.removeEventListener('pointerup',pointerup)});rail.querySelectorAll('img').forEach(i=>i.addEventListener('load',update));requestAnimationFrame(update);window.addEventListener('resize',update);disposers.push(()=>window.removeEventListener('resize',update));if(rail.hasAttribute('data-moving')){const toggle=row.querySelector('.motion-toggle');const preference=matchMedia('(prefers-reduced-motion: reduce)');let paused=preference.matches,touching=false,visible=true,last=0,position=0,raf=0,cycle=0;const originals=Array.from(rail.children);const clones=originals.map(el=>{const copy=el.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.tabIndex=-1;copy.querySelectorAll('a,button').forEach(c=>c.tabIndex=-1);rail.appendChild(copy);return copy});const measure=()=>{cycle=clones[0].offsetLeft-originals[0].offsetLeft;position=cycle;rail.scrollLeft=position;};requestAnimationFrame(measure);window.addEventListener('resize',measure);disposers.push(()=>window.removeEventListener('resize',measure));const label=()=>{toggle.textContent=paused?'Play motion':'Pause motion';toggle.setAttribute('aria-pressed',String(!paused));toggle.setAttribute('aria-label',paused?'Play gallery motion':'Pause gallery motion')};label();toggle.onclick=()=>{paused=!paused;label();videoTabState()};rail.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.shiftKey)hold()},{passive:true});rail.addEventListener('touchstart',()=>{touching=true;hold()},{passive:true});const endTouch=()=>{touching=false;hold()};rail.addEventListener('touchend',endTouch,{passive:true});rail.addEventListener('touchcancel',endTouch,{passive:true});const changed=()=>{paused=preference.matches;label()};preference.addEventListener?.('change',changed);disposers.push(()=>preference.removeEventListener?.('change',changed));let observer;if(typeof IntersectionObserver!=='undefined'){observer=new IntersectionObserver(entries=>visible=entries[0].isIntersecting);observer.observe(rail)}const tick=now=>{const dt=Math.min(now-last,40);last=now;const max=rail.scrollWidth-rail.clientWidth;if(!document.body.classList.contains('review-active')&&!paused&&!touching&&!drag&&!document.hidden&&!dialog.open&&!searchDialog.open&&!rail.contains(document.activeElement)&&visible&&now>holdUntil&&max>1){if(Math.abs(position-rail.scrollLeft)>2)position=rail.scrollLeft;position-=dt*.045;if(cycle>0){if(position<0)position+=cycle;else if(position>=cycle)position-=cycle}rail.scrollLeft=position}else position=rail.scrollLeft;raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);disposers.push(()=>{cancelAnimationFrame(raf);observer?.disconnect()})}});
const clipVisibility=new Map();
const clipMotion=matchMedia('(prefers-reduced-motion: reduce)');
const updateClip=(video,visible)=>{
 if(video.controls){if(!visible||document.hidden)video.pause();return}
 const toggle=video.closest('.project-row')?.querySelector('.motion-toggle');
 if(visible&&!document.hidden&&!clipMotion.matches&&toggle?.getAttribute('aria-pressed')!=='false')video.play().catch(()=>{});else video.pause();
};
const clipObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{clipVisibility.set(entry.target,entry.isIntersecting);updateClip(entry.target,entry.isIntersecting)}),{threshold:.05});
document.querySelectorAll('#app video').forEach(video=>clipObserver.observe(video));
const videoTabState=()=>clipVisibility.forEach((visible,video)=>updateClip(video,visible));
document.addEventListener('visibilitychange',videoTabState);clipMotion.addEventListener('change',videoTabState);
disposers.push(()=>{clipObserver.disconnect();document.removeEventListener('visibilitychange',videoTabState);clipMotion.removeEventListener('change',videoTabState);clipVisibility.forEach((_,video)=>video.pause())});
document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.lightbox,isVideo=A[key].endsWith('.mp4');let media=document.querySelector('#lightbox-image');const replacement=document.createElement(isVideo?'video':'img');replacement.id='lightbox-image';replacement.src=A[key];if(isVideo){replacement.controls=true;replacement.autoplay=true;replacement.loop=true;replacement.muted=true;replacement.playsInline=true;replacement.setAttribute('aria-label',b.dataset.caption||'Project animation')}else replacement.alt=b.dataset.caption||'';media.replaceWith(replacement);document.querySelector('#lightbox-caption').textContent=b.dataset.caption||'';requestAnimationFrame(()=>{if(!dialog.open)dialog.showModal();dialog.scrollTop=0})}));
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});document.querySelectorAll('[data-category]').forEach(x=>x.hidden=b.dataset.filter!=='All'&&x.dataset.category!==b.dataset.filter)});
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText('shubhamshinde52@gmail.com');b.textContent='Email copied'}catch{b.textContent='shubhamshinde52@gmail.com'}});
document.querySelectorAll('[data-top]').forEach(b=>b.onclick=e=>{e.preventDefault();window.scrollTo({top:0,behavior:reduced?'instant':'smooth'})});
routeCleanup=()=>disposers.forEach(fn=>fn());}
document.querySelectorAll('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());[dialog,searchDialog].forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}));
dialog.addEventListener('close',()=>{const v=dialog.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load()}});
const searchInput=document.querySelector('#search-input'),searchResults=document.querySelector('#search-results');
function chatReply(question){
 const q=question.toLowerCase();
 const project=PROJECTS.find(p=>q.includes(p.title.toLowerCase())||q.includes(p.id)|| (p.id==='bhabha'&&q.includes('homi')) || (p.id==='vibe'&&q.includes('vibe')));
 if(project)return {text:[project.title+' — '+project.desc, 'Role: '+project.role, project.body, project.ownership?'Ownership: '+project.ownership+' (selected design work)':''].filter(Boolean).join('\n\n'),projects:[project]};
 if(/prachyam/.test(q))return {text:'At Prachyam, Shubham worked in creative leadership and art direction across documentary visuals, motion, Indiclass identity and brochure design. See each project for his contribution.',projects:PROJECTS.filter(p=>['bhabha','lachit','indiclass','brochure'].includes(p.id))};
 if(/contact|email|hire|availability|available|budget|price|cost/.test(q))return {text:'For a project, design lead role, availability or pricing, contact Shubham directly at shubhamshinde52@gmail.com. Those details aren’t listed in the portfolio.',contact:true};
 const category=/brand|logo|identity/.test(q)?'Brand identity':/web|digital|website/.test(q)?'Web & digital':/film|motion|animation/.test(q)?'Film & motion':/social|campaign|advertis/.test(q)?'Advertising & social':/print|brochure|editorial/.test(q)?'Editorial & print':null;
 if(category)return {text:'Here are Shubham’s '+category.toLowerCase()+' projects. Open a case study to explore the visuals, role and contribution.',projects:PROJECTS.filter(p=>p.category===category)};
 if(/role|contribut|team|solo|yourself|your work|yourself|about|who|experience|skills|what.*do/.test(q))return {text:'Shubham Shinde works across brand identity, film and motion, and web design. He is currently Graphic Design Lead at WizCommerce. His work includes creative leadership and art direction at Prachyam, and visual design and direction for Ecolab. See each project for his contribution. Solace is his own project.',projects:PROJECTS.filter(p=>['bhabha','ecolab','solace'].includes(p.id))};
 if(/hello|^hi[! .]*$|^hey/.test(q))return {text:'Hello! Ask about a project, Shubham’s role, or a type of work such as brand identity, motion or websites.'};
 return {text:'I don’t have that detail in the portfolio. Try a project name, ask about Shubham’s role at Prachyam, or explore brand identity, motion and web work. For anything else, you can ask Shubham directly.',contact:true};
}
function addChatMessage(text,user=false,result={}){
 const item=document.createElement('div');item.className='chat-message'+(user?' chat-user':'');
 const label=document.createElement('small');label.textContent=user?'YOU':'PORTFOLIO GUIDE';const body=document.createElement('p');body.textContent=text;item.append(label,body);
 if(result.projects?.length){const links=document.createElement('div');links.className='chat-projects';result.projects.forEach(p=>{const a=document.createElement('a');a.href='project/'+p.id+'/';a.textContent=p.title;a.onclick=()=>searchDialog.close();links.append(a)});item.append(links)}
 if(result.contact){const a=document.createElement('a');a.href='mailto:shubhamshinde52@gmail.com';a.textContent='Email Shubham';item.append(a)}
 searchResults.append(item);searchResults.scrollTop=searchResults.scrollHeight;
}
function sendQuestion(question){const text=question.trim();if(!text)return;addChatMessage(text,true);const answer=chatReply(text);addChatMessage(answer.text,false,answer);searchInput.value='';searchInput.focus()}
document.querySelector('#chat-form').onsubmit=e=>{e.preventDefault();sendQuestion(searchInput.value)};
document.querySelectorAll('.chat-examples button').forEach(b=>b.onclick=()=>sendQuestion(b.textContent));
function openSearch(){document.querySelector('.main-nav').classList.remove('mobile-open');document.querySelector('#menu-toggle').setAttribute('aria-expanded','false');searchDialog.showModal();searchInput.focus()}
document.querySelector('#search-toggle').onclick=openSearch;document.querySelector('#mobile-search').onclick=openSearch;document.querySelector('.skip-link').onclick=e=>{e.preventDefault();app.focus();};document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelector('.main-nav').classList.remove('mobile-open');document.querySelector('#menu-toggle').setAttribute('aria-expanded','false')}if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();openSearch()}});document.querySelector('#menu-toggle').onclick=()=>{const n=document.querySelector('.main-nav'),open=n.classList.toggle('mobile-open');document.querySelector('#menu-toggle').setAttribute('aria-expanded',String(open))};let navigationVersion=0;
function migrateLegacyRoute(){
 const legacy=location.hash.match(/^#\/(.*)$/);if(!legacy)return false;
 const route=legacy[1].replace(/\/$/,'');
 const destination=route==='approach'?'about/':route==='home'||route===''?'./':route+'/';
 if(!/^(?:about|work|studies|approach|home|project\/[a-z0-9-]+)?$/.test(route))return false;
 location.replace(new URL(destination,document.baseURI).href);return true;
}
window.addEventListener('hashchange',migrateLegacyRoute);
if(!migrateLegacyRoute()){hydrate();refineIcons();bindInteractions();}



(()=>{
 const root=document.documentElement;
 const sizeGalleries=()=>root.style.setProperty('--gallery-viewport',root.clientWidth+'px');
 sizeGalleries();
 new ResizeObserver(sizeGalleries).observe(root);
 window.addEventListener('resize',sizeGalleries,{passive:true});
})();


document.addEventListener('click',e=>{const button=e.target.closest('[data-case-jump]');if(!button)return;const target=document.getElementById(button.dataset.caseJump);if(!target)return;target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});target.focus({preventScroll:true});});

try{localStorage.removeItem('shubham-button-finish');delete document.documentElement.dataset.buttonFinish;}catch(e){}