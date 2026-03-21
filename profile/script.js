// profile/script.js
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) settingsBtn.onclick = () => window.location.href = '../settings/index.html';

    await loadProfile();
});

/* ════════════════════════════════════════
   LOAD ALL PROFILE DATA
════════════════════════════════════════ */
async function loadProfile() {
    // Fire all requests in parallel for speed
    const [profileRes, balRes, teamRes, plansRes] = await Promise.all([
        apiFetch('/user/profile'),
        apiFetch('/wallet/balance'),
        apiFetch('/referrals/team'),
        apiFetch('/products/my-plans/list'),
    ]);

    /* ── User info ── */
    if (profileRes?.success) {
        const user = profileRes.user;
        localStorage.setItem('ikea_user', JSON.stringify(user));

        // Avatar initials (shown when image fails to load)
        const initials = (user.name || 'IK')
            .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const initEl = document.getElementById('avatarInitials');
        if (initEl) {
            initEl.textContent = initials;
            initEl.style.display = 'flex';
        }

        setText('coverName', user.name || 'Member');
        setText('coverUid', user.uid || '—');
        setText('coverMobile', user.mobile || '—');
        setText('qsEarned', formatINR(user.totalEarned || 0));
    }

    /* ── Wallet balance ── */
    if (balRes?.success) {
        setText('walletBalance',
            Number(balRes.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        );
    }

    /* ── Active plans count ── */
    if (plansRes?.success) {
        const active = (plansRes.plans || []).filter(p => p.status === 'active').length;
        setText('qsPlans', active);
    }

    /* ── Team member count ── */
    if (teamRes?.success) {
        setText('qsTeam', teamRes.summary?.totalMembers || 0);
    }
}

/* ════════════════════════════════════════
   REFRESH WALLET BALANCE
════════════════════════════════════════ */
async function refreshWallet() {
    const btn = document.getElementById('refreshBtn');
    const icon = btn?.querySelector('i');
    if (!btn || btn.dataset.loading === 'true') return;

    btn.dataset.loading = 'true';

    // Force spin by replacing the element's style directly
    if (icon) {
        icon.style.transition = 'none';
        icon.style.animation = 'none';
        void icon.offsetHeight; // force reflow
        icon.style.animation = 'spin360 0.7s linear infinite';
    }

    const [res] = await Promise.all([
        apiFetch('/wallet/balance'),
        new Promise(r => setTimeout(r, 800)),
    ]);

    // Stop spin
    if (icon) icon.style.animation = 'none';
    btn.dataset.loading = 'false';

    if (res?.success) {
        setText('walletBalance',
            Number(res.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        );
        showToast('Balance refreshed! ✓', 'fa-rotate-right');
    } else {
        showToast('Could not refresh', 'fa-triangle-exclamation');
    }
}

/* ════════════════════════════════════════
   LOGOUT
════════════════════════════════════════ */
function logout() {
    showToast('Logging out…', 'fa-right-from-bracket');
    setTimeout(() => {
        clearAuth();
        window.location.href = '../auth/sign-in/sign-in.html';
    }, 900);
}

/* ── Helper ── */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}