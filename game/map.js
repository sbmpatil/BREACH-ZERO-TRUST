const nodes = [
  ['vpn','VPN Gateway','Internet Edge',10,18],['web','Web Server','Internet Edge',50,12],['email','Email Gateway','Internet Edge',90,18],
  ['ws1','WS-01','User Zone',12,38],['ws2','WS-02','User Zone',28,48],['ws3','WS-03','User Zone',45,36],['ws4','WS-04','User Zone',62,48],['print','Print Server','User Zone',78,36],['hr','HR Laptop','User Zone',92,48],
  ['file','File Server','Server Zone',15,68],['mail','Mail Server','Server Zone',34,62],['jump','Jump Host','Server Zone',51,70],['backup','Backup Server','Server Zone',69,62],['dev','Dev Server','Server Zone',87,68],
  ['dc','Domain Controller','Core',30,86],['db','Database Server','Core',52,88],['admin','Admin Console','Core',74,86],
  ['vault','CROWN JEWELS','Vault',52,98]
].map(([id,name,zone,x,y])=>({id,name,zone,x,y}));

const edges = [
 ['vpn','ws1'],['vpn','ws2'],['web','ws2'],['web','ws3'],['web','ws4'],['email','print'],['email','hr'],
 ['ws1','ws2'],['ws1','file'],['ws2','mail'],['ws3','mail'],['ws3','jump'],['ws4','jump'],['ws4','backup'],['print','backup'],['print','hr'],['hr','dev'],
 ['file','mail'],['file','dc'],['mail','jump'],['mail','dc'],['jump','db'],['jump','admin'],['backup','jump'],['backup','admin'],['dev','backup'],['dev','admin'],
 ['dc','db'],['db','admin'],['dc','vault'],['db','vault']
];
const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));
const adjacency = Object.fromEntries(nodes.map(n=>[n.id,[]]));
for (const [a,b] of edges){ adjacency[a].push(b); adjacency[b].push(a); }
function shortestPathDistance(start,end,max=Infinity){
 if(start===end)return 0; const q=[[start,0]], seen=new Set([start]);
 while(q.length){const [cur,d]=q.shift(); if(d>=max)continue; for(const n of adjacency[cur]){if(n===end)return d+1;if(!seen.has(n)){seen.add(n);q.push([n,d+1]);}}} return Infinity;
}
module.exports={nodes,edges,byId,adjacency,shortestPathDistance};
