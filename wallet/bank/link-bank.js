// wallet/bind-card.js
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);
    await loadBankStatus();
});

async function loadBankStatus() {
    const res = await apiFetch('/wallet/bank');
    if (res?.bank) {
        renderLinked(res.bank);
    } else {
        document.getElementById('linkedSection').style.display = 'none';
        document.getElementById('noAccountSection').style.display = 'block';
        document.getElementById('formSection').style.display = 'block';
    }
}

function renderLinked(bank) {
    document.getElementById('noAccountSection').style.display = 'none';
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('linkedSection').style.display = 'block';
    document.getElementById('displayName').textContent = bank.holderName;
    document.getElementById('displayBank').textContent = bank.bankName;
    document.getElementById('displayAccNum').textContent = bank.accNumber;
    document.getElementById('displayIfsc').textContent = bank.ifsc;
    const badge = document.getElementById('abBadge');
    if (badge) { badge.textContent = 'Linked ✓'; badge.style.background = 'rgba(22,163,74,.2)'; badge.style.color = '#86EFAC'; }
}

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

async function submitAccount() {
    const name = document.getElementById('holderName')?.value.trim();
    const bank = document.getElementById('bankName')?.value;
    const acc = document.getElementById('accountNumber')?.value.trim();
    const ifsc = document.getElementById('ifscCode')?.value.trim();

    if (!name || name.length < 3) return showModal('error', 'Invalid Name', 'Enter full account holder name.');
    if (!bank) return showModal('error', 'Select Bank', 'Please select your bank.');
    if (!acc || acc.length < 9 || acc.length > 18) return showModal('error', 'Invalid Account', 'Enter valid 9-18 digit account number.');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return showModal('error', 'Invalid IFSC', 'Enter valid IFSC code e.g. SBIN0001234.');

    document.getElementById('processingScreen').classList.add('show');

    const res = await apiFetch('/wallet/bind-bank', {
        method: 'POST',
        body: JSON.stringify({ holderName: name, bankName: bank, accNumber: acc, ifsc }),
    });

    document.getElementById('processingScreen').classList.remove('show');

    if (!res || !res.success) return showModal('error', 'Failed', res?.message || 'Could not link account.');

    renderLinked(res.bank);
    showModal('success', 'Account Linked! 🎉', `Your ${bank} account has been linked successfully.`);
}

function showModal(type, title, msg) {
    const icons = { success: 'fa-check', error: 'fa-xmark' };
    document.getElementById('modalIcon').className = `modal-icon ${type}`;
    document.getElementById('modalIconSym').className = `fa-solid ${icons[type]}`;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMsg').textContent = msg;
    document.getElementById('actionModal').classList.add('show');
}
function closeModal() { document.getElementById('actionModal').classList.remove('show'); }