export class Clock {
  constructor(maxSteps=5) { this.maxSteps=maxSteps;this.reset(); }
  reset() { this.last=null; this.accumulator=0; }
  advance(ms,running,step,onOverload) {
    if(this.last===null) this.last=ms;
    const elapsed=Math.max(0,(ms-this.last)/1000); this.last=ms;
    if(!running) {this.accumulator=0;return 0;}
    this.accumulator+=elapsed; let count=0;
    while(this.accumulator+1e-10>=1/60&&count<this.maxSteps){step();this.accumulator-=1/60;count++;}
    if(this.accumulator>=1/60){onOverload();this.accumulator=0;}
    return Math.max(0,this.accumulator*60);
  }
}
