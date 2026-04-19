// ==========================================
// 1. بروتوكول الاتصال بقاعدة البيانات (Firebase)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBZc6wYIoRWErFDlspRMvd08ujx8vtgxPk",
    authDomain: "wano-studio.firebaseapp.com",
    projectId: "wano-studio",
    storageBucket: "wano-studio.appspot.com",
    messagingSenderId: "464709722674",
    appId: "1:464709722674:web:5393cdd4c00c033014122b"
};

// تفعيل المحرك
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// 2. إدارة الجلسات الأمنية (Session Persistence)
// ==========================================
auth.onAuthStateChanged((user) => {
    const loader = document.getElementById('loader');
    const authOverlay = document.getElementById('auth-overlay');
    const dashboard = document.getElementById('main-dashboard');

    if (user) {
        // فتح النظام عند نجاح الاتصال
        authOverlay.style.display = 'none';
        dashboard.classList.remove('dashboard-hidden');
        dashboard.style.opacity = '1';
        dashboard.style.visibility = 'visible';
        
        triggerVectorPopup('top');
    } else {
        // إغلاق النظام وطلب المصادقة
        authOverlay.style.display = 'flex';
        dashboard.classList.add('dashboard-hidden');
    }
    
    // إخفاء شاشة التحميل
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 800);
});

// ==========================================
// 3. معالجة بيانات الدخول والتسجيل
// ==========================================
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authInitial = document.getElementById('auth-initial');

document.getElementById('btn-login-view').onclick = () => {
    authInitial.classList.add('hidden');
    loginForm.classList.remove('hidden');
};

document.getElementById('btn-signup-view').onclick = () => {
    authInitial.classList.add('hidden');
    signupForm.classList.remove('hidden');
};

document.querySelectorAll('.back-link-vector').forEach(link => {
    link.onclick = () => {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        authInitial.classList.remove('hidden');
    };
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    auth.signInWithEmailAndPassword(email, pass).catch(err => alert("رفض الاتصال: " + err.message));
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;
    auth.createUserWithEmailAndPassword(email, pass)
        .then(cred => cred.user.updateProfile({ displayName: name }))
        .catch(err => alert("فشل التأسيس: " + err.message));
});

document.getElementById('btn-logout').addEventListener('click', () => auth.signOut());

// ==========================================
// 4. المحرك التعليمي والمناهج
// ==========================================
const coreCurriculum = {
    js: {
        title: "نظام JavaScript المركزي",
        difficulty: "مستوى متقدم",
        lessons: [
            { t: "هندسة الـ DOM المتقدمة", c: "تحليل هيكلية المتصفحات وبناء أنظمة تفاعلية بدون مكاتب خارجية." },
            { t: "البروتوكولات غير المتزامنة", c: "بناء مسارات بيانات تعتمد على Async/Await لمعالجة API." }
        ]
    },
    cpp: {
        title: "أنظمة C++ المنخفضة",
        difficulty: "مستوى خبير",
        lessons: [
            { t: "تخصيص الذاكرة المباشر", c: "إدارة الـ Pointers والتعامل المباشر مع عتاد النظام." }
        ]
    }
};

let currentTrackId = 'js';
let currentProtocolIndex = 0;

function loadTrack(trackId) {
    if (coreCurriculum[trackId]) {
        currentTrackId = trackId;
        currentProtocolIndex = 0;
        
        document.querySelectorAll('.track-node').forEach(node => node.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        syncDashboardUI();
    }
}

function syncDashboardUI() {
    const trackData = coreCurriculum[currentTrackId];
    const lessonData = trackData.lessons[currentProtocolIndex];
    
    document.getElementById('lesson-title').innerText = lessonData.t;
    document.getElementById('lesson-body').innerText = lessonData.c;
    document.getElementById('lesson-difficulty').innerText = trackData.difficulty;
    
    const syncRate = ((currentProtocolIndex + 1) / trackData.lessons.length) * 100;
    document.getElementById('main-progress-fill').style.width = syncRate + "%";
    document.getElementById('progress-percent').innerText = Math.round(syncRate) + "%";
}

// ==========================================
// 5. محرك الفيزياء البصرية (5D Engine)
// ==========================================
document.addEventListener('mousemove', (e) => {
    const targetElements = document.querySelectorAll('.vector-card, .tracks-sidebar, .auth-frame');
    const axisX = (e.clientX / window.innerWidth - 0.5) * 15;
    const axisY = (e.clientY / window.innerHeight - 0.5) * 15;

    targetElements.forEach(el => {
        el.style.transform = `rotateY(${axisX}deg) rotateX(${-axisY}deg)`;
    });
});

// ==========================================
// 6. مراقب الانبثاق الهيكلي (Vector Popups)
// ==========================================
window.addEventListener('scroll', () => {
    const bottomTrigger = document.getElementById('popup-bottom');
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;

    if (scrollPosition >= documentHeight - 10) {
        bottomTrigger.classList.add('v-popup-bottom-active');
    } else {
        bottomTrigger.classList.remove('v-popup-bottom-active');
    }
});

function triggerVectorPopup(position) {
    const popup = document.getElementById(`popup-${position}`);
    popup.classList.add(`v-popup-${position}-active`);
    setTimeout(() => popup.classList.remove(`v-popup-${position}-active`), 3500);
}

// ==========================================
// 7. محرك الترجمة الصامت
// ==========================================
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'ar',
        includedLanguages: 'ar,en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}

function changeLang(lang) {
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
        selectElement.value = lang;
        selectElement.dispatchEvent(new Event('change'));
    }
}
