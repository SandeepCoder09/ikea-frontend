// wallet/recharge.js  — Deposit page
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);

    // Load live balance
    const res = await apiFetch('/wallet/balance');
    if (res?.success) {
        document.getElementById('currentBalance').textContent =
            Number(res.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        updateBalanceAfter(0, res.balance);
    }
});

let walletBalance = 0;
let depositAmount = 0;
let depositMethod = 'upi';

function updateBalanceAfter(amt, bal) {
    walletBalance = bal || walletBalance;
    const after = walletBalance + (parseFloat(amt) || 0);
    const el = document.getElementById('balanceAfter');
    if (el) el.textContent = formatINR(after);
}

function setQuickAmount(amount, el) {
    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    depositAmount = amount;
    const input = document.getElementById('amountInput');
    if (input) { input.value = amount; input.classList.remove('invalid'); }
    updateBalanceAfter(amount);
    checkSubmitReady();
}

function onAmountInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    depositAmount = parseInt(input.value) || 0;
    input.classList.remove('invalid');
    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));
    updateBalanceAfter(depositAmount);
    checkSubmitReady();
}

function selectMethod(method, el) {
    depositMethod = method;
    document.querySelectorAll('.pm-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    ['boxUpi', 'boxNeft', 'boxCrypto'].forEach(id => document.getElementById(id)?.classList.remove('show'));
    const boxMap = { upi: 'boxUpi', neft: 'boxNeft', crypto: 'boxCrypto' };
    document.getElementById(boxMap[method])?.classList.add('show');
    checkSubmitReady();
}

function checkSubmitReady() {
    const amt = depositAmount;
    const utr = document.getElementById('utrInput')?.value.trim() || '';
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = !(amt >= 100 && amt <= 50000 && utr.length >= 6);
}

document.getElementById('utrInput')?.addEventListener('input', checkSubmitReady);

async function submitDeposit() {
    const amt = depositAmount;
    const utr = document.getElementById('utrInput')?.value.trim();

    if (amt < 100) { document.getElementById('amountInput').classList.add('invalid'); showToast('Min deposit ₹100', 'fa-triangle-exclamation'); return; }
    if (amt > 50000) { document.getElementById('amountInput').classList.add('invalid'); showToast('Max deposit ₹50,000', 'fa-triangle-exclamation'); return; }
    if (!utr || utr.length < 6) { showToast('Enter a valid reference number', 'fa-triangle-exclamation'); return; }

    document.getElementById('processingScreen').classList.add('show');

    const res = await apiFetch('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount: amt, method: depositMethod, utr }),
    });

    document.getElementById('processingScreen').classList.remove('show');

    if (!res || !res.success) { showModal('error', 'Failed', res?.message || 'Deposit failed'); return; }

    showModal('pending', 'Request Submitted! ⏳',
        `Deposit of <strong>${formatINR(amt)}</strong> via <strong>${depositMethod.toUpperCase()}</strong> submitted.<br>
       Reference: <strong>${utr}</strong><br>
       Will be credited within 30 minutes after verification.`);

    document.getElementById('amountInput').value = '';
    document.getElementById('utrInput').value = '';
    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));
    depositAmount = 0;
    updateBalanceAfter(0);
    checkSubmitReady();
}

function copyText(text) {
    navigator.clipboard?.writeText(text).then(() => showToast('Copied!', 'fa-clipboard'));
}

function showModal(type, title, msg) {
    const icons = { success: 'fa-check', pending: 'fa-clock', error: 'fa-xmark' };
    document.getElementById('modalBox').innerHTML = `
      <div class="modal-icon ${type}"><i class="fa-solid ${icons[type]}"></i></div>
      <div class="modal-title">${title}</div>
      <div class="modal-msg">${msg}</div>
      <button class="modal-ok" onclick="closeModal()">OK, Got it</button>`;
    document.getElementById('modal').classList.add('show');
}
function closeModal() { document.getElementById('modal').classList.remove('show'); }