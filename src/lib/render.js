import motionAssets from '../data/motion-assets.json';
// Build-time presentation helpers. These are never shipped to the browser.
import data from '../data/portfolio.json';
import { PROJECTS } from './projects.js';
const {A,FILMS,DIM,FEATURED,CASE_DECISION_MEDIA,TAG_COLORS,PROJECT_TAGS,MEDIA_DESCRIPTIONS,CATEGORIES,HOME_MEDIA_EXCLUSIONS,SOURCES}=data;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const picture=(key,alt='',cls='',eager=false)=>A[key]?.endsWith('.mp4')?`<video width="${DIM[key][0]}" height="${DIM[key][1]}" src="${esc(A[key])}" data-asset="${key}" aria-label="${esc(alt)}" class="${cls}" ${(key.startsWith('bhabha-motion-')||key.startsWith('original-')||A[key].startsWith('assets/optimized/'))?`poster="${A[key].replace(/\.mp4$/,'.jpg')}"`:""}  muted loop playsinline preload="none" draggable="false"></video>`:`<img width="${DIM[key][0]}" height="${DIM[key][1]}" src="${esc(A[key])}" data-asset="${key}" alt="${esc(alt)}" class="${cls}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" draggable="false">`;
const link=(p,cls='')=>`<a class="${cls}" href="project/${p.id}/">${picture(p.id,p.title+' — '+p.type)}<div class="index-caption"><h2>${p.title}</h2><span>${p.category} ↗</span></div>${projectTags(p)}</a>`;
const tag=t=>`<span class="tag">${t}</span>`;
const artStyle=key=>`--image-ratio:${DIM[key][0]/DIM[key][1]};--native-width:${DIM[key][0]}px`;
function projectSummary(p){return p.summary||p.body||p.desc;}

function projectTagIcon(tag){
 const icons={
  technology:'<path d="M3 7l4-2v14l-4-2zm6-3 5-2v20l-5-2zm7 1 5-2v18l-5-2z"/>',
  brand:'<path d="M12 5c-5-7-12 0-7 5-7 5 0 12 5 7 5 7 12 0 7-5 7-5 0-12-5-7Z"/><circle cx="12" cy="12" r="2.4" fill="var(--tag-surface)"/>',
  film:'<path d="M3 4h18v16H3zm2 2v3h2V6zm0 5v3h2v-3zm0 5v2h2v-2zm12-10v3h2V6zm0 5v3h2v-3zm0 5v2h2v-2z" fill-rule="evenodd"/><path d="m10 8 6 4-6 4z" fill="var(--tag-surface)"/>',
  web:'<path d="M3 4h18v16H3zm2 5v9h14V9z" fill-rule="evenodd"/><circle cx="6" cy="6.5" r=".75" fill="var(--tag-surface)"/><circle cx="9" cy="6.5" r=".75" fill="var(--tag-surface)"/>',
  finance:'<path d="M3 15h4v6H3zm7-6h4v12h-4zm7-6h4v18h-4z"/>',
  education:'<path d="m12 3 11 5-11 5L1 8zm-7 9 7 3 7-3v6l-7 3-7-3z"/>',
  health:'<path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6z"/>',
  editorial:'<path d="M3 3h18v18H3zm3 3v6h5V6zm8 0v2h4V6zm0 4v2h4v-2zm-8 5v2h12v-2z" fill-rule="evenodd"/>',
  campaign:'<path d="M3 9h6l12-6v18L9 15H3zm2 8h4l2 5H6z"/>',
  tools:'<path d="m15 2 7 7-4 4-7-7zM9 8l7 7-7 7H2v-7z"/>',
  business:'<path d="M8 2h8v4h6v15H2V6h6zm2 2v2h4V4zM4 11v2h7v2h2v-2h7v-2z" fill-rule="evenodd"/>',
  mobility:'<path d="m6 3-4 8v9h3v-3h14v3h3v-9l-4-8zm1 2h10l2 5H5zm-2 7v3h3v-3zm11 0v3h3v-3z" fill-rule="evenodd"/>'
 };
 const type=({'Fintech':'finance','AI':'technology','Tools':'tools','B2B':'business','Education':'education','Health':'health','Brand':'brand','Identity':'brand','Web':'web','Digital':'web','Editorial':'editorial','Film':'film','Automotive':'mobility','Campaign':'campaign','Mobility':'mobility','SaaS':'technology','Content':'editorial','UI/UX':'web','Experiments':'tools'})[tag]||'brand';
 return `<svg class="project-tag__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${icons[type]}</svg>`;
}

