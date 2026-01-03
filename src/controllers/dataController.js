const db = require('../config/db');

// 1. Lấy danh sách môn
exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 2. Thêm môn
exports.createSubject = async (req, res) => {
    const { subject_name, teacher_name, semester, start_date, end_date } = req.body;
    try {
        await db.query(
            'INSERT INTO subjects (subject_name, teacher_name, semester, start_date, end_date) VALUES (?, ?, ?, ?, ?)', 
            [subject_name, teacher_name, semester, start_date, end_date]
        );
        res.status(201).json({ message: 'Thêm thành công' });
    } catch (error) { res.status(500).json({ message: 'Lỗi thêm môn' }); }
};

// 3. Sửa môn
exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_name, teacher_name, start_date, end_date } = req.body;
    try {
        await db.query(
            'UPDATE subjects SET subject_name=?, teacher_name=?, start_date=?, end_date=? WHERE id=?', 
            [subject_name, teacher_name, start_date, end_date, id]
        );
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật' }); }
};

// 4. Xóa môn
exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM attendance_records WHERE session_id IN (SELECT id FROM attendance_sessions WHERE subject_id = ?)', [id]);
        await connection.query('DELETE FROM attendance_sessions WHERE subject_id = ?', [id]);
        await connection.query('DELETE FROM enrollments WHERE subject_id = ?', [id]);
        await connection.query('DELETE FROM subjects WHERE id = ?', [id]);
        await connection.commit();
        res.json({ message: 'Đã xóa môn học.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi khi xóa môn học' });
    } finally {
        connection.release();
    }
};

// --- API MỚI: Đếm tổng sinh viên 2 lớp 25TH01 và 25TH02 ---
exports.countSpecialStudents = async (req, res) => {
    try {
        const sql = "SELECT COUNT(*) as total FROM students WHERE class_name IN ('25TH01', '25TH02')";
        const [rows] = await db.query(sql);
        res.json({ total: rows[0].total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đếm sinh viên' });
    }
};

// Các hàm khác giữ nguyên
exports.getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    try {
        const sql = `SELECT s.id, s.mssv, s.full_name, s.class_name FROM students s JOIN enrollments e ON s.id = e.student_id WHERE e.subject_id = ?`;
        const [rows] = await db.query(sql, [subjectId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { full_name, mssv, class_name } = req.body;
    try {
        await db.query('UPDATE students SET full_name=?, mssv=?, class_name=? WHERE id=?', [full_name, mssv, class_name, id]);
        res.json({ message: 'Cập nhật SV thành công' });
    } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật SV' }); }
};

exports.saveAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, attendance_data } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [sessions] = await connection.query(
            'SELECT id FROM attendance_sessions WHERE subject_id=? AND session_date=? AND session_time=?', 
            [subject_id, session_date, session_time]
        );
        let sessionId;
        if (sessions.length > 0) {
            sessionId = sessions[0].id;
        } else {
            const [result] = await connection.query(
                'INSERT INTO attendance_sessions (subject_id, session_date, session_time) VALUES (?, ?, ?)', 
                [subject_id, session_date, session_time]
            );
            sessionId = result.insertId;
        }
        
        await connection.query('DELETE FROM attendance_records WHERE session_id=?', [sessionId]);
        
        if (attendance_data.length > 0) {
            const values = attendance_data.map(record => [
                sessionId,
                record.student_id,
                record.is_absent || 0,
                record.reason || '',
                record.proof_image_url || null
            ]);
            const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const flatValues = values.flat();
            await connection.query(
                `INSERT INTO attendance_records (session_id, student_id, is_absent, reason, proof_image_url) VALUES ${placeholders}`,
                flatValues
            );
        }
        await connection.commit();
        res.json({ message: 'Lưu điểm danh thành công!' });
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi lưu điểm danh:', error);
        res.status(500).json({ message: 'Lỗi lưu điểm danh: ' + error.message });
    } finally {
        connection.release();
    }
};

exports.importStudents = async (req, res) => {
    const { subject_id, students } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const sv of students) {
            await connection.query(`INSERT INTO students (mssv, full_name, class_name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), class_name = VALUES(class_name)`, [sv.mssv, sv.full_name, sv.class_name]);
            const [rows] = await connection.query('SELECT id FROM students WHERE mssv = ?', [sv.mssv]);
            const studentId = rows[0].id;
            const [enrollment] = await connection.query('SELECT id FROM enrollments WHERE student_id = ? AND subject_id = ?', [studentId, subject_id]);
            if (enrollment.length === 0) await connection.query('INSERT INTO enrollments (student_id, subject_id) VALUES (?, ?)', [studentId, subject_id]);
        }
        await connection.commit();
        res.json({ message: `Đã import thành công ${students.length} sinh viên!` });
    } catch (error) { await connection.rollback(); res.status(500).json({ message: 'Lỗi import' }); } finally { connection.release(); }
};