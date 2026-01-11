const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const dashboardController = require('../controllers/dashboardController'); // Đảm bảo bạn có file này hoặc bỏ dòng này nếu không dùng

// Dashboard (nếu có)
router.get('/dashboard', dashboardController.getDashboardData);

// Môn học
router.get('/subjects', dataController.getSubjects);
router.post('/subjects', dataController.createSubject);
router.put('/subjects/:id', dataController.updateSubject);
router.delete('/subjects/:id', dataController.deleteSubject);

// Sinh viên
router.get('/students/count-special', dataController.countSpecialStudents);
router.get('/students/:subjectId', dataController.getStudentsBySubject);
router.post('/students/import', dataController.importStudents);
router.put('/students/:id', dataController.updateStudent);
router.delete('/students/:id', dataController.deleteStudent);

// --- PHẦN QUAN TRỌNG VỀ ĐIỂM DANH ---
router.post('/attendance', dataController.saveAttendance); // Route lưu
router.get('/attendance/check', dataController.getAttendance); // [QUAN TRỌNG] Route lấy dữ liệu cũ (Đã thêm mới)
router.post('/groups/manage', dataController.manageGroup);

// 
router.post('/attendance/update-reason', dataController.updateReason);
router.post('/attendance/remove-absence', dataController.removeAbsence);

module.exports = router;