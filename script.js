/* ============================================================= */
/* Projects Bots — Core Logic Engine (V3.0 - 2026 Edition)       */
/* Developer: Marwan | Wano — Hyper-Responsive Architecture      */
/* ============================================================= */

// قاعدة البيانات وحساب الإدارة (مستخرج من ملفك الأصلي)
const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v2026'; 

let sess = null, payV = '', capN = 0, isCustom = false, discountPct = 0, discountCode = '';
let storeOpen = true;

/* ============================================================= */
/* Firebase High-Speed Handlers                                  */
/* ============================================================= */
async function fbGet(path) { 
    try { 
        const r = await fetch(`${FB}/${path}.json?_t=${Date.now()}`, { cache: 'no-store' }); 
        return r.ok ? await r.json() : null; 
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
        toast('جاري معالجة الترجمة عبر محرك AI...', 's');
    } else {
        setTimeout(() => setAILang(langCode, btn), 500); 
    }
}
/* ============================================================= */
/* 2. Authentication & Session Management                        */
/* ============================================================= */
async function doLogin() {
    const e = document.getElementById('le').value, p = document.getElementById('lp').value;
    if(!e || !p) return toast('يرجى ملء كافة الحقول', 'e');
    
    toast('جاري التحقق...', 's');
    const u = await fbGet(`users/${btoa(e).replace(/=/g,'')}`);
    
    if(u && u.p === p) {
        sess = u;
        localStorage.setItem(SK, JSON.stringify(u));
        closeM('ovA');
        authUI();
        toast(`مرحباً بك مجدداً، ${u.n}`, 's');
        checkOwnerAccess(); // التحقق من صلاحيات الأونر فور الدخول
    } else {
        toast('البريد أو كلمة المرور غير صحيحة', 'e');
    }
}

async function doReg() {
    const n = document.getElementById('rn').value, e = document.getElementById('re').value, p = document.getElementById('rp').value;
    if(!n || !e || !p) return toast('يرجى ملء كافة الحقول', 'e');
    if(p.length < 6) return toast('كلمة المرور ضعيفة جداً', 'e');

    const id = btoa(e).replace(/=/g,'');
    const ex = await fbGet(`users/${id}`);
    if(ex) return toast('هذا البريد مسجل مسبقاً', 'e');

    const nu = { n, e, p, r: 'USER', d: new Date().toISOString() };
    await fbSet(`users/${id}`, nu);
    sess = nu;
    localStorage.setItem(SK, JSON.stringify(nu));
    closeM('ovA');
    authUI();
    toast('تم إنشاء الحساب بنجاح، أهلاً بك', 's');
}

function authUI() {
    const area = document.getElementById('authArea');
    const gate = document.getElementById('authGate');
    
    if(sess) {
        gate.style.display = 'none';
        area.innerHTML = `
            <div class="u-info" onclick="toggleOwnerPanel()">
                <img src="https://api.iconify.design/lucide:user-circle.svg?color=7c3aed" style="width:20px;">
                <span>${sess.n}</span>
                <button class="lo-btn" onclick="logout()">خروج</button>
            </div>`;
        checkOwnerAccess();
    } else {
        gate.style.display = 'flex';
        area.innerHTML = `<button class="abtn pr" onclick="openAuth('l')">دخول النظام</button>`;
    }
}

