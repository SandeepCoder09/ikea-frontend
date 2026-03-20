
const USER_ID = 'IKEA2026XY';
const BASE_URL = window.location.origin;
const REFERRAL_URL = `${BASE_URL}/auth/register?ref=${USER_ID}`;

const REFERRALS = [
    { name: 'Priya Sharma', initials: 'PS', date: '15 Mar 2026', earn: '₹54', level: 'l1', status: 'active' },
    { name: 'Arjun Kapoor', initials: 'AK', date: '12 Mar 2026', earn: '₹18', level: 'l2', status: 'active' },
    { name: 'Sneha Rao', initials: 'SR', date: '08 Mar 2026', earn: '₹18', level: 'l3', status: 'pending' },
    { name: 'Rahul Mehta', initials: 'RM', date: '01 Mar 2026', earn: '₹33', level: 'l1', status: 'active' },
    { name: 'Divya Patel', initials: 'DP', date: '22 Feb 2026', earn: '₹0', level: 'l2', status: 'pending' },
];

window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('pageLoader').classList.add('hidden'), 1200);
    document.getElementById('referralLink').value = REFERRAL_URL;

    const active = REFERRALS.filter(r => r.status === 'active').length;
    const earned = REFERRALS.reduce((s, r) => s + (parseInt(r.earn.replace(/[^0-9]/g, '')) || 0), 0);
    document.getElementById('statTotalRefs').textContent = REFERRALS.length;
    document.getElementById('statTotalEarned').textContent = '₹' + earned;
    document.getElementById('statActiveRefs').textContent = active;

    renderReferrals();
});

function renderReferrals() {
    const list = document.getElementById('referralList');
    if (!REFERRALS.length) {
        list.innerHTML = `<div class="empty-refs"><i class="fa-solid fa-user-group"></i><p>No referrals yet. Share your link to start earning!</p></div>`;
        return;
    }
    list.innerHTML = REFERRALS.map(r => `
        <div class="referral-item">
          <div class="ref-avatar">${r.initials}</div>
          <div class="ref-info">
            <div class="ref-name">${r.name}</div>
            <div class="ref-date"><i class="fa-regular fa-calendar" style="margin-right:4px"></i>${r.date}</div>
          </div>
          <div class="ref-right">
            <span class="ref-earn">${r.earn}/day</span>
            <span class="ref-level ${r.level}">${r.level.replace('l', 'Level ')}</span>
            <span class="ref-status ${r.status}">${r.status}</span>
          </div>
        </div>`).join('');
}

function copyReferralLink() {
    navigator.clipboard.writeText(REFERRAL_URL).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        showToast('Referral link copied!', 'fa-circle-check');
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy'; }, 2000);
    }).catch(() => { document.getElementById('referralLink').select(); document.execCommand('copy'); showToast('Link copied!', 'fa-circle-check'); });
}

function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent('🛋️ Join IKEA India & earn daily returns! ' + REFERRAL_URL)}`, '_blank');
}
function shareTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(REFERRAL_URL)}&text=${encodeURIComponent('🛋️ Join IKEA India!')}`, '_blank');
}
function shareNative() {
    if (navigator.share) navigator.share({ title: 'IKEA India Referral', text: 'Join IKEA India & earn daily!', url: REFERRAL_URL });
    else copyReferralLink();
}

let toastTimer;
function showToast(msg, icon = 'fa-circle-check') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.querySelector('i').className = `fa-solid ${icon}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}
