const db = require('../config/db');

exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 2. Thêm môn (CẬP NHẬT: Thêm default_group)
exports.createSubject = async (req, res) => {
    const { subject_name, teacher_name, semester, start_date, end_date, default_session, default_group } = req.body;
    try {
        await db.query(
            'INSERT INTO subjects (subject_name, teacher_name, semester, start_date, end_date, default_session, default_group) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [subject_name, teacher_name, semester, start_date, end_date, default_session || 'Sáng', default_group || 'Nhóm 1']
        );
        res.status(201).json({ message: 'Thêm thành công' });
    } catch (error) { res.status(500).json({ message: 'Lỗi thêm môn' }); }
};

// 3. Sửa môn (CẬP NHẬT: Thêm default_group)
exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_name, teacher_name, start_date, end_date, default_session, default_group } = req.body;
    try {
        await db.query(
            'UPDATE subjects SET subject_name=?, teacher_name=?, start_date=?, end_date=?, default_session=?, default_group=? WHERE id=?', 
            [subject_name, teacher_name, start_date, end_date, default_session, default_group, id]
        );
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật' }); }
};

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
    } catch (error) { await connection.rollback(); res.status(500).json({ message: 'Lỗi xóa' }); } finally { connection.release(); }
};

// Lấy SV (Có learning_group)
exports.getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    try {
        const sql = `SELECT s.id, s.mssv, s.full_name, s.class_name, e.learning_group 
                     FROM students s JOIN enrollments e ON s.id = e.student_id 
                     WHERE e.subject_id = ?`;
        const [rows] = await db.query(sql, [subjectId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// Cập nhật SV (Có chuyển nhóm)
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { full_name, mssv, class_name, subject_id, learning_group } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE students SET full_name=?, mssv=?, class_name=? WHERE id=?', [full_name, mssv, class_name, id]);
        if (subject_id && learning_group) {
            await connection.query('UPDATE enrollments SET learning_group=? WHERE student_id=? AND subject_id=?', [learning_group, id, subject_id]);
        }
        await connection.commit();
        res.json({ message: 'Cập nhật SV thành công' });
    } catch (error) { await connection.rollback(); res.status(500).json({ message: 'Lỗi cập nhật' }); } finally { connection.release(); }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM attendance_records WHERE student_id = ?', [id]);
        await connection.query('DELETE FROM enrollments WHERE student_id = ?', [id]);
        await connection.query('DELETE FROM students WHERE id = ?', [id]);
        await connection.commit();
        res.json({ message: 'Đã xóa SV.' });
    } catch (error) { await connection.rollback(); res.status(500).json({ message: 'Lỗi xóa SV' }); } finally { connection.release(); }
};

// Lưu điểm danh (Có learning_group)
exports.saveAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, learning_group, attendance_data } = req.body;
    const groupName = learning_group || 'Nhóm 1';
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        let sessionId;
        const [sessions] = await connection.query('SELECT id FROM attendance_sessions WHERE subject_id=? AND session_date=? AND session_time=? AND learning_group=?', [subject_id, session_date, session_time, groupName]);
        
        if (sessions.length > 0) sessionId = sessions[0].id;
        else {
            const [result] = await connection.query('INSERT INTO attendance_sessions (subject_id, session_date, session_time, learning_group) VALUES (?, ?, ?, ?)', [subject_id, session_date, session_time, groupName]);
            sessionId = result.insertId;
        }
        
        await connection.query('DELETE FROM attendance_records WHERE session_id=?', [sessionId]);
        if (attendance_data.length > 0) {
            const values = attendance_data.map(r => [sessionId, r.student_id, r.is_absent || 0, r.reason || '', r.proof_image_url || null]);
            const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
            await connection.query(`INSERT INTO attendance_records (session_id, student_id, is_absent, reason, proof_image_url) VALUES ${placeholders}`, values.flat());
        }
        await connection.commit();
        res.json({ message: 'Lưu điểm danh thành công!' });
    } catch (error) { await connection.rollback(); res.status(500).json({ message: 'Lỗi lưu: ' + error.message }); } finally { connection.release(); }
};

