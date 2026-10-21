import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validPreview} from '../src/lib/preview-auth.js';
const secret='test-secret',space='123',now=2000000000;
function signed(timestamp=now){const u=new URL('https://example.com/editor/project/wizcrm/');u.searchParams.set('_storyblok_tk[space_id]',space);u.searchParams.set('_storyblok_tk[timestamp]',String(timestamp));u.searchParams.set('_storyblok_tk[token]',createHash('sha1').update(`${space}:${secret}:${timestamp}`).digest('hex'));return u;}
test('valid signed editor request is accepted',()=>assert.equal(validPreview(signed(),secret,space,now),true));
test('missing credentials and signatures are rejected',()=>{assert.equal(validPreview(signed(),'',space,now),false);assert.equal(validPreview(new URL('https://example.com'),secret,space,now),false);});
test('wrong space, wrong token, expired and future signatures are rejected',()=>{assert.equal(validPreview(signed(),secret,'456',now),false);assert.equal(validPreview(signed(),'wrong',space,now),false);assert.equal(validPreview(signed(now-3600),secret,space,now),false);assert.equal(validPreview(signed(now+1),secret,space,now),false);});
