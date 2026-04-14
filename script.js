// ============================
// Firebase Realtime Database
// ============================
const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v3';

let sess = null, payV = '', capN = 0, isCustom = false, lang = 'ar', discountPct = 0, discountCode = '';
let storeOpen = true; // حالة المتجر للطلبات

// ============================
// Firebase helpers
// ============================
async function fbGet(path){
  try{
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
async function fbIncr(path){
  const cur=await fbGet(path)||0;
  const nv=cur+1;
  await fbSet(path,nv);
  return nv;
}

// ============================
// Init & Store Status
// ============================
window.onload=async()=>{
  try{sess=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){}
  renderAuth();
  newCap();
  setLang('ar',document.querySelector('.lb.on'));
  refreshOrderCount();
  setInterval(refreshOrderCount,15000);

  // جلب حالة المتجر من قاعدة البيانات
  const st = await fbGet('settings/storeOpen');
  if(st !== null) storeOpen = st;
  updateStoreStatusUI();
};

function updateStoreStatusUI(){
  const txt = document.getElementById('heroBadgeTxt');
  const dot = document.getElementById('heroBadgeDot');
  const t = T[lang]||T.ar;
  
  if(txt) txt.textContent = storeOpen ? (t.h1 || 'متاح للطلبات الآن') : 'غير متوفر للطلبات حالياً';
  if(dot) dot.style.background = storeOpen ? 'var(--grn)' : 'var(--red)';
  
  // تحديث حالة أزرار الطلبات
  document.querySelectorAll('.ob').forEach(btn => {
    // البوتات المقفلة برمجياً (مثل الموسيقى والميديا) تبقى مقفلة دائماً
    if(btn.closest('.bc').classList.contains('dis')){
      btn.disabled = true;
    } else {
      btn.disabled = !storeOpen;
      if(!storeOpen) {
        btn.textContent = '⛔ مغلق حالياً';
      } else {
        // استعادة النص الأصلي
        const isCustomBtn = btn.closest('.sp') !== null;
        btn.textContent = isCustomBtn ? (t.cB || '✨ اطلب بوتك') : (t.oB || '🛒 اطلب الآن');
      }
    }
  });
}

async function toggleStoreStatus(){
  if(!sess?.isOwner) return; // للمالك فقط
  storeOpen = !storeOpen;
  await fbSet('settings/storeOpen', storeOpen);
  updateStoreStatusUI();
  toast(storeOpen ? '✅ تم فتح استقبال الطلبات!' : '⛔ تم إيقاف استقبال الطلبات!');
}

async function refreshOrderCount(){
  const c=await fbGet('stats/orderCount')||0;
  const oCountEl = document.getElementById('oCount');
  if(oCountEl) oCountEl.textContent=Number(c).toLocaleString();
}

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
    // إظهار سهم إيقاف/تشغيل الطلبات للمالك فقط
    const arr = document.getElementById('heroBadgeArrow');
    if(arr) arr.style.display = isOw ? 'inline-block' : 'none';
  }else{
    area.innerHTML=`<div class="abtns">
      <button class="abtn" onclick="openAuth('l')" data-i="login">${t.login||'تسجيل دخول'}</button>
      <button class="abtn pr" onclick="openAuth('r')" data-i="register">${t.register||'إنشاء حساب'}</button>
    </div>`;
    const arr = document.getElementById('heroBadgeArrow');
    if(arr) arr.style.display = 'none';
  }
}

function logout(){
  sess=null;localStorage.removeItem(SK);
  document.getElementById('ownerPanel').style.display='none';
  renderAuth();
  toast(T[lang]?.lo||'تم تسجيل الخروج');
}

// ============================
// Captcha (Hard Mode 🔥)
// ============================
function newCap(){
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b;

  if (op === '×') {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    capN = a * b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 20) + 10;
    b = Math.floor(Math.random() * 10) + 1;
    capN = a - b;
  } else {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    capN = a + b;
  }

  const q = `${a} ${op} ${b} = ?`;
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
// ============================
// Discount (Per-User Limit)
// ============================
async function applyDiscount(){
  const t=T[lang]||T.ar;
  if(!sess){toast('⚠️ يرجى انشاء حساب أولاً',true);return;}
  const code=document.getElementById('discInp').value.trim().toUpperCase();
  if(!code){toast(t.discEmpty||'أدخل الكود',true);return;}
  
  const safeEmail = sess.email.replace(/\./g, '_');
  const alreadyUsed = await fbGet(`used_discounts/${safeEmail}/${code}`);
  if(alreadyUsed){toast('❌ لقد استخدمت هذا الكود من قبل يا وحش!',true);return;}
  
  const discounts=await fbGet('discounts')||{};
  const entry=Object.values(discounts).find(d=>d.code===code);
  if(!entry){toast(t.discInvalid||'❌ الكود غير صحيح',true);return;}
  
  discountPct=entry.pct; discountCode=code;
  const tag=document.getElementById('discTag');
  tag.textContent=`✅ خصم ${discountPct}% — كود: ${code}`;
  tag.style.display='block';
  toast(`🎉 ${t.discApplied||'تم تطبيق الخصم'} ${discountPct}%`);
}

