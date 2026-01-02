// CẤU HÌNH THỜI GIAN (Ví dụ: 15 phút = 15 * 60 * 1000 mili giây)
const INACTIVITY_LIMIT = 15 * 60 * 1000; 

class AuthGuard {
    constructor() {
        this.checkLogin();
        this.setupActivityListener();
        this.startInactivityCheck();
    }

    // 1. KIỂM TRA ĐĂNG NHẬP
    checkLogin() {
        const user = localStorage.getItem('currentUser');
        const currentPage = window.location.pathname.split("/").pop();

        // Danh sách các trang không cần kiểm tra (Trang công khai)
        const publicPages = ['/login/login.html', '/login/forgot-password.html'];

        if (!user) {
            // Nếu chưa đăng nhập mà đang ở trang nội bộ -> Đá về Login
            if (!publicPages.includes(currentPage)) {
                window.location.href = '/login/login.html';
            }
        } else {
            // Nếu đã đăng nhập mà lại vào trang Login -> Đá vào Dashboard
            if (publicPages.includes(currentPage)) {
                window.location.href = '/index.html';
            }
        }
    }

    // 2. LẮNG NGHE HÀNH ĐỘNG CỦA NGƯỜI DÙNG
    setupActivityListener() {
        // Cập nhật thời gian mỗi khi di chuột, click, hoặc gõ phím
        const resetTimer = () => {
            localStorage.setItem('lastActivity', Date.now());
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('scroll', resetTimer);
        
        // Cập nhật ngay khi tải trang
        resetTimer();
    }

    // 3. KIỂM TRA THỜI GIAN KHÔNG HOẠT ĐỘNG
    startInactivityCheck() {
        setInterval(() => {
            const lastActivity = localStorage.getItem('lastActivity');
            const now = Date.now();

            if (lastActivity && (now - lastActivity > INACTIVITY_LIMIT)) {
                this.logout("Hết phiên làm việc do không hoạt động!");
            }
        }, 10000); // Kiểm tra mỗi 10 giây
    }

    // 4. HÀM ĐĂNG XUẤT
    logout(message = "") {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastActivity');
        if (message) alert(message);
        window.location.href = '/login/login.html';
    }
}

// Khởi chạy bảo vệ ngay khi file được tải
const auth = new AuthGuard();

// Hàm logout toàn cục để dùng ở nút Đăng xuất trên menu
function performLogout() {
    auth.logout();
}