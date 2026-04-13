// ===== Firebase Realtime Database =====
const FB = 'https://wano-studio-default-rtdb.firebaseio.com';

// ===== Owner =====
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';

// ===== State =====
const SK = 'pb_s3'; // session key
let sess = null, payV = '', capN = 0, isCustom = false, lang = 'ar';

// ===== Firebase helpers =====
async function fbGet(path) {
  const r = await fetch(`${FB}/${path}.json`);
  return r.ok ? r.json() : null;
}
async function fbSet(path, data) {
  await fetch(`${FB}/${path}.json`, { method:'PUT', body: JSON.stringify(data) });
}
async function fbPush(path, data) {
  const r = await fetch(`${FB}/${path}.json`, { method:'POST', body: JSON.stringify(data) });
  return r.ok ? r.json() : null;
}
async function fbIncr(path) {
  // atomic increment via transaction
  const cur = await fbGet(path) || 0;
  await fbSet(path, cur + 1);
  return cur + 1;
}

// ===== Visitor ID — unique per browser =====
function getVID() {
  let v = localStorage.getItem('pb_vid');
  if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('pb_vid', v); }
  return v;
}

// ===== Init =====
window.onload = async () => {
  try { sess = JSON.parse(localStorage.getItem(SK) || 'null'); } catch(e){}
  renderAuth();
  newCap();
  setLang('ar', document.querySelector('.lb.on'));

  // عد الزيارة — مرة واحدة في اليوم لكل جهاز
  const vid = getVID();
  const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const vKey  = `visited/${today}_${vid.slice(0,8)}`;
  const seen  = await fbGet(vKey);
  if (!seen) {
    await fbSet(vKey, true);
    await fbIncr('stats/visits');
  }
  refreshStats();
  setInterval(refreshStats, 20000); // تحديث كل 20 ث
};

async function refreshStats() {
  const v = await fbGet('stats/visits') || 0;
  const orders = await fbGet('stats/orderCount') || 0;
  document.getElementById('vCount').textContent = Number(v).toLocaleString();
  document.getElementById('oCount').textContent = Number(orders).toLocaleString();
}

// ===== SHA-256 Hash =====
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
// ===== Auth Render =====
function renderAuth() {
  const t = T[lang]||T.ar;
  const area = document.getElementById('authArea');
  if (sess) {
    const isOw = sess.isOwner;
    area.innerHTML = `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      ${isOw?`<button class="abtn" style="font-size:11px;padding:3px 10px;border-color:rgba(245,158,11,.3);color:var(--ow)" onclick="showPanel()">⚙️ ${t.opB||'لوحة المالك'}</button>`:''}
      <div class="uchip${isOw?' ow':''}">${isOw?'👑':'👤'} ${sess.name}<button class="lo" onclick="logout()">✕</button></div>
    </div>`;
  } else {
    area.innerHTML = `<div class="abtns">
      <button class="abtn" onclick="openAuth('l')" data-i="login">${t.login||'تسجيل دخول'}</button>
      <button class="abtn pr" onclick="openAuth('r')" data-i="register">${t.register||'إنشاء حساب'}</button>
    </div>`;
  }
}

function logout() {
  sess = null; localStorage.removeItem(SK);
  document.getElementById('ownerPanel').style.display='none';
  renderAuth();
  toast(T[lang]?.lo||'تم تسجيل الخروج');
}

// ===== Captcha =====
function newCap() {
  const a=Math.floor(Math.random()*12)+1, b=Math.floor(Math.random()*12)+1;
  capN=a+b;
  const q=`${a} + ${b} = ?`;
  ['cQ','cQ2'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=q;});
  ['cA','cA2'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
}
function chkCap(id){return parseInt(document.getElementById(id)?.value)===capN;}

