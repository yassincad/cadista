const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. إعدادات الاتصال بقاعدة بيانات MongoDB
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

// تعريف Schemas ونماذج البيانات (Models)
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  cin: { type: String, required: true, unique: true, uppercase: true },
  pnj: { type: String, required: true },
  group: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, default: 'pending' },
  rank: { type: String, default: 'C' },
  skills: [String],
  languages: [String],
  skillImage: { type: String, default: '' }
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

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const Competition = mongoose.model('Competition', competitionSchema);
const Settings = mongoose.model('Settings', settingsSchema);

// تنسيقات CSS الموحدة للتطبيق
const commonCSS = `
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1a365d;
      --primary-light: #2b6cb0;
      --accent: #0D9488;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
    body { background-color: var(--bg); color: var(--text); margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 1000px; margin: 20px auto; background: var(--card-bg); padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    h1, h2, h3 { color: var(--primary); margin-top: 0; font-weight: 700; }
    .btn { display: inline-block; background: var(--primary); color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; text-align: center; }
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
    .site-logo { width: 140px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; }
  </style>
`;

// 1. الصفحة الرئيسية مع الشعار الجديد
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لجنة الانضباط الذاتية - CAD OFPPT</title>
        ${commonCSS}
        <style>
          .hero { text-align: center; padding: 20px 20px 40px; }
          .hero h1 { font-size: 2.2rem; margin-bottom: 10px; color: var(--primary); }
          .hero p { color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto 30px; }
          .btn-group { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-bottom: 40px; }
          .rules-card { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 25px; border-radius: 12px; text-align: right; }
          .rules-card h3 { color: #166534; display: flex; align-items: center; gap: 8px; }
          .rules-card li { margin-bottom: 10px; color: #15803d; }
        </style>
    </head>
    <body>
        <div class="container hero">
            <!-- إضافة الشعار هنا -->
            <img src="WhatsApp_Image_2026-10-17_at_6.36.49_PM" alt="شعار لجنة الانضباط الذاتية CAD" class="site-logo" onerror="this.onerror=null; this.src='https://i.imgur.com/7kX1g6u.png';">
            
            <h1>لجنة الانضباط الذاتية (CAD)</h1>
            <p>المنصة الرسمية لتعزيز الانضباط، الالتزام، وتطوير مهارات متدربي مكتب التكوين المهني وإنعاش الشغل.</p>
            
            <div class="btn-group">
                <a href="/register" class="btn btn-success">تسجيل متدرب جديد</a>
                <a href="/login" class="btn">تسجيل الدخول</a>
                <a href="/admin-login" class="btn btn-danger">بوابة المشرفين</a>
            </div>

            <div class="rules-card">
                <h3>📜 القوانين والمعايير الأساسية للمؤسسة:</h3>
                <ul>
                    <li>الالتزام التام بالتوقيت الإداري والزي المدرسي المحدد.</li>
                    <li>التحلي بالأخلاق الحسنة والتعاون الإيجابي والاحترام المتبادل.</li>
                    <li>المشاركة الفعالة في الأنشطة الموازية والمسابقات الرسمية.</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 2. صفحة التسجيل (تغيير النص إلى صورة المتدرب)
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
                <input type="text" name="fullname" placeholder="مثال: محمد العلوي" required>
                
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
    const { fullname, cin, group, password } = req.body;
    const fileUrl = req.file ? req.file.path : '';
    
    await User.create({
      fullname,
      cin: cin.trim().toUpperCase(),
      pnj: fileUrl,
      group,
      password
    });
    
    res.send(`<script>alert('تم إرسال طلبك بنجاح! سيتم مراجعته من طرف المشرفين.'); window.location.href='/';</script>`);
  } catch (err) {
    res.send(`<script>alert('رقم بطاقة التعريف الوطنية (CIN) مسجل مسبقاً أو حدث خطأ ما.'); window.location.href='/register';</script>`);
  }
});

// 3. صفحة تسجيل الدخول
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
  
  const user = await User.findOne({ cin, password });
  
  if (!user) {
    return res.send(`<script>alert('بيانات الدخول غير صحيحة!'); window.location.href='/login';</script>`);
  }
  if (user.status !== 'accepted') {
    return res.send(`<script>alert('حسابك قيد المراجعة ولم يتم قبوله بعد.'); window.location.href='/';</script>`);
  }

  res.redirect(`/profile?cin=${cin}`);
});

