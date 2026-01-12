const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        // 1. Query lấy danh sách sinh viên VẮNG
        // (Giữ nguyên logic JOIN đã sửa st.id ở bước trước)
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

        // 2. [CẬP NHẬT] Query đếm TỔNG SINH VIÊN ĐANG HỌC (Chỉ tính lớp 25TH01, 25TH02)
        // - JOIN thêm bảng students để lấy class_name
        // - Thêm WHERE st.class_name IN ('25TH01', '25TH02')
        const sqlTotalStudents = `
            SELECT s.semester, COUNT(DISTINCT e.student_id) as total_enrolled
            FROM enrollments e
            JOIN subjects s ON e.subject_id = s.id
            JOIN students st ON e.student_id = st.id
            WHERE st.class_name IN ('25TH01', '25TH02')
            GROUP BY s.semester
        `;
        
        // Thực hiện cả 2 truy vấn song song
        const [absentRows, totalRows] = await Promise.all([
            db.query(sqlAbsent).then(([rows]) => rows),
            db.query(sqlTotalStudents).then(([rows]) => rows)
        ]);

        // Khởi tạo cấu trúc kết quả
        const result = {
            "HK1": { total: 0, subjects: [], data: [] },
            "HK2": { total: 0, subjects: [], data: [] },
            "HK3": { total: 0, subjects: [], data: [] }
        };

        // BƯỚC 1: Cập nhật TỔNG SỐ SINH VIÊN (đã lọc lớp) vào result
        totalRows.forEach(row => {
            const sem = row.semester || 'HK1';
            if (result[sem]) {
                result[sem].total = row.total_enrolled;
            } else {
                result[sem] = { total: row.total_enrolled, subjects: [], data: [] };
            }
        });

        // BƯỚC 2: Xử lý danh sách vắng (Logic cũ không đổi)
        const tempMap = {};

        absentRows.forEach(row => {
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

        // Không ghi đè total = length nữa
        // for (const k in result) result[k].total = result[k].data.length; 

        res.json(result);
    } catch (error) {
        console.error("Lỗi Dashboard:", error);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu Dashboard' });
    }
};