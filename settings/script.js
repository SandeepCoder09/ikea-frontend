// settings/script.js
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
});

/* ════════════════════════════════════════════
   VIEW SWITCHER
════════════════════════════════════════════ */
let currentView = 'menuView';

function showView(viewId, title) {
    // Hide all views
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('passwordView').style.display = 'none';
    document.getElementById('pinView').style.display = 'none';

    // Show target
    document.getElementById(viewId).style.display = 'block';
    currentView = viewId;

    // Update nav title
    document.getElementById('navTitle').textContent = title || 'IKEA Settings';

    // Init captcha for the view
    if (viewId === 'passwordView') refreshCaptcha('pw');
    if (viewId === 'pinView') { refreshCaptcha('pin'); pinValue = ''; renderPinDots(); }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleBack() {
    if (currentView === 'menuView') {
        history.back();
    } else {
        // Go back to menu
        document.getElementById('passwordView').style.display = 'none';
        document.getElementById('pinView').style.display = 'none';
        document.getElementById('menuView').style.display = 'block';
        document.getElementById('navTitle').textContent = 'IKEA Settings';
        currentView = 'menuView';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* ════════════════════════════════════════════
   CAPTCHA ENGINE
════════════════════════════════════════════ */
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CAPTCHA_COLORS = ['#003087', '#DC2626', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#EA580C'];

let pwCaptchaAnswer = '';
let pinCaptchaAnswer = '';

function generateCaptcha() {
    let str = '';
    for (let i = 0; i < 6; i++) {
        str += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
    }
    return str;
}

function renderCaptcha(containerId, answer) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = answer.split('').map(ch => {
        const color = CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)];
        const rotate = (Math.random() * 24 - 12).toFixed(1);
        const size = (1.2 + Math.random() * 0.35).toFixed(2);
        const mt = (Math.random() * 8 - 4).toFixed(1);
        return `<span class="cap-char" style="color:${color};transform:rotate(${rotate}deg) translateY(${mt}px);font-size:${size}rem;display:inline-block">${ch}</span>`;
    }).join('');
}

function refreshCaptcha(type) {
    if (type === 'pw') {
        pwCaptchaAnswer = generateCaptcha();
        renderCaptcha('pwCaptchaDisplay', pwCaptchaAnswer);
        const inp = document.getElementById('pwCaptchaInput');
        if (inp) inp.value = '';
        spinBtn('pwRefreshBtn');
    } else {
        pinCaptchaAnswer = generateCaptcha();
        renderCaptcha('pinCaptchaDisplay', pinCaptchaAnswer);
        const inp = document.getElementById('pinCaptchaInput');
        if (inp) inp.value = '';
        spinBtn('pinRefreshBtn');
    }
}

function spinBtn(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.add('spin');
    setTimeout(() => btn.classList.remove('spin'), 500);
}

function verifyCaptcha(inputId, answer) {
    const val = (document.getElementById(inputId)?.value || '').trim().toUpperCase();
    return val === answer;
}

/* ════════════════════════════════════════════
   PASSWORD STRENGTH
════════════════════════════════════════════ */
function checkPasswordStrength(val) {
    const fill = document.getElementById('pwStrengthFill');
    const label = document.getElementById('pwStrengthLabel');
    if (!fill || !label) return;
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const levels = [
        { w: '0%', color: 'transparent', text: '', tc: '' },
        { w: '25%', color: '#DC2626', text: 'Weak', tc: '#DC2626' },
        { w: '50%', color: '#D97706', text: 'Fair', tc: '#D97706' },
        { w: '75%', color: '#2563EB', text: 'Good', tc: '#2563EB' },
        { w: '100%', color: '#16A34A', text: 'Strong 💪', tc: '#16A34A' },
    ];
    const l = levels[Math.min(score, 4)];
    fill.style.width = l.w;
    fill.style.background = l.color;
    label.textContent = l.text;
    label.style.color = l.tc;
}

/* ════════════════════════════════════════════
   EYE TOGGLE
════════════════════════════════════════════ */
function toggleEye(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

/* ════════════════════════════════════════════
   PIN NUMPAD
════════════════════════════════════════════ */
let pinValue = '';

function renderPinDots() {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('pinDot' + i);
        if (!dot) continue;
        dot.classList.remove('filled', 'active', 'error');
        if (i < pinValue.length) {
            dot.textContent = '●';
            dot.classList.add('filled');
        } else {
            dot.textContent = '—';
            if (i === pinValue.length) dot.classList.add('active');
        }
    }
}

function npPress(digit) {
    if (pinValue.length >= 4) return;
    pinValue += digit;
    renderPinDots();
}

function npDelete() {
    pinValue = pinValue.slice(0, -1);
    renderPinDots();
}

function shakePin() {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('pinDot' + i);
        dot?.classList.add('error');
        setTimeout(() => dot?.classList.remove('error', 'filled'), 700);
    }
    setTimeout(() => { pinValue = ''; renderPinDots(); }, 700);
}