function projectTags(p){const tags=PROJECT_TAGS[p.id]||(p.tags||[p.category].filter(Boolean));if(!tags||!tags.length)return '';return `<div class="project-tags">${tags.map(t=>`<span class="project-tag">${projectTagIcon(t)}<span>${esc(t)}</span></span>`).join('')}</div>`;}

function artwork(p,key,i,coverLink=false){return coverLink?`<a class="art-slide" style="${artStyle(key)}" href="project/${p.id}/" aria-label="View ${esc(p.title)} project — ${esc(p.captions[i])}">${picture(key,p.captions[i])}</a>`:`<button class="art-slide" style="${artStyle(key)}" data-lightbox="${key}" data-caption="${esc(p.captions[i])}" aria-label="Enlarge ${esc(p.captions[i])}">${picture(key,p.captions[i])}</button>`}

function railControls(p){return `<div class="rail-footer"><span>Scroll to see more</span><div><button class="motion-toggle" aria-label="Pause gallery motion" aria-pressed="false">Play motion</button><button class="rail-prev" aria-label="Previous ${p.title} artwork">←</button><button class="rail-next" aria-label="Next ${p.title} artwork">→</button></div></div>`}

function gallery(p){return `<section class="project-row" aria-labelledby="row-${p.id}"><div class="row-heading"><h2 class="project-row-heading"><a href="project/${p.id}/" class="row-title" id="row-${p.id}">${p.title}</a></h2><p>${esc(projectSummary(p))}</p>${projectTags(p)}</div><div class="rail natural-rail" data-moving tabindex="0" role="region" aria-label="${p.title} artwork gallery">${p.assets.map((key,i)=>artwork(p,key,i,true)).join('')}${p.assets.length===1?`<a class="rail-note" href="project/${p.id}/" style="--project-color:${p.color}"><span>${p.role}</span><p>${p.lead}</p><span>View project ↗</span></a>`:''}</div>${railControls(p)}</section>`}

function films(){return `<section class="film-section"><div class="section-title"><div><h2>Films & <em>Indiclasses.</em></h2></div><p>At Prachyam, I worked on art direction and motion design for documentaries and educational series. Here are a few.</p></div><div class="film-grid">${FILMS.map((f,i)=>`<a class="film-card" href="${f.url}" target="_blank" rel="noopener noreferrer">${picture(f.asset,f.title)}<div class="film-meta"><span>${f.type}</span><span>↗</span></div><h3>${esc(f.title)}</h3></a>`).join('')}</div></section>`}

function footer(){return `<footer class="portfolio-footer" aria-label="Portfolio footer"><div class="pf-main"><div class="pf-identity"><a class="pf-name" href="./">Shubham<br>Shinde<span aria-hidden="true">↗</span></a><p class="pf-statement">I’m a design lead who also does the making.</p><p class="pf-location">Bengaluru, India</p></div><div class="pf-navigation"><nav aria-label="Footer navigation"><a href="work/">Selected work <span aria-hidden="true">↗</span></a><a href="about/">About me <span aria-hidden="true">↗</span></a><a href="studies/">Case studies <span aria-hidden="true">↗</span></a><a href="Shubham-Shinde-Resume.html" target="_blank" rel="noopener">Résumé <span aria-hidden="true">↗</span></a><a href="https://www.behance.net/shubhamshinde" target="_blank" rel="noopener noreferrer">Behance <span aria-hidden="true">↗</span></a></nav><a class="pf-cta" href="mailto:shubhamshinde52@gmail.com"><span>Say hello</span><span class="pf-arrow" aria-hidden="true">↗</span></a></div><div class="pf-contact"><span class="pf-label">Want to work together?</span><p>I work on brand identities, films and websites. Tell me what you’re working on.</p><a href="mailto:shubhamshinde52@gmail.com">shubhamshinde52@gmail.com <span aria-hidden="true">↗</span></a></div></div><div class="pf-bottom"><span>© ${new Date().getFullYear()} Shubham Shinde</span><a href="./">Back to home <span aria-hidden="true">↑</span></a></div></footer>`;}

