// auth/sign-in/sign-in.js
document.addEventListener('DOMContentLoaded', () => {
    // Already logged in → go home
    if (getToken()) {
        window.location.href = '../../home/index.html';
        return;
    }
});

async function handleLogin(e) {
    e.preventDefault();

    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('password').value.trim();
    const btn = document.getElementById('loginBtn');

    if (!mobile || mobile.length < 10) return showToast('Enter valid 10-digit mobile', 'fa-triangle-exclamation');
    if (!password) return showToast('Enter your password', 'fa-triangle-exclamation');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in…';

    const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ mobile: '+91' + mobile, password }),
    });

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';

    if (!res || !res.success) {
        showToast(res?.message || 'Login failed. Try again.', 'fa-xmark');
        return;
    }

    saveAuth(res.token, res.user);
    showToast('Welcome back! 🎉', 'fa-circle-check');
    setTimeout(() => window.location.href = '/home/index.html', 700);
}

function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}