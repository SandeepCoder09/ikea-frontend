/* ── MOCK DATA — replace with real API ── */
const USER = { name: 'Arjun Kumar', id: 'IKEA-1042' };

const TEAM = [
    { userId: 'IKEA-2841', level: 1, recharge: 5000, commission: 150, joinDate: '2026-01-10' },
    { userId: 'IKEA-3392', level: 1, recharge: 3000, commission: 90, joinDate: '2026-01-15' },
    { userId: 'IKEA-4471', level: 1, recharge: 10000, commission: 300, joinDate: '2026-02-01' },
    { userId: 'IKEA-5512', level: 2, recharge: 2000, commission: 20, joinDate: '2026-02-10' },
    { userId: 'IKEA-6603', level: 2, recharge: 7500, commission: 75, joinDate: '2026-02-18' },
    { userId: 'IKEA-7714', level: 2, recharge: 4000, commission: 40, joinDate: '2026-03-01' },
    { userId: 'IKEA-8825', level: 3, recharge: 1500, commission: 15, joinDate: '2026-03-05' },
    { userId: 'IKEA-9936', level: 3, recharge: 8000, commission: 80, joinDate: '2026-03-10' },
];

let activeLevel = 'all';

function initHero() {
    const initials = USER.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('heroAvatar').textContent = initials;
    document.getElementById('heroName').textContent = USER.name;
    document.getElementById('heroId').textContent = 'ID: ' + USER.id;
    const totalR = TEAM.reduce((s, m) => s + m.recharge, 0);
    const totalC = TEAM.reduce((s, m) => s + m.commission, 0);
    document.getElementById('hsTotalMembers').textContent = TEAM.length;
    document.getElementById('hsTotalRecharge').textContent = '₹' + totalR.toLocaleString('en-IN');
    document.getElementById('hsTotalComm').textContent = '₹' + totalC.toLocaleString('en-IN');
}

function initIncome() {
    const total = TEAM.reduce((s, m) => s + m.commission, 0);
    document.getElementById('igTotal').textContent = '₹' + total.toLocaleString('en-IN');
    document.getElementById('igToday').textContent = '₹320';
    document.getElementById('igYesterday').textContent = '₹270';
    document.getElementById('igWeek').textContent = '₹1,480';
    document.getElementById('igMonth').textContent = '₹4,250';
    const l1 = TEAM.filter(m => m.level === 1).reduce((s, m) => s + m.commission, 0);
    const l2 = TEAM.filter(m => m.level === 2).reduce((s, m) => s + m.commission, 0);
    const l3 = TEAM.filter(m => m.level === 3).reduce((s, m) => s + m.commission, 0);
    document.getElementById('lvl1Amt').textContent = '₹' + l1.toLocaleString('en-IN');
    document.getElementById('lvl2Amt').textContent = '₹' + l2.toLocaleString('en-IN');
    document.getElementById('lvl3Amt').textContent = '₹' + l3.toLocaleString('en-IN');
}

function initQual() {
    const direct = TEAM.filter(m => m.level === 1).length;
    const ok = direct >= 3;
    document.getElementById('qualDot').className = 'qual-dot ' + (ok ? 'qualified' : 'unqualified');
    document.getElementById('qualText').textContent = ok
        ? `Qualified · ${direct} direct referrals — level income active`
        : `Not qualified yet · ${direct}/3 direct referrals needed`;
    document.getElementById('qualBadge').textContent = ok ? 'Qualified' : 'Not Qualified';
    document.getElementById('qualBadge').className = 'qual-badge ' + (ok ? 'ok' : 'no');
}

function renderMembers(list) {
    const container = document.getElementById('memberList');
    document.getElementById('msCount').textContent = list.length;
    if (!list.length) {
        container.innerHTML = `
          <div class="empty-members">
            <div class="e-icon"><i class="fa-solid fa-users-slash"></i></div>
            <h4>No Members Found</h4>
            <p>Try a different filter or search term.</p>
          </div>`;
        return;
    }
    container.innerHTML = list.map((m, i) => {
        const initials = m.userId.replace('IKEA-', '').slice(-2);
        const date = new Date(m.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        return `
        <div class="member-card" style="animation-delay:${i * 0.05}s">
          <div class="mc-avatar mc-av-l${m.level}">${initials}</div>
          <div>
            <div class="mc-id">${m.userId}</div>
            <div class="mc-meta">
              <span class="level-pip pip-l${m.level}">L${m.level}</span>
              <span class="mc-date">${date}</span>
            </div>
          </div>
          <div class="mc-right">
            <div class="mc-recharge">₹${m.recharge.toLocaleString('en-IN')}</div>
            <div class="mc-commission">+₹${m.commission.toLocaleString('en-IN')} comm.</div>
          </div>
        </div>`;
    }).join('');
}

function filterMembers() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    let list = activeLevel === 'all' ? TEAM : TEAM.filter(m => String(m.level) === activeLevel);
    if (q) list = list.filter(m => m.userId.toLowerCase().includes(q));
    renderMembers(list);
}

function setLevel(level, el) {
    activeLevel = level;
    document.querySelectorAll('.lp-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    filterMembers();
}

window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);
    initHero();
    initIncome();
    initQual();
    renderMembers(TEAM);
});