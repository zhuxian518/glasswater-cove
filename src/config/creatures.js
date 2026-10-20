export const CREATURES = [
  {id:'F01',name:'小银鱼',kind:'fish',depths:[360,570],speed:130,cost:1,score:10,w:26,h:11,color:'#bcece4',accent:'#5bb4c1',note:'银光成群，浅水里的小确幸。'},
  {id:'F02',name:'青背鱼',kind:'fish',depths:[360,570,780],speed:175,cost:1,score:15,w:32,h:12,color:'#67cabe',accent:'#257c90',note:'青色脊背，留一点游动的提前量。'},
  {id:'F03',name:'黄鳍鱼',kind:'fish',depths:[570,780],speed:210,cost:1,score:20,w:34,h:14,color:'#ffe09a',accent:'#d49d43',note:'轻快的黄鳍，考验你的松手时机。'},
  {id:'F04',name:'红鲷鱼',kind:'fish',depths:[570,780],speed:155,cost:1,score:25,w:38,h:16,color:'#ffac95',accent:'#bf626c',note:'珊瑚色的身影，中层的好收获。'},
  {id:'F06',name:'金尾鱼',kind:'fish',depths:[570,780],speed:200,cost:1,score:80,w:32,h:14,color:'#fff0b9',accent:'#e8b147',note:'偶尔闪过的金尾，值得专门等一网。'},
  {id:'F09',name:'海虾',kind:'shrimp',depths:[360,570],speed:165,cost:1,score:12,w:25,h:12,color:'#ffd0ad',accent:'#e99785',note:'细长触须与弯弯身体，常常结伴而来。'},
  {id:'F10',name:'小海蟹',kind:'crab',depths:[980],speed:80,cost:2,score:40,w:32,h:18,color:'#eeae7b',accent:'#bc7160',note:'在海底横行，占两格网兜空间。'},
  {id:'F11',name:'鱿鱼',kind:'squid',depths:[570,780],speed:185,cost:1,score:40,w:34,h:15,color:'#e4bcec',accent:'#9e83ba',note:'梭形身体与柔软触腕，游得很快。'},
  {id:'F12',name:'小章鱼',kind:'octopus',depths:[780,980],speed:100,cost:2,score:60,w:32,h:27,color:'#e9adca',accent:'#b570a6',note:'慢悠悠舒展触腕，一只也是好收获。'},
  {id:'F13',name:'海龙虾',kind:'lobster',depths:[980],speed:75,cost:2,score:55,w:38,h:22,color:'#e8a16e',accent:'#a55d57',note:'长须、分节甲壳与尾扇，藏在海底。'}
  ,{id:'F14',name:'珍珠河豚',kind:'puffer',depths:[360,570],speed:95,cost:2,score:45,w:27,h:25,color:'#f4e4ad',accent:'#ae9471',note:'圆滚滚的珍珠斑点，占两格，适合耐心等候。'},
  {id:'F15',name:'金纹蝴蝶鱼',kind:'fish',pattern:'bands',depths:[360,570],speed:150,cost:1,score:22,w:27,h:22,color:'#ffe39b',accent:'#cf9f45',note:'金色扇形身躯与深色条纹，爱在浅礁结伴。'},
  {id:'F16',name:'蓝翼神仙鱼',kind:'angelfish',depths:[570,780],speed:145,cost:1,score:28,w:27,h:30,color:'#abd9ed',accent:'#6286b7',note:'高高的背鳍像蓝色风帆，中层轻盈滑行。'},
  {id:'F17',name:'绯羽狮子鱼',kind:'lionfish',depths:[570,780],speed:110,cost:2,score:65,w:32,h:20,color:'#f0bea7',accent:'#af6467',note:'展开绯色羽鳍，占两格，礁石旁的华丽来客。'},
  {id:'F18',name:'银翼飞鱼',kind:'flyingfish',depths:[360,570],speed:245,cost:1,score:35,w:34,h:12,color:'#c7eef1',accent:'#6fabc2',note:'银蓝胸鳍像双翼，速度快，要提前撒网。'},
  {id:'F19',name:'蓝点鳐鱼',kind:'ray',depths:[780,980],speed:105,cost:2,score:70,w:43,h:25,color:'#b0ced5',accent:'#638ca8',note:'菱形双翼与蓝点，占两格，掠过深水。'},
  {id:'F20',name:'花纹墨鱼',kind:'cuttlefish',depths:[570,780],speed:135,cost:2,score:58,w:35,h:20,color:'#d9c2e6',accent:'#9879ad',note:'裙边鳍轻轻起伏，比鱿鱼宽厚，占两格。'},
  {id:'F21',name:'珊瑚扇贝',kind:'scallop',depths:[980],speed:55,cost:1,score:30,w:26,h:23,color:'#f4c2bb',accent:'#c78691',note:'放射贝纹与开合裙边，慢慢滑过海床。'},
  {id:'F22',name:'月光海螺',kind:'conch',depths:[980],speed:40,cost:1,score:32,w:29,h:21,color:'#f2d8b3',accent:'#b79379',note:'螺旋贝壳映着月色，在海底缓缓移动。'},
  {id:'F23',name:'翡翠皮皮虾',kind:'mantis',depths:[780,980],speed:155,cost:1,score:38,w:34,h:13,color:'#b3dfc2',accent:'#658e7f',note:'分节绿甲与折叠前肢，深水中的敏捷伙伴。'}
];
export const BY_ID = CREATURES.reduce((map,c)=>(map[c.id]=c,map),{});
export const THEMES = [
  {name:'海草边',extra:['F11','F10','F12','F14','F16','F20','F22','F23'],description:'海草轻摆，蓝翼与柔软触腕相遇。'},
  {name:'礁石边',extra:['F03','F10','F13','F14','F15','F17','F19','F21','F22'],description:'礁石边缘，羽鳍、贝壳与甲壳伙伴藏在其中。'},
  {name:'流动水',extra:['F03','F11','F12','F15','F16','F18','F19','F20','F21','F23'],description:'跟着水流，等待银翼飞鱼与深水鳐鱼。'}
];
export const ENVIRONMENT = ['水母','海马','海星','海胆','珊瑚','海龟'];
