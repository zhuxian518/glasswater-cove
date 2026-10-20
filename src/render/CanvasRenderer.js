import {BY_ID} from '../config/creatures.js';
import {drawCreature} from './CreatureShapes.js';
import {castMotion} from './CastMotion.js';
const TAU=Math.PI*2;
function oval(g,x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();}
function path(g,points,color){g.fillStyle=color;g.beginPath();g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);g.closePath();g.fill();}
export class CanvasRenderer{
  constructor(canvas){this.canvas=canvas;this.g=canvas.getContext('2d');this.effects=[];this.ambientTime=0;this.background=this.makeBackground();this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;this.resize();
    this.plate=new Image();this.plate.onload=()=>{const g=this.background.getContext('2d');g.drawImage(this.plate,0,0,1000,116,0,0,1000,155);g.drawImage(this.plate,0,116,1000,1084,0,155,1000,1045);this.plateLoaded=true;};this.plate.src='assets/cove-background-v2.jpg';
  }
  resize(){const rect=this.canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(2000000/(rect.width*rect.height)));this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);}
  makeBackground(){
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1200;const g=canvas.getContext('2d');
    let grad=g.createLinearGradient(0,0,0,180);grad.addColorStop(0,'#aacac0');grad.addColorStop(.45,'#f1d6a5');grad.addColorStop(1,'#ffdfad');g.fillStyle=grad;g.fillRect(0,0,1000,180);
    const sun=g.createRadialGradient(700,70,5,700,70,130);sun.addColorStop(0,'#fff8d8da');sun.addColorStop(.35,'#fff1cc70');sun.addColorStop(1,'#ffe1aa00');g.fillStyle=sun;g.fillRect(500,0,400,220);oval(g,700,70,27,27,'#fff4ce');
    path(g,[[0,95],[90,68],[135,79],[235,51],[312,83],[380,70],[485,123],[1000,135],[1000,180],[0,180]],'#8fafa1');
    path(g,[[0,76],[70,111],[100,100],[145,140],[230,143],[310,164],[0,170]],'#5b8e83');path(g,[[1000,68],[930,79],[875,120],[830,123],[775,161],[1000,165]],'#578a7b');
    for(let i=0;i<12;i++){const x=i*22;path(g,[[x,120-i*3],[x+11,65-i*1.2],[x+25,120-i*3]],'#477a6c');}
    grad=g.createLinearGradient(0,155,0,1200);grad.addColorStop(0,'#67c5b4');grad.addColorStop(.12,'#399d9f');grad.addColorStop(.4,'#257e88');grad.addColorStop(.7,'#1c6174');grad.addColorStop(1,'#173e57');g.fillStyle=grad;g.fillRect(0,155,1000,1045);
    const glow=g.createRadialGradient(670,170,20,580,350,700);glow.addColorStop(0,'#caf1be45');glow.addColorStop(1,'#5dba9a00');g.fillStyle=glow;g.fillRect(0,155,1000,1045);
    g.save();g.beginPath();g.rect(0,155,1000,1045);g.clip();
    for(let i=0;i<7;i++){const x=240+i*110;const light=g.createLinearGradient(x,150,x-150,1050);light.addColorStop(0,'#e0f3bf19');light.addColorStop(1,'#c1e5c000');path(g,[[x,155],[x+40,155],[x+160,1000],[x-250,1000]],light);}
    g.restore();
    path(g,[[0,1115],[130,1070],[260,1100],[390,1084],[530,1120],[650,1090],[800,1110],[1000,1065],[1000,1200],[0,1200]],'#244e60');
    path(g,[[0,1160],[150,1120],[320,1154],[510,1135],[650,1160],[800,1128],[1000,1130],[1000,1200],[0,1200]],'#385d68');
    for(let i=0;i<55;i++){const x=(i*197)%1000,y=1120+(i*39)%78;oval(g,x,y,2+(i%3),1,'#9ab29b22');}
    for(const [x,y,s] of [[30,1090,1],[930,1080,1.5],[130,1160,.7],[780,1170,.8]]){
      g.save();g.translate(x,y);g.scale(s,s);path(g,[[-40,0],[-22,-34],[12,-42],[45,-17],[60,12],[30,22],[-30,15]],'#315969');path(g,[[-22,-34],[12,-42],[45,-17],[5,-25]],'#55777a');g.restore();
    }
    // Static coral and sea stars are remote, non-interactive scenery.
    for(const x of [60,900]){g.strokeStyle='#ba9a9c65';g.lineWidth=7;g.lineCap='round';for(let i=0;i<5;i++){g.beginPath();g.moveTo(x,1145);g.quadraticCurveTo(x+(i-2)*15,1120,x+(i-2)*23,1080-Math.abs(i-2)*9);g.stroke();g.beginPath();g.moveTo(x+(i-2)*16,1114);g.lineTo(x+(i-2)*30+8,1096);g.stroke();}}
    for(const [x,y] of [[185,1140],[826,1110]]){const pts=[];for(let i=0;i<10;i++){const a=i*TAU/10-Math.PI/2,r=i%2?7:19;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}path(g,pts,'#bd9d8560');}
    g.strokeStyle='#9aa4a145';g.lineWidth=1.4;for(let i=0;i<17;i++){const a=i*TAU/17;g.beginPath();g.moveTo(960,1140);g.lineTo(960+Math.cos(a)*25,1140+Math.sin(a)*25);g.stroke();}oval(g,960,1140,13,13,'#3b465e');
    return canvas;
  }
  event(e){
    if(e.type==='capture')this.effects.push({type:'ring',x:e.x,y:e.y,age:0,color:BY_ID[e.typeId].color});
    if(e.type==='return'){
      this.effects.push({type:'label',x:e.x,y:205,age:0,text:e.score?`+${e.score}`:'下一网，再等等',full:e.slots===6});
      if(e.slots===6)this.effects.push({type:'label',x:e.x,y:265,age:-.1,text:'满 载 而 归',full:true,small:true});
      for(let i=0;i<(e.count?14:5);i++)this.effects.push({type:'drop',x:e.x+(i-7)*4,y:158,vx:(i-6)*16,vy:-80-(i%4)*35,age:0});
    }
    if(e.type==='splash'){
      for(let i=0;i<18;i++)this.effects.push({type:'drop',x:e.x+(i-9)*9,y:155,vx:(i-8.5)*15,vy:-65-(i%5)*26,age:0});
      for(let i=0;i<3;i++)this.effects.push({type:'ripple',x:e.x,y:155,age:-i*.09});
    }
    if(this.effects.length>100)this.effects.splice(0,this.effects.length-100);
  }
  draw(sim,time,dt=0){
    const g=this.g;g.setTransform(this.canvas.width/1000,0,0,this.canvas.height/1200,0,0);g.clearRect(0,0,1000,1200);g.drawImage(this.background,0,0);
    const t=this.reduced?0:time;
    // Surface glints and slowly drifting caustics.
    g.lineWidth=1.8;
    for(let i=0;i<17;i++){const y=163+i*3;g.strokeStyle=`rgba(255,240,190,${.2*(1-i/20)})`;g.beginPath();for(let x=0;x<=1000;x+=20){const yy=y+Math.sin(x*.018+t*1.5+i)*2;if(x===0)g.moveTo(x,yy);else g.lineTo(x,yy);}g.stroke();}
    g.strokeStyle='#b3e2c00d';g.lineWidth=1;
    for(let i=0;i<12;i++){const x=(i*113+t*5)%1100-50,y=270+(i*167)%780;g.beginPath();g.ellipse(x,y,55+Math.sin(t+i)*12,12,Math.sin(i)*.2,0,TAU);g.stroke();}
    this.environment(g,t);
    this.seagrass(g,30,1160,1,t);this.seagrass(g,970,1155,-1,t);if(!this.plateLoaded)this.seagrass(g,125,1200,.6,t);
    if(sim){for(const f of sim.creatures){drawCreature(g,BY_ID[f.typeId],f.x,f.y,1,f.vx>0?1:-1,t+f.id);if(f.typeId==='F06'){g.fillStyle='#ffeaaa90';const r=2+Math.sin(t*4)*1.5;g.fillRect(f.x-46,f.y-24,r,r);}}}
    else{
      for(let i=0;i<13;i++){const c=BY_ID[['F01','F02','F09','F04','F11'][i%5]],x=(i*193+t*c.speed*.25)%1280-140,y=360+(i%4)*195;drawCreature(g,c,x,y,1,i%2?1:-1,t+i);}
    }
    if(sim)for(const n of sim.nets)if(n.phase!=='CAST')this.net(g,n,t,sim.boat.x);
    this.boat(g,sim?sim.boat.x:500,t,sim?.controlled,sim?.nets.some(n=>n.phase==='RETRACT'));
    if(sim)for(const n of sim.nets)if(n.phase==='CAST')this.net(g,n,t,sim.boat.x);
    // Tiny bubbles keep the water alive without obscuring target silhouettes.
    g.strokeStyle='#cceadb35';g.lineWidth=1;
    for(let i=0;i<20;i++){const y=1150-(i*157+t*(12+i%4*3))%990,x=40+(i*137)%920+Math.sin(t*.6+i)*7;g.beginPath();g.arc(x,y,1.4+i%3,0,TAU);g.stroke();}
    for(const e of this.effects){e.age+=dt;if(e.age<0)continue;g.save();g.globalAlpha=Math.max(0,1-e.age/(e.type==='label'?1.6:1));
      if(e.type==='ring'){g.strokeStyle=e.color;g.lineWidth=2;g.beginPath();g.arc(e.x,e.y,6+e.age*35,0,TAU);g.stroke();}
      else if(e.type==='ripple'){g.strokeStyle='#fff4d5';g.lineWidth=2;g.beginPath();g.ellipse(e.x,e.y,80+e.age*70,6+e.age*12,0,0,TAU);g.stroke();}
      else if(e.type==='drop'){oval(g,e.x+e.vx*e.age,e.y+e.vy*e.age+190*e.age*e.age,2,4,'#e4f4d2');}
      else{g.textAlign='center';g.font=`${e.small?18:e.full?37:29}px Georgia, "Microsoft YaHei", serif`;g.fillStyle=e.full?'#ffe5a4':'#fff4d0';g.shadowColor='#174653';g.shadowBlur=10;g.fillText(e.text,e.x,e.y-e.age*35);}
      g.restore();
    }
    this.effects=this.effects.filter(e=>e.age<(e.type==='label'?1.7:1));
  }
  seagrass(g,x,y,d,t){g.save();g.translate(x,y);g.scale(d,1);g.lineCap='round';for(let i=0;i<9;i++){const height=70+(i*31)%130;g.strokeStyle=i%2?'#3b8e8870':'#60ac9360';g.lineWidth=5+i%3*2;g.beginPath();g.moveTo(i*9-25,10);g.bezierCurveTo(i*9-50,-height*.5,i*8+Math.sin(t*1.2+i)*15,-height*.8,i*6+Math.sin(t+i)*10,-height);g.stroke();}g.restore();}
  environment(g,t){
    g.save();g.globalAlpha=.3;
    // Two remote jellyfish, a seahorse and a turtle; stars and urchin are cached.
    for(let i=0;i<2;i++){const x=85+i*815+Math.sin(t*.3+i)*12,y=490+i*210+Math.sin(t*.6+i)*10;g.fillStyle='#c4d5e4';g.beginPath();g.ellipse(x,y,20+Math.sin(t*2)*2,17,0,Math.PI,0);g.quadraticCurveTo(x,y+10,x-20-Math.sin(t*2)*2,y);g.fill();g.strokeStyle='#d6e4de';g.lineWidth=1.2;for(let j=0;j<5;j++){g.beginPath();g.moveTo(x-12+j*6,y+2);g.bezierCurveTo(x-20+j*7,y+18,x+j*6,y+23,x-15+j*6+Math.sin(t*2+j)*5,y+38);g.stroke();}}
    const x=60,y=840+Math.sin(t*.8)*5;g.strokeStyle='#e2c499';g.lineWidth=7;g.beginPath();g.moveTo(x+4,y-8);g.bezierCurveTo(x+22,y-25,x-12,y-35,x-8,y-8);g.bezierCurveTo(x-5,y+15,x+16,y+17,x+6,y+34);g.bezierCurveTo(x-1,y+42,x-10,y+24,x+3,y+25);g.stroke();g.lineWidth=3;g.beginPath();g.moveTo(x+12,y-21);g.lineTo(x+24,y-18);g.stroke();
    for(const [sx,sy] of [[185,1140],[826,1110]]){const pts=[];for(let i=0;i<10;i++){const a=i*TAU/10-Math.PI/2,r=i%2?7:19;pts.push([sx+Math.cos(a)*r,sy+Math.sin(a)*r]);}path(g,pts,'#e3ae8f');}
    g.strokeStyle='#ab9eb3';g.lineWidth=1.4;for(let i=0;i<17;i++){const a=i*TAU/17;g.beginPath();g.moveTo(950,1140);g.lineTo(950+Math.cos(a)*24,1140+Math.sin(a)*24);g.stroke();}oval(g,950,1140,12,12,'#534663');
    const tx=950-((t*12)%1250),ty=850+Math.sin(t*.2)*25;g.save();g.translate(tx,ty);g.rotate(Math.sin(t*.2)*.05);oval(g,0,0,30,18,'#92b5a5');oval(g,-34,-2,10,7,'#a5c7b1');for(const s of [-1,1]){g.save();g.translate(-10,s*14);g.rotate(s*(.4+Math.sin(t*2)*.2));oval(g,0,0,22,6,'#a2bdab');g.restore();}g.strokeStyle='#416f78';g.lineWidth=1;g.beginPath();g.ellipse(0,0,23,13,0,0,TAU);g.stroke();g.restore();g.restore();
  }
  boat(g,x,t,controlled,hauling){
    const cast=controlled?.phase==='CAST'?castMotion(controlled.age*36/(controlled.castTicks||11)):null;
    const wind=cast?.stage==='WINDUP'?cast.arm:0,swing=cast?.stage==='FLIGHT'?cast.arm:0;
    g.save();g.translate(x,153+Math.sin(t*1.8)*2);g.rotate(Math.sin(t*.9)*.012);
    oval(g,0,14,98,7,'#356f7140');g.strokeStyle='#f8efca99';g.lineWidth=1.5;g.beginPath();g.ellipse(0,15,108,9,0,0,Math.PI);g.stroke();
    // Rounded painted timber, pale gunwale and fine hand-drawn plank lines.
    let wood=g.createLinearGradient(0,-18,0,30);wood.addColorStop(0,'#d99c67');wood.addColorStop(1,'#9b6049');
    g.fillStyle=wood;g.strokeStyle='#745341';g.lineWidth=2.3;g.beginPath();g.moveTo(-91,-13);g.quadraticCurveTo(-77,26,-47,27);g.quadraticCurveTo(26,34,66,15);g.quadraticCurveTo(83,6,91,-17);g.quadraticCurveTo(0,-4,-91,-13);g.fill();g.stroke();
    g.fillStyle='#f1d5a0';g.beginPath();g.ellipse(0,-15,89,10,-.025,0,TAU);g.fill();oval(g,0,-17,73,5,'#936b4d');
    g.strokeStyle='#f4c991';g.lineWidth=1.4;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-73+i*8,-1+i*7);g.quadraticCurveTo(0,16+i*5,77-i*7,-4+i*7);g.stroke();}
    g.strokeStyle='#74534180';g.beginPath();g.moveTo(-29,-6);g.lineTo(-25,26);g.moveTo(32,-6);g.lineTo(28,25);g.stroke();
    // Wicker creel with a soft cover; oar rests along the near side.
    g.fillStyle='#c5a86d';g.strokeStyle='#8d7652';g.lineWidth=1.4;g.beginPath();g.roundRect?g.roundRect(26,-43,31,26,5):g.rect(26,-43,31,26);g.fill();g.stroke();oval(g,41,-43,15,4,'#e5cc94');for(let i=0;i<5;i++){g.beginPath();g.moveTo(29+i*6,-40);g.lineTo(29+i*6,-19);g.stroke();}for(let i=0;i<3;i++){g.beginPath();g.moveTo(27,-35+i*6);g.lineTo(55,-35+i*6);g.stroke();}
    g.save();g.rotate(-.14);g.strokeStyle='#dbb785';g.lineWidth=4;g.beginPath();g.moveTo(-78,9);g.lineTo(58,9);g.stroke();oval(g,-83,9,16,5,'#dfbe8a');g.restore();
    // Articulated fisherman: wind-up, release, follow-through, holding and hauling.
    g.save();g.translate(-9,-25);g.rotate(-wind*.22+swing*.18+(hauling?Math.sin(t*9)*.035:0));
    g.strokeStyle='#365f65';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(-9,-5);g.lineTo(-17,8);g.lineTo(-29,8);g.moveTo(7,-5);g.lineTo(13,9);g.lineTo(23,9);g.stroke();
    let jacket=g.createLinearGradient(-10,-40,12,0);jacket.addColorStop(0,'#e2a181');jacket.addColorStop(1,'#c97c63');g.fillStyle=jacket;g.strokeStyle='#966453';g.lineWidth=1.4;g.beginPath();g.moveTo(-13,-35);g.quadraticCurveTo(-3,-44,10,-34);g.lineTo(17,-4);g.quadraticCurveTo(0,2,-17,-3);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#f1d1ac';g.lineWidth=1.5;g.beginPath();g.moveTo(-1,-32);g.lineTo(0,-9);g.stroke();
    oval(g,0,-49,10,13,'#edc69e');oval(g,9,-47,3,3,'#edc69e');g.strokeStyle='#8f6c50';g.lineWidth=1;g.beginPath();g.moveTo(5,-51);g.lineTo(7,-51);g.stroke();
    oval(g,0,-61,25,5,'#c3a56d');g.fillStyle='#e7cc91';g.beginPath();g.moveTo(-15,-62);g.quadraticCurveTo(-16,-77,-2,-77);g.quadraticCurveTo(12,-78,15,-62);g.closePath();g.fill();g.strokeStyle='#ae8956';g.lineWidth=2;g.beginPath();g.moveTo(-14,-64);g.quadraticCurveTo(0,-60,14,-64);g.stroke();g.strokeStyle='#f8e6bd';g.lineWidth=1;g.beginPath();g.moveTo(-22,-61);g.quadraticCurveTo(0,-56,23,-61);g.stroke();
    const hx=cast?cast.stage==='WINDUP'?-8-18*wind:cast.stage==='FLIGHT'?28+23*swing:27:controlled?30:hauling?19+Math.sin(t*9)*6:22;
    const hy=cast?cast.stage==='WINDUP'?-28-15*wind:cast.stage==='FLIGHT'?-27-20*swing:-10:controlled?-17:hauling?-15+Math.cos(t*9)*5:-9;
    for(const back of [true,false]){g.strokeStyle=back?'#b7755f':'#e4a186';g.lineWidth=7;g.beginPath();g.moveTo(back?-10:9,-29);g.quadraticCurveTo(back?-15:21,-18+(back?4:0),hx+(back?-10:0),hy+(back?8:0));g.stroke();oval(g,hx+(back?-10:0),hy+(back?8:0),4,4,'#edc69e');}
    g.restore();g.restore();
  }
  mesh(g,x,y,rx,ry,angle=0,opacity=1){
    g.save();g.translate(x,y);g.rotate(angle);g.scale(1,ry/rx);g.globalAlpha*=opacity;
    g.fillStyle='#f5e4b51b';g.beginPath();g.arc(0,0,rx,0,TAU);g.fill();
    g.save();g.clip();g.strokeStyle='#fff0c3aa';g.lineWidth=1.1;
    for(let i=-10;i<=10;i++){g.beginPath();g.moveTo(-rx,i*16-rx);g.lineTo(rx,i*16+rx);g.moveTo(-rx,i*16+rx);g.lineTo(rx,i*16-rx);g.stroke();}g.restore();
    g.strokeStyle='#e9cf9d';g.lineWidth=2.3;g.beginPath();g.arc(0,0,rx,0,TAU);g.stroke();
    for(let i=0;i<14;i++){const a=i*TAU/14;oval(g,Math.cos(a)*rx,Math.sin(a)*rx,2.2,3.4,'#bd9971');}
    g.restore();
  }
  net(g,n,t,boatX){
    if(n.phase==='CAST'){
      const age=n.age*36/(n.castTicks||11),pose=castMotion(age);
      const x=pose.stage==='WINDUP'?boatX+pose.x:n.originX+pose.x+(pose.stage==='FLIGHT'?((n.castFromX??n.originX)-n.originX)*(1-(age-10)/18):0),y=pose.y;
      g.save();g.strokeStyle='#ead5afbb';g.lineWidth=1.5;g.beginPath();g.moveTo(boatX+16,120);g.quadraticCurveTo((boatX+x)/2-20,pose.stage==='FLIGHT'?y+45:145,x,y);g.stroke();
      if(pose.stage==='FLIGHT'){g.strokeStyle='#faf0d477';g.lineWidth=1.2;g.beginPath();g.moveTo(x-30,y+17);g.quadraticCurveTo(x-55,y+2,x-60,y-10);g.stroke();}
      this.mesh(g,x,y,pose.rx,pose.ry,pose.angle);g.restore();return;
    }
    g.save();const open=n.phase==='OPEN'||n.phase==='HOLD',retract=n.phase==='RETRACT',sinking=n.phase==='DESCEND';
    const flutter=Math.sin(t*4+n.id)*3;
    g.strokeStyle='#ead5afaa';g.lineWidth=1.5;g.beginPath();g.moveTo(boatX+16,133);g.bezierCurveTo(boatX-8,175,n.x-22,n.y-55,n.x,n.y-35);g.stroke();
    if(sinking){
      // Open weighted skirt sinks naturally; the loose net is not capturing yet.
      this.mesh(g,n.x,n.y,95+flutter,29,Math.sin(t*2)*.018,.85);
      g.strokeStyle='#fff0c3a6';g.lineWidth=1.2;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(n.x,n.y-36);g.quadraticCurveTo(n.x+i*12,n.y-31,n.x+i*28,n.y+5);g.stroke();}
      g.strokeStyle='#bde2d16a';g.lineWidth=1;for(let i=0;i<4;i++){const y=n.y-55-(i*19+t*22)%90;g.beginPath();g.arc(n.x+(i-1.5)*17,y,2+i%2,0,TAU);g.stroke();}
      g.fillStyle='#fff0cb';g.font='16px "Microsoft YaHei"';g.textAlign='center';g.fillText(n.openRequested?'轻轻兜起':'松手兜鱼',n.x,n.y-57);
    }else if(open){
      const p=n.phase==='HOLD'?1:n.age/15;this.mesh(g,n.x,n.y,95,29+66*p,0,.95);
      g.strokeStyle='#fff2c74d';g.lineWidth=1;g.beginPath();g.arc(n.x,n.y,n.radius,0,TAU);g.stroke();
      g.fillStyle='#fff1bd';g.font='16px Georgia';g.textAlign='center';g.fillText(n.usedSlots+' / 6',n.x,n.y+112);
    }else if(retract){
      const r=Math.max(18,n.radius),h=22+n.usedSlots*3;
      g.fillStyle='#f3dcb72e';g.strokeStyle='#f3deaf';g.lineWidth=1.8;g.beginPath();g.moveTo(n.x,n.y-r);g.bezierCurveTo(n.x-r,n.y,n.x-r,n.y+h,n.x,n.y+h+7);g.bezierCurveTo(n.x+r,n.y+h,n.x+r,n.y,n.x,n.y-r);g.fill();g.stroke();
      g.strokeStyle='#f3deaf88';g.lineWidth=1;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(n.x,n.y-r);g.quadraticCurveTo(n.x+i*r*.65,n.y+h*.5,n.x+i*r*.2,n.y+h);g.stroke();}
    }
    if(n.captured.length)n.captured.forEach((c,i)=>{const a=i*2.4,rr=open?30:Math.max(6,n.radius*.28);drawCreature(g,BY_ID[c.typeId],n.x+Math.cos(a)*rr,n.y+Math.sin(a)*rr,.45,1,t+i);});
    g.restore();
  }
}
