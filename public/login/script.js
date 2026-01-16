class LoginApp {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.toggleBtn = document.getElementById('passwordToggle');
        this.submitBtn = this.form.querySelector('.harmony-button');
        
        this.init();
    }
    
    init() {
        // Kiểm tra lần 2 (Fallback nếu script trên head chưa chạy kịp - hiếm khi xảy ra)
        const user = localStorage.getItem('user');
        if (user) {
            window.location.replace('index.html');
            return;
        }

        if(this.form) {
            this.form.addEventListener('submit', (e) => { e.preventDefault(); this.handleSubmit(); });
        }
        if(this.toggleBtn) this.setupToggle();
        
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername && this.usernameInput) {
            this.usernameInput.value = rememberedUsername;
            const rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
        
        if(this.usernameInput) {
            [this.usernameInput, this.passwordInput].forEach(inp => {
                if(inp) {
                    inp.setAttribute('placeholder', ' ');
                    inp.addEventListener('input', () => this.clearError(inp.id));
                }
            });
        }
    }

    setupToggle() {
        this.toggleBtn.addEventListener('click', () => {
            const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            this.passwordInput.setAttribute('type', type);
            
            // Toggle icon SVG
            const openEye = this.toggleBtn.querySelector('.eye-open');
            const closedEye = this.toggleBtn.querySelector('.eye-closed');
            if (type === 'text') {
                openEye.style.display = 'none';
                closedEye.style.display = 'block';
            } else {
                openEye.style.display = 'block';
                closedEye.style.display = 'none';
            }
        });
    }

    async handleSubmit() {
        this.setLoading(true);
        const username = this.usernameInput.value;
        const password = this.passwordInput.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            
            if(!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');
            
            // Lưu thông tin User
            localStorage.setItem('user', JSON.stringify(data.user)); 
            
            // [QUAN TRỌNG] Xóa cache trang trước đó nếu có
            sessionStorage.clear();

            const rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            this.showSuccess();
            
        } catch (err) {
            this.showError('password', err.message); // Hiển thị lỗi chung ở password hoặc alert
            if(!document.querySelector('.input-error-message')) alert(err.message);
            this.setLoading(false);
        }
    }
    
    setLoading(isLoading) {
        this.submitBtn.classList.toggle('loading', isLoading);
        this.submitBtn.disabled = isLoading;
        const btnText = this.submitBtn.querySelector('.button-text');
        if(btnText) btnText.textContent = isLoading ? 'Đang xử lý...' : 'Đăng Nhập';
    }
    
    showSuccess() {
        this.form.style.opacity = '0';
        setTimeout(() => {
            this.form.style.display = 'none';
            const signupLink = document.querySelector('.nurture-signup');
            if(signupLink) signupLink.style.display = 'none';
            
            const successMsg = document.getElementById('successMessage');
            if(successMsg) {
                successMsg.style.display = 'flex'; // Đảm bảo hiển thị flex để căn giữa
                // Trigger animation (nếu có CSS animation)
            }
        }, 300);
        
        // [QUAN TRỌNG] Dùng replace thay vì href để xóa lịch sử Login, và trỏ thẳng về index.html
        setTimeout(() => { 
            window.location.replace('index.html'); 
        }, 1500);
    }

    showError(fieldId, message) {
        // Hàm hiển thị lỗi đơn giản (bạn có thể tùy biến thêm CSS cho đẹp)
        const field = document.getElementById(fieldId);
        field.parentElement.classList.add('error');
        // Rung nhẹ input
        field.parentElement.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
    }

    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        field.parentElement.classList.remove('error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LoginApp();
});