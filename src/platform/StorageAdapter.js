import {CREATURES} from '../config/creatures.js';
import {emptyProgress,normalizeProgress,awardProgress,backfillCollection} from '../systems/Progress.js';
import {FishingSimulation} from '../core/FishingSimulation.js';
const PROFILE='castfishing-profile-v1',CHECKPOINT='castfishing-checkpoint-v1';
export function freshProfile(){return {schemaVersion:1,productId:'castfishing',recordVersion:'fishing-v0.4',runSequence:0,bestScore:0,bestNetScore:0,collection:CREATURES.reduce((o,c)=>(o[c.id]=0,o),{}),history:[],committedRunIds:[],progress:emptyProgress(),settings:{sound:false,music:false,ambience:false},tutorialSeen:false};}
export class StorageAdapter {
  constructor(storage){this.storage=storage;this.available=!!storage;}
  read(key){try{return JSON.parse(this.storage.getItem(key));}catch{return null;}}
  write(key,value){try{this.storage.setItem(key,JSON.stringify(value));return true;}catch{this.available=false;return false;}}
  loadProfile(){
    const d=this.read(PROFILE),p=freshProfile();if(!d||d.productId!==p.productId||d.schemaVersion!==1)return p;
    p.runSequence=Number.isSafeInteger(d.runSequence)&&d.runSequence>=0?d.runSequence:0;
    for(const k of ['bestScore','bestNetScore'])p[k]=Number.isFinite(d[k])&&d[k]>=0?d[k]:0;
    for(const c of CREATURES){const n=d.collection?.[c.id];p.collection[c.id]=Number.isSafeInteger(n)&&n>=0?n:0;}
    p.committedRunIds=Array.isArray(d.committedRunIds)?d.committedRunIds.filter(x=>typeof x==='string').slice(-60):[];
    p.history=Array.isArray(d.history)?d.history.filter(h=>h&&typeof h.runId==='string'&&Number.isFinite(h.score)&&h.score>=0&&Number.isFinite(h.at)&&Number.isInteger(h.seed)&&Number.isInteger(h.theme)&&h.theme>=0&&h.theme<3).slice(-60).map(h=>{const row={runId:h.runId,seed:h.seed,theme:h.theme,score:h.score,at:h.at},s=h.stats;if(s&&['completedNets','fullNets','bestNetScore'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0)&&s.caughtByType&&typeof s.caughtByType==='object'&&Object.entries(s.caughtByType).every(([id,n])=>CREATURES.some(c=>c.id===id)&&Number.isSafeInteger(n)&&n>=0))row.stats=s;return row;}):[];
    p.progress=normalizeProgress(d.progress);backfillCollection(p);for(const k of ['sound','music','ambience'])p.settings[k]=d.settings?.[k]===true;p.tutorialSeen=d.tutorialSeen===true;return p;
  }
  saveProfile(p){return this.write(PROFILE,p);}
  loadCheckpoint(){return this.read(CHECKPOINT);}
  saveCheckpoint(sim){return this.write(CHECKPOINT,sim.snapshot());}
  clearCheckpoint(){try{this.storage.removeItem(CHECKPOINT);}catch{this.available=false;}}
  inspectBackup(text){
    const b=JSON.parse(text);if(b?.format!=='glasswater-backup-v1'||b.profile?.productId!=='castfishing'||b.profile?.schemaVersion!==1)throw Error('这不是可读取的海湾备份。');
    const profile=new StorageAdapter({getItem:()=>JSON.stringify(b.profile)}).loadProfile();
    if(b.checkpoint)FishingSimulation.restore(b.checkpoint);
    return {profile,checkpoint:b.checkpoint||null};
  }
  restoreBackup(b){
    let oldProfile,oldCheckpoint;try{oldProfile=this.storage.getItem(PROFILE);oldCheckpoint=this.storage.getItem(CHECKPOINT);this.storage.setItem(PROFILE,JSON.stringify(b.profile));if(b.checkpoint)this.storage.setItem(CHECKPOINT,JSON.stringify(b.checkpoint));else this.storage.removeItem(CHECKPOINT);return true;}
    catch{try{if(oldProfile!=null)this.storage.setItem(PROFILE,oldProfile);else this.storage.removeItem(PROFILE);if(oldCheckpoint!=null)this.storage.setItem(CHECKPOINT,oldCheckpoint);else this.storage.removeItem(CHECKPOINT);}catch{}return false;}
  }
  commit(profile,sim){
    if(profile.committedRunIds.includes(sim.runId))return {profile,newSpecies:[],newRecord:false,saved:true};
    const p=JSON.parse(JSON.stringify(profile)),s=sim.stats,newSpecies=[],oldBest=p.bestScore;p.progress=normalizeProgress(p.progress);
    for(const [id,n] of Object.entries(s.caughtByType)){if(!p.collection[id])newSpecies.push(id);p.collection[id]=(p.collection[id]||0)+n;}
    const newRecord=s.score>p.bestScore;p.bestScore=Math.max(p.bestScore,s.score);p.bestNetScore=Math.max(p.bestNetScore,s.bestNetScore);
    p.committedRunIds.push(sim.runId);p.committedRunIds=p.committedRunIds.slice(-60);
    p.history.push({runId:sim.runId,seed:sim.seed,theme:sim.themeIndex,score:s.score,at:Date.now(),stats:JSON.parse(JSON.stringify(s))});p.history=p.history.slice(-60);p.tutorialSeen=true;
    const rewards=awardProgress(p,s,oldBest);
    const saved=this.saveProfile(p);if(saved)this.clearCheckpoint();return {profile:p,newSpecies,newRecord,saved,...rewards};
  }
}
