/* Link employer mentions without replacing project navigation or interactive labels. */
(()=>{
 const companies={WizCommerce:'https://wizcommerce.com/',Prachyam:'https://prachyam.com/',Phyllo:'https://www.getphyllo.com/',Ecolab:'https://www.ecolab.com/','100kmph':'https://100kmph.com/'};
 const names=new Map(Object.entries(companies).map(([name,url])=>[name.toLowerCase(),url]));
 const pattern=/\b(WizCommerce|Prachyam|Phyllo|Ecolab|100kmph)\b/gi;
 function linkMentions(root){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
  if(root.nodeType===Node.TEXT_NODE)nodes.push(root);
  else while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   if(!node.parentElement||node.parentElement.closest('a,button,script,style,textarea,input,select,option,[contenteditable="true"]'))continue;
   const matches=[...node.data.matchAll(pattern)];if(!matches.length)continue;
   const fragment=document.createDocumentFragment();let last=0;
   for(const match of matches){fragment.append(node.data.slice(last,match.index));const a=document.createElement('a');a.className='company-link';a.href=names.get(match[0].toLowerCase());a.textContent=match[0];fragment.append(a);last=match.index+match[0].length;}
   fragment.append(node.data.slice(last));node.replaceWith(fragment);
  }
 }
 linkMentions(document.body);
 new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.isConnected)linkMentions(node);}).observe(document.body,{childList:true,subtree:true});
})();
