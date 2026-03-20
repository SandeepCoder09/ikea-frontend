/* ============================================================
   PAGE LOADER
============================================================ */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('pageLoader').classList.add('hidden');
    }, 1200);
});

/* ============================================================
   LIVE TICKER
============================================================ */
const orders = [
    { name: 'Priya S.', city: 'Mumbai', item: 'BILLY Bookcase', amt: '₹4,999' },
    { name: 'Arjun K.', city: 'Bangalore', item: 'MALM Bed Frame', amt: '₹18,990' },
    { name: 'Sneha R.', city: 'Hyderabad', item: 'KALLAX Shelf', amt: '₹6,499' },
    { name: 'Rahul M.', city: 'Delhi', item: 'POÄNG Chair', amt: '₹8,990' },
    { name: 'Divya P.', city: 'Chennai', item: 'LACK Table', amt: '₹2,499' },
    { name: 'Amit T.', city: 'Pune', item: 'HEMNES Wardrobe', amt: '₹22,500' },
    { name: 'Nisha B.', city: 'Kolkata', item: 'IVAR Cabinet', amt: '₹5,200' },
    { name: 'Kiran J.', city: 'Jaipur', item: 'KLIPPAN Sofa', amt: '₹16,990' },
];

function buildTicker() {
    const track = document.getElementById('tickerTrack');
    const items = [...orders, ...orders]; // duplicate for infinite scroll
    track.innerHTML = items.map(o =>
        `<span class="ticker-item">
          <i class="fa-solid fa-circle-check" style="color:var(--yellow)"></i>
          <strong>${o.name}</strong> from ${o.city} just ordered
          <span class="amount">${o.item}</span>
          <span class="sep">·</span>
          <span class="amount">${o.amt}</span>
        </span>`
    ).join('');
}
buildTicker();

/* ============================================================
   SCROLL REVEAL
============================================================ */
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${i * 0.05}s`;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

/* ============================================================
   COUNTER ANIMATION FOR STATS
============================================================ */
function animateCount(el, target, suffix) {
    let start = 0;
    const step = target / 50;
    const timer = setInterval(() => {
        start += step;
        if (start >= target) { el.textContent = target + suffix; clearInterval(timer); }
        else { el.textContent = Math.floor(start) + suffix; }
    }, 30);
}
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.stat-item').forEach(el => statsObserver.observe(el));