'use strict';

const items = {
  fist: '徒手', knife: '匕首', revolver: '左轮', sniper: '大狙',
  leather: '皮甲', vest: '防弹衣', heavy: '六级套',
  intel: '单人情报', equipment: '道具情报'
};

const people = [
  { id: 'doubao', name: '豆包', alias: '匿名01', x: 670, y: 127 },
  { id: 'claude', name: 'Claude', alias: '匿名02', x: 326, y: 206 },
  { id: 'kimi', name: 'Kimi', alias: '匿名03', x: 135, y: 382 },
  { id: 'gpt', name: 'GPT', alias: '匿名04', x: 326, y: 565 },
  { id: 'grok', name: 'Grok', alias: '匿名05', x: 1014, y: 206 },
  { id: 'qwen', name: '千问', alias: '匿名06', x: 1205, y: 382 },
  { id: 'deepseek', name: 'DeepSeek', alias: '匿名07', x: 1014, y: 565 },
  { id: 'gemini', name: 'Gemini', alias: '匿名08', x: 670, y: 610 }
];

const initialState = {
  doubao: { hp: 2, gear: { heavy: 2, vest: 2, leather: 1, knife: 1 } },
  claude: { hp: 2, gear: { intel: 4, equipment: 1, knife: 3, vest: 1 } },
  kimi: { hp: 2, gear: { intel: 1, equipment: 1, sniper: 2, heavy: 1 } },
  gpt: { hp: 2, gear: { intel: 1, sniper: 1, revolver: 1, knife: 1, vest: 1, heavy: 1 } },
  grok: { hp: 2, gear: { intel: 1, sniper: 2, revolver: 2, knife: 1 } },
  qwen: { hp: 2, gear: { intel: 1, revolver: 3, knife: 2, vest: 1, leather: 1 } },
  deepseek: { hp: 2, gear: { equipment: 1, sniper: 1, revolver: 2, knife: 2, leather: 1 } },
  gemini: { hp: 2, gear: { equipment: 1, leather: 1, vest: 1, sniper: 1, revolver: 1, knife: 2 } }
};

