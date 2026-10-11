const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
process.env.SITE_URL=process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL : 'https://'+process.env.VERCEL_URL);
execFileSync(process.execPath,['scripts/build.cjs'],{stdio:'inherit'});
fs.mkdirSync('public',{recursive:true});
for(const name of ['assets','about','work','studies','project','approach','index.html','404.html','robots.txt','sitemap.xml','Shubham-Shinde-Resume.html','about.html','about-v2.html','about-v3.html','approach.html']) fs.cpSync(name,'public/'+name,{recursive:true});
