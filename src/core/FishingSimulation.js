import {Random} from './Random.js';
import {BY_ID,THEMES} from '../config/creatures.js';
import {sweepCircleBox} from '../systems/collision.js';
import {netScore} from '../systems/scoring.js';
import {netFacts} from '../systems/Progress.js';
import {CAST_TICKS,SPLASH_TICK} from '../config/net-motion.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class FishingSimulation {
  constructor(seed=1,themeIndex=0,runId='run-'+seed){
    this.seed=seed;this.runId=runId;this.themeIndex=themeIndex%3;this.rng=new Random(seed);
    this.tick=0;this.playTick=0;this.phase='PLAYING';this.boat={x:500,px:500,cooldown:0};
    this.creatures=[];this.nets=[];this.controlledNetId=null;this.pressArmed=true;this.physicalOwnerId=null;
    this.nextId=1;this.nextSpawn=1;this.nextShallow=900;this.nextRare=4320;this.events=[];
    this.stats={casts:0,completedNets:0,emptyNets:0,fullNets:0,score:0,bestNetScore:0,bestNetCount:0,bestNetSlots:0,caughtByType:{}};
  }
  emit(type,data={}){this.events.push({type,tick:this.tick,...data});}
  get controlled(){return this.nets.find(n=>n.id===this.controlledNetId);}
  command(c){
    if(this.phase!=='PLAYING')return;
    if(c.type==='CAST_DOWN'){
      if(this.physicalOwnerId!==null)return;
      if(this.controlled){this.physicalOwnerId=c.ownerId;this.pressArmed=false;return;}
      if(!this.pressArmed||this.nets.length>0||this.boat.cooldown>0)return;
      const n={id:this.nextId++,phase:'CAST',age:0,castTicks:CAST_TICKS,x:this.boat.x,y:155,px:this.boat.x,py:155,originX:this.boat.x,radius:12,openRequested:false,captured:[],usedSlots:0};
      this.nets.push(n);this.controlledNetId=n.id;this.physicalOwnerId=c.ownerId;this.pressArmed=false;
      this.boat.cooldown=27;this.stats.casts++;this.emit('cast',{x:n.x,y:155});
    }else if(c.type==='CAST_UP'&&(this.physicalOwnerId===c.ownerId||this.physicalOwnerId===null)){
      if(this.controlled)this.controlled.openRequested=true;
      this.physicalOwnerId=null;this.pressArmed=true;
    }
  }
  releasePhysical(){this.physicalOwnerId=null;this.pressArmed=true;}
  spawn(typeId,depth,x,direction,count=1){
    const c=BY_ID[typeId];const cap=typeId==='F06'?32:30;
    for(let i=0;i<count&&this.creatures.length<cap;i++){
      const offset=(i%3)*57;
      const y=depth+(c.kind==='crab'||c.kind==='lobster'?0:Math.floor(i/3)*35-15);
      const fx=x-direction*offset;
      this.creatures.push({id:this.nextId++,typeId,x:fx,px:fx,y,py:y,vx:direction*c.speed,w:c.w,h:c.h});
    }
  }
  encounter(shallow=false){
    const t=this.playTick/60,extra=THEMES[this.themeIndex].extra;
    const basics=['F01','F02','F04','F09'];
    const pool=t<12?['F01','F02','F09']:extra.filter(id=>t>=35||BY_ID[id].depths.some(d=>d<=570));
    const roll=this.rng.next();
    const id=shallow?this.rng.pick(['F01','F02','F09',...extra.filter(id=>BY_ID[id].depths.includes(360))]):t<12?this.rng.pick(pool):this.rng.pick(roll<(t<35?.45:.68)?pool:basics),c=BY_ID[id];
    const direction=this.rng.next()<.5?1:-1;
    const depth=shallow?360:this.rng.pick(c.depths);
    const count=c.cost===2?(this.rng.next()<.25?3:2):3+Math.floor(this.rng.next()*4);
    this.spawn(id,depth,direction===1?-60:1060,direction,count);
  }
  open(n){n.phase='OPEN';n.age=0;n.radius=12;this.controlledNetId=null;this.emit('open',{x:n.x,y:n.y});}
  retract(n){n.phase='RETRACT';n.age=0;n.startY=n.y;this.emit('haul',{x:n.x,y:n.y,full:n.usedSlots===6});}
  step(input={moveAxis:0,commands:[]}){
    if(this.phase==='ENDED')return;
    this.events=[];
    if(this.playTick===5400&&this.phase==='PLAYING'){
      this.phase='DRAINING';if(this.controlled)this.controlled.openRequested=true;this.physicalOwnerId=null;this.emit('draining');
    }
    const playing=this.phase==='PLAYING';
    if(playing){
      this.boat.px=this.boat.x;this.boat.x=clamp(this.boat.x+(input.moveAxis||0)*440/60,80,920);
      if(this.boat.cooldown>0)this.boat.cooldown--;
      for(const c of input.commands||[])this.command(c);
      if(this.playTick>=this.nextSpawn){this.encounter();const t=this.playTick/60;const base=t<20?2.8:t<55?2.4:2.2;this.nextSpawn=this.playTick+Math.round((base+(this.rng.next()-.5)*.6)*60);}
      if(this.playTick>=this.nextShallow){this.encounter(true);this.nextShallow+=900;}
      if(this.playTick>=this.nextRare&&this.nextRare<=5040){const d=this.rng.next()<.5?1:-1;this.spawn('F06',this.rng.pick([570,780]),d===1?-40:1040,d,1);this.nextRare+=720;this.emit('rare');}
    }
    for(const f of this.creatures){f.px=f.x;f.py=f.y;f.x+=f.vx/60;}
    const active=[];
    for(const n of this.nets){
      n.px=n.x;n.py=n.y;const oldRadius=n.radius;n.age++;
      if(n.phase==='CAST'){
        if(n.age===10)n.castFromX=this.boat.x;
        if(n.age===SPLASH_TICK)this.emit('splash',{x:n.x,y:155});
        if(n.age>=(n.castTicks||11)){n.phase='DESCEND';n.age=0;}
      }
      else if(n.phase==='DESCEND'){
        if(n.openRequested&&n.y<320)n.y=Math.min(320,n.y+6);
        else if(!n.openRequested)n.y=Math.min(1030,n.y+6);
        if((n.openRequested&&n.y>=320)||n.y>=1030)this.open(n);
      }else if(n.phase==='OPEN'){
        n.radius=12+(95-12)*Math.min(1,n.age/15);active.push({n,r0:oldRadius,r1:n.radius});
        if(n.age>=15){n.phase='HOLD';n.age=0;}
      }else if(n.phase==='HOLD'){
        active.push({n,r0:95,r1:95});
      }else if(n.phase==='RETRACT'){
        const t=Math.min(1,n.age/39),e=t*t*(3-2*t);n.x=n.originX+(this.boat.x-n.originX)*e;n.y=n.startY+(155-n.startY)*e;n.radius=95-80*Math.min(1,t*2);
        if(n.age>=39){
          const score=netScore(n.captured);const s=this.stats;s.score+=score;s.completedNets++;
          if(!n.captured.length)s.emptyNets++;if(n.usedSlots===6)s.fullNets++;
          s.bestNetScore=Math.max(s.bestNetScore,score);s.bestNetCount=Math.max(s.bestNetCount,n.captured.length);s.bestNetSlots=Math.max(s.bestNetSlots,n.usedSlots);
          for(const c of n.captured)s.caughtByType[c.typeId]=(s.caughtByType[c.typeId]||0)+1;
          const facts=netFacts(n.captured);s.badgeFacts=[...new Set([...(s.badgeFacts||[]),...facts.flags])];s.mixedNets=(s.mixedNets||0)+facts.mixed;
          n.returned=true;this.emit('return',{x:this.boat.x,y:155,score,count:n.captured.length,slots:n.usedSlots,items:n.captured});
        }
      }
    }
    const candidates=[];
    for(const {n,r0,r1} of active)for(const f of this.creatures){const t=sweepCircleBox(n,f,r0,r1);if(t!==null)candidates.push({n,f,t});}
    candidates.sort((a,b)=>a.t-b.t||a.n.id-b.n.id||a.f.id-b.f.id);
    const taken=new Set();
    for(const {n,f} of candidates){
      const c=BY_ID[f.typeId];if(taken.has(f.id)||n.usedSlots+c.cost>6)continue;
      taken.add(f.id);n.usedSlots+=c.cost;n.captured.push({creatureId:f.id,typeId:f.typeId,score:c.score,cost:c.cost});
      this.emit('capture',{x:f.x,y:f.y,typeId:f.typeId,netId:n.id});
    }
    for(const {n} of active)if(n.usedSlots===6||(n.phase==='HOLD'&&n.age>=27))this.retract(n);
    this.creatures=this.creatures.filter(f=>!taken.has(f.id)&&f.x> -400&&f.x<1400);
    this.nets=this.nets.filter(n=>!n.returned);
    if(playing)this.playTick++;this.tick++;
    if(this.phase==='DRAINING'&&!this.nets.length){this.phase='ENDED';this.emit('ended');}
  }
  snapshot(){const data=JSON.parse(JSON.stringify(this));data.rngState=this.rng.state;delete data.rng;data.events=[];data.physicalOwnerId=null;data.pressArmed=true;return {version:1,data};}
  static restore(snapshot){
    if(!snapshot||snapshot.version!==1)throw new Error('存档版本不兼容');
    const d=snapshot.data;
    if(!d||!Number.isInteger(d.tick)||d.tick<0||!Number.isInteger(d.playTick)||d.playTick<0||d.playTick>5400||!['PLAYING','DRAINING'].includes(d.phase)||!Number.isFinite(d.boat?.x)||!Number.isFinite(d.stats?.score)||!Array.isArray(d.nets)||d.nets.length>3||!Array.isArray(d.creatures)||d.creatures.length>32)throw new Error('存档损坏');
    for(const f of d.creatures)if(!BY_ID[f.typeId]||![f.x,f.y,f.px,f.py,f.vx,f.w,f.h].every(Number.isFinite))throw new Error('生物数据损坏');
    for(const n of d.nets)if(!['CAST','DESCEND','OPEN','HOLD','RETRACT'].includes(n.phase)||![n.x,n.y,n.px,n.py,n.radius,n.age].every(Number.isFinite)||!Array.isArray(n.captured)||n.captured.some(c=>!BY_ID[c.typeId])||n.usedSlots!==n.captured.reduce((s,c)=>s+BY_ID[c.typeId].cost,0)||n.usedSlots>6)throw new Error('网数据损坏');
    if(!Number.isInteger(d.themeIndex)||d.themeIndex<0||d.themeIndex>2||typeof d.runId!=='string'||!Number.isInteger(d.rngState)||!Number.isInteger(d.nextId)||d.nextId<1||![d.nextSpawn,d.nextShallow,d.nextRare].every(Number.isFinite))throw new Error('运行数据损坏');
    const controlled=d.nets.filter(n=>['CAST','DESCEND'].includes(n.phase));
    if(controlled.length>1||(controlled.length===1?d.controlledNetId!==controlled[0].id:d.controlledNetId!==null))throw new Error('控制状态损坏');
    const ids=new Set();for(const entity of [...d.nets,...d.creatures]){if(!Number.isInteger(entity.id)||ids.has(entity.id))throw new Error('实体ID损坏');ids.add(entity.id);}
    for(const n of d.nets)for(const item of n.captured){if(item.score!==BY_ID[item.typeId].score||item.cost!==BY_ID[item.typeId].cost||ids.has(item.creatureId))throw new Error('捕获数据损坏');ids.add(item.creatureId);}
    if(!d.stats.caughtByType||Object.entries(d.stats.caughtByType).some(([id,n])=>!BY_ID[id]||!Number.isSafeInteger(n)||n<0))throw new Error('统计数据损坏');
    for(const k of ['casts','completedNets','emptyNets','fullNets','score','bestNetScore','bestNetCount','bestNetSlots'])if(!Number.isSafeInteger(d.stats[k])||d.stats[k]<0)throw new Error('统计字段损坏');
    if(d.stats.badgeFacts!==undefined&&(!Array.isArray(d.stats.badgeFacts)||d.stats.badgeFacts.length>24||d.stats.badgeFacts.some(id=>!/^([BC]0[1-8]|C(09|1[0-2]))$/.test(id))))throw new Error('徽章事实损坏');
    if(d.stats.mixedNets!==undefined&&(!Number.isSafeInteger(d.stats.mixedNets)||d.stats.mixedNets<0||d.stats.mixedNets>d.stats.completedNets))throw new Error('搭配统计损坏');
    if(d.boat.x<80||d.boat.x>920||!Number.isInteger(d.boat.cooldown)||d.boat.cooldown<0||d.boat.cooldown>27||d.runId.length>128||(d.phase==='DRAINING'&&d.playTick!==5400))throw new Error('局状态损坏');
    for(const n of d.nets)if(n.age<0||n.age>147||n.y<155||n.y>1030||n.captured.length>6||(n.phase==='RETRACT'&&!Number.isFinite(n.startY))||(n.castTicks!==undefined&&![11,CAST_TICKS].includes(n.castTicks))||(n.castFromX!==undefined&&!Number.isFinite(n.castFromX)))throw new Error('网状态损坏');
    if([...ids].some(id=>id<1||id>=d.nextId))throw new Error('ID序列损坏');
    const sim=new FishingSimulation(d.seed,d.themeIndex,d.runId);for(const key of Object.keys(sim))if(key!=='rng'&&Object.prototype.hasOwnProperty.call(d,key))sim[key]=d[key];sim.rng=new Random(1);sim.rng.state=d.rngState>>>0;sim.releasePhysical();sim.events=[];return sim;
  }
}
