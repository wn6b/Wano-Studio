// ============================
// Firebase Realtime Database
// ============================
const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v3';

let sess = null, payV = '', capN = 0, isCustom = false, lang = 'ar', discountPct = 0, discountCode = '';

// ============================
// Firebase helpers
// ============================
async function fbGet(path){
  try{
    // إضافة كسر الكاش لضمان تحديث كودات الخصم فوراً
    const r=await fetch(`${FB}/${path}.json?_t=${Date.now()}`, { cache: 'no-store' });
    if(!r.ok)return null;
    return await r.json();
  }catch(e){return null;}
}
async function fbSet(path,data){
  try{await fetch(`${FB}/${path}.json`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}catch(e){}
}
async function fbPush(path,data){
  try{
    const r=await fetch(`${FB}/${path}.json`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    return r.ok?await r.json():null;
  }catch(e){return null;}
}
async function fbDel(path){
  try{await fetch(`${FB}/${path}.json`,{method:'DELETE'});}catch(e){}
}
// atomic increment — read then write
async function fbIncr(path){
  const cur=await fbGet(path)||0;
  const nv=cur+1;
  await fbSet(path,nv);
  return nv;
}

// ============================
// Init
// ============================
window.onload=async()=>{
  try{sess=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){}
  renderAuth();
  newCap();
  setLang('ar',document.querySelector('.lb.on'));
  // عداد الطلبات
  refreshOrderCount();
  setInterval(refreshOrderCount,15000);
};

async function refreshOrderCount(){
  const c=await fbGet('stats/orderCount')||0;
  const oCountEl = document.getElementById('oCount');
  if(oCountEl) oCountEl.textContent=Number(c).toLocaleString();
}

// ============================
// SHA-256
// ============================
async function sha256(s){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
// ============================
// Auth Render
// ============================
function renderAuth(){
  const t=T[lang]||T.ar;
  const area=document.getElementById('authArea');
  if(sess){
    const isOw=sess.isOwner;
    area.innerHTML=`<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      ${isOw?`<button class="abtn" style="font-size:11px;padding:3px 10px;border-color:rgba(245,158,11,.3);color:var(--ow)" onclick="showPanel()">⚙️ ${t.opB||'لوحة المالك'}</button>`:''}
      <div class="uchip${isOw?' ow':''}">${isOw?'👑':'👤'} ${sess.name}<button class="lo" onclick="logout()">✕</button></div>
    </div>`;
  }else{
    area.innerHTML=`<div class="abtns">
      <button class="abtn" onclick="openAuth('l')" data-i="login">${t.login||'تسجيل دخول'}</button>
      <button class="abtn pr" onclick="openAuth('r')" data-i="register">${t.register||'إنشاء حساب'}</button>
    </div>`;
  }
}

function logout(){
  sess=null;localStorage.removeItem(SK);
  document.getElementById('ownerPanel').style.display='none';
  renderAuth();
  toast(T[lang]?.lo||'تم تسجيل الخروج');
}

// ============================
// Captcha
// ============================
function newCap(){
  const a=Math.floor(Math.random()*12)+1,b=Math.floor(Math.random()*12)+1;
  capN=a+b;
  const q=`${a} + ${b} = ?`;
  ['cQ','cQ2'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=q;});
  ['cA','cA2'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
}
function chkCap(id){return parseInt(document.getElementById(id)?.value)===capN;}

// ============================
// Auth
// ============================
function openAuth(m){newCap();aSwitch(m);openM('ovA');}
function aSwitch(m){
  document.getElementById('lF').style.display=m==='l'?'block':'none';
  document.getElementById('rF').style.display=m==='r'?'block':'none';
  document.getElementById('tLB').classList.toggle('on',m==='l');
  document.getElementById('tRB').classList.toggle('on',m==='r');
  ['lE','rE'].forEach(id=>document.getElementById(id).classList.remove('show'));
}

async function doLogin(){
  const email=document.getElementById('le').value.trim().toLowerCase();
  const pass=document.getElementById('lp').value;
  const err=document.getElementById('lE');
  const t=T[lang]||T.ar;
  err.classList.remove('show');
  if(!email||!pass){err.textContent=t.eF;err.classList.add('show');return;}
  if(!chkCap('cA')){err.textContent=t.eCp;err.classList.add('show');newCap();return;}
  // Owner
  if(email===OW_EMAIL&&pass===OW_PASS){
    sess={name:'مروان | Wano',email,isOwner:true};
    localStorage.setItem(SK,JSON.stringify(sess));
    closeM('ovA');renderAuth();
    toast('👑 أهلاً يا مروان!');return;
  }
  const h=await sha256(pass+email+'_pb25');
  const users=await fbGet('users')||{};
  const user=Object.values(users).find(u=>u.email===email&&u.hash===h);
  if(!user){err.textContent=t.eW;err.classList.add('show');newCap();return;}
  sess={name:user.name,email:user.email,isOwner:false};
  localStorage.setItem(SK,JSON.stringify(sess));
  closeM('ovA');renderAuth();
  toast(`✅ ${t.wlc} ${user.name}!`);
}

async function doReg(){
  const name=document.getElementById('rn').value.trim();
  const email=document.getElementById('re').value.trim().toLowerCase();
  const pass=document.getElementById('rp').value;
  const pass2=document.getElementById('rp2').value;
  const err=document.getElementById('rE');
  const t=T[lang]||T.ar;
  err.classList.remove('show');
  if(!name||!email||!pass){err.textContent=t.eFA;err.classList.add('show');return;}
  if(!email.includes('@')||!email.includes('.')){err.textContent=t.eEm;err.classList.add('show');return;}
  if(pass.length<6){err.textContent=t.eSh;err.classList.add('show');return;}
  if(pass!==pass2){err.textContent=t.ePM;err.classList.add('show');return;}
  if(!chkCap('cA2')){err.textContent=t.eCp;err.classList.add('show');newCap();return;}
  const users=await fbGet('users')||{};
  if(Object.values(users).find(u=>u.email===email)){err.textContent=t.eEx;err.classList.add('show');return;}
  const h=await sha256(pass+email+'_pb25');
  await fbPush('users',{name,email,hash:h,device:navigator.userAgent,joined:new Date().toISOString()});
  sess={name,email,isOwner:(email===OW_EMAIL&&pass===OW_PASS)};
  localStorage.setItem(SK,JSON.stringify(sess));
  closeM('ovA');renderAuth();
  toast(`🎉 ${t.wlc} ${name}!`);
}
