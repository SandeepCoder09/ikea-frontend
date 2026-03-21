// products/script.js  — Investment Plans page
document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);
  await loadProducts();
});

let allProducts = [];
let selectedPlan = null;

/* ── Load plans from API ── */
async function loadProducts() {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,215,0,.6)">
    <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem"></i>
    <p style="margin-top:12px;font-family:var(--font-display)">Loading plans…</p>
  </div>`;

  const res = await apiFetch('/products');

  if (!res || !res.success) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger-soft)">
      <p>Failed to load plans. Please refresh.</p>
    </div>`;
    return;
  }

  allProducts = res.products;
  renderPlans(allProducts);
}

/* ── Render plan cards ── */
function renderPlans(products) {
  const container = document.getElementById('productsContainer');

  if (!products.length) {
    container.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,255,255,.5)">
      <i class="fa-solid fa-box-open" style="font-size:2.5rem"></i>
      <p style="margin-top:12px">No plans available right now.</p>
    </div>`;
    return;
  }

  container.innerHTML = products.map((p, i) => {
    const totalReturn = p.daily * p.validity;
    const roi = (((totalReturn - p.price) / p.price) * 100).toFixed(0);
    const isPremium = p.category === 'premium';

    return `
    <div class="plan-card tier-${p.category} ${p.isPopular ? 'featured' : ''}"
         style="animation-delay:${i * 0.08}s">
      ${p.isPopular ? '<div class="popular-ribbon">⭐ Most Popular</div>' : ''}
      <div class="card-strip"></div>
      <div class="card-header">
        <div class="card-icon"><i class="fa-solid ${p.icon || 'fa-box'}"></i></div>
        <div class="card-title-wrap">
          <div class="card-plan-name">${p.name}</div>
          <div class="card-plan-tag">${p.description || ''}</div>
        </div>
      </div>
      <div class="card-price-row">
        <span class="price-main">₹${p.price.toLocaleString('en-IN')}</span>
        <span class="price-label">one-time</span>
      </div>
      <div class="card-stats">
        <div class="stat-row">
          <div class="stat-row-left"><i class="fa-solid fa-calendar-day"></i><span class="stat-row-label">Daily Return</span></div>
          <span class="stat-row-value highlight">₹${p.daily.toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-row">
          <div class="stat-row-left"><i class="fa-solid fa-clock"></i><span class="stat-row-label">Validity</span></div>
          <span class="stat-row-value">${p.validity} Days</span>
        </div>
        <div class="stat-row">
          <div class="stat-row-left"><i class="fa-solid fa-chart-line"></i><span class="stat-row-label">ROI</span></div>
          <span class="stat-row-value highlight-yellow">${roi}%</span>
        </div>
      </div>
      <div class="total-return-row">
        <span class="total-return-label"><i class="fa-solid fa-trophy"></i> Total Return</span>
        <span class="total-return-amount">₹${totalReturn.toLocaleString('en-IN')}</span>
      </div>
      <div class="card-footer">
        <button class="buy-btn ${isPremium ? 'buy-btn-white' : p.isPopular ? 'buy-btn-blue' : 'buy-btn-yellow'}"
                onclick="openBuyModal('${p._id}')">
          <i class="fa-solid fa-bag-shopping"></i> Buy Plan
        </button>
      </div>
    </div>`;
  }).join('');
}

/* ── Filter ── */
function filterPlans(group, el) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const list = group === 'all' ? allProducts : allProducts.filter(p => {
    if (group === 'starter') return ['starter', 'basic'].includes(p.category);
    if (group === 'mid') return ['plus', 'pro'].includes(p.category);
    if (group === 'premium') return ['elite', 'premium'].includes(p.category);
    return true;
  });
  renderPlans(list);
}

/* ── Open Buy Modal ── */
async function openBuyModal(productId) {
  const plan = allProducts.find(p => p._id === productId);
  if (!plan) return;
  selectedPlan = plan;

  document.getElementById('modalProductName').textContent = plan.name;
  document.getElementById('modalPlanSub').textContent = plan.description || '';
  document.getElementById('modalIcon').innerHTML = `<i class="fa-solid ${plan.icon || 'fa-box'}"></i>`;
  document.getElementById('modalPrice').textContent = plan.price.toLocaleString('en-IN');
  document.getElementById('modalDaily').textContent = plan.daily.toLocaleString('en-IN');
  document.getElementById('modalValidity').textContent = plan.validity;
  document.getElementById('modalTotal').textContent = (plan.daily * plan.validity).toLocaleString('en-IN');
  document.getElementById('modalRemaining').textContent = 'Checking…';

  document.getElementById('buyModal').classList.add('show');

  // Fetch live balance
  const res = await apiFetch('/wallet/balance');
  if (res?.success) {
    document.getElementById('modalRemaining').textContent = `₹${res.balance.toLocaleString('en-IN')}`;
  }
}

/* ── Confirm Purchase ── */
async function confirmPurchase() {
  if (!selectedPlan) return;
  closeModal('buyModal');
  document.getElementById('loadingScreen').classList.add('show');

  const res = await apiFetch('/products/buy', {
    method: 'POST',
    body: JSON.stringify({ productId: selectedPlan._id }),
  });

  document.getElementById('loadingScreen').classList.remove('show');

  if (!res || !res.success) {
    showActionModal('error', 'Purchase Failed', res?.message || 'Something went wrong.');
    return;
  }

  showActionModal(
    'success',
    'Purchase Successful! 🎉',
    `You've purchased <strong>${selectedPlan.name}</strong>.<br>
     Earn <strong>₹${selectedPlan.daily.toLocaleString('en-IN')}/day</strong> for ${selectedPlan.validity} days.<br>
     Total return: <strong>₹${(selectedPlan.daily * selectedPlan.validity).toLocaleString('en-IN')}</strong>`,
    'Go to My Plans',
    () => window.location.href = '../products/my-products.html'
  );

  selectedPlan = null;
}

/* ── Action Modal ── */
let actionCallback = null;
function showActionModal(type, title, msg, btnLabel = 'OK', cb = null) {
  const icons = { success: 'fa-check', error: 'fa-xmark', warning: 'fa-triangle-exclamation' };
  document.getElementById('actionModal').classList.add('show');
  document.getElementById('actionIcon').className = `action-icon ${type}`;
  document.getElementById('actionIconSymbol').className = `fa-solid ${icons[type]}`;
  document.getElementById('actionTitle').textContent = title;
  document.getElementById('actionMessage').innerHTML = msg;
  document.getElementById('actionRightBtn').textContent = btnLabel;
  actionCallback = cb;
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  if (id === 'actionModal' && typeof actionCallback === 'function') {
    actionCallback();
    actionCallback = null;
  }
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('show'); });
});