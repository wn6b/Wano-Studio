// ===== CONFIG & DATABASE =====
const OWNER_EMAIL = 'waylalyzydy51@gmail.com';
const OWNER_HASH = hashStr('f!2HgJv#)"E"y^i' + OWNER_EMAIL);

// رابط قاعدة البيانات الخاص بك (عالمي وحقيقي للكل)
const DB_URL = 'https://wano-studio-default-rtdb.firebaseio.com';

// ===== STATE =====
let session = null;
let selPayVal = '';
let captchaAns = 0;
let isCustom = false;
let currentLang = 'ar';

// ===== INIT (عند فتح الموقع) =====
window.onload = async () => {
  try { session = JSON.parse(localStorage.getItem('pb_sess') || 'null'); } catch(e) {}
  
  // 1. تسجيل زيارة حقيقية (ومنع التكرار عند الريفرش)
  await recordRealVisit();
  
  // 2. جلب الطلبات الحقيقية من القاعدة وعرض عددها
  await fetchRealOrders();

  renderAuth();
  newCaptcha();
};

// ===== HASHING (تشفير الباسورد لحماية العملاء) =====
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; }
  return h.toString(36) + '_pb26_Encrypted';
}

// ===== GET DEVICE INFO (معرفة نوع الجوال والمنصة) =====
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = "Desktop/PC";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) device = "Tablet";
  else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) device = "Mobile";
  
  const platform = navigator.platform || 'Unknown';
  return `${device} (${platform})`;
}

// ===== REAL VISITS LOGIC (نظام الزيارات الحقيقية) =====
async function recordRealVisit() {
  // استخدام sessionStorage لمنع زيادة العدد إذا المستخدم سوى ريفرش للصفحة
  const hasVisited = sessionStorage.getItem('hasVisited');
  const vEl = document.getElementById('visitCount');
  
  try {
    // جلب العدد من قاعدة البيانات العالمية
    let res = await fetch(`${DB_URL}/visits.json`);
    let count = await res.json() || 0;

    if (!hasVisited) {
      count = count + 1;
      // تحديث العدد للكل
      await fetch(`${DB_URL}/visits.json`, {
        method: 'PUT',
        body: JSON.stringify(count)
      });
      sessionStorage.setItem('hasVisited', 'true');
    }
    if(vEl) vEl.textContent = count.toLocaleString();
  } catch (err) {
    let v = parseInt(localStorage.getItem('pb_visits') || '0');
    if (!hasVisited) { v++; localStorage.setItem('pb_visits', v); sessionStorage.setItem('hasVisited', 'true'); }
    if(vEl) vEl.textContent = v.toLocaleString();
  }
}
// ===== REAL ORDERS LOGIC (جلب الطلبات العالمية) =====
async function fetchRealOrders() {
  const oEl = document.getElementById('orderCount');
  try {
    let res = await fetch(`${DB_URL}/orders.json`);
    let ordersObj = await res.json();
    let ordersArray = ordersObj ? Object.values(ordersObj) : [];
    
    // دمج المحلي مع العالمي كإجراء احتياطي
    let localOrders = JSON.parse(localStorage.getItem('pb_orders') || '[]');
    let total = Math.max(ordersArray.length, localOrders.length);
    
    if(oEl) oEl.textContent = total.toLocaleString();
    return ordersArray.length > 0 ? ordersArray : localOrders;
  } catch(e) {
    let localOrders = JSON.parse(localStorage.getItem('pb_orders') || '[]');
    if(oEl) oEl.textContent = localOrders.length.toLocaleString();
    return localOrders;
  }
}

// ===== USERS DATABASE SYNC (مزامنة المستخدمين) =====
async function getUsers() {
  try {
    let res = await fetch(`${DB_URL}/users.json`);
    let usersObj = await res.json();
    return usersObj ? Object.values(usersObj) : JSON.parse(localStorage.getItem('pb_users') || '[]');
  } catch(e) {
    return JSON.parse(localStorage.getItem('pb_users') || '[]');
  }
}

