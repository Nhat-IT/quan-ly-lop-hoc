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
        const user = sessionStorage.getItem('user'); 
        const path = window.location.pathname; 

        const isPublicPage = path.includes('login.html') || path.includes('forgot-password.html');

        if (!user) {
            // Chưa đăng nhập -> Đá về Login
            if (!isPublicPage && path !== '/' && !path.endsWith('/')) { 
                // Fix lỗi redirect loop nếu đang ở root nhưng chưa login
                if (path.indexOf('.html') !== -1) {
                    window.location.replace('login.html');
                } else {
                     // Trường hợp vào root / mà chưa login, server thường tự serve index.html, 
                     // nên index.html sẽ tự check ở script init()
                }
            }
        } else {
            // Đã đăng nhập -> Đá về Index nếu cố vào Login
            if (isPublicPage) {
                window.location.replace('index.html');
            }
        }
    }

    // 2. LẮNG NGHE HÀNH ĐỘNG
    setupActivityListener() {
        const resetTimer = () => {
            sessionStorage.setItem('lastActivity', Date.now());
        };
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('scroll', resetTimer);
        // Set thời gian lần đầu
        if (!sessionStorage.getItem('lastActivity')) 
        {
            resetTimer();
        }
    }

    // 3. KIỂM TRA KHÔNG HOẠT ĐỘNG
    startInactivityCheck() {
        setInterval(() => {
            const lastActivity = parseInt(sessionStorage.getItem('lastActivity'));
            const now = Date.now();
            // Nếu quá thời gian và đang có user đăng nhập
            if (sessionStorage.getItem('user') && lastActivity && (now - lastActivity > INACTIVITY_LIMIT)) {
                this.logout("Hết phiên làm việc do không thao tác!");
            }
        }, 10000); // Check mỗi 10s
    }

    // 4. HÀM ĐĂNG XUẤT CHUNG
    logout(message = "") {
        sessionStorage.clear(); // Xóa sạch session
        localStorage.removeItem('user'); // Xóa cả local nếu lỡ có
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