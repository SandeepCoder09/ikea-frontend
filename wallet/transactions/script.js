
/* ─── TYPE CONFIG ─── */
const CFG = {
    deposit: {
        label: "Deposit",
        icon: "fa-arrow-down-to-line",
        cls: "ti-deposit",
        dir: "cr",
    },
    withdraw: {
        label: "Withdrawal",
        icon: "fa-arrow-up-from-bracket",
        cls: "ti-withdraw",
        dir: "dr",
    },
    commission: {
        label: "Commission",
        icon: "fa-coins",
        cls: "ti-commission",
        dir: "cr",
    },
    gift: {
        label: "Gift Code",
        icon: "fa-gift",
        cls: "ti-gift",
        dir: "cr",
    },
    invite: {
        label: "Invite Reward",
        icon: "fa-user-plus",
        cls: "ti-invite",
        dir: "cr",
    },
    earning: {
        label: "Plan Earning",
        icon: "fa-chart-line",
        cls: "ti-earning",
        dir: "cr",
    },
};

/* ─── MOCK DATA ─── replace with real API */
const TXNS = [
    {
        id: "TXN-8821",
        type: "deposit",
        amount: 5000,
        status: "success",
        date: "2026-03-20",
        time: "10:42 AM",
        ref: "DEP-20260320-001",
        balance: 17480,
        note: "UPI Deposit via PhonePe",
    },
    {
        id: "TXN-8820",
        type: "earning",
        amount: 600,
        status: "success",
        date: "2026-03-20",
        time: "08:00 AM",
        ref: "EARN-20260320-001",
        balance: 12480,
        note: "IKEA Plus Plan — Day 4",
    },
    {
        id: "TXN-8819",
        type: "commission",
        amount: 150,
        status: "success",
        date: "2026-03-19",
        time: "06:15 PM",
        ref: "COM-20260319-003",
        balance: 11880,
        note: "Level 1 from IKEA-2841",
    },
    {
        id: "TXN-8818",
        type: "withdraw",
        amount: 3000,
        status: "success",
        date: "2026-03-19",
        time: "02:30 PM",
        ref: "WDR-20260319-002",
        balance: 11730,
        note: "Bank Transfer to HDFC XXXX4242",
    },
    {
        id: "TXN-8817",
        type: "earning",
        amount: 600,
        status: "success",
        date: "2026-03-19",
        time: "08:00 AM",
        ref: "EARN-20260319-001",
        balance: 14730,
        note: "IKEA Plus Plan — Day 3",
    },
    {
        id: "TXN-8816",
        type: "invite",
        amount: 200,
        status: "success",
        date: "2026-03-18",
        time: "04:55 PM",
        ref: "INV-20260318-005",
        balance: 14130,
        note: "Referral bonus — IKEA-5512",
    },
    {
        id: "TXN-8815",
        type: "commission",
        amount: 90,
        status: "success",
        date: "2026-03-18",
        time: "03:10 PM",
        ref: "COM-20260318-004",
        balance: 13930,
        note: "Level 1 from IKEA-3392",
    },
    {
        id: "TXN-8814",
        type: "earning",
        amount: 600,
        status: "success",
        date: "2026-03-18",
        time: "08:00 AM",
        ref: "EARN-20260318-001",
        balance: 13840,
        note: "IKEA Plus Plan — Day 2",
    },
    {
        id: "TXN-8813",
        type: "gift",
        amount: 500,
        status: "success",
        date: "2026-03-17",
        time: "11:30 AM",
        ref: "GIFT-20260317-002",
        balance: 13240,
        note: "Gift code IKEA2026 redeemed",
    },
    {
        id: "TXN-8812",
        type: "deposit",
        amount: 3000,
        status: "success",
        date: "2026-03-17",
        time: "09:20 AM",
        ref: "DEP-20260317-001",
        balance: 12740,
        note: "UPI Deposit via Paytm",
    },
    {
        id: "TXN-8811",
        type: "earning",
        amount: 600,
        status: "success",
        date: "2026-03-17",
        time: "08:00 AM",
        ref: "EARN-20260317-001",
        balance: 9740,
        note: "IKEA Plus Plan — Day 1",
    },
    {
        id: "TXN-8810",
        type: "withdraw",
        amount: 2000,
        status: "pending",
        date: "2026-03-16",
        time: "05:45 PM",
        ref: "WDR-20260316-003",
        balance: 9140,
        note: "Bank Transfer — Under Review",
    },
    {
        id: "TXN-8809",
        type: "commission",
        amount: 300,
        status: "success",
        date: "2026-03-16",
        time: "12:00 PM",
        ref: "COM-20260316-002",
        balance: 11140,
        note: "Level 1 from IKEA-4471",
    },
    {
        id: "TXN-8808",
        type: "invite",
        amount: 200,
        status: "success",
        date: "2026-03-15",
        time: "08:30 PM",
        ref: "INV-20260315-004",
        balance: 10840,
        note: "Referral bonus — IKEA-4471",
    },
    {
        id: "TXN-8807",
        type: "deposit",
        amount: 10000,
        status: "success",
        date: "2026-03-15",
        time: "11:00 AM",
        ref: "DEP-20260315-001",
        balance: 10640,
        note: "NEFT Deposit SBI account",
    },
    {
        id: "TXN-8806",
        type: "withdraw",
        amount: 5000,
        status: "failed",
        date: "2026-03-14",
        time: "03:20 PM",
        ref: "WDR-20260314-002",
        balance: 640,
        note: "Insufficient balance — Rejected",
    },
    {
        id: "TXN-8805",
        type: "gift",
        amount: 250,
        status: "success",
        date: "2026-03-13",
        time: "07:10 PM",
        ref: "GIFT-20260313-001",
        balance: 640,
        note: "Gift code WELCOME500 redeemed",
    },
    {
        id: "TXN-8804",
        type: "commission",
        amount: 75,
        status: "success",
        date: "2026-03-12",
        time: "02:00 PM",
        ref: "COM-20260312-003",
        balance: 390,
        note: "Level 2 from IKEA-6603",
    },
    {
        id: "TXN-8803",
        type: "invite",
        amount: 200,
        status: "success",
        date: "2026-03-11",
        time: "10:45 AM",
        ref: "INV-20260311-002",
        balance: 315,
        note: "Referral bonus — IKEA-3392",
    },
    {
        id: "TXN-8802",
        type: "deposit",
        amount: 1000,
        status: "success",
        date: "2026-03-10",
        time: "09:00 AM",
        ref: "DEP-20260310-001",
        balance: 115,
        note: "UPI Deposit via Google Pay",
    },
    {
        id: "TXN-8801",
        type: "invite",
        amount: 200,
        status: "success",
        date: "2026-03-08",
        time: "06:30 PM",
        ref: "INV-20260308-001",
        balance: 115,
        note: "Referral bonus — IKEA-2841",
    },
    {
        id: "TXN-8800",
        type: "deposit",
        amount: 500,
        status: "success",
        date: "2026-03-05",
        time: "04:00 PM",
        ref: "DEP-20260305-001",
        balance: 115,
        note: "First deposit bonus credited",
    },
];

