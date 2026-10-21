import {createHash,timingSafeEqual} from 'node:crypto';
// Storyblok signs editor URLs with the space's preview token. Never send it to the browser.
export function validPreview(url,secret,space,now=Math.floor(Date.now()/1000)) {
 const q=url.searchParams,timestamp=q.get('_storyblok_tk[timestamp]'),signature=q.get('_storyblok_tk[token]');
 if(!secret||q.get('_storyblok_tk[space_id]')!==space||!/^\d+$/.test(timestamp||'')||! /^[a-f0-9]{40}$/.test(signature||''))return false;
 const age=now-Number(timestamp); if(age<0||age>=3600)return false;
 const expected=createHash('sha1').update(`${space}:${secret}:${timestamp}`).digest('hex');
 return timingSafeEqual(Buffer.from(expected),Buffer.from(signature));
}
