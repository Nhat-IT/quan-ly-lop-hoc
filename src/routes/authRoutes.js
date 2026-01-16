const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/verify-user', authController.verifyUser);
// Đổi route reset trực tiếp thành request
router.post('/request-reset', authController.requestResetPassword);

module.exports = router;