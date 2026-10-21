// Generates a local import bundle; never sends content or credentials anywhere.
import fs from 'node:fs';
import crypto from 'node:crypto';
const data=JSON.parse(fs.readFileSync('src/data/portfolio.json'));
const motion=new Set(JSON.parse(fs.readFileSync('src/data/motion-assets.json')));
const field=(type,extra={})=>({type,...extra});
const components=[{name:'case_study',display_name:'Case study',is_root:true,schema:{title:field('text',{required:true}),summary:field('textarea',{required:true}),role:field('text'),year:field('text'),context:field('textarea'),links:field('bloks',{restrict_components:true,component_whitelist:['case_link']}),media:field('bloks',{restrict_components:true,component_whitelist:['case_media']})}},{name:'case_link',is_root:false,schema:{label:field('text',{required:true}),url:field('text',{required:true})}},{name:'case_media',is_root:false,schema:{asset:field('asset',{required:true}),poster:field('asset'),description:field('text',{description:'Accessible image description; not displayed as a caption.'}),layout:field('option',{default_value:'full',options:[{name:'Full width',value:'full'},{name:'Paired',value:'paired'}]})}}];
const uuid=()=>crypto.randomUUID();
const stories=fs.readdirSync('src/content/projects').filter(f=>f.endsWith('.json')).map(f=>{
 const p=JSON.parse(fs.readFileSync('src/content/projects/'+f));
 const ordered=[...p.assets.filter(k=>motion.has(k)),...p.assets.filter(k=>!motion.has(k))];
 const media=ordered.map(key=>{const caption=p.captions[p.assets.indexOf(key)]||p.title;const ratio=data.DIM[key][0]/data.DIM[key][1];const full=!['crm-tablet','crm-laptop'].includes(key)&&(motion.has(key)||ratio>1.7||ratio<.65||/overview|typograph|guideline|brief|website|layout|editorial|report|direction|opportunit|capabilit|dashboard|pipeline|landing|presentation/i.test(caption));const url=new URL(data.A[key],'https://studioshubham.vercel.app/').href;return {_uid:uuid(),component:'case_media',asset:{fieldtype:'asset',filename:url,alt:caption},description:caption,layout:full?'full':'paired',...(url.endsWith('.mp4')&&fs.existsSync(data.A[key].replace('.mp4','.jpg'))?{poster:{fieldtype:'asset',filename:url.replace('.mp4','.jpg')}}:{})};});
 const links=[...(p.watchLinks||[]),...(p.externalLinks?.length?p.externalLinks:(data.SOURCES[p.id]?[{label:'View on Behance',url:data.SOURCES[p.id]}]:[]))].map(l=>({...l,_uid:uuid(),component:'case_link'}));
 return {name:p.title,slug:p.id,content:{_uid:uuid(),component:'case_study',title:p.title,summary:p.summary,role:p.role,year:p.year,context:p.context||'',links,media}};
});
fs.mkdirSync('docs/storyblok',{recursive:true});fs.writeFileSync('docs/storyblok/import-bundle.json',JSON.stringify({components,folder:'project',stories},null,2)+'\n');console.log(`Prepared ${stories.length} case studies and ${components.length} components; no remote changes made.`);
