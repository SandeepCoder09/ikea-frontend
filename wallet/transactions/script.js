// transactions/script.js
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);
    await loadTransactions();
});

/* ── Type config ── */
const CFG = {
    deposit: { label: 'Deposit', icon: 'fa-circle-arrow-down', cls: 'ti-deposit', dir: 'cr', color: '#16A34A', bg: '#DCFCE7' },
    withdraw: { label: 'Withdrawal', icon: 'fa-circle-arrow-up', cls: 'ti-withdraw', dir: 'dr', color: '#DC2626', bg: '#FEE2E2' },
    commission: { label: 'Commission', icon: 'fa-coins', cls: 'ti-commission', dir: 'cr', color: '#D97706', bg: '#FEF3C7' },
    gift: { label: 'Gift Code', icon: 'fa-gift', cls: 'ti-gift', dir: 'cr', color: '#7C3AED', bg: '#EDE9FE' },
    invite: { label: 'Invite Reward', icon: 'fa-user-plus', cls: 'ti-invite', dir: 'cr', color: '#0891B2', bg: '#CFFAFE' },
    earning: { label: 'Plan Earning', icon: 'fa-chart-line', cls: 'ti-earning', dir: 'cr', color: '#16A34A', bg: '#DCFCE7' },
};

let ALL_TXN = [];
let activeType = 'all';
let visibleCnt = 10;
let currentRef = ''; // stores ref for copy button

/* ── Load from API ── */
async function loadTransactions() {
    const res = await apiFetch('/wallet/transactions?limit=100');
    if (!res?.success) return showToast('Failed to load transactions', 'fa-xmark');
    ALL_TXN = res.transactions;
    renderList();
}

/* ── Filter ── */
function getFiltered() {
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const from = document.getElementById('dateFrom')?.value;
    const to = document.getElementById('dateTo')?.value;
    return ALL_TXN.filter(t => {
        const dateStr = t.createdAt.slice(0, 10);
        if (activeType !== 'all' && t.type !== activeType) return false;
        if (q && !t.type.includes(q) && !t.ref?.toLowerCase().includes(q) && !t.note?.toLowerCase().includes(q)) return false;
        if (from && dateStr < from) return false;
        if (to && dateStr > to) return false;
        return true;
    });
}

/* ── Summary ── */
function updateSummary(list) {
    const totalIn = list.filter(t => CFG[t.type]?.dir === 'cr' && t.status !== 'failed').reduce((s, t) => s + t.amount, 0);
    const totalOut = list.filter(t => CFG[t.type]?.dir === 'dr' && t.status !== 'failed').reduce((s, t) => s + t.amount, 0);
    document.getElementById('bannerTotal').textContent = formatINR(totalIn);
    document.getElementById('bannerCount').textContent = list.length + ' Records';
    document.getElementById('bsIn').textContent = formatINR(totalIn);
    document.getElementById('bsOut').textContent = formatINR(totalOut);
    document.getElementById('bsCnt').textContent = list.length;
}

/* ── Render list ── */
function renderList() {
    const filtered = getFiltered();
    const visible = filtered.slice(0, visibleCnt);
    const wrap = document.getElementById('txnList');
    const btn = document.getElementById('loadMoreBtn');
    updateSummary(filtered);

    if (!filtered.length) {
        wrap.innerHTML = `
            <div class="empty-state">
                <div class="es-icon"><i class="fa-solid fa-receipt"></i></div>
                <h4>No Transactions Found</h4>
                <p>Try adjusting your filters.</p>
            </div>`;
        if (btn) btn.style.display = 'none';
        return;
    }

    const groups = visible.reduce((g, t) => {
        const d = t.createdAt.slice(0, 10);
        (g[d] = g[d] || []).push(t);
        return g;
    }, {});

    let html = '', delay = 0;
    Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach(date => {
        html += `<div class="date-group"><div class="dg-label">${dateLabel(date)}</div>`;
        groups[date].forEach(t => {
            const c = CFG[t.type] || CFG.deposit;
            const sign = c.dir === 'cr' ? '+' : '−';
            const stC = t.status === 'success' ? 'ss' : t.status === 'pending' ? 'sp' : 'sf';
            const stL = t.status.charAt(0).toUpperCase() + t.status.slice(1);
            const time = new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            html += `
                <div class="txn-item ${c.dir}" style="animation-delay:${delay * .04}s" onclick="openDrawer('${t._id}')">
                    <div class="ti ${c.cls}"><i class="fa-solid ${c.icon}"></i></div>
                    <div class="ti-info">
                        <div class="ti-title">${c.label}</div>
                        <div class="ti-meta">
                            <span class="ti-time"><i class="fa-regular fa-clock"></i> ${time}</span>
                            <span class="ti-status ${stC}">${stL}</span>
                        </div>
                    </div>
                    <div class="ti-right">
                        <div class="ti-amount ${c.dir}">${sign}${formatINR(t.amount)}</div>
                        <div class="ti-bal">Bal ${formatINR(t.balanceAfter || 0)}</div>
                    </div>
                </div>`;
            delay++;
        });
        html += `</div>`;
    });

    wrap.innerHTML = html;
    if (btn) btn.style.display = filtered.length > visibleCnt ? 'flex' : 'none';
}

