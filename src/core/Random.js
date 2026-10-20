// Xorshift32 retained from 深海较量; visual randomness never consumes this stream.
export class Random {
  constructor(seed) { this.state = (seed >>> 0) || 0x9e3779b9; }
  next() { let x=this.state; x^=x<<13; x^=x>>>17; x^=x<<5; this.state=x>>>0; return this.state/4294967296; }
  pick(items) { return items[Math.floor(this.next()*items.length)]; }
}
