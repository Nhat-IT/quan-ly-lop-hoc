class ForgotApp {
    constructor() {
        this.step1 = document.getElementById('formStep1');
        this.step2 = document.getElementById('formStep2');
        
        // Không còn danh sách cứng 'validUsers' nữa
        
        this.init();
    }
    
    init() {
        this.step1.addEventListener('submit', (e) => { e.preventDefault(); this.checkUser(); });
        this.step2.addEventListener('submit', (e) => { e.preventDefault(); this.changePass(); });
        
        document.querySelectorAll('input').forEach(i => i.setAttribute('placeholder', ' '));
    }
    
    // --- BƯỚC 1: GỌI API KIỂM TRA USER ---
    async checkUser() {
        const userInp = document.getElementById('username');
        const userVal = userInp.value.trim();
        const btn = document.getElementById('btnStep1');
        const err = document.getElementById('userError');
        
        if(!userVal) return this.showErr(userInp, err, 'Vui lòng nhập tên đăng nhập');
        
        this.loading(btn, true);

        try {
            // Gọi API Backend thật
            const res = await fetch('http://localhost:3000/api/auth/verify-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userVal })
            });

            const data = await res.json();

            if (res.ok && data.exists) {
                // Nếu User tồn tại -> Chuyển sang bước 2
                this.step1.style.display = 'none';
                this.step2.style.display = 'block';
                document.getElementById('pageTitle').innerText = "Thiết Lập Mật Khẩu";
                document.getElementById('pageDesc').innerText = "Nhập mật khẩu mới";
                
                // Lưu tạm username để dùng cho bước đổi pass
                this.currentUsername = userVal;
            } else {
                this.showErr(userInp, err, 'Tên đăng nhập không tồn tại trong hệ thống');
            }
        } catch (error) {
            this.showErr(userInp, err, 'Lỗi kết nối Server');
        } finally {
            this.loading(btn, false);
        }
    }
    
    // --- BƯỚC 2: GỌI API ĐỔI MẬT KHẨU ---
    async changePass() {
        const p1 = document.getElementById('newPass').value;
        const p2 = document.getElementById('confirmPass').value;
        const btn = document.getElementById('btnStep2');
        
        if(p1.length < 6) return this.showErr(document.getElementById('newPass'), document.getElementById('newPassError'), 'Mật khẩu > 6 ký tự');
        if(p1 !== p2) return this.showErr(document.getElementById('confirmPass'), document.getElementById('confirmPassError'), 'Mật khẩu không khớp');
        
        this.loading(btn, true);

        try {
            // Gọi API Backend thật
            const res = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.currentUsername, // Lấy username từ bước 1
                    newPassword: p1 
                })
            });

            if (res.ok) {
                this.step2.style.display = 'none';
                document.querySelector('.mindful-header').style.display = 'none';
                document.getElementById('resultMessage').classList.add('show');
                
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                alert('Có lỗi xảy ra khi đổi mật khẩu.');
            }
        } catch (error) {
            alert('Lỗi kết nối Server');
        } finally {
            this.loading(btn, false);
        }
    }
    
    showErr(inp, el, msg) {
        inp.closest('.organic-field').classList.add('error');
        el.innerText = msg;
        el.classList.add('show');
        setTimeout(() => {
             inp.closest('.organic-field').classList.remove('error');
             el.classList.remove('show');
        }, 2000);
    }
    
    loading(btn, isLoading) {
        btn.classList.toggle('loading', isLoading);
        btn.disabled = isLoading;
    }
}
new ForgotApp();