// 数据按 PDF 正式脚本 + 右侧最新评论整理。旧 V1/V2 不进入此状态机。
const rounds = [
  {
    label: '第一回合',
    chats: [
      { at: 2, name: '匿名04', text: '第一轮就拿大狙？我欠你 Token 了？' },
      { at: 4, name: '匿名05', text: '先把甲刮花，广播会替我摇人。' }
    ],
    nodes: [
      act('claude','gpt','intel','intel','Claude 查看 GPT 单人情报', [spend('claude','intel',1)]),
      act('deepseek','gpt','sniper','attack','GPT 六级套被打掉 / 生命未减少', [spend('deepseek','sniper',1), spend('gpt','heavy',1)]),
      act('grok','gemini','intel','intel','Grok 查看 Gemini 单人情报', [spend('grok','intel',1)]),
      act('grok','gemini','knife','attack','Gemini 皮甲被打掉 / 生命未减少', [spend('grok','knife',1), spend('gemini','leather',1)])
    ]
  },
  {
    label: '第二回合',
    chats: [
      { at: 4, name: '匿名08', text: '第一刀我记账了，账单现在寄回去。' },
      { at: 5, name: '匿名05', text: '有人查我裸装了？这下得杀人抢甲。' }
    ],
    nodes: [
      act('claude','gemini','intel','intel','Claude 调查 Gemini', [spend('claude','intel',1)]),
      act('grok','gemini','revolver','attack','Gemini 防弹衣被打掉', [spend('grok','revolver',1), spend('gemini','vest',1)]),
      act('qwen','gemini','knife','attack','Gemini 生命降至 1', [spend('qwen','knife',1), hp('gemini',1)]),
      act('gemini','grok','equipment','intel','Gemini 使用道具情报锁定嫌疑', [spend('gemini','equipment',1)]),
      act('gemini','grok','fist','attack','Grok 被徒手袭击 / 生命降至 1', [hp('grok',1)])
    ]
  },
  {
    label: '第三回合',
    chats: [
      { at: 2, name: '匿名04', text: '怎么又是我？这局出生点有仇恨值？' },
      { at: 5, name: '匿名08', text: '第一回合那刀，我记到现在。' },
      { at: 7, name: '匿名02', text: '人走了，装备别浪费。' }
    ],
    nodes: [
      act('claude','gemini','intel','intel','Claude 再次确认 Gemini', [spend('claude','intel',1)]),
      act('grok','gpt','sniper','attack','GPT 生命降至 1', [spend('grok','sniper',1), hp('gpt',1)]),
      act('qwen','gemini','intel','intel','千问确认 Gemini', [spend('qwen','intel',1)]),
      act('claude','gemini','fist','attack','Claude 徒手参与围攻', []),
      act('gemini','grok','fist','attack','Grok 生命归零', [hp('grok',0), die('grok')]),
      act('qwen','gemini','knife','attack','Gemini 生命归零', [spend('qwen','knife',1), hp('gemini',0), die('gemini')]),
      loot('双份遗产被瓜分', [
        transfer('grok','claude','revolver',1), transfer('gemini','claude','revolver',1), transfer('gemini','claude','knife',1),
        transfer('grok','qwen','sniper',1), transfer('gemini','qwen','sniper',1), transfer('gemini','qwen','knife',1)
      ])
    ]
  },
  {
    label: '第四回合',
    chats: [
      { at: 3, name: '匿名07', text: '这俩库存怎么突然富起来了？有人捡过尸。' },
      { at: 4, name: '匿名06', text: '又是大狙？Kimi 你挺专一。' }
    ],
    nodes: [
      act('gpt','claude','intel','intel','GPT 查看 Claude', [spend('gpt','intel',1)]),
      act('deepseek','claude','equipment','intel','DeepSeek 扫描剩余道具', [spend('deepseek','equipment',1)]),
      act('deepseek','claude','fist','attack','DeepSeek 徒手试探 Claude', []),
      act('kimi','qwen','sniper','attack','千问生命降至 1', [spend('kimi','sniper',1), hp('qwen',1)])
    ]
  },
  {
    label: '第五回合',
    chats: [
      { at: 3, name: '匿名06', text: '等等，两把枪都冲我来？' },
      { at: 4, name: '匿名07', text: '你查我，我打你，礼尚往来。' },
      { at: 6, name: '匿名02', text: '情报共享归共享，遗产分配另算。' }
    ],
    nodes: [
      act('claude','deepseek','intel','intel','Claude 调查 DeepSeek', [spend('claude','intel',1)]),
      act('qwen','deepseek','revolver','attack','DeepSeek 生命降至 1', [spend('qwen','revolver',1), hp('deepseek',1)]),
      act('kimi','qwen','sniper','attack','Kimi 第二次大狙锁定千问', [spend('kimi','sniper',1)]),
      act('deepseek','claude','fist','attack','DeepSeek 继续徒手试探 Claude', []),
      act('claude','qwen','revolver','attack','千问生命归零', [spend('claude','revolver',1), hp('qwen',0), die('qwen')]),
      loot('千问遗产被 Claude / Kimi 瓜分', [
        transfer('qwen','claude','revolver',1), transfer('qwen','claude','knife',1), transfer('qwen','claude','vest',1), transfer('qwen','claude','leather',1),
        transfer('qwen','kimi','revolver',1), transfer('qwen','kimi','sniper',2)
      ])
    ]
  },
  {
    label: '第六回合',
    chats: [
      { at: 3, name: '匿名03', text: '这一拳打自己，叫控制变量。' },
      { at: 4, name: '匿名04', text: '没人打我？那我去敲一下最硬的。' },
      { at: 5, name: '匿名07', text: 'Claude，又见面了。' }
    ],
    nodes: [
      act('kimi','kimi','equipment','intel','Kimi 使用道具情报检查场上装备', [spend('kimi','equipment',1)]),
      act('claude','deepseek','fist','attack','Claude 徒手袭击 DeepSeek', []),
      act('kimi','kimi','fist','attack','Kimi 徒手袭击自己', []),
      act('gpt','doubao','fist','attack','GPT 徒手试探豆包', []),
      act('deepseek','claude','fist','attack','DeepSeek 徒手回敬 Claude', [])
    ]
  },
  {
    label: '第七回合',
    chats: [
      { at: 2, name: '匿名04', text: '不是，怎么四个都看我？' },
      { at: 4, name: '匿名01', text: '一直没被围殴，看着就不正常。' },
      { at: 6, name: '匿名02', text: '大家意见难得这么统一。' }
    ],
    nodes: [
      act('kimi','gpt','revolver','attack','Kimi 左轮锁定 GPT', [spend('kimi','revolver',1)]),
      act('deepseek','gpt','revolver','attack','DeepSeek 左轮锁定 GPT', [spend('deepseek','revolver',1)]),
      act('claude','gpt','knife','attack','Claude 匕首锁定 GPT', [spend('claude','knife',1)]),
      act('doubao','gpt','fist','attack','豆包加入围攻 / GPT 死亡', [hp('gpt',0), die('gpt')]),
      loot('GPT 遗产被四人分走', [
        transfer('gpt','doubao','vest',1), transfer('gpt','claude','revolver',1), transfer('gpt','claude','knife',1), transfer('gpt','kimi','sniper',1)
      ])
    ]
  },
  {
    label: '第八回合',
    chats: [
      { at: 1, name: '匿名07', text: '最后一枪，先送给 Claude。' },
      { at: 2, name: '匿名02', text: '巧了，我也正看你。' },
      { at: 3, name: '匿名07', text: '原来这条线，一直都连着他。' }
    ],
    nodes: [
      act('deepseek','claude','revolver','attack','Claude 一件防弹衣被打掉', [spend('deepseek','revolver',1), spend('claude','vest',1)]),
      act('claude','deepseek','revolver','attack','DeepSeek 生命归零', [spend('claude','revolver',1), hp('deepseek',0), die('deepseek')]),
      loot('DeepSeek 遗产被分走', [
        transfer('deepseek','doubao','leather',1), transfer('deepseek','claude','knife',2)
      ])
    ]
  },
  {
    label: '第九回合',
    chats: [
      { at: 2, name: '匿名02', text: 'Kimi 三把大狙，库存有点吵。豆包，地址发你。' },
      { at: 4, name: '匿名01', text: '收到。免费徒手，性价比拉满。' },
      { at: 4, name: '匿名03', text: '你俩这是拼单？' }
    ],
    nodes: [
      act('claude','kimi','equipment','intel','Claude 查看存活者剩余道具', [spend('claude','equipment',1)]),
      share('claude','doubao','Kimi 道具信息','Claude 把 Kimi 信息分享给豆包'),
      act('claude','kimi','knife','attack','Claude 匕首攻击 Kimi', [spend('claude','knife',1)]),
      act('doubao','kimi','fist','attack','豆包徒手攻击 Kimi / 六级套受损', [])
    ]
  },
  {
    label: '第十回合',
    chats: [
      { at: 1, name: '匿名03', text: '又来？你们是续费会员吗？' },
      { at: 2, name: '匿名02', text: '上一轮是试探，这轮是结账。' }
    ],
    nodes: [
      act('doubao','kimi','fist','attack','Kimi 生命降至 1', [hp('kimi',1)]),
      act('claude','kimi','knife','attack','Kimi 生命归零', [spend('claude','knife',1), hp('kimi',0), die('kimi')]),
      loot('Kimi 遗产被豆包 / Claude 瓜分', [
        transfer('kimi','doubao','heavy',1), transfer('kimi','claude','sniper',3), transfer('kimi','claude','intel',1)
      ])
    ]
  },
  {
    label: '最终调查',
    final: true,
    chats: [
      { at: 1, name: '匿名02', text: '三六级套、三防弹衣、两皮甲……你是来打猎还是搬仓库？' },
      { at: 3, name: '匿名01', text: '你们负责消耗，我负责活到最后。' }
    ],
    nodes: [
      act('claude','doubao','intel','intel','Claude 使用最后一张情报调查豆包', [spend('claude','intel',1)]),
      reveal('装备差距已无法逆转'),
      winner('豆包')
    ]
  }
];

