// referrals/my-team.js  — My Team Overview page
document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 1200);
  await loadTeam();
});

let TEAM_DATA = [];
let activeLevel = 'all';

async function loadTeam() {
  const res = await apiFetch('/referrals/team');
  if (!res?.success) {
    showToast('Failed to load team data', 'fa-xmark');
    return;
  }

  const user = getUser();

  /* ── Hero Banner ── */
  const initials = (user?.name || 'IK').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  setText('heroAvatar', initials);
  setText('heroName', user?.name || 'Member');
  setText('heroId', 'ID: ' + (user?.uid || '—'));
  setText('hsTotalMembers', res.summary.totalMembers);
  setText('hsTotalRecharge', formatINR(res.summary.totalRecharge));
  setText('hsTotalComm', formatINR(res.summary.totalCommission));

  /* ── Income Overview ── */
  setText('igTotal', formatINR(res.income.total));
  setText('igToday', formatINR(res.income.today));
  setText('igYesterday', formatINR(res.income.yesterday));
  setText('igWeek', formatINR(res.income.week));
  setText('igMonth', formatINR(res.income.month || 0));

  /* ── Level Income ── */
  setText('lvl1Amt', formatINR(res.levelIncome.level1));
  setText('lvl2Amt', formatINR(res.levelIncome.level2));
  setText('lvl3Amt', formatINR(res.levelIncome.level3));

  /* ── Qualification Strip ── */
  const dot = document.getElementById('qualDot');
  const text = document.getElementById('qualText');
  const badge = document.getElementById('qualBadge');
  const l1Count = res.members.filter(m => m.level === 1).length;

  if (res.qualified) {
    if (dot) dot.className = 'qual-dot qualified';
    if (text) text.textContent = `Qualified · ${l1Count} direct referrals — level income active`;
    if (badge) { badge.textContent = 'Qualified'; badge.className = 'qual-badge ok'; }
  } else {
    if (dot) dot.className = 'qual-dot unqualified';
    if (text) text.textContent = `Not qualified yet · ${l1Count}/3 direct referrals needed`;
    if (badge) { badge.textContent = 'Not Qualified'; badge.className = 'qual-badge no'; }
  }

  /* ── Members ── */
  TEAM_DATA = res.members;
  setText('msCount', TEAM_DATA.length);
  renderMembers(TEAM_DATA);
}

/* ── Render member cards ── */
function renderMembers(list) {
  const container = document.getElementById('memberList');
  if (!container) return;

  setText('msCount', list.length);

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
    const initials = (m.name || m.userId || '??')
      .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const date = formatDate(m.joinDate);

    return `
    <div class="member-card" style="animation-delay:${i * 0.05}s">
      <div class="mc-avatar mc-av-l${m.level}">${initials}</div>
      <div class="mc-info">
        <div class="mc-id">${m.userId || '—'}</div>
        <div class="mc-meta">
          <span class="level-pip pip-l${m.level}">L${m.level}</span>
          <span class="mc-date">${date}</span>
        </div>
      </div>
      <div class="mc-right">
        <div class="mc-recharge">${formatINR(m.recharge)}</div>
        <div class="mc-commission">+${formatINR(m.commission)} comm.</div>
      </div>
    </div>`;
  }).join('');
}

/* ── Search ── */
function filterMembers() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let list = activeLevel === 'all'
    ? TEAM_DATA
    : TEAM_DATA.filter(m => String(m.level) === activeLevel);
  if (q) list = list.filter(m =>
    (m.userId || '').toLowerCase().includes(q) ||
    (m.name || '').toLowerCase().includes(q)
  );
  renderMembers(list);
}

/* ── Level filter pills ── */
function setLevel(level, el) {
  activeLevel = level;
  document.querySelectorAll('.lp-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  filterMembers();
}

/* ── Helper ── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}