/* ════════════════════════════════════════════
   UPDATE PASSWORD
════════════════════════════════════════════ */
async function updatePassword() {
    const current = document.getElementById('currentPassword').value.trim();
    const newPw = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const btn = document.getElementById('updatePasswordBtn');

    if (!current) return showToast('Enter current password', 'fa-triangle-exclamation');
    if (newPw.length < 6) return showToast('New password min 6 characters', 'fa-triangle-exclamation');
    if (newPw !== confirm) return showToast("Passwords don't match", 'fa-triangle-exclamation');

    if (!verifyCaptcha('pwCaptchaInput', pwCaptchaAnswer)) {
        document.getElementById('pwCaptchaInput').value = '';
        showToast('Incorrect captcha — try again', 'fa-shield-halved');
        refreshCaptcha('pw');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating…';

    const res = await apiFetch('/user/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    });

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Update Password';
    refreshCaptcha('pw');

    if (!res || !res.success) {
        showModal('error', 'Update Failed', res?.message || 'Could not update password.');
        return;
    }

    showModal('success', 'Password Updated! ✓',
        'Your password has been changed. You will be logged out now.',
        () => logout());
}

/* ════════════════════════════════════════════
   UPDATE PIN
════════════════════════════════════════════ */
async function updatePin() {
    const btn = document.getElementById('updatePinBtn');

    if (pinValue.length < 4) {
        shakePin();
        showToast('Enter a complete 4-digit PIN', 'fa-triangle-exclamation');
        return;
    }

    if (!verifyCaptcha('pinCaptchaInput', pinCaptchaAnswer)) {
        document.getElementById('pinCaptchaInput').value = '';
        showToast('Incorrect captcha — try again', 'fa-shield-halved');
        refreshCaptcha('pin');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating…';

    const res = await apiFetch('/wallet/set-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: pinValue }),
    });

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-grid-2"></i> Update PIN';
    refreshCaptcha('pin');
    pinValue = '';
    renderPinDots();

    if (!res || !res.success) {
        showModal('error', 'Update Failed', res?.message || 'Could not update PIN.');
        return;
    }

    showModal('success', 'PIN Updated! ✓',
        'Your withdrawal PIN has been updated successfully.');
}

/* ════════════════════════════════════════════
   LOGOUT
════════════════════════════════════════════ */
function confirmLogout() {
    showModal('warning', 'Logout?',
        'Are you sure you want to log out of your IKEA account?',
        () => logout(), 'Logout', 'Cancel');
}

/* ════════════════════════════════════════════
   MODAL
════════════════════════════════════════════ */
let modalCb = null;

function showModal(type, title, msg, cb = null, okLabel = 'OK', cancelLabel = null) {
    const icons = { success: 'fa-check', error: 'fa-xmark', warning: 'fa-triangle-exclamation' };
    document.getElementById('modalIcon').className = `modal-icon ${type}`;
    document.getElementById('modalIconSym').className = `fa-solid ${icons[type] || 'fa-info'}`;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMsg').textContent = msg;
    modalCb = cb;

    const btns = document.getElementById('modalBtns');
    btns.innerHTML = `<button class="modal-ok" onclick="closeModal()">${okLabel}</button>`;

    if (cancelLabel) {
        const cancel = document.createElement('button');
        cancel.className = 'modal-cancel';
        cancel.textContent = cancelLabel;
        cancel.onclick = () => {
            modalCb = null;
            document.getElementById('modal').classList.remove('show');
        };
        btns.appendChild(cancel);
    }

    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    if (typeof modalCb === 'function') {
        const cb = modalCb;
        modalCb = null;
        cb();
    }
}

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
let toastTimer;
function showToast(msg, icon = 'fa-circle-check') {
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toastMsg').textContent = msg;
    t.querySelector('i').className = `fa-solid ${icon}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}