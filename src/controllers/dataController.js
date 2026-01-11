const db = require('../config/db');

// --- PHẦN DASHBOARD (ĐÃ SỬA: Lấy chính xác Năm học) ---
exports.getDashboardData = async (req, res) => {
    try {
        const sql = `
            SELECT 
                st.id AS student_id, st.mssv, st.full_name, st.class_name,
                s.subject_name, s.semester, 
                IFNULL(s.school_year, '2024-2025') as school_year, 
                ses.session_date, ses.session_time,
                ar.id AS record_id, ar.reason, ar.proof_image_url
            FROM attendance_records ar
            JOIN attendance_sessions ses ON ar.session_id = ses.id
            JOIN subjects s ON ses.subject_id = s.id
            JOIN students st ON ar.student_id = st.student_id
            WHERE ar.is_absent = 1
            ORDER BY ses.session_date DESC
        `;
        const [rows] = await db.query(sql);

        const result = {
            "HK1": { total: 0, subjects: [], data: [] },
            "HK2": { total: 0, subjects: [], data: [] },
            "HK3": { total: 0, subjects: [], data: [] }
        };
        const tempMap = {};

        rows.forEach(row => {
            const sem = row.semester || 'HK1';
            if (!result[sem]) result[sem] = { total: 0, subjects: [], data: [] };

            // Tạo key duy nhất cho mỗi sinh viên trong học kỳ đó
            const key = `${sem}_${row.mssv}`;
            
            if (!tempMap[key]) {
                tempMap[key] = {
                    name: row.full_name,
                    mssv: row.mssv,
                    class_name: row.class_name,
                    details: []
                };
                result[sem].data.push(tempMap[key]);
            }

            tempMap[key].details.push({
                sub: row.subject_name,
                date: row.session_date,
                session_time: row.session_time,
                reason: row.reason,
                proof: row.proof_image_url,
                record_id: row.record_id,
                school_year: row.school_year // Trường này bắt buộc phải có để lọc
            });

            if (!result[sem].subjects.includes(row.subject_name)) {
                result[sem].subjects.push(row.subject_name);
            }
        });

        for (const k in result) result[k].total = result[k].data.length;
        res.json(result);
    } catch (error) {
        console.error("Lỗi Dashboard:", error);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
    }
};

// --- CÁC API KHÁC (GIỮ NGUYÊN) ---
exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects ORDER BY id DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

exports.createSubject = async (req, res) => {
    const { subject_name, teacher_name, semester, start_date, end_date, default_session, default_group, school_year } = req.body;
    const sDate = start_date === "" ? null : start_date;
    const eDate = end_date === "" ? null : end_date;
    try {
        await db.query('INSERT INTO subjects (subject_name, teacher_name, semester, start_date, end_date, default_session, default_group, school_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [subject_name, teacher_name, semester, sDate, eDate, default_session||'Sáng', default_group||'Nhóm 1', school_year||'2024-2025']);
        res.status(201).json({ message: 'Thêm thành công' });
    } catch (e) { res.status(500).json({ message: 'Lỗi: ' + e.message }); }
};

exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_name, teacher_name, start_date, end_date, default_session, default_group, school_year } = req.body;
    const sDate = start_date === "" ? null : start_date;
    const eDate = end_date === "" ? null : end_date;
    try {
        await db.query('UPDATE subjects SET subject_name=?, teacher_name=?, start_date=?, end_date=?, default_session=?, default_group=?, school_year=? WHERE id=?', 
            [subject_name, teacher_name, sDate, eDate, default_session, default_group, school_year, id]);
        res.json({ message: 'Cập nhật thành công' });
    } catch (e) { res.status(500).json({ message: 'Lỗi: ' + e.message }); }
};

exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM attendance_records WHERE session_id IN (SELECT id FROM attendance_sessions WHERE subject_id=?)', [id]);
        await conn.query('DELETE FROM attendance_sessions WHERE subject_id=?', [id]);
        await conn.query('DELETE FROM enrollments WHERE subject_id=?', [id]);
        await conn.query('DELETE FROM subjects WHERE id=?', [id]);
        await conn.commit();
        res.json({ message: 'Đã xóa' });
    } catch (e) { await conn.rollback(); res.status(500).json({ message: 'Lỗi xóa' }); } finally { conn.release(); }
};

exports.getStudentsBySubject = async (req, res) => {
    try { const [rows] = await db.query(`SELECT s.id, s.mssv, s.full_name, s.class_name, e.learning_group FROM students s JOIN enrollments e ON s.id=e.student_id WHERE e.subject_id=?`, [req.params.subjectId]); res.json(rows); } catch(e) { res.status(500).json({message:'Err'}); }
};