/* ─── STATE ─── */
let activeType = "all";
let visibleCount = 10;
const PAGE_SIZE = 10;

/* ─── FILTER ─── */
function getFiltered() {
    const q = (
        document.getElementById("searchInput").value || ""
    ).toLowerCase();
    const from = document.getElementById("dateFrom").value;
    const to = document.getElementById("dateTo").value;
    return TXNS.filter((t) => {
        if (activeType !== "all" && t.type !== activeType) return false;
        if (
            q &&
            !t.type.includes(q) &&
            !t.ref.toLowerCase().includes(q) &&
            !t.note.toLowerCase().includes(q) &&
            !CFG[t.type].label.toLowerCase().includes(q)
        )
            return false;
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        return true;
    });
}

function setType(type, el) {
    activeType = type;
    document
        .querySelectorAll(".tp-btn")
        .forEach((b) => b.classList.remove("active"));
    el.classList.add("active");
    visibleCount = PAGE_SIZE;
    renderList();
}

function applyFilters() {
    visibleCount = PAGE_SIZE;
    renderList();
}
function clearDates() {
    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";
    applyFilters();
}
function clearSearch() {
    document.getElementById("searchInput").value = "";
    applyFilters();
}

/* ─── SUMMARY ─── */
function updateSummary(list) {
    const totalIn = list
        .filter((t) => CFG[t.type].dir === "cr" && t.status !== "failed")
        .reduce((s, t) => s + t.amount, 0);
    const totalOut = list
        .filter((t) => CFG[t.type].dir === "dr" && t.status !== "failed")
        .reduce((s, t) => s + t.amount, 0);
    document.getElementById("bannerTotal").textContent =
        "₹" + totalIn.toLocaleString("en-IN");
    document.getElementById("bannerCount").textContent =
        list.length + " Records";
    document.getElementById("bsIn").textContent =
        "₹" + totalIn.toLocaleString("en-IN");
    document.getElementById("bsOut").textContent =
        "₹" + totalOut.toLocaleString("en-IN");
    document.getElementById("bsCnt").textContent = list.length;
}

/* ─── GROUP BY DATE ─── */
function groupByDate(list) {
    return list.reduce((g, t) => {
        (g[t.date] = g[t.date] || []).push(t);
        return g;
    }, {});
}

