// shared/js/config.js

const hostname = window.location.hostname;

// Dynamically check for localhost AND all local network IPs (10., 172., 192.)
const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname.startsWith("192.");

// Dynamically use the current IP, just switch the port to 3000
const localBackendUrl = `http://${hostname}:3000`;

const CONFIG = {
    BASE_URL: isLocal
        ? localBackendUrl
        : "https://ikea-backend-3k8y.onrender.com",

    API: isLocal
        ? `${localBackendUrl}/api`
        : "https://ikea-backend-3k8y.onrender.com/api",
};

// Alias
const API_URL = CONFIG.API;
const SITE_ROOT = window.location.origin;

/* ... keep the rest of your config.js exactly the same below this ... */

/* ════════════════════════════════════════════
   2. SESSION HELPERS
════════════════════════════════════════════ */

// Get stored JWT token
function getToken() {
    return localStorage.getItem('ikea_token') || null;
}

// Get stored user object
function getUser() {
    try {
        const u = localStorage.getItem('ikea_user');
        return u ? JSON.parse(u) : null;
    } catch (e) {
        console.error('User parse error', e);
        return null;
    }
}

// Save token + user after login/register
function saveAuth(token, user) {
    localStorage.setItem('ikea_token', token);
    localStorage.setItem('ikea_user', JSON.stringify(user));
}

// Clear session
function clearAuth() {
    localStorage.removeItem('ikea_token');
    localStorage.removeItem('ikea_user');
}

// Logout — clear and redirect to sign in
function logout() {
    clearAuth();
    window.location.href = SITE_ROOT + '/auth/sign-in/sign-in.html';
}

/* ════════════════════════════════════════════
   3. ROUTE PROTECTION
════════════════════════════════════════════ */
function requireAuth() {
    const path = window.location.pathname;
    // Skip redirect if already on auth pages
    if (path.includes('/auth/')) return;
    if (!getToken()) {
        window.location.href = SITE_ROOT + '/auth/sign-in/sign-in.html';
    }
}

/* ════════════════════════════════════════════
   4. API FETCH WRAPPER
   — Smart 401 handler: only logs out for real
     token expiry, NOT for wrong PIN errors
════════════════════════════════════════════ */
async function apiFetch(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    try {
        const response = await fetch(`${CONFIG.API}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        // 401 handling — smart: don't logout for PIN errors
        if (response.status === 401) {
            const msg = (data?.message || '').toLowerCase();

            // PIN-related 401 — return the error, do NOT logout
            if (
                msg.includes('pin') ||
                msg.includes('incorrect') ||
                msg.includes('wrong') ||
                endpoint.includes('withdraw')
            ) {
                return data;
            }

            // Real token expiry — logout
            clearAuth();
            window.location.href = SITE_ROOT + '/auth/sign-in/sign-in.html';
            return;
        }

        return data;

    } catch (err) {
        console.error('❌ API Error:', err);
        return { success: false, message: 'Network error. Please check your connection.' };
    }
}

/* ════════════════════════════════════════════
   5. FORMATTERS
════════════════════════════════════════════ */

// Format INR currency — ₹1,23,456.00
function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// Format date — "21 Mar 2026" or "21 Mar 2026, 10:30 pm"
function formatDate(dateString, withTime = false) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const opts = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
    };
    return new Intl.DateTimeFormat('en-IN', opts).format(date);
}

/* ════════════════════════════════════════════
   6. TOAST NOTIFICATION
════════════════════════════════════════════ */
let _toastTimer = null;

function showToast(message, iconClass = 'fa-circle-check', duration = 2500) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    const iconEl = toast?.querySelector('i');

    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    if (iconEl) iconEl.className = `fa-solid ${iconClass}`;

    toast.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}