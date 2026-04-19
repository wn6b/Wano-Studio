// جلب الأنميات المقترحة أول ما يفتح الموقع
document.addEventListener("DOMContentLoaded", () => {
    fetchAnime('top/anime?sfw=true&limit=24'); 
});

// دالة البحث
function searchAnime() {
    const query = document.getElementById('searchInput').value;
    if (query.length > 2) {
        // sfw=true تضمن عدم وجود أي محتوى إباحي نهائياً
        fetchAnime(`anime?q=${query}&sfw=true&order_by=popularity&sort=desc`);
    } else {
        alert("اكتب اسم أنمي أطول من حرفين عيوني!");
    }
}

// دالة جلب البيانات من API
async function fetchAnime(endpoint) {
    const grid = document.getElementById('animeGrid');
    grid.innerHTML = '<h3 style="text-align:center; width:100%; color:#00f2fe;">جاري التحميل... ثواني من وقتك</h3>';
    
    try {
        const response = await fetch(`https://api.jikan.moe/v4/${endpoint}`);
        const data = await response.json();
        
        grid.innerHTML = '';
        data.data.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'anime-card';
            card.onclick = () => showAnimeDetails(anime.mal_id);
            
            card.innerHTML = `
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                <div class="anime-info">
                    <h3>${anime.title}</h3>
                    <p>${anime.synopsis ? anime.synopsis : 'لا يوجد وصف متاح.'}</p>
                </div>
            `;
            grid.appendChild(card);
        });

        // تشغيل نظام الانبثاق الواقعي (Intersection Observer)
        observeCards();
    } catch (error) {
        grid.innerHTML = '<h3 style="color:red; text-align:center;">صار خطأ بالشبكة، جرب مرة ثانية!</h3>';
    }
}

// نظام الانبثاق 5D عند التمرير (فوق أو جوه)
function observeCards() {
    const cards = document.querySelectorAll('.anime-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show'); // يختفي ويرجع ينبثق إذا صعدت فوق
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

// عرض التفاصيل الكاملة
async function showAnimeDetails(id) {
    const modal = document.getElementById('animeModal');
    const modalBody = document.getElementById('modalBody');
    modal.style.display = 'flex';
    modalBody.innerHTML = '<h2>جاري جلب المعلومات...</h2>';

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        const data = await response.json();
        const anime = data.data;

        const trailerHTML = anime.trailer.embed_url 
            ? `<iframe width="100%" height="300" src="${anime.trailer.embed_url}" frameborder="0" allowfullscreen style="border-radius:15px; margin-top:20px;"></iframe>` 
            : '';

        modalBody.innerHTML = `
            <img src="${anime.images.jpg.large_image_url}" class="modal-img" alt="${anime.title}">
            <div class="modal-info">
                <h2>${anime.title}</h2>
                <p><strong>التقييم:</strong> <span class="badge">⭐ ${anime.score || 'N/A'}</span></p>
                <p><strong>سنة العرض:</strong> ${anime.year || 'غير معروف'}</p>
                <p><strong>الاستوديو:</strong> ${anime.studios.length > 0 ? anime.studios[0].name : 'غير معروف'}</p>
                <p><strong>القصة:</strong> ${anime.synopsis}</p>
                ${trailerHTML}
            </div>
        `;
    } catch (error) {
        modalBody.innerHTML = '<h2>عذراً، حدث خطأ في جلب التفاصيل.</h2>';
    }
}

function closeModal() {
    document.getElementById('animeModal').style.display = 'none';
}

// المساعد الذكي AI (محاكاة ذكية)
function toggleBot() {
    const body = document.getElementById('aiBody');
    body.classList.toggle('active');
}

function askAI() {
    const input = document.getElementById('aiInput');
    const chatBox = document.getElementById('chatBox');
    const userText = input.value.trim();
    
    if(!userText) return;

    // إضافة رسالة المستخدم
    chatBox.innerHTML += `<p class="user-msg">${userText}</p>`;
    input.value = '';

    // تحليل ذكي بسيط للكلمات المفتاحية
    setTimeout(() => {
        let aiReply = "والله ما فهمت عليك زين، بس جرب تكتب بالبحث فوك اسم الأنمي اللي ببالك.";
        if(userText.includes('اكشن') || userText.includes('أكشن') || userText.includes('action')) {
            aiReply = "تحب الأكشن والمطاردات؟ أنصحك تشوف Attack on Titan أو Jujutsu Kaisen، نار وشرار!";
            fetchAnime('anime?q=action&sfw=true&order_by=score&sort=desc');
        } else if (userText.includes('ضحك') || userText.includes('كوميديا')) {
            aiReply = "تريد تضحك؟ Gintama هو الحل، يفطس ضحك وقصف جبهات للصبح! دورتلك عليه جوه 👇";
            fetchAnime('anime?q=gintama&sfw=true');
        } else if (userText.includes('رياضة') || userText.includes('طوبة')) {
            aiReply = "عليك بـ Blue Lock أو Haikyuu، حماس يخليك تقوم تركض بالصالة!";
            fetchAnime('anime?q=sports&sfw=true&order_by=score&sort=desc');
        }

        chatBox.innerHTML += `<p class="ai-msg">${aiReply}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}
