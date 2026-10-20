const KEYS=['castfishing-profile-v1','castfishing-checkpoint-v1'];
export async function createMiniToolStorage(xhs,legacy,onFailure=()=>{}){
 const api=xhs&&xhs.miniTool;let options=xhs&&xhs.launchOptions;
 if(!options?.miniToolEnv?.buildVersion&&typeof api?.getLaunchOptions==='function')try{options=await api.getLaunchOptions();}catch{}
 const version=Math.floor((Number(options?.miniToolEnv?.buildVersion)||0)/1000);
 if(version<9460||!['getStorage','setStorage','removeStorage'].every(k=>typeof api?.[k]==='function'))return legacy;
 const cache=new Map();let queue=Promise.resolve(),failed=false,readFailed=false;
 for(const key of KEYS)try{const result=await api.getStorage({key});if(typeof result.data==='string')cache.set(key,result.data);else if(result.data!==null&&result.data!==undefined)throw Error('存档格式不正确');}catch(e){readFailed=true;onFailure('原生存档读取失败，已停止覆盖；请关闭后重试。');}
 // Migrate the old browser namespace once. Never mix an old checkpoint into an existing native profile.
 if(!readFailed&&!cache.has(KEYS[0]))for(const key of [...KEYS].reverse())try{const value=legacy?.getItem(key);if(value!==null&&value!==undefined){JSON.parse(value);await api.setStorage({key,data:value});cache.set(key,value);}}catch{readFailed=true;onFailure('旧存档迁移未完成，已停止覆盖；原存档仍保留。');break;}
 const enqueue=work=>{queue=queue.then(work).catch(()=>{failed=true;onFailure('原生存档写入失败，本次进度尚未保存，请保留页面并重试保存。');});};
 return {
  native:true,getItem:key=>cache.get(key)||null,
  setItem(key,value){if(readFailed)throw Error('原生存档读取失败');JSON.parse(value);if(new Blob([value]).size>1024*1024)throw Error('存档超过单项容量');cache.set(key,value);enqueue(async()=>{await api.setStorage({key,data:value});if(key===KEYS[0])failed=false;});},
  removeItem(key){if(readFailed)throw Error('原生存档读取失败');enqueue(async()=>{if(failed)return;await api.removeStorage({key});cache.delete(key);});},
  async flush(){await queue;return !failed&&!readFailed;}
 };
}
