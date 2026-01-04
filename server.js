const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// Import DB và Routes
const db = require('./src/config/db');
const dataRoutes = require('./src/routes/dataRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif) hoặc PDF'));
        }
    }
});

// --- 1. QUAN TRỌNG: PHẢI ĐẶT CÁC DÒNG NÀY LÊN TRÊN CÙNG ---
// Để Server đọc được dữ liệu JSON gửi lên trước khi xử lý
app.use(cors());
app.use(express.json()); 

// --- 2. SAU ĐÓ MỚI ĐẾN CÁC ROUTE ---
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);

// --- 3. CẤU HÌNH FILE TĨNH (GIAO DIỆN) ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Test DB
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1');
        res.send('Kết nối DB thành công!');
    } catch (err) {
        res.status(500).send('Lỗi kết nối DB: ' + err.message);
    }
});

// Chuyển hướng trang chủ về login
app.get('/', (req, res) => {
    res.redirect('/login/login.html');
});

// Hỗ trợ truy cập trực tiếp
app.get(['/login', '/login.html', '/login/'], (req, res) => {
    res.redirect('/login/login.html');
});

// Xử lý favicon.ico để tránh lỗi 404
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No Content - không trả về gì cả
});

// API: Upload file minh chứng (PHẢI ĐẶT TRƯỚC app.listen)
app.post('/api/data/upload-proof', upload.single('proof'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file được tải lên' });
        }
        const fileUrl = '/uploads/' + req.file.filename;
        res.json({ url: fileUrl, message: 'Tải file thành công' });
    } catch (error) {
        console.error('Lỗi upload file:', error);
        res.status(500).json({ message: 'Lỗi khi tải file' });
    }
});

// API: Lấy dữ liệu điểm danh cũ (Cập nhật thêm learning_group)
app.get('/api/data/attendance/check', async (req, res) => {
    try {
        // Lấy thêm tham số learning_group
        const { subject_id, session_date, session_time, learning_group } = req.query;
        
        const sql = `
            SELECT ar.student_id, ar.is_absent, ar.reason, ar.proof_image_url 
            FROM attendance_sessions s
            JOIN attendance_records ar ON s.id = ar.session_id
            WHERE s.subject_id = ? 
              AND s.session_date = ? 
              AND s.session_time = ?
              AND s.learning_group = ?  -- Thêm điều kiện lọc theo nhóm
        `;
        
        // Mặc định là 'Nhóm 1' nếu không truyền lên
        const group = learning_group || 'Nhóm 1'; 
        
        const [rows] = await db.query(sql, [subject_id, session_date, session_time, group]);
        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu điểm danh:', error);
        res.status(500).json([]);
    }
});

// Khởi động server (PHẢI ĐẶT CUỐI CÙNG)
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});