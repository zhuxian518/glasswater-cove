// Original 32-bar D pentatonic score, 88 BPM. Audio has independent randomness.
const MELODY=[[74,78,81,78,76,74,69,0],[66,69,74,76,78,0,76,74],[71,74,78,81,83,81,78,0],[69,73,76,78,76,73,69,0],[74,0,78,81,86,83,81,78],[76,78,81,78,76,74,69,0],[71,74,78,0,76,74,71,69],[73,76,81,78,76,73,74,0]];
export class AudioMixer{
 constructor(){this.enabled=false;this.music=false;this.ambience=false;this.context=null;this.active=0;this.timer=null;this.step=0;this.next=0;this.lastCatch=-1;}
 unlock(){try{const C=window.AudioContext||window.webkitAudioContext;if(!this.context&&C){this.context=new C();this.master=this.context.createGain();this.master.gain.value=.65;this.master.connect(this.context.destination);this.musicBus=this.context.createGain();this.musicBus.gain.value=.65;this.musicBus.connect(this.master);this.ambientBus=this.context.createGain();this.ambientBus.connect(this.master);this.makeWaves();}if(this.context){this.context.resume().catch(()=>{});this.next=this.context.currentTime+.06;if(!this.timer)this.timer=setInterval(()=>this.schedule(),100);this.applySettings();}}catch{}}
 applySettings(){if(this.ambientBus)this.ambientBus.gain.setTargetAtTime(this.ambience?.035:0,this.context.currentTime,.2);}
 makeWaves(){const c=this.context,b=c.createBuffer(1,c.sampleRate*8,c.sampleRate),d=b.getChannelData(0);let smooth=0;for(let i=0;i<d.length;i++){smooth=.97*smooth+.03*(Math.random()*2-1);d[i]=smooth*(.45+.4*Math.sin(Math.PI*i/d.length)**2);}const src=c.createBufferSource(),f=c.createBiquadFilter();src.buffer=b;src.loop=true;f.type='lowpass';f.frequency.value=650;src.connect(f);f.connect(this.ambientBus);src.start();}
 note(midi,time,length,volume,bus=this.master,kind='bell'){
  if(!this.context||this.active>=48)return;const c=this.context,g=c.createGain();g.gain.setValueAtTime(.00001,time);g.gain.linearRampToValueAtTime(volume,time+.008);g.gain.exponentialRampToValueAtTime(.00001,time+length);g.connect(bus);
  const f=440*2**((midi-69)/12),partials=kind==='string'?[[1,1],[2,.24],[3,.08]]:[[1,1],[2.01,.22],[3.98,.035]];let left=partials.length;this.active++;
  for(const [ratio,amp] of partials){const o=c.createOscillator(),a=c.createGain();o.type='sine';o.frequency.value=f*ratio;a.gain.value=amp;o.connect(a);a.connect(g);o.start(time);o.stop(time+length+.02);o.onended=()=>{o.disconnect();a.disconnect();if(--left===0){g.disconnect();this.active--;}};}
 }
 noise(duration,volume,cutoff=1400,delay=0){if(!this.context||this.active>=48)return;const c=this.context,t=c.currentTime+delay,b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(cutoff,t);f.frequency.exponentialRampToValueAtTime(180,t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);this.active++;s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();this.active--;};}
 schedule(){const c=this.context;if(!c||c.state!=='running')return;if(this.next<c.currentTime)this.next=c.currentTime+.03;while(this.next<c.currentTime+.18){const k=this.step%256,bar=Math.floor(k/8),beat=k%8,chord=[[50,54,57],[47,50,54],[43,47,50],[45,49,52]][bar%4],phrase=MELODY[(bar+Math.floor(bar/8)*2)%8];if(this.music){const melody=phrase[beat];if(melody)this.note(melody+(bar>=16&&bar<24?12:0),this.next,.7,beat%2?.014:.021,this.musicBus);if(beat%2===0){this.note(chord[(beat/2)%3]+12,this.next,.38,.012,this.musicBus,'string');if(beat===0)this.note(chord[0]-12,this.next,1,.028,this.musicBus,'string');}}this.step++;this.next+=60/88/2;}}
 play(e){if(!this.enabled||this.context?.state!=='running')return;const t=this.context.currentTime;
  if(e.type==='cast')this.noise(.19,.023,2200);
  if(e.type==='splash'){this.noise(.35,.085,1900);this.noise(.16,.028,900,.12);}
  if(e.type==='open')this.noise(.18,.016,650);
  if(e.type==='capture'&&t-this.lastCatch>.16){this.lastCatch=t;this.note(81+(e.netId%3)*2,t,.23,.018);}
  if(e.type==='return'){this.note(50,t,.12,.035,this.master,'string');if(e.count){[74,78,...(e.slots===6?[81,86]:[])].forEach((n,i)=>this.note(n,t+.07+i*.11,.65,.034));this.musicBus.gain.setValueAtTime(.4,t);this.musicBus.gain.linearRampToValueAtTime(.65,t+.85);}}
  if(e.type==='badge')[78,81,86,90].forEach((n,i)=>this.note(n,t+i*.15,.9,.03));
 }
 pause(){clearInterval(this.timer);this.timer=null;if(this.context?.state==='running')this.context.suspend().catch(()=>{});}
}
