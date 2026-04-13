// ============================
// 1. CONFIG & FIREBASE (الإعدادات والربط)
// ============================
const FB = 'https://wano-studio-default-rtdb.firebaseio.com';
const OW_EMAIL = 'waylalyzydy51@gmail.com';
const OW_PASS  = 'f!2HgJv#)"E"y^i';
const SK = 'pb_sess_v3';

let sess = null, payV = '', capN = 0, isCustom = false, lang = 'ar', discountPct = 0, discountCode = '';

// ============================
// 2. HELPERS (دوال المساعدة - تم حل مشكلة الكاش هنا)
// ============================
async function fbGet(path){
  try {
    // ضفنا التاريخ للرابط حتى الموقع يقرأ كود الخصم الجديد فوراً وما يعلق
    const r = await fetch(`${FB}/${path}.json?_t=${Date.now()}`, { cache: 'no-store' });
    if(!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

async function fbSet(path, data){
  try { await fetch(`${FB}/${path}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); } catch(e){}
}

async function fbPush(path, data){
  try {
    const r = await fetch(`${FB}/${path}.json`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    return r.ok ? await r.json() : null;
  } catch(e) { return null; }
}

async function fbDel(path){
  try { await fetch(`${FB}/${path}.json`, { method:'DELETE' }); } catch(e){}
}

async function fbIncr(path){
  const cur = await fbGet(path) || 0;
  const nv = cur + 1;
  await fbSet(path, nv);
  return nv;
}

// تشفير الباسوردات للحماية
async function sha256(s){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
