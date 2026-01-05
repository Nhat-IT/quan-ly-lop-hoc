const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const dashboardController = require('../controllers/dashboardController');

router.get('/dashboard', dashboardController.getDashboardData);

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
router.post('/groups/manage', dataController.manageGroup);

module.exports = router;