async function saveUserGlobal(userObj) {
  // الحفظ المحلي لضمان بقاء النظام يعمل حتى لو النت ضعيف
  let localUsers = JSON.parse(localStorage.getItem('pb_users') || '[]');
  localUsers.push(userObj);
  localStorage.setItem('pb_users', JSON.stringify(localUsers));
  
  // الحفظ العالمي في قاعدة البيانات Firebase
  try { 
    await fetch(`${DB_URL}/users.json`, { 
      method: 'POST', 
      body: JSON.stringify(userObj) 
    }); 
  } catch(e) { console.log("Database error."); }
}

// ===== AUTH RENDER & LOGOUT (بقاء تسجيل الدخول محفوظاً) =====
function renderAuth() {
  const area = document.getElementById('authArea');
  if(!area) return;
  const t = T[currentLang] || T.ar;
  
  if (session) {
    const owner = session.isOwner;
    const chipClass = owner ? 'user-chip owner-chip' : 'user-chip';
    const icon = owner ? '👑' : '👤';
    const ownerBtn = owner ? `<button class="auth-btn" style="font-size:11px;padding:3px 10px;border-color:rgba(245,158,11,.3);color:var(--owner)" onclick="showOwnerPanel()">⚙️ ${t.ownerPanelBtn||'لوحة المالك'}</button>` : '';
    area.innerHTML = `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${ownerBtn}<div class="${chipClass}">${icon} ${session.name}<button class="logout" onclick="logout()">✕</button></div></div>`;
  } else {
    area.innerHTML = `<div class="auth-btns"><button class="auth-btn" onclick="openAuth('login')" data-i="login">${t.login||'دخول'}</button><button class="auth-btn primary" onclick="openAuth('register')" data-i="register">${t.register||'حساب جديد'}</button></div>`;
  }
}

function logout() {
  session = null;
  localStorage.removeItem('pb_sess');
  const panel = document.getElementById('ownerPanel');
  if(panel) panel.style.display = 'none';
  renderAuth();
  showToast(T[currentLang]?.loggedOut || 'تم تسجيل الخروج');
}

// ===== CAPTCHA (كابتشا الحماية) =====
function newCaptcha() {
  const a = Math.floor(Math.random()*12)+1, b = Math.floor(Math.random()*12)+1;
  captchaAns = a + b;
  const q = `${a} + ${b} = ?`;
  ['capQ','capQ2'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=q; });
  ['capAns','capAns2'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
}
function checkCap(id) { return parseInt(document.getElementById(id)?.value) === captchaAns; }

// ===== AUTH MODALS (نوافذ التسجيل) =====
function openAuth(mode) { newCaptcha(); authSwitch(mode); openModal('ovAuth'); }
function authSwitch(mode) {
  document.getElementById('loginForm').style.display = mode==='login'?'block':'none';
  document.getElementById('registerForm').style.display = mode==='register'?'block':'none';
  document.getElementById('tab-login-btn').classList.toggle('on', mode==='login');
  document.getElementById('tab-reg-btn').classList.toggle('on', mode==='register');
  ['lerr','rerr'].forEach(id => { const el=document.getElementById(id); if(el) el.classList.remove('show'); });
}
// ===== LOGIN LOGIC (تسجيل الدخول) =====
async function doLogin() {
  const email = document.getElementById('lemail').value.trim().toLowerCase();
  const pass = document.getElementById('lpass').value;
  const err = document.getElementById('lerr');
  err.classList.remove('show');
  const t = T[currentLang] || T.ar;
  
  if (!email || !pass) { err.textContent = t.errFill || '⚠️ أدخل الجيميل والباسورد'; err.classList.add('show'); return; }
  if (!checkCap('capAns')) { err.textContent = t.errCap || '❌ إجابة الكابتشا خاطئة'; err.classList.add('show'); newCaptcha(); return; }
  
  const h = hashStr(pass + email);
  
  // فحص إذا كان المالك (المدير مروان)
  if (email === OWNER_EMAIL && h === OWNER_HASH) {
    session = { name: 'مروان | Wano', email, isOwner: true };
    localStorage.setItem('pb_sess', JSON.stringify(session));
    closeModal('ovAuth'); renderAuth(); showToast('👑 أهلاً يا مدير! تم تسجيل الدخول لغرفة التحكم'); return;
  }
  
  // فحص باقي المستخدمين من قاعدة فايربيس العالمية
  const users = await getUsers();
  const user = users.find(u => u.email === email && u.hash === h);
  if (!user) { err.textContent = t.errWrong || '❌ الجيميل أو الباسورد خاطئ'; err.classList.add('show'); newCaptcha(); return; }
  
  session = { name: user.name, email: user.email, isOwner: false };
  localStorage.setItem('pb_sess', JSON.stringify(session));
  closeModal('ovAuth'); renderAuth(); showToast(`✅ ${t.welcome || 'أهلاً'} ${user.name}!`);
}

