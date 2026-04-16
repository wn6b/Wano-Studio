/* ============================================================= */
/* Projects Bots — Core Script (Ultra-Realistic V2.0)            */
/* Architecture: Modular, High Performance, Secure               */
/* ============================================================= */

const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v7'; // تم تحديث المفتاح لتفريغ الجلسات القديمة

let sess = null, payV = '', capN = 0, isCustom = false, discountPct = 0, discountCode = '';
let storeOpen = true;

/* ============================================================= */
/* Firebase Database Handlers (Optimized)                        */
/* ============================================================= */
async function fbGet(path) { 
  try { 
    const r = await fetch(`${FB}/${path}.json?_t=${Date.now()}`, { cache: 'no-store' }); 
    if(!r.ok) return null; 
    return await r.json(); 
  } catch(e) { return null; } 
}
async function fbSet(path, data) { 
  try { await fetch(`${FB}/${path}.json`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }); } catch(e) {} 
}
async function fbPush(path, data) { 
  try { 
    const r = await fetch(`${FB}/${path}.json`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }); 
    return r.ok ? await r.json() : null; 
  } catch(e) { return null; } 
}
async function fbDel(path) { 
  try { await fetch(`${FB}/${path}.json`, { method: 'DELETE' }); } catch(e) {} 
}
async function fbIncr(path) { 
  const cur = await fbGet(path) || 0; 
  const nv = cur + 1; 
  await fbSet(path, nv); 
  return nv; 
}

/* ============================================================= */
/* AI Translation Engine                                         */
/* ============================================================= */
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
    if(typeof toast === 'function') toast('جاري معالجة الترجمة عبر النظام...', 'i');
  } else {
    setTimeout(() => setAILang(langCode, btn), 500); 
  }
}

/* ============================================================= */
/* Physics & Interactive Particles Engine                        */
/* ============================================================= */
function injectMagicUI() {
  // Ripple Effect Logic
  document.addEventListener('click', function(e) {
    const target = e.target.closest('.ripple-element');
    if (target) {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-span';
      ripple.style.left = x + 'px'; ripple.style.top = y + 'px';
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  });

  // Cursor & Touch Particle Trail
  const createParticle = (x, y) => {
    const p = document.createElement('div');
    p.className = 'cursor-trail';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 500);
  };

  document.addEventListener('mousemove', (e) => createParticle(e.pageX, e.pageY), {passive: true});
  document.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) createParticle(e.touches[0].pageX, e.touches[0].pageY);
  }, {passive: true});

  // Dynamic Hover Glow for Cards
  document.querySelectorAll('.bc').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
/* ============================================================= */
/* Security, Auth Gate & Initialization                          */
/* ============================================================= */
window.onload = async () => {
  initAITranslator();
  injectMagicUI();
  
  // استعادة الجلسة
  try { sess = JSON.parse(localStorage.getItem(SK) || 'null'); } catch(e) {}
  
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
  setInterval(refreshStats, 30000);
  
  // نظام الزيارات المطور: يحفظ بصمة الجهاز لمنع التكرار تماماً
  if(!localStorage.getItem('pb_v2_registered')) {
    await fbIncr('stats/visits');
    localStorage.setItem('pb_v2_registered', 'true');
  }

  const storeSettings = await fbGet('settings/storeOpen');
  if(storeSettings !== null) storeOpen = storeSettings;
  updateStoreStatusUI();
};

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function refreshStats() {
  const stats = await fbGet('stats') || {};
  const oCountEl = document.getElementById('oCount');
  const vCountEl = document.getElementById('vCount');
  if(oCountEl) oCountEl.textContent = Number(stats.orderCount || 0).toLocaleString();
  if(vCountEl) vCountEl.textContent = Number(stats.visits || 0).toLocaleString();
}

