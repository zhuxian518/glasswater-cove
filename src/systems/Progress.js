import {BY_ID} from '../config/creatures.js';
import {BADGES,FIRST_CATCH_IDS,COMBO_PAIRS} from '../config/badges.js';
export const QUESTS=[
  {id:'catch',name:'装一小篮海风',text:'累计带回 12 只伙伴',target:12},
  {id:'nets',name:'慢慢练习就好',text:'累计完成 5 张非空网',target:5},
  {id:'mix',name:'听见两种声音',text:'累计完成 3 张含两种生物的网',target:3}
];
export const emptyProgress=()=>({version:1,runs:0,badges:{},equipped:[],quest:{id:'catch',value:0},letters:0});
export function normalizeProgress(d){const p=emptyProgress();if(!d||d.version!==1)return p;for(const k of ['runs','letters'])p[k]=Number.isSafeInteger(d[k])&&d[k]>=0?d[k]:0;for(const b of BADGES)if(Number.isFinite(d.badges?.[b.id])&&d.badges[b.id]>0)p.badges[b.id]=d.badges[b.id];p.equipped=Array.isArray(d.equipped)?[...new Set(d.equipped)].filter(id=>p.badges[id]).slice(0,3):[];const q=QUESTS.find(q=>q.id===d.quest?.id);if(q)p.quest={id:q.id,value:Math.max(0,Math.min(q.target,Number.isSafeInteger(d.quest.value)?d.quest.value:0))};return p;}
export function netFacts(items){const ids=items.map(c=>c.typeId),big=items.filter(c=>c.cost===2).length,flags=[];if(items.length)flags.push('B01');if(items.reduce((n,c)=>n+c.cost,0)===6)flags.push('B02');if(items.length===6&&big===0)flags.push('B03');if(big===3)flags.push('B04');if(big===1&&items.length===5)flags.push('B05');const types=new Set(ids).size;for(let i=3;i<=5;i++)if(types>=i)flags.push('B0'+(i+3));COMBO_PAIRS.forEach((pair,i)=>{if(pair.every(id=>ids.includes(id)))flags.push('C'+String(i+1).padStart(2,'0'));});return {flags,mixed:types>=2?1:0};}
export function awardProgress(profile,stats,oldBest,now=Date.now()){
  const p=profile.progress,pending=new Set(stats.badgeFacts||[]),newBadges=[];p.runs++;
  FIRST_CATCH_IDS.forEach((id,i)=>{if(profile.collection[id])pending.add('A'+String(i+1).padStart(2,'0'));});
  [1,3,10,30,60].forEach((n,i)=>{if(p.runs>=n)pending.add('D0'+(i+1));});if(oldBest>0&&stats.score>oldBest)pending.add('D06');if(profile.bestNetScore>=100)pending.add('D07');if(profile.bestNetScore>=200)pending.add('D08');
  const discovered=Object.values(profile.collection).filter(n=>n>0).length;if(discovered>=10)pending.add('D09');if(discovered>=20)pending.add('D10');if(profile.bestNetScore>=300)pending.add('D11');if(stats.score>=1000)pending.add('D12');
  for(const b of BADGES)if(pending.has(b.id)&&!p.badges[b.id]){p.badges[b.id]=now;newBadges.push(b.id);}
  const q=QUESTS.find(q=>q.id===p.quest.id),amount=q.id==='catch'?Object.values(stats.caughtByType).reduce((a,b)=>a+b,0):q.id==='nets'?stats.completedNets-stats.emptyNets:stats.mixedNets||0;
  const before=p.quest.value;p.quest.value=Math.min(q.target,before+amount);const questCompleted=before<q.target&&p.quest.value===q.target;if(questCompleted)p.letters++;
  return {newBadges,questCompleted};
}
export function backfillCollection(profile){const p=profile.progress;FIRST_CATCH_IDS.forEach((id,i)=>{if(profile.collection[id]&&!p.badges['A'+String(i+1).padStart(2,'0')])p.badges['A'+String(i+1).padStart(2,'0')]=Date.now();});}
