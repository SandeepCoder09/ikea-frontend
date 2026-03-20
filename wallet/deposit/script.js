
/* ─── STATE ─── */
const WALLET_BALANCE = 12480.5;
let selectedAmount = 0;
let selectedMethod = "upi";

/* ─── BALANCE DISPLAY ─── */
function updateBalanceAfter() {
    const amt =
        parseFloat(document.getElementById("amountInput").value) || 0;
    const after = WALLET_BALANCE + amt;
    document.getElementById("balanceAfter").textContent =
        "₹" +
        after.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
}

/* ─── QUICK AMOUNTS ─── */
function setQuickAmount(amount, el) {
    document
        .querySelectorAll(".qa-btn")
        .forEach((b) => b.classList.remove("active"));
    el.classList.add("active");
    selectedAmount = amount;
    const input = document.getElementById("amountInput");
    input.value = amount;
    input.classList.remove("invalid");
    updateBalanceAfter();
    checkSubmitReady();
}

/* ─── AMOUNT INPUT ─── */
function onAmountInput(input) {
    // digits only
    input.value = input.value.replace(/[^0-9]/g, "");
    input.classList.remove("invalid");
    // deselect quick amount chips
    document
        .querySelectorAll(".qa-btn")
        .forEach((b) => b.classList.remove("active"));
    selectedAmount = parseInt(input.value) || 0;
    updateBalanceAfter();
    checkSubmitReady();
}

/* ─── PAYMENT METHOD ─── */
function selectMethod(method, el) {
    selectedMethod = method;
    document
        .querySelectorAll(".pm-option")
        .forEach((o) => o.classList.remove("active"));
    el.classList.add("active");

    // hide all boxes
    ["boxUpi", "boxNeft", "boxCrypto"].forEach((id) =>
        document.getElementById(id).classList.remove("show")
    );

    // show relevant box + update UTR label
    const utrLabel = document.getElementById("utrLabel");
    if (method === "upi") {
        document.getElementById("boxUpi").classList.add("show");
        utrLabel.textContent = "UTR / Reference Number";
        document.getElementById("utrInput").placeholder =
            "Enter 12-digit UTR number";
    } else if (method === "neft") {
        document.getElementById("boxNeft").classList.add("show");
        utrLabel.textContent = "UTR / Reference Number";
        document.getElementById("utrInput").placeholder =
            "Enter bank transfer reference";
    } else {
        document.getElementById("boxCrypto").classList.add("show");
        utrLabel.textContent = "Transaction Hash (TXID)";
        document.getElementById("utrInput").placeholder =
            "Enter crypto transaction hash";
    }

    checkSubmitReady();
}

/* ─── CHECK SUBMIT ─── */
function checkSubmitReady() {
    const amt = parseInt(document.getElementById("amountInput").value) || 0;
    const utr = document.getElementById("utrInput").value.trim();
    document.getElementById("submitBtn").disabled = !(
        amt >= 100 &&
        amt <= 50000 &&
        utr.length >= 6
    );
}

// also watch UTR input
document
    .getElementById("utrInput")
    .addEventListener("input", checkSubmitReady);

/* ─── SUBMIT ─── */
function submitDeposit() {
    const amt = parseInt(document.getElementById("amountInput").value) || 0;
    const utr = document.getElementById("utrInput").value.trim();

    if (amt < 100) {
        document.getElementById("amountInput").classList.add("invalid");
        showToast("Minimum deposit is ₹100", "fa-triangle-exclamation");
        return;
    }
    if (amt > 50000) {
        document.getElementById("amountInput").classList.add("invalid");
        showToast("Maximum deposit is ₹50,000", "fa-triangle-exclamation");
        return;
    }
    if (utr.length < 6) {
        showToast(
            "Enter a valid reference number",
            "fa-triangle-exclamation"
        );
        return;
    }

    document.getElementById("processingScreen").classList.add("show");

    setTimeout(() => {
        document.getElementById("processingScreen").classList.remove("show");
        showModal(
            "pending",
            "Request Submitted! ⏳",
            `Your deposit of <strong>₹${amt.toLocaleString(
                "en-IN"
            )}</strong> via <strong>${selectedMethod.toUpperCase()}</strong> has been submitted.<br><br>Reference: <strong>${utr}</strong><br><br>Your wallet will be credited within <strong>5–30 minutes</strong> after verification.`
        );
        // reset form
        document.getElementById("amountInput").value = "";
        document.getElementById("utrInput").value = "";
        document
            .querySelectorAll(".qa-btn")
            .forEach((b) => b.classList.remove("active"));
        selectedAmount = 0;
        updateBalanceAfter();
        checkSubmitReady();
    }, 2000);
}

/* ─── COPY ─── */
function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard
            .writeText(text)
            .then(() => showToast("Copied!", "fa-clipboard"));
    } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        showToast("Copied!", "fa-clipboard");
    }
}

/* ─── MODAL ─── */
function showModal(type, title, msg) {
    const icons = {
        success: "fa-check",
        pending: "fa-clock",
        error: "fa-xmark",
    };
    document.getElementById("modalBox").innerHTML = `
        <div class="modal-icon ${type}"><i class="fa-solid ${icons[type]}"></i></div>
        <div class="modal-title">${title}</div>
        <div class="modal-msg">${msg}</div>
        <button class="modal-ok" onclick="closeModal()">OK, Got it</button>`;
    document.getElementById("modal").classList.add("show");
}
function closeModal() {
    document.getElementById("modal").classList.remove("show");
}
document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal")) closeModal();
});

/* ─── TOAST ─── */
let toastTimer;
function showToast(msg, icon = "fa-circle-check") {
    const t = document.getElementById("toast");
    document.getElementById("toastMsg").textContent = msg;
    t.querySelector("i").className = `fa-solid ${icon}`;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

/* ─── BOOT ─── */
window.addEventListener("load", () => {
    setTimeout(
        () => document.getElementById("pageLoader").classList.add("hidden"),
        1200
    );
    updateBalanceAfter();
});