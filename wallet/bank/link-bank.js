/* ═══════════════════════════════════════════
       STATE  — replace with real API fetch
    ═══════════════════════════════════════════ */
// Set to null if no account is linked yet
// Set to an object if already linked (from your backend)
let linkedAccount = null;

/* Example already-linked account from backend:
let linkedAccount = {
  name:   'Arjun Kumar',
  bank:   'HDFC Bank',
  accNum: 'XXXXXXXXXXXX4242',   // always store masked
  ifsc:   'HDFC0001234',
};
*/

/* ═══════════════════════════════════════════
   RENDER PAGE STATE
═══════════════════════════════════════════ */
function renderPage() {
    const linked = document.getElementById('linkedSection');
    const noAcc = document.getElementById('noAccountSection');
    const formSec = document.getElementById('formSection');
    const badge = document.getElementById('abBadge');

    if (linkedAccount) {
        // Show linked card, hide form & empty state
        linked.style.display = 'block';
        noAcc.style.display = 'none';
        formSec.style.display = 'none';
        badge.textContent = 'Linked ✓';
        badge.style.background = 'rgba(22,163,74,.2)';
        badge.style.borderColor = 'rgba(22,163,74,.3)';
        badge.style.color = '#86EFAC';

        // Populate display fields
        document.getElementById('displayName').textContent = linkedAccount.name;
        document.getElementById('displayBank').textContent = linkedAccount.bank;
        document.getElementById('displayAccNum').textContent = linkedAccount.accNum;
        document.getElementById('displayIfsc').textContent = linkedAccount.ifsc;
    } else {
        // Show empty state + form
        linked.style.display = 'none';
        noAcc.style.display = 'block';
        formSec.style.display = 'block';
    }
}

/* ═══════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════ */
function validateName(input) {
    const v = input.value.trim();
    input.classList.toggle('valid', v.length >= 3);
    input.classList.toggle('invalid', v.length > 0 && v.length < 3);
}

function validateAccNum(input) {
    input.value = input.value.replace(/\D/g, '');
    const len = input.value.length;
    input.classList.toggle('valid', len >= 9 && len <= 18);
    input.classList.toggle('invalid', len > 0 && (len < 9 || len > 18));
}

function validateIFSC(input) {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const ok = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(input.value);
    input.classList.toggle('valid', ok);
    input.classList.toggle('invalid', !ok && input.value.length > 0);
}

/* ═══════════════════════════════════════════
   SUBMIT
═══════════════════════════════════════════ */
function submitAccount() {
    const name = document.getElementById('holderName').value.trim();
    const bank = document.getElementById('bankName').value;
    const acc = document.getElementById('accountNumber').value.trim();
    const ifsc = document.getElementById('ifscCode').value.trim();

    if (!name || name.length < 3) {
        showModal('error', 'Invalid Name', 'Please enter the full account holder name (at least 3 characters).'); return;
    }
    if (!bank) {
        showModal('error', 'Select Bank', 'Please select your bank from the list.'); return;
    }
    if (!acc || acc.length < 9 || acc.length > 18) {
        showModal('error', 'Invalid Account Number', 'Please enter a valid 9–18 digit account number.'); return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        showModal('error', 'Invalid IFSC Code', 'Please enter a valid 11-character IFSC code.\nFormat: ABCD0123456'); return;
    }

    document.getElementById('processingScreen').classList.add('show');

    setTimeout(() => {
        document.getElementById('processingScreen').classList.remove('show');

        // Save — mask account number
        const masked = 'X'.repeat(acc.length - 4) + acc.slice(-4);
        linkedAccount = { name, bank, accNum: masked, ifsc };

        renderPage();
        showModal('success', 'Account Linked! 🎉',
            `Your ${bank} account has been successfully linked to your IKEA account. All withdrawals will be processed to this account.`);

        // ← replace with real API call:
        // await fetch('/api/bank/bind', { method:'POST', body: JSON.stringify({name,bank,acc,ifsc}) })
    }, 2000);
}

/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
function showModal(type, title, msg) {
    document.getElementById('modalIcon').className = `modal-icon ${type}`;
    document.getElementById('modalIconSym').className = type === 'success' ? 'fa-solid fa-check' : 'fa-solid fa-xmark';
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMsg').textContent = msg;
    document.getElementById('actionModal').classList.add('show');
}
function closeModal() { document.getElementById('actionModal').classList.remove('show'); }
document.getElementById('actionModal').addEventListener('click', e => {
    if (e.target === document.getElementById('actionModal')) closeModal();
});

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
let toastTimer;
function showToast(msg, icon = 'fa-circle-check') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.querySelector('i').className = `fa-solid ${icon}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);
    // Replace below with real API fetch to get linked account
    renderPage();
});