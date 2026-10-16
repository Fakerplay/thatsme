const companies={Daulat:'https://daulat.co.in/',insightIQ:'https://www.insightiq.ai/use-cases/influencer-marketing',WizCommerce:'https://wizcommerce.com/',Prachyam:'https://prachyam.com/',Phyllo:'https://www.getphyllo.com/',Ecolab:'https://www.ecolab.com/','100kmph':'https://100kmph.com/'};
function companyLinks(html){let blocked=0;return html.split(/(<[^>]+>)/g).map(part=>{if(part[0]==='<'){if(/^<(a|button)\b/.test(part))blocked++;if(/^<\/(a|button)>/.test(part))blocked--;return part;}return blocked?part:part.replace(/\b(WizCommerce|Prachyam|Phyllo|Ecolab|100kmph|Daulat|insightIQ)\b/g,name=>'<a class="company-link" href="'+companies[name]+'">'+name+'</a>')}).join('')}

export {companies,companyLinks};