async function addDiscount(){
  const code=document.getElementById('discCode').value.trim().toUpperCase();
  const pct=parseInt(document.getElementById('discPct').value);
  if(!code||!pct||pct<1||pct>90){toast('⚠️ أدخل اسم الكود والنسبة بشكل صحيح',true);return;}
  await fbPush('discounts',{code,pct,created:new Date().toISOString()});
  document.getElementById('discCode').value='';
  document.getElementById('discPct').value='';
  toast(`✅ تم إضافة كود الخصم: ${code} (${pct}%)`);
  loadDiscounts();
}

async function loadDiscounts(){
  const discounts=await fbGet('discounts')||{};
  const entries=Object.entries(discounts);
  const list=document.getElementById('discList');
  document.getElementById('pD').textContent=entries.length;
  if(!entries.length){list.innerHTML='<p style="color:var(--mut);text-align:center;padding:16px">لا توجد كودات خصم</p>';return;}
  list.innerHTML=entries.map(([k,d])=>`
    <div class="dc">
      <span>🏷️ <strong style="color:var(--grn)">${d.code}</strong> — خصم <strong style="color:var(--acc3)">${d.pct}%</strong></span>
      <button class="del-btn" onclick="delDiscount('${k}')">🗑️ حذف</button>
    </div>`).join('');
}

async function delDiscount(key){
  await fbDel(`discounts/${key}`);
  toast('🗑️ تم حذف الكود');
  loadDiscounts();
}

// ============================
// Order
// ============================
function openOrder(bot,price,custom=false){
  isCustom=custom;
  discountPct=0;discountCode='';
  document.getElementById('bn').value=bot;
  document.getElementById('cb').value=price.includes('حسب')?'':price;
  document.getElementById('discInp').value='';
  document.getElementById('discTag').style.display='none';
  ['cn','cc','cd'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.querySelectorAll('.pay').forEach(b=>b.classList.remove('on'));
  payV='';
  document.getElementById('dA').style.display=custom?'block':'none';
  if(sess?.name)document.getElementById('cn').value=sess.name;
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
  if(!name||!con){toast(t.eF,true);return;}
  if(isCustom&&!document.getElementById('cd').value.trim()){toast(t.eDe||'⚠️ اشرح ما تريده',true);return;}

  // تسجيل الطلب بالداتا بيس
  await fbPush('orders',{
    bot,name,contact:con,desc,budget:bud,
    pay:payV||'—', discount:discountCode||'—', discountPct:discountPct||0,
    date:new Date().toLocaleString('ar-EG'),
    user:sess?.email||'guest', device:navigator.userAgent
  });
  
  // حرق الكود للمستخدم الحالي
  if(discountCode && sess){
    const safeEmail = sess.email.replace(/\./g, '_');
    await fbSet(`used_discounts/${safeEmail}/${discountCode}`, true);
  }

  await fbIncr('stats/orderCount');
  refreshOrderCount();

  const discLine=discountCode?`\n🏷️ *كود الخصم:* ${discountCode} (${discountPct}% خصم)`:'';
  const msg=`🤖 *طلب جديد - Projects Bots*\n\n📦 *البوت:* ${bot}\n👤 *الاسم:* ${name}\n📞 *التواصل:* ${con}\n💰 *الميزانية:* ${bud||'—'}\n💳 *الدفع:* ${payV||'—'}${discLine}${isCustom&&desc&&desc!=='—'?'\n\n📝 *الوصف:*\n'+desc:''}\n\n_من موقع Projects Bots_`;
  window.open('https://wa.me/201145974113?text='+encodeURIComponent(msg),'_blank');
  
  closeM('ovO');
  toast(t.oS||'✅ تم فتح واتساب!');
  discountCode=''; discountPct=0;
}

// ============================
// Owner Panel
// ============================
async function showPanel(){
  if(!sess?.isOwner)return;
  const panel=document.getElementById('ownerPanel');
  panel.style.display='block';
  const oc=await fbGet('stats/orderCount')||0;
  const usersObj=await fbGet('users')||{};
  const ordersObj=await fbGet('orders')||{};
  const discountsObj=await fbGet('discounts')||{};
  const users=Object.values(usersObj);
  const orders=Object.values(ordersObj);
  document.getElementById('pO').textContent=Number(oc).toLocaleString();
  document.getElementById('pU').textContent=users.length;
  document.getElementById('pD').textContent=Object.keys(discountsObj).length;

  document.getElementById('pOL').innerHTML=orders.length
    ?orders.slice().reverse().map(o=>`<div class="pc"><h4>📦 ${o.bot} — ${o.date}</h4><p>👤 <strong>${o.name}</strong> | 📞 <strong>${o.contact}</strong><br>💰 <strong>${o.budget||'—'}</strong> | 💳 <strong>${o.pay||'—'}</strong>${o.discount&&o.discount!=='—'?` | 🏷️ <strong>${o.discount} (${o.discountPct}%)</strong>`:''}<br>📱 <span style="font-size:10px">${(o.device||'').substring(0,90)}</span>${o.desc&&o.desc!=='—'?'<br>📝 '+o.desc:''}</p></div>`).join('')
    :'<p style="color:var(--mut);text-align:center;padding:16px">لا توجد طلبات</p>';

  document.getElementById('pUL').innerHTML=users.length
    ?users.map(u=>{
      const isOw=u.email===OW_EMAIL;
      const dt=u.joined?new Date(u.joined).toLocaleString('ar-EG',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
      return `<div class="uc"><div class="ua">${isOw?'👑':'👤'}</div><div class="ui"><h4>${u.name} <span class="utg ${isOw?'ow':'us'}">${isOw?'👑 Owner':'عضو'}</span></h4><p>📧 ${u.email}<br>🔒 <span style="font-family:monospace;font-size:10px">${(u.hash||'').substring(0,40)}…</span><br>📱 <span style="font-size:10px">${(u.device||'').substring(0,80)}</span><br>📅 ${dt}</p></div></div>`;
    }).join('')
    :'<p style="color:var(--mut);text-align:center;padding:16px">لا يوجد مستخدمون</p>';

  loadDiscounts();
  panel.scrollIntoView({behavior:'smooth'});
}

function panelTab(tab,btn){
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.getElementById('pOL').style.display=tab==='o'?'block':'none';
  document.getElementById('pUL').style.display=tab==='u'?'block':'none';
  document.getElementById('pDL').style.display=tab==='d'?'block':'none';
  if(tab==='d')loadDiscounts();
}

// ============================
// Tabs & Modals
// ============================
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
const lpEl = document.getElementById('lp');
if(lpEl) lpEl.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});

