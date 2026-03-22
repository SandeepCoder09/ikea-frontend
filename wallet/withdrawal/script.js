// withdrawal/script.js
const FEE_RATE = 0.10;
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50000;
const MAX_ATTEMPTS = 5;

let walletBal = 0;
let withdrawAmt = 0;
let enteredPin = '';
let pinAttempts = 0;
let pinLocked = false;

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1100);
    await checkPinAndLoad();
});

async function checkPinAndLoad() {
    // 1. Check PIN set
    const pinRes = await apiFetch('/wallet/has-pin');
    if (pinRes && pinRes.success && !pinRes.hasPin) {
        showModal('pending', 'PIN Required 🔐',
            'You need to set a Withdrawal PIN before withdrawing. You will be redirected now.',
            'Set PIN', () => { window.location.href = '../secure/set-pin.html'; });
        return;
    }

    // 2. Get balance
    const balRes = await apiFetch('/wallet/balance');
    if (balRes?.success) {
        walletBal = balRes.balance;
        setText('displayBalance', Number(walletBal).toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setText('maxLabel', Math.min(walletBal, MAX_AMOUNT).toLocaleString('en-IN'));
    }

    // 3. Get bank
    const bankRes = await apiFetch('/wallet/bank');
    renderBank(bankRes?.bank);

    // 4. Init PIN dots
    renderPinDots();
}

/* ════════════════════════════════════════
   RENDER BANK
════════════════════════════════════════ */
function renderBank(bank) {
    const sec = document.getElementById('bankSection');
    if (!sec) return;

    if (!bank) {
        sec.innerHTML = `
      <div class="no-bank-warn">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div class="no-bank-warn-text">
          <div class="no-bank-warn-title">No Bank Account Linked</div>
          <div class="no-bank-warn-sub">Please link a bank account before withdrawing.</div>
          <a href="../bank/link-bank.html" class="link-bank-btn">
            <i class="fa-solid fa-link"></i> Link Bank Account
          </a>
        </div>
      </div>`;
        return;
    }

    sec.innerHTML = `
    <div class="bank-card">
      <div class="bank-card-top">
        <i class="fa-solid fa-building-columns"></i>
        <span>Linked Account</span>
        <span class="bc-default">Default</span>
      </div>
      <div class="bank-detail-rows">
        <div class="bdr">
          <div class="bdr-icon"><i class="fa-solid fa-user"></i></div>
          <div>
            <div class="bdr-label">Account Holder</div>
            <div class="bdr-value">${bank.holderName}</div>
          </div>
        </div>
        <div class="bdr">
          <div class="bdr-icon"><i class="fa-solid fa-building-columns"></i></div>
          <div>
            <div class="bdr-label">Bank Name</div>
            <div class="bdr-value">${bank.bankName}</div>
          </div>
        </div>
        <div class="bdr">
          <div class="bdr-icon"><i class="fa-solid fa-hashtag"></i></div>
          <div>
            <div class="bdr-label">Account Number</div>
            <div class="bdr-value">${bank.accNumber}</div>
          </div>
        </div>
        <div class="bdr">
          <div class="bdr-icon"><i class="fa-solid fa-code"></i></div>
          <div>
            <div class="bdr-label">IFSC Code</div>
            <div class="bdr-value">${bank.ifsc}</div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ════════════════════════════════════════
   AMOUNT LOGIC
════════════════════════════════════════ */
function setQuick(amount, el) {
    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    withdrawAmt = Math.min(amount, walletBal, MAX_AMOUNT);
    document.getElementById('amountInput').value = withdrawAmt;
    document.getElementById('amountInput').classList.remove('invalid');
    updateFeeCard(withdrawAmt);
    checkReady();
}

function setQuickAll(el) {
    setQuick(Math.min(walletBal, MAX_AMOUNT), el);
}

function onAmountInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    withdrawAmt = parseInt(input.value) || 0;
    input.classList.remove('invalid');
    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));
    updateFeeCard(withdrawAmt);
    checkReady();
}

function updateFeeCard(amount) {
    const card = document.getElementById('feeCard');
    if (!amount || amount < MIN_AMOUNT) { card?.classList.add('dimmed'); return; }
    card?.classList.remove('dimmed');

    const fee = parseFloat((amount * FEE_RATE).toFixed(2));
    const net = parseFloat((amount - fee).toFixed(2));
    const after = parseFloat((walletBal - amount).toFixed(2));

    setText('feeAmount', formatINR(amount));
    setText('feeFee', '−' + formatINR(fee));
    setText('feeNet', formatINR(net));
    setText('feeCredited', formatINR(net));
    setText('feeAfter', formatINR(Math.max(0, after)));
}

/* ════════════════════════════════════════
   PIN NUMPAD
════════════════════════════════════════ */
function renderPinDots() {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('pd' + i);
        if (!dot) continue;
        dot.classList.remove('filled', 'active', 'error');
        if (i < enteredPin.length) {
            dot.textContent = '●';
            dot.classList.add('filled');
        } else {
            dot.textContent = '—';
            if (i === enteredPin.length) dot.classList.add('active');
        }
    }
}

function np(digit) {
    if (pinLocked || enteredPin.length >= 4) return;
    enteredPin += digit;
    renderPinDots();
    checkReady();
}

function npDel() {
    if (pinLocked) return;
    enteredPin = enteredPin.slice(0, -1);
    renderPinDots();
    checkReady();
}

function shakePinDots() {
    ['pd0', 'pd1', 'pd2', 'pd3'].forEach(id => {
        const d = document.getElementById(id);
        d?.classList.add('error');
        setTimeout(() => d?.classList.remove('error', 'filled'), 700);
    });
    setTimeout(() => { enteredPin = ''; renderPinDots(); checkReady(); }, 700);
}

/* ════════════════════════════════════════
   CHECK SUBMIT READY
════════════════════════════════════════ */
function checkReady() {
    const validAmt = withdrawAmt >= MIN_AMOUNT && withdrawAmt <= Math.min(walletBal, MAX_AMOUNT);
    const validPin = enteredPin.length === 4;
    const hasBank = !!document.querySelector('.bank-card');
    const btn = document.getElementById('withdrawBtn');
    if (btn) btn.disabled = !(validAmt && validPin && hasBank && !pinLocked);
}

/* ════════════════════════════════════════
   SUBMIT
════════════════════════════════════════ */
async function submitWithdraw() {
    const amt = withdrawAmt;

    if (amt < MIN_AMOUNT) {
        document.getElementById('amountInput').classList.add('invalid');
        showToast('Minimum withdrawal is ₹100', 'fa-triangle-exclamation');
        return;
    }
    if (amt > walletBal) {
        document.getElementById('amountInput').classList.add('invalid');
        showToast('Insufficient balance', 'fa-triangle-exclamation');
        return;
    }

    document.getElementById('processingScreen').classList.add('show');

    // Use raw fetch to prevent 401 (wrong PIN) from triggering logout
    const token = getToken();
    const res = await fetch(`${CONFIG.API}/wallet/withdraw`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: amt, pin: enteredPin }),
    }).then(r => r.json()).catch(() => ({ success: false, message: 'Network error.' }));

    document.getElementById('processingScreen').classList.remove('show');

    if (!res || !res.success) {
        // Wrong PIN handling
        pinAttempts++;
        shakePinDots();

        const left = MAX_ATTEMPTS - pinAttempts;
        const msg = document.getElementById('pinAttemptsMsg');

        if (left <= 0) {
            pinLocked = true;
            if (msg) { msg.textContent = 'Too many wrong attempts. Please try later.'; msg.className = 'pin-attempts warn'; }
            document.getElementById('withdrawBtn').disabled = true;
        } else {
            if (msg) { msg.textContent = `${res?.message || 'Incorrect PIN'}. ${left} attempt${left > 1 ? 's' : ''} remaining.`; msg.className = 'pin-attempts warn'; }
        }
        return;
    }

    // Success
    const fee = parseFloat((amt * FEE_RATE).toFixed(2));
    const net = parseFloat((amt - fee).toFixed(2));

    showModal('pending', 'Withdrawal Submitted! ⏳',
        `Amount: <strong>${formatINR(amt)}</strong><br>
     Fee (10%): −<strong>${formatINR(fee)}</strong><br>
     You Receive: <strong>${formatINR(net)}</strong><br><br>
     Funds credited within <strong>1–3 business days</strong>.`,
        'OK, Got it', null);

    // Reset form
    document.getElementById('amountInput').value = '';
    document.getElementById('pinAttemptsMsg').textContent = '';
    enteredPin = ''; withdrawAmt = 0; pinAttempts = 0;
    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));
    renderPinDots();
    updateFeeCard(0);
    checkReady();

    // Refresh balance
    const balRes = await apiFetch('/wallet/balance');
    if (balRes?.success) {
        walletBal = balRes.balance;
        setText('displayBalance', Number(walletBal).toLocaleString('en-IN', { minimumFractionDigits: 2 }));
        setText('maxLabel', Math.min(walletBal, MAX_AMOUNT).toLocaleString('en-IN'));
    }
}

/* ════════════════════════════════════════
   MODAL
════════════════════════════════════════ */
function showModal(type, title, msg, btnLabel = 'OK', cb = null) {
    const icons = { success: 'fa-check', pending: 'fa-clock', error: 'fa-xmark' };
    document.getElementById('modalBox').innerHTML = `
    <div class="modal-icon ${type}">
      <i class="fa-solid ${icons[type] || 'fa-info'}"></i>
    </div>
    <div class="modal-title">${title}</div>
    <div class="modal-msg">${msg}</div>
    <button class="modal-ok" id="modalOkBtn">${btnLabel}</button>`;
    document.getElementById('modalOkBtn').onclick = () => {
        closeModal();
        if (cb) cb();
    };
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
});

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
let toastTimer;
function showToast(msg, icon = 'fa-circle-check') {
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toastMsg').textContent = msg;
    t.querySelector('i').className = `fa-solid ${icon}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── Helpers ── */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
}