/* ============================================================
      MOCK DATA  — replace with real API call
   ============================================================ */
const TODAY = new Date();

function daysAgo(n) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}
function formatDate(str) {
    const d = new Date(str);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* Each plan object:
   id, name, icon, tier, price, daily, validity,
   purchaseDate, daysElapsed, status (active|expired|pending),
   claimedToday, totalClaimed
*/
let MY_PLANS = [
    {
        id: 'p1', name: 'IKEA Plus Plan', icon: 'fa-bolt', tier: 'plus',
        price: 3000, daily: 600, validity: 10,
        purchaseDate: daysAgo(4), daysElapsed: 4,
        status: 'active', claimedToday: false, totalClaimed: 2400,
    },
    {
        id: 'p2', name: 'IKEA Basic Plan', icon: 'fa-box', tier: 'basic',
        price: 1000, daily: 180, validity: 10,
        purchaseDate: daysAgo(10), daysElapsed: 10,
        status: 'expired', claimedToday: false, totalClaimed: 1800,
    },
    {
        id: 'p3', name: 'IKEA Starter Plan', icon: 'fa-seedling', tier: 'starter',
        price: 500, daily: 80, validity: 10,
        purchaseDate: daysAgo(0), daysElapsed: 0,
        status: 'pending', claimedToday: false, totalClaimed: 0,
    },
    {
        id: 'p4', name: 'IKEA Pro Plan', icon: 'fa-star', tier: 'pro',
        price: 5000, daily: 1100, validity: 10,
        purchaseDate: daysAgo(7), daysElapsed: 7,
        status: 'active', claimedToday: true, totalClaimed: 7700,
    },
    {
        id: 'p5', name: 'IKEA Elite Plan', icon: 'fa-gem', tier: 'elite',
        price: 10000, daily: 2500, validity: 10,
        purchaseDate: daysAgo(2), daysElapsed: 2,
        status: 'active', claimedToday: false, totalClaimed: 5000,
    },
];

let currentTab = 'all';

/* ============================================================
   SUMMARY
============================================================ */
function updateSummary() {
    const totalInvested = MY_PLANS.reduce((s, p) => s + p.price, 0);
    const totalEarned = MY_PLANS.reduce((s, p) => s + p.totalClaimed, 0);
    const activePlans = MY_PLANS.filter(p => p.status === 'active').length;
    const claimableToday = MY_PLANS
        .filter(p => p.status === 'active' && !p.claimedToday)
        .reduce((s, p) => s + p.daily, 0);

    document.getElementById('sumTotalInvested').textContent = '₹' + totalInvested.toLocaleString('en-IN');
    document.getElementById('sumTotalEarned').textContent = '₹' + totalEarned.toLocaleString('en-IN');
    document.getElementById('sumActivePlans').textContent = activePlans;
    document.getElementById('sumPendingEarnings').textContent = '₹' + claimableToday.toLocaleString('en-IN');

    document.getElementById('tabCountAll').textContent = MY_PLANS.length;
    document.getElementById('tabCountActive').textContent = MY_PLANS.filter(p => p.status === 'active').length;
    document.getElementById('tabCountExpired').textContent = MY_PLANS.filter(p => p.status === 'expired').length;
    document.getElementById('tabCountPending').textContent = MY_PLANS.filter(p => p.status === 'pending').length;
}

/* ============================================================
   RENDER
============================================================ */
function renderPlans(tab) {
    const list = tab === 'all' ? MY_PLANS : MY_PLANS.filter(p => p.status === tab);
    const grid = document.getElementById('plansGrid');

    if (!list.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
            <h3>No Plans Found</h3>
            <p>You don't have any ${tab !== 'all' ? tab : ''} plans yet. Browse our investment plans and start earning!</p>
            <a href="../products/index.html" class="empty-cta">
              <i class="fa-solid fa-bag-shopping"></i> Buy a Plan
            </a>
          </div>`;
        return;
    }

    grid.innerHTML = list.map((p, i) => {
        const progressPct = Math.min(100, Math.round((p.daysElapsed / p.validity) * 100));
        const daysLeft = Math.max(0, p.validity - p.daysElapsed);
        const totalReturn = p.daily * p.validity;
        const pendingEarn = totalReturn - p.totalClaimed;
        const purchaseStr = formatDate(p.purchaseDate);
        const endDate = new Date(p.purchaseDate);
        endDate.setDate(endDate.getDate() + p.validity);
        const endStr = formatDate(endDate.toISOString().split('T')[0]);

        /* Claim section HTML */
        let claimHtml = '';
        if (p.status === 'active') {
            if (p.claimedToday) {
                claimHtml = `
              <div class="already-claimed">
                <i class="fa-solid fa-circle-check"></i>
                Today's earnings claimed! Come back tomorrow.
              </div>`;
            } else {
                claimHtml = `
              <div class="claim-available">
                <div class="claim-available-left">
                  <span class="claim-available-label">Available Today</span>
                  <span class="claim-available-amount">₹${p.daily.toLocaleString('en-IN')}</span>
                </div>
                <button class="claim-btn" onclick="claimEarnings('${p.id}')">
                  <i class="fa-solid fa-hand-holding-dollar"></i> Claim
                </button>
              </div>`;
            }
        } else if (p.status === 'expired') {
            claimHtml = `
            <div class="expired-msg">
              <i class="fa-solid fa-clock"></i>
              This plan has expired. Total earned: <strong>₹${p.totalClaimed.toLocaleString('en-IN')}</strong>
            </div>`;
        } else if (p.status === 'pending') {
            claimHtml = `
            <button class="claim-btn-full" disabled>
              <i class="fa-solid fa-hourglass-start"></i> Earnings Start Tomorrow
            </button>`;
        }

        return `
        <div class="my-plan-card status-${p.status}" style="animation-delay:${i * 0.07}s">
          <div class="plan-strip"></div>

          <div class="mpc-head">
            <div class="mpc-icon"><i class="fa-solid ${p.icon}"></i></div>
            <div class="mpc-info">
              <div class="mpc-name">${p.name}</div>
              <div class="mpc-date">Purchased: ${purchaseStr} · Ends: ${endStr}</div>
            </div>
            <div class="status-pill">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</div>
          </div>

          <div class="mpc-progress">
            <div class="progress-labels">
              <span class="left">Plan Progress</span>
              <span class="right">${progressPct}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${progressPct}%"></div>
            </div>
            <div class="days-remaining">
              <span class="days-text">${p.daysElapsed} of ${p.validity} days elapsed</span>
              <span class="days-num">${daysLeft} days left</span>
            </div>
          </div>

          <div class="mpc-earnings">
            <div class="earn-row">
              <div class="earn-row-left">
                <i class="fa-solid fa-tag"></i>
                <span class="earn-row-label">Plan Price</span>
              </div>
              <span class="earn-row-value">₹${p.price.toLocaleString('en-IN')}</span>
            </div>
            <div class="earn-row">
              <div class="earn-row-left">
                <i class="fa-solid fa-calendar-day"></i>
                <span class="earn-row-label">Daily Return</span>
              </div>
              <span class="earn-row-value green">₹${p.daily.toLocaleString('en-IN')}</span>
            </div>
            <div class="earn-row">
              <div class="earn-row-left">
                <i class="fa-solid fa-circle-check"></i>
                <span class="earn-row-label">Total Claimed</span>
              </div>
              <span class="earn-row-value yellow">₹${p.totalClaimed.toLocaleString('en-IN')}</span>
            </div>
            <div class="earn-row">
              <div class="earn-row-left">
                <i class="fa-solid fa-trophy"></i>
                <span class="earn-row-label">Total Return</span>
              </div>
              <span class="earn-row-value">₹${totalReturn.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="mpc-claim">
            ${claimHtml}
          </div>
        </div>`;
    }).join('');
}

/* ============================================================
   CLAIM EARNINGS
============================================================ */
function claimEarnings(planId) {
    const plan = MY_PLANS.find(p => p.id === planId);
    if (!plan || plan.claimedToday) return;

    document.getElementById('loadingScreen').classList.add('show');

    setTimeout(() => {
        document.getElementById('loadingScreen').classList.remove('show');

        // Update plan state
        plan.claimedToday = true;
        plan.totalClaimed += plan.daily;

        updateSummary();
        renderPlans(currentTab);

        showActionModal(
            'success',
            'Earnings Claimed! 🎉',
            `<strong>₹${plan.daily.toLocaleString('en-IN')}</strong> has been successfully credited to your wallet from <strong>${plan.name}</strong>.<br><br>Come back tomorrow to claim again!`,
            'Awesome!'
        );
    }, 2000);
}

/* ============================================================
   TABS
============================================================ */
function switchTab(tab, el) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderPlans(tab);
}

/* ============================================================
   ACTION MODAL
============================================================ */
function showActionModal(type, title, msg, btnLabel = 'OK') {
    const iconEl = document.getElementById('actionIcon');
    const iconSymEl = document.getElementById('actionIconSymbol');
    document.getElementById('actionTitle').textContent = title;
    document.getElementById('actionMessage').innerHTML = msg;
    document.getElementById('actionOkBtn').textContent = btnLabel;
    iconEl.className = `action-icon ${type}`;
    iconSymEl.className = type === 'success' ? 'fa-solid fa-check'
        : type === 'error' ? 'fa-solid fa-xmark'
            : type === 'info' ? 'fa-solid fa-info'
                : 'fa-solid fa-triangle-exclamation';
    document.getElementById('actionModal').classList.add('show');
}
function closeActionModal() {
    document.getElementById('actionModal').classList.remove('show');
}
document.getElementById('actionModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('actionModal')) closeActionModal();
});

/* ============================================================
   TOAST
============================================================ */
let toastTimer;
function showToast(msg, icon = 'fa-circle-check') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.querySelector('i').className = `fa-solid ${icon}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ============================================================
   INIT
============================================================ */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);
    updateSummary();
    renderPlans('all');
});