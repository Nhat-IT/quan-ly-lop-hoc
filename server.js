const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const db = require('./src/config/db');
const dataRoutes = require('./src/routes/dataRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsDir); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh hoặc PDF'));
    }
});

app.use(cors());
app.use(express.json()); 
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/', (req, res) => res.redirect('/login/login.html'));
app.get(['/login', '/login.html'], (req, res) => res.redirect('/login/login.html'));

app.post('/api/data/upload-proof', upload.single('proof'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Không có file' });
    res.json({ url: '/uploads/' + req.file.filename });
});

// API Check điểm danh cũ (CÓ LỌC THEO NHÓM)
app.get('/api/data/attendance/check', async (req, res) => {
    try {
        const { subject_id, session_date, session_time, learning_group } = req.query;
        const group = learning_group || 'Nhóm 1';

        const sql = `
            SELECT ar.student_id, ar.is_absent, ar.reason, ar.proof_image_url 
            FROM attendance_sessions s
            JOIN attendance_records ar ON s.id = ar.session_id
            WHERE s.subject_id = ? 
              AND s.session_date = ? 
              AND s.session_time = ?
              AND s.learning_group = ?
        `;
        const [rows] = await db.query(sql, [subject_id, session_date, session_time, group]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json([]);
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});