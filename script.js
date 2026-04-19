// تكوين Firebase (ضع بياناتك هنا)
const firebaseConfig = { apiKey: "AI_KEY", projectId: "wano-studio" };
firebase.initializeApp(firebaseConfig);

// قاموس الترجمة البرمجي (للتغيير الكامل والواقعي)
const i18n = {
    ar: {
        title: "CORE INTELLIGENCE",
        login: "دخول النظام",
        signup: "إنشاء حساب",
        tracks: "المسارات البرمجية",
        exit: "خروج",
        ai_placeholder: "اسأل الذكاء الاصطناعي...",
        welcome: "مرحباً بك في نظام التعليم الذكي"
    },
    en: {
        title: "CORE INTELLIGENCE",
        login: "LOG IN",
        signup: "SIGN UP",
        tracks: "PROGRAMMING TRACKS",
        exit: "LOGOUT",
        ai_placeholder: "Ask AI about code...",
        welcome: "Welcome to AI Learning System"
    }
};

let currentLang = 'ar';

// وظيفة تغيير اللغة الشاملة
function setSystemLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // تحديث النصوص
    document.getElementById('txt-auth-title').innerText = i18n[lang].title;
    document.getElementById('nav-logo-text').innerText = i18n[lang].title;
    document.getElementById('txt-tracks-label').innerText = i18n[lang].tracks;
    document.getElementById('ai-input').placeholder = i18n[lang].ai_placeholder;
    document.getElementById('btn-exit').innerText = i18n[lang].exit;
}

// محاكي الذكاء الاصطناعي (AI Tutor Engine)
const aiInput = document.getElementById('ai-input');
const aiLogs = document.getElementById('ai-chat-logs');

document.getElementById('ai-send').onclick = () => {
    const query = aiInput.value;
    if(!query) return;
    
    appendMessage('USER', query);
    aiInput.value = '';

    // محاكاة استجابة الذكاء الاصطناعي
    setTimeout(() => {
        const response = `نظام CORE AI يقوم بتحليل سؤالك: [${query}]... البرمجة بلغة JavaScript تتطلب تركيزاً على الـ Async.`;
        appendMessage('CORE-AI', response);
    }, 1000);
};

function appendMessage(sender, msg) {
    const div = document.createElement('div');
    div.innerHTML = `> <strong>${sender}:</strong> ${msg}`;
    aiLogs.appendChild(div);
    aiLogs.scrollTop = aiLogs.scrollHeight;
}

// إدارة واجهة الدخول
document.getElementById('btn-show-login').onclick = () => {
    document.getElementById('auth-selection').classList.add('hidden');
    document.getElementById('form-login').classList.remove('hidden');
};

document.getElementById('form-login').onsubmit = (e) => {
    e.preventDefault();
    // هنا يتم الربط مع Firebase Auth الحقيقي
    document.getElementById('auth-gate').style.display = 'none';
    document.getElementById('main-app').classList.remove('hidden');
};

// تهيئة النظام
setSystemLanguage('ar');