function dateLabel(str) {
    const d = new Date(str + 'T00:00:00');
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (d.getTime() === now.getTime()) return 'Today';
    if (d.getTime() === yest.getTime()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Filter controls ── */
function setType(type, el) {
    activeType = type;
    document.querySelectorAll('.tp-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    visibleCnt = 10;
    renderList();
}
function applyFilters() { visibleCnt = 10; renderList(); }
function clearDates() { document.getElementById('dateFrom').value = ''; document.getElementById('dateTo').value = ''; applyFilters(); }
function clearSearch() { document.getElementById('searchInput').value = ''; applyFilters(); }
function loadMore() { visibleCnt += 10; renderList(); }

/* ════════════════════════════════════════════
   OPEN DRAWER
════════════════════════════════════════════ */
function openDrawer(id) {
    const t = ALL_TXN.find(x => x._id === id);
    if (!t) return;

    const c = CFG[t.type] || CFG.deposit;
    const sign = c.dir === 'cr' ? '+' : '−';
    const stC = t.status === 'success' ? 'ss' : t.status === 'pending' ? 'sp' : 'sf';
    const stL = t.status.charAt(0).toUpperCase() + t.status.slice(1);
    const time = new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Save ref globally — used by copy button
    currentRef = t.ref || '';

    // Icon
    const iconEl = document.getElementById('dhIcon');
    iconEl.className = `dh-icon ${c.cls}`;
    iconEl.innerHTML = `<i class="fa-solid ${c.icon}"></i>`;

    // Title & ref
    document.getElementById('dhTitle').textContent = c.label;
    document.getElementById('dhRef').textContent = t.ref || '—';

    // Amount
    document.getElementById('dhAmt').textContent = `${sign}${formatINR(t.amount)}`;
    document.getElementById('dhAmt').className = `dab-amt ${c.dir}`;

    // Status
    const statusIcon = t.status === 'success' ? 'fa-circle-check' : t.status === 'pending' ? 'fa-clock' : 'fa-circle-xmark';
    document.getElementById('dhStatus').innerHTML = `
        <span class="ti-status ${stC}" style="font-size:.72rem;padding:5px 14px;display:flex;align-items:center;gap:5px">
            <i class="fa-solid ${statusIcon}" style="font-size:.65rem"></i> ${stL}
        </span>`;

    // Detail rows
    document.getElementById('dhRows').innerHTML = buildRows(t, c, time, sign);

    // Attach copy button — MUST be after innerHTML is set
    const copyBtn = document.getElementById('copyRefBtn');
    if (copyBtn) {
        copyBtn.onclick = function () {
            doCopy(currentRef);
        };
    }

    // Open drawer
    document.getElementById('drawerBg').classList.add('open');
    document.getElementById('drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
}

/* ── Build detail rows ── */
function buildRows(t, c, time, sign) {
    const meta = t.meta || {};

    const feeRow = t.fee > 0 ? `
        <div class="dr-row highlight-row">
            <span class="dr-lbl"><i class="fa-solid fa-percent" style="color:#DC2626"></i> Transaction Fee</span>
            <span class="dr-val red">−${formatINR(t.fee)}</span>
        </div>` : '';

    const netRow = (t.netAmount && t.fee > 0) ? `
        <div class="dr-row green-row">
            <span class="dr-lbl"><i class="fa-solid fa-indian-rupee-sign" style="color:#16A34A"></i> Net Received</span>
            <span class="dr-val green">${formatINR(t.netAmount)}</span>
        </div>` : '';

    let rows = `
        <div class="dr-section-title">
            <i class="fa-solid fa-circle-info"></i> Transaction Details
        </div>

        <div class="dr-row">
            <span class="dr-lbl"><i class="fa-solid fa-calendar-days"></i> Date & Time</span>
            <span class="dr-val">${formatDate(t.createdAt)} · ${time}</span>
        </div>

        <div class="dr-row">
            <span class="dr-lbl"><i class="fa-solid fa-tag"></i> Type</span>
            <span class="dr-val" style="display:flex;align-items:center;gap:6px">
                <i class="fa-solid ${c.icon}" style="color:${c.color};font-size:.75rem"></i> ${c.label}
            </span>
        </div>

        <div class="dr-row highlight-row">
            <span class="dr-lbl"><i class="fa-solid fa-indian-rupee-sign"></i> Amount</span>
            <span class="dr-val ${c.dir} bold">${sign}${formatINR(t.amount)}</span>
        </div>

        ${feeRow}
        ${netRow}

        <div class="dr-row">
            <span class="dr-lbl"><i class="fa-solid fa-wallet"></i> Balance After</span>
            <span class="dr-val">${formatINR(t.balanceAfter || 0)}</span>
        </div>

        <div class="dr-row">
            <span class="dr-lbl"><i class="fa-solid fa-hashtag"></i> Reference No.</span>
            <span class="dr-val ref-val">${t.ref || '—'}</span>
        </div>`;

    if (t.type === 'deposit') {
        rows += `
            <div class="dr-section-title" style="margin-top:10px">
                <i class="fa-solid fa-building-columns"></i> Deposit Info
            </div>
            <div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-mobile-screen-button"></i> Method</span>
                <span class="dr-val">${(meta.method || 'UPI').toUpperCase()}</span>
            </div>
            ${t.utr ? `<div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-receipt"></i> UTR / Ref</span>
                <span class="dr-val ref-val">${t.utr}</span>
            </div>` : ''}`;
    }

    if (t.type === 'withdraw') {
        const bank = meta.bank || {};
        rows += `
            <div class="dr-section-title" style="margin-top:10px">
                <i class="fa-solid fa-building-columns"></i> Bank Details
            </div>
            ${bank.name ? `<div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-landmark"></i> Bank</span>
                <span class="dr-val">${bank.name}</span>
            </div>` : ''}
            ${bank.accLast4 ? `<div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-credit-card"></i> Account</span>
                <span class="dr-val">XXXX XXXX ${bank.accLast4}</span>
            </div>` : ''}
            ${bank.ifsc ? `<div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-code"></i> IFSC</span>
                <span class="dr-val">${bank.ifsc}</span>
            </div>` : ''}
            <div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-percent"></i> Fee Rate</span>
                <span class="dr-val">10% of withdrawal</span>
            </div>`;
    }

    if (t.type === 'earning') {
        rows += `
            <div class="dr-section-title" style="margin-top:10px">
                <i class="fa-solid fa-chart-line"></i> Earning Info
            </div>
            <div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-box"></i> Plan</span>
                <span class="dr-val">${meta.productName || t.note || 'Investment Plan'}</span>
            </div>`;
    }

    if (t.type === 'commission') {
        rows += `
            <div class="dr-section-title" style="margin-top:10px">
                <i class="fa-solid fa-coins"></i> Commission Info
            </div>
            <div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-users"></i> Source</span>
                <span class="dr-val">${t.note || 'Referral Commission'}</span>
            </div>`;
    }

    if (t.type === 'gift') {
        rows += `
            <div class="dr-section-title" style="margin-top:10px">
                <i class="fa-solid fa-gift"></i> Gift Code Info
            </div>
            <div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-key"></i> Code Used</span>
                <span class="dr-val ref-val">${meta.code || '—'}</span>
            </div>
            <div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-circle-info"></i> Description</span>
                <span class="dr-val">${meta.description || 'Gift Reward'}</span>
            </div>`;
    }

    if (t.type === 'invite') {
        rows += `
            <div class="dr-section-title" style="margin-top:10px">
                <i class="fa-solid fa-user-plus"></i> Invite Info
            </div>
            <div class="dr-row">
                <span class="dr-lbl"><i class="fa-solid fa-circle-info"></i> Details</span>
                <span class="dr-val">${t.note || 'Referral Invite Reward'}</span>
            </div>`;
    }

    if (t.note) {
        rows += `
            <div class="dr-row" style="margin-top:4px">
                <span class="dr-lbl"><i class="fa-solid fa-note-sticky"></i> Note</span>
                <span class="dr-val note-val">${t.note}</span>
            </div>`;
    }

    // Copy button — no onclick attribute, event attached in openDrawer()
    rows += `
        <button class="copy-ref-btn" id="copyRefBtn">
            <i class="fa-solid fa-copy"></i> Copy Reference Number
        </button>`;

    return rows;
}

/* ── Copy — HTTP & HTTPS safe ── */
function doCopy(text) {
    if (!text || text.trim() === '' || text === 'undefined') {
        showToast('No reference available', 'fa-triangle-exclamation');
        return;
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('Reference copied! ✓', 'fa-clipboard'))
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, 99999);

    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(el);

    if (ok) {
        showToast('Reference copied! ✓', 'fa-clipboard');
    } else {
        // Last resort — native prompt so user can copy manually
        prompt('Long press & copy this reference:', text);
    }
}

/* ── Close drawer ── */
function closeDrawer() {
    document.getElementById('drawerBg').classList.remove('open');
    document.getElementById('drawer').classList.remove('open');
    document.body.style.overflow = '';
    currentRef = '';
}