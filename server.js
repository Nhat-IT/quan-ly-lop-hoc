const express = require('express');
const cors = require('cors');
const path = require('path'); // Đưa dòng này lên đây cho gọn
require('dotenv').config();

// Import DB và Routes
const db = require('./src/config/db');
const dataRoutes = require('./src/routes/dataRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. QUAN TRỌNG: PHẢI ĐẶT CÁC DÒNG NÀY LÊN TRÊN CÙNG ---
// Để Server đọc được dữ liệu JSON gửi lên trước khi xử lý
app.use(cors());
app.use(express.json()); 

// --- 2. SAU ĐÓ MỚI ĐẾN CÁC ROUTE ---
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);

// --- 3. CẤU HÌNH FILE TĨNH (GIAO DIỆN) ---
app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});

// API: Lấy dữ liệu điểm danh cũ của một môn vào ngày/buổi cụ thể
app.get('/api/data/attendance/check', async (req, res) => {
    try {
        const { subject_id, session_date, session_time } = req.query;
        
        // Query đúng với bảng attendance_records (theo db.sql)
        const sql = `
            SELECT ar.student_id, ar.is_absent, ar.reason 
            FROM attendance_sessions s
            JOIN attendance_records ar ON s.id = ar.session_id
            WHERE s.subject_id = ? AND s.session_date = ? AND s.session_time = ?
        `;
        
        // Thực thi SQL
        const [rows] = await db.query(sql, [subject_id, session_date, session_time]);
        
        res.json(rows); // Trả về mảng: [{student_id: 1, is_absent: 1, reason: 'ốm'}, ...]
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu điểm danh:', error);
        res.status(500).json([]);
    }
});