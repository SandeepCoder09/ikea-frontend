// products/my-products.js
document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);
  await loadMyPlans();
});

let myPlans = [];
let currentTab = 'all';

async function loadMyPlans() {
  const res = await apiFetch('/products/my-plans/list');
  if (!res || !res.success) return showToast('Failed to load plans', 'fa-xmark');
  myPlans = res.plans;
  updateSummary();
  renderPlans('all');
}

function updateSummary() {
  const totalInvested = myPlans.reduce((s, p) => s + p.purchasePrice, 0);
  const totalEarned = myPlans.reduce((s, p) => s + p.totalClaimed, 0);
  const activePlans = myPlans.filter(p => p.status === 'active').length;
  const claimableToday = myPlans
    .filter(p => p.status === 'active' && !p.claimedToday)
    .reduce((s, p) => s + p.daily, 0);

  document.getElementById('sumTotalInvested').textContent = formatINR(totalInvested);
  document.getElementById('sumTotalEarned').textContent = formatINR(totalEarned);
  document.getElementById('sumActivePlans').textContent = activePlans;
  document.getElementById('sumPendingEarnings').textContent = formatINR(claimableToday);

  document.getElementById('tabCountAll').textContent = myPlans.length;
  document.getElementById('tabCountActive').textContent = myPlans.filter(p => p.status === 'active').length;
  document.getElementById('tabCountExpired').textContent = myPlans.filter(p => p.status === 'expired').length;
  document.getElementById('tabCountPending').textContent = myPlans.filter(p => p.status === 'pending').length;
}

function switchTab(tab, el) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderPlans(tab);
}

function renderPlans(tab) {
  const list = tab === 'all' ? myPlans : myPlans.filter(p => p.status === tab);
  const grid = document.getElementById('plansGrid');

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
        <h3>No Plans Found</h3>
        <p>You don't have any ${tab !== 'all' ? tab : ''} plans yet.</p>
        <a href="../products/index.html" class="empty-cta">
          <i class="fa-solid fa-bag-shopping"></i> Buy a Plan
        </a>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => {
    const progressPct = p.progress || 0;
    const daysLeft = p.daysRemaining || 0;
    const daysElapsed = p.daysElapsed || 0;
    const totalReturn = p.daily * p.validity;
    const productName = p.product?.name || 'Plan';
    const icon = p.product ? (p.product.icon || 'fa-box') : 'fa-box';
    const purchDate = formatDate(p.createdAt);
    const endDate = formatDate(p.endDate);

    let claimHtml = '';
    if (p.status === 'active') {
      if (p.claimedToday) {
        claimHtml = `<div class="already-claimed">
          <i class="fa-solid fa-circle-check"></i>
          Today's earnings claimed! Come back tomorrow.</div>`;
      } else {
        claimHtml = `
          <div class="claim-available">
            <div class="claim-available-left">
              <span class="claim-available-label">Available Today</span>
              <span class="claim-available-amount">${formatINR(p.daily)}</span>
            </div>
            <button class="claim-btn" onclick="claimEarnings('${p._id}')">
              <i class="fa-solid fa-hand-holding-dollar"></i> Claim
            </button>
          </div>`;
      }
    } else if (p.status === 'expired') {
      claimHtml = `<div class="expired-msg">
        <i class="fa-solid fa-clock"></i>
        Expired. Total earned: <strong>${formatINR(p.totalClaimed)}</strong>
      </div>`;
    } else {
      claimHtml = `<button class="claim-btn-full" disabled>
        <i class="fa-solid fa-hourglass-start"></i> Earnings Start Tomorrow
      </button>`;
    }

    return `
    <div class="my-plan-card status-${p.status}" style="animation-delay:${i * .07}s">
      <div class="plan-strip"></div>
      <div class="mpc-head">
        <div class="mpc-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="mpc-info">
          <div class="mpc-name">${productName}</div>
          <div class="mpc-date">Purchased: ${purchDate} · Ends: ${endDate}</div>
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
          <span class="days-text">${daysElapsed} of ${p.validity} days elapsed</span>
          <span class="days-num">${daysLeft} days left</span>
        </div>
      </div>
      <div class="mpc-earnings">
        <div class="earn-row">
          <div class="earn-row-left"><i class="fa-solid fa-tag"></i><span class="earn-row-label">Plan Price</span></div>
          <span class="earn-row-value">${formatINR(p.purchasePrice)}</span>
        </div>
        <div class="earn-row">
          <div class="earn-row-left"><i class="fa-solid fa-calendar-day"></i><span class="earn-row-label">Daily Return</span></div>
          <span class="earn-row-value green">${formatINR(p.daily)}</span>
        </div>
        <div class="earn-row">
          <div class="earn-row-left"><i class="fa-solid fa-circle-check"></i><span class="earn-row-label">Total Claimed</span></div>
          <span class="earn-row-value yellow">${formatINR(p.totalClaimed)}</span>
        </div>
        <div class="earn-row">
          <div class="earn-row-left"><i class="fa-solid fa-trophy"></i><span class="earn-row-label">Total Return</span></div>
          <span class="earn-row-value">${formatINR(totalReturn)}</span>
        </div>
      </div>
      <div class="mpc-claim">${claimHtml}</div>
    </div>`;
  }).join('');
}

async function claimEarnings(planId) {
  document.getElementById('loadingScreen').classList.add('show');

  const res = await apiFetch(`/products/claim/${planId}`, { method: 'POST' });
  document.getElementById('loadingScreen').classList.remove('show');

  if (!res || !res.success) return showToast(res?.message || 'Claim failed', 'fa-xmark');

  // Update local plan state
  const plan = myPlans.find(p => p._id === planId);
  if (plan) { plan.claimedToday = true; plan.totalClaimed += plan.daily; }

  updateSummary();
  renderPlans(currentTab);
  showActionModal('success', 'Earnings Claimed! 🎉',
    `<strong>${formatINR(res.credited)}</strong> has been credited to your wallet!<br>Come back tomorrow to claim again.`,
    'Awesome!');
}

function showActionModal(type, title, msg, btnLabel = 'OK') {
  const icons = { success: 'fa-check', error: 'fa-xmark' };
  document.getElementById('actionModal').classList.add('show');
  document.getElementById('actionIcon').className = `action-icon ${type}`;
  document.getElementById('actionIconSymbol').className = `fa-solid ${icons[type] || 'fa-info'}`;
  document.getElementById('actionTitle').textContent = title;
  document.getElementById('actionMessage').innerHTML = msg;
  document.getElementById('actionOkBtn').textContent = btnLabel;
}
function closeActionModal() { document.getElementById('actionModal').classList.remove('show'); }