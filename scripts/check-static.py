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
urls=ET.parse(root/'sitemap.xml').getroot();files=[root/urlparse(url[0].text).path.lstrip('/')/'index.html' for url in urls]
errors=[]
for f in files:
 p=Page();p.feed(f.read_text());label=str(f.relative_to(root))
 def check(ok,msg):
  if not ok:errors.append(label+': '+msg)
 check(sum(t=='h1' for t,d in p.tags)==1,'expected exactly one H1')
 check(len(' '.join(p.text))>100,'main content missing')
 check(len(p.json)==1,'missing structured data')
 check(not any(t=='meta' and d.get('name')=='robots' and 'noindex' in d.get('content','') for t,d in p.tags),'public page marked noindex')
 expected='https://studioshubham.vercel.app/'+str(f.parent.relative_to(root)).replace('\\','/').strip('.')
 if not expected.endswith('/'):expected+='/'
 check(any(t=='link' and d.get('rel')=='canonical' and d.get('href')==expected for t,d in p.tags),'incorrect primary canonical')
 check(any(t=='meta' and d.get('property')=='og:url' and d.get('content')==expected for t,d in p.tags),'incorrect social URL')
 graph=p.json[0]['@graph'] if p.json else []
 check(any(n.get('@type')=='Person' and 'https://www.linkedin.com/in/shubhamshinde' in n.get('sameAs',[]) for n in graph),'missing LinkedIn identity')
 if label.startswith('project/'):
  check(any(n.get('@type')=='BreadcrumbList' for n in graph),'missing project breadcrumbs')
  check(not any(t=='meta' and d.get('property')=='og:image' and 'about-shubham' in d.get('content','') for t,d in p.tags),'project social preview uses portrait')
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
