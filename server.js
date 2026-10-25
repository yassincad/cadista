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
      --primary: #0b192c;
      --primary-light: #1e3e62;
      --accent: #0D9488;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
    body { background-color: var(--bg); color: var(--text); margin: 0; padding: 0; direction: rtl; }
    .container { max-width: 1100px; margin: 20px auto; background: var(--card-bg); padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    h1, h2, h3 { color: var(--primary); margin-top: 0; font-weight: 700; }
    .btn { display: inline-block; background: var(--primary); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; text-align: center; }
    .btn:hover { background: var(--primary-light); transform: translateY(-2px); }
    .btn-danger { background: #e11d48; }
    .btn-danger:hover { background: #be123c; }
    .btn-success { background: #10b981; }
    .btn-success:hover { background: #059669; }
    input, select, textarea { width: 100%; padding: 12px; margin: 8px 0 16px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: #f8fafc; transition: 0.2s; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); background: white; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; border-radius: 8px; overflow: hidden; }
    th { background: var(--primary); color: white; padding: 12px; font-weight: 600; text-align: right; }
    td { padding: 12px; border-bottom: 1px solid var(--border); text-align: right; }
    tr:hover { background-color: #f1f5f9; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .badge-rank { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  </style>
`;

// 1. الرئيسية الجديدة المطابقة للتصميم المطلوب
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
        <style>
          * { box-sizing: border-box; font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
          body { background-color: #0b192c; color: #ffffff; direction: rtl; }
          
          /* شريط التنقل العلوي */
          .navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: rgba(11, 25, 44, 0.95); border-bottom: 1px solid rgba(255,255,255,0.1); }
          .logo-area { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 22px; color: #ffffff; }
          .nav-links { display: flex; gap: 25px; align-items: center; }
          .nav-links a { color: #cbd5e1; text-decoration: none; font-weight: 600; transition: 0.2s; }
          .nav-links a:hover, .nav-links a.active { color: #38bdf8; }
          .admin-btn { background: #0D9488; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 8px; }

          /* القسم الرئيسي (Hero) */
          .hero-section { position: relative; background: linear-gradient(135deg, #0b192c 0%, #1e3e62 100%); padding: 60px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 40px; border-bottom: 4px solid #0D9488; }
          .hero-content { max-width: 600px; }
          .welcome-badge { color: #38bdf8; font-weight: 700; margin-bottom: 15px; display: inline-block; font-size: 16px; }
          .hero-content h1 { font-size: 3rem; font-weight: 800; line-height: 1.2; margin-bottom: 15px; color: #ffffff; }
          .hero-content p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 30px; line-height: 1.6; }
          .hero-btns { display: flex; gap: 15px; flex-wrap: wrap; }
          .btn-main { background: #0D9488; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; box-shadow: 0 4px 15px rgba(13, 148, 136, 0.4); transition: 0.2s; }
          .btn-main:hover { background: #0f766e; transform: translateY(-2px); }
          .btn-outline { background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; transition: 0.2s; }
          .btn-outline:hover { background: rgba(255,255,255,0.15); }

          /* بطاقة الإحصائيات الجانبية */
          .stats-card { background: #112238; border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; text-align: center; min-width: 260px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          .stats-number { font-size: 3.5rem; font-weight: 800; color: #38bdf8; margin: 10px 0; }
          .stats-label { color: #94a3b8; font-size: 1rem; font-weight: 600; }

          /* قسم ما هي لجنة الانضباط */
          .about-section { background: #ffffff; color: #1e293b; padding: 70px 5%; text-align: center; }
          .section-title { font-size: 2.2rem; color: #0b192c; font-weight: 800; margin-bottom: 15px; }
          .section-desc { max-width: 700px; margin: 0 auto 50px; color: #64748b; font-size: 1.1rem; line-height: 1.7; }
          .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
          .feature-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 30px 20px; border-radius: 12px; transition: 0.3s; }
          .feature-box:hover { transform: translateY(-5px); border-color: #0D9488; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
          .feature-box h4 { color: #0b192c; font-size: 1.2rem; margin-bottom: 10px; }
          .feature-box p { color: #64748b; font-size: 0.95rem; }
          .tagline { font-size: 1.5rem; color: #0D9488; font-weight: 700; margin-top: 30px; }

          /* قسم القوانين والمعايير */
          .rules-section { background: #07111e; padding: 70px 5%; color: white; }
          .rules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 40px; }
          .rule-card { background: #112238; border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 12px; display: flex; align-items: flex-start; gap: 15px; }
          .rule-icon { color: #0D9488; font-size: 24px; font-weight: bold; background: rgba(13, 148, 136, 0.1); width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; }
          .rule-text { font-size: 1rem; color: #cbd5e1; line-height: 1.6; }

          footer { background: #050d18; text-align: center; padding: 25px; color: #64748b; font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.05); }
        </style>
    </head>
    <body>

        <!-- شريط التنقل -->
        <div class="navbar">
            <div class="logo-area">
                <span>CAD • OFPPT</span>
            </div>
            <div class="nav-links">
                <a href="/" class="active">الرئيسية</a>
                <a href="#rules">القوانين والمعايير</a>
                <a href="/register">التسجيل</a>
                <a href="/login">تسجيل الدخول</a>
                <a href="/admin-login" class="admin-btn">👤 المشرفين</a>
            </div>
        </div>

        <!-- القسم الرئيسي (Hero) -->
        <div class="hero-section">
            <div class="hero-content">
                <span class="welcome-badge">مرحباً بكم في موقع</span>
                <h1>لجنة الانضباط الذاتية (CAD)</h1>
                <p>معاً من أجل بيئة تكوينية أفضل في مؤسسة التكوين المهني و إنعاش الشغل OFPPT.</p>
                <div class="hero-btns">
                    <a href="/register" class="btn-main">تسجيل جديد</a>
                    <a href="/login" class="btn-outline">تسجيل الدخول</a>
                </div>
            </div>
            <div class="stats-card">
                <div style="font-size: 28px;">👥</div>
                <div class="stats-number">${acceptedCount}</div>
                <div class="stats-label">عدد المتدربين المسجلين</div>
            </div>
        </div>

        <!-- قسم ما هي لجنة الانضباط -->
        <div class="about-section">
            <h2 class="section-title">ما هي لجنة الانضباط الذاتية (CAD) ؟</h2>
            <p class="section-desc">لجنة الانضباط الذاتية هي هيئة طلابية داخل مؤسسة التكوين المهني OFPPT، تعمل على تعزيز قيم الانضباط والسلوك الإيجابي، ومرافقة المتدربين في مسيرتهم التكوينية من أجل بيئة تعليمية سليمة ومحترمة.</p>
            
            <div class="features-grid">
                <div class="feature-box">
                    <h4>🤝 معاً نحو مستقبل أفضل</h4>
                    <p>بناء جسد طلابي واعي ومسؤول.</p>
                </div>
                <div class="feature-box">
                    <h4>📈 التطوير والاقتراحات</h4>
                    <p>تطوير المهارات والمقترحات الابتكارية.</p>
                </div>
                <div class="feature-box">
                    <h4>👥 تمثيل المتدربين والمرافقة</h4>
                    <p>دعم المتدربين وسماع شكاياتهم.</p>
                </div>
                <div class="feature-box">
                    <h4>🛡️ الانضباط والاحترام</h4>
                    <p>الالتزام باللوائح والقوانين الداخلية.</p>
                </div>
            </div>

            <div class="tagline">انضباطك ... نجاحك</div>
        </div>

        <!-- قسم القوانين والمعايير الدقيقة المطلوبة -->
        <div class="rules-section" id="rules">
            <h2 style="color: white; font-size: 2.2rem; text-align: center; margin-bottom: 10px;">القوانين والمعايير</h2>
            <p style="color: #94a3b8; text-align: center; margin-bottom: 30px;">احترام هذه القوانين مسؤوليتك جميعاً من أجل بيئة تكوينية منظمة وآمنة.</p>
            
            <div class="rules-grid">
                <div class="rule-card">
                    <div class="rule-icon">01</div>
                    <div class="rule-text">ارتداء اللباس المهني أو الزي المطلوب.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">02</div>
                    <div class="rule-text">احترام الأطر الإدارية والتكوينية وباقي المتدربين.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">03</div>
                    <div class="rule-text">المحافظة على تجهيزات المؤسسة وممتلكاتها.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">04</div>
                    <div class="rule-text">عدم التدخين داخل المؤسسة.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">05</div>
                    <div class="rule-text">عدم استعمال الهاتف أو الأجهزة الصوتية أثناء الدروس والامتحانات.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">06</div>
                    <div class="rule-text">عدم إدخال مواد أو أدوات ممنوعة إلى المؤسسة.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">07</div>
                    <div class="rule-text">الحضور قبل موعد الامتحان بنصف ساعة على الأقل.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">08</div>
                    <div class="rule-text">احترام أوقات التكوين وعدم البقاء في المؤسسة خارج الأوقات المحددة.</div>
                </div>
                <div class="rule-card">
                    <div class="rule-icon">09</div>
                    <div class="rule-text">تجنب الغياب والتأخر، فقد تُسجَّل المخالفات وتؤثر في التقييم أو تؤدي إلى إجراءات إدارية.</div>
                </div>
            </div>
        </div>

        <footer>
            <p>جميع الحقوق محفوظة © لجنة الانضباط الذاتية CAD OFPPT 2026</p>
        </footer>

    </body>
    </html>
  `);
});

// 🔒 2. صفحة دليل مهارات المتدربين (متاحة حصراً للمشرفين)
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
            <p style="color: #64748b; margin-bottom: 20px;">قائمة بمهارات ولغات المتدربين المقبولين في المؤسسة.</p>
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
                            <td>${u.skills && u.skills.length > 0 ? u.skills.join(', ') : '<span style="color:#94a3b8;">غير مسجلة</span>'}</td>
                            <td>${u.languages && u.languages.length > 0 ? u.languages.join(', ') : '<span style="color:#94a3b8;">غير مسجلة</span>'}</td>
                            <td>${u.skillImage ? `<a href="${u.skillImage}" target="_blank" style="color:var(--accent); font-weight:bold;">عرض الملف</a>` : '<span style="color:#94a3b8;">لا يوجد</span>'}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="5" style="text-align:center; color:#64748b;">لا توجد بيانات مسجلة حالياً</td></tr>'}
                </tbody>
            </table>
            <p style="text-align:center; margin-top:30px;"><a href="/admin-dashboard" class="btn" style="text-decoration:none;">العودة لوحة التحكم</a></p>
        </div>
    </body>
    </html>
  `);
});

// التسجيل
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
            <p style="text-align:center; margin-top:20px;"><a href="/" style="color:var(--primary); text-decoration:none;">العودة للرئيسية</a></p>
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

// تسجيل الدخول
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
            <p style="text-align:center; margin-top:20px;"><a href="/" style="color:var(--primary); text-decoration:none;">العودة للرئيسية</a></p>
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

// الملف الشخصي للمتدرب
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
          .profile-header { background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .profile-header h2 { color: white; margin-bottom: 5px; }
          .announcement-box { background: #fffbeb; border-right: 4px solid #f59e0b; color: #92400e; padding: 15px 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
          .warning-box { background: #fff1f2; border-right: 4px solid #e11d48; color: #9f1239; padding: 15px 20px; border-radius: 8px; margin-bottom: 15px; }
          .star-banner { background: linear-gradient(135deg, #fef08a, #fde047); color: #713f12; padding: 15px; border-radius: 10px; font-weight: bold; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 10px rgba(234, 179, 8, 0.2); }
          .card-section { background: #ffffff; border: 1px solid var(--border); padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
          .rank-legend { font-size: 13px; color: #64748b; margin-top: 5px; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; display: inline-block; }
          .complaint-item { background: #f8fafc; border: 1px solid var(--border); padding: 12px 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            ${user.warnings && user.warnings.length > 0 ? `
                <div class="card-section" style="background: #fff5f5; border-color: #fecaca;">
                    <h3 style="color: #9f1239; margin-bottom: 15px;">⚠️ تنبيهات وانذارات الإدارة الخاصة</h3>
                    ${user.warnings.map(w => `
                        <div class="warning-box">
                            <div><strong>ملاحظة إدارية:</strong> ${w.text}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${announcements.length > 0 ? `
                <div class="card-section" style="background: #fffdf4; border-color: #fef08a;">
                    <h3 style="color: #b45309; margin-bottom: 15px;">📢 لوحة الإعلانات والتنبيهات</h3>
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
                ${user.skillImage ? `<div style="margin-top:15px;"><p style="font-size:13px; color:#64748b;">الصورة الحالية:</p><img src="${user.skillImage}" style="max-width:160px; border-radius:8px; border: 1px solid var(--border);"></div>` : ''}
            </div>

            <div class="card-section">
                <h3>💡 صندوق الابتكار والمبادرات الطلابية</h3>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">شاركنا بأفكارك الابتكارية أو مقترحاتك لتطوير فضاء المؤسسة أو الأنشطة الموازية.</p>
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
                                <span class="badge" style="background: #e0f2fe; color: #0284c7;">${i.status}</span>
                            </div>
                        </div>
                    `).join('') : '<p style="color: #64748b; font-size: 14px;">لم تقم بإرسال أي مبادرات بعد.</p>'}
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
                                <span class="badge" style="background: ${c.status === 'قيد المراجعة' ? '#fef3c7' : '#d1fae5'}; color: ${c.status === 'قيد المراجعة' ? '#d97706' : '#059669'};">
                                    ${c.status}
                                </span>
                            </div>
                        </div>
                    `).join('') : '<p style="color: #64748b; font-size: 14px;">لا توجد شكايات مرسلة حالياً.</p>'}
                </div>
            </div>

            <div class="card-section">
                <h3>🏆 نتائج المسابقات والأنشطة</h3>
                <ul style="padding-right: 20px; margin: 0;">
                    ${competitions.length > 0 ? competitions.map(c => `<li style="margin-bottom: 8px;"><b>${c.title}:</b> ${c.result}</li>`).join('') : '<p style="color: #64748b; font-size: 14px;">لا توجد مسابقات معلنة حالياً.</p>'}
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
            <p style="text-align:center; margin-top:20px;"><a href="/" style="color:var(--primary); text-decoration:none;">العودة للرئيسية</a></p>
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
          .admin-section { background: #f8fafc; border: 1px solid var(--border); padding: 20px; border-radius: 12px; margin-bottom: 25px; }
          .search-box { position: relative; margin-bottom: 20px; }
          .search-box input { padding-right: 40px; font-size: 16px; border: 2px solid var(--primary-light); }
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
                                <td>${u.pnj ? `<a href="${u.pnj}" target="_blank" style="color:var(--accent);">عرض</a>` : 'لا يوجد'}</td>
                                <td>
                                    ${u.status === 'pending' ? '<span style="color:#d97706; font-weight:bold;">قيد الانتظار</span>' : '<span style="color:#059669; font-weight:bold;">مقبول</span>'}
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
                                <td>${a.image ? `<a href="${a.image}" target="_blank" style="color:var(--accent);">عرض الصورة</a>` : 'لا توجد'}</td>
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
                                <td><span style="color:#0284c7; font-weight:bold;">${i.status}</span></td>
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
                        `).join('') : '<tr><td colspan="5" style="text-align:center; color:#64748b;">لا توجد مبادرات واردة حالياً</td></tr>'}
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
                                <td><span style="color:${c.status === 'قيد المراجعة' ? '#d97706' : '#059669'}; font-weight:bold;">${c.status}</span></td>
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
  const { id } = req.body;
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