// 4. ملف المتدرب الشخصي (مع عرض حالة الشكاية المحدثة)
app.get('/profile', async (req, res) => {
  const { cin } = req.query;
  const user = await User.findOne({ cin });
  if (!user) return res.redirect('/login');

  const latestAnnouncement = await Announcement.findOne().sort({ _id: -1 }) || { text: "لا توجد إعلانات جديدة حالياً.", image: "" };
  const settings = await Settings.findOne({ key: 'star' });
  const isStar = settings && settings.starCin === user.cin;
  const competitions = await Competition.find();
  const userComplaints = await Complaint.find({ senderCin: user.cin });

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>الملف الشخصي - ${user.fullname}</title>
        ${commonCSS}
        <style>
          .announcement-box { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 20px; border-radius: 12px; margin-bottom: 25px; }
          .star-badge { background: #fef08a; color: #854d0e; padding: 10px 15px; border-radius: 8px; border: 1px solid #facc15; font-weight: bold; margin-bottom: 20px; display: inline-block; }
          .card-section { background: #f8fafc; border: 1px solid var(--border); padding: 20px; border-radius: 12px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="announcement-box">
                🔔 <strong>إعلان هام من اللجنة:</strong> ${latestAnnouncement.text}
                ${latestAnnouncement.image ? `<br><img src="${latestAnnouncement.image}" style="max-width:200px; margin-top:10px; border-radius:8px;">` : ''}
            </div>

            <h2>مرحباً بك، ${user.fullname} 👋</h2>
            <p><strong>الشعبة:</strong> ${user.group} | <strong>الرتبة الانضباطية:</strong> <span class="badge badge-rank">الرتبة ${user.rank}</span></p>

            ${isStar ? '<div class="star-badge">🌟 تهانينا! تم اختيارك كنجم الشهر نظيراً لانضباطك وتميزك!</div>' : ''}

            <div class="card-section">
                <h3>تحديث المهارات واللغات</h3>
                <form action="/update-profile" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <label>المهارات (افصل بينها بفواصل):</label>
                    <input type="text" name="skills" value="${user.skills.join(', ')}">
                    
                    <label>اللغات المتقنة:</label>
                    <input type="text" name="languages" value="${user.languages.join(', ')}">
                    
                    <label>صورة لإنجاز أو مهارة:</label>
                    <input type="file" name="skillImage" accept="image/*">
                    <button type="submit" class="btn">تحديث البيانات</button>
                </form>
                ${user.skillImage ? `<br><img src="${user.skillImage}" style="max-width:150px; border-radius:8px; margin-top:10px;">` : ''}
            </div>

            <div class="card-section">
                <h3>تقديم شكاية أو اقتراح</h3>
                <form action="/add-complaint" method="POST">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <textarea name="complaintText" rows="3" placeholder="اكتب شكايتك أو ملاحظتك هنا بوضوح..." required></textarea>
                    <button type="submit" class="btn btn-danger">إرسال للجنة</button>
                </form>

                <h4 style="margin-top:20px;">متابعة شكاياتك:</h4>
                <ul>
                    ${userComplaints.length > 0 ? userComplaints.map(c => `
                        <li>
                            <b>${c.text}</b> - 
                            <span style="color:${c.status === 'قيد المراجعة' ? '#d97706' : '#059669'}; font-weight:bold;">
                                ${c.status === 'قيد المراجعة' ? 'قيد المراجعة' : 'تمت معالجة شكايتك من طرف اللجنة'}
                            </span>
                        </li>
                    `).join('') : '<li>لا توجد شكايات مرسلة حالياً.</li>'}
                </ul>
            </div>

            <div class="card-section">
                <h3>جدول المسابقات والنتائج</h3>
                <ul>
                    ${competitions.length > 0 ? competitions.map(c => `<li><b>${c.title}:</b>${c.result}</li>`).join('') : '<li>لا توجد مسابقات حالياً.</li>'}
                </ul>
            </div>

            <p style="text-align:center;"><a href="/" class="btn btn-danger" style="text-decoration:none;">تسجيل الخروج</a></p>
        </div>
    </body>
    </html>
  `);
});

app.post('/update-profile', upload.single('skillImage'), async (req, res) => {
  const { cin, skills, languages } = req.body;
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
  const { cin, complaintText } = req.body;
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

// 5. تسجيل دخول المشرفين
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

// 6. لوحة تحكم المشرفين مع إدارة الشكايات (قبول وحذف)
app.post('/admin-dashboard', async (req, res) => {
  const { adminPass } = req.body;
  if (adminPass !== 'caddac@2004') {
    return res.send(`<script>alert('كلمة المرور غير صحيحة!'); window.location.href='/admin-login';</script>`);
  }

  const users = await User.find();
  const complaints = await Complaint.find();
  const competitions = await Competition.find();

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
            
            <div class="admin-section">
                <h3>🔍 البحث السريع عن المتدربين</h3>
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
                            <th>صورة المتدرب</th>
                            <th>الحالة</th>
                            <th>الرتبة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="usersTable">
                        ${users.map(u => `
                            <tr class="user-row">
                                <td class="user-name">${u.fullname}</td>
                                <td class="user-cin">${u.cin}</td>
                                <td class="user-group">${u.group}</td>
                                <td>${u.pnj ? `<a href="${u.pnj}" target="_blank" style="color:var(--accent);">عرض الملف</a>` : 'لا يوجد'}</td>
                                <td>${u.status === 'pending' ? '<span style="color:#d97706; font-weight:bold;">قيد الانتظار</span>' : '<span style="color:#059669; font-weight:bold;">مقبول</span>'}</td>
                                <td>
                                    <form action="/admin/update-rank" method="POST" style="margin:0;">
                                        <input type="hidden" name="adminPass" value="cad2026">
                                        <input type="hidden" name="cin" value="${u.cin}">
                                        <select name="rank" onchange="this.form.submit()" style="margin:0; padding:4px;">
                                            <option value="A" ${u.rank==='A'?'selected':''}>A</option>
                                            <option value="B" ${u.rank==='B'?'selected':''}>B</option>
                                            <option value="C" ${u.rank==='C'?'selected':''}>C</option>
                                            <option value="D" ${u.rank==='D'?'selected':''}>D</option>
                                        </select>
                                    </form>
                                </td>
                                <td>
                                    ${u.status === 'pending' ? `
                                        <form action="/admin/accept" method="POST" style="display:inline;">
                                            <input type="hidden" name="adminPass" value="cad2026">
                                            <input type="hidden" name="cin" value="${u.cin}">
                                            <button type="submit" class="btn btn-success" style="padding:4px 8px; font-size:12px;">قبول</button>
                                        </form>
                                    ` : ''}
                                    <form action="/admin/delete" method="POST" style="display:inline;">
                                        <input type="hidden" name="adminPass" value="cad2026">
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
                <h3>📢 نشر إعلان جديد</h3>
                <form action="/admin/add-announcement" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="adminPass" value="cad2026">
                    <textarea name="text" placeholder="اكتب نص الإعلان هنا..." required></textarea>
                    <label>صورة مرفقة بالإعلان (اختياري):</label>
                    <input type="file" name="annImage" accept="image/*">
                    <button type="submit" class="btn">نشر الإعلان</button>
                </form>
            </div>

            <div class="admin-section">
                <h3>⭐ اختيار نجم الشهر</h3>
                <form action="/admin/set-star" method="POST">
                    <input type="hidden" name="adminPass" value="cad2026">
                    <select name="cin">
                        ${users.filter(u => u.status === 'accepted').map(u => `<option value="${u.cin}">${u.fullname} - (${u.group})</option>`).join('')}
                    </select>
                    <button type="submit" class="btn btn-success">تعيين المتدرب كنجم الشهر</button>
                </form>
            </div>

            <div class="admin-section">
                <h3>🏆 إدارة المسابقات</h3>
                <form action="/admin/add-competition" method="POST">
                    <input type="hidden" name="adminPass" value="cad2026">
                    <input type="text" name="title" placeholder="اسم المسابقة..." required>
                    <input type="text" name="result" placeholder="النتيجة أو الفائز..." required>
                    <button type="submit" class="btn">إضافة / تحديث المسابقة</button>
                </form>
            </div>

            <!-- الشكايات مع أزرار المعالجة والحذف -->
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

// المسارات الخاصة بالإجراءات الإدارية والشكايات
app.post('/admin/add-announcement', upload.single('annImage'), async (req, res) => {
  const { text } = req.body;
  await Announcement.create({
    text,
    image: req.file ? req.file.path : ''
  });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/set-star', async (req, res) => {
  const { cin } = req.body;
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
  const { cin, rank } = req.body;
  await User.findOneAndUpdate({ cin }, { rank });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/accept', async (req, res) => {
  const { cin } = req.body;
  await User.findOneAndUpdate({ cin }, { status: 'accepted' });
  res.redirect(307, '/admin-dashboard');
});

app.post('/admin/delete', async (req, res) => {
  const { cin } = req.body;
  await User.findOneAndDelete({ cin });
  res.redirect(307, '/admin-dashboard');
});

// مسارات إدارة الشكايات (قبول وحذف)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
