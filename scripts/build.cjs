const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const origin=(process.env.SITE_URL||'https://fakerplay.github.io/thatsme/').replace(/\/?$/,'/');
const template=fs.readFileSync(path.join(root,'src/site.html'),'utf8').replace('<meta name="robots" content="noindex">','');
const json=id=>JSON.parse(template.match(new RegExp('<script id="'+id+'"[^>]*>([\\s\\S]*?)</script>'))[1]);
const context=vm.createContext({document:{getElementById:id=>({textContent:JSON.stringify(json(id))}),querySelector:()=>({})},console});
const start=template.indexOf('const A=JSON.parse(');const end=template.indexOf('function refineIcons()',start);
vm.runInContext(template.slice(start,end)+'\nglobalThis.site={A,PROJECTS,home,about,studies,footer,gallery,films,projectPage,projectSummary};',context);
const site=context.site;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute=relative=>new URL(relative,origin).href;
const pages=[
 {route:'',page:'home',title:'Shubham Shinde — Design Lead & Art Director',description:'Shubham Shinde is a design lead and art director in Bengaluru, currently at WizCommerce. Explore his brand identities, films and website design.',html:site.home()},
 {route:'about/',page:'about',title:'About Shubham Shinde — Design Lead in Bengaluru',description:'Meet Shubham Shinde, Graphic Design Lead at WizCommerce. His experience spans brand identities, film, motion and websites.',html:site.about()},
 {route:'work/',page:'work',title:'Selected Design Work — Shubham Shinde',description:'Explore Shubham Shinde’s brand identities, websites, films and campaigns, with details of his role in each project.',html:'<section class="page-intro"><h1>My work</h1><p>A selection of brand identities, films, websites and campaigns I’ve worked on.</p></section>'+['bhabha','vistara','daulat'].map(id=>site.PROJECTS.find(p=>p.id===id)).map(site.gallery).join('')+site.films()+'<section class="more-work">'+['lachit','indiclass','ecolab','phyllo','vibe','solaris','solace','ikea','brochure','angre','indentured','sanskrit','wootz','sahebs','cultural-motion'].map(id=>site.PROJECTS.find(p=>p.id===id)).map(site.gallery).join('')+'</section>'},
 {route:'studies/',page:'studies',title:'Design Case Studies — Shubham Shinde',description:'Read the briefs, contributions and design decisions behind Shubham Shinde’s selected brand, film and website projects.',html:site.studies()}
];
for(const p of site.PROJECTS)pages.push({route:'project/'+p.id+'/',page:'project',title:p.title+' — '+p.type+' | Shubham Shinde',description:site.projectSummary(p),html:site.projectPage(p),project:p});
const companies={WizCommerce:'https://wizcommerce.com/',Prachyam:'https://prachyam.com/',Phyllo:'https://www.getphyllo.com/',Ecolab:'https://www.ecolab.com/','100kmph':'https://100kmph.com/'};
function companyLinks(html){let blocked=0;return html.split(/(<[^>]+>)/g).map(part=>{if(part[0]==='<'){if(/^<(a|button)\b/.test(part))blocked++;if(/^<\/(a|button)>/.test(part))blocked--;return part;}return blocked?part:part.replace(/\b(WizCommerce|Prachyam|Phyllo|Ecolab|100kmph)\b/g,name=>'<a class="company-link" href="'+companies[name]+'">'+name+'</a>')}).join('')}
const person={'@type':'Person','@id':absolute('#person'),name:'Shubham Shinde',url:origin,jobTitle:'Graphic Design Lead',worksFor:{'@type':'Organization',name:'WizCommerce',url:companies.WizCommerce},homeLocation:{'@type':'Place',name:'Bengaluru, India'},sameAs:['https://www.behance.net/shubhamshinde'],knowsAbout:['Brand identity','Art direction','Motion design','Website design'],image:absolute('assets/about-shubham-red.png')};
for(const page of pages){
 const canonical=absolute(page.route);let hero=page.project?site.A[page.project.assets[0]]:'assets/about-shubham-red.png';if(!hero||hero.endsWith('.mp4'))hero='assets/about-shubham-red.png';
 const graph=[person,{'@type':'WebSite','@id':absolute('#website'),url:origin,name:'Shubham Shinde — Portfolio',inLanguage:'en',publisher:{'@id':person['@id']}},{'@type':page.page==='about'?'AboutPage':page.page==='work'||page.page==='studies'?'CollectionPage':'WebPage','@id':canonical+'#webpage',url:canonical,name:page.title,description:page.description,isPartOf:{'@id':absolute('#website')},about:{'@id':person['@id']},inLanguage:'en'}];
 if(page.project)graph.push({'@type':'CreativeWork','@id':canonical+'#work',name:page.project.title,description:page.description,url:canonical,contributor:{'@id':person['@id']},image:absolute(hero)});
 const base=page.route?'../'.repeat(page.route.split('/').filter(Boolean).length):'./';
 let html=template.replace('<head>','<head><base href="'+base+'">').replace(/<title>.*?<\/title>/,'<title>'+esc(page.title)+'</title>').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+esc(page.description)+'">');
 const metadata='<link rel="canonical" href="'+canonical+'"><meta property="og:type" content="website"><meta property="og:site_name" content="Shubham Shinde"><meta property="og:title" content="'+esc(page.title)+'"><meta property="og:description" content="'+esc(page.description)+'"><meta property="og:url" content="'+canonical+'"><meta property="og:image" content="'+absolute(hero)+'"><meta property="og:image:alt" content="'+esc(page.project?page.project.title+' — selected project visual':'Portrait of Shubham Shinde')+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+esc(page.title)+'"><meta name="twitter:description" content="'+esc(page.description)+'"><meta name="twitter:image" content="'+absolute(hero)+'"><script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')+'</script>';
 html=html.replace('</head>',metadata+'<noscript><style>.option-enter{opacity:1!important;transform:none!important}.motion-toggle,.rail-prev,.rail-next,.filter-bar{display:none!important}.case-media-open{cursor:default}</style></noscript></head>').replace('<body>','<body data-page="'+page.page+'">');
 html=html.replace('<main id="app" tabindex="-1"></main>','<main id="app" tabindex="-1">'+companyLinks(page.html+site.footer())+'</main>');
 // The single-page hash links are now crawlable relative paths, including generated chat cards.
 html=html.replace(/href="#\/project\/([^"<]+)"/g,'href="project/$1/"').replace(/href="#\/(about|work|studies)"/g,'href="$1/"').replace(/href="#\/"/g,'href="./"');
 html=html.replace(/(<a href=")(work|about|studies)(\/">)/g,(all,pre,route,post)=>route===(page.page==='project'?'work':page.page)?pre+route+'/" class="active" aria-current="page">':all);
 // The skip link must target this document even with a shared base URL.
 html=html.replace('class="skip-link" href="#app"','class="skip-link" href="'+(page.route||'./')+'#app"');
 const destination=path.join(root,page.route,'index.html');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,html);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>'  <url><loc>'+esc(absolute(p.route))+'</loc></url>').join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+absolute('sitemap.xml')+'\n');
function redirect(file,target){const prefix=file.includes('/')?'../':'./';fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url='+prefix+target+'"><link rel="canonical" href="'+absolute(target)+'"><title>Page moved — Shubham Shinde</title></head><body><p><a href="'+prefix+target+'">Continue to the portfolio</a></p></body></html>');}
for(const [file,target] of [['about.html','about/'],['about-v2.html','about/'],['about-v3.html','about/'],['approach.html','about/'],['approach/index.html','about/']])redirect(file,target);
fs.writeFileSync(path.join(root,'404.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found — Shubham Shinde</title></head><body><h1>That page isn’t here.</h1><p><a href="'+origin+'">Return to Shubham’s portfolio</a></p></body></html>');
console.log('Generated '+pages.length+' readable pages, metadata, structured data, sitemap and legacy redirects.');
