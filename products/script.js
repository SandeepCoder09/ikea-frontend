/* ============================================================
       PLANS DATA
    ============================================================ */
const PLANS = [
    {
        id: 1,
        name: 'IKEA Starter Plan',
        tag: 'Starter',
        tier: 'starter',
        icon: 'fa-seedling',
        price: 500,
        daily: 80,
        validity: 10,
        group: 'starter',
        popular: false,
    },
    {
        id: 2,
        name: 'IKEA Basic Plan',
        tag: 'Best for Beginners',
        tier: 'basic',
        icon: 'fa-box',
        price: 1000,
        daily: 180,
        validity: 10,
        group: 'starter',
        popular: false,
    },
    {
        id: 3,
        name: 'IKEA Plus Plan',
        tag: 'Most Popular',
        tier: 'plus',
        icon: 'fa-bolt',
        price: 3000,
        daily: 600,
        validity: 10,
        group: 'mid',
        popular: true,
    },
    {
        id: 4,
        name: 'IKEA Pro Plan',
        tag: 'High Returns',
        tier: 'pro',
        icon: 'fa-star',
        price: 5000,
        daily: 1100,
        validity: 10,
        group: 'mid',
        popular: false,
    },
    {
        id: 5,
        name: 'IKEA Elite Plan',
        tag: 'Maximum Growth',
        tier: 'elite',
        icon: 'fa-gem',
        price: 10000,
        daily: 2500,
        validity: 10,
        group: 'premium',
        popular: false,
    },
    {
        id: 6,
        name: 'IKEA Premium Plan',
        tag: 'Ultimate Exclusive',
        tier: 'premium',
        icon: 'fa-crown',
        price: 20000,
        daily: 6000,
        validity: 10,
        group: 'premium',
        popular: false,
    },
];

let selectedPlan = null;

/* ============================================================
   RENDER PLANS
============================================================ */
function renderPlans(list) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = list.map((p, i) => {
        const total = p.daily * p.validity;
        const profit = total - p.price;
        const roi = ((profit / p.price) * 100).toFixed(0);
        const isPremium = p.tier === 'premium';

        const btnClass = isPremium ? 'buy-btn-white' : (p.popular ? 'buy-btn-blue' : 'buy-btn-yellow');

        return `
        <div class="plan-card tier-${p.tier} ${p.popular ? 'featured' : ''}"
             style="animation-delay:${i * 0.08}s">
          ${p.popular ? '<div class="popular-ribbon">⭐ Most Popular</div>' : ''}
          <div class="card-strip"></div>

          <div class="card-header">
            <div class="card-icon"><i class="fa-solid ${p.icon}"></i></div>
            <div class="card-title-wrap">
              <div class="card-plan-name">${p.name}</div>
              <div class="card-plan-tag">${p.tag}</div>
            </div>
          </div>

          <div class="card-price-row">
            <span class="price-main">₹${p.price.toLocaleString('en-IN')}</span>
            <span class="price-label">one-time</span>
          </div>

          <div class="card-stats">
            <div class="stat-row">
              <div class="stat-row-left">
                <i class="fa-solid fa-calendar-day"></i>
                <span class="stat-row-label">Daily Return</span>
              </div>
              <span class="stat-row-value highlight">₹${p.daily.toLocaleString('en-IN')}</span>
            </div>
            <div class="stat-row">
              <div class="stat-row-left">
                <i class="fa-solid fa-clock"></i>
                <span class="stat-row-label">Validity</span>
              </div>
              <span class="stat-row-value">${p.validity} Days</span>
            </div>
            <div class="stat-row">
              <div class="stat-row-left">
                <i class="fa-solid fa-chart-line"></i>
                <span class="stat-row-label">ROI</span>
              </div>
              <span class="stat-row-value highlight-yellow">${roi}%</span>
            </div>
          </div>

          <div class="total-return-row">
            <span class="total-return-label"><i class="fa-solid fa-trophy"></i> Total Return</span>
            <span class="total-return-amount">₹${total.toLocaleString('en-IN')}</span>
          </div>

          <div class="card-footer">
            <button class="buy-btn ${btnClass}" onclick="openBuyModal(${p.id})">
              <i class="fa-solid fa-bag-shopping"></i> Buy Plan
            </button>
          </div>
        </div>`;
    }).join('');
}

