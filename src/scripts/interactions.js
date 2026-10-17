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

// Animate on entry instead of hiding content in CSS: failed/disabled JS stays readable.
// The inline head script adds .reveal-pending so nothing paints before we decide what animates.
function entranceMotion(){
 const root=document.documentElement;
 const release=()=>root.classList.remove('reveal-pending');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches||!('IntersectionObserver' in window)){release();return ()=>{};}
 const animations=new Map(),waiting=new Set();
 const easing='cubic-bezier(.22,1,.36,1)';
 const VISUAL='.rail,figure,.film-card,.index-card img,.case-media,.story-object';
 const UNIT=VISUAL+',h1,h2,h3,p,dl,ul,ol,.project-tags,.pf-navigation,.pf-bottom,.pf-name,.pf-label,.btn,.text-link,.back-link,.case-all-work,.case-detail-links,.case-icon,.case-decision-number,.intro-links,.story-bottom,.motion-toggle,.rail-prev,.rail-next';
 // Everything visible gets one reveal, and only the outermost unit animates, so nothing pops in beside a fading neighbour or moves twice.
 const candidates=[...document.querySelectorAll('#app :is('+UNIT+')')].filter(el=>!el.closest('[hidden],.name-footer'));
 const units=candidates.filter(el=>{for(let p=el.parentElement;p&&p!==app;p=p.parentElement)if(p.matches(UNIT))return false;return true});
 const visuals=units.filter(el=>el.matches(VISUAL));
 const texts=units.filter(el=>!el.matches(VISUAL));
 const visualSet=new Set(visuals);
 // One shared queue: items entering close together cascade 70ms apart instead of popping in at once or out of order.
 let queueEnd=0;
 const STEP=70,MAX_WAIT=280;
 const reveal=(el,minDelay=0)=>{
  if(preference.matches||el.contains(document.activeElement))return;
  const now=performance.now();
  const start=Math.max(now+minDelay,Math.min(queueEnd,now+MAX_WAIT));
  queueEnd=start+STEP;
  const visual=visualSet.has(el);
  // Single "from" keyframes: each element animates back to its own styled opacity/rotation, so nothing snaps at the end.
  const frames=visual?[{opacity:0,translate:'0 24px',clipPath:'inset(6% 0 6% 0)'}]:[{opacity:0,translate:'0 14px'}];
  const animation=el.animate(frames,{duration:visual?900:700,easing,delay:start-now,fill:'backwards'});
  animations.set(el,animation);
  animation.finished.catch(()=>{}).finally(()=>animations.delete(el));
 };
 const introActive=()=>root.classList.contains('home-intro-active');
 const observer=new IntersectionObserver(entries=>{
  entries.sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top).forEach(entry=>{
   const el=entry.target,top=entry.boundingClientRect.top;
   // Already scrolled past (reload mid-page, anchor jump, fast fling): show it as-is, never animate in from the wrong side.
   if(top<0){observer.unobserve(el);return}
   if(!entry.isIntersecting)return;
   observer.unobserve(el);
   if(introActive()&&el.closest('.hero-option'))waiting.add(el);
   else reveal(el);
  });
 },{threshold:0,rootMargin:'0px 0px -8% 0px'});
 [...texts,...visuals].forEach(el=>observer.observe(el));
 // The first observer callback runs before the next paint, so lifting the guard on the frame after it is flicker-free.
 requestAnimationFrame(()=>requestAnimationFrame(release));
 // Wait until the welcome overlay clears, so hero motion is actually visible.
 const introObserver=new MutationObserver(()=>{
  if(introActive())return;
  queueEnd=0;[...waiting].forEach(el=>reveal(el));waiting.clear();introObserver.disconnect();
 });
 if(introActive())introObserver.observe(root,{attributes:true,attributeFilter:['class']});
 const finishFocused=event=>animations.forEach((animation,el)=>{if(el.contains(event.target))animation.finish()});
 const stop=()=>{observer.disconnect();introObserver.disconnect();waiting.clear();animations.forEach(animation=>animation.cancel());animations.clear();release()};
 const reduce=()=>{if(preference.matches)stop()};
 document.addEventListener('focusin',finishFocused);preference.addEventListener('change',reduce);
 return ()=>{stop();document.removeEventListener('focusin',finishFocused);preference.removeEventListener('change',reduce)};
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