// ===== REGISTER LOGIC (إنشاء حساب جديد وتشفير البيانات) =====
async function doRegister() {
  const name = document.getElementById('rname').value.trim();
  const email = document.getElementById('remail').value.trim().toLowerCase();
  const pass = document.getElementById('rpass').value;
  const err = document.getElementById('rerr');
  err.classList.remove('show');
  const t = T[currentLang] || T.ar;
  
  if (!name || !email || !pass) { err.textContent = t.errFillAll || '⚠️ جميع الحقول مطلوبة'; err.classList.add('show'); return; }
  if (!email.includes('@') || !email.includes('.')) { err.textContent = t.errEmail || '❌ جيميل غير صحيح'; err.classList.add('show'); return; }
  if (pass.length < 6) { err.textContent = t.errPass || '❌ الباسورد أقل من 6 أحرف'; err.classList.add('show'); return; }
  if (!checkCap('capAns2')) { err.textContent = t.errCap || '❌ إجابة الكابتشا خاطئة'; err.classList.add('show'); newCaptcha(); return; }
  
  const users = await getUsers();
  if (users.find(u => u.email === email)) { err.textContent = t.errExists || '❌ هذا الجيميل مسجل مسبقاً'; err.classList.add('show'); return; }
  
  // تشفير الباسورد وجلب نوع الجوال
  const h = hashStr(pass + email);
  const deviceType = getDeviceInfo();
  const dateStr = new Date().toLocaleString('ar-EG');
  
  const newUser = { 
    name: name, 
    email: email, 
    hash: h, 
    device: deviceType,
    joinedDate: dateStr,
    joined: Date.now() 
  };
  
  // حفظ الحساب بقاعدة فايربيس العالمية
  await saveUserGlobal(newUser);
  
  const isOwnerAcc = (email === OWNER_EMAIL && h === OWNER_HASH);
  session = { name, email, isOwner: isOwnerAcc };
  localStorage.setItem('pb_sess', JSON.stringify(session));
  
  closeModal('ovAuth'); renderAuth(); showToast(`🎉 ${t.welcome || 'أهلاً'} ${name}!`);
}

// ===== OWNER PANEL (لوحة الإدارة السريّة) =====
function showOwnerPanel() {
  if (!session?.isOwner) return;
  const panel = document.getElementById('ownerPanel');
  if(panel) {
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
    loadPanelData();
  }
}

