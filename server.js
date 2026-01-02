const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
require('dotenv').config();
const dataRoutes = require('./src/routes/dataRoutes');

// --- IMPORT ROUTE ---
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
app.use('/api/data', dataRoutes); // Đường dẫn gốc là /api/data


app.use(cors());
app.use(express.json());

// --- SỬ DỤNG ROUTE ---
app.use('/api/auth', authRoutes); // Đường dẫn gốc là /api/auth
const path = require('path'); // Thêm dòng này ở đầu file cùng các require khác

// ... (các dòng app.use khác)

// Cấu hình để Node.js phục vụ file tĩnh (HTML, CSS, JS) từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// ... (các dòng app.use route API)

// Test DB (Giữ nguyên)
app.get('/test-db', async (req, res) => { /* ... code cũ ... */ });

// Thêm đoạn này để khi vào trang chủ (/) sẽ tự chuyển sang login.html
app.get('/', (req, res) => {
    res.redirect('/login/login.html');
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});