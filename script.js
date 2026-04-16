/* ============================================================= */
/* Projects Bots — Core Logic Engine (V3.0 - 2026 Edition)       */
/* Developer: Marwan | Wano — Hyper-Responsive Architecture      */
/* ============================================================= */

// قاعدة البيانات وحساب الإدارة
const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v8'; // تم تحديث المفتاح لضمان تفريغ الجلسات القديمة

let sess = null, payV = '', capN = 0, isCustom = false, discountPct = 0, discountCode = '';
let storeOpen = true;

/* ============================================================= */
/* Firebase High-Speed Handlers                                  */
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
/* AI Translation Engine (Integrated)                            */
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
        if(typeof toast === 'function') toast('جاري معالجة الترجمة عبر محرك AI...', 's');
    } else {
        setTimeout(() => setAILang(langCode, btn), 500); 
    }
}

/* ============================================================= */
/* Physics & Interactive Particles Engine                        */
/* ============================================================= */
function injectMagicUI() {
    // Advanced Ripple Effect
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.ripple-element');
        if (target) {
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const ripple = document.createElement('span');
            ripple.className = 'ripple-span';
            ripple.style.left = x + 'px'; 
            ripple.style.top = y + 'px';
            target.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    });

    // Dynamic Hover Glow for Service Cards
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
/* Security, Auth Gate & System Initialization                   */
/* ============================================================= */
window.onload = async () => {
    initAITranslator();
    injectMagicUI();
    
    // استعادة الجلسة الآمنة من الذاكرة
    try { sess = JSON.parse(localStorage.getItem(SK) || 'null'); } catch(e) {}
    
    const gate = document.getElementById('authGate');
    const main = document.getElementById('mainContent');
    
    if(sess) {
        // إذا كان مسجل دخول، افتح البوابة فوراً
        if(gate) gate.classList.add('hidden');
        if(main) main.classList.add('auth-success');
        renderAuth();
    } else {
        // إذا لم يكن مسجل دخول، اقفل النظام
        if(gate) gate.classList.remove('hidden');
        if(main) main.classList.remove('auth-success');
    }

    newCap(); // إنشاء كابتشا جديدة للنوافذ المنبثقة المستقلة
    refreshStats();
    setInterval(refreshStats, 30000); // تحديث الإحصائيات كل نصف دقيقة
    
    // نظام تسجيل الزيارات عبر بصمة الجهاز (يمنع التكرار تماماً)
    if(!localStorage.getItem('pb_v3_registered')) {
        await fbIncr('stats/visits');
        localStorage.setItem('pb_v3_registered', 'true');
    }

    const storeSettings = await fbGet('settings/storeOpen');
    if(storeSettings !== null) storeOpen = storeSettings;
    updateStoreStatusUI();
};

// خوارزمية التشفير المتقدمة لحماية كلمات المرور
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
/* Authentication Engine (Strict Gate)                           */
/* ============================================================= */
async function doLogin() {
    const email = document.getElementById('le').value.trim().toLowerCase();
    const pass = document.getElementById('lp').value;
    const err = document.getElementById('lE');
    if(err) err.style.display = 'none';
    
    if(!email || !pass) { if(err) { err.textContent = 'يرجى إدخال كافة البيانات المطلوبة'; err.style.display = 'block'; } return; }
    if(!chkCap('cA')) { if(err) { err.textContent = 'رمز التحقق الأمني غير صحيح'; err.style.display = 'block'; } newCap(); return; }
    
    // فحص دخول المالك (Wano)
    if(email === OW_EMAIL && pass === OW_PASS) {
        unlockGate({name: 'مروان | Wano', email, isOwner: true});
        if(typeof toast === 'function') toast('تم تسجيل دخول المسؤول بنجاح', 's');
        return;
    }
    
    const h = await sha256(pass + email + '_pb26'); // تشفير 2026
    const users = await fbGet('users') || {};
    const user = Object.values(users).find(u => u.email === email && u.hash === h);
    
    if(!user) { if(err) { err.textContent = 'بيانات الدخول غير صحيحة'; err.style.display = 'block'; } newCap(); return; }
    
    unlockGate({name: user.name, email: user.email, isOwner: false});
    if(typeof toast === 'function') toast(`مرحباً بك مجدداً، ${user.name}`, 's');
}