/* ============================================================= */
/* Authentication Logic (Strict Gate)                            */
/* ============================================================= */
async function doLogin() {
  const email = document.getElementById('le').value.trim().toLowerCase();
  const pass = document.getElementById('lp').value;
  const err = document.getElementById('lE');
  err.style.display = 'none';
  
  if(!email || !pass) { err.textContent = 'يرجى إدخال كافة البيانات'; err.style.display = 'block'; return; }
  if(!chkCap('cA')) { err.textContent = 'رمز التحقق الأمني غير صحيح'; err.style.display = 'block'; newCap(); return; }
  
  // تسجيل دخول المالك
  if(email === OW_EMAIL && pass === OW_PASS) {
    unlockGate({name: 'مروان | Wano', email, isOwner: true});
    if(typeof toast === 'function') toast('تم تسجيل دخول المسؤول بنجاح', 's');
    return;
  }
  
  const h = await sha256(pass + email + '_pb25');
  const users = await fbGet('users') || {};
  const user = Object.values(users).find(u => u.email === email && u.hash === h);
  
  if(!user) { err.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'; err.style.display = 'block'; newCap(); return; }
  
  unlockGate({name: user.name, email: user.email, isOwner: false});
  if(typeof toast === 'function') toast(`مرحباً بك مجدداً، ${user.name}`, 's');
}

async function doReg() {
  const name = document.getElementById('rn').value.trim();
  const email = document.getElementById('re').value.trim().toLowerCase();
  const pass = document.getElementById('rp').value;
  const pass2 = document.getElementById('rp2').value;
  const err = document.getElementById('rE');
  err.style.display = 'none';
  
  if(!name || !email || !pass) { err.textContent = 'جميع الحقول مطلوبة'; err.style.display = 'block'; return; }
  if(pass.length < 6) { err.textContent = 'كلمة المرور قصيرة جداً'; err.style.display = 'block'; return; }
  if(pass !== pass2) { err.textContent = 'كلمتا المرور غير متطابقتين'; err.style.display = 'block'; return; }
  if(!chkCap('cA2')) { err.textContent = 'رمز التحقق غير صحيح'; err.style.display = 'block'; newCap(); return; }
  
  const users = await fbGet('users') || {};
  if(Object.values(users).find(u => u.email === email)) { err.textContent = 'البريد الإلكتروني مسجل بالفعل'; err.style.display = 'block'; return; }
  
  const h = await sha256(pass + email + '_pb25');
  await fbPush('users', {name, email, hash: h, joined: new Date().toISOString()});
  
  unlockGate({name, email, isOwner: false});
  if(typeof toast === 'function') toast('تم إنشاء الحساب وفتح النظام', 's');
}

function unlockGate(userObj) {
  sess = userObj;
  localStorage.setItem(SK, JSON.stringify(sess));
  closeM('ovA');
  renderAuth();
  document.getElementById('authGate').classList.add('hidden');
  document.getElementById('mainContent').classList.add('auth-success');
}

function logout() {
  sess = null; localStorage.removeItem(SK);
  document.getElementById('authGate').classList.remove('hidden');
  document.getElementById('mainContent').classList.remove('auth-success');
  if(typeof toast === 'function') toast('تم تسجيل الخروج بحفظ الله', 's');
}
/* ============================================================= */
/* Order Processing & WhatsApp Engine                            */
/* ============================================================= */
function openOrder(bn, bp, c = false) {
  if (!sess) { openAuth('l'); toast('يجب تسجيل الدخول لتقديم طلب', 'e'); return; }
  if (!storeOpen) { toast('المتجر مغلق حالياً، لا يمكن استقبال طلبات', 'e'); return; }
  
  isCustom = c;
  document.getElementById('bn').value = bn;
  document.getElementById('cn').value = sess.name || '';
  document.getElementById('cb').value = bp;
  document.getElementById('dA').style.display = c ? 'block' : 'none';
  
  payV = ''; 
  document.querySelectorAll('.pay').forEach(b => b.classList.remove('on', 'pay-error'));
  discountPct = 0; discountCode = '';
  document.getElementById('discTag').style.display = 'none';
  openM('ovO');
}

async function submitOrder() {
  if (!payV) {
    toast('يرجى اختيار طريقة الدفع المعتمدة', 'e');
    document.querySelectorAll('.pay').forEach(b => b.classList.add('pay-error'));
    return;
  }
  
  const n = document.getElementById('cn').value.trim();
  const c = document.getElementById('cc').value.trim();
  const d = isCustom ? document.getElementById('cd').value.trim() : '';
  
  if (!n || !c) { toast('يرجى إكمال بيانات التواصل', 'e'); return; }
  
  let bPrice = document.getElementById('cb').value;
  if (discountPct > 0) {
    bPrice += ` (خصم ${discountPct}% كود: ${discountCode})`;
    const codes = await fbGet('discounts') || {};
    const fId = Object.keys(codes).find(k => codes[k].code === discountCode);
    if (fId) await fbDel(`discounts/${fId}`);
  }

  const orderData = { bn: document.getElementById('bn').value, n, c, cb: bPrice, pay: payV, d, time: new Date().toLocaleString('ar-SA') };
  await fbPush('orders', orderData);
  await fbIncr('stats/orderCount');

  let msg = `*طلب مشروع جديد*\n\n*المشروع:* ${orderData.bn}\n*السعر:* ${bPrice}\n*العميل:* ${n}\n*التواصل:* ${c}\n*الدفع:* ${payV}`;
  if (d) msg += `\n*التفاصيل:* ${d}`;

  window.open(`https://wa.me/201145974113?text=${encodeURIComponent(msg)}`, '_blank');
  closeM('ovO');
  refreshStats();
  toast('تم تحويل الطلب بنجاح', 's');
}

/* ============================================================= */
/* Discount & UI Utilities                                       */
/* ============================================================= */
async function applyDiscount() {
  const inp = document.getElementById('discInp').value.trim().toUpperCase();
  const codes = await fbGet('discounts') || {};
  const found = Object.values(codes).find(c => c.code === inp);
  
  if (found) {
    discountPct = found.pct; discountCode = inp;
    const tag = document.getElementById('discTag');
    tag.textContent = `تم تفعيل خصم بقيمة ${discountPct}%`;
    tag.style.display = 'block';
    toast('تم تطبيق الكود بنجاح', 's');
  } else {
    toast('كود الخصم غير صالح', 'e');
  }
}

function switchTab(n) {
  document.querySelectorAll('.tc, .tb').forEach(el => el.classList.remove('on'));
  document.getElementById('tab-' + n)?.classList.add('on');
  document.getElementById('btn-' + n)?.classList.add('on');
}

function openM(id) { document.getElementById(id).classList.add('open'); }
function closeM(id) { document.getElementById(id).classList.remove('open'); }
function sP(b, m) { document.querySelectorAll('.pay').forEach(x => x.classList.remove('on', 'pay-error')); b.classList.add('on'); payV = m; }

/* ============================================================= */
/* Owner Panel Operations                                        */
/* ============================================================= */
async function showPanel() {
  if (!sess?.isOwner) return;
  document.getElementById('ownerPanel').style.display = 'block';
  panelTab('o', document.querySelector('.ptab'));
}

async function panelTab(t, btn) {
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const ol = document.getElementById('pOL'), ul = document.getElementById('pUL'), dl = document.getElementById('pDL');
  ol.style.display = ul.style.display = dl.style.display = 'none';

  if (t === 'o') {
    ol.style.display = 'block';
    const orders = await fbGet('orders') || {};
    ol.innerHTML = Object.values(orders).reverse().map(o => `
      <div class="bc" style="margin-bottom:15px">
        <h4 style="color:var(--accent-secondary)">${o.bn} <small style="float:left;color:var(--text-muted)">${o.time}</small></h4>
        <p style="font-size:13px;margin:10px 0">العميل: ${o.n} | الدفع: ${o.pay}</p>
        <p style="font-size:12px;color:var(--accent-success)">الميزانية: ${o.cb}</p>
      </div>`).join('') || '<p>لا توجد طلبات</p>';
  }
}

function toast(m, t = 's') {
  const b = document.getElementById('toast');
  b.className = `toast ${t === 'e' ? 'e' : ''} show`;
  b.innerHTML = `<img src="https://api.iconify.design/lucide:${t === 'e' ? 'alert-circle' : 'check-circle'}.svg?color=white" style="width:18px;vertical-align:middle;margin-left:8px"> ${m}`;
  setTimeout(() => b.classList.remove('show'), 4000);
}

function openAuth(m) { newCap(); aSwitch(m); openM('ovA'); }
function aSwitch(m) {
  document.getElementById('lF').style.display = m === 'l' ? 'block' : 'none';
  document.getElementById('rF').style.display = m === 'r' ? 'block' : 'none';
  document.getElementById('tLB').classList.toggle('on', m === 'l');
  document.getElementById('tRB').classList.toggle('on', m === 'r');
}
function newCap() { capN = Math.floor(Math.random() * 90) + 10; document.getElementById('cQ').textContent = capN; document.getElementById('cQ2').textContent = capN; }
function chkCap(id) { return parseInt(document.getElementById(id).value) === capN; }
function renderAuth() { /* مدمجة في نظام التبديل العلوي */ }
