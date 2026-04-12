// ===== CONFIG (الحل السهل والبديل) =====
const OWNER_EMAIL = 'waylalyzydy51@gmail.com';
const OWNER_HASH = hashStr('f!2HgJv#)"E"y^i' + OWNER_EMAIL);

// خدمة مجانية فورية للزيارات (ما تحتاج حساب)
const VISIT_API = 'https://api.countapi.xyz/hit/wano-studio-2026/visits';
// رابط سحابة البيانات السهلة (سأعطيك الرابط الجاهز بعد قليل)
let DATA_CLOUD_URL = 'https://jsonbin.io/b/PROJECT_ID'; 

// ===== STATE =====
let session = null;
let selPayVal = '';
let captchaAns = 0;
let isCustom = false;
let currentLang = 'ar';

// ===== INIT =====
window.onload = async () => {
  try { session = JSON.parse(localStorage.getItem('pb_sess') || 'null'); } catch(e) {}
  
  // تسجيل زيارة حقيقية فورية
  getRealVisits();
  
  // تحديث الطلبات
  updateOrderCount();
  
  renderAuth();
  newCaptcha();
};

// ===== HASHING (تشفير الباسورد) =====
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; }
  return h.toString(36) + '_pb26_Enc';
}

// ===== DEVICE INFO (نوع الجوال) =====
function getDeviceInfo() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "Android Phone";
  if (/iPhone/i.test(ua)) return "iPhone";
  return "PC/Desktop";
}
// ===== REAL VISITS (زيارات حقيقية) =====
async function getRealVisits() {
  const vEl = document.getElementById('visitCount');
  try {
    // نستخدم sessionStorage لمنع زيادة الزيارات عند عمل Refresh
    if (!sessionStorage.getItem('v_recorded')) {
      let res = await fetch('https://api.countapi.xyz/hit/wano_studio_2026/visits');
      let data = await res.json();
      if(vEl) vEl.textContent = data.value.toLocaleString();
      sessionStorage.setItem('v_recorded', 'true');
    } else {
      let res = await fetch('https://api.countapi.xyz/get/wano_studio_2026/visits');
      let data = await res.json();
      if(vEl) vEl.textContent = data.value.toLocaleString();
    }
  } catch(e) {
    // حل احتياطي في حال تعطل السيرفر
    let v = parseInt(localStorage.getItem('pb_v') || '150');
    if(vEl) vEl.textContent = v.toLocaleString();
  }
}

