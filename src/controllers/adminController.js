const db = require('../config/db');

const logAction = async (username, action, details = '') => {
    try {
        const user = username || 'Ẩn danh';
        await db.query('INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)', [user, action, details]);
    } catch (e) { console.error("Lỗi log:", e); }
};
exports.logAction = logAction;

// ... (Các hàm getAllUsers, createUser, updateUser, deleteUser giữ nguyên như cũ) ...
exports.getAllUsers = async (req, res) => { try { const [rows] = await db.query('SELECT id, username, password, full_name, role, created_at FROM users ORDER BY id DESC'); res.json(rows); } catch (e) { res.status(500).json({ message: e.message }); } };
exports.createUser = async (req, res) => { const { username, password, full_name, role } = req.body; if (!username || !password) return res.status(400).json({ message: 'Thiếu thông tin' }); try { await db.query('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)', [username, password, full_name, role]); await logAction('admin', 'Tạo tài khoản', `User: ${username}`); res.json({ message: 'Tạo thành công' }); } catch (e) { if (e.code === 'ER_DUP_ENTRY') res.status(400).json({ message: `User "${username}" đã tồn tại` }); else res.status(500).json({ message: e.message }); } };
exports.updateUser = async (req, res) => { const { id } = req.params; const { full_name, role, password } = req.body; try { let sql = 'UPDATE users SET full_name=?, role=? WHERE id=?'; let params = [full_name, role, id]; if (password) { sql = 'UPDATE users SET full_name=?, role=?, password=? WHERE id=?'; params = [full_name, role, password, id]; } await db.query(sql, params); await logAction('admin', 'Sửa tài khoản', `ID: ${id}`); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); } };
exports.deleteUser = async (req, res) => { const { id } = req.params; try { await db.query('DELETE FROM users WHERE id=?', [id]); await logAction('admin', 'Xóa tài khoản', `ID: ${id}`); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: e.message }); } };
exports.getLogs = async (req, res) => { try { const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200'); res.json(rows); } catch (e) { res.status(500).json({ message: e.message }); } };

// [MỚI] Lấy danh sách yêu cầu đổi pass
exports.getPasswordRequests = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM password_requests WHERE status = "pending" ORDER BY created_at DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// [MỚI] Duyệt/Hủy yêu cầu
exports.approvePasswordReset = async (req, res) => {
    const { requestId, action } = req.body; // action: 'approve' | 'reject'
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [reqRows] = await connection.query('SELECT * FROM password_requests WHERE id = ?', [requestId]);
        if (reqRows.length === 0) throw new Error('Yêu cầu không tồn tại');
        const request = reqRows[0];

        if (action === 'approve') {
            await connection.query('UPDATE users SET password = ? WHERE username = ?', [request.new_password, request.username]);
            await connection.query('UPDATE password_requests SET status = "approved" WHERE id = ?', [requestId]);
            await logAction('admin', 'Duyệt mật khẩu', `User: ${request.username}`);
        } else {
            await connection.query('UPDATE password_requests SET status = "rejected" WHERE id = ?', [requestId]);
        }
        await connection.commit();
        res.json({ message: 'Đã xử lý' });
    } catch (e) { await connection.rollback(); res.status(500).json({ message: e.message }); } finally { connection.release(); }
};