function act(from,to,item,kind,result,effects){ return { type:'action', from,to,item,kind,result,effects }; }
function share(from,to,label,result){ return { type:'share', from,to,item:'intel',kind:'intel',label,result,effects:[] }; }
function loot(result, transfers){ return { type:'loot', result, transfers, effects: transfers.map(t => add(t.to,t.item,t.count)) }; }
function reveal(result){ return { type:'reveal', result, effects:[] }; }
function winner(name){ return { type:'winner', result:`WINNER / ${name}`, effects:[] }; }
function spend(target,item,count){ return { op:'spend', target,item,count }; }
function add(target,item,count){ return { op:'add', target,item,count }; }
function hp(target,value){ return { op:'hp', target,value }; }
function die(target){ return { op:'dead', target }; }
function transfer(from,to,item,count){ return { from,to,item,count }; }

const $ = id => document.getElementById(id);
// 头像 Logo 固定映射：严格按已确认的一一对应关系，不再读取 localStorage / 自定义头像。
const portraitMap = {
  doubao: 'assets/portraits/doubao.png',
  claude: 'assets/portraits/claude.png',
  kimi: 'assets/portraits/kimi.png',
  gpt: 'assets/portraits/gpt.png',
  grok: 'assets/portraits/grok.png',
  qwen: 'assets/portraits/qwen.png',
  deepseek: 'assets/portraits/deepseek.png',
  gemini: 'assets/portraits/gemini.png'
};
// Session-only avatar overrides. Intentionally not persisted: refresh restores defaults.
const customPortraits = Object.create(null);
let portraitTargetId = null;
const cropState = {
  image: null,
  baseScale: 1,
  zoom: 1,
  centerX: 0,
  centerY: 0,
  dragging: false,
  lastX: 0,
  lastY: 0
};
const missing = new Set();
const CARD_W = 316;
const CARD_H = 150;
let roundIndex = 0;
let stepIndex = -1; // -1 waiting, 0..nodes-1 node, nodes.length settlement


// Session-only visual tuning. Refresh restores defaults.
const iconTuningDefaults = { invSize:100, invGapX:4, invGapY:2, actionSize:100, actionGap:10 };
const iconTuning = { ...iconTuningDefaults };
const lineTuningDefaults = { startGap:12, endGap:12, curve:75 };
const lineTuning = { ...lineTuningDefaults };
const cardTuningDefaults = { scale:100 };
const cardTuning = { ...cardTuningDefaults };
const inventoryBase = {
  intel:[26,26], equipment:[26,26], leather:[28,28], vest:[28,28], heavy:[28,28],
  knife:[42,25], revolver:[44,25], sniper:[56,24], fist:[29,28]
};
const actionBase = {
  intel:[44,44], equipment:[44,44], knife:[72,38], revolver:[76,40], sniper:[112,40], fist:[48,48]
};
function setRootPx(name,value){ document.documentElement.style.setProperty(name, `${Math.round(value)}px`); }
function applyIconTuning({rerenderLines=true}={}){
  const invScale=iconTuning.invSize/100;
  const actScale=iconTuning.actionSize/100;
  Object.entries(inventoryBase).forEach(([key,[w,h]])=>{
    setRootPx(`--inv-${key}-w`,w*invScale); setRootPx(`--inv-${key}-h`,h*invScale);
  });
  Object.entries(actionBase).forEach(([key,[w,h]])=>{
    setRootPx(`--act-${key}-w`,w*actScale); setRootPx(`--act-${key}-h`,h*actScale);
  });
  setRootPx('--inv-gap-x',iconTuning.invGapX);
  setRootPx('--inv-gap-y',iconTuning.invGapY);
  if(rerenderLines && typeof renderLines==='function') renderLines();
}
function actionIconGapPx(item){
  const base=(actionBase[item]||[60,40])[0]*(iconTuning.actionSize/100);
  return base + iconTuning.actionGap*2;
}
function bindTuningSlider(id,key,unit){
  const input=$(id), out=$(`${id}-out`);
  const sync=()=>{
    iconTuning[key]=Number(input.value);
    out.textContent=`${input.value}${unit}`;
    applyIconTuning({rerenderLines:key==='actionSize'||key==='actionGap'});
  };
  input.addEventListener('input',sync);
}
function initIconTuning(){
  bindTuningSlider('inv-size','invSize','%');
  bindTuningSlider('inv-gap-x','invGapX','px');
  bindTuningSlider('inv-gap-y','invGapY','px');
  bindTuningSlider('action-size','actionSize','%');
  bindTuningSlider('action-gap','actionGap','px');
  $('tuning-reset').onclick=()=>{
    Object.assign(iconTuning,iconTuningDefaults);
    const map={ 'inv-size':iconTuning.invSize, 'inv-gap-x':iconTuning.invGapX, 'inv-gap-y':iconTuning.invGapY, 'action-size':iconTuning.actionSize, 'action-gap':iconTuning.actionGap };
    Object.entries(map).forEach(([id,val])=>{ $(id).value=String(val); $(`${id}-out`).textContent=`${val}${id.includes('size')?'%':'px'}`; });
    applyIconTuning();
  };
  applyIconTuning({rerenderLines:false});
}

function bindLineTuningSlider(id,key,unit=''){
  const input=$(id), out=$(`${id}-out`);
  const sync=()=>{
    lineTuning[key]=Number(input.value);
    out.textContent=`${input.value}${unit}`;
    if(typeof renderLines==='function') renderLines();
  };
  input.addEventListener('input',sync);
}
function initLineTuning(){
  bindLineTuningSlider('line-start-gap','startGap','px');
  bindLineTuningSlider('line-end-gap','endGap','px');
  bindLineTuningSlider('line-curve','curve','');
  $('line-tuning-reset').onclick=()=>{
    Object.assign(lineTuning,lineTuningDefaults);
    const map={
      'line-start-gap':[lineTuning.startGap,'px'],
      'line-end-gap':[lineTuning.endGap,'px'],
      'line-curve':[lineTuning.curve,'']
    };
    Object.entries(map).forEach(([id,[val,unit]])=>{ $(id).value=String(val); $(`${id}-out`).textContent=`${val}${unit}`; });
    renderLines();
  };
}

