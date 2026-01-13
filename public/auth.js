// CẤU HÌNH THỜI GIAN
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

        // Kiểm tra xem có đang ở trang public không
        const isPublicPage = path.includes('/login/login.html') || path.includes('/login/forgot-password.html');

        if (!user) {
            // Chưa đăng nhập -> Đá về Login (nếu không phải đang ở đó)
            if (!isPublicPage) {
                // [QUAN TRỌNG] Thêm dấu / ở đầu
                window.location.href = '/login/login.html'; 
            }
        } else {
            // Đã đăng nhập -> Đá về Index (nếu cố vào trang Login)
            if (isPublicPage) {
                // [QUAN TRỌNG] Thêm dấu / ở đầu
                window.location.href = '/index.html';
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

   // 4. HÀM ĐĂNG XUẤT
    logout(message = "") {
        localStorage.removeItem('user'); 
        localStorage.removeItem('lastActivity');
        if (message) alert(message);
        // [QUAN TRỌNG] Thêm dấu / ở đầu
        window.location.href = '/login/login.html';
    }
}

const auth = new AuthGuard();

function performLogout() {
    auth.logout();
}

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
                // [QUAN TRỌNG] Thêm dấu / ở đầu
                window.location.href = '/index.html';
            }
        }
        // Chặn Teacher vào Admin
        if (user.role === 'teacher') {
            if (path.includes('quanly.html')) {
                alert('Bạn không có quyền truy cập!');
                // [QUAN TRỌNG] Thêm dấu / ở đầu
                window.location.href = '/index.html';
            }
        }
    } catch (e) {
        auth.logout();
    }
}

checkPermission();