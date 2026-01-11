const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        // Query lấy tất cả sinh viên vắng, JOIN với môn học để lấy school_year
        const sql = `
            SELECT 
                st.id AS student_id, st.mssv, st.full_name, st.class_name,
                s.subject_name, s.semester, s.school_year,
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

        // Gom nhóm dữ liệu theo Học Kỳ (HK1, HK2, HK3) để Frontend dễ xử lý
        const result = {
            "HK1": { total: 0, subjects: [], data: [] },
            "HK2": { total: 0, subjects: [], data: [] },
            "HK3": { total: 0, subjects: [], data: [] }
        };

        // Biến tạm để gom nhóm theo sinh viên
        const tempMap = {};

        rows.forEach(row => {
            const sem = row.semester || 'HK1';
            if (!result[sem]) result[sem] = { total: 0, subjects: [], data: [] };

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

            // Đẩy chi tiết vắng vào, quan trọng là có school_year
            tempMap[key].details.push({
                sub: row.subject_name,
                date: row.session_date,
                session_time: row.session_time,
                reason: row.reason,
                proof: row.proof_image_url,
                record_id: row.record_id,
                school_year: row.school_year // <--- QUAN TRỌNG: Cần trường này để lọc
            });

            // Thêm môn học vào list môn của kỳ đó
            if (!result[sem].subjects.includes(row.subject_name)) {
                result[sem].subjects.push(row.subject_name);
            }
        });

        // Đếm tổng số sinh viên trong danh sách (Unique) cho mỗi kỳ
        for (const k in result) {
            result[k].total = result[k].data.length;
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu Dashboard' });
    }
};