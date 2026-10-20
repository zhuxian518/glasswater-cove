import {CAST_TICKS,SPLASH_TICK} from '../config/net-motion.js';
// Presentation derived from simulation ticks, so pausing freezes the entire throw.
export function castMotion(age){
  const a=Math.max(0,Math.min(CAST_TICKS,age));
  if(a<10){const p=a/10;return {stage:'WINDUP',x:-18-15*p,y:92-6*p,rx:13,ry:23,angle:-.3-p*.6,arm:p};}
  if(a<SPLASH_TICK){const p=(a-10)/(SPLASH_TICK-10),spread=p*p*(3-2*p);return {stage:'FLIGHT',x:-33*(1-p)+Math.sin(p*Math.PI)*68,y:86+(155-86)*p-Math.sin(p*Math.PI)*64,rx:15+80*spread,ry:13+18*spread,angle:-.9*(1-p),arm:1-p*.8};}
  const p=(a-SPLASH_TICK)/(CAST_TICKS-SPLASH_TICK);return {stage:'LAND',x:0,y:155,rx:95,ry:31-5*p,angle:0,arm:.2*(1-p)};
}
