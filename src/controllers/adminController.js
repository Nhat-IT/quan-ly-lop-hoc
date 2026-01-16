const db = require('../config/db');

// --- [MỚI] HÀM DÙNG CHUNG ĐỂ GHI LOG ---
// Các controller khác (dataController) sẽ import hàm này để ghi lại thao tác
const logAction = async (username, action, details = '') => {
    try {
        await db.query('INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)', 
            [username, action, details]);
    } catch (e) {
        console.error("Lỗi ghi log:", e);
    }
};
// Xuất hàm này để file khác dùng được
exports.logAction = logAction;

// --- QUẢN LÝ TÀI KHOẢN (Giữ nguyên code cũ) ---
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, password, full_name, role, created_at FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createUser = async (req, res) => {
    const { username, password, full_name, role } = req.body;
    try {
        await db.query('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)', 
            [username, password, full_name, role]);
        
        // Ghi log admin tạo user
        await logAction('admin', 'Tạo tài khoản', `User: ${username} - Role: ${role}`); 
        
        res.json({ message: 'Tạo thành công' });
    } catch (e) { res.status(500).json({ message: 'Lỗi: ' + e.message }); }
};

exports.updateUser = async (req, res) => {
    // ... (Giữ nguyên logic update)
    // Thêm dòng này sau khi update thành công:
    // await logAction('admin', 'Cập nhật tài khoản', `ID: ${req.params.id}`);
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id=?', [id]);
        await logAction('admin', 'Xóa tài khoản', `ID: ${id}`);
        res.json({ message: 'Đã xóa' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- [MỚI] API LẤY NHẬT KÝ CHO TRANG ADMIN ---
exports.getLogs = async (req, res) => {
    try {
        // Lấy 200 dòng mới nhất
        const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};