function homeGallery(p){const excluded=HOME_MEDIA_EXCLUSIONS[p.id]||[];if(excluded.length){const indices=p.assets.map((key,i)=>i).filter(i=>!excluded.includes(p.assets[i]));p={...p,assets:indices.map(i=>p.assets[i]),captions:indices.map(i=>p.captions[i])};}if(p.id==='benchmark-report'){return gallery({...p,assets:["original-benchmark-insight", "original-benchmark-criteria", "benchmark-poster-orders", "benchmark-poster-images", "benchmark-poster-seats", "benchmark-data", "benchmark-contents"],captions:["Data to insight \u2014 animated report introduction", "Benchmark criteria \u2014 motion sequence", "Digital order capture \u2014 animated poster", "Product images \u2014 animated poster", "Rep seats \u2014 animated poster", "Benchmark charts and company overview", "Contents and introduction \u2014 editorial layout"]})}return gallery(p.id==='wizcrm'?{...p,assets:["original-crm-features", "original-crm-home-copilot", "crm-home-pipeline", "crm-home-dashboard", "crm-home-desktop", "crm-home-features"],captions:["WizCRM — feature animation", "AI copilot and deal pipeline — motion study", "Deals pipeline — product visual", "Accounts, activities and reporting — product visual", "WizCRM — desktop landing page", "WizCRM — core capability illustrations"]}:p)}

function about(){return `<article class="about-folio about-personal about-editorial about-short" aria-label="About Shubham Shinde">
<section class="ae ae-intro"><h1>I’m Shubham. I like making things. And making them a little better.</h1><div class="ae-intro-grid"><div class="ae-intro-copy"><p>I’m a design lead in Bengaluru, currently at WizCommerce. I work on brands, films and websites.</p><p class="personal-intro">I moved from civil engineering into design in 2020. Fewer bridges. More browser tabs.</p></div><figure class="ae-portrait"><img src="assets/about-shubham-red.webp" alt="Shubham Shinde seated in a studio" width="1122" height="1402" fetchpriority="high"><figcaption>Shubham Shinde <span>Still a work in progress.</span></figcaption></figure></div></section>
<section class="ae about-stats" aria-label="Experience in numbers"><dl class="about-stat-grid"><div><dt>Years in design</dt><dd>7+</dd></div><div><dt>Brands worked with</dt><dd>50+</dd></div><div><dt>Views on content I’ve created</dt><dd>2M+</dd></div><div><dt>Combined funding raised by companies I’ve worked with</dt><dd>$25M+</dd></div></dl></section>
<section class="ae ae-personality"><h2>A few things about me</h2><div class="personality-grid">
<article><h3>One more tab.</h3><p>Design, history, filmmaking, a very specific typeface. I like a good rabbit hole. My browser knows.</p></article>
<article><h3>“I could build that.”</h3><p>Usually how a side project starts. I use code and AI to try ideas out. Some become useful. All teach me something.</p></article>
<article><h3>Let’s try it.</h3><p>I like clear context, room to make decisions, and people who challenge an idea. Show me a rough version. We’ll figure it out.</p></article>
</div></section>
<section class="ae personal-career"><h2>My career,<br>so far</h2><div class="career-list"><p>A few stops along the way.</p><dl><div><dt><a class="career-company" href="https://100kmph.com/" aria-label="100kmph website"><img src="assets/brand-logos/100kmph.png" alt="100kmph" loading="lazy" width="160" height="48"></a></dt><dd>Graphic design · Automotive campaigns</dd></div><div><dt><a class="career-company" href="https://prachyam.com/" aria-label="Prachyam website"><img src="assets/brand-logos/prachyam.png" alt="Prachyam" loading="lazy" width="160" height="48"></a></dt><dd>Creative leadership &amp; art direction · Films and culture</dd></div><div><dt><a class="career-company" href="https://www.getphyllo.com/" aria-label="Phyllo website"><img src="assets/brand-logos/phyllo.png" alt="Phyllo" loading="lazy" width="160" height="48"></a></dt><dd>Social, campaigns &amp; product communication</dd></div><div><dt><a class="career-company" href="https://www.ecolab.com/" aria-label="Ecolab website"><img src="assets/brand-logos/ecolab.png" alt="Ecolab" loading="lazy" width="160" height="48"></a></dt><dd>Visual design &amp; design direction</dd></div><div><dt><a class="career-company" href="https://wizcommerce.com/" aria-label="WizCommerce website"><img src="assets/brand-logos/wizcommerce.svg" alt="WizCommerce" loading="lazy" width="160" height="48"></a><span>Now</span></dt><dd>Graphic Design Lead · B2B commerce</dd></div></dl><a class="career-resume" href="Shubham-Shinde-Resume.html" target="_blank" rel="noopener">View my résumé ↗</a></div></section>
<section class="ae about-services"><h2>What I can<br>help with</h2><dl class="about-service-list"><div><dt>Brand identity</dt><dd>Logos, visual identities and guidelines that keep everything together.</dd></div><div><dt>Art direction</dt><dd>A clear visual direction for your brand, campaign or film.</dd></div><div><dt>Motion &amp; film</dt><dd>Titles, explainers and stories brought to life through motion.</dd></div><div><dt>Website design</dt><dd>Websites that look like you and make sense to your visitors.</dd></div></dl></section>
<section class="ae ae-current"><div class="personal-chapter-title"><h2>Good people.<br>Interesting problems.</h2></div><div class="story-copy"><p>That’s what I’m looking for next. A team where I can help shape the direction and stay involved in the making.</p><a class="btn fx-93" href="mailto:shubhamshinde52@gmail.com"><span class="btn-label">Say hello ${caseIcon('mail')}</span></a></div></section>
</article>`}

