// home/script.js
document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();

    /* ── Loader ── */
    const loader = document.getElementById('pageLoader');
    setTimeout(() => loader?.classList.add('hidden'), 1200);

    /* ── Fill user greeting if element exists ── */
    const user = getUser();
    if (user) {
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = user.name || 'Member';
    }

    /* ── Live Ticker ── */
    buildTicker();

    /* ── Scroll Reveal ── */
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealEls.forEach(el => observer.observe(el));
});

/* ── Live Ticker ── */
function buildTicker() {
    const orders = [
        { name: 'Priya S.', city: 'Mumbai', item: 'BILLY Bookcase', amt: '₹4,999' },
        { name: 'Arjun K.', city: 'Bangalore', item: 'MALM Bed Frame', amt: '₹18,990' },
        { name: 'Sneha R.', city: 'Hyderabad', item: 'KALLAX Shelf', amt: '₹6,499' },
        { name: 'Rahul M.', city: 'Delhi', item: 'POÄNG Chair', amt: '₹8,990' },
        { name: 'Divya P.', city: 'Chennai', item: 'LACK Table', amt: '₹2,499' },
        { name: 'Amit T.', city: 'Pune', item: 'HEMNES Wardrobe', amt: '₹22,500' },
    ];
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    const items = [...orders, ...orders];
    track.innerHTML = items.map(o => `
      <span class="ticker-item">
        <i class="fa-solid fa-circle-check" style="color:var(--yellow)"></i>
        <strong>${o.name}</strong> from ${o.city} ordered
        <span class="amount">${o.item}</span>
        <span class="sep">·</span>
        <span class="amount">${o.amt}</span>
      </span>`).join('');
}