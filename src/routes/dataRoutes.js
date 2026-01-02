const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Định nghĩa đường dẫn
router.get('/subjects', dataController.getSubjects);
router.get('/students/:subjectId', dataController.getStudentsBySubject);

module.exports = router;