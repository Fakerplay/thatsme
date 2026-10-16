import fs from 'node:fs';
import path from 'node:path';
import data from '../data/portfolio.json';
import {companies} from './links.js';
export const origin='https://studioshubham.vercel.app/';
const root=process.cwd();
const absolute=relative=>new URL(relative,origin).href;
const person={'@type':'Person','@id':absolute('#person'),name:'Shubham Shinde',url:origin,jobTitle:'Graphic Design Lead',worksFor:{'@type':'Organization',name:'WizCommerce',url:companies.WizCommerce},homeLocation:{'@type':'Place',name:'Bengaluru, India'},sameAs:['https://www.behance.net/shubhamshinde','https://www.linkedin.com/in/shubhamshinde'],knowsAbout:['Brand identity','Art direction','Motion design','Website design'],image:absolute('assets/about-shubham-red.webp')};
export function metadata(page){
 const canonical=absolute(page.route);
 const visuals=page.project?page.project.assets.map(key=>data.A[key]).filter(Boolean):[];
 const hero=visuals.map(file=>file.endsWith('.mp4')?file.replace(/\.mp4$/,'.jpg'):file).find(file=>/\.(webp|png|jpe?g)$/i.test(file)&&fs.existsSync(path.join(root,file)))||'assets/about-shubham-red.webp';
 const graph=[person,{'@type':'WebSite','@id':absolute('#website'),url:origin,name:'Shubham Shinde — Portfolio',inLanguage:'en',publisher:{'@id':person['@id']}},{'@type':page.page==='about'?'AboutPage':page.page==='work'||page.page==='studies'?'CollectionPage':'WebPage','@id':canonical+'#webpage',url:canonical,name:page.title,description:page.description,isPartOf:{'@id':absolute('#website')},about:{'@id':person['@id']},inLanguage:'en'}];
 if(page.project)graph.push({'@type':'CreativeWork','@id':canonical+'#work',name:page.project.title,description:page.description,url:canonical,contributor:{'@id':person['@id']},image:absolute(hero)});
 if(page.route){
  const crumbs=[{name:'Home',item:origin}];
  if(page.project)crumbs.push({name:'Work',item:absolute('work/')});
  crumbs.push({name:page.project?page.project.title:page.page[0].toUpperCase()+page.page.slice(1),item:canonical});
  graph.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumbs',itemListElement:crumbs.map((crumb,index)=>({'@type':'ListItem',position:index+1,...crumb}))});
  graph[2].breadcrumb={'@id':canonical+'#breadcrumbs'};
 }

return {canonical,hero,graph};
}
