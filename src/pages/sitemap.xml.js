import {PROJECTS} from '../lib/projects.js';
import {origin} from '../lib/seo.js';
export function GET(){
 const routes=['','about/','work/','studies/',...PROJECTS.map(p=>'project/'+p.id+'/')];
 return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+routes.map(route=>'<url><loc>'+new URL(route,origin).href+'</loc></url>').join('\n')+'\n</urlset>',{headers:{'Content-Type':'application/xml'}});
}
