// auth/sign-up/sign-up.js
document.addEventListener('DOMContentLoaded', () => {
    // Already logged in → go home
    if (getToken()) {
        window.location.href = '../../home/index.html';
        return;
    }

    // Pre-fill referral code from URL ?ref=IKEAXXX
    const urlRef = new URLSearchParams(window.location.search).get('ref');
    if (urlRef) {
        const refWrap = document.getElementById('refWrap');
        const refInput = document.getElementById('referralCode');
        const refText = document.getElementById('refToggleText');
        if (refWrap) refWrap.style.display = 'flex';
        if (refInput) refInput.value = urlRef.toUpperCase();
        if (refText) refText.textContent = '(applied ✓)';
    }
});

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const referralCode = document.getElementById('referralCode')?.value.trim() || '';
    const btn = document.getElementById('registerBtn');

    // Validation
    if (!name || name.length < 2) return showToast('Enter your full name', 'fa-triangle-exclamation');
    if (!mobile || mobile.length < 10) return showToast('Enter valid 10-digit mobile', 'fa-triangle-exclamation');
    if (password.length < 6) return showToast('Password must be at least 6 characters', 'fa-triangle-exclamation');
    if (password !== confirmPass) return showToast("Passwords don't match", 'fa-triangle-exclamation');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account…';

    const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            name,
            mobile: '+91' + mobile,
            password,
            referralCode: referralCode || undefined,
        }),
    });

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';

    if (!res || !res.success) {
        showToast(res?.message || 'Registration failed. Try again.', 'fa-xmark');
        return;
    }

    saveAuth(res.token, res.user);
    showToast('Account created! Welcome 🎉', 'fa-circle-check');
    setTimeout(() => window.location.href = '../../home/index.html', 700);
}

/* ── Password strength checker ── */
function checkStrength(val) {
    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    if (!fill || !label) return;

    let strength = 0;
    if (val.length >= 6) strength++;
    if (val.length >= 10) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    const levels = [
        { w: '0%', color: 'transparent', text: '' },
        { w: '25%', color: '#DC2626', text: 'Weak' },
        { w: '50%', color: '#D97706', text: 'Fair' },
        { w: '75%', color: '#2563EB', text: 'Good' },
        { w: '100%', color: '#16A34A', text: 'Strong 💪' },
    ];

    const level = Math.min(strength, 4);
    fill.style.width = levels[level].w;
    fill.style.background = levels[level].color;
    label.textContent = levels[level].text;
    label.style.color = levels[level].color;
}

/* ── Toggle referral field ── */
function toggleRef() {
    const wrap = document.getElementById('refWrap');
    const text = document.getElementById('refToggleText');
    const open = wrap.style.display === 'none';
    wrap.style.display = open ? 'flex' : 'none';
    if (text) text.textContent = open ? '(tap to hide)' : '(tap to add)';
    if (open) document.getElementById('referralCode')?.focus();
}

/* ── Toggle password visibility ── */
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