// ===== Auth =====
function openAuth(m){newCap();aSwitch(m);openM('ovA');}
function aSwitch(m){
  document.getElementById('lF').style.display=m==='l'?'block':'none';
  document.getElementById('rF').style.display=m==='r'?'block':'none';
  document.getElementById('tLB').classList.toggle('on',m==='l');
  document.getElementById('tRB').classList.toggle('on',m==='r');
  ['lE','rE'].forEach(id=>document.getElementById(id).classList.remove('show'));
}

async function doLogin() {
  const email=document.getElementById('le').value.trim().toLowerCase();
  const pass =document.getElementById('lp').value;
  const err  =document.getElementById('lE');
  const t    =T[lang]||T.ar;
  err.classList.remove('show');
  if (!email||!pass){err.textContent=t.eF||'⚠️ أدخل الإيميل والباسورد';err.classList.add('show');return;}
  if (!chkCap('cA')){err.textContent=t.eCp||'❌ إجابة الكابتشا خاطئة';err.classList.add('show');newCap();return;}

  // Owner direct check
  if (email===OW_EMAIL && pass===OW_PASS){
    sess={name:'مروان | Wano',email,isOwner:true};
    localStorage.setItem(SK,JSON.stringify(sess));
    closeM('ovA');renderAuth();
    toast('👑 أهلاً يا مروان!');return;
  }

  const h = await sha256(pass+email+'_pb25');
  const users = await fbGet('users') || {};
  const user = Object.values(users).find(u=>u.email===email&&u.hash===h);
  if (!user){err.textContent=t.eW||'❌ الإيميل أو الباسورد خاطئ';err.classList.add('show');newCap();return;}
  sess={name:user.name,email:user.email,isOwner:false};
  localStorage.setItem(SK,JSON.stringify(sess));
  closeM('ovA');renderAuth();
  toast(`✅ ${t.wlc||'أهلاً'} ${user.name}!`);
}

