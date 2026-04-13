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
// ============================
// Discount
// ============================
async function applyDiscount(){
  const code=document.getElementById('discInp').value.trim().toUpperCase();
  const t=T[lang]||T.ar;
  if(!code){toast(t.discEmpty||'أدخل الكود',true);return;}
  const discounts=await fbGet('discounts')||{};
  const entry=Object.values(discounts).find(d=>d.code===code);
  if(!entry){toast(t.discInvalid||'❌ الكود غير صحيح',true);return;}
  discountPct=entry.pct;
  discountCode=code;
  const tag=document.getElementById('discTag');
  tag.textContent=`✅ خصم ${entry.pct}% — كود: ${code}`;
  tag.style.display='block';
  toast(`🎉 ${t.discApplied||'تم تطبيق الخصم'} ${entry.pct}%`);
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

  // حفظ الطلب في Firebase
  await fbPush('orders',{
    bot,name,contact:con,desc,budget:bud,
    pay:payV||'—',
    discount:discountCode||'—',
    discountPct:discountPct||0,
    date:new Date().toLocaleString('ar-EG'),
    user:sess?.email||'guest',
    device:navigator.userAgent
  });
  // زيادة عداد الطلبات
  await fbIncr('stats/orderCount');
  refreshOrderCount();

  const discLine=discountCode?`\n🏷️ *كود الخصم:* ${discountCode} (${discountPct}% خصم)`:'';
  const msg=`🤖 *طلب جديد - Projects Bots*\n\n📦 *البوت:* ${bot}\n👤 *الاسم:* ${name}\n📞 *التواصل:* ${con}\n💰 *الميزانية:* ${bud||'—'}\n💳 *الدفع:* ${payV||'—'}${discLine}${isCustom&&desc&&desc!=='—'?'\n\n📝 *الوصف:*\n'+desc:''}\n\n_من موقع Projects Bots_`;
  window.open('https://wa.me/201145974113?text='+encodeURIComponent(msg),'_blank');
  closeM('ovO');
  toast(t.oS||'✅ تم فتح واتساب!');
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

  // Orders
  document.getElementById('pOL').innerHTML=orders.length
    ?orders.slice().reverse().map(o=>`<div class="pc"><h4>📦 ${o.bot} — ${o.date}</h4><p>👤 <strong>${o.name}</strong> | 📞 <strong>${o.contact}</strong><br>💰 <strong>${o.budget||'—'}</strong> | 💳 <strong>${o.pay||'—'}</strong>${o.discountCode&&o.discountCode!=='—'?` | 🏷️ <strong>${o.discountCode} (${o.discountPct}%)</strong>`:''}<br>📱 <span style="font-size:10px">${(o.device||'').substring(0,90)}</span>${o.desc&&o.desc!=='—'?'<br>📝 '+o.desc:''}</p></div>`).join('')
    :'<p style="color:var(--mut);text-align:center;padding:16px">لا توجد طلبات</p>';

  // Users
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
en:{dir:'ltr',ll:'Language:',ords:'orders',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'About',h1:'Available for orders',h2:'Professional Bots',h3:'For Every Platform',h4:'Custom bot development — file creation only.',h5:'📦 Order Now',h6:'About Us',od:'Bot Developer — File creation only, no hosting',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'About',d1:'Discord Bots',d2:'All allowed bot types',ab1:'About Us',ab2:'Everything you need to know',a1t:'Who We Are',a1p:'Marwan | Wano — Bot developer.',a2t:'Note',a2p:'File creation only, no hosting.',a3t:'Payments',a3p:'Vodafone Cash, PayPal, Binance, USDT, Bank.',a4t:'Delivery',a4p:'Simple: 1-3 days. Medium: 3-7 days.',a5t:'Support',a5p:'Free 7-day support.',a6t:'Contact',login:'Login',register:'Sign Up',lb1:'Email',lb2:'Password',lb3:'🔑 Login',dvOr:'or',nA:"Don't have an account?",cO:'Create one',hA:'Have an account?',sI:'Sign in',rl1:'Name',rl2:'Email',rl3:'Password (min 6)',rl4:'Confirm Password',rl5:'✅ Create Account',or1:'Order',or2:'📱 Reply via WhatsApp',or3:'Bot Name',or4:'Your Name',or5:'Contact',or6:'Describe in detail',or7:'Budget',or8:'Payment',or9:'📤 Send via WhatsApp',oB:'🛒 Order Now',cB:'✨ Custom Bot',cD:'Custom Discord Bot',cT:'Custom Telegram Bot',cW:'Custom WhatsApp Bot',ca1:'✓ Any idea',ca2:'✓ Custom price',uv:'Not Available',opT:'Owner Panel',opB:'Owner Panel',ptO:'📦 Orders',ptU:'👥 Users',ptD:'🏷️ Discounts',pUL:'users',pDL:'discount',addDiscT:'➕ Add Discount Code',addDiscBtn:'➕ Add',discLbl:'Discount Code (optional)',discApply:'Apply',discEmpty:'Enter code',discInvalid:'❌ Invalid code',discApplied:'Discount applied',fR:'All rights reserved by',fN:'⚠️ File creation only',eF:'⚠️ Enter email and password',eCp:'❌ Wrong captcha',eW:'❌ Wrong credentials',eFA:'⚠️ All fields required',eEm:'❌ Invalid email',eSh:'❌ Password too short',ePM:'❌ Passwords mismatch',eEx:'❌ Email exists',eDe:'⚠️ Describe please',wlc:'Welcome',lo:'Logged out',oS:'✅ WhatsApp!'},
fr:{dir:'ltr',ll:'Langue:',ords:'commandes',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'À propos',h1:'Disponible',h2:'Bots Pro',h3:'Toutes plateformes',h4:'Développement de bots.',h5:'📦 Commander',h6:'À propos',od:'Développeur — Fichiers uniquement',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'À propos',d1:'Bots Discord',d2:'Tous les bots',ab1:'À Propos',ab2:'Tout savoir',a1t:'Qui sommes-nous',a1p:'Marwan | Wano.',a2t:'Note',a2p:'Fichiers uniquement.',a3t:'Paiements',a3p:'PayPal, Binance, USDT.',a4t:'Délai',a4p:'Simple: 1-3j.',a5t:'Support',a5p:'7j gratuit.',a6t:'Contact',login:'Connexion',register:"S'inscrire",lb1:'Email',lb2:'Mot de passe',lb3:'🔑 Connexion',dvOr:'ou',nA:'Pas de compte?',cO:'Créer',hA:'Déjà un compte?',sI:'Connecter',rl1:'Nom',rl2:'Email',rl3:'MDP (6+)',rl4:'Confirmer',rl5:'✅ Créer',or1:'Commander',or2:'📱 WhatsApp',or3:'Nom',or4:'Votre nom',or5:'Contact',or6:'Décrire',or7:'Budget',or8:'Paiement',or9:'📤 Envoyer',oB:'🛒 Commander',cB:'✨ Personnalisé',cD:'Bot Discord perso',cT:'Bot Telegram perso',cW:'Bot WhatsApp perso',ca1:'✓ Toute idée',ca2:'✓ Prix sur mesure',uv:'Non disponible',opT:'Panel Propriétaire',opB:'Panel',ptO:'📦 Commandes',ptU:'👥 Utilisateurs',ptD:'🏷️ Réductions',pUL:'utilisateurs',pDL:'réduction',addDiscT:'➕ Ajouter code',addDiscBtn:'➕ Ajouter',discLbl:'Code promo (optionnel)',discApply:'Appliquer',discEmpty:'Entrez code',discInvalid:'❌ Code invalide',discApplied:'Réduction appliquée',fR:'Tous droits réservés',fN:'⚠️ Fichiers uniquement',eF:'⚠️ Email et MDP',eCp:'❌ Mauvaise réponse',eW:'❌ Identifiants erronés',eFA:'⚠️ Tous les champs',eEm:'❌ Email invalide',eSh:'❌ MDP court',ePM:'❌ MDP différents',eEx:'❌ Email existant',eDe:'⚠️ Décrivez',wlc:'Bienvenue',lo:'Déconnecté',oS:'✅ WhatsApp!'},
tr:{dir:'ltr',ll:'Dil:',ords:'sipariş',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'Hakkında',h1:'Siparişe hazır',h2:'Profesyonel Botlar',h3:'Her Platform',h4:'Bot geliştirme.',h5:'📦 Sipariş',h6:'Hakkımızda',od:'Geliştirici',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Hakkında',d1:'Discord Botları',d2:'Tüm botlar',ab1:'Hakkımızda',ab2:'Bilgiler',a1t:'Biz Kimiz',a1p:'Marwan | Wano.',a2t:'Not',a2p:'Yalnızca dosya.',a3t:'Ödeme',a3p:'PayPal, Binance.',a4t:'Teslimat',a4p:'Basit: 1-3 gün.',a5t:'Destek',a5p:'7 gün destek.',a6t:'İletişim',login:'Giriş',register:'Kayıt',lb1:'Email',lb2:'Şifre',lb3:'🔑 Giriş',dvOr:'veya',nA:'Hesap yok?',cO:'Oluştur',hA:'Hesap var?',sI:'Giriş',rl1:'Ad',rl2:'Email',rl3:'Şifre (6+)',rl4:'Onayla',rl5:'✅ Oluştur',or1:'Sipariş',or2:'📱 WhatsApp',or3:'Bot adı',or4:'Adınız',or5:'İletişim',or6:'Açıklayın',or7:'Bütçe',or8:'Ödeme',or9:'📤 Gönder',oB:'🛒 Sipariş',cB:'✨ Özel',cD:'Özel Discord',cT:'Özel Telegram',cW:'Özel WhatsApp',ca1:'✓ Her fikir',ca2:'✓ Özel fiyat',uv:'Mevcut değil',opT:'Sahip Paneli',opB:'Panel',ptO:'📦 Siparişler',ptU:'👥 Kullanıcılar',ptD:'🏷️ İndirimler',pUL:'kullanıcı',pDL:'indirim',addDiscT:'➕ İndirim Ekle',addDiscBtn:'➕ Ekle',discLbl:'İndirim kodu (opsiyonel)',discApply:'Uygula',discEmpty:'Kod girin',discInvalid:'❌ Geçersiz kod',discApplied:'İndirim uygulandı',fR:'Tüm haklar',fN:'⚠️ Yalnızca dosya',eF:'⚠️ Email ve şifre',eCp:'❌ Yanlış captcha',eW:'❌ Hatalı giriş',eFA:'⚠️ Tüm alanlar',eEm:'❌ Geçersiz email',eSh:'❌ Şifre kısa',ePM:'❌ Şifreler eşleşmiyor',eEx:'❌ Email kayıtlı',eDe:'⚠️ Açıklayın',wlc:'Hoşgeldin',lo:'Çıkış',oS:'✅ WhatsApp!'},
de:{dir:'ltr',ll:'Sprache:',ords:'Bestellungen',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'Über',h1:'Verfügbar',h2:'Professionelle Bots',h3:'Alle Plattformen',h4:'Bot-Entwicklung.',h5:'📦 Bestellen',h6:'Über uns',od:'Entwickler',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Über',d1:'Discord Bots',d2:'Alle Bots',ab1:'Über Uns',ab2:'Alles wissen',a1t:'Wer sind wir',a1p:'Marwan | Wano.',a2t:'Hinweis',a2p:'Nur Dateien.',a3t:'Zahlung',a3p:'PayPal, Binance.',a4t:'Lieferzeit',a4p:'Einfach: 1-3T.',a5t:'Support',a5p:'7T Support.',a6t:'Kontakt',login:'Anmelden',register:'Registrieren',lb1:'Email',lb2:'Passwort',lb3:'🔑 Login',dvOr:'oder',nA:'Kein Konto?',cO:'Erstellen',hA:'Konto vorhanden?',sI:'Einloggen',rl1:'Name',rl2:'Email',rl3:'Passwort (6+)',rl4:'Bestätigen',rl5:'✅ Erstellen',or1:'Bestellen',or2:'📱 WhatsApp',or3:'Bot Name',or4:'Ihr Name',or5:'Kontakt',or6:'Beschreiben',or7:'Budget',or8:'Zahlung',or9:'📤 Senden',oB:'🛒 Bestellen',cB:'✨ Eigener',cD:'Eigener Discord',cT:'Eigener Telegram',cW:'Eigener WhatsApp',ca1:'✓ Jede Idee',ca2:'✓ Preis',uv:'Nicht verfügbar',opT:'Besitzer Panel',opB:'Panel',ptO:'📦 Bestellungen',ptU:'👥 Nutzer',ptD:'🏷️ Rabatte',pUL:'Nutzer',pDL:'Rabatt',addDiscT:'➕ Rabatt hinzufügen',addDiscBtn:'➕ Hinzufügen',discLbl:'Rabattcode (optional)',discApply:'Anwenden',discEmpty:'Code eingeben',discInvalid:'❌ Ungültiger Code',discApplied:'Rabatt angewandt',fR:'Alle Rechte',fN:'⚠️ Nur Dateien',eF:'⚠️ Email & Passwort',eCp:'❌ Falsch',eW:'❌ Falsche Daten',eFA:'⚠️ Alle Felder',eEm:'❌ Ungültig',eSh:'❌ Zu kurz',ePM:'❌ Nicht gleich',eEx:'❌ Existiert',eDe:'⚠️ Beschreiben',wlc:'Willkommen',lo:'Abgemeldet',oS:'✅ WhatsApp!'},
es:{dir:'ltr',ll:'Idioma:',ords:'pedidos',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'Nosotros',h1:'Disponible',h2:'Bots Pro',h3:'Todas las plataformas',h4:'Desarrollo de bots.',h5:'📦 Pedir',h6:'Sobre nosotros',od:'Desarrollador',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Nosotros',d1:'Bots Discord',d2:'Todos los bots',ab1:'Sobre Nosotros',ab2:'Todo lo que necesitas',a1t:'Quiénes somos',a1p:'Marwan | Wano.',a2t:'Nota',a2p:'Solo archivos.',a3t:'Pagos',a3p:'PayPal, Binance.',a4t:'Entrega',a4p:'Simple: 1-3d.',a5t:'Soporte',a5p:'7d gratuito.',a6t:'Contacto',login:'Entrar',register:'Registrarse',lb1:'Email',lb2:'Contraseña',lb3:'🔑 Entrar',dvOr:'o',nA:'¿Sin cuenta?',cO:'Crear',hA:'¿Cuenta?',sI:'Entrar',rl1:'Nombre',rl2:'Email',rl3:'Contraseña (6+)',rl4:'Confirmar',rl5:'✅ Crear',or1:'Pedir',or2:'📱 WhatsApp',or3:'Nombre',or4:'Tu nombre',or5:'Contacto',or6:'Describir',or7:'Presupuesto',or8:'Pago',or9:'📤 Enviar',oB:'🛒 Pedir',cB:'✨ Personalizado',cD:'Discord personalizado',cT:'Telegram personalizado',cW:'WhatsApp personalizado',ca1:'✓ Cualquier idea',ca2:'✓ Precio',uv:'No disponible',opT:'Panel del Propietario',opB:'Panel',ptO:'📦 Pedidos',ptU:'👥 Usuarios',ptD:'🏷️ Descuentos',pUL:'usuarios',pDL:'descuento',addDiscT:'➕ Agregar código',addDiscBtn:'➕ Agregar',discLbl:'Código de descuento (opcional)',discApply:'Aplicar',discEmpty:'Ingresa código',discInvalid:'❌ Código inválido',discApplied:'Descuento aplicado',fR:'Todos los derechos',fN:'⚠️ Solo archivos',eF:'⚠️ Email y contraseña',eCp:'❌ Captcha incorrecto',eW:'❌ Credenciales erróneas',eFA:'⚠️ Todos los campos',eEm:'❌ Email inválido',eSh:'❌ Contraseña corta',ePM:'❌ No coinciden',eEx:'❌ Email existe',eDe:'⚠️ Describir',wlc:'Bienvenido',lo:'Cerrado sesión',oS:'✅ WhatsApp!'},
ru:{dir:'ltr',ll:'Язык:',ords:'заказов',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'О нас',h1:'Доступен',h2:'Профессиональные Боты',h3:'Все платформы',h4:'Разработка ботов.',h5:'📦 Заказать',h6:'О нас',od:'Разработчик',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'О нас',d1:'Discord Боты',d2:'Все боты',ab1:'О нас',ab2:'Всё знать',a1t:'Кто мы',a1p:'Marwan | Wano.',a2t:'Важное',a2p:'Только файлы.',a3t:'Оплата',a3p:'PayPal, Binance.',a4t:'Доставка',a4p:'Простой: 1-3д.',a5t:'Поддержка',a5p:'7д бесплатно.',a6t:'Контакт',login:'Войти',register:'Регистрация',lb1:'Email',lb2:'Пароль',lb3:'🔑 Войти',dvOr:'или',nA:'Нет аккаунта?',cO:'Создать',hA:'Есть аккаунт?',sI:'Войти',rl1:'Имя',rl2:'Email',rl3:'Пароль (6+)',rl4:'Подтвердить',rl5:'✅ Создать',or1:'Заказать',or2:'📱 WhatsApp',or3:'Название',or4:'Ваше имя',or5:'Контакт',or6:'Описать',or7:'Бюджет',or8:'Оплата',or9:'📤 Отправить',oB:'🛒 Заказать',cB:'✨ Кастом',cD:'Кастом Discord',cT:'Кастом Telegram',cW:'Кастом WhatsApp',ca1:'✓ Любая идея',ca2:'✓ Цена',uv:'Недоступно',opT:'Панель Владельца',opB:'Панель',ptO:'📦 Заказы',ptU:'👥 Пользователи',ptD:'🏷️ Скидки',pUL:'пользователей',pDL:'скидка',addDiscT:'➕ Добавить код',addDiscBtn:'➕ Добавить',discLbl:'Код скидки (необязательно)',discApply:'Применить',discEmpty:'Введите код',discInvalid:'❌ Неверный код',discApplied:'Скидка применена',fR:'Все права',fN:'⚠️ Только файлы',eF:'⚠️ Email и пароль',eCp:'❌ Неверный ответ',eW:'❌ Неверные данные',eFA:'⚠️ Все поля',eEm:'❌ Неверный email',eSh:'❌ Пароль короткий',ePM:'❌ Не совпадают',eEx:'❌ Email занят',eDe:'⚠️ Опишите',wlc:'Добро пожаловать',lo:'Выход',oS:'✅ WhatsApp!'},
pt:{dir:'ltr',ll:'Idioma:',ords:'pedidos',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'Sobre',h1:'Disponível',h2:'Bots Profissionais',h3:'Todas plataformas',h4:'Desenvolvimento de bots.',h5:'📦 Pedir',h6:'Sobre nós',od:'Desenvolvedor',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Sobre',d1:'Bots Discord',d2:'Todos os bots',ab1:'Sobre Nós',ab2:'Tudo saber',a1t:'Quem somos',a1p:'Marwan | Wano.',a2t:'Nota',a2p:'Apenas arquivos.',a3t:'Pagamento',a3p:'PayPal, Binance.',a4t:'Entrega',a4p:'Simples: 1-3d.',a5t:'Suporte',a5p:'7d grátis.',a6t:'Contato',login:'Entrar',register:'Cadastrar',lb1:'Email',lb2:'Senha',lb3:'🔑 Entrar',dvOr:'ou',nA:'Sem conta?',cO:'Criar',hA:'Tem conta?',sI:'Entrar',rl1:'Nome',rl2:'Email',rl3:'Senha (6+)',rl4:'Confirmar',rl5:'✅ Criar',or1:'Pedir',or2:'📱 WhatsApp',or3:'Nome',or4:'Seu nome',or5:'Contato',or6:'Descrever',or7:'Orçamento',or8:'Pagamento',or9:'📤 Enviar',oB:'🛒 Pedir',cB:'✨ Personalizado',cD:'Discord personalizado',cT:'Telegram personalizado',cW:'WhatsApp personalizado',ca1:'✓ Qualquer ideia',ca2:'✓ Preço',uv:'Indisponível',opT:'Painel do Proprietário',opB:'Painel',ptO:'📦 Pedidos',ptU:'👥 Usuários',ptD:'🏷️ Descontos',pUL:'usuários',pDL:'desconto',addDiscT:'➕ Adicionar código',addDiscBtn:'➕ Adicionar',discLbl:'Código de desconto (opcional)',discApply:'Aplicar',discEmpty:'Digite código',discInvalid:'❌ Código inválido',discApplied:'Desconto aplicado',fR:'Todos os direitos',fN:'⚠️ Apenas arquivos',eF:'⚠️ Email e senha',eCp:'❌ Captcha errado',eW:'❌ Credenciais erradas',eFA:'⚠️ Todos os campos',eEm:'❌ Email inválido',eSh:'❌ Senha curta',ePM:'❌ Não coincidem',eEx:'❌ Email existe',eDe:'⚠️ Descrever',wlc:'Bem-vindo',lo:'Saiu',oS:'✅ WhatsApp!'},
id:{dir:'ltr',ll:'Bahasa:',ords:'pesanan',n1:'Discord',n2:'Telegram',n3:'WhatsApp',n6:'Tentang',h1:'Tersedia',h2:'Bot Profesional',h3:'Semua Platform',h4:'Pengembangan bot.',h5:'📦 Pesan',h6:'Tentang Kami',od:'Pengembang',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Tentang',d1:'Bot Discord',d2:'Semua bot',ab1:'Tentang Kami',ab2:'Semua info',a1t:'Siapa Kami',a1p:'Marwan | Wano.',a2t:'Catatan',a2p:'Hanya file.',a3t:'Pembayaran',a3p:'PayPal, Binance.',a4t:'Pengiriman',a4p:'Sederhana: 1-3h.',a5t:'Dukungan',a5p:'7h gratis.',a6t:'Kontak',login:'Masuk',register:'Daftar',lb1:'Email',lb2:'Kata sandi',lb3:'🔑 Masuk',dvOr:'atau',nA:'Belum punya akun?',cO:'Buat',hA:'Sudah punya?',sI:'Masuk',rl1:'Nama',rl2:'Email',rl3:'Kata sandi (6+)',rl4:'Konfirmasi',rl5:'✅ Buat',or1:'Pesan',or2:'📱 WhatsApp',or3:'Nama bot',or4:'Nama Anda',or5:'Kontak',or6:'Jelaskan',or7:'Anggaran',or8:'Pembayaran',or9:'📤 Kirim',oB:'🛒 Pesan',cB:'✨ Kustom',cD:'Discord kustom',cT:'Telegram kustom',cW:'WhatsApp kustom',ca1:'✓ Ide apapun',ca2:'✓ Harga khusus',uv:'Tidak tersedia',opT:'Panel Pemilik',opB:'Panel',ptO:'📦 Pesanan',ptU:'👥 Pengguna',ptD:'🏷️ Diskon',pUL:'pengguna',pDL:'diskon',addDiscT:'➕ Tambah kode',addDiscBtn:'➕ Tambah',discLbl:'Kode diskon (opsional)',discApply:'Terapkan',discEmpty:'Masukkan kode',discInvalid:'❌ Kode tidak valid',discApplied:'Diskon diterapkan',fR:'Hak cipta',fN:'⚠️ Hanya file',eF:'⚠️ Email dan kata sandi',eCp:'❌ Captcha salah',eW:'❌ Data salah',eFA:'⚠️ Semua kolom',eEm:'❌ Email tidak valid',eSh:'❌ Kata sandi pendek',ePM:'❌ Tidak cocok',eEx:'❌ Email terdaftar',eDe:'⚠️ Jelaskan',wlc:'Selamat datang',lo:'Keluar',oS:'✅ WhatsApp!'}
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
