const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// API Đăng nhập
router.post('/login', authController.login);

// API Quên mật khẩu (Mới thêm)
router.post('/verify-user', authController.verifyUser);     // Bước 1: Check user
router.post('/reset-password', authController.resetPassword); // Bước 2: Đổi pass

module.exports = router;