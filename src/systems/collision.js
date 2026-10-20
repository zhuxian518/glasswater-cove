// Exact continuous circle vs translating AABB, with linearly growing radius.
// Split time where the closest point changes region, solve the quadratic in each.
export function sweepCircleBox(net,fish,r0,r1) {
  const x0=fish.px-net.px,y0=fish.py-net.py;
  const dx=(fish.x-net.x)-x0,dy=(fish.y-net.y)-y0,dr=r1-r0;
  const cuts=[0,1];
  for(const [a,b,h] of [[x0,dx,fish.w],[y0,dy,fish.h]]) if(Math.abs(b)>1e-12)
    for(const edge of [-h,h]) {const t=(edge-a)/b;if(t>0&&t<1)cuts.push(t);}
  cuts.sort((a,b)=>a-b);
  for(let i=0;i<cuts.length-1;i++){
    const lo=cuts[i],hi=cuts[i+1],mid=(lo+hi)/2;
    const component=(a,b,h)=>{const v=a+b*mid;return v>h?[a-h,b]:v< -h?[a+h,b]:[0,0];};
    const [ax,bx]=component(x0,dx,fish.w),[ay,by]=component(y0,dy,fish.h);
    const A=bx*bx+by*by-dr*dr,B=2*(ax*bx+ay*by-r0*dr),C=ax*ax+ay*ay-r0*r0;
    const value=t=>(A*t+B)*t+C;
    if(value(lo)<=1e-8)return lo;
    const roots=[];
    if(Math.abs(A)<1e-12){if(Math.abs(B)>1e-12)roots.push(-C/B);}
    else{const discriminant=B*B-4*A*C;if(discriminant>=0){const s=Math.sqrt(discriminant);roots.push((-B-s)/(2*A),(-B+s)/(2*A));}}
    roots.sort((a,b)=>a-b);
    for(const t of roots)if(t>=lo-1e-9&&t<=hi+1e-9)return Math.max(lo,Math.min(hi,t));
  }
  return null;
}
