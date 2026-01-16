const db = require('../config/db');

// 1. Đăng nhập
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
        
        const user = rows[0];
        if (password !== user.password) return res.status(401).json({ message: 'Sai mật khẩu!' });

        res.json({
            message: 'Đăng nhập thành công!',
            user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role }
        });
    } catch (error) { res.status(500).json({ message: 'Lỗi server', error: error.message }); }
};

// 2. Verify User (Giữ nguyên cho form step 1)
exports.verifyUser = async (req, res) => {
    const { username } = req.body;
    try {
        const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (rows.length > 0) res.json({ exists: true });
        else res.status(404).json({ exists: false, message: 'User không tồn tại' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// 3. [MỚI] Gửi yêu cầu đổi mật khẩu (Thay thế reset trực tiếp)
exports.requestResetPassword = async (req, res) => {
    const { username, newPassword } = req.body;
    try {
        // Kiểm tra user
        const [userRows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (userRows.length === 0) return res.status(404).json({ message: 'Tên đăng nhập không tồn tại' });

        // Lưu yêu cầu
        await db.query('INSERT INTO password_requests (username, new_password, status) VALUES (?, ?, "pending")', 
            [username, newPassword]);
            
        res.json({ message: 'Đã gửi yêu cầu đổi mật khẩu. Vui lòng chờ Admin phê duyệt.' });
    } catch (e) { res.status(500).json({ message: 'Lỗi server: ' + e.message }); }
};