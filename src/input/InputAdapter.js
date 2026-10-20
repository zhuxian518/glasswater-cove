export class InputAdapter {
  constructor({left,right,cast,onCancel,isRunning}){
    this.commands=[];this.keys=new Set();this.moves=new Map();this.castOwner=null;this.isRunning=isRunning;this.onCancel=onCancel;
    // Safari needs explicit protection on the touched descendants as well as CSS.
    const preventNative=e=>{if(e.cancelable)e.preventDefault();};
    for(const button of [left,right,cast]){
      for(const type of ['contextmenu','selectstart','dragstart'])button.addEventListener(type,preventNative);
      for(const type of ['touchstart','touchmove'])button.addEventListener(type,preventNative,{passive:false});
    }
    const move=(button,axis)=>{
      button.addEventListener('pointerdown',e=>{if(!isRunning())return;e.preventDefault();this.moves.set(e.pointerId,axis);button.setPointerCapture(e.pointerId);button.classList.add('pressed');});
      const end=e=>{this.moves.delete(e.pointerId);button.classList.remove('pressed');};
      button.addEventListener('pointerup',end);button.addEventListener('pointercancel',e=>{end(e);onCancel();});button.addEventListener('lostpointercapture',e=>{if(this.moves.has(e.pointerId)){end(e);onCancel();}});
    };move(left,-1);move(right,1);
    cast.addEventListener('pointerdown',e=>{if(!isRunning()||this.castOwner!==null)return;e.preventDefault();const id='p'+e.pointerId;this.castOwner=id;cast.setPointerCapture(e.pointerId);this.commands.push({type:'CAST_DOWN',ownerId:id});});
    const up=e=>{const id='p'+e.pointerId;if(this.castOwner!==id)return;this.castOwner=null;this.commands.push({type:'CAST_UP',ownerId:id});};
    cast.addEventListener('pointerup',up);
    cast.addEventListener('pointermove',e=>{if(this.castOwner!=='p'+e.pointerId)return;const r=cast.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)up(e);});
    cast.addEventListener('pointercancel',e=>{if(this.castOwner==='p'+e.pointerId)onCancel();});
    cast.addEventListener('lostpointercapture',e=>{if(this.castOwner==='p'+e.pointerId)onCancel();});
    window.addEventListener('keydown',e=>{
      if(!isRunning()||e.repeat||e.target.closest('dialog'))return;
      if(['ArrowLeft','ArrowRight','a','d','A','D',' '].includes(e.key)){e.preventDefault();if(this.keys.has(e.key))return;this.keys.add(e.key);if(e.key===' '&&this.castOwner===null){this.castOwner='keyboard';this.commands.push({type:'CAST_DOWN',ownerId:'keyboard'});}}
    });
    window.addEventListener('keyup',e=>{this.keys.delete(e.key);if(e.key===' '&&this.castOwner==='keyboard'){this.castOwner=null;this.commands.push({type:'CAST_UP',ownerId:'keyboard'});}});
  }
  consume(){const left=this.keys.has('ArrowLeft')||this.keys.has('a')||this.keys.has('A')||Array.from(this.moves.values()).includes(-1);const right=this.keys.has('ArrowRight')||this.keys.has('d')||this.keys.has('D')||Array.from(this.moves.values()).includes(1);const commands=this.commands;this.commands=[];return {moveAxis:Number(right)-Number(left),commands};}
  clear(){this.commands=[];this.keys.clear();this.moves.clear();this.castOwner=null;document.querySelectorAll('.pressed').forEach(e=>e.classList.remove('pressed'));}
}
