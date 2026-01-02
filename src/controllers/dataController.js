const db = require('../config/db');

// --- QUẢN LÝ MÔN HỌC ---

// 1. Lấy danh sách môn học
exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy môn học' });
    }
};

// 2. Thêm môn học mới
exports.createSubject = async (req, res) => {
    const { subject_name, semester, start_date, end_date } = req.body;
    try {
        await db.query('INSERT INTO subjects (subject_name, semester, start_date, end_date) VALUES (?, ?, ?, ?)', 
        [subject_name, semester, start_date, end_date]);
        res.status(201).json({ message: 'Thêm môn thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm môn học' });
    }
};

// 3. Sửa thông tin môn học
exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_name, start_date, end_date } = req.body;
    try {
        await db.query('UPDATE subjects SET subject_name=?, start_date=?, end_date=? WHERE id=?', 
        [subject_name, start_date, end_date, id]);
        res.json({ message: 'Cập nhật môn thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật môn học' });
    }
};

// --- QUẢN LÝ SINH VIÊN ---

// 4. Lấy danh sách sinh viên theo ID môn học
exports.getStudentsBySubject = async (req, res) => {
    const { subjectId } = req.params;
    try {
        // Lấy thông tin sinh viên JOIN với bảng enrollments
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
        res.status(500).json({ message: 'Lỗi server khi lấy sinh viên' });
    }
};

// 5. Sửa thông tin sinh viên
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { full_name, mssv, class_name } = req.body;
    try {
        await db.query('UPDATE students SET full_name=?, mssv=?, class_name=? WHERE id=?', 
        [full_name, mssv, class_name, id]);
        res.json({ message: 'Cập nhật sinh viên thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sinh viên' });
    }
};

// --- QUẢN LÝ ĐIỂM DANH ---

// 6. Lưu điểm danh (Tạo buổi học + Lưu trạng thái vắng)
exports.saveAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, attendance_data } = req.body;
    
    // Kết nối Transaction để đảm bảo dữ liệu nhất quán
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // B1: Tìm hoặc Tạo buổi học (Session)
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

        // B2: Lưu danh sách vắng
        // Xóa dữ liệu cũ của buổi này (để tránh trùng lặp) rồi thêm mới
        for (const record of attendance_data) {
            await connection.query('DELETE FROM attendance_records WHERE session_id=? AND student_id=?', [sessionId, record.student_id]);
            
            await connection.query(
                'INSERT INTO attendance_records (session_id, student_id, is_absent, reason) VALUES (?, ?, ?, ?)',
                [sessionId, record.student_id, record.is_absent, record.reason]
            );
        }

        await connection.commit();
        res.json({ message: 'Lưu điểm danh thành công!' });

    } catch (error) {
        await connection.rollback(); // Hoàn tác nếu lỗi
        console.error("Attendance Error:", error);
        res.status(500).json({ message: 'Lỗi khi lưu điểm danh' });
    } finally {
        connection.release();
    }
};