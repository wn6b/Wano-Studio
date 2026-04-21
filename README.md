## 🌌 Wano Studio - The Ultimate Bot & Web Ecosystem
<div align="center">
  <img src="https://i.ibb.co/hJSGYNgB/09f196bdf170668948b8b90892679549.jpg" alt="Wano Logo" width="180" style="border-radius: 50%; box-shadow: 0px 0px 20px rgba(0, 255, 255, 0.5);"/>
  <h1>وائل | Wano Studio</h1>
  <p><b>مطور بوتات محترف | Discord · Telegram · WhatsApp · Chrome Extensions</b></p>
  <p><i>Building the Future of Automated Ecosystems - 2026 Edition</i></p>
</div>

---

## 📑 جدول المحتويات (Table of Contents)
1. [🚀 المقدمة (Introduction)](#-المقدمة-introduction)
2. [💡 فلسفة المشروع (Project Philosophy)](#-فلسفة-المشروع-project-philosophy)
3. [✨ الميزات التقنية (Technical Features)](#-الميزات-التقنية-technical-features)
4. [🏗️ الهيكلية المعمارية (Directory Structure)](#️-الهيكلية-المعمارية-directory-structure)
5. [🛠️ التقنيات المستخدمة (Tech Stack)](#️-التقنيات-المستخدمة-tech-stack)
6. [📱 التوافقية (Device Compatibility)](#-التوافقية-device-compatibility)
7. [🌐 إعدادات استضافة الموقع (Website Hosting Setup)](#-إعدادات-استضافة-الموقع-website-hosting-setup)
8. [🤖 تعليمات تشغيل البوتات (Bot Startup Instructions)](#-تعليمات-تشغيل-البوتات-bot-startup-instructions)
9. [🔐 معايير الأمان (Security Protocols)](#-معايير-الأمان-security-protocols)
10. [🔗 منصات التواصل (Connect with Wano)](#-منصات-التواصل-connect-with-wano)

---

## 🚀 المقدمة (Introduction)
مرحباً بك في **Wano Studio**، المنصة المركزية وواجهة الأعمال الرقمية للمطور "وائل | Wano". هذا المشروع ليس مجرد موقع شخصي (Portfolio)، بل هو واجهة طرفية (Terminal-based UI) متقدمة تم بناؤها لتواكب التطور البرمجي لعام 2026. المنصة مصممة لعرض المشاريع، وإدارة البوتات، وتقديم حلول برمجية مخصصة للعملاء بجودة عالية وتسليم فوري.

---

## 💡 فلسفة المشروع (Project Philosophy)
نحن في Wano Studio نؤمن بالسرعة، الكفاءة، والسيطرة الكاملة على الكود. لذلك، بنينا هذا المشروع بناءً على القواعد التالية:
* **JavaScript Supremacy:** المشروع والنظام البيئي الخاص به يعتمد **100% على JavaScript و Node.js**. نحن لا نستخدم Python مطلقاً؛ لغة الثعابين البطيئة لا مكان لها في بيئة العمل السريعة والمتقدمة الخاصة بنا في 2026.
* **الجدية والعظمة:** كل سطر كود هنا مكتوب ليصنع أثراً حقيقياً. نتعامل مع كل مشروع على أنه تحفة فنية تقنية.
* **المرونة المتنقلة:** تم تصميم بيئة العمل بالكامل لتكون قابلة للإدارة، التعديل، والنشر مباشرة من الهاتف الذكي (Mobile First & Termux Ready).

---

## ✨ الميزات التقنية (Technical Features)
* **واجهة Init-Terminal التفاعلية:** شاشة تحميل تحاكي موجه الأوامر (Bash/Terminal) تقرأ البيانات الوهمية وتعطي المستخدم إحساساً بالدخول إلى خادم (Server) حقيقي.
* **تصميم زجاجي حديث (Glassmorphism 2026):** استخدام متقدم لـ CSS3 لخلق واجهات شفافة ومتجاوبة.
* **نظام الرتب (Role/Rank IDs):** الاعتماد على الـ IDs الخاصة بالرتب في قواعد البيانات بدلاً من الأسماء لتجنب أخطاء التعديل (Strict ID mapping).
* **إحصائيات ديناميكية:** جلب وعرض معلومات مستودعات GitHub والـ Stars بشكل أنيق ومباشر.
* **أداء صاروخي:** لا توجد مكتبات ضخمة تعيق التحميل، فقط Pure JS مبني باحترافية.

---

## 🏗️ الهيكلية المعمارية (Directory Structure)
هيكل الملفات مصمم ليكون نظيفاً وقابلاً للتوسع. **ملاحظة للمطورين:** عند إضافة بوت جديد، يتم إنشاء مجلد جديد ومستقل بالكامل لضمان عدم تداخل الأكواد.

```text
Wano-Studio/
├── 📁 assets/
│   ├── 📁 css/
│   │   ├── style.css         # التصميم الأساسي والمتقدم (2026 UI)
│   │   └── terminal.css      # تصميم شاشة التحميل الطرفية
│   ├── 📁 js/
│   │   ├── main.js           # المنطق الأساسي للموقع
│   │   └── animations.js     # حركات الـ Terminal والتنقل السلس
│   └── 📁 images/
│       └── profile.jpg       # صورة المطور
├── 📁 bots_hosting/          # المجلد الرئيسي لاستضافة البوتات
│   ├── 📁 discord_bot_v1/    # (مثال) كل بوت في مجلد مستقل
│   └── 📁 telegram_bot_v1/   # (مثال) كل بوت في مجلد مستقل
├── index.html                # واجهة الموقع الرئيسية
└── README.md                 # هذا الملف
