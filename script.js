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
