const OWNER_EMAIL = 'waylalyzydy51@gmail.com';
const OWNER_HASH = hashStr('f!2HgJv#)"E"y^i' + OWNER_EMAIL);
let session = null; let selPayVal = ''; let captchaAns = 0; let isCustom = false; let currentLang = 'ar';

window.onload = () => {
  try { session = JSON.parse(localStorage.getItem('pb_sess') || 'null'); } catch(e) {}
  let v = parseInt(localStorage.getItem('pb_visits') || '0') + 1;
  localStorage.setItem('pb_visits', v);
  if(document.getElementById('visitCount')) document.getElementById('visitCount').textContent = v.toLocaleString();
  updateOrderCount(); renderAuth(); newCaptcha();
};

function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; }
  return h.toString(36) + '_pb25';
}

function getUsers() { try { return JSON.parse(localStorage.getItem('pb_users') || '[]'); } catch(e) { return []; } }
function saveUsers(u) { localStorage.setItem('pb_users', JSON.stringify(u)); }
function getOrders() { try { return JSON.parse(localStorage.getItem('pb_orders') || '[]'); } catch(e) { return []; } }
function saveOrders(o) { localStorage.setItem('pb_orders', JSON.stringify(o)); }
function updateOrderCount() {
  const o = getOrders();
  if(document.getElementById('orderCount')) document.getElementById('orderCount').textContent = o.length;
}

function renderAuth() {
  const area = document.getElementById('authArea');
  if(!area) return;
  const t = T[currentLang] || T.ar;
  if (session) {
    const owner = session.isOwner;
    const chipClass = owner ? 'user-chip owner-chip' : 'user-chip';
    const icon = owner ? '👑' : '👤';
    const ownerBtn = owner ? `<button class="auth-btn" style="font-size:11px;padding:3px 10px;border-color:rgba(245,158,11,.3);color:var(--owner)" onclick="showOwnerPanel()">⚙️ لوحة المالك</button>` : '';
    area.innerHTML = `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${ownerBtn}<div class="${chipClass}">${icon} ${session.name}<button class="logout" onclick="logout()">✕</button></div></div>`;
  } else {
    area.innerHTML = `<div class="auth-btns"><button class="auth-btn" onclick="openAuth('login')">${t.login || 'تسجيل دخول'}</button><button class="auth-btn primary" onclick="openAuth('register')">${t.register || 'إنشاء حساب'}</button></div>`;
  }
}

function logout() {
  session = null; localStorage.removeItem('pb_sess');
  const panel = document.getElementById('ownerPanel');
  if(panel) panel.style.display = 'none';
  renderAuth(); showToast('تم تسجيل الخروج');
}

function newCaptcha() {
  const a = Math.floor(Math.random()*12)+1, b = Math.floor(Math.random()*12)+1;
  captchaAns = a + b;
  const q = `${a} + ${b} = ?`;
  ['capQ','capQ2'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=q; });
  ['capAns','capAns2'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
}
function checkCap(id) { return parseInt(document.getElementById(id)?.value) === captchaAns; }

function openAuth(mode) { newCaptcha(); authSwitch(mode); openModal('ovAuth'); }
function authSwitch(mode) {
  document.getElementById('loginForm').style.display = mode==='login'?'block':'none';
  document.getElementById('registerForm').style.display = mode==='register'?'block':'none';
  document.getElementById('tab-login-btn').classList.toggle('on', mode==='login');
  document.getElementById('tab-reg-btn').classList.toggle('on', mode==='register');
  ['lerr','rerr'].forEach(id => document.getElementById(id).classList.remove('show'));
}

function doLogin() {
  const email = document.getElementById('lemail').value.trim().toLowerCase();
  const pass = document.getElementById('lpass').value;
  const err = document.getElementById('lerr'); err.classList.remove('show');
  if (!email||!pass) { err.textContent='⚠️ أدخل الإيميل والباسورد'; err.classList.add('show'); return; }
  if (!checkCap('capAns')) { err.textContent='❌ إجابة الكابتشا خاطئة'; err.classList.add('show'); newCaptcha(); return; }
  const h = hashStr(pass + email);
  if (email === OWNER_EMAIL && h === OWNER_HASH) {
    session = { name: 'مروان | Wano', email, isOwner: true };
    localStorage.setItem('pb_sess', JSON.stringify(session));
    closeModal('ovAuth'); renderAuth(); showToast('👑 أهلاً يا مروان! تم تسجيل الدخول كمالك'); return;
  }
  const users = getUsers();
  const user = users.find(u => u.email===email && u.hash===h);
  if (!user) { err.textContent='❌ الإيميل أو الباسورد خاطئ'; err.classList.add('show'); newCaptcha(); return; }
  session = { name: user.name, email: user.email, isOwner: false };
  localStorage.setItem('pb_sess', JSON.stringify(session));
  closeModal('ovAuth'); renderAuth(); showToast(`✅ أهلاً ${user.name}!`);
}