function studies(){return `<section class="page-intro"><h1>A closer look at the work</h1><p>The brief, my role, and the decisions behind selected projects.</p></section>${projectIndex()}`}

function projectLinks(p){
  const links=p.externalLinks?.length?p.externalLinks:(SOURCES[p.id]?[{label:'Full project on Behance',url:SOURCES[p.id]}]:[]);
  return links.map(link=>`<a class="text-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join('');
}

function caseGallery(p){return `<section class="project-row case-gallery" aria-label="${p.title} moving gallery"><div class="rail natural-rail" data-moving tabindex="0" role="region" aria-label="${p.title} artwork gallery">${p.assets.map((key,i)=>artwork(p,key,i)).join('')}${p.assets.length===1?`<div class="case-end" style="--project-color:${p.color}"><h2>${p.lead}</h2><p>${p.id==='wizcrm'?'Full film coming soon.':p.body}</p>${SOURCES[p.id]?`<a class="text-link" href="${SOURCES[p.id]}" target="_blank" rel="noopener noreferrer">View project on Behance ↗</a>`:''}</div>`:''}</div>${railControls(p)}${SOURCES[p.id]?`<a class="case-source text-link" href="${SOURCES[p.id]}" target="_blank" rel="noopener noreferrer">Full project on Behance ↗</a>`:''}</section>`}

function caseIcon(name){const paths={down:'M12 4v16M5 13l7 7 7-7',mail:'M3 5h18v14H3zM3 5l9 8 9-8',category:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',role:'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 21v-3a7 7 0 0 1 14 0v3',owner:'m5 12 4 4L19 6M4 21h16',year:'M4 5h16v16H4zM8 2v6M16 2v6M4 11h16',brief:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',craft:'m4 16 12-12 4 4L8 20H4v-4ZM13 7l4 4',work:'M3 4h18v16H3zM3 16l6-6 5 5 3-3 4 4M16 8h1',result:'M4 20V10M10 20V4M16 20v-8M22 20H2',detail:'M4 6h16M4 12h16M4 18h10'};return `<svg class="case-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.detail}"/></svg>`}

function caseMedia(p,key,eager=false){
  const index=p.assets.indexOf(key);
  const caption=p.captions[index]||p.title+' — selected work';
  const video=A[key]?.endsWith('.mp4');
  const poster=video&&(key.startsWith('original-')||key.startsWith('bhabha-motion-')||A[key].startsWith('assets/optimized/'))?A[key].replace(/\.mp4$/,'.jpg'):'';
  return `<figure class="case-media" data-case-media="${esc(key)}">${video
    ?`<video src="${esc(A[key])}" width="${DIM[key][0]}" height="${DIM[key][1]}" ${poster?`poster="${esc(poster)}"`:''} controls playsinline preload="none" aria-label="${esc(caption)}"></video>`
    :`<button class="case-media-open" data-lightbox="${esc(key)}" data-caption="${esc(caption)}" aria-label="Enlarge ${esc(caption)}">${picture(key,caption,'',eager)}<span aria-hidden="true">View larger ↗</span></button>`}
    <figcaption><span>${esc(caption)}</span><span>${video?'Play film':'View artwork'}</span></figcaption></figure>`;
}

function caseDecisionItems(p){
  return (p.story?.decisions||[]).map((text,i)=>({text,key:CASE_DECISION_MEDIA[p.id]?.[i]}));
}

function projectPage(p){
  const next=PROJECTS[(PROJECTS.indexOf(p)+1)%PROJECTS.length];
  const motion=new Set(motionAssets);
  const ordered=[...p.assets.filter(k=>motion.has(k)),...p.assets.filter(k=>!motion.has(k))];
  const links=[...(p.watchLinks||[]),...(p.externalLinks?.length?p.externalLinks:(SOURCES[p.id]?[{label:'View on Behance',url:SOURCES[p.id]}]:[]))];
  const media=ordered.map((key,i)=>{
    const caption=p.captions[p.assets.indexOf(key)]||p.title;
    const ratio=DIM[key][0]/DIM[key][1];
    const full=!['crm-tablet','crm-laptop'].includes(key)&&(motion.has(key)||ratio>1.7||ratio<.65||/overview|typograph|guideline|brief|website|layout|editorial|report|direction|opportunit|capabilit|dashboard|pipeline|landing|presentation/i.test(caption));
    return `<div class="case-index-cell ${full?'is-wide':''}">${caseMedia(p,key,i===0)}</div>`;
  }).join('');
  return `<div class="case-index-layout"><aside class="case-index-info"><a class="case-index-back" href="work/">All work</a><h1>${esc(p.title)}</h1><p>${esc(projectSummary(p))}</p><dl><dt>My role</dt><dd>${esc(p.role)}</dd>${p.year?`<dt>Year</dt><dd>${esc(p.year)}</dd>`:''}</dl>${p.context?`<p class="case-index-context">${esc(p.context)}</p>`:''}<nav class="case-index-links" aria-label="Project links">${links.map(l=>`<a class="case-index-primary" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}</nav></aside><section class="case-index-grid" aria-label="${esc(p.title)} selected work">${media}</section></div><nav class="case-index-end" aria-label="Continue exploring"><p>Have something in mind?</p><a href="mailto:shubhamshinde52@gmail.com">Let’s talk</a><a href="project/${next.id}/">Next: ${esc(next.title)}</a></nav>`;
}

function storySections(p){
  return `<section class="case-decisions" id="case-process" tabindex="-1"><div class="case-section-heading"><div><h2>What shaped the design</h2></div></div>${caseDecisionItems(p).map((d,i)=>`<article class="case-decision"><div class="case-decision-copy"><span class="case-decision-number">${String(i+1).padStart(2,'0')}</span><p>${esc(d.text)}</p></div>${d.key?caseMedia(p,d.key):''}</article>`).join('')}</section>`;
}

function projectIndex(){return `<section class="studies-index"><div class="filter-bar" role="group" aria-label="Filter projects">${['All',...CATEGORIES].map((x,i)=>`<button class="pill ${i===0?'active':''}" data-filter="${x}" aria-pressed="${i===0}">${x}</button>`).join('')}</div><div class="index-grid studies-grid">${PROJECTS.map(p=>`<div data-category="${p.category}">${link(p,'index-card')}</div>`).join('')}</div></section>`}
export {projectSummary,projectPage,gallery,homeGallery,films,footer,about,studies};
