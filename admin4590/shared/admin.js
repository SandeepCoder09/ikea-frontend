// admin4590/shared/admin.js
// ─── IKEA Admin Panel — Shared Config ───────────────────────

const hostname = window.location.hostname;

const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname.startsWith("192.");

const ADMIN_API = isLocal
    ? `http://${hostname}:5001/api`
    : 'https://ikea-backend-3k8y.onrender.com/api';

/* ════════════════════════════════════
   AUTH
════════════════════════════════════ */
function getAdminToken() { return localStorage.getItem('ikea_admin_token'); }
function getAdminUser() {
    try {
        return JSON.parse(localStorage.getItem('ikea_admin_user'));
    } catch {
        return null;
    }
}
function saveAdminAuth(token, user) {
    localStorage.setItem('ikea_admin_token', token);
    localStorage.setItem('ikea_admin_user', JSON.stringify(user));
}
function clearAdminAuth() {
    localStorage.removeItem('ikea_admin_token');
    localStorage.removeItem('ikea_admin_user');
}

function requireAdmin() {
    if (!getAdminToken()) {
        window.location.href = '../login/login.html';
    }
}

function adminLogout() {
    clearAdminAuth();
    window.location.href = '../login/login.html';
}

/* ════════════════════════════════════
   API FETCH
════════════════════════════════════ */
async function adminFetch(endpoint, options = {}) {
    const token = getAdminToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    try {
        const res = await fetch(`${ADMIN_API}${endpoint}`, {
            ...options,
            headers
        });

        const data = await res.json();

        if (res.status === 401 || res.status === 403) {
            clearAdminAuth();
            window.location.href = '../login/login.html';
            return;
        }

        return data;
    } catch (err) {
        console.error('Admin API Error:', err);
        return { success: false, message: 'Network error.' };
    }
}

/* ════════════════════════════════════
   THEME
════════════════════════════════════ */
function initTheme() {
    const saved = localStorage.getItem('ikea_admin_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ikea_admin_theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = theme === 'dark'
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    }
}

/* ════════════════════════════════════
   SIDEBAR
════════════════════════════════════ */
function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    toggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('show');
    });

    overlay?.addEventListener('click', () => {
        sidebar?.classList.remove('open');
        overlay?.classList.remove('show');
    });

    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href') || item.dataset.page;
        if (href && path.includes(href)) item.classList.add('active');
    });

    const user = getAdminUser();
    const nameEl = document.getElementById('adminName');
    if (nameEl && user) nameEl.textContent = user.name || 'Admin';
}

/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
let _toastTimer;
function showAdminToast(msg, type = 'info') {
    const toast = document.getElementById('adminToast');
    if (!toast) return;

    const icons = {
        success: 'fa-check',
        error: 'fa-xmark',
        info: 'fa-circle-info',
        warning: 'fa-triangle-exclamation'
    };

    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
    <div class="toast-icon"><i class="fa-solid ${icons[type] || 'fa-circle-info'}"></i></div>
    <span>${msg}</span>`;

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ════════════════════════════════════
   FORMATTERS
════════════════════════════════════ */
function fmtINR(n) {
    return '₹' + Number(n || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}
function fmtDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}
function fmtNum(n) {
    return Number(n || 0).toLocaleString('en-IN');
}

/* ════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════ */
function openModal(id) {
    document.getElementById(id)?.classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    document.getElementById(id)?.classList.remove('show');
    document.body.style.overflow = '';
}

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
    }
});

/* ════════════════════════════════════
   CONFIRM DIALOG
════════════════════════════════════ */
function adminConfirm(msg, cb) {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
        if (confirm(msg)) cb();
        return;
    }

    document.getElementById('confirmMsg').textContent = msg;
    document.getElementById('confirmOkBtn').onclick = () => {
        closeModal('confirmModal');
        cb();
    };
    openModal('confirmModal');
}

/* ── INIT on every admin page ── */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
});