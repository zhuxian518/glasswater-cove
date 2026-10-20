import {FishingSimulation} from './core/FishingSimulation.js';
import {Clock} from './core/Clock.js';
import {CanvasRenderer} from './render/CanvasRenderer.js';
import {drawCreature} from './render/CreatureShapes.js';
import {CREATURES,BY_ID,THEMES} from './config/creatures.js';
import {InputAdapter} from './input/InputAdapter.js';
import {StorageAdapter} from './platform/StorageAdapter.js';
import {AudioMixer} from './audio/AudioMixer.js';
import {Harbor} from './ui/Harbor.js';
import {BADGES} from './config/badges.js';
import {QUESTS} from './systems/Progress.js';
import {badgeCanvas,badgeArtReady} from './render/BadgeArt.js';
import {createMiniToolStorage} from './platform/MiniToolStorage.js';
import {installCompatibility} from './platform/Compatibility.js';
async function boot(){
installCompatibility();
const $=id=>document.getElementById(id),renderer=new CanvasRenderer($('sea')),clock=new Clock(18),audio=new AudioMixer();
let local=null;try{local=window.localStorage;}catch{}
let bootReady=false,storageWarning='';
if(__MINITOOL__)local=await createMiniToolStorage(window.xhs,local,message=>{if(bootReady)toast(message);else storageWarning=message;});
const storage=new StorageAdapter(local);let profile=storage.loadProfile(),sim=null,state='READY',toastTimer=0,lastFrame=0,commit=null;
audio.enabled=profile.settings.sound;
audio.music=profile.settings.music;audio.ambience=profile.settings.ambience;
const running=()=>state==='PLAYING';
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');const notice=document.querySelector('#harbor[open] .harbor-notice');if(notice)notice.textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function hidePanels(){for(const id of ['welcome','pause-panel','result'])$(id).hidden=true;}
function refreshProfile(){
  $('best').textContent=profile.bestScore.toLocaleString();$('collection-progress').textContent=Object.values(profile.collection).filter(n=>n>0).length+' / '+CREATURES.length;
  $('sound').textContent='♫';$('sound').setAttribute('aria-label','声音与存档设置');
  if($('harbor-status')){const q=QUESTS.find(q=>q.id===profile.progress.quest.id);$('harbor-status').textContent=`${q.name} ${profile.progress.quest.value}/${q.target} · 珍藏 ${Object.keys(profile.progress.badges).length}/${BADGES.length}`;}
  if($('equipped-badges')){$('equipped-badges').replaceChildren();for(const id of profile.progress.equipped){const b=BADGES.find(b=>b.id===id);if(b)$('equipped-badges').append(badgeCanvas(b));}}
}
function checkpointAvailable(){const cp=storage.loadCheckpoint();return cp&&!profile.committedRunIds.includes(cp.data?.runId);}
function home(){state='READY';sim=null;input.clear();audio.pause();clock.reset();hidePanels();$('welcome').hidden=false;$('resume-save').hidden=!checkpointAvailable();$('pause').disabled=true;renderer.effects=[];hud();}
function start(replaySeed,replayTheme){
  profile.runSequence++;storage.saveProfile(profile);
  const seed=typeof replaySeed==='number'?replaySeed:(Date.now()^(profile.runSequence*2654435761))>>>0;
  sim=new FishingSimulation(seed,typeof replayTheme==='number'?replayTheme:(profile.runSequence-1)%3,'fishing-'+Date.now()+'-'+profile.runSequence);commit=null;state='PLAYING';input.clear();clock.reset();renderer.effects=[];hidePanels();audio.unlock();$('pause').disabled=false;
  storage.saveCheckpoint(sim);toast(profile.tutorialSeen?'留一点提前量，等一张好网。':'← → 开船 · 按住下沉 · 松手兜鱼');hud();
}
function pause(reason='稍作休息，再接着收获。'){
  if(!running())return;state='PAUSED';input.clear();sim.releasePhysical();clock.reset();audio.pause();storage.saveCheckpoint(sim);hidePanels();$('pause-panel').hidden=false;$('pause-copy').textContent=sim.controlled?'还有一张下沉网。继续后按住可接管，松手收拢；不接管则到底自动兜鱼。':reason;
}
function resume(){state='PLAYING';clock.reset();input.clear();audio.unlock();hidePanels();hud();}
function restore(){try{const cp=storage.loadCheckpoint();if(profile.committedRunIds.includes(cp?.data?.runId)){storage.clearCheckpoint();home();return;}sim=FishingSimulation.restore(cp);commit=null;renderer.effects=[];state='PAUSED';hidePanels();$('pause-panel').hidden=false;$('pause-copy').textContent=sim.controlled?'下沉网已保留。继续后按住接管原网，松手收拢。':'已恢复上次的渔船、鱼群和在途网。';$('pause').disabled=false;hud();}catch{storage.clearCheckpoint();$('resume-save').hidden=true;toast('上次存档无法读取，可以重新出海。');}}
function end(){
  state='ENDED';input.clear();commit=storage.commit(profile,sim);profile=commit.profile;refreshProfile();hidePanels();$('result').hidden=false;$('pause').disabled=true;
  const settledRun=sim.runId;if(local?.native){$('record-note').textContent='正在保存本次收获……';local.flush().then(ok=>{if(sim?.runId===settledRun&&state==='ENDED')$('record-note').textContent=ok?'本次收获已保存。':'本次收获尚未保存，请保留页面并重试保存。';});}
  const s=sim.stats;$('result-score').textContent=s.score.toLocaleString();$('result-count').textContent=Object.values(s.caughtByType).reduce((a,b)=>a+b,0);$('result-net').textContent=s.bestNetScore;$('result-found').textContent=commit.newSpecies.length;
  $('record-note').textContent=local?.native?'正在保存本次收获……':!commit.saved?'本次收获已显示；设备存储不可用，记录未能保存。':commit.newRecord?'新的海湾纪录，记住这阵好潮汐。':s.score?'一网有一网的惊喜，下次再来看看。':'观察水层与提前量，下一趟试着在鱼群前方张网。';
  $('result-species').replaceChildren();for(const [id,n] of Object.entries(s.caughtByType)){const e=document.createElement('span');e.textContent=BY_ID[id].name+' × '+n;$('result-species').append(e);}
  $('reward-note').replaceChildren();const b=BADGES.find(b=>b.id===commit.newBadges?.[0]);if(b){$('reward-note').append(badgeCanvas(b));const text=document.createElement('p');text.textContent='珍藏新徽章 · '+b.name+(commit.newBadges.length>1?'（还有 '+(commit.newBadges.length-1)+' 枚，在徽章册查看）':'');$('reward-note').append(text);audio.play({type:'badge'});}if(commit.questCompleted){const text=document.createElement('p');text.textContent='海湾来信完成 · 收到一枚纪念邮戳';$('reward-note').append(text);}
}
const input=new InputAdapter({left:$('left'),right:$('right'),cast:$('cast'),onCancel:()=>pause('操作被打断，已为你暂停。'),isRunning:()=>running()&&sim.phase==='PLAYING'});
function hud(){
  const seconds=sim?Math.max(0,Math.ceil((5400-sim.playTick)/60)):90;$('score').textContent=(sim?.stats.score||0).toLocaleString();$('time').textContent=sim?.phase==='DRAINING'?'收网中':String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');$('time-bar').style.width=(seconds/90*100)+'%';
  $('theme-label').textContent=sim?THEMES[sim.themeIndex].name:'晚潮 · 海草边';const available=sim?.nets.length?0:1;$('slot-label').textContent=available?'渔网就绪':sim.nets.length>1?'收回旧网中':'渔网在途中';$('net-slots').querySelector('i').classList.toggle('busy',!available);
  const control=sim?.controlled,canMove=running()&&sim?.phase==='PLAYING',waiting=!control&&!available;$('cast-label').textContent=control?(control.phase==='CAST'?'正在抛网':'松手兜鱼'):waiting?'正在收网':'按住撒网';$('cast-hint').textContent=control?(control.phase==='CAST'?'落水后 · 自然下沉':'选好水层 · 轻轻松手'):waiting?'回到船上 · 再抛下一网':'松手 · 收拢兜鱼';$('cast').classList.toggle('holding',!!control);$('cast').disabled=!canMove||(waiting&&input.castOwner===null);$('left').disabled=$('right').disabled=!canMove;
  if(sim)$('tip').textContent=sim.phase==='DRAINING'?'最后一网，也好好收回来':control?(control.phase==='CAST'?'挥臂抛网 · 等它轻轻落水':'放过浅层，也许深处有惊喜'):'浅层快收获 · 深层等伙伴';
}
$('start').onclick=start;$('again').onclick=start;$('resume-save').onclick=restore;$('resume').onclick=resume;
$('pause').onclick=()=>running()?pause():state==='PAUSED'?resume():null;
$('home').onclick=()=>{storage.saveCheckpoint(sim);home();};$('result-home').onclick=home;
$('sound').onclick=()=>harbor.open('settings');
$('collection-open').onclick=()=>{
  pause();$('creature-grid').replaceChildren();
  for(const c of CREATURES){const n=profile.collection[c.id],card=document.createElement('article');card.className='creature-card'+(n?' discovered':'');const cv=document.createElement('canvas');cv.width=360;cv.height=144;const g=cv.getContext('2d');drawCreature(g,c,180,72,1.5,1,.7);card.append(cv);
    const h=document.createElement('h4');h.textContent=c.name;const count=document.createElement('span');count.textContent=n?'已捕获 '+n+' 只':'等待发现';h.append(count);card.append(h);const p=document.createElement('p');p.textContent=c.note;card.append(p);const meta=document.createElement('div');meta.className='creature-meta';meta.textContent=c.score+' 分 / 只 · 占 '+c.cost+' 格';card.append(meta);$('creature-grid').append(card);
  }
  if($('collection').showModal)$('collection').showModal();else $('collection').setAttribute('open','');
};
$('collection-close').onclick=()=>{$('collection').close?$('collection').close():$('collection').removeAttribute('open');};
$('collection').addEventListener('click',e=>{if(e.target===$('collection')){const r=$('collection').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('collection-close').click();}});
async function shareCard(share=false){
  const current=sim,selectedBadges=[...profile.progress.equipped];if(!current)return;await badgeArtReady(selectedBadges);
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1000;const g=canvas.getContext('2d');g.fillStyle='#f5efdc';g.fillRect(0,0,800,1000);g.drawImage(renderer.background,35,35,730,890);g.fillStyle='#fff9e9ee';g.fillRect(65,200,670,570);g.strokeStyle='#c8b68d';g.setLineDash([7,6]);g.strokeRect(80,215,640,540);g.setLineDash([]);g.textAlign='center';g.fillStyle='#a46c4c';g.font='38px SimSun,serif';g.fillText('琉璃海湾 · 潮汐手记',400,300);g.font='94px Georgia,serif';g.fillText(current.stats.score.toLocaleString(),400,455);g.font='22px Microsoft YaHei,sans-serif';g.fillText('本次鱼获积分',400,505);g.font='20px Microsoft YaHei,sans-serif';g.fillText('最佳一网 '+current.stats.bestNetScore+' 分 · 发现 '+Object.keys(current.stats.caughtByType).length+' 种伙伴',400,580);g.fillText('等一阵鱼群，撒一张好网。',400,685);
  selectedBadges.forEach((id,i)=>{const b=BADGES.find(b=>b.id===id);if(b)g.drawImage(badgeCanvas(b),280+i*80,795,72,72);});
  if(__MINITOOL__){try{const api=window.xhs&&window.xhs.miniTool;if(!api)throw Error('请在小红书小工具内使用保存与分享。');let filePath=canvas.toDataURL('image/png');if(typeof api.writeTempFile==='function')({filePath}=await api.writeTempFile({data:filePath}));if(share){if(typeof api.postNote!=='function')throw Error('当前客户端不支持分享。');await api.postNote({title:'琉璃海湾·今天的收获',content:'等一阵鱼群，撒一张好网。',mediaInfo:{image_resources:[{url:filePath}]}});toast('已交由小红书处理分享。');}else{if(typeof api.saveImageToPhotosAlbum!=='function')throw Error('当前客户端不支持保存相册。');await api.saveImageToPhotosAlbum({filePath});toast('收获图片已保存到相册。');}}catch(e){toast(e.message||e.errMsg||'操作未完成，可稍后重试。');}return;}
  canvas.toBlob(async blob=>{if(!blob){toast('图片生成失败，请稍后再试。');return;}if(share){try{const file=new File([blob],'琉璃海湾-本次收获.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({title:'琉璃海湾 · 今天的收获',text:'等一阵鱼群，撒一张好网。',files:[file]});return;}}catch(e){if(e.name==='AbortError')return;}}harbor.download(blob,'琉璃海湾-本次收获.png');toast(share?'已生成分享卡，可自行发送。':'已生成收获图片。');},'image/png');
}
$('save-card').onclick=()=>shareCard(false);
const harbor=new Harbor({getProfile:()=>profile,save:()=>{const ok=storage.saveProfile(profile);refreshProfile();if(!ok)toast('设备存储不可用，请导出备份保存。');},pause:()=>pause(),audio,toast,retry:(seed,theme)=>start(seed,theme),manualSave:()=>{if(!sim){toast('当前没有进行中的出海。');return;}if(state==='ENDED'){const ok=storage.saveProfile(profile);if(ok)storage.clearCheckpoint();if(local?.native)local.flush().then(saved=>toast(ok&&saved?'图鉴、徽章与本次收获已保存。':'记录未能保存，请保留页面并重试。'));else toast(ok?'图鉴、徽章与本次收获已保存。':'记录未能保存。');return;}const ok=storage.saveProfile(profile)&&storage.saveCheckpoint(sim);if(local?.native)local.flush().then(saved=>toast(ok&&saved?'当前出海已保存。':'存档未能写入，请保留页面并重试。'));else toast(ok?'当前出海已保存。':'存档未能写入，请导出备份。');}});
harbor.flushStorage=()=>local?.flush?local.flush():Promise.resolve(true);
harbor.readCheckpoint=()=>storage.loadCheckpoint();
harbor.inspectBackup=text=>storage.inspectBackup(text);
harbor.restoreBackup=b=>{if(!storage.restoreBackup(b))return false;profile=storage.loadProfile();audio.enabled=profile.settings.sound;audio.music=profile.settings.music;audio.ambience=profile.settings.ambience;refreshProfile();home();return true;};
const nav=document.createElement('div');nav.className='harbor-nav';for(const [tab,name] of [['badges','徽章册'],['quests','来信'],['history','战绩'],['feedback','反馈']]){const b=document.createElement('button');b.textContent=name;b.onclick=()=>harbor.open(tab);nav.append(b);}$('collection-open').parentElement.after(nav);const status=document.createElement('button');status.id='harbor-status';status.className='harbor-status';status.onclick=()=>harbor.open('quests');nav.after(status);const worn=document.createElement('div');worn.id='equipped-badges';worn.className='equipped-badges';$('welcome').querySelector('.welcome-card').append(worn);
const reward=document.createElement('div');reward.id='reward-note';reward.className='reward-note';$('result-species').after(reward);for(const [name,fn] of [['查看徽章与来信',()=>harbor.open('badges')],['分享本次收获',()=>shareCard(true)],['同一潮汐再试',()=>start(sim.seed,sim.themeIndex)]]){const b=document.createElement('button');b.textContent=name;b.className='text-button';b.onclick=fn;$('save-card').after(b);}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('collection').open&&!harbor.dialog.open){if(running())pause();else if(state==='PAUSED')resume();}});
window.addEventListener('blur',()=>{pause('离开画面时已自动暂停。');audio.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause('回到海湾后，继续出海。');audio.pause();}});
window.addEventListener('pagehide',()=>{pause();if(sim&&state==='PAUSED')storage.saveCheckpoint(sim);});
window.addEventListener('resize',()=>renderer.resize());
function frame(ms){
  const dt=lastFrame?Math.min(.05,(ms-lastFrame)/1000):0;lastFrame=ms;
  clock.advance(ms,running(),()=>{
    if(!running())return;sim.step(input.consume());
    for(const e of sim.events){renderer.event(e);audio.play(e);if(e.type==='rare')toast('一抹金光，正在经过海湾。');if(e.type==='return'&&e.count){const discovered=e.items.find(c=>!profile.collection[c.typeId]&&!sim.stats._shown?.[c.typeId]);if(discovered){if(!sim.stats._shown)sim.stats._shown={};sim.stats._shown[discovered.typeId]=true;toast('遇见 '+BY_ID[discovered.typeId].name+' · 占 '+BY_ID[discovered.typeId].cost+' 格');}}}
    if(sim.phase==='ENDED')end();else if(sim.tick%300===0)storage.saveCheckpoint(sim);
  },()=>pause('画面暂时繁忙，已暂停保护这次收获。'));
  renderer.draw(sim,ms/1000,running()||state==='READY'?dt:0);hud();requestAnimationFrame(frame);
}
refreshProfile();home();bootReady=true;if(storageWarning)toast(storageWarning);requestAnimationFrame(frame);

}
boot().catch(()=>{const panel=document.getElementById('welcome');if(panel){panel.hidden=false;panel.textContent='海湾暂时无法打开，请关闭后重试。';}});
