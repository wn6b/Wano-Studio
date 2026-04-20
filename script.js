// تأثير تتبع اللمس والماوس للواقعية 10000%
const card = document.getElementById('interactive-card');

const handleMove = (e) => {
    let x, y;
    if (e.type === 'touchmove') {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    // حساب زاوية الدوران بناءً على مكان اللمس
    const rotateX = (y - halfHeight) / 20;
    const rotateY = (x - halfWidth) / 20;

    card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(50px)`;
};

// إضافة المستمعات للمس والماوس
window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', handleMove);

// إعادة البطاقة لوضعها الطبيعي عند ترك اللمس
const resetCard = () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
};

window.addEventListener('mouseup', resetCard);
window.addEventListener('touchend', resetCard);

// أنيميشن عند التمرير (Scroll Reveal)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.grid-item').forEach(item => {
    observer.observe(item);
});
