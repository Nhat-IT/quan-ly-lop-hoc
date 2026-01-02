const db = require('../config/db');

// Lấy danh sách tất cả môn học
exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách sinh viên theo ID môn học
exports.getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    try {
        // JOIN bảng enrollments để lấy đúng sinh viên học môn này
        const sql = `
            SELECT s.id, s.mssv, s.full_name, s.class_name
            FROM students s
            JOIN enrollments e ON s.id = e.student_id
            WHERE e.subject_id = ?
        `;
        const [rows] = await db.query(sql, [subjectId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};