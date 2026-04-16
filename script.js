// =============================================================
// Projects Bots — Ultra Realistic Script (10,000% Realism)
// Core, AI Translate, and Magic UI
// =============================================================

const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v6'; // غيرنا الإصدار حتى نجبر الكل يسجل دخول من جديد

let sess = null, payV = '', capN = 0, isCustom = false, discountPct = 0, discountCode = '';
let storeOpen = true;

// ============================
// Google Translate AI Magic ✨
// ============================
function initAITranslator() {
  const script = document.createElement('script');
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(script);
  
  const div = document.createElement('div');
  div.id = 'google_translate_element';
  div.style.display = 'none'; // إخفاء شريط جوجل
  document.body.appendChild(div);
}

window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({pageLanguage: 'ar', autoDisplay: false}, 'google_translate_element');
};

function setAILang(langCode, btn) {
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
    toast('🤖 جاري الترجمة عبر الذكاء الاصطناعي...');
  } else {
    setTimeout(() => setAILang(langCode, btn), 500); 
  }
}

// ============================
// 3D Scroll & Ripple Effects 🚀
// ============================
function injectMagicUI() {
  // تفاعل الظهور والاختفاء الذكي (Parallax & Reveal)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        entry.target.classList.remove('reveal-down', 'reveal-up');
      } else {
        entry.target.classList.remove('reveal-visible');
        if (entry.boundingClientRect.top > 0) {
          entry.target.classList.add('reveal-down');
          entry.target.classList.remove('reveal-up');
        } else {
          entry.target.classList.add('reveal-up');
          entry.target.classList.remove('reveal-down');
        }
      }
    });
  }, { threshold: 0.1 });

  setTimeout(() => {
    document.querySelectorAll('.bc, .ac, .owc, .rule-item, .set-card').forEach(el => {
      el.classList.add('reveal-el', 'reveal-down');
      observer.observe(el);
    });
  }, 500);

  // تأثير الموجة المائية المطور (Ripple Effect) لكل العناصر اللي بيها كلاس ripple-element
  document.addEventListener('click', function(e) {
    const target = e.target.closest('.ripple-element');
    if (target) {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.style.left = x + 'px'; ripple.style.top = y + 'px';
      ripple.classList.add('ripple-span');
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700); // إزالة الموجة بعد انتهاء الحركة
    }
  });
}

// ============================
// Firebase Helpers
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
// Init, Stats & Store Status
// ============================
window.onload=async()=>{
  initAITranslator();
  injectMagicUI();
  
  try{sess=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){}
  
  // 🛡️ Auth Gate Logic (تفعيل البوابة الإجبارية)
  const gate = document.getElementById('authGate');
  const main = document.getElementById('mainContent');
  
  if(sess) {
    // إذا مسجل دخول من قبل، افتح البوابة مباشرة
    gate.classList.add('hidden');
    main.classList.add('auth-success');
    renderAuth();
  } else {
    // إذا ما مسجل، اقفل الموقع
    gate.classList.remove('hidden');
    main.classList.remove('auth-success');
  }

  newCap();
  refreshStats();
  setInterval(refreshStats, 20000); // تحديث العدادات كل 20 ثانية
  
  if(!sessionStorage.getItem('visited_pb_v6')){
    await fbIncr('stats/visits');
    sessionStorage.setItem('visited_pb_v6','1');
  }

  const st = await fbGet('settings/storeOpen');
  if(st !== null) storeOpen = st;
  updateStoreStatusUI();
};

async function refreshStats(){
  const stats = await fbGet('stats')||{};
  const oCountEl = document.getElementById('oCount');
  const vCountEl = document.getElementById('vCount');
  if(oCountEl) oCountEl.textContent=Number(stats.orderCount||0).toLocaleString();
  if(vCountEl) vCountEl.textContent=Number(stats.visits||0).toLocaleString();
}

