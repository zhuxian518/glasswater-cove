import {FishingSimulation} from '../src/core/FishingSimulation.js';
const modes=['fixed-shallow','moving-shallow','fixed-deep','observe'];
for(const mode of modes){const out={casts:0,empty:0,full:0,score:0,animals:0};
  for(let seed=1;seed<=100;seed++){
    const s=new FishingSimulation(seed,seed%3);let pressed=false,nextCast=0,targetDepth=320;
    while(s.phase!=='ENDED'){
      const commands=[];let axis=0;
      if(mode==='moving-shallow')axis=Math.sin(s.tick*.012)>.2?1:-1;
      if(mode==='observe'){
        // Uses only visible current positions and velocities, not schedule or RNG.
        const visible=s.creatures.filter(f=>f.x>80&&f.x<920);
        const target=visible.sort((a,b)=>Math.abs(a.x-s.boat.x)-Math.abs(b.x-s.boat.x))[0];
        if(target){const lead=.7;const desired=Math.max(80,Math.min(920,target.x+target.vx*lead));axis=Math.abs(desired-s.boat.x)>15?Math.sign(desired-s.boat.x):0;if(!pressed)targetDepth=target.y;}
      }
      if(s.phase==='PLAYING'&&!pressed&&s.tick>=nextCast&&s.nets.length<3&&s.boat.cooldown===0){commands.push({type:'CAST_DOWN',ownerId:'bot'});pressed=true;if(mode==='fixed-deep')targetDepth=980;else if(mode!=='observe')targetDepth=320;}
      if(pressed&&s.controlled&&s.controlled.y>=targetDepth){commands.push({type:'CAST_UP',ownerId:'bot'});pressed=false;nextCast=s.tick+20;}
      s.step({moveAxis:axis,commands});
    }
    out.casts+=s.stats.casts;out.empty+=s.stats.emptyNets;out.full+=s.stats.fullNets;out.score+=s.stats.score;out.animals+=Object.values(s.stats.caughtByType).reduce((a,b)=>a+b,0);
  }
  console.log(JSON.stringify({mode,seeds:100,avgScore:Math.round(out.score/100),avgAnimals:Math.round(out.animals/100),avgCasts:out.casts/100,emptyRate:+(out.empty/out.casts).toFixed(3),fullRate:+(out.full/out.casts).toFixed(3)}));
}
