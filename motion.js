// Headline figures count up from zero the first time they scroll into view.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const NUM = /\d[\d,]*(\.\d+)?/;
  const run = el => {
    const text = el.textContent, m = text.match(NUM);
    if (!m) return;
    const target = parseFloat(m[0].replace(/,/g, '')), decimals = (m[1] || '.').length - 1;
    const fmt = v => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: m[0].includes(',') });
    const start = performance.now(), dur = 1100;
    const tick = now => {
      const t = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - t, 4);
      el.textContent = t < 1 ? text.replace(m[0], fmt(target * eased)) : text;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { io.unobserve(e.target); run(e.target); }
  }), { threshold: 0.6 });
  document.querySelectorAll('.stat b, .lead b, .callout b').forEach(el => {
    el.style.fontVariantNumeric = 'tabular-nums';
    io.observe(el);
  });
})();
