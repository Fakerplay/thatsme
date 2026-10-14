const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
process.env.SITE_URL=process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL : 'https://'+process.env.VERCEL_URL);
execFileSync(process.execPath,['scripts/build.cjs'],{stdio:'inherit'});
fs.mkdirSync('public',{recursive:true});
for(const name of ['assets','about','work','studies','project','approach','index.html','404.html','robots.txt','sitemap.xml','Shubham-Shinde-Resume.html','about.html','about-v2.html','about-v3.html','approach.html']) fs.cpSync(name,'public/'+name,{recursive:true});

// Vercel's HTML integration; keep tracking out of local and GitHub Pages builds.
const analytics='<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};</script><script defer src="/_vercel/insights/script.js"></script>';
function addAnalytics(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=directory+'/'+entry.name;
  if(entry.isDirectory())addAnalytics(file);
  else if(entry.name.endsWith('.html')){
   const html=fs.readFileSync(file,'utf8');
   if(!html.includes('/_vercel/insights/script.js'))fs.writeFileSync(file,html.replace('</body>',analytics+'</body>'));
  }
 }
}
addAnalytics('public');
