import {drawCreature} from './CreatureShapes.js';
import {BY_ID} from '../config/creatures.js';
import {badgeArtSpec} from '../config/badge-art.js';
const atlases=new Map();
function loadAtlas(src){if(atlases.has(src))return atlases.get(src);const img=new Image(),entry={img,loaded:false,failed:false};entry.promise=new Promise(resolve=>{img.onload=()=>{entry.loaded=true;resolve(entry);};img.onerror=()=>{entry.failed=true;resolve(entry);};});img.src=src;atlases.set(src,entry);return entry;}
export async function badgeArtReady(ids){await Promise.all(ids.map(id=>badgeArtSpec(id)).filter(s=>s.atlas).map(s=>loadAtlas(s.atlas).promise));}
export function badgeCanvas(b,unlocked=true){
 if(badgeArtSpec(b.id).procedural)return detailedMedalCanvas(b);
 const cv=document.createElement('canvas');cv.width=cv.height=512;cv.setAttribute('aria-label',b.name+'：'+b.motif);cv.className='badge-art';const g=cv.getContext('2d'),spec=badgeArtSpec(b.id),entry=loadAtlas(spec.atlas);
 const draw=()=>{g.clearRect(0,0,512,512);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';if(entry.loaded){const [x,y,w,h]=spec.rect,scale=entry.img.naturalWidth/1254,fit=476/Math.max(w,h);g.drawImage(entry.img,x*scale,y*scale,w*scale,h*scale,(512-w*fit)/2,(512-h*fit)/2,w*fit,h*fit);}else g.drawImage(fallbackBadgeCanvas(b,unlocked),0,0,512,512);};
 draw();if(!entry.loaded&&!entry.failed)entry.promise.then(draw);return cv;
}
function detailedMedalCanvas(b){
 const cv=document.createElement('canvas');cv.width=cv.height=512;cv.className='badge-art';cv.setAttribute('aria-label',b.name+'：'+b.motif);const g=cv.getContext('2d');g.translate(256,248);
 const n=+b.id.slice(1),family=b.id[0],gold=g.createLinearGradient(-210,-220,190,230);gold.addColorStop(0,'#fff0bc');gold.addColorStop(.22,'#b8843f');gold.addColorStop(.46,'#ffe9ac');gold.addColorStop(.72,'#947047');gold.addColorStop(1,'#eacb85');
 const ring=(r,w,color)=>{g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.stroke();};
 g.shadowColor='#092f33aa';g.shadowBlur=18;g.shadowOffsetY=10;g.fillStyle=gold;g.beginPath();for(let i=0;i<=240;i++){const a=i/240*Math.PI*2,r=208+8*Math.cos(a*(family==='A'?12:16));g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();g.shadowBlur=0;g.shadowOffsetY=0;
 const enamel=g.createRadialGradient(-45,-65,5,0,0,185);const palettes=family==='A'?['#83c7bd','#21585c']:family==='C'?['#a4bed1','#344963']:['#c3aa78','#465e5c'];enamel.addColorStop(0,palettes[0]);enamel.addColorStop(1,palettes[1]);g.fillStyle=enamel;g.beginPath();g.arc(0,0,184,0,Math.PI*2);g.fill();ring(191,8,gold);ring(177,2,'#f8e5ac');ring(202,2,'#fff2bc');
 for(let i=0;i<48;i++){const a=i/48*Math.PI*2;g.save();g.rotate(a);g.fillStyle=i%4===0?'#fff6dc':'#e5c88c';g.beginPath();g.ellipse(0,-194,i%4===0?4.5:2.2,i%4===0?5:2.8,0,0,Math.PI*2);g.fill();g.restore();}
 for(const side of [-1,1])for(let i=0;i<10;i++){g.save();g.rotate(side*(.32+i*.115));g.strokeStyle=gold;g.lineWidth=2;g.beginPath();g.moveTo(side*116,115);g.quadraticCurveTo(side*170,40,side*131,-126);g.stroke();g.fillStyle=gold;g.beginPath();g.ellipse(side*143,-110+i*23,13,5,side*.65,0,Math.PI*2);g.fill();g.restore();}
 g.save();g.beginPath();g.arc(0,0,153,0,Math.PI*2);g.clip();for(let j=0;j<5;j++){g.strokeStyle=j%2?'#f2dfaf55':'#b7e5d444';g.lineWidth=2;g.beginPath();for(let x=-180;x<=180;x+=3){const y=75+j*14+Math.sin(x*.036+n*.7+j)*8;x===-180?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}g.restore();
 const ids=b.creatureIds||[];
 ids.forEach((id,i)=>{g.save();g.shadowColor='#071f39aa';g.shadowBlur=7;g.shadowOffsetY=5;drawCreature(g,BY_ID[id],ids.length===1?0:i?38:-38,ids.length===1?-5:i?30:-39,ids.length===1?2.6:1.8,i?-1:1,n*.21);g.restore();});
 if(!ids.length){g.strokeStyle=gold;g.fillStyle='#fff0ca';g.lineWidth=5;if(n<=10){g.save();g.rotate(-.08);g.fillRect(-71,-82,142,139);g.strokeRect(-71,-82,142,139);g.beginPath();g.moveTo(0,-82);g.lineTo(0,57);g.stroke();for(let i=0;i<5;i++){g.beginPath();g.moveTo(-55,-59+i*21);g.lineTo(-15,-59+i*21);g.moveTo(15,-59+i*21);g.lineTo(55,-59+i*21);g.stroke();}g.restore();}else{g.beginPath();g.moveTo(-70,-64);g.quadraticCurveTo(0,-90,70,-64);g.quadraticCurveTo(70,55,0,65);g.quadraticCurveTo(-70,55,-70,-64);g.stroke();for(let i=-50;i<=50;i+=16){g.beginPath();g.moveTo(i,-60);g.lineTo(-i,55);g.stroke();}}
 g.fillStyle='#1f555c';g.textAlign='center';g.font='bold 49px Georgia';g.fillText(n===9?'10':n===10?'20':n===11?'300':'1000',0,6);}
 g.fillStyle=gold;g.beginPath();g.moveTo(-110,147);g.lineTo(110,147);g.lineTo(94,181);g.lineTo(-94,181);g.closePath();g.fill();g.fillStyle='#4b5146';g.textAlign='center';g.font='bold 20px Georgia';g.fillText(b.id+' · COVE',0,171);
 for(let i=0;i<5;i++){const x=-35+i*17.5,y=-157+Math.abs(i-2)*4;g.fillStyle='#fff3c5';g.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,r=j%2?2:6;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();g.fill();}return cv;
}
const PAIRS=[['F01','F09'],['F02','F09'],['F02','F04'],['F06','F04'],['F03','F04'],['F11','F12'],['F02','F12'],['F03','F12']];
function fallbackBadgeCanvas(b,unlocked=true){
 const cv=document.createElement('canvas');cv.width=cv.height=240;cv.setAttribute('aria-label',b.name+'：'+b.motif);const g=cv.getContext('2d'),n=+b.id.slice(1),f=b.id[0],colors={A:['#d6e6cd','#649b8c'],B:['#ead9b9','#ad8054'],C:['#f0d1bd','#ba7963'],D:['#d3dfe2','#78999f']},[bg,rim]=colors[f];
 g.translate(120,120);g.shadowColor='#687c6740';g.shadowBlur=8;g.shadowOffsetY=5;g.fillStyle=bg;g.strokeStyle=rim;g.lineWidth=5;g.beginPath();
 if(f==='A'){for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,r=91+4*Math.cos(10*a);i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r);}}
 if(f==='B'){g.moveTo(-72,-87);g.quadraticCurveTo(0,-111,72,-87);g.lineTo(90,18);g.quadraticCurveTo(0,137,-90,18);g.closePath();}
 if(f==='C'){for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,r=88+7*Math.sin(5*a);i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r);}}
 if(f==='D')g.rect(-86,-83,172,166);g.fill();g.stroke();g.shadowBlur=0;g.shadowOffsetY=0;g.strokeStyle='#fff8e5';g.lineWidth=2;g.setLineDash([3,5]);g.beginPath();g.arc(0,0,76,0,Math.PI*2);g.stroke();g.setLineDash([]);
 const wave=(y,c)=>{g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.moveTo(-60,y);for(let x=-60;x<=60;x++)g.lineTo(x,y+Math.sin(x*.09)*4);g.stroke();};
 wave(49,rim);g.fillStyle='#fff8e5';g.beginPath();g.arc(48,-49,15,0,Math.PI*2);g.fill();
 if(f==='A'){
  g.strokeStyle=rim;g.fillStyle='#fff6de';g.lineWidth=2;
  if(n===1||n===3){for(let i=0;i<7;i++){const a=Math.PI+i/6*Math.PI;g.beginPath();g.moveTo(Math.cos(a)*42,20+Math.sin(a)*42);g.lineTo(0,25);g.stroke();}}
  if(n===2){g.save();g.rotate(-.18);g.fillRect(-43,-35,76,60);g.strokeRect(-43,-35,76,60);for(let i=0;i<3;i++){g.beginPath();g.moveTo(-30,-20+i*15);g.lineTo(20,-20+i*15);g.stroke();}g.restore();}
  if(n===4){g.strokeStyle='#c58f7d';for(let i=0;i<3;i++){const x=-48+i*45;g.beginPath();g.moveTo(x,37);g.lineTo(x,-26);g.moveTo(x,4);g.lineTo(x-12,-8);g.moveTo(x,-12);g.lineTo(x+11,-23);g.stroke();}}
  if(n===5){g.strokeStyle='#c3a36d';g.beginPath();g.arc(0,0,52,0,Math.PI*2);g.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.beginPath();g.moveTo(Math.cos(a)*58,Math.sin(a)*58);g.lineTo(Math.cos(a)*66,Math.sin(a)*66);g.stroke();}}
  if(n===6){g.beginPath();g.moveTo(-55,36);g.bezierCurveTo(-65,-55,45,-65,57,-10);g.stroke();}
  if(n===7){g.fillStyle='#c5c5b0';g.beginPath();g.ellipse(0,25,47,19,0,0,7);g.fill();}
  if(n===8){g.beginPath();g.moveTo(-50,-33);g.bezierCurveTo(64,-70,-61,69,48,33);g.stroke();g.beginPath();g.moveTo(-48,-22);g.bezierCurveTo(70,-48,-54,72,55,43);g.stroke();}
  const id=['F01','F02','F03','F04','F06','F09','F10','F11'][n-1];drawCreature(g,BY_ID[id],0,0,1.65,1,.7);
 }
 if(f==='C'){PAIRS[n-1].forEach((id,i)=>drawCreature(g,BY_ID[id],i?20:-20,i?19:-20,1.12,i?-1:1,.5));g.fillStyle=rim;g.font='26px Georgia';g.fillText('♪',40,0);}
 if(f==='B'){
  g.strokeStyle='#936d47';g.lineWidth=3;g.beginPath();g.moveTo(-50,-36);g.quadraticCurveTo(0,-55,50,-36);g.quadraticCurveTo(51,56,0,61);g.quadraticCurveTo(-51,56,-50,-36);g.stroke();
  g.save();g.beginPath();g.rect(-45,-36,90,85);g.clip();g.lineWidth=1;g.strokeStyle='#b39264';for(let i=-100;i<110;i+=13){g.beginPath();g.moveTo(i,-40);g.lineTo(i+90,60);g.moveTo(i,60);g.lineTo(i+90,-40);g.stroke();}g.restore();
  const counts=[1,4,6,3,5,3,4,5],count=counts[n-1];for(let i=0;i<count;i++){const a=i/count*Math.PI*2,x=count===1?0:Math.cos(a)*25,y=count===1?0:Math.sin(a)*23;drawCreature(g,BY_ID[n===4?'F10':n===5&&i===0?'F12':['F01','F02','F04','F09','F03'][i%5]],x,y,n===4?.48:.43,1,.5);}
  if(n===1){g.fillStyle='#73b1af';g.beginPath();g.ellipse(0,-61,5,9,0,0,7);g.fill();}
 }
 if(f==='D'){
  g.strokeStyle=rim;g.fillStyle='#fff9e6';g.lineWidth=3;
  if(n===1||n===5){g.beginPath();g.moveTo(-50,10);g.lineTo(45,10);g.lineTo(29,35);g.lineTo(-29,35);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(0,10);g.lineTo(0,-43);g.lineTo(31,-5);g.lineTo(0,-5);g.fill();g.stroke();if(n===5){g.fillStyle='#c59a63';g.fillRect(-53,-48,15,55);g.fillRect(-59,-52,27,7);}}
  if(n===2){for(let i=0;i<3;i++)wave(-20+i*23,['#7ca9a4','#a6bfa8','#b99c76'][i]);}
  if(n===3){g.fillStyle='#b9986f';g.fillRect(-44,-12,88,15);g.fillRect(-30,3,9,34);g.fillRect(23,3,9,34);g.beginPath();g.arc(-23,-28,17,0,Math.PI*2);g.stroke();}
  if(n===4){g.fillStyle='#fff9e6';g.fillRect(-45,-42,90,83);g.strokeRect(-45,-42,90,83);for(let i=0;i<5;i++){g.beginPath();g.moveTo(-28,-24+i*13);g.lineTo(29,-24+i*13);g.stroke();}}
  if(n===6){g.fillStyle='#fff3d9';g.beginPath();g.moveTo(-48,-28);g.lineTo(48,-28);g.lineTo(48,31);g.lineTo(-48,31);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(-48,-28);g.lineTo(0,10);g.lineTo(48,-28);g.stroke();g.fillStyle='#c28763';g.beginPath();g.arc(0,-27,17,0,7);g.fill();}
  if(n>=7){g.fillStyle='#d9b877';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?24:46;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();g.stroke();g.fillStyle='#fff9e9';g.textAlign='center';g.font='bold 23px Georgia';g.fillText(n===7?'100':'200',0,8);}
 }
 g.fillStyle=rim;g.textAlign='center';g.font='12px Georgia';g.fillText(b.id,0,82);return cv;
}
