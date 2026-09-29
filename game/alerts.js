const {nodes,byId}=require('./map');
const noiseTemplates=[
 n=>`Failed login — ${n.name}`,
 n=>`Unusual DNS query — Zone: ${n.zone}`,
 n=>`Endpoint policy mismatch — ${n.name}`,
 n=>`Routine vulnerability scan — Zone: ${n.zone}`,
 n=>`Authentication retry burst — ${n.name}`,
 n=>`Unexpected service restart — ${n.name}`
];
function stamp(){return new Date().toISOString();}
function realAlert(action,dest){
 const n=byId[dest];
 if(action==='stealth')return {severity:'LOW',message:`Suspicious lateral activity — Zone: ${n.zone}`,kind:'real',timestamp:stamp()};
 if(action==='exploit')return {severity:'HIGH',message:`Exploit signature confirmed — ${n.name}`,kind:'real',timestamp:stamp()};
 return null;
}
function decoyAlert(node){return {severity:'HIGH',message:`Exploit signature confirmed — ${byId[node].name}`,kind:'decoy',timestamp:stamp()};}
function critical(message){return {severity:'CRITICAL',message,kind:'real',timestamp:stamp()};}
function noise(count,rng=Math.random){return Array.from({length:count},()=>{const n=nodes[Math.floor(rng()*nodes.length)];const f=noiseTemplates[Math.floor(rng()*noiseTemplates.length)];return {severity:rng()<.65?'LOW':'MEDIUM',message:f(n),kind:'noise',timestamp:stamp()};});}
function shuffle(items,rng=Math.random){for(let i=items.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
module.exports={realAlert,decoyAlert,critical,noise,shuffle};
