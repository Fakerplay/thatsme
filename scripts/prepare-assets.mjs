import fs from 'node:fs';
fs.mkdirSync('public',{recursive:true});
// The original media remain in assets to preserve Git history and URLs.
fs.rmSync('public/assets',{recursive:true,force:true});
fs.cpSync('assets','public/assets',{recursive:true,filter:source=>!/^site\.[a-f0-9]+\.(css|js)$/.test(source.split('/').pop())});
for(const file of ['Shubham-Shinde-Resume.html','about.html','about-v2.html','about-v3.html','approach.html','google3a7a23031d48f7ff.html'])fs.copyFileSync(file,'public/'+file);
fs.mkdirSync('public/approach',{recursive:true});
fs.copyFileSync('approach/index.html','public/approach/index.html');
