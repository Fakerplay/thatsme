import {defineConfig} from 'astro/config';
export default defineConfig({
 site:'https://studioshubham.vercel.app',
 output:'static', trailingSlash:'always',
 build:{format:'directory'},
 devToolbar:{enabled:false},
});
