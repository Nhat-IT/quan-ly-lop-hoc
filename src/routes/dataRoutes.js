const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
// Import thêm dashboardController
const dashboardController = require('../controllers/dashboardController'); // <--- THÊM

router.get('/subjects', dataController.getSubjects);
router.get('/students/:subjectId', dataController.getStudentsBySubject);

// API MỚI CHO DASHBOARD
router.get('/dashboard', dashboardController.getDashboardData); // <--- THÊM

module.exports = router;