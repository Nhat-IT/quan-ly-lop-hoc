// CẤU HÌNH THỜI GIAN (Ví dụ: 15 phút)
const INACTIVITY_LIMIT = 15 * 60 * 1000; 

class AuthGuard {
    constructor() {
        this.checkLogin();
        this.setupActivityListener();
        this.startInactivityCheck();
    }

    // 1. KIỂM TRA ĐĂNG NHẬP
    checkLogin() {
        const user = localStorage.getItem('user'); 
        const path = window.location.pathname; 

        // Danh sách các trang không cần kiểm tra (Trang công khai)
        // [QUAN TRỌNG] Kiểm tra từ khóa trong đường dẫn để linh hoạt hơn
        const isPublicPage = path.includes('/login/login.html') || path.includes('/login/forgot-password.html');

        if (!user) {
            // Chưa đăng nhập -> Đá về Login (nếu đang ở trang nội bộ)
            if (!isPublicPage) {
                window.location.href = '/login/login.html'; // Đường dẫn tuyệt đối
            }
        } else {
            // Đã đăng nhập -> Đá về Index (nếu cố tình vào trang Login)
            if (isPublicPage) {
                window.location.href = '/index.html'; // Đường dẫn tuyệt đối
            }
        }
    }

    // 2. LẮNG NGHE HÀNH ĐỘNG
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

    // 3. KIỂM TRA TIMEOUT
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
        localStorage.removeItem('user'); 
        localStorage.removeItem('lastActivity');
        if (message) alert(message);
        // [QUAN TRỌNG] Dùng đường dẫn tuyệt đối bắt đầu bằng /
        window.location.href = '/login/login.html';
    }
}

// Khởi chạy bảo vệ ngay khi file được tải
const auth = new AuthGuard();

// Hàm logout toàn cục
function performLogout() {
    auth.logout();
}

// Hàm phân quyền
function checkPermission() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return; 

    try {
        const user = JSON.parse(userStr);
        const path = window.location.pathname;

        // Chặn Viewer
        if (user.role === 'viewer') {
            if (path.includes('diemdanh.html') || path.includes('quanly.html')) {
                alert('Tài khoản chỉ xem!');
                window.location.href = '/index.html';
            }
        }
        // Chặn Teacher vào Admin
        if (user.role === 'teacher') {
            if (path.includes('quanly.html')) {
                alert('Bạn không có quyền truy cập trang Quản trị!');
                window.location.href = '/index.html';
            }
        }
    } catch (e) {
        auth.logout();
    }
}

checkPermission();