async function loadPanelData() {
  // جلب البيانات من فايربيس
  const users = await getUsers();
  const orders = await fetchRealOrders();
  const vEl = document.getElementById('visitCount');
  
  // تحديث الأرقام باللوحة
  document.getElementById('pVisits').textContent = vEl ? vEl.textContent : '0';
  document.getElementById('pOrders').textContent = orders.length;
  document.getElementById('pUsers').textContent = users.length;
  
  // رندرة الطلبات
  const oList = document.getElementById('pOrdersList');
  oList.innerHTML = orders.length ? orders.slice().reverse().map(o =>
    `<div class="pcard">
      <h4>📦 ${o.bot}</h4>
      <p style="font-size:10px; color:var(--mut); margin-bottom:5px;">🕒 ${o.date}</p>
      <p>👤 <strong>${o.name}</strong> | 📞 <strong>${o.contact}</strong><br>
      📱 <strong>الجهاز:</strong> ${o.device || 'غير معروف'}<br>
      💰 <strong>${o.budget||'—'}</strong> | 💳 <strong>${o.pay||'—'}</strong>
      ${o.desc&&o.desc!=='—'?'<br>📝 '+o.desc:''}
      </p>
    </div>`
  ).join('') : '<p style="color:var(--mut);text-align:center;padding:16px">لا توجد طلبات</p>';
  
  // رندرة الحسابات (مع إظهار الجوال والباسورد المشفر)
  const uList = document.getElementById('pUsersList');
  uList.innerHTML = users.length ? users.slice().reverse().map(u => {
    const isOw = (u.email === OWNER_EMAIL);
    return `<div class="ucard" style="align-items:flex-start;">
      <div class="uava" style="margin-top:4px;">${isOw?'👑':'👤'}</div>
      <div class="uinfo" style="flex:1;">
        <div style="display:flex; justify-content:space-between;">
           <h4 style="margin:0;">${u.name}</h4>
           <span class="utag ${isOw?'owner':'user'}">${isOw?'👑 Owner':'عضو'}</span>
        </div>
        <p style="margin-bottom:2px; font-weight:bold;">${u.email}</p>
        <p style="font-size:10px; color:var(--mut); margin-bottom:2px;">📱 الجهاز: ${u.device || 'غير معروف'}</p>
        <p style="font-size:10px; color:var(--acc2); font-family:monospace; margin-bottom:2px; word-break:break-all;">🔑 ${u.hash}</p>
        <p style="font-size:10px; color:var(--grn);">📅 ${u.joinedDate || new Date(u.joined).toLocaleString('ar-EG')}</p>
      </div>
    </div>`;
  }).join('') : '<p style="color:var(--mut);text-align:center;padding:16px">لا يوجد مستخدمون</p>';
}

