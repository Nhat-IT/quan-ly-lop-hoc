const adminController = require('../controllers/adminController');
// --- ROUTES QUẢN TRỊ ---
router.get('/admin/users', adminController.getAllUsers);
router.post('/admin/users', adminController.createUser);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);
router.get('/admin/logs', adminController.getLogs);