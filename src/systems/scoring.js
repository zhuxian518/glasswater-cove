export function netScore(items){const n=items.length;return Math.floor(items.reduce((s,c)=>s+c.score,0)*(n===0?0:n===1?1:n===2?1.1:n<5?1.25:1.5));}