function updateStoreStatusUI(){
  const txt = document.getElementById('heroBadgeTxt');
  const badge = document.querySelector('.badge');
  
  if(txt) txt.textContent = storeOpen ? 'متاح للطلبات الآن' : 'غير متاح للطلبات حالياً';
  if(badge) {
    if(storeOpen) badge.classList.remove('closed');
    else badge.classList.add('closed');
  }
  
  document.querySelectorAll('.ob').forEach(btn => {
    if(btn.closest('.bc').classList.contains('dis')){
      btn.disabled = true;
      btn.textContent = '⛔ مغلق حالياً';
    } else {
      btn.disabled = !storeOpen;
      if(!storeOpen) {
        btn.textContent = '⛔ مغلق حالياً';
      } else {
        const isCustomBtn = btn.closest('.sp') !== null;
        btn.textContent = isCustomBtn ? '✨ اطلب بوتك' : '🛒 اطلب الآن';
      }
    }
  });
}

async function toggleStoreStatus(){
  if(!sess?.isOwner) return; // محمي للمالك
  storeOpen = !storeOpen;
  await fbSet('settings/storeOpen', storeOpen);
  updateStoreStatusUI();
  toast(storeOpen ? '✅ تم فتح المتجر ورفع الحظر!' : '⛔ تم إغلاق المتجر وإيقاف الطلبات!');
}