exports.importStudents = async (req, res) => {
    const { subject_id, students, learning_group } = req.body;
    const targetGroup = learning_group || 'Nhóm 1';
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        for (const sv of students) {
            await conn.query(`INSERT INTO students (mssv, full_name, class_name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), class_name=VALUES(class_name)`, [sv.mssv, sv.full_name, sv.class_name]);
            const [r] = await conn.query('SELECT id FROM students WHERE mssv=?', [sv.mssv]);
            const sid = r[0].id;
            const [enr] = await conn.query('SELECT id FROM enrollments WHERE student_id=? AND subject_id=?', [sid, subject_id]);
            if(enr.length===0) await conn.query('INSERT INTO enrollments (student_id, subject_id, learning_group) VALUES (?, ?, ?)', [sid, subject_id, targetGroup]);
            else await conn.query('UPDATE enrollments SET learning_group=? WHERE id=?', [targetGroup, enr[0].id]);
        }
        await conn.commit();
        res.json({ message: 'Import thành công' });
    } catch(e) { await conn.rollback(); res.status(500).json({message: e.message}); } finally { conn.release(); }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params; const { full_name, mssv, class_name, subject_id, learning_group } = req.body;
    const conn = await db.getConnection();
    try { await conn.beginTransaction(); await conn.query('UPDATE students SET full_name=?, mssv=?, class_name=? WHERE id=?', [full_name, mssv, class_name, id]);
        if(subject_id) await conn.query('UPDATE enrollments SET learning_group=? WHERE student_id=? AND subject_id=?', [learning_group, id, subject_id]);
        await conn.commit(); res.json({message: 'OK'}); } catch(e) { await conn.rollback(); res.status(500).json({message:'Err'}); } finally { conn.release(); }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params; const conn = await db.getConnection();
    try { await conn.beginTransaction(); await conn.query('DELETE FROM attendance_records WHERE student_id=?',[id]); await conn.query('DELETE FROM enrollments WHERE student_id=?',[id]); await conn.query('DELETE FROM students WHERE id=?',[id]); await conn.commit(); res.json({message:'Deleted'}); } catch(e) { await conn.rollback(); res.status(500).json({message:'Err'}); } finally { conn.release(); }
};

exports.saveAttendance = async (req, res) => {
    const { subject_id, session_date, session_time, learning_group, attendance_data } = req.body;
    const group = learning_group || 'Nhóm 1';
    const conn = await db.getConnection();
    try { await conn.beginTransaction();
        let sid; const [s] = await conn.query('SELECT id FROM attendance_sessions WHERE subject_id=? AND session_date=? AND session_time=? AND learning_group=?', [subject_id, session_date, session_time, group]);
        if(s.length>0) sid=s[0].id; else { const [r] = await conn.query('INSERT INTO attendance_sessions (subject_id, session_date, session_time, learning_group) VALUES (?,?,?,?)', [subject_id, session_date, session_time, group]); sid=r.insertId; }
        await conn.query('DELETE FROM attendance_records WHERE session_id=?', [sid]);
        if(attendance_data.length>0) {
            const vals = attendance_data.map(r => [sid, r.student_id, r.is_absent||0, r.reason||'', r.proof_image_url||null]);
            await conn.query(`INSERT INTO attendance_records (session_id, student_id, is_absent, reason, proof_image_url) VALUES ?`, [vals]);
        }
        await conn.commit(); res.json({message:'Lưu OK'}); } catch(e) { await conn.rollback(); res.status(500).json({message:e.message}); } finally { conn.release(); }
};

exports.getAttendance = async (req, res) => {
    try { const { subject_id, session_date, session_time, learning_group } = req.query;
        const [rows] = await db.query(`SELECT ar.student_id, ar.is_absent, ar.reason, ar.proof_image_url FROM attendance_sessions s JOIN attendance_records ar ON s.id=ar.session_id WHERE s.subject_id=? AND s.session_date=? AND s.session_time=? AND s.learning_group=?`, [subject_id, session_date, session_time, learning_group||'Nhóm 1']);
        res.json(rows); } catch(e) { res.status(500).json([]); }
};

exports.manageGroup = async (req, res) => {
    const { action, subject_id, group_name, new_group_name } = req.body;
    const conn = await db.getConnection();
    try { await conn.beginTransaction();
        if(action==='rename') { await conn.query('UPDATE enrollments SET learning_group=? WHERE subject_id=? AND learning_group=?',[new_group_name, subject_id, group_name]); await conn.query('UPDATE attendance_sessions SET learning_group=? WHERE subject_id=? AND learning_group=?',[new_group_name, subject_id, group_name]); }
        else if(action==='delete') { await conn.query('UPDATE enrollments SET learning_group=NULL WHERE subject_id=? AND learning_group=?',[subject_id, group_name]); await conn.query('DELETE FROM attendance_records WHERE session_id IN (SELECT id FROM attendance_sessions WHERE subject_id=? AND learning_group=?)',[subject_id, group_name]); await conn.query('DELETE FROM attendance_sessions WHERE subject_id=? AND learning_group=?',[subject_id, group_name]); }
        await conn.commit(); res.json({message:'OK'}); } catch(e) { await conn.rollback(); res.status(500).json({message:e.message}); } finally { conn.release(); }
};

exports.updateReason = async (req, res) => {
    try { await db.query('UPDATE attendance_records SET reason=? WHERE id=?', [req.body.reason, req.body.record_id]); res.json({message:'OK'}); } catch(e) { res.status(500).json({message:'Err'}); }
};

exports.removeAbsence = async (req, res) => {
    try { await db.query('UPDATE attendance_records SET is_absent=0 WHERE id=?', [req.body.record_id]); res.json({message:'OK'}); } catch(e) { res.status(500).json({message:'Err'}); }
};

exports.countSpecialStudents = async (req, res) => { res.json({total:0}); }; // Placeholder