// profile/script.js
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);

    // Load user profile data
    await loadProfile();

    // Initialize the Daily Check-in Modal logic
    initCheckIn();
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

        // Safety check for backend lastCheckIn sync
        syncCheckInWithBackend(user.lastCheckIn);
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
   DAILY CHECK-IN GAMIFICATION
════════════════════════════════════════ */
function initCheckIn() {
    const navCheckInBtn = document.getElementById('navCheckInBtn');
    const checkInModal = document.getElementById('checkInModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const calendarGrid = document.getElementById('calendarGrid');
    const claimRewardBtn = document.getElementById('claimRewardBtn');
    const streakCountEl = document.getElementById('streakCount');

    if (!navCheckInBtn || !checkInModal) return;

    const today = new Date();
    const todayStr = getLocalString(today);
    let claimedDates = JSON.parse(localStorage.getItem('ikea_claimed_dates')) || [];

    // --- Modal Open/Close ---
    navCheckInBtn.addEventListener('click', () => {
        renderCalendar();
        checkInModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        checkInModal.classList.add('hidden');
    });

    // --- Render the 7-Day Calendar ---
    function renderCalendar() {
        calendarGrid.innerHTML = '';

        const currentDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDayOfWeek);

        let streak = 0;
        let isTodayClaimed = claimedDates.includes(todayStr);
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);

            const dateStr = getLocalString(d);
            const isToday = dateStr === todayStr;
            const isChecked = claimedDates.includes(dateStr);

            if (isChecked) streak++;

            const dayDiv = document.createElement('div');
            dayDiv.className = `cal-day ${isToday ? 'today' : ''} ${isChecked ? 'checked' : ''}`;

            let circleContent = d.getDate();
            if (isChecked) circleContent = '<i class="fa-solid fa-check"></i>';
            else if (isToday) circleContent = '₹1';

            dayDiv.innerHTML = `<div class="cal-circle">${circleContent}</div><span>${daysOfWeek[i]}</span>`;
            calendarGrid.appendChild(dayDiv);
        }

        if (streakCountEl) streakCountEl.innerText = streak;

        if (isTodayClaimed) {
            claimRewardBtn.disabled = true;
            claimRewardBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Claimed for Today';
        } else {
            claimRewardBtn.disabled = false;
            claimRewardBtn.innerHTML = 'Claim ₹1 for Today';
        }
    }

    // --- Handle Claim Click (API Call) ---
    claimRewardBtn.addEventListener('click', async () => {
        claimRewardBtn.disabled = true;
        claimRewardBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Claiming...';

        try {
            // Call Backend to add money
            const res = await apiFetch('/wallet/daily-checkin', { method: 'POST' });

            if (res && res.success) {
                // Success: Add today to claimed array
                claimedDates.push(todayStr);
                localStorage.setItem('ikea_claimed_dates', JSON.stringify(claimedDates));

                showToast('₹1 added to your wallet! 🎉', 'fa-coins');

                // Instantly update the wallet balance on the screen
                if (res.newBalance !== undefined) {
                    setText('walletBalance', Number(res.newBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 }));
                }

                renderCalendar(); // Re-render to show checkmark
            } else {
                // Backend says already claimed or failed
                showToast(res?.message || 'Already checked in today!', 'fa-circle-exclamation');
                claimRewardBtn.innerHTML = 'Claimed for Today';
            }
        } catch (error) {
            console.error(error);
            claimRewardBtn.disabled = false;
            claimRewardBtn.innerHTML = 'Claim ₹1 for Today';
            showToast('Network error. Try again.', 'fa-xmark');
        }
    });

    // Helper: format Date to YYYY-MM-DD local time
    function getLocalString(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
}

// Ensure local UI stays synced if the user logged in from another device and claimed
function syncCheckInWithBackend(lastCheckInDate) {
    if (!lastCheckInDate) return;

    const backendDate = new Date(lastCheckInDate);
    const dateStr = backendDate.getFullYear() + '-' + String(backendDate.getMonth() + 1).padStart(2, '0') + '-' + String(backendDate.getDate()).padStart(2, '0');

    let claimedDates = JSON.parse(localStorage.getItem('ikea_claimed_dates')) || [];
    if (!claimedDates.includes(dateStr)) {
        claimedDates.push(dateStr);
        localStorage.setItem('ikea_claimed_dates', JSON.stringify(claimedDates));
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

    // Force spin
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