async function doReg() {
  const name =document.getElementById('rn').value.trim();
  const email=document.getElementById('re').value.trim().toLowerCase();
  const pass =document.getElementById('rp').value;
  const pass2=document.getElementById('rp2').value;
  const err  =document.getElementById('rE');
  const t    =T[lang]||T.ar;
  err.classList.remove('show');

  if (!name||!email||!pass){err.textContent=t.eFA||'⚠️ جميع الحقول مطلوبة';err.classList.add('show');return;}
  if (!email.includes('@')||!email.includes('.')){err.textContent=t.eEm||'❌ إيميل غير صحيح';err.classList.add('show');return;}
  if (pass.length<6){err.textContent=t.eSh||'❌ الباسورد أقل من 6 أحرف';err.classList.add('show');return;}
  if (pass!==pass2){err.textContent=t.ePM||'❌ الباسوردان غير متطابقان';err.classList.add('show');return;}
  if (!chkCap('cA2')){err.textContent=t.eCp||'❌ إجابة الكابتشا خاطئة';err.classList.add('show');newCap();return;}

  const users=await fbGet('users')||{};
  if (Object.values(users).find(u=>u.email===email)){err.textContent=t.eEx||'❌ الإيميل مسجل مسبقاً';err.classList.add('show');return;}

  const h=await sha256(pass+email+'_pb25');
  const device=navigator.userAgent;
  const rec={name,email,hash:h,device,joined:new Date().toISOString()};
  await fbPush('users',rec);

  sess={name,email,isOwner:(email===OW_EMAIL&&pass===OW_PASS)};
  localStorage.setItem(SK,JSON.stringify(sess));
  closeM('ovA');renderAuth();
  toast(`🎉 ${t.wlc||'أهلاً'} ${name}!`);
}
// ===== Order =====
function openOrder(bot,price,custom=false){
  isCustom=custom;
  document.getElementById('bn').value=bot;
  document.getElementById('cb').value=price.includes('حسب')?'':price;
  ['cn','cc','cd'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.querySelectorAll('.pay').forEach(b=>b.classList.remove('on'));
  payV='';
  document.getElementById('dA').style.display=custom?'block':'none';
  if(sess?.name) document.getElementById('cn').value=sess.name;
  openM('ovO');
}
function sP(btn,m){document.querySelectorAll('.pay').forEach(b=>b.classList.remove('on'));btn.classList.add('on');payV=m;}

async function submitOrder(){
  const bot=document.getElementById('bn').value;
  const name=document.getElementById('cn').value.trim();
  const con=document.getElementById('cc').value.trim();
  const desc=isCustom?document.getElementById('cd').value.trim():'—';
  const bud=document.getElementById('cb').value.trim();
  const t=T[lang]||T.ar;
  if (!name||!con){toast(t.eF||'⚠️ أدخل اسمك وطريقة التواصل',true);return;}
  if (isCustom&&!document.getElementById('cd').value.trim()){toast(t.eDe||'⚠️ اشرح ما تريده',true);return;}

  // حفظ في Firebase
  await fbPush('orders',{bot,name,contact:con,desc,budget:bud,pay:payV||'—',date:new Date().toLocaleString('ar-EG'),user:sess?.email||'guest',device:navigator.userAgent});
  await fbIncr('stats/orderCount');
  refreshStats();

  const msg=`🤖 *طلب جديد - Projects Bots*\n\n📦 *البوت:* ${bot}\n👤 *الاسم:* ${name}\n📞 *التواصل:* ${con}\n💰 *الميزانية:* ${bud||'—'}\n💳 *الدفع:* ${payV||'—'}${isCustom&&desc&&desc!=='—'?'\n\n📝 *الوصف:*\n'+desc:''}\n\n_من موقع Projects Bots_`;
  window.open('https://wa.me/201145974113?text='+encodeURIComponent(msg),'_blank');
  closeM('ovO');
  toast(t.oS||'✅ تم فتح واتساب!');
}

// ===== Owner Panel =====
async function showPanel(){
  if (!sess?.isOwner) return;
  const panel=document.getElementById('ownerPanel');
  panel.style.display='block';
  const v=await fbGet('stats/visits')||0;
  const oc=await fbGet('stats/orderCount')||0;
  const usersObj=await fbGet('users')||{};
  const users=Object.values(usersObj);
  const ordersObj=await fbGet('orders')||{};
  const orders=Object.values(ordersObj);
  document.getElementById('pV').textContent=Number(v).toLocaleString();
  document.getElementById('pO').textContent=Number(oc).toLocaleString();
  document.getElementById('pU').textContent=users.length;

  document.getElementById('pOL').innerHTML=orders.length
    ?orders.slice().reverse().map(o=>`<div class="pc"><h4>📦 ${o.bot} — ${o.date}</h4><p>👤 <strong>${o.name}</strong> | 📞 <strong>${o.contact}</strong><br>💰 <strong>${o.budget||'—'}</strong> | 💳 <strong>${o.pay||'—'}</strong><br>📱 <span style="font-size:10px">${(o.device||'').substring(0,90)}</span>${o.desc&&o.desc!=='—'?'<br>📝 '+o.desc:''}</p></div>`).join('')
    :'<p style="color:var(--mut);text-align:center;padding:16px">لا توجد طلبات</p>';

  document.getElementById('pUL').innerHTML=users.length
    ?users.map(u=>{
      const isOw=u.email===OW_EMAIL;
      const dt=u.joined?new Date(u.joined).toLocaleString('ar-EG',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
      return `<div class="uc"><div class="ua">${isOw?'👑':'👤'}</div><div class="ui">
        <h4>${u.name} <span class="utg ${isOw?'ow':'us'}">${isOw?'👑 Owner':'عضو'}</span></h4>
        <p>📧 ${u.email}<br>
        🔒 <span style="font-family:monospace;font-size:10px">${(u.hash||'').substring(0,40)}…</span><br>
        📱 <span style="font-size:10px">${(u.device||'').substring(0,80)}</span><br>
        📅 ${dt}</p>
      </div></div>`;}).join('')
    :'<p style="color:var(--mut);text-align:center;padding:16px">لا يوجد مستخدمون</p>';

  panel.scrollIntoView({behavior:'smooth'});
}

function panelTab(tab,btn){
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.getElementById('pOL').style.display=tab==='o'?'block':'none';
  document.getElementById('pUL').style.display=tab==='u'?'block':'none';
}

// ===== Tabs & Modals =====
function switchTab(n){
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  const el=document.getElementById('tab-'+n),btn=document.getElementById('btn-'+n);
  if(el)el.classList.add('on');if(btn)btn.classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});
}
function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}
['ovO','ovA'].forEach(id=>{document.getElementById(id).addEventListener('click',function(e){if(e.target===this)closeM(id);});});
document.addEventListener('keydown',e=>{if(e.key==='Escape')['ovO','ovA'].forEach(closeM);});

