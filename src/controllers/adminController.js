const db = require('../config/db');

// --- HÀM GHI LOG (Dùng chung cho cả hệ thống) ---
const logAction = async (username, action, details = '') => {
    try {
        // Nếu username không có (null/undefined), đặt là 'Ẩn danh'
        const user = username || 'Ẩn danh';
        await db.query('INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)', 
            [user, action, details]);
    } catch (e) {
        console.error("Lỗi ghi log:", e);
    }
};
exports.logAction = logAction;

// --- API QUẢN LÝ TÀI KHOẢN ---
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
        
        await logAction('admin', 'Tạo tài khoản', `User: ${username} - Role: ${role}`); 
        res.json({ message: 'Tạo thành công' });
    } catch (e) { res.status(500).json({ message: 'Lỗi: ' + e.message }); }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, role, password } = req.body;
    try {
        let sql = 'UPDATE users SET full_name=?, role=? WHERE id=?';
        let params = [full_name, role, id];
        
        if (password) { 
            sql = 'UPDATE users SET full_name=?, role=?, password=? WHERE id=?';
            params = [full_name, role, password, id];
        }

        await db.query(sql, params);
        await logAction('admin', 'Cập nhật tài khoản', `ID: ${id} - Lớp: ${full_name}`);
        res.json({ message: 'Cập nhật thành công' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id=?', [id]);
        await logAction('admin', 'Xóa tài khoản', `ID: ${id}`);
        res.json({ message: 'Đã xóa' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- API LẤY NHẬT KÝ ---
exports.getLogs = async (req, res) => {
    try {
        // Lấy 200 dòng mới nhất
        const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};