// ============================
// Toast
// ============================
function toast(msg,isErr){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast'+(isErr?' e':'');
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200);
}

// ============================
// i18n
// ============================
const T={
ar:{dir:'rtl',ll:'اللغة:',ords:'طلب',n1:'ديسكورد',n2:'تيليجرام',n3:'واتساب',n6:'عنّا',h1:'متاح للطلبات الآن',h2:'بوتات احترافية',h3:'لكل منصة',h4:'تطوير بوتات مخصصة لديسكورد، تيليجرام، واتساب، وChrome — إنشاء الملفات فقط.',h5:'📦 اطلب الآن',h6:'تعرف علينا',od:'مطور بوتات — إنشاء ملفات ومشاريع البوتات فقط، لا يشمل التشغيل',t1:'ديسكورد',t2:'تيليجرام',t3:'واتساب',t6:'عنّا',d1:'بوتات ديسكورد',d2:'جميع البوتات المسموح بها على Discord',ab1:'عن المشروع',ab2:'كل ما تحتاج معرفته',a1t:'من نحن',a1p:'مروان | Wano — مطور بوتات متخصص.',a2t:'ملاحظة',a2p:'الخدمة تشمل إنشاء ملفات البوتات فقط.',a3t:'طرق الدفع',a3p:'فودافون كاش، PayPal، Binance، USDT، تحويل بنكي.',a4t:'وقت التسليم',a4p:'بسيط: 1-3 أيام. متوسط: 3-7 أيام.',a5t:'الدعم',a5p:'دعم مجاني 7 أيام بعد التسليم.',a6t:'تواصل',login:'تسجيل دخول',register:'إنشاء حساب',lb1:'الإيميل',lb2:'الباسورد',lb3:'🔑 دخول',dvOr:'أو',nA:'ما عندك حساب؟',cO:'أنشئ حساب',hA:'عندك حساب؟',sI:'سجّل دخول',rl1:'الاسم',rl2:'الإيميل',rl3:'الباسورد (6 أحرف على الأقل)',rl4:'تأكيد الباسورد',rl5:'✅ إنشاء الحساب',or1:'طلب مشروع',or2:'📱 سيصلك رد من المطور مباشرة عبر واتساب',or3:'اسم البوت / المشروع',or4:'اسمك',or5:'تواصل',or6:'وصف ما تريده بالتفصيل',or7:'الميزانية التقريبية',or8:'طريقة الدفع',or9:'📤 إرسال الطلب عبر واتساب',oB:'🛒 اطلب الآن',cB:'✨ اطلب بوتك المخصص',cD:'بوت Discord مخصص',cT:'بوت Telegram مخصص',cW:'سيلف بوت واتساب مخصص',ca1:'✓ أي فكرة تريدها',ca2:'✓ سعر مخصص',uv:'غير متوفر حالياً',opT:'لوحة المالك — مروان | Wano',opB:'لوحة المالك',ptO:'📦 الطلبات',ptU:'👥 الحسابات',ptD:'🏷️ كودات الخصم',pUL:'مستخدم',pDL:'كود خصم',addDiscT:'➕ إضافة كود خصم جديد',addDiscBtn:'➕ إضافة',discLbl:'كود الخصم (اختياري)',discApply:'تطبيق',discEmpty:'أدخل الكود',discInvalid:'❌ الكود غير صحيح',discApplied:'تم تطبيق الخصم',fR:'جميع الحقوق محفوظة لـ',fN:'⚠️ إنشاء ملفات ومشاريع البوتات فقط — لا يشمل التشغيل أو الاستضافة',eF:'⚠️ أدخل الإيميل والباسورد',eCp:'❌ إجابة الكابتشا خاطئة',eW:'❌ الإيميل أو الباسورد خاطئ',eFA:'⚠️ جميع الحقول مطلوبة',eEm:'❌ إيميل غير صحيح',eSh:'❌ الباسورد أقل من 6 أحرف',ePM:'❌ الباسوردان غير متطابقان',eEx:'❌ الإيميل مسجل مسبقاً',eDe:'⚠️ اشرح ما تريده بالتفصيل',wlc:'أهلاً',lo:'تم تسجيل الخروج',oS:'✅ تم فتح واتساب!'},
en:{dir:'ltr',ll:'Language:',ords:'orders',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'About',h1:'Available for orders',h2:'Professional Bots',h3:'For Every Platform',h4:'Custom bot development — file creation only.',h5:'📦 Order Now',h6:'About Us',od:'Bot Developer — File creation only, no hosting',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'About',d1:'Discord Bots',d2:'All allowed bot types',ab1:'About Us',ab2:'Everything you need to know',a1t:'Who We Are',a1p:'Marwan | Wano — Bot developer.',a2t:'Note',a2p:'File creation only, no hosting.',a3t:'Payments',a3p:'Vodafone Cash, PayPal, Binance, USDT, Bank.',a4t:'Delivery',a4p:'Simple: 1-3 days. Medium: 3-7 days.',a5t:'Support',a5p:'Free 7-day support.',a6t:'Contact',login:'Login',register:'Sign Up',lb1:'Email',lb2:'Password',lb3:'🔑 Login',dvOr:'or',nA:"Don't have an account?",cO:'Create one',hA:'Have an account?',sI:'Sign in',rl1:'Name',rl2:'Email',rl3:'Password (min 6)',rl4:'Confirm Password',rl5:'✅ Create Account',or1:'Order',or2:'📱 Reply via WhatsApp',or3:'Bot Name',or4:'Your Name',or5:'Contact',or6:'Describe in detail',or7:'Budget',or8:'Payment',or9:'📤 Send via WhatsApp',oB:'🛒 Order Now',cB:'✨ Custom Bot',cD:'Custom Discord Bot',cT:'Custom Telegram Bot',cW:'Custom WhatsApp Bot',ca1:'✓ Any idea',ca2:'✓ Custom price',uv:'Not Available',opT:'Owner Panel',opB:'Owner Panel',ptO:'📦 Orders',ptU:'👥 Users',ptD:'🏷️ Discounts',pUL:'users',pDL:'discount',addDiscT:'➕ Add Discount Code',addDiscBtn:'➕ Add',discLbl:'Discount Code (optional)',discApply:'Apply',discEmpty:'Enter code',discInvalid:'❌ Invalid code',discApplied:'Discount applied',fR:'All rights reserved by',fN:'⚠️ File creation only',eF:'⚠️ Enter email and password',eCp:'❌ Wrong captcha',eW:'❌ Wrong credentials',eFA:'⚠️ All fields required',eEm:'❌ Invalid email',eSh:'❌ Password too short',ePM:'❌ Passwords mismatch',eEx:'❌ Email exists',eDe:'⚠️ Describe please',wlc:'Welcome',lo:'Logged out',oS:'✅ WhatsApp!'}
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
