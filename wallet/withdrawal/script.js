
/* ─── CONFIG ─── */
const WALLET_BALANCE = 12480.5;
const FEE_RATE = 0.1; // 10%
const MIN_WITHDRAW = 100;
const MAX_WITHDRAW = 50000;

/* ─── MOCK LINKED BANK (from bind-card) ─── */
const LINKED_BANK = {
    name: "Arjun Kumar",
    bank: "HDFC Bank",
    accNum: "XXXXXXXXXXXX4242",
    ifsc: "HDFC0001234",
};
/* set to null to test "no bank" state */

/* ─── PIN STATE ─── */
const SAVED_PIN = localStorage.getItem("withdrawPin"); // null if not set
let enteredPin = "";
let pinAttempts = 0;
const MAX_ATTEMPTS = 5;
let pinLocked = false;

/* ─── AMOUNT STATE ─── */
let withdrawAmount = 0;

/* ════════════════════════════════════════
 CHECK PIN — redirect if not set
════════════════════════════════════════ */
function checkPinSetup() {
    if (!SAVED_PIN) {
        // No PIN set — redirect
        showModal(
            "pending",
            "PIN Required 🔐",
            "You need to set a Withdrawal PIN before you can withdraw funds. You will be redirected to set up your PIN now.",
            "Set PIN Now",
            () => {
                window.location.href = "../../wallet/secure/set-pin.html";
            }
        );
    }
}

