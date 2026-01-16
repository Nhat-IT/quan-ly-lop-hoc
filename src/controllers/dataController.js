const db = require('../config/db');
// Import hàm ghi log từ adminController
const { logAction } = require('./adminController'); 

// 1. Lấy danh sách môn
exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 2. Thêm môn
exports.createSubject = async (req, res) => {
    const { subject_name, teacher_name, semester, school_year, start_date, end_date, default_session, default_group } = req.body;
    const sDate = start_date === "" ? null : start_date;
    const eDate = end_date === "" ? null : end_date;

    try {
        await db.query(
            'INSERT INTO subjects (subject_name, teacher_name, semester, school_year, start_date, end_date, default_session, default_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [subject_name, teacher_name, semester, school_year || '2025-2026', sDate, eDate, default_session || 'Sáng', default_group || 'Nhóm 1']
        );
        // Ghi log
        await logAction('admin', 'Thêm môn học', `Môn: ${subject_name}`);
        res.status(201).json({ message: 'Thêm thành công' });
    } catch (error) { 
        res.status(500).json({ message: 'Lỗi thêm môn' }); 
    }
};

// 3. Sửa môn
exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_name, teacher_name, semester, school_year, start_date, end_date, default_session, default_group } = req.body;
    const sDate = start_date === "" ? null : start_date;
    const eDate = end_date === "" ? null : end_date;

    try {
        await db.query(
            'UPDATE subjects SET subject_name=?, teacher_name=?, semester=?, school_year=?, start_date=?, end_date=?, default_session=?, default_group=? WHERE id=?',
            [subject_name, teacher_name, semester, school_year, sDate, eDate, default_session, default_group, id]
        );
        // Ghi log
        await logAction('admin', 'Sửa môn học', `ID: ${id} - Môn: ${subject_name}`);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật' });
    }
};

// 4. Xóa môn
exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM subjects WHERE id = ?', [id]);
        await logAction('admin', 'Xóa môn học', `ID: ${id}`);
        res.json({ message: 'Đã xóa môn' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa môn' });
    }
};

// 5. Đếm SV đặc biệt
exports.countSpecialStudents = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM students WHERE class_name IN ('25TH01', '25TH02')");
        res.json({ count: rows[0].count });
    } catch (error) { res.status(500).json({ message: 'Lỗi đếm' }); }
};

// 6. Lấy danh sách sinh viên theo môn
exports.getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE subject_id = ? ORDER BY id ASC', [subjectId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi lấy SV' }); }
};

// 7. Import Sinh viên (Có Ghi Log)
exports.importStudents = async (req, res) => {
    const { subject_id, students, learning_group, current_user } = req.body; // current_user từ frontend
    if (!students || students.length === 0) return res.status(400).json({ message: 'Danh sách trống' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const st of students) {
            await connection.query(
                'INSERT INTO students (mssv, full_name, class_name, subject_id, learning_group) VALUES (?, ?, ?, ?, ?)',
                [st.mssv, st.full_name, st.class_name, subject_id, learning_group || 'Nhóm 1']
            );
        }
        await connection.commit();
        
        // Ghi log
        await logAction(current_user, 'Nhập Excel', `Môn ID: ${subject_id} - SL: ${students.length} SV`);
        
        res.json({ message: 'Import thành công' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi import: ' + error.message });
    } finally {
        connection.release();
    }
};

// 8. Cập nhật sinh viên
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { mssv, full_name, class_name, subject_id, learning_group } = req.body;
    try {
        await db.query('UPDATE students SET mssv=?, full_name=?, class_name=?, subject_id=?, learning_group=? WHERE id=?', 
            [mssv, full_name, class_name, subject_id, learning_group, id]);
        res.json({ message: 'Cập nhật SV thành công' });
    } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật SV' }); }
};

// 9. Xóa sinh viên
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM students WHERE id=?', [id]);
        res.json({ message: 'Đã xóa SV' });
    } catch (error) { res.status(500).json({ message: 'Lỗi xóa SV' }); }
};

