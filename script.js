// إعداد نظام الترجمة العالمي من جوجل
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

// إدارة واجهة الدخول وإنشاء الحساب
const authOverlay = document.getElementById('auth-overlay');
const loginBtn = document.getElementById('btn-login');
const signupBtn = document.getElementById('btn-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const dashboard = document.getElementById('main-dashboard');
const backLinks = document.querySelectorAll('.back-link');

loginBtn.addEventListener('click', () => {
    loginBtn.parentElement.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

signupBtn.addEventListener('click', () => {
    signupBtn.parentElement.classList.add('hidden');
    signupForm.classList.remove('hidden');
});

backLinks.forEach(link => {
    link.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        loginBtn.parentElement.classList.remove('hidden');
    });
});

// محاكاة الدخول للنظام (سيتم استبداله بقاعدة بيانات لاحقاً)
const handleAuth = (e) => {
    e.preventDefault();
    authOverlay.style.opacity = '0';
    setTimeout(() => {
        authOverlay.style.display = 'none';
        dashboard.classList.remove('dashboard-hidden');
        dashboard.style.opacity = '1';
        dashboard.style.visibility = 'visible';
    }, 800);
};

loginForm.addEventListener('submit', handleAuth);
signupForm.addEventListener('submit', handleAuth);

// تأثير الـ 5D الواقعي للبطاقات (يتفاعل مع اللمس والماوس)
const cards = document.querySelectorAll('.lang-card');

const handleMove = (e, card) => {
    if (card.classList.contains('locked-card')) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
};

const handleLeave = (card) => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
};

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => handleMove(e, card));
    card.addEventListener('touchmove', (e) => handleMove(e, card));
    card.addEventListener('mouseleave', () => handleLeave(card));
    card.addEventListener('touchend', () => handleLeave(card));
});

// نظام الانبثاق التلقائي (Scroll Pop-up)
window.onscroll = function() {
    const popupBottom = document.getElementById('popup-bottom');
    const popupTop = document.getElementById('popup-top');

    // الانبثاق من الأسفل عند الوصول لنهاية الصفحة
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        popupBottom.classList.add('popup-bottom-active');
    } else {
        popupBottom.classList.remove('popup-bottom-active');
    }

    // الانبثاق من الأعلى عند العودة للبداية
    if (window.scrollY < 100) {
        popupTop.classList.add('popup-top-active');
    } else {
        popupTop.classList.remove('popup-top-active');
    }
};
