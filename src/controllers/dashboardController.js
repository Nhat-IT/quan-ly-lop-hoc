const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        // 1. Lấy tổng số sinh viên toàn trường
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM students');
        const totalStudents = countResult[0].total;

        // 2. Lấy danh sách tất cả các lượt vắng (kèm thông tin SV, Môn, Buổi)
        // Chỉ lấy những dòng có is_absent = 1 (Vắng)
        const sql = `
            SELECT 
                s.id as student_id, s.full_name, s.mssv,
                sub.subject_name, sub.semester,
                sess.session_date, sess.session_time,
                ar.reason, ar.proof_image_url
            FROM attendance_records ar
            JOIN attendance_sessions sess ON ar.session_id = sess.id
            JOIN subjects sub ON sess.subject_id = sub.id
            JOIN students s ON ar.student_id = s.id
            WHERE ar.is_absent = 1
            ORDER BY sess.session_date DESC
        `;
        
        const [absences] = await db.query(sql);

        // 3. Xử lý dữ liệu để gom nhóm theo Học kỳ (HK1, HK2...) cho giống cấu trúc Frontend cần
        const result = {};

        // Helper để tạo cấu trúc mặc định nếu chưa có
        const initSemester = (sem) => {
            if (!result[sem]) {
                result[sem] = { total: totalStudents, subjects: [], data: [] };
            }
        };

        // Danh sách tạm để gom nhóm sinh viên
        const studentMap = {};

        absences.forEach(row => {
            const sem = row.semester || 'HK1'; // Mặc định HK1 nếu null
            initSemester(sem);

            // Thêm tên môn vào danh sách môn của học kỳ (dùng Set để không trùng)
            if (!result[sem].subjects.includes(row.subject_name)) {
                result[sem].subjects.push(row.subject_name);
            }

            // Gom nhóm chi tiết vắng theo từng sinh viên
            const key = `${sem}_${row.student_id}`;
            if (!studentMap[key]) {
                studentMap[key] = {
                    id: row.student_id,
                    name: row.full_name,
                    mssv: row.mssv,
                    details: []
                };
                result[sem].data.push(studentMap[key]);
            }

            // Format ngày tháng (YYYY-MM-DD -> DD/MM)
            const dateObj = new Date(row.session_date);
            const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

            // Thêm chi tiết vắng
            studentMap[key].details.push({
                sub: row.subject_name,
                date: `${dateStr} - ${row.session_time}`,
                reason: row.reason || "",
                proof: row.proof_image_url || ""
            });
        });

        res.json(result);

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu dashboard' });
    }
};

// ... (các hàm cũ giữ nguyên)

// HÀM MỚI: Thêm môn học vào Database
exports.createSubject = async (req, res) => {
    const { subject_name, semester, start_date, end_date } = req.body;
    
    try {
        const sql = `INSERT INTO subjects (subject_name, semester, start_date, end_date) VALUES (?, ?, ?, ?)`;
        await db.query(sql, [subject_name, semester, start_date, end_date]);
        
        res.status(201).json({ message: 'Thêm môn thành công!' });
    } catch (error) {
        console.error("Add Subject Error:", error);
        res.status(500).json({ message: 'Lỗi server khi thêm môn' });
    }
};