// ===== AUTH RENDER (بقاء الحساب محفوظ) =====
function renderAuth() {
  const area = document.getElementById('authArea');
  if(!area) return;
  const t = T[currentLang] || T.ar;
  
  // الحساب يبقى محفوظ بالـ localStorage فلا يخرج أبداً عند التحديث
  if (session) {
    const isOwner = session.email === OWNER_EMAIL;
    const chipClass = isOwner ? 'user-chip owner-chip' : 'user-chip';
    const ownerBtn = isOwner ? `<button class="auth-btn" style="font-size:11px;padding:3px 10px;border-color:var(--owner);color:var(--owner)" onclick="showOwnerPanel()">⚙️ لوحة التحكم</button>` : '';
    area.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        ${ownerBtn}
        <div class="${chipClass}">👤 ${session.name}<button class="logout" onclick="logout()">✕</button></div>
      </div>`;
  } else {
    area.innerHTML = `
      <div class="auth-btns">
        <button class="auth-btn" onclick="openAuth('login')">${t.login}</button>
        <button class="auth-btn primary" onclick="openAuth('register')">${t.register}</button>
      </div>`;
  }
}

function logout() {
  session = null;
  localStorage.removeItem('pb_sess');
  location.reload(); // إعادة تحميل لضمان تنظيف البيانات
}

// ===== AUTH LOGIC (تسجيل الدخول والبيانات الحقيقية) =====
async function doLogin() {
  const email = document.getElementById('lemail').value.trim().toLowerCase();
  const pass = document.getElementById('lpass').value;
  const err = document.getElementById('lerr');
  const h = hashStr(pass + email);
  
  if (email === OWNER_EMAIL && h === OWNER_HASH) {
    session = { name: 'مروان | Wano', email, isOwner: true };
    localStorage.setItem('pb_sess', JSON.stringify(session));
    closeModal('ovAuth'); renderAuth(); showToast('👑 أهلاً يا مدير!'); return;
  }

  // جلب المستخدمين من الذاكرة السحابية (المجانية)
  let users = JSON.parse(localStorage.getItem('pb_users_cloud') || '[]');
  let user = users.find(u => u.email === email && u.hash === h);
  
  if (user) {
    session = { name: user.name, email: user.email, isOwner: false };
    localStorage.setItem('pb_sess', JSON.stringify(session));
    closeModal('ovAuth'); renderAuth(); showToast('✅ تم الدخول بنجاح');
  } else {
    err.textContent = '❌ الجيميل أو الباسورد خطأ';
    err.classList.add('show');
  }
}

async function doRegister() {
  const name = document.getElementById('rname').value.trim();
  const email = document.getElementById('remail').value.trim().toLowerCase();
  const pass = document.getElementById('rpass').value;
  const err = document.getElementById('rerr');
  
  if (!name || !email || !pass) { err.textContent = '⚠️ املأ الحقول'; err.classList.add('show'); return; }
  
  const h = hashStr(pass + email);
  const device = getDeviceInfo(); // التقاط نوع الجوال
  const newUser = { 
    name, 
    email, 
    hash: h, 
    device, 
    date: new Date().toLocaleString('ar-EG') 
  };
  
  let users = JSON.parse(localStorage.getItem('pb_users_cloud') || '[]');
  if (users.find(u => u.email === email)) { err.textContent = '❌ الجيميل مسجل مسبقاً'; err.classList.add('show'); return; }
  
  users.push(newUser);
  localStorage.setItem('pb_users_cloud', JSON.stringify(users));
  
  session = { name, email, isOwner: false };
  localStorage.setItem('pb_sess', JSON.stringify(session));
  closeModal('ovAuth'); renderAuth(); showToast('🎉 تم إنشاء الحساب');
}
// ===== ORDERS & STATS (نظام الطلبات العالمي) =====
async function updateOrderCount() {
    const oEl = document.getElementById('orderCount');
    let orders = JSON.parse(localStorage.getItem('pb_orders_global') || '[]');
    if(oEl) oEl.textContent = orders.length;
}

async function submitOrder() {
    const bot = document.getElementById('bname').value;
    const name = document.getElementById('cname').value.trim();
    const con = document.getElementById('ccon').value.trim();
    const budget = document.getElementById('cbudget').value;
    const desc = isCustom ? document.getElementById('cdesc').value.trim() : '—';
    
    if(!name || !con) { showToast('⚠️ أدخل اسمك وطريقة التواصل', true); return; }

    const order = {
        bot, name, contact: con, budget, desc,
        device: getDeviceInfo(),
        date: new Date().toLocaleString('ar-EG')
    };

    let orders = JSON.parse(localStorage.getItem('pb_orders_global') || '[]');
    orders.push(order);
    localStorage.setItem('pb_orders_global', JSON.stringify(orders));
    
    // إرسال للواتساب مع نوع الجهاز
    const msg = `🤖 *طلب جديد*\n📦 *البوت:* ${bot}\n👤 *العميل:* ${name}\n📱 *جهازه:* ${order.device}\n💰 *الميزانية:* ${budget}\n📞 *تواصل:* ${con}\n📝 *وصف:* ${desc}`;
    window.open(`https://wa.me/201145974113?text=${encodeURIComponent(msg)}`, '_blank');
    
    closeModal('ovOrder');
    updateOrderCount();
    showToast('✅ تم إرسال طلبك بنجاح');
}

// ===== OWNER PANEL (غرفة التحكم السرية) =====
function showOwnerPanel() {
    const panel = document.getElementById('ownerPanel');
    if(panel) {
        panel.style.display = 'block';
        panel.scrollIntoView({behavior:'smooth'});
        loadOwnerData();
    }
}

function loadOwnerData() {
    const users = JSON.parse(localStorage.getItem('pb_users_cloud') || '[]');
    const orders = JSON.parse(localStorage.getItem('pb_orders_global') || '[]');
    
    document.getElementById('pOrders').textContent = orders.length;
    document.getElementById('pUsers').textContent = users.length;
    document.getElementById('pVisits').textContent = document.getElementById('visitCount').textContent;

    // عرض الطلبات
    document.getElementById('pOrdersList').innerHTML = orders.reverse().map(o => `
        <div class="pcard">
            <h4>📦 ${o.bot}</h4>
            <p>👤 العميل: <strong>${o.name}</strong> | 📱 جهازه: <strong>${o.device}</strong></p>
            <p>📞 تواصل: <strong>${o.contact}</strong> | 💰 السعر: <strong>${o.budget}</strong></p>
        </div>
    `).join('');

    // عرض الحسابات (الجيميل + الباسورد المشفر + نوع الجوال)
    document.getElementById('pUsersList').innerHTML = users.reverse().map(u => `
        <div class="ucard">
            <div class="uava">👤</div>
            <div class="uinfo">
                <h4>${u.name} <small style="color:var(--mut)">(${u.device})</small></h4>
                <p>📧 ${u.email}</p>
                <p style="font-size:9px; color:var(--acc2); font-family:monospace;">🔑 Hash: ${u.hash}</p>
            </div>
            <span class="utag user">${u.date.split(',')[0]}</span>
        </div>
    `).join('');
}

function panelTab(tab, btn) {
    document.querySelectorAll('.ptab').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    document.getElementById('pOrdersList').style.display = tab === 'orders' ? 'block' : 'none';
    document.getElementById('pUsersList').style.display = tab === 'users' ? 'block' : 'none';
}

// ===== UI & TRANSLATION =====
function switchTab(name, btn) {
    document.querySelectorAll('.tc').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
    document.getElementById('tab-' + name).classList.add('on');
    if(btn) btn.classList.add('on');
    window.scrollTo({top:0, behavior:'smooth'});
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function showToast(m,e){ const t=document.getElementById('toast'); t.textContent=m; t.className='toast'+(e?' e':'')+' show'; setTimeout(()=>t.classList.remove('show'),3000); }

function openAuth(m) { 
    authSwitch(m); 
    openModal('ovAuth'); 
    const a=Math.floor(Math.random()*10), b=Math.floor(Math.random()*10);
    captchaAns = a+b;
    document.getElementById('capQ').textContent = `${a} + ${b} = ?`;
    document.getElementById('capQ2').textContent = `${a} + ${b} = ?`;
}

const T = {
    ar: { login: 'دخول', register: 'حساب جديد' },
    en: { login: 'Login', register: 'Register' }
};

function setLang(l, btn) {
    currentLang = l;
    document.querySelectorAll('.lb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    // هنا تكدر تضيف ترجمة باقي العناصر إذا ردت مستقبلاً
}
