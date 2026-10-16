// Compatibility entry point. Astro is the single production build.
const {execFileSync}=require('node:child_process');
execFileSync('npm',['run','build'],{stdio:'inherit'});