function panelTab(tab, btn) {
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('pOrdersList').style.display = tab === 'orders' ? 'block' : 'none';
  document.getElementById('pUsersList').style.display = tab === 'users' ? 'block' : 'none';
}
// ===== ORDERING LOGIC (إرسال الطلبات وحفظها عالمياً) =====
function openOrder(bot, price, custom = false) {
  isCustom = custom;
  document.getElementById('bname').value = bot;
  document.getElementById('cbudget').value = price.includes('حسب') ? '' : price;
  ['cname', 'ccon', 'cdesc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.querySelectorAll('.pay').forEach(b => b.classList.remove('on'));
  selPayVal = '';
  document.getElementById('descArea').style.display = custom ? 'block' : 'none';
  if (session?.name) document.getElementById('cname').value = session.name;
  openModal('ovOrder');
}

function selPay(btn, m) {
  document.querySelectorAll('.pay').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  selPayVal = m;
}

async function submitOrder() {
  const bot = document.getElementById('bname').value;
  const name = document.getElementById('cname').value.trim();
  const con = document.getElementById('ccon').value.trim();
  const desc = isCustom ? document.getElementById('cdesc').value.trim() : '—';
  const budget = document.getElementById('cbudget').value.trim();
  const t = T[currentLang] || T.ar;

  if (!name || !con) { showToast(t.errFill || '⚠️ أدخل اسمك وطريقة التواصل', true); return; }
  if (isCustom && !desc) { showToast(t.errDesc || '⚠️ اشرح ما تريده بالتفصيل', true); return; }

  const dateStr = new Date().toLocaleString('ar-EG');
  const order = { 
    bot, 
    name, 
    contact: con, 
    desc, 
    budget, 
    pay: selPayVal || '—', 
    date: dateStr, 
    user: session?.email || 'guest',
    device: getDeviceInfo() // سحب نوع الجوال
  };

  // الحفظ المحلي
  const orders = JSON.parse(localStorage.getItem('pb_orders') || '[]');
  orders.push(order);
  localStorage.setItem('pb_orders', JSON.stringify(orders));

  // الحفظ العالمي في قاعدة البيانات Firebase
  try {
    await fetch(`${DB_URL}/orders.json`, {
      method: 'POST',
      body: JSON.stringify(order)
    });
  } catch (e) {
    console.log("Database error.");
  }

  await fetchRealOrders(); // تحديث الرقم فوراً للكل

  // إرسال رسالة واتساب مفصلة لك
  const msg = `🤖 *طلب جديد - Projects Bots*\n\n📦 *البوت:* ${bot}\n👤 *الاسم:* ${name}\n📞 *التواصل:* ${con}\n💰 *الميزانية:* ${budget || 'غير محددة'}\n💳 *الدفع:* ${selPayVal || 'غير محددة'}${isCustom && desc && desc !== '—' ? '\n\n📝 *الوصف:*\n' + desc : ''}\n\n📱 *الجهاز:* ${order.device}\n_من موقع Projects Bots_`;
  window.open('https://wa.me/201145974113?text=' + encodeURIComponent(msg), '_blank');
  
  closeModal('ovOrder');
  showToast(t.orderSent || '✅ تم إرسال الطلب وفتح واتساب!');
}

// ===== UI INTERACTIONS (التبويبات والنوافذ) =====
function switchTab(name) {
  document.querySelectorAll('.tc').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
  const el = document.getElementById('tab-' + name);
  const btn = document.getElementById('btn-' + name);
  if (el) el.classList.add('on');
  if (btn) btn.classList.add('on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }

['ovOrder', 'ovAuth'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', function (e) { if (e.target === this) closeModal(id); });
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') ['ovOrder', 'ovAuth'].forEach(closeModal); });

const lpassEl = document.getElementById('lpass');
if (lpassEl) lpassEl.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function showToast(msg, isErr) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (isErr ? ' e' : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ===== TRANSLATIONS (اللغات) =====
const T = {
ar:{dir:'rtl',ll:'اللغة:',visits:'زيارة',orders:'طلب',nav1:'ديسكورد',nav2:'تيليجرام',nav3:'واتساب',nav6:'عنّا',h1:'متاح للطلبات الآن',h2:'بوتات احترافية',h3:'لكل منصة',h4:'تطوير بوتات مخصصة لديسكورد، تيليجرام، واتساب، وChrome — إنشاء الملفات فقط.',h5:'📦 اطلب الآن',h6:'تعرف علينا',od:'مطور بوتات — إنشاء ملفات ومشاريع البوتات فقط، لا يشمل التشغيل',t1:'ديسكورد',t2:'تيليجرام',t3:'واتساب',t6:'عنّا',d1:'بوتات ديسكورد',d2:'جميع البوتات المسموح بها على Discord',about1:'عن المشروع',about2:'كل ما تحتاج معرفته',a1t:'من نحن',a1p:'مروان | Wano — مطور بوتات متخصص.',a2t:'ملاحظة مهمة',a2p:'الخدمة تشمل إنشاء ملفات البوتات فقط — لا تشمل التشغيل.',a3t:'طرق الدفع',a3p:'فودافون كاش، PayPal، Binance، USDT، تحويل بنكي.',a4t:'وقت التسليم',a4p:'بسيط: 1-3 أيام. متوسط: 3-7 أيام. كبير: يُتفق عليه.',a5t:'الدعم',a5p:'دعم مجاني 7 أيام بعد التسليم.',login:'دخول',register:'حساب جديد',lbl1:'الجيميل',lbl2:'الباسورد',lbl3:'🔑 دخول',or:'أو',noAcc:'ما عندك حساب؟',createOne:'أنشئ حساب',haveAcc:'عندك حساب؟',signIn:'سجّل دخول',rl1:'الاسم',rl2:'الجيميل',rl3:'الباسورد (مشفر)',rl4:'تأكيد الباسورد',rl5:'✅ إنشاء',ord1:'طلب مشروع',ord2:'📱 سيصلك رد من المطور مباشرة عبر واتساب',ord3:'اسم البوت / المشروع',ord4:'اسمك',ord5:'تواصل (واتساب أو ديسكورد)',ord6:'وصف ما تريده بالتفصيل',ord7:'الميزانية (مغلقة)',ord8:'طريقة الدفع',ord9:'📤 إرسال الطلب عبر واتساب',orderBtn:'🛒 اطلب الآن',customBtn:'✨ اطلب بوتك المخصص',customD:'بوت Discord مخصص',customT:'بوت Telegram مخصص',customW:'سيلف بوت واتساب مخصص',custa1:'✓ أي فكرة تريدها',custa2:'✓ سعر مخصص',unavail:'غير متوفر حالياً',ownerPanel:'لوحة المالك — مروان | Wano',ownerPanelBtn:'لوحة المالك',ptOrders:'📦 الطلبات',ptUsers:'👥 الحسابات',pUsersL:'مستخدم',footerRights:'جميع الحقوق محفوظة لـ',footerNote:'⚠️ إنشاء ملفات ومشاريع البوتات فقط — لا يشمل التشغيل أو الاستضافة',errFill:'⚠️ أدخل الجيميل والباسورد',errCap:'❌ إجابة الكابتشا خاطئة',errWrong:'❌ الجيميل أو الباسورد خاطئ',errFillAll:'⚠️ جميع الحقول مطلوبة',errEmail:'❌ جيميل غير صحيح',errPass:'❌ الباسورد أقل من 6 أحرف',errPassMatch:'❌ الباسوردان غير متطابقان',errExists:'❌ هذا الجيميل مسجل مسبقاً',errDesc:'⚠️ اشرح ما تريده بالتفصيل',welcome:'أهلاً',loggedOut:'تم تسجيل الخروج',orderSent:'✅ تم فتح واتساب!'},
en:{dir:'ltr',ll:'Language:',visits:'visits',orders:'orders',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'About',h1:'Available for orders',h2:'Professional Bots',h3:'For Every Platform',h4:'Custom bot development for Discord, Telegram, WhatsApp & Chrome — file creation only.',h5:'📦 Order Now',h6:'About Us',od:'Bot Developer — File creation only, no hosting',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'About',d1:'Discord Bots',d2:'All allowed bot types on Discord',about1:'About Us',about2:'Everything you need to know',a1t:'Who We Are',a1p:'Marwan | Wano — Bot developer.',a2t:'Important Note',a2p:'Service includes file creation only — no running or hosting.',a3t:'Payments',a3p:'Vodafone Cash, PayPal, Binance, USDT, Bank Transfer.',a4t:'Delivery',a4p:'Simple: 1-3 days. Medium: 3-7 days. Large: negotiated.',a5t:'Support',a5p:'Free 7-day support after delivery.',login:'Login',register:'Sign Up',lbl1:'Email',lbl2:'Password',lbl3:'🔑 Login',or:'or',noAcc:"Don't have an account?",createOne:'Create one',haveAcc:'Have an account?',signIn:'Sign in',rl1:'Name',rl2:'Email',rl3:'Password (Encrypted)',rl4:'Confirm Password',rl5:'✅ Create Account',ord1:'Order a Project',ord2:'📱 You will receive a reply via WhatsApp',ord3:'Bot / Project Name',ord4:'Your Name',ord5:'Contact (WhatsApp or Discord)',ord6:'Describe what you want in detail',ord7:'Budget (Locked)',ord8:'Payment Method',ord9:'📤 Send via WhatsApp',orderBtn:'🛒 Order Now',customBtn:'✨ Order Custom Bot',customD:'Custom Discord Bot',customT:'Custom Telegram Bot',customW:'Custom WhatsApp Self-Bot',custa1:'✓ Any idea you want',custa2:'✓ Custom price',unavail:'Not Available',ownerPanel:'Owner Panel — Marwan | Wano',ownerPanelBtn:'Owner Panel',ptOrders:'📦 Orders',ptUsers:'👥 Users',pUsersL:'users',footerRights:'All rights reserved by',footerNote:'⚠️ File & project creation only — no running or hosting',errFill:'⚠️ Enter email and password',errCap:'❌ Wrong captcha answer',errWrong:'❌ Wrong email or password',errFillAll:'⚠️ All fields required',errEmail:'❌ Invalid email',errPass:'❌ Password too short (min 6)',errPassMatch:'❌ Passwords do not match',errExists:'❌ Email already registered',errDesc:'⚠️ Please describe what you want',welcome:'Welcome',loggedOut:'Logged out',orderSent:'✅ WhatsApp opened!',dc1n:'Moderation Bot',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Warnings system',dc1a3:'✓ Full logging'}
};

function setLang(l, btn) {
  currentLang = l;
  const t = T[l] || T.ar;
  document.documentElement.lang = l;
  document.documentElement.dir = t.dir;
  document.querySelectorAll('.lb').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  document.getElementById('ll').textContent = t.ll;
  document.querySelectorAll('[data-i]').forEach(el => {
    const k = el.getAttribute('data-i');
    if (t[k] !== undefined) el.textContent = t[k];
  });
  renderAuth();
}
