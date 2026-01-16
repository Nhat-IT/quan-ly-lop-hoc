const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/admin/users', adminController.getAllUsers);
router.post('/admin/users', adminController.createUser);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);
router.get('/admin/logs', adminController.getLogs);

// [MỚI]
router.get('/admin/password-requests', adminController.getPasswordRequests);
router.post('/admin/approve-password', adminController.approvePasswordReset);

module.exports = router;