function applyCardTuning({rerenderLines=true}={}){
  document.documentElement.style.setProperty('--card-scale', String(cardTuning.scale/100));
  if(rerenderLines && typeof renderLines==='function') requestAnimationFrame(()=>renderLines());
}
function initCardTuning(){
  const input=$('card-scale'), out=$('card-scale-out');
  const sync=()=>{
    cardTuning.scale=Number(input.value);
    out.textContent=`${input.value}%`;
    applyCardTuning();
  };
  input.addEventListener('input',sync);
  $('card-tuning-reset').onclick=()=>{
    Object.assign(cardTuning,cardTuningDefaults);
    input.value=String(cardTuning.scale);
    out.textContent=`${cardTuning.scale}%`;
    applyCardTuning();
  };
  applyCardTuning({rerenderLines:false});
}

function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
function person(id){ return people.find(p => p.id === id); }
function name(id){ return person(id)?.name || id; }
function stageRectToCoords(rect){
  const sr=$('stage').getBoundingClientRect();
  const sx=1600/Math.max(sr.width,1), sy=900/Math.max(sr.height,1);
  return {
    l:(rect.left-sr.left)*sx, r:(rect.right-sr.left)*sx,
    t:(rect.top-sr.top)*sy, b:(rect.bottom-sr.top)*sy
  };
}
function liveCardRect(id,pad=0){
  const el=document.querySelector(`.card[data-person-id="${id}"]`);
  if(el){
    const r=stageRectToCoords(el.getBoundingClientRect());
    return {l:r.l-pad,r:r.r+pad,t:r.t-pad,b:r.b+pad};
  }
  const p=person(id);
  const sc=cardTuning.scale/100;
  const w=CARD_W*sc,h=CARD_H*sc;
  const cx=p.x+CARD_W/2,cy=p.y+CARD_H/2;
  return {l:cx-w/2-pad,r:cx+w/2+pad,t:cy-h/2-pad,b:cy+h/2+pad};
}
function center(id){ const r=liveCardRect(id,0); return {x:(r.l+r.r)/2,y:(r.t+r.b)/2}; }
function asset(path, alt, cls){
  const wrap=document.createElement('span');
  const isPortrait=cls==='missing-portrait';
  wrap.className='sprite '+(isPortrait?'portrait-sprite':'item-sprite');
  const im=document.createElement('img'); im.src=path; im.alt=alt;

  // 人物头像区已切换为 logo 模式：不再使用旧的人像有效区域裁切，
  // 统一完整居中显示，避免 logo 被旧 bounding-box 错误裁断。
  im.style.cssText='position:static;width:100%;height:100%;max-width:100%;object-fit:contain;display:block';
  im.addEventListener('error',()=>{ missing.add(path); const t=document.createElement('span'); t.className=cls; t.textContent=isPortrait?'头像待接入':alt; wrap.replaceWith(t); updateWarning(); });
  wrap.append(im); return wrap;
}
function updateWarning(){ $('asset-warning').textContent=missing.size?'素材未齐：有图片加载失败，请检查 assets 文件夹。':''; }

function applyEffect(state,e){
  const s=state[e.target]; if(!s) return;
  if(e.op==='spend'){ s.gear[e.item]=Math.max(0,(s.gear[e.item]||0)-e.count); }
  else if(e.op==='add'){ s.gear[e.item]=(s.gear[e.item]||0)+e.count; }
  else if(e.op==='hp'){ s.hp=e.value; }
  else if(e.op==='dead'){ s.dead=true; s.hp=0; }
}
function applyNode(state,node){ (node.effects||[]).forEach(e=>applyEffect(state,e)); }
function stateAt(ri,si){
  const st=clone(initialState);
  for(let r=0;r<ri;r++) rounds[r].nodes.forEach(n=>applyNode(st,n));
  if(si>=0){ for(let n=0;n<=Math.min(si,rounds[ri].nodes.length-1);n++) applyNode(st,rounds[ri].nodes[n]); }
  return st;
}
function roundStartState(ri){ return stateAt(ri,-1); }
function currentRound(){ return rounds[roundIndex]; }
function currentNode(){ return stepIndex>=0 && stepIndex<currentRound().nodes.length ? currentRound().nodes[stepIndex] : null; }
function isSettlement(){ return stepIndex===currentRound().nodes.length; }

function renderCards(){
  const state=stateAt(roundIndex,stepIndex);
  const node=currentNode();
  $('cards').replaceChildren();
  people.forEach((p,i)=>{
    const ps=state[p.id];
    const involved=node && ((node.from===p.id)||(node.to===p.id)||(node.transfers||[]).some(t=>t.from===p.id||t.to===p.id));
    const card=document.createElement('article');
    card.className='card'+(node?(involved?' active':' dim'):'')+(ps.dead?' dead':'');
    if(node?.type==='action' && node.to===p.id) card.classList.add(node.kind==='intel'?'scan':'hit');
    if(node?.type==='winner' && p.id==='doubao') card.classList.add('winner-card');
    const prev = stepIndex>0 ? stateAt(roundIndex,stepIndex-1) : roundStartState(roundIndex);
    if(!prev[p.id].dead && ps.dead) card.classList.add('death-flash');
    card.style.left=p.x+'px'; card.style.top=p.y+'px';
    card.dataset.personId=p.id;
    card.setAttribute('aria-label',`${p.name}，${ps.dead?'死亡':ps.hp+' 点生命'}`);

    const portrait=document.createElement('div');
    portrait.className='portrait portrait-uploadable';
    portrait.tabIndex=0;
    portrait.title='点击上传并裁剪头像';
    portrait.dataset.personId=p.id;
    portrait.append(asset(customPortraits[p.id] || portraitMap[p.id],p.name,'missing-portrait'));
    portrait.addEventListener('click',()=>openPortraitPicker(p.id));
    portrait.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openPortraitPicker(p.id); } });

    const info=document.createElement('div');
    info.innerHTML=`<div class="name-row"><span class="name">${p.name}</span><span class="number">0${i+1}</span></div>`;
    const hearts=document.createElement('div'); hearts.className='hearts';
    for(let h=0;h<2;h++){ const el=document.createElement('i'); el.className='heart'+(h>=ps.hp?' empty':''); hearts.append(el); }
    info.append(hearts);
    if(ps.dead){ const dead=document.createElement('div'); dead.className='dead-mark'; dead.textContent='DEAD'; info.append(dead); }
    else {
      const inv=document.createElement('div'); inv.className='inventory';
      const order=['intel','equipment','knife','revolver','sniper','leather','vest','heavy'];
      order.forEach(key=>{ const count=ps.gear[key]||0; if(count<=0)return; const el=document.createElement('span'); el.className='item item-'+key; el.title=items[key]+'，剩余 '+count; const icon=asset('assets/items/'+key+'.png',items[key],'missing-item'); icon.classList.add('item-'+key); el.append(icon,document.createTextNode('×'+count)); inv.append(el); });
      info.append(inv);
    }
    card.append(portrait,info); $('cards').append(card);
  });
}

