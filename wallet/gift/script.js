// gift/script.js
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);
    await loadGiftHistory();
});

async function loadGiftHistory() {
    // Load gift transactions
    const res = await apiFetch('/wallet/transactions?type=gift&limit=50');
    if (!res?.success) return;

    const gifts = res.transactions;
    const total = gifts.reduce((s, t) => s + t.amount, 0);
    const last = gifts.length ? gifts[0].meta?.code?.slice(0, 7) + '…' : '—';

    document.getElementById('hsTotalRedeemed').textContent = gifts.length;
    document.getElementById('hsTotalEarned').textContent = formatINR(total);
    document.getElementById('hsLastCode').textContent = last;

    const badge = document.getElementById('historyBadge');
    if (badge) { badge.style.display = gifts.length ? 'flex' : 'none'; badge.textContent = gifts.length; }

    // Store for history drawer
    window._giftHistory = gifts;
}

async function redeemCode() {
    const input = document.getElementById('giftCodeInput');
    const code = input?.value.trim().toUpperCase();
    if (!code || code.length < 4) return;

    const btn = document.getElementById('redeemBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying…'; }

    document.getElementById('processingScreen').classList.add('show');

    const res = await apiFetch('/wallet/redeem-gift', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });

    document.getElementById('processingScreen').classList.remove('show');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Redeem Now'; }

    if (!res?.success) {
        input.classList.add('invalid');
        showErrorModal(res?.message || 'Invalid code');
        return;
    }

    input.classList.add('valid');
    input.value = '';
    setTimeout(() => input.classList.remove('valid'), 1500);
    if (btn) btn.disabled = true;

    showSuccessModal(code, res.amount);
    await loadGiftHistory();
}

function onCodeInput(input) {
    input.value = input.value.toUpperCase().replace(/\s+/g, '');
    input.classList.remove('valid', 'invalid');
    const btn = document.getElementById('redeemBtn');
    if (btn) btn.disabled = input.value.length < 4;
}

async function pasteCode() {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById('giftCodeInput');
        if (input) { input.value = text.toUpperCase().trim(); onCodeInput(input); }
    } catch { showToast('Paste manually', 'fa-circle-info'); }
}

function openHistory() {
    renderHistory();
    document.getElementById('drawerBg').classList.add('open');
    document.getElementById('historyDrawer').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeHistory() {
    document.getElementById('drawerBg').classList.remove('open');
    document.getElementById('historyDrawer').classList.remove('open');
    document.body.style.overflow = '';
}

function renderHistory() {
    const gifts = window._giftHistory || [];
    const sub = document.getElementById('dwhSub');
    if (sub) sub.textContent = `${gifts.length} code${gifts.length !== 1 ? 's' : ''} redeemed`;

    const list = document.getElementById('historyList');
    if (!gifts.length) {
        list.innerHTML = `<div class="dw-empty">
        <div class="e-icon"><i class="fa-solid fa-gift"></i></div>
        <h4>No History Yet</h4><p>Redeemed codes will appear here.</p>
      </div>`; return;
    }
    list.innerHTML = gifts.map((g, i) => `
      <div class="hi-item" style="animation-delay:${i * .05}s">
        <div class="hi-icon"><i class="fa-solid fa-gift"></i></div>
        <div class="hi-info">
          <div class="hi-code">${g.meta?.code || '—'}</div>
          <div class="hi-meta">
            <span class="hi-date">${formatDate(g.createdAt)}</span>
            <span class="hi-badge">Redeemed</span>
          </div>
          <div style="font-size:.7rem;color:var(--grey);margin-top:3px">${g.meta?.description || ''}</div>
        </div>
        <div class="hi-amount">+${formatINR(g.amount)}</div>
      </div>`).join('');
}

const CONFETTI_COLORS = ['#FFD700', '#003087', '#16A34A', '#EA580C', '#7C3AED'];
function showSuccessModal(code, amount) {
    const confetti = Array.from({ length: 18 }, (_, i) => {
        const left = Math.random() * 100, delay = Math.random() * .5, color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return `<div class="confetti-piece" style="left:${left}%;animation-delay:${delay}s;background:${color}"></div>`;
    }).join('');
    document.getElementById('modalBox').innerHTML = `
      <div class="confetti">${confetti}</div>
      <div class="modal-icon success"><i class="fa-solid fa-check"></i></div>
      <div class="modal-amount">+${formatINR(amount)}</div>
      <div class="modal-title">Code Redeemed! 🎉</div>
      <div class="modal-msg"><strong>${code}</strong> — ${formatINR(amount)} credited to your wallet!</div>
      <button class="modal-ok" onclick="closeModal()"><i class="fa-solid fa-wallet"></i> Awesome!</button>`;
    document.getElementById('modal').classList.add('show');
}
function showErrorModal(msg) {
    document.getElementById('modalBox').innerHTML = `
      <div class="modal-icon error"><i class="fa-solid fa-xmark"></i></div>
      <div class="modal-err-title">Invalid Code</div>
      <div class="modal-err-msg">${msg}</div>
      <button class="modal-ok" onclick="closeModal()" style="background:var(--danger)">Try Again</button>`;
    document.getElementById('modal').classList.add('show');
}
function closeModal() { document.getElementById('modal').classList.remove('show'); }