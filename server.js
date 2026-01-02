const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import DB và Routes
const db = require('./src/config/db');
const dataRoutes = require('./src/routes/dataRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE (QUAN TRỌNG: ĐẶT TRÊN CÙNG) ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. CÁC ROUTE CHÍNH ---
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);

// --- 3. CÁC API BỔ SUNG (Phục vụ Điểm danh & Dashboard) ---

// API 1: Kiểm tra xem Ngày/Buổi này đã điểm danh chưa (Để tích lại checkbox)
app.get('/api/data/attendance/check', async (req, res) => {
    try {
        const { subject_id, session_date, session_time } = req.query;
        
        // Lấy danh sách sinh viên vắng trong buổi đó
        const sql = `
            SELECT d.student_id, d.is_absent, d.reason 
            FROM attendance_sessions s
            JOIN attendance_details d ON s.id = d.session_id
            WHERE s.subject_id = ? AND s.session_date = ? AND s.session_time = ?
        `;
        
        const [rows] = await db.execute(sql, [subject_id, session_date, session_time]);
        res.json(rows); 
    } catch (error) {
        console.error("Lỗi check điểm danh:", error);
        res.status(500).json([]);
    }
});

// API 2: DASHBOARD - Lấy lịch sử vắng của sinh viên
// Yêu cầu: Định dạng ngày dd/mm/yyyy, hiển thị lý do
app.get('/api/dashboard/history/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        // Sử dụng DATE_FORMAT của MySQL để ra dd/mm/yyyy
        const sql = `
            SELECT 
                DATE_FORMAT(s.session_date, '%d/%m/%Y') as formatted_date,
                s.session_time,
                d.reason,
                d.is_absent,
                sub.subject_name
            FROM attendance_sessions s
            JOIN attendance_details d ON s.id = d.session_id
            JOIN subjects sub ON s.subject_id = sub.id
            WHERE d.student_id = ? AND d.is_absent = 1
            ORDER BY s.session_date DESC
        `;
        const [rows] = await db.execute(sql, [student_id]);
        
        // Xử lý dữ liệu: Nếu lý do rỗng -> Ghi "Không có lý do"
        const result = rows.map(item => ({
            ...item,
            display_reason: item.reason && item.reason.trim() !== "" ? item.reason : "Không có lý do"
        }));

        res.json(result);
    } catch (err) {
        console.error("Lỗi Dashboard:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 4. CẤU HÌNH FILE TĨNH ---
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

// --- 5. ĐIỀU HƯỚNG ---
app.get('/', (req, res) => { res.redirect('/login/login.html'); });
app.get(['/login', '/login.html'], (req, res) => { res.redirect('/login/login.html'); });

// --- 6. KHỞI CHẠY SERVER (LUÔN ĐỂ CUỐI CÙNG) ---
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});