function dateLabel(str) {
    const d = new Date(str + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (d.getTime() === now.getTime()) return "Today";
    if (d.getTime() === yest.getTime()) return "Yesterday";
    return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/* ─── RENDER ─── */
function renderList() {
    const filtered = getFiltered();
    const visible = filtered.slice(0, visibleCount);
    const wrap = document.getElementById("txnList");
    const btn = document.getElementById("loadMoreBtn");

    updateSummary(filtered);

    if (!filtered.length) {
        wrap.innerHTML = `
    <div class="empty-state">
      <div class="es-icon"><i class="fa-solid fa-receipt"></i></div>
      <h4>No Transactions Found</h4>
      <p>Try adjusting your search or filters.</p>
    </div>`;
        btn.style.display = "none";
        return;
    }

    const groups = groupByDate(visible);
    let html = "";
    let delay = 0;

    Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .forEach((date) => {
            html += `<div class="date-group"><div class="dg-label">${dateLabel(
                date
            )}</div>`;
            groups[date].forEach((t) => {
                const c = CFG[t.type];
                const sign = c.dir === "cr" ? "+" : "−";
                const stC =
                    t.status === "success"
                        ? "ss"
                        : t.status === "pending"
                            ? "sp"
                            : "sf";
                const stL = t.status.charAt(0).toUpperCase() + t.status.slice(1);
                html += `
    <div class="txn-item ${c.dir}" style="animation-delay:${delay * 0.04
                    }s" onclick="openDrawer('${t.id}')">
      <div class="ti ${c.cls}"><i class="fa-solid ${c.icon}"></i></div>
      <div class="ti-info">
        <div class="ti-title">${c.label}</div>
        <div class="ti-meta">
          <span class="ti-time">${t.time}</span>
          <span class="ti-status ${stC}">${stL}</span>
        </div>
      </div>
      <div class="ti-right">
        <div class="ti-amount ${c.dir}">${sign}₹${t.amount.toLocaleString(
                        "en-IN"
                    )}</div>
        <div class="ti-bal">Bal ₹${t.balance.toLocaleString(
                        "en-IN"
                    )}</div>
      </div>
    </div>`;
                delay++;
            });
            html += `</div>`;
        });

    wrap.innerHTML = html;
    btn.style.display = filtered.length > visibleCount ? "flex" : "none";
}

function loadMore() {
    visibleCount += PAGE_SIZE;
    renderList();
}

/* ─── DRAWER ─── */
function openDrawer(id) {
    const t = TXNS.find((x) => x.id === id);
    if (!t) return;
    const c = CFG[t.type];
    const sign = c.dir === "cr" ? "+" : "−";
    const stC =
        t.status === "success" ? "ss" : t.status === "pending" ? "sp" : "sf";
    const stL = t.status.charAt(0).toUpperCase() + t.status.slice(1);

    document.getElementById("dhIcon").className = `dh-icon ${c.cls}`;
    document.getElementById(
        "dhIcon"
    ).innerHTML = `<i class="fa-solid ${c.icon}"></i>`;
    document.getElementById("dhTitle").textContent = c.label;
    document.getElementById("dhRef").textContent = t.ref;
    document.getElementById(
        "dhAmt"
    ).textContent = `${sign}₹${t.amount.toLocaleString("en-IN")}`;
    document.getElementById("dhAmt").className = `dab-amt ${c.dir}`;
    document.getElementById(
        "dhStatus"
    ).innerHTML = `<span class="ti-status ${stC}" style="font-size:.72rem;padding:5px 12px">${stL}</span>`;

    document.getElementById("dhRows").innerHTML = `
  <div class="dr-row"><span class="dr-lbl"><i class="fa-solid fa-calendar"></i> Date</span><span class="dr-val">${t.date
        } · ${t.time}</span></div>
  <div class="dr-row"><span class="dr-lbl"><i class="fa-solid fa-tag"></i> Type</span><span class="dr-val">${c.label
        }</span></div>
  <div class="dr-row"><span class="dr-lbl"><i class="fa-solid fa-hashtag"></i> Reference</span><span class="dr-val">${t.ref
        }</span></div>
  <div class="dr-row"><span class="dr-lbl"><i class="fa-solid fa-wallet"></i> Balance After</span><span class="dr-val">₹${t.balance.toLocaleString(
            "en-IN"
        )}</span></div>
  <div class="dr-row"><span class="dr-lbl"><i class="fa-solid fa-circle-info"></i> Note</span><span class="dr-val">${t.note
        }</span></div>`;

    document.getElementById("drawerBg").classList.add("open");
    document.getElementById("drawer").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeDrawer() {
    document.getElementById("drawerBg").classList.remove("open");
    document.getElementById("drawer").classList.remove("open");
    document.body.style.overflow = "";
}

/* ─── BOOT ─── */
window.addEventListener("load", () => {
    setTimeout(
        () => document.getElementById("pageLoader").classList.add("hidden"),
        1200
    );
    renderList();
});