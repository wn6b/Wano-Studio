const GITHUB_USERNAME = 'wn6b';

// وظيفة لجلب الريبوهات الـ Starred
async function fetchWanoProjects() {
    const container = document.getElementById('starred-projects');
    try {
        // جلب البيانات من API جيت هب
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/starred`);
        const projects = await response.json();

        container.innerHTML = ''; // مسح علامة التحميل

        projects.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <i class="fa-solid fa-code-branch" style="color:var(--accent)"></i>
                <h3>${repo.name}</h3>
                <p>${repo.description || 'لا يوجد وصف متاح'}</p>
                <div class="stats">
                    <span>⭐ ${repo.stargazers_count}</span>
                    <span>🍴 ${repo.forks_count}</span>
                </div>
                <a href="${repo.homepage || repo.html_url}" target="_blank" class="view-btn">زيارة الموقع</a>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<p>حدث خطأ أثناء جلب العظمة.. تأكد من الاتصال.</p>';
    }
}

// تتبع حركة الماوس للواقعية (فقط للبيسي)
const cursor = document.querySelector('.cursor-follower');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// تشغيل الوظيفة عند التحميل
window.onload = fetchWanoProjects;
