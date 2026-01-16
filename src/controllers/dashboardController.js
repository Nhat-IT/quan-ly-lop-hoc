const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        // 1. Lấy dữ liệu vắng (Giữ nguyên logic cũ)
        const sqlAbsent = `
            SELECT 
                st.id AS student_id, st.mssv, st.full_name, st.class_name,
                s.subject_name, s.semester, 
                IFNULL(s.school_year, '2024-2025') as school_year, 
                ses.session_date, ses.session_time,
                ar.id AS record_id, ar.reason, ar.proof_image_url
            FROM attendance_records ar
            JOIN attendance_sessions ses ON ar.session_id = ses.id
            JOIN subjects s ON ses.subject_id = s.id
            JOIN students st ON ar.student_id = st.id 
            WHERE ar.is_absent = 1
            ORDER BY ses.session_date DESC
        `;

        // 2. [MỚI] Đếm tổng sinh viên của lớp 25TH01 và 25TH02
        const sqlCount = `
            SELECT COUNT(*) as total FROM students 
            WHERE class_name IN ('25TH01', '25TH02')
        `;

        const [rows] = await db.query(sqlAbsent);
        const [countResult] = await db.query(sqlCount);
        
        // Lấy con số tổng thực tế
        const realTotalStudents = countResult[0].total || 0;

        const result = {
            "HK1": { total: realTotalStudents, subjects: [], data: [] },
            "HK2": { total: realTotalStudents, subjects: [], data: [] },
            "HK3": { total: realTotalStudents, subjects: [], data: [] },
            "globalTotal": realTotalStudents // Gửi kèm tổng toàn cục
        };

        const tempMap = {};

        rows.forEach(row => {
            const sem = row.semester || 'HK1';
            // Đảm bảo semester tồn tại
            if (!result[sem]) result[sem] = { total: realTotalStudents, subjects: [], data: [] };

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
                school_year: row.school_year 
            });

            if (!result[sem].subjects.includes(row.subject_name)) {
                result[sem].subjects.push(row.subject_name);
            }
        });

        res.json(result);
    } catch (error) {
        console.error("Lỗi Dashboard:", error);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu Dashboard' });
    }
};