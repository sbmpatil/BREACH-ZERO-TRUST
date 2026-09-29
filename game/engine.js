const map=require('./map'); const alerts=require('./alerts');
const MAX_ROUNDS=12, ISOLATIONS=3, EXPLOITS=3, DECOYS=2, MAX_HONEYPOTS=2;
function createGame(playerIds,intruderId){
 return {phase:'setup',round:1,winner:null,reason:null,players:playerIds.map(id=>({id,role:id===intruderId?'intruder':'soc',acted:false})),intruderId,
 intruder:{position:null,history:[],exploitUses:EXPLOITS,decoyUses:DECOYS,lastLieLow:false,exfiltrationPending:false},isolated:[],honeypots:[],investigations:{},isolationsLeft:ISOLATIONS,alerts:[],roundAlertDetails:[],socActionsNeeded:playerIds.length===2?2:playerIds.length-1,socActionsTaken:0};
}
function startAt(s,node){ if(s.phase!=='setup')throw Error('Already started'); if(!['vpn','web','email'].includes(node))throw Error('Invalid entry'); s.intruder.position=node;s.intruder.history.push({round:1,node,action:'start'});s.phase='intruder';return s; }
function legalNeighbors(s,node=s.intruder.position){return map.adjacency[node].filter(n=>!s.isolated.includes(n));}
function reachableWithin(s,start,hops){let seen=new Set([start]),front=[start];for(let i=0;i<hops;i++){front=front.flatMap(x=>map.adjacency[x]).filter(x=>!s.isolated.includes(x)&&!seen.has(x)&&(seen.add(x),true));}return [...seen];}
function validateIntruder(s,a){
 if(s.phase!=='intruder'||s.winner)throw Error('Not intruder phase'); const pos=s.intruder.position;
 if(a.type==='stealth'){if(!map.adjacency[pos].includes(a.node)||s.isolated.includes(a.node))throw Error('Illegal stealth move');}
 else if(a.type==='exploit'){if(s.intruder.exploitUses<=0)throw Error('No exploit chains left');if(s.isolated.includes(a.node)||a.node===pos)throw Error('Illegal exploit'); const paths=reachableWithin(s,pos,2);if(!paths.includes(a.node))throw Error('No legal route');}
 else if(a.type==='decoy'){if(s.intruder.decoyUses<=0)throw Error('No decoys left');if(!map.byId[a.node]||map.shortestPathDistance(pos,a.node,3)>3)throw Error('Illegal decoy target');}
 else if(a.type==='lieLow'){if(s.intruder.lastLieLow)throw Error('Cannot lie low twice');}
 else throw Error('Unknown action');
}
function intruderAction(s,a,rng=Math.random){
 validateIntruder(s,a); let generated=[]; const old=s.intruder.position;
 if(a.type==='stealth'){s.intruder.position=a.node;s.intruder.lastLieLow=false;generated.push(alerts.realAlert('stealth',a.node));}
 if(a.type==='exploit'){s.intruder.position=a.node;s.intruder.exploitUses--;s.intruder.lastLieLow=false;generated.push(alerts.realAlert('exploit',a.node));}
 if(a.type==='decoy'){s.intruder.decoyUses--;s.intruder.lastLieLow=false;generated.push(alerts.decoyAlert(a.node));}
 if(a.type==='lieLow')s.intruder.lastLieLow=true;
 s.intruder.history.push({round:s.round,node:s.intruder.position,action:a.type,from:old});
 if(s.honeypots.includes(s.intruder.position)&&s.intruder.position!==old)generated.push(alerts.critical(`Honeypot triggered — ${map.byId[s.intruder.position].name}`));
 if(s.intruder.position==='vault'&&!s.intruder.exfiltrationPending){s.intruder.exfiltrationPending=true;generated.push(alerts.critical('Large outbound data transfer detected'));}
 const noises=alerts.noise(2+Math.floor(rng()*3),rng); s.roundAlertDetails=alerts.shuffle([...generated,...noises],rng);s.alerts.push(...s.roundAlertDetails);s.phase='soc';s.socActionsTaken=0;s.players.forEach(p=>p.acted=false);return s;
}
function socAction(s,playerId,a){
 if(s.phase!=='soc'||s.winner)throw Error('Not SOC phase'); const p=s.players.find(x=>x.id===playerId);if(!p||p.role!=='soc')throw Error('Not defender');
 const maxForPlayer=s.players.length===2?2:1; const used=p.actionsThisRound||0;if(used>=maxForPlayer)throw Error('No actions left'); if(!map.byId[a.node])throw Error('Invalid node');
 if(a.type==='investigate'){const visits=s.intruder.history.filter(h=>h.node===a.node).map(h=>h.round);s.investigations[a.node]=visits;}
 else if(a.type==='isolate'){if(a.node==='vault'&&!s.intruder.exfiltrationPending)throw Error('Vault can only be isolated during exfiltration');if(s.isolationsLeft<=0||s.isolated.includes(a.node))throw Error('Cannot isolate');s.isolated.push(a.node);s.isolationsLeft--;if(s.intruder.position===a.node)return win(s,'soc','Intruder captured by isolation');}
 else if(a.type==='honeypot'){if(s.honeypots.includes(a.node))throw Error('Already honeypotted');if(s.honeypots.length>=MAX_HONEYPOTS)s.honeypots.shift();s.honeypots.push(a.node);}
 else if(a.type==='skip'){} else throw Error('Unknown SOC action');
 p.actionsThisRound=used+1;s.socActionsTaken++;
 if(s.socActionsTaken>=s.socActionsNeeded)finishSocPhase(s);return s;
}
function finishSocPhase(s){
 if(s.winner)return s;
 if(s.intruder.exfiltrationPending&&s.intruder.position==='vault')return win(s,'intruder','Crown Jewels exfiltrated');
 if(legalNeighbors(s).length===0)return win(s,'soc','Intruder trapped');
 if(s.round>=MAX_ROUNDS)return win(s,'soc','Network held for 12 rounds');
 s.round++;s.phase='intruder';s.players.forEach(p=>{p.acted=false;p.actionsThisRound=0});return s;
}
function win(s,winner,reason){s.winner=winner;s.reason=reason;s.phase='gameover';return s;}
function publicState(s,viewerId){
 const role=s.players.find(p=>p.id===viewerId)?.role; const common={phase:s.phase,round:s.round,winner:s.winner,reason:s.reason,isolated:s.isolated,isolationsLeft:s.isolationsLeft,alerts:s.alerts.map(({kind,...a})=>a)};
 if(s.phase==='gameover')return {...common,investigations:s.investigations,honeyCount:s.honeypots.length,intruderId:s.intruderId,history:s.intruder.history,alertReveal:s.alerts};
 if(role==='intruder')return {...common,role,position:s.intruder.position,history:s.intruder.history,exploitUses:s.intruder.exploitUses,decoyUses:s.intruder.decoyUses,lastLieLow:s.intruder.lastLieLow};
 return {...common,role,investigations:s.investigations,honeyCount:s.honeypots.length};
}
module.exports={createGame,startAt,intruderAction,socAction,finishSocPhase,publicState,legalNeighbors,MAX_ROUNDS};