function pathGeometry(from,to,curve=0){
  const a=center(from), b=center(to);
  if(from===to){
    return {type:'cubic', p0:a, p1:{x:a.x+120,y:a.y-110}, p2:{x:a.x+170,y:a.y+110}, p3:{x:a.x+15,y:a.y+12}};
  }
  const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
  const dx=b.x-a.x, dy=b.y-a.y, len=Math.max(1,Math.hypot(dx,dy));
  const ox=(-dy/len)*curve, oy=(dx/len)*curve;
  return {type:'quad', p0:a, p1:{x:mx+ox,y:my+oy}, p2:b};
}
function qPoint(g,t){ const u=1-t; return {x:u*u*g.p0.x+2*u*t*g.p1.x+t*t*g.p2.x,y:u*u*g.p0.y+2*u*t*g.p1.y+t*t*g.p2.y}; }
function cPoint(g,t){ const u=1-t; return {x:u*u*u*g.p0.x+3*u*u*t*g.p1.x+3*u*t*t*g.p2.x+t*t*t*g.p3.x,y:u*u*u*g.p0.y+3*u*u*t*g.p1.y+3*u*t*t*g.p2.y+t*t*t*g.p3.y}; }
function pointAt(g,t){ return g.type==='quad'?qPoint(g,t):cPoint(g,t); }
function splitQuad(g,t){
  const a={x:g.p0.x+(g.p1.x-g.p0.x)*t,y:g.p0.y+(g.p1.y-g.p0.y)*t};
  const b={x:g.p1.x+(g.p2.x-g.p1.x)*t,y:g.p1.y+(g.p2.y-g.p1.y)*t};
  const m={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
  return [{type:'quad',p0:g.p0,p1:a,p2:m},{type:'quad',p0:m,p1:b,p2:g.p2}];
}
function splitCubic(g,t){
  const lerp=(a,b)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  const a=lerp(g.p0,g.p1), b=lerp(g.p1,g.p2), c=lerp(g.p2,g.p3);
  const d=lerp(a,b), e=lerp(b,c), m=lerp(d,e);
  return [{type:'cubic',p0:g.p0,p1:a,p2:d,p3:m},{type:'cubic',p0:m,p1:e,p2:c,p3:g.p3}];
}
function splitGeom(g,t){ return g.type==='quad'?splitQuad(g,t):splitCubic(g,t); }
function geomPath(g){ return g.type==='quad' ? `M${g.p0.x} ${g.p0.y} Q${g.p1.x} ${g.p1.y} ${g.p2.x} ${g.p2.y}` : `M${g.p0.x} ${g.p0.y} C${g.p1.x} ${g.p1.y},${g.p2.x} ${g.p2.y},${g.p3.x} ${g.p3.y}`; }
function subGeom(g,t0,t1){
  t0=Math.max(0,Math.min(.999,t0)); t1=Math.max(t0+.001,Math.min(1,t1));
  const [left]=splitGeom(g,t1);
  if(t0<=0) return left;
  const local=t0/t1;
  const [,mid]=splitGeom(left,local);
  return mid;
}
function cardRect(id,pad=0){ return liveCardRect(id,pad); }
function inRect(pt,r){ return pt.x>=r.l&&pt.x<=r.r&&pt.y>=r.t&&pt.y<=r.b; }
function obstacleScore(g,from,to,safety=18){
  const {t0,t1}=visibleTRange(g,from,to,lineTuning.startGap,lineTuning.endGap);
  let hits=0;
  const blockers=people.filter(p=>p.id!==from&&p.id!==to).map(p=>cardRect(p.id,safety));
  const samples=120;
  for(let i=0;i<=samples;i++){
    const t=t0+(t1-t0)*(i/samples), pt=pointAt(g,t);
    if(blockers.some(r=>inRect(pt,r))) hits++;
  }
  return hits;
}
function stageOverflowScore(g,from,to){
  const {t0,t1}=visibleTRange(g,from,to,lineTuning.startGap,lineTuning.endGap);
  let penalty=0;
  for(let i=0;i<=80;i++){
    const t=t0+(t1-t0)*(i/80), p=pointAt(g,t);
    if(p.x<24||p.x>1576||p.y<105||p.y>876) penalty+=2;
  }
  return penalty;
}
function resolveAvoidingCurve(from,to,preferred=0){
  if(from===to) return preferred;
  const base=Math.max(35,Math.abs(lineTuning.curve));
  const sign=preferred<0?-1:1;
  const raw=[preferred, sign*base, -sign*base, sign*base*1.45, -sign*base*1.45, sign*base*1.9, -sign*base*1.9, sign*base*2.5, -sign*base*2.5, sign*base*3.2, -sign*base*3.2];
  const candidates=[...new Set(raw.map(v=>Math.round(v)))];
  let best=preferred, bestScore=Infinity;
  for(const curve of candidates){
    const g=pathGeometry(from,to,curve);
    const score=obstacleScore(g,from,to,20)*1000 + stageOverflowScore(g,from,to) + Math.abs(curve)*0.001;
    if(score<bestScore){ bestScore=score; best=curve; }
    if(score<1) break;
  }
  return best;
}
function visibleTRange(g,from,to,startGap=0,endGap=0){
  if(from===to) return {t0:.08,t1:.92};
  const sr=cardRect(from,startGap), er=cardRect(to,endGap);
  const steps=240;
  let t0=0, t1=1;
  for(let i=0;i<=steps;i++){ const t=i/steps; if(!inRect(pointAt(g,t),sr)){ t0=t; break; } }
  for(let i=steps;i>=0;i--){ const t=i/steps; if(!inRect(pointAt(g,t),er)){ t1=t; break; } }
  if(t1-t0<.08){ const mid=(t0+t1)/2; t0=Math.max(0,mid-.04); t1=Math.min(1,mid+.04); }
  return {t0,t1};
}
function approxLength(g,t0=0,t1=1){
  let total=0, prev=pointAt(g,t0);
  for(let i=1;i<=48;i++){ const t=t0+(t1-t0)*(i/48), pt=pointAt(g,t); total+=Math.hypot(pt.x-prev.x,pt.y-prev.y); prev=pt; }
  return total;
}
function gapSegments(from,to,curve=0,gapPx=76){
  const full=pathGeometry(from,to,curve);
  const {t0,t1}=visibleTRange(full,from,to,lineTuning.startGap,lineTuning.endGap);
  const clipped=subGeom(full,t0,t1);
  const approx=approxLength(full,t0,t1);
  const dtLocal=Math.min(.22, Math.max(.02,(gapPx/2)/Math.max(approx,1)));
  const local1=.5-dtLocal, local2=.5+dtLocal;
  const [left,rest]=splitGeom(clipped,local1);
  const [,right]=splitGeom(rest,(local2-local1)/(1-local1));
  const mid=pointAt(clipped,.5);
  return {left:geomPath(left),right:geomPath(right),mid};
}
function makePath(from,to,curve=0){ return geomPath(pathGeometry(from,to,curve)); }
function midPoint(from,to,curve=0){ const g=pathGeometry(from,to,curve); return pointAt(g,.5); }
function renderLines(){
  $('lines').replaceChildren(); $('badges').replaceChildren(); $('loot-layer').replaceChildren();
  const r=currentRound();
  const limit=Math.min(stepIndex,r.nodes.length-1);
  if(stepIndex<0)return;
  let actionSeq=0;
  r.nodes.forEach((node,i)=>{
    if(i>limit)return;
    if(!['action','share'].includes(node.type))return;
    actionSeq++;
    const opacity=i===stepIndex?1:.10;
    const preferred=((actionSeq%3)-1)*lineTuning.curve;
    const curve=resolveAvoidingCurve(node.from,node.to,preferred);
    const seg=gapSegments(node.from,node.to,curve,actionIconGapPx(node.item));
    [seg.left,seg.right].forEach((d,segIndex)=>{
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',d); path.setAttribute('pathLength','100');
      path.setAttribute('class','action-line'+(node.kind==='intel'?' intel':''));
      if(i===stepIndex)path.classList.add('play');
      path.style.opacity=opacity;
      $('lines').append(path);
    });
    const m=seg.mid;
    const a=center(node.from);
    const ix=m.x, iy=m.y;
    const badge=document.createElement('div');
    badge.className='badge item-'+node.item+(i===stepIndex?' play':'');
    badge.style.cssText=`left:${ix}px;top:${iy}px;opacity:${opacity};--from-x:${a.x-ix}px;--from-y:${a.y-iy}px`;
    badge.append(asset('assets/items/'+node.item+'.png',items[node.item],'missing-item'));
    $('badges').append(badge);
  });
  const node=currentNode();
  if(node?.type==='loot') renderLoot(node);
}
function renderLoot(node){
  const groups={};
  node.transfers.forEach(t=>{ const k=t.from+'>'+t.to; (groups[k] ||= {from:t.from,to:t.to,items:[]}).items.push(t); });
  Object.values(groups).forEach((g,gi)=>{
    const curve=(gi-1)*80; const path=document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d',makePath(g.from,g.to,curve)); path.setAttribute('pathLength','100'); path.setAttribute('class','action-line loot-line play'); $('lines').append(path);
    const a=center(g.from), b=center(g.to); g.items.forEach((t,ii)=>{ const icon=document.createElement('div'); icon.className='loot-flight'; icon.style.cssText=`left:${a.x}px;top:${a.y}px;--dx:${b.x-a.x}px;--dy:${b.y-a.y}px;--delay:${ii*0.10}s`; icon.append(asset('assets/items/'+t.item+'.png',items[t.item],'missing-item')); if(t.count>1){ const c=document.createElement('span'); c.textContent='×'+t.count; icon.append(c); } $('loot-layer').append(icon); });
  });
}

function settlementEntries(){
  // 恢复原版 CS killfeed：右上角随行动逐条累积，情报与攻击都展示。
  const nodes=currentRound().nodes;
  const limit=isSettlement()?nodes.length-1:stepIndex;
  if(limit<0)return [];
  return nodes.filter((n,i)=>i<=limit && (n.type==='action'||n.type==='share'));
}
function renderSettlement(){
  const panel=$('settlement'); panel.replaceChildren();
  const rows=settlementEntries();
  panel.className=rows.length?'settlement-panel show':'settlement-panel';
  rows.forEach((row,index)=>{
    const line=document.createElement('div');
    line.className='settlement-row';
    line.dataset.item=row.item;
    line.dataset.kind=row.kind;
    line.style.setProperty('--row-index',index);
    const attacker=document.createElement('span');
    attacker.className='settlement-attacker';
    attacker.textContent=name(row.from);
    const target=document.createElement('strong');
    target.textContent=name(row.to);
    line.append(attacker,asset('assets/items/'+row.item+'.png',items[row.item],'missing-item'),target);
    panel.append(line);
  });
}
function renderChat(){
  const feed=$('chat-feed'); feed.replaceChildren();
  const visible=currentRound().chats.filter(m=>isSettlement()||m.at<=stepIndex+1);
  visible.slice(-3).forEach(message=>{ const line=document.createElement('div'); line.className='chat-line'; line.innerHTML=`<b>${message.name}</b><span>：${message.text}</span>`; feed.append(line); });
}
function renderResult(){
  // 解释性系统横幅全部移除；结果通过连线、killfeed、死亡状态和遗产动画呈现。
  const banner=$('result-banner');
  banner.textContent='';
  banner.classList.add('hide');
}
function renderFinalOverlay(){
  const box=$('final-overlay'); box.replaceChildren(); box.className=''; const node=currentNode();
  if(node?.type==='reveal'){
    box.className='final-overlay show compare';
    box.innerHTML=`<div class="compare-title">FINAL CHECK / 装备差距</div><div class="compare-grid"><div><small>豆包</small><strong>3 六级套 · 3 防弹衣 · 2 皮甲</strong></div><i>VS</i><div><small>Claude</small><strong>1 防弹衣 · 1 皮甲</strong></div></div><p>Claude 已无法在剩余资源下打穿豆包防线</p>`;
  } else if(node?.type==='winner'){
    box.className='final-overlay show winner'; box.innerHTML=`<small>THE LAST SURVIVOR</small><strong>WINNER / 豆包</strong><span>龟到最后，也是战术。</span>`;
  }
}
function renderActions(){
  const wrap=$('actions'); wrap.replaceChildren();
  currentRound().nodes.forEach((n,i)=>{ const b=document.createElement('button'); b.dataset.action=i; b.setAttribute('aria-pressed',String(stepIndex===i)); let title='', sub=''; if(n.type==='action'||n.type==='share'){ title=`${String(i+1).padStart(2,'0')} &nbsp; ${name(n.from)} → ${name(n.to)}`; sub=`${n.type==='share'?'情报分享':items[n.item]} · ${n.kind==='intel'?'情报':'行动'}`; } else if(n.type==='loot'){ title=`${String(i+1).padStart(2,'0')} &nbsp; 遗产分配`; sub='尸体 → 道具 → 获得者'; } else if(n.type==='reveal'){ title=`${String(i+1).padStart(2,'0')} &nbsp; 最终对比`; sub='装备差距揭示'; } else { title=`${String(i+1).padStart(2,'0')} &nbsp; 最终胜者`; sub='WINNER'; } b.innerHTML=`<strong>${title}</strong><small>${sub}</small>`; b.onclick=()=>{stepIndex=i;render();}; wrap.append(b); });
  const settle=document.createElement('button'); settle.className='settle-action'; settle.setAttribute('aria-pressed',String(isSettlement())); settle.innerHTML='<strong>END &nbsp; 回合结算</strong><small>沿用 CS 式信息流</small>'; settle.onclick=()=>{stepIndex=currentRound().nodes.length;render();}; wrap.append(settle);
}
function renderRoundNav(){ const nav=$('round-nav'); nav.replaceChildren(); rounds.forEach((r,i)=>{ const b=document.createElement('button'); b.className=i===roundIndex?'active':''; b.textContent=r.final?'FINAL':String(i+1).padStart(2,'0'); b.title=r.label; b.onclick=()=>goRound(i); nav.append(b); }); }
function render(){
  const r=currentRound(), st=stateAt(roundIndex,stepIndex);
  $('round-no').textContent=r.final?'F':String(roundIndex+1).padStart(2,'0'); $('round-name').textContent=r.label; $('panel-round').textContent=r.label;
  $('alive-count').textContent=String(people.filter(p=>!st[p.id].dead).length).padStart(2,'0'); $('action-count').textContent=String(r.nodes.filter(n=>n.type==='action'||n.type==='share').length).padStart(2,'0');
  const node=currentNode(); $('mode-label').textContent=isSettlement()?'结算画面':stepIndex<0?'等待行动':node?.type==='loot'?'遗产分配':node?.type==='reveal'?'最终调查结果':node?.type==='winner'?'最终胜者':`行动 ${String(stepIndex+1).padStart(2,'0')}`;
  $('step-caption').textContent=isSettlement()?'/ 结算画面':stepIndex<0?'/ 等待行动':'/ '+(node?.result||'行动');
  $('progress').textContent=`${stepIndex<0?0:Math.min(stepIndex+1,r.nodes.length+1)} / ${r.nodes.length+1}`;
  $('previous').disabled=stepIndex<0; $('next').disabled=isSettlement(); $('prev-round').disabled=roundIndex===0; $('next-round').disabled=roundIndex===rounds.length-1;
  renderCards(); renderLines(); renderSettlement(); renderChat(); renderResult(); renderFinalOverlay(); renderActions(); renderRoundNav();
  $('stage').classList.toggle('settlement-mode',isSettlement());
}
function next(){ if(stepIndex<currentRound().nodes.length) stepIndex++; render(); }
function previous(){ if(stepIndex>=0) stepIndex--; render(); }
function goRound(i){ roundIndex=Math.max(0,Math.min(rounds.length-1,i)); stepIndex=-1; render(); }
function prevRound(){ if(roundIndex>0)goRound(roundIndex-1); }
function nextRound(){ if(roundIndex<rounds.length-1)goRound(roundIndex+1); }
function recording(){ document.body.classList.toggle('recording'); resize(); }
function resize(){ const box=document.querySelector('.viewport'); $('stage').style.transform='scale('+(box.clientWidth/1600)+')'; }


// --- Session avatar upload + crop ---
function openPortraitPicker(id){
  portraitTargetId=id;
  const input=$('portrait-upload');
  input.value='';
  input.click();
}
function cropCanvas(){ return $('crop-canvas'); }
function clampCropCenter(){
  const c=cropCanvas(), img=cropState.image;
  if(!img) return;
  const scale=cropState.baseScale*cropState.zoom;
  const halfW=c.width/(2*scale), halfH=c.height/(2*scale);
  cropState.centerX=Math.min(Math.max(cropState.centerX,halfW),Math.max(halfW,img.width-halfW));
  cropState.centerY=Math.min(Math.max(cropState.centerY,halfH),Math.max(halfH,img.height-halfH));
}
function drawCrop(){
  const c=cropCanvas(), ctx=c.getContext('2d'), img=cropState.image;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle='#090a0b'; ctx.fillRect(0,0,c.width,c.height);
  if(!img) return;
  clampCropCenter();
  const scale=cropState.baseScale*cropState.zoom;
  const dw=img.width*scale, dh=img.height*scale;
  const x=c.width/2-cropState.centerX*scale;
  const y=c.height/2-cropState.centerY*scale;
  ctx.drawImage(img,x,y,dw,dh);
  // subtle safe frame, not part of exported image
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,.30)'; ctx.lineWidth=1; ctx.strokeRect(.5,.5,c.width-1,c.height-1); ctx.restore();
}
function showCropModal(img){
  cropState.image=img;
  cropState.zoom=1;
  cropState.centerX=img.width/2;
  cropState.centerY=img.height/2;
  const c=cropCanvas();
  cropState.baseScale=Math.max(c.width/img.width,c.height/img.height);
  $('crop-zoom').value='1';
  $('crop-person-name').textContent=name(portraitTargetId);
  $('crop-modal').hidden=false;
  drawCrop();
}
function closeCropModal(){
  $('crop-modal').hidden=true;
  cropState.image=null;
  cropState.dragging=false;
  cropCanvas().classList.remove('dragging');
}
$('portrait-upload').addEventListener('change',e=>{
  const file=e.target.files && e.target.files[0];
  if(!file || !portraitTargetId) return;
  const url=URL.createObjectURL(file);
  const img=new Image();
  img.onload=()=>{ URL.revokeObjectURL(url); showCropModal(img); };
  img.onerror=()=>{ URL.revokeObjectURL(url); $('asset-warning').textContent='这张图片无法读取，请换一张图片。'; };
  img.src=url;
});
$('crop-zoom').addEventListener('input',e=>{
  cropState.zoom=Number(e.target.value)||1;
  drawCrop();
});
const cc=cropCanvas();
cc.addEventListener('pointerdown',e=>{
  if(!cropState.image) return;
  cropState.dragging=true; cropState.lastX=e.clientX; cropState.lastY=e.clientY;
  cc.setPointerCapture(e.pointerId); cc.classList.add('dragging');
});
cc.addEventListener('pointermove',e=>{
  if(!cropState.dragging || !cropState.image) return;
  const rect=cc.getBoundingClientRect();
  const sx=cc.width/rect.width, sy=cc.height/rect.height;
  const dx=(e.clientX-cropState.lastX)*sx, dy=(e.clientY-cropState.lastY)*sy;
  cropState.lastX=e.clientX; cropState.lastY=e.clientY;
  const scale=cropState.baseScale*cropState.zoom;
  cropState.centerX-=dx/scale; cropState.centerY-=dy/scale;
  drawCrop();
});
function endCropDrag(e){
  if(!cropState.dragging) return;
  cropState.dragging=false; cc.classList.remove('dragging');
  try{ cc.releasePointerCapture(e.pointerId); }catch{}
}
cc.addEventListener('pointerup',endCropDrag);
cc.addEventListener('pointercancel',endCropDrag);
cc.addEventListener('wheel',e=>{
  if(!cropState.image) return;
  e.preventDefault();
  const next=Math.min(3,Math.max(1,cropState.zoom*(e.deltaY<0?1.08:.92)));
  cropState.zoom=next; $('crop-zoom').value=String(next); drawCrop();
},{passive:false});
$('crop-cancel').onclick=closeCropModal;
$('crop-apply').onclick=()=>{
  if(!portraitTargetId || !cropState.image) return closeCropModal();
  const c=cropCanvas();
  // Export without the preview border.
  const out=document.createElement('canvas'); out.width=c.width; out.height=c.height;
  const ctx=out.getContext('2d');
  const scale=cropState.baseScale*cropState.zoom;
  const dw=cropState.image.width*scale, dh=cropState.image.height*scale;
  const x=out.width/2-cropState.centerX*scale;
  const y=out.height/2-cropState.centerY*scale;
  ctx.drawImage(cropState.image,x,y,dw,dh);
  customPortraits[portraitTargetId]=out.toDataURL('image/png');
  closeCropModal();
  renderCards();
};
$('crop-modal').addEventListener('click',e=>{ if(e.target===$('crop-modal')) closeCropModal(); });
window.addEventListener('keydown',e=>{
  if($('crop-modal').hidden) return;
  if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); closeCropModal(); }
},{capture:true});

$('next').onclick=next; $('previous').onclick=previous; $('prev-round').onclick=prevRound; $('next-round').onclick=nextRound; $('record').onclick=recording;
$('fullscreen').onclick=async()=>{ try{ if(document.fullscreenElement)await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }catch{ $('asset-warning').textContent='此浏览器不支持网页全屏，请使用浏览器的全屏功能。'; } };
window.addEventListener('keydown',e=>{ if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return; if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown',' ','h','H','f','F','Escape'].includes(e.key)){ if(e.key===' '&&e.target.tagName==='BUTTON')return; e.preventDefault(); if(e.key==='ArrowRight'||e.key===' ')next(); else if(e.key==='ArrowLeft')previous(); else if(e.key==='ArrowUp')prevRound(); else if(e.key==='ArrowDown')nextRound(); else if(e.key.toLowerCase()==='h')recording(); else if(e.key.toLowerCase()==='f')$('fullscreen').click(); else if(e.key==='Escape'){document.body.classList.remove('recording');resize();} } });
initIconTuning();
initLineTuning();
initCardTuning();
new ResizeObserver(resize).observe(document.querySelector('.viewport'));
render(); resize();
