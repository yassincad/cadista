const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔒 إعداد الجلسة الأمنية
app.use(session({
  secret: 'cad_secret_key_2026_ofppt',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// 1. الاتصال بقاعدة البيانات MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cad_ofppt';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح'))
  .catch(err => console.error('❌ خطأ في الاتصال بـ MongoDB:', err));

// 2. إعدادات Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'scgacjvy',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cad_ofppt_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage });

// Schemas & Models
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  cin: { type: String, required: true, unique: true, uppercase: true, trim: true },
  pnj: { type: String, required: true },
  group: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, default: 'pending' },
  rank: { type: String, default: 'C' },
  skills: [String],
  languages: [String],
  skillImage: { type: String, default: '' },
  warnings: [{ text: String, date: { type: Date, default: Date.now } }]
});

const complaintSchema = new mongoose.Schema({
  senderName: String,
  senderCin: String,
  group: String,
  text: String,
  status: { type: String, default: 'قيد المراجعة' },
  date: { type: Date, default: Date.now }
});

const announcementSchema = new mongoose.Schema({
  text: String,
  image: String,
  date: { type: Date, default: Date.now }
});

const competitionSchema = new mongoose.Schema({
  title: String,
  result: String
});

const settingsSchema = new mongoose.Schema({
  key: String,
  starCin: String
});

