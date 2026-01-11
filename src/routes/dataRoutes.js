const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Tất cả đều dùng dataController
router.get('/dashboard', dataController.getDashboardData); // <-- Quan trọng
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

module.exports = router;