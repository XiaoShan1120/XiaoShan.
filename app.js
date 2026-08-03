/* ============================================================
   WorkBuddy 个人效率工作台 · Hello Kitty 粉紫主题
   纯前端 · localStorage 持久化 · 跨板块联动
   ============================================================ */
(function(){
'use strict';

/* ---------- 工具 ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const todayKey = (d=new Date())=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;};
const weekKey = (d=new Date())=>{const x=new Date(d);const dow=(x.getDay()+6)%7;const ws=new Date(x);ws.setDate(x.getDate()-dow);return todayKey(ws);}; // 周一所在日期
const monthKey = (d=new Date())=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`;};
const WEEK = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];
const money = n => (Number(n)||0).toFixed(2);
const int   = n => Math.round(Number(n)||0);
const uid   = ()=> Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc   = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

/* 颜色加深 */
function shade(hex,amt=0.78){
  hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');
  let r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
  r=Math.round(r*amt);g=Math.round(g*amt);b=Math.round(b*amt);
  return `rgb(${r},${g},${b})`;
}

/* Hello Kitty 头像 SVG（粉紫马卡龙） */
function kitty(bow='#ff8fb3',size=34){
  const knot=shade(bow,0.8);
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="display:block">
    <path d="M14 22 L10 5 L27 15 Z" fill="#fff" stroke="#f3d9e6" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M50 22 L54 5 L37 15 Z" fill="#fff" stroke="#f3d9e6" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="32" cy="37" r="22" fill="#fff" stroke="#f3d9e6" stroke-width="1.4"/>
    <ellipse cx="24" cy="35" rx="2.5" ry="3.4" fill="#4a3a45"/>
    <ellipse cx="40" cy="35" rx="2.5" ry="3.4" fill="#4a3a45"/>
    <ellipse cx="32" cy="41" rx="2.2" ry="1.5" fill="#ffb3c8"/>
    <g stroke="#ecc7d8" stroke-width="1.2" stroke-linecap="round">
      <line x1="13" y1="39" x2="23" y2="41"/><line x1="13" y1="44" x2="23" y2="44"/>
      <line x1="51" y1="39" x2="41" y2="41"/><line x1="51" y1="44" x2="41" y2="44"/>
    </g>
    <g transform="translate(12,8)">
      <path d="M0 7 L11 0 L11 14 Z" fill="${bow}"/>
      <path d="M22 7 L11 0 L11 14 Z" fill="${bow}"/>
      <circle cx="11" cy="7" r="3.6" fill="${knot}"/>
    </g>
  </svg>`;
}
/* Hello Kitty 导航图标（头部在彩色圆背景中） */
function navIcon(bow='#ff8fb3',size=44){
  const knot=shade(bow,0.8);
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="display:block">
    <circle cx="32" cy="32" r="30" fill="${bow}" opacity="0.18"/>
    <circle cx="32" cy="32" r="28" fill="${bow}" opacity="0.25"/>
    <path d="M14 20 L10 4 L26 13 Z" fill="#fff" stroke="#f3d9e6" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M50 20 L54 4 L38 13 Z" fill="#fff" stroke="#f3d9e6" stroke-width="1.2" stroke-linejoin="round"/>
    <circle cx="32" cy="34" r="19" fill="#fff" stroke="#f3d9e6" stroke-width="1.2"/>
    <ellipse cx="24.5" cy="32.5" rx="2.2" ry="3" fill="#4a3a45"/>
    <ellipse cx="39.5" cy="32.5" rx="2.2" ry="3" fill="#4a3a45"/>
    <ellipse cx="32" cy="37.5" rx="2" ry="1.4" fill="#ffb3c8"/>
    <g stroke="#ecc7d8" stroke-width="1" stroke-linecap="round">
      <line x1="15" y1="36" x2="23" y2="37.5"/><line x1="15" y1="40" x2="23" y2="40.5"/>
      <line x1="49" y1="36" x2="41" y2="37.5"/><line x1="49" y1="40" x2="41" y2="40.5"/>
    </g>
    <g transform="translate(13,7)">
      <path d="M0 6 L10 0 L10 12 Z" fill="${bow}"/>
      <path d="M20 6 L10 0 L10 12 Z" fill="${bow}"/>
      <circle cx="10" cy="6" r="3.2" fill="${knot}"/>
    </g>
  </svg>`;
}

/* 蝴蝶结 SVG（装饰/动画） */
function bowSVG(color='#ff8fb3',size=40){
  return `<svg viewBox="0 0 48 40" width="${size}" height="${size*0.83}" style="display:block">
    <path d="M4 20 L20 6 L20 34 Z" fill="${color}"/>
    <path d="M44 20 L28 6 L28 34 Z" fill="${color}"/>
    <circle cx="24" cy="20" r="6" fill="${shade(color,0.8)}"/></svg>`;
}
/* 星星 SVG */
function starSVG(color='#ffcf5c',size=120){
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="display:block">
    <path d="M50 6 L62 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L38 38 Z"
      fill="${color}" stroke="${shade(color,0.8)}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="50" cy="20" r="3" fill="#fff" opacity=".8"/></svg>`;
}
/* 天气图标 */
function weatherIco(type){
  const m={sun:'#ffcf5c',cloud:'#cdbce8',rain:'#9fc6e8',snow:'#cfe6f5'};
  if(type==='cloud'||type==='rain'||type==='snow'){
    return `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.5A3.5 3.5 0 0 0 7 18z" fill="${m.cloud}"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="5" fill="${m.sun}"/><g stroke="${m.sun}" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.5" y1="4.5" x2="6" y2="6"/><line x1="18" y1="18" x2="19.5" y2="19.5"/></g></svg>`;
}

/* ---------- 媒体上传基础设施（IndexedDB） ---------- */
const MediaDB = (()=>{
  let db=null;
  const DB_NAME='hk_workbench_media', DB_VER=1, STORE='blobs';
  function open(){
    return new Promise((res,rej)=>{
      if(db){res(db);return;}
      const req=indexedDB.open(DB_NAME,DB_VER);
      req.onupgradeneeded=()=>{req.result.createObjectStore(STORE,{keyPath:'id'});};
      req.onsuccess=()=>{db=req.result;res(db);};
      req.onerror=()=>rej(req.error);
    });
  }
  async function putMedia(id,blob,meta){
    const d=await open();const tx=d.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put({id,blob,...meta});return new Promise((r,j)=>{tx.oncomplete=r;tx.onerror=()=>j(tx.error);});
  }
  async function getMedia(id){
    const d=await open();const tx=d.transaction(STORE,'readonly');
    return new Promise((r,j)=>{const req=tx.objectStore(STORE).get(id);
      req.onsuccess=()=>r(req.result?req.result.blob:null);req.onerror=()=>j(req.error);});
  }
  async function delMedia(id){
    const d=await open();const tx=d.transaction(STORE,'readwrite');
    tx.objectStore(STORE).delete(id);return new Promise((r,j)=>{tx.oncomplete=r;tx.onerror=()=>j(tx.error);});
  }
  /* 删除孤立 blob（传入当前所有引用的 id 集合） */
  async function syncOrphans(usedIds){
    const d=await open();const tx=d.transaction(STORE,'readonly');
    const all=await new Promise((r,j)=>{const req=tx.objectStore(STORE).getAll();
      req.onsuccess=()=>r(req.result||[]);req.onerror=()=>j(req.error);});
    const set=new Set(usedIds);
    for(const row of all){if(!set.has(row.id))await delMedia(row.id);}
  }
  async function getAll(){
    const d=await open();const tx=d.transaction(STORE,'readonly');
    return new Promise((r,j)=>{const req=tx.objectStore(STORE).getAll();
      req.onsuccess=()=>r(req.result||[]);req.onerror=()=>j(req.error);});
  }
  return {open,putMedia,getMedia,delMedia,syncOrphans,getAll};
})();

/* 媒体上传区域 HTML */
function mediaUploadHTML(media,zoneId){
  const id=zoneId||'mediaZone_'+uid();
  return `<div class="media-zone" id="${id}" data-zone-id="${id}">
    <div class="media-drop-hint">
      <span style="font-size:28px">📎</span>
      <div>点击或拖拽上传图片/视频</div>
    </div>
    <input type="file" multiple accept="image/*,video/*" hidden data-act="media-file-input">
    <div class="media-thumb-grid" id="${id}_thumbs"></div>
  </div>`;
}

/* 绑定媒体上传（点击 + 拖拽 + 存入 IndexedDB） */
function bindMediaUpload(container,mediaArray,onChange){
  if(!container) return;
  const inp=container.querySelector('[data-act=media-file-input]');
  const grid=container.querySelector('.media-thumb-grid');
  if(!inp)return;
  // 点击触发
  container.querySelector('.media-drop-hint')?.addEventListener('click',()=>inp.click());
  container.addEventListener('click',(e)=>{if(e.target===container||e.target.closest('.media-zone')&&!e.target.closest('.media-thumb'))inp.click();});
  // 文件选择
  inp.addEventListener('change',async ()=>await handleFiles(inp.files,mediaArray,onChange,grid));
  // 拖拽
  container.addEventListener('dragover',e=>{e.preventDefault();container.classList.add('media-dragover');});
  container.addEventListener('dragleave',()=>container.classList.remove('media-dragover'));
  container.addEventListener('drop',async e=>{e.preventDefault();container.classList.remove('media-dragover');await handleFiles(e.dataTransfer.files,mediaArray,onChange,grid);});
  // 渲染已有
  renderMediaThumbs(mediaArray,true,grid,onChange);
}
async function handleFiles(fileList,mediaArr,onChange,grid){
  for(const f of fileList){
    const id=uid();
    const type=f.type.startsWith('video/')?'video':'image';
    await MediaDB.putMedia(id,f,{name:f.name,type});
    mediaArr.push({id,type,name:f.name});
  }
  onChange(mediaArr);
  renderMediaThumbs(mediaArr,true,grid,onChange);
}

/* 渲染缩略图 */
function renderMediaThumbs(media,editable,containerEl,onChange){
  if(!containerEl) return;
  if(!media||!media.length){containerEl.innerHTML='';return;}
  (async ()=>{
    let html='';
    for(let i=0;i<media.length;i++){
      const m=media[i];
      const blob=await MediaDB.getMedia(m.id);
      if(!blob){html+=`<div class="media-thumb media-thumb-broken">文件丢失</div>`;continue;}
      const url=URL.createObjectURL(blob);
      if(m.type==='video'){
        html+=`<div class="media-thumb media-thumb-video" draggable="${editable?'true':'false'}" data-media-idx="${i}">
          <video src="${url}" controls preload="metadata" style="width:100%;height:100%;object-fit:cover;border-radius:10px"></video>
          ${editable?`<button class="media-thumb-del" data-act="media-thumb-del" data-idx="${i}">&times;</button>
          <button class="media-thumb-play" data-act="media-thumb-play" data-mid="${m.id}">▶</button>`:''}
        </div>`;
      }else{
        html+=`<div class="media-thumb media-thumb-img" draggable="${editable?'true':'false'}" data-media-idx="${i}">
          <img src="${url}" alt="${esc(m.name)}" data-act="media-thumb-view" data-idx="${i}">
          ${editable?`<button class="media-thumb-del" data-act="media-thumb-del" data-idx="${i}">&times;</button>
          <span class="media-thumb-drag" title="拖拽排序">⠿</span>`:''}
        </div>`;
      }
    }
    containerEl.innerHTML=html;
    // 绑定删除/查看事件
    if(editable&&onChange){
      containerEl.querySelectorAll('[data-act=media-thumb-del]').forEach(btn=>{
        btn.addEventListener('click',async()=>{
          const idx=+btn.dataset.idx;const removed=media.splice(idx,1)[0];
          if(removed)await MediaDB.delMedia(removed.id);
          onChange(media);renderMediaThumbs(media,editable,containerEl,onChange);
        });
      });
      containerEl.querySelectorAll('[data-act=media-thumb-play]').forEach(btn=>{
        btn.addEventListener('click',()=>openVideoModal(btn.dataset.mid));
      });
      containerEl.querySelectorAll('[data-act=media-thumb-view]').forEach(img=>{
        img.addEventListener('click',()=>openLightbox(media,+img.dataset.idx));
      });
      // 拖拽排序
      let dragIdx=-1;
      containerEl.querySelectorAll('.media-thumb[draggable=true]').forEach(thumb=>{
        thumb.addEventListener('dragstart',e=>{dragIdx=+thumb.dataset.mediaIdx;thumb.classList.add('media-dragging');e.dataTransfer.effectAllowed='move';});
        thumb.addEventListener('dragend',()=>{thumb.classList.remove('media-dragging');dragIdx=-1;});
        thumb.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';});
        thumb.addEventListener('drop',e=>{
          e.preventDefault();
          const dropIdx=+thumb.dataset.mediaIdx;
          if(dragIdx>=0&&dragIdx!==dropIdx){
            const [item]=media.splice(dragIdx,1);media.splice(dropIdx,0,item);
            onChange(media);renderMediaThumbs(media,editable,containerEl,onChange);
          }
        });
      });
    }else{
      containerEl.querySelectorAll('[data-act=media-thumb-view]').forEach(img=>{
        img.addEventListener('click',()=>openLightbox(media,+img.dataset.idx));
      });
      containerEl.querySelectorAll('[data-act=media-thumb-play]').forEach(btn=>{
        btn.addEventListener('click',()=>openVideoModal(btn.dataset.mid));
      });
    }
  })();
}

/* 灯箱 */
let _lightboxEl=null;
function openLightbox(mediaArray,startIndex){
  if(!mediaArray||!mediaArray.length) return;
  let idx=startIndex||0;
  if(_lightboxEl)_lightboxEl.remove();
  const el=document.createElement('div');el.className='media-lightbox';_lightboxEl=el;
  document.body.appendChild(el);
  async function show(){
    const m=mediaArray[idx];if(!m)return;
    const blob=await MediaDB.getMedia(m.id);if(!blob){el.remove();return;}
    const url=URL.createObjectURL(blob);
    el.innerHTML=`<div class="lightbox-backdrop" data-act="lb-close"></div>
      <button class="lb-arrow lb-prev" data-act="lb-prev">‹</button>
      <div class="lb-content"><img src="${url}" alt="${esc(m.name)}"></div>
      <button class="lb-arrow lb-next" data-act="lb-next">›</button>
      <button class="lb-close-btn" data-act="lb-close">&times;</button>
      <div class="lb-counter">${idx+1}/${mediaArray.length}</div>`;
    el.querySelector('[data-act=lb-prev]').style.visibility=idx<=0?'hidden':'visible';
    el.querySelector('[data-act=lb-next]').style.visibility=idx>=mediaArray.length-1?'hidden':'visible';
  }
  show();
  el.addEventListener('click',async e=>{
    const act=e.target.closest('[data-act]')?.dataset.act;
    if(act==='lb-close'){el.remove();_lightboxEl=null;return;}
    if(act==='lb-prev'&&idx>0){idx--;show();}
    if(act==='lb-next'&&idx<mediaArray.length-1){idx++;show();}
  });
  document.addEventListener('keydown',function kb(e){
    if(!_lightboxEl)return;
    if(e.key==='Escape'){el.remove();_lightboxEl=null;document.removeEventListener('kb',kb);}
    else if(e.key==='ArrowLeft'&&idx>0){idx--;show();}
    else if(e.key==='ArrowRight'&&idx<mediaArray.length-1){idx++;show();}
  });
}

/* 视频弹窗 */
let _videoModalEl=null;
function openVideoModal(mediaId){
  if(_videoModalEl)_videoModalEl.remove();
  const el=document.createElement('div');el.className='media-video-modal';_videoModalEl=el;
  document.body.appendChild(el);
  el.innerHTML=`<div class="vm-backdrop" data-act="vm-close"></div><div class="vm-content"><video id="vmVideo" controls style="max-width:90vw;max-height:85vh;border-radius:16px"></video></div><button class="vm-close-btn" data-act="vm-close">&times;</button>`;
  (async()=>{
    const blob=await MediaDB.getMedia(mediaId);if(!blob){el.remove();return;}
    const url=URL.createObjectURL(blob);
    $('#vmVideo').src=url;
  })();
  el.addEventListener('click',e=>{
    if(e.target.closest('[data-act=vm-close]')){el.remove();_videoModalEl=null;}
  });
}

/* ---------- 模块定义 ---------- */
const MODULES = [
  /* —— 高频日常（每天用）—— */
  {id:'mood',     name:'今日心情',     bow:'#ff8fb3'},
  {id:'todo',     name:'待办',         bow:'#c9a3ff'},
  {id:'schedule', name:'工作日程',     bow:'#ffb3d9'},
  {id:'ledger',   name:'记账',         bow:'#d7a8ef'},
  {id:'exercise', name:'运动',         bow:'#ff9ec4'},
  {id:'diet',     name:'饮食',         bow:'#d9a3ff'},
  {id:'review',   name:'复盘',         bow:'#ffc0dd', emoji:'📝'},
  /* —— 中频提升（经常用）—— */
  {id:'outfit',   name:'穿搭',         bow:'#ffb0e0', emoji:'👗'},
  {id:'study',    name:'学习',         bow:'#ffa6cf'},
  {id:'reading',  name:'阅读',         bow:'#c9a3ff'},
  {id:'finance',  name:'理财',         bow:'#c9a3ff', emoji:'💰'},
  {id:'media',    name:'自媒体',       bow:'#ffb0e0'},
  /* —— 低频辅助（偶尔用）—— */
  {id:'hot',      name:'爆款热点追踪', bow:'#ff8fd0'},
  {id:'intel',    name:'行业情报',     bow:'#b9a3e3', emoji:'📡'},
  {id:'video',    name:'优质视频拆解', bow:'#c5a3ff'},
  {id:'memo',     name:'备忘录',       bow:'#d7b3ff'},
  /* —— 工具收尾 —— */
  {id:'tool',     name:'工具栏',       bow:'#c9a3ff'},
];

/* 心情表情集合（代替原滑块），status/score 用于兼容旧数据逻辑 */
const EMOJIS = [
  {key:'happy',   label:'开心', icon:'😊', status:'happy', score:9},
  {key:'calm',    label:'平静', icon:'😌', status:'happy', score:6},
  {key:'excited', label:'兴奋', icon:'🤩', status:'happy', score:10},
  {key:'sweet',   label:'甜蜜', icon:'🥰', status:'happy', score:8},
  {key:'tired',   label:'疲倦', icon:'😪', status:'tired', score:3},
  {key:'sad',     label:'难过', icon:'😢', status:'tired', score:2},
  {key:'anxious', label:'焦虑', icon:'😰', status:'tired', score:3},
  {key:'bored',   label:'无聊', icon:'🥱', status:'tired', score:4},
];
const EMOJIS_MAP = Object.fromEntries(EMOJIS.map(e=>[e.key,e]));
const MOOD_PHRASES = {
  happy:  '元气满满的你最闪耀，继续保持这份好状态！',
  calm:   '平静也是一种温柔的力量，享受此刻的安宁~',
  excited:'今天有好事正在发生，尽情享受这份雀跃吧！',
  sweet:  '被爱包围的一天，心里甜甜的~',
  tired:  '今天辛苦啦，给自己一个温柔的抱抱，好好休息。',
  sad:    '难过会被温柔接住，哭完我们再慢慢好起来。',
  anxious:'深呼吸，慢慢来，事情一件件都会解决的。',
  bored:  '平淡里也有小确幸，给自己找点小乐子吧~'
};
/* 背景库默认渐变（粉紫 / 蓝紫 / 暖橙 / 清新绿） */
const DEFAULT_BG = [
  {name:'粉紫', css:'linear-gradient(135deg,#ffe9f3,#efe7ff)'},
  {name:'蓝紫', css:'linear-gradient(135deg,#e7ecff,#efe7ff)'},
  {name:'暖橙', css:'linear-gradient(135deg,#fff0e0,#ffe3ec)'},
  {name:'清新绿',css:'linear-gradient(135deg,#e8fff4,#e3f7ff)'},
];
let bgScopeCur = 'global';   // 背景应用范围：global=全板块 / module=当前页
let current = 'mood';

/* ---------- 状态 ---------- */
const KEY='hk_workbench_v1';          // 存储键保持稳定，跨版本沿用
const S_VERSION=2;                     // 数据 schema 版本（用于迁移提示）
let S = load();

/* 深合并：以 seed 为基底，用已保存数据覆盖；
   新增字段自动取默认值，已有数据完整保留 —— 保证“更新功能后旧数据不丢” */
function deepMerge(base, over){
  if(Array.isArray(base)) return Array.isArray(over)?over:base;
  if(base && typeof base==='object'){
    const out={...base};
    if(over && typeof over==='object'){
      for(const k in over){ out[k]=deepMerge(base[k], over[k]); }
    }
    return out;
  }
  return over===undefined?base:over;
}
function load(){
  try{
    const r=localStorage.getItem(KEY);
    if(r){
      const s=deepMerge(seed(), JSON.parse(r));
      s.version=S_VERSION;
      if(!s.deviceId) s.deviceId='d_'+Math.random().toString(36).slice(2,10)+'_'+Date.now().toString(36).slice(-4);
      if(!s.syncAt) s.syncAt=0;
      migrateMedia(s); migrateStudy(s);
      return s;
    }
  }catch(e){}
  const s=seed(); s.version=S_VERSION; return s;
}
/* 当前自媒体账号（多账号取 activeAccount 引用） */
function curMedia(){ return S.media.accounts[S.media.activeAccount]; }
/* 旧数据兼容：media.account / 扁平 posts/topics/inspiration → 多账号对象 */
function migrateMedia(s){
  s.media=s.media||{};
  if(!s.media.notes || !Array.isArray(s.media.notes)) s.media.notes=[];
  if(!s.media.accounts || typeof s.media.accounts!=='object' || !Object.keys(s.media.accounts).length){
    const old=s.media.account||{name:'我的小宇宙',fans:1280,position:'治愈系生活 vlog'};
    const id='acc_'+uid();
    s.media.accounts={[id]:{
      id, name:old.name||'我的小宇宙', fans:old.fans||0, position:old.position||'',
      posts:s.media.posts||[], topics:s.media.topics||{todo:[],done:[]},
      inspiration:s.media.inspiration||{effect:[],sfx:[],music:[],editing:[]}
    }};
    s.media.activeAccount=id;
  }
  Object.values(s.media.accounts).forEach(a=>{
    a.posts=a.posts||[]; a.topics=a.topics||{todo:[],done:[]};
    a.inspiration=a.inspiration||{effect:[],sfx:[],music:[],editing:[]};
  });
  if(!s.media.activeAccount || !s.media.accounts[s.media.activeAccount]){
    s.media.activeAccount=Object.keys(s.media.accounts)[0];
  }
  s.media.account=null; // 旧扁平字段已迁移，置空避免同步冗余
}
function migrateStudy(s){
  s.study=s.study||{}; s.study.english=s.study.english||{custom:[]};
  const e=s.study.english;
  e.chat=e.chat||{scene:'',q:'',a:'',score:0,tip:''};
  e.recite=e.recite||{en:'',myText:''};
  e.weak=e.weak||[];
  e.custom=e.custom||[];
}
/* 英语陪练：对话场景预设（含关键词，用于本地规则批改） */
const CHAT_SCENES=[
  {key:'self',     label:'自我介绍', q:'请用英文做一个自我介绍：包括你的名字、职业/专业和爱好。', kw:['i am','i like','name','hobby','study','work','student','engineer']},
  {key:'coffee',   label:'点咖啡',   q:'你走进一家咖啡店，用英语点一杯你喜欢的饮品，并说明冷热/规格。', kw:['coffee','tea','please','i would','like','hot','ice','size','cup','medium','large']},
  {key:'interview',label:'面试',     q:'面试官问「请说说你的优势」，请用英文回答 2-3 句。', kw:['i am','good at','experience','team','skill','strength','responsible','learn']},
  {key:'travel',   label:'旅行问路', q:'用英语向当地人问路：如何前往火车站。', kw:['excuse','where','station','how','can','go','train','way','help','please']},
];
/* 本地规则批改：绝不上网，避免白屏 */
function checkEnglishAnswer(scene,text){
  const t=(text||'').trim();
  if(!t) return {score:0,tip:'先写点英文内容，再点批改哦~'};
  let score=40;
  const words=t.split(/\s+/).filter(Boolean);
  if(words.length>=5) score+=15; if(words.length>=10) score+=10;
  const sc=CHAT_SCENES.find(s=>s.key===scene)||{kw:[]};
  const low=t.toLowerCase();
  const hit=sc.kw.filter(k=>low.includes(k)).length;
  score+=Math.min(25,hit*8);
  if(/[.!?]$/.test(t)) score+=5;
  if(/\b(am|is|are|i|you|we|they|he|she|like|want|go|have|my)\b/i.test(t)) score+=5;
  score=Math.min(100,score);
  const tips=[];
  if(hit===0) tips.push('试着用上场景关键词，如：'+sc.kw.slice(0,3).join(' / ')+'。');
  if(words.length<5) tips.push('回答稍短，建议写 3-5 句更完整。');
  if(score>=85) tips.push('表达清晰、用词到位，非常棒，继续保持！🌸');
  else if(score>=60) tips.push('整体不错，注意句首大写和句末标点，会更地道。');
  else tips.push('多练习基础句式，例如 "I am ... / I like ..."，把意思说清楚。');
  return {score,tip:tips.join(' ')};
}
function renderChatPanel(){
  const ch=S.study.english.chat||{};
  if(!ch.scene) return '<div class="muted">👆 选择一个场景，开始英语对话练习</div>';
  const sc=CHAT_SCENES.find(s=>s.key===ch.scene)||{};
  let h=`<div class="chat-prompt">💡 ${esc(sc.q||ch.q)}</div>`;
  h+=`<textarea class="txtarea" data-act="study-chat-a" placeholder="用英语回答…">${esc(ch.a||'')}</textarea>`;
  h+=`<div style="margin-top:8px"><button class="btn" data-act="study-chat-check">✏️ 批改</button>`;
  if(ch.score) h+=` <span class="tag" style="background:#fff0f7;color:var(--pink-d)">得分 ${ch.score}/100</span>`;
  h+=`</div>`;
  if(ch.tip) h+=`<div class="chat-tip">${esc(ch.tip)}</div>`;
  return h;
}
function addAccountModal(){
  const id='acc_'+uid();
  openModal(kitty('#ffb0e0',26)+' 新增自媒体账号',`
    <div class="row">
      <div style="flex:1"><div class="muted">账号名称</div><input class="inp" id="naName" placeholder="如 第二频道" value="新账号"></div>
      <div style="flex:1"><div class="muted">初始粉丝量</div><input class="inp" type="number" id="naFans" placeholder="0" value="0"></div>
    </div>
    <div class="muted" style="margin-top:10px">账号定位</div>
    <input class="inp" id="naPos" placeholder="如 搞笑剧情 / 知识科普">
    <div class="muted" style="margin-top:8px;font-size:12px">新账号拥有独立发布记录、选题库与灵感库，云同步互不覆盖。</div>`,
    `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="na-save">创建</button>`,
    ()=>{
      $('#modalFoot').querySelector('[data-act=na-save]').onclick=()=>{
        const name=$('#naName').value.trim()||'新账号';
        const fans=Math.max(0,int($('#naFans').value));
        const position=$('#naPos').value.trim();
        S.media.accounts[id]={id,name,fans,position,posts:[],topics:{todo:[],done:[]},inspiration:{effect:[],sfx:[],music:[],editing:[]}};
        S.media.activeAccount=id;
        save();closeModal();renderModule();toast('账号已创建：'+esc(name));
      };
    });
}
function save(dirty){
  if(dirty===undefined) dirty=true;
  S.updatedAt=Date.now();
  try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
  const f=$('#saveFlag');
  if(f){
    const d=new Date();
    const t=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    f.textContent='● 已自动保存 '+t;
  }
  if(dirty) schedulePush();
}
/* ---------- GitHub 云同步 ---------- */
const SYNC_KEY='hk_workbench_sync';
const SYNC_PATH='workbench-data.json';
const SYNC_DEFAULT_OWNER='XiaoShan1120';
const SYNC_DEFAULT_REPO='XiaoShan.';
function loadSyncCfg(){ try{return JSON.parse(localStorage.getItem(SYNC_KEY))||{};}catch(e){return {};} }
function saveSyncCfg(c){ try{localStorage.setItem(SYNC_KEY,JSON.stringify(c));}catch(e){} }
function ensureDeviceId(){
  if(!S.deviceId) S.deviceId='d_'+Math.random().toString(36).slice(2,10)+'_'+Date.now().toString(36).slice(-4);
}
let _pushTimer=null;
function schedulePush(){
  const cfg=loadSyncCfg();
  if(!cfg.enabled||!cfg.token) return;
  ensureDeviceId();
  if(_pushTimer) clearTimeout(_pushTimer);
  _pushTimer=setTimeout(()=>{ pushSync().catch(e=>console.warn('sync push failed',e)); },1200);
}
async function ghFetch(path,opts={}){
  const cfg=loadSyncCfg();
  const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  if(cfg.token) headers['Authorization']='Bearer '+cfg.token;
  // 加时间戳防止 GitHub 缓存返回旧 SHA，避免 409
  const sep=path.includes('?')?'&':'?';
  const bustPath=path+sep+'_t='+Date.now();
  return fetch('https://api.github.com'+bustPath,{...opts,headers});
}
async function fetchRemoteState(){
  const cfg=loadSyncCfg();
  const owner=cfg.owner||SYNC_DEFAULT_OWNER, repo=cfg.repo||SYNC_DEFAULT_REPO;
  // 1) 先拿 SHA（无论文件多大，API 都会返回 sha）
  const r=await ghFetch(`/repos/${owner}/${repo}/contents/${SYNC_PATH}`);
  if(r.status===404) return null;
  if(!r.ok){const t=await r.text();throw new Error('下载失败 '+r.status+' '+(t.slice(0,120)));}
  const j=await r.json();
  const sha=j.sha;
  // 2) 取内容：大文件(>1MB) API 不返回 content，改走 raw 下载地址
  let raw=null;
  if(j.content && j.encoding==='base64'){
    try{ raw=decodeURIComponent(escape(atob(j.content))); }catch(e){ raw=null; }
  }
  if(!raw){
    try{
      const rawUrl=`https://raw.githubusercontent.com/${owner}/${repo}/${cfg.branch||'main'}/${SYNC_PATH}?_t=${Date.now()}`;
      const rr=await fetch(rawUrl);
      if(rr.ok) raw=await rr.text();
    }catch(e){ raw=null; }
  }
  if(!raw) return {sha, state:null};
  try{
    const payload=JSON.parse(raw);
    const state=(payload && payload.state)? payload.state : payload;
    return {sha, state:(state&&typeof state==='object')?state:null};
  }catch(e){ return {sha, state:null}; }
}
// 合并两个状态对象：对象字段深度合并（保留双方不同 key），数组/标量以 newer 为准
function mergeStates(local,remote){
  if(Array.isArray(local)) return Array.isArray(remote)?remote:local;
  if(local && typeof local==='object'){
    const out={...local};
    if(remote && typeof remote==='object'){
      for(const k in remote){
        // icons/profile 等对象深度合并；数组和标量直接取 remote
        if(k==='icons' && local[k] && remote[k] && typeof local[k]==='object' && typeof remote[k]==='object'){
          out[k]={...local[k],...remote[k]};
        }else{
          out[k]=mergeStates(local[k], remote[k]);
        }
      }
    }
    return out;
  }
  return remote===undefined?local:remote;
}
let _pushing=false, _pushPending=false;
async function pushSync(){
  const cfg=loadSyncCfg();
  if(!cfg.enabled||!cfg.token) return;
  if(_pushing){ _pushPending=true; return; }  // 防止并发提交互相打架
  _pushing=true;
  try{
    for(let attempt=0; attempt<3; attempt++){
      const remote=await fetchRemoteState();
      if(remote && remote.state){
        const localTs=S.updatedAt||0, remoteTs=remote.state.updatedAt||0;
        // 推送前先把对方的最新改动合并进来，避免整包覆盖导致 409 / 丢数据
        if(remoteTs > localTs){
          S=mergeStates(S, remote.state);
          S.deviceId=S.deviceId; S.version=S_VERSION;
          save(false);
        }
      }
      ensureDeviceId();
      const owner=cfg.owner||SYNC_DEFAULT_OWNER, repo=cfg.repo||SYNC_DEFAULT_REPO;
      const payload={state:S, deviceId:S.deviceId};
      const content=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const url=`/repos/${owner}/${repo}/contents/${SYNC_PATH}`;
      const sha=remote&&remote.sha?remote.sha:null;
      const body={message:'workbench sync '+new Date().toISOString(),content};
      if(sha) body.sha=sha;
      const r=await ghFetch(url,{method:'PUT',body:JSON.stringify(body)});
      if(r.ok){
        cfg.lastSync=Date.now(); saveSyncCfg(cfg);
        S.syncAt=Date.now(); save(false);
        const f=$('#syncStatus'); if(f) f.textContent='☁ 已同步 '+new Date().toLocaleString();
        return;
      }
      // 409/422：文件被改或 SHA 缺失，等一下重试（fetchRemoteState 会拿到最新 SHA）
      if((r.status===409||r.status===422) && attempt<2){
        await new Promise(rs=>setTimeout(rs,600+Math.random()*600));
        continue;
      }
      const t=await r.text();
      throw new Error('上传失败 '+r.status+' '+(t.slice(0,120)));
    }
  } finally {
    _pushing=false;
    if(_pushPending){ _pushPending=false; setTimeout(()=>pushSync().catch(()=>{}), 300); }
  }
}
async function pullSync(){
  const cfg=loadSyncCfg();
  if(!cfg.enabled||!cfg.token) return;
  ensureDeviceId();
  const remote=await fetchRemoteState();
  if(!remote||!remote.state) return;
  const localTs=S.updatedAt||0;
  const remoteTs=remote.state.updatedAt||0;
  const now=Date.now();
  // 本地 5 秒内有改动：优先保留本地（防时钟偏差导致刚改的内容被覆盖）
  if(now - localTs < 5000){
    schedulePush();
    return;
  }
  // 远程确实比本地新，或时间差在 5 秒内但远程来自不同设备：合并而非覆盖
  if(remoteTs > localTs || (Math.abs(remoteTs-localTs)<=5000 && remote.state.deviceId!==S.deviceId)){
    const merged=mergeStates(S, remote.state);
    // 合并后保留自己的 deviceId，但更新 sync 标记
    merged.deviceId=S.deviceId;
    merged.version=S_VERSION;
    S=merged;
    save(false);
    const f=$('#saveFlag'); if(f) f.textContent='● 已从云端合并同步';
    const s=$('#syncStatus'); if(s) s.textContent='☁ 已同步（已合并）';
  }else{
    schedulePush();
  }
}
function seed(){
  return {
    updatedAt:0,
    syncAt:0,
    deviceId:'',
    profile:{avatar:''},
    icons:{},
    mood:{ history:[] },
    schedule:{ events:{}, goals:{}, yearlyGoal:'', ratings:{} },
    todos:[],
    todoSub:'today', /* 待案子Tab状态 */
    todoArchives:[], /* 每日待办归档 */
    todoReview:{ weekly:{}, monthly:{}, yearly:{} }, /* 待办复盘 */
    ledger:[],
    exercise:{ weight:52, records:[], sub:'today', streak:0, todayTrainMin:0, todayKcalIn:0, todayActions:0, todaySchedule:[], todayMeals:{b:0,l:0,d:0}, parts:[], weeklyPlan:{mon:'',tue:'',wed:'',thu:'',fri:'',sat:'',sun:''}, weeklyDone:0, weeklyTotal:0, bloggers:[ {id:'b_pamela',name:'帕梅拉',desc:'燃脂塑形全球知名',color:'#FFA577',bilibili:'帕梅拉PamelaReif',keywords:['燃脂','瘦腿','体态'],avatar:''}, {id:'b_ouyang',name:'欧阳春晓',desc:'亲切耐心的国内博主，动作详细，新手友好',color:'#FFB6C1',bilibili:'欧阳春晓',keywords:['燃脂','瘦腿','体态'],avatar:''}, {id:'b_hanxiao',name:'韩小四',desc:'韩系女团身材管理',color:'#C8A8E9',bilibili:'韩小四',keywords:['燃脂','瘦腿','体态'],avatar:''}, {id:'b_zoey',name:'周六野 Zoey',desc:'女性力量训练',color:'#A8E6CF',bilibili:'周六野Zoey',keywords:['燃脂','瘦腿','体态'],avatar:''}, {id:'b_ballet',name:'美丽芭蕾',desc:'塑形形体',color:'#A8C8E9',bilibili:'美丽芭蕾',keywords:['塑形','体态'],avatar:''} ], collections:[], coachMsgs:[] },
    diet:{ sub:'today', days:{}, fridge:[], recipesFav:[], water:0, waterDate:'', plans:[], recipes:[] },
    media:{
      sub:'account', // 子Tab状态
      // 多账号：用对象存储（key=账号id），当前账号 activeAccount 记录 id
      accounts:{ acc_default:{ id:'acc_default', name:'我的小宇宙', fans:1280, position:'治愈系生活 vlog', posts:[], topics:{todo:[],done:[]}, inspiration:{effect:[],sfx:[],music:[],editing:[]}, aiMsgs:[], reviews:[], topicLib:[] } },
      activeAccount:'acc_default',
      account:null, // 兼容别名（已弃用，保留字段避免旧引用报错）
      notes:[]      // 自媒体学习笔记手册（富文本 + 手绘标注 + 智能分类 + 全文检索）
    },
    hot:{ douyin:seedHot('douyin'), xhs:seedHot('xhs') },
    video:[],
    study:{
      sub:'software',
      software:[], academic:{summary:'',topics:''}, daily:[],
      english:{custom:[], chat:{scene:'',q:'',a:'',score:0,tip:''}, recite:{en:'',myText:''}, weak:[], streak:0, level:'零基础', mapProgress:{}, coachMsgs:[], autoPopup:true}, words:{}, sentences:{}
    },
    reading:{books:[]},
    memo:[],
    outfit:{ sub:'today', closet:[], looks:[], weather:null, inspirations:[], accessories:[], hairstyles:[] },
    review:{ sub:'daily', moduleSel:'', daily:{}, weekly:{}, monthly:{}, moduleReviews:{} },
    intel:{
      sub:'news', newsSub:'today', radarSub:'feed', favFilter:'全部',
      readStreak:0, newsNote:'', saved:[],
      industries:[
        {id:'ai',name:'科技·AI',emoji:'🤖',color:'#FFB6C1',sources:[
          {name:'机器之心',url:'https://www.jiqizhixin.com'},
          {name:'量子位',url:'https://www.qbitai.com'},
          {name:'36氪科技',url:'https://36kr.com'},
          {name:'AI前线',url:'https://www.baidu.com/s?wd=AI%E5%89%8D%E7%BA%BF'}
        ]},
        {id:'finance',name:'金融·投资',emoji:'💹',color:'#A8E6CF',sources:[
          {name:'华尔街见闻',url:'https://wallstreetcn.com'},
          {name:'雪球',url:'https://xueqiu.com'},
          {name:'第一财经',url:'https://www.yicai.com'},
          {name:'FT中文网',url:'https://www.ftchinese.com'}
        ]},
        {id:'retail',name:'消费·零售',emoji:'🛍️',color:'#FFD3B6',sources:[
          {name:'虎嗅',url:'https://www.huxiu.com'},
          {name:'晚点 LatePost',url:'https://www.latpost.com'},
          {name:'浪潮新消费',url:'https://www.baidu.com/s?wd=%E6%B5%AA%E6%BD%AE%E6%96%B0%E6%B6%88%E8%B4%B9'},
          {name:'Foodaily',url:'https://www.foodaily.com'}
        ]},
        {id:'health',name:'医疗·健康',emoji:'🏥',color:'#B2DFDB',sources:[
          {name:'动脉网',url:'https://www.vbdata.cn'},
          {name:'丁香园',url:'https://www.dxy.cn'},
          {name:'Fierce Pharma',url:'https://www.fiercepharma.com'},
          {name:'医药魔方',url:'https://www.baidu.com/s?wd=%E5%8C%BB%E8%8D%AF%E9%AD%94%E6%96%B9'}
        ]},
        {id:'energy',name:'能源·碳中和',emoji:'⚡',color:'#FFF59D',sources:[
          {name:'36氪碳中和',url:'https://36kr.com'},
          {name:'能源圈',url:'https://www.baidu.com/s?wd=%E8%83%BD%E6%BA%90%E5%9C%88'},
          {name:'ESG 频道',url:'https://www.baidu.com/s?wd=ESG'},
          {name:'碳排放交易网',url:'https://www.baidu.com/s?wd=%E7%A2%B3%E6%8E%92%E6%94%BE%E4%BA%A4%E6%98%93'}
        ]},
        {id:'auto',name:'汽车·出行',emoji:'🚗',color:'#FFCDD2',sources:[
          {name:'电动汽车观察家',url:'https://www.baidu.com/s?wd=%E7%94%B5%E5%8A%A8%E6%B1%BD%E8%BD%A6%E8%A7%82%E5%AF%9F%E5%AE%B6'},
          {name:'车东西',url:'https://www.baidu.com/s?wd=%E8%BD%A6%E4%B8%9C%E8%A5%BF'},
          {name:'汽车之家新能源',url:'https://car.autohome.com.cn'},
          {name:'懂车帝',url:'https://www.dongchedi.com'}
        ]},
        {id:'media',name:'文娱·传媒',emoji:'🎬',color:'#D1C4E9',sources:[
          {name:'毒舌电影',url:'https://www.baidu.com/s?wd=%E6%AF%92%E8%88%8C%E7%94%B5%E5%BD%B1'},
          {name:'传媒评论',url:'https://www.baidu.com/s?wd=%E4%BC%A0%E5%AA%92%E8%AF%84%E8%AE%BA'},
          {name:'钛媒体',url:'https://www.tmtpost.com'},
          {name:'新榜',url:'https://www.newrank.cn'}
        ]},
        {id:'think',name:'宏观·智库',emoji:'🌍',color:'#C8E6C9',sources:[
          {name:'麦肯锡中国',url:'https://www.mckinsey.com.cn'},
          {name:'BCG Greater China',url:'https://www.bcg.com'},
          {name:'财新',url:'https://www.caixin.com'},
          {name:'FT中文网',url:'https://www.ftchinese.com'}
        ]}
      ],
      consultancies:[
        {id:'mckinsey',name:'麦肯锡 McKinsey',desc:'全球洞察·行业报告·McKinsey Quarterly',color:'#4A90E2',emoji:'📘',links:[
          {label:'最新洞察 Insights',url:'https://www.mckinsey.com.cn/insights'},
          {label:'中文官网',url:'https://www.mckinsey.com.cn'},
          {label:'行业频道',url:'https://www.mckinsey.com.cn/industries'}
        ],mp:'麦肯锡 (McKinsey_gco)'},
        {id:'bcg',name:'波士顿咨询 BCG',desc:'BCG Insights·亨德森智库·X矩阵',color:'#26A69A',emoji:'📗',links:[
          {label:'最新洞察 Publications',url:'https://www.bcg.com/publications'},
          {label:'中文官网',url:'https://www.bcg.com'},
          {label:'行业频道',url:'https://www.bcg.com/industries'}
        ],mp:'BCG波士顿咨询 (BCG_Greater_China)'},
        {id:'bain',name:'贝恩 Bain',desc:'Bain Insights·全球私募/消费/科技报告',color:'#FF5252',emoji:'📕',links:[
          {label:'最新洞察 Insights',url:'https://www.bain.com/insights'},
          {label:'中文官网',url:'https://www.bain.com'},
          {label:'行业频道',url:'https://www.bain.com/industries'}
        ],mp:'贝恩公司 (Baininsights)'}
      ],
      medias:[
        {id:'cctv',name:'央视新闻',desc:'国家大事第一线·权威快讯',emoji:'📺',color:'#FF1744',links:[
          {label:'央视新闻网',url:'https://news.cctv.com'},
          {label:'新闻联播回看',url:'https://tv.cctv.com'},
          {label:'央视频',url:'https://www.yangshipin.cn'}
        ]},
        {id:'xinhua',name:'新华社',desc:'国家通讯社·深度时政报道',emoji:'📰',color:'#D32F2F',links:[
          {label:'新华网',url:'https://www.news.cn'},
          {label:'今日要闻',url:'https://www.news.cn/world'}
        ]},
        {id:'rmrb',name:'人民日报',desc:'党报头版·评论员文章',emoji:'🗞️',color:'#C62828',links:[
          {label:'人民网',url:'https://www.people.com.cn'},
          {label:'人民日报电子版',url:'http://paper.people.com.cn'}
        ]},
        {id:'cankaoxiaoxi',name:'参考消息',desc:'外媒视角看中国和世界',emoji:'🌐',color:'#1976D2',links:[
          {label:'参考消息网',url:'https://www.cankaoxiaoxi.com'}
        ]}
      ]
    },
    finance:{ sub:'basic', assets:[], liabilities:[], savings:[], level:'小白', mode:'', products:[], learnHistory:[], chatMsgs:[], dailyKnowledge:null },
    ledgerExt:{ sub:'record', totalFund:{flexible:0,invested:0,flexPlan:0,investPlan:0}, savingPlans:[], savingMode:'', savingModeData:null },
    habits:{ water:{done:false,date:''}, supplements:[] },
    luckyShown:'',  // 全完成动画当日标记
    iconLocked:{},  // 分栏头像锁定状态：moduleId -> bool
    theme:'light',  // 浅色 / 深色
    background:{ global:'', perModule:{} }, // 背景：global 全板块 / perModule[moduleId]
    backgroundLocked:false,  // 背景设置后自动锁定
    dashboard:{ modules:{} }, // 分栏复盘状态：modules[moduleId].reviewed
    _bgSuggestions:[] // 联网推荐背景缓存（不持久化关键数据）
  };
}
function seedHot(platform){
  const base = platform==='douyin'
   ? [['手势舞挑战','手势舞','980w'],['三分钟搞定早餐','美食','870w'],['通勤ootd','穿搭','760w'],['宿舍好物','种草','650w'],['情侣vlog','两性','540w']]
   : [['早八妆容教程','美妆','430w'],['citywalk路线','vlog','390w'],['小个子穿搭','穿搭','360w'],['治愈系手账','手帐','310w'],['减脂餐打卡','美食','280w']];
  return base.map((b,i)=>({id:uid(),platform,rank:i+1,heat:b[2],topic:b[0],tags:[b[1]],suitable:false}));
}
// 把上传的图片压缩为较小的 dataURL（用于头像/图标，控制云同步体积）
function fileToScaledDataURL(file,maxDim,quality){
  return new Promise((resolve)=>{
    const rd=new FileReader();
    rd.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let {width:w,height:h}=img;
        if(w>maxDim||h>maxDim){
          const r=Math.min(maxDim/w,maxDim/h);
          w=Math.max(1,Math.round(w*r)); h=Math.max(1,Math.round(h*r));
        }
        try{
          const cv=document.createElement('canvas');cv.width=w;cv.height=h;
          cv.getContext('2d').drawImage(img,0,0,w,h);
          resolve(cv.toDataURL('image/jpeg',quality||0.8));
        }catch(e){ resolve(rd.result); }
      };
      img.onerror=()=>resolve(rd.result);
      img.src=rd.result;
    };
    rd.onerror=()=>resolve('');
    rd.readAsDataURL(file);
  });
}
// 把【已有的 base64 图片】压缩（用于启动/同步前缩小体积，解决 4MB 大文件导致 GitHub 409）
function dataUrlToScaled(src,maxDim,quality){
  return new Promise((resolve)=>{
    if(!src||!src.startsWith('data:image')){ resolve(src); return; }
    const img=new Image();
    img.onload=()=>{
      let {width:w,height:h}=img;
      if(w>maxDim||h>maxDim){
        const r=Math.min(maxDim/w,maxDim/h);
        w=Math.max(1,Math.round(w*r)); h=Math.max(1,Math.round(h*r));
      }
      try{
        const cv=document.createElement('canvas');cv.width=w;cv.height=h;
        cv.getContext('2d').drawImage(img,0,0,w,h);
        resolve(cv.toDataURL('image/jpeg',quality||0.8));
      }catch(e){ resolve(src); }
    };
    img.onerror=()=>resolve(src);
    img.src=src;
  });
}
// 把本地存储里过大的头像 / 图标重压一遍（只在明显过大时才压，避免循环损耗清晰度）
async function recompressImages(){
  const BIG=120000; // base64 长度超过约 90KB 才重压
  const jobs=[];
  if(S.profile && S.profile.avatar && S.profile.avatar.length>BIG){
    jobs.push(dataUrlToScaled(S.profile.avatar,200,0.8).then(d=>{ if(d) S.profile.avatar=d; }));
  }
  if(S.icons){
    for(const k in S.icons){
      if(S.icons[k] && S.icons[k].length>BIG){
        jobs.push(dataUrlToScaled(S.icons[k],120,0.82).then(d=>{ if(d) S.icons[k]=d; }));
      }
    }
  }
  await Promise.all(jobs);
}

/* ---------- 顶栏 ---------- */
function renderTop(){
  $('#brandKitty').innerHTML = kitty('#ff8fb3',40);
  const now=new Date();
  $('#datePill').textContent = `${now.getMonth()+1}月${now.getDate()}日`;
  $('#weekPill').textContent = WEEK[now.getDay()];
  loadWeather();
}
async function loadWeather(){
  const el=$('#weatherText');
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&current=temperature_2m,weather_code');
    const j=await r.json();
    const t=Math.round(j.current.temperature_2m);
    const code=j.current.weather_code;
    const map={0:'晴',1:'多云',2:'多云',3:'阴',45:'雾',48:'雾',61:'小雨',63:'中雨',65:'大雨',71:'雪',80:'阵雨',95:'雷阵雨'};
    const txt=map[code]??'晴';
    const type=['rain','snow'].some(k=>txt.includes(k))?'rain':(txt==='阴'||txt==='多云'?'cloud':'sun');
    $('#weatherIco').innerHTML=weatherIco(type);
    el.textContent=`${txt} ${t}°C`;
  }catch(e){
    const types=['sun','cloud'];
    const t=['晴','多云'][Math.floor(Math.random()*2)];
    $('#weatherIco').innerHTML=weatherIco(t==='晴'?'sun':'cloud');
    el.textContent=`${t} ${22+Math.floor(Math.random()*8)}°C`;
  }
}

/* ---------- 侧边导航 ---------- */
function navIconHTML(m){
  const custom = S.icons && S.icons[m.id];
  if(custom) return `<img src="${custom}" alt="${esc(m.name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,.12)">`;
  if(m.emoji) return `<span class="nav-emoji" title="${esc(m.name)}">${m.emoji}</span>`;
  return navIcon(m.bow,40);
}
function renderNav(){
  const sb=$('#sidebar');
  const avatar = S.profile.avatar || '';
  const avatarImg = avatar
    ? `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" alt="头像">`
    : `<svg viewBox="0 0 64 64" width="72" height="72" style="display:block"><circle cx="32" cy="32" r="30" fill="#f3e3ee"/><text x="32" y="38" text-anchor="middle" fill="#c9a3cc" font-size="28">♡</text></svg>`;
  const hasCustom = S.icons && Object.keys(S.icons).length>0;
  sb.innerHTML = `
    <div class="sidebar-profile">
      <div class="profile-avatar-wrap" id="profileAvatarWrap" title="点击打开工作台总览">
        <div class="profile-avatar">${avatarImg}</div>
      </div>
      <div class="profile-name" id="profileName" title="点击打开工作台总览">善善的工作台</div>
      <div class="profile-divider"></div>
    </div>
    ${MODULES.map(m=>{
      const locked = !!(S.iconLocked && S.iconLocked[m.id]);
      return `
      <div class="nav-item ${m.id===current?'active':''}" data-act="nav" data-id="${m.id}">
        <span class="nav-icon-circle ${locked?'locked':''}" data-act="nav-icon" data-id="${m.id}" title="${locked?'已锁定：点击右侧锁可解锁换图标':'点击上传自定义图标'}">${navIconHTML(m)}</span>
        <span class="nav-label">${m.name}</span>
        <button class="nav-lock-btn" data-act="nav-lock" data-id="${m.id}" title="${locked?'解锁图标':'锁定图标'}">${locked?'🔒':'🔓'}</button>
      </div>`;
    }).join('')}
    <input type="file" id="navIconInput" accept="image/*" hidden>
    ${hasCustom?'<div class="nav-reset" data-act="nav-reset">↺ 恢复默认图标</div>':''}
  `;
  // 头像 / 名称点击 → 打开工作台总览面板
  $('#profileAvatarWrap').addEventListener('click',openDashboard);
  $('#profileName').addEventListener('click',openDashboard);
  // 自定义模块图标上传（自动压缩）；锁定状态下不可点击
  const navInput=$('#navIconInput');
  let navEditId=null;
  sb.querySelectorAll('[data-act=nav-icon]').forEach(el=>{
    el.addEventListener('click',(ev)=>{
      ev.stopPropagation();
      const id=el.dataset.id;
      if(S.iconLocked && S.iconLocked[id]) return; // 锁定：禁止上传
      navEditId=id;navInput.click();
    });
  });
  navInput.addEventListener('change',async (e)=>{
    const f=e.target.files[0];if(!f||!navEditId)return;
    S.icons=S.icons||{};S.icons[navEditId]=await fileToScaledDataURL(f,120,0.8);save();renderNav();
  });
  // 锁定 / 解锁切换
  sb.querySelectorAll('[data-act=nav-lock]').forEach(el=>{
    el.addEventListener('click',(ev)=>{
      ev.stopPropagation();
      const id=el.dataset.id; S.iconLocked=S.iconLocked||{};
      S.iconLocked[id]=!S.iconLocked[id]; save(); renderNav();
      toast(S.iconLocked[id]?'已锁定 '+MODULES.find(m=>m.id===id).name+' 头像':'已解锁 '+MODULES.find(m=>m.id===id).name+' 头像');
    });
  });
  const resetEl=sb.querySelector('[data-act=nav-reset]');
  if(resetEl) resetEl.addEventListener('click',(ev)=>{ev.stopPropagation();S.icons={};save();renderModule();renderNav();});
}

/* ---------- 工作台总入口 / 分栏总览面板 ---------- */
function openDashboard(){
  const items = MODULES.map(m=>{
    const prog = moduleProgress(m.id);
    const dm = (S.dashboard && S.dashboard.modules && S.dashboard.modules[m.id])||{};
    const reviewed = !!dm.reviewed;
    const custom = S.icons && S.icons[m.id];
    const icon = custom
      ? `<img src="${custom}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" alt="${esc(m.name)}">`
      : navIcon(m.bow,40);
    return `<div class="dash-item" data-mod="${m.id}">
      <div class="dash-ico">${icon}</div>
      <div class="dash-main">
        <div class="dash-name">${m.name}</div>
        <div class="dash-bar"><div class="dash-bar-fill" style="width:${prog}%"></div></div>
      </div>
      <div class="dash-pct">${prog}%</div>
      <label class="dash-review" title="标记今日已复盘">
        <input type="checkbox" data-act="dash-review" data-id="${m.id}" ${reviewed?'checked':''}> 已复盘
      </label>
    </div>`;
  }).join('');
  openModal(kitty('#c9a3ff',26)+' 工作台总览',
    `<p class="muted">点击任一分栏可直接进入；勾选「已复盘」记录今天的状态。</p>
     <div class="dash-list">${items}</div>
     <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
       <button class="btn" data-act="dash-avatar">🖼 更换头像</button>
       <input type="file" id="dashAvatarInput" accept="image/*" hidden>
       <span class="muted">当前主题：${S.theme==='dark'?'深色 🌙':'浅色 ☀️'}</span>
     </div>`,
    '<button class="btn" data-act="modal-cancel">关闭</button>',
    (body)=>{
      body.querySelectorAll('[data-act=dash-review]').forEach(cb=>{
        cb.addEventListener('change',()=>{
          S.dashboard=S.dashboard||{}; S.dashboard.modules=S.dashboard.modules||{};
          S.dashboard.modules[cb.dataset.id]=S.dashboard.modules[cb.dataset.id]||{};
          S.dashboard.modules[cb.dataset.id].reviewed=cb.checked; save();
        });
      });
      body.querySelectorAll('.dash-item').forEach(it=>{
        it.addEventListener('click',(e)=>{
          if(e.target.closest('[data-act=dash-review]')) return;
          current=it.dataset.mod; renderNav(); renderModule(); closeModal();
        });
      });
      body.querySelector('[data-act=dash-avatar]')?.addEventListener('click',()=>body.querySelector('#dashAvatarInput').click());
      body.querySelector('#dashAvatarInput')?.addEventListener('change',async (e)=>{
        const f=e.target.files[0]; if(!f)return;
        S.profile.avatar=await fileToScaledDataURL(f,240,0.82); save(); renderNav();
        toast('头像已更新');
      });
    });
}

/* ---------- 分栏完成进度（用于总览面板，简单估算） ---------- */
function moduleProgress(id){
  const k=todayKey();
  switch(id){
    case 'mood':     return S.mood.history.some(h=>h.date===k)?100:0;
    case 'todo':     { const t=S.todos; return t.length?Math.round(t.filter(x=>x.done).length/t.length*100):0; }
    case 'schedule': { const mk=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
                       const g=(S.schedule.goals[mk]||[]); return g.length?Math.round(g.filter(x=>x.done).length/g.length*100):0; }
    case 'ledger':   return S.ledger.some(r=>r.date===k)?100:0;
    case 'exercise': return S.exercise.records.some(r=>r.date===k)?100:0;
    case 'diet':     return S.diet.days[k]?100:0;
    case 'media':{const A=curMedia();return (A.posts.length+A.topics.todo.length)?Math.min(100,A.posts.length*20+15):0;}
    case 'hot':      return S.hot.douyin.length?Math.min(100,S.hot.douyin.length*12):0;
    case 'video':    return S.video.length?Math.min(100,S.video.length*25):0;
    case 'study':    return S.study.daily.length?Math.min(100,S.study.daily.length*20+15):0;
    case 'reading':  return S.reading.books.length?Math.min(100,S.reading.books.length*20):0;
    case 'memo':     return S.memo.length?Math.min(100,S.memo.length*20):0;
    case 'tool':     return 100;
    default:         return 0;
  }
}

/* ---------- 深色模式 / 背景 ---------- */
function applyTheme(){
  if(S.theme==='dark') document.documentElement.dataset.theme='dark';
  else delete document.documentElement.dataset.theme;
}
function applyBackground(){
  let el=document.getElementById('appBg');
  if(!el){ el=document.createElement('div'); el.id='appBg'; document.body.appendChild(el); }
  const bg=(S.background && S.background.perModule && S.background.perModule[current])
        || (S.background && S.background.global) || '';
  if(!bg){ el.style.backgroundImage=''; el.style.backgroundColor=''; return; }
  if(bg.startsWith('http')||bg.startsWith('data:')){
    el.style.backgroundImage=`linear-gradient(rgba(60,45,60,.30),rgba(60,45,60,.30)), url("${bg}")`;
  }else{
    el.style.backgroundImage=bg;
  }
  el.style.backgroundSize='cover';
  el.style.backgroundPosition='center';
  el.style.backgroundAttachment='fixed';
}

/* ---------- 工具栏模块 ---------- */
function renderTool(){
  const dark=S.theme==='dark';
  const gradBtns=DEFAULT_BG.map(g=>`<button class="bg-swatch" title="${g.name}" data-act="bg-apply" data-v="${esc(g.css)}" style="background:${g.css}"></button>`).join('');
  const sug=S._bgSuggestions||[];
  const onlineImgs=sug.map(u=>`<button class="bg-swatch" data-act="bg-apply" data-v="${esc(u)}" style="background-image:url('${u}');background-size:cover"></button>`).join('');
  const curBg=(S.background.perModule&&S.background.perModule[current])||S.background.global||'';
  return `<div class="card">
    ${header('tool','工具栏')}
    <div class="sub-title">🌗 深色 / 浅色模式</div>
    <div class="settings-row" style="justify-content:space-between">
      <div>
        <div class="st-title">深色模式</div>
        <div class="muted">夜间更护眼，自动切换深色配色</div>
      </div>
      <label class="switch"><input type="checkbox" data-act="theme-toggle" ${dark?'checked':''}><span class="slider"></span></label>
    </div>

    <div class="sub-title">🎨 背景库</div>
    <div class="muted" style="margin-bottom:8px">设置后自动锁定；锁定状态下点击下方「解锁背景」才能再更改。</div>
    <div class="bg-label">默认渐变</div>
    <div class="bg-grid">${gradBtns}</div>
    <div class="bg-label">联网推荐（picsum 图床）</div>
    <div class="bg-grid" id="bgOnline">${onlineImgs||'<span class="muted">点「换一批」加载推荐图</span>'}</div>
    <div class="row" style="margin-top:10px">
      <button class="btn ghost sm" data-act="bg-more">🔄 换一批推荐图</button>
      <button class="btn ghost sm" data-act="bg-upload">📤 上传本地图片</button>
      <input type="file" id="bgUploadInput" accept="image/*" hidden data-act="bg-upload-input">
    </div>
    <div class="bg-label" style="margin-top:12px">应用到</div>
    <div class="seg" id="bgScope">
      <button data-act="bg-scope" data-v="global" class="${bgScopeCur!=='module'?'on':''}">全板块</button>
      <button data-act="bg-scope" data-v="module" class="${bgScopeCur==='module'?'on':''}">仅当前页（${MODULES.find(m=>m.id===current).name}）</button>
    </div>
    <div class="row" style="margin-top:12px;align-items:center;flex-wrap:wrap">
      <button class="btn danger sm" data-act="bg-clear">清除背景</button>
      <span class="muted">状态：${S.backgroundLocked?'🔒 已锁定':'🔓 未锁定'}</span>
      <button class="btn ghost sm" data-act="bg-lock-toggle">${S.backgroundLocked?'解锁背景':'锁定背景'}</button>
    </div>
    ${curBg?`<div class="muted" style="margin-top:12px">当前背景：</div>
      <div class="bg-preview" style="background-image:${curBg.startsWith('http')||curBg.startsWith('data:')?`url('${curBg}')`:curBg}"></div>`:''}
  </div>`;
}

/* ---------- 模块头 ---------- */
function header(modId,title,extra=''){
  const m=MODULES.find(x=>x.id===modId);
  return `<h2 class="card-title"><span class="ct-kitty">${kitty(m.bow,36)}</span>${title}${extra}</h2>`;
}

/* ---------- 联动：基础代谢 / 热量缺口 ---------- */
function getBMR(){ return int((Number(S.exercise.weight)||0)*22); }      // 估算
function todayExerciseBurn(){
  const k=todayKey();
  return S.exercise.records.filter(r=>r.date===k).reduce((s,r)=>s+int(r.calories),0);
}
function todayIntake(){
  const d=S.diet.days[todayKey()]||{};
  return int(d.b||0)+int(d.l||0)+int(d.d||0);
}
function calorieGap(){ return getBMR()+todayExerciseBurn()-todayIntake(); }
/* 更新页面上存在的联动数值（不整页重渲染） */
function refreshLinks(){
  const set=(id,v)=>{const e=$('#'+id);if(e)e.textContent=v;};
  set('bmrVal',getBMR());
  set('dietBmr',getBMR());
  const gap=calorieGap(); set('gapVal',gap);
  const tag=$('#gapTag');
  if(tag){
    if(gap>=300){tag.className='tag';tag.style.background='#d6f3e8';tag.style.color='#3fae90';tag.textContent='减脂达标';}
    else if(gap>=0){tag.className='tag';tag.style.background='#fff0d6';tag.style.color='#d99a2b';tag.textContent='缺口偏低';}
    else{tag.className='tag';tag.style.background='#ffe0e0';tag.style.color='#e06a6a';tag.textContent='热量盈余';}
  }
  // 运动消耗汇总
  set('exTodayBurn',todayExerciseBurn());
  set('exCount',S.exercise.records.filter(r=>r.date===todayKey()).length);
  set('exTotal',S.exercise.records.reduce((s,r)=>s+int(r.calories),0));
  // 记账汇总
  const k=todayKey(), mk=todayKey().slice(0,7);
  const inc=S.ledger.filter(r=>r.type==='income');
  const exp=S.ledger.filter(r=>r.type==='expense');
  set('ldInc',money(inc.filter(r=>r.date===k).reduce((s,r)=>s+Number(r.amount),0)));
  set('ldExp',money(exp.filter(r=>r.date===k).reduce((s,r)=>s+Number(r.amount),0)));
  set('ldBal',money(inc.filter(r=>r.date===k).reduce((s,r)=>s+Number(r.amount),0)-exp.filter(r=>r.date===k).reduce((s,r)=>s+Number(r.amount),0)));
  set('lmBal',money(inc.filter(r=>r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0)-exp.filter(r=>r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0)));
  set('lmInc',money(inc.filter(r=>r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0)));
  set('lmExp',money(exp.filter(r=>r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0)));
}

/* ============================================================
   模块渲染
   ============================================================ */
function renderModule(){
  const c=$('#content');
  const fn = ({
    mood:renderMood, schedule:renderSchedule, todo:renderTodo, ledger:renderLedger,
    exercise:renderExercise, diet:renderDiet, media:renderMedia, hot:renderHot,
    video:renderVideo, study:renderStudy, reading:renderReading, memo:renderMemo,
    outfit:renderOutfit, intel:renderIntel, review:renderReview, finance:renderFinance,
    tool:renderTool
  })[current];
  c.innerHTML = fn();
  refreshLinks();
  applyBackground();
  loadInlineMedia();
  if(current==='reading') loadBookCovers();
  if(current==='memo') bindMemoMedia();
  if(current==='media'&&(S.media.sub||'account')==='topics') renderDailyTopics();
  if(current==='media'&&(S.media.sub||'account')==='library') bindTopicLibMedia();
  c.scrollTop=0;
}

/* ============================================================
   新增板块辅助：图表 / 状态
   ============================================================ */
const FIN_COLORS=['#ff8fb3','#c9a3ff','#ffb0e0','#8a6fd1','#7fd6bb','#ffd6e7','#b9a3e3','#f6a6cf'];
let outfitCatFilter='全部', outfitSeasonFilter='全部', reviewScope='daily', outfitWeatherTried=false;

/* 纯 SVG 饼图（segs:[{label,value,color}]） */
function svgPie(segs,size){
  size=size||170;
  segs=(segs||[]).filter(s=>Math.max(0,s.value)>0);
  const total=segs.reduce((s,x)=>s+x.value,0);
  if(total<=0) return '<div class="muted" style="text-align:center;padding:18px 0">暂无数据</div>';
  const cx=size/2,cy=size/2,r=size/2-4;
  let ang=-Math.PI/2;const parts=[];
  segs.forEach(s=>{
    const frac=s.value/total;const a2=ang+frac*2*Math.PI;
    const x1=cx+r*Math.cos(ang),y1=cy+r*Math.sin(ang);
    const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
    const large=frac>0.5?1:0;
    parts.push(`<path d="M${cx} ${cy} L${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${s.color}"><title>${esc(s.label)} ¥${money(s.value)}</title></path>`);
    ang=a2;
  });
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="max-width:100%;display:block;margin:0 auto">${parts.join('')}</svg>`;
}
/* 纯 SVG 柱状图（data:[{label,value}]，value 可负） */
function svgBars(data,opt){
  opt=opt||{};
  const W=opt.w||320,H=opt.h||130,pad=22;
  const vals=data.map(d=>d.value);
  const max=Math.max(0,...vals), minV=Math.min(0,...vals);
  const span=(max-minV)||1;
  const gap=(W-2*pad)/data.length;
  const bw=gap*0.56;
  const zeroY=H-pad-(0-minV)/span*(H-2*pad);
  let bars='';
  data.forEach((d,i)=>{
    const cx=pad+gap*i+gap/2;
    const yv=H-pad-(d.value-minV)/span*(H-2*pad);
    const h=Math.abs(yv-zeroY);
    const col=d.value>=0?'var(--purple-d)':'#ff8fa3';
    bars+=`<rect x="${(cx-bw/2).toFixed(1)}" y="${Math.min(yv,zeroY).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1,h).toFixed(1)}" rx="5" fill="${col}"/>`+
      `<text x="${cx.toFixed(1)}" y="${(H-6)}" text-anchor="middle" font-size="10" fill="var(--text-soft)">${esc(d.label)}</text>`+
      `<text x="${cx.toFixed(1)}" y="${(Math.min(yv,zeroY)-4).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--text-soft)">${int(d.value)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;max-width:340px;margin:0 auto">${bars}</svg>`;
}

/* ============================================================
   A. 穿搭（outfit）
   ============================================================ */
function outfitSuggest(temp,desc){
  const d=(desc||'');
  const umbrella=/雨|雪|雷|阵雨|雨夹雪|snow|rain/i.test(d);
  let tip;
  if(temp>=28) tip='天气炎热，建议短袖、连衣裙、吊带等清凉穿搭 🌞';
  else if(temp>=18) tip='温度舒适，薄外套、衬衫、针织衫都很合适 🍃';
  else if(temp>=10) tip='微凉，建议卫衣、风衣、薄毛衣保暖 🧥';
  else tip='寒冷天气，羽绒服、厚毛衣、围巾安排上 ❄️';
  return {tip,umbrella};
}
async function loadOutfitWeather(force){
  const o=S.outfit;
  if(!force && o.weather && o.weather.fetchedAt && Date.now()-o.weather.fetchedAt < 3*3600*1000){
    if(current==='outfit') renderModule(); return;
  }
  try{
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),5000);
    const r=await fetch('https://wttr.in/?format=j1',{signal:ctrl.signal});
    clearTimeout(to);
    if(!r.ok) throw new Error('http'+r.status);
    const j=await r.json();
    const cur=j.current_condition&&j.current_condition[0];
    if(!cur) throw new Error('nodata');
    const temp=parseFloat(cur.temp_C);
    const desc=(cur.weatherDesc&&cur.weatherDesc[0]&&cur.weatherDesc[0].value)||'';
    const su=outfitSuggest(temp,desc);
    o.weather={temp,desc,umbrella:su.umbrella,tip:su.tip,fetchedAt:Date.now()};
    save();
  }catch(e){
    if(!o.weather) o.weather={temp:null,desc:'暂无天气数据',tip:'暂无天气数据，按场合挑选即可',umbrella:false,fetchedAt:Date.now()};
    else o.weather.tip='暂无天气数据，按场合挑选即可';
    if(!force) save();
  }
  if(current==='outfit') renderModule();
}
function openClosetModal(editId){
  const o=S.outfit;
  const c=editId?o.closet.find(x=>x.id===editId):null;
  let imgData=c&&c.img?c.img:'';
  const cats=['上装','下装','外套','鞋履','配饰'], seasons=['春','夏','秋','冬','四季'];
  openModal(kitty('#ffb0e0',26)+(c?' 编辑衣物':' 新增衣物'),`
    <div class="row">
      <div style="flex:1"><div class="muted">名称</div><input class="inp" id="clName" placeholder="如 白色衬衫" value="${esc(c?c.name:'')}"></div>
      <div style="flex:1"><div class="muted">分类</div><select class="inp" id="clCat">${cats.map(x=>`<option value="${x}" ${c&&c.cat===x?'selected':''}>${x}</option>`).join('')}</select></div>
    </div>
    <div class="row" style="margin-top:10px">
      <div style="flex:1"><div class="muted">季节</div><select class="inp" id="clSeason">${seasons.map(x=>`<option value="${x}" ${c&&c.season===x?'selected':''}>${x}</option>`).join('')}</select></div>
      <div style="flex:1"><div class="muted">颜色</div><input class="inp" id="clColor" placeholder="如 粉色" value="${esc(c?c.color:'')}"></div>
    </div>
    <div class="muted" style="margin-top:10px">备注</div>
    <input class="inp" id="clNote" placeholder="可选" value="${esc(c?c.note:'')}">
    <div class="muted" style="margin-top:10px;font-weight:700">衣物图片（可选）</div>
    <input type="file" id="clImgInput" accept="image/*" hidden>
    <div class="closet-upload" id="clImgZone">${imgData?`<img src="${imgData}" class="closet-prev">`:'<span>📷 点击上传衣物图片</span>'}</div>
  `,`<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="closet-save">保存</button>`,
  ()=>{
    const zone=$('#clImgZone');
    zone.addEventListener('click',()=>$('#clImgInput').click());
    $('#clImgInput').addEventListener('change',async ()=>{
      const f=$('#clImgInput').files[0];if(!f)return;
      imgData=await fileToScaledDataURL(f,800,0.82);
      zone.innerHTML=`<img src="${imgData}" class="closet-prev">`;
    });
    $('#modalFoot').querySelector('[data-act=closet-save]').onclick=()=>{
      const rec=c?c:{id:uid()};
      rec.name=$('#clName').value||'衣物';rec.cat=$('#clCat').value;rec.season=$('#clSeason').value;
      rec.color=$('#clColor').value;rec.note=$('#clNote').value;rec.img=imgData||null;
      if(!c) o.closet.push(rec);
      save();closeModal();renderModule();
    };
  });
}
function openLookModal(){
  const o=S.outfit;
  const opts=o.closet.map(c=>`<label class="look-opt"><input type="checkbox" data-look-item="${c.id}"> ${esc(c.name)} <span class="muted">(${esc(c.cat)})</span></label>`).join('');
  openModal(kitty('#ffb0e0',26)+' 新搭配',`
    <div class="row">
      <div style="flex:1"><div class="muted">日期</div><input class="inp" id="lkDate" type="date" value="${todayKey()}"></div>
      <div style="flex:1"><div class="muted">场合</div><select class="inp" id="lkOcc">${['通勤','约会','运动','休闲','旅行'].map(x=>`<option>${x}</option>`).join('')}</select></div>
    </div>
    <div class="muted" style="margin-top:10px">选择衣物</div>
    <div class="look-opt-list">${opts||'<div class="muted">衣橱是空的，先去加几件衣服吧~</div>'}</div>
    <div class="muted" style="margin-top:10px">备注</div><input class="inp" id="lkNote" placeholder="可选">
  `,`<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="lk-save">保存</button>`,
  ()=>{
    $('#modalFoot').querySelector('[data-act=lk-save]').onclick=()=>{
      const items=[...document.querySelectorAll('[data-look-item]:checked')].map(el=>el.dataset.lookItem);
      o.looks.push({id:uid(),date:$('#lkDate').value||todayKey(),items,occasion:$('#lkOcc').value,note:$('#lkNote').value});
      save();closeModal();renderModule();toast('搭配已记录 👗');
    };
  });
}
function renderOutfit(){
  if(!S.outfit.weather && !outfitWeatherTried){ outfitWeatherTried=true; loadOutfitWeather(false); }
  const o=S.outfit;
  const cats=['上装','下装','外套','鞋履','配饰'], seasons=['春','夏','秋','冬','四季'];
  const filtered=o.closet.filter(c=>(outfitCatFilter==='全部'||c.cat===outfitCatFilter)&&(outfitSeasonFilter==='全部'||c.season===outfitSeasonFilter));
  const w=o.weather;
  const wxHTML = w && w.temp!=null ? `
    <div class="outfit-wx">
      <div class="outfit-wx-temp">${Math.round(w.temp)}°C</div>
      <div class="outfit-wx-desc">${esc(w.desc||'')} · ${w.umbrella?'☔ 记得带伞':'🌤 无需带伞'}</div>
      <div class="outfit-wx-tip">${esc(w.tip||'')}</div>
      <button class="btn ghost sm" data-act="outfit-refresh-weather">刷新天气</button>
    </div>` : `
    <div class="outfit-wx">
      <div class="muted">${esc((w&&w.tip)||'获取今日天气，给你穿搭建议~')}</div>
      <button class="btn ghost sm" data-act="outfit-refresh-weather">获取今日天气建议</button>
    </div>`;
  return `<div class="card">
    ${header('outfit','穿搭衣橱')}
    <div class="sub-title">今日穿搭建议</div>
    ${wxHTML}
    <div class="sub-title">衣物库 <button class="btn sm" data-act="outfit-closet-add" style="float:right">+ 新增衣物</button></div>
    <div class="chip-row">
      <button class="chip ${outfitCatFilter==='全部'?'on':''}" data-act="outfit-cat-filter" data-v="全部">全部</button>
      ${cats.map(c=>`<button class="chip ${outfitCatFilter===c?'on':''}" data-act="outfit-cat-filter" data-v="${c}">${c}</button>`).join('')}
    </div>
    <div class="chip-row">
      <button class="chip ${outfitSeasonFilter==='全部'?'on':''}" data-act="outfit-season-filter" data-v="全部">全部季节</button>
      ${seasons.map(s=>`<button class="chip ${outfitSeasonFilter===s?'on':''}" data-act="outfit-season-filter" data-v="${s}">${s}</button>`).join('')}
    </div>
    <div class="closet-grid">
      ${filtered.length?filtered.map(c=>`
        <div class="closet-card">
          ${c.img?`<img class="closet-img" src="${c.img}" alt="${esc(c.name)}">`:`<div class="closet-img closet-img-empty">👚</div>`}
          <div class="closet-name">${esc(c.name)}</div>
          <div class="muted" style="font-size:12px">${esc(c.cat)} · ${esc(c.season)}${c.color?' · '+esc(c.color):''}</div>
          ${c.note?`<div class="muted" style="font-size:12px;margin-top:4px">${esc(c.note)}</div>`:''}
          <div class="li-actions"><button class="btn ghost sm" data-act="outfit-closet-edit" data-id="${c.id}">编辑</button><button class="btn danger sm" data-act="outfit-closet-del" data-id="${c.id}">删</button></div>
        </div>`).join(''):emptySVG('pencil')+'<div class="empty">还没有衣物，点「新增衣物」充实衣橱~</div>'}
    </div>
    <div class="sub-title">搭配记录 <button class="btn sm" data-act="outfit-look-add" style="float:right">+ 新搭配</button></div>
    <div class="look-list">
      ${o.looks.length?o.looks.slice().reverse().map(lk=>{
        const names=lk.items.map(id=>{const c=o.closet.find(x=>x.id===id);return c?c.name:'已删除';});
        return `<div class="look-card">
          <div class="look-head"><span class="tag">${esc(lk.occasion)}</span><span class="muted">${esc(lk.date)}</span></div>
          <div class="look-items">${names.map(n=>`<span class="look-tag">${esc(n)}</span>`).join('')||'<span class="muted">未选择衣物</span>'}</div>
          ${lk.note?`<div class="muted" style="margin-top:6px">${esc(lk.note)}</div>`:''}
          <div class="li-actions"><button class="btn danger sm" data-act="outfit-look-del" data-id="${lk.id}">删除</button></div>
        </div>`;
      }).join(''):'<div class="empty">还没有搭配记录~</div>'}
    </div>
  </div>`;
}

/* ============================================================
   B. 复盘（review）
   ============================================================ */
const REVIEW_TPLS={
  daily:[['mood','今日心情','今天过得怎么样？'],['win','今日成就（3件小确幸）','写下今天让你开心的小事~'],['improve','待改进','一点可以更好的地方'],['plan','明日计划','明天想做的事']],
  weekly:[['gain','本周收获','这周学会了/做到了什么'],['undone','未完成','还没搞定的事'],['key','下周重点','下周最想推进的'],['score','本周评分(1-10)','拖动评分']],
  monthly:[['goal','本月目标达成','月初定的目标进度如何'],['highlight','高光时刻','最闪亮的一天'],['regret','遗憾','小小的错过'],['theme','下月主题','下个月的关键词'],['self','月度自评','给这个月一句话']]
};
function reviewKeyOf(scope){ return {daily:todayKey(),weekly:weekKey(),monthly:monthKey()}[scope]; }
function lastNDaysWithReview(n){
  let cnt=0;const today=new Date();
  for(let i=0;i<n;i++){const d=new Date(today);d.setDate(today.getDate()-i);if(S.review.daily[todayKey(d)])cnt++;}
  return cnt;
}
function renderReview(){
  const labels={daily:'日复盘',weekly:'周复盘',monthly:'月复盘'};
  const key=reviewKeyOf(reviewScope);
  const data=(S.review[reviewScope]||{})[key]||{};
  const tpl=REVIEW_TPLS[reviewScope];
  const dayStreak7=lastNDaysWithReview(7), dayStreak30=lastNDaysWithReview(30);
  const fields=tpl.map(([k,label,ph])=>{
    if(k==='score'){
      return `<div class="sub-title">${label}：<b id="rvScoreVal">${data.score||''}</b></div>
        <input class="inp" type="range" min="1" max="10" value="${data.score||5}" data-act="review-score" id="rvScore">
        <div class="muted">拖动评分（1-10）</div>`;
    }
    return `<div class="muted" style="margin-top:10px;font-weight:700">${label}</div>
      <textarea class="txtarea" data-act="review-field" data-f="${k}" placeholder="${esc(ph)}">${esc(data[k]||'')}</textarea>`;
  }).join('');
  return `<div class="card">
    ${header('review','引导式复盘')}
    <div class="chip-row">
      ${['daily','weekly','monthly'].map(s=>`<button class="chip ${reviewScope===s?'on':''}" data-act="review-tab" data-v="${s}">${labels[s]}</button>`).join('')}
    </div>
    <div class="review-streak">🔥 近7天复盘 <b>${dayStreak7}</b> 天 · 近30天 <b>${dayStreak30}</b> 天</div>
    <div class="muted">当前周期：${esc(key)}</div>
    ${fields}
    <button class="btn" data-act="review-save" style="margin-top:14px">保存${labels[reviewScope]}</button>
  </div>`;
}

/* ============================================================
   C. 行业情报（intel）
   ============================================================ */
function pickCat(t){
  t=(t||'').toLowerCase();
  const map=[['ai','AI'],['人工智能','AI'],['大模型','AI'],['自媒体','自媒体'],['小红书','自媒体'],['抖音','自媒体'],['女性','女性成长'],['成长','女性成长'],['数码','科技数码'],['手机','科技数码'],['科技','科技数码'],['商业','商业'],['创业','商业'],['理财','商业']];
  for(const [k,v] of map) if(t.includes(k)) return v;
  return 'AI';
}
function intelFallback(){
  const base=[
    ['AI','ChatGPT 发布新多模态能力，生产力再升级','量子位'],
    ['AI','国内大模型开放平台免费额度上调','机器之心'],
    ['自媒体','小红书推出视频图文混排新玩法','新榜'],
    ['自媒体','知识付费博主涨粉方法论盘点','人人都是产品经理'],
    ['女性成长','女性职场晋升论坛年度峰会开幕','LinkedIn'],
    ['女性成长','独居女性理财与安全感话题升温','三联生活周刊'],
    ['科技数码','折叠屏手机出货量同比增长明显','爱范儿'],
    ['科技数码','智能穿戴设备新增健康监测功能','极客公园'],
    ['商业','消费降级下性价比品牌逆势增长','36氪'],
    ['商业','私域运营成为中小品牌标配','见实']
  ];
  return base.map(([cat,title,src])=>({id:uid(),title,src,cat,date:todayKey(),url:'',saved:false}));
}
async function refreshIntel(){
  try{
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),4500);
    const r=await fetch('https://uapis.cn/api/v1/misc/hotboard?type=douyin',{signal:ctrl.signal});
    clearTimeout(to);
    let items=null;
    if(r.ok){
      const j=await r.json();
      const arr=(j&&j.data)||(j&&j.list)||(Array.isArray(j)?j:null);
      if(Array.isArray(arr)&&arr.length){
        items=arr.slice(0,12).map(it=>({
          id:uid(),title:it.title||it.word||('热点'+(Math.random()*99|0+1)),
          src:it.src||it.source||'联网',cat:pickCat(it.title||it.word||''),date:todayKey(),url:it.url||'',saved:false
        }));
      }
    }
    if(items) S.intel.items=items; else S.intel.items=intelFallback();
    S.intel.lastFetch=Date.now();save();renderModule();toast('情报已更新 📡');
  }catch(e){
    if(!S.intel.items||!S.intel.items.length){ S.intel.items=intelFallback(); S.intel.lastFetch=Date.now(); save(); }
    renderModule();toast('联网失败，展示本地示例情报');
  }
}
function renderIntel(){
  const it=S.intel;
  const subs=[
    {key:'news',label:'每日要闻',emoji:'📺'},
    {key:'radar',label:'情报雷达',emoji:'🌐'},
    {key:'channel',label:'行业频道',emoji:'📡'},
    {key:'fav',label:'我的收藏',emoji:'⭐'},
  ];
  const tabs=subs.map(s=>`<button class="intel-tab ${it.sub===s.key?'on':''}" data-act="sub-tab" data-mod="intel" data-sub="${s.key}">${s.emoji} ${s.label}</button>`).join('');
  let body='';
  if(it.sub==='news') body=renderIntelNews();
  else if(it.sub==='radar') body=renderIntelRadar();
  else if(it.sub==='channel') body=renderIntelChannel();
  else body=renderIntelFav();
  return `<div class="card intel-wrap">
    ${header('intel','行业情报')}
    <div class="intel-subtabs">${tabs}</div>
    ${body}
  </div>`;
}
/* 每日要闻 */
function renderIntelNews(){
  const it=S.intel;
  const ns=it.newsSub||'today';
  const innerTabs=[{key:'today',label:'今日看点'},{key:'note',label:'要闻摘记'}]
    .map(t=>`<button class="intel-tab ${ns===t.key?'on':''}" data-act="intel-news-tab" data-sub="${t.key}">${t.label}</button>`).join('');
  let content='';
  if(ns==='today'){
    const now=new Date();
    const dateStr=`${now.getMonth()+1}月${now.getDate()}日 · ${WEEK[now.getDay()]}`;
    const streak=it.readStreak||0;
    const mediaCards=(it.medias||[]).map(m=>{
      const links=(m.links||[]).map(l=>`<button class="intel-link-btn" data-act="intel-link" data-url="${esc(l.url)}">${esc(l.label)}</button>`).join('');
      return `<div class="intel-media-card intel-bar-red" style="--bar-color:${m.color||'#FF1744'}">
        <div class="intel-media-head">
          <span class="intel-media-emoji">${m.emoji||'📺'}</span>
          <div class="intel-media-info">
            <div class="intel-media-name">${esc(m.name)}</div>
            <div class="intel-media-desc">${esc(m.desc||'')}</div>
          </div>
        </div>
        <div class="intel-media-links">${links}</div>
      </div>`;
    }).join('');
    content=`<div class="intel-date-card">
        <div class="intel-date-text">📅 ${esc(dateStr)}</div>
        <div class="intel-date-sub">花10分钟了解今天的世界吧</div>
        <div class="intel-streak-row"><span class="intel-streak-badge">🔥 连续读报 ${streak} 天</span></div>
        <button class="intel-cta" data-act="intel-news-checkin">📖 今日新闻看完了，打卡！</button>
      </div>
      <div class="intel-section-title">权威官媒直通车</div>
      <div class="intel-card-grid">${mediaCards}</div>`;
  }else{
    content=`<div class="intel-note-wrap">
      <div class="muted" style="margin-bottom:8px">📝 记录今天的重要新闻要点，方便日后回顾</div>
      <textarea class="inp intel-note-area" data-act="intel-news-note" placeholder="今天有什么值得记住的新闻？">${esc(it.newsNote||'')}</textarea>
    </div>`;
  }
  return `<div class="intel-head">📺 每日要闻 / 央视·官媒权威新闻 · 每日读报打卡</div>
    <div class="intel-subtabs intel-subtabs-inner">${innerTabs}</div>
    ${content}`;
}
/* 情报雷达 */
function renderIntelRadar(){
  const it=S.intel;
  const rs=it.radarSub||'feed';
  const innerTabs=[{key:'feed',label:'📡 情报雷达'},{key:'fav',label:'⭐ 我的收藏'}]
    .map(t=>`<button class="intel-tab ${rs===t.key?'on':''}" data-act="intel-radar-tab" data-sub="${t.key}">${t.label}</button>`).join('');
  let content='';
  if(rs==='feed'){
    const cards=(it.consultancies||[]).map(c=>{
      const links=(c.links||[]).map(l=>`<button class="intel-link-btn" data-act="intel-link" data-url="${esc(l.url)}">${esc(l.label)}</button>`).join('');
      return `<div class="intel-media-card intel-bar-blue" style="--bar-color:${c.color||'#4A90E2'}">
        <div class="intel-media-head">
          <span class="intel-media-emoji">${c.emoji||'📘'}</span>
          <div class="intel-media-info">
            <div class="intel-media-name">${esc(c.name)}</div>
            <div class="intel-media-desc">${esc(c.desc||'')}</div>
          </div>
        </div>
        <div class="intel-media-links">${links}</div>
        ${c.mp?`<div class="intel-media-mp">💬 公众号：${esc(c.mp)}</div>`:''}
      </div>`;
    }).join('');
    content=`<div class="intel-tip-purple">🧭 还没定行业？没关系<br>每天挑 1-2 个频道逛 10 分钟，看到有感觉的文章点 ⭐ 存进收藏夹并打上行业标签——一个月后打开收藏夹，你收藏最多的那个行业，就是你的答案。</div>
      <div class="intel-section-title">👑 三大咨询直通车</div>
      <div class="intel-card-grid">${cards}</div>`;
  }else{
    content=renderIntelFavList(true);
  }
  return `<div class="intel-head intel-head-purple">🌐 行业情报 / 全球行业最新动态 · 三大咨询洞察 · 情报收藏</div>
    <div class="intel-subtabs intel-subtabs-inner">${innerTabs}</div>
    ${content}`;
}
/* 行业频道 */
function renderIntelChannel(){
  const it=S.intel;
  const grid=(it.industries||[]).map(ind=>`
    <button class="intel-channel" data-act="intel-channel-open" data-id="${esc(ind.id)}">
      <span class="intel-channel-icon" style="background:${ind.color||'#FFE4EC'}">${ind.emoji||'📡'}</span>
      <span class="intel-channel-name">${esc(ind.name)}</span>
    </button>`).join('');
  return `<div class="intel-head">📡 行业频道 / 点开查看权威信息源</div>
    <div class="intel-channel-grid">${grid}</div>`;
}
/* 我的收藏（顶部 tab） */
function renderIntelFav(){
  const it=S.intel;
  const tags=['全部','科技·AI','金融·投资','消费·零售','医疗·健康','能源·碳中和','汽车·出行','文娱·传媒','宏观·智库'];
  const filter=it.favFilter||'全部';
  const chips=tags.map(t=>`<button class="chip ${filter===t?'on':''}" data-act="intel-fav-filter" data-v="${esc(t)}">${esc(t)}</button>`).join('');
  return `<div class="intel-head">⭐ 我的收藏 / 行业情报收藏夹</div>
    <div class="chip-row" style="margin-bottom:12px">${chips}</div>
    ${renderIntelFavList(false)}`;
}
/* 收藏列表渲染（radar 内嵌和独立 tab 共用） */
function renderIntelFavList(innerMode){
  const it=S.intel;
  const saved=it.saved||[];
  const filter=it.favFilter||'全部';
  const filtered=filter==='全部'?saved:saved.filter(x=>x.tag===filter);
  if(!filtered.length){
    return `<div class="intel-empty">${innerMode?'还没有收藏～去情报雷达看看吧':'还没有收藏～点击情报雷达或行业频道中的「⭐」按钮，把喜欢的文章收藏起来'}</div>`;
  }
  return `<div class="intel-fav-list">${filtered.map(x=>`
    <div class="intel-fav-item">
      <div class="intel-fav-title">${esc(x.title||'未命名')}</div>
      <div class="intel-fav-meta">
        ${x.tag?`<span class="tag">${esc(x.tag)}</span>`:''}
        <span class="muted">${esc(x.src||'')}</span>
        ${x.savedAt?`<span class="muted">${new Date(x.savedAt).toLocaleDateString('zh-CN')}</span>`:''}
      </div>
      <div class="intel-fav-actions">
        ${x.url?`<button class="intel-link-btn" data-act="intel-link" data-url="${esc(x.url)}">🔗 跳转</button>`:''}
        <button class="btn danger sm" data-act="intel-save-del" data-id="${esc(x.id)}">删除</button>
      </div>
    </div>`).join('')}</div>`;
}
/* 行业抽屉 */
function openIndustryDrawer(indId){
  const ind=(S.intel.industries||[]).find(x=>x.id===indId);
  if(!ind)return;
  const rows=(ind.sources||[]).map(s=>`
    <div class="intel-source-item intel-bar-teal">
      <span class="intel-source-dot">🟢</span>
      <span class="intel-source-name">${esc(s.name)}</span>
      <button class="intel-go-btn" data-act="intel-link" data-url="${esc(s.url)}">去看看</button>
    </div>`).join('');
  openModal(`<span style="color:var(--teal,#26A69A)">${ind.emoji||'📡'} ${esc(ind.name)} / 权威信息源</span>`,
    `<div class="intel-source-list">${rows}</div>`,
    `<button class="btn ghost" data-act="modal-cancel">关闭</button><button class="btn" data-act="intel-save-open">⭐ 存一条到收藏夹</button>`,
    (mb,mf)=>{
      mf.querySelector('[data-act=intel-save-open]').onclick=()=>{ closeModal(); openIntelSaveModal(); };
    }
  );
}
/* 收藏弹窗 */
function openIntelSaveModal(){
  const tags=['科技·AI','金融·投资','消费·零售','医疗·健康','能源·碳中和','汽车·出行','文娱·传媒','宏观·智库'];
  openModal('⭐ 存到收藏夹',`
    <div class="muted">标题</div><input class="inp" id="isTitle" placeholder="文章标题">
    <div class="muted" style="margin-top:8px">来源</div><input class="inp" id="isSrc" placeholder="如 麦肯锡 / 机器之心">
    <div class="muted" style="margin-top:8px">链接 URL</div><input class="inp" id="isUrl" placeholder="https://...">
    <div class="muted" style="margin-top:8px">行业标签</div>
    <select class="inp" id="isTag">${tags.map(t=>`<option value="${t}">${t}</option>`).join('')}</select>
  `,`<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="intel-save-confirm">保存</button>`,
  ()=>{
    $('#modalFoot').querySelector('[data-act=intel-save-confirm]').onclick=()=>{
      const rec={id:uid(),title:$('#isTitle').value||'未命名',src:$('#isSrc').value||'',url:$('#isUrl').value||'',tag:$('#isTag').value,savedAt:Date.now()};
      S.intel.saved=S.intel.saved||[]; S.intel.saved.unshift(rec); save();
      closeModal(); renderModule(); toast('已存入收藏夹 ⭐');
    };
  });
}

/* ============================================================
   D. 理财（finance）
   ============================================================ */
function openAssetModal(editId,isLiab){
  const f=S.finance;
  const arr=isLiab?f.liabilities:f.assets;
  const a=editId?arr.find(x=>x.id===editId):null;
  const types=['现金','存款','基金','股票','房产','其他'];
  openModal(kitty('#c9a3ff',26)+(a?' 编辑':' 新增')+(isLiab?'负债':'资产'),`
    <div class="row">
      <div style="flex:1"><div class="muted">名称</div><input class="inp" id="faName" placeholder="如 余额宝" value="${esc(a?a.name:'')}"></div>
      <div style="flex:1"><div class="muted">金额</div><input class="inp" id="faVal" type="number" placeholder="0" value="${a?a.value:''}"></div>
    </div>
    ${isLiab?'':`<div class="muted" style="margin-top:10px">类型</div><select class="inp" id="faType">${types.map(t=>`<option value="${t}" ${a&&a.type===t?'selected':''}>${t}</option>`).join('')}</select>`}
  `,`<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="fa-save">保存</button>`,
  ()=>{
    $('#modalFoot').querySelector('[data-act=fa-save]').onclick=()=>{
      const name=$('#faName').value||(isLiab?'负债':'资产');
      const val=parseFloat($('#faVal').value)||0;
      const rec=a?a:{id:uid()};
      rec.name=name;rec.value=val;
      if(!isLiab) rec.type=$('#faType').value;
      if(!a) arr.push(rec);
      save();closeModal();renderModule();
    };
  });
}
function openSaveModal(editId){
  const f=S.finance;
  const s=editId?f.savings.find(x=>x.id===editId):null;
  openModal(kitty('#c9a3ff',26)+(s?' 编辑存钱目标':' 新增存钱目标'),`
    <div class="row">
      <div style="flex:1"><div class="muted">目标名</div><input class="inp" id="fsName" placeholder="如 旅行基金" value="${esc(s?s.name:'')}"></div>
      <div style="flex:1"><div class="muted">目标金额</div><input class="inp" id="fsTarget" type="number" value="${s?s.target:''}"></div>
    </div>
    <div class="row" style="margin-top:10px">
      <div style="flex:1"><div class="muted">已存</div><input class="inp" id="fsCurrent" type="number" value="${s?s.current:0}"></div>
      <div style="flex:1"><div class="muted">截止日</div><input class="inp" id="fsDeadline" type="date" value="${esc(s?s.deadline:'')}"></div>
    </div>
  `,`<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="fs-save">保存</button>`,
  ()=>{
    $('#modalFoot').querySelector('[data-act=fs-save]').onclick=()=>{
      const rec=s?s:{id:uid(),done:false};
      rec.name=$('#fsName').value||'存钱目标';
      rec.target=parseFloat($('#fsTarget').value)||0;
      rec.current=parseFloat($('#fsCurrent').value)||0;
      rec.deadline=$('#fsDeadline').value;
      rec.done=Number(rec.current)>=Number(rec.target)&&Number(rec.target)>0;
      if(!s) f.savings.push(rec);
      save();closeModal();renderModule();
    };
  });
}
function renderFinance(){
  const f=S.finance;
  const totalAsset=f.assets.reduce((s,a)=>s+Number(a.value||0),0);
  const totalLiab=f.liabilities.reduce((s,a)=>s+Number(a.value||0),0);
  const net=totalAsset-totalLiab;
  const byType={};
  f.assets.forEach(a=>{const t=a.type||'其他';byType[t]=(byType[t]||0)+Number(a.value||0);});
  const pieSegs=Object.keys(byType).map((t,i)=>({label:t,value:byType[t],color:FIN_COLORS[i%FIN_COLORS.length]}));
  const savesHTML=f.savings.length?f.savings.map(s=>{
    const pct=clamp(Math.round(Number(s.current||0)/Number(s.target||1)*100),0,100);
    return `<div class="save-card ${s.done?'done':''}">
      <div class="save-head"><strong>${esc(s.name)}</strong>${s.deadline?`<span class="muted">🎯 ${esc(s.deadline)}</span>`:''}</div>
      <div class="save-bar"><div class="save-bar-fill" style="width:${pct}%"></div></div>
      <div class="muted" style="font-size:12px">¥${money(s.current)} / ¥${money(s.target)} · ${pct}%</div>
      <div class="li-actions">
        <button class="btn ghost sm" data-act="fin-save-deposit" data-id="${s.id}">存入</button>
        <button class="btn ghost sm" data-act="fin-save-edit" data-id="${s.id}">编辑</button>
        <button class="btn danger sm" data-act="fin-save-del" data-id="${s.id}">删</button>
      </div>
    </div>`;
  }).join(''):'<div class="empty">还没有存钱目标，定一个吧~</div>';
  return `<div class="card">
    ${header('finance','我的理财')}
    <div class="fin-net">净资产 <b>¥${money(net)}</b></div>
    <div class="stat-grid">
      <div class="stat income"><div class="label">总资产</div><div class="val">¥${money(totalAsset)}</div></div>
      <div class="stat expense"><div class="label">总负债</div><div class="val">¥${money(totalLiab)}</div></div>
    </div>
    <div class="sub-title">资产分布</div>
    <div class="pie-wrap">${svgPie(pieSegs)}<div class="pie-legend">${pieSegs.map(s=>`<span class="pie-leg"><i style="background:${s.color}"></i>${esc(s.label)} ¥${money(s.value)}</span>`).join('')}</div></div>
    <div class="sub-title">资产 <button class="btn sm" data-act="fin-asset-add" style="float:right">+ 资产</button></div>
    <div class="fin-list">${f.assets.length?f.assets.map(a=>`
      <div class="list-item">
        <div class="li-main"><div style="display:flex;justify-content:space-between"><strong>${esc(a.name)}</strong><span style="font-weight:800;color:var(--purple-d)">¥${money(a.value)}</span></div>
        <div class="muted" style="font-size:12px">${esc(a.type)}</div></div>
        <div class="li-actions"><button class="btn ghost sm" data-act="fin-asset-edit" data-id="${a.id}">编辑</button><button class="btn danger sm" data-act="fin-asset-del" data-id="${a.id}">删</button></div>
      </div>`).join(''):'<div class="muted">暂无资产记录</div>'}</div>
    <div class="sub-title">负债 <button class="btn sm" data-act="fin-liab-add" style="float:right">+ 负债</button></div>
    <div class="fin-list">${f.liabilities.length?f.liabilities.map(a=>`
      <div class="list-item">
        <div class="li-main"><div style="display:flex;justify-content:space-between"><strong>${esc(a.name)}</strong><span style="font-weight:800;color:#ff6f91">¥${money(a.value)}</span></div></div>
        <div class="li-actions"><button class="btn ghost sm" data-act="fin-liab-edit" data-id="${a.id}">编辑</button><button class="btn danger sm" data-act="fin-liab-del" data-id="${a.id}">删</button></div>
      </div>`).join(''):'<div class="muted">暂无负债记录</div>'}</div>
    <div class="sub-title">存钱目标 <button class="btn sm" data-act="fin-save-add" style="float:right">+ 目标</button></div>
    <div class="save-list">${savesHTML}</div>
  </div>`;
}

/* ---------- 1. 今日心情 ---------- */
function moodText(status,score){
  if(status==='tired'){
    const arr=['今天辛苦啦，给自己一个温柔的抱抱，明天会更好~','累了就歇一歇，你已经做得很好了。','慢一点也没关系，治愈从接纳疲惫开始。','允许自己今天懒洋洋，能量正在悄悄回血。'];
    return arr[score%arr.length];
  }
  const arr=['元气满满的你最闪耀，继续保持这份好状态！','生活明朗，万物可爱，今天也是被偏爱的一天~','微笑是最好的滤镜，你笑起来真好看。','带着好心情出发，好事正在赶来的路上。'];
  return arr[score%arr.length];
}
/* 优先用表情对应的文案，兼容旧数据（仅 status/score） */
function moodPhrase(rec){
  if(rec.emoji && MOOD_PHRASES[rec.emoji]) return MOOD_PHRASES[rec.emoji];
  return moodText(rec.status, rec.score);
}
function renderMood(){
  const k=todayKey();
  let rec=S.mood.history.find(h=>h.date===k)||{date:k,score:7,status:'happy',emoji:'happy'};
  const selEmoji = rec.emoji && EMOJIS_MAP[rec.emoji] ? rec.emoji : (rec.status==='tired'?'tired':'happy');
  const heroIcon = (EMOJIS_MAP[selEmoji]||EMOJIS[0]).icon;
  return `
  <div class="card mood-hero">
    <div class="mood-hero-top">
      <div class="mood-hero-emoji" id="moodHeroEmoji">${heroIcon}</div>
      <div class="mood-hero-info">
        <div class="mood-hero-title">心情记录</div>
        <div class="muted">写下今天的心情，照顾好内心</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="sub-title">今天感觉如何？</div>
    <div class="mood-emoji-row">
      ${EMOJIS.map(e=>`<button class="mood-emoji-btn ${selEmoji===e.key?'on':''}" data-act="mood-emoji" data-v="${e.key}" title="${e.label}">
        <span class="me-ico">${e.icon}</span><span class="me-label">${e.label}</span>
      </button>`).join('')}
    </div>
    <div class="mood-text-box" id="moodText">${esc(moodPhrase(rec))}</div>

    <div class="sub-title">今天的小记</div>
    <textarea class="txtarea" id="moodNote" data-act="mood-note" placeholder="写点什么吧，记录此刻的自己…">${esc(rec.note||'')}</textarea>

    <div class="sub-title">拍张照片（可选）</div>
    <div class="media-zone" data-act="mood-photo-zone" style="padding:14px">
      <div class="media-drop-hint">📷 点击上传今天的一张照片</div>
    </div>
    <input type="file" id="moodPhotoInput" accept="image/*" hidden data-act="mood-photo-input">
    <div id="moodPhotoPrev">${rec.photo?`<img src="${rec.photo}" style="max-width:160px;border-radius:12px"><button class="btn danger sm" data-act="mood-photo-del">移除</button>`:''}</div>

    <button class="btn block" data-act="mood-save" style="margin-top:18px">保存心情</button>

    <div style="margin-top:16px">
      <button class="btn ghost sm" data-act="mood-history">历史心情记录（近7天）</button>
      <div id="moodHist" hidden style="margin-top:12px"></div>
    </div>
  </div>`;
}

/* ---------- 2. 工作日程 ---------- */
let calView='month', calY=new Date().getFullYear(), calM=new Date().getMonth();
let selDate=todayKey(), evColor='#ff6fa0';
const EV_COLORS=['#333','#e74c3c','#9b59b6','#3498db','#2ecc71','#e67e22'];
function renderSchedule(){
  if(calView==='year') return renderYear();
  return renderMonth();
}
function renderMonth(){
  const first=new Date(calY,calM,1).getDay();
  const days=MONTH_DAYS[calM]+(calM===1 && (calY%4===0&&calY%100!==0||calY%400===0)?1:0);
  let cells='';
  for(let i=0;i<first;i++) cells+=`<div></div>`;
  for(let d=1;d<=days;d++){
    const key=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const evs=S.schedule.events[key]||[];
    const evhtml=evs.map(e=>`<div class="ev"><span class="dot" style="background:${e.color}"></span>${esc(e.text)}</div>`).join('');
    const cls=`cal-cell ${key===todayKey()?'today':''} ${key===selDate?'sel':''}`;
    cells+=`<div class="${cls}" data-act="cal-pick" data-k="${key}">
      <div class="dnum">${d}</div>${evhtml}</div>`;
  }
  const mk=`${calY}-${String(calM+1).padStart(2,'0')}`;
  const goals=(S.schedule.goals[mk]||[]);
  return `<div class="card">
    ${header('schedule','工作日程',`<span class="tabs" style="margin-left:auto"><span class="chip active" data-act="cal-view" data-v="month">月视图</span><span class="chip" data-act="cal-view" data-v="year">年视图</span></span>`)}
    <div class="cal-head">
      <div class="cal-nav">
        <button data-act="cal-prev">‹</button>
        <span style="font-weight:800;font-size:17px;color:var(--purple-d)">${calY}年 ${calM+1}月</span>
        <button data-act="cal-next">›</button>
      </div>
      <div class="color-pick" id="colorPick">
        ${EV_COLORS.map(c=>`<span class="cw ${c===evColor?'on':''}" style="background:${c}" data-act="ev-color" data-c="${c}"></span>`).join('')}
      </div>
    </div>
    <div class="cal-grid">
      ${['日','一','二','三','四','五','六'].map(w=>`<div class="cal-dow">${w}</div>`).join('')}
      ${cells}
    </div>
    <div style="margin-top:18px" id="dayPanel">
      ${selDate?dayPanel(selDate):''}
    </div>
    <div style="margin-top:22px">
      <div class="sub-title">本月核心目标</div>
      <div id="goalList">
        ${goals.map((g,i)=>`
          <div class="list-item">
            <span class="check ${g.done?'on':''}" data-act="goal-toggle" data-i="${i}"></span>
            <div class="li-main"><input class="inp" value="${esc(g.text)}" data-act="goal-text" data-i="${i}"></div>
            <div class="li-actions"><button class="btn danger sm" data-act="goal-del" data-i="${i}">删</button></div>
          </div>`).join('')||'<div class="muted">还没有核心目标，点下方按钮添加。</div>'}
      </div>
      <button class="btn ghost sm" style="margin-top:8px" data-act="goal-add">+ 添加核心目标</button>
    </div>
  </div>`;
}
function dayPanel(k){
  const evs=S.schedule.events[k]||[];
  return `<div class="stat" style="background:var(--card-soft)">
    <div class="label">${k} 的日程 / 待办</div>
    <div id="evList" style="margin-top:8px">
      ${evs.map((e,i)=>`
        <div class="list-item">
          <span class="dot" style="background:${e.color};margin-top:8px"></span>
          <div class="li-main"><input class="inp" value="${esc(e.text)}" data-act="ev-text" data-i="${i}"></div>
          <div class="li-actions"><button class="btn danger sm" data-act="ev-del" data-i="${i}">删</button></div>
        </div>`).join('')||'<div class="muted">暂无安排。</div>'}
    </div>
    <input class="inp" style="margin-top:8px" placeholder="添加 ${k} 的待办 / 日程，回车保存" data-act="ev-add">
  </div>`;
}
function renderYear(){
  const y=calY;
  let cells='';
  for(let m=0;m<12;m++){
    const mk=`${y}-${String(m+1).padStart(2,'0')}`;
    let cnt=0;Object.keys(S.schedule.events).forEach(k=>{if(k.slice(0,7)===mk)cnt+=S.schedule.events[k].length;});
    const rt=S.schedule.ratings[mk]||{};
    cells+=`<div class="year-cell" data-act="year-pick" data-m="${m}">
      <div class="ym">${m+1}月</div>
      <div class="yc">日程 ${cnt} 条</div>
      <div class="yc">完成度 ${rt.percent!=null?rt.percent+'%':'—'}</div>
    </div>`;
  }
  return `<div class="card">
    ${header('schedule','工作日程',`<span class="tabs" style="margin-left:auto"><span class="chip" data-act="cal-view" data-v="month">月视图</span><span class="chip active" data-act="cal-view" data-v="year">年视图</span></span>`)}
    <div class="cal-head">
      <div class="cal-nav">
        <button data-act="cal-prev">‹</button>
        <span style="font-weight:800;font-size:17px;color:var(--purple-d)">${y} 年</span>
        <button data-act="cal-next">›</button>
      </div>
    </div>
    <div class="year-grid">${cells}</div>
    <div style="margin-top:22px">
      <div class="sub-title">年度总目标</div>
      <textarea class="txtarea" data-act="year-goal" placeholder="写下你这一年的核心规划…">${esc(S.schedule.yearlyGoal)}</textarea>
    </div>
    <div style="margin-top:18px">
      <div class="sub-title">月度完成度</div>
      <div class="stat-grid">
        ${Array.from({length:12},(_,m)=>{
          const mk=`${y}-${String(m+1).padStart(2,'0')}`;
          const rt=S.schedule.ratings[mk]||{};
          return `<div class="stat">
            <div class="label">${m+1}月</div>
            <div class="stars" data-act="year-star" data-m="${m}" data-val="${rt.stars||0}">${starHTML(rt.stars||0)}</div>
            <input class="inp sm" style="margin-top:6px" type="number" min="0" max="100" placeholder="完成度%" value="${rt.percent!=null?rt.percent:''}" data-act="year-percent" data-m="${m}">
            <input class="inp sm" style="margin-top:6px" placeholder="月度评价" value="${esc(rt.summary||'')}" data-act="year-summary" data-m="${m}">
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}
function starHTML(n){
  let h='';for(let i=0;i<5;i++) h+=`<span class="s ${i<int(n)?'on':(i+0.5===n?'half':'')}"></span>`;return h;
}

/* ---------- 3. 待办 ---------- */
function renderTodo(){
  return `<div class="card">
    ${header('todo','今日待办清单')}
    <div id="todoList">
      ${S.todos.length?S.todos.map(t=>todoItem(t)).join(''):emptySVG('clip')+'<div class="empty">还没有待办，点右下角 + 添加今天的小目标吧~</div>'}
    </div>
  </div>`;
}
function todoItem(t){
  const pct=int(t.stars*20);
  return `<div class="list-item" data-id="${t.id}">
    <span class="check ${t.done?'on':''}" data-act="todo-toggle" data-id="${t.id}"></span>
    <div class="li-main">
      <input class="inp" value="${esc(t.text)}" data-act="todo-text" data-id="${t.id}" style="${t.done?'text-decoration:line-through;color:var(--text-soft)':''}">
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <span class="stars" data-act="todo-star" data-id="${t.id}" data-val="${t.stars}">${starHTML(t.stars)}</span>
        <span class="muted" data-role="pct">完成度 ${pct}%</span>
      </div>
    </div>
    <div class="li-actions"><button class="btn danger sm" data-act="todo-del" data-id="${t.id}">删</button></div>
  </div>`;
}
function checkAllDone(){
  if(!S.todos.length) return;
  if(S.todos.every(t=>t.stars>=5) && S.luckyShown!==todayKey()){
    S.luckyShown=todayKey();save();showLucky();
  }
}
function showLucky(){
  const L=$('#luckyLayer');
  L.hidden=false;
  L.innerHTML=`<div class="lucky-card">
    ${starSVG('#ffcf5c',120)}
    ${bowSVG('#ff8fb3',44)}
    <h3>全部完成，太棒啦！</h3>
    <p>你今天的待办都达成 100% 完成度，幸运星为你点亮 ✨<br>（可爱提示：本动画今日仅出现一次）</p>
    <button class="btn" data-act="lucky-close">收下幸运</button>
  </div>`;
}

/* ---------- 4. 记账 ---------- */
function renderLedger(){
  const k=todayKey(), mk=k.slice(0,7);
  const inc=S.ledger.filter(r=>r.type==='income'&&r.date===k);
  const exp=S.ledger.filter(r=>r.type==='expense'&&r.date===k);
  const tInc=inc.reduce((s,r)=>s+Number(r.amount),0), tExp=exp.reduce((s,r)=>s+Number(r.amount),0);
  const mInc=S.ledger.filter(r=>r.type==='income'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
  const mExp=S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
  const cats=['饮食','购物','学习','交通','娱乐','居住','其他'];
  // 本月分类支出占比
  const byCat={};cats.forEach(c=>byCat[c]=0);
  S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk).forEach(r=>{
    const c=cats.includes(r.category)?r.category:'其他';
    byCat[c]=(byCat[c]||0)+Number(r.amount||0);
  });
  const pieSegs=cats.map((c,i)=>({label:c,value:byCat[c],color:FIN_COLORS[i%FIN_COLORS.length]})).filter(s=>s.value>0);
  // 近 6 月结余趋势
  const months=[];for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);months.push(monthKey(d));}
  const trend=months.map(mk2=>{
    const inc2=S.ledger.filter(r=>r.type==='income'&&r.date.slice(0,7)===mk2).reduce((s,r)=>s+Number(r.amount),0);
    const exp2=S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk2).reduce((s,r)=>s+Number(r.amount),0);
    return {label:mk2.slice(2), value:Math.round(inc2-exp2)};
  });
  // 存钱目标概览
  const savesHTML=S.finance.savings.length?S.finance.savings.slice(0,6).map(s=>{
    const pct=clamp(Math.round(Number(s.current||0)/Number(s.target||1)*100),0,100);
    return `<div class="list-item">
      <div class="li-main"><div style="display:flex;justify-content:space-between"><strong>${esc(s.name)}</strong><span class="muted">${pct}%</span></div>
      <div class="save-bar"><div class="save-bar-fill" style="width:${pct}%"></div></div></div>
      <div class="li-actions"><button class="btn ghost sm" data-act="ledger-save-deposit" data-id="${s.id}">记一笔存钱</button></div>
    </div>`;
  }).join(''):'<div class="muted">还没有存钱目标，去「理财」板块新建吧~</div>';
  return `<div class="card">
    ${header('ledger','记账本')}
    <div class="sub-title">今日收支</div>
    <div class="stat-grid">
      <div class="stat income"><div class="label">今日收入</div><div class="val" id="ldInc">¥${money(tInc)}</div></div>
      <div class="stat expense"><div class="label">今日支出</div><div class="val" id="ldExp">¥${money(tExp)}</div></div>
      <div class="stat balance"><div class="label">今日结余</div><div class="val" id="ldBal">¥${money(tInc-tExp)}</div></div>
    </div>
    <div class="sub-title">本月累计</div>
    <div class="stat-grid">
      <div class="stat balance"><div class="label">本月结余</div><div class="val" id="lmBal">¥${money(mInc-mExp)}</div></div>
      <div class="stat income"><div class="label">累计收入</div><div class="val" id="lmInc">¥${money(mInc)}</div></div>
      <div class="stat expense"><div class="label">累计支出</div><div class="val" id="lmExp">¥${money(mExp)}</div></div>
    </div>
    <div class="sub-title">最近记录</div>
    <div id="ledgerList">
      ${S.ledger.length?S.ledger.slice().sort((a,b)=>b.date.localeCompare(a.date)|| b.id.localeCompare(a.id)).slice(0,40).map(r=>`
        <div class="list-item">
          <div class="li-main">
            <div style="display:flex;justify-content:space-between">
              <strong>${esc(r.note||r.category||'记录')}</strong>
              <span style="font-weight:800;color:${r.type==='income'?'var(--mint-d)':'var(--purple-d)'}">${r.type==='income'?'+':'-'}¥${money(r.amount)}</span>
            </div>
            <div class="muted" style="margin-top:4px">${r.date} · ${esc(r.category)}</div>
            ${mediaInlineHTML(r)}
          </div>
          <div class="li-actions"><button class="btn ghost sm" data-act="ledger-edit" data-id="${r.id}">编辑</button><button class="btn danger sm" data-act="ledger-del" data-id="${r.id}">删</button></div>
        </div>`).join(''):emptySVG('pencil')+'<div class="empty">还没有记账记录，点 + 记下第一笔吧~</div>'}
    </div>
  </div>
  <div class="card">
    <div class="sub-title">本月分类支出占比</div>
    <div class="pie-wrap">${svgPie(pieSegs)}<div class="pie-legend">${pieSegs.length?pieSegs.map(s=>`<span class="pie-leg"><i style="background:${s.color}"></i>${esc(s.label)} ¥${money(s.value)}</span>`).join(''):'<span class="muted">本月暂无支出</span>'}</div></div>
    <div class="sub-title">近 6 个月结余趋势</div>
    ${svgBars(trend)}
  </div>
  <div class="card">
    <div class="sub-title">存钱目标概览 <a class="muted" style="float:right;cursor:pointer" data-act="nav" data-id="finance">去理财 ›</a></div>
    ${savesHTML}
  </div>`;
}
function emptySVG(kind){
  const c='#f0c9de';
  if(kind==='pencil')return `<div class="empty"><svg viewBox="0 0 64 64"><path d="M44 8l12 12-28 28-16 4 4-16z" fill="#fff" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M40 12l12 12" stroke="${c}" stroke-width="3"/></svg><div>空空如也</div></div>`;
  return `<div class="empty"><svg viewBox="0 0 64 64"><rect x="14" y="14" width="36" height="40" rx="6" fill="#fff" stroke="${c}" stroke-width="3"/><line x1="22" y1="26" x2="42" y2="26" stroke="${c}" stroke-width="3" stroke-linecap="round"/><line x1="22" y1="36" x2="42" y2="36" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg></div>`;
}

/* ---------- 5. 运动 ---------- */
function renderExercise(){
  const ex=S.exercise||(S.exercise={});
  const sub=ex.sub||'today';
  const tabs=[['today','今日'],['pick','选部位'],['week','周计划'],['blogger','博主'],['coach','AI教练']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="exercise" data-sub="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  try{
    if(sub==='pick') body=renderExPick();
    else if(sub==='week') body=renderExWeek();
    else if(sub==='blogger') body=renderExBlogger();
    else if(sub==='coach') body=renderExCoach();
    else body=renderExToday();
  }catch(err){ body='<div class="ex-empty">渲染异常，请切换 tab 重试～</div>'; }
  return `<div class="card">
    ${header('exercise','运动打卡')}
    ${tabHtml}
    ${body}
  </div>`;
}
/* ---- 子 tab：今日 ---- */
function renderExToday(){
  const ex=S.exercise;
  const streak=ex.streak||0;
  const min=ex.todayTrainMin||0;
  const kcal=ex.todayKcalIn||0;
  const acts=ex.todayActions||0;
  const sched=ex.todaySchedule||[];
  const meals=ex.todayMeals||{b:0,l:0,d:0};
  const hr=new Date().getHours();
  const hi=hr<11?'早上好':(hr<14?'中午好':(hr<18?'下午好':'晚上好'));
  const mealTotal=int(meals.b)+int(meals.l)+int(meals.d);
  return `
    <div class="ex-hello-pink">
      <div class="ex-hello-text">${hi}小可爱，今天也要元气满满呦✨</div>
      <div class="ex-hello-streak">🔥 <b>${streak}</b> 天</div>
    </div>
    <div class="ex-stats">
      <div class="ex-stat"><div class="ex-stat-ic">⏱️</div><div class="ex-stat-val">${min}</div><div class="ex-stat-unit">min 今日训练</div></div>
      <div class="ex-stat"><div class="ex-stat-ic">🔥</div><div class="ex-stat-val">${kcal}</div><div class="ex-stat-unit">大卡摄入</div></div>
      <div class="ex-stat"><div class="ex-stat-ic">🏆</div><div class="ex-stat-val">${acts}</div><div class="ex-stat-unit">完成动作</div></div>
    </div>
    <div class="ex-entries">
      <button class="ex-entry" data-act="sub-tab" data-mod="exercise" data-sub="pick"><span class="ex-entry-ic">👟</span><span>开始训练</span></button>
      <button class="ex-entry" data-act="nav" data-id="diet"><span class="ex-entry-ic">🍽️</span><span>记录饮食</span></button>
      <button class="ex-entry" data-act="nav" data-id="schedule"><span class="ex-entry-ic">📅</span><span>日程</span></button>
    </div>
    <div class="ex-card">
      <div class="ex-card-head"><strong>今日日程</strong><button class="ex-mini-btn" data-act="nav" data-id="schedule">管理</button></div>
      ${sched.length?sched.map(s=>`<div class="ex-sched-row"><span>${esc(s.time||'')}</span><span>${esc(s.text||'')}</span></div>`).join(''):'<div class="ex-empty">还没有日程，点击管理添加～</div>'}
    </div>
    <div class="ex-card">
      <div class="ex-card-head"><strong>今日饮食</strong><span class="ex-kcal-badge">${mealTotal} kcal</span></div>
      <div class="ex-meal-row"><span>早餐</span><b>${int(meals.b)} kcal</b></div>
      <div class="ex-meal-row"><span>午餐</span><b>${int(meals.l)} kcal</b></div>
      <div class="ex-meal-row"><span>晚餐</span><b>${int(meals.d)} kcal</b></div>
    </div>`;
}
/* ---- 子 tab：选部位 ---- */
function renderExPick(){
  const ex=S.exercise;
  const parts=ex.parts||[];
  const all=[['胸部','胸'],['背部','背'],['腿部','腿'],['肩部','肩'],['手臂','臂'],['核心','核心'],['臀部','臀'],['全身','全身'],['有氧','有氧']];
  const sel=new Set(parts);
  const grid=all.map(([nm,v])=>`<button class="ex-circle ${sel.has(v)?'sel':''}" data-act="ex-pick-part" data-v="${v}">${nm}</button>`).join('');
  const names=all.filter(([_,v])=>sel.has(v)).map(([nm])=>nm).join('、');
  return `
    <div class="ex-hello-purple">今天练哪里呀？可多选部位，选好后点开始训练 💪</div>
    <div class="ex-circle-grid">${grid}</div>
    <div class="ex-picked">已选：${names||'无'}</div>
    <button class="ex-cta" data-act="ex-start">💪 开始训练</button>`;
}
/* ---- 子 tab：周计划 ---- */
function renderExWeek(){
  const ex=S.exercise;
  const wp=ex.weeklyPlan||{mon:'',tue:'',wed:'',thu:'',fri:'',sat:'',sun:''};
  const done=ex.weeklyDone||0;
  const total=ex.weeklyTotal||0;
  const pct=total?Math.round(done/total*100):0;
  const days=[['mon','周一'],['tue','周二'],['wed','周三'],['thu','周四'],['fri','周五'],['sat','周六'],['sun','周日']];
  const dow=(new Date().getDay()+6)%7;
  const rows=days.map(([k,nm],i)=>{
    const isToday=i===dow;
    const action=wp[k]||'';
    return `<div class="ex-week-row">
      <span class="ex-week-badge">${nm}</span>
      ${isToday?'<span class="ex-week-today">今天</span>':''}
      <span class="ex-week-action">${action?esc(action):'<span class="muted">休息</span>'}</span>
      <button class="ex-week-add" data-act="ex-edit-day" data-day="${k}">+</button>
    </div>`;
  }).join('');
  return `
    <div class="ex-card ex-week-pct">
      <div class="ex-week-pct-val">${pct}%</div>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="muted">已完成 ${done}/${total} 项训练</div>
    </div>
    <div class="ex-hello-purple ex-quick-card">
      <div>周一胸·周二背·周三有氧·周四肩臂·周五腿臀·周六核心·周日休息</div>
      <button class="ex-cta sm" data-act="ex-quick-plan">✨ 生成训练分化周计划</button>
    </div>
    <div class="ex-week-list">${rows}</div>`;
}
/* ---- 子 tab：博主 ---- */
function renderExBlogger(){
  const ex=S.exercise;
  const bloggers=ex.bloggers||[];
  const grid=bloggers.map(b=>`<button class="ex-blogger" data-act="ex-blogger-open" data-id="${b.id}">
      <span class="ex-blogger-av" style="border-color:${b.color||'#FFB6C1'}">${b.avatar?`<img src="${esc(b.avatar)}" alt="">`:'🧘'}</span>
      <span class="ex-blogger-name">${esc(b.name)}</span>
    </button>`).join('')+
    `<button class="ex-blogger" data-act="ex-blog-add">
      <span class="ex-blogger-av add">＋</span>
      <span class="ex-blogger-name">添加</span>
    </button>`;
  const cols=ex.collections||[];
  return `
    <div class="ex-card ex-blog-head">
      <strong>⭐ 明星跟练博主</strong>
      <span class="ex-chip-gray">点头像看合集</span>
    </div>
    <div class="ex-blogger-grid">${grid}</div>
    <div class="ex-card">
      <div class="ex-card-head"><strong>📚 我的跟练合集</strong><button class="ex-mini-btn" data-act="ex-coll-new">新建</button></div>
      ${cols.length?cols.map(c=>`<div class="ex-coll-row"><span>${esc(c.name)}</span><span class="muted">${esc(c.blogger||'')}</span></div>`).join(''):'<div class="ex-empty">还没有合集，点击新建～</div>'}
    </div>
    <div class="ex-card">
      <strong>📊 一周跟练总览</strong>
      <div class="muted" style="margin-top:8px">本周已跟练 0 次，继续加油～</div>
    </div>`;
}
/* ---- 子 tab：AI 教练 ---- */
function renderExCoach(){
  const ex=S.exercise;
  const msgs=ex.coachMsgs||[];
  const quick=['肩颈不舒服','久坐腰酸','想瘦肚子','睡前拉伸','生理期','不想动'];
  const chips=quick.map(q=>`<button class="ex-coach-chip" data-act="ex-coach-quick" data-v="${esc(q)}">${q}</button>`).join('');
  const hist=msgs.map(m=>`<div class="ex-coach-msg ${m.role==='user'?'me':'ai'}">
      <span class="ex-coach-av">${m.role==='user'?'🙂':'🤖'}</span>
      <div class="ex-coach-bubble">${esc(m.text||'')}</div>
    </div>`).join('');
  return `
    <div class="ex-hello-mint">🤖 AI 健身教练 / 哪里不舒服、想练哪里，直接说，我来排跟练 💪</div>
    <div class="ex-coach-chips">${chips}</div>
    <div class="ex-coach-history">
      <div class="ex-coach-msg ai">
        <span class="ex-coach-av">🤖</span>
        <div class="ex-coach-bubble">你好呀！我是你的 AI 教练 💪 有什么不舒服或者想练的部位告诉我，我帮你安排跟练～</div>
      </div>
      ${hist}
    </div>
    <div class="ex-coach-input-wrap">
      <input class="inp ex-coach-input" id="exCoachInput" placeholder="例如：肩颈不舒服..." data-act="ex-coach-input">
      <button class="ex-coach-send" data-act="ex-coach-send">发送</button>
    </div>
    <div class="ex-coach-tip">内置教练离线用 · 后续可接入 Gemini 等真实 AI 接口</div>`;
}
/* ---- AI 教练本地规则回复（不联网） ---- */
function coachReply(text){
  const t=(text||'');
  const rules=[
    {kw:['肩颈','颈椎','脖子'],reply:'肩颈不舒服呀，建议做一组颈椎环绕 + 肩部环绕各 20 次，配合帕梅拉的肩颈放松跟练 5 分钟，动作要慢～'},
    {kw:['腰','久坐'],reply:'久坐腰酸的话，试试猫牛式 10 次 + 婴儿式拉伸 30 秒，可以跟美丽芭蕾的舒展拉伸，注意起身慢一点别闪到腰哦～'},
    {kw:['肚子','瘦腹','马甲线','腹'],reply:'想瘦肚子呀，建议做卷腹 15×3 组 + 登山跑 30 秒×3，可以跟帕梅拉的腹部训练，记得收紧核心别代偿～'},
    {kw:['拉伸','睡前'],reply:'睡前拉伸推荐做一组全身舒展：坐姿前屈 30 秒 + 仰卧扭转各 30 秒，配合欧阳春晓的睡前拉伸跟练，助眠又放松～'},
    {kw:['生理期','姨妈','经期'],reply:'生理期建议做轻柔的舒展，避免倒立和剧烈腹部训练，可以跟周六野的生理期友好拉伸，多休息别勉强～'},
    {kw:['不想动','懒','累'],reply:'不想动也没关系呀，做个 5 分钟躺平拉伸吧，活动一下手脚就好，别有压力，明天再练～'},
  ];
  for(const r of rules){ if(r.kw.some(k=>t.includes(k))) return r.reply; }
  return '收到啦！建议先从 10 分钟轻量跟练开始，选一个你喜欢的博主动起来就好，比完美更重要的是开始 💪';
}
/* ---- 新建跟练合集弹窗（供 content 按钮 & 博主抽屉复用） ---- */
function openCollModal(preBid){
  const preName=preBid?((S.exercise.bloggers||[]).find(b=>b.id===preBid)||{}).name||'':'';
  openModal('新建跟练合集',
    `<div class="muted">合集名称</div><input class="inp" id="exCollName" data-act="ex-coll-name" placeholder="如 帕梅拉 7 天挑战">
     <div class="muted" style="margin-top:8px">关联博主</div><input class="inp" id="exCollBlog" value="${esc(preName)}" placeholder="可选">`,
    `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="ex-coll-save">保存</button>`,
    ()=>{ $('#modalFoot').querySelector('[data-act=ex-coll-save]').onclick=()=>{
      const name=$('#exCollName').value||'新合集';
      const blog=$('#exCollBlog').value||'';
      S.exercise.collections=S.exercise.collections||[];
      S.exercise.collections.push({id:uid(),name,blogger:blog});
      save();closeModal();renderModule();toast('合集已新建 📚');
    }; });
}
/* 运动目标进度实时刷新（不整页重渲染，保持输入框焦点） */
function refreshExGoal(){
  const g=S.exercise.goal||{days:4,burn:300};
  const burnBar=$('#exBurnBar'), burnTxt=$('#exBurnTxt');
  if(burnBar) burnBar.style.width=Math.min(100,Math.round(todayExerciseBurn()/Math.max(1,g.burn)*100))+'%';
  if(burnTxt) burnTxt.textContent=todayExerciseBurn()+' / '+g.burn+' kcal';
  const now=new Date(); const dow=(now.getDay()+6)%7; const wkStart=new Date(now); wkStart.setDate(now.getDate()-dow);
  const wkKeys=new Set(); for(let i=0;i<7;i++){const d=new Date(wkStart); d.setDate(wkStart.getDate()+i); wkKeys.add(todayKey(d));}
  const wkDays=new Set(S.exercise.records.filter(r=>wkKeys.has(r.date)).map(r=>r.date)).size;
  const wkBar=$('#exWkBar'), wkTxt=$('#exWkTxt');
  if(wkBar) wkBar.style.width=Math.min(100,Math.round(wkDays/Math.max(1,g.days)*100))+'%';
  if(wkTxt) wkTxt.textContent=wkDays+' / '+g.days+' 天';
}

/* 本地 fallback 食谱库（联网失败时使用，绝不阻塞 UI） */
const FALLBACK_RECIPES=[
  {title:'凉拌黄瓜',ingr:'黄瓜、蒜、醋、香油',method:'黄瓜拍碎切段，加蒜末、醋、少许香油拌匀冷藏10分钟。',cal:80},
  {title:'番茄炒蛋',ingr:'番茄、鸡蛋、盐、糖',method:'鸡蛋打散炒熟盛出；番茄切块炒出汁，加蛋回锅，盐糖调味。',cal:220},
  {title:'清蒸鲈鱼',ingr:'鲈鱼、姜、葱、酱油',method:'鱼身改刀铺姜，水开蒸8分钟，淋热油与酱油，撒葱。',cal:180},
  {title:'鸡胸蔬菜沙拉',ingr:'鸡胸肉、生菜、小番茄、橄榄油',method:'鸡胸水煮撕条，与蔬菜拌匀，橄榄油黑胡椒调味。',cal:260},
  {title:'燕麦牛奶杯',ingr:'燕麦、牛奶、香蕉',method:'燕麦加牛奶浸泡，铺香蕉片，冷藏过夜即食。',cal:300},
  {title:'蒜蓉西兰花',ingr:'西兰花、蒜、盐',method:'西兰花焯水1分钟，蒜末爆香翻炒，加盐出锅。',cal:110},
  {title:'紫菜蛋花汤',ingr:'紫菜、鸡蛋、葱花',method:'水沸下紫菜，淋蛋液成花，加盐葱花关火。',cal:90},
  {title:'香煎豆腐',ingr:'豆腐、生抽、葱',method:'豆腐切块煎至金黄，生抽葱段焖1分钟收汁。',cal:200},
];
/* AI 食谱：优先联网探测，任何失败都走本地 fallback；标注可消耗的冰箱食材 */
function dietAIRecipe(){
  const box=$('#dietRecipeBox');
  if(box) box.innerHTML='<div class="muted">🤖 正在根据冰箱生成食谱…</div>';
  const fridge=(S.diet.fridge||[]).map(x=>x.name).filter(Boolean);
  (async()=>{
    let recipes=FALLBACK_RECIPES;
    try{
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),4000);
      await fetch('https://uapis.cn/api/v1/misc/hotboard?type=douyin',{signal:ctrl.signal}); // 仅作联网可用性探测
      clearTimeout(timer);
    }catch(e){ /* 联网失败，仍用本地库 */ }
    const html=recipes.map(r=>{
      const used=fridge.filter(n=>n&&r.ingr.includes(n));
      const usedHtml=used.length?`<div class="recipe-used">🧊 可消耗冰箱食材：${used.map(u=>esc(u)).join('、')}</div>`:'';
      return `<div class="recipe-card">
        <div class="recipe-title">${esc(r.title)} <span class="recipe-cal">约 ${r.cal} kcal</span></div>
        <div class="recipe-ingr"><b>食材：</b>${esc(r.ingr)}</div>
        <div class="recipe-method"><b>做法：</b>${esc(r.method)}</div>
        ${usedHtml}
        <div class="recipe-acts">
          <button class="btn ghost sm" data-act="diet-recipe-add" data-cal="${r.cal}" data-m="l">加入午餐</button>
          <button class="btn ghost sm" data-act="diet-recipe-fav" data-title="${esc(r.title)}" data-ingr="${esc(r.ingr)}" data-method="${esc(r.method)}" data-cal="${r.cal}">收藏</button>
        </div>
      </div>`;
    }).join('');
    if(box) box.innerHTML=html||'<div class="muted">暂无食谱。</div>';
  })();
}

/* ---------- 6. 饮食 ---------- */
function renderDiet(){
  const k=todayKey();
  const d=S.diet.days[k]||{};
  const nutri=d.nutri||{p:0,c:0,f:0};
  const cups=(S.diet.waterDate===k)?Number(S.diet.water||0):0;
  const waterGoal=8;
  const waterPct=Math.min(100,Math.round(cups/waterGoal*100));
  const cats=['蔬菜','肉蛋','水果','主食','调味','其他'];
  const fridge=S.diet.fridge||[];
  const fridgeGroups=cats.map(cat=>{
    const items=fridge.filter(x=>x.cat===cat);
    if(!items.length) return '';
    return `<div class="fridge-group"><div class="fridge-cat">${cat}</div>${items.map(it=>`
      <div class="list-item">
        <div class="li-main">
          <input class="inp sm" data-act="diet-fridge-text" data-id="${it.id}" data-f="name" value="${esc(it.name)}" placeholder="食材名">
          <div class="row" style="gap:8px;margin-top:6px">
            <select class="inp sm" data-act="diet-fridge-cat" data-id="${it.id}">${cats.map(c=>`<option value="${c}" ${c===it.cat?'selected':''}>${c}</option>`).join('')}</select>
            <input class="inp sm" style="width:96px" data-act="diet-fridge-text" data-id="${it.id}" data-f="qty" value="${esc(it.qty)}" placeholder="数量/份">
            <input class="inp sm" style="width:142px" type="date" data-act="diet-fridge-text" data-id="${it.id}" data-f="expire" value="${esc(it.expire||'')}">
          </div>
        </div>
        <div class="li-actions"><button class="btn danger sm" data-act="diet-fridge-del" data-id="${it.id}">删</button></div>
      </div>`).join('')}</div>`;
  }).join('');
  return `<div class="card">
    ${header('diet','饮食')}
    <div class="stat"><div class="label">今日基础代谢参考值(与运动联动)</div><div class="val" id="dietBmr">${getBMR()}</div><div class="unit">kcal</div></div>
    <div class="sub-title">三餐摄入</div>
    <div class="stat-grid">
      <div class="stat"><div class="label">早餐</div><input class="inp" type="number" data-act="meal" data-m="b" value="${esc(d.b||'')}" placeholder="热量 kcal"></div>
      <div class="stat"><div class="label">午餐</div><input class="inp" type="number" data-act="meal" data-m="l" value="${esc(d.l||'')}" placeholder="热量 kcal"></div>
      <div class="stat"><div class="label">晚餐</div><input class="inp" type="number" data-act="meal" data-m="d" value="${esc(d.d||'')}" placeholder="热量 kcal"></div>
    </div>
    <div class="stat" style="margin-top:14px"><div class="label">今日总摄入(自动)</div><div class="val">${todayIntake()} kcal</div></div>
    <div class="stat" style="margin-top:14px;background:linear-gradient(135deg,#fff0f7,#f3ecff)">
      <div class="label">当日热量缺口（基础代谢+运动消耗-总摄入）</div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:6px">
        <div class="val" id="gapVal" style="color:var(--pink-d)">${calorieGap()}</div>
        <span class="tag" id="gapTag"></span>
      </div>
    </div>
    <div class="sub-title">营养目标（可选）</div>
    <div class="row" style="gap:10px">
      <div style="flex:1"><div class="muted">蛋白(g)</div><input class="inp" type="number" data-act="diet-nutri" data-f="p" value="${esc(nutri.p||'')}" placeholder="0"></div>
      <div style="flex:1"><div class="muted">碳水(g)</div><input class="inp" type="number" data-act="diet-nutri" data-f="c" value="${esc(nutri.c||'')}" placeholder="0"></div>
      <div style="flex:1"><div class="muted">脂肪(g)</div><input class="inp" type="number" data-act="diet-nutri" data-f="f" value="${esc(nutri.f||'')}" placeholder="0"></div>
    </div>
    <div class="sub-title">饮水记录</div>
    <div class="water-box">
      <div class="water-ring" style="background:conic-gradient(var(--mint) ${waterPct}%, var(--line) 0)">
        <div class="water-ring-in"><div class="water-pct">${cups}/${waterGoal}</div><div class="water-sub">杯</div></div>
      </div>
      <div class="water-ctrl">
        <button class="btn" data-act="diet-water" data-d="-1">－</button>
        <button class="btn" data-act="diet-water" data-d="1">＋</button>
      </div>
      <div class="bar" style="flex:1;margin-left:10px"><div class="bar-fill mint" style="width:${waterPct}%"></div></div>
    </div>
    <div class="sub-title">冰箱食材</div>
    <div id="fridgeList">${fridgeGroups||'<div class="muted">冰箱是空的，添加点食材吧~</div>'}</div>
    <button class="btn ghost sm" data-act="diet-fridge-add" style="margin-top:8px">+ 添加食材</button>
    <div class="sub-title">AI 食谱推荐</div>
    <button class="btn" data-act="diet-ai-recipe">🤖 根据冰箱生成食谱</button>
    <div id="dietRecipeBox" style="margin-top:12px"></div>
    ${S.diet.recipesFav&&S.diet.recipesFav.length?`<div class="sub-title">我的收藏食谱 (${S.diet.recipesFav.length})</div>
      <div id="recipeFav">${S.diet.recipesFav.map(r=>`<div class="recipe-card"><div class="recipe-title">⭐ ${esc(r.title)}</div><div class="recipe-ingr">${esc(r.ingr)}</div><div class="recipe-method muted">${esc(r.method||'')}</div></div>`).join('')}</div>`:''}
  </div>`;
}

/* ---------- 7. 自媒体 ---------- */
function renderMedia(){
  const A=curMedia();
  const posts=A.posts.slice().reverse();
  const insp=A.inspiration;
  const accTabs=Object.values(S.media.accounts).map(a=>`
    <button class="acc-tab ${a.id===S.media.activeAccount?'on':''}" data-act="media-switch-acc" data-id="${a.id}">
      ${esc(a.name)} <span class="acc-fans">${int(a.fans)}粉</span>
    </button>`).join('');
  return `<div class="card">
    ${header('media','自媒体')}
    <div class="sub-title">账号切换</div>
    <div class="acc-tabs">
      ${accTabs}
      <button class="acc-tab add" data-act="media-add-acc">+ 新增账号</button>
      ${Object.keys(S.media.accounts).length>1?`<button class="acc-tab del" data-act="media-del-acc" data-id="${S.media.activeAccount}">删除当前</button>`:''}
    </div>
    <div class="sub-title">账号信息（当前：${esc(A.name)}）</div>
    <div class="row">
      <div style="flex:1"><div class="muted">账号名称</div><input class="inp" data-act="acc" data-f="name" value="${esc(A.name)}"></div>
      <div style="flex:1"><div class="muted">当前粉丝量</div><input class="inp" type="number" data-act="acc" data-f="fans" value="${esc(A.fans)}"></div>
      <div style="flex:1"><div class="muted">账号定位</div><input class="inp" data-act="acc" data-f="position" value="${esc(A.position)}"></div>
    </div>
    <div class="sub-title">每日联网选题</div>
    <div id="dailyTopics"><div class="muted">正在联网获取今日热门选题…</div></div>

    <div class="sub-title">发布记录</div>
    <div id="postList">
      ${posts.length?posts.map(p=>postItem(p)).join(''):emptySVG('clip')+'<div class="empty">还没有发布记录。</div>'}
    </div>
    <button class="btn ghost sm" data-act="post-add" style="margin-top:8px">+ 新增发布记录</button>

    <div class="sub-title">选题与灵感库</div>
    <div class="row" style="align-items:flex-start">
      <div style="flex:1">
        <div style="font-weight:800;color:var(--purple-d);margin-bottom:8px">待拍摄选题</div>
        <div id="topicTodo">
          ${A.topics.todo.map(t=>`
            <div class="list-item">
              <span class="check ${t.done?'on':''}" data-act="topic-toggle" data-id="${t.id}"></span>
              <div class="li-main"><input class="inp" value="${esc(t.text)}" data-act="topic-text" data-id="${t.id}"></div>
              <div class="li-actions"><button class="btn danger sm" data-act="topic-del" data-id="${t.id}">删</button></div>
            </div>`).join('')||'<div class="muted">暂无待拍摄选题。</div>'}
        </div>
        <button class="btn ghost sm" data-act="topic-add" style="margin-top:6px">+ 添加选题</button>
        <div style="font-weight:800;color:var(--purple-d);margin:14px 0 8px">已完成选题</div>
        <div id="topicDone">
          ${A.topics.done.map(t=>`<div class="list-item"><span class="ct-kitty">${kitty('#c9a3ff',26)}</span><div class="li-main done-text">${esc(t.text)}</div></div>`).join('')||'<div class="muted">勾选上方选题即可归档到这里。</div>'}
        </div>
      </div>
      <div style="flex:1">
        <div style="font-weight:800;color:var(--purple-d);margin-bottom:8px">灵感素材库</div>
        ${[['effect','特效贴纸类'],['sfx','音效类'],['music','音乐类'],['editing','剪辑技巧类']].map(([key,label])=>`
          <div class="stat" style="margin-bottom:10px">
            <div class="label">${label}</div>
            <div id="insp-${key}">
              ${insp[key].map((m,i)=>`
                <div class="list-item" style="padding:10px">
                  <div class="li-main"><input class="inp sm" value="${esc(m.text)}" data-act="insp-text" data-k="${key}" data-i="${i}">
                    <input class="inp sm" style="margin-top:6px" placeholder="来源" value="${esc(m.src||'')}" data-act="insp-src" data-k="${key}" data-i="${i}"></div>
                  <div class="li-actions"><button class="btn danger sm" data-act="insp-del" data-k="${key}" data-i="${i}">删</button></div>
                </div>`).join('')||'<div class="muted">暂无</div>'}
            </div>
            <button class="btn ghost sm" data-act="insp-add" data-k="${key}" style="margin-top:6px">+ 添加素材</button>
          </div>`).join('')}
      </div>
    </div>
    <div class="sub-title">自媒体学习笔记手册</div>
    <div class="notes-entry">
      <div class="muted">专属运营学习笔记：爆款拆解 / 课程笔记 / 运营心得。支持富文本编辑、手绘圈画标注、智能分类与全文检索。</div>
      <button class="btn purple" data-act="open-notes">📒 打开学习笔记手册（${S.media.notes.length}）</button>
    </div>
  </div>`;
}

/* 自媒体：每日联网选题 */
const DT_CATEGORIES=[
  {key:'female',label:'女性成长',kw:['女性','成长','自律','独立','女生','精致','提升','情商','变美','逆袭','职场']},
  {key:'ai',label:'AI技能学习',kw:['AI','人工智能','教程','技能','学习','编程','Python','剪映','办公','ChatGPT','Midjourney','提示词']},
  {key:'absurd',label:'抽象搞笑热梗',kw:['梗','抽象','搞笑','热梗','meme','精神状态','离谱','整活']},
  {key:'song',label:'热歌',kw:['歌','歌曲','音乐','BGM','翻唱','热歌','新歌','单曲']},
  {key:'dance',label:'手势舞',kw:['手势舞','舞蹈','跳舞','舞','律动']},
  {key:'joke',label:'搞笑段子',kw:['段子','笑话','爆笑','神回复','吐槽','搞笑','幽默','金句']},
];
function classifyTopic(title){
  const t=title.toLowerCase();
  for(const c of DT_CATEGORIES) if(c.kw.some(k=>t.includes(k))) return c;
  return {key:'other',label:'综合热点',kw:[]};
}
function renderDailyTopics(){
  const box=$('#dailyTopics');if(!box)return;
  box.innerHTML='<div class="muted">正在联网获取今日热门选题…</div>';
  const endpoints=[
    {url:'https://uapis.cn/api/v1/misc/hotboard?type=douyin',platform:'抖音'},
    {url:'https://uapis.cn/api/v1/misc/hotboard?type=xiaohongshu',platform:'小红书'}
  ];
  Promise.allSettled(endpoints.map(e=>fetch(e.url).then(r=>r.json()).then(j=>({...e,data:j}))))
    .then(results=>{
      let all=[];
      results.forEach(r=>{
        if(r.status!=='fulfilled') return;
        const {platform,data}=r.value;
        const list=(data&&data.data&&data.data.list)||(data&&data.list)||[];
        list.forEach(it=>{
          if(!it.title) return;
          const cat=classifyTopic(it.title);
          const heat=it.hot_value||it.hotValue||it.heat||'';
          all.push({title:it.title,platform,heat:String(heat),category:cat});
        });
      });
      if(!all.length) all=fallbackDailyTopics();
      renderTopicCards(box,all);
    })
    .catch(()=>renderTopicCards(box,fallbackDailyTopics()));
}
function fallbackDailyTopics(){
  return [
    {title:'30天自律计划：普通女生如何逆袭成爽文女主',platform:'抖音',heat:'982w',category:DT_CATEGORIES[0]},
    {title:'AI做短视频真的香！3分钟学会自动剪口播',platform:'抖音',heat:'876w',category:DT_CATEGORIES[1]},
    {title:'当代年轻人精神状态：已读乱回',platform:'抖音',heat:'754w',category:DT_CATEGORIES[2]},
    {title:'这首BGM一响，宿命感直接拉满',platform:'小红书',heat:'621w',category:DT_CATEGORIES[3]},
    {title:'超甜手势舞挑战，有手就会！',platform:'抖音',heat:'598w',category:DT_CATEGORIES[4]},
    {title:'让你笑到肚子疼的职场段子合集',platform:'小红书',heat:'432w',category:DT_CATEGORIES[5]},
    {title:'女性独居安全好物分享',platform:'小红书',heat:'389w',category:DT_CATEGORIES[0]},
    {title:'ChatGPT提示词万能公式，效率翻倍',platform:'抖音',heat:'356w',category:DT_CATEGORIES[1]},
  ];
}
function renderTopicCards(box,items){
  const grouped={};
  DT_CATEGORIES.forEach(c=>grouped[c.key]=[]);
  grouped.other=[];
  items.forEach(it=>{(grouped[it.category.key]||grouped.other).push(it);});
  let html=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button class="btn purple sm" data-act="dt-refresh">刷新选题</button><span class="muted">自动分类今日高热内容</span></div>`;
  html+=`<div class="daily-topic-grid">`;
  DT_CATEGORIES.concat([{key:'other',label:'综合热点'}]).forEach(c=>{
    const arr=(grouped[c.key]||[]).slice(0,5);
    if(!arr.length) return;
    arr.forEach(it=>{
      html+=`<div class="daily-topic-card">
        <div class="dt-head"><span class="dt-tag">${esc(c.label)}</span><span class="tag" style="background:#fff0d6;color:#e08a2b">${esc(it.platform)}</span></div>
        <div class="dt-title">${esc(it.title)}</div>
        <div class="dt-meta">热度 ${esc(it.heat)} · <button class="btn sm" data-act="dt-save" data-title="${esc(it.title)}" data-tag="${esc(c.label)}">存为选题</button></div>
      </div>`;
    });
  });
  html+=`</div>`;
  box.innerHTML=html;
}

function postItem(p){
  return `<div class="list-item">
    <div class="li-main">
      <div style="display:flex;justify-content:space-between;gap:8px">
        <strong>${p.date} · ${esc(p.topic)}</strong>
        <span class="tag">${p.published?'已发布':'未发布'}</span>
      </div>
      <div class="row" style="margin-top:8px">
        <input class="inp sm" type="number" value="${esc(p.views)}" data-act="post-f" data-id="${p.id}" data-f="views" placeholder="浏览">
        <input class="inp sm" type="number" value="${esc(p.likes)}" data-act="post-f" data-id="${p.id}" data-f="likes" placeholder="点赞">
        <input class="inp sm" type="number" value="${esc(p.comments)}" data-act="post-f" data-id="${p.id}" data-f="comments" placeholder="评论">
      </div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <span class="chip ${p.quality==='good'?'active':''}" data-act="post-q" data-id="${p.id}" data-v="good">优质</span>
        <span class="chip ${p.quality==='mid'?'active':''}" data-act="post-q" data-id="${p.id}" data-v="mid">一般</span>
        <span class="chip ${p.quality==='bad'?'active':''}" data-act="post-q" data-id="${p.id}" data-v="bad">较差</span>
        <span class="chip ${p.published?'active':''}" data-act="post-pub" data-id="${p.id}">${p.published?'已发布':'标记发布'}</span>
      </div>
      <textarea class="txtarea sm" style="margin-top:8px;min-height:60px" placeholder="视频复盘…" data-act="post-review" data-id="${p.id}">${esc(p.review||'')}</textarea>
      ${mediaInlineHTML(p)}
    </div>
    <div class="li-actions"><button class="btn ghost sm" data-act="post-edit" data-id="${p.id}">编辑</button><button class="btn danger sm" data-act="post-del" data-id="${p.id}">删</button></div>
  </div>`;
}

/* ---------- 8. 爆款热点 ---------- */
let hotPlatform='douyin', hotTag='全部';
const HOT_TAGS=['全部','美妆','vlog','两性','手势舞','穿搭','美食','种草'];
function renderHot(){
  let list=S.hot[hotPlatform].slice().sort((a,b)=>a.rank-b.rank);
  if(hotTag!=='全部') list=list.filter(h=>h.tags.includes(hotTag));
  return `<div class="card">
    ${header('hot','爆款热点追踪')}
    <div class="tabs">
      <span class="chip ${hotPlatform==='douyin'?'active':''}" data-act="hot-plat" data-v="douyin">抖音热点</span>
      <span class="chip ${hotPlatform==='xhs'?'active':''}" data-act="hot-plat" data-v="xhs">小红书热点</span>
      <button class="btn purple sm" data-act="hot-refresh" style="margin-left:auto">刷新</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${HOT_TAGS.map(t=>`<span class="chip ${hotTag===t?'active':''}" data-act="hot-tag" data-v="${t}">${t}</span>`).join('')}
    </div>
    <div id="hotList">
      ${list.length?list.map(h=>`
        <div class="list-item">
          <div style="flex:0 0 40px;text-align:center">
            <div style="font-size:20px;font-weight:800;color:var(--pink-d)">${h.rank}</div>
            <span class="tag" style="background:#fff0d6;color:#e08a2b">${esc(h.heat)}</span>
          </div>
          <div class="li-main">
            <strong>${esc(h.topic)}</strong>
            <div style="margin-top:6px">${h.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join(' ')}
              <span class="tag" style="background:#e6e0f5;color:var(--purple-d)">${h.platform==='douyin'?'抖音':'小红书'}</span></div>
            ${mediaInlineHTML(h)}
          </div>
          <div class="li-actions" style="flex-direction:column">
            <span class="chip ${h.suitable?'active':''}" data-act="hot-suit" data-id="${h.id}">适合二创</span>
            <button class="btn sm" data-act="hot-insp" data-id="${h.id}">存为灵感</button>
            <button class="btn ghost sm" data-act="hot-edit" data-id="${h.id}">编辑</button>
            <button class="btn danger sm" data-act="hot-del" data-id="${h.id}">删</button>
          </div>
        </div>`).join(''):'<div class="empty">该分类暂无热点。</div>'}
    </div>
    <button class="btn ghost sm" data-act="hot-add" style="margin-top:8px">+ 手动新增热点</button>
  </div>`;
}

/* ---------- 9. 优质视频拆解 ---------- */
function renderVideo(){
  const list=S.video.slice().reverse();
  return `<div class="card">
    ${header('video','优质视频拆解')}
    <div id="videoList">
      ${list.length?list.map(v=>videoItem(v)).join(''):emptySVG('clip')+'<div class="empty">还没有拆解笔记，点 + 拆解第一条优质视频。</div>'}
    </div>
    <button class="btn ghost sm" data-act="video-add" style="margin-top:8px">+ 新增拆解笔记</button>
  </div>`;
}
function videoItem(v){
  const mat=v.materials||{effect:[],sfx:[],music:[],editing:[]};
  const matRender=(key,label)=>`
    <div style="margin-top:8px"><div class="muted" style="font-weight:700">${label}</div>
      ${(mat[key]||[]).map((m,i)=>`
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <span class="check ${m.on?'on':''}" data-act="vm-toggle" data-id="${v.id}" data-k="${key}" data-i="${i}"></span>
          <input class="inp sm" value="${esc(m.text)}" data-act="vm-text" data-id="${v.id}" data-k="${key}" data-i="${i}" style="flex:1">
          <button class="btn danger sm" data-act="vm-del" data-id="${v.id}" data-k="${key}" data-i="${i}">删</button>
        </div>`).join('')}
      <button class="btn ghost sm" data-act="vm-add" data-id="${v.id}" data-k="${key}" style="margin-top:6px">+ 添加</button>
    </div>`;
  return `<div class="list-item" style="flex-direction:column;align-items:stretch">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>${esc(v.blogger)} · ${esc(v.topic)}</strong>
      <div style="display:flex;gap:6px">
        <button class="btn ghost sm" data-act="video-edit" data-id="${v.id}">编辑</button>
        <button class="btn danger sm" data-act="video-del" data-id="${v.id}">删</button>
      </div>
    </div>
    <div class="muted" style="margin:6px 0">${v.date} · 时长 ${esc(v.duration)} · 预测播放 ${esc(v.predPlay)}/点赞 ${esc(v.predLike)} · 实际播放 ${esc(v.actPlay)}/点赞 ${esc(v.actLike)}</div>
    ${mediaInlineHTML(v)}
    <div class="row" style="margin:8px 0">
      <input class="inp sm" value="${esc(v.blogger)}" data-act="vi-f" data-id="${v.id}" data-f="blogger" placeholder="博主">
      <input class="inp sm" value="${esc(v.topic)}" data-act="vi-f" data-id="${v.id}" data-f="topic" placeholder="主题">
      <input class="inp sm" value="${esc(v.duration)}" data-act="vi-f" data-id="${v.id}" data-f="duration" placeholder="时长">
    </div>
    <div style="display:flex;gap:8px;margin:8px 0">
      <button class="btn ghost sm" data-act="video-ai" data-id="${v.id}">🤖 AI 自动拆解</button>
      ${v.ai?'<button class="btn ghost sm" data-act="video-compare" data-id="'+v.id+'">📊 对照组对比</button>':''}
    </div>
    <div class="sub-title" style="margin:8px 0 4px">内容结构拆解</div>
    <textarea class="txtarea sm" data-act="vi-f" data-id="${v.id}" data-f="structure" placeholder="开头/中段/结尾、脚本逻辑、镜头设计…">${esc(v.structure||'')}</textarea>
    <div class="sub-title" style="margin:10px 0 4px">可复用素材提取</div>
    ${matRender('effect','特效贴纸')}${matRender('sfx','音效')}${matRender('music','背景音乐')}${matRender('editing','剪辑技巧')}
    <div class="sub-title" style="margin:10px 0 4px">学习心得</div>
    <textarea class="txtarea sm" data-act="vi-f" data-id="${v.id}" data-f="notes" placeholder="可借鉴亮点、避坑点…">${esc(v.notes||'')}</textarea>
    <div class="sub-title" style="margin:10px 0 4px">🤖 AI 自动拆解结果</div>
    ${v.ai?aiResultHTML(v):'<div class="muted" style="font-size:12px">上传视频后点「🤖 AI 自动拆解」，自动生成分镜 / 转场 / 音频分析，再对照你的拆解查漏补缺。</div>'}
  </div>`;
}

/* ---------- 视频 AI 自动拆解（本地分析，视频不出设备） ---------- */
const PW=64, PH=36; // 感知哈希取样尺寸
function fmtDur(sec){
  sec=Math.max(0,Math.round(sec||0));
  const m=Math.floor(sec/60), s=sec%60;
  return m+':'+String(s).padStart(2,'0');
}
function seekTo(vEl,t){return new Promise(res=>{vEl.onseeked=()=>res();vEl.currentTime=t;});}
function phash(data){
  let sum=0;const g=new Array(PW*PH);
  for(let i=0;i<PW*PH;i++){const r=data[i*4],gg=data[i*4+1],b=data[i*4+2];const v=r*0.299+gg*0.587+b*0.114;g[i]=v;sum+=v;}
  const avg=sum/(PW*PH);let bits='';for(let i=0;i<PW*PH;i++)bits+=g[i]>avg?'1':'0';return bits;
}
function hamming(a,b){let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d;}
function loadVideoMeta(url){
  return new Promise((res,rej)=>{
    const v=document.createElement('video');
    v.preload='metadata';v.muted=true;v.src=url;
    v.onloadedmetadata=()=>res(v);
    v.onerror=()=>rej(new Error('视频加载失败'));
  });
}
async function sampleFrames(vEl,duration,count){
  const cvs=document.createElement('canvas');cvs.width=PW;cvs.height=PH;
  const ctx=cvs.getContext('2d',{willReadFrequently:true});
  const nodes=[],hashes=[];
  for(let i=0;i<count;i++){
    const t=Math.min(duration-0.05,((i+0.5)*duration)/count);
    await seekTo(vEl,t);
    try{ctx.drawImage(vEl,0,0,PW,PH);}catch(e){}
    let data;try{data=ctx.getImageData(0,0,PW,PH).data;}catch(e){data=new Uint8ClampedArray(PW*PH*4);}
    hashes.push(phash(data));
    const tw=140,th=Math.round(tw*PH/PW);
    const tc=document.createElement('canvas');tc.width=tw;tc.height=th;
    const tx=tc.getContext('2d');try{tx.drawImage(vEl,0,0,tw,th);}catch(e){}
    let thumb='';try{thumb=tc.toDataURL('image/jpeg',0.5);}catch(e){}
    nodes.push({t:Math.round(t*10)/10,thumb});
  }
  return {nodes,hashes};
}
async function analyzeAudio(blob,duration){
  try{
    if(blob.size>30*1024*1024) return null;
    const buf=await blob.arrayBuffer();
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    const ac=new AC();
    const audioBuf=await ac.decodeAudioData(buf);
    const ch=audioBuf.getChannelData(0);const sr=audioBuf.sampleRate;
    const win=Math.max(1,Math.floor(sr)); // 1s 一窗
    const peaks=[];
    for(let i=0;i<ch.length;i+=win){
      const e=Math.min(i+win,ch.length);let s=0;for(let j=i;j<e;j++)s+=ch[j]*ch[j];
      peaks.push(Math.sqrt(s/(e-i)));
    }
    const max=Math.max(1e-6,...peaks);
    return {peaks:peaks.map(p=>p/max),duration};
  }catch(e){return null;}
}
async function runVideoAI(v){
  const vid=v.media&&v.media.find(m=>m.type==='video');
  if(!vid){toast('请先在「编辑」中上传要拆解的视频 😺');return;}
  const blob=await MediaDB.getMedia(vid.id);
  if(!blob){toast('找不到视频文件，请重新上传');return;}
  const url=URL.createObjectURL(blob);
  const mask=document.createElement('div');
  mask.className='modal-mask';
  mask.innerHTML=`<div class="modal" style="max-width:460px">
    <div class="modal-head"><span>🤖 AI 正在拆解视频…</span></div>
    <div class="modal-body"><div id="aiProg" class="muted" style="line-height:1.9">准备中…</div></div></div>`;
  document.body.appendChild(mask);
  const prog=()=>$('#aiProg');
  try{
    prog().textContent='① 读取视频元数据…';
    const vEl=await loadVideoMeta(url);
    const duration=vEl.duration||0, width=vEl.videoWidth||0, height=vEl.videoHeight||0;
    prog().textContent='② 逐帧采样分镜（时长 '+fmtDur(duration)+'）…';
    const count=Math.max(6,Math.min(24,Math.round(duration/3)));
    const {nodes,hashes}=await sampleFrames(vEl,duration,count);
    const cuts=[];const TH=Math.round(PW*PH*0.16);
    for(let i=1;i<hashes.length;i++){if(hamming(hashes[i-1],hashes[i])>TH)cuts.push(nodes[i].t);}
    const sections=[];let start=nodes[0].t,prev=nodes[0].t;
    nodes.forEach((n,i)=>{if(i>0&&cuts.includes(n.t)){sections.push({from:start,to:prev});start=n.t;}prev=n.t;});
    sections.push({from:start,to:prev});
    prog().textContent='③ 分析音频能量曲线…';
    const audio=await analyzeAudio(blob,duration);
    let audioHigh=[];
    if(audio){audio.peaks.forEach((p,i)=>{if(p>0.6)audioHigh.push(Math.round(i*duration/audio.peaks.length));});}
    prog().textContent='④ 生成结构化拆解报告…';
    v.ai={
      generatedAt:Date.now(),
      duration, durationText:fmtDur(duration), width, height,
      nodes, cuts, sections, audio:audio?audio.peaks:null, audioHigh,
      style:'（AI 建议：结合时长与节奏，常见风格为「治愈生活 vlog / 快节奏卡点 / 知识口播 / 开箱测评」，请结合内容确认）',
      opening:'开头 0–3s 通常为「钩子」：用强画面 / 冲突 / 悬念留住观众，可观察是否用了字幕预告、快剪或特写。',
      effects:'AI 自动检测到 '+cuts.length+' 个转场 / 剪辑点（时间：'+(cuts.length?cuts.map(c=>fmtDur(c)).join('、'):'无明显硬切')+'）。可在「可复用素材-剪辑技巧」补充具体手法，如 硬切 / 叠化 / 遮罩转场 / 关键帧缩放 / 抖动特效。',
      music:'AI 暂无法识别具体背景音乐名称（需联网曲库）。请在「可复用素材-背景音乐」中补充你听到的曲目与来源，热门方向可参考抖音 / 小红书 BGM 榜。',
      sfx:'AI 建议留意：转场音效、点按音效、环境白噪音、卡点鼓点等，补充到「可复用素材-音效」。',
      summary:'自动拆出 '+nodes.length+' 个分镜节点、'+sections.length+' 个内容板块'+(cuts.length?('、'+cuts.length+' 处转场'):'')+(audioHigh.length?('、'+audioHigh.length+' 个高能量卡点段'):'')+'。对照你的拆解，逐节点补齐「镜头内容 + 剪辑手法 + 音乐音效」。'
    };
    save();mask.remove();URL.revokeObjectURL(url);
    toast('🤖 AI 拆解完成，快看对照组对比吧~');
    renderModule();
  }catch(err){
    mask.remove();URL.revokeObjectURL(url);
    toast('拆解失败：'+(err&&err.message?err.message:err));
  }
}
function aiResultHTML(v){
  const a=v.ai;if(!a)return '';
  const timeline=a.nodes.map(n=>`<div class="ai-node"><img src="${n.thumb}" alt=""><span>${fmtDur(n.t)}</span></div>`).join('');
  const sections=a.sections.map(s=>`<span class="tag">${fmtDur(s.from)}–${fmtDur(s.to)}</span>`).join(' ');
  return `<div class="ai-box">
    <div class="muted" style="font-size:12px">${a.durationText} · ${a.width}×${a.height} · 生成于 ${new Date(a.generatedAt).toLocaleString('zh-CN')}</div>
    <div class="ai-timeline">${timeline}</div>
    <div class="muted" style="margin-top:6px;font-weight:700">内容板块（${a.sections.length}）</div>
    <div>${sections||'—'}</div>
    <div class="muted" style="margin-top:6px;font-weight:700">开头 / 转场 / 音乐音效（AI 建议）</div>
    <div class="ai-suggest">${esc(a.opening)}</div>
    <div class="ai-suggest">${esc(a.effects)}</div>
    <div class="ai-suggest">${esc(a.music)}</div>
    <div class="ai-suggest">${esc(a.sfx)}</div>
  </div>`;
}
function buildComparison(v){
  const a=v.ai;if(!a)return '<div class="empty">还没有 AI 拆解结果，先点「🤖 AI 自动拆解」。</div>';
  const userStruct=v.structure||'';
  const userMat=(v.materials?Object.values(v.materials).flat().map(m=>m.text).join(' '):'');
  const userNotes=v.notes||'';
  const userText=(userStruct+' '+userMat+' '+userNotes).toLowerCase();
  const tips=[];
  if(!userStruct.trim()) tips.push('你还没写「内容结构拆解」，对照 AI 的 '+a.nodes.length+' 个分镜节点，逐段描述开头 / 中段 / 结尾与镜头内容。');
  else if(a.sections.length> userStruct.split(/[。\n]/).filter(Boolean).length) tips.push('AI 自动切出 '+a.sections.length+' 个内容板块，你的结构拆解段落偏少，可对照补齐每段讲什么。');
  if(a.cuts.length && !/转场|剪辑|卡点|特效|叠化|硬切/.test(userText)) tips.push('AI 检测到 '+a.cuts.length+' 处转场 / 剪辑点（'+a.cuts.map(c=>fmtDur(c)).join('、')+'），你的拆解还没提到剪辑手法，记得补到「可复用素材-剪辑技巧」。');
  if(a.audioHigh.length && !/音乐|bgm|音效|卡点/.test(userText)) tips.push('AI 发现 '+a.audioHigh.length+' 个高能量卡点段，留意你的拆解是否利用了节奏 / 音乐。');
  if(!/音乐|bgm|曲/.test(userText)) tips.push('还没记录背景音乐，AI 建议在「可复用素材-背景音乐」补充曲目与来源。');
  if(!tips.length) tips.push('你的拆解已经很完整啦！可以再核对 AI 的分镜时间轴，看看有没有遗漏的镜头细节。');
  const timeline=a.nodes.map(n=>`<div class="ai-node"><img src="${n.thumb}" alt=""><span>${fmtDur(n.t)}</span></div>`).join('');
  return `
  <div class="cmp">
    <div class="cmp-col">
      <h4>📝 你的拆解</h4>
      <div class="muted">博主：${esc(v.blogger)} · ${esc(v.topic)}</div>
      <div class="muted">时长：${esc(v.duration)}</div>
      <div class="sub-title" style="margin:8px 0 4px">内容结构</div>
      <div class="cmp-text">${esc(userStruct)||'<span class="muted">（空）</span>'}</div>
      <div class="sub-title" style="margin:8px 0 4px">可复用素材</div>
      <div class="cmp-text">${esc(userMat)||'<span class="muted">（空）</span>'}</div>
      <div class="sub-title" style="margin:8px 0 4px">学习心得</div>
      <div class="cmp-text">${esc(userNotes)||'<span class="muted">（空）</span>'}</div>
    </div>
    <div class="cmp-col">
      <h4>🤖 AI 专业拆解</h4>
      <div class="muted">${a.durationText} · ${a.width}×${a.height}</div>
      <div class="ai-timeline">${timeline}</div>
      <div class="muted" style="margin-top:6px">板块：${a.sections.map(s=>fmtDur(s.from)+'–'+fmtDur(s.to)).join('  ')}</div>
      <div class="ai-suggest">${esc(a.opening)}</div>
      <div class="ai-suggest">${esc(a.effects)}</div>
      <div class="ai-suggest">${esc(a.music)}</div>
      <div class="ai-suggest">${esc(a.sfx)}</div>
    </div>
  </div>
  <div class="cmp-tips"><strong>💡 学习建议</strong><ul>${tips.map(t=>'<li>'+esc(t)+'</li>').join('')}</ul></div>`;
}

/* ---------- 10. 学习 ---------- */
const ENGLISH_WORDS=[
  ['ambition','/æmˈbɪʃn/','抱负；野心','have an ambition to do','She has an ambition to become a director.'],
  ['benefit','/ˈbenɪfɪt/','益处；使受益','be of benefit to','Regular exercise benefits your health.'],
  ['consistent','/kənˈsɪstənt/','一贯的；一致的','be consistent with','Keep a consistent study habit.'],
  ['delicate','/ˈdelɪkət/','精致的；脆弱的','a delicate situation','The flower is delicate and beautiful.'],
  ['efficient','/ɪˈfɪʃnt/','高效的','improve efficiency','An efficient workflow saves time.'],
  ['fascinate','/ˈfæsɪneɪt/','使着迷','be fascinated by','I am fascinated by the stars.'],
  ['genuine','/ˈdʒenjuɪn/','真正的；真诚的','a genuine smile','Her apology seemed genuine.'],
  ['harmony','/ˈhɑːməni/','和谐；融洽','live in harmony','They live in harmony with nature.'],
  ['inevitable','/ɪnˈevɪtəbl/','不可避免的','an inevitable result','Change is inevitable.'],
  ['justify','/ˈdʒʌstɪfaɪ/','证明…正当','justify the cost','How do you justify this?'],
  ['keen','/kiːn/','热衷的；敏锐的','be keen on','He is keen on photography.'],
  ['linger','/ˈlɪŋɡə(r)/','逗留；徘徊','linger in memory','The smell lingered in the room.'],
  ['modest','/ˈmɒdɪst/','谦虚的； modest','a modest goal','She is modest about her success.'],
  ['negotiate','/nɪˈɡəʊʃieɪt/','谈判；协商','negotiate a deal','They negotiated a new contract.'],
  ['obvious','/ˈɒbviəs/','明显的','It is obvious that','It is obvious he is tired.'],
  ['precision','/prɪˈsɪʒn/','精确；精准','with precision','The surgery was done with precision.'],
  ['quantify','/ˈkwɒntɪfaɪ/','量化','quantify the impact','It is hard to quantify happiness.'],
  ['resilient','/rɪˈzɪliənt/','有韧性的','a resilient mind','Children are resilient.'],
  ['sincere','/sɪnˈsɪə(r)/','真诚的','a sincere thanks','Please accept my sincere thanks.'],
  ['transparent','/trænsˈpærənt/','透明的；清晰的','a transparent process','The policy is transparent.'],
  ['ultimate','/ˈʌltɪmət/','最终的','the ultimate goal','Health is the ultimate wealth.'],
  ['vivid','/ˈvɪvɪd/','生动的；鲜艳的','a vivid memory','She gave a vivid description.'],
  ['worthwhile','/ˌwɜːθˈwaɪl/','值得的','a worthwhile trip','The effort was worthwhile.'],
  ['yield','/jiːld/','产出；让步','yield results','The plan yielded good results.'],
  ['abundant','/əˈbʌndənt/','丰富的','abundant in','The region is abundant in rain.'],
  ['candidate','/ˈkændɪdət/','候选人','a strong candidate','She is a candidate for the job.'],
  ['dedicate','/ˈdedɪkeɪt/','致力；奉献','dedicate to','He dedicated his life to art.'],
  ['elaborate','/ɪˈlæbərət/','精心制作的','an elaborate plan','She gave an elaborate answer.'],
  ['fluent','/ˈfluːənt/','流利的','be fluent in','He is fluent in English.'],
  ['gratitude','/ˈɡrætɪtjuːd/','感激','express gratitude','I owe you my gratitude.'],
  ['highlight','/ˈhaɪlaɪt/','突出；亮点','the highlight of','The trip was the highlight.'],
  ['inevitable2','/ɪnˈevɪtəbl/','必然的','an inevitable trend','Aging is inevitable.'],
  ['justify2','/ˈdʒʌstɪfaɪ/','辩护','justify oneself','He tried to justify himself.'],
  ['knowledge','/ˈnɒlɪdʒ/','知识','book knowledge','Knowledge is power.'],
  ['luminous','/ˈluːmɪnəs/','发光的','a luminous star','The moon is luminous.'],
  ['mature','/məˈtʃʊə(r)/','成熟的','a mature attitude','He is mature for his age.'],
  ['notion','/ˈnəʊʃn/','概念；想法','a vague notion','I have no notion of it.'],
  ['optimistic','/ˌɒptɪˈmɪstɪk/','乐观的','remain optimistic','Stay optimistic about life.'],
  ['prosper','/ˈprɒspə(r)/','繁荣','prosper in','The business will prosper.'],
  ['quote','/kwəʊt/','引用','quote a line','She quoted a famous poem.'],
  ['reliable','/rɪˈlaɪəbl/','可靠的','a reliable friend','He is reliable and honest.'],
  ['sufficient','/səˈfɪʃnt/','足够的','sufficient evidence','We have sufficient time.'],
  ['tremendous','/trəˈmendəs/','巨大的','a tremendous change','The progress is tremendous.'],
  ['unique','/juˈniːk/','独特的','a unique style','Her voice is unique.'],
  ['vital','/ˈvaɪtl/','至关重要的','vital to','Water is vital to life.'],
  ['welfare','/ˈwelfeə(r)/','福祉','social welfare','We care about animal welfare.'],
  ['yield2','/jiːld/','屈服','yield to','Do not yield to pressure.'],
  ['zeal','/ziːl/','热情','with zeal','He works with zeal.'],
  ['adapt','/əˈdæpt/','适应；改编','adapt to','We must adapt to change.'],
  ['brisk','/brɪsk/','轻快的；活跃','a brisk walk','Take a brisk walk daily.'],
  ['compile','/kəmˈpaɪl/','汇编；编译','compile data','She compiled a report.'],
  ['diminish','/dɪˈmɪnɪʃ/','减少；削弱','diminish fear','The pain diminished.'],
  ['enrich','/ɪnˈrɪtʃ/','丰富；使充实','enrich life','Travel enriches the mind.'],
];
const LONG_SENTENCES=[
  {en:'Not only did she finish the project ahead of schedule, but she also helped her teammates with theirs.',cn:'她不仅提前完成了项目，还帮助了队友完成他们的工作。',split:'Not only + 倒装助动词 did + 主语 she + 动词 finish… but also 连接并列句，表示“不但…而且…”。'},
  {en:'Had we left earlier, we would have caught the last train to the city.',cn:'要是早点出发，我们就能赶上最后一班进城的火车了。',split:'虚拟语气倒装：Had + 主语 we + 过去分词 left，等于 If we had left，表示与过去相反的假设。'},
];
function dayWords(){
  const k=todayKey();
  if(!S.study.words[k]){
    // 按日期选 30 个（确定性）
    const seedNum=parseInt(k.replace(/-/g,''),10);
    const arr=ENGLISH_WORDS.slice();
    // 简单洗牌（确定性）
    for(let i=arr.length-1;i>0;i--){const j=(seedNum*(i+7))% (i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}
    S.study.words[k]=arr.slice(0,30).map(w=>({w,mastered:false}));
    save();
  }
  return S.study.words[k];
}
function daySentence(){
  const k=todayKey();
  if(!S.study.sentences[k]){
    const i=parseInt(k.slice(-2),10)%LONG_SENTENCES.length;
    S.study.sentences[k]=LONG_SENTENCES[i];
    save();
  }
  return S.study.sentences[k];
}
function renderStudy(){
    const words=dayWords();
  const st=daySentence();
  const soft=(S.study.software||[]).slice().reverse();
  const daily=(S.study.daily||[]).slice().reverse();
  const weak=(S.study.english.weak||[]);
  const weakSet=new Set(weak);
  return `<div class="card">
    ${header('study','学习')}
    <div class="sub-title">软件技能类（SOP 操作手册）</div>
    <div id="softList">
      ${soft.map(s=>`
        <div class="list-item">
          <div class="li-main">
            <strong>${esc(s.name)}</strong> <span class="muted">${s.date}</span>
            <textarea class="txtarea sm" style="margin-top:6px" data-act="soft-sop" data-id="${s.id}" placeholder="分点录入 SOP 步骤">${esc(s.sop||'')}</textarea>
            ${mediaInlineHTML(s)}
          </div>
          <div class="li-actions"><button class="btn ghost sm" data-act="soft-edit" data-id="${s.id}">编辑</button><button class="btn danger sm" data-act="soft-del" data-id="${s.id}">删</button></div>
        </div>`).join('')}
    </div>
    <button class="btn ghost sm" data-act="soft-add">+ 添加软件技能</button>

    <div class="sub-title">学业学习类</div>
    <div class="row" style="align-items:flex-start">
      <div style="flex:1"><div class="muted" style="font-weight:700">今日知识点总结</div>
        <textarea class="txtarea" data-act="acad" data-f="summary" placeholder="沉淀今天学到的专业知识…">${esc(S.study.academic.summary||'')}</textarea></div>
      <div style="flex:1"><div class="muted" style="font-weight:700">毕设 / 项目选题积累</div>
        <textarea class="txtarea" data-act="acad" data-f="topics" placeholder="记录灵感选题…">${esc(S.study.academic.topics||'')}</textarea></div>
    </div>

    <div class="sub-title">日常技能类</div>
    <div id="dailyList">
      ${daily.map(d=>`
        <div class="list-item">
          <div class="li-main"><input class="inp" value="${esc(d.text)}" data-act="daily-text" data-id="${d.id}">
            <div class="muted" style="margin-top:4px">${d.date}</div></div>
          <div class="li-actions"><button class="btn danger sm" data-act="daily-del" data-id="${d.id}">删</button></div>
        </div>`).join('')}
    </div>
    <button class="btn ghost sm" data-act="daily-add">+ 添加日常技巧</button>

    <div class="sub-title">英语学习类</div>
    <div class="stat"><div class="label">今日精选单词（30 个，勾选已掌握）</div>
      <div id="wordList" style="margin-top:10px;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
        ${words.map((it,i)=>{
          const w=it.w;
          const inWeak=weakSet.has(w[0]);
          return `<div style="display:flex;gap:8px;align-items:flex-start;background:var(--card-soft);border:1px solid var(--line);border-radius:12px;padding:8px 10px">
            <span class="check ${it.mastered?'on':''}" data-act="word-master" data-i="${i}" style="margin-top:4px"></span>
            <div style="font-size:13px;line-height:1.5;flex:1">
              <strong>${esc(w[0])}</strong> <span class="muted">${esc(w[1])}</span><br>
              ${esc(w[2])} <span class="muted">搭配：${esc(w[3])}</span><br>
              <span class="muted">例：${esc(w[4])}</span>
            </div>
            <button class="btn ghost xs ${inWeak?'on':''}" data-act="study-weak-add" data-i="${i}">${inWeak?'✓生词':'生词'}</button>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="stat" style="margin-top:12px"><div class="label">今日长难句解析</div>
      <div style="margin-top:8px;font-size:14px;line-height:1.7">
        <strong>${esc(st.en)}</strong><br>
        <span class="muted">译文：</span>${esc(st.cn)}<br>
        <span class="muted">语法拆分：</span>${esc(st.split)}
      </div>
    </div>

    <div class="sub-title">每日句子跟读</div>
    <div class="row" style="align-items:flex-start">
      <div style="flex:1">
        <div class="muted" style="font-weight:700;margin-bottom:4px">原文</div>
        <div style="font-size:14px;line-height:1.6;background:var(--card-soft);border:1px solid var(--line);border-radius:12px;padding:10px">${esc(st.en)}</div>
      </div>
      <div style="flex:1">
        <div class="muted" style="font-weight:700;margin-bottom:4px">我的跟读（朗读文本 / 要点）</div>
        <textarea class="txtarea sm" data-act="study-recite" placeholder="我读到的是：… / 关键发音要点…">${esc((S.study.english.recite||{}).myText||'')}</textarea>
      </div>
    </div>

    <div class="sub-title">英语陪练 · 对话练习</div>
    <div class="chat-box">
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
        ${CHAT_SCENES.map(s=>`<button class="chip ${((S.study.english.chat||{}).scene===s.key)?'active':''}" data-act="study-chat-scene" data-key="${s.key}">${s.label}</button>`).join('')}
      </div>
      <div id="chatPanel">${renderChatPanel()}</div>
    </div>

    <div class="sub-title">生词本（${weak.length}）</div>
    <div id="weakList">
      ${weak.length?weak.map(w=>`<div class="list-item">
        <div class="li-main"><strong>${esc(w)}</strong></div>
        <div class="li-actions"><button class="btn danger sm" data-act="study-weak-del" data-w="${esc(w)}">移除</button></div>
      </div>`).join(''):'<div class="muted">在上方单词点「生词」加入这里，重点攻克~</div>'}
    </div>

    <div class="sub-title">自主学习内容</div>
    <textarea class="txtarea" data-act="eng-custom" placeholder="手动录入你的学习内容，可回溯…">${esc((S.study.english.custom||[]).join('\n'))}</textarea>
  </div>`;
}

/* ---------- 11. 阅读 ---------- */
let readingFilterStatus='', readingFilterType='';
function renderReading(){
  const books=S.reading.books.slice().sort((a,b)=>(b.id||'').localeCompare(a.id||''));
  let list=books;
  if(readingFilterStatus) list=list.filter(b=>b.status===readingFilterStatus);
  if(readingFilterType) list=list.filter(b=>b.type===readingFilterType);
  const statusOpts=['','reading','read','wish'];
  const statusLabels={'':'全部',reading:'在读',read:'已读',wish:'想读'};
  return `<div class="card">
    ${header('reading','阅读')}
    <div class="row" style="align-items:center;margin-bottom:12px">
      <div style="flex:1"><div class="muted" style="font-weight:700;margin-bottom:4px">状态筛选</div>
        <div class="seg" style="padding:2px">
          ${statusOpts.map(s=>`<button data-act="rd-filter-st" data-v="${s}" class="${readingFilterStatus===s?'on':''}">${statusLabels[s]}</button>`).join('')}
        </div></div>
      <div style="flex:1"><div class="muted" style="font-weight:700;margin-bottom:4px">类型</div>
        <input class="inp" id="rdTypeFilt" value="${esc(readingFilterType)}" placeholder="全部类型" data-act="rd-filter-type"></div>
    </div>
    <div id="bookList">
      ${list.length?list.map(b=>bookCard(b)).join(''):emptySVG('clip')+'<div class="empty">还没有阅读记录，点右下角 + 添加第一本书吧~</div>'}
    </div>
  </div>`;
}
function bookCard(b){
  const statusTag={reading:{bg:'#e8f5ff',color:'#1976d2',txt:'在读'},read:{bg:'#e8f5e9',color:'#388e3c',txt:'已读'},wish:{bg:'#fff3e0',color:'#f57c00',txt:'想读'}};
  const st=statusTag[b.status]||statusTag.wish;
  const prog=b.progress||0;
  const progLabel=b.progressMode==='pages'?`${prog} 页`:`${prog}%`;
  const expanded=document._expandedBook===b.id;
  return `<div class="book-card" data-id="${b.id}">
    <div class="book-card-main">
      <div class="book-cover">${b.cover?renderBookCoverThumb(b.cover):`<div class="book-cover-placeholder">${kitty('#c9a3ff',48)}</div>`}</div>
      <div class="book-info">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <strong style="font-size:16px">${esc(b.title||'未命名')}</strong>
          <span class="tag" style="background:${st.bg};color:${st.color}">${st.txt}</span>
        </div>
        <div class="muted" style="margin-top:4px">${esc(b.author||'未知作者')} · ${b.type?esc(b.type):''}</div>
        <div style="margin-top:6px;display:flex;align-items:center;gap:10px">
          <div style="flex:1;max-width:160px"><div class="muted" style="font-size:11px">进度</div>
            <div style="display:flex;align-items:center;gap:6px">
              <input type="range" min="0" max="${b.progressMode==='pages'?100:100}" value="${prog}" data-act="rd-prog" data-id="${b.id}" style="width:90px;height:6px">
              <span style="font-size:12px;font-weight:700;color:var(--pink-d)">${progLabel}</span>
            </div>
          </div>
        </div>
        ${(b.summary)?`<div class="muted" style="margin-top:6px;font-size:13px;line-height:1.5;max-height:2.7em;overflow:hidden">${esc(b.summary.slice(0,120))}${b.summary.length>120?'…':''}</div>`:''}
        ${b.media&&b.media.length?renderMediaThumbsInline(b.media,false):''}
      </div>
      <div class="book-actions">
        <button class="btn ghost sm" data-act="rd-expand" data-id="${b.id}">${expanded?'收起':'展开'}</button>
        <button class="btn ghost sm" data-act="rd-edit" data-id="${b.id}">编辑</button>
        <button class="btn danger sm" data-act="rd-del" data-id="${b.id}">删</button>
      </div>
    </div>
    ${expanded?`
      <div class="book-expanded">
        ${renderNoteSection('quotes','金句摘抄',b)}
        ${renderNoteSection('points','知识要点',b)}
        ${renderNoteSection('thoughts','感悟道理',b)}
        <div class="note-section">
          <div class="note-section-head"><strong>📷 书内图片 / 视频</strong><button class="btn ghost sm" data-act="rd-media-add" data-id="${b.id}">+ 上传</button></div>
          <div id="rd-media-zone-${b.id}" class="media-thumb-inline">${b.media&&b.media.length?renderMediaThumbsInline(b.media,false):'<div class="muted" style="padding:8px 0">点击「上传」添加图片或视频</div>'}</div>
        </div>
      </div>`:''}
  </div>`;
}
function renderBookCoverThumb(coverId){
  return `<div class="book-cover-img" data-cover-id="${coverId}" style="width:100%;height:100%;border-radius:8px;overflow:hidden;background:var(--card-soft);display:flex;align-items:center;justify-content:center;cursor:pointer">
    <span class="muted" style="font-size:10px">封面</span></div>`;
}
async function loadCoverImg(el,coverId){
  const blob=await MediaDB.getMedia(coverId);if(!blob)return;
  const url=URL.createObjectURL(blob);
  el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover" alt="封面">`;
  el.style.cursor='pointer';
  el.onclick=()=>openLightbox([{id:coverId,type:'image',name:'封面'}],0);
}
/* ============================================================
   自媒体学习笔记手册（富文本 + 手绘标注 + 智能分类 + 全文检索）
   ============================================================ */
const NOTE_CATS=['干货技巧类','带货运营类','内容创作类','剪辑制作类','博主人设类'];
const NOTE_PALETTE=['#ff4d8d','#ff8a00','#ffd400','#22c55e','#3b82f6','#8b5cf6','#111827','#ec4899'];
const HL_PALETTE=['#fff3a0','#ffd6e7','#c7f9d4','#cfe3ff','#eadcff','#ffe0b3'];
const NOTE_EMOJIS=['😀','😂','😍','🤔','👍','🎉','🔥','💡','✨','🌸','📈','💰','🎬','✂️','📌','❤️','😎','🥰','🤩','💪'];
let notesState={ curId:null, search:'', filter:'全部', tool:'select', markColor:'#ff4d8d', markWidth:4, selMarkId:null, marksWorking:[], libFilter:'', libTempMedia:[] };
let _draw=null, _markDrag=null;
function ensureNotes(){ if(!S.media.notes) S.media.notes=[]; }
function notesStripTags(html){ const d=document.createElement('div'); d.innerHTML=html||''; return (d.textContent||'').replace(/\s+/g,' ').trim(); }
function notesClassify(text){
  const t=(text||'').toLowerCase();
  const map={
    '干货技巧类':['技巧','干货','方法','教程','运营','涨粉','变现','选题','脚本','复盘','流程','sop','数据'],
    '带货运营类':['带货','电商','产品','佣金','选品','直播','销量','转化','gmv','购买','种草','客单'],
    '内容创作类':['创作','文案','脚本','选题','灵感','拍摄','人设','故事','开头','内容','钩子','标题'],
    '剪辑制作类':['剪辑','剪映','特效','转场','调色','配乐','字幕','bgm','pr','达芬奇','后期','音频'],
    '博主人设类':['人设','定位','账号','ip','价值观','风格','性格','slogan','标签','调性']
  };
  let best='内容创作类', bestN=0;
  for(const cat in map){ const n=map[cat].filter(k=>t.includes(k)).length; if(n>bestN){bestN=n;best=cat;} }
  return best;
}
function notesEffCat(n){ return (n.cat==='自动')?notesClassify(n.title+' '+notesStripTags(n.html)):n.cat; }
function notesBuildTOC(html){
  const d=document.createElement('div'); d.innerHTML=html||'';
  const hs=d.querySelectorAll('h1,h2,h3'); const out=[];
  hs.forEach(h=>{ out.push({level:h.tagName==='H1'?1:h.tagName==='H2'?2:3, text:(h.textContent||'').trim().slice(0,40)||'(无标题)'}); });
  return out;
}
function notesSaveCurrent(){
  if(!notesState.curId) return;
  const n=S.media.notes.find(x=>x.id===notesState.curId); if(!n) return;
  const c=$('#notesContent'); if(c) n.html=c.innerHTML;
  const ti=$('#notesTitle'); if(ti) n.title=ti.value.trim()||'未命名笔记';
  if(notesState.marksWorking) n.marks=notesState.marksWorking.slice();
  n.updatedAt=Date.now();
  save();
}
function openNotes(){
  ensureNotes();
  let ov=$('#notesOverlay');
  if(!ov){
    ov=document.createElement('div'); ov.id='notesOverlay'; ov.className='notes-overlay'; ov.hidden=true;
    ov.innerHTML=`<div class="notes-bar"><div class="notes-bar-l">📒 自媒体学习笔记手册</div><div class="notes-bar-r"><button class="btn sm ghost" data-nact="nn-close">收起 ✕</button></div></div><div class="notes-body"><div id="notesLeft" class="notes-left"></div><div id="notesRight" class="notes-right"></div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e=>{ e.stopPropagation(); notesOnClick(e); });
    ov.addEventListener('input', notesOnInput);
    ov.addEventListener('change', notesOnChange);
    ov.addEventListener('mousedown', e=>{ if(e.target.closest('.ntb')) e.preventDefault(); });
    window.addEventListener('resize', notesSyncMarkSize);
  }
  ov.hidden=false;
  if(!notesState.curId && S.media.notes[0]) notesState.curId=S.media.notes[0].id;
  const cur=S.media.notes.find(x=>x.id===notesState.curId);
  notesState.marksWorking=cur?(cur.marks||[]).slice():[];
  renderNotesLeft(); renderNotesRight();
}
function closeNotes(){ notesSaveCurrent(); const ov=$('#notesOverlay'); if(ov) ov.hidden=true; closeNotesPop(); }
function renderNotesLeft(){
  ensureNotes();
  const box=$('#notesLeft'); if(!box) return;
  const q=notesState.search.trim().toLowerCase();
  const eff=n=>(n.cat==='自动')?notesClassify(n.title+' '+notesStripTags(n.html)):n.cat;
  const list=S.media.notes.filter(n=>{
    if(notesState.filter!=='全部' && eff(n)!==notesState.filter) return false;
    if(q) return (n.title+' '+notesStripTags(n.html)).toLowerCase().includes(q);
    return true;
  });
  const chips=['全部'].concat(NOTE_CATS).map(c=>`<button class="nn-chip ${notesState.filter===c?'on':''}" data-nact="nn-filter" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  const cards=list.length?list.map(n=>{
    const txt=notesStripTags(n.html);
    let disp = q ? (txt.toLowerCase().indexOf(q)>=0 ? txt.slice(Math.max(0,txt.toLowerCase().indexOf(q)-10), txt.toLowerCase().indexOf(q)+50) : txt.slice(0,48)) : txt.slice(0,48);
    return `<div class="nn-card ${n.id===notesState.curId?'on':''}" data-nact="nn-open" data-nid="${n.id}">
      <div class="nn-card-top"><span class="nn-cat">${esc(eff(n))}</span>${n.id===notesState.curId?'<span class="nn-cur">编辑中</span>':''}</div>
      <div class="nn-card-title">${esc(n.title||'未命名')}</div>
      <div class="nn-card-snip">${esc(disp)||'（空白笔记）'}</div>
      <div class="nn-card-del" data-nact="nn-del" data-nid="${n.id}" title="删除">🗑</div>
    </div>`;
  }).join('') : '<div class="muted" style="padding:16px">还没有笔记，点「+ 新建笔记」开始记录吧~</div>';
  let tocHtml='';
  if(notesState.curId){ const n=S.media.notes.find(x=>x.id===notesState.curId); const toc=notesBuildTOC(n?n.html:'');
    tocHtml=`<div class="nn-toc"><div class="nn-toc-title">📑 本笔记目录</div>${toc.length?toc.map((it,i)=>`<div class="nn-toc-item lv${it.level}" data-nact="nn-toc" data-idx="${i}">${esc(it.text)}</div>`).join(''):'<div class="muted" style="font-size:12px">用 H1/H2/H3 排版后自动生成目录</div>'}</div>`;
  }
  box.innerHTML=`
    <div class="nn-search"><input class="inp" id="nnSearch" placeholder="🔍 全文检索笔记…" value="${esc(notesState.search)}"></div>
    <div class="nn-chips">${chips}</div>
    <button class="btn purple sm" data-nact="nn-new" style="margin:4px 0 10px">+ 新建笔记</button>
    <div class="nn-list">${cards}</div>
    ${tocHtml}`;
  const s=$('#nnSearch'); if(s) s.oninput=()=>{ notesState.search=s.value; renderNotesLeft(); };
}
function renderNotesRight(){
  const box=$('#notesRight'); if(!box) return;
  const n=S.media.notes.find(x=>x.id===notesState.curId);
  if(!n){ box.innerHTML=`<div class="nn-empty"><div style="font-size:48px">📝</div><div class="muted">从左侧选择或新建一篇笔记开始记录</div></div>`; return; }
  if(!notesState.marksWorking) notesState.marksWorking=(n.marks||[]).slice();
  const tools=[['select','↖ 选择'],['pen','✏️ 画笔'],['line','／ 直线'],['rect','▭ 矩形'],['ellipse','◯ 椭圆']];
  box.innerHTML=`
    <div class="nn-toolbar">
      <div class="nn-tool-group">
        <input class="inp sm" id="notesTitle" value="${esc(n.title||'')}" placeholder="笔记标题" style="width:170px;font-weight:800">
        <select class="inp sm" id="nnCat" data-nact="nn-cat" style="width:118px">
          <option value="自动" ${n.cat==='自动'?'selected':''}>自动分类</option>
          ${NOTE_CATS.map(c=>`<option value="${c}" ${n.cat===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="nn-tool-group">
        <button class="ntb" data-nact="nn-h1">H1</button>
        <button class="ntb" data-nact="nn-h2">H2</button>
        <button class="ntb" data-nact="nn-h3">H3</button>
        <button class="ntb" data-nact="nn-bold"><b>B</b></button>
        <button class="ntb" data-nact="nn-italic"><i>I</i></button>
        <button class="ntb" data-nact="nn-ul">• 列表</button>
        <button class="ntb" data-nact="nn-ol">1. 列表</button>
        <button class="ntb" data-nact="nn-font">字号</button>
        <button class="ntb" data-nact="nn-color">A 颜色</button>
        <button class="ntb" data-nact="nn-hl">🖍 高亮</button>
        <button class="ntb" data-nact="nn-emoji">😊</button>
        <button class="ntb" data-nact="nn-img">🖼 图片</button>
      </div>
      <div class="nn-tool-group">
        <span class="muted" style="font-size:12px">标注：</span>
        ${tools.map(t=>`<button class="ntb ${notesState.tool===t[0]?'on':''}" data-nact="nn-tool" data-tool="${t[0]}">${t[1]}</button>`).join('')}
        <input type="color" id="nnMarkColor" value="${notesState.markColor}" style="width:30px;height:30px;border:none;background:none;vertical-align:middle" title="标注颜色">
        <select id="nnMarkW" class="inp sm" style="width:60px"><option value="2">细</option><option value="4" selected>中</option><option value="7">粗</option></select>
        <button class="ntb" data-nact="nn-clear-marks">清空标注</button>
        <button class="ntb" data-nact="nn-del-mark">删除选中</button>
      </div>
      <div class="nn-tool-group">
        <button class="btn purple sm" data-nact="nn-save">💾 保存笔记</button>
      </div>
      <input type="file" id="nnImgInput" accept="image/*" style="display:none">
    </div>
    <div class="notes-scroll" id="notesScroll">
      <div class="notes-content" id="notesContent" contenteditable="true" spellcheck="false">${n.html||''}</div>
      <div class="notes-marks" id="notesMarks"></div>
      <div class="notes-markbar" id="notesMarkBar"></div>
    </div>`;
  const c=$('#notesContent');
  c.oninput=()=>{ notesSyncMarkSize(); };
  c.onblur=()=>{ notesSaveCurrent(); renderNotesLeft(); };
  const ti=$('#notesTitle'); ti.oninput=()=>{ const nn=S.media.notes.find(x=>x.id===notesState.curId); if(nn){nn.title=ti.value; save();} renderNotesLeft(); };
  $('#nnMarkColor').oninput=()=>{ notesState.markColor=$('#nnMarkColor').value; };
  $('#nnMarkW').onchange=()=>{ notesState.markWidth=+$('#nnMarkW').value; };
  const img=$('#nnImgInput'); img.onchange=()=>{ const f=img.files[0]; if(!f)return; const rd=new FileReader(); rd.onload=()=>{ c.focus(); try{document.execCommand('insertImage',false,rd.result);}catch(_){} notesSaveCurrent(); }; rd.readAsDataURL(f); };
  const layer=$('#notesMarks');
  layer.addEventListener('pointerdown', notesMarkDown);
  layer.addEventListener('pointermove', notesMarkMove);
  layer.addEventListener('pointerup', notesMarkUp);
  layer.addEventListener('pointercancel', notesMarkUp);
  notesSyncMarkSize();
  renderNotesMarks();
}
function notesSyncMarkSize(){
  const sc=$('#notesScroll'), layer=$('#notesMarks'), c=$('#notesContent');
  if(!sc||!layer||!c) return;
  const w=Math.max(sc.clientWidth-4, c.scrollWidth);
  const h=Math.max(sc.clientHeight-4, c.scrollHeight);
  layer.style.width=w+'px'; layer.style.height=h+'px';
}
function notesMarkInner(m){
  const w=Math.max(m.w,1), h=Math.max(m.h,1);
  if(m.type==='pen'){ const pts=(m.pts||[]).map(p=>p.join(',')).join(' '); return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="var(--mc)" stroke-width="var(--mw)" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  if(m.type==='line'){ const p=(m.pts||[]); const a=p[0]||[0,0], b=p[1]||[w,h]; return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--mc)" stroke-width="var(--mw)" stroke-linecap="round"/></svg>`; }
  if(m.type==='rect'){ return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><rect x="1" y="1" width="${Math.max(w-2,1)}" height="${Math.max(h-2,1)}" fill="none" stroke="var(--mc)" stroke-width="var(--mw)"/></svg>`; }
  if(m.type==='ellipse'){ return `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><ellipse cx="${w/2}" cy="${h/2}" rx="${Math.max(w/2-1,1)}" ry="${Math.max(h/2-1,1)}" fill="none" stroke="var(--mc)" stroke-width="var(--mw)"/></svg>`; }
  return '';
}
function renderNotesMarks(draft){
  const layer=$('#notesMarks'); if(!layer) return;
  layer.style.pointerEvents=(notesState.tool==='select')?'none':'auto';
  let arr=(notesState.marksWorking||[]).slice();
  if(draft){ const dm=notesFinalizeMark(draft); if(dm) arr.push(dm); }
  layer.innerHTML=arr.map(m=>{
    const sel=m.id===notesState.selMarkId;
    return `<div class="mark-svg ${sel?'sel':''}" data-mid="${m.id}" style="left:${m.x}px;top:${m.y}px;width:${Math.max(m.w,1)}px;height:${Math.max(m.h,1)}px;--mc:${m.color};--mw:${m.strokeWidth}px">${notesMarkInner(m)}</div>`;
  }).join('');
  const bar=$('#notesMarkBar');
  if(bar){
    const sel=(notesState.marksWorking||[]).find(z=>z.id===notesState.selMarkId);
    if(sel){
      bar.style.display='flex';
      bar.style.left=Math.max(0,sel.x)+'px';
      bar.style.top=Math.max(0,sel.y-46)+'px';
      bar.innerHTML=`<span class="muted" style="font-size:11px">标注样式</span>`+
        NOTE_PALETTE.map(c=>`<button class="mb-sw ${sel.color===c?'on':''}" data-nact="nn-mark-color" data-c="${c}" style="background:${c}"></button>`).join('')+
        `<select class="inp sm" data-nact="nn-mark-w" style="width:58px"><option value="2" ${sel.strokeWidth==2?'selected':''}>细</option><option value="4" ${sel.strokeWidth==4?'selected':''}>中</option><option value="7" ${sel.strokeWidth==7?'selected':''}>粗</option></select>`+
        `<button class="ntb" data-nact="nn-mark-del">删除</button>`;
    } else { bar.style.display='none'; }
  }
}
function notesFinalizeMark(d){
  const pts=d.pts; if(!pts||!pts.length) return null;
  if(d.type==='pen' && !d.moved) return null;
  if(d.type==='rect'||d.type==='ellipse'){
    const ex=d.pts[d.pts.length-1][0], ey=d.pts[d.pts.length-1][1];
    const x=Math.min(d.x0,ex), y=Math.min(d.y0,ey), w=Math.abs(ex-d.x0), h=Math.abs(ey-d.y0);
    if(w<5&&h<5) return null;
    return {id:uid(),type:d.type,x,y,w,h,pts:[[0,0],[w,0],[w,h],[0,h]],color:d.color,strokeWidth:d.strokeWidth};
  }
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
  const minX=Math.min(...xs), minY=Math.min(...ys), maxX=Math.max(...xs), maxY=Math.max(...ys);
  const w=Math.max(maxX-minX,4), h=Math.max(maxY-minY,4);
  const rel=pts.map(p=>[p[0]-minX,p[1]-minY]);
  return {id:uid(),type:d.type,x:minX,y:minY,w,h,pts:rel,color:d.color,strokeWidth:d.strokeWidth};
}
function notesMarkDown(e){
  const layer=$('#notesMarks'); if(!layer) return;
  const r=layer.getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top;
  if(notesState.tool==='select'){
    const mk=e.target.closest('[data-mid]');
    if(mk){ const id=mk.getAttribute('data-mid'); const m=(notesState.marksWorking||[]).find(z=>z.id===id);
      if(m){ notesState.selMarkId=id; const sx=x-m.x, sy=y-m.y; _markDrag={m,sx,sy}; try{layer.setPointerCapture(e.pointerId);}catch(_){} renderNotesMarks(); e.preventDefault(); } }
    else { notesState.selMarkId=null; renderNotesMarks(); }
    return;
  }
  e.preventDefault();
  try{layer.setPointerCapture(e.pointerId);}catch(_){}
  _draw={type:notesState.tool, x0:x, y0:y, pts:[[x,y]], moved:false, color:notesState.markColor, strokeWidth:notesState.markWidth};
}
function notesMarkMove(e){
  const layer=$('#notesMarks'); if(!layer) return;
  const r=layer.getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top;
  if(_markDrag){ const m=_markDrag.m; m.x=Math.round(x-_markDrag.sx); m.y=Math.round(y-_markDrag.sy); renderNotesMarks(); return; }
  if(_draw){ _draw.pts.push([x,y]); if(Math.abs(x-_draw.x0)>3||Math.abs(y-_draw.y0)>3) _draw.moved=true; renderNotesMarks(_draw); }
}
function notesMarkUp(e){
  const layer=$('#notesMarks'); if(!layer) return;
  if(_markDrag){ _markDrag=null; notesSaveCurrent(); return; }
  if(_draw){ const r=layer.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top; _draw.pts.push([x,y]); const m=notesFinalizeMark(_draw); if(m){ notesState.marksWorking=notesState.marksWorking||[]; notesState.marksWorking.push(m); notesState.selMarkId=m.id; } _draw=null; renderNotesMarks(); notesSaveCurrent(); }
}
function nExec(cmd,val){ const c=$('#notesContent'); if(!c)return; c.focus(); try{document.execCommand('styleWithCSS',false,true);}catch(_){} try{document.execCommand(cmd,false,val);}catch(_){} notesSaveCurrent(); }
function nFontSize(px){ const c=$('#notesContent'); if(!c)return; c.focus(); const sel=window.getSelection(); if(!sel.rangeCount)return; const range=sel.getRangeAt(0); const span=document.createElement('span'); span.style.fontSize=px+'px'; try{ span.appendChild(range.extractContents()); range.insertNode(span); }catch(_){} sel.removeAllRanges(); notesSaveCurrent(); }
function nInsertText(t){ const c=$('#notesContent'); if(!c)return; c.focus(); try{document.execCommand('insertText',false,t);}catch(_){} notesSaveCurrent(); }
function notesOpenPop(anchor, buildItems, onPick){
  closeNotesPop();
  const pop=document.createElement('div'); pop.className='notes-pop'; pop.id='notesPop';
  pop.innerHTML=buildItems();
  document.body.appendChild(pop);
  const r=anchor.getBoundingClientRect();
  pop.style.left=Math.min(r.left, window.innerWidth-230)+'px';
  pop.style.top=(r.bottom+6)+'px';
  pop.addEventListener('mousedown', ev=>ev.preventDefault());
  pop.addEventListener('click', ev=>{ const it=ev.target.closest('[data-pick]'); if(!it)return; onPick(it.getAttribute('data-pick')); closeNotesPop(); });
}
function closeNotesPop(){ const p=$('#notesPop'); if(p) p.remove(); }
function notesOnInput(e){ /* 搜索/标题等已在各自 oninput 处理，此处留空 */ }
function notesOnChange(e){
  const t=e.target.closest('[data-nact]'); if(!t) return;
  if(t.dataset.nact==='nn-cat'){ const n=S.media.notes.find(x=>x.id===notesState.curId); if(n){ n.cat=t.value; save(); } renderNotesLeft(); }
}
function notesOnClick(e){
  const t=e.target.closest('[data-nact]'); if(!t) return;
  const act=t.dataset.nact;
  if(act==='nn-close'){ closeNotes(); return; }
  if(act==='nn-new'){
    notesSaveCurrent(); ensureNotes();
    const n={id:uid(),title:'新笔记',html:'',cat:'自动',createdAt:Date.now(),updatedAt:Date.now(),marks:[]};
    S.media.notes.unshift(n); notesState.curId=n.id; notesState.selMarkId=null; notesState.marksWorking=[];
    renderNotesLeft(); renderNotesRight(); return;
  }
  if(act==='nn-open'){ notesSaveCurrent(); notesState.curId=t.dataset.nid; notesState.selMarkId=null; const n=S.media.notes.find(x=>x.id===notesState.curId); notesState.marksWorking=n.marks?n.marks.slice():[]; renderNotesLeft(); renderNotesRight(); return; }
  if(act==='nn-del'){ const id=t.dataset.nid; if(!confirm('确定删除这篇笔记？此操作不可恢复。')) return; S.media.notes=S.media.notes.filter(x=>x.id!==id); if(notesState.curId===id){ notesState.curId=null; notesState.marksWorking=[]; } renderNotesLeft(); renderNotesRight(); return; }
  if(act==='nn-filter'){ notesState.filter=t.dataset.cat; renderNotesLeft(); return; }
  if(act==='nn-toc'){ const c=$('#notesContent'); if(!c)return; const hs=c.querySelectorAll('h1,h2,h3'); const el=hs[+t.dataset.idx]; if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); return; }
  if(act==='nn-save'){ notesSaveCurrent(); toast('笔记已保存 💾'); return; }
  if(act==='nn-tool'){ notesSaveCurrent(); notesState.tool=t.dataset.tool; renderNotesRight(); return; }
  if(act==='nn-clear-marks'){ notesState.marksWorking=[]; notesState.selMarkId=null; renderNotesMarks(); notesSaveCurrent(); return; }
  if(act==='nn-del-mark'){ if(notesState.selMarkId){ notesState.marksWorking=(notesState.marksWorking||[]).filter(m=>m.id!==notesState.selMarkId); notesState.selMarkId=null; renderNotesMarks(); notesSaveCurrent(); } return; }
  if(act==='nn-mark-color'){ if(notesState.selMarkId){ const m=(notesState.marksWorking||[]).find(z=>z.id===notesState.selMarkId); if(m){ m.color=t.dataset.c; notesState.markColor=t.dataset.c; renderNotesMarks(); notesSaveCurrent(); } } return; }
  if(act==='nn-mark-w'){ if(notesState.selMarkId){ const m=(notesState.marksWorking||[]).find(z=>z.id===notesState.selMarkId); const w=t.value?+t.value:+(t.dataset.w||4); if(m){ m.strokeWidth=w; notesState.markWidth=w; renderNotesMarks(); notesSaveCurrent(); } } return; }
  if(act==='nn-mark-del'){ if(notesState.selMarkId){ notesState.marksWorking=(notesState.marksWorking||[]).filter(m=>m.id!==notesState.selMarkId); notesState.selMarkId=null; renderNotesMarks(); notesSaveCurrent(); } return; }
  if(act==='nn-bold'){ nExec('bold'); return; }
  if(act==='nn-italic'){ nExec('italic'); return; }
  if(act==='nn-ul'){ nExec('insertUnorderedList'); return; }
  if(act==='nn-ol'){ nExec('insertOrderedList'); return; }
  if(act==='nn-h1'){ nExec('formatBlock','h1'); return; }
  if(act==='nn-h2'){ nExec('formatBlock','h2'); return; }
  if(act==='nn-h3'){ nExec('formatBlock','h3'); return; }
  if(act==='nn-font'){ notesOpenPop(t, ()=>['14','18','22','28','36'].map(p=>`<div class="np-item" data-pick="${p}">${p}px</div>`).join(''), p=>nFontSize(+p)); return; }
  if(act==='nn-color'){ notesOpenPop(t, ()=>NOTE_PALETTE.map(c=>`<div class="np-item" data-pick="${c}" style="color:${c};font-weight:800">A ${c}</div>`).join(''), c=>nExec('foreColor',c)); return; }
  if(act==='nn-hl'){ notesOpenPop(t, ()=>HL_PALETTE.map(c=>`<div class="np-item" data-pick="${c}" style="background:${c}">高亮</div>`).join(''), c=>nExec('hiliteColor',c)); return; }
  if(act==='nn-emoji'){ notesOpenPop(t, ()=>NOTE_EMOJIS.map(em=>`<div class="np-emoji" data-pick="${em}">${em}</div>`).join(''), em=>nInsertText(em)); return; }
  if(act==='nn-img'){ const inp=$('#nnImgInput'); if(inp) inp.click(); return; }
}
/* 渲染内联媒体容器（避免模板字面量内异步） */
function renderMediaThumbsInline(media,editable){
  if(!media||!media.length) return '';
  return `<div class="media-thumb-inline" data-inline-media='${JSON.stringify(media).replace(/'/g,"&#39;")}'></div>`;
}
/* 在内容渲染后调用：解析 data-inline-media 并把缩略图绘制进去 */
function loadInlineMedia(){
  $$('[data-inline-media]').forEach(el=>{
    try{
      const media=JSON.parse(el.dataset.inlineMedia);
      renderMediaThumbs(media,false,el,null);
    }catch(e){ /* 忽略损坏数据 */ }
  });
}
/* 渲染后调用：为书籍封面加载真实图片 */
function loadBookCovers(){
  $$('[data-cover-id]').forEach(el=>loadCoverImg(el,el.dataset.coverId));
}
/* 列表项内联媒体（只读缩略图） */
function mediaInlineHTML(r){
  return (r&&r.media&&r.media.length)?renderMediaThumbsInline(r.media,false):'';
}
function renderNoteSection(key,label,b){
  const notes=(b.notes&&b.notes[key])||[];
  return `<div class="note-section">
    <div class="note-section-head"><strong>${label}</strong><button class="btn ghost sm" data-act="rd-note-add" data-bid="${b.id}" data-nkey="${key}">+ 添加</button></div>
    <div class="note-list">
      ${notes.map(n=>`
        <div class="note-item">
          <div class="note-text">${esc(n.text)}</div>
          ${n.page?`<span class="muted" style="font-size:11px">p.${n.page}</span>`:''}
          ${n.media&&n.media.length?renderMediaThumbsInline(n.media,false):''}
          <div class="note-actions"><button class="btn danger sm" data-act="rd-note-del" data-bid="${b.id}" data-nkey="${key}" data-nid="${n.id}">删</button></div>
        </div>`).join('')||'<div class="muted" style="font-size:12px;padding:6px 0">暂无记录</div>'}
    </div>
  </div>`;
}

/* ---------- 12. 备忘录 ---------- */
let memoMedia=[];          // 当前编辑中的媒体
let editingMemoId=null;    // 正在编辑的备忘录 id（null 表示新增）
function bindMemoMedia(){
  const zone=$('#memoMediaZone');
  if(zone) bindMediaUpload(zone,memoMedia,(m)=>{memoMedia=m;});
}
function renderMemo(){
  const list=S.memo.slice().sort((a,b)=>b.createdAt-a.createdAt);
  const edit=editingMemoId?S.memo.find(x=>x.id===editingMemoId):null;
  let remindDate='',remindTime='';
  if(edit&&edit.remind){
    const parts=edit.remind.split(' ');
    remindDate=parts[0]||'';remindTime=parts[1]||'';
  }
  return `<div class="card">
    ${header('memo','备忘录')}
    <div class="muted">${edit?'正在编辑备忘录…':'随手记点东西…'}</div>
    <textarea class="txtarea" id="memoInput" placeholder="临时想法、待提醒事项…" style="margin-top:6px">${esc(edit?edit.text:'')}</textarea>
    <div class="row" style="align-items:flex-end;margin-top:10px">
      <div style="flex:1"><div class="muted">提醒日期</div><input class="inp" type="date" id="memoDate" value="${esc(remindDate)}"></div>
      <div style="flex:1"><div class="muted">提醒时间</div><input class="inp" type="time" id="memoTime" value="${esc(remindTime)}"></div>
      <div style="flex:1"><div class="muted">重要等级</div>
        <select class="inp" id="memoImp"><option value="normal" ${edit&&edit.important==='normal'?'selected':''}>普通</option><option value="important" ${edit&&edit.important==='important'?'selected':''}>重要</option><option value="urgent" ${edit&&edit.important==='urgent'?'selected':''}>紧急</option></select></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" data-act="memo-save">${editingMemoId?'更新备忘录':'保存'}</button>
      ${editingMemoId?'<button class="btn ghost" data-act="memo-cancel">取消编辑</button>':''}
    </div>
    <div class="muted" style="margin-top:12px;font-weight:700">附件图片 / 视频</div>
    ${mediaUploadHTML([],'memoMediaZone')}
    <div class="sub-title">全部备忘录</div>
    <div id="memoList">
      ${list.length?list.map(m=>`
        <div class="list-item">
          <span class="check ${m.done?'on':''}" data-act="memo-toggle" data-id="${m.id}"></span>
          <div class="li-main">
            <div class="${m.done?'done-text':''}" style="white-space:pre-wrap;line-height:1.6">${esc(m.text)}</div>
            <div class="muted" style="margin-top:4px">
              ${new Date(m.createdAt).toLocaleString('zh-CN')}
              ${m.remind?`· ⏰ ${m.remind}`:''}
              ${m.important!=='normal'?`· <span class="tag" style="background:#ffe0e0;color:#e06a6a">${m.important==='urgent'?'紧急':'重要'}</span>`:''}
            </div>
            ${mediaInlineHTML(m)}
          </div>
          <div class="li-actions"><button class="btn ghost sm" data-act="memo-edit" data-id="${m.id}">编辑</button><button class="btn danger sm" data-act="memo-del" data-id="${m.id}">删</button></div>
        </div>`).join(''):emptySVG('clip')+'<div class="empty">还没有备忘录，记下第一条吧~</div>'}
    </div>
  </div>`;
}

/* ============================================================
   通用：弹窗 / Toast
   ============================================================ */
function openModal(title,bodyHTML,footHTML,onMount){
  $('#modalTitle').innerHTML=title;
  $('#modalBody').innerHTML=bodyHTML;
  $('#modalFoot').innerHTML=footHTML||'';
  $('#modalMask').hidden=false;
  if(onMount) onMount($('#modalBody'),$('#modalFoot'));
}
function closeModal(){$('#modalMask').hidden=true;$('#modalBody').innerHTML='';}
function toast(msg,kind=''){
  const w=$('#toastWrap');
  const t=document.createElement('div');
  t.className='toast '+(kind==='remind'?'remind':'');
  t.innerHTML=msg;w.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(40px)';setTimeout(()=>t.remove(),300);},3600);
}

/* ============================================================
   悬浮新增按钮（按模块）
   ============================================================ */
function addRecord(mod, editId, presetType){
  switch(mod){
    case 'todo':{
      const id=uid();S.todos.push({id,text:'新待办',done:false,stars:0});save();renderModule();break;}
    case 'ledger':{
      const r = editId ? S.ledger.find(x=>x.id===editId) : null;
      const pType = r ? r.type : (presetType||'expense');
      let media = r ? (r.media||[]) : [];
      openModal(kitty('#d7a8ef',26)+(r?' 编辑记账':' 新增记账'),`
        <div class="row">
          <div style="flex:1"><div class="muted">类型</div>
            <select class="inp" id="lgType"><option value="expense" ${pType!=='income'?'selected':''}>支出</option><option value="income" ${pType==='income'?'selected':''}>收入</option></select></div>
          <div style="flex:1"><div class="muted">金额</div><input class="inp" id="lgAmt" type="number" placeholder="0.00" value="${r?r.amount:''}"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">分类</div><input class="inp" id="lgCat" placeholder="饮食/购物/学习…" value="${esc(r?r.category:'')}"></div>
          <div style="flex:1"><div class="muted">日期</div><input class="inp" id="lgDate" type="date" value="${esc(r?r.date:todayKey())}"></div>
        </div>
        <div class="muted" style="margin-top:10px">备注</div>
        <input class="inp" id="lgNote" placeholder="可选" value="${esc(r?r.note:'')}">
        <div class="muted" style="margin-top:10px;font-weight:700">凭证图片 / 视频</div>
        ${mediaUploadHTML([],'ledgerMedia')}`,
        `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="ledger-save">保存</button>`,
        ()=>{
          bindMediaUpload($('#ledgerMedia'),media,(m)=>{media=m;});
          $('#modalFoot').querySelector('[data-act=ledger-save]').onclick=()=>{
            const amt=parseFloat($('#lgAmt').value);if(isNaN(amt)){toast('请输入金额');return;}
            const rec = r ? r : {id:uid()};
            rec.type=$('#lgType').value;rec.amount=amt;rec.category=$('#lgCat').value||'其他';
            rec.note=$('#lgNote').value;rec.date=$('#lgDate').value||todayKey();rec.media=media;
            if(!r) S.ledger.push(rec);
            save();closeModal();renderModule();
          };
        });
      break;}
    case 'exercise':{
      const r = editId ? S.exercise.records.find(x=>x.id===editId) : null;
      let media = r ? (r.media||[]) : [];
      openModal(kitty('#ff9ec4',26)+(r?' 编辑运动记录':' 新增运动记录'),`
        <div class="row">
          <div style="flex:1"><div class="muted">运动项目</div><input class="inp" id="exName" placeholder="如 慢跑" value="${esc(r?r.name:(S.exercise.lastType||''))}"></div>
          <div style="flex:1"><div class="muted">日期</div><input class="inp" id="exDate" type="date" value="${esc(r?r.date:todayKey())}"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">时长(分钟)</div><input class="inp" id="exDur" type="number" placeholder="30" value="${r?r.duration:''}"></div>
          <div style="flex:1"><div class="muted">消耗(kcal)</div><input class="inp" id="exCal" type="number" placeholder="200" value="${r?r.calories:''}"></div>
        </div>
        <div class="muted" style="margin-top:10px;font-weight:700">打卡截图 / 视频</div>
        ${mediaUploadHTML([],'exMedia')}`,
        `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="ex-save">保存</button>`,
        ()=>{
          bindMediaUpload($('#exMedia'),media,(m)=>{media=m;});
          $('#modalFoot').querySelector('[data-act=ex-save]').onclick=()=>{
            const rec = r ? r : {id:uid()};
            rec.name=$('#exName').value||'运动';rec.date=$('#exDate').value||todayKey();
            rec.duration=$('#exDur').value||0;rec.calories=$('#exCal').value||0;rec.media=media;
            if(!r) S.exercise.records.push(rec);
            save();closeModal();renderModule();
          };
        });
      break;}
    case 'media':{
      const posts=curMedia().posts;
      const p = editId ? posts.find(x=>x.id===editId) : null;
      let media = p ? (p.media||[]) : [];
      openModal(kitty('#ffb0e0',26)+(p?' 编辑发布记录':' 新增发布记录'),`
        <div class="row">
          <div style="flex:1"><div class="muted">发布日期</div><input class="inp" id="pDate" type="date" value="${esc(p?p.date:todayKey())}"></div>
          <div style="flex:1"><div class="muted">作品主题</div><input class="inp" id="pTopic" placeholder="主题" value="${esc(p?p.topic:'')}"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">浏览量</div><input class="inp" id="pViews" type="number" value="${p?p.views:''}"></div>
          <div style="flex:1"><div class="muted">点赞量</div><input class="inp" id="pLikes" type="number" value="${p?p.likes:''}"></div>
          <div style="flex:1"><div class="muted">评论量</div><input class="inp" id="pComments" type="number" value="${p?p.comments:''}"></div>
        </div>
        <div class="muted" style="margin-top:10px;font-weight:700">作品图片 / 视频</div>
        ${mediaUploadHTML([],'postMedia')}`,
        `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="post-save">保存</button>`,
        ()=>{
          bindMediaUpload($('#postMedia'),media,(m)=>{media=m;});
          $('#modalFoot').querySelector('[data-act=post-save]').onclick=()=>{
            const rec = p ? p : {id:uid(),published:false,quality:'',review:''};
            rec.date=$('#pDate').value||todayKey();rec.topic=$('#pTopic').value||'未命名';
            rec.views=$('#pViews').value||0;rec.likes=$('#pLikes').value||0;rec.comments=$('#pComments').value||0;rec.media=media;
            if(!p) posts.push(rec);
            save();closeModal();renderModule();
          };
        });
      break;}
    case 'hot':{
      const h = editId ? findHot(editId) : null;
      let media = h ? (h.media||[]) : [];
      const plat = h ? h.platform : 'douyin';
      openModal(kitty('#ff8fd0',26)+(h?' 编辑热点':' 手动新增热点'),`
        <div class="row">
          <div style="flex:1"><div class="muted">平台</div><select class="inp" id="hPlat"><option value="douyin" ${plat==='douyin'?'selected':''}>抖音</option><option value="xhs" ${plat==='xhs'?'selected':''}>小红书</option></select></div>
          <div style="flex:1"><div class="muted">热度值</div><input class="inp" id="hHeat" placeholder="如 980w" value="${esc(h?h.heat:'')}"></div>
        </div>
        <div class="muted" style="margin-top:10px">内容主题</div>
        <input class="inp" id="hTopic" placeholder="热点标题" value="${esc(h?h.topic:'')}">
        <div class="muted" style="margin-top:10px">标签(逗号分隔)</div>
        <input class="inp" id="hTags" placeholder="vlog,美妆" value="${esc(h?(h.tags||[]).join(','):'')}">
        <div class="muted" style="margin-top:10px;font-weight:700">相关图片 / 视频</div>
        ${mediaUploadHTML([],'hotMedia')}`,
        `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="hot-save">保存</button>`,
        ()=>{
          bindMediaUpload($('#hotMedia'),media,(m)=>{media=m;});
          $('#modalFoot').querySelector('[data-act=hot-save]').onclick=()=>{
            const p=$('#hPlat').value;
            const rec = h ? h : {id:uid(),rank:(S.hot[p]||[]).length+1,suitable:false};
            rec.platform=p;rec.heat=$('#hHeat').value||'0';rec.topic=$('#hTopic').value||'新热点';
            rec.tags=$('#hTags').value.split(',').map(s=>s.trim()).filter(Boolean);rec.media=media;
            if(!h) (S.hot[p]=S.hot[p]||[]).push(rec);
            save();closeModal();if(hotPlatform===p)renderModule();else renderModule();
          };
        });
      break;}
    case 'video':{
      const v = editId ? S.video.find(x=>x.id===editId) : null;
      let media = v ? (v.media||[]) : [];
      openModal(kitty('#c5a3ff',26)+(v?' 编辑拆解笔记':' 新增拆解笔记'),`
        <div class="row">
          <div style="flex:1"><div class="muted">博主名称</div><input class="inp" id="vBlogger" value="${esc(v?v.blogger:'')}"></div>
          <div style="flex:1"><div class="muted">视频主题</div><input class="inp" id="vTopic" value="${esc(v?v.topic:'')}"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">视频时长</div><input class="inp" id="vDur" value="${esc(v?v.duration:'')}"></div>
          <div style="flex:1"><div class="muted">日期</div><input class="inp" id="vDate" type="date" value="${esc(v?v.date:todayKey())}"></div>
        </div>
        <div class="muted" style="margin-top:10px;font-weight:700">片段截图 / 视频</div>
        ${mediaUploadHTML([],'videoMedia')}`,
        `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="video-save">保存</button>`,
        ()=>{
          bindMediaUpload($('#videoMedia'),media,(m)=>{media=m;});
          $('#modalFoot').querySelector('[data-act=video-save]').onclick=()=>{
            const rec = v ? v : {id:uid(),predPlay:'',predLike:'',actPlay:'',actLike:'',structure:'',notes:'',materials:{effect:[],sfx:[],music:[],editing:[]}};
            rec.blogger=$('#vBlogger').value||'匿名';rec.topic=$('#vTopic').value||'未命名';
            rec.duration=$('#vDur').value;rec.date=$('#vDate').value||todayKey();rec.media=media;
            if(!v) S.video.push(rec);
            save();closeModal();renderModule();
          };
        });
      break;}
    case 'study':{
      const s = editId ? S.study.software.find(x=>x.id===editId) : null;
      let media = s ? (s.media||[]) : [];
      openModal(kitty('#ffa6cf',26)+(s?' 编辑软件技能':' 添加软件技能'),`
        <div class="row">
          <div style="flex:1"><div class="muted">软件名称</div><input class="inp" id="sfName" value="${esc(s?s.name:'')}"></div>
          <div style="flex:1"><div class="muted">学习日期</div><input class="inp" id="sfDate" type="date" value="${esc(s?s.date:todayKey())}"></div>
        </div>
        <div class="muted" style="margin-top:10px">SOP 步骤（分点）</div>
        <textarea class="txtarea" id="sfSop" placeholder="1. 打开软件&#10;2. 新建项目…">${esc(s?s.sop:'')}</textarea>
        <div class="muted" style="margin-top:10px;font-weight:700">截图 / 录屏</div>
        ${mediaUploadHTML([],'softMedia')}`,
        `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="soft-save">保存</button>`,
        ()=>{
          bindMediaUpload($('#softMedia'),media,(m)=>{media=m;});
          $('#modalFoot').querySelector('[data-act=soft-save]').onclick=()=>{
            const rec = s ? s : {id:uid()};
            rec.name=$('#sfName').value||'软件';rec.date=$('#sfDate').value||todayKey();rec.sop=$('#sfSop').value;rec.media=media;
            if(!s) S.study.software.push(rec);
            save();closeModal();renderModule();
          };
        });
      break;}
    case 'reading':{
      const b = editId ? S.reading.books.find(x=>x.id===editId) : null;
      let media = b ? (b.media||[]) : [];
      let cover = b ? b.cover : null;
      let coverMedia = cover ? [{id:cover,type:'image',name:'封面'}] : [];
      openModal(kitty('#c9a3ff',26)+(b?' 编辑书籍':' 新增阅读'),`
        <div class="muted" style="font-weight:700;margin-bottom:4px">封面</div>
        ${mediaUploadHTML([],'rdCoverZone')}
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">书名</div><input class="inp" id="rdTitle" value="${esc(b?b.title:'')}" placeholder="书名"></div>
          <div style="flex:1"><div class="muted">作者</div><input class="inp" id="rdAuthor" value="${esc(b?b.author:'')}"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">类型</div><input class="inp" id="rdType" value="${esc(b?b.type:'')}" placeholder="小说/技术/…"></div>
          <div style="flex:1"><div class="muted">状态</div>
            <select class="inp" id="rdStatus">
              <option value="reading" ${b&&b.status==='reading'?'selected':''}>在读</option>
              <option value="read" ${b&&b.status==='read'?'selected':''}>已读</option>
              <option value="wish" ${b&&b.status==='wish'?'selected':''}>想读</option>
            </select></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">进度模式</div>
            <select class="inp" id="rdProgMode">
              <option value="percent" ${!b||b.progressMode!=='pages'?'selected':''}>百分比</option>
              <option value="pages" ${b&&b.progressMode==='pages'?'selected':''}>页数</option>
            </select></div>
          <div style="flex:1"><div class="muted">进度值</div><input class="inp" id="rdProg" type="number" value="${b?b.progress||0:0}"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <div style="flex:1"><div class="muted">开始日期</div><input class="inp" id="rdStart" type="date" value="${esc(b?b.startDate:'')}"></div>
          <div style="flex:1"><div class="muted">结束日期</div><input class="inp" id="rdEnd" type="date" value="${esc(b?b.endDate:'')}"></div>
        </div>
        <div class="muted" style="margin-top:10px">摘要</div>
        <textarea class="txtarea" id="rdSummary" placeholder="一句话简介 / 读后感…">${esc(b?b.summary:'')}</textarea>
        <div class="muted" style="margin-top:10px;font-weight:700">书内图片 / 视频</div>
        ${mediaUploadHTML([],'rdMediaZone')}
      `,
      `<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="rd-save">保存</button>`,
      ()=>{
        bindMediaUpload($('#rdCoverZone'),coverMedia,(m)=>{coverMedia=m;cover=(m&&m[0]&&m[0].id)||null;});
        bindMediaUpload($('#rdMediaZone'),media,(m)=>{media=m;});
        $('#modalFoot').querySelector('[data-act=rd-save]').onclick=()=>{
          const book = b ? b : {id:uid(),notes:{},createdAt:Date.now()};
          book.title=$('#rdTitle').value||'未命名';
          book.author=$('#rdAuthor').value;
          book.type=$('#rdType').value;
          book.status=$('#rdStatus').value;
          book.progressMode=$('#rdProgMode').value;
          book.progress=+$('#rdProg').value||0;
          book.startDate=$('#rdStart').value;
          book.endDate=$('#rdEnd').value;
          book.summary=$('#rdSummary').value;
          book.cover=cover;
          book.media=media;
          if(!b) S.reading.books.push(book);
          save();closeModal();renderModule();
        };
      });
      break;}
    case 'memo':{
      $('#memoInput').focus();break;}
    case 'mood':{toast('在页面上拖动滑块选择心情即可~');break;}
    case 'schedule':{toast('点击日历日期格子即可添加当日日程~');break;}
    case 'diet':{toast('在上方录入三餐热量即可自动计算~');break;}
    case 'outfit':{ openClosetModal(null); break; }
    case 'intel':{ refreshIntel(); break; }
    case 'review':{ toast('在模板里直接填写，点「保存」即可~'); break; }
    case 'finance':{ openAssetModal(null,false); break; }
    default:renderModule();
  }
}

/* ============================================================
   事件绑定
   ============================================================ */
function bindGlobal(){
  $('#sidebar').addEventListener('click',e=>{
    if(e.target.closest('[data-act=nav-icon]')) return; // 图标上传已由元素自身处理
    if(e.target.closest('[data-act=nav-reset]')) return; // 恢复默认由元素自身处理
    const it=e.target.closest('[data-act=nav]');if(!it)return;
    current=it.dataset.id;renderNav();renderModule();
  });
  $('#fab').addEventListener('click',()=>addRecord(current));
  $('#modalClose').addEventListener('click',closeModal);
  $('#modalMask').addEventListener('click',e=>{if(e.target.id==='modalMask')closeModal();});
  $('#searchBtn').addEventListener('click',doSearch);
  $('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});
  $('#weatherPill').addEventListener('click',loadWeather);
  $('#settingsBtn').addEventListener('click',openSettings);
  // 内容区事件委托（只绑定一次，renderModule 仅替换 innerHTML）
  const c=$('#content');
  c.addEventListener('click',onContentClick);
  c.addEventListener('input',onContentInput);
  c.addEventListener('change',onContentChange);
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-act=lucky-close]')){ $('#luckyLayer').hidden=true; }
    if(e.target.closest('[data-act=modal-cancel]')){ closeModal(); }
  });
}

function onContentClick(e){
  const t=e.target.closest('[data-act]');if(!t)return;
  const act=t.dataset.act, id=t.dataset.id;
  switch(act){
    /* 内容区内的跨板块导航（如记账页跳转理财） */
    case 'nav':{ current=t.dataset.id; renderNav(); renderModule(); break; }
    /* 通用子 tab 切换（读 data-mod / data-sub） */
    case 'sub-tab':{ const _m=t.dataset.mod,_s=t.dataset.sub; if(_m==='todoSub'){S.todoSub=_s;save();renderModule();} else if(S[_m]){S[_m].sub=_s;save();renderModule();} break; }
    /* ====== 新板块事件（覆盖旧case优先匹配） ====== */
    /* 穿搭：灵感库 */
    case 'outfit-inspire-refresh':{refreshOutfitInspire().then(()=>{renderModule();toast('穿搭灵感已更新');});break;}
    case 'outfit-inspire-save':{const insp=(S.outfit.inspirations||[]).find(x=>x.id===id);if(insp){insp.saved=!insp.saved;save();renderModule();}break;}
    /* 穿搭：AI搭配师 */
    case 'outfit-ai-match':outfitAIMatch();break;
    case 'outfit-ai-hair':outfitAIHair();break;
    case 'outfit-ai-acc':outfitAIMatchAcc();break;
    case 'outfit-acc-add':{const n=prompt('配饰名称（如：珍珠项链）');if(!n)break;const ty=prompt('配饰类型（如：项链/耳环/手表）')||'';S.outfit.accessories=S.outfit.accessories||[];S.outfit.accessories.push({id:uid(),name:n,type:ty});save();renderModule();break;}
    case 'outfit-acc-del':{S.outfit.accessories=(S.outfit.accessories||[]).filter(x=>x.id!==id);save();renderModule();break;}
    /* 待办：习惯打卡 */
    case 'habit-water-toggle':{const h=S.habits||(S.habits={water:{done:false,date:''},supplements:[]});const k=todayKey();if(h.water.date!==k){h.water={done:false,date:k};}h.water.done=!h.water.done;h.water.date=k;save();renderModule();break;}
    case 'habit-supp-add':{const inp=$('#suppInput');const n=inp?inp.value.trim():'';if(!n){toast('请输入补剂名称');break;}S.habits.supplements=S.habits.supplements||[];S.habits.supplements.push({id:uid(),name:n,done:false,date:todayKey()});if(inp)inp.value='';save();renderModule();break;}
    case 'habit-supp-toggle':{const s=(S.habits.supplements||[]).find(x=>x.id===id);if(s){s.done=!s.done;save();renderModule();}break;}
    case 'habit-supp-del':{S.habits.supplements=(S.habits.supplements||[]).filter(x=>x.id!==id);save();renderModule();break;}
    /* 待办：历史展开/收起 */
    case 'todo-hist-toggle':{const a=(S.todoArchives||[]).find(x=>x.date===t.dataset.date);if(a){a._expanded=!a._expanded;renderModule();}break;}
    /* 待办：复盘子Tab切换 */
    case 'todo-review-tab':{S.todoReviewSub=t.dataset.sub;renderModule();break;}
    /* 待办：复盘保存 */
    case 'todo-review-save':{
      const sub=S.todoReviewSub||'weekly';
      const key={weekly:weekKey(),monthly:monthKey(),yearly:String(new Date().getFullYear())}[sub];
      const obj=S.todoReview[sub]=S.todoReview[sub]||{};
      const rec=obj[key]=obj[key]||{};
      $$('[data-act="todo-review-field"]').forEach(el=>{if(el.dataset.f)rec[el.dataset.f]=el.value;});
      save();toast('待办复盘已保存 ✨');
      break;
    }
    /* 复盘：AI汇总 + 保存（覆盖旧case） */
    case 'review-ai-gen':{reviewAIGen(t.dataset.scope);break;}
    case 'review-save':{const sub=S.review.sub||'daily';const key={daily:todayKey(),weekly:weekKey(),monthly:monthKey()}[sub];const obj=S.review[sub]=S.review[sub]||{};const rec=obj[key]=obj[key]||{};$$('[data-act="review-field"]').forEach(el=>{if(el.dataset.f)rec[el.dataset.f]=el.value;});save();toast('复盘已保存 ✨');break;}
    /* 复盘：板块复盘 */
    case 'review-mod-sel':{S.review.moduleSel=t.dataset.id;save();renderModule();break;}
    case 'review-mod-back':{S.review.moduleSel='';save();renderModule();break;}
    case 'review-mod-save':{const sel=S.review.moduleSel;if(!sel)break;const k=todayKey();S.review.moduleReviews=S.review.moduleReviews||{};S.review.moduleReviews[sel]=S.review.moduleReviews[sel]||{};const rec=S.review.moduleReviews[sel][k]=S.review.moduleReviews[sel][k]||{};$$('[data-act="review-mod-field"]').forEach(el=>{if(el.dataset.f)rec[el.dataset.f]=el.value;});save();toast('板块复盘已保存 ✨');break;}
    /* 饮食：今日食物 */
    case 'diet-food-add-btn':{const m=t.dataset.m;const k=todayKey();S.diet.days[k]=S.diet.days[k]||{b:0,l:0,d:0,nutri:{p:0,c:0,f:0},foods:{b:[],l:[],d:[]}};const foods=S.diet.days[k].foods||(S.diet.days[k].foods={b:[],l:[],d:[]});const nameEl=document.querySelector('[data-act="diet-food-add"][data-m="'+m+'"][data-f="name"]');const kcalEl=document.querySelector('[data-act="diet-food-add"][data-m="'+m+'"][data-f="kcal"]');const proEl=document.querySelector('[data-act="diet-food-add"][data-m="'+m+'"][data-f="protein"]');const name=nameEl?nameEl.value.trim():'';if(!name){toast('请输入食物名称');break;}const kcal=kcalEl?int(kcalEl.value):0;const protein=proEl?int(proEl.value):0;foods[m]=foods[m]||[];foods[m].push({name,kcal,protein});S.diet.days[k][m]=(S.diet.days[k][m]||0)+kcal;if(nameEl)nameEl.value='';if(kcalEl)kcalEl.value='';if(proEl)proEl.value='';save();renderModule();break;}
    case 'diet-food-del':{const m=t.dataset.m,i=+t.dataset.i;const k=todayKey();const foods=(S.diet.days[k]||{}).foods||{};if(foods[m]&&foods[m][i]){S.diet.days[k][m]=(S.diet.days[k][m]||0)-int(foods[m][i].kcal||0);foods[m].splice(i,1);save();renderModule();}break;}
    /* 饮食：计划 */
    case 'diet-plan-gen':{const goalEl=$('#planGoal'),kcalEl=$('#planKcal');const g=goalEl?goalEl.value:'保持';const target=kcalEl?int(kcalEl.value):1800;S.diet.plans=S.diet.plans||[];const planMap={'减重':{b:'燕麦粥+鸡蛋+蓝莓',l:'鸡胸肉沙拉+全麦面包',d:'清蒸鱼+西兰花'},'增肌':{b:'全蛋三明治+牛奶+香蕉',l:'牛肉饭+蔬菜汤',d:'鸡胸肉+糙米饭+牛油果'},'保持':{b:'杂粮粥+鸡蛋+苹果',l:'排骨汤面+蔬菜',d:'番茄炒蛋+米饭+紫菜汤'}};const meals=planMap[g]||planMap['保持'];S.diet.plans.push({id:uid(),date:todayKey(),goal:g,totalKcal:target,meals:{b:{desc:meals.b,kcal:Math.round(target*0.3)},l:{desc:meals.l,kcal:Math.round(target*0.4)},d:{desc:meals.d,kcal:Math.round(target*0.3)}}});save();renderModule();toast('AI饮食计划已生成 🍽️');break;}
    /* 饮食：食谱库 */
    case 'diet-recipe-refresh':{refreshDietRecipes().then(()=>{renderModule();toast('食谱已更新');});break;}
    case 'diet-recipe-save':{const r=(S.diet.recipes||[]).find(x=>x.id===id);if(r){r.saved=!r.saved;S.diet.recipesFav=S.diet.recipesFav||[];if(r.saved){S.diet.recipesFav.push({title:r.title,cat:r.cat,ingr:r.ingr,method:r.method});}else{S.diet.recipesFav=S.diet.recipesFav.filter(x=>x.title!==r.title);}save();renderModule();}break;}
    /* 饮食：AI食谱 */
    case 'diet-ai-taste':dietAIRecommend(t.dataset.v);break;
    /* 饮食：冰箱添加（覆盖旧case） */
    case 'diet-fridge-add':{const n=prompt('食材名称');if(!n)break;const cat=prompt('分类（蔬菜/肉蛋/水果/主食/调味/其他）','蔬菜')||'蔬菜';const qty=prompt('数量（如：500g / 2个）','')||'';const buyDate=todayKey();const sl=foodShelfLife(cat);const expire=new Date(Date.now()+sl*86400000).toISOString().slice(0,10);S.diet.fridge=S.diet.fridge||[];S.diet.fridge.push({id:uid(),name:n,cat,qty,buyDate,expire});save();renderModule();break;}
    /* 学习：英语等级 */
    case 'en-level':{S.study.english.level=t.dataset.lv;S.finance.dailyKnowledge=null;save();renderModule();break;}
    /* 学习：英语地图节点 */
    case 'en-map-node':{const pk=t.dataset.path,idx=+t.dataset.idx;const e=S.study.english;e.mapProgress=e.mapProgress||{};const cur=e.mapProgress[pk]||0;if(idx===cur){e.mapProgress[pk]=cur+1;e.streak=(e.streak||0)+1;save();renderModule();toast('节点已解锁 🎉');}else if(idx<cur){toast('该节点已完成');}else{toast('请先完成前面的节点');}break;}
    /* 学习：英语陪练 */
    case 'en-coach-send':{const inp=$('#enCoachInput');const text=inp?inp.value.trim():'';if(!text)break;const e=S.study.english;e.coachMsgs=e.coachMsgs||[];e.coachMsgs.push({role:'user',text});e.coachMsgs.push({role:'coach',text:enCoachReply(text)});if(inp)inp.value='';save();renderModule();break;}
    case 'en-coach-topic':{const e=S.study.english;e.coachMsgs=e.coachMsgs||[];const mods=Object.keys(MODULE_TOPICS);const mod=mods[Math.floor(Math.random()*mods.length)];e.coachMsgs.push({role:'coach',text:'📝 今日话题（'+mod+'板块）：\n\n'+MODULE_TOPICS[mod]+'\n\n请尝试用英语回答，我会帮你纠正~'});save();renderModule();break;}
    case 'en-coach-clear':{S.study.english.coachMsgs=[];save();renderModule();break;}
    case 'en-weak-del':{const i=+t.dataset.idx;S.study.english.weak=S.study.english.weak||[];S.study.english.weak.splice(i,1);save();renderModule();break;}
    /* 理财 */
    case 'fin-level':{S.finance.level=t.dataset.lv;S.finance.dailyKnowledge=null;save();renderModule();break;}
    case 'fin-refresh-knowledge':refreshFinanceKnowledge();break;
    case 'fin-coach-send':{const inp=$('#finCoachInput');const text=inp?inp.value.trim():'';if(!text)break;const f=S.finance;f.chatMsgs=f.chatMsgs||[];f.chatMsgs.push({role:'user',text});f.chatMsgs.push({role:'coach',text:finCoachReply(text)});if(inp)inp.value='';save();renderModule();break;}
    case 'fin-mode-sel':{S.finance.mode=t.dataset.v;S.finance.recommendations=[];save();refreshFinanceProducts(t.dataset.v);break;}
    case 'fin-prod-refresh':{if(!S.finance.mode){toast('请先选择理财模式');break;}refreshFinanceProducts(S.finance.mode);break;}
    case 'fin-prod-add':{const n=prompt('产品名称（如：沪深300ETF）');if(!n)break;const platform=prompt('购买平台（如：支付宝/招商银行）')||'';const amt=prompt('投入金额（元）','1000')||'1000';const risk=prompt('风险等级（低风险/中低风险/中风险/中高风险/高风险）','中风险')||'中风险';const type=prompt('产品类型（如：指数基金/债券/股票/货币基金）')||'';S.finance.products=S.finance.products||[];S.finance.products.push({id:uid(),name:n,platform,amount:amt,risk,type,buyDate:todayKey()});save();renderModule();toast('产品已录入');break;}
    case 'fin-prod-del':{S.finance.products=(S.finance.products||[]).filter(x=>x.id!==id);save();renderModule();break;}
    /* 记账：存钱计划 */
    case 'ledger-save-plan-add':{const period=t.dataset.period;const n=prompt(period+'计划名称（如：旅行基金/换电脑）');if(!n)break;const target=prompt('目标金额（元）','5000')||'5000';S.ledgerExt.savingPlans=S.ledgerExt.savingPlans||[];S.ledgerExt.savingPlans.push({id:uid(),name:n,period,target:int(target),current:0,detail:''});save();renderModule();toast('存钱计划已添加');break;}
    case 'ledger-save-del':{S.ledgerExt.savingPlans=(S.ledgerExt.savingPlans||[]).filter(x=>x.id!==id);save();renderModule();break;}
    case 'ledger-save-deposit':{const p=(S.ledgerExt.savingPlans||[]).find(x=>x.id===id);if(!p)break;const v=prompt('存入金额（当前 ¥'+money(p.current)+' / ¥'+money(p.target)+'）');if(!v)break;const amt=int(v);if(amt<=0){toast('请输入有效金额');break;}p.current=(p.current||0)+amt;save();renderModule();toast('已存入 ¥'+money(amt)+' 💰');break;}
    /* 记账：存钱模式 */
    case 'ledger-save-mode':{const mode=t.dataset.v;if(S.ledgerExt.savingMode===mode){S.ledgerExt.savingMode='';S.ledgerExt.savingModeData=null;}else{const amt=int(prompt('请输入总金额（元）','10000')||'10000');S.ledgerExt.savingMode=mode;S.ledgerExt.savingModeData=genSavingMode(mode,amt);}save();renderModule();break;}
    case 'save-mode-check':{const mode=t.dataset.mode,idx=+t.dataset.idx;const d=S.ledgerExt.savingModeData;if(!d)break;if(mode==='52week'){if(d[idx-1])d[idx-1].done=!d[idx-1].done;}else if(mode==='12deposit'){if(d.deposits[idx])d.deposits[idx].done=!d.deposits[idx].done;}save();renderModule();break;}
    /* 自媒体：AI */
    case 'media-ai-send':{const inp=$('#mediaAIInput');const text=inp?inp.value.trim():'';if(!text)break;const A=curMedia();A.aiMsgs=A.aiMsgs||[];A.aiMsgs.push({role:'user',text});A.aiMsgs.push({role:'ai',text:mediaAIReply(text,A)});if(inp)inp.value='';save();renderModule();break;}
    case 'media-ai-topic':{const A=curMedia();A.aiMsgs=A.aiMsgs||[];A.aiMsgs.push({role:'user',text:'推荐选题'});A.aiMsgs.push({role:'ai',text:mediaAIReply('选题',A)});save();renderModule();break;}
    case 'media-ai-structure':{const A=curMedia();A.aiMsgs=A.aiMsgs||[];A.aiMsgs.push({role:'user',text:'结构优化'});A.aiMsgs.push({role:'ai',text:mediaAIReply('结构',A)});save();renderModule();break;}
    case 'media-ai-hook':{const A=curMedia();A.aiMsgs=A.aiMsgs||[];A.aiMsgs.push({role:'user',text:'钩子建议'});A.aiMsgs.push({role:'ai',text:mediaAIReply('钩子',A)});save();renderModule();break;}
    /* 自媒体：复盘 */
    case 'media-review-gen':{genMediaReview(curMedia(),t.dataset.scope);break;}
    /* 自媒体：选题库 */
    case 'topic-lib-add':{
      const title=$('#topicLibTitle')?.value?.trim();
      if(!title){toast('请输入选题标题');break;}
      const desc=$('#topicLibDesc')?.value||'';
      const status=$('#topicLibStatus')?.value||'灵感';
      const tempMedia=notesState.libTempMedia||[];
      const images=tempMedia.filter(m=>m.type==='image').map(m=>m.id);
      const videos=tempMedia.filter(m=>m.type==='video').map(m=>m.id);
      const A=curMedia();
      if(!A.topicLib)A.topicLib=[];
      A.topicLib.unshift({id:uid(),title,desc,status,images,videos,createdAt:Date.now(),updatedAt:Date.now()});
      save();
      notesState.libTempMedia=[];
      renderModule();
      toast('选题已添加到库 ✨');
      break;
    }
    case 'topic-lib-del':{
      const A=curMedia();
      if(!A.topicLib)break;
      const topic=A.topicLib.find(t=>t.id===id);
      if(topic){
        for(const mid of (topic.images||[]))MediaDB.delMedia(mid);
        for(const mid of (topic.videos||[]))MediaDB.delMedia(mid);
      }
      A.topicLib=A.topicLib.filter(t=>t.id!==id);
      save();renderModule();
      break;
    }
    case 'topic-lib-cycle':{
      const A=curMedia();
      if(!A.topicLib)break;
      const topic=A.topicLib.find(t=>t.id===id);
      if(!topic)break;
      const statuses=['灵感','待拍','已拍','已发布'];
      const cur=statuses.indexOf(topic.status||'灵感');
      topic.status=statuses[(cur+1)%statuses.length];
      topic.updatedAt=Date.now();
      save();renderModule();
      break;
    }
    case 'topic-lib-filter':{
      notesState.libFilter=t.dataset.s||'';
      renderModule();
      break;
    }
    /* 自媒体：每日联网选题 */
    case 'media-refresh-topics':{refreshMediaTopics();break;}
    /* 自媒体：发布记录 */
    case 'media-post-add':{const n=prompt('发布标题');if(!n)break;const platform=prompt('平台（如：小红书/抖音/B站）','小红书')||'小红书';const views=prompt('播放/阅读量','0')||'0';const A=curMedia();A.posts.push({id:uid(),title:n,date:todayKey(),platform,views:int(views),likes:0});save();renderModule();toast('发布记录已添加');break;}
    case 'media-post-del':{const A=curMedia();A.posts=A.posts.filter(p=>p.id!==id);save();renderModule();break;}
    /* 心情 */
    case 'mood-status':{
      setMood(s=>{s.status=t.dataset.v;});renderModule();break;}
    case 'mood-history':{
      const box=$('#moodHist');box.hidden=!box.hidden;
      if(!box.hidden){
        box.innerHTML=S.mood.history.slice(-7).reverse().map(h=>{
          const em=h.emoji&&EMOJIS_MAP[h.emoji]?EMOJIS_MAP[h.emoji].icon+' '+EMOJIS_MAP[h.emoji].label:(h.status==='tired'?'有些疲惫':'轻松愉悦');
          const ph=h.photo?`<img src="${h.photo}" style="max-width:90px;border-radius:10px;margin-top:6px">`:'';
          return `<div class="list-item"><div class="li-main">
            <strong>${h.date} · ${em}</strong>
            <div class="muted" style="margin-top:4px">心情 ${h.score}/10</div>
            <div style="margin-top:4px;color:var(--purple-d)">${esc(h.text||'')}</div>
            ${ph}
          </div></div>`;
        }).join('')||'<div class="muted">还没有历史记录。</div>';
      }break;}
    /* 心情（新布局） */
    case 'mood-emoji':{
      const key=t.dataset.v; const em=EMOJIS_MAP[key];
      setMood(s=>{ s.emoji=key; s.status=em.status; s.score=em.score; });
      $$('.mood-emoji-btn').forEach(b=>b.classList.toggle('on', b.dataset.v===key));
      const rec=S.mood.history.find(h=>h.date===todayKey());
      $('#moodText').textContent=moodPhrase(rec);
      $('#moodHeroEmoji').textContent=em.icon;
      break;}
    case 'mood-photo-zone': $('#moodPhotoInput')?.click(); break;
    case 'mood-photo-del': setMood(s=>{s.photo='';}); renderModule(); toast('已移除照片'); break;
    case 'mood-save':{
      const note=$('#moodNote'); if(note) setMood(s=>{ s.note=note.value; });
      toast('心情已保存，照顾好自己~ 🌸'); break;
    }
    /* 工具栏：深色模式 / 背景库 */
    case 'theme-toggle':{
      S.theme=t.checked?'dark':'light'; save(); applyTheme(); break;
    }
    case 'bg-apply':{
      if(S.backgroundLocked){ toast('背景已锁定，请先点「解锁背景」再更改'); break; }
      const v=t.dataset.v;
      S.background=S.background||{global:'',perModule:{}};
      if(bgScopeCur==='module'){ S.background.perModule[current]=v; }
      else { S.background.global=v; }
      S.backgroundLocked=true; save(); applyBackground(); renderModule(); toast('背景已设置并锁定 🔒');
      break;
    }
    case 'bg-scope': bgScopeCur=t.dataset.v; renderModule(); break;
    case 'bg-more':{
      try{
        const urls=[];
        for(let i=0;i<4;i++) urls.push('https://picsum.photos/seed/'+Math.random().toString(36).slice(2,8)+'/800/1400');
        S._bgSuggestions=urls;
        const grid=$('#bgOnline');
        if(grid) grid.innerHTML=urls.map(u=>`<button class="bg-swatch" data-act="bg-apply" data-v="${esc(u)}" style="background-image:url('${u}');background-size:cover"></button>`).join('');
        toast('已获取推荐背景图');
      }catch(e){ toast('获取推荐图失败，可改用本地上传'); }
      break;
    }
    case 'bg-upload': $('#bgUploadInput')?.click(); break;
    case 'bg-clear':{
      if(S.backgroundLocked){ toast('背景已锁定，请先解锁'); break; }
      S.background=S.background||{global:'',perModule:{}};
      if(bgScopeCur==='module') delete S.background.perModule[current]; else S.background.global='';
      save(); applyBackground(); renderModule(); toast('已清除背景'); break;
    }
    case 'bg-lock-toggle': S.backgroundLocked=!S.backgroundLocked; save(); renderModule(); break;
    /* 日程 */
    case 'cal-view':calView=t.dataset.v;renderModule();break;
    case 'cal-prev':if(calView==='year')calY--;else{calM--;if(calM<0){calM=11;calY--;}}renderModule();break;
    case 'cal-next':if(calView==='year')calY++;else{calM++;if(calM>11){calM=0;calY++;}}renderModule();break;
    case 'cal-pick':selDate=t.dataset.k;renderModule();break;
    case 'ev-color':evColor=t.dataset.c;renderModule();break;
    case 'ev-del':{const evs=S.schedule.events[selDate]||[];evs.splice(+t.dataset.i,1);if(!evs.length)delete S.schedule.events[selDate];save();renderModule();break;}
    case 'goal-add':{const mk=`${calY}-${String(calM+1).padStart(2,'0')}`;(S.schedule.goals[mk]=S.schedule.goals[mk]||[]).push({text:'新目标',done:false});save();renderModule();break;}
    case 'goal-toggle':{const mk=`${calY}-${String(calM+1).padStart(2,'0')}`;S.schedule.goals[mk][+t.dataset.i].done=!S.schedule.goals[mk][+t.dataset.i].done;save();renderModule();break;}
    case 'goal-del':{const mk=`${calY}-${String(calM+1).padStart(2,'0')}`;S.schedule.goals[mk].splice(+t.dataset.i,1);save();renderModule();break;}
    case 'year-pick':{calView='month';calM=+t.dataset.m;renderModule();break;}
    case 'year-star':{const rect=t.getBoundingClientRect();const n=clamp(Math.ceil((e.clientX-rect.left)/rect.width*5),1,5);const mk=`${calY}-${String(+t.dataset.m+1).padStart(2,'0')}`;S.schedule.ratings[mk]=S.schedule.ratings[mk]||{};S.schedule.ratings[mk].stars=n;save();renderModule();break;}
    /* 待办 */
    case 'todo-toggle':{const x=S.todos.find(x=>x.id===id);x.done=!x.done;save();renderModule();break;}
    case 'todo-del':{S.todos=S.todos.filter(x=>x.id!==id);save();renderModule();break;}
    case 'todo-star':{starClick(t,id,e);break;}
    /* 记账 */
    case 'ledger-del':{S.ledger=S.ledger.filter(x=>x.id!==id);save();renderModule();break;}
    case 'ledger-add-income':addRecord('ledger',null,'income');break;
    case 'ledger-add-expense':addRecord('ledger',null,'expense');break;
    /* 运动 */
    case 'ex-del':{S.exercise.records=S.exercise.records.filter(x=>x.id!==id);save();renderModule();break;}
    case 'ex-type':{S.exercise.lastType=t.dataset.v;save();renderModule();break;}
    /* 运动：新子 tab 交互 */
    case 'ex-pick-part':{ const v=t.dataset.v; const p=S.exercise.parts||(S.exercise.parts=[]); const i=p.indexOf(v); if(i>=0)p.splice(i,1); else p.push(v); save(); renderModule(); break;}
    case 'ex-start':{ const p=S.exercise.parts||[]; if(!p.length){toast('先选一个部位吧～');break;} S.exercise.records.push({id:uid(),date:todayKey(),name:p.join('+')+' 训练',duration:20,calories:120,media:[]}); S.exercise.todayTrainMin=(S.exercise.todayTrainMin||0)+20; S.exercise.todayActions=(S.exercise.todayActions||0)+1; S.exercise.streak=(S.exercise.streak||0)+1; S.exercise.parts=[]; save(); toast('训练已记录，加油💪'); renderModule(); break;}
    case 'ex-quick-plan':{ S.exercise.weeklyPlan={mon:'胸+三头',tue:'背+二头',wed:'有氧 30min',thu:'肩+手臂',fri:'腿+臀',sat:'核心',sun:'休息'}; S.exercise.weeklyTotal=7; S.exercise.weeklyDone=S.exercise.weeklyDone||0; save(); toast('已生成本周计划 ✨'); renderModule(); break;}
    case 'ex-edit-day':{ const day=t.dataset.day; const wp=S.exercise.weeklyPlan||{}; openModal('编辑 '+day+' 训练',`<div class="muted">当天动作（留空为休息）</div><input class="inp" id="exDayInp" data-act="ex-day-action" value="${esc(wp[day]||'')}" placeholder="如 胸+三头">`,`<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="ex-day-save">保存</button>`,()=>{ $('#modalFoot').querySelector('[data-act=ex-day-save]').onclick=()=>{ S.exercise.weeklyPlan=S.exercise.weeklyPlan||{}; S.exercise.weeklyPlan[day]=$('#exDayInp').value||''; if(!S.exercise.weeklyTotal)S.exercise.weeklyTotal=7; save();closeModal();renderModule(); }; }); break;}
    case 'ex-blogger-open':{ const b=(S.exercise.bloggers||[]).find(x=>x.id===t.dataset.id); if(!b)break; const avHtml=b.avatar?`<img src="${esc(b.avatar)}" alt="">`:'🧘'; const kwHtml=(b.keywords||[]).map(k=>`<span class="ex-kw-chip">${esc(k)}</span>`).join(''); const biKey=encodeURIComponent(b.bilibili||b.name); openModal(`<span class="ex-drawer-av" style="border-color:${b.color||'#FFB6C1'}">${avHtml}</span>${esc(b.name)}`,`<div class="ex-drawer-desc">${esc(b.desc||'')}</div><div class="ex-drawer-upload"><button class="ex-upload-btn" data-act="ex-blog-avatar-trigger">📷 上传真实头像</button><input type="file" accept="image/*" hidden data-act="ex-blog-avatar"></div><div class="ex-drawer-links"><a class="ex-link-btn bilibili" data-url="https://search.bilibili.com/upuser?keyword=${biKey}">B站主页</a><a class="ex-link-btn bilibili" data-url="https://search.bilibili.com/all?keyword=${biKey}">B站搜索</a><a class="ex-link-btn douyin" data-url="https://www.douyin.com/search/${biKey}">抖音搜索</a></div><div class="ex-drawer-kw-title">🔥 热门跟练关键词</div><div class="ex-drawer-kws">${kwHtml}</div>`,`<button class="btn ghost" data-act="modal-cancel">关闭</button><button class="btn" data-act="ex-coll-new">+ 用 TA 建合集</button>`,(mb,mf)=>{ mb.querySelectorAll('[data-act=ex-blog-link]').forEach(a=>a.onclick=()=>{ try{window.open(a.dataset.url,'_blank');}catch(e){toast('打开链接失败');} }); const upBtn=mb.querySelector('[data-act=ex-blog-avatar-trigger]'); const fInp=mb.querySelector('[data-act=ex-blog-avatar]'); if(upBtn&&fInp){ upBtn.onclick=()=>fInp.click(); fInp.onchange=()=>{ const f=fInp.files[0]; if(!f)return; (async()=>{ try{ const url=await fileToScaledDataURL(f,400,0.85); b.avatar=url; save(); closeModal(); renderModule(); toast('头像已更新 📷'); }catch(e){ toast('图片处理失败'); } })(); }; } mf.querySelector('[data-act=ex-coll-new]').onclick=()=>{ closeModal(); openCollModal(b.id); }; }); break;}
    case 'ex-blog-add':{ openModal('添加博主',`<div class="muted">名字</div><input class="inp" id="exBlogName" data-act="ex-blog-name" placeholder="博主昵称"><div class="muted" style="margin-top:8px">描述</div><input class="inp" id="exBlogDesc" placeholder="一句话简介"><div class="muted" style="margin-top:8px">B站搜索关键词</div><input class="inp" id="exBlogBi" placeholder="B站 ID">`,`<button class="btn ghost" data-act="modal-cancel">取消</button><button class="btn" data-act="ex-blog-save">保存</button>`,()=>{ $('#modalFoot').querySelector('[data-act=ex-blog-save]').onclick=()=>{ const name=$('#exBlogName').value||'新博主'; const desc=$('#exBlogDesc').value||''; const bi=$('#exBlogBi').value||name; S.exercise.bloggers=S.exercise.bloggers||[]; S.exercise.bloggers.push({id:uid(),name,desc,color:'#FFB6C1',bilibili:bi,keywords:[],avatar:''}); save();closeModal();renderModule();toast('博主已添加 ⭐'); }; }); break;}
    case 'ex-coll-new':{ openCollModal(t.dataset.id||''); break;}
    case 'ex-coach-quick':{ const v=t.dataset.v; const inp=$('#exCoachInput'); if(inp){inp.value=v;inp.focus();} break;}
    case 'ex-coach-send':{ const inp=$('#exCoachInput'); const text=inp?inp.value.trim():''; if(!text){toast('先输入想问的内容～');break;} S.exercise.coachMsgs=S.exercise.coachMsgs||[]; S.exercise.coachMsgs.push({role:'user',text,time:Date.now()}); const ai=coachReply(text); S.exercise.coachMsgs.push({role:'ai',text:ai,time:Date.now()}); if(inp)inp.value=''; save(); renderModule(); break;}
    /* 饮食：冰箱 / 饮水 / 食谱 */
    case 'diet-fridge-add':{S.diet.fridge=S.diet.fridge||[];S.diet.fridge.push({id:uid(),name:'',cat:'蔬菜',qty:'',expire:''});save();renderModule();break;}
    case 'diet-fridge-del':{S.diet.fridge=S.diet.fridge.filter(x=>x.id!==id);save();renderModule();break;}
    case 'diet-ai-recipe':dietAIRecipe();break;
    case 'diet-recipe-add':{
      const k=todayKey();const m=t.dataset.m||'l';const cal=int(t.dataset.cal);
      S.diet.days[k]=S.diet.days[k]||{};S.diet.days[k][m]=(int(S.diet.days[k][m])||0)+cal;
      save();renderModule();toast('已加入'+({b:'早餐',l:'午餐',d:'晚餐'}[m]||'')+' ~');break;}
    case 'diet-recipe-fav':{
      S.diet.recipesFav=S.diet.recipesFav||[];
      S.diet.recipesFav.push({title:t.dataset.title,ingr:t.dataset.ingr,method:t.dataset.method,cal:int(t.dataset.cal)});
      save();renderModule();toast('已收藏食谱 ⭐');break;}
    case 'diet-water':{
      const k=todayKey();
      if(S.diet.waterDate!==k){S.diet.water=0;S.diet.waterDate=k;}
      S.diet.water=clamp((int(S.diet.water)+int(t.dataset.d)),0,20);
      save();renderModule();break;}
    /* 自媒体 */
    case 'post-del':{curMedia().posts=curMedia().posts.filter(x=>x.id!==id);save();renderModule();break;}
    case 'post-add':addRecord('media');break;
    case 'post-pub':{const p=curMedia().posts.find(x=>x.id===id);p.published=!p.published;save();renderModule();break;}
    case 'post-q':{const p=curMedia().posts.find(x=>x.id===id);p.quality=(p.quality===t.dataset.v?'':t.dataset.v);save();renderModule();break;}
    case 'media-switch-acc':{S.media.activeAccount=t.dataset.id;save();renderModule();break;}
    case 'media-add-acc':{addAccountModal();break;}
    case 'media-del-acc':{
      const accs=Object.keys(S.media.accounts);
      if(accs.length<=1){toast('至少保留一个账号~');break;}
      if(!confirm('确定删除当前账号「'+(curMedia().name||'')+'」及其全部数据？'))break;
      delete S.media.accounts[t.dataset.id];
      S.media.activeAccount=Object.keys(S.media.accounts)[0];
      save();renderModule();toast('账号已删除');break;}
    case 'open-notes':{ openNotes(); break; }
    case 'topic-add':curMedia().topics.todo.push({id:uid(),text:'新选题',done:false});save();renderModule();break;
    case 'topic-toggle':{const A=curMedia();const x=A.topics.todo.find(y=>y.id===id);
      A.topics.done.push({id:uid(),text:x.text});A.topics.todo=A.topics.todo.filter(y=>y.id!==id);save();renderModule();break;}
    case 'topic-del':{const A=curMedia();A.topics.todo=A.topics.todo.filter(y=>y.id!==id);save();renderModule();break;}
    case 'topic-text':{const x=curMedia().topics.todo.find(y=>y.id===id);x.text=t.querySelector('input').value;save();break;}
    case 'insp-add':curMedia().inspiration[t.dataset.k].push({text:'',src:''});save();renderModule();break;
    case 'insp-del':curMedia().inspiration[t.dataset.k].splice(+t.dataset.i,1);save();renderModule();break;
    /* 热点 */
    case 'hot-plat':hotPlatform=t.dataset.v;renderModule();break;
    case 'hot-tag':hotTag=t.dataset.v;renderModule();break;
    case 'hot-refresh':toast('已刷新（演示数据）');renderModule();break;
    case 'hot-suit':{const h=findHot(id);h.suitable=!h.suitable;save();renderModule();break;}
    case 'hot-insp':{saveInspiration(findHot(id).topic,findHot(id).tags[0]||'其他');renderModule();break;}
    case 'hot-del':{Object.keys(S.hot).forEach(p=>S.hot[p]=S.hot[p].filter(x=>x.id!==id));save();renderModule();break;}
    case 'hot-add':addRecord('hot');break;
    /* 视频 */
    case 'video-add':addRecord('video');break;
    case 'video-del':S.video=S.video.filter(x=>x.id!==id);save();renderModule();break;
    case 'video-ai':{const v=S.video.find(x=>x.id===id);runVideoAI(v);break;}
    case 'video-compare':{const v=S.video.find(x=>x.id===id);openModal(kitty('#c5a3ff',26)+' 对照组对比',buildComparison(v),'<button class="btn ghost" data-act="modal-cancel">关闭</button>');$('#modal').style.maxWidth='820px';break;}
    /* 阅读模块 */
    case 'rd-filter-st':readingFilterStatus=t.dataset.v;renderModule();break;
    case 'rd-expand':document._expandedBook=(document._expandedBook===id?null:id);renderModule();break;
    case 'rd-media-add':{const book=S.reading.books.find(x=>x.id===id);if(!book)break;book.media=book.media||[];const inp=document.createElement('input');inp.type='file';inp.multiple=true;inp.accept='image/*,video/*';inp.onchange=async()=>{for(const f of inp.files){const mid=uid();const type=f.type.startsWith('video/')?'video':'image';await MediaDB.putMedia(mid,f,{name:f.name,type});book.media.push({id:mid,type,name:f.name});}save();renderModule();};inp.click();break;}
    case 'rd-edit':addRecord('reading',id);break;
    case 'rd-del':S.reading.books=S.reading.books.filter(x=>x.id!==id);save();renderModule();break;
    case 'rd-note-add':{
      const b=S.reading.books.find(x=>x.id===t.dataset.bid);if(!b)break;
      const nkey=t.dataset.nkey;
      b.notes=b.notes||{};b.notes[nkey]=b.notes[nkey]||[];
      const txt=prompt('输入「'+t.closest('.note-section-head').querySelector('strong').textContent+'」内容');if(txt==null)break;
      const page=prompt('页码（可留空）','');
      b.notes[nkey].push({id:uid(),text:txt,page:page||''});save();renderModule();break;}
    case 'rd-note-del':{
      const b=S.reading.books.find(x=>x.id===t.dataset.bid);if(!b)break;
      const nkey=t.dataset.nkey;
      b.notes=b.notes||{};b.notes[nkey]=(b.notes[nkey]||[]).filter(n=>n.id!==t.dataset.nid);save();renderModule();break;}
    case 'vm-toggle':{const v=S.video.find(x=>x.id===id);const m=v.materials[t.dataset.k][+t.dataset.i];m.on=!m.on;if(m.on){syncToInsp(t.dataset.k,m.text);}save();renderModule();break;}
    case 'vm-add':{const v=S.video.find(x=>x.id===id);v.materials[t.dataset.k].push({text:'',on:false});save();renderModule();break;}
    case 'vm-del':{const v=S.video.find(x=>x.id===id);v.materials[t.dataset.k].splice(+t.dataset.i,1);save();renderModule();break;}
    /* 学习 */
    case 'soft-add':addRecord('study');break;
    case 'soft-del':S.study.software=S.study.software.filter(x=>x.id!==id);save();renderModule();break;
    case 'daily-add':S.study.daily.push({id:uid(),text:'新技巧',date:todayKey()});save();renderModule();break;
    case 'daily-del':S.study.daily=S.study.daily.filter(x=>x.id!==id);save();renderModule();break;
    case 'word-master':{const ws=dayWords();ws[+t.dataset.i].mastered=!ws[+t.dataset.i].mastered;save();renderModule();break;}
    /* 备忘录 */
    case 'memo-save':saveMemo();break;
    case 'memo-toggle':{const m=S.memo.find(x=>x.id===id);m.done=!m.done;save();renderModule();break;}
    case 'memo-del':S.memo=S.memo.filter(x=>x.id!==id);save();renderModule();break;
    case 'memo-edit':{
      const m=S.memo.find(x=>x.id===id);if(!m)break;
      editingMemoId=id;memoMedia=m.media||[];
      renderModule();
      setTimeout(()=>$('#memoInput').focus(),50);
      break;}
    case 'memo-cancel':{editingMemoId=null;memoMedia=[];renderModule();break;}
    /* 编辑入口 */
    case 'ledger-edit':addRecord('ledger',id);break;
    case 'ex-edit':addRecord('exercise',id);break;
    case 'post-edit':addRecord('media',id);break;
    case 'hot-edit':addRecord('hot',id);break;
    case 'video-edit':addRecord('video',id);break;
    case 'soft-edit':addRecord('study',id);break;
    /* 每日联网选题 */
    case 'dt-refresh':renderDailyTopics();break;
    case 'dt-save':{curMedia().topics.todo.push({id:uid(),text:t.dataset.title||'新选题',done:false});save();toast(`已加入选题库：${esc(t.dataset.title||'')}`);break;}
    /* 学习：英语陪练 / 生词本 */
    case 'study-chat-scene':{const sc=CHAT_SCENES.find(s=>s.key===t.dataset.key);S.study.english.chat={scene:sc.key,q:sc.q,a:'',score:0,tip:''};save();renderModule();break;}
    case 'study-chat-check':{
      const ch=S.study.english.chat||{};
      if(!ch.scene){toast('请先选择一个对话场景~');break;}
      const res=checkEnglishAnswer(ch.scene,ch.a||'');
      S.study.english.chat.score=res.score;S.study.english.chat.tip=res.tip;save();renderModule();break;}
    case 'study-weak-add':{
      const w=dayWords()[+t.dataset.i].w[0];
      S.study.english.weak=S.study.english.weak||[];
      if(!S.study.english.weak.includes(w)){S.study.english.weak.push(w);save();toast('已加入生词本 📒');}
      renderModule();break;}
    case 'study-weak-del':{S.study.english.weak=(S.study.english.weak||[]).filter(x=>x!==t.dataset.w);save();renderModule();break;}
    /* ===== 穿搭 outfit ===== */
    case 'outfit-cat-filter':outfitCatFilter=t.dataset.v;renderModule();break;
    case 'outfit-season-filter':outfitSeasonFilter=t.dataset.v;renderModule();break;
    case 'outfit-closet-add':openClosetModal(null);break;
    case 'outfit-closet-edit':openClosetModal(id);break;
    case 'outfit-closet-del':{S.outfit.closet=S.outfit.closet.filter(x=>x.id!==id);S.outfit.looks.forEach(l=>l.items=l.items.filter(i=>i!==id));save();renderModule();break;}
    case 'outfit-look-add':openLookModal();break;
    case 'outfit-look-del':{S.outfit.looks=S.outfit.looks.filter(x=>x.id!==id);save();renderModule();break;}
    case 'outfit-refresh-weather':loadOutfitWeather(true);break;
    /* ===== 复盘 review ===== */
    case 'review-tab':reviewScope=t.dataset.v;renderModule();break;
    case 'review-save':{
      const key=reviewKeyOf(reviewScope);
      const obj=S.review[reviewScope]=S.review[reviewScope]||{};
      const rec=obj[key]=obj[key]||{};
      REVIEW_TPLS[reviewScope].forEach(([k])=>{
        if(k==='score'){const el=$('#rvScore');if(el)rec.score=+el.value;}
        else{const el=document.querySelector('[data-act=review-field][data-f="'+k+'"]');if(el)rec[k]=el.value;}
      });
      save();toast('已保存'+({daily:'日',weekly:'周',monthly:'月'}[reviewScope])+'复盘 📝');break;
    }
    /* ===== 行业情报 intel ===== */
    case 'intel-news-tab':S.intel.newsSub=t.dataset.sub;save();renderModule();break;
    case 'intel-news-checkin':S.intel.readStreak=(S.intel.readStreak||0)+1;save();renderModule();toast('读报打卡成功！连续 '+S.intel.readStreak+' 天 📖');break;
    case 'intel-radar-tab':S.intel.radarSub=t.dataset.sub;save();renderModule();break;
    case 'intel-channel-open':openIndustryDrawer(t.dataset.id);break;
    case 'intel-link':{const u=t.dataset.url;if(u){try{window.open(u,'_blank');}catch(e){toast('打开链接失败');}}else{toast('暂无链接');}break;}
    case 'intel-save-open':openIntelSaveModal();break;
    case 'intel-save-confirm':break; /* handled in modal onMount */
    case 'intel-save-del':{S.intel.saved=(S.intel.saved||[]).filter(x=>x.id!==id);save();renderModule();toast('已删除收藏');break;}
    case 'intel-fav-filter':S.intel.favFilter=t.dataset.v;save();renderModule();break;
    /* ===== 理财 finance ===== */
    case 'fin-asset-add':openAssetModal(null,false);break;
    case 'fin-asset-edit':openAssetModal(id,false);break;
    case 'fin-asset-del':{S.finance.assets=S.finance.assets.filter(x=>x.id!==id);save();renderModule();break;}
    case 'fin-liab-add':openAssetModal(null,true);break;
    case 'fin-liab-edit':openAssetModal(id,true);break;
    case 'fin-liab-del':{S.finance.liabilities=S.finance.liabilities.filter(x=>x.id!==id);save();renderModule();break;}
    case 'fin-save-add':openSaveModal(null);break;
    case 'fin-save-edit':openSaveModal(id);break;
    case 'fin-save-del':{S.finance.savings=S.finance.savings.filter(x=>x.id!==id);save();renderModule();break;}
    case 'fin-save-deposit':{
      const s=S.finance.savings.find(x=>x.id===id);if(!s)break;
      const amt=prompt('存入金额（当前 ¥'+money(s.current)+'）','');
      if(amt==null)break;const v=parseFloat(amt);if(isNaN(v)||v<=0){toast('请输入有效金额');break;}
      s.current=Number(s.current||0)+v;s.done=Number(s.current)>=Number(s.target)&&Number(s.target)>0;
      save();renderModule();toast('已存入 ¥'+money(v)+' 💰');break;
    }
    /* ===== 记账：存钱快捷 ===== */
    case 'ledger-save-deposit':{
      const s=S.finance.savings.find(x=>x.id===id);if(!s)break;
      const amt=prompt('记一笔存钱（当前 ¥'+money(s.current)+'）','');
      if(amt==null)break;const v=parseFloat(amt);if(isNaN(v)||v<=0){toast('请输入有效金额');break;}
      s.current=Number(s.current||0)+v;s.done=Number(s.current)>=Number(s.target)&&Number(s.target)>0;
      save();renderModule();toast('已存入 ¥'+money(v)+' 💰');break;
    }
  }
}
function onContentInput(e){
  const t=e.target.closest('[data-act]');if(!t)return;
  const act=t.dataset.act, id=t.dataset.id;
  switch(act){
    /* 复盘字段（新版：覆盖旧case，用 sub 而非 reviewScope） */
    case 'review-field':{const sub=S.review.sub||'daily';const key={daily:todayKey(),weekly:weekKey(),monthly:monthKey()}[sub];const obj=S.review[sub]=S.review[sub]||{};const rec=obj[key]=obj[key]||{};rec[t.dataset.f]=t.value;save();break;}
    case 'review-mod-field':{const sel=S.review.moduleSel;if(!sel)break;const k=todayKey();S.review.moduleReviews=S.review.moduleReviews||{};S.review.moduleReviews[sel]=S.review.moduleReviews[sel]||{};const rec=S.review.moduleReviews[sel][k]=S.review.moduleReviews[sel][k]||{};rec[t.dataset.f]=t.value;save();break;}
    /* 待办复盘字段 */
    case 'todo-review-field':{const sub=S.todoReviewSub||'weekly';const key={weekly:weekKey(),monthly:monthKey(),yearly:String(new Date().getFullYear())}[sub];const obj=S.todoReview[sub]=S.todoReview[sub]||{};const rec=obj[key]=obj[key]||{};rec[t.dataset.f]=t.value;save();break;}
    /* 记账：总资金输入 */
    case 'ledger-fund':{S.ledgerExt=S.ledgerExt||{};S.ledgerExt.totalFund=S.ledgerExt.totalFund||{flexible:0,invested:0,flexPlan:0,investPlan:0};S.ledgerExt.totalFund[t.dataset.f]=int(t.value);save();break;}
    case 'mood-note': setMood(s=>{ s.note=t.value; }); break;
    case 'todo-text':{const x=S.todos.find(x=>x.id===id);x.text=t.value;save();break;}
    case 'weight':{S.exercise.weight=+t.value||0;S.exercise.weightLog=S.exercise.weightLog||[];const wd=todayKey();const we=S.exercise.weightLog.find(x=>x.date===wd);if(we)we.weight=S.exercise.weight;else if(S.exercise.weight>0)S.exercise.weightLog.push({date:wd,weight:S.exercise.weight});save();refreshLinks();if(current==='diet')renderModule();break;}
    case 'ex-goal-days':{S.exercise.goal=S.exercise.goal||{days:4,burn:300};S.exercise.goal.days=clamp(int(t.value),0,14);save();refreshExGoal();break;}
    case 'ex-goal-burn':{S.exercise.goal=S.exercise.goal||{days:4,burn:300};S.exercise.goal.burn=Math.max(0,int(t.value));save();refreshExGoal();break;}
    case 'diet-nutri':{const k=todayKey();S.diet.days[k]=S.diet.days[k]||{};S.diet.days[k].nutri=S.diet.days[k].nutri||{p:0,c:0,f:0};S.diet.days[k].nutri[t.dataset.f]=int(t.value);save();break;}
    case 'diet-fridge-text':{const it=(S.diet.fridge||[]).find(x=>x.id===id);if(it){it[t.dataset.f]=t.value;save();}break;}
    case 'meal':{const k=todayKey();S.diet.days[k]=S.diet.days[k]||{};S.diet.days[k][t.dataset.m]=+t.value||0;save();
      const tot=todayIntake();refreshLinks();break;}
    case 'ev-text':{const evs=S.schedule.events[selDate]||[];if(evs[+t.dataset.i]){evs[+t.dataset.i].text=t.value;save();}break;}
    case 'goal-text':{const mk=`${calY}-${String(calM+1).padStart(2,'0')}`;(S.schedule.goals[mk]=S.schedule.goals[mk]||[])[+t.dataset.i].text=t.value;save();break;}
    case 'year-goal':S.schedule.yearlyGoal=t.value;save();break;
    case 'acc':curMedia()[t.dataset.f]=t.value;save();break;
    case 'post-f':{const p=curMedia().posts.find(x=>x.id===id);p[t.dataset.f]=t.value;save();break;}
    case 'post-review':{const p=curMedia().posts.find(x=>x.id===id);p.review=t.value;save();break;}
    case 'insp-text':curMedia().inspiration[t.dataset.k][+t.dataset.i].text=t.value;save();break;
    case 'insp-src':curMedia().inspiration[t.dataset.k][+t.dataset.i].src=t.value;save();break;
    case 'vi-f':{const v=S.video.find(x=>x.id===id);v[t.dataset.f]=t.value;save();break;}
    case 'vm-text':{const v=S.video.find(x=>x.id===id);v.materials[t.dataset.k][+t.dataset.i].text=t.value;save();break;}
    case 'soft-sop':{const s=S.study.software.find(x=>x.id===id);s.sop=t.value;save();break;}
    case 'acad':S.study.academic[t.dataset.f]=t.value;save();break;
    case 'daily-text':{const d=S.study.daily.find(x=>x.id===id);d.text=t.value;save();break;}
    case 'eng-custom':S.study.english.custom=t.value.split('\n').filter(Boolean);save();break;
    case 'study-chat-a':{S.study.english.chat=S.study.english.chat||{scene:'',q:'',a:'',score:0,tip:''};S.study.english.chat.a=t.value;save();break;}
    case 'study-recite':{S.study.english.recite=S.study.english.recite||{en:'',myText:''};S.study.english.recite.myText=t.value;S.study.english.recite.en=daySentence().en;save();break;}
    /* 复盘字段（实时写入） */
    case 'review-field':{
      const key=reviewKeyOf(reviewScope);
      const obj=S.review[reviewScope]=S.review[reviewScope]||{};
      const rec=obj[key]=obj[key]||{};
      rec[t.dataset.f]=t.value;save();break;
    }
    case 'review-score':{
      const key=reviewKeyOf(reviewScope);
      const obj=S.review[reviewScope]=S.review[reviewScope]||{};
      const rec=obj[key]=obj[key]||{};
      rec.score=+t.value;const lbl=$('#rvScoreVal');if(lbl)lbl.textContent=t.value;save();break;
    }
    /* 阅读 */
    case 'rd-prog':{
      const b=S.reading.books.find(x=>x.id===id);if(b){b.progress=+t.value||0;save();}
      const lbl=t.nextElementSibling;
      if(lbl) lbl.textContent=(+t.value||0)+((b&&b.progressMode==='pages')?' 页':'%');
      break;}
    /* 运动：输入框（modal 内的仅占位，不持久化草稿） */
    case 'ex-coach-input': break;
    case 'ex-coll-name': break;
    case 'ex-blog-name': break;
    case 'ex-day-action': break;
    /* 行业情报：要闻摘记实时保存 */
    case 'intel-news-note':S.intel.newsNote=t.value;save();break;
  }
}
function onContentChange(e){
  const t=e.target.closest('[data-act]');if(!t)return;
    switch(t.dataset.act){
    case 'diet-fridge-cat':{const it=(S.diet.fridge||[]).find(x=>x.id===id);if(it){it.cat=t.value;save();renderModule();}break;}
    case 'year-percent':{const mk=`${calY}-${String(+t.dataset.m+1).padStart(2,'0')}`;S.schedule.ratings[mk]=S.schedule.ratings[mk]||{};S.schedule.ratings[mk].percent=clamp(+t.value||0,0,100);save();break;}
    case 'year-summary':{const mk=`${calY}-${String(+t.dataset.m+1).padStart(2,'0')}`;S.schedule.ratings[mk]=S.schedule.ratings[mk]||{};S.schedule.ratings[mk].summary=t.value;save();break;}
    case 'rd-filter-type':readingFilterType=t.value;renderModule();break;
    case 'mood-photo-input':{
      const f=t.files[0]; if(!f)return;
      (async()=>{
        const url=await fileToScaledDataURL(f,1000,0.8);
        setMood(s=>{ s.photo=url; });
        const prev=$('#moodPhotoPrev');
        if(prev) prev.innerHTML=`<img src="${url}" style="max-width:160px;border-radius:12px"><button class="btn danger sm" data-act="mood-photo-del">移除</button>`;
      })();
      break;
    }
    case 'bg-upload-input':{
      if(S.backgroundLocked){ toast('背景已锁定，请先解锁'); break; }
      const f=t.files[0]; if(!f)return;
      (async()=>{
        const url=await fileToScaledDataURL(f,1400,0.82);
        S.background=S.background||{global:'',perModule:{}};
        if(bgScopeCur==='module') S.background.perModule[current]=url; else S.background.global=url;
        S.backgroundLocked=true; save(); applyBackground(); renderModule(); toast('背景已设置并锁定 🔒');
      })();
      break;
    }
  }
}

/* 星星点击（todo 半星） */
function starClick(t,id,e){
  const rect=t.getBoundingClientRect();
  const pos=(e.clientX-rect.left)/rect.width; // 0..1
  let n=clamp(Math.ceil(pos*5),1,5);
  const rel=pos*5 - Math.floor(pos*5); // 在当前星内的比例
  if(rel<0.5) n=Math.max(0,n-0.5);
  n=clamp(n,0,5);
  const x=S.todos.find(y=>y.id===id);x.stars=n;save();renderModule();
}
function setMood(fn){
  let rec=S.mood.history.find(h=>h.date===todayKey());
  if(!rec){rec={date:todayKey(),score:7,status:'happy',emoji:'happy',text:''};S.mood.history.push(rec);}
  fn(rec);rec.text=moodPhrase(rec);save();
}
function refreshMoodText(){
  const rec=S.mood.history.find(h=>h.date===todayKey());if(!rec)return;
  const txt=moodPhrase(rec);
  $('#moodText').textContent=txt;
  setMood(s=>{s.text=txt;});
}

/* 热点 / 视频 → 灵感库 联动 */
function findHot(id){let r=null;Object.keys(S.hot).forEach(p=>{const x=S.hot[p].find(h=>h.id===id);if(x)r=x;});return r;}
function saveInspiration(topic,tag){
  // 归类：根据 tag 选分类，默认 effect
  const map={'特效贴纸':'effect','音效':'sfx','音乐':'music','剪辑':'editing'};
  let key='effect';
  Object.keys(map).forEach(k=>{if((tag||'').includes(k))key=map[k];});
  curMedia().inspiration[key].push({text:topic,src:'来自爆款热点'});save();
  toast('已存为灵感，同步至自媒体灵感库 ✓');
}
function syncToInsp(key,text){
  if(!text)return;
  const map={effect:'特效贴纸类',sfx:'音效类',music:'音乐类',editing:'剪辑技巧类'};
  // 避免重复
  if(curMedia().inspiration[key].some(m=>m.text===text))return;
  curMedia().inspiration[key].push({text,src:'来自视频拆解'});save();
  toast(`已同步至灵感库·${map[key]} ✓`);
}

/* 待办回车录入（通用）已有 inline，这里处理心情/日程回车 */
document.addEventListener('keydown',e=>{
  if(e.key==='Enter' && e.target.dataset && e.target.dataset.act==='ev-add'){
    const v=e.target.value.trim();if(!v)return;
    S.schedule.events[selDate]=S.schedule.events[selDate]||[];
    S.schedule.events[selDate].push({text:v,color:evColor});save();renderModule();
    toast('已添加日程');
  }
});

/* 备忘录保存 */
function saveMemo(){
  const txt=$('#memoInput').value.trim();if(!txt){toast('写点什么再保存吧~');return;}
  const d=$('#memoDate').value, tm=$('#memoTime').value;
  const remind=(d&&tm)?`${d} ${tm}`:(d?d:(tm?tm:''));
  const remindAt=(d&&tm)?new Date(`${d}T${tm}`).getTime():0;
  if(editingMemoId){
    const m=S.memo.find(x=>x.id===editingMemoId);
    if(m){m.text=txt;m.important=$('#memoImp').value;m.remind=remind;m.remindAt=remindAt;m.media=memoMedia;m._notified=false;}
    save();renderModule();toast('备忘录已更新');
    editingMemoId=null;memoMedia=[];
    return;
  }
  S.memo.push({id:uid(),text:txt,done:false,important:$('#memoImp').value,
    remind,remindAt,media:memoMedia,createdAt:Date.now()});
  save();renderModule();toast('备忘录已保存');
  memoMedia=[];
}

/* ============================================================
   全局搜索
   ============================================================ */
function doSearch(){
  const q=$('#globalSearch').value.trim().toLowerCase();if(!q){toast('请输入搜索内容');return;}
  const res=[];
  const push=(mod,text,extra)=>{if(text.toLowerCase().includes(q))res.push({mod,text,extra});};
  S.todos.forEach(t=>push('todo',t.text));
  S.ledger.forEach(r=>push('ledger',`${r.note||r.category} ${r.amount}`));
  S.exercise.records.forEach(r=>push('exercise',r.name));
  Object.values(S.media.accounts).forEach(a=>{
    (a.posts||[]).forEach(p=>push('media',p.topic));
    (a.topics?a.topics.todo.concat(a.topics.done):[]).forEach(t=>push('media',t.text));
  });
  Object.values(S.hot).flat().forEach(h=>push('hot',h.topic));
  S.video.forEach(v=>push('video',`${v.blogger} ${v.topic} ${v.structure||''}`));
  S.memo.forEach(m=>push('memo',m.text));
  (S.media.notes||[]).forEach(n=>push('media',(n.title||'')+' '+notesStripTags(n.html)));
  S.schedule.events&&Object.values(S.schedule.events).flat().forEach(e=>push('schedule',e.text));
  S.study.software.forEach(s=>push('study',s.name));
  S.study.english.custom.forEach(c=>push('study',c));
  S.reading.books.forEach(b=>{
    push('reading',`${b.title} ${b.author} ${b.summary||''}`);
    ['quotes','points','thoughts'].forEach(k=>{(b.notes&&b.notes[k]||[]).forEach(n=>push('reading',n.text));});
  });
  openModal(kitty('#c9a3ff',26)+` 搜索结果（${res.length}）`,
    res.length?res.map(r=>`<div class="search-result" data-act="search-go" data-mod="${r.mod}"><span class="sr-mod">${MODULES.find(m=>m.id===r.mod).name}</span><div class="sr-text">${esc(r.text.slice(0,80))}</div></div>`).join('')
    :'<div class="empty">没有找到匹配内容~</div>','<button class="btn" data-act="modal-cancel">关闭</button>',
    ()=>{ $$('[data-act=search-go]').forEach(el=>el.onclick=()=>{current=el.dataset.mod;renderNav();renderModule();closeModal();});});
}

/* ============================================================
   提醒检查
   ============================================================ */
function checkReminders(){
  const now=Date.now();
  S.memo.forEach(m=>{
    if(m.remindAt && !m._notified && now>=m.remindAt && now-m.remindAt<60000){
      m._notified=true;save();
      toast(`<strong>⏰ 备忘提醒</strong><br>${esc(m.text.slice(0,60))}`,'remind');
    }
  });
}

/* ============================================================
   数据备份 / 设置（导出 / 导入 / 清空）
   ============================================================ */
function blobToBase64(blob){
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onload=()=>res(String(fr.result).split(',')[1]);
    fr.onerror=rej; fr.readAsDataURL(blob);
  });
}
async function exportBackup(){
  try{
    const rows=await MediaDB.getAll();
    const media=[];
    for(const row of rows){
      const b64=await blobToBase64(row.blob);
      media.push({id:row.id,name:row.name,type:row.type,data:b64});
    }
    const payload={app:'hk-workbench',version:S_VERSION,exportedAt:new Date().toISOString(),state:S,media};
    const blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`善善的工作台备份_${todayKey()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('📦 完整备份已导出');
  }catch(e){ toast('导出失败：'+(e.message||e)); }
}
async function importBackup(file){
  try{
    const payload=JSON.parse(await file.text());
    if(!payload||!payload.state){ toast('备份文件无效'); return; }
    S=deepMerge(seed(), payload.state);
    S.version=S_VERSION; save();
    if(Array.isArray(payload.media)){
      for(const m of payload.media){
        const bin=atob(m.data); const arr=new Uint8Array(bin.length);
        for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
        const blob=new Blob([arr],{type:m.type==='video'?'video/mp4':'image/png'});
        await MediaDB.putMedia(m.id,blob,{name:m.name,type:m.type});
      }
    }
    renderNav(); renderModule(); closeModal();
    toast(`📥 备份已恢复（含 ${payload.media?payload.media.length:0} 个媒体文件）`);
  }catch(e){ toast('导入失败：'+(e.message||e)); }
}
function openSettings(){
  const sizeKB=Math.round(JSON.stringify(S).length/1024);
  const cfg=loadSyncCfg();
  openModal(kitty('#c9a3ff',26)+' 数据备份与设置',`
    <div class="settings-card">
      <p class="muted">所有数据都会<b>实时自动保存</b>在你的浏览器本地（文字存 localStorage，图片/视频存媒体库），刷新或关闭页面都不丢。当你更新工作台、或换设备/换网址时，用下面的「导出 / 导入」即可把全部数据（含媒体）完整迁移过去。</p>
      <div class="settings-row">
        <div>
          <div class="st-title">📦 导出完整备份</div>
          <div class="muted">下载一个 JSON，包含全部文字数据与你上传的所有图片 / 视频（约 ${sizeKB}KB 文字 + 媒体）。建议每周导出一次。</div>
        </div>
        <button class="btn" data-act="export-backup">导出</button>
      </div>
      <div class="settings-row">
        <div>
          <div class="st-title">📥 导入 / 恢复备份</div>
          <div class="muted">选择之前导出的备份文件，一键恢复全部数据与媒体（会覆盖当前内容）。</div>
        </div>
        <button class="btn ghost" data-act="import-backup">导入</button>
        <input type="file" id="importFile" accept="application/json" hidden>
      </div>
      <div class="settings-row">
        <div>
          <div class="st-title">🗑 清空全部数据</div>
          <div class="muted">删除当前所有记录（不可恢复，请先导出备份）。</div>
        </div>
        <button class="btn danger" data-act="reset-all">清空</button>
      </div>
      <div class="settings-row" style="justify-content:space-between">
        <div>
          <div class="st-title">🔒 锁定所有分栏头像</div>
          <div class="muted">开启后，所有分栏图标不可点击更换；关闭则全部解锁。</div>
        </div>
        <label class="switch"><input type="checkbox" id="lockAllToggle" ${S.iconLocked&&Object.keys(S.iconLocked).length&&Object.values(S.iconLocked).every(v=>v)?'checked':''}><span class="slider"></span></label>
      </div>
      <div class="settings-row" style="flex-direction:column;align-items:stretch">
        <div class="st-title">☁ GitHub 云同步（多设备互通）</div>
        <div class="muted" style="margin-bottom:6px">开启后，数据自动存到你 GitHub 仓库的 <code>workbench-data.json</code>，手机 / 电脑自动同步。token 只存在你本机，不会发给我。</div>
        <div class="settings-sync">
          <label class="muted">GitHub 令牌 Token</label>
          <input type="password" class="inp" id="syncToken" placeholder="粘贴 github_pat_..." value="${cfg.token||''}">
          <div style="display:flex;gap:8px">
            <div style="flex:1"><label class="muted">仓库所有者</label><input class="inp" id="syncOwner" value="${cfg.owner||SYNC_DEFAULT_OWNER}"></div>
            <div style="flex:1"><label class="muted">仓库名</label><input class="inp" id="syncRepo" value="${cfg.repo||SYNC_DEFAULT_REPO}"></div>
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" id="syncSaveBtn">保存并开启</button>
            <button class="btn ghost" id="syncNowBtn">立即同步一次</button>
            <button class="btn danger" id="syncDisableBtn">关闭同步</button>
          </div>
          <div class="muted" id="syncStatus" style="margin-top:6px">${cfg.lastSync?('上次同步：'+new Date(cfg.lastSync).toLocaleString()):'尚未同步'}</div>
          <div class="muted" style="margin-top:6px;font-size:12px">⚠️ 该文件位于公开仓库，理论上可被链接读取。请勿在备忘 / 台账写入密码等极度敏感信息；若很在意隐私，可另建一个私有仓库专放数据。</div>
        </div>
      </div>
      <div class="muted" style="margin-top:12px">当前数据版本 v${S_VERSION} ｜ 存储键 ${KEY}</div>
    </div>
  `,'<button class="btn" data-act="modal-cancel">关闭</button>',(body)=>{
    body.querySelector('[data-act=export-backup]').onclick=exportBackup;
    body.querySelector('[data-act=import-backup]').onclick=()=>body.querySelector('#importFile').click();
    body.querySelector('#importFile').onchange=async (e)=>{ if(e.target.files[0]) await importBackup(e.target.files[0]); };
    const lockAll=body.querySelector('#lockAllToggle');
    if(lockAll) lockAll.addEventListener('change',()=>{
      S.iconLocked=S.iconLocked||{};
      MODULES.forEach(m=>S.iconLocked[m.id]=lockAll.checked);
      save(); renderNav();
      toast(lockAll.checked?'已锁定全部分栏头像':'已解锁全部分栏头像');
    });
    body.querySelector('[data-act=reset-all]').onclick=()=>{
      if(confirm('确定清空所有数据？此操作不可恢复，建议先导出备份。')){
        try{localStorage.removeItem(KEY);}catch(e){}
        S=seed(); S.version=S_VERSION; save(); renderNav(); renderModule(); closeModal();
        toast('已清空全部数据');
      }
    };
    const tokEl=body.querySelector('#syncToken');
    const ownEl=body.querySelector('#syncOwner');
    const repEl=body.querySelector('#syncRepo');
    const statEl=body.querySelector('#syncStatus');
    body.querySelector('#syncSaveBtn').onclick=async ()=>{
      const c=loadSyncCfg();
      c.token=tokEl.value.trim(); c.owner=ownEl.value.trim(); c.repo=repEl.value.trim(); c.enabled=true;
      if(!c.token){ toast('请先粘贴 token'); return; }
      saveSyncCfg(c); statEl.textContent='正在同步…';
      try{ await pushSync(); await pullSync(); statEl.textContent='☁ 已同步 '+new Date().toLocaleString(); toast('☁ 云同步已开启'); }
      catch(e){ statEl.textContent='同步失败：'+(e.message||e); toast('同步失败：'+(e.message||e)); }
    };
    body.querySelector('#syncNowBtn').onclick=async ()=>{
      const c=loadSyncCfg(); if(!c.enabled||!c.token){ toast('请先保存并开启'); return; }
      statEl.textContent='正在同步…';
      try{ await pushSync(); await pullSync(); statEl.textContent='☁ 已同步 '+new Date().toLocaleString(); toast('已同步'); }
      catch(e){ statEl.textContent='同步失败：'+(e.message||e); }
    };
    body.querySelector('#syncDisableBtn').onclick=()=>{
      const c=loadSyncCfg(); c.enabled=false; saveSyncCfg(c);
      statEl.textContent='已关闭同步'; toast('已关闭云同步');
    };
  });
}

/* ============================================================
   板块重写：穿搭 / 待办 / 复盘 / 饮食 / 学习 / 理财 / 记账 / 自媒体
   （同名覆盖旧函数）
   ============================================================ */

/* ---- 穿搭板块 ---- */
function renderOutfit(){
  if(!S.outfit.weather && !outfitWeatherTried){ outfitWeatherTried=true; loadOutfitWeather(false); }
  const o=S.outfit;
  const sub=o.sub||'today';
  const tabs=[['today','今日穿搭'],['closet','单品库'],['inspire','灵感库'],['ai','AI搭配师']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="outfit" data-sub="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(sub==='closet') body=renderOutfitCloset();
  else if(sub==='inspire') body=renderOutfitInspire();
  else if(sub==='ai') body=renderOutfitAI();
  else body=renderOutfitToday();
  return `<div class="card">${header('outfit','穿搭衣橱')}${tabHtml}${body}</div>`;
}
function renderOutfitToday(){
  const o=S.outfit, k=todayKey();
  const tl=(o.looks||[]).find(l=>l.date===k);
  const w=o.weather;
  const wx=w&&w.temp!=null?`<div class="outfit-wx"><div class="outfit-wx-temp">${Math.round(w.temp)}°C</div><div class="outfit-wx-desc">${esc(w.desc||'')} · ${w.umbrella?'☔ 记得带伞':'🌤 无需带伞'}</div><div class="outfit-wx-tip">${esc(w.tip||'')}</div><button class="btn ghost sm" data-act="outfit-refresh-weather">刷新天气</button></div>`:`<div class="outfit-wx"><div class="muted">获取天气获取穿搭建议~</div><button class="btn ghost sm" data-act="outfit-refresh-weather">获取天气</button></div>`;
  return `${wx}
    <div class="sub-title">今日穿搭 <button class="btn sm" data-act="outfit-look-add" style="float:right">+ 记录穿搭</button></div>
    ${tl?`${tl.img?`<div style="margin:8px 0"><img src="${tl.img}" style="width:100%;max-height:280px;object-fit:cover;border-radius:14px"></div>`:''}
    <div class="ex-card" style="margin-top:8px">
      <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag">${esc(tl.occasion||'日常')}</span>${tl.feeling?`<span class="muted">感受：${esc(tl.feeling)}</span>`:''}</div>
      ${tl.note?`<div class="muted" style="margin-top:6px">${esc(tl.note)}</div>`:''}
      <div class="li-actions" style="margin-top:8px"><button class="btn danger sm" data-act="outfit-look-del" data-id="${tl.id}">删除</button></div>
    </div>`:'<div class="empty">还没有记录今日穿搭，点击上方按钮上传穿搭照片~</div>'}`;
}
function renderOutfitCloset(){
  const o=S.outfit;
  const cats=['上装','下装','外套','鞋履','配饰'], seasons=['春','夏','秋','冬','四季'];
  const filtered=o.closet.filter(c=>(outfitCatFilter==='全部'||c.cat===outfitCatFilter)&&(outfitSeasonFilter==='全部'||c.season===outfitSeasonFilter));
  return `<div class="chip-row">
    <button class="chip ${outfitCatFilter==='全部'?'on':''}" data-act="outfit-cat-filter" data-v="全部">全部</button>
    ${cats.map(c=>`<button class="chip ${outfitCatFilter===c?'on':''}" data-act="outfit-cat-filter" data-v="${c}">${c}</button>`).join('')}
  </div>
  <div class="chip-row">
    <button class="chip ${outfitSeasonFilter==='全部'?'on':''}" data-act="outfit-season-filter" data-v="全部">全部季节</button>
    ${seasons.map(s=>`<button class="chip ${outfitSeasonFilter===s?'on':''}" data-act="outfit-season-filter" data-v="${s}">${s}</button>`).join('')}
  </div>
  <button class="btn sm" data-act="outfit-closet-add" style="margin:8px 0">+ 新增单品</button>
  <div class="closet-grid">
    ${filtered.length?filtered.map(c=>`
      <div class="closet-card">
        ${c.img?`<img class="closet-img" src="${c.img}" alt="${esc(c.name)}">`:`<div class="closet-img closet-img-empty">👚</div>`}
        <div class="closet-name">${esc(c.name)}</div>
        <div class="muted" style="font-size:12px">${esc(c.cat)} · ${esc(c.season)}${c.color?' · '+esc(c.color):''}</div>
        <div class="muted" style="font-size:12px">穿搭 ${c.wornCount||0} 次</div>
        <div class="li-actions"><button class="btn ghost sm" data-act="outfit-closet-edit" data-id="${c.id}">编辑</button><button class="btn danger sm" data-act="outfit-closet-del" data-id="${c.id}">删</button></div>
      </div>`).join(''):emptySVG('pencil')+'<div class="empty">还没有单品，点「新增单品」充实衣橱~</div>'}
  </div>`;
}
function renderOutfitInspire(){
  const insps=S.outfit.inspirations||[];
  return `<div class="sub-title">穿搭灵感 <button class="btn ghost sm" data-act="outfit-inspire-refresh" style="float:right">🔄 换一批推荐</button></div>
  <div class="muted" style="margin-bottom:10px">联网推荐不同风格穿搭内容，点击收藏喜欢的灵感~</div>
  <div class="inspire-grid">
    ${insps.length?insps.map(i=>`
      <div class="inspire-card">
        <div style="font-weight:700">${esc(i.title)}</div>
        ${i.tags&&i.tags.length?`<div class="chip-row" style="margin-top:6px">${i.tags.map(t=>`<span class="chip" style="cursor:default;font-size:11px">${esc(t)}</span>`).join('')}</div>`:''}
        ${i.desc?`<div class="muted" style="margin-top:6px;font-size:13px">${esc(i.desc)}</div>`:''}
        <div class="li-actions" style="margin-top:6px"><button class="btn ${i.saved?'':'ghost'} sm" data-act="outfit-inspire-save" data-id="${i.id}">${i.saved?'已收藏':'收藏'}</button></div>
      </div>`).join(''):emptySVG('pencil')+'<div class="empty">点击「换一批推荐」获取穿搭灵感~</div>'}
  </div>`;
}
function renderOutfitAI(){
  const o=S.outfit;
  const accs=o.accessories||[];
  return `<div class="sub-title">AI 搭配师</div>
  <div class="ex-card" style="margin-bottom:12px">
    <div style="font-weight:700;margin-bottom:8px">一键自动搭配</div>
    <div class="muted" style="margin-bottom:10px">基于单品库内已有服饰自动生成穿搭方案</div>
    <button class="ex-cta" data-act="outfit-ai-match">🤖 一键自动搭配</button>
    <div id="outfitAIResult" style="margin-top:12px"></div>
  </div>
  <div class="ex-card" style="margin-bottom:12px">
    <div style="font-weight:700;margin-bottom:8px">配饰推荐 <button class="btn ghost sm" data-act="outfit-acc-add" style="float:right">+ 添加配饰</button></div>
    ${accs.length?accs.map(a=>`<div class="list-item"><div class="li-main"><strong>${esc(a.name)}</strong><div class="muted" style="font-size:12px">${esc(a.type||'')}</div></div><div class="li-actions"><button class="btn danger sm" data-act="outfit-acc-del" data-id="${a.id}">删</button></div></div>`).join(''):'<div class="muted">还没有配饰，添加后可自动匹配~</div>'}
    <button class="btn ghost sm" data-act="outfit-ai-acc" style="margin-top:8px">🔍 匹配今日配饰</button>
    <div id="outfitAccResult" style="margin-top:12px"></div>
  </div>
  <div class="ex-card">
    <div style="font-weight:700;margin-bottom:8px">发型推荐</div>
    <button class="ex-cta" data-act="outfit-ai-hair">💇 推荐发型</button>
    <div id="outfitHairResult" style="margin-top:12px"></div>
  </div>`;
}
async function refreshOutfitInspire(){
  const presets=[
    {title:'法式慵懒风',tags:['法式','慵懒','日常'],desc:'白衬衫+高腰阔腿裤+乐福鞋，简约优雅的巴黎街头感。'},
    {title:'甜酷少女风',tags:['甜酷','少女','街头'],desc:'Oversize卫衣+百褶裙+马丁靴，甜美与帅气并存。'},
    {title:'职场精英风',tags:['职场','通勤','干练'],desc:'西装外套+直筒裤+尖头高跟鞋，气场全开的职场look。'},
    {title:'日系清新风',tags:['日系','清新','文艺'],desc:'针织开衫+碎花裙+帆布鞋，温柔治愈的森系少女。'},
    {title:'复古港风',tags:['复古','港风','怀旧'],desc:'波点连衣裙+珍珠项链+玛丽珍鞋，90年代港星范。'},
    {title:'极简性冷淡',tags:['极简','高级'],desc:'黑白色系+利落剪裁+几何配饰，less is more。'},
    {title:'运动活力风',tags:['运动','活力','休闲'],desc:'运动背心+骑行裤+老爹鞋，健康活力的健身房穿搭。'},
    {title:'温柔约会风',tags:['约会','温柔','浪漫'],desc:'蕾丝上衣+伞裙+细带凉鞋，心动约会必备造型。'},
    {title:'韩系女主风',tags:['韩系','温柔'],desc:'大毛衣+半身裙+短靴，韩剧女主同款温柔感。'},
    {title:'街头嘻哈风',tags:['街头','嘻哈','潮酷'],desc:'连帽卫衣+工装裤+运动鞋，态度十足的街头潮人。'}
  ];
  const shuffled=presets.sort(()=>Math.random()-0.5).slice(0,6);
  const saved=(S.outfit.inspirations||[]).filter(i=>i.saved);
  S.outfit.inspirations=shuffled.map(p=>({id:uid(),title:p.title,tags:p.tags,desc:p.desc,saved:false})).concat(saved);
  try{
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),3500);
    const r=await fetch('https://api.example.com/outfit-inspire?n=6',{signal:ctrl.signal});
    clearTimeout(to);
    if(r.ok){const d=await r.json();if(d&&Array.isArray(d.list)&&d.list.length){
      S.outfit.inspirations=d.list.map(x=>({id:uid(),title:String(x.title||'').slice(0,60),tags:Array.isArray(x.tags)?x.tags:[],desc:String(x.desc||'').slice(0,200),saved:false})).concat(saved);
    }}
  }catch(e){}
  save();
}
function outfitAIMatch(){
  const cl=S.outfit.closet||[];
  const tops=cl.filter(i=>i.cat==='上装'),bots=cl.filter(i=>i.cat==='下装'),outs=cl.filter(i=>i.cat==='外套'),shs=cl.filter(i=>i.cat==='鞋履');
  if(!tops.length||!bots.length){toast('单品库中至少需要上装和下装才能搭配');return;}
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const top=pick(tops),bot=pick(bots),out=outs.length?pick(outs):null,sh=shs.length?pick(shs):null;
  const tips=['颜色搭配建议：上浅下深，视觉重心稳定','建议搭配同色系配饰提升整体感','外套与内搭形成层次感，更显精致','鞋履颜色可与包包呼应','适当露出腰线，优化身材比例','整体色系不超过3种主色更高级'];
  const tip=tips[Math.floor(Math.random()*tips.length)];
  const el=$('#outfitAIResult');
  if(el) el.innerHTML=`<div class="ex-card" style="background:#f9f4fb"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="muted">上装：</span><strong>${esc(top.name)}</strong>${out?`<span class="muted" style="margin-left:8px">外套：</span><strong>${esc(out.name)}</strong>`:''}<span class="muted" style="margin-left:8px">下装：</span><strong>${esc(bot.name)}</strong>${sh?`<span class="muted" style="margin-left:8px">鞋履：</span><strong>${esc(sh.name)}</strong>`:''}</div><div class="muted" style="margin-top:10px">💡 ${esc(tip)}</div></div>`;
}
function outfitAIHair(){
  const hairs=[{n:'高马尾',d:'活力清新，适合运动休闲风'},{n:'低丸子头',d:'优雅慵懒，适合日常通勤'},{n:'法式编发',d:'浪漫精致，适合约会场合'},{n:'波浪卷披发',d:'温柔女神范，适合正式场合'},{n:'半扎发',d:'甜美减龄，适合学院风'},{n:'利落盘发',d:'干练知性，适合职场'}];
  const tl=(S.outfit.looks||[]).find(l=>l.date===todayKey());
  const occ=tl?tl.occasion:'日常';
  const match={'日常':1,'通勤':5,'约会':2,'运动':0,'正式':3,'休闲':1};
  const idx=match[occ]!==undefined?match[occ]:1;
  const r=hairs[idx],others=hairs.filter((_,i)=>i!==idx).sort(()=>Math.random()-0.5).slice(0,3);
  const el=$('#outfitHairResult');
  if(el) el.innerHTML=`<div class="ex-card" style="background:#f9f4fb"><div class="muted">基于今日场合「${esc(occ)}」推荐</div><div style="font-weight:700;font-size:16px;margin-top:6px">${esc(r.n)}</div><div class="muted" style="margin-top:4px">${esc(r.d)}</div><div class="muted" style="margin-top:10px">其他推荐：</div><div class="chip-row" style="margin-top:6px">${others.map(h=>`<span class="chip" style="cursor:default">${esc(h.n)}</span>`).join('')}</div></div>`;
}
function outfitAIMatchAcc(){
  const accs=S.outfit.accessories||[];
  if(!accs.length){toast('请先添加配饰');return;}
  const tl=(S.outfit.looks||[]).find(l=>l.date===todayKey());
  const occ=tl?tl.occasion:'日常';
  const pick=accs[Math.floor(Math.random()*accs.length)];
  const el=$('#outfitAccResult');
  if(el) el.innerHTML=`<div class="ex-card" style="background:#f9f4fb"><div class="muted">基于今日场合「${esc(occ)}」推荐</div><div style="font-weight:700;margin-top:6px">${esc(pick.name)}</div><div class="muted">${esc(pick.type||'配饰')}</div></div>`;
}

/* ---- 待办板块 ---- */
function renderTodo(){
  const sub=S.todoSub||'today';
  const tabs=[['today','今日待办'],['history','待办历史'],['review','待办复盘']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="todoSub" data-sub="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(sub==='history') body=renderTodoHistory();
  else if(sub==='review') body=renderTodoReview();
  else body=renderTodoToday();
  return `<div class="card">${header('todo','今日待办')}${tabHtml}${body}</div>`;
}
function renderTodoToday(){
  const h=S.habits||(S.habits={water:{done:false,date:''},supplements:[]});
  const k=todayKey();
  if(h.water.date!==k){h.water.done=false;h.water.date=k;}
  (h.supplements||[]).forEach(s=>{if(s.date!==k){s.done=false;s.date=k;}});
  const todos=S.todos||[];
  const doneCount=todos.filter(t=>t.done).length;
  const pct=todos.length?Math.round(doneCount/todos.length*100):0;
  return `
    <div class="sub-title">日常习惯打卡</div>
    <div style="display:flex;align-items:center;gap:14px;padding:14px;background:linear-gradient(135deg,#f0f7ff,#f5f0ff);border-radius:14px;margin:10px 0">
      <div style="font-size:40px">${h.water.done?'💧':'🥤'}</div>
      <div style="flex:1"><div style="font-weight:700">${h.water.done?'今日饮水已达标 ✓':'今日饮水未达标'}</div><div class="muted">点击下方按钮打卡</div></div>
      <button class="btn ${h.water.done?'ghost sm':'sm'}" data-act="habit-water-toggle">${h.water.done?'取消':'打卡'}</button>
    </div>
    <div class="sub-title" style="margin-top:14px">营养补剂</div>
    <div style="display:flex;gap:8px;margin:8px 0"><input class="inp" id="suppInput" placeholder="如：维生素D / 鱼油 / 胶原蛋白" style="flex:1"><button class="btn sm" data-act="habit-supp-add">添加</button></div>
    ${(h.supplements||[]).length?(h.supplements||[]).map(s=>`<div class="list-item"><span class="check ${s.done?'on':''}" data-act="habit-supp-toggle" data-id="${s.id}"></span><div class="li-main"><span style="${s.done?'text-decoration:line-through;color:var(--text-soft)':''}">${esc(s.name)}</span></div><div class="li-actions"><button class="btn danger sm" data-act="habit-supp-del" data-id="${s.id}">删</button></div></div>`).join(''):'<div class="muted">还没有添加补剂~</div>'}
    <div class="sub-title" style="margin-top:18px">今日事项待办</div>
    <div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span class="muted">完成度</span><span>${doneCount}/${todos.length} (${pct}%)</span></div><div class="bar"><div class="bar-fill" style="width:${pct}%;background:linear-gradient(90deg,#ff6fa5,#a78bfa)"></div></div></div>
    <div id="todoList">${todos.length?todos.map(t=>todoItem(t)).join(''):emptySVG('clip')+'<div class="empty">还没有待办，点右下角 + 添加今天的小目标吧~</div>'}</div>`;
}
function renderTodoHistory(){
  // 自动归档今日待办（如果今天还没归档过）
  autoArchiveTodos();
  const archives=(S.todoArchives||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `
    <div class="sub-title">待办历史归档 (${archives.length}天)</div>
    <div class="muted" style="margin-bottom:10px">每天自动归档当日待办快照，点击日期可展开查看详情</div>
    ${archives.length?archives.slice(0,60).map(a=>{
      const pct=a.total?a.doneCount/a.total*100:0;
      return `<div class="todo-hist-day">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="todo-hist-date">${esc(a.date)}</span>
          <span class="muted">${a.doneCount}/${a.total} (${Math.round(pct)}%)</span>
        </div>
        <div class="bar" style="margin:6px 0"><div class="bar-fill" style="width:${pct}%;background:linear-gradient(90deg,#ff6fa5,#a78bfa)"></div></div>
        <div style="display:${a._expanded?'block':'none'}">
          ${(a.items||[]).map(it=>`<div class="todo-hist-item"><span class="${it.done?'done-mark':'undone-mark'}">${it.done?'✓':'○'}</span><span style="${it.done?'text-decoration:line-through;color:var(--text-soft)':''}">${esc(it.text)}</span></div>`).join('')||'<div class="muted">当天无待办记录</div>'}
        </div>
        <button class="btn ghost sm" data-act="todo-hist-toggle" data-date="${a.date}" style="margin-top:4px;font-size:12px">${a._expanded?'收起':'展开'}</button>
      </div>`;
    }).join(''):emptySVG('clip')+'<div class="empty">还没有历史记录，开始使用待办功能后会自动归档~</div>'}`;
}
function renderTodoReview(){
  const sub=S.todoReviewSub||'weekly';
  const tabs=[['weekly','周复盘'],['monthly','月复盘'],['yearly','年复盘']];
  const tabHtml=`<div class="ex-subtabs" style="margin-bottom:10px">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="todo-review-tab" data-sub="${k}">${n}</button>`).join('')}</div>`;
  const key={weekly:weekKey(),monthly:monthKey(),yearly:String(new Date().getFullYear())}[sub];
  const data=(S.todoReview[sub]||{})[key]||{};
  // 统计数据
  const archives=S.todoArchives||[];
  let filtered=[];
  if(sub==='weekly'){
    const wk=weekKey();
    filtered=archives.filter(a=>{return isInThisWeek(a.date);});
  }else if(sub==='monthly'){
    const mk=monthKey();
    filtered=archives.filter(a=>a.date.slice(0,7)===mk);
  }else{
    const yk=String(new Date().getFullYear());
    filtered=archives.filter(a=>a.date.slice(0,4)===yk);
  }
  const total=filtered.reduce((s,a)=>s+(a.total||0),0);
  const doneCount=filtered.reduce((s,a)=>s+(a.doneCount||0),0);
  const rate=total?Math.round(doneCount/total*100):0;
  const days=filtered.length;
  const avgPerDay=days?Math.round(total/days*10)/10:0;
  const bestDay=filtered.slice().sort((a,b)=>(b.doneCount/b.total||0)-(a.doneCount/a.total||0))[0];
  return `${tabHtml}
    <div class="muted" style="margin-bottom:10px">当前周期：${esc(key)}</div>
    <div class="stat-grid" style="margin-bottom:14px">
      <div class="todo-stat-card"><div class="val">${days}</div><div class="label">记录天数</div></div>
      <div class="todo-stat-card"><div class="val">${total}</div><div class="label">总待办数</div></div>
      <div class="todo-stat-card"><div class="val">${doneCount}</div><div class="label">完成数</div></div>
      <div class="todo-stat-card"><div class="val">${rate}%</div><div class="label">完成率</div></div>
    </div>
    <div class="ex-card" style="margin-bottom:12px">
      <div style="font-weight:700;margin-bottom:8px">📊 数据洞察</div>
      <div style="font-size:13px;line-height:1.8">
        <div>📅 平均每天待办：${avgPerDay} 条</div>
        ${bestDay?`<div>🏆 完成率最高：${bestDay.date}（${bestDay.doneCount}/${bestDay.total}，${Math.round(bestDay.doneCount/bestDay.total*100)}%）</div>`:''}
        ${rate>=80?'<div>✨ 执行力很强，继续保持！</div>':rate>=50?'<div>💪 完成率还有提升空间，加油！</div>':'<div>🌱 别灰心，从每天1-2个小待办开始~</div>'}
      </div>
    </div>
    <div class="sub-title">${sub==='weekly'?'本周':sub==='monthly'?'本月':'本年'}复盘总结</div>
    <textarea class="txtarea" data-act="todo-review-field" data-f="summary" placeholder="写下你的复盘思考：哪些做得好？哪些需要改进？下一步计划..." style="min-height:120px">${esc(data.summary||'')}</textarea>
    <div class="sub-title">下一步行动计划</div>
    <textarea class="txtarea" data-act="todo-review-field" data-f="plan" placeholder="具体可执行的改进计划..." style="min-height:80px">${esc(data.plan||'')}</textarea>
    <button class="btn" data-act="todo-review-save" style="margin-top:14px">保存复盘</button>`;
}
function autoArchiveTodos(){
  const k=todayKey();
  const archives=S.todoArchives||(S.todoArchives=[]);
  const existing=archives.find(a=>a.date===k);
  const todos=S.todos||[];
  const doneCount=todos.filter(t=>t.done).length;
  const items=todos.map(t=>({text:t.text,done:t.done,stars:t.stars||0}));
  if(existing){
    existing.total=todos.length;
    existing.doneCount=doneCount;
    existing.items=items;
  }else{
    if(todos.length>0){
      archives.push({date:k,total:todos.length,doneCount,items,_expanded:false});
    }
  }
  save();
}
function isInThisWeek(dateStr){
  const today=new Date();
  const d=new Date(dateStr);
  const dayOfWeek=today.getDay()||7;
  const monday=new Date(today);
  monday.setDate(today.getDate()-dayOfWeek+1);
  monday.setHours(0,0,0,0);
  const sunday=new Date(monday);
  sunday.setDate(monday.getDate()+6);
  sunday.setHours(23,59,59,999);
  return d>=monday&&d<=sunday;
}

/* ---- 复盘板块 ---- */
const REVIEW_TPLS_NEW={
  daily:[['done','今天完成了什么','记录今天的成果~'],['undone','今天没完成什么','写下还没搞定的事'],['feeling','今天的感受','今天的心情和感悟']],
  weekly:[['aiSummary','AI 周报（自动生成）',''],['nextPlan','下周优化计划','']],
  monthly:[['aiSummary','AI 月报（自动生成）',''],['nextPlan','下月规划','']]
};
function renderReview(){
  const sub=S.review.sub||'daily';
  const tabs=[['daily','今日复盘'],['weekly','周复盘'],['monthly','月复盘'],['module','板块复盘']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="review" data-sub="${k}">${n}</button>`).join('')}</div>`;
  if(sub==='module') return `<div class="card">${header('review','引导式复盘')}${tabHtml}${renderReviewModule()}</div>`;
  const key={daily:todayKey(),weekly:weekKey(),monthly:monthKey()}[sub];
  const data=(S.review[sub]||{})[key]||{};
  const tpl=REVIEW_TPLS_NEW[sub];
  let body='';
  if(sub==='daily'){
    body=tpl.map(([k,label,ph])=>`<div class="muted" style="margin-top:10px;font-weight:700">${label}</div><textarea class="txtarea" data-act="review-field" data-f="${k}" placeholder="${esc(ph)}">${esc(data[k]||'')}</textarea>`).join('');
    body+=`<button class="btn" data-act="review-save" style="margin-top:14px">保存今日复盘</button>`;
  }else{
    const scope=sub;
    body+=`<div class="ex-card" style="margin-bottom:12px"><div style="font-weight:700;margin-bottom:8px">${scope==='weekly'?'本周':'本月'}AI自动汇总</div>`;
    if(data.aiSummary){body+=`<div style="white-space:pre-wrap;font-size:14px;line-height:1.7">${esc(data.aiSummary)}</div>`;}else{body+='<div class="muted">点击下方按钮生成AI汇总报告</div>';}
    body+=`<button class="btn sm" data-act="review-ai-gen" data-scope="${scope}" style="margin-top:10px">🤖 生成${scope==='weekly'?'周':'月'}报</button></div>`;
    body+=`<div class="muted" style="margin-top:10px;font-weight:700">${scope==='weekly'?'下周优化计划':'下月规划'}</div><textarea class="txtarea" data-act="review-field" data-f="nextPlan" placeholder="手动编辑补充...">${esc(data.nextPlan||'')}</textarea>`;
    body+=`<button class="btn" data-act="review-save" style="margin-top:14px">保存${scope==='weekly'?'周':'月'}复盘</button>`;
  }
  return `<div class="card">${header('review','引导式复盘')}${tabHtml}<div class="muted" style="margin-top:8px">当前周期：${esc(key)}</div>${body}</div>`;
}
function renderReviewModule(){
  const mods=[
    {id:'exercise',name:'运动',icon:'🏃'},
    {id:'diet',name:'饮食',icon:'🥗'},
    {id:'ledger',name:'记账',icon:'💰'},
    {id:'outfit',name:'穿搭',icon:'👗'},
    {id:'study',name:'学习',icon:'📚'},
    {id:'media',name:'自媒体',icon:'📱'},
    {id:'reading',name:'阅读',icon:'📖'},
    {id:'finance',name:'理财',icon:'🏦'},
  ];
  const sel=S.review.moduleSel||'';
  if(!sel){
    return `<div class="sub-title">选择板块进行专项复盘</div>
    <div class="module-review-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-top:10px">
      ${mods.map(m=>`<div class="ex-card" style="text-align:center;cursor:pointer;padding:18px 10px" data-act="review-mod-sel" data-id="${m.id}">
        <div style="font-size:32px">${m.icon}</div>
        <div style="font-weight:700;margin-top:6px">${m.name}</div>
      </div>`).join('')}
    </div>`;
  }
  const mod=mods.find(m=>m.id===sel);
  const k=todayKey();
  S.review.moduleReviews=S.review.moduleReviews||{};
  S.review.moduleReviews[sel]=S.review.moduleReviews[sel]||{};
  const rData=S.review.moduleReviews[sel][k]||{};
  let summary=genModuleSummary(sel);
  return `<div class="sub-title">${mod.icon} ${mod.name}专项复盘</div>
  <button class="btn ghost sm" data-act="review-mod-back" style="margin-bottom:10px">← 返回板块列表</button>
  <div class="ex-card" style="margin-bottom:12px">
    <div style="font-weight:700;margin-bottom:8px">📊 今日${mod.name}数据概览</div>
    <div style="white-space:pre-wrap;font-size:14px;line-height:1.7">${esc(summary)}</div>
  </div>
  <div class="muted" style="margin-top:10px;font-weight:700">做得好的地方</div>
  <textarea class="txtarea" data-act="review-mod-field" data-f="good" placeholder="记录今天${mod.name}方面做得好的...">${esc(rData.good||'')}</textarea>
  <div class="muted" style="margin-top:10px;font-weight:700">需要改进的</div>
  <textarea class="txtarea" data-act="review-mod-field" data-f="improve" placeholder="记录需要改进的地方...">${esc(rData.improve||'')}</textarea>
  <div class="muted" style="margin-top:10px;font-weight:700">明日计划</div>
  <textarea class="txtarea" data-act="review-mod-field" data-f="plan" placeholder="明天的${mod.name}计划...">${esc(rData.plan||'')}</textarea>
  <button class="btn" data-act="review-mod-save" style="margin-top:14px">保存${mod.name}复盘</button>`;
}
function genModuleSummary(modId){
  const k=todayKey(),wk=weekKey(),mk=k.slice(0,7);
  if(modId==='exercise'){
    const recs=(S.exercise.records||[]).filter(r=>r.date===k);
    const wRecs=(S.exercise.records||[]).filter(r=>r.date>=wk);
    const wMin=wRecs.reduce((s,r)=>s+int(r.duration||0),0);
    return `今日运动：${recs.length}次，${recs.reduce((s,r)=>s+int(r.duration||0),0)}分钟\n本周运动：${wRecs.length}次，共${wMin}分钟\n连续打卡：${S.exercise.streak||0}天`+(recs.length?`\n项目：${recs.map(r=>esc(r.name)).join('、')}`:'\n今日暂未运动');
  }
  if(modId==='diet'){
    const d=S.diet.days[k];
    if(!d) return '今日暂无饮食记录';
    const totalCal=(d.nutri&&(d.nutri.c||0))||0;
    return `今日三餐：\n早餐 ${d.foods&&d.foods.b?d.foods.b.length:0}项，午餐 ${d.foods&&d.foods.l?d.foods.l.length:0}项，晚餐 ${d.foods&&d.foods.d?d.foods.d.length:0}项\n总热量：约${totalCal}千卡\n饮水：${S.diet.water||0}杯`;
  }
  if(modId==='ledger'){
    const inc=S.ledger.filter(r=>r.type==='income'&&r.date===k).reduce((s,r)=>s+Number(r.amount),0);
    const exp=S.ledger.filter(r=>r.type==='expense'&&r.date===k).reduce((s,r)=>s+Number(r.amount),0);
    const mInc=S.ledger.filter(r=>r.type==='income'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
    const mExp=S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
    return `今日收入：¥${money(inc)}\n今日支出：¥${money(exp)}\n今日结余：¥${money(inc-exp)}\n本月结余：¥${money(mInc-mExp)}`;
  }
  if(modId==='outfit') return `今日穿搭已记录：${(S.outfit.closet||S.outfit.inspirations||[]).length?'有单品和灵感记录':'暂无记录'}\n衣橱单品：${(S.outfit.closet||[]).length}件`;
  if(modId==='study'){
    const wCount=(S.study.daily||[]).filter(d=>d.date>=wk).length;
    return `本周学习记录：${wCount}条\n英语等级：${S.study.english.level||'零基础'}\n英语连续打卡：${S.study.english.streak||0}天`;
  }
  if(modId==='media'){
    const A=curMedia();
    const wPosts=(A.posts||[]).filter(p=>p.date>=wk);
    return `当前账号：${esc(A.name)}\n粉丝：${int(A.fans)}\n本周发布：${wPosts.length}条\n总发布：${(A.posts||[]).length}条`;
  }
  if(modId==='reading'){
    const books=S.reading.books||[];
    const reading=books.filter(b=>b.status==='reading');
    return `书架：${books.length}本\n在读：${reading.length}本\n已读：${books.filter(b=>b.status==='read').length}本`+(reading.length?`\n正在读：${reading.map(b=>esc(b.title)).join('、')}`:'');
  }
  if(modId==='finance'){
    return `理财等级：${S.finance.level||'小白'}\n已学习产品：${(S.finance.products||[]).length}个\n理财知识记录：${(S.finance.learnHistory||[]).length}条`;
  }
  return '暂无数据概览';
}
function reviewAIGen(scope){
  const k=todayKey();
  let summary='';
  if(scope==='weekly'){
    const wk=weekKey();
    const todos=S.todos||[];
    const todoDone=todos.filter(t=>t.done).length;
    const exRecords=(S.exercise.records||[]).filter(r=>r.date>=wk);
    const exDays=new Set(exRecords.map(r=>r.date)).size;
    const exMin=exRecords.reduce((s,r)=>s+int(r.duration||0),0);
    const inc=S.ledger.filter(r=>r.type==='income'&&r.date>=wk).reduce((s,r)=>s+Number(r.amount),0);
    const exp=S.ledger.filter(r=>r.type==='expense'&&r.date>=wk).reduce((s,r)=>s+Number(r.amount),0);
    const dietDays=Object.keys(S.diet.days||{}).filter(d=>d>=wk).length;
    const reviewDays=Object.keys(S.review.daily||{}).filter(d=>d>=wk).length;
    summary=`📊 本周数据汇总\n\n✅ 待办完成：${todoDone}/${todos.length} 项\n🏃 运动天数：${exDays} 天，总时长 ${exMin} 分钟\n💰 收支情况：收入 ¥${money(inc)}，支出 ¥${money(exp)}，结余 ¥${money(inc-exp)}\n🥗 饮食记录：${dietDays} 天\n📝 复盘记录：${reviewDays} 天\n\n`;
    summary+=exDays>=3?'👍 运动坚持不错，继续保持！\n':'⚠️ 运动量偏少，建议每周至少运动3次。\n';
    summary+=(inc-exp)>0?'👍 本周有结余，理财意识良好。\n':'⚠️ 本周支出超过收入，注意控制消费。\n';
    summary+=reviewDays>=5?'👍 复盘习惯很棒！\n':'⚠️ 建议每天坚持复盘，提升自我认知。\n';
    summary+='\n📋 下周优化建议：\n1. 继续保持好的习惯\n2. 针对未达标项制定具体改进措施\n3. 合理安排时间，提高效率';
  }else{
    const mk=monthKey();
    const todos=S.todos||[];
    const todoDone=todos.filter(t=>t.done).length;
    const exRecords=(S.exercise.records||[]).filter(r=>r.date.slice(0,7)===mk);
    const exDays=new Set(exRecords.map(r=>r.date)).size;
    const inc=S.ledger.filter(r=>r.type==='income'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
    const exp=S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
    const dietDays=Object.keys(S.diet.days||{}).filter(d=>d.slice(0,7)===mk).length;
    const reviewDays=Object.keys(S.review.daily||{}).filter(d=>d.slice(0,7)===mk).length;
    summary=`📊 本月数据汇总\n\n✅ 待办完成：${todoDone}/${todos.length} 项\n🏃 运动天数：${exDays} 天\n💰 收入 ¥${money(inc)}，支出 ¥${money(exp)}，结余 ¥${money(inc-exp)}\n🥗 饮食记录：${dietDays} 天\n📝 复盘记录：${reviewDays} 天\n\n`;
    summary+=exDays>=12?'👍 月运动量达标，非常棒！\n':'⚠️ 月运动量不足12天，建议增加运动频率。\n';
    summary+=(inc-exp)>0?'👍 本月有结余。\n':'⚠️ 本月入不敷出，需要调整消费习惯。\n';
    summary+='\n📋 下月规划建议：\n1. 设定明确的月度目标\n2. 制定可执行的周计划\n3. 定期检视进度并调整';
  }
  const key=scope==='weekly'?weekKey():monthKey();
  S.review[scope]=S.review[scope]||{};
  S.review[scope][key]=S.review[scope][key]||{};
  S.review[scope][key].aiSummary=summary;
  save();renderModule();toast('AI汇总报告已生成 📊');
}

/* ---- 饮食板块 ---- */
function renderDiet(){
  const sub=S.diet.sub||'today';
  const tabs=[['today','今日饮食'],['history','饮食记录'],['plan','饮食计划'],['recipe','食谱库'],['fridge','冰箱'],['ai','AI食谱']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="diet" data-sub="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(sub==='history') body=renderDietHistory();
  else if(sub==='plan') body=renderDietPlan();
  else if(sub==='recipe') body=renderDietRecipe();
  else if(sub==='fridge') body=renderDietFridge();
  else if(sub==='ai') body=renderDietAI();
  else body=renderDietToday();
  return `<div class="card">${header('diet','饮食管理')}${tabHtml}${body}</div>`;
}
function renderDietToday(){
  const k=todayKey(), d=S.diet.days[k]||(S.diet.days[k]={b:0,l:0,d:0,nutri:{p:0,c:0,f:0},foods:{b:[],l:[],d:[]}});
  const foods=d.foods||(d.foods={b:[],l:[],d:[]});
  const mealLabel={b:'早餐',l:'午餐',d:'晚餐'};
  const mealHtml=['b','l','d'].map(m=>{
    const items=foods[m]||[];
    const total=items.reduce((s,i)=>s+Number(i.kcal||0),0);
    return `<div class="ex-card" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700">${mealLabel[m]}</span><span class="muted">${total} kcal</span></div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
        <input class="inp sm" style="flex:1;min-width:100px" data-act="diet-food-add" data-m="${m}" data-f="name" placeholder="食物名">
        <input class="inp sm" style="width:80px" type="number" data-act="diet-food-add" data-m="${m}" data-f="kcal" placeholder="kcal">
        <input class="inp sm" style="width:70px" type="number" data-act="diet-food-add" data-m="${m}" data-f="protein" placeholder="蛋白g">
        <button class="btn sm" data-act="diet-food-add-btn" data-m="${m}">+</button>
      </div>
      ${items.length?items.map((it,i)=>`<div class="list-item"><div class="li-main"><span>${esc(it.name)} - ${it.kcal||0}kcal ${it.protein?'· 蛋白'+it.protein+'g':''}</span></div><div class="li-actions"><button class="btn danger sm" data-act="diet-food-del" data-m="${m}" data-i="${i}">删</button></div></div>`).join(''):''}
    </div>`;
  }).join('');
  const totalKcal=todayIntake();
  return `${mealHtml}
  <div class="ex-card" style="background:linear-gradient(135deg,#fff0f7,#f3ecff)">
    <div class="stat-grid">
      <div class="stat"><div class="label">今日总摄入</div><div class="val">${totalKcal}</div><div class="unit">kcal</div></div>
      <div class="stat"><div class="label">基础代谢</div><div class="val">${getBMR()}</div><div class="unit">kcal</div></div>
      <div class="stat"><div class="label">热量缺口</div><div class="val" style="color:var(--pink-d)">${calorieGap()}</div><div class="unit">kcal</div></div>
    </div>
  </div>
  <div class="sub-title">饮水记录</div>
  <div class="water-box">
    <div class="water-ring" style="background:conic-gradient(var(--mint) ${Math.min(100,Math.round((S.diet.waterDate===todayKey()?Number(S.diet.water||0):0)/8*100))}%, var(--line) 0)">
      <div class="water-ring-in"><div class="water-pct">${S.diet.waterDate===todayKey()?Number(S.diet.water||0):0}/8</div><div class="water-sub">杯</div></div>
    </div>
    <div class="water-ctrl"><button class="btn" data-act="diet-water" data-d="-1">－</button><button class="btn" data-act="diet-water" data-d="1">＋</button></div>
    <div class="bar" style="flex:1;margin-left:10px"><div class="bar-fill mint" style="width:${Math.min(100,Math.round((S.diet.waterDate===todayKey()?Number(S.diet.water||0):0)/8*100))}%"></div></div>
  </div>`;
}
function renderDietHistory(){
  const days=S.diet.days||{};
  const dates=Object.keys(days).sort().reverse();
  return `<div class="sub-title">饮食历史记录</div>
  <div class="muted">共 ${dates.length} 天有记录</div>
  ${dates.slice(0,30).map(d=>{
    const dd=days[d]; const total=int(dd.b||0)+int(dd.l||0)+int(dd.d||0);
    const foods=dd.foods||{};
    return `<div class="ex-card" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between"><strong>${esc(d)}</strong><span class="muted">${total} kcal</span></div>
      ${['b','l','d'].map(m=>{const items=foods[m]||[];return items.length?`<div class="muted" style="margin-top:4px;font-size:13px">${{b:'早',l:'午',d:'晚'}[m]}：${items.map(i=>esc(i.name)+' '+i.kcal+'kcal').join('，')}</div>`:'';}).join('')}
    </div>`;
  }).join('')||'<div class="empty">还没有饮食记录~</div>'}
  ${dates.length>=7?`<div class="sub-title">近7天热量趋势</div>${svgBars(dates.slice(0,7).reverse().map(d=>({label:d.slice(5),value:int(days[d].b||0)+int(days[d].l||0)+int(days[d].d||0)})))}`:''}`;
}
function renderDietPlan(){
  const plans=S.diet.plans||[];
  return `<div class="sub-title">AI 饮食计划</div>
  <div class="ex-card" style="margin-bottom:12px">
    <div class="muted" style="margin-bottom:8px">选择目标和每日热量，AI营养师为你定制方案</div>
    <div class="row" style="gap:10px">
      <select class="inp" id="planGoal"><option value="减重">减重</option><option value="增肌">增肌</option><option value="保持">保持</option></select>
      <input class="inp" type="number" id="planKcal" placeholder="目标热量" style="flex:1">
      <button class="btn" data-act="diet-plan-gen">生成方案</button>
    </div>
  </div>
  ${plans.length?plans.slice(-3).map(p=>`<div class="ex-card" style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between"><strong>${esc(p.date)} · ${esc(p.goal)}</strong><span class="muted">${p.totalKcal||0} kcal</span></div>
    <div class="muted" style="margin-top:6px;font-size:13px">早餐：${esc(p.meals.b.desc)} (${p.meals.b.kcal}kcal)</div>
    <div class="muted" style="font-size:13px">午餐：${esc(p.meals.l.desc)} (${p.meals.l.kcal}kcal)</div>
    <div class="muted" style="font-size:13px">晚餐：${esc(p.meals.d.desc)} (${p.meals.d.kcal}kcal)</div>
  </div>`).join(''):'<div class="muted">还没有生成饮食计划~</div>'}`;
}
function renderDietRecipe(){
  const recipes=S.diet.recipes||[];
  return `<div class="sub-title">食谱库 <button class="btn ghost sm" data-act="diet-recipe-refresh" style="float:right">🔄 换一批推荐</button></div>
  ${recipes.length?recipes.map(r=>`<div class="ex-card" style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between"><strong>${esc(r.title)}</strong><span class="tag">${esc(r.cat)}</span></div>
    <div class="muted" style="margin-top:4px;font-size:13px">食材：${esc(r.ingr)}</div>
    ${r.method?`<div class="muted" style="margin-top:4px;font-size:13px">做法：${esc(r.method)}</div>`:''}
    <div class="li-actions" style="margin-top:6px"><button class="btn ${r.saved?'':'ghost'} sm" data-act="diet-recipe-save" data-id="${r.id}">${r.saved?'已收藏':'收藏'}</button></div>
  </div>`).join(''):'<div class="empty">点击「换一批推荐」获取食谱~</div>'}
  ${(S.diet.recipesFav||[]).length?`<div class="sub-title">已收藏食谱 (${S.diet.recipesFav.length})</div>${S.diet.recipesFav.map(r=>`<div class="ex-card" style="margin-bottom:8px"><strong>⭐ ${esc(r.title)}</strong><div class="muted" style="font-size:13px;margin-top:4px">${esc(r.ingr)}</div>${r.method?`<div class="muted" style="font-size:13px">${esc(r.method)}</div>`:''}</div>`).join('')}`:''}`;
}
function renderDietFridge(){
  const cats=['蔬菜','肉蛋','水果','主食','调味','其他'];
  const fridge=S.diet.fridge||[];
  const groups=cats.map(cat=>{
    const items=fridge.filter(x=>x.cat===cat);
    if(!items.length) return '';
    return `<div class="fridge-group"><div class="fridge-cat">${cat}</div>${items.map(it=>{
      const exp=it.expire?new Date(it.expire):null;
      const daysLeft=exp?Math.ceil((exp-new Date())/(86400000)):null;
      const warn=daysLeft!==null&&daysLeft<=3;
      return `<div class="list-item ${warn?'fridge-warn':''}">
        <div class="li-main">
          ${it.img?`<img src="${it.img}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;margin-right:8px;float:left">`:''}
          <strong>${esc(it.name)}</strong>
          <div class="muted" style="font-size:12px">${esc(it.qty||'')} · 购买：${esc(it.buyDate||'')} · 保质期：${esc(it.expire||'')}</div>
          ${warn?`<div style="color:#e06a6a;font-size:12px;font-weight:700;margin-top:2px">⚠️ 还有 ${daysLeft} 天到期！</div>`:''}
        </div>
        <div class="li-actions"><button class="btn danger sm" data-act="diet-fridge-del" data-id="${it.id}">删</button></div>
      </div>`;
    }).join('')}</div>`;
  }).join('');
  return `<div class="sub-title">冰箱食材 <button class="btn sm" data-act="diet-fridge-add" style="float:right">+ 添加食材</button></div>
  ${groups||'<div class="muted">冰箱是空的，添加点食材吧~</div>'}`;
}
function renderDietAI(){
  const fridge=S.diet.fridge||[];
  return `<div class="sub-title">AI 食谱推荐</div>
  <div class="ex-card" style="margin-bottom:12px">
    <div class="muted" style="margin-bottom:8px">选择口味偏好，结合冰箱食材智能推荐食谱</div>
    <div class="chip-row">
      ${['清淡','辛辣','甜食','咸鲜','酸辣'].map(t=>`<button class="chip" data-act="diet-ai-taste" data-v="${t}">${t}</button>`).join('')}
    </div>
    <div id="dietAIResult" style="margin-top:12px"></div>
  </div>
  <div class="muted">冰箱现有食材：${fridge.length?fridge.map(f=>esc(f.name)).join('、'):'暂无食材'}</div>`;
}
function classifyFood(name){
  const n=name||'';
  if(/菜|菠|白|萝|茄|瓜|豆|藕|菌|菇|葱|姜|蒜|韭菜|芹菜|生菜|白菜|番茄|土豆|黄瓜|胡萝卜/.test(n))return '蔬菜';
  if(/肉|鸡|鱼|蛋|虾|牛|猪|鸭|羊|排骨|火腿|肠|肉丸/.test(n))return '肉蛋';
  if(/果|苹|香|橘|橙|葡|莓|梨|桃|西瓜|哈密|芒果|榴莲|柠檬/.test(n))return '水果';
  if(/米|面|粉|包|饼|麦|粥|馒头|饺子|馄饨|面条|面包/.test(n))return '主食';
  if(/盐|酱|醋|油|椒|料|味精|糖|蜂蜜|蚝油|料酒/.test(n))return '调味';
  return '其他';
}
function foodShelfLife(cat){
  return {'蔬菜':5,'肉蛋':3,'水果':7,'主食':30,'调味':180,'其他':7}[cat]||7;
}
async function refreshDietRecipes(){
  const presets=[
    {title:'番茄炒蛋',cat:'家常',ingr:'番茄2个、鸡蛋3个、盐糖适量',method:'蛋打散炒熟盛出，番茄翻炒出汁，加蛋翻炒调味'},
    {title:'清蒸鲈鱼',cat:'清淡',ingr:'鲈鱼1条、姜丝、葱段、蒸鱼豉油',method:'鱼处理干净铺姜葱，大火蒸8分钟，淋豉油热油'},
    {title:'红烧排骨',cat:'家常',ingr:'排骨500g、酱油、冰糖、料酒、八角',method:'排骨焯水，炒糖色，加调料炖煮40分钟'},
    {title:'蒜蓉西兰花',cat:'清淡',ingr:'西兰花1颗、蒜末、盐',method:'西兰花焯水，蒜末爆香，翻炒调味'},
    {title:'可乐鸡翅',cat:'甜味',ingr:'鸡翅10个、可乐1罐、酱油、姜',method:'鸡翅煎至金黄，加可乐酱油炖煮收汁'},
    {title:'酸辣土豆丝',cat:'酸辣',ingr:'土豆2个、醋、干辣椒、花椒',method:'土豆切丝泡水，爆香辣椒，大火快炒加醋'},
    {title:'紫菜蛋花汤',cat:'汤品',ingr:'紫菜、鸡蛋2个、盐、香油',method:'水烧开下紫菜，淋蛋液，调味出锅'},
    {title:'葱油拌面',cat:'主食',ingr:'面条、小葱、酱油、糖',method:'葱油炸至焦黄，面条煮熟拌入葱油酱油'},
    {title:'糖醋里脊',cat:'甜酸',ingr:'里脊肉、番茄酱、白糖、醋、淀粉',method:'肉条裹淀粉炸酥，糖醋汁烧开勾芡'},
    {title:'麻婆豆腐',cat:'辛辣',ingr:'豆腐1块、肉末、豆瓣酱、花椒粉',method:'肉末炒香加豆瓣酱，豆腐炖煮勾芡撒花椒'},
    {title:'凉拌黄瓜',cat:'清淡',ingr:'黄瓜2根、蒜末、醋、辣椒',method:'黄瓜拍碎，加调料拌匀冷藏'},
    {title:'蛋炒饭',cat:'主食',ingr:'米饭、鸡蛋2个、葱花、盐',method:'蛋炒散加米饭翻炒，调味撒葱花'}
  ];
  const shuffled=presets.sort(()=>Math.random()-0.5).slice(0,6);
  S.diet.recipes=shuffled.map(p=>({id:uid(),...p,saved:false}));
  try{
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),3500);
    const r=await fetch('https://api.example.com/recipes?n=6',{signal:ctrl.signal});
    clearTimeout(to);
    if(r.ok){const d=await r.json();if(d&&Array.isArray(d.list)&&d.list.length){
      S.diet.recipes=d.list.map(x=>({id:uid(),title:String(x.title||''),cat:String(x.cat||''),ingr:String(x.ingr||''),method:String(x.method||''),saved:false}));
    }}
  }catch(e){}
  save();
}
function dietAIRecommend(taste){
  const fridge=S.diet.fridge||[];
  const recipes=[
    {taste:'清淡',title:'清炒时蔬',desc:'用冰箱里的蔬菜清炒，保留原味营养',need:'蔬菜'},
    {taste:'辛辣',title:'辣炒鸡丁',desc:'鸡肉切丁加辣椒爆炒，下饭神器',need:'肉蛋'},
    {taste:'甜食',title:'香甜水果沙拉',desc:'冰箱水果切丁拌酸奶，健康甜品',need:'水果'},
    {taste:'咸鲜',title:'酱油炒饭',desc:'剩饭加鸡蛋酱油大火快炒，咸香可口',need:'主食'},
    {taste:'酸辣',title:'酸辣汤',desc:'豆腐木耳加醋辣椒，开胃暖身',need:'蔬菜'}
  ];
  const r=recipes.find(x=>x.taste===taste)||recipes[0];
  const has=fridge.some(f=>classifyFood(f.name)===r.need);
  const el=$('#dietAIResult');
  if(el) el.innerHTML=`<div class="ex-card" style="background:#f9f4fb">
    <div style="font-weight:700;font-size:16px">🍽️ ${esc(r.title)}</div>
    <div class="muted" style="margin-top:6px">${esc(r.desc)}</div>
    <div class="muted" style="margin-top:8px">需要食材类别：${esc(r.need)} ${has?'✅ 冰箱有':'❌ 冰箱缺少'}</div>
    ${!has?`<div class="muted" style="margin-top:8px">📦 食材不足，推荐外卖：${esc(['美团外卖','饿了么','京东到家'][Math.floor(Math.random()*3)])} 搜索"${esc(r.title)}"</div>`:''}
  </div>`;
}

/* ---- 学习板块 ---- */
const ENGLISH_MAP={
  vocab:{name:'词汇积累',icon:'📚',nodes:[{id:'v1',t:'日常问候',d:'打招呼与告别',w:['hello','good morning','how are you']},{id:'v2',t:'数字时间',d:'数字与时间',w:['one','two','time','clock','today']},{id:'v3',t:'食物饮品',d:'饮食词汇',w:['water','bread','rice','coffee','eat']},{id:'v4',t:'情绪感受',d:'表达情绪',w:['happy','sad','angry','excited','calm']}]},
  scene:{name:'实用场景',icon:'🗣️',nodes:[{id:'s1',t:'餐厅点餐',d:'英语点餐',w:['menu','order','bill','delicious']},{id:'s2',t:'购物对话',d:'购物交流',w:['buy','price','size','discount']},{id:'s3',t:'问路方向',d:'英语问路',w:['where','left','right','go straight']}]},
  movie:{name:'影视化情景',icon:'🎬',nodes:[{id:'m1',t:'经典台词',d:'电影常用台词',w:['love','forever','remember','dream']},{id:'m2',t:'美剧对白',d:'日常对话',w:['seriously','awesome','whatever']},{id:'m3',t:'动画台词',d:'简单有趣',w:['adventure','friend','magic','brave']}]}
};
const MODULE_TOPICS={study:'Let\'s talk about learning! What are you studying?',finance:'Let\'s talk about money management!',exercise:'Let\'s talk about fitness!',diet:'Let\'s talk about food and healthy eating!',todo:'Let\'s talk about daily planning!',media:'Let\'s talk about content creation!',ledger:'Let\'s talk about budgeting!',outfit:'Let\'s talk about fashion!',review:'Let\'s talk about reflection!'};
function enCoachReply(input){
  const low=(input||'').toLowerCase();
  const rules=[
    {kw:['hello','hi','hey'],r:'Hello! I\'m your English coach. How are you today? 😊'},
    {kw:['how are you'],r:'I\'m great, thanks! How is your English learning going?'},
    {kw:['good','fine','great','well'],r:'Wonderful! Keep practicing every day. What would you like to talk about?'},
    {kw:['study','learn','english'],r:'Learning is a journey! Consistency is key. What\'s your biggest challenge?'},
    {kw:['difficult','hard','challenge'],r:'Don\'t worry! Every learner faces challenges. Let\'s break it down together.'},
    {kw:['work','job','office'],r:'Talking about work is great practice! What do you do?'},
    {kw:['food','eat','hungry'],r:'I love food topics! What\'s your favorite food?'},
    {kw:['weather','rain','sun'],r:'Weather is a great conversation starter! How\'s the weather where you are?'},
    {kw:['travel','trip','vacation'],r:'Travel is exciting! Where would you like to go?'},
    {kw:['thank','thanks'],r:'You\'re welcome! Keep up the great work!'},
    {kw:['bye','goodbye'],r:'Goodbye! Keep practicing every day!'}
  ];
  for(const r of rules){if(r.kw.some(k=>low.includes(k)))return r.r;}
  return `Interesting! You said: "${input}". Can you tell me more? Try using new words!`;
}
function renderStudy(){
  const sub=S.study.sub||'software';
  const tabs=[['software','软件技能类'],['academic','学业学习类'],['daily','日常技能类'],['english','英语学习类']];
  const tabHtml=`<div class="ex-subtabs" style="overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="study" data-sub="${k}" style="flex-shrink:0">${n}</button>`).join('')}</div>`;
  let body='';
  if(sub==='academic') body=renderStudyAcademic();
  else if(sub==='daily') body=renderStudyDaily();
  else if(sub==='english') body=renderStudyEnglish();
  else body=renderStudySoftware();
  return `<div class="card">${header('study','学习工作台')}${tabHtml}${body}</div>`;
}
function renderStudySoftware(){
  const soft=(S.study.software||[]).slice().reverse();
  return `${soft.length?soft.map(s=>`<div class="list-item"><div class="li-main"><strong>${esc(s.name)}</strong> <span class="muted">${s.date}</span><textarea class="txtarea sm" style="margin-top:6px" data-act="soft-sop" data-id="${s.id}" placeholder="SOP步骤">${esc(s.sop||'')}</textarea></div><div class="li-actions"><button class="btn danger sm" data-act="soft-del" data-id="${s.id}">删</button></div></div>`).join(''):emptySVG('pencil')+'<div class="empty">还没有录入软件技能</div>'}
  <button class="btn ghost sm" data-act="soft-add" style="margin-top:8px">+ 添加软件技能</button>`;
}
function renderStudyAcademic(){
  const a=S.study.academic||{summary:'',topics:''};
  return `<div class="sub-title">今日知识点总结</div><textarea class="txtarea" data-act="acad" data-f="summary" placeholder="沉淀今天学到的专业知识…">${esc(a.summary||'')}</textarea>
  <div class="sub-title">毕设/项目选题积累</div><textarea class="txtarea" data-act="acad" data-f="topics" placeholder="记录灵感选题…">${esc(a.topics||'')}</textarea>`;
}
function renderStudyDaily(){
  const daily=(S.study.daily||[]).slice().reverse();
  return `${daily.length?daily.map(d=>`<div class="list-item"><div class="li-main"><input class="inp" value="${esc(d.text)}" data-act="daily-text" data-id="${d.id}"><div class="muted" style="margin-top:4px">${d.date}</div></div><div class="li-actions"><button class="btn danger sm" data-act="daily-del" data-id="${d.id}">删</button></div></div>`).join(''):emptySVG('pencil')+'<div class="empty">还没有记录日常技巧</div>'}
  <button class="btn ghost sm" data-act="daily-add" style="margin-top:8px">+ 添加日常技巧</button>`;
}
function renderStudyEnglish(){
  const e=S.study.english;
  const levels=['零基础','初级','中级','高级'];
  const weak=e.weak||[];
  const coachMsgs=e.coachMsgs||[];
  let html=`<div class="stat-grid"><div class="stat"><div class="label">连续学习</div><div class="val">${e.streak||0}</div><div class="unit">天</div></div>
  <div class="stat"><div class="label">难度等级</div><div class="chip-row" style="margin-top:4px">${levels.map(l=>`<button class="chip ${e.level===l?'on':''}" data-act="en-level" data-lv="${l}">${l}</button>`).join('')}</div></div></div>`;
  html+=`<div class="sub-title">英语学习地图</div>`;
  Object.keys(ENGLISH_MAP).forEach(pk=>{
    const path=ENGLISH_MAP[pk];const prog=(e.mapProgress||{})[pk]||0;const total=path.nodes.length;
    const pct=total?Math.round(prog/total*100):0;
    html+=`<div class="ex-card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><strong>${path.icon} ${path.name}</strong><span class="muted">${prog}/${total} · ${pct}%</span></div>
    <div class="bar" style="margin:6px 0"><div class="bar-fill" style="width:${pct}%"></div></div>
    <div style="display:flex;overflow-x:auto;gap:8px;padding-bottom:4px">${path.nodes.map((node,idx)=>{
      const done=idx<prog;
      return `<button class="ex-tab ${done?'on':''}" data-act="en-map-node" data-path="${pk}" data-idx="${idx}" style="flex-shrink:0;min-width:120px;text-align:center;opacity:${idx<=prog?1:0.4}">
        <div style="font-size:12px">${done?'✓ ':''}${node.t}</div><div class="muted" style="font-size:10px;white-space:normal">${node.d}</div></button>`;
    }).join('')}</div></div>`;
  });
  html+=`<div class="sub-title">AI口语陪练师</div>`;
  html+=`<div id="enCoachBox" style="max-height:280px;overflow-y:auto;margin-top:8px;border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--card-soft)">${coachMsgs.length?coachMsgs.map(m=>`<div style="margin-bottom:8px;text-align:${m.role==='user'?'right':'left'}"><span style="display:inline-block;max-width:80%;padding:6px 12px;border-radius:14px;background:${m.role==='user'?'var(--pink-d)':'var(--card)'};color:${m.role==='user'?'#fff':'var(--text)'};font-size:13px;line-height:1.5">${esc(m.text)}</span></div>`).join(''):'<div class="muted" style="text-align:center;padding:16px">点击「生成话题」开始练习</div>'}</div>`;
  html+=`<div class="row" style="margin-top:8px;gap:8px"><input class="inp" id="enCoachInput" placeholder="Type in English..." style="flex:1"><button class="btn" data-act="en-coach-send">发送</button></div>`;
  html+=`<div class="chip-row" style="margin-top:4px"><button class="btn ghost sm" data-act="en-coach-topic">生成板块话题</button><button class="btn ghost sm" data-act="en-coach-clear">清空对话</button></div>`;
  html+=`<div class="sub-title">错题本 (${weak.length})</div>`;
  html+=weak.length?weak.map((w,i)=>`<div class="list-item"><div class="li-main"><strong>${esc(w.word||'')}</strong><div class="muted" style="font-size:12px">话题：${esc(w.topic||'')}</div><div class="muted" style="font-size:12px">上下文：${esc(w.context||'')}</div></div><div class="li-actions"><button class="btn danger sm" data-act="en-weak-del" data-idx="${i}">删</button></div></div>`).join(''):'<div class="muted">卡壳的单词会自动加入这里~</div>';
  // 保留原有单词和长难句
  const words=dayWords(),st=daySentence();
  html+=`<div class="sub-title">每日单词</div><div id="wordList" style="margin-top:10px;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${words.slice(0,15).map((it,i)=>{const w=it.w;return `<div style="display:flex;gap:8px;align-items:flex-start;background:var(--card-soft);border:1px solid var(--line);border-radius:12px;padding:8px 10px"><span class="check ${it.mastered?'on':''}" data-act="word-master" data-i="${i}" style="margin-top:4px"></span><div style="font-size:13px;line-height:1.5;flex:1"><strong>${esc(w[0])}</strong> <span class="muted">${esc(w[1])}</span><br>${esc(w[2])}<br><span class="muted">例：${esc(w[4])}</span></div><button class="btn ghost xs" data-act="study-weak-add" data-i="${i}">生词</button></div>`;}).join('')}</div>`;
  html+=`<div class="sub-title">每日长难句</div><div style="padding:10px;background:var(--card-soft);border-radius:12px;font-size:14px;line-height:1.6;margin-top:8px"><strong>${esc(st.en)}</strong><br><span class="muted">译文：</span>${esc(st.cn)}<br><span class="muted">语法：</span>${esc(st.split)}</div>`;
  return html;
}

/* ---- 理财板块 ---- */
function finCoachReply(input){
  const low=(input||'').toLowerCase();const lvl=S.finance.level||'小白';
  const rules=[
    {kw:['基金','fund'],r:lvl==='小白'?'基金是把大家的钱集合起来交给专业人士投资。建议从货币基金开始，风险低适合入门。':'基金分股票型、债券型、混合型。定投是降低风险的好方法，建议长期持有。'},
    {kw:['股票','stock','炒股'],r:lvl==='小白'?'股票是上市公司所有权凭证，价格会波动。新手先学基础知识，不要盲目入场。':'股票需分析基本面和技术面。关注蓝筹股和行业龙头，分散投资，设好止损线。'},
    {kw:['债券','bond','国债'],r:'债券是借款凭证。国债风险最低，企业债收益较高但风险也大。适合稳健型配置。'},
    {kw:['货币','余额宝','零钱通'],r:'货币基金如余额宝是入门首选，流动性好、风险低，适合存放应急资金。'},
    {kw:['保险','重疾','医疗险'],r:'保险是风险管理工具，先保障后理财。建议配置重疾险、医疗险、意外险。'},
    {kw:['定投','定期定额'],r:'定投是定期定额投资基金，能平滑成本降低风险，适合长期投资。建议选指数基金定投。'},
    {kw:['新手','入门','开始','小白'],r:'新手理财三步：1.存应急金(3-6月支出) 2.买基础保险 3.定投指数基金。坚持长期投资！'},
    {kw:['谢谢','感谢'],r:'不客气！理财是一辈子的功课，有问题随时问我！'}
  ];
  for(const r of rules){if(r.kw.some(k=>low.includes(k)))return r.r;}
  return `好问题！作为${lvl}投资者，可以问我基金、股票、债券、保险、黄金、定投等话题。`;
}
function renderFinance(){
  const sub=S.finance.sub||'basic';
  const tabs=[['basic','基础知识学习'],['mode','理财模式'],['product','产品记录']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="finance" data-sub="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(sub==='mode') body=renderFinMode();
  else if(sub==='product') body=renderFinProduct();
  else body=renderFinBasic();
  return `<div class="card">${header('finance','理财工作台')}${tabHtml}${body}</div>`;
}
function renderFinBasic(){
  const f=S.finance;const levels=['小白','中级','高级','财富女王'];const dk=f.dailyKnowledge||{};
  const msgs=f.chatMsgs||[];
  let html=`<div class="stat-grid"><div class="stat"><div class="label">用户等级</div><div class="chip-row" style="margin-top:4px">${levels.map(l=>`<button class="chip ${f.level===l?'on':''}" data-act="fin-level" data-lv="${l}">${l}</button>`).join('')}</div></div>
  <div class="stat"><div class="label">每日知识</div><div class="val" style="font-size:14px">${dk.date===todayKey()?'已更新':'待更新'}</div></div></div>`;
  html+=`<button class="btn sm" data-act="fin-refresh-knowledge" style="margin-top:8px">🔄 刷新今日知识</button>`;
  if(dk.title){html+=`<div class="ex-card" style="margin-top:12px"><div class="sub-title">今日理财知识 (${esc(dk.level||f.level||'小白')})</div><div style="font-weight:700;margin:8px 0">${esc(dk.title)}</div><div style="white-space:pre-wrap;font-size:13px;line-height:1.7">${esc(dk.content||'')}</div></div>`;}
  html+=`<div class="sub-title">AI 理财老师</div>`;
  html+=`<div id="finCoachBox" style="max-height:280px;overflow-y:auto;margin-top:8px;border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--card-soft)">${msgs.length?msgs.map(m=>`<div style="margin-bottom:8px;text-align:${m.role==='user'?'right':'left'}"><span style="display:inline-block;max-width:80%;padding:6px 12px;border-radius:14px;background:${m.role==='user'?'var(--pink-d)':'var(--card)'};color:${m.role==='user'?'#fff':'var(--text)'};font-size:13px;line-height:1.5;white-space:pre-wrap">${esc(m.text)}</span></div>`).join(''):'<div class="muted" style="text-align:center;padding:16px">问我基金、股票、债券等理财问题~</div>'}</div>`;
  html+=`<div class="row" style="margin-top:8px;gap:8px"><input class="inp" id="finCoachInput" placeholder="咨询理财问题..." style="flex:1"><button class="btn" data-act="fin-coach-send">发送</button></div>`;
  return html;
}
function renderFinMode(){
  const f=S.finance;const modes=['稳定不亏','低风险','中高风险','高风险'];
  const modeDesc={'稳定不亏':'本金安全，适合保守型投资者','低风险':'风险可控，追求稳定收益','中高风险':'波动较大，追求较高回报','高风险':'波动剧烈，追求高收益'};
  let html=`<div class="sub-title">选择理财模式</div><div class="chip-row">${modes.map(m=>`<button class="chip ${f.mode===m?'on':''}" data-act="fin-mode-sel" data-v="${m}">${m}</button>`).join('')}</div>`;
  if(f.mode){html+=`<div class="ex-card" style="margin-top:10px"><div class="muted">${esc(modeDesc[f.mode]||'')}</div></div>`;
  html+=`<div class="sub-title">推荐产品 <button class="btn ghost sm" data-act="fin-prod-refresh" style="float:right">换一批</button></div>`;
  const prods=f.recommendations||[];
  html+=prods.length?prods.map(p=>`<div class="ex-card" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>${esc(p.name)}</strong><span class="tag">${esc(p.risk||'')}</span></div><div class="muted" style="font-size:13px;margin-top:4px">平台：${esc(p.platform||'')} · 预期收益：${esc(p.return||'')} · ${esc(p.amount||'')}</div></div>`).join(''):'<div class="muted">点击「换一批」获取推荐产品~</div>';}
  return html;
}
function renderFinProduct(){
  const f=S.finance;const products=f.products||[];
  let html=`<div class="sub-title">已买入产品 <button class="btn sm" data-act="fin-prod-add" style="float:right">+ 录入产品</button></div>`;
  html+=products.length?products.map(p=>{
    const trend=Array.from({length:30},()=>50+Math.random()*50);
    const assess=finRiskAssess(p);
    return `<div class="ex-card" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between"><strong>${esc(p.name)}</strong><span class="tag">${esc(p.risk||assess.risk)}</span></div>
      <div class="muted" style="font-size:13px;margin-top:4px">平台：${esc(p.platform||'')} · 投入：¥${money(p.amount)} · 买入：${esc(p.buyDate||'')}</div>
      <div style="margin-top:8px">${svgBars(trend.map((v,i)=>({label:i%5===0?'D'+(i+1):'',value:v})),{h:100})}</div>
      <div class="muted" style="margin-top:8px;font-size:13px">💡 ${esc(assess.advice)}</div>
      <div class="li-actions" style="margin-top:6px"><button class="btn danger sm" data-act="fin-prod-del" data-id="${p.id}">删除</button></div>
    </div>`;
  }).join(''):'<div class="muted">还没有录入理财产品~</div>';
  // 保留原有的资产/负债/存钱目标
  const totalAsset=f.assets.reduce((s,a)=>s+Number(a.value||0),0);
  const totalLiab=f.liabilities.reduce((s,a)=>s+Number(a.value||0),0);
  html+=`<div class="sub-title">资产分布 <button class="btn sm" data-act="fin-asset-add" style="float:right">+ 资产</button></div>`;
  html+=`<div class="muted">总资产 ¥${money(totalAsset)} · 总负债 ¥${money(totalLiab)} · 净资产 ¥${money(totalAsset-totalLiab)}</div>`;
  html+=f.assets.length?f.assets.map(a=>`<div class="list-item"><div class="li-main"><div style="display:flex;justify-content:space-between"><strong>${esc(a.name)}</strong><span>¥${money(a.value)}</span></div><div class="muted" style="font-size:12px">${esc(a.type)}</div></div><div class="li-actions"><button class="btn danger sm" data-act="fin-asset-del" data-id="${a.id}">删</button></div></div>`).join(''):'<div class="muted">暂无资产</div>';
  html+=`<div class="sub-title">存钱目标 <button class="btn sm" data-act="fin-save-add" style="float:right">+ 目标</button></div>`;
  html+=f.savings.length?f.savings.map(s=>{const pct=clamp(Math.round(Number(s.current||0)/Number(s.target||1)*100),0,100);return `<div class="list-item"><div class="li-main"><div style="display:flex;justify-content:space-between"><strong>${esc(s.name)}</strong><span class="muted">${pct}%</span></div><div class="save-bar"><div class="save-bar-fill" style="width:${pct}%"></div></div><div class="muted" style="font-size:12px">¥${money(s.current)}/¥${money(s.target)}</div></div><div class="li-actions"><button class="btn ghost sm" data-act="fin-save-deposit" data-id="${s.id}">存入</button><button class="btn danger sm" data-act="fin-save-del" data-id="${s.id}">删</button></div></div>`;}).join(''):'<div class="muted">还没有存钱目标~</div>';
  return html;
}
function finRiskAssess(p){
  const type=p.type||'';const amt=int(p.amount||0);
  if(/股票|权益|指数|科技|新能源|半导体|高风险/.test(type))return {risk:'高风险',advice:amt>50000?'持仓较大波动剧烈，建议适当减仓锁定利润，分批止盈。':'波动较大但金额适中，可继续持有，设好10-15%止损线。'};
  if(/债|固收|纯债/.test(type))return {risk:'低风险',advice:'债券类相对稳定，适合长期持有。利率下行周期可考虑加仓。'};
  if(/货币|余额宝|零钱/.test(type))return {risk:'低风险',advice:'货币基金流动性好风险极低，适合存放应急资金。'};
  if(/黄金/.test(type))return {risk:'中风险',advice:'黄金有避险属性，建议占总资产5-10%。'};
  return {risk:'中低风险',advice:'建议持续关注产品净值变化，根据市场情况适时调整。'};
}
function refreshFinanceKnowledge(){
  const today=todayKey();const lvl=S.finance.level||'小白';
  if(S.finance.dailyKnowledge&&S.finance.dailyKnowledge.date===today&&S.finance.dailyKnowledge.level===lvl)return;
  const presets={
    '小白':{title:'理财第一步：建立应急基金',content:'建议存下3-6个月生活支出作为应急基金，放在货币基金中。\n\n📚 推荐：《小狗钱钱》《穷爸爸富爸爸》\n📻 公众号：简七理财\n\n今日总结：先存钱，后投资。应急基金是理财的地基。'},
    '中级':{title:'资产配置：分散投资',content:'中级投资者应学会分散配置：股票基金40%、债券基金30%、货币基金20%、黄金10%。\n\n📚 推荐：《漫步华尔街》《指数基金投资指南》\n\n今日总结：分散配置降低风险不降低收益。'},
    '高级':{title:'深度理解：估值与周期',content:'高级投资者需理解市场估值和周期。关注PE/PB指标，低估值时加仓。\n\n📚 推荐：《聪明的投资者》《周期》\n\n今日总结：低买高卖关键在估值锚定和情绪控制。'},
    '财富女王':{title:'全局视角：财富传承',content:'财富女王级别需考虑财富传承、税务优化和全球配置。\n\n📚 推荐：《财富传承》《家族办公室》\n\n今日总结：财富管理的终点是传承。'}
  };
  const p=presets[lvl]||presets['小白'];
  S.finance.dailyKnowledge={date:today,level:lvl,...p};
  S.finance.learnHistory.push({date:today,content:p.title});
  save();renderModule();toast('今日知识已更新 📚');
}
function refreshFinanceProducts(mode){
  const presets={
    '稳定不亏':[{name:'余额宝',platform:'支付宝',return:'2.0%~2.5%',risk:'低风险',amount:'1元起'},{name:'银行大额存单',platform:'各大银行',return:'3.0%~3.5%',risk:'低风险',amount:'20万起'},{name:'国债逆回购',platform:'证券账户',return:'2.5%~4.0%',risk:'低风险',amount:'1000元起'}],
    '低风险':[{name:'天弘安利短债',platform:'支付宝',return:'3.0%~4.5%',risk:'中低风险',amount:'1元起'},{name:'招商产业债券A',platform:'招商基金',return:'4.0%~6.0%',risk:'中低风险',amount:'10元起'},{name:'易方达稳健收益',platform:'易方达',return:'5.0%~7.0%',risk:'中低风险',amount:'100元起'}],
    '中高风险':[{name:'沪深300指数基金',platform:'支付宝',return:'8.0%~15.0%',risk:'中高风险',amount:'10元起'},{name:'中证500ETF联接',platform:'南方基金',return:'10.0%~18.0%',risk:'中高风险',amount:'100元起'},{name:'消费行业指数',platform:'支付宝',return:'10.0%~20.0%',risk:'中高风险',amount:'10元起'}],
    '高风险':[{name:'半导体行业基金',platform:'诺安基金',return:'20.0%~40.0%',risk:'高风险',amount:'1元起'},{name:'新能源车指数',platform:'国泰基金',return:'15.0%~35.0%',risk:'高风险',amount:'10元起'},{name:'人工智能主题',platform:'万家基金',return:'20.0%~45.0%',risk:'高风险',amount:'10元起'}]
  };
  S.finance.recommendations=(presets[mode]||[]).map(p=>({id:uid(),...p}));
  save();renderModule();toast('产品推荐已更新');
}

/* ---- 记账板块（新增总资金+存钱板块+存钱模式） ---- */
function renderLedger(){
  const sub=S.ledgerExt.sub||'record';
  const tabs=[['record','收支记录'],['fund','总资金'],['plan','存钱计划'],['mode','存钱模式']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="ledgerExt" data-sub="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(sub==='fund') body=renderLedgerFund();
  else if(sub==='plan') body=renderLedgerPlan();
  else if(sub==='mode') body=renderLedgerMode();
  else body=renderLedgerRecord();
  return `<div class="card">${header('ledger','记账本')}${tabHtml}${body}</div>`;
}
function renderLedgerRecord(){
  const k=todayKey(),mk=k.slice(0,7);
  const inc=S.ledger.filter(r=>r.type==='income'&&r.date===k);
  const exp=S.ledger.filter(r=>r.type==='expense'&&r.date===k);
  const tInc=inc.reduce((s,r)=>s+Number(r.amount),0),tExp=exp.reduce((s,r)=>s+Number(r.amount),0);
  const mInc=S.ledger.filter(r=>r.type==='income'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
  const mExp=S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk).reduce((s,r)=>s+Number(r.amount),0);
  const cats=['饮食','购物','学习','交通','娱乐','居住','其他'];
  const byCat={};cats.forEach(c=>byCat[c]=0);
  S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk).forEach(r=>{const c=cats.includes(r.category)?r.category:'其他';byCat[c]=(byCat[c]||0)+Number(r.amount||0);});
  const pieSegs=cats.map((c,i)=>({label:c,value:byCat[c],color:FIN_COLORS[i%FIN_COLORS.length]})).filter(s=>s.value>0);
  const months=[];for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);months.push(monthKey(d));}
  const trend=months.map(mk2=>{const inc2=S.ledger.filter(r=>r.type==='income'&&r.date.slice(0,7)===mk2).reduce((s,r)=>s+Number(r.amount),0);const exp2=S.ledger.filter(r=>r.type==='expense'&&r.date.slice(0,7)===mk2).reduce((s,r)=>s+Number(r.amount),0);return {label:mk2.slice(2),value:Math.round(inc2-exp2)};});
  return `
    <div class="sub-title">今日收支</div>
    <div class="stat-grid">
      <div class="stat income"><div class="label">今日收入</div><div class="val" id="ldInc">¥${money(tInc)}</div></div>
      <div class="stat expense"><div class="label">今日支出</div><div class="val" id="ldExp">¥${money(tExp)}</div></div>
      <div class="stat balance"><div class="label">今日结余</div><div class="val" id="ldBal">¥${money(tInc-tExp)}</div></div>
    </div>
    <div class="sub-title">本月累计</div>
    <div class="stat-grid">
      <div class="stat balance"><div class="label">本月结余</div><div class="val" id="lmBal">¥${money(mInc-mExp)}</div></div>
      <div class="stat income"><div class="label">累计收入</div><div class="val" id="lmInc">¥${money(mInc)}</div></div>
      <div class="stat expense"><div class="label">累计支出</div><div class="val" id="lmExp">¥${money(mExp)}</div></div>
    </div>
    <div class="row" style="gap:8px;margin-top:10px">
      <button class="btn sm" data-act="ledger-add-income">+ 收入</button>
      <button class="btn sm" data-act="ledger-add-expense">+ 支出</button>
    </div>
    <div class="sub-title">最近记录</div>
    <div id="ledgerList">${S.ledger.length?S.ledger.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)).slice(0,30).map(r=>`<div class="list-item"><div class="li-main"><div style="display:flex;justify-content:space-between"><strong>${esc(r.note||r.category||'记录')}</strong><span style="font-weight:800;color:${r.type==='income'?'var(--mint-d)':'var(--purple-d)'}">${r.type==='income'?'+':'-'}¥${money(r.amount)}</span></div><div class="muted" style="margin-top:4px">${r.date} · ${esc(r.category)}</div></div><div class="li-actions"><button class="btn ghost sm" data-act="ledger-edit" data-id="${r.id}">编辑</button><button class="btn danger sm" data-act="ledger-del" data-id="${r.id}">删</button></div></div>`).join(''):emptySVG('pencil')+'<div class="empty">还没有记账记录~</div>'}</div>
    <div class="sub-title">本月分类支出占比</div>
    <div class="pie-wrap">${svgPie(pieSegs)}<div class="pie-legend">${pieSegs.length?pieSegs.map(s=>`<span class="pie-leg"><i style="background:${s.color}"></i>${esc(s.label)} ¥${money(s.value)}</span>`).join(''):'<span class="muted">本月暂无支出</span>'}</div></div>
    <div class="sub-title">近6月结余趋势</div>${svgBars(trend)}`;
}
function renderLedgerFund(){
  const tf=S.ledgerExt.totalFund||(S.ledgerExt.totalFund={flexible:0,invested:0,flexPlan:0,investPlan:0});
  const totalFund=Number(tf.flexible||0)+Number(tf.invested||0);
  const fundSegs=[{label:'灵活取用',value:Number(tf.flexible||0),color:'#ff8fb3'},{label:'理财类',value:Number(tf.invested||0),color:'#c9a3ff'}].filter(s=>s.value>0);
  return `
    <div class="sub-title">总资金显示栏</div>
    <div class="stat-grid">
      <div class="stat balance"><div class="label">总资产</div><div class="val">¥${money(totalFund)}</div></div>
      <div class="stat"><div class="label">灵活取用</div><input class="inp" type="number" data-act="ledger-fund" data-f="flexible" value="${tf.flexible||0}" style="width:100%;font-size:14px"></div>
      <div class="stat"><div class="label">理财类</div><input class="inp" type="number" data-act="ledger-fund" data-f="invested" value="${tf.invested||0}" style="width:100%;font-size:14px"></div>
    </div>
    ${fundSegs.length?`<div class="pie-wrap">${svgPie(fundSegs)}<div class="pie-legend">${fundSegs.map(s=>`<span class="pie-leg"><i style="background:${s.color}"></i>${esc(s.label)} ¥${money(s.value)}</span>`).join('')}</div></div>`:''}
    <div class="sub-title">月度计划额度</div>
    <div class="row" style="gap:10px;margin-top:8px">
      <div style="flex:1"><div class="muted">灵活月计划额度</div><input class="inp" type="number" data-act="ledger-fund" data-f="flexPlan" value="${tf.flexPlan||0}"></div>
      <div style="flex:1"><div class="muted">理财月计划额度</div><input class="inp" type="number" data-act="ledger-fund" data-f="investPlan" value="${tf.investPlan||0}"></div>
    </div>`;
}
function renderLedgerPlan(){
  const plans=S.ledgerExt.savingPlans||[];
  return `
    <div class="sub-title">存钱计划</div>
    <div class="chip-row">
      ${['月','年','短期','长期'].map(p=>`<button class="chip" data-act="ledger-save-plan-add" data-period="${p}">+ ${p}计划</button>`).join('')}
    </div>
    ${plans.length?plans.map(p=>{const pct=clamp(Math.round(Number(p.current||0)/Number(p.target||1)*100),0,100);return `<div class="list-item"><div class="li-main"><div style="display:flex;justify-content:space-between"><strong>${esc(p.name)}</strong><span class="muted">${pct}%</span></div><div class="save-bar"><div class="save-bar-fill" style="width:${pct}%"></div></div><div class="muted" style="font-size:12px">${esc(p.period)} · ¥${money(p.current)}/¥${money(p.target)}${p.detail?' · '+esc(p.detail):''}</div></div><div class="li-actions"><button class="btn ghost sm" data-act="ledger-save-deposit" data-id="${p.id}">存入</button><button class="btn danger sm" data-act="ledger-save-del" data-id="${p.id}">删</button></div></div>`;}).join(''):emptySVG('piggy')+'<div class="empty">还没有存钱计划，点击上方按钮创建~</div>'}`;
}
function renderLedgerMode(){
  const sm=S.ledgerExt.savingMode||'';
  const smData=S.ledgerExt.savingModeData;
  return `
    <div class="sub-title">存钱模式</div>
    <div class="chip-row">
      ${[['52week','52周存钱法'],['365day','365天存钱法'],['12deposit','12存单法'],['ladder','阶梯存钱法']].map(([k,n])=>`<button class="chip ${sm===k?'on':''}" data-act="ledger-save-mode" data-v="${k}">${n}</button>`).join('')}
    </div>
    ${sm&&smData?renderSavingMode(sm,smData):'<div class="muted" style="margin-top:12px">选择一种存钱模式开始吧~</div>'}`;
}
function renderSavingMode(mode,data){
  if(mode==='52week'){
    const total=data.filter(d=>d.done).reduce((s,d)=>s+d.amount,0);
    const done=data.filter(d=>d.done).length;
    return `<div class="ex-card"><div style="display:flex;justify-content:space-between"><strong>52周存钱法</strong><span class="muted">${done}/52周 · ¥${money(total)}/¥13780</span></div>
    <div class="save-bar" style="margin:8px 0"><div class="save-bar-fill" style="width:${clamp(Math.round(done/52*100),0,100)}%"></div></div>
    <div style="max-height:300px;overflow-y:auto">${data.slice(0,26).map(d=>`<div class="list-item" style="padding:4px 0"><span class="check ${d.done?'on':''}" data-act="save-mode-check" data-mode="${mode}" data-idx="${d.week}"></span><div class="li-main">第${d.week}周 · ¥${d.amount}</div></div>`).join('')}</div></div>`;
  }
  if(mode==='365day'){
    const total=data.filter(d=>d.done).reduce((s,d)=>s+d.amount,0);
    const done=data.filter(d=>d.done).length;
    return `<div class="ex-card"><div style="display:flex;justify-content:space-between"><strong>365天存钱法</strong><span class="muted">${done}/365天 · ¥${money(total)}/¥66795</span></div>
    <div class="save-bar" style="margin:8px 0"><div class="save-bar-fill" style="width:${clamp(Math.round(done/365*100),0,100)}%"></div></div>
    <div class="muted">每天递增1元，已存 ${done} 天</div></div>`;
  }
  if(mode==='12deposit'){
    return `<div class="ex-card"><strong>12存单法</strong><div class="muted" style="margin-top:6px">每月存 ¥${data.monthlyAmount}，12个月后每月都有一笔到期</div>
    <div style="margin-top:8px">${data.deposits.map((d,i)=>`<div class="list-item" style="padding:4px 0"><span class="check ${d.done?'on':''}" data-act="save-mode-check" data-mode="${mode}" data-idx="${i}"></span><div class="li-main">第${i+1}月 · ¥${data.monthlyAmount}</div></div>`).join('')}</div></div>`;
  }
  if(mode==='ladder'){
    return `<div class="ex-card"><strong>阶梯存钱法</strong><div class="muted" style="margin-top:6px">将资金分份存不同期限</div>
    <div style="margin-top:8px">${data.ladders.map((l,i)=>`<div class="list-item" style="padding:4px 0"><div class="li-main">第${i+1}份 · ¥${money(l.amount)} · ${l.years}年期</div></div>`).join('')}</div></div>`;
  }
  return '';
}
function genSavingMode(mode,amount){
  amount=int(amount)||0;
  if(mode==='52week'){return Array.from({length:52},(_,i)=>({week:i+1,amount:(i+1)*10,done:false}));}
  if(mode==='365day'){return Array.from({length:365},(_,i)=>({day:i+1,amount:i+1,done:false}));}
  if(mode==='12deposit'){const m=Math.round(amount/12)||1000;return {monthlyAmount:m,deposits:Array.from({length:12},()=>({done:false}))};}
  if(mode==='ladder'){const part=Math.round(amount/4)||2500;return {ladders:[{amount:part,years:1},{amount:part,years:2},{amount:part,years:3},{amount:part,years:5}]};}
  return null;
}

/* ---- 自媒体板块（新增AI自媒体师+数据化复盘） ---- */
function renderMedia(){
  const sub=S.media.sub||'account';
  const tabs=[['account','账号管理'],['ai','AI自媒体师'],['library','选题库'],['review','数据复盘'],['topics','每日选题'],['posts','发布记录'],['notes','学习笔记']];
  const tabHtml=`<div class="ex-subtabs">${tabs.map(([k,n])=>`<button class="ex-tab ${sub===k?'on':''}" data-act="sub-tab" data-mod="media" data-sub="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(sub==='ai') body=renderMediaAI();
  else if(sub==='library') body=renderMediaLibrary();
  else if(sub==='review') body=renderMediaReview();
  else if(sub==='topics') body=renderMediaTopics();
  else if(sub==='posts') body=renderMediaPosts();
  else if(sub==='notes') body=renderMediaNotes();
  else body=renderMediaAccount();
  return `<div class="card">${header('media','自媒体')}${tabHtml}${body}</div>`;
}
function renderMediaAccount(){
  const A=curMedia();
  const accTabs=Object.values(S.media.accounts).map(a=>`<button class="acc-tab ${a.id===S.media.activeAccount?'on':''}" data-act="media-switch-acc" data-id="${a.id}">${esc(a.name)} <span class="acc-fans">${int(a.fans)}粉</span></button>`).join('');
  return `
    <div class="sub-title">账号切换</div>
    <div class="acc-tabs">${accTabs}<button class="acc-tab add" data-act="media-add-acc">+ 新增账号</button>${Object.keys(S.media.accounts).length>1?`<button class="acc-tab del" data-act="media-del-acc" data-id="${S.media.activeAccount}">删除当前</button>`:''}</div>
    <div class="sub-title">账号信息（当前：${esc(A.name)}）</div>
    <div class="row"><div style="flex:1"><div class="muted">账号名称</div><input class="inp" data-act="acc" data-f="name" value="${esc(A.name)}"></div><div style="flex:1"><div class="muted">粉丝数</div><input class="inp" type="number" data-act="acc" data-f="fans" value="${A.fans}"></div></div>
    <div class="row" style="margin-top:8px"><div style="flex:1"><div class="muted">账号定位</div><input class="inp" data-act="acc" data-f="position" value="${esc(A.position||'')}"></div></div>`;
}
function renderMediaAI(){
  const A=curMedia();
  const aiMsgs=A.aiMsgs||[];
  return `
    <div class="sub-title">AI 自媒体师</div>
    <div id="mediaAIBox" style="max-height:380px;overflow-y:auto;margin-top:8px;border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--card-soft)">${aiMsgs.length?aiMsgs.map(m=>`<div style="margin-bottom:8px;text-align:${m.role==='user'?'right':'left'}"><span style="display:inline-block;max-width:80%;padding:6px 12px;border-radius:14px;background:${m.role==='user'?'var(--pink-d)':'var(--card)'};color:${m.role==='user'?'#fff':'var(--text)'};font-size:13px;line-height:1.5;white-space:pre-wrap">${esc(m.text)}</span></div>`).join(''):'<div class="muted" style="text-align:center;padding:16px">问我选题、结构优化、钩子建议~</div>'}</div>
    <div class="row" style="margin-top:8px;gap:8px"><input class="inp" id="mediaAIInput" placeholder="咨询自媒体问题..." style="flex:1"><button class="btn" data-act="media-ai-send">发送</button></div>
    <div class="chip-row" style="margin-top:4px"><button class="btn ghost sm" data-act="media-ai-topic">推荐选题</button><button class="btn ghost sm" data-act="media-ai-structure">结构优化</button><button class="btn ghost sm" data-act="media-ai-hook">钩子建议</button></div>`;
}
function renderMediaReview(){
  const A=curMedia();
  const reviews=A.reviews||[];
  return `
    <div class="sub-title">数据化复盘视图</div>
    <div class="chip-row">${[['week','周报'],['month','月报'],['year','年报']].map(([k,n])=>`<button class="chip" data-act="media-review-gen" data-scope="${k}">生成${n}</button>`).join('')}</div>
    ${reviews.length?reviews.slice(-5).reverse().map(rv=>`<div class="ex-card" style="margin-top:8px"><div style="font-weight:700">${esc(rv.scope==='week'?'周':rv.scope==='month'?'月':'年')}度复盘 · ${esc(rv.date)}</div>
    <div class="muted" style="margin-top:6px;font-size:13px;white-space:pre-wrap">${esc(rv.summary||'')}</div></div>`).join(''):emptySVG('chart')+'<div class="empty">还没有复盘报告，点击上方按钮生成~</div>'}`;
}
function renderMediaTopics(){
  return `
    <div class="sub-title">每日联网选题 <button class="btn ghost sm" data-act="media-refresh-topics" style="float:right">刷新</button></div>
    <div id="dailyTopics"><div class="muted">正在加载今日热门选题…</div></div>`;
}
function renderMediaPosts(){
  const A=curMedia();
  const posts=A.posts.slice().reverse();
  return `
    <div class="sub-title">发布记录 (${A.posts.length})</div>
    <div id="postList">${posts.length?posts.slice(0,30).map(p=>`<div class="list-item"><div class="li-main"><strong>${esc(p.title)}</strong><div class="muted" style="font-size:12px">${esc(p.date)} · ${esc(p.platform||'')} · ${int(p.views||0)}播放</div></div><div class="li-actions"><button class="btn danger sm" data-act="media-post-del" data-id="${p.id}">删</button></div></div>`).join(''):emptySVG('pencil')+'<div class="empty">还没有发布记录~</div>'}</div>
    <button class="btn sm" data-act="media-post-add" style="margin-top:8px">+ 添加发布记录</button>`;
}
function renderMediaLibrary(){
  const A=curMedia();
  const lib=A.topicLib||[];
  const accTabs=Object.values(S.media.accounts).map(a=>`<button class="acc-tab ${a.id===S.media.activeAccount?'on':''}" data-act="media-switch-acc" data-id="${a.id}">${esc(a.name)}</button>`).join('');
  const statuses=['灵感','待拍','已拍','已发布'];
  const filterChips=statuses.map(s=>`<button class="chip ${notesState.libFilter===s?'on':''}" data-act="topic-lib-filter" data-s="${s}">${s} (${lib.filter(t=>(t.status||'灵感')===s).length})</button>`).join('');
  const filtered=notesState.libFilter?lib.filter(t=>(t.status||'灵感')===notesState.libFilter):lib;
  return `
    <div class="sub-title">选题库 · ${esc(A.name)}</div>
    <div class="acc-tabs" style="margin-bottom:10px">${accTabs}</div>
    <div class="sub-title">新建选题</div>
    <div class="ex-card" style="margin-bottom:12px">
      <input class="inp" id="topicLibTitle" placeholder="选题标题（如：周末咖啡店探店）" style="margin-bottom:8px">
      <textarea class="txtarea" id="topicLibDesc" placeholder="拍摄灵感、脚本要点、参考思路..." style="margin-bottom:8px;min-height:80px"></textarea>
      <div class="muted" style="margin-bottom:4px">参考图片/视频</div>
      <div id="topicLibMediaZone"></div>
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
        <div class="muted">状态：</div>
        <select class="inp" id="topicLibStatus" style="width:auto">
          ${statuses.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
        <button class="btn" data-act="topic-lib-add">+ 添加选题</button>
      </div>
    </div>
    <div class="sub-title">筛选 (${filtered.length}/${lib.length})</div>
    <div class="chip-row" style="margin-bottom:8px">
      <button class="chip ${!notesState.libFilter?'on':''}" data-act="topic-lib-filter" data-s="">全部</button>
      ${filterChips}
    </div>
    ${filtered.length?filtered.map(t=>{
      const imgs=(t.images||[]).map(id=>`<div class="lib-media-box"><img data-load-media="${id}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"></div>`).join('');
      const vids=(t.videos||[]).map(id=>`<div class="lib-media-box"><video data-load-media="${id}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" controls></video></div>`).join('');
      return `<div class="ex-card" style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <strong style="font-size:15px">${esc(t.title||'未命名选题')}</strong>
              <span class="topic-status status-${(t.status||'灵感')}" data-act="topic-lib-cycle" data-id="${t.id}">${esc(t.status||'灵感')}</span>
            </div>
            <div class="muted" style="font-size:12px;margin-top:2px">${esc(t.createdAt?new Date(t.createdAt).toLocaleDateString():'')}</div>
          </div>
          <button class="btn danger sm" data-act="topic-lib-del" data-id="${t.id}">删</button>
        </div>
        ${t.desc?`<div style="margin-top:6px;font-size:13px;line-height:1.6;white-space:pre-wrap">${esc(t.desc)}</div>`:''}
        ${(imgs||vids)?`<div class="lib-media-grid" style="margin-top:8px">${imgs}${vids}</div>`:''}
      </div>`;
    }).join(''):emptySVG('pencil')+'<div class="empty">还没有选题灵感，在上方添加第一条吧~</div>'}
    <div class="muted" style="margin-top:10px;font-size:12px;text-align:center">💡 点击状态标签可快速切换：灵感 → 待拍 → 已拍 → 已发布</div>`;
}
function renderMediaNotes(){
  ensureNotes();
  return `
    <div class="sub-title">自媒体学习笔记手册</div>
    <div class="notes-entry">
      <div class="muted" style="margin-bottom:10px">专属运营学习笔记：爆款拆解 / 课程笔记 / 运营心得。支持富文本编辑、手绘圈画标注、智能分类与全文检索。</div>
      <button class="btn purple" data-act="open-notes">📒 打开学习笔记手册（${S.media.notes.length}）</button>
    </div>`;
}
function mediaAIReply(input,A){
  const low=(input||'').toLowerCase();
  if(/选题|题目|内容|拍什么/.test(low)){
    const topics=['今日份治愈日常vlog','沉浸式独居生活记录','一周穿搭分享','读书笔记分享','手账排版教程','独居女生安全指南','低成本护肤分享','周末City Walk记录','居家收纳小技巧','一人食晚餐灵感'];
    return `基于你的「${A.position||'生活'}」定位，推荐选题：\n\n${topics.sort(()=>Math.random()-0.5).slice(0,5).map((t,i)=>`${i+1}. ${t}`).join('\n')}\n\n💡 建议：选择与近期热点结合的选题更容易获得流量~`;
  }
  if(/结构|框架|设计/.test(low)){
    return `视频结构建议：\n\n1️⃣ 开头钩子(0-3秒)：用悬念或冲突感抓住注意力\n2️⃣ 引入(3-15秒)：交代背景，建立期待\n3️⃣ 主体(15秒-2分钟)：核心内容，节奏紧凑\n4️⃣ 高潮(2-2.5分钟)：情感升华或干货密集\n5️⃣ 结尾(最后10秒)：引导互动+下期预告\n\n💡 每30秒设一个小高潮保持观众留存率~`;
  }
  if(/钩子|开头|开头/.test(low)){
    return `开头钩子技巧：\n\n1. 悬念式：「你绝对想不到...」\n2. 反差式：「月薪3000 vs 月薪3万的一天」\n3. 问题式：「你有没有过这样的经历？」\n4. 数据式：「90%的人不知道...」\n5. 情感式：「今天差点哭了...」\n\n💡 前3秒决定观众是否划走，钩子要有冲突感！`;
  }
  return `收到！关于「${input}」，建议你：\n1. 明确目标受众和内容定位\n2. 保持更新频率，培养粉丝习惯\n3. 关注数据反馈，持续优化内容\n4. 多与粉丝互动，提升粘性\n\n有什么具体问题可以继续问我~`;
}
function genMediaReview(A,scope){
  const posts=A.posts||[];
  let dateRange='';
  let filtered=[];
  if(scope==='week'){const wk=weekKey();filtered=posts.filter(p=>p.date>=wk);dateRange=wk;}
  else if(scope==='month'){const mk=monthKey();filtered=posts.filter(p=>p.date.slice(0,7)===mk);dateRange=mk;}
  else{filtered=posts;dateRange='全年';}
  const totalViews=filtered.reduce((s,p)=>s+int(p.views||0),0);
  const totalLikes=filtered.reduce((s,p)=>s+int(p.likes||0),0);
  const topPost=filtered.length?filtered.reduce((a,b)=>int(a.views||0)>int(b.views||0)?a:b):null;
  let summary=`📊 ${scope==='week'?'周':scope==='month'?'月':'年'}度复盘报告\n\n`;
  summary+=`📈 数据概览：\n· 发布视频：${filtered.length} 条\n· 总播放量：${totalViews}\n· 总点赞：${totalLikes}\n`;
  if(topPost){summary+=`\n🔥 爆款视频：\n《${topPost.title}》· ${int(topPost.views||0)}播放\n特征：${filtered.length>2?'选题贴合热点，节奏紧凑，前3秒钩子有力':'继续保持优质内容产出'}\n`;}
  summary+=`\n✅ 内容优质点：\n`;
  if(filtered.length>=3){summary+='· 更新频率稳定，粉丝粘性好\n· 内容风格统一，有辨识度\n';}else{summary+='· 内容质量不错\n';}
  summary+=`\n⚠️ 现存不足：\n`;
  if(filtered.length<3){summary+='· 更新频率偏低，建议增加发布\n';}
  summary+='· 可尝试更多互动形式提升评论率\n';
  summary+=`\n📋 优化方向：\n1. 保持稳定更新频率\n2. 加强前3秒钩子设计\n3. 增加与粉丝的互动\n4. 关注热点话题及时跟进\n5. 优化封面和标题提高点击率`;
  const rv={id:uid(),scope,date:dateRange,summary};
  A.reviews=A.reviews||[];A.reviews.push(rv);
  save();renderModule();toast('复盘报告已生成 📊');
}
function bindTopicLibMedia(){
  notesState.libTempMedia=[];
  const zone=$('#topicLibMediaZone');
  if(!zone) return;
  zone.innerHTML=mediaUploadHTML([], 'topicLibMediaZone_main');
  const mz=zone.querySelector('.media-zone');
  if(mz) bindMediaUpload(mz, notesState.libTempMedia, ()=>{});
}
async function refreshMediaTopics(){
  const presets=[
    {title:'独居女生的100个生活技巧',hot:'🔥',tag:'生活'},
    {title:'沉浸式回家vlog',hot:'📈',tag:'vlog'},
    {title:'低成本护肤分享',hot:'🔥',tag:'护肤'},
    {title:'一人食晚餐灵感',hot:'📈',tag:'美食'},
    {title:'周末City Walk记录',hot:'🔥',tag:'生活'},
    {title:'手账排版教程',hot:'📈',tag:'手账'},
    {title:'读书笔记分享',hot:'🔥',tag:'阅读'},
    {title:'独居女生安全指南',hot:'📈',tag:'安全'},
    {title:'一周穿搭分享',hot:'🔥',tag:'穿搭'},
    {title:'居家收纳小技巧',hot:'📈',tag:'收纳'}
  ];
  const shuffled=presets.sort(()=>Math.random()-0.5).slice(0,5);
  const el=$('#dailyTopics');
  if(el) el.innerHTML=shuffled.map(t=>`<div class="ex-card" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center"><strong>${t.hot} ${esc(t.title)}</strong><span class="tag">${esc(t.tag)}</span></div></div>`).join('');
  toast('选题已更新 📋');
}

/* ============================================================
   启动
   ============================================================ */
async function init(){
  applyTheme();
  renderTop();renderNav();renderModule();bindGlobal();
  const cfg=loadSyncCfg();
  if(cfg.enabled&&cfg.token){
    try{ await pullSync(); }catch(e){ toast('☁ 云同步拉取失败：'+(e.message||e)); }
    // 把云端拉下来的大图压缩，避免下次推送仍是超大文件 → 解决 GitHub 409
    await recompressImages();
    save(false);
    renderNav();renderModule();
    schedulePush(); // 主动把缩小后的版本推上去，替换 4.2MB 旧文件
  }
  checkReminders();setInterval(checkReminders,30000);
  // 首次进入展示今日心情文案提示
  if(!S.mood.history.some(h=>h.date===todayKey())){
    setTimeout(()=>toast('新的一天，记得在「今日心情」记录一下哦~'),800);
  }
}
init();
})();
