/**
 * EnvLaw Hub 로그인/회원가입 모달 로직
 */
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const closeBtn = document.querySelector('.close-btn');
    const toSignup = document.getElementById('toSignup');
    const toLogin = document.getElementById('toLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // 로그인 모달 열기
    if (loginBtn) {
        loginBtn.onclick = () => {
            authModal.style.display = 'block';
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        };
    }

    // 회원가입 모달 열기
    if (signupBtn) {
        signupBtn.onclick = () => {
            authModal.style.display = 'block';
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        };
    }

    // 모달 닫기
    if (closeBtn) {
        closeBtn.onclick = () => {
            authModal.style.display = 'none';
        };
    }

    // 모달 바깥 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // 폼 전환 (로그인 <-> 회원가입)
    if (toSignup) {
        toSignup.onclick = () => {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        };
    }

    if (toLogin) {
        toLogin.onclick = () => {
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        };
    }
});