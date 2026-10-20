const ellipse=(g,x,y,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();};
export function drawCreature(g,c,x,y,scale=1,direction=1,time=0){
  g.save();g.translate(x,y);g.scale(scale*direction,scale);const pulse=Math.sin(time*7+x*.013);
  g.shadowColor='#285e5630';g.shadowBlur=2;g.shadowOffsetY=1;
  g.lineCap='round';g.lineJoin='round';g.strokeStyle=c.accent;g.lineWidth=1.7;
  const grad=g.createLinearGradient(0,-c.h,0,c.h);grad.addColorStop(0,c.accent);grad.addColorStop(.4,c.color);grad.addColorStop(1,c.color);g.fillStyle=grad;
  if(['fish','angelfish','lionfish','flyingfish'].includes(c.kind)){
    if(c.kind!=='fish'){
      g.fillStyle=c.accent;g.globalAlpha=.65;
      for(const side of [-1,1]){g.beginPath();g.moveTo(-17,0);g.quadraticCurveTo(-40,side*(c.kind==='flyingfish'?42:50),8,side*(c.kind==='angelfish'?49:35));g.lineTo(16,0);g.fill();}
      if(c.kind==='lionfish'){g.strokeStyle=c.accent;for(let i=0;i<9;i++){const a=(i/8-.5)*Math.PI;g.beginPath();g.moveTo(-8,0);g.lineTo(-8+Math.sin(a)*42,-Math.cos(a)*45);g.stroke();}}
      g.globalAlpha=1;
    }
    const tail=pulse*3;
    g.beginPath();g.moveTo(-c.w+5,0);g.quadraticCurveTo(-c.w-8,-6,-c.w-17,-c.h+tail);g.lineTo(-c.w-12,tail);g.lineTo(-c.w-17,c.h+tail);g.quadraticCurveTo(-c.w-5,7,-c.w+5,0);g.fillStyle=c.accent;g.fill();
    g.beginPath();g.moveTo(-10,-c.h+3);g.quadraticCurveTo(-5,-c.h-13,7,-c.h+3);g.fill();
    g.fillStyle=grad;g.beginPath();g.ellipse(0,0,c.w,c.h,0,0,Math.PI*2);g.fill();g.strokeStyle=c.accent;g.lineWidth=1.2;g.stroke();
    g.strokeStyle=c.accent+'55';g.lineWidth=.8;for(let i=0;i<3;i++){g.beginPath();g.arc(-12+i*9,0,5,-.8,.8);g.stroke();}
    g.strokeStyle='#ffffff45';g.lineWidth=1;g.beginPath();g.moveTo(-c.w*.65,-2);g.quadraticCurveTo(0,-c.h*.75,c.w*.6,-3);g.stroke();
    g.strokeStyle=c.accent;g.beginPath();g.moveTo(c.w*.48,-c.h*.65);g.quadraticCurveTo(c.w*.25,0,c.w*.48,c.h*.65);g.stroke();
    g.fillStyle=c.accent;g.beginPath();g.moveTo(1,2);g.quadraticCurveTo(-10,16,-13,6+pulse*2);g.closePath();g.globalAlpha=.6;g.fill();g.globalAlpha=1;
    ellipse(g,c.w*.72,-3,3.2,3.2,'#fff8dc');ellipse(g,c.w*.76,-3,1.6,1.9,'#184956');
    if(c.id==='F06'){g.strokeStyle='#ffe39a';g.lineWidth=1;g.beginPath();g.moveTo(-c.w-17,-c.h+tail);g.lineTo(-c.w-12,tail);g.lineTo(-c.w-17,c.h+tail);g.stroke();}
    if(c.pattern==='bands'||c.kind==='lionfish'){g.save();g.beginPath();g.ellipse(0,0,c.w,c.h,0,0,Math.PI*2);g.clip();g.strokeStyle=c.accent;g.lineWidth=4;for(let i=-20;i<=20;i+=14){g.beginPath();g.moveTo(i-7,-c.h);g.lineTo(i+7,c.h);g.stroke();}g.restore();}
  }else if(c.kind==='puffer'){
    ellipse(g,0,0,27,25,c.color);g.fillStyle=c.accent;g.beginPath();g.moveTo(-23,0);g.lineTo(-40,-12+pulse);g.lineTo(-40,12+pulse);g.fill();
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ellipse(g,Math.cos(a)*20,Math.sin(a)*18,1.8,1.8,c.accent);}ellipse(g,13,-6,5,5,'#fff7e7');ellipse(g,15,-6,2,3,'#315968');ellipse(g,24,5,3,2,c.accent);
  }else if(c.kind==='ray'){
    g.fillStyle=grad;g.beginPath();g.moveTo(35,0);g.quadraticCurveTo(6,-14,-8,-35-pulse*3);g.quadraticCurveTo(-31,-18,-29,0);g.quadraticCurveTo(-31,18,-8,35+pulse*3);g.quadraticCurveTo(6,14,35,0);g.fill();g.beginPath();g.moveTo(-24,0);g.bezierCurveTo(-50,0,-65,18+pulse*4,-78,9);g.stroke();for(let i=0;i<9;i++)ellipse(g,(i%3)*12-15,Math.floor(i/3)*11-11,2,2,'#6eabd1');ellipse(g,20,-6,2,2,'#254856');
  }else if(c.kind==='scallop'){
    g.fillStyle=grad;g.beginPath();g.moveTo(0,17);g.lineTo(-26,-3);g.bezierCurveTo(-32,-34,32,-34,26,-3);g.closePath();g.fill();for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;g.beginPath();g.moveTo(0,17);g.lineTo(Math.cos(a)*25,-3+Math.sin(a)*22);g.stroke();}g.strokeStyle='#fff0dd';g.beginPath();g.moveTo(-21,5);g.quadraticCurveTo(0,18+pulse*2,21,5);g.stroke();
  }else if(c.kind==='conch'){
    ellipse(g,0,2,29,20,c.color);g.beginPath();for(let i=0;i<=100;i++){const a=i/100*Math.PI*5,r=1+i*.17;i?g.lineTo(-5+Math.cos(a)*r,Math.sin(a)*r):g.moveTo(-4,0);}g.stroke();ellipse(g,18,10,9,6,c.accent);g.strokeStyle=c.color;g.beginPath();g.moveTo(20,10);g.lineTo(36,6);g.moveTo(27,8);g.lineTo(32,-1);g.stroke();ellipse(g,32,-1,1.6,1.6,'#294954');
  }else if(c.kind==='cuttlefish'){
    g.fillStyle=c.accent;g.beginPath();for(let i=0;i<=60;i++){const a=i/60*Math.PI*2,r=1+.08*Math.sin(a*12+time*6);g.lineTo(Math.cos(a)*39*r,Math.sin(a)*26*r);}g.fill();ellipse(g,0,0,33,18,c.color);for(let i=-18;i<24;i+=10){g.beginPath();g.moveTo(i,-10);g.quadraticCurveTo(i+7,0,i,10);g.stroke();}for(let i=0;i<6;i++){g.beginPath();g.moveTo(25,(i-3)*3);g.quadraticCurveTo(48,(i-3)*5,51,(i-3)*4+pulse*3);g.stroke();}ellipse(g,24,-4,4,4,'#fff6dd');ellipse(g,25,-4,2,2,'#394d61');
  }else if(c.kind==='mantis'){
    for(let i=0;i<8;i++){ellipse(g,-25+i*7,Math.sin(i*.5+time*3)*2,6,10-i*.35,i%2?c.color:c.accent);for(const s of [-1,1]){g.beginPath();g.moveTo(-25+i*7,s*5);g.lineTo(-30+i*7,s*16+pulse*2);g.stroke();}}for(const s of [-1,1]){g.beginPath();g.moveTo(20,s*4);g.lineTo(35,s*15);g.lineTo(27,s*3);g.stroke();ellipse(g,29,s*7,3,3,'#386c6b');}ellipse(g,-31,0,10,12,c.accent);
  }else if(c.kind==='shrimp'){
    g.strokeStyle=c.color;g.lineWidth=12;g.beginPath();g.moveTo(-20,7);g.bezierCurveTo(-10,-16,8,-13,18,1);g.stroke();
    g.strokeStyle=c.accent;g.lineWidth=1.5;
    for(let i=0;i<5;i++){g.beginPath();g.moveTo(-15+i*6,-6);g.lineTo(-18+i*6,7);g.stroke();g.beginPath();g.moveTo(-8+i*5,5);g.lineTo(-12+i*6,14+pulse*2);g.stroke();}
    g.beginPath();g.moveTo(15,-2);g.bezierCurveTo(25,-19,43,-24,49,-20);g.moveTo(18,0);g.quadraticCurveTo(40,-5,50,0);g.stroke();
    ellipse(g,18,-1,2,2,'#294b53');g.fillStyle=c.accent;g.beginPath();g.moveTo(-19,6);g.lineTo(-32,1);g.lineTo(-29,15);g.closePath();g.fill();
  }else if(c.kind==='crab'){
    for(let side of [-1,1]){for(let i=0;i<3;i++){g.beginPath();g.moveTo(side*18,1+i*5);g.lineTo(side*(30+i*3),7+i*4);g.lineTo(side*(35+i*2),14+i*3+Math.sin(time*9+i)*3);g.stroke();}g.lineWidth=5;g.beginPath();g.moveTo(side*22,-3);g.lineTo(side*36,-16);g.stroke();g.lineWidth=1.7;ellipse(g,side*37,-20,9,6,c.color);g.beginPath();g.moveTo(side*35,-21);g.lineTo(side*42,-26);g.stroke();}
    g.fillStyle=grad;g.beginPath();g.ellipse(0,0,27,17,0,0,Math.PI*2);g.fill();ellipse(g,-10,-15,3,4,c.color);ellipse(g,10,-15,3,4,c.color);ellipse(g,-10,-17,1.5,1.5,'#304655');ellipse(g,10,-17,1.5,1.5,'#304655');
    g.strokeStyle='#fff1c950';g.beginPath();g.ellipse(0,-3,17,7,0,Math.PI,Math.PI*2);g.stroke();
  }else if(c.kind==='squid'){
    g.fillStyle=c.accent;g.beginPath();g.moveTo(24,-1);g.lineTo(-8,-23-pulse*2);g.lineTo(-11,18+pulse*2);g.closePath();g.fill();
    g.fillStyle=grad;g.beginPath();g.moveTo(32,0);g.bezierCurveTo(10,-25,-25,-17,-20,0);g.bezierCurveTo(-25,17,10,25,32,0);g.fill();
    for(let i=0;i<5;i++){g.beginPath();g.moveTo(-17,(i-2)*4);g.bezierCurveTo(-32,(i-2)*5,-36,(i-2)*9+pulse*4,-48,(i-2)*5+pulse*3);g.stroke();}ellipse(g,-10,-4,4,4,'#fff1d9');ellipse(g,-11,-4,2,2,'#334660');
  }else if(c.kind==='octopus'){
    g.lineWidth=6;g.strokeStyle=c.color;
    for(let i=0;i<8;i++){const root=(i-3.5)*5;g.beginPath();g.moveTo(root,8);g.bezierCurveTo(root*1.3,30,root*2.2+Math.sin(time*4+i)*4,30,root*2.4+Math.sin(time*4+i)*7,15+Math.cos(i+time*3)*6);g.stroke();}
    g.fillStyle=grad;g.beginPath();g.ellipse(0,-6,24,27,0,0,Math.PI*2);g.fill();ellipse(g,9,0,5,5,'#fae7e3');ellipse(g,10,1,2.5,3,'#4d4068');ellipse(g,-7,2,4,4,'#fae7e3');ellipse(g,-6,2,2,2.5,'#4d4068');ellipse(g,7,-19,7,3,'#fff6ed35');
  }else if(c.kind==='lobster'){
    g.lineWidth=2;
    for(let i=0;i<5;i++){for(const s of [-1,1]){g.beginPath();g.moveTo(-10+i*7,s*5);g.lineTo(-15+i*7,s*17+Math.sin(time*8+i)*2);g.lineTo(-23+i*7,s*19);g.stroke();}}
    g.fillStyle=grad;g.beginPath();g.ellipse(6,0,29,13,0,0,Math.PI*2);g.fill();
    for(let i=0;i<4;i++){g.beginPath();g.ellipse(-13+i*6,0,5,11,0,-Math.PI/2,Math.PI/2);g.stroke();}
    g.fillStyle=c.accent;g.beginPath();g.moveTo(-20,-4);g.lineTo(-40,-15);g.lineTo(-36,0);g.lineTo(-40,15);g.lineTo(-20,4);g.fill();
    g.beginPath();g.moveTo(24,-6);g.bezierCurveTo(40,-30,64,-28,71,-21);g.moveTo(25,4);g.bezierCurveTo(46,10,65,5,70,-3);g.stroke();ellipse(g,28,-7,2,2,'#264552');ellipse(g,28,5,2,2,'#264552');
  }
  g.restore();
}
