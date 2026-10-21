// Run only after connecting the intended blank Storyblok space.
import fs from 'node:fs';
const bundle=JSON.parse(fs.readFileSync('docs/storyblok/import-bundle.json','utf8'));
if(!process.argv.includes('--apply')){
 console.log(`Dry run: create ${bundle.components.length} components and ${bundle.stories.length} draft case studies inside /${bundle.folder}/. No remote writes. Use --apply after configuring credentials.`);
 process.exit(0);
}
const token=process.env.STORYBLOK_MANAGEMENT_TOKEN;
const space=process.env.STORYBLOK_SPACE_ID;
const region=process.env.STORYBLOK_REGION||'eu';
const hosts={eu:'mapi.storyblok.com',us:'api-us.storyblok.com',ap:'api-ap.storyblok.com',ca:'api-ca.storyblok.com',cn:'app.storyblokchina.cn'};
if(!token||!/^\d+$/.test(space||'')||!hosts[region])throw new Error('Set STORYBLOK_MANAGEMENT_TOKEN, STORYBLOK_SPACE_ID and a valid STORYBLOK_REGION.');
const base=`https://${hosts[region]}/v1/spaces/${space}/`;
async function api(path,body){
 const res=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 if(!res.ok)throw new Error(`Storyblok ${res.status} for ${path.split('?')[0]}. Import stopped; no existing content was overwritten.`);
 return res.json();
}
const existing=(await api('components')).components;
for(const component of bundle.components){
 if(existing.some(c=>c.name===component.name)){console.log(`Keep existing component: ${component.name}`);continue;}
 await api('components',{component});
}
const folders=(await api('stories?by_slugs=project&per_page=100')).stories;
let folder=folders.find(s=>s.slug===bundle.folder&&s.is_folder);
if(!folder)folder=(await api('stories',{story:{name:'Projects',slug:bundle.folder,is_folder:true}})).story;
let page=1,stories=[];
while(true){const batch=(await api(`stories?starts_with=project/&per_page=100&page=${page++}`)).stories;stories.push(...batch);if(batch.length<100)break;}
for(const story of bundle.stories){
 if(stories.some(s=>s.full_slug===`${bundle.folder}/${story.slug}`)){console.log(`Keep existing story: ${story.slug}`);continue;}
 await api('stories',{story:{...story,parent_id:folder.id}});
 console.log(`Created draft: ${story.slug}`);
}
console.log('Import complete. Stories remain drafts; review them before publishing.');