// 10. Import SV (CẬP NHẬT: Nhận thêm learning_group)
exports.importStudents = async (req, res) => {
    // Nhận thêm learning_group
    const { subject_id, students, learning_group } = req.body;
    
    // Nếu không chọn nhóm thì mặc định vào Nhóm 1
    const targetGroup = learning_group || 'Nhóm 1';

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const sv of students) {
            // 1. Tạo/Update sinh viên
            await connection.query(
                `INSERT INTO students (mssv, full_name, class_name) VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), class_name = VALUES(class_name)`, 
                [sv.mssv, sv.full_name, sv.class_name]
            );
            
            // 2. Lấy ID sinh viên
            const [rows] = await connection.query('SELECT id FROM students WHERE mssv = ?', [sv.mssv]);
            const studentId = rows[0].id;
            
            // 3. Tạo liên kết vào lớp (enrollments) với NHÓM ĐÚNG
            const [enrollment] = await connection.query('SELECT id FROM enrollments WHERE student_id = ? AND subject_id = ?', [studentId, subject_id]);
            
            if (enrollment.length === 0) {
                // Chưa có thì thêm mới vào nhóm đang chọn
                await connection.query(
                    'INSERT INTO enrollments (student_id, subject_id, learning_group) VALUES (?, ?, ?)', 
                    [studentId, subject_id, targetGroup]
                );
            } else {
                // (Tùy chọn) Nếu SV đã có trong môn này rồi nhưng muốn chuyển sang nhóm đang nhập thì dùng lệnh này:
                // await connection.query('UPDATE enrollments SET learning_group = ? WHERE id = ?', [targetGroup, enrollment[0].id]);
            }
        }
        await connection.commit();
        res.json({ message: `Đã nhập thành công ${students.length} sinh viên vào ${targetGroup}!` });
    } catch (error) { 
        await connection.rollback(); 
        console.error(error);
        res.status(500).json({ message: 'Lỗi import: ' + error.message }); 
    } finally { 
        connection.release(); 
    }
};

exports.countSpecialStudents = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT COUNT(*) as total FROM students WHERE class_name IN ('25TH01', '25TH02')");
        res.json({ total: rows[0].total });
    } catch (error) { res.status(500).json({ message: 'Lỗi đếm SV' }); }
};

exports.manageGroup = async (req, res) => {
    const { action, subject_id, group_name, new_group_name } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        if (action === 'rename') {
            await connection.query('UPDATE enrollments SET learning_group = ? WHERE subject_id = ? AND learning_group = ?', [new_group_name, subject_id, group_name]);
            await connection.query('UPDATE attendance_sessions SET learning_group = ? WHERE subject_id = ? AND learning_group = ?', [new_group_name, subject_id, group_name]);
            res.json({ message: `Đã đổi tên thành "${new_group_name}"` });
        } else if (action === 'delete') {
            await connection.query('UPDATE enrollments SET learning_group = NULL WHERE subject_id = ? AND learning_group = ?', [subject_id, group_name]);
            await connection.query('DELETE FROM attendance_records WHERE session_id IN (SELECT id FROM attendance_sessions WHERE subject_id = ? AND learning_group = ?)', [subject_id, group_name]);
            await connection.query('DELETE FROM attendance_sessions WHERE subject_id = ? AND learning_group = ?', [subject_id, group_name]);
            res.json({ message: `Đã xóa nhóm "${group_name}"` });
        } else res.status(400).json({ message: 'Action không hợp lệ' });
        await connection.commit();
    } catch (error) { await connection.rollback(); res.status(500).json({ message: 'Lỗi nhóm: ' + error.message }); } finally { connection.release(); }
};