const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const dashboardController = require('../controllers/dashboardController');

// --- Dashboard ---
router.get('/dashboard', dashboardController.getDashboardData);

// --- Môn học ---
router.get('/subjects', dataController.getSubjects);         // Lấy danh sách
router.post('/subjects', dataController.createSubject);      // Thêm mới
router.put('/subjects/:id', dataController.updateSubject);   // Sửa

// --- Sinh viên ---
router.get('/students/:subjectId', dataController.getStudentsBySubject); // Lấy SV theo môn
router.put('/students/:id', dataController.updateStudent);               // Sửa SV

// --- Điểm danh ---
router.post('/attendance', dataController.saveAttendance);   // Lưu điểm danh

module.exports = router;