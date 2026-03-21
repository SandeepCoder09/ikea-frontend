// referrals/script.js 

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Authentication first
    requireAuth();

    // 2. Hide Page Loader
    setTimeout(() => {
        document.getElementById('pageLoader')?.classList.add('hidden');
    }, 800);

    // 3. Generate the Referral Link immediately
    const user = getUser(); // Uses helper from config.js
    if (user && user.referralCode) {
        // Build the link based on your sign-up page path
        const inviteLink = `${window.location.origin}/auth/sign-up/sign-up.html?ref=${user.referralCode}`;
        const input = document.getElementById('referralLink');
        if (input) {
            input.value = inviteLink;
        }
    }

    // 4. Fetch the real-time Team Data
    await loadTeam();
});

let TEAM_DATA = [];

/**
 * FETCH TEAM DATA & REVENUE STATS
 */
async function loadTeam() {
    const res = await apiFetch('/referrals/team');

    if (!res || !res.success) {
        return console.warn("Could not load team data from API.");
    }

    // Update Dashboard Top Strip
    setText('statTotalRefs', res.summary?.totalMembers || 0);
    setText('statTotalEarned', formatINR(res.income?.total || 0));

    // Calculate Active (Recharged) members
    const activeCount = res.members ? res.members.filter(m => m.recharge > 0).length : 0;
    setText('statActiveRefs', activeCount);

    // Render the List
    TEAM_DATA = res.members || [];
    renderMembers(TEAM_DATA);
}

/**
 * DISPLAY LIST OF MEMBERS
 */
function renderMembers(list) {
    const container = document.getElementById('memberList');
    if (!container) return; // Stop if the element doesn't exist on page

    // Update member count label
    setText('msCount', list.length);

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-clock"></i>
                <p>No members yet. Start inviting friends to earn commission!</p>
            </div>`;
        return;
    }

    // Map through list and generate cards
    container.innerHTML = list.slice(0, 15).map((m, i) => {
        // Show last 15 referrals
        const initials = (m.userId || 'ID').slice(5, 7).toUpperCase();
        return `
      <div class="member-card" style="animation-delay:${i * 0.05}s">
        <div class="mc-avatar mc-av-l${m.level}">${initials}</div>
        <div class="mc-info">
          <div class="mc-id">${m.userId || '—'}</div>
          <div class="mc-meta"><span class="level-pip">Level ${m.level}</span></div>
        </div>
        <div class="mc-right">
          <div class="mc-recharge">Ref: ${formatINR(m.recharge)}</div>
          <div class="mc-commission">+${formatINR(m.commission)}</div>
        </div>
      </div>`;
    }).join('');
}

/**
 * ROBUST COPY FUNCTION (Bypasses HTTP security blocks)
 */
function copyReferralLink() {
    const input = document.getElementById('referralLink');
    if (!input || !input.value || input.value.includes('Loading')) {
        return showToast('Referral link not ready!', 'fa-clock');
    }

    // Try modern Clipboard API (Works on HTTPS/Localhost)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(input.value)
            .then(() => showToast('Copied successfully!'))
            .catch(() => execCopyFallback(input));
    } else {
        // Fallback for IP address/HTTP (Older but works on all browsers)
        execCopyFallback(input);
    }
}

function execCopyFallback(el) {
    try {
        el.select();
        el.setSelectionRange(0, 99999); // Mobile compatibility
        const ok = document.execCommand('copy');
        if (ok) showToast('Link copied!');
        else showToast('Please copy manually', 'fa-circle-xmark');
    } catch (err) {
        showToast('Selection failed', 'fa-triangle-exclamation');
    }
}

/**
 * IMPROVED SOCIAL SHARING
 * Note: 'native' will only show the "all ways" menu on HTTPS or Localhost.
 * On your current IP address (HTTP), it will fall back to Copy.
 */
function shareSocial(type) {
    const link = document.getElementById('referralLink')?.value;
    if (!link || link.includes('Loading')) return showToast('Link not ready...', 'fa-clock');

    const promoText = `IKEA INDIA 🏠\nSign up and start earning daily income using my referral link:\n${link}`;
    const urlEncodedMsg = encodeURIComponent(promoText);

    if (type === 'whatsapp') {
        // Works on all connections (HTTP/HTTPS)
        window.open(`https://wa.me/?text=${urlEncodedMsg}`);
    }
    else if (type === 'telegram') {
        // Works on all connections (HTTP/HTTPS)
        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(promoText)}`);
    }
    else if (type === 'native') {
        // This only works on HTTPS/Localhost
        if (navigator.share && window.isSecureContext) {
            navigator.share({
                title: 'Join IKEA India',
                text: 'Sign up to start earning daily income.',
                url: link
            })
                .then(() => showToast('Thanks for sharing!'))
                .catch(() => copyReferralLink()); // Fallback if user cancels
        } else {
            // Browsers (Chrome/Safari) block this on IP addresses
            showToast('Sharing menu blocked on HTTP. Link copied!', 'fa-link');
            copyReferralLink();
        }
    }
}

/** 
 * HELPER FUNCTIONS 
 */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}