const db = require('../config/db');

// 1. Đăng nhập (Code cũ - Giữ nguyên hoặc chép đè)
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
        
        const user = rows[0];
        // Lưu ý: Đang so sánh plain text để test, thực tế nên dùng bcrypt
        if (password !== user.password) return res.status(401).json({ message: 'Sai mật khẩu!' });

        res.json({
            message: 'Đăng nhập thành công!',
            user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 2. [MỚI] Kiểm tra tên đăng nhập (Cho bước 1 Quên mật khẩu)
exports.verifyUser = async (req, res) => {
    const { username } = req.body;
    try {
        // Truy vấn DB thật
        const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        
        if (rows.length > 0) {
            res.json({ message: 'User tồn tại', exists: true });
        } else {
            res.status(404).json({ message: 'Tên đăng nhập không tồn tại', exists: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 3. [MỚI] Đặt lại mật khẩu (Cho bước 2 Quên mật khẩu)
exports.resetPassword = async (req, res) => {
    const { username, newPassword } = req.body;
    try {
        // Kiểm tra đầu vào
        if (!username || !newPassword) {
            return res.status(400).json({ message: 'Thiếu thông tin username hoặc mật khẩu mới' });
        }
        
        // Kiểm tra độ dài mật khẩu
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }
        
        // Kiểm tra user có tồn tại không
        const [userRows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Tên đăng nhập không tồn tại' });
        }
        
        // Cập nhật mật khẩu mới vào Database thật
        await db.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, username]);
        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};