/* ════════════════════════════════════════
 RENDER BANK SECTION
════════════════════════════════════════ */
function renderBank() {
    const sec = document.getElementById("bankSection");
    if (!LINKED_BANK) {
        sec.innerHTML = `
          <div class="no-bank-warn">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div class="no-bank-warn-text">
              <div class="no-bank-warn-title">No Bank Account Linked</div>
              <div class="no-bank-warn-sub">You must link a bank account before withdrawing. It takes less than a minute.</div>
              <a href="../wallet/bind-card.html" class="link-bank-btn">
                <i class="fa-solid fa-link"></i> Link Bank Account
              </a>
            </div>
          </div>`;
    } else {
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
                <div class="bdr-info">
                  <div class="bdr-label">Account Holder</div>
                  <div class="bdr-value">${LINKED_BANK.name}</div>
                </div>
              </div>
              <div class="bdr">
                <div class="bdr-icon"><i class="fa-solid fa-building-columns"></i></div>
                <div class="bdr-info">
                  <div class="bdr-label">Bank</div>
                  <div class="bdr-value">${LINKED_BANK.bank}</div>
                </div>
              </div>
              <div class="bdr">
                <div class="bdr-icon"><i class="fa-solid fa-hashtag"></i></div>
                <div class="bdr-info">
                  <div class="bdr-label">Account Number</div>
                  <div class="bdr-value">${LINKED_BANK.accNum}</div>
                </div>
              </div>
              <div class="bdr">
                <div class="bdr-icon"><i class="fa-solid fa-code"></i></div>
                <div class="bdr-info">
                  <div class="bdr-label">IFSC Code</div>
                  <div class="bdr-value">${LINKED_BANK.ifsc}</div>
                </div>
              </div>
            </div>
          </div>`;
    }
}

/* ════════════════════════════════════════
 AMOUNT LOGIC
════════════════════════════════════════ */
function fmt(n) {
    return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function updateFeeCard(amount) {
    const card = document.getElementById("feeCard");
    if (!amount || amount < MIN_WITHDRAW) {
        card.classList.add("dimmed");
        return;
    }
    card.classList.remove("dimmed");

    const fee = parseFloat((amount * FEE_RATE).toFixed(2));
    const net = parseFloat((amount - fee).toFixed(2));
    const after = parseFloat((WALLET_BALANCE - amount).toFixed(2));

    document.getElementById("feeAmount").textContent = "₹" + fmt(amount);
    document.getElementById("feeFee").textContent = "−₹" + fmt(fee);
    document.getElementById("feeNet").textContent = "₹" + fmt(net);
    document.getElementById("feeCredited").textContent = "₹" + fmt(net);
    document.getElementById("feeAfter").textContent =
        "₹" + fmt(Math.max(0, after));
}

function setQuick(amount, el) {
    document
        .querySelectorAll(".qa-btn")
        .forEach((b) => b.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("amountInput").value = amount;
    document.getElementById("amountInput").classList.remove("invalid");
    withdrawAmount = amount;
    updateFeeCard(amount);
    checkReady();
}

function setQuickAll(el) {
    const max = Math.min(WALLET_BALANCE, MAX_WITHDRAW);
    setQuick(Math.floor(max), el);
    document.getElementById("amountInput").value = Math.floor(max);
}

function onAmountInput(input) {
    input.value = input.value.replace(/[^0-9]/g, "");
    input.classList.remove("invalid");
    document
        .querySelectorAll(".qa-btn")
        .forEach((b) => b.classList.remove("active"));
    withdrawAmount = parseInt(input.value) || 0;
    updateFeeCard(withdrawAmount);
    checkReady();
}

/* ════════════════════════════════════════
 PIN NUMPAD
════════════════════════════════════════ */
function renderPinDots() {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById("pd" + i);
        dot.classList.remove("filled", "active", "error");
        if (i < enteredPin.length) {
            dot.textContent = "●";
            dot.classList.add("filled");
        } else {
            dot.textContent = "—";
            if (i === enteredPin.length) dot.classList.add("active");
        }
    }
}

function np(digit) {
    if (pinLocked || enteredPin.length >= 4) return;
    enteredPin += digit;
    renderPinDots();
    if (enteredPin.length === 4) validatePin();
    checkReady();
}

function npDel() {
    if (pinLocked) return;
    enteredPin = enteredPin.slice(0, -1);
    renderPinDots();
    checkReady();
}

function validatePin() {
    if (enteredPin === SAVED_PIN) {
        document.getElementById("pinAttemptsMsg").textContent = "";
        document.getElementById("pinAttemptsMsg").className = "pin-attempts";
        checkReady();
        return;
    }
    // wrong
    pinAttempts++;
    ["pd0", "pd1", "pd2", "pd3"].forEach((id) => {
        const d = document.getElementById(id);
        d.classList.add("error");
        setTimeout(() => {
            d.classList.remove("error", "filled");
            d.textContent = "—";
        }, 700);
    });
    setTimeout(() => {
        enteredPin = "";
        renderPinDots();
        checkReady();
    }, 700);

    const left = MAX_ATTEMPTS - pinAttempts;
    const msg = document.getElementById("pinAttemptsMsg");
    if (left <= 0) {
        pinLocked = true;
        msg.textContent = "Too many wrong attempts. Please try later.";
        msg.className = "pin-attempts warn";
        document.getElementById("withdrawBtn").disabled = true;
    } else {
        msg.textContent = `Incorrect PIN. ${left} attempt${left > 1 ? "s" : ""
            } remaining.`;
        msg.className = "pin-attempts warn";
    }
}

/* ════════════════════════════════════════
 CHECK SUBMIT READY
════════════════════════════════════════ */
function checkReady() {
    const amt = withdrawAmount;
    const validAmt =
        amt >= MIN_WITHDRAW && amt <= Math.min(WALLET_BALANCE, MAX_WITHDRAW);
    const validPin = enteredPin.length === 4 && enteredPin === SAVED_PIN;
    const hasBank = !!LINKED_BANK;
    document.getElementById("withdrawBtn").disabled = !(
        validAmt &&
        validPin &&
        hasBank &&
        !pinLocked
    );
}

/* ════════════════════════════════════════
 SUBMIT
════════════════════════════════════════ */
function submitWithdraw() {
    const amt = withdrawAmount;
    if (amt < MIN_WITHDRAW) {
        document.getElementById("amountInput").classList.add("invalid");
        showToast("Minimum withdrawal is ₹100", "fa-triangle-exclamation");
        return;
    }
    if (amt > WALLET_BALANCE) {
        document.getElementById("amountInput").classList.add("invalid");
        showToast("Insufficient balance", "fa-triangle-exclamation");
        return;
    }

    const fee = parseFloat((amt * FEE_RATE).toFixed(2));
    const net = parseFloat((amt - fee).toFixed(2));

    document.getElementById("processingScreen").classList.add("show");

    setTimeout(() => {
        document.getElementById("processingScreen").classList.remove("show");
        showModal(
            "pending",
            "Withdrawal Submitted! ⏳",
            `Your withdrawal request has been submitted.<br><br>
           <b>Amount:</b> ₹${fmt(amt)}<br>
           <b>Fee (10%):</b> −₹${fmt(fee)}<br>
           <b>You Receive:</b> ₹${fmt(net)}<br>
           <b>Bank:</b> ${LINKED_BANK.bank} · ${LINKED_BANK.accNum}<br><br>
           Funds will be credited within <b>1–3 business days</b>.`,
            "OK, Got it",
            null
        );

        // reset
        document.getElementById("amountInput").value = "";
        enteredPin = "";
        withdrawAmount = 0;
        document
            .querySelectorAll(".qa-btn")
            .forEach((b) => b.classList.remove("active"));
        renderPinDots();
        updateFeeCard(0);
        checkReady();
    }, 2200);
}

/* ── MODAL ── */
function showModal(type, title, msg, btnLabel = "OK", cb = null) {
    const icons = {
        success: "fa-check",
        pending: "fa-clock",
        error: "fa-xmark",
    };
    document.getElementById("modalBox").innerHTML = `
        <div class="modal-icon ${type}"><i class="fa-solid ${icons[type] || "fa-info"
        }"></i></div>
        <div class="modal-title">${title}</div>
        <div class="modal-msg">${msg}</div>
        <button class="modal-ok" id="modalOkBtn">${btnLabel}</button>`;
    document.getElementById("modalOkBtn").onclick = () => {
        closeModal();
        if (cb) cb();
    };
    document.getElementById("modal").classList.add("show");
}
function closeModal() {
    document.getElementById("modal").classList.remove("show");
}
document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal")) closeModal();
});

/* ── TOAST ── */
let toastTimer;
function showToast(msg, icon = "fa-circle-check") {
    const t = document.getElementById("toast");
    document.getElementById("toastMsg").textContent = msg;
    t.querySelector("i").className = `fa-solid ${icon}`;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

/* ── BOOT ── */
window.addEventListener("load", () => {
    setTimeout(
        () => document.getElementById("pageLoader").classList.add("hidden"),
        1100
    );
    checkPinSetup();
    renderBank();
    renderPinDots();
    document.getElementById("displayBalance").textContent =
        fmt(WALLET_BALANCE);
    document.getElementById("maxLabel").textContent = fmt(
        Math.min(WALLET_BALANCE, MAX_WITHDRAW)
    );
});