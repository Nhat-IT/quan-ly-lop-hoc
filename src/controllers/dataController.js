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

// 5. Lấy danh sách SV theo môn (CẬP NHẬT: Lấy thêm e.learning_group)
exports.getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    try {
        // Thêm e.learning_group vào câu SELECT
        const sql = `SELECT s.id, s.mssv, s.full_name, s.class_name, e.learning_group 
                     FROM students s 
                     JOIN enrollments e ON s.id = e.student_id 
                     WHERE e.subject_id = ?`;
        const [rows] = await db.query(sql, [subjectId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 6. Cập nhật thông tin SV (CẬP NHẬT: Cho phép sửa Nhóm học)
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    // Nhận thêm subject_id và learning_group từ client
    const { full_name, mssv, class_name, subject_id, learning_group } = req.body; 
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Cập nhật thông tin cơ bản
        await connection.query('UPDATE students SET full_name=?, mssv=?, class_name=? WHERE id=?', [full_name, mssv, class_name, id]);

        // 2. Cập nhật nhóm học trong bảng enrollments (nếu có gửi subject_id)
        if (subject_id && learning_group) {
            await connection.query(
                'UPDATE enrollments SET learning_group=? WHERE student_id=? AND subject_id=?', 
                [learning_group, id, subject_id]
            );
        }

        await connection.commit();
        res.json({ message: 'Cập nhật SV thành công' });
    } catch (error) { 
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi cập nhật SV' }); 
    } finally {
        connection.release();
    }
};

// 7. Lưu điểm danh (Cập nhật thêm learning_group)
exports.saveAttendance = async (req, res) => {
    // Nhận thêm learning_group từ body
    const { subject_id, session_date, session_time, learning_group, attendance_data } = req.body;
    const groupName = learning_group || 'Nhóm 1'; // Mặc định

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Tìm hoặc tạo session (Kèm theo nhóm)
        const [sessions] = await connection.query(
            'SELECT id FROM attendance_sessions WHERE subject_id=? AND session_date=? AND session_time=? AND learning_group=?', 
            [subject_id, session_date, session_time, groupName]
        );

        let sessionId;
        if (sessions.length > 0) {
            sessionId = sessions[0].id;
        } else {
            const [result] = await connection.query(
                'INSERT INTO attendance_sessions (subject_id, session_date, session_time, learning_group) VALUES (?, ?, ?, ?)', 
                [subject_id, session_date, session_time, groupName]
            );
            sessionId = result.insertId;
        }
        
        // 2. Xóa dữ liệu cũ và lưu mới (Giữ nguyên logic cũ)
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

// 8. Import sinh viên từ Excel
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

// 9. Đếm tổng sinh viên (API bạn đang thiếu)
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
// 10. Lấy danh sách môn
exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 11.[MỚI] Xóa sinh viên (Thêm vào cuối file)
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Xóa dữ liệu điểm danh của SV này trước
        await connection.query('DELETE FROM attendance_records WHERE student_id = ?', [id]);
        
        // Xóa khỏi lớp học (enrollments)
        await connection.query('DELETE FROM enrollments WHERE student_id = ?', [id]);
        
        // Cuối cùng xóa thông tin sinh viên
        await connection.query('DELETE FROM students WHERE id = ?', [id]);

        await connection.commit();
        res.json({ message: 'Đã xóa sinh viên thành công!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa sinh viên' });
    } finally {
        connection.release();
    }
};

// ... (Các hàm cũ)

// [MỚI] Quản lý Nhóm (Đổi tên hoặc Xóa)
exports.manageGroup = async (req, res) => {
    const { action, subject_id, group_name, new_group_name } = req.body;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        if (action === 'rename') {
            // 1. Cập nhật bảng sinh viên (enrollments)
            await connection.query(
                'UPDATE enrollments SET learning_group = ? WHERE subject_id = ? AND learning_group = ?',
                [new_group_name, subject_id, group_name]
            );
            // 2. Cập nhật bảng lịch sử điểm danh (attendance_sessions)
            await connection.query(
                'UPDATE attendance_sessions SET learning_group = ? WHERE subject_id = ? AND learning_group = ?',
                [new_group_name, subject_id, group_name]
            );
            
            await connection.commit();
            res.json({ message: `Đã đổi tên thành "${new_group_name}"` });

        } else if (action === 'delete') {
            // Xóa nhóm nghĩa là set NULL cho sinh viên thuộc nhóm đó (về trạng thái chưa phân nhóm)
            await connection.query(
                'UPDATE enrollments SET learning_group = NULL WHERE subject_id = ? AND learning_group = ?',
                [subject_id, group_name]
            );
            
            // Xóa các buổi điểm danh của nhóm này (Tùy chọn: Hoặc giữ lại nhưng set NULL)
            // Ở đây mình chọn xóa luôn buổi điểm danh của nhóm bị xóa để sạch data
            // Trước hết xóa chi tiết điểm danh
            await connection.query(
                `DELETE FROM attendance_records WHERE session_id IN (
                    SELECT id FROM attendance_sessions WHERE subject_id = ? AND learning_group = ?
                )`,
                [subject_id, group_name]
            );
            // Sau đó xóa session
            await connection.query(
                'DELETE FROM attendance_sessions WHERE subject_id = ? AND learning_group = ?',
                [subject_id, group_name]
            );

            await connection.commit();
            res.json({ message: `Đã xóa nhóm "${group_name}"` });
        } else {
            res.status(400).json({ message: 'Hành động không hợp lệ' });
        }

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi xử lý nhóm: ' + error.message });
    } finally {
        connection.release();
    }
};