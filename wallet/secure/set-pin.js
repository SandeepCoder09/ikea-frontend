// wallet/set-pin.js
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1000);
    renderDots(newPin, 'newDot');
    renderDots(confirmPin, 'confDot');
});

let newPin = '', confirmPin = '', activeField = 'new';

function renderDots(pin, prefix) {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById(prefix + i);
        if (!dot) continue;
        dot.classList.remove('filled', 'active', 'error', 'success');
        if (i < pin.length) { dot.textContent = '●'; dot.classList.add('filled'); }
        else { dot.textContent = '—'; if (i === pin.length) dot.classList.add('active'); }
    }
}

function numpadPress(digit) {
    if (activeField === 'new') {
        if (newPin.length >= 4) return;
        newPin += digit;
        renderDots(newPin, 'newDot');
        if (newPin.length === 4) activeField = 'confirm';
    } else {
        if (confirmPin.length >= 4) return;
        confirmPin += digit;
        renderDots(confirmPin, 'confDot');
    }
    checkReady();
}

function numpadDelete() {
    if (activeField === 'confirm' && confirmPin.length === 0) activeField = 'new';
    if (activeField === 'new') { newPin = newPin.slice(0, -1); renderDots(newPin, 'newDot'); }
    else { confirmPin = confirmPin.slice(0, -1); renderDots(confirmPin, 'confDot'); }
    checkReady();
}

function checkReady() {
    const btn = document.getElementById('setPinBtn');
    if (btn) btn.disabled = !(newPin.length === 4 && confirmPin.length === 4);
}

async function setPin() {
    if (newPin !== confirmPin) {
        ['confDot0', 'confDot1', 'confDot2', 'confDot3'].forEach(id => {
            const d = document.getElementById(id);
            d?.classList.add('error');
            setTimeout(() => d?.classList.remove('error', 'filled'), 700);
        });
        confirmPin = ''; renderDots(confirmPin, 'confDot'); activeField = 'confirm';
        // showToast("PINs don't match",'fa-triangle-exclamation');
        return;
    }

    const res = await apiFetch('/wallet/set-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: newPin }),
    });

    if (!res || !res.success) return;

    // Success
    ['newDot0', 'newDot1', 'newDot2', 'newDot3', 'confDot0', 'confDot1', 'confDot2', 'confDot3'].forEach(id => {
        const d = document.getElementById(id);
        d?.classList.remove('filled', 'active');
        d?.classList.add('success');
        if (d) d.textContent = '✓';
    });

    setTimeout(() => {
        document.getElementById('successOverlay')?.classList.add('show');
        setTimeout(goToWithdraw, 2000);
    }, 400);
}

function goToWithdraw() { window.location.href = '/wallet/withdrawal/index.html'; }