const initiativeSchema = new mongoose.Schema({
  senderName: String,
  senderCin: String,
  group: String,
  text: String,
  status: { type: String, default: 'قيد الدراسة' },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const Competition = mongoose.model('Competition', competitionSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const Initiative = mongoose.model('Initiative', initiativeSchema);

// CSS الموحد
const commonCSS = `
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #07111e;
      --primary-light: #0f1f38;
      --accent: #0D9488;
      --bg: #07111e;
      --card-bg: #112238;
      --text: #ffffff;
      --border: rgba(255,255,255,0.1);
    }
    * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
    body { background-color: var(--bg); color: var(--text); margin: 0; padding: 0; direction: rtl; }
    .container { max-width: 1100px; margin: 20px auto; background: var(--card-bg); padding: 30px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    h1, h2, h3 { color: var(--text); margin-top: 0; font-weight: 700; }
    .btn { display: inline-block; background: var(--accent); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; text-align: center; }
    .btn:hover { background: #0f766e; transform: translateY(-2px); }
    .btn-danger { background: #e11d48; }
    .btn-danger:hover { background: #be123c; }
    .btn-success { background: #10b981; }
    .btn-success:hover { background: #059669; }
    input, select, textarea { width: 100%; padding: 12px; margin: 8px 0 16px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: #0b192c; color: white; transition: 0.2s; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); background: #0b192c; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; border-radius: 8px; overflow: hidden; }
    th { background: var(--primary-light); color: white; padding: 12px; font-weight: 600; text-align: right; }
    td { padding: 12px; border-bottom: 1px solid var(--border); text-align: right; color: #cbd5e1; }
    tr:hover { background-color: rgba(255,255,255,0.02); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .badge-rank { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  </style>
`;

// 1. الرئيسية المطابقة تماماً للصورة الاحترافية الثانية
app.get('/', async (req, res) => {
  const acceptedCount = await User.countDocuments({ status: 'accepted' });
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لجنة الانضباط الذاتية - CAD OFPPT</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          * { box-sizing: border-box; font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
          body { background-color: #07111e; color: #ffffff; direction: rtl; overflow-x: hidden; }

          /* شريط التنقل العلوي */
          .navbar { display: flex; justify-content: space-between; align-items: center; padding: 18px 5%; background: #07111e; border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 1000; }
          .nav-logos { display: flex; align-items: center; gap: 20px; }
          .cad-logo-text { font-weight: 800; font-size: 20px; color: #ffffff; border-right: 2px solid rgba(255,255,255,0.2); padding-right: 15px; }
          .ofppt-logo-text { color: #38bdf8; font-weight: 700; font-size: 15px; }

          .nav-links { display: flex; gap: 25px; align-items: center; }
          .nav-links a { color: #cbd5e1; text-decoration: none; font-weight: 600; font-size: 15px; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
          .nav-links a:hover, .nav-links a.active { color: #0D9488; }
          
          .nav-right-btns { display: flex; gap: 12px; align-items: center; }
          .btn-login-nav { background: transparent; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
          .btn-register-nav { background: #0D9488; color: white; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }

          /* القسم الرئيسي (Hero) المطابق للصورة تماماً */
          .hero-section { 
            position: relative; 
            background: linear-gradient(135deg, rgba(7, 17, 30, 0.95) 0%, rgba(11, 25, 44, 0.9) 100%), 
                        url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat; 
            padding: 70px 5%; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            flex-wrap: wrap; 
            gap: 40px; 
            border-bottom: 3px solid #0D9488; 
          }
          
          .stat-box-left { background: #112238; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; text-align: center; min-width: 280px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
          .stat-box-left .num { font-size: 3.5rem; font-weight: 800; color: #0D9488; margin: 5px 0; }
          
          .hero-center-badge { text-align: center; flex: 1; min-width: 280px; display: flex; justify-content: center; align-items: center; }
          
          /* إزالة الخلفية البيضاء للشعار ودمجه باحترافية تامة */
          .cad-logo-img { 
            max-width: 260px; 
            height: auto; 
            border-radius: 20px; 
            mix-blend-mode: screen; 
            filter: drop-shadow(0 0 25px rgba(13, 148, 136, 0.5));
            transition: transform 0.3s ease;
          }
          .cad-logo-img:hover { transform: scale(1.05); }

          .hero-text-right { max-width: 450px; text-align: right; }
          .hero-text-right h3 { color: #38bdf8; font-size: 1.1rem; margin-bottom: 8px; }
          .hero-text-right h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 12px; color: #ffffff; }
          .hero-text-right p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 25px; line-height: 1.6; }
          
          .hero-action-btns { display: flex; gap: 12px; }
          .btn-hero-login { background: #0D9488; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; flex: 1; text-align: center; }
          .btn-hero-reg { background: #112238; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; flex: 1; text-align: center; }

          /* قسم ما هي لجنة الانضباط */
          .about-section { background: #07111e; color: #ffffff; padding: 70px 5%; text-align: center; }
          .section-title { font-size: 2rem; color: #ffffff; font-weight: 800; margin-bottom: 12px; }
          .section-desc { max-width: 650px; margin: 0 auto 40px; color: #94a3b8; font-size: 1rem; line-height: 1.7; }
          
          .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
          .feature-card { background: #112238; border: 1px solid rgba(255,255,255,0.08); padding: 25px 20px; border-radius: 12px; text-align: right; position: relative; transition: 0.2s; }
          .feature-card:hover { border-color: #0D9488; transform: translateY(-4px); }
          .feature-card i { color: #0D9488; font-size: 24px; margin-bottom: 15px; display: block; }
          .feature-card h4 { color: #ffffff; font-size: 1.1rem; margin-bottom: 8px; }
          .feature-card p { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }
          .arrow-icon { position: absolute; bottom: 15px; left: 15px; color: #0D9488; font-size: 14px; }

          /* قسم القوانين والمعايير */
          .rules-section { background: #07111e; padding: 70px 5%; color: white; }
          .rules-header { text-align: center; margin-bottom: 40px; }
          .rules-header h2 { font-size: 2.2rem; margin-bottom: 8px; }
          .rules-header p { color: #94a3b8; font-size: 0.95rem; }
          
          .rules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; }
          .rule-box { background: #112238; border: 1px solid rgba(255,255,255,0.08); padding: 22px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 15px; }
          .rule-box-content { display: flex; align-items: center; gap: 15px; text-align: right; }
          .rule-box i { color: #0D9488; font-size: 24px; flex-shrink: 0; }
          .rule-box h5 { color: #ffffff; font-size: 1rem; margin-bottom: 3px; font-weight: 700; }
          .rule-box span { color: #94a3b8; font-size: 0.8rem; }
          .rule-arrow { color: #0D9488; font-size: 12px; }

          /* تذييل الصفحة (Footer) */
          footer { background: #040910; padding: 40px 5% 20px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); }
          .footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 25px; margin-bottom: 30px; }
          .footer-social { display: flex; gap: 15px; }
          .footer-social a { width: 38px; height: 38px; background: #112238; border: 1px solid rgba(255,255,255,0.1); color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; text-decoration: none; transition: 0.2s; }
          .footer-social a:hover { background: #0D9488; border-color: #0D9488; }
          .footer-links { display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.9rem; }
          .footer-links a { color: #cbd5e1; text-decoration: none; }
          .footer-links a:hover { color: #0D9488; }
          .footer-bottom { text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; font-size: 0.85rem; color: #64748b; }
        </style>
    </head>
    <body>

        <!-- شريط التنقل العلوي -->
        <div class="navbar">
            <div class="nav-logos">
                <div class="cad-logo-text">CAD • OFPPT</div>
                <div class="ofppt-logo-text"><i class="fa-solid fa-graduation-cap"></i> مكتب التكوين المهني وإنعاش الشغل</div>
            </div>
            <div class="nav-links">
                <a href="/" class="active"><i class="fa-solid fa-house"></i> الرئيسية</a>
                <a href="#rules"><i class="fa-solid fa-book"></i> القوانين والمعايير</a>
                <a href="mailto:yassine.iizo3@gmail.com"><i class="fa-solid fa-envelope"></i> تواصل معنا</a>
                <a href="/register"><i class="fa-solid fa-user-plus"></i> التسجيل</a>
            </div>
            <div class="nav-right-btns">
                <a href="/login" class="btn-login-nav">تسجيل الدخول</a>
                <a href="/admin-login" class="btn-register-nav"><i class="fa-solid fa-user-shield"></i> دخول المشرفين</a>
            </div>
        </div>

        <!-- القسم الرئيسي (Hero) مع الشعار المدمج -->
        <div class="hero-section">
            <!-- يسار: عدد المسجلين -->
            <div class="stat-box-left">
                <i class="fa-solid fa-users" style="color:#0D9488; font-size:28px; margin-bottom:5px;"></i>
                <div style="font-size:0.9rem; color:#94a3b8; font-weight:600;">المتدربين المسجلين</div>
                <div class="num">${acceptedCount}</div>
            </div>

            <!-- المنتصف: شعار CAD مندمج واحترافي -->
            <div class="hero-center-badge">
                <img src="https://res.cloudinary.com/scgacjvy/image/upload/v1792262240/WhatsApp_Image_2026-10-17_at_6.36.49_PM.jpg" alt="شعار لجنة الانضباط الذاتية CAD" class="cad-logo-img">
            </div>

            <!-- يمين: الترحيب والأزرار -->
            <div class="hero-text-right">
                <h3>مرحباً بكم في</h3>
                <h1>لجنة الانضباط الذاتية (CAD) OFPPT</h1>
                <p>معاً من أجل بيئة تكوينية سليمة ، قائمة على الاحترام والمسؤولية.</p>
                <div class="hero-action-btns">
                    <a href="/login" class="btn-hero-login"><i class="fa-solid fa-right-to-bracket"></i> تسجيل الدخول</a>
                    <a href="/register" class="btn-hero-reg"><i class="fa-solid fa-user-plus"></i> تسجيل جديد</a>
                </div>
            </div>
        </div>

        <!-- قسم ما هي لجنة الانضباط -->
        <div class="about-section">
            <h2 class="section-title">ما هي لجنة الانضباط الذاتية (CAD) ؟</h2>
            <p class="section-desc">هي لجنة داخلية تهدف إلى ضمان احترام قواعد السلوك والانضباط داخل المؤسسة التكوينية، من خلال التوعية، والمواكبة، ومعالجة المخالفات وفقاً للقوانين المعمول بها في OFPPT.</p>
            
            <div class="features-grid">
                <div class="feature-card">
                    <i class="fa-solid fa-file-lines"></i>
                    <h4>ما هي اللجنة؟</h4>
                    <p>تعرف على مهام وأهداف اللجنة.</p>
                    <i class="fa-solid fa-chevron-left arrow-icon"></i>
                </div>
                <div class="feature-card">
                    <i class="fa-solid fa-scale-balanced"></i>
                    <h4>القوانين والمعايير</h4>
                    <p>اطلع على القوانين التي يجب احترامها.</p>
                    <i class="fa-solid fa-chevron-left arrow-icon"></i>
                </div>
                <div class="feature-card">
                    <i class="fa-solid fa-book-open"></i>
                    <h4>التسجيل</h4>
                    <p>سجل في الموقع وكن عضواً في اللجنة.</p>
                    <i class="fa-solid fa-chevron-left arrow-icon"></i>
                </div>
                <div class="feature-card">
                    <i class="fa-solid fa-shield-halved"></i>
                    <h4>الانضباط والاحترام</h4>
                    <p>معاً نحو بيئة تكوينية أفضل.</p>
                    <i class="fa-solid fa-chevron-left arrow-icon"></i>
                </div>
                <div class="feature-card">
                    <i class="fa-solid fa-handshake-angle"></i>
                    <h4>المواهب والأنشطة</h4>
                    <p>اكتشف مهارات المتدربين وأنشطتهم.</p>
                    <i class="fa-solid fa-chevron-left arrow-icon"></i>
                </div>
            </div>
        </div>

        <!-- قسم القوانين والمعايير -->
        <div class="rules-section" id="rules">
            <div class="rules-header">
                <h2>القوانين والمعايير</h2>
                <p>نلتزم جميعاً بمجموعة من القواعد التي تضمن احتراماً متبادلاً وبيئة تكوينية متوازنة.</p>
            </div>
            
            <div class="rules-grid">
                <div class="rule-box">
                    <div class="rule-box-content">
                        <i class="fa-solid fa-shoe-prints"></i>
                        <div>
                            <h5>عدم ارتداء الصنادل</h5>
                            <span>يجب ارتداء الأحذية المناسبة</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left rule-arrow"></i>
                </div>

                <div class="rule-box">
                    <div class="rule-box-content">
                        <i class="fa-solid fa-shirt"></i>
                        <div>
                            <h5>الزي المناسب</h5>
                            <span>الالتزام بالزي المهني واللائق</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left rule-arrow"></i>
                </div>

                <div class="rule-box">
                    <div class="rule-box-content">
                        <i class="fa-solid fa-users"></i>
                        <div>
                            <h5>احترام الآخرين</h5>
                            <span>تجنب الكلام النابي والسب</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left rule-arrow"></i>
                </div>

                <div class="rule-box">
                    <div class="rule-box-content">
                        <i class="fa-solid fa-clock"></i>
                        <div>
                            <h5>الالتزام بالمواعيد</h5>
                            <span>الانضباط في الحضور والمغادرة</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left rule-arrow"></i>
                </div>

                <div class="rule-box">
                    <div class="rule-box-content">
                        <i class="fa-solid fa-ban"></i>
                        <div>
                            <h5>منع استعمال الهاتف</h5>
                            <span>عدم استعمال الهاتف أثناء التكوين</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left rule-arrow"></i>
                </div>

                <div class="rule-box">
                    <div class="rule-box-content">
                        <i class="fa-solid fa-shield-dog"></i>
                        <div>
                            <h5>منع العنف</h5>
                            <span>بيئة آمنة للجميع</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left rule-arrow"></i>
                </div>
            </div>
        </div>

        <!-- تذييل الصفحة (Footer) -->
        <footer>
            <div class="footer-content">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="font-weight:800; font-size:22px; color:white;">OFPPT</div>
                    <div style="border-right:1px solid rgba(255,255,255,0.2); padding-right:15px; font-weight:700; color:#38bdf8;">CAD OFPPT <br><span style="font-size:11px; color:#94a3b8; font-weight:normal;">معاً من أجل مستقبل أفضل</span></div>
                </div>

                <div class="footer-links">
                    <a href="/">الرئيسية</a>
                    <a href="#rules">القوانين والمعايير</a>
                    <a href="/register">التسجيل</a>
                    <a href="mailto:yassine.iizo3@gmail.com">تواصل معنا: yassine.iizo3@gmail.com</a>
                    <a href="https://wa.me/212707959822" target="_blank">واتساب: 0707959822</a>
                </div>

                <div class="footer-social">
                    <a href="https://facebook.com" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="https://instagram.com" target="_blank"><i class="fa-brands fa-instagram"></i></a>
                    <a href="https://youtube.com" target="_blank"><i class="fa-brands fa-youtube"></i></a>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© 2026 جميع الحقوق محفوظة لمكتب التكوين المهني وإنعاش الشغل OFPPT</p>
            </div>
        </footer>

    </body>
    </html>
  `);
});

// باقي المسارات البرمجية للملف الشخصي والمشرفين
app.get('/skills-directory', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/admin-login');
  }
  const acceptedUsers = await User.find({ status: 'accepted' });
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>دليل مهارات المتدربين - لوحة المشرفين</title>
        ${commonCSS}
    </head>
    <body>
        <div class="container">
            <h2>🌐 دليل مهارات وخبرات المتدربين (خاص بالمشرفين)</h2>
            <p style="color: #94a3b8; margin-bottom: 20px;">قائمة بمهارات ولغات المتدربين المقبولين في المؤسسة.</p>
            <table>
                <thead>
                    <tr>
                        <th>الاسم الكامل</th>
                        <th>الشعبة / القسم</th>
                        <th>المهارات التقنية</th>
                        <th>اللغات المتقنة</th>
                        <th>ملف أو إنجاز</th>
                    </tr>
                </thead>
                <tbody>
                    ${acceptedUsers.length > 0 ? acceptedUsers.map(u => `
                        <tr>
                            <td><strong>${u.fullname}</strong></td>
                            <td>${u.group}</td>
                            <td>${u.skills && u.skills.length > 0 ? u.skills.join(', ') : '<span style="color:#64748b;">غير مسجلة</span>'}</td>
                            <td>${u.languages && u.languages.length > 0 ? u.languages.join(', ') : '<span style="color:#64748b;">غير مسجلة</span>'}</td>
                            <td>${u.skillImage ? `<a href="${u.skillImage}" target="_blank" style="color:var(--accent); font-weight:bold;">عرض الملف</a>` : '<span style="color:#64748b;">لا يوجد</span>'}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">لا توجد بيانات مسجلة حالياً</td></tr>'}
                </tbody>
            </table>
            <p style="text-align:center; margin-top:30px;"><a href="/admin-dashboard" class="btn" style="text-decoration:none;">العودة لوحة التحكم</a></p>
        </div>
    </body>
    </html>
  `);
});

app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تسجيل متدرب جديد</title>
        ${commonCSS}
    </head>
    <body>
        <div class="container" style="max-width: 500px;">
            <h2>إنشاء حساب متدرب جديد</h2>
            <form action="/register" method="POST" enctype="multipart/form-data">
                <label>الاسم الكامل:</label>
                <input type="text" name="fullname" placeholder="مثال: محمد" required>
                
                <label>رقم بطاقة التعريف الوطنية (CIN):</label>
                <input type="text" name="cin" placeholder="مثال: AB123456" required>
                
                <label>صورة المتدرب:</label>
                <input type="file" name="pnj" accept="image/*" required>
                
                <label>القسم / الشعبة:</label>
                <input type="text" name="group" placeholder="مثال: DEVOWFS201" required>
                
                <label>كلمة المرور:</label>
                <input type="password" name="password" required>
                
                <button type="submit" class="btn btn-success" style="width:100%;">إرسال طلب التسجيل</button>
            </form>
            <p style="text-align:center; margin-top:20px;"><a href="/" style="color:#38bdf8; text-decoration:none;">العودة للرئيسية</a></p>
        </div>
    </body>
    </html>
  `);
});

app.post('/register', upload.single('pnj'), async (req, res) => {
  try {
    const { fullname, group, password } = req.body;
    const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
    const fileUrl = req.file ? req.file.path : '';
    
    if (!cin) {
      return res.send(`<script>alert('المرجو إدخال رقم بطاقة التعريف الوطنية بشكل صحيح.'); window.location.href='/register';</script>`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      fullname,
      cin,
      pnj: fileUrl,
      group,
      password: hashedPassword
    });
    
    res.send(`<script>alert('تم إرسال طلبك بنجاح! سيتم مراجعته من طرف المشرفين.'); window.location.href='/';</script>`);
  } catch (err) {
    res.send(`<script>alert('رقم بطاقة التعريف الوطنية (CIN) مسجل مسبقاً أو حدث خطأ ما.'); window.location.href='/register';</script>`);
  }
});

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تسجيل الدخول للمتدربين</title>
        ${commonCSS}
    </head>
    <body>
        <div class="container" style="max-width: 420px;">
            <h2>تسجيل دخول المتدرب</h2>
            <form action="/login" method="POST">
                <label>رقم CIN:</label>
                <input type="text" name="cin" required>
                <label>كلمة المرور:</label>
                <input type="password" name="password" required>
                <button type="submit" class="btn" style="width:100%;">دخول</button>
            </form>
            <p style="text-align:center; margin-top:20px;"><a href="/" style="color:#38bdf8; text-decoration:none;">العودة للرئيسية</a></p>
        </div>
    </body>
    </html>
  `);
});

app.post('/login', async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  const { password } = req.body;
  
  const user = await User.findOne({ cin });
  if (!user) {
    return res.send(`<script>alert('بيانات الدخول غير صحيحة!'); window.location.href='/login';</script>`);
  }

  const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
  if (!isMatch) {
    return res.send(`<script>alert('بيانات الدخول غير صحيحة!'); window.location.href='/login';</script>`);
  }

  if (user.status !== 'accepted') {
    return res.send(`<script>alert('حسابك قيد المراجعة ولم يتم قبوله بعد.'); window.location.href='/';</script>`);
  }

  req.session.userCin = cin;
  res.redirect(`/profile?cin=${cin}`);
});

app.get('/profile', async (req, res) => {
  const cin = req.query.cin ? req.query.cin.trim().toUpperCase() : '';
  const user = await User.findOne({ cin });
  if (!user) return res.redirect('/login');

  const announcements = await Announcement.find().sort({ _id: -1 });
  const settings = await Settings.findOne({ key: 'star' });
  const isStar = settings && settings.starCin === user.cin;
  const competitions = await Competition.find();
  const userComplaints = await Complaint.find({ senderCin: user.cin });
  const userInitiatives = await Initiative.find({ senderCin: user.cin });

  let rankDesc = 'انضباط متوسط';
  let rankColor = '#d97706';
  if (user.rank === 'A') { rankDesc = 'ممتاز - انضباط تام وتميز'; rankColor = '#059669'; }
  else if (user.rank === 'B') { rankDesc = 'جيد جداً - ملتزم بالقوانين'; rankColor = '#2563eb'; }
  else if (user.rank === 'D') { rankDesc = 'تحت المراقبة - يتطلب تحسين عاجل'; rankColor = '#e11d48'; }

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>الملف الشخصي - ${user.fullname}</title>
        ${commonCSS}
        <style>
          .profile-header { background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; }
          .profile-header h2 { color: white; margin-bottom: 5px; }
          .announcement-box { background: #162b48; border-right: 4px solid #f59e0b; color: #fde68a; padding: 15px 20px; border-radius: 8px; margin-bottom: 15px; }
          .warning-box { background: #450a0a; border-right: 4px solid #e11d48; color: #fecaca; padding: 15px 20px; border-radius: 8px; margin-bottom: 15px; }
          .star-banner { background: linear-gradient(135deg, #713f12, #854d0e); color: #fef08a; padding: 15px; border-radius: 10px; font-weight: bold; margin-bottom: 20px; text-align: center; }
          .card-section { background: #112238; border: 1px solid var(--border); padding: 25px; border-radius: 12px; margin-bottom: 25px; }
          .rank-legend { font-size: 13px; color: #94a3b8; margin-top: 5px; background: #07111e; padding: 8px 12px; border-radius: 6px; display: inline-block; }
          .complaint-item { background: #07111e; border: 1px solid var(--border); padding: 12px 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            ${user.warnings && user.warnings.length > 0 ? `
                <div class="card-section" style="background: #1a0505; border-color: #7f1d1d;">
                    <h3 style="color: #fca5a5; margin-bottom: 15px;">⚠️ تنبيهات وانذارات الإدارة الخاصة</h3>
                    ${user.warnings.map(w => `
                        <div class="warning-box">
                            <div><strong>ملاحظة إدارية:</strong> ${w.text}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${announcements.length > 0 ? `
                <div class="card-section" style="background: #1e1b10; border-color: #854d0e;">
                    <h3 style="color: #f59e0b; margin-bottom: 15px;">📢 لوحة الإعلانات والتنبيهات</h3>
                    ${announcements.map(a => `
                        <div class="announcement-box">
                            <div>🔔 ${a.text}</div>
                            ${a.image ? `<img src="${a.image}" style="max-width:220px; margin-top:10px; border-radius:8px; display:block;">` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="profile-header">
                <h2>مرحباً بك، ${user.fullname} 👋</h2>
                <p style="margin: 5px 0 0; opacity: 0.9;">الشعبة / القسم: <strong>${user.group}</strong></p>
            </div>

            ${isStar ? '<div class="star-banner">🌟 تهانينا الحارة! تم اختيارك كنجم الشهر نظيراً لانضباطك وتميزك المستمر!</div>' : ''}

            <div class="card-section">
                <h3>🎖️ وضعك الانضباطي الحالي</h3>
                <p>الرتبة الانضباطية المسجلة: <span class="badge badge-rank" style="font-size: 16px; padding: 6px 16px;">الرتبة ${user.rank}</span></p>
                <div class="rank-legend">
                    💡 <strong>دلالة الرتبة:</strong> <span style="color: ${rankColor}; font-weight: bold;">${rankDesc}</span>
                </div>
            </div>

            <div class="card-section">
                <h3>🛠️ تحديث مهاراتك ولغاتك</h3>
                <form action="/update-profile" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <label>المهارات التقنية (افصل بينها بفواصل):</label>
                    <input type="text" name="skills" value="${user.skills.join(', ')}" placeholder="مثال: JavaScript, Node.js">
                    
                    <label>اللغات المتقنة:</label>
                    <input type="text" name="languages" value="${user.languages.join(', ')}" placeholder="مثال: العربية, الفرنسية, الإنجليزية">
                    
                    <label>صورة لإنجاز أو شهادة أو مهارة (اختياري):</label>
                    <input type="file" name="skillImage" accept="image/*">
                    <button type="submit" class="btn" style="margin-top: 10px;">حفظ التحديثات</button>
                </form>
                ${user.skillImage ? `<div style="margin-top:15px;"><p style="font-size:13px; color:#94a3b8;">الصورة الحالية:</p><img src="${user.skillImage}" style="max-width:160px; border-radius:8px; border: 1px solid var(--border);"></div>` : ''}
            </div>

            <div class="card-section">
                <h3>💡 صندوق الابتكار والمبادرات الطلابية</h3>
                <p style="font-size: 13px; color: #94a3b8; margin-bottom: 15px;">شاركنا بأفكارك الابتكارية أو مقترحاتك لتطوير فضاء المؤسسة أو الأنشطة الموازية.</p>
                <form action="/add-initiative" method="POST">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <textarea name="initiativeText" rows="3" placeholder="اكتب فكرتك أو مقترحك الابتكاري هنا..." required></textarea>
                    <button type="submit" class="btn btn-success">إرسال المبادرة للإدارة</button>
                </form>

                <h4 style="margin-top: 20px; border-bottom: 2px solid var(--border); padding-bottom: 8px;">📋 سجل مبادراتك المقترحة:</h4>
                <div style="margin-top: 15px;">
                    ${userInitiatives.length > 0 ? userInitiatives.map(i => `
                        <div class="complaint-item">
                            <div><strong>${i.text}</strong></div>
                            <div>
                                <span class="badge" style="background: #0284c7; color: white;">${i.status}</span>
                            </div>
                        </div>
                    `).join('') : '<p style="color: #94a3b8; font-size: 14px;">لم تقم بإرسال أي مبادرات بعد.</p>'}
                </div>
            </div>

            <div class="card-section">
                <h3>📩 تقديم شكاية أو اقتراح للجنة</h3>
                <form action="/add-complaint" method="POST">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <textarea name="complaintText" rows="3" placeholder="اكتب شكايتك أو مقترحك هنا بسرية وبوضوح..." required></textarea>
                    <button type="submit" class="btn btn-danger">إرسال للجنة الانضباط</button>
                </form>

                <h4 style="margin-top: 25px; border-bottom: 2px solid var(--border); padding-bottom: 8px;">📋 سجل متابعة شكاياتك:</h4>
                <div style="margin-top: 15px;">
                    ${userComplaints.length > 0 ? userComplaints.map(c => `
                        <div class="complaint-item">
                            <div><strong>${c.text}</strong></div>
                            <div>
                                <span class="badge" style="background: ${c.status === 'قيد المراجعة' ? '#78350f' : '#064e3b'}; color: ${c.status === 'قيد المراجعة' ? '#fde68a' : '#a7f3d0'};">
                                    ${c.status}
                                </span>
                            </div>
                        </div>
                    `).join('') : '<p style="color: #94a3b8; font-size: 14px;">لا توجد شكايات مرسلة حالياً.</p>'}
                </div>
            </div>

            <div class="card-section">
                <h3>🏆 نتائج المسابقات والأنشطة</h3>
                <ul style="padding-right: 20px; margin: 0;">
                    ${competitions.length > 0 ? competitions.map(c => `<li style="margin-bottom: 8px; color:#cbd5e1;"><b>${c.title}:</b> ${c.result}</li>`).join('') : '<p style="color: #94a3b8; font-size: 14px;">لا توجد مسابقات معلنة حالياً.</p>'}
                </ul>
            </div>

            <p style="text-align:center; margin-top: 30px;"><a href="/" class="btn btn-danger" style="text-decoration:none; padding: 12px 30px;">تسجيل الخروج</a></p>
        </div>
    </body>
    </html>
  `);
});

app.post('/update-profile', upload.single('skillImage'), async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  const { skills, languages } = req.body;
  const updateData = {
    skills: skills ? skills.split(',').map(s => s.trim()) : [],
    languages: languages ? languages.split(',').map(l => l.trim()) : []
  };
  if (req.file) {
    updateData.skillImage = req.file.path;
  }
  
  await User.findOneAndUpdate({ cin }, updateData);
  res.redirect(`/profile?cin=${cin}`);
});

app.post('/add-complaint', async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  const { complaintText } = req.body;
  const user = await User.findOne({ cin });
  if (user) {
    await Complaint.create({
      senderName: user.fullname,
      senderCin: user.cin,
      group: user.group,
      text: complaintText,
      status: 'قيد المراجعة'
    });
  }
  res.send(`<script>alert('تم تقديم الشكاية بنجاح.'); window.location.href='/profile?cin=${cin}';</script>`);
});

app.post('/add-initiative', async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  const { initiativeText } = req.body;
  const user = await User.findOne({ cin });
  if (user) {
    await Initiative.create({
      senderName: user.fullname,
      senderCin: user.cin,
      group: user.group,
      text: initiativeText,
      status: 'قيد الدراسة'
    });
  }
  res.send(`<script>alert('تم إرسال مبادرتك بنجاح للإدارة. شكراً لمساهمتك!'); window.location.href='/profile?cin=${cin}';</script>`);
});

// تسجيل دخول المشرفين
app.get('/admin-login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>دخول المشرفين</title>
        ${commonCSS}
    </head>
    <body>
        <div class="container" style="max-width: 400px;">
            <h2>لوحة المشرفين (CAD)</h2>
            <form action="/admin-dashboard" method="POST">
                <label>كلمة المرور الخاصة بالمشرفين:</label>
                <input type="password" name="adminPass" required>
                <button type="submit" class="btn btn-danger" style="width:100%;">دخول اللوحة</button>
            </form>
            <p style="text-align:center; margin-top:20px;"><a href="/" style="color:#38bdf8; text-decoration:none;">العودة للرئيسية</a></p>
        </div>
    </body>
    </html>
  `);
});

// لوحة تحكم المشرفين
app.post('/admin-dashboard', async (req, res) => {
  const { adminPass } = req.body;
  if (adminPass !== 'caddac@2004' && !req.session.isAdmin) {
    return res.send(`<script>alert('كلمة المرور غير صحيحة!'); window.location.href='/admin-login';</script>`);
  }
  req.session.isAdmin = true;

  const users = await User.find();
  const complaints = await Complaint.find();
  const announcements = await Announcement.find().sort({ _id: -1 });
  const competitions = await Competition.find();
  const initiatives = await Initiative.find();

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة إدارة لجنة الانضباط - CAD</title>
        ${commonCSS}
        <style>
          .admin-section { background: #0b192c; border: 1px solid var(--border); padding: 20px; border-radius: 12px; margin-bottom: 25px; }
          .search-box { position: relative; margin-bottom: 20px; }
          .search-box input { padding-right: 40px; font-size: 16px; border: 2px solid var(--accent); }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🛡️ لوحة التحكم الخاصة بلجنة CAD</h2>
            
            <div style="margin-bottom: 25px; text-align: left;">
                <a href="/skills-directory" class="btn" style="background: var(--accent);">🌐 عرض دليل مهارات المتدربين</a>
            </div>

            <div class="admin-section">
                <h3>🔍 البحث السريع عن المتدربين وإدارة الإنذارات</h3>
                <div class="search-box">
                    <input type="text" id="searchInput" onkeyup="filterUsers()" placeholder="ابحث باسم المتدرب، رقم CIN، أو الشعبة...">
                </div>

                <h3>قائمة المتدربين والطلبات</h3>
                <table>
                    <thead>
                        <tr>
                            <th>الاسم الكامل</th>
                            <th>CIN</th>
                            <th>الشعبة</th>
                            <th>الملف</th>
                            <th>الحالة والرتبة</th>
                            <th>إرسال تنبيه خاص</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="usersTable">
                        ${users.map(u => `
                            <tr class="user-row">
                                <td class="user-name">${u.fullname}</td>
                                <td class="user-cin">${u.cin}</td>
                                <td class="user-group">${u.group}</td>
                                <td>${u.pnj ? `<a href="${u.pnj}" target="_blank" style="color:#38bdf8;">عرض</a>` : 'لا يوجد'}</td>
                                <td>
                                    ${u.status === 'pending' ? '<span style="color:#f59e0b; font-weight:bold;">قيد الانتظار</span>' : '<span style="color:#10b981; font-weight:bold;">مقبول</span>'}
                                    <form action="/admin/update-rank" method="POST" style="margin-top:5px;">
                                        <input type="hidden" name="cin" value="${u.cin}">
                                        <select name="rank" onchange="this.form.submit()" style="margin:0; padding:2px; font-size:12px;">
                                            <option value="A" ${u.rank==='A'?'selected':''}>A</option>
                                            <option value="B" ${u.rank==='B'?'selected':''}>B</option>
                                            <option value="C" ${u.rank==='C'?'selected':''}>C</option>
                                            <option value="D" ${u.rank==='D'?'selected':''}>D</option>
                                        </select>
                                    </form>
                                </td>
                                <td>
                                    <form action="/admin/add-warning" method="POST" style="display:flex; gap:5px; margin:0;">
                                        <input type="hidden" name="cin" value="${u.cin}">
                                        <input type="text" name="warningText" placeholder="اكتب الإنذار..." required style="margin:0; padding:4px; font-size:12px;">
                                        <button type="submit" class="btn btn-danger" style="padding:4px 8px; font-size:11px;">إرسال</button>
                                    </form>
                                </td>
                                <td>
                                    ${u.status === 'pending' ? `
                                        <form action="/admin/accept" method="POST" style="display:inline;">
                                            <input type="hidden" name="cin" value="${u.cin}">
                                            <button type="submit" class="btn btn-success" style="padding:4px 8px; font-size:12px;">قبول</button>
                                        </form>
                                    ` : ''}
                                    <form action="/admin/delete" method="POST" style="display:inline;">
                                        <input type="hidden" name="cin" value="${u.cin}">
                                        <button type="submit" class="btn btn-danger" style="padding:4px 8px; font-size:12px;">حذف</button>
                                    </form>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="admin-section">
                <h3>📢 نشر وإدارة الإعلانات</h3>
                <form action="/admin/add-announcement" method="POST" enctype="multipart/form-data">
                    <textarea name="text" placeholder="اكتب نص الإعلان هنا..." required></textarea>
                    <label>صورة مرفقة بالإعلان (اختياري):</label>
                    <input type="file" name="annImage" accept="image/*">
                    <button type="submit" class="btn">نشر الإعلان</button>
                </form>

                <h4 style="margin-top:20px;">الإعلانات المنشورة حالياً:</h4>
                <table>
                    <thead>
                        <tr>
                            <th>نص الإعلان</th>
                            <th>الصورة المرفقة</th>
                            <th>الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${announcements.length > 0 ? announcements.map(a => `
                            <tr>
                                <td>${a.text}</td>
                                <td>${a.image ? `<a href="${a.image}" target="_blank" style="color:#38bdf8;">عرض الصورة</a>` : 'لا توجد'}</td>
                                <td>
                                    <form action="/admin/announcement/delete" method="POST" style="margin:0;">
                                        <input type="hidden" name="id" value="${a._id}">
                                        <button type="submit" class="btn btn-danger" style="padding:4px 8px; font-size:12px;">حذف الإعلان</button>
                                    </form>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="3" style="text-align:center;">لا توجد إعلانات منشورة</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div class="admin-section">
                <h3>⭐ اختيار نجم الشهر</h3>
                <form action="/admin/set-star" method="POST">
                    <select name="cin">
                        ${users.filter(u => u.status === 'accepted').map(u => `<option value="${u.cin}">${u.fullname} - (${u.group})</option>`).join('')}
                    </select>
                    <button type="submit" class="btn btn-success">تعيين المتدرب كنجم الشهر</button>
                </form>
            </div>

            <div class="admin-section">
                <h3>🏆 إدارة المسابقات</h3>
                <form action="/admin/add-competition" method="POST">
                    <input type="text" name="title" placeholder="اسم المسابقة..." required>
                    <input type="text" name="result" placeholder="النتيجة أو الفائز..." required>
                    <button type="submit" class="btn">إضافة / تحديث المسابقة</button>
                </form>
            </div>

            <div class="admin-section">
                <h3>💡 صندوق الابتكار والمبادرات الواردة</h3>
                <table>
                    <thead>
                        <tr>
                            <th>المتدرب</th>
                            <th>الشعبة</th>
                            <th>المبادرة / المقترح</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${initiatives.length > 0 ? initiatives.map(i => `
                            <tr>
                                <td>${i.senderName} (${i.senderCin})</td>
                                <td>${i.group}</td>
                                <td>${i.text}</td>
                                <td><span style="color:#38bdf8; font-weight:bold;">${i.status}</span></td>
                                <td>
                                    <form action="/admin/initiative/review" method="POST" style="display:inline;">
                                        <input type="hidden" name="id" value="${i._id}">
                                        <button type="submit" class="btn btn-success" style="padding:4px 8px; font-size:12px;">قبول ودراسة</button>
                                    </form>
                                    <form action="/admin/initiative/delete" method="POST" style="display:inline;">
                                        <input type="hidden" name="id" value="${i._id}">
                                        <button type="submit" class="btn btn-danger" style="padding:4px 8px; font-size:12px;">حذف</button>
                                    </form>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">لا توجد مبادرات واردة حالياً</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div class="admin-section">
                <h3>📩 الشكايات والملاحظات الواردة</h3>
                <table>
                    <thead>
                        <tr>
                            <th>المتدرب</th>
                            <th>القسم</th>
                            <th>الشكاية</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${complaints.map(c => `
                            <tr>
                                <td>${c.senderName} (${c.senderCin})</td>
                                <td>${c.group}</td>
                                <td>${c.text}</td>
                                <td><span style="color:${c.status === 'قيد المراجعة' ? '#f59e0b' : '#10b981'}; font-weight:bold;">${c.status}</span></td>
                                <td>
                                    ${c.status === 'قيد المراجعة' ? `
                                        <form action="/admin/complaint/review" method="POST" style="display:inline;">
                                            <input type="hidden" name="id" value="${c._id}">
                                            <button type="submit" class="btn btn-success" style="padding:4px 8px; font-size:12px;">قبول ومعالجة</button>
                                        </form>
                                    ` : ''}
                                    <form action="/admin/complaint/delete" method="POST" style="display:inline;">
                                        <input type="hidden" name="id" value="${c._id}">
                                        <button type="submit" class="btn btn-danger" style="padding:4px 8px; font-size:12px;">حذف</button>
                                    </form>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <p style="text-align:center;"><a href="/" class="btn btn-danger">تسجيل الخروج</a></p>
        </div>

        <script>
            function filterUsers() {
                const input = document.getElementById('searchInput').value.toLowerCase();
                const rows = document.querySelectorAll('.user-row');

                rows.forEach(row => {
                    const name = row.querySelector('.user-name').textContent.toLowerCase();
                    const cin = row.querySelector('.user-cin').textContent.toLowerCase();
                    const group = row.querySelector('.user-group').textContent.toLowerCase();

                    if (name.includes(input) || cin.includes(input) || group.includes(input)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        </script>
    </body>
    </html>
  `);
});

// المسارات والإجراءات الإدارية
app.post('/admin/add-announcement', upload.single('annImage'), async (req, res) => {
  const { text } = req.body;
  await Announcement.create({
    text,
    image: req.file ? req.file.path : ''
  });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/announcement/delete', async (req, res) => {
  const { id } = req.body;
  await Announcement.findByIdAndDelete(id);
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/set-star', async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  await Settings.findOneAndUpdate(
    { key: 'star' },
    { starCin: cin },
    { upsert: true }
  );
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/add-competition', async (req, res) => {
  const { title, result } = req.body;
  await Competition.create({ title, result });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/update-rank', async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  const { rank } = req.body;
  await User.findOneAndUpdate({ cin }, { rank });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/add-warning', async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  const { warningText } = req.body;
  if (cin && warningText) {
    await User.findOneAndUpdate(
      { cin },
      { $push: { warnings: { text: warningText, date: new Date() } } }
    );
  }
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/accept', async (req, res) => {
  const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
  await User.findOneAndUpdate({ cin }, { status: 'accepted' });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/delete', async (req, res) => {
  try {
    const cin = req.body.cin ? req.body.cin.trim().toUpperCase() : '';
    if (cin) {
      await User.findOneAndDelete({ cin });
    }
  } catch (err) {
    console.error(err);
  }
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/complaint/review', async (req, res) => {
  const { id } = req.body;
  await Complaint.findByIdAndUpdate(id, { status: 'تمت معالجة شكايتك من طرف اللجنة' });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/complaint/delete', async (req, res) => {
  const { id } = req.body;
  await Complaint.findByIdAndDelete(id);
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/initiative/review', async (req, res) => {
  const { id } =, req.body;
  await Initiative.findByIdAndUpdate(id, { status: 'تم قبول المبادرة ودراستها' });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/initiative/delete', async (req, res) => {
  const { id } = req.body;
  await Initiative.findByIdAndDelete(id);
  res.redirect(307, '/admin-dashboard');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