// 10. LƯU ĐIỂM DANH (Có Ghi Log)
exports.saveAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, learning_group, attendance_data, current_user } = req.body;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Tạo hoặc lấy session
        let session_id;
        const [sessRows] = await connection.query(
            'SELECT id FROM attendance_sessions WHERE subject_id = ? AND session_date = ? AND session_time = ? AND learning_group = ?',
            [subject_id, session_date, session_time, learning_group]
        );

        if (sessRows.length > 0) {
            session_id = sessRows[0].id;
            await connection.query('DELETE FROM attendance_records WHERE session_id = ?', [session_id]);
        } else {
            const [newSess] = await connection.query(
                'INSERT INTO attendance_sessions (subject_id, session_date, session_time, learning_group) VALUES (?, ?, ?, ?)',
                [subject_id, session_date, session_time, learning_group]
            );
            session_id = newSess.insertId;
        }

        // 2. Lưu chi tiết vắng
        for (const rec of attendance_data) {
            if (rec.is_absent) {
                await connection.query(
                    'INSERT INTO attendance_records (session_id, student_id, is_absent, reason, proof_image_url) VALUES (?, ?, ?, ?, ?)',
                    [session_id, rec.student_id, 1, rec.reason, rec.proof_image_url]
                );
            }
        }

        await connection.commit();

        // Ghi log
        const countAbsent = attendance_data.filter(r => r.is_absent).length;
        await logAction(current_user, 'Điểm danh', `Môn ID: ${subject_id} - Ngày: ${session_date} - Vắng: ${countAbsent}`);

        res.json({ message: 'Lưu thành công' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi lưu điểm danh' });
    } finally {
        connection.release();
    }
};

// 11. Lấy dữ liệu điểm danh
exports.getAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, learning_group } = req.query;
    try {
        const [rows] = await db.query(`
            SELECT ar.* FROM attendance_records ar
            JOIN attendance_sessions ses ON ar.session_id = ses.id
            WHERE ses.subject_id = ? AND ses.session_date = ? AND ses.session_time = ? AND ses.learning_group = ?
        `, [subject_id, session_date, session_time, learning_group]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi lấy dữ liệu' }); }
};

// 12. Quản lý nhóm (Rename/Delete) - Có Ghi Log
exports.manageGroup = async (req, res) => {
    const { action, subject_id, group_name, new_group_name, current_user } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        if (action === 'rename') {
            await connection.query('UPDATE students SET learning_group = ? WHERE subject_id = ? AND learning_group = ?', [new_group_name, subject_id, group_name]);
            await connection.query('UPDATE attendance_sessions SET learning_group = ? WHERE subject_id = ? AND learning_group = ?', [new_group_name, subject_id, group_name]);
            
            await logAction(current_user, 'Đổi tên nhóm', `${group_name} -> ${new_group_name}`);
            res.json({ message: `Đã đổi tên thành \"${new_group_name}\"` });

        } else if (action === 'delete') {
            await connection.query('DELETE FROM students WHERE subject_id = ? AND learning_group = ?', [subject_id, group_name]);
            await connection.query('DELETE FROM attendance_sessions WHERE subject_id = ? AND learning_group = ?', [subject_id, group_name]);
            
            await logAction(current_user, 'Xóa nhóm', `Nhóm: ${group_name}`);
            res.json({ message: `Đã xóa nhóm \"${group_name}\"` });
        } else {
            res.status(400).json({ message: 'Action không hợp lệ' });
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi nhóm: ' + error.message });
    } finally {
        connection.release();
    }
};

// 13. Cập nhật lý do
exports.updateReason = async (req, res) => {
    const { record_id, reason } = req.body;
    try {
        await db.query('UPDATE attendance_records SET reason = ? WHERE id = ?', [reason, record_id]);
        // await logAction('unknown', 'Cập nhật lý do', `Record: ${record_id}`); // Có thể mở nếu cần
        res.json({ message: 'Đã lưu lý do!' });
    } catch (error) { res.status(500).json({ message: 'Lỗi lưu lý do' }); }
};

// 14. Xóa vắng (Index)
exports.removeAbsence = async (req, res) => {
    const { record_id } = req.body;
    try {
        await db.query('DELETE FROM attendance_records WHERE id = ?', [record_id]);
        // await logAction('unknown', 'Hủy vắng', `Record: ${record_id}`); // Có thể mở nếu cần
        res.json({ message: 'Đã xóa vắng' });
    } catch (error) { res.status(500).json({ message: 'Lỗi xóa vắng' }); }
};