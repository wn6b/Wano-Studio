/* ============================================================= */
/* Projects Bots — Advanced Script (1,000,000% Realism)          */
/* ============================================================= */

const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v6';

let sess = null, payV = '', capN = 0, isCustom = false, discountPct = 0, discountCode = '';
let storeOpen = true;

/* ============================ */
/* Google Translate AI          */
/* ============================ */
function initAITranslator() {
  const script = document.createElement('script');
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(script);
  
  const div = document.createElement('div');
  div.id = 'google_translate_element';
  div.style.display = 'none';
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
    if(typeof toast === 'function') toast('جاري الترجمة عبر النظام الاصطناعي...', 'i');
  } else {
    setTimeout(() => setAILang(langCode, btn), 500); 
  }
}

/* ============================ */
/* Interactive Particles & UI   */
/* ============================ */
function injectMagicUI() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        entry.target.classList.remove('reveal-down', 'reveal-up');
      } else {
        entry.target.classList.remove('reveal-visible');
        if (entry.boundingClientRect.top > 0) {
          entry.target.classList.add('reveal-down');
        } else {
          entry.target.classList.add('reveal-up');
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
      setTimeout(() => ripple.remove(), 500);
    }
  });

  const createParticle = (x, y) => {
    const p = document.createElement('div');
    p.className = 'cursor-trail';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  };

  document.addEventListener('mousemove', (e) => createParticle(e.pageX, e.pageY));
  document.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) createParticle(e.touches[0].pageX, e.touches[0].pageY);
  }, {passive: true});
}
/* ============================ */
/* Firebase Helpers             */
/* ============================ */
async function fbGet(path){ try{ const r=await fetch(`${FB}/${path}.json?_t=${Date.now()}`, { cache: 'no-store' }); if(!r.ok)return null; return await r.json(); }catch(e){return null;} }
async function fbSet(path,data){ try{await fetch(`${FB}/${path}.json`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}catch(e){} }
async function fbPush(path,data){ try{ const r=await fetch(`${FB}/${path}.json`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); return r.ok?await r.json():null; }catch(e){return null;} }
async function fbDel(path){ try{await fetch(`${FB}/${path}.json`,{method:'DELETE'});}catch(e){} }
async function fbIncr(path){ const cur=await fbGet(path)||0; const nv=cur+1; await fbSet(path,nv); return nv; }

/* ============================ */
/* Initialization & Auth Gate   */
/* ============================ */
window.onload=async()=>{
  initAITranslator();
  injectMagicUI();
  
  try{sess=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){}
  
  const gate = document.getElementById('authGate');
  const main = document.getElementById('mainContent');
  
  if(sess) {
    gate.classList.add('hidden');
    main.classList.add('auth-success');
    renderAuth();
  } else {
    gate.classList.remove('hidden');
    main.classList.remove('auth-success');
  }

  newCap();
  refreshStats();
  setInterval(refreshStats, 20000);
  
  // نظام تسجيل الزيارات المتقدم (حفظ الجهاز بشكل دائم لعدم تكرار الزيارة)
  if(!localStorage.getItem('device_registered_pb')) {
    await fbIncr('stats/visits');
    localStorage.setItem('device_registered_pb', 'true');
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
/* ============================ */
/* Store Status & Security      */
/* ============================ */
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
      btn.innerHTML = '<img src="https://api.iconify.design/lucide:lock.svg?color=white" style="width:16px; margin-left:6px; vertical-align:middle;" alt=""> مغلق حالياً';
    } else {
      btn.disabled = !storeOpen;
      if(!storeOpen) {
        btn.innerHTML = '<img src="https://api.iconify.design/lucide:lock.svg?color=white" style="width:16px; margin-left:6px; vertical-align:middle;" alt=""> مغلق حالياً';
      } else {
        const isCustomBtn = btn.closest('.sp') !== null;
        btn.innerHTML = isCustomBtn ? '<img src="https://api.iconify.design/lucide:wand-2.svg?color=white" style="width:16px; margin-left:6px; vertical-align:middle;" alt=""> اطلب بوتك المخصص' : '<img src="https://api.iconify.design/lucide:shopping-cart.svg?color=white" style="width:16px; margin-left:6px; vertical-align:middle;" alt=""> اطلب الآن';
      }
    }
  });
}

async function toggleStoreStatus(){
  if(!sess?.isOwner) return;
  storeOpen = !storeOpen;
  await fbSet('settings/storeOpen', storeOpen);
  updateStoreStatusUI();
  if(typeof toast === 'function') toast(storeOpen ? 'تم فتح المتجر بنجاح' : 'تم إغلاق المتجر وإيقاف الطلبات', storeOpen ? 's' : 'e');
}

