// wallet/deposit/script.js — FINAL SECURE VERSION

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();

    setTimeout(() => {
        document.getElementById('pageLoader')?.classList.add('hidden');
    }, 1200);

    const res = await apiFetch('/wallet/balance');
    if (res?.success) {
        walletBalance = Number(res.balance || 0);

        document.getElementById('currentBalance').textContent =
            walletBalance.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        updateBalanceAfter(0, walletBalance);
    }

    updateReferenceLabel();
    renderBoxes();
    checkSubmitReady();
});

/* ===============================
   STATE
================================ */
let walletBalance = 0;
let depositAmount = 0;
let depositMethod = 'upi';
let currentTxn = null;

/* ===============================
   HELPERS
================================ */
function getQR(data) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`;
}

function updateBalanceAfter(amt, bal) {
    walletBalance = typeof bal === 'number' ? bal : walletBalance;
    const after = walletBalance + (parseFloat(amt) || 0);
    document.getElementById('balanceAfter').textContent = formatINR(after);
}

/* ===============================
   AMOUNT
================================ */
function setQuickAmount(amount, el) {
    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');

    depositAmount = amount;
    document.getElementById('amountInput').value = amount;

    resetSession();
}

function onAmountInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    depositAmount = parseInt(input.value) || 0;

    document.querySelectorAll('.qa-btn').forEach(b => b.classList.remove('active'));

    resetSession();
}

function resetSession() {
    currentTxn = null;
    updateBalanceAfter(depositAmount);
    renderBoxes();
    checkSubmitReady();
}

/* ===============================
   METHOD
================================ */
function selectMethod(method, el) {
    depositMethod = method;

    document.querySelectorAll('.pm-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');

    ['boxUpi', 'boxCrypto'].forEach(id =>
        document.getElementById(id)?.classList.remove('show')
    );

    document.getElementById(method === 'upi' ? 'boxUpi' : 'boxCrypto').classList.add('show');

    updateReferenceLabel();
    resetSession();
}

/* ===============================
   LABEL
================================ */
function updateReferenceLabel() {
    const label = document.getElementById('utrLabel');
    const input = document.getElementById('utrInput');

    if (depositMethod === 'crypto') {
        label.textContent = 'Transaction Hash';
        input.placeholder = 'Enter USDT tx hash';
    } else {
        label.textContent = 'UTR Number';
        input.placeholder = 'Enter UPI reference';
    }
}

/* ===============================
   RENDER
================================ */
function renderBoxes() {
    renderUPI();
    renderCrypto();
}

function renderUPI() {
    const box = document.getElementById('boxUpi');

    if (!currentTxn || currentTxn.payment.type !== 'upi') {
        box.innerHTML = `<p>Create deposit first</p>`;
        return;
    }

    const p = currentTxn.payment;

    box.innerHTML = `
    <div style="text-align:center; padding: 10px 0;">
        <p style="margin:0 0 8px 0;"><b>UPI ID:</b> ${p.upiId}</p>

        <div style="display:flex; justify-content:center; margin: 10px 0;">
            <img src="${getQR(p.qr)}" width="180" height="180" style="border-radius:12px; background:#fff; padding:10px;" />
        </div>

        <p style="margin:6px 0;"><b>Amount:</b> ${formatINR(currentTxn.amount)}</p>
        <p style="margin:6px 0;"><b>Ref:</b> ${currentTxn.ref}</p>
    </div>
`;
}

function renderCrypto() {
    const box = document.getElementById('boxCrypto');

    if (!currentTxn || currentTxn.payment.type !== 'crypto') {
        box.innerHTML = `<p>Create deposit first</p>`;
        return;
    }

    const p = currentTxn.payment;

    box.innerHTML = `
    <div style="text-align:center; padding: 10px 0;">
        <p style="margin:0 0 8px 0; word-break:break-all;"><b>Address:</b> ${p.address}</p>

        <div style="display:flex; justify-content:center; margin: 10px 0;">
            <img src="${getQR(p.address)}" width="180" height="180" style="border-radius:12px; background:#fff; padding:10px;" />
        </div>

        <p style="margin:6px 0;"><b>Network:</b> ${p.network}</p>
        <p style="margin:6px 0;"><b>Ref:</b> ${currentTxn.ref}</p>
    </div>
`;
}

/* ===============================
   CREATE SESSION
================================ */
async function createDepositSession() {
    if (depositAmount < 100 || depositAmount > 50000) {
        showToast("Invalid amount", "fa-triangle-exclamation");
        return;
    }

    const res = await apiFetch('/wallet/create-deposit', {
        method: 'POST',
        body: JSON.stringify({
            amount: depositAmount,
            method: depositMethod
        })
    });

    if (!res.success) {
        showToast(res.message, "fa-xmark");
        return;
    }

    currentTxn = res;
    depositAmount = res.amount;

    document.getElementById('amountInput').value = depositAmount;

    updateBalanceAfter(depositAmount);
    renderBoxes();
    checkSubmitReady();

    showToast("Payment generated", "fa-check");
}

/* ===============================
   SUBMIT
================================ */
async function submitDeposit() {
    const ref = document.getElementById('utrInput').value.trim();

    if (!currentTxn) {
        showToast("Generate payment first", "fa-triangle-exclamation");
        return;
    }

    if (ref.length < 6) {
        showToast("Invalid reference", "fa-triangle-exclamation");
        return;
    }

    const res = await apiFetch('/wallet/submit-proof', {
        method: 'POST',
        body: JSON.stringify({
            transactionId: currentTxn.transactionId,
            reference: ref
        })
    });

    if (!res.success) {
        showToast(res.message, "fa-xmark");
        return;
    }

    showToast("Submitted for approval", "fa-clock");

    document.getElementById('amountInput').value = '';
    document.getElementById('utrInput').value = '';

    currentTxn = null;
    depositAmount = 0;

    renderBoxes();
    checkSubmitReady();
}

/* ===============================
   VALIDATION
================================ */
function checkSubmitReady() {
    const ref = document.getElementById('utrInput')?.value.trim() || '';
    document.getElementById('submitBtn').disabled =
        !currentTxn || ref.length < 6;
}

document.getElementById('utrInput')?.addEventListener('input', checkSubmitReady);

/* ===============================
   UTIL
================================ */
function copyText(text) {
    navigator.clipboard.writeText(text);
    showToast("Copied!", "fa-clipboard");
}