/* ============================================================= */
/* Projects Bots — Core Logic Engine (V4.0 - 2026 Edition)       */
/* Developer: Marwan | Wano — @wn6b                              */
/* ============================================================= */

// الإعدادات الأساسية وحقوق الملكية
const CONFIG = {
    ownerName: "مروان | Wano",
    username: "@wn6b",
    status: "Active",
    version: "2026.4.0",
    maintenanceMode: true // وضع الصيانة لقسم كروم
};

// انتظر تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {
    console.log(`System Initialized: ${CONFIG.ownerName} Studio`);
    initRealism();
    checkMaintenance();
});

// نظام التنقل الواقعي بين التبويبات
function switchTab(tabId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.tc').forEach(section => {
        section.classList.remove('on');
        section.style.display = 'none';
    });

    // إزالة الحالة النشطة من جميع الأزرار
    document.querySelectorAll('.tb').forEach(button => {
        button.classList.remove('on');
    });

    // إظهار القسم المطلوب
    const activeSection = document.getElementById(`tab-${tabId}`);
    const activeButton = document.getElementById(`btn-${tabId}`);

    if (activeSection) {
        activeSection.style.display = 'block';
        setTimeout(() => activeSection.classList.add('on'), 10);
    }
    if (activeButton) activeButton.classList.add('on');

    // إشعار بسيط عند التبديل (Toast)
    if(tabId === 'chrome' && CONFIG.maintenanceMode) {
        showToast("تنبيه: قسم كروم قيد الصيانة المتقدمة", "e");
    }
}

// فحص وضع الصيانة لقسم كروم
function checkMaintenance() {
    const chromeTab = document.getElementById('tab-chrome');
    if (CONFIG.maintenanceMode && chromeTab) {
        // يتم التحكم في المحتوى عبر HTML الذي أرسلته سابقاً
        console.warn("Chrome Section is under maintenance by Marwan | Wano");
    }
}

// نظام الإشعارات (Toast) لعام 2026
function showToast(message, type = 's') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.innerText = message;
    toast.className = `toast show ${type === 'e' ? 'e' : ''}`;
    
    // تأثير التوهج عند ظهور الخطأ
    if (type === 'e') {
        toast.style.boxShadow = "0 0 20px rgba(255, 0, 85, 0.4)";
    } else {
        toast.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.3)";
    }

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// تأثيرات الواقعية 100000% (Micro-Interactions)
function initRealism() {
    // تأثير التموج عند الضغط على الأزرار
    document.querySelectorAll('.ripple-element').forEach(button => {
        button.addEventListener('click', function (e) {
            let x = e.clientX - e.target.offsetLeft;
            let y = e.clientY - e.target.offsetTop;
            
            let ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.className = 'ripple-span'; // معرف في CSS
            this.appendChild(ripple);

            setTimeout(() => { ripple.remove(); }, 600);
        });
    });

    // تحديث عداد النظام الوهمي للواقعية
    const badgeTxt = document.getElementById('heroBadgeTxt');
    if (badgeTxt) {
        setInterval(() => {
            badgeTxt.innerText = `نظام ${CONFIG.ownerName} - استقرار 100%`;
        }, 5000);
    }
}

// حماية الحقوق في الكونسول
console.log("%cحقوق البرمجة محفوظة لـ مروان | Wano", "color: #ffaa00; font-size: 20px; font-weight: bold;");
console.log("%cContact: @wn6b", "color: #00f0ff; font-size: 14px;");
