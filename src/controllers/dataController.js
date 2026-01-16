const db = require('../config/db');
const { logAction } = require('./adminController'); 

// 1. Các hàm getSubjects, createSubject, updateSubject, deleteSubject... (Giữ nguyên logic cũ nhưng thêm logAction)
exports.getSubjects = async (req, res) => {
    try { const [rows] = await db.query('SELECT * FROM subjects ORDER BY id DESC'); res.json(rows); } 
    catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.createSubject = async (req, res) => {
    // ... (Code insert subject) ...
    // Thêm: await logAction('admin', 'Thêm môn', req.body.subject_name);
    // (Vì code dài, tôi rút gọn phần này, bạn giữ nguyên logic cũ và chèn thêm logAction vào try/catch)
    // Để đảm bảo code chạy ngay, tôi sẽ viết lại phần quan trọng nhất là Điểm danh và Import
    
    // Giữ code cũ của bạn cho phần subject/student basic...
    // Dưới đây là phần Save Attendance và Import có Log:
    const { subject_name, teacher_name, semester, school_year, start_date, end_date, default_session, default_group } = req.body;
    const sDate = start_date === "" ? null : start_date;
    const eDate = end_date === "" ? null : end_date;
    try {
        await db.query('INSERT INTO subjects (subject_name, teacher_name, semester, school_year, start_date, end_date, default_session, default_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [subject_name, teacher_name, semester, school_year||'2025-2026', sDate, eDate, default_session||'Sáng', default_group||'Nhóm 1']);
        await logAction('admin', 'Thêm môn', subject_name);
        res.status(201).json({ message: 'Thêm thành công' });
    } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_name, teacher_name, semester, school_year, start_date, end_date, default_session, default_group } = req.body;
    try {
        await db.query('UPDATE subjects SET subject_name=?, teacher_name=?, semester=?, school_year=?, start_date=?, end_date=?, default_session=?, default_group=? WHERE id=?', [subject_name, teacher_name, semester, school_year, start_date||null, end_date||null, default_session, default_group, id]);
        await logAction('admin', 'Sửa môn', subject_name);
        res.json({ message: 'OK' });
    } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM subjects WHERE id=?', [id]);
        await logAction('admin', 'Xóa môn', `ID: ${id}`);
        res.json({ message: 'OK' });
    } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.countSpecialStudents = async (req, res) => {
    try { const [rows] = await db.query("SELECT COUNT(*) as count FROM students"); res.json({ count: rows[0].count }); } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    try { const [rows] = await db.query('SELECT * FROM students WHERE subject_id = ? ORDER BY id ASC', [subjectId]); res.json(rows); } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { mssv, full_name, class_name, subject_id, learning_group } = req.body;
    try { await db.query('UPDATE students SET mssv=?, full_name=?, class_name=?, subject_id=?, learning_group=? WHERE id=?', [mssv, full_name, class_name, subject_id, learning_group, id]); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try { await db.query('DELETE FROM students WHERE id=?', [id]); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

// --- IMPORT SINH VIÊN (CÓ LOG) ---
exports.importStudents = async (req, res) => {
    const { subject_id, students, learning_group, current_user } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const st of students) {
            await connection.query('INSERT INTO students (mssv, full_name, class_name, subject_id, learning_group) VALUES (?, ?, ?, ?, ?)', [st.mssv, st.full_name, st.class_name, subject_id, learning_group || 'Nhóm 1']);
        }
        await connection.commit();
        await logAction(current_user, 'Nhập Excel', `Môn: ${subject_id} - ${students.length} SV`);
        res.json({ message: 'Import thành công' });
    } catch (e) { await connection.rollback(); res.status(500).json({ message: 'Lỗi import' }); } finally { connection.release(); }
};

// --- LƯU ĐIỂM DANH (CÓ LOG) ---
exports.saveAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, learning_group, attendance_data, current_user } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        let session_id;
        const [sessRows] = await connection.query('SELECT id FROM attendance_sessions WHERE subject_id=? AND session_date=? AND session_time=? AND learning_group=?', [subject_id, session_date, session_time, learning_group]);
        if (sessRows.length > 0) {
            session_id = sessRows[0].id;
            await connection.query('DELETE FROM attendance_records WHERE session_id=?', [session_id]);
        } else {
            const [newSess] = await connection.query('INSERT INTO attendance_sessions (subject_id, session_date, session_time, learning_group) VALUES (?, ?, ?, ?)', [subject_id, session_date, session_time, learning_group]);
            session_id = newSess.insertId;
        }
        for (const rec of attendance_data) {
            if (rec.is_absent) {
                await connection.query('INSERT INTO attendance_records (session_id, student_id, is_absent, reason, proof_image_url) VALUES (?, ?, ?, ?, ?)', [session_id, rec.student_id, 1, rec.reason, rec.proof_image_url]);
            }
        }
        await connection.commit();
        const absentCount = attendance_data.filter(r => r.is_absent).length;
        await logAction(current_user, 'Điểm danh', `Môn: ${subject_id} - Vắng: ${absentCount}`);
        res.json({ message: 'Lưu thành công' });
    } catch (e) { await connection.rollback(); res.status(500).json({ message: 'Lỗi lưu' }); } finally { connection.release(); }
};

exports.getAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, learning_group } = req.query;
    try { const [rows] = await db.query(`SELECT ar.* FROM attendance_records ar JOIN attendance_sessions ses ON ar.session_id = ses.id WHERE ses.subject_id = ? AND ses.session_date = ? AND ses.session_time = ? AND ses.learning_group = ?`, [subject_id, session_date, session_time, learning_group]); res.json(rows); } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.manageGroup = async (req, res) => {
    const { action, subject_id, group_name, new_group_name, current_user } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        if (action === 'rename') {
            await connection.query('UPDATE students SET learning_group=? WHERE subject_id=? AND learning_group=?', [new_group_name, subject_id, group_name]);
            await connection.query('UPDATE attendance_sessions SET learning_group=? WHERE subject_id=? AND learning_group=?', [new_group_name, subject_id, group_name]);
            await logAction(current_user, 'Đổi tên nhóm', `${group_name}->${new_group_name}`);
            res.json({ message: 'OK' });
        } else if (action === 'delete') {
            await connection.query('DELETE FROM students WHERE subject_id=? AND learning_group=?', [subject_id, group_name]);
            await connection.query('DELETE FROM attendance_sessions WHERE subject_id=? AND learning_group=?', [subject_id, group_name]);
            await logAction(current_user, 'Xóa nhóm', group_name);
            res.json({ message: 'OK' });
        }
        await connection.commit();
    } catch (e) { await connection.rollback(); res.status(500).json({ message: 'Lỗi' }); } finally { connection.release(); }
};

exports.updateReason = async (req, res) => {
    const { record_id, reason } = req.body;
    try { await db.query('UPDATE attendance_records SET reason=? WHERE id=?', [reason, record_id]); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};

exports.removeAbsence = async (req, res) => {
    const { record_id } = req.body;
    try { await db.query('DELETE FROM attendance_records WHERE id=?', [record_id]); res.json({ message: 'OK' }); } catch (e) { res.status(500).json({ message: 'Lỗi' }); }
};