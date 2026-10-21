import {storyblok} from '@storyblok/astro';
import {loadEnv} from 'vite';
const env=loadEnv('',process.cwd(),'STORYBLOK_');
import vercel from '@astrojs/vercel';
import {defineConfig} from 'astro/config';
export default defineConfig({
 integrations:[storyblok({accessToken:env.STORYBLOK_DELIVERY_API_TOKEN,apiOptions:{region:env.STORYBLOK_REGION||'eu'},bridge:false,livePreview:false,components:{case_study:'storyblok/CaseStudy',case_media:'storyblok/CaseMedia',case_link:'storyblok/CaseLink'}})],
 site:'https://studioshubham.vercel.app',
 adapter:vercel(),
 output:'static', trailingSlash:'always',
 build:{format:'directory'},
 devToolbar:{enabled:false},
});