// ===== Toast =====
function toast(msg,isErr){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;t.className='toast'+(isErr?' e':'');
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200);
}

// ===== i18n =====
const T={
ar:{dir:'rtl',ll:'اللغة:',vis:'زيارة',ords:'طلب',n1:'ديسكورد',n2:'تيليجرام',n3:'واتساب',n6:'عنّا',h1:'متاح للطلبات الآن',h2:'بوتات احترافية',h3:'لكل منصة',h4:'تطوير بوتات مخصصة لديسكورد، تيليجرام، واتساب، وChrome — إنشاء الملفات فقط.',h5:'📦 اطلب الآن',h6:'تعرف علينا',od:'مطور بوتات — إنشاء ملفات ومشاريع البوتات فقط، لا يشمل التشغيل',t1:'ديسكورد',t2:'تيليجرام',t3:'واتساب',t6:'عنّا',d1:'بوتات ديسكورد',d2:'جميع البوتات المسموح بها على Discord',ab1:'عن المشروع',ab2:'كل ما تحتاج معرفته',a1t:'من نحن',a1p:'مروان | Wano — مطور بوتات متخصص في Discord وTelegram وWhatsApp.',a2t:'ملاحظة',a2p:'الخدمة تشمل إنشاء ملفات البوتات فقط.',a3t:'طرق الدفع',a3p:'فودافون كاش، PayPal، Binance، USDT، تحويل بنكي.',a4t:'وقت التسليم',a4p:'بسيط: 1-3 أيام. متوسط: 3-7 أيام.',a5t:'الدعم',a5p:'دعم مجاني 7 أيام بعد التسليم.',a6t:'تواصل',login:'تسجيل دخول',register:'إنشاء حساب',lb1:'الإيميل',lb2:'الباسورد',lb3:'🔑 دخول',or:'أو',nA:'ما عندك حساب؟',cO:'أنشئ حساب',hA:'عندك حساب؟',sI:'سجّل دخول',rl1:'الاسم',rl2:'الإيميل',rl3:'الباسورد (6 أحرف على الأقل)',rl4:'تأكيد الباسورد',rl5:'✅ إنشاء الحساب',or1:'طلب مشروع',or2:'📱 سيصلك رد من المطور مباشرة عبر واتساب',or3:'اسم البوت / المشروع',or4:'اسمك',or5:'تواصل (واتساب أو ديسكورد)',or6:'وصف ما تريده بالتفصيل',or7:'الميزانية التقريبية',or8:'طريقة الدفع',or9:'📤 إرسال الطلب عبر واتساب',oB:'🛒 اطلب الآن',cB:'✨ اطلب بوتك المخصص',cD:'بوت Discord مخصص',cT:'بوت Telegram مخصص',cW:'سيلف بوت واتساب مخصص',ca1:'✓ أي فكرة تريدها',ca2:'✓ سعر مخصص',uv:'غير متوفر حالياً',opT:'لوحة المالك — مروان | Wano',opB:'لوحة المالك',ptO:'📦 الطلبات',ptU:'👥 الحسابات',pUL:'مستخدم',fR:'جميع الحقوق محفوظة لـ',fN:'⚠️ إنشاء ملفات ومشاريع البوتات فقط — لا يشمل التشغيل أو الاستضافة',eF:'⚠️ أدخل الإيميل والباسورد',eCp:'❌ إجابة الكابتشا خاطئة',eW:'❌ الإيميل أو الباسورد خاطئ',eFA:'⚠️ جميع الحقول مطلوبة',eEm:'❌ إيميل غير صحيح',eSh:'❌ الباسورد أقل من 6 أحرف',ePM:'❌ الباسوردان غير متطابقان',eEx:'❌ الإيميل مسجل مسبقاً',eDe:'⚠️ اشرح ما تريده بالتفصيل',wlc:'أهلاً',lo:'تم تسجيل الخروج',oS:'✅ تم فتح واتساب!'},
en:{dir:'ltr',ll:'Language:',vis:'visits',ords:'orders',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'About',h1:'Available for orders',h2:'Professional Bots',h3:'For Every Platform',h4:'Custom bot development for Discord, Telegram, WhatsApp & Chrome — file creation only.',h5:'📦 Order Now',h6:'About Us',od:'Bot Developer — File creation only, no hosting',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'About',d1:'Discord Bots',d2:'All allowed bot types on Discord',ab1:'About Us',ab2:'Everything you need to know',a1t:'Who We Are',a1p:'Marwan | Wano — Bot developer.',a2t:'Note',a2p:'Service includes file creation only.',a3t:'Payments',a3p:'Vodafone Cash, PayPal, Binance, USDT, Bank Transfer.',a4t:'Delivery',a4p:'Simple: 1-3 days. Medium: 3-7 days.',a5t:'Support',a5p:'Free 7-day support after delivery.',a6t:'Contact',login:'Login',register:'Sign Up',lb1:'Email',lb2:'Password',lb3:'🔑 Login',or:'or',nA:"Don't have an account?",cO:'Create one',hA:'Have an account?',sI:'Sign in',rl1:'Name',rl2:'Email',rl3:'Password (min 6 chars)',rl4:'Confirm Password',rl5:'✅ Create Account',or1:'Order a Project',or2:'📱 You will receive a reply via WhatsApp',or3:'Bot / Project Name',or4:'Your Name',or5:'Contact (WhatsApp or Discord)',or6:'Describe what you want in detail',or7:'Approximate Budget',or8:'Payment Method',or9:'📤 Send via WhatsApp',oB:'🛒 Order Now',cB:'✨ Order Custom Bot',cD:'Custom Discord Bot',cT:'Custom Telegram Bot',cW:'Custom WhatsApp Self-Bot',ca1:'✓ Any idea you want',ca2:'✓ Custom price',uv:'Not Available',opT:'Owner Panel',opB:'Owner Panel',ptO:'📦 Orders',ptU:'👥 Users',pUL:'users',fR:'All rights reserved by',fN:'⚠️ File creation only — no running or hosting',eF:'⚠️ Enter email and password',eCp:'❌ Wrong captcha',eW:'❌ Wrong email or password',eFA:'⚠️ All fields required',eEm:'❌ Invalid email',eSh:'❌ Password too short',ePM:'❌ Passwords do not match',eEx:'❌ Email already registered',eDe:'⚠️ Please describe',wlc:'Welcome',lo:'Logged out',oS:'✅ WhatsApp opened!'}
};

function setLang(l,btn){
  lang=l;
  const t=T[l]||T.ar;
  document.documentElement.lang=l;
  document.documentElement.dir=t.dir;
  document.querySelectorAll('.lb').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  document.getElementById('ll').textContent=t.ll;
  document.querySelectorAll('[data-i]').forEach(el=>{
    const k=el.getAttribute('data-i');
    if(t[k]!==undefined)el.textContent=t[k];
  });
  renderAuth();
}
