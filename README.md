# 🏫 Hệ Thống Quản Lý Điểm Danh Sinh Viên

> **Mô tả:** Ứng dụng web toàn diện giúp giảng viên quản lý lớp học, điểm danh sinh viên, theo dõi vắng nghỉ và xuất báo cáo. Backend sử dụng **Node.js/Express**; frontend là các trang tĩnh (HTML/CSS/JS) giao diện thân thiện.

---

## ✨ Tính năng chính

- **🔐 Xác thực người dùng:** Đăng nhập giảng viên/quản trị viên, hỗ trợ API xác thực và đặt lại mật khẩu.
- **📊 Dashboard tổng quan:** Thống kê số lượng sinh viên, hiển thị cảnh báo sinh viên vắng nhiều, danh sách môn học cần lưu ý.
- **📅 Quản lý môn học:** Thêm, Sửa, Xóa môn học theo từng học kỳ.
- **👥 Quản lý sinh viên:**
  - Thêm mới, cập nhật thông tin.
  - Xóa sinh viên (kèm xóa dữ liệu liên quan).
  - Import danh sách nhanh chóng từ file Excel.
- **📝 Điểm danh thông minh:**
  - Giao diện điểm danh theo ngày và buổi (Sáng / Chiều / Tối).
  - Tích chọn trạng thái vắng.
  - Nhập lý do và upload ảnh minh chứng (giấy phép, bệnh án...).
  - Bộ lọc tìm kiếm (Tên, MSSV, Lớp).
- **📂 Báo cáo & Tiện ích:**
  - Xuất dữ liệu ra file Excel.
  - Xem lịch sử vắng chi tiết.

---

## 🛠️ Công nghệ sử dụng

- **Backend:** Node.js, Express.js  
- **Database:** MySQL  
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5  

### Thư viện hỗ trợ
- `mysql2` – Kết nối cơ sở dữ liệu  
- `multer` – Upload file minh chứng  
- `xlsx` – Import/Export Excel  
- `cors`, `dotenv` – Cấu hình hệ thống  

---

## 🚀 Cài đặt & Chạy Local

### 1. Yêu cầu
- Node.js >= 14  
- MySQL Server (XAMPP / Docker / MySQL Installer)

### 2. Cài đặt source

```bash
git clone https://github.com/Nhat-IT/quan-ly-lop-hoc.git
cd quan-ly-lop-hoc
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` tại thư mục gốc:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=mat_khau_mysql_cua_ban
DB_NAME=attendance_db
DB_PORT=3306
```

> Nếu dùng XAMPP mặc định, `DB_PASS` có thể để trống.

### 4. Khởi động

```bash
node server.js
# hoặc
nodemon server.js
```

Mở trình duyệt: http://localhost:3000

---

## 🌐 Triển khai Online (Render + Clever Cloud)

### Bước 1: Tạo MySQL Database trên Clever Cloud
1. Truy cập https://console.clever-cloud.com  
2. Create → Add-on → MySQL → Gói DEV (Free)  
3. Lưu lại thông tin: Host, DB, User, Password, Port  
4. Dùng DBeaver / HeidiSQL để import file SQL

### Bước 2: Đẩy code lên GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Bước 3: Deploy Web Service trên Render
- Runtime: Node  
- Build Command: `npm install`  
- Start Command: `node server.js`  

**Environment Variables:**
- DB_HOST
- DB_NAME
- DB_USER
- DB_PASS
- DB_PORT=3306
- PORT=3000

---

## 📂 Cấu trúc thư mục

```
/
├── public/
│   ├── login/
│   ├── auth.js
│   ├── index.html
│   └── diemdanh.html
├── src/
│   ├── config/
│   ├── controllers/
│   └── routes/
├── server.js
├── package.json
└── .env
```

---

## 🧭 API Chính

### Auth
- `POST /api/auth/login`
- `POST /api/auth/verify-user`
- `POST /api/auth/reset-password`

### Sinh viên & Dữ liệu
- `GET /api/data/dashboard`
- `GET /api/data/subjects`
- `POST /api/data/students/import`
- `DELETE /api/data/students/:id`

### Điểm danh
- `POST /api/data/attendance`
- `GET /api/data/attendance/check`
- `POST /api/data/upload-proof`

---

## ⚠️ Lưu ý

- **Uploads:** Render free không lưu file vĩnh viễn → nên dùng Cloudinary / S3.
- **Bảo mật:** Mật khẩu hiện lưu plaintext (phục vụ học tập). Thực tế cần bcrypt.

---

## 🤝 Đóng góp
Mọi Pull Request / Issue đều được hoan nghênh.

---

**Phát triển với ❤️ bởi Nhat-IT**
