// ===== CONFIG =====
const OWNER_EMAIL = 'waylalyzydy51@gmail.com';
const OWNER_HASH = hashStr('f!2HgJv#)"E"y^i' + OWNER_EMAIL);

// ===== STATE =====
let session = null;
let selPayVal = '';
let captchaAns = 0;
let isCustom = false;
let currentLang = 'ar';

// ===== INIT =====
window.onload = () => {
  try { session = JSON.parse(localStorage.getItem('pb_sess') || 'null'); } catch(e) {}
  let v = parseInt(localStorage.getItem('pb_visits') || '0') + 1;
  localStorage.setItem('pb_visits', v);
  document.getElementById('visitCount').textContent = v.toLocaleString();
  updateOrderCount();
  renderAuth();
  newCaptcha();
};

// ===== HASH =====
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h = h >>> 0; }
  return h.toString(36) + '_pb25';
}

// ===== USERS =====
function getUsers() { try { return JSON.parse(localStorage.getItem('pb_users') || '[]'); } catch(e) { return []; } }
function saveUsers(u) { localStorage.setItem('pb_users', JSON.stringify(u)); }

// ===== ORDERS =====
function getOrders() { try { return JSON.parse(localStorage.getItem('pb_orders') || '[]'); } catch(e) { return []; } }
function saveOrders(o) { localStorage.setItem('pb_orders', JSON.stringify(o)); }
function updateOrderCount() {
  const o = getOrders();
  document.getElementById('orderCount').textContent = o.length;
}

// ===== isOwner =====
function isOwner(email, hash) {
  return email === OWNER_EMAIL && hash === OWNER_HASH;
}

// ===== AUTH RENDER =====
function renderAuth() {
  const area = document.getElementById('authArea');
  const t = T[currentLang] || T.ar;
  if (session) {
    const owner = session.isOwner;
    const chipClass = owner ? 'user-chip owner-chip' : 'user-chip';
    const icon = owner ? '👑' : '👤';
    const ownerBtn = owner ? `<button class="auth-btn" style="font-size:11px;padding:3px 10px;border-color:rgba(245,158,11,.3);color:var(--owner)" onclick="showOwnerPanel()">⚙️ ${t.ownerPanelBtn||'لوحة المالك'}</button>` : '';
    area.innerHTML = `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${ownerBtn}<div class="${chipClass}">${icon} ${session.name}<button class="logout" onclick="logout()">✕</button></div></div>`;
  } else {
    area.innerHTML = `<div class="auth-btns"><button class="auth-btn" onclick="openAuth('login')" data-i="login">${t.login||'تسجيل دخول'}</button><button class="auth-btn primary" onclick="openAuth('register')" data-i="register">${t.register||'إنشاء حساب'}</button></div>`;
  }
}

function logout() {
  session = null;
  localStorage.removeItem('pb_sess');
  document.getElementById('ownerPanel').style.display = 'none';
  renderAuth();
  showToast(T[currentLang]?.loggedOut || 'تم تسجيل الخروج');
}

// ===== CAPTCHA =====
function newCaptcha() {
  const a = Math.floor(Math.random()*12)+1, b = Math.floor(Math.random()*12)+1;
  captchaAns = a + b;
  const q = `${a} + ${b} = ?`;
  ['capQ','capQ2'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=q; });
  ['capAns','capAns2'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
}
function checkCap(id) { return parseInt(document.getElementById(id)?.value) === captchaAns; }

// ===== AUTH MODAL =====
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
  const err = document.getElementById('lerr');
  err.classList.remove('show');
  const t = T[currentLang] || T.ar;
  if (!email||!pass) { err.textContent=t.errFill||'⚠️ أدخل الإيميل والباسورد'; err.classList.add('show'); return; }
  if (!checkCap('capAns')) { err.textContent=t.errCap||'❌ إجابة الكابتشا خاطئة'; err.classList.add('show'); newCaptcha(); return; }
  const h = hashStr(pass + email);
  // Owner check
  if (email === OWNER_EMAIL && h === OWNER_HASH) {
    session = { name: 'مروان | Wano', email, isOwner: true };
    localStorage.setItem('pb_sess', JSON.stringify(session));
    closeModal('ovAuth');
    renderAuth();
    showToast('👑 أهلاً يا مروان! تم تسجيل الدخول كمالك');
    return;
  }
  const users = getUsers();
  const user = users.find(u => u.email===email && u.hash===h);
  if (!user) { err.textContent=t.errWrong||'❌ الإيميل أو الباسورد خاطئ'; err.classList.add('show'); newCaptcha(); return; }
  session = { name: user.name, email: user.email, isOwner: false };
  localStorage.setItem('pb_sess', JSON.stringify(session));
  closeModal('ovAuth');
  renderAuth();
  showToast(`✅ ${t.welcome||'أهلاً'} ${user.name}!`);
}

