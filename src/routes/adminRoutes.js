const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// --- ROUTES QUẢN TRỊ ---
router.get('/admin/users', adminController.getAllUsers);
router.post('/admin/users', adminController.createUser);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);

// [MỚI] Route lấy nhật ký
router.get('/admin/logs', adminController.getLogs);

module.exports = router;