async function sha256(s){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ============================
// Auth Render & Unlocking Gate
// ============================
function renderAuth(){
  const area=document.getElementById('authArea');
  if(sess){
    const isOw=sess.isOwner;
    area.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      ${isOw?`<button class="abtn ripple-element" style="font-size:12px;padding:6px 14px;border-color:rgba(245,158,11,.4);color:var(--ow);background:rgba(245,158,11,.1);box-shadow: 0 0 15px rgba(245,158,11,0.2);" onclick="showPanel()"><img src="https://api.iconify.design/lucide:settings.svg?color=f59e0b" style="width:16px; margin-left:4px;"> لوحة المالك</button>`:''}
      <div class="uchip${isOw?' ow':''}"><img src="${isOw?'https://api.iconify.design/lucide:crown.svg?color=ffffff':'https://api.iconify.design/lucide:user.svg?color=ffffff'}" style="width:14px; margin-left:4px;"> ${sess.name}<button class="lo" onclick="logout()"><img src="https://api.iconify.design/lucide:log-out.svg?color=ef4444" style="width:16px;"></button></div>
    </div>`;
  }
}

function logout(){
  sess=null; localStorage.removeItem(SK);
  document.getElementById('ownerPanel').style.display='none';
  
  // 🛡️ قفل الموقع بالبوابة من جديد عند تسجيل الخروج
  document.getElementById('authGate').classList.remove('hidden');
  document.getElementById('mainContent').classList.remove('auth-success');
  
  toast('تم تسجيل الخروج وقفل النظام 🛡️');
}

// الدالة المسؤولة عن فتح البوابة
function unlockGate(userObj) {
  sess = userObj;
  localStorage.setItem(SK, JSON.stringify(sess));
  closeM('ovA'); // إغلاق المودال
  renderAuth();
  
  // فتح البوابة بستايل هولوجرامي 🌟
  document.getElementById('authGate').classList.add('hidden');
  document.getElementById('mainContent').classList.add('auth-success');
}

// ============================
// Captcha (Hard Mode 🔥)
// ============================
function newCap(){
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b;
  if (op === '×') { a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; capN = a * b; }
  else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * 10) + 1; capN = a - b; }
  else { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; capN = a + b; }

  const q = `${a} ${op} ${b} = ?`;
  ['cQ','cQ2'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=q;});
  ['cA','cA2'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
}
function chkCap(id){return parseInt(document.getElementById(id)?.value)===capN;}

// ============================
// Auth Modals & Functions
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
  err.classList.remove('show');
  
  if(!email||!pass){err.textContent='⚠️ أدخل الإيميل والباسورد';err.classList.add('show');return;}
  if(!chkCap('cA')){err.textContent='❌ إجابة الكابتشا غلط، ركز!';err.classList.add('show');newCap();return;}
  
  // Owner login
  if(email===OW_EMAIL&&pass===OW_PASS){
    unlockGate({name:'مروان | Wano',email,isOwner:true});
    updateStoreStatusUI();
    toast('👑 تم فتح النظام يا مدير!');return;
  }
  
  // Normal user login
  const h=await sha256(pass+email+'_pb25');
  const users=await fbGet('users')||{};
  const user=Object.values(users).find(u=>u.email===email&&u.hash===h);
  
  if(!user){err.textContent='❌ الإيميل أو الباسورد غلط!';err.classList.add('show');newCap();return;}
  
  unlockGate({name:user.name,email:user.email,isOwner:false});
  toast(`✅ مرحباً بعودتك ${user.name}!`);
}

async function doReg(){
  const name=document.getElementById('rn').value.trim();
  const email=document.getElementById('re').value.trim().toLowerCase();
  const pass=document.getElementById('rp').value;
  const pass2=document.getElementById('rp2').value;
  const err=document.getElementById('rE');
  err.classList.remove('show');
  
  if(!name||!email||!pass){err.textContent='⚠️ جميع الحقول مطلوبة';err.classList.add('show');return;}
  if(!email.includes('@')||!email.includes('.')){err.textContent='❌ إيميلك شكله غلط';err.classList.add('show');return;}
  if(pass.length<6){err.textContent='❌ الباسورد لازم 6 حروف أو أكثر';err.classList.add('show');return;}
  if(pass!==pass2){err.textContent='❌ الباسوردين ما يتطابقون!';err.classList.add('show');return;}
  if(!chkCap('cA2')){err.textContent='❌ إجابة الكابتشا غلط';err.classList.add('show');newCap();return;}
  
  const users=await fbGet('users')||{};
  if(Object.values(users).find(u=>u.email===email)){err.textContent='❌ الإيميل مسجل قبل، استعمل غيره!';err.classList.add('show');return;}
  
  const h=await sha256(pass+email+'_pb25');
  await fbPush('users',{name,email,hash:h,device:navigator.userAgent,joined:new Date().toISOString()});
  
  unlockGate({name,email,isOwner:(email===OW_EMAIL&&pass===OW_PASS)});
  toast(`🎉 تم فتح النظام يا ${name}!`);
}

// ============================
// TAB SWITCHER (FIXED: NO SCROLL TO TOP 🚫👆)
// ============================
function switchTab(n){
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  
  const el = document.getElementById('tab-'+n);
  const btn = document.getElementById('btn-'+n);
  
  if(el) el.classList.add('on');
  if(btn) btn.classList.add('on');
  
  // شلنا كود الـ window.scrollTo حتى يبقى المستخدم بمكانه بدون إزعاج!
}
// ============================
// MODALS UI & STORE GATING
// ============================
function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}

function openOrder(bn,bp,c=false){
  if(!sess){openAuth('l');toast('⚠️ لازم تسجل دخول قبل لا تطلب!');return;}
  if(!storeOpen){toast('⛔ المتجر مغلق حالياً، لا يمكن استقبال طلبات!');return;}
  
  isCustom=c;
  document.getElementById('bn').value=bn;
  document.getElementById('cn').value=sess.name||'';
  document.getElementById('cc').value='';
  document.getElementById('cb').value=bp;
  document.getElementById('dA').style.display=c?'block':'none';
  document.getElementById('cd').value='';
  
  payV=''; document.querySelectorAll('.pay').forEach(b=>{b.classList.remove('on','pay-error');});
  
  discountPct=0; discountCode='';
  document.getElementById('discInp').value='';
  document.getElementById('discTag').style.display='none';
  
  openM('ovO');
}

function sP(b,m){
  document.querySelectorAll('.pay').forEach(x=>x.classList.remove('on','pay-error'));
  b.classList.add('on'); payV=m;
}

// ============================
// DISCOUNT CODES (BURN ON USE) 🔥
// ============================
async function applyDiscount(){
  const inp=document.getElementById('discInp').value.trim().toUpperCase();
  if(!inp){toast('⚠️ اكتب كود الخصم أولاً');return;}
  
  const codes=await fbGet('discounts')||{};
  const foundId=Object.keys(codes).find(k=>codes[k].code===inp);
  
  if(!foundId){toast('❌ الكود غير صحيح أو مستخدم مسبقاً');return;}
  
  discountPct=codes[foundId].pct;
  discountCode=inp;
  const tag=document.getElementById('discTag');
  tag.textContent=`تم تفعيل خصم ${discountPct}% 🎉`;
  tag.style.display='block';
  toast('🎉 تم تطبيق الخصم بنجاح!');
}

async function burnDiscountCode(codeStr){
  const codes=await fbGet('discounts')||{};
  const foundId=Object.keys(codes).find(k=>codes[k].code===codeStr);
  if(foundId) await fbDel(`discounts/${foundId}`);
}

// ============================
// SUBMIT ORDER (MANDATORY PAYMENT)
// ============================
async function submitOrder(){
  if(!payV){
    toast('⚠️ لازم تختار طريقة دفع حتى نكمل الطلب!','e');
    document.querySelectorAll('.pay').forEach(b=>b.classList.add('pay-error'));
    return;
  }
  
  const n=document.getElementById('cn').value.trim();
  const c=document.getElementById('cc').value.trim();
  const d=isCustom?document.getElementById('cd').value.trim():'';
  if(!n||!c){toast('⚠️ اكتب اسمك ورقمك/حسابك','e');return;}
  if(isCustom&&!d){toast('⚠️ اشرح طلبك بالتفصيل','e');return;}

  const bName=document.getElementById('bn').value;
  let bPrice=document.getElementById('cb').value;
  
  if(discountPct>0){
    bPrice+=` (خصم ${discountPct}% عبر الكود ${discountCode})`;
    await burnDiscountCode(discountCode); // حرق الكود 🔥
  }

  const o={bn:bName,n,c,cb:bPrice,pay:payV,d,time:new Date().toLocaleString('ar-SA')};
  await fbPush('orders',o);
  await fbIncr('stats/orderCount');

  let t=`*📦 طلب بوت جديد*\n\n*الطلب:* ${bName}\n*الميزانية:* ${bPrice}\n*طريقة الدفع:* ${payV}\n*الاسم:* ${n}\n*التواصل:* ${c}`;
  if(isCustom) t+=`\n*التفاصيل:* ${d}`;
  t+=`\n\n*~ Projects Bots 2026*`;

  window.open(`https://wa.me/201145974113?text=${encodeURIComponent(t)}`,'_blank');
  closeM('ovO');
  refreshStats();
  toast('✅ تم إرسال طلبك بنجاح!');
}

// ============================
// OWNER PANEL 👑
// ============================
async function showPanel(){
  if(!sess?.isOwner){toast('⛔ خاص بالمالك فقط!','e');return;}
  document.getElementById('ownerPanel').style.display='block';
  const st=await fbGet('stats')||{};
  document.getElementById('pO').textContent=st.orderCount||0;
  
  const us=await fbGet('users')||{};
  document.getElementById('pU').textContent=Object.keys(us).length;
  
  const ds=await fbGet('discounts')||{};
  document.getElementById('pD').textContent=Object.keys(ds).length;
  
  loadOrders();
}

function panelTab(t,b){
  document.querySelectorAll('.ptab').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
  ['pOL','pUL','pDL'].forEach(id=>document.getElementById(id).style.display='none');
  
  if(t==='o'){document.getElementById('pOL').style.display='block';loadOrders();}
  if(t==='u'){document.getElementById('pUL').style.display='block';loadUsers();}
  if(t==='d'){document.getElementById('pDL').style.display='block';loadDiscounts();}
}

async function loadOrders(){
  const ol=document.getElementById('pOL'); ol.innerHTML='<div style="text-align:center;padding:20px"><img src="https://api.iconify.design/lucide:loader-2.svg?color=white" class="icon-lang" style="animation: spinIcon 1s linear infinite;"></div>';
  const data=await fbGet('orders')||{};
  const keys=Object.keys(data).reverse();
  if(!keys.length){ol.innerHTML='<p style="text-align:center;color:var(--mut)">لا توجد طلبات بعد.</p>';return;}
  let h='';
  keys.forEach(k=>{
    const v=data[k];
    h+=`<div class="bc" style="margin-bottom:15px;padding:20px;">
      <h3 style="color:var(--acc2)">${v.bn} <span style="font-size:12px;color:var(--mut);float:left">${v.time}</span></h3>
      <p><strong>بواسطة:</strong> ${v.n} | <strong>التواصل:</strong> ${v.c}</p>
      <p><strong>الميزانية:</strong> ${v.cb} | <strong>الدفع:</strong> ${v.pay}</p>
      ${v.d?`<p><strong>التفاصيل:</strong> ${v.d}</p>`:''}
    </div>`;
  });
  ol.innerHTML=h;
}

async function loadUsers(){
  const ul=document.getElementById('pUL'); ul.innerHTML='<div style="text-align:center;padding:20px"><img src="https://api.iconify.design/lucide:loader-2.svg?color=white" class="icon-lang" style="animation: spinIcon 1s linear infinite;"></div>';
  const data=await fbGet('users')||{};
  const keys=Object.keys(data);
  if(!keys.length){ul.innerHTML='<p style="text-align:center;color:var(--mut)">لا يوجد مستخدمين.</p>';return;}
  let h='';
  keys.forEach(k=>{
    const v=data[k];
    h+=`<div class="bc" style="margin-bottom:15px;padding:20px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h4 style="color:var(--grn);margin-bottom:4px">${v.name}</h4>
        <p style="color:var(--mut);font-size:12px">${v.email} | انضم: ${new Date(v.joined).toLocaleDateString('ar-SA')}</p>
      </div>
      <button class="del-btn ripple-element" onclick="delUser('${k}')">حظر / مسح</button>
    </div>`;
  });
  ul.innerHTML=h;
}

async function delUser(k){
  if(confirm('هل أنت متأكد من مسح هذا المستخدم؟')){
    await fbDel(`users/${k}`);
    toast('🗑️ تم مسح المستخدم');
    loadUsers();
  }
}

async function loadDiscounts(){
  const dl=document.getElementById('discList'); dl.innerHTML='<div style="text-align:center;padding:20px"><img src="https://api.iconify.design/lucide:loader-2.svg?color=white" class="icon-lang" style="animation: spinIcon 1s linear infinite;"></div>';
  const data=await fbGet('discounts')||{};
  const keys=Object.keys(data);
  if(!keys.length){dl.innerHTML='<p style="text-align:center;color:var(--mut)">لا توجد أكواد خصم حالية.</p>';return;}
  let h='';
  keys.forEach(k=>{
    const v=data[k];
    h+=`<div class="dc">
      <span>🏷️ ${v.code} — خصم ${v.pct}%</span>
      <button class="del-btn ripple-element" onclick="delDiscount('${k}')"><img src="https://api.iconify.design/lucide:trash-2.svg?color=ef4444" style="width:16px;"> حذف</button>
    </div>`;
  });
  dl.innerHTML=h;
}

async function addDiscount(){
  const code=document.getElementById('discCode').value.trim().toUpperCase();
  const pct=parseInt(document.getElementById('discPct').value);
  if(!code||isNaN(pct)||pct<1||pct>99){toast('⚠️ أدخل كود صحيح ونسبة بين 1 و 99','e');return;}
  
  await fbPush('discounts',{code,pct});
  document.getElementById('discCode').value='';
  document.getElementById('discPct').value='';
  toast(`✅ تم إضافة كود ${code} بخصم ${pct}%`);
  loadDiscounts();
}

async function delDiscount(k){
  await fbDel(`discounts/${k}`);
  toast('🗑️ تم حذف الكود');
  loadDiscounts();
}

// ============================
// TOAST NOTIFICATIONS (Hyper-Realism)
// ============================
function toast(m,t='s'){
  const b=document.getElementById('toast');
  b.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><img src="https://api.iconify.design/lucide:${t==='e'?'alert-circle':'check-circle-2'}.svg?color=white" style="width:20px;"> ${m}</div>`;
  if(t==='e')b.classList.add('e');else b.classList.remove('e');
  b.classList.add('show');
  setTimeout(()=>b.classList.remove('show'),3500);
}
