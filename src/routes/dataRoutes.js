const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const dashboardController = require('../controllers/dashboardController');

// --- Dashboard API ---
router.get('/dashboard', dashboardController.getDashboardData);

// --- Môn học API ---
router.get('/subjects', dataController.getSubjects);
router.post('/subjects', dataController.createSubject);
router.put('/subjects/:id', dataController.updateSubject);

// --- Sinh viên API ---
router.get('/students/:subjectId', dataController.getStudentsBySubject);
router.put('/students/:id', dataController.updateStudent);

// --- Điểm danh API ---
router.post('/attendance', dataController.saveAttendance);

module.exports = router;