function doRegister() {
  const name = document.getElementById('rname').value.trim();
  const email = document.getElementById('remail').value.trim().toLowerCase();
  const pass = document.getElementById('rpass').value;
  const pass2 = document.getElementById('rpass2').value;
  const err = document.getElementById('rerr');
  err.classList.remove('show');
  const t = T[currentLang] || T.ar;
  if (!name||!email||!pass) { err.textContent=t.errFillAll||'⚠️ جميع الحقول مطلوبة'; err.classList.add('show'); return; }
  if (!email.includes('@')||!email.includes('.')) { err.textContent=t.errEmail||'❌ إيميل غير صحيح'; err.classList.add('show'); return; }
  if (pass.length<6) { err.textContent=t.errPass||'❌ الباسورد أقل من 6 أحرف'; err.classList.add('show'); return; }
  if (pass!==pass2) { err.textContent=t.errPassMatch||'❌ الباسوردان غير متطابقان'; err.classList.add('show'); return; }
  if (!checkCap('capAns2')) { err.textContent=t.errCap||'❌ إجابة الكابتشا خاطئة'; err.classList.add('show'); newCaptcha(); return; }
  const users = getUsers();
  if (users.find(u=>u.email===email)) { err.textContent=t.errExists||'❌ هذا الإيميل مسجل مسبقاً'; err.classList.add('show'); return; }
  const h = hashStr(pass + email);
  users.push({ name, email, hash: h, joined: Date.now() });
  saveUsers(users);
  const isOwnerAcc = email === OWNER_EMAIL && h === OWNER_HASH;
  session = { name, email, isOwner: isOwnerAcc };
  localStorage.setItem('pb_sess', JSON.stringify(session));
  closeModal('ovAuth');
  renderAuth();
  showToast(`🎉 ${t.welcome||'أهلاً'} ${name}!`);
}

