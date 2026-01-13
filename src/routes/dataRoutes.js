const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController'); // [THÊM MỚI]

// Dashboard
router.get('/dashboard', dashboardController.getDashboardData);

// --- CÁC ROUTE CŨ (MÔN HỌC, SINH VIÊN, ĐIỂM DANH) ---
router.get('/subjects', dataController.getSubjects);
router.post('/subjects', dataController.createSubject);
router.put('/subjects/:id', dataController.updateSubject);
router.delete('/subjects/:id', dataController.deleteSubject);

router.get('/students/count-special', dataController.countSpecialStudents);
router.get('/students/:subjectId', dataController.getStudentsBySubject);
router.post('/students/import', dataController.importStudents);
router.put('/students/:id', dataController.updateStudent);
router.delete('/students/:id', dataController.deleteStudent);

router.post('/attendance', dataController.saveAttendance);
router.get('/attendance/check', dataController.getAttendance);
router.post('/attendance/update-reason', dataController.updateReason);
router.post('/attendance/remove-absence', dataController.removeAbsence);
router.post('/groups/manage', dataController.manageGroup);

// --- [THÊM MỚI] ROUTE QUẢN TRỊ ADMIN ---
router.get('/admin/users', adminController.getAllUsers);
router.post('/admin/users', adminController.createUser);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);
router.get('/admin/logs', adminController.getLogs);

module.exports = router;