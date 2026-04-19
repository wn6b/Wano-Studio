// ==========================================
// 1. إعدادات Firebase (يجب وضع بياناتك من الـ Console هنا)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBZc6wYIoRWErFDlspRMvd08ujx8vtgxPk",
    authDomain: "wano-studio.firebaseapp.com",
    projectId: "wano-studio",
    storageBucket: "wano-studio.appspot.com",
    messagingSenderId: "464709722674",
    appId: "1:464709722674:web:5393cdd4c00c033014122b"
};

// تشغيل Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// 2. إدارة الجلسة والدخول (Persistence)
// ==========================================

// مراقب حالة المستخدم - هذا يمنع تسجيل الخروج عند الريفريش
auth.onAuthStateChanged((user) => {
    const loader = document.getElementById('loader');
    const authOverlay = document.getElementById('auth-overlay');
    const dashboard = document.getElementById('main-dashboard');

    if (user) {
        // المستخدم مسجل دخول
        document.getElementById('user-display-name').innerText = user.displayName || "المبرمج المحترف";
        document.getElementById('user-avatar').innerText = (user.displayName || "P").charAt(0);
        
        authOverlay.style.display = 'none';
        dashboard.classList.remove('dashboard-hidden');
        dashboard.style.opacity = '1';
        dashboard.style.visibility = 'visible';
        
        // إظهار تنبيه الانبثاق الترحيبي
        showPopup('top');
    } else {
        // المستخدم غير مسجل دخول
        authOverlay.style.display = 'flex';
        dashboard.classList.add('dashboard-hidden');
    }
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
});

// وظائف النماذج (تسجيل وإنشاء حساب)
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    auth.signInWithEmailAndPassword(email, pass)
        .catch(err => alert("خطأ في الدخول: " + err.message));
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;

    auth.createUserWithEmailAndPassword(email, pass)
        .then((cred) => {
            return cred.user.updateProfile({ displayName: name });
        })
        .catch(err => alert("خطأ في الإنشاء: " + err.message));
});

document.getElementById('btn-logout').addEventListener('click', () => auth.signOut());

// ==========================================
// 3. نظام التعليم الحقيقي (Data & Logic)
// ==========================================

const educationalContent = {
    js: {
        title: "مسار JavaScript الاحترافي",
        difficulty: "متقدم",
        lessons: [
            { t: "مقدمة في محركات JS", c: "تعرف على كيفية عمل V8 Engine وإدارة الذاكرة (Memory Heap)." },
            { t: "البرمجة غير المتزامنة", c: "إتقان الـ Promises والـ Async/Await في بيئة إنتاج حقيقية." }
        ]
    },
    cpp: {
        title: "مسار C++ للأنظمة",
        difficulty: "خبير",
        lessons: [
            { t: "إدارة الذاكرة اليدوية", c: "فهم الـ Pointers والـ Dynamic Memory Allocation." }
        ]
    }
    // يمكن إضافة بقية اللغات هنا بنفس الهيكل
};

let currentTrack = 'js';
let currentLessonIndex = 0;

function loadTrack(track) {
    if (educationalContent[track]) {
        currentTrack = track;
        currentLessonIndex = 0;
        updateUI();
        
        // تحديث الأزرار النشطة
        document.querySelectorAll('.track-item').forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }
}

function updateUI() {
    const track = educationalContent[currentTrack];
    const lesson = track.lessons[currentLessonIndex];
    
    document.getElementById('lesson-title').innerText = lesson.t;
    document.getElementById('lesson-body').innerText = lesson.c;
    document.getElementById('lesson-difficulty').innerText = track.difficulty;
    
    // تحديث شريط التقدم بشكل واقعي
    const progress = ((currentLessonIndex + 1) / track.lessons.length) * 100;
    document.getElementById('main-progress-fill').style.width = progress + "%";
    document.getElementById('progress-percent').innerText = Math.round(progress) + "%";
}

// ==========================================
// 4. واقعية الحركة والانبثاق (Visual FX)
// ==========================================

// تأثير الانبثاق (Pop-up) عند السكرول
window.onscroll = function() {
    const popupBottom = document.getElementById('popup-bottom');
    const popupTop = document.getElementById('popup-top');

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20) {
        popupBottom.classList.add('popup-bottom-active');
    } else {
        popupBottom.classList.remove('popup-bottom-active');
    }

    if (window.scrollY < 50) {
        popupTop.classList.add('popup-top-active');
    } else {
        popupTop.classList.remove('popup-top-active');
    }
};

function showPopup(type) {
    const p = document.getElementById('popup-' + type);
    p.classList.add('popup-' + type + '-active');
    setTimeout(() => p.classList.remove('popup-' + type + '-active'), 4000);
}

// تفاعل العناصر مع اللمس والماوس (الواقعية الفائقة)
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.lesson-card, .sidebar-tracks, .auth-card');
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    cards.forEach(card => {
        card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    });
});

// ==========================================
// 5. نظام الترجمة والواجهة
// ==========================================

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'ar',
        includedLanguages: 'ar,en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}

function changeLang(lang) {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
    }
}

// تبديل واجهات الدخول
document.getElementById('btn-login-view').onclick = () => {
    document.getElementById('auth-initial').classList.add('hidden');
    loginForm.classList.remove('hidden');
};

document.getElementById('btn-signup-view').onclick = () => {
    document.getElementById('auth-initial').classList.add('hidden');
    signupForm.classList.remove('hidden');
};

document.querySelectorAll('.back-link').forEach(link => {
    link.onclick = () => {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        document.getElementById('auth-initial').classList.remove('hidden');
    };
});
