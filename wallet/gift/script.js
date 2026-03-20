/* ════════════════════════════════════════
 VALID CODES — replace with real API
════════════════════════════════════════ */
const VALID_CODES = {
    IKEA2026: { amount: 500, desc: "IKEA Welcome Bonus" },
    WELCOME500: { amount: 500, desc: "Welcome Offer" },
    DIWALI200: { amount: 200, desc: "Diwali Special" },
    SUMMER100: { amount: 100, desc: "Summer Sale Reward" },
    IKEAVIP1000: { amount: 1000, desc: "VIP Member Bonus" },
    LUCKY250: { amount: 250, desc: "Lucky Draw Prize" },
};

/* ── HISTORY STATE ── */
let redeemHistory = [
    // demo entry — remove if starting fresh
    {
        code: "WELCOME500",
        amount: 500,
        desc: "Welcome Offer",
        date: "2026-03-10",
        time: "09:00 AM",
    },
];

/* already-used codes set */
const usedCodes = new Set(redeemHistory.map((h) => h.code));

/* ── UPDATE HERO STATS ── */
function updateStats() {
    const total = redeemHistory.reduce((s, h) => s + h.amount, 0);
    const last = redeemHistory.length
        ? redeemHistory[redeemHistory.length - 1].code.slice(0, 7) + "…"
        : "—";
    document.getElementById("hsTotalRedeemed").textContent =
        redeemHistory.length;
    document.getElementById("hsTotalEarned").textContent =
        "₹" + total.toLocaleString("en-IN");
    document.getElementById("hsLastCode").textContent = last;

    const badge = document.getElementById("historyBadge");
    if (redeemHistory.length > 0) {
        badge.style.display = "flex";
        badge.textContent =
            redeemHistory.length > 9 ? "9+" : redeemHistory.length;
    } else {
        badge.style.display = "none";
    }
}

/* ── CODE INPUT ── */
function onCodeInput(input) {
    // auto uppercase + remove spaces for clean comparison
    input.value = input.value.toUpperCase().replace(/\s+/g, "");
    input.classList.remove("valid", "invalid");
    const btn = document.getElementById("redeemBtn");
    btn.disabled = input.value.length < 4;
}

/* paste from clipboard */
async function pasteCode() {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById("giftCodeInput");
        input.value = text.toUpperCase().trim().replace(/\s+/g, "");
        onCodeInput(input);
        showToast("Code pasted!", "fa-clipboard");
    } catch {
        showToast("Paste manually please", "fa-circle-info");
    }
}

/* ── REDEEM ── */
function redeemCode() {
    const input = document.getElementById("giftCodeInput");
    const code = input.value.trim().toUpperCase();

    if (!code) return;

    document.getElementById("processingScreen").classList.add("show");

    setTimeout(() => {
        document.getElementById("processingScreen").classList.remove("show");

        // Already used
        if (usedCodes.has(code)) {
            input.classList.add("invalid");
            showErrorModal(
                "Already Redeemed",
                `The code <strong>${code}</strong> has already been used. Each gift code can only be redeemed once.`
            );
            return;
        }

        // Invalid
        if (!VALID_CODES[code]) {
            input.classList.add("invalid");
            showErrorModal(
                "Invalid Code",
                `The code <strong>${code}</strong> is not valid or has expired. Please check and try again.`
            );
            return;
        }

        // SUCCESS
        const { amount, desc } = VALID_CODES[code];
        input.classList.add("valid");
        usedCodes.add(code);

        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        redeemHistory.push({ code, amount, desc, date, time });
        updateStats();

        input.value = "";
        input.classList.remove("valid");
        document.getElementById("redeemBtn").disabled = true;

        showSuccessModal(code, amount, desc);

        // ← real API call here:
        // await fetch('/api/gift/redeem', { method:'POST', body: JSON.stringify({ code }) })
    }, 1800);
}

/* ── SUCCESS MODAL ── */
const CONFETTI_COLORS = [
    "#FFD700",
    "#003087",
    "#16A34A",
    "#EA580C",
    "#7C3AED",
    "#F87171",
];
function makeConfetti() {
    let html = "";
    for (let i = 0; i < 18; i++) {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        html += `<div class="confetti-piece" style="left:${left}%;animation-delay:${delay}s;background:${color}"></div>`;
    }
    return `<div class="confetti">${html}</div>`;
}

function showSuccessModal(code, amount, desc) {
    document.getElementById("modalBox").innerHTML = `
  ${makeConfetti()}
  <div class="modal-icon success"><i class="fa-solid fa-check"></i></div>
  <div class="modal-amount">+₹${amount.toLocaleString("en-IN")}</div>
  <div class="modal-title">Code Redeemed! 🎉</div>
  <div class="modal-msg">
    <strong>${code}</strong> — ${desc}<br>
    ₹${amount.toLocaleString(
        "en-IN"
    )} has been credited to your wallet instantly.
  </div>
  <button class="modal-ok" onclick="closeModal()">
    <i class="fa-solid fa-wallet"></i> View Wallet
  </button>`;
    document.getElementById("modal").classList.add("show");
}

function showErrorModal(title, msg) {
    document.getElementById("modalBox").innerHTML = `
  <div class="modal-icon error"><i class="fa-solid fa-xmark"></i></div>
  <div class="modal-err-title">${title}</div>
  <div class="modal-err-msg">${msg}</div>
  <button class="modal-ok" onclick="closeModal()" style="background:var(--danger)">
    Try Again
  </button>`;
    document.getElementById("modal").classList.add("show");
}

function closeModal() {
    document.getElementById("modal").classList.remove("show");
}
document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal")) closeModal();
});

/* ── HISTORY DRAWER ── */
function openHistory() {
    renderHistory();
    document.getElementById("drawerBg").classList.add("open");
    document.getElementById("historyDrawer").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeHistory() {
    document.getElementById("drawerBg").classList.remove("open");
    document.getElementById("historyDrawer").classList.remove("open");
    document.body.style.overflow = "";
}

function renderHistory() {
    const list = document.getElementById("historyList");
    const sub = document.getElementById("dwhSub");
    sub.textContent =
        redeemHistory.length +
        " code" +
        (redeemHistory.length !== 1 ? "s" : "") +
        " redeemed";

    if (!redeemHistory.length) {
        list.innerHTML = `
    <div class="dw-empty">
      <div class="e-icon"><i class="fa-solid fa-gift"></i></div>
      <h4>No History Yet</h4>
      <p>Redeemed codes will appear here.</p>
    </div>`;
        return;
    }

    // newest first
    list.innerHTML = [...redeemHistory]
        .reverse()
        .map(
            (h, i) => `
  <div class="hi-item" style="animation-delay:${i * 0.05}s">
    <div class="hi-icon"><i class="fa-solid fa-gift"></i></div>
    <div class="hi-info">
      <div class="hi-code">${h.code}</div>
      <div class="hi-meta">
        <span class="hi-date">${h.date} · ${h.time}</span>
        <span class="hi-badge">Redeemed</span>
      </div>
      <div style="font-size:.7rem;color:var(--grey);margin-top:3px">${h.desc
                }</div>
    </div>
    <div class="hi-amount">+₹${h.amount.toLocaleString("en-IN")}</div>
  </div>`
        )
        .join("");
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

/* ── BOOT ── */
window.addEventListener("load", () => {
    setTimeout(
        () => document.getElementById("pageLoader").classList.add("hidden"),
        1200
    );
    updateStats();
});