function checkOwnerAccess() {
    const chromeTab = document.getElementById('tab-chrome');
    const lock = document.getElementById('chromeLockOverlay');
    const content = document.getElementById('chromeContent');
    const adminBtn = document.getElementById('ownerPanel');

    // إذا كان البريد هو بريد مروان الخاص
    if(sess && sess.e === OW_EMAIL) {
        if(lock) lock.style.display = 'none';
        if(content) content.style.display = 'grid';
        if(adminBtn) adminBtn.style.display = 'block';
        document.getElementById('heroBadgeTxt').innerText = "وضع المطور نشط — مرحباً مروان";
        document.getElementById('heroBadgeDot').style.background = "var(--neon-gold)";
    } else {
        if(lock) lock.style.display = 'block';
        if(content) content.style.display = 'none';
        if(adminBtn) adminBtn.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem(SK);
    sess = null;
    location.reload();
}
/* ============================================================= */
/* 3. Core Logic, Orders & UI Transitions                        */
/* ============================================================= */

window.onload = async () => {
    initAITranslator();
    
    // استرجاع الجلسة
    try { sess = JSON.parse(localStorage.getItem(SK)); } catch(e) {}
    authUI();

    // نظام عداد الزيارات (بصمة الجهاز)
    if(!localStorage.getItem('pb_v3_v')) {
        await fbIncr('stats/visits');
        localStorage.setItem('pb_v3_v', '1');
    }
    
    refreshStats();
    setInterval(refreshStats, 30000); // تحديث الإحصائيات كل 30 ثانية
};

async function refreshStats() {
    const stats = await fbGet('stats') || {};
    if(document.getElementById('vCount')) document.getElementById('vCount').innerText = stats.visits || 0;
    if(document.getElementById('oCount')) document.getElementById('oCount').innerText = stats.orderCount || 0;
}

function switchTab(n) {
    document.querySelectorAll('.tc, .tb').forEach(el => el.classList.remove('on'));
    const t = document.getElementById('tab-' + n);
    const b = document.getElementById('btn-' + n);
    if(t) t.classList.add('on');
    if(b) b.classList.add('on');
    
    // إذا كان القسم هو كروم، يتم التأكد من الصلاحيات مجدداً
    if(n === 'chrome') checkOwnerAccess();
}

function openOrder(bn, bp, custom = false) {
    if(!sess) return openAuth('l');
    
    isCustom = custom;
    document.getElementById('bn').value = bn;
    document.getElementById('cb').value = bp;
    document.getElementById('dA').style.display = custom ? 'block' : 'none';
    
    // إعادة ضبط خيارات الدفع
    payV = '';
    document.querySelectorAll('.pay').forEach(p => p.classList.remove('on'));
    
    openM('ovO');
}

function sP(btn, val) {
    document.querySelectorAll('.pay').forEach(p => p.classList.remove('on'));
    btn.classList.add('on');
    payV = val;
}

async function submitOrder() {
    const n = document.getElementById('cn').value, 
          c = document.getElementById('cc').value,
          d = isCustom ? document.getElementById('cd').value : '';
    
    if(!n || !c || !payV) return toast('يرجى إكمال بيانات الطلب والدفع', 'e');

    const orderData = {
        item: document.getElementById('bn').value,
        price: document.getElementById('cb').value,
        client: n,
        contact: c,
        payment: payV,
        details: d,
        userEmail: sess.email,
        date: new Date().toLocaleString('ar-EG')
    };

    toast('جاري معالجة الطلب...', 's');
    await fbPush('orders', orderData);
    await fbIncr('stats/orderCount');

    // توجيه للواتساب (رقم مروان الرسمي)
    const msg = `*طلب مشروع جديد*%0A------------------%0A*الخدمة:* ${orderData.item}%0A*الميزانية:* ${orderData.price}%0A*العميل:* ${n}%0A*التواصل:* ${c}%0A*طريقة الدفع:* ${payV}${d ? '%0A*تفاصيل:* ' + d : ''}`;
    window.open(`https://wa.me/201145974113?text=${msg}`, '_blank');

    closeM('ovO');
    toast('تم تسجيل طلبك بنجاح!', 's');
    refreshStats();
}

/* Utilities */
function openM(id) { document.getElementById(id).classList.add('open'); }
function closeM(id) { document.getElementById(id).classList.remove('open'); }
function openAuth(m) { aSwitch(m); openM('ovA'); }
function aSwitch(m) {
    document.getElementById('lF').style.display = m === 'l' ? 'block' : 'none';
    document.getElementById('rF').style.display = m === 'r' ? 'block' : 'none';
    document.getElementById('tLB').classList.toggle('on', m === 'l');
    document.getElementById('tRB').classList.toggle('on', m === 'r');
}

function toast(m, t) {
    const x = document.getElementById('toast');
    x.innerText = m;
    x.className = `toast show ${t === 'e' ? 'e' : ''}`;
    setTimeout(() => { x.className = x.className.replace('show', ''); }, 4000);
}

// تأثير التموج (Ripple Effect) لعام 2026
document.addEventListener('click', (e) => {
    const target = e.target.closest('.ripple-element');
    if (target) {
        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-span';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
});
