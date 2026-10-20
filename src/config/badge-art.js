import {BADGES} from './badges.js';
const LEGENDARY=new Set(['A05','B08','D05','D08']);
const EPIC=new Set(['B03','B04','B05','B07','C04','C06','C08','D04','D07']);
// Source-image bounds are measured per emblem: generated art is not an exact tile grid.
const RECTS={
 A:[[4,24,309,269],[322,6,303,298],[632,4,310,298],[944,6,303,298],[5,292,311,317],[323,304,309,301],[633,304,312,304],[943,304,306,307]],
 B:[[8,610,314,300],[317,612,305,302],[629,612,308,296],[944,612,305,300],[8,912,314,290],[317,915,310,312],[630,908,313,309],[943,915,306,292]],
 C:[[8,4,312,303],[337,2,264,307],[628,3,307,306],[943,1,308,308],[4,312,308,308],[320,311,302,305],[628,311,305,306],[935,311,316,306]],
 D:[[1,616,313,301],[318,616,304,299],[621,626,314,281],[933,619,320,300],[1,917,313,330],[318,916,310,320],[634,910,292,333],[933,919,320,328]]
};
export function badgeArtSpec(id){
 if(!BADGES.some(b=>b.id===id))throw Error('Unknown badge art: '+id);
 if(+id.slice(1)>8){const tier=['D10','D12'].includes(id)?'legendary':'epic';return {procedural:true,tier,label:tier==='legendary'?'传世珍藏':'瑰丽珍藏'};}
 const f=id[0],i=+id.slice(1)-1,index=i+('BD'.includes(f)?8:0);
 return {atlas:'AB'.includes(f)?'assets/badges-ab-v3.webp':'assets/badges-cd-v3.webp',col:index%4,row:Math.floor(index/4),rect:RECTS[f][i],tier:LEGENDARY.has(id)?'legendary':EPIC.has(id)?'epic':'fine',label:LEGENDARY.has(id)?'传世珍藏':EPIC.has(id)?'瑰丽珍藏':'精致珍藏'};
}
