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
        const path = window.location.pathname; // Lấy đường dẫn hiện tại

        // Danh sách các trang công khai (không cần login)
        // Lưu ý: Dùng đường dẫn tuyệt đối hoặc từ khóa để kiểm tra
        const isPublicPage = path.includes('/login/login.html') || path.includes('/login/forgot-password.html');

        if (!user) {
            // Chưa đăng nhập -> Nếu không phải trang login thì đá về Login
            if (!isPublicPage) {
                window.location.href = '/login/login.html'; 
            }
        } else {
            // Đã đăng nhập -> Nếu cố vào trang Login thì đá về Index
            if (isPublicPage) {
                window.location.href = '/public/index.html';
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
        // [QUAN TRỌNG] Đường dẫn tuyệt đối về trang login
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
                window.location.href = '/index.html';
            }
        }
        // Chặn Teacher vào Admin
        if (user.role === 'teacher') {
            if (path.includes('quanly.html')) {
                alert('Bạn không có quyền truy cập!');
                window.location.href = '/index.html';
            }
        }
    } catch (e) {
        auth.logout();
    }
}

checkPermission();