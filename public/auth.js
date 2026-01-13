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
        // [QUAN TRỌNG] Dùng key 'user'
        const user = localStorage.getItem('user'); 
        const currentPage = window.location.pathname.split("/").pop();

        // Danh sách các trang không cần kiểm tra (Trang công khai)
        const publicPages = ['login.html', 'forgot-password.html'];

        if (!user) {
            // Nếu chưa đăng nhập -> Đá về Login (trừ khi đang ở trang public)
            if (!publicPages.some(page => currentPage.includes(page))) {
                window.location.href = 'login.html'; 
            }
        } else {
            // Nếu đã đăng nhập -> Đá về Index (nếu cố vào trang Login)
            if (publicPages.some(page => currentPage.includes(page))) {
                window.location.href = 'index.html';
            }
        }
    }

    // 2. LẮNG NGHE HÀNH ĐỘNG CỦA NGƯỜI DÙNG
    setupActivityListener() {
        const resetTimer = () => {
            localStorage.setItem('lastActivity', Date.now());
        };
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('scroll', resetTimer);
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
        }, 10000); 
    }

    // 4. HÀM ĐĂNG XUẤT CHUNG
    logout(message = "") {
        // [QUAN TRỌNG] Xóa key 'user'
        localStorage.removeItem('user'); 
        localStorage.removeItem('lastActivity');
        if (message) alert(message);
        window.location.href = 'login.html';
    }
}

// Khởi chạy bảo vệ ngay khi file được tải
const auth = new AuthGuard();

// Hàm logout toàn cục
function performLogout() {
    auth.logout();
}

// Kiểm tra quyền hạn (Admin/Teacher/Viewer)
function checkPermission() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return; 

    try {
        const user = JSON.parse(userStr);
        const currentPage = window.location.pathname.split("/").pop();

        // Chặn Viewer vào trang quản lý hoặc điểm danh
        if (user.role === 'viewer') {
            if (currentPage.includes('diemdanh.html') || currentPage.includes('quanly.html')) {
                alert('Tài khoản của bạn chỉ được phép xem Trang chủ!');
                window.location.href = 'index.html';
            }
        }

        // Chặn Teacher vào trang quản lý Admin
        if (user.role === 'teacher') {
            if (currentPage.includes('quanly.html')) {
                alert('Bạn không có quyền truy cập trang Quản trị.');
                window.location.href = 'index.html';
            }
        }
    } catch (e) {
        auth.logout();
    }
}

// Gọi hàm này ngay khi trang load
checkPermission();