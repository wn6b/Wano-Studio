// ============================
// Firebase Realtime Database & Core
// ============================
const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v5';

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
  div.style.display = 'none'; // نخفي شريط جوجل البشع
  document.body.appendChild(div);
}

window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({pageLanguage: 'ar', autoDisplay: false}, 'google_translate_element');
};

function setAILang(langCode, btn) {
  document.querySelectorAll('.lb').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
    toast('🤖 جاري الترجمة عبر الذكاء الاصطناعي...');
  } else {
    // إذا كان النت ضعيف والمترجم لسه ما حمل
    setTimeout(() => setAILang(langCode, btn), 500); 
  }
}

// ============================
// 3D Scroll & Ripple Effects 🚀
// ============================
function injectMagicUI() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        entry.target.classList.remove('reveal-down', 'reveal-up');
      } else {
        entry.target.classList.remove('reveal-visible');
        // تفاعل ذكي: إذا كان العنصر تحت الشاشة يظهر من تحت، وإذا فوق يظهر من فوق
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
    document.querySelectorAll('.bc, .ac, .owc').forEach(el => {
      el.classList.add('reveal-el', 'reveal-down');
      observer.observe(el);
    });
    applyRippleEffect();
  }, 500);
}

function applyRippleEffect() {
  document.querySelectorAll('.bp, .ob, .send, .add-disc-row button, .pay').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      const ripple = document.createElement('span');
      ripple.style.left = x + 'px'; ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
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
// Init, Store Status & Visits
// ============================
window.onload=async()=>{
  initAITranslator();
  injectMagicUI();
  
  try{sess=JSON.parse(localStorage.getItem(SK)||'null');}catch(e){}
  renderAuth();
  newCap();
  
  // تحديث عداد الطلبات والزيارات
  refreshStats();
  setInterval(refreshStats, 20000);
  
  // تسجيل زيارة جديدة
  if(!sessionStorage.getItem('visited_pb')){
    await fbIncr('stats/visits');
    sessionStorage.setItem('visited_pb','1');
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
    if(storeOpen) {
      badge.classList.remove('closed');
    } else {
      badge.classList.add('closed');
    }
  }
  
  document.querySelectorAll('.ob').forEach(btn => {
    if(btn.closest('.bc').classList.contains('dis')){
      btn.disabled = true;
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
  if(!sess?.isOwner) return; // مخفي ومحمي للمالك فقط
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
// Auth Render & Logic
// ============================
function renderAuth(){
  const area=document.getElementById('authArea');
  if(sess){
    const isOw=sess.isOwner;
    area.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      ${isOw?`<button class="abtn" style="font-size:11px;padding:4px 12px;border-color:rgba(245,158,11,.4);color:var(--ow);background:rgba(245,158,11,.1);box-shadow: 0 0 15px rgba(245,158,11,0.2);" onclick="showPanel()">⚙️ لوحة المالك</button>`:''}
      <div class="uchip${isOw?' ow':''}">${isOw?'👑':'👤'} ${sess.name}<button class="lo" onclick="logout()">✕</button></div>
    </div>`;
  }else{
    area.innerHTML=`<div class="abtns">
      <button class="abtn ripple-element" onclick="openAuth('l')">تسجيل دخول</button>
      <button class="abtn pr ripple-element" onclick="openAuth('r')">إنشاء حساب</button>
    </div>`;
  }
}

function logout(){
  sess=null;localStorage.removeItem(SK);
  document.getElementById('ownerPanel').style.display='none';
  renderAuth();
  toast('تم تسجيل الخروج ✌🏻');
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
    sess={name:'مروان | Wano',email,isOwner:true};
    localStorage.setItem(SK,JSON.stringify(sess));
    closeM('ovA');renderAuth();
    updateStoreStatusUI();
    toast('👑 أهلاً بالمدير مروان!');return;
  }
  
  // Normal user login
  const h=await sha256(pass+email+'_pb25');
  const users=await fbGet('users')||{};
  const user=Object.values(users).find(u=>u.email===email&&u.hash===h);
  
  if(!user){err.textContent='❌ الإيميل أو الباسورد غلط!';err.classList.add('show');newCap();return;}
  
  sess={name:user.name,email:user.email,isOwner:false};
  localStorage.setItem(SK,JSON.stringify(sess));
  closeM('ovA');renderAuth();
  toast(`✅ أهلاً بيك ${user.name}!`);
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
  
  sess={name,email,isOwner:(email===OW_EMAIL&&pass===OW_PASS)};
  localStorage.setItem(SK,JSON.stringify(sess));
  closeM('ovA');renderAuth();
  toast(`🎉 نورتنا يا ${name}!`);
}
// ============================
// Discount (Per-User Limit)
// ============================
async function applyDiscount(){
  if(!sess){toast('⚠️ يرجى انشاء حساب أولاً لتتمكن من استخدام الكود',true);return;}
  const code=document.getElementById('discInp').value.trim().toUpperCase();
  if(!code){toast('⚠️ أدخل الكود',true);return;}
  
  const safeEmail = sess.email.replace(/\./g, '_');
  const alreadyUsed = await fbGet(`used_discounts/${safeEmail}/${code}`);
  if(alreadyUsed){toast('❌ استخدمت هذا الكود من قبل، بطل طمع يا وحش!',true);return;}
  
  const discounts=await fbGet('discounts')||{};
  const entry=Object.values(discounts).find(d=>d.code===code);
  if(!entry){toast('❌ الكود غير صحيح',true);return;}
  
  discountPct=entry.pct; discountCode=code;
  const tag=document.getElementById('discTag');
  tag.textContent=`✅ خصم ${discountPct}% — كود: ${code}`;
  tag.style.display='block';
  toast(`🎉 تم تطبيق الخصم ${discountPct}%`);
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
// Order System (Mandatory Payment 🔥)
// ============================
function openOrder(bot,price,custom=false){
  isCustom=custom;
  discountPct=0;discountCode='';
  document.getElementById('bn').value=bot;
  document.getElementById('cb').value=price.includes('حسب')?'':price;
  document.getElementById('discInp').value='';
  document.getElementById('discTag').style.display='none';
  ['cn','cc','cd'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  
  document.querySelectorAll('.pay').forEach(b=>{
    b.classList.remove('on');
    b.classList.remove('pay-error'); // تصفير الأخطاء
  });
  payV='';
  document.getElementById('dA').style.display=custom?'block':'none';
  if(sess?.name)document.getElementById('cn').value=sess.name;
  openM('ovO');
}

function sP(btn,m){
  document.querySelectorAll('.pay').forEach(b=>{
    b.classList.remove('on');
    b.classList.remove('pay-error');
  });
  btn.classList.add('on');
  payV=m;
}

async function submitOrder(){
  const bot=document.getElementById('bn').value;
  const name=document.getElementById('cn').value.trim();
  const con=document.getElementById('cc').value.trim();
  const desc=isCustom?document.getElementById('cd').value.trim():'—';
  const bud=document.getElementById('cb').value.trim();
  
  if(!name||!con){toast('⚠️ يرجى إدخال اسمك وطريقة التواصل',true);return;}
  if(isCustom&&!document.getElementById('cd').value.trim()){toast('⚠️ اشرح ما تريده بالتفصيل',true);return;}

  // 🔥 الإجبار على طريقة الدفع (لن يمر الطلب بدونها)
  if(!payV){
    toast('❌ يرجى اختيار طريقة الدفع أولاً!',true);
    document.querySelectorAll('.pay').forEach(b => b.classList.add('pay-error'));
    setTimeout(() => {
      document.querySelectorAll('.pay').forEach(b => b.classList.remove('pay-error'));
    }, 500); // مدة الاهتزاز
    return;
  }

  // تسجيل الطلب بالداتا بيس
  await fbPush('orders',{
    bot,name,contact:con,desc,budget:bud,
    pay:payV, discount:discountCode||'—', discountPct:discountPct||0,
    date:new Date().toLocaleString('ar-EG'),
    user:sess?.email||'guest', device:navigator.userAgent
  });
  
  // حرق الكود للمستخدم الحالي بعد إرسال الطلب
  if(discountCode && sess){
    const safeEmail = sess.email.replace(/\./g, '_');
    await fbSet(`used_discounts/${safeEmail}/${discountCode}`, true);
  }

  await fbIncr('stats/orderCount');
  refreshStats();

  const discLine=discountCode?`\n🏷️ *كود الخصم:* ${discountCode} (${discountPct}% خصم)`:'';
  const msg=`🤖 *طلب جديد - Projects Bots*\n\n📦 *البوت:* ${bot}\n👤 *الاسم:* ${name}\n📞 *التواصل:* ${con}\n💰 *الميزانية:* ${bud||'—'}\n💳 *الدفع:* ${payV}${discLine}${isCustom&&desc&&desc!=='—'?'\n\n📝 *الوصف:*\n'+desc:''}\n\n_من موقع Projects Bots_`;
  window.open('https://wa.me/201145974113?text='+encodeURIComponent(msg),'_blank');
  
  closeM('ovO');
  toast('✅ تم تحويلك للواتساب لإتمام الطلب!');
  discountCode=''; discountPct=0;
}

// ============================
// Owner Panel (Holographic Reveal)
// ============================
async function showPanel(){
  if(!sess?.isOwner)return;
  const panel=document.getElementById('ownerPanel');
  panel.style.display='block';
  
  // أنيميشن الانبثاق
  setTimeout(() => { panel.classList.add('reveal-el', 'reveal-visible'); }, 50);
  
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
    ?orders.slice().reverse().map(o=>`<div class="pc reveal-el reveal-visible"><h4>📦 ${o.bot} — ${o.date}</h4><p>👤 <strong>${o.name}</strong> | 📞 <strong>${o.contact}</strong><br>💰 <strong>${o.budget||'—'}</strong> | 💳 <strong>${o.pay||'—'}</strong>${o.discount&&o.discount!=='—'?` | 🏷️ <strong>${o.discount} (${o.discountPct}%)</strong>`:''}<br>📱 <span style="font-size:10px">${(o.device||'').substring(0,90)}</span>${o.desc&&o.desc!=='—'?'<br>📝 '+o.desc:''}</p></div>`).join('')
    :'<p style="color:var(--mut);text-align:center;padding:16px">لا توجد طلبات</p>';

  document.getElementById('pUL').innerHTML=users.length
    ?users.map(u=>{
      const isOw=u.email===OW_EMAIL;
      const dt=u.joined?new Date(u.joined).toLocaleString('ar-EG',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
      return `<div class="uc reveal-el reveal-visible"><div class="ua">${isOw?'👑':'👤'}</div><div class="ui"><h4>${u.name} <span class="utg ${isOw?'ow':'us'}">${isOw?'👑 Owner':'عضو'}</span></h4><p>📧 ${u.email}<br>🔒 <span style="font-family:monospace;font-size:10px">${(u.hash||'').substring(0,40)}…</span><br>📱 <span style="font-size:10px">${(u.device||'').substring(0,80)}</span><br>📅 ${dt}</p></div></div>`;
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
// Tabs, Modals & UI Helpers
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
// Toast Notification
// ============================
function toast(msg,isErr){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.className='toast'+(isErr?' e':'');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3200);
}