async function sha256(s){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/* ============================ */
/* Auth Rendering & Gates       */
/* ============================ */
function renderAuth(){
  const area=document.getElementById('authArea');
  if(sess){
    const isOw=sess.isOwner;
    area.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      ${isOw?`<button class="abtn ripple-element" style="font-size:12px;padding:6px 14px;border-color:rgba(245,158,11,.4);color:var(--ow);background:rgba(245,158,11,.1);box-shadow: 0 0 15px rgba(245,158,11,0.2);" onclick="showPanel()"><img src="https://api.iconify.design/lucide:settings.svg?color=f59e0b" style="width:16px; margin-left:4px; vertical-align:middle;" alt=""> لوحة المالك</button>`:''}
      <div class="uchip${isOw?' ow':''}"><img src="${isOw?'https://api.iconify.design/lucide:crown.svg?color=ffffff':'https://api.iconify.design/lucide:user.svg?color=ffffff'}" style="width:14px; margin-left:4px; vertical-align:middle;" alt=""> ${sess.name}<button class="lo ripple-element" onclick="logout()"><img src="https://api.iconify.design/lucide:log-out.svg?color=ef4444" style="width:16px;" alt=""></button></div>
    </div>`;
  }
}

function logout(){
  sess=null; localStorage.removeItem(SK);
  document.getElementById('ownerPanel').style.display='none';
  
  document.getElementById('authGate').classList.remove('hidden');
  document.getElementById('mainContent').classList.remove('auth-success');
  
  if(typeof toast === 'function') toast('تم تسجيل الخروج من النظام', 's');
}

function unlockGate(userObj) {
  sess = userObj;
  localStorage.setItem(SK, JSON.stringify(sess));
  if(typeof closeM === 'function') closeM('ovA');
  renderAuth();
  
  document.getElementById('authGate').classList.add('hidden');
  document.getElementById('mainContent').classList.add('auth-success');
}
/* ============================ */
/* Security Captcha System      */
/* ============================ */
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

/* ============================ */
/* Authentication Operations    */
/* ============================ */
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
  
  if(!email||!pass){err.textContent='يرجى إدخال البريد الإلكتروني وكلمة المرور';err.classList.add('show');return;}
  if(!chkCap('cA')){err.textContent='إجابة التحقق الأمني خاطئة';err.classList.add('show');newCap();return;}
  
  if(email===OW_EMAIL&&pass===OW_PASS){
    unlockGate({name:'مروان | Wano',email,isOwner:true});
    updateStoreStatusUI();
    if(typeof toast === 'function') toast('مرحباً بك في لوحة تحكم الإدارة', 's');
    return;
  }
  
  const h=await sha256(pass+email+'_pb25');
  const users=await fbGet('users')||{};
  const user=Object.values(users).find(u=>u.email===email&&u.hash===h);
  
  if(!user){err.textContent='البيانات المدخلة غير صحيحة';err.classList.add('show');newCap();return;}
  
  unlockGate({name:user.name,email:user.email,isOwner:false});
  if(typeof toast === 'function') toast(`مرحباً بعودتك، ${user.name}`, 's');
}

async function doReg(){
  const name=document.getElementById('rn').value.trim();
  const email=document.getElementById('re').value.trim().toLowerCase();
  const pass=document.getElementById('rp').value;
  const pass2=document.getElementById('rp2').value;
  const err=document.getElementById('rE');
  err.classList.remove('show');
  
  if(!name||!email||!pass){err.textContent='جميع الحقول مطلوبة';err.classList.add('show');return;}
  if(!email.includes('@')||!email.includes('.')){err.textContent='صيغة البريد الإلكتروني غير صحيحة';err.classList.add('show');return;}
  if(pass.length<6){err.textContent='كلمة المرور يجب أن تتجاوز 6 أحرف';err.classList.add('show');return;}
  if(pass!==pass2){err.textContent='كلمتا المرور غير متطابقتين';err.classList.add('show');return;}
  if(!chkCap('cA2')){err.textContent='إجابة التحقق الأمني خاطئة';err.classList.add('show');newCap();return;}
  
  const users=await fbGet('users')||{};
  if(Object.values(users).find(u=>u.email===email)){err.textContent='البريد الإلكتروني مسجل مسبقاً';err.classList.add('show');return;}
  
  const h=await sha256(pass+email+'_pb25');
  await fbPush('users',{name,email,hash:h,device:navigator.userAgent,joined:new Date().toISOString()});
  
  unlockGate({name,email,isOwner:(email===OW_EMAIL&&pass===OW_PASS)});
  if(typeof toast === 'function') toast(`تم إنشاء حسابك بنجاح، ${name}`, 's');
}

/* ============================ */
/* Dynamic Tab Navigation       */
/* ============================ */
function switchTab(n){
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  
  const el = document.getElementById('tab-'+n);
  const btn = document.getElementById('btn-'+n);
  
  if(el) el.classList.add('on');
  if(btn) btn.classList.add('on');
}
/* ============================ */
/* Modals UI & Order Management */
/* ============================ */
function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}

function openOrder(bn,bp,c=false){
  if(!sess){
    openAuth('l'); 
    if(typeof toast === 'function') toast('يجب تسجيل الدخول لتقديم الطلب', 'e'); 
    return;
  }
  if(!storeOpen){ 
    if(typeof toast === 'function') toast('المتجر مغلق حالياً، لا يمكن استقبال طلبات جديدة', 'e'); 
    return;
  }
  
  isCustom=c;
  document.getElementById('bn').value=bn;
  document.getElementById('cn').value=sess.name||'';
  document.getElementById('cc').value='';
  document.getElementById('cb').value=bp;
  document.getElementById('dA').style.display=c?'block':'none';
  document.getElementById('cd').value='';
  
  payV=''; 
  document.querySelectorAll('.pay').forEach(b=>{b.classList.remove('on','pay-error');});
  
  discountPct=0; discountCode='';
  document.getElementById('discInp').value='';
  document.getElementById('discTag').style.display='none';
  
  openM('ovO');
}

function sP(b,m){
  document.querySelectorAll('.pay').forEach(x=>x.classList.remove('on','pay-error'));
  b.classList.add('on'); payV=m;
}

/* ============================ */
/* Secure Discount System       */
/* ============================ */
async function applyDiscount(){
  const inp=document.getElementById('discInp').value.trim().toUpperCase();
  if(!inp){ if(typeof toast === 'function') toast('يرجى إدخال كود الخصم أولاً', 'e'); return;}
  
  const codes=await fbGet('discounts')||{};
  const foundId=Object.keys(codes).find(k=>codes[k].code===inp);
  
  if(!foundId){ if(typeof toast === 'function') toast('الكود غير صحيح أو تم استخدامه مسبقاً', 'e'); return;}
  
  discountPct=codes[foundId].pct;
  discountCode=inp;
  const tag=document.getElementById('discTag');
  tag.textContent=`تم تفعيل خصم ${discountPct}% بنجاح`;
  tag.style.display='block';
  if(typeof toast === 'function') toast('تم تطبيق الخصم على الطلب بنجاح', 's');
}

async function burnDiscountCode(codeStr){
  const codes=await fbGet('discounts')||{};
  const foundId=Object.keys(codes).find(k=>codes[k].code===codeStr);
  if(foundId) await fbDel(`discounts/${foundId}`);
}
/* ============================ */
/* Order Submission & WhatsApp  */
/* ============================ */
async function submitOrder(){
  if(!payV){
    if(typeof toast === 'function') toast('يجب اختيار طريقة الدفع لإتمام الطلب','e');
    document.querySelectorAll('.pay').forEach(b=>b.classList.add('pay-error'));
    return;
  }
  
  const n=document.getElementById('cn').value.trim();
  const c=document.getElementById('cc').value.trim();
  const d=isCustom?document.getElementById('cd').value.trim():'';
  if(!n||!c){if(typeof toast === 'function') toast('يرجى إدخال الاسم وبيانات التواصل','e');return;}
  if(isCustom&&!d){if(typeof toast === 'function') toast('يرجى كتابة تفاصيل المشروع بوضوح','e');return;}

  const bName=document.getElementById('bn').value;
  let bPrice=document.getElementById('cb').value;
  
  if(discountPct>0){
    bPrice+=` (خصم ${discountPct}% عبر الكود ${discountCode})`;
    await burnDiscountCode(discountCode); 
  }

  const o={bn:bName,n,c,cb:bPrice,pay:payV,d,time:new Date().toLocaleString('ar-SA')};
  await fbPush('orders',o);
  await fbIncr('stats/orderCount');

  let t=`*طلب مشروع جديد*\n\n*المشروع:* ${bName}\n*الميزانية:* ${bPrice}\n*طريقة الدفع:* ${payV}\n*الاسم:* ${n}\n*التواصل:* ${c}`;
  if(isCustom) t+=`\n*التفاصيل:* ${d}`;
  t+=`\n\n*Projects Bots System*`;

  window.open(`https://wa.me/201145974113?text=${encodeURIComponent(t)}`,'_blank');
  closeM('ovO');
  refreshStats();
  if(typeof toast === 'function') toast('تم تحويل الطلب بنجاح', 's');
}

/* ============================ */
/* Owner Control Panel          */
/* ============================ */
async function showPanel(){
  if(!sess?.isOwner){if(typeof toast === 'function') toast('صلاحيات وصول مرفوضة','e');return;}
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
  const ol=document.getElementById('pOL'); ol.innerHTML='<div style="text-align:center;padding:20px"><img src="https://api.iconify.design/lucide:loader-2.svg?color=white" style="animation: spinIcon 1s linear infinite; width: 30px;" alt=""></div>';
  const data=await fbGet('orders')||{};
  const keys=Object.keys(data).reverse();
  if(!keys.length){ol.innerHTML='<p style="text-align:center;color:var(--mut)">لا توجد طلبات مسجلة.</p>';return;}
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
  const ul=document.getElementById('pUL'); ul.innerHTML='<div style="text-align:center;padding:20px"><img src="https://api.iconify.design/lucide:loader-2.svg?color=white" style="animation: spinIcon 1s linear infinite; width: 30px;" alt=""></div>';
  const data=await fbGet('users')||{};
  const keys=Object.keys(data);
  if(!keys.length){ul.innerHTML='<p style="text-align:center;color:var(--mut)">لا يوجد مستخدمون مسجلون.</p>';return;}
  let h='';
  keys.forEach(k=>{
    const v=data[k];
    h+=`<div class="bc" style="margin-bottom:15px;padding:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <div>
        <h4 style="color:var(--grn);margin-bottom:4px">${v.name}</h4>
        <p style="color:var(--mut);font-size:12px">${v.email} | تاريخ الانضمام: ${new Date(v.joined).toLocaleDateString('ar-SA')}</p>
      </div>
      <button class="del-btn ripple-element" onclick="delUser('${k}')"><img src="https://api.iconify.design/lucide:trash-2.svg?color=ef4444" style="width:16px; margin-left:6px; vertical-align:middle;" alt=""> مسح المستخدم</button>
    </div>`;
  });
  ul.innerHTML=h;
}

async function delUser(k){
  if(confirm('تأكيد مسح هذا المستخدم من النظام؟')){
    await fbDel(`users/${k}`);
    if(typeof toast === 'function') toast('تم مسح بيانات المستخدم');
    loadUsers();
  }
}

async function loadDiscounts(){
  const dl=document.getElementById('discList'); dl.innerHTML='<div style="text-align:center;padding:20px"><img src="https://api.iconify.design/lucide:loader-2.svg?color=white" style="animation: spinIcon 1s linear infinite; width: 30px;" alt=""></div>';
  const data=await fbGet('discounts')||{};
  const keys=Object.keys(data);
  if(!keys.length){dl.innerHTML='<p style="text-align:center;color:var(--mut)">لا توجد أكواد خصم نشطة.</p>';return;}
  let h='';
  keys.forEach(k=>{
    const v=data[k];
    h+=`<div class="dc">
      <span><img src="https://api.iconify.design/lucide:tag.svg?color=white" style="width:14px; vertical-align:middle;" alt=""> ${v.code} — خصم ${v.pct}%</span>
      <button class="del-btn ripple-element" onclick="delDiscount('${k}')"><img src="https://api.iconify.design/lucide:trash-2.svg?color=ef4444" style="width:16px;" alt=""> حذف</button>
    </div>`;
  });
  dl.innerHTML=h;
}

async function addDiscount(){
  const code=document.getElementById('discCode').value.trim().toUpperCase();
  const pct=parseInt(document.getElementById('discPct').value);
  if(!code||isNaN(pct)||pct<1||pct>99){if(typeof toast === 'function') toast('يرجى إدخال بيانات الكود والنسبة بشكل صحيح','e');return;}
  
  await fbPush('discounts',{code,pct});
  document.getElementById('discCode').value='';
  document.getElementById('discPct').value='';
  if(typeof toast === 'function') toast(`تم تفعيل الكود ${code} بنسبة ${pct}%`, 's');
  loadDiscounts();
}

async function delDiscount(k){
  await fbDel(`discounts/${k}`);
  if(typeof toast === 'function') toast('تم حذف الكود');
  loadDiscounts();
}

/* ============================ */
/* System Notifications (Toast) */
/* ============================ */
function toast(m,t='s'){
  const b=document.getElementById('toast');
  b.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><img src="https://api.iconify.design/lucide:${t==='e'?'alert-circle':'check-circle-2'}.svg?color=white" style="width:20px;" alt=""> ${m}</div>`;
  if(t==='e')b.classList.add('e');else b.classList.remove('e');
  b.classList.add('show');
  setTimeout(()=>b.classList.remove('show'),3500);
}