// ===== OWNER PANEL =====
function showOwnerPanel() {
  if (!session?.isOwner) return;
  const panel = document.getElementById('ownerPanel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
  loadPanelData();
}

function loadPanelData() {
  const users = getUsers();
  const orders = getOrders();
  const visits = parseInt(localStorage.getItem('pb_visits') || '0');
  document.getElementById('pVisits').textContent = visits.toLocaleString();
  document.getElementById('pOrders').textContent = orders.length;
  document.getElementById('pUsers').textContent = users.length;
  // Orders
  const oList = document.getElementById('pOrdersList');
  oList.innerHTML = orders.length ? orders.slice().reverse().map(o =>
    `<div class="pcard"><h4>📦 ${o.bot} — ${o.date}</h4><p>👤 <strong>${o.name}</strong> | 📞 <strong>${o.contact}</strong><br>💰 <strong>${o.budget||'—'}</strong> | 💳 <strong>${o.pay||'—'}</strong>${o.desc&&o.desc!=='—'?'<br>📝 '+o.desc:''}</p></div>`
  ).join('') : '<p style="color:var(--mut);text-align:center;padding:16px">لا توجد طلبات</p>';
  // Users
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

// ===== ORDER =====
function openOrder(bot, price, custom=false) {
  isCustom = custom;
  document.getElementById('bname').value = bot;
  document.getElementById('cbudget').value = price.includes('حسب') ? '' : price;
  ['cname','ccon','cdesc'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  document.querySelectorAll('.pay').forEach(b=>b.classList.remove('on'));
  selPayVal = '';
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
  const t = T[currentLang] || T.ar;
  if (!name||!con) { showToast(t.errFill||'⚠️ أدخل اسمك وطريقة التواصل', true); return; }
  if (isCustom && !document.getElementById('cdesc').value.trim()) { showToast(t.errDesc||'⚠️ اشرح ما تريده بالتفصيل', true); return; }
  const order = { bot, name, contact:con, desc, budget, pay:selPayVal||'—', date:new Date().toLocaleString('ar-EG'), user:session?.email||'guest' };
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  updateOrderCount();
  const msg = `🤖 *طلب جديد - Projects Bots*\n\n📦 *البوت:* ${bot}\n👤 *الاسم:* ${name}\n📞 *التواصل:* ${con}\n💰 *الميزانية:* ${budget||'غير محددة'}\n💳 *الدفع:* ${selPayVal||'غير محددة'}${isCustom&&desc&&desc!=='—'?'\n\n📝 *الوصف:*\n'+desc:''}\n\n_من موقع Projects Bots_`;
  window.open('https://wa.me/201145974113?text='+encodeURIComponent(msg),'_blank');
  closeModal('ovOrder');
  showToast(t.orderSent||'✅ تم فتح واتساب!');
}

// ===== TABS =====
function switchTab(name) {
  document.querySelectorAll('.tc').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  const el=document.getElementById('tab-'+name), btn=document.getElementById('btn-'+name);
  if(el) el.classList.add('on');
  if(btn) btn.classList.add('on');
  window.scrollTo({top:0,behavior:'smooth'});
}

// ===== MODALS =====
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
['ovOrder','ovAuth'].forEach(id=>{
  document.getElementById(id).addEventListener('click',function(e){if(e.target===this)closeModal(id);});
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape') ['ovOrder','ovAuth'].forEach(closeModal); });
document.getElementById('lpass').addEventListener('keydown',e=>{ if(e.key==='Enter') doLogin(); });

// ===== TOAST =====
function showToast(msg,isErr){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast'+(isErr?' e':'');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3200);
}

// ===== i18n FULL =====
const T = {
ar:{dir:'rtl',ll:'اللغة:',visits:'زيارة',orders:'طلب',nav1:'ديسكورد',nav2:'تيليجرام',nav3:'واتساب',nav6:'عنّا',h1:'متاح للطلبات الآن',h2:'بوتات احترافية',h3:'لكل منصة',h4:'تطوير بوتات مخصصة لديسكورد، تيليجرام، واتساب، وChrome — إنشاء الملفات فقط.',h5:'📦 اطلب الآن',h6:'تعرف علينا',od:'مطور بوتات — إنشاء ملفات ومشاريع البوتات فقط، لا يشمل التشغيل',t1:'ديسكورد',t2:'تيليجرام',t3:'واتساب',t6:'عنّا',d1:'بوتات ديسكورد',d2:'جميع البوتات المسموح بها على Discord',about1:'عن المشروع',about2:'كل ما تحتاج معرفته',a1t:'من نحن',a1p:'مروان | Wano — مطور بوتات متخصص في Discord وTelegram وWhatsApp.',a2t:'ملاحظة مهمة',a2p:'الخدمة تشمل إنشاء ملفات البوتات فقط — لا تشمل التشغيل.',a3t:'طرق الدفع',a3p:'فودافون كاش، PayPal، Binance، USDT، تحويل بنكي.',a4t:'وقت التسليم',a4p:'بسيط: 1-3 أيام. متوسط: 3-7 أيام. كبير: يُتفق عليه.',a5t:'الدعم',a5p:'دعم مجاني 7 أيام بعد التسليم.',a6t:'تواصل',login:'تسجيل دخول',register:'إنشاء حساب',lbl1:'الإيميل',lbl2:'الباسورد',lbl3:'🔑 دخول',or:'أو',noAcc:'ما عندك حساب؟',createOne:'أنشئ حساب',haveAcc:'عندك حساب؟',signIn:'سجّل دخول',rl1:'الاسم',rl2:'الإيميل',rl3:'الباسورد (6 أحرف على الأقل)',rl4:'تأكيد الباسورد',rl5:'✅ إنشاء الحساب',ord1:'طلب مشروع',ord2:'📱 سيصلك رد من المطور مباشرة عبر واتساب',ord3:'اسم البوت / المشروع',ord4:'اسمك',ord5:'تواصل (واتساب أو ديسكورد)',ord6:'وصف ما تريده بالتفصيل',ord7:'الميزانية التقريبية',ord8:'طريقة الدفع',ord9:'📤 إرسال الطلب عبر واتساب',orderBtn:'🛒 اطلب الآن',customBtn:'✨ اطلب بوتك المخصص',customD:'بوت Discord مخصص',customT:'بوت Telegram مخصص',customW:'سيلف بوت واتساب مخصص',custa1:'✓ أي فكرة تريدها',custa2:'✓ سعر مخصص',unavail:'غير متوفر حالياً',ownerPanel:'لوحة المالك — مروان | Wano',ownerPanelBtn:'لوحة المالك',ptOrders:'📦 الطلبات',ptUsers:'👥 الحسابات',pUsersL:'مستخدم',footerRights:'جميع الحقوق محفوظة لـ',footerNote:'⚠️ إنشاء ملفات ومشاريع البوتات فقط — لا يشمل التشغيل أو الاستضافة',errFill:'⚠️ أدخل الإيميل والباسورد',errCap:'❌ إجابة الكابتشا خاطئة',errWrong:'❌ الإيميل أو الباسورد خاطئ',errFillAll:'⚠️ جميع الحقول مطلوبة',errEmail:'❌ إيميل غير صحيح',errPass:'❌ الباسورد أقل من 6 أحرف',errPassMatch:'❌ الباسوردان غير متطابقان',errExists:'❌ هذا الإيميل مسجل مسبقاً',errDesc:'⚠️ اشرح ما تريده بالتفصيل',welcome:'أهلاً',loggedOut:'تم تسجيل الخروج',orderSent:'✅ تم فتح واتساب!',dc1n:'Moderation Bot',dc1a1:'✓ باند / كيك / ميوت',dc1a2:'✓ تحذيرات',dc1a3:'✓ لوق كامل'},
en:{dir:'ltr',ll:'Language:',visits:'visits',orders:'orders',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'About',h1:'Available for orders',h2:'Professional Bots',h3:'For Every Platform',h4:'Custom bot development for Discord, Telegram, WhatsApp & Chrome — file creation only.',h5:'📦 Order Now',h6:'About Us',od:'Bot Developer — File creation only, no hosting',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'About',d1:'Discord Bots',d2:'All allowed bot types on Discord',about1:'About Us',about2:'Everything you need to know',a1t:'Who We Are',a1p:'Marwan | Wano — Bot developer for Discord, Telegram & WhatsApp.',a2t:'Important Note',a2p:'Service includes file creation only — no running or hosting.',a3t:'Payments',a3p:'Vodafone Cash, PayPal, Binance, USDT, Bank Transfer.',a4t:'Delivery',a4p:'Simple: 1-3 days. Medium: 3-7 days. Large: negotiated.',a5t:'Support',a5p:'Free 7-day support after delivery.',a6t:'Contact',login:'Login',register:'Sign Up',lbl1:'Email',lbl2:'Password',lbl3:'🔑 Login',or:'or',noAcc:"Don't have an account?",createOne:'Create one',haveAcc:'Have an account?',signIn:'Sign in',rl1:'Name',rl2:'Email',rl3:'Password (min 6 chars)',rl4:'Confirm Password',rl5:'✅ Create Account',ord1:'Order a Project',ord2:'📱 You will receive a reply via WhatsApp',ord3:'Bot / Project Name',ord4:'Your Name',ord5:'Contact (WhatsApp or Discord)',ord6:'Describe what you want in detail',ord7:'Approximate Budget',ord8:'Payment Method',ord9:'📤 Send via WhatsApp',orderBtn:'🛒 Order Now',customBtn:'✨ Order Custom Bot',customD:'Custom Discord Bot',customT:'Custom Telegram Bot',customW:'Custom WhatsApp Self-Bot',custa1:'✓ Any idea you want',custa2:'✓ Custom price',unavail:'Not Available',ownerPanel:'Owner Panel — Marwan | Wano',ownerPanelBtn:'Owner Panel',ptOrders:'📦 Orders',ptUsers:'👥 Users',pUsersL:'users',footerRights:'All rights reserved by',footerNote:'⚠️ File & project creation only — no running or hosting',errFill:'⚠️ Enter email and password',errCap:'❌ Wrong captcha answer',errWrong:'❌ Wrong email or password',errFillAll:'⚠️ All fields required',errEmail:'❌ Invalid email',errPass:'❌ Password too short (min 6)',errPassMatch:'❌ Passwords do not match',errExists:'❌ Email already registered',errDesc:'⚠️ Please describe what you want',welcome:'Welcome',loggedOut:'Logged out',orderSent:'✅ WhatsApp opened!',dc1n:'Moderation Bot',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Warnings system',dc1a3:'✓ Full logging'},
fr:{dir:'ltr',ll:'Langue:',visits:'visites',orders:'commandes',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'À propos',h1:'Disponible',h2:'Bots Professionnels',h3:'Pour chaque plateforme',h4:'Développement de bots pour Discord, Telegram, WhatsApp et Chrome.',h5:'📦 Commander',h6:'À propos',od:'Développeur — Création de fichiers uniquement',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'À propos',d1:'Bots Discord',d2:'Tous les bots autorisés',about1:'À Propos',about2:'Tout ce que vous devez savoir',a1t:'Qui sommes-nous',a1p:'Marwan | Wano — Développeur de bots.',a2t:'Note importante',a2p:'Le service inclut uniquement la création de fichiers.',a3t:'Paiements',a3p:'PayPal, Binance, USDT, virement.',a4t:'Délai',a4p:'Simple: 1-3j. Moyen: 3-7j.',a5t:'Support',a5p:'Support gratuit 7 jours.',a6t:'Contact',login:'Connexion',register:"S'inscrire",lbl1:'Email',lbl2:'Mot de passe',lbl3:'🔑 Connexion',or:'ou',noAcc:'Pas de compte?',createOne:'Créer',haveAcc:'Déjà un compte?',signIn:'Se connecter',rl1:'Nom',rl2:'Email',rl3:'Mot de passe (6+)',rl4:'Confirmer',rl5:'✅ Créer',ord1:'Commander',ord2:'📱 Réponse via WhatsApp',ord3:'Nom du projet',ord4:'Votre nom',ord5:'Contact',ord6:'Décrivez votre demande',ord7:'Budget',ord8:'Paiement',ord9:'📤 Envoyer',orderBtn:'🛒 Commander',customBtn:'✨ Bot personnalisé',customD:'Bot Discord personnalisé',customT:'Bot Telegram personnalisé',customW:'Bot WhatsApp personnalisé',custa1:'✓ Toute idée',custa2:'✓ Prix sur mesure',unavail:'Non disponible',ownerPanel:'Panel Propriétaire',ownerPanelBtn:'Panel',ptOrders:'📦 Commandes',ptUsers:'👥 Utilisateurs',pUsersL:'utilisateurs',footerRights:'Tous droits réservés',footerNote:'⚠️ Création de fichiers uniquement',errFill:'⚠️ Email et mot de passe requis',errCap:'❌ Mauvaise réponse',errWrong:'❌ Email ou mot de passe incorrect',errFillAll:'⚠️ Tous les champs requis',errEmail:'❌ Email invalide',errPass:'❌ Mot de passe trop court',errPassMatch:'❌ Mots de passe différents',errExists:'❌ Email déjà utilisé',errDesc:'⚠️ Décrivez votre demande',welcome:'Bienvenue',loggedOut:'Déconnecté',orderSent:'✅ WhatsApp ouvert!',dc1n:'Bot de Modération',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Avertissements',dc1a3:'✓ Logs complets'},
tr:{dir:'ltr',ll:'Dil:',visits:'ziyaret',orders:'sipariş',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'Hakkında',h1:'Siparişe hazır',h2:'Profesyonel Botlar',h3:'Her Platform İçin',h4:'Discord, Telegram, WhatsApp ve Chrome için bot geliştirme.',h5:'📦 Sipariş',h6:'Hakkımızda',od:'Geliştirici — Yalnızca dosya oluşturma',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Hakkında',d1:'Discord Botları',d2:'Tüm izin verilen botlar',about1:'Hakkımızda',about2:'Bilmeniz gereken her şey',a1t:'Biz Kimiz',a1p:'Marwan | Wano — Bot geliştirici.',a2t:'Önemli Not',a2p:'Hizmet yalnızca dosya oluşturmayı kapsar.',a3t:'Ödeme',a3p:'PayPal, Binance, USDT, banka.',a4t:'Teslimat',a4p:'Basit: 1-3 gün. Orta: 3-7 gün.',a5t:'Destek',a5p:'7 gün ücretsiz destek.',a6t:'İletişim',login:'Giriş',register:'Kayıt Ol',lbl1:'E-posta',lbl2:'Şifre',lbl3:'🔑 Giriş',or:'veya',noAcc:'Hesabın yok mu?',createOne:'Oluştur',haveAcc:'Hesabın var mı?',signIn:'Giriş yap',rl1:'Ad',rl2:'E-posta',rl3:'Şifre (min 6)',rl4:'Onayla',rl5:'✅ Oluştur',ord1:'Sipariş',ord2:'📱 WhatsApp yanıtı',ord3:'Bot adı',ord4:'Adınız',ord5:'İletişim',ord6:'Detaylı açıklayın',ord7:'Bütçe',ord8:'Ödeme',ord9:'📤 Gönder',orderBtn:'🛒 Sipariş Ver',customBtn:'✨ Özel Bot',customD:'Özel Discord Botu',customT:'Özel Telegram Botu',customW:'Özel WhatsApp Botu',custa1:'✓ Herhangi bir fikir',custa2:'✓ Özel fiyat',unavail:'Mevcut değil',ownerPanel:'Sahip Paneli',ownerPanelBtn:'Panel',ptOrders:'📦 Siparişler',ptUsers:'👥 Kullanıcılar',pUsersL:'kullanıcı',footerRights:'Tüm hakları saklıdır',footerNote:'⚠️ Yalnızca dosya oluşturma',errFill:'⚠️ E-posta ve şifre gerekli',errCap:'❌ Yanlış captcha',errWrong:'❌ Yanlış e-posta veya şifre',errFillAll:'⚠️ Tüm alanlar gerekli',errEmail:'❌ Geçersiz e-posta',errPass:'❌ Şifre çok kısa',errPassMatch:'❌ Şifreler eşleşmiyor',errExists:'❌ E-posta zaten kayıtlı',errDesc:'⚠️ Lütfen açıklayın',welcome:'Hoşgeldin',loggedOut:'Çıkış yapıldı',orderSent:'✅ WhatsApp açıldı!',dc1n:'Moderasyon Botu',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Uyarılar',dc1a3:'✓ Tam log'},
de:{dir:'ltr',ll:'Sprache:',visits:'Besuche',orders:'Bestellungen',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'Über uns',h1:'Verfügbar',h2:'Professionelle Bots',h3:'Für jede Plattform',h4:'Bot-Entwicklung für Discord, Telegram, WhatsApp und Chrome.',h5:'📦 Bestellen',h6:'Über uns',od:'Entwickler — Nur Dateierstellung',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Über',d1:'Discord Bots',d2:'Alle erlaubten Bot-Typen',about1:'Über Uns',about2:'Alles was Sie wissen müssen',a1t:'Wer wir sind',a1p:'Marwan | Wano — Bot-Entwickler.',a2t:'Wichtiger Hinweis',a2p:'Nur Dateierstellung, kein Hosting.',a3t:'Zahlung',a3p:'PayPal, Binance, USDT, Bank.',a4t:'Lieferzeit',a4p:'Einfach: 1-3 T. Mittel: 3-7 T.',a5t:'Support',a5p:'7 Tage kostenloser Support.',a6t:'Kontakt',login:'Anmelden',register:'Registrieren',lbl1:'E-Mail',lbl2:'Passwort',lbl3:'🔑 Anmelden',or:'oder',noAcc:'Kein Konto?',createOne:'Erstellen',haveAcc:'Schon ein Konto?',signIn:'Einloggen',rl1:'Name',rl2:'E-Mail',rl3:'Passwort (min 6)',rl4:'Bestätigen',rl5:'✅ Konto erstellen',ord1:'Bestellen',ord2:'📱 Antwort per WhatsApp',ord3:'Bot-Name',ord4:'Ihr Name',ord5:'Kontakt',ord6:'Detailliert beschreiben',ord7:'Budget',ord8:'Zahlung',ord9:'📤 Senden',orderBtn:'🛒 Bestellen',customBtn:'✨ Eigener Bot',customD:'Eigener Discord Bot',customT:'Eigener Telegram Bot',customW:'Eigener WhatsApp Bot',custa1:'✓ Jede Idee',custa2:'✓ Individueller Preis',unavail:'Nicht verfügbar',ownerPanel:'Besitzer-Panel',ownerPanelBtn:'Panel',ptOrders:'📦 Bestellungen',ptUsers:'👥 Nutzer',pUsersL:'Nutzer',footerRights:'Alle Rechte vorbehalten',footerNote:'⚠️ Nur Dateierstellung, kein Hosting',errFill:'⚠️ E-Mail und Passwort eingeben',errCap:'❌ Falsche Captcha-Antwort',errWrong:'❌ Falsche E-Mail oder Passwort',errFillAll:'⚠️ Alle Felder ausfüllen',errEmail:'❌ Ungültige E-Mail',errPass:'❌ Passwort zu kurz',errPassMatch:'❌ Passwörter stimmen nicht überein',errExists:'❌ E-Mail bereits registriert',errDesc:'⚠️ Bitte beschreiben Sie',welcome:'Willkommen',loggedOut:'Abgemeldet',orderSent:'✅ WhatsApp geöffnet!',dc1n:'Moderations-Bot',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Verwarnungen',dc1a3:'✓ Vollständige Logs'},
es:{dir:'ltr',ll:'Idioma:',visits:'visitas',orders:'pedidos',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'Nosotros',h1:'Disponible',h2:'Bots Profesionales',h3:'Para cada plataforma',h4:'Desarrollo de bots para Discord, Telegram, WhatsApp y Chrome.',h5:'📦 Pedir',h6:'Sobre nosotros',od:'Desarrollador — Solo creación de archivos',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Nosotros',d1:'Bots Discord',d2:'Todos los bots permitidos',about1:'Sobre Nosotros',about2:'Todo lo que necesitas saber',a1t:'Quiénes somos',a1p:'Marwan | Wano — Desarrollador de bots.',a2t:'Nota importante',a2p:'Solo creación de archivos, sin hosting.',a3t:'Pagos',a3p:'PayPal, Binance, USDT, banco.',a4t:'Entrega',a4p:'Simple: 1-3d. Medio: 3-7d.',a5t:'Soporte',a5p:'7 días de soporte gratuito.',a6t:'Contacto',login:'Iniciar sesión',register:'Registrarse',lbl1:'Email',lbl2:'Contraseña',lbl3:'🔑 Entrar',or:'o',noAcc:'¿Sin cuenta?',createOne:'Crear',haveAcc:'¿Tienes cuenta?',signIn:'Iniciar',rl1:'Nombre',rl2:'Email',rl3:'Contraseña (mín 6)',rl4:'Confirmar',rl5:'✅ Crear cuenta',ord1:'Pedir',ord2:'📱 Respuesta por WhatsApp',ord3:'Nombre del bot',ord4:'Tu nombre',ord5:'Contacto',ord6:'Describe detalladamente',ord7:'Presupuesto',ord8:'Pago',ord9:'📤 Enviar',orderBtn:'🛒 Pedir',customBtn:'✨ Bot Personalizado',customD:'Bot Discord Personalizado',customT:'Bot Telegram Personalizado',customW:'Bot WhatsApp Personalizado',custa1:'✓ Cualquier idea',custa2:'✓ Precio personalizado',unavail:'No disponible',ownerPanel:'Panel del Propietario',ownerPanelBtn:'Panel',ptOrders:'📦 Pedidos',ptUsers:'👥 Usuarios',pUsersL:'usuarios',footerRights:'Todos los derechos reservados',footerNote:'⚠️ Solo creación de archivos, sin hosting',errFill:'⚠️ Email y contraseña requeridos',errCap:'❌ Captcha incorrecto',errWrong:'❌ Email o contraseña incorrectos',errFillAll:'⚠️ Todos los campos son obligatorios',errEmail:'❌ Email inválido',errPass:'❌ Contraseña demasiado corta',errPassMatch:'❌ Las contraseñas no coinciden',errExists:'❌ Email ya registrado',errDesc:'⚠️ Por favor describe lo que quieres',welcome:'Bienvenido',loggedOut:'Sesión cerrada',orderSent:'✅ WhatsApp abierto!',dc1n:'Bot de Moderación',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Advertencias',dc1a3:'✓ Logs completos'},
ru:{dir:'ltr',ll:'Язык:',visits:'посещений',orders:'заказов',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'О нас',h1:'Доступен',h2:'Профессиональные Боты',h3:'Для каждой платформы',h4:'Разработка ботов для Discord, Telegram, WhatsApp и Chrome.',h5:'📦 Заказать',h6:'О нас',od:'Разработчик — Только создание файлов',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'О нас',d1:'Discord Боты',d2:'Все разрешённые боты',about1:'О нас',about2:'Всё что нужно знать',a1t:'Кто мы',a1p:'Marwan | Wano — Разработчик ботов.',a2t:'Важное',a2p:'Только создание файлов, без хостинга.',a3t:'Оплата',a3p:'PayPal, Binance, USDT, банк.',a4t:'Доставка',a4p:'Простой: 1-3д. Средний: 3-7д.',a5t:'Поддержка',a5p:'7 дней бесплатной поддержки.',a6t:'Контакт',login:'Войти',register:'Регистрация',lbl1:'Email',lbl2:'Пароль',lbl3:'🔑 Войти',or:'или',noAcc:'Нет аккаунта?',createOne:'Создать',haveAcc:'Есть аккаунт?',signIn:'Войти',rl1:'Имя',rl2:'Email',rl3:'Пароль (мин 6)',rl4:'Подтвердить',rl5:'✅ Создать',ord1:'Заказать',ord2:'📱 Ответ через WhatsApp',ord3:'Название бота',ord4:'Ваше имя',ord5:'Контакт',ord6:'Опишите детально',ord7:'Бюджет',ord8:'Оплата',ord9:'📤 Отправить',orderBtn:'🛒 Заказать',customBtn:'✨ Кастомный Бот',customD:'Кастомный Discord Бот',customT:'Кастомный Telegram Бот',customW:'Кастомный WhatsApp Бот',custa1:'✓ Любая идея',custa2:'✓ Индивидуальная цена',unavail:'Недоступно',ownerPanel:'Панель Владельца',ownerPanelBtn:'Панель',ptOrders:'📦 Заказы',ptUsers:'👥 Пользователи',pUsersL:'пользователей',footerRights:'Все права защищены',footerNote:'⚠️ Только создание файлов, без хостинга',errFill:'⚠️ Введите email и пароль',errCap:'❌ Неверный ответ',errWrong:'❌ Неверный email или пароль',errFillAll:'⚠️ Все поля обязательны',errEmail:'❌ Неверный email',errPass:'❌ Пароль слишком короткий',errPassMatch:'❌ Пароли не совпадают',errExists:'❌ Email уже зарегистрирован',errDesc:'⚠️ Пожалуйста опишите',welcome:'Добро пожаловать',loggedOut:'Выход выполнен',orderSent:'✅ WhatsApp открыт!',dc1n:'Бот модерации',dc1a1:'✓ Бан / Кик / Мут',dc1a2:'✓ Предупреждения',dc1a3:'✓ Полные логи'},
pt:{dir:'ltr',ll:'Idioma:',visits:'visitas',orders:'pedidos',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'Sobre',h1:'Disponível',h2:'Bots Profissionais',h3:'Para cada plataforma',h4:'Desenvolvimento de bots para Discord, Telegram, WhatsApp e Chrome.',h5:'📦 Pedir',h6:'Sobre nós',od:'Desenvolvedor — Apenas criação de arquivos',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Sobre',d1:'Bots Discord',d2:'Todos os bots permitidos',about1:'Sobre Nós',about2:'Tudo que você precisa saber',a1t:'Quem somos',a1p:'Marwan | Wano — Desenvolvedor de bots.',a2t:'Nota importante',a2p:'Apenas criação de arquivos, sem hospedagem.',a3t:'Pagamento',a3p:'PayPal, Binance, USDT, banco.',a4t:'Entrega',a4p:'Simples: 1-3d. Médio: 3-7d.',a5t:'Suporte',a5p:'7 dias de suporte gratuito.',a6t:'Contato',login:'Entrar',register:'Cadastrar',lbl1:'Email',lbl2:'Senha',lbl3:'🔑 Entrar',or:'ou',noAcc:'Sem conta?',createOne:'Criar',haveAcc:'Tem conta?',signIn:'Entrar',rl1:'Nome',rl2:'Email',rl3:'Senha (mín 6)',rl4:'Confirmar',rl5:'✅ Criar conta',ord1:'Pedir',ord2:'📱 Resposta via WhatsApp',ord3:'Nome do bot',ord4:'Seu nome',ord5:'Contato',ord6:'Descreva em detalhes',ord7:'Orçamento',ord8:'Pagamento',ord9:'📤 Enviar',orderBtn:'🛒 Pedir',customBtn:'✨ Bot Personalizado',customD:'Bot Discord Personalizado',customT:'Bot Telegram Personalizado',customW:'Bot WhatsApp Personalizado',custa1:'✓ Qualquer ideia',custa2:'✓ Preço personalizado',unavail:'Indisponível',ownerPanel:'Painel do Proprietário',ownerPanelBtn:'Painel',ptOrders:'📦 Pedidos',ptUsers:'👥 Usuários',pUsersL:'usuários',footerRights:'Todos os direitos reservados',footerNote:'⚠️ Apenas criação de arquivos, sem hospedagem',errFill:'⚠️ Email e senha necessários',errCap:'❌ Captcha incorreto',errWrong:'❌ Email ou senha incorretos',errFillAll:'⚠️ Todos os campos são obrigatórios',errEmail:'❌ Email inválido',errPass:'❌ Senha muito curta',errPassMatch:'❌ Senhas não coincidem',errExists:'❌ Email já registrado',errDesc:'⚠️ Por favor descreva',welcome:'Bem-vindo',loggedOut:'Saiu',orderSent:'✅ WhatsApp aberto!',dc1n:'Bot de Moderação',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Avisos',dc1a3:'✓ Logs completos'},
id:{dir:'ltr',ll:'Bahasa:',visits:'kunjungan',orders:'pesanan',nav1:'Discord',nav2:'Telegram',nav3:'WhatsApp',nav6:'Tentang',h1:'Tersedia',h2:'Bot Profesional',h3:'Untuk Setiap Platform',h4:'Pengembangan bot untuk Discord, Telegram, WhatsApp dan Chrome.',h5:'📦 Pesan',h6:'Tentang Kami',od:'Pengembang Bot — Hanya pembuatan file',t1:'Discord',t2:'Telegram',t3:'WhatsApp',t6:'Tentang',d1:'Bot Discord',d2:'Semua jenis bot yang diizinkan',about1:'Tentang Kami',about2:'Semua yang perlu Anda ketahui',a1t:'Siapa Kami',a1p:'Marwan | Wano — Pengembang bot.',a2t:'Catatan Penting',a2p:'Hanya pembuatan file, tanpa hosting.',a3t:'Pembayaran',a3p:'PayPal, Binance, USDT, bank.',a4t:'Pengiriman',a4p:'Sederhana: 1-3h. Menengah: 3-7h.',a5t:'Dukungan',a5p:'7 hari dukungan gratis.',a6t:'Kontak',login:'Masuk',register:'Daftar',lbl1:'Email',lbl2:'Kata sandi',lbl3:'🔑 Masuk',or:'atau',noAcc:'Belum punya akun?',createOne:'Buat',haveAcc:'Sudah punya akun?',signIn:'Masuk',rl1:'Nama',rl2:'Email',rl3:'Kata sandi (min 6)',rl4:'Konfirmasi',rl5:'✅ Buat Akun',ord1:'Pesan',ord2:'📱 Balasan via WhatsApp',ord3:'Nama bot',ord4:'Nama Anda',ord5:'Kontak',ord6:'Jelaskan secara detail',ord7:'Anggaran',ord8:'Pembayaran',ord9:'📤 Kirim',orderBtn:'🛒 Pesan Sekarang',customBtn:'✨ Bot Kustom',customD:'Bot Discord Kustom',customT:'Bot Telegram Kustom',customW:'Bot WhatsApp Kustom',custa1:'✓ Ide apa saja',custa2:'✓ Harga khusus',unavail:'Tidak tersedia',ownerPanel:'Panel Pemilik',ownerPanelBtn:'Panel',ptOrders:'📦 Pesanan',ptUsers:'👥 Pengguna',pUsersL:'pengguna',footerRights:'Hak cipta dilindungi',footerNote:'⚠️ Hanya pembuatan file, tanpa hosting',errFill:'⚠️ Masukkan email dan kata sandi',errCap:'❌ Jawaban captcha salah',errWrong:'❌ Email atau kata sandi salah',errFillAll:'⚠️ Semua kolom wajib diisi',errEmail:'❌ Email tidak valid',errPass:'❌ Kata sandi terlalu pendek',errPassMatch:'❌ Kata sandi tidak cocok',errExists:'❌ Email sudah terdaftar',errDesc:'⚠️ Tolong jelaskan permintaan Anda',welcome:'Selamat datang',loggedOut:'Keluar',orderSent:'✅ WhatsApp dibuka!',dc1n:'Bot Moderasi',dc1a1:'✓ Ban / Kick / Mute',dc1a2:'✓ Peringatan',dc1a3:'✓ Log lengkap'}
};

function setLang(l, btn) {
  currentLang = l;
  const t = T[l] || T.ar;
  document.documentElement.lang = l;
  document.documentElement.dir = t.dir;
  document.querySelectorAll('.lb').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  document.getElementById('ll').textContent = t.ll;
  document.querySelectorAll('[data-i]').forEach(el => {
    const k = el.getAttribute('data-i');
    if(t[k] !== undefined) el.textContent = t[k];
  });
  renderAuth();
}
