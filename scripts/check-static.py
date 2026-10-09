from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import json,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.tags=[];self.main=False;self.text=[];self.json=[];self.ld=False;self.buf=''
 def handle_starttag(self,t,attrs):
  d=dict(attrs);self.tags.append((t,d))
  if t=='main':self.main=True
  if t=='script' and d.get('type')=='application/ld+json':self.ld=True;self.buf=''
 def handle_endtag(self,t):
  if t=='main':self.main=False
  if t=='script' and self.ld:self.json.append(json.loads(self.buf));self.ld=False
 def handle_data(self,d):
  if self.main:self.text.append(d)
  if self.ld:self.buf+=d
urls=ET.parse(root/'sitemap.xml').getroot();files=[root/url[0].text.split('/thatsme/')[1]/'index.html' for url in urls]
errors=[]
for f in files:
 p=Page();p.feed(f.read_text());label=str(f.relative_to(root))
 def check(ok,msg):
  if not ok:errors.append(label+': '+msg)
 check(sum(t=='h1' for t,d in p.tags)==1,'expected exactly one H1')
 check(len(' '.join(p.text))>100,'main content missing')
 check(len(p.json)==1,'missing structured data')
 check(not any(t=='meta' and d.get('name')=='robots' and 'noindex' in d.get('content','') for t,d in p.tags),'public page marked noindex')
 check(any(t=='link' and d.get('rel')=='canonical' for t,d in p.tags),'missing canonical')
 for t,d in p.tags:
  if t=='img':
   check('alt' in d,'missing alt');check(bool(d.get('src')) or d.get('id')=='lightbox-image','missing image src')
  for attr in (['src','poster'] if t in ['img','video','script'] else ['href'] if t in ['a','link'] else []):
   v=d.get(attr,'');u=urlparse(v)
   if not v or u.scheme or v.startswith('#'):continue
   target=root/unquote(u.path)
   if u.path.endswith('/'):target=target/'index.html'
   check(target.exists(),'missing local target '+v)
 check(not any(t=='a' and d.get('href','').startswith('#/') for t,d in p.tags),'hash page link remains')
print('Audited',len(files),'pages directly from HTML, without executing JavaScript.')
if errors:print('\n'.join(sorted(set(errors))));raise SystemExit(1)
print('Content, headings, metadata, JSON-LD, image sources, and local links passed.')
