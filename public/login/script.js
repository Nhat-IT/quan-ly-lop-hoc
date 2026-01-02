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
        this.form.addEventListener('submit', (e) => { e.preventDefault(); this.handleSubmit(); });
        this.setupToggle();
        
        [this.usernameInput, this.passwordInput].forEach(inp => {
            inp.setAttribute('placeholder', ' ');
            inp.addEventListener('input', () => this.clearError(inp.id));
        });
    }
    
    setupToggle() {
        this.toggleBtn.addEventListener('click', () => {
            const isPass = this.passwordInput.type === 'password';
            this.passwordInput.type = isPass ? 'text' : 'password';
            this.toggleBtn.classList.toggle('toggle-visible', isPass);
        });
    }
    
    showError(fieldId, msg) {
        const field = document.getElementById(fieldId).closest('.organic-field');
        const err = document.getElementById(fieldId + 'Error');
        field.classList.add('error');
        err.innerText = msg;
        err.classList.add('show');
    }
    
    clearError(fieldId) {
        const field = document.getElementById(fieldId).closest('.organic-field');
        field.classList.remove('error');
        document.getElementById(fieldId + 'Error').classList.remove('show');
    }
    
    async handleSubmit() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        
        if(!username) return this.showError('username', 'Vui lòng nhập Tên đăng nhập');
        if(!password) return this.showError('password', 'Vui lòng nhập Mật khẩu');
        
        this.setLoading(true);
        
        try {
            // GỌI API BACKEND
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            
            if(!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');
            
            // THÀNH CÔNG
            // ... đoạn gọi API ...

            if(!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');
                        
            // --- ĐOẠN CẦN SỬA LẠI ---
            // Lưu thông tin user
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            // [MỚI] Lưu thời gian bắt đầu hoạt động
            localStorage.setItem('lastActivity', Date.now());

            this.showSuccess();

            // ...
            
        } catch (err) {
            this.showError('password', err.message);
            this.setLoading(false);
        }
    }
    
    setLoading(isLoading) {
        this.submitBtn.classList.toggle('loading', isLoading);
        this.submitBtn.disabled = isLoading;
    }
    
    showSuccess() {
        this.form.style.opacity = '0';
        setTimeout(() => {
            this.form.style.display = 'none';
            document.querySelector('.nurture-signup').style.display = 'none';
            document.getElementById('successMessage').classList.add('show');
        }, 300);
        
        setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    }
}
new LoginApp();