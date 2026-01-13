const db = require('../config/db');

// --- QUẢN LÝ TÀI KHOẢN ---
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, full_name, role, created_at FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createUser = async (req, res) => {
    const { username, password, full_name, role } = req.body;
    try {
        await db.query('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)', 
            [username, password, full_name, role]); // Lưu ý: Nên mã hóa password bằng bcrypt trong thực tế
        
        // Ghi log
        await logAction(req.user ? req.user.username : 'admin', `Tạo tài khoản: ${username}`);
        res.json({ message: 'Tạo thành công' });
    } catch (e) { res.status(500).json({ message: 'Lỗi: ' + e.message }); }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, role, password } = req.body;
    try {
        let sql = 'UPDATE users SET full_name=?, role=? WHERE id=?';
        let params = [full_name, role, id];
        
        if (password) { // Nếu có nhập pass mới thì cập nhật
            sql = 'UPDATE users SET full_name=?, role=?, password=? WHERE id=?';
            params = [full_name, role, password, id];
        }

        await db.query(sql, params);
        await logAction(req.user ? req.user.username : 'admin', `Cập nhật tài khoản ID: ${id}`);
        res.json({ message: 'Cập nhật thành công' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id=?', [id]);
        await logAction(req.user ? req.user.username : 'admin', `Xóa tài khoản ID: ${id}`);
        res.json({ message: 'Đã xóa' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- NHẬT KÝ HOẠT ĐỘNG ---
exports.getLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// Hàm hỗ trợ ghi log nội bộ (export để dùng ở file khác nếu cần)
const logAction = async (username, action, details = '') => {
    try {
        await db.query('INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)', [username, action, details]);
    } catch (e) { console.error("Lỗi ghi log:", e); }
};
exports.logAction = logAction;