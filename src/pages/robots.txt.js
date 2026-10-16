import {origin} from '../lib/seo.js';
export function GET(){return new Response('User-agent: *\nAllow: /\n\nSitemap: '+origin+'sitemap.xml\n');}
