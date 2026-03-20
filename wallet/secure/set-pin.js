
let newPin = "";
let confirmPin = "";
let activeField = "new"; // 'new' | 'confirm'

function focusInput(id) {
    document.getElementById(id).focus();
}

/* update dot visuals */
function renderDots(pin, prefix) {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById(prefix + i);
        dot.classList.remove("filled", "active", "error", "success");
        if (i < pin.length) {
            dot.textContent = "●";
            dot.classList.add("filled");
        } else {
            dot.textContent = "—";
            if (i === pin.length) dot.classList.add("active");
        }
    }
}

/* numpad press */
function numpadPress(digit) {
    if (activeField === "new") {
        if (newPin.length >= 4) return;
        newPin += digit;
        renderDots(newPin, "newDot");
        if (newPin.length === 4) {
            activeField = "confirm";
            setTimeout(() => focusInput("confirmPinInput"), 100);
        }
    } else {
        if (confirmPin.length >= 4) return;
        confirmPin += digit;
        renderDots(confirmPin, "confDot");
    }
    checkReady();
}

function numpadDelete() {
    if (activeField === "confirm" && confirmPin.length === 0) {
        activeField = "new";
    }
    if (activeField === "new") {
        newPin = newPin.slice(0, -1);
        renderDots(newPin, "newDot");
    } else {
        confirmPin = confirmPin.slice(0, -1);
        renderDots(confirmPin, "confDot");
    }
    checkReady();
}

function checkReady() {
    document.getElementById("setPinBtn").disabled = !(
        newPin.length === 4 && confirmPin.length === 4
    );
}

function setPin() {
    if (newPin.length < 4 || confirmPin.length < 4) return;

    if (newPin !== confirmPin) {
        // shake error
        ["confDot0", "confDot1", "confDot2", "confDot3"].forEach((id) => {
            const d = document.getElementById(id);
            d.classList.add("error");
            setTimeout(() => d.classList.remove("error", "filled"), 700);
        });
        confirmPin = "";
        renderDots(confirmPin, "confDot");
        activeField = "confirm";
        showToast("PINs don't match. Try again.", "fa-triangle-exclamation");
        return;
    }

    // success visual
    [
        "newDot0",
        "newDot1",
        "newDot2",
        "newDot3",
        "confDot0",
        "confDot1",
        "confDot2",
        "confDot3",
    ].forEach((id) => {
        const d = document.getElementById(id);
        d.classList.remove("filled", "active");
        d.classList.add("success");
        d.textContent = "✓";
    });

    // save to localStorage
    localStorage.setItem("withdrawPin", newPin);

    setTimeout(() => {
        document.getElementById("successOverlay").classList.add("show");
        // auto redirect after 2s
        setTimeout(goToWithdraw, 2000);
    }, 400);
}

function goToWithdraw() {
    window.location.href = "../../wallet/withdrawal/index.html";
}

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

window.addEventListener("load", () => {
    setTimeout(
        () => document.getElementById("pageLoader").classList.add("hidden"),
        1000
    );
    renderDots(newPin, "newDot");
    renderDots(confirmPin, "confDot");
});