function bindInteractions(){const disposers=[entranceMotion(),bindHeroOption(),aboutStackPanels()];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelectorAll('.rail').forEach(rail=>{const row=rail.closest('.project-row'),prev=row.querySelector('.rail-prev'),next=row.querySelector('.rail-next');let holdUntil=0;const hold=()=>{holdUntil=performance.now()+1800};const update=()=>{prev.disabled=rail.scrollLeft<4;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4};const move=n=>{hold();rail.scrollBy({left:n*Math.max(280,rail.clientWidth*.7),behavior:reduced?'instant':'smooth'})};prev.onclick=()=>move(-1);next.onclick=()=>move(1);rail.addEventListener('scroll',update,{passive:true});rail.addEventListener('dragstart',e=>e.preventDefault());rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});let start=0,left=0,drag=false,moved=false;rail.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;start=e.clientX;left=rail.scrollLeft;drag=true;moved=false});const pointermove=e=>{if(!drag)return;const delta=e.clientX-start;if(Math.abs(delta)>6){moved=true;rail.classList.add('dragging');rail.scrollLeft=left-delta;e.preventDefault()}};const pointerup=()=>{drag=false;rail.classList.remove('dragging')};window.addEventListener('pointermove',pointermove,{passive:false});window.addEventListener('pointerup',pointerup);rail.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);disposers.push(()=>{window.removeEventListener('pointermove',pointermove);window.removeEventListener('pointerup',pointerup)});rail.querySelectorAll('img').forEach(i=>i.addEventListener('load',update));requestAnimationFrame(update);window.addEventListener('resize',update);disposers.push(()=>window.removeEventListener('resize',update));if(rail.hasAttribute('data-moving')){const toggle=row.querySelector('.motion-toggle');const preference=matchMedia('(prefers-reduced-motion: reduce)');let paused=preference.matches,touching=false,visible=true,last=0,position=0,raf=0,cycle=0;const originals=Array.from(rail.children);const clones=originals.map(el=>{const copy=el.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.tabIndex=-1;copy.querySelectorAll('a,button').forEach(c=>c.tabIndex=-1);rail.appendChild(copy);return copy});const measure=()=>{cycle=clones[0].offsetLeft-originals[0].offsetLeft;position=cycle;rail.scrollLeft=position;};requestAnimationFrame(measure);window.addEventListener('resize',measure);disposers.push(()=>window.removeEventListener('resize',measure));const label=()=>{toggle.textContent=paused?'Play motion':'Pause motion';toggle.setAttribute('aria-pressed',String(!paused));toggle.setAttribute('aria-label',paused?'Play gallery motion':'Pause gallery motion')};label();toggle.onclick=()=>{paused=!paused;label()};rail.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.shiftKey)hold()},{passive:true});rail.addEventListener('touchstart',()=>{touching=true;hold()},{passive:true});const endTouch=()=>{touching=false;hold()};rail.addEventListener('touchend',endTouch,{passive:true});rail.addEventListener('touchcancel',endTouch,{passive:true});const changed=()=>{paused=preference.matches;label()};preference.addEventListener?.('change',changed);disposers.push(()=>preference.removeEventListener?.('change',changed));let observer;if(typeof IntersectionObserver!=='undefined'){observer=new IntersectionObserver(entries=>visible=entries[0].isIntersecting);observer.observe(rail)}const tick=now=>{const dt=Math.min(now-last,40);last=now;const max=rail.scrollWidth-rail.clientWidth;if(!document.body.classList.contains('review-active')&&!paused&&!touching&&!drag&&!document.hidden&&!dialog.open&&!searchDialog.open&&!rail.contains(document.activeElement)&&visible&&now>holdUntil&&max>1){if(Math.abs(position-rail.scrollLeft)>2)position=rail.scrollLeft;position-=dt*.045;if(cycle>0){if(position<0)position+=cycle;else if(position>=cycle)position-=cycle}rail.scrollLeft=position}else position=rail.scrollLeft;raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);disposers.push(()=>{cancelAnimationFrame(raf);observer?.disconnect()})}});
const clipVisibility=new Map();const clipObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{clipVisibility.set(entry.target,entry.isIntersecting);if(entry.target.controls){if(!entry.isIntersecting)entry.target.pause()}else if(entry.isIntersecting&&!document.hidden&&!reduced)entry.target.play().catch(()=>{});else entry.target.pause()})},{threshold:.05});document.querySelectorAll('#app video').forEach(video=>clipObserver.observe(video));const videoTabState=()=>clipVisibility.forEach((visible,video)=>{if(video.controls){if(document.hidden)video.pause()}else if(visible&&!document.hidden&&!reduced)video.play().catch(()=>{});else video.pause()});document.addEventListener('visibilitychange',videoTabState);disposers.push(()=>{clipObserver.disconnect();document.removeEventListener('visibilitychange',videoTabState);clipVisibility.forEach((_,video)=>video.pause())});
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