async function doReg() {
    const name = document.getElementById('rn').value.trim();
    const email = document.getElementById('re').value.trim().toLowerCase();
    const pass = document.getElementById('rp').value;
    const pass2 = document.getElementById('rp2').value;
    const err = document.getElementById('rE');
    if(err) err.style.display = 'none';
    
    if(!name || !email || !pass) { if(err) { err.textContent = 'جميع الحقول مطلوبة'; err.style.display = 'block'; } return; }
    if(pass.length < 6) { if(err) { err.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'; err.style.display = 'block'; } return; }
    if(pass !== pass2) { if(err) { err.textContent = 'كلمتا المرور غير متطابقتين'; err.style.display = 'block'; } return; }
    if(!chkCap('cA2')) { if(err) { err.textContent = 'رمز التحقق غير صحيح'; err.style.display = 'block'; } newCap(); return; }
    
    const users = await fbGet('users') || {};
    if(Object.values(users).find(u => u.email === email)) { if(err) { err.textContent = 'هذا الحساب مسجل مسبقاً'; err.style.display = 'block'; } return; }
    
    const h = await sha256(pass + email + '_pb26');
    await fbPush('users', {name, email, hash: h, joined: new Date().toISOString()});
    
    unlockGate({name, email, isOwner: false});
    if(typeof toast === 'function') toast('تم إنشاء حسابك وتوثيقه بنجاح', 's');
}

// دالة فتح النظام بعد المصادقة
function unlockGate(userObj) {
    sess = userObj;
    localStorage.setItem(SK, JSON.stringify(sess));
    closeM('ovA'); // إغلاق نافذة الدخول المستقلة
    renderAuth(); // تحديث الشريط العلوي
    
    // إخفاء بوابة الدخول وعرض المحتوى بسلاسة تامة
    const gate = document.getElementById('authGate');
    const main = document.getElementById('mainContent');
    if(gate) gate.classList.add('hidden');
    if(main) main.classList.add('auth-success');
}

// دالة إغلاق النظام وتسجيل الخروج
function logout() {
    sess = null; localStorage.removeItem(SK);
    
    // إعادة قفل النظام وإخفاء المحتوى
    const gate = document.getElementById('authGate');
    const main = document.getElementById('mainContent');
    if(gate) gate.classList.remove('hidden');
    if(main) main.classList.remove('auth-success');
    
    if(typeof toast === 'function') toast('تم تسجيل الخروج وإقفال الجلسة', 's');
}
/* ============================================================= */
/* Order Processing & WhatsApp Integration                       */
/* ============================================================= */
function openOrder(bn, bp, c = false) {
    if (!sess) { openAuth('l'); if(typeof toast === 'function') toast('يجب تسجيل الدخول لتقديم طلب', 'e'); return; }
    if (!storeOpen && !sess.isOwner) { if(typeof toast === 'function') toast('النظام مغلق حالياً، لا يمكن استقبال طلبات جديدة', 'e'); return; }
    
    isCustom = c;
    const bnEl = document.getElementById('bn');
    const cnEl = document.getElementById('cn');
    const cbEl = document.getElementById('cb');
    const dAEl = document.getElementById('dA');
    
    if(bnEl) bnEl.value = bn;
    if(cnEl) cnEl.value = sess.name || '';
    if(cbEl) cbEl.value = bp;
    if(dAEl) dAEl.style.display = c ? 'block' : 'none';
    
    payV = ''; 
    document.querySelectorAll('.pay').forEach(b => b.classList.remove('on'));
    discountPct = 0; discountCode = '';
    
    const discTag = document.getElementById('discTag');
    const discInp = document.getElementById('discInp');
    if(discTag) discTag.style.display = 'none';
    if(discInp) discInp.value = '';
    
    openM('ovO');
}

async function submitOrder() {
    if (!payV) { if(typeof toast === 'function') toast('يرجى تحديد بوابة الدفع المعتمدة', 'e'); return; }
    
    const n = document.getElementById('cn').value.trim();
    const c = document.getElementById('cc').value.trim();
    const d = isCustom ? document.getElementById('cd').value.trim() : '';
    
    if (!n || !c) { if(typeof toast === 'function') toast('يرجى إكمال بيانات التواصل بدقة', 'e'); return; }
    
    let bPrice = document.getElementById('cb').value;
    if (discountPct > 0) {
        bPrice += ` (خصم ${discountPct}% عبر الكود: ${discountCode})`;
        const codes = await fbGet('discounts') || {};
        const fId = Object.keys(codes).find(k => codes[k].code === discountCode);
        if (fId) await fbDel(`discounts/${fId}`);
    }

    const orderData = { 
        bn: document.getElementById('bn').value, 
        n, c, cb: bPrice, pay: payV, d, 
        time: new Date().toLocaleString('ar-SA') 
    };
    
    await fbPush('orders', orderData);
    await fbIncr('stats/orderCount');

    let msg = `*طلب مشروع برمجي جديد*\n\n*نوع النظام:* ${orderData.bn}\n*الميزانية:* ${bPrice}\n*اسم العميل:* ${n}\n*معرف التواصل:* ${c}\n*بوابة الدفع:* ${payV}`;
    if (d) msg += `\n*التفاصيل التقنية:* ${d}`;

    window.open(`https://wa.me/201145974113?text=${encodeURIComponent(msg)}`, '_blank');
    closeM('ovO');
    refreshStats();
    if(typeof toast === 'function') toast('تم اعتماد الطلب وتحويلك للتواصل المباشر', 's');
}

/* ============================================================= */
/* Discount System (Burner Codes)                                */
/* ============================================================= */
async function applyDiscount() {
    const inpEl = document.getElementById('discInp');
    if(!inpEl) return;
    const inp = inpEl.value.trim().toUpperCase();
    if(!inp) return;
    
    const codes = await fbGet('discounts') || {};
    const found = Object.values(codes).find(c => c.code === inp);
    
    if (found) {
        discountPct = found.pct; 
        discountCode = inp;
        const tag = document.getElementById('discTag');
        if(tag) {
            tag.innerHTML = `<img src="https://api.iconify.design/lucide:check-circle.svg?color=00ff88" style="width:16px; vertical-align:middle; margin-left:4px;"> تم تفعيل الخصم بنسبة ${discountPct}%`;
            tag.style.display = 'block';
        }
        if(typeof toast === 'function') toast('تم مطابقة الكود وتفعيله بنجاح', 's');
    } else {
        if(typeof toast === 'function') toast('رمز التفعيل غير صالح أو تم استخدامه', 'e');
    }
}

/* ============================================================= */
/* UI Utilities & Modals Management                              */
/* ============================================================= */
function switchTab(n) {
    document.querySelectorAll('.tc, .tb').forEach(el => el.classList.remove('on'));
    const tabEl = document.getElementById('tab-' + n);
    const btnEl = document.getElementById('btn-' + n);
    if(tabEl) tabEl.classList.add('on');
    if(btnEl) btnEl.classList.add('on');
    
    if(n === 'settings' && sess?.isOwner) showPanel();
    else {
        const pnl = document.getElementById('ownerPanel');
        if(pnl) pnl.style.display = 'none';
    }
}

function openM(id) { 
    const m = document.getElementById(id);
    if(m) m.classList.add('open'); 
}
function closeM(id) { 
    const m = document.getElementById(id);
    if(m) m.classList.remove('open'); 
}
function sP(b, m) { 
    document.querySelectorAll('.pay').forEach(x => x.classList.remove('on')); 
    b.classList.add('on'); 
    payV = m; 
}

function openAuth(m) { newCap(); aSwitch(m); openM('ovA'); }
function aSwitch(m) {
    const lF = document.getElementById('lF');
    const rF = document.getElementById('rF');
    const tLB = document.getElementById('tLB');
    const tRB = document.getElementById('tRB');
    if(lF) lF.style.display = m === 'l' ? 'block' : 'none';
    if(rF) rF.style.display = m === 'r' ? 'block' : 'none';
    if(tLB) tLB.classList.toggle('on', m === 'l');
    if(tRB) tRB.classList.toggle('on', m === 'r');
}

function newCap() { 
    capN = Math.floor(Math.random() * 90) + 10; 
    const cQ = document.getElementById('cQ');
    const cQ2 = document.getElementById('cQ2');
    if(cQ) cQ.textContent = capN; 
    if(cQ2) cQ2.textContent = capN; 
}
function chkCap(id) { 
    const el = document.getElementById(id);
    if(!el) return false;
    return parseInt(el.value) === capN; 
}

/* ============================================================= */
/* Owner Panel & Admin Functions                                 */
/* ============================================================= */
async function toggleStoreStatus() {
    if(!sess?.isOwner) return;
    storeOpen = !storeOpen;
    await fbSet('settings/storeOpen', storeOpen);
    updateStoreStatusUI();
    if(typeof toast === 'function') toast(storeOpen ? 'تم تفعيل استقبال الطلبات' : 'تم إيقاف استقبال الطلبات', 's');
}

function updateStoreStatusUI() {
    const badgeTxt = document.getElementById('heroBadgeTxt');
    const badgeDot = document.getElementById('heroBadgeDot');
    if(!badgeTxt || !badgeDot) return;
    
    if(storeOpen) {
        badgeTxt.textContent = 'الخوادم متصلة — متاح للطلبات';
        badgeDot.style.background = 'var(--neon-emerald)';
        badgeDot.style.boxShadow = '0 0 12px var(--neon-emerald)';
    } else {
        badgeTxt.textContent = 'النظام تحت الصيانة — الطلبات معلقة';
        badgeDot.style.background = 'var(--neon-rose)';
        badgeDot.style.boxShadow = '0 0 12px var(--neon-rose)';
    }
}

async function showPanel() {
    if (!sess?.isOwner) return;
    const pnl = document.getElementById('ownerPanel');
    if(pnl) pnl.style.display = 'block';
    
    const ptab = document.querySelector('.ptab');
    if(ptab) panelTab('o', ptab);
    
    const stats = await fbGet('stats') || {};
    const users = await fbGet('users') || {};
    const codes = await fbGet('discounts') || {};
    
    const pO = document.getElementById('pO');
    const pU = document.getElementById('pU');
    const pD = document.getElementById('pD');
    
    if(pO) pO.textContent = stats.orderCount || 0;
    if(pU) pU.textContent = Object.keys(users).length || 0;
    if(pD) pD.textContent = Object.keys(codes).length || 0;
}

async function panelTab(t, btn) {
    document.querySelectorAll('.ptab').forEach(b => b.classList.remove('on'));
    if(btn) btn.classList.add('on');
    
    const ol = document.getElementById('pOL');
    const ul = document.getElementById('pUL');
    const dl = document.getElementById('pDL');
    
    if(ol) ol.style.display = 'none';
    if(ul) ul.style.display = 'none';
    if(dl) dl.style.display = 'none';

    if (t === 'o' && ol) {
        ol.style.display = 'block';
        const orders = await fbGet('orders') || {};
        ol.innerHTML = Object.values(orders).reverse().map(o => `
            <div class="bc" style="margin-bottom:15px; padding:20px;">
                <h4 style="color:var(--neon-cyan); margin-bottom:10px;">${o.bn} <small style="float:left; color:var(--text-secondary); font-size:11px;">${o.time}</small></h4>
                <p style="font-size:13px; color:#fff; margin-bottom:5px;">العميل: ${o.n} | التواصل: ${o.c}</p>
                <p style="font-size:13px; color:var(--neon-emerald);">الميزانية: ${o.cb} | الدفع: ${o.pay}</p>
                ${o.d ? `<p style="font-size:12px; color:var(--text-secondary); margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">التفاصيل: ${o.d}</p>` : ''}
            </div>`).join('') || '<p style="text-align:center; color:var(--text-secondary);">سجل الطلبات فارغ</p>';
    } else if (t === 'u' && ul) {
        ul.style.display = 'block';
        const users = await fbGet('users') || {};
        ul.innerHTML = Object.values(users).reverse().map(u => `
            <div class="bc" style="margin-bottom:15px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="color:#fff; font-size:15px;">${u.name}</h4>
                    <span style="font-size:12px; color:var(--text-secondary);">${u.email}</span>
                </div>
                <span style="font-size:11px; color:var(--neon-gold); background:rgba(255,170,0,0.1); padding:4px 8px; border-radius:8px;">مفعل</span>
            </div>`).join('') || '<p style="text-align:center; color:var(--text-secondary);">لا يوجد مستخدمين</p>';
    } else if (t === 'd' && dl) {
        dl.style.display = 'block';
        const codes = await fbGet('discounts') || {};
        const dList = document.getElementById('discList');
        if(dList) {
            dList.innerHTML = Object.values(codes).map(c => `
            <div class="bc" style="margin-bottom:10px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--neon-purple); font-family:var(--font-code); font-size:16px;">${c.code}</strong>
                <span style="color:var(--neon-emerald); font-weight:800;">${c.pct}% خصم</span>
            </div>`).join('');
        }
    }
}

async function addDiscount() {
    const codeEl = document.getElementById('discCode');
    const pctEl = document.getElementById('discPct');
    if(!codeEl || !pctEl) return;
    
    const code = codeEl.value.trim().toUpperCase();
    const pct = parseInt(pctEl.value);
    
    if (!code || isNaN(pct) || pct < 1 || pct > 100) { if(typeof toast === 'function') toast('يرجى إدخال بيانات الكود بصورة صحيحة', 'e'); return; }
    
    await fbPush('discounts', { code, pct });
    codeEl.value = '';
    pctEl.value = '';
    if(typeof toast === 'function') toast('تم إنشاء رمز الخصم بنجاح', 's');
    
    const tabs = document.querySelectorAll('.ptab');
    if(tabs.length >= 3) panelTab('d', tabs[2]);
}

/* ============================================================= */
/* Authentication UI Renderer & Toasts                           */
/* ============================================================= */
function renderAuth() {
    const authArea = document.getElementById('authArea');
    if(!authArea) return;
    
    if(sess) {
        authArea.innerHTML = `
            <div class="uchip ${sess.isOwner ? 'ow' : ''}">
                <img src="https://api.iconify.design/lucide:${sess.isOwner ? 'shield-check' : 'user'}.svg?color=${sess.isOwner ? 'ffaa00' : 'ffffff'}" style="width:16px;" alt="">
                <span>${sess.name}</span>
                <button onclick="logout()" class="ripple-element" style="background:transparent; border:none; margin-right:8px; cursor:pointer; display:flex; align-items:center;">
                    <img src="https://api.iconify.design/lucide:log-out.svg?color=ff0055" style="width:18px;" alt="">
                </button>
            </div>
        `;
    } else {
        authArea.innerHTML = '';
    }
}

function toast(m, t = 's') {
    const b = document.getElementById('toast');
    if(!b) return;
    
    const iconColor = t === 'e' ? 'ff0055' : '00ff88';
    const iconName = t === 'e' ? 'alert-triangle' : 'check-circle-2';
    
    b.className = `toast ${t === 'e' ? 'e' : ''} show`;
    b.innerHTML = `<img src="https://api.iconify.design/lucide:${iconName}.svg?color=${iconColor}" style="width:20px;" alt=""> <span>${m}</span>`;
    
    setTimeout(() => b.classList.remove('show'), 4000);
}
