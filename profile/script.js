/* ── MOCK DATA — replace with real API ── */
const USER = {
    name: 'Arjun Kumar',
    uid: 'IKEA-1042',
    mobile: '+91 98765 43210',
    balance: 12480.50,
    plans: 3,
    team: 8,
    earned: 4250,
};

/* ── INIT ── */
function init() {
    const initials = USER.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('avatarInitials').textContent = initials;
    document.getElementById('coverName').textContent = USER.name;
    document.getElementById('coverUid').textContent = USER.uid;
    document.getElementById('coverMobile').textContent = USER.mobile;
    document.getElementById('walletBalance').textContent = USER.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('qsPlans').textContent = USER.plans;
    document.getElementById('qsTeam').textContent = USER.team;
    document.getElementById('qsEarned').textContent = '₹' + USER.earned.toLocaleString('en-IN');
}

/* ── REFRESH WALLET ── */
function refreshWallet() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('spinning');
    setTimeout(() => {
        btn.classList.remove('spinning');
        // simulate updated balance
        const newBal = (USER.balance + Math.random() * 10).toFixed(2);
        document.getElementById('walletBalance').textContent = parseFloat(newBal).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        showToast('Balance refreshed!', 'fa-rotate-right');
    }, 800);
}

/* ── LOGOUT ── */
function logout() {
    showToast('Logging out…', 'fa-right-from-bracket');
    setTimeout(() => {
        // clear token and redirect
        localStorage.removeItem('token');
        window.location.href = '../auth/login.html';
    }, 1200);
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg, icon = 'fa-circle-check') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.querySelector('i').className = `fa-solid ${icon}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── BOOT ── */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);
    init();
});