function doRegister() {
  const name = document.getElementById('rname').value.trim();
  const email = document.getElementById('remail').value.trim().toLowerCase();
  const pass = document.getElementById('rpass').value;
  const pass2 = document.getElementById('rpass2').value;
  const err = document.getElementById('rerr'); err.classList.remove('show');
  if (!name||!email||!pass) { err.textContent='⚠️ جميع الحقول مطلوبة'; err.classList.add('show'); return; }
  if (!email.includes('@')||!email.includes('.')) { err.textContent='❌ إيميل غير صحيح'; err.classList.add('show'); return; }
  if (pass.length<6) { err.textContent='❌ الباسورد أقل من 6 أحرف'; err.classList.add('show'); return; }
  if (pass!==pass2) { err.textContent='❌ الباسوردان غير متطابقان'; err.classList.add('show'); return; }
  if (!checkCap('capAns2')) { err.textContent='❌ إجابة الكابتشا خاطئة'; err.classList.add('show'); newCaptcha(); return; }
  const users = getUsers();
  if (users.find(u=>u.email===email)) { err.textContent='❌ هذا الإيميل مسجل مسبقاً'; err.classList.add('show'); return; }
  const h = hashStr(pass + email);
  users.push({ name, email, hash: h, joined: Date.now() }); saveUsers(users);
  session = { name, email, isOwner: (email===OWNER_EMAIL && h===OWNER_HASH) };
  localStorage.setItem('pb_sess', JSON.stringify(session));
  closeModal('ovAuth'); renderAuth(); showToast(`🎉 أهلاً ${name}!`);
}

function showOwnerPanel() {
  if (!session?.isOwner) return;
  const panel = document.getElementById('ownerPanel');
  panel.style.display = 'block'; panel.scrollIntoView({ behavior: 'smooth' }); loadPanelData();
}

function loadPanelData() {
  const users = getUsers(); const orders = getOrders();
  const visits = parseInt(localStorage.getItem('pb_visits') || '0');
  document.getElementById('pVisits').textContent = visits.toLocaleString();
  document.getElementById('pOrders').textContent = orders.length;
  document.getElementById('pUsers').textContent = users.length;
  const oList = document.getElementById('pOrdersList');
  oList.innerHTML = orders.length ? orders.slice().reverse().map(o =>
    `<div class="pcard"><h4>📦 ${o.bot} — ${o.date}</h4><p>👤 <strong>${o.name}</strong> | 📞 <strong>${o.contact}</strong><br>💰 <strong>${o.budget||'—'}</strong> | 💳 <strong>${o.pay||'—'}</strong>${o.desc&&o.desc!=='—'?'<br>📝 '+o.desc:''}</p></div>`
  ).join('') : '<p style="color:var(--mut);text-align:center;padding:16px">لا توجد طلبات</p>';
  const uList = document.getElementById('pUsersList');
  uList.innerHTML = users.length ? users.map(u => {
    const isOw = u.email === OWNER_EMAIL;
    return `<div class="ucard"><div class="uava">${isOw?'👑':'👤'}</div><div class="uinfo"><h4>${u.name}</h4><p>${u.email} • ${new Date(u.joined).toLocaleDateString('ar-EG')}</p></div><span class="utag ${isOw?'owner':'user'}">${isOw?'👑 Owner':'عضو'}</span></div>`;
  }).join('') : '<p style="color:var(--mut);text-align:center;padding:16px">لا يوجد مستخدمون</p>';
}

function panelTab(tab, btn) {
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('pOrdersList').style.display = tab==='orders'?'block':'none';
  document.getElementById('pUsersList').style.display = tab==='users'?'block':'none';
}

function openOrder(bot, price, custom=false) {
  isCustom = custom; document.getElementById('bname').value = bot;
  document.getElementById('cbudget').value = price.includes('حسب') ? '' : price;
  ['cname','ccon','cdesc'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  document.querySelectorAll('.pay').forEach(b=>b.classList.remove('on')); selPayVal = '';
  document.getElementById('descArea').style.display = custom ? 'block' : 'none';
  if (session?.name) document.getElementById('cname').value = session.name;
  openModal('ovOrder');
}

function selPay(btn, m) {
  document.querySelectorAll('.pay').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on'); selPayVal = m;
}

function submitOrder() {
  const bot = document.getElementById('bname').value;
  const name = document.getElementById('cname').value.trim();
  const con = document.getElementById('ccon').value.trim();
  const desc = isCustom ? document.getElementById('cdesc').value.trim() : '—';
  const budget = document.getElementById('cbudget').value.trim();
  if (!name||!con) { showToast('⚠️ أدخل اسمك وطريقة التواصل', true); return; }
  if (isCustom && !desc) { showToast('⚠️ اشرح ما تريده بالتفصيل', true); return; }
  const order = { bot, name, contact:con, desc, budget, pay:selPayVal||'—', date:new Date().toLocaleString('ar-EG'), user:session?.email||'guest' };
  const orders = getOrders(); orders.push(order); saveOrders(orders); updateOrderCount();
  const msg = `🤖 *طلب جديد - Projects Bots*\n\n📦 *البوت:* ${bot}\n👤 *الاسم:* ${name}\n📞 *التواصل:* ${con}\n💰 *الميزانية:* ${budget||'غير محددة'}\n💳 *الدفع:* ${selPayVal||'غير محددة'}${isCustom&&desc&&desc!=='—'?'\n\n📝 *الوصف:*\n'+desc:''}\n\n_من موقع Projects Bots_`;
  window.open('https://wa.me/201145974113?text='+encodeURIComponent(msg),'_blank');
  closeModal('ovOrder'); showToast('✅ تم فتح واتساب!');
}

function switchTab(name) {
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  const el=document.getElementById('tab-'+name), btn=document.getElementById('btn-'+name);
  if(el) el.classList.add('on'); if(btn) btn.classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});
}

function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
['ovOrder','ovAuth'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('click',function(e){if(e.target===this)closeModal(id);});
});

function showToast(msg,isErr){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.className='toast'+(isErr?' e':'');
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3200);
}

const T = { ar: { ll: 'اللغة:', login: 'تسجيل دخول', register: 'إنشاء حساب' } };
function setLang(l, btn) {
  currentLang = l; const t = T[l] || T.ar;
  document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('.lb').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderAuth();
}