/* ============================================================
   FILTER
============================================================ */
function filterPlans(group, el) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    const list = group === 'all' ? PLANS : PLANS.filter(p => p.group === group);
    renderPlans(list);
}

/* ============================================================
   BUY MODAL
============================================================ */
function openBuyModal(id) {
    const plan = PLANS.find(p => p.id === id);
    if (!plan) return;
    selectedPlan = plan;

    document.getElementById('modalIcon').innerHTML = `<i class="fa-solid ${plan.icon}"></i>`;
    document.getElementById('modalProductName').textContent = plan.name;
    document.getElementById('modalPlanSub').textContent = plan.tag;
    document.getElementById('modalPrice').textContent = plan.price.toLocaleString('en-IN');
    document.getElementById('modalDaily').textContent = plan.daily.toLocaleString('en-IN');
    document.getElementById('modalValidity').textContent = plan.validity;
    document.getElementById('modalTotal').textContent = (plan.daily * plan.validity).toLocaleString('en-IN');
    document.getElementById('modalRemaining').textContent = 'Checking...';

    // Simulate fetching wallet balance
    setTimeout(() => {
        const fakeBalance = Math.floor(Math.random() * 30000) + 5000;
        document.getElementById('modalRemaining').textContent = `₹${fakeBalance.toLocaleString('en-IN')}`;
    }, 600);

    document.getElementById('buyModal').classList.add('show');
}

function confirmPurchase() {
    if (!selectedPlan) return;
    closeModal('buyModal');
    document.getElementById('loadingScreen').classList.add('show');

    setTimeout(() => {
        document.getElementById('loadingScreen').classList.remove('show');
        showActionModal(
            'success',
            'Purchase Successful! 🎉',
            `You've successfully purchased the <strong>${selectedPlan.name}</strong>.<br>You will earn <strong>₹${selectedPlan.daily.toLocaleString('en-IN')}/day</strong> for ${selectedPlan.validity} days.<br>Total return: <strong>₹${(selectedPlan.daily * selectedPlan.validity).toLocaleString('en-IN')}</strong>`,
            'Go to My Plans',
            () => window.location.href = '../products/my-products.html'
        );
        selectedPlan = null;
    }, 2500);
}

/* ============================================================
   ACTION MODAL
============================================================ */
let actionCallback = null;

function showActionModal(type, title, msg, btnLabel = 'OK', callback = null) {
    const iconEl = document.getElementById('actionIcon');
    const iconSymEl = document.getElementById('actionIconSymbol');
    const titleEl = document.getElementById('actionTitle');
    const msgEl = document.getElementById('actionMessage');
    const okBtn = document.getElementById('actionRightBtn');

    iconEl.className = `action-icon ${type}`;
    iconSymEl.className = type === 'success' ? 'fa-solid fa-check'
        : type === 'error' ? 'fa-solid fa-xmark'
            : 'fa-solid fa-triangle-exclamation';
    titleEl.textContent = title;
    msgEl.innerHTML = msg;
    okBtn.textContent = btnLabel;
    actionCallback = callback;

    document.getElementById('actionModal').classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    if (id === 'actionModal' && typeof actionCallback === 'function') {
        actionCallback();
        actionCallback = null;
    }
}

/* ============================================================
   TOAST
============================================================ */
let toastTimer;
function showToast(msg, icon = 'fa-circle-check') {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.querySelector('i').className = `fa-solid ${icon}`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================================================
   INIT
============================================================ */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);
    renderPlans(PLANS);
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('show');
    });
});