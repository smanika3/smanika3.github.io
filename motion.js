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

// Top-bar marker: a black box behind the current link. Project and résumé pages pin it to
// their aria-current link; the homepage moves it with the section in view.
(() => {
  const inner = document.querySelector('.nav-inner');
  if (!inner) return;
  const links = [...inner.querySelectorAll('a')];
  const ind = document.createElement('span');
  ind.className = 'nav-ind';
  ind.setAttribute('aria-hidden', 'true');
  inner.prepend(ind);

  const fixed = inner.querySelector('[aria-current="page"]');
  const spy = links.map(a => {
    const h = a.getAttribute('href');
    return [a, h === 'index.html' ? document.querySelector('.intro') : h.startsWith('#') ? document.querySelector(h) : null];
  }).filter(([, el]) => el);
  if (!fixed && !spy.length) return;

  const pick = () => {
    if (fixed) return fixed;
    let a = spy[0][0];
    if (scrollY < 1) return a;
    const line = Math.min(innerHeight * 0.4, 320);
    for (const [l, el] of spy) if (el.getBoundingClientRect().top <= line) a = l;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) a = spy[spy.length - 1][0];
    return a;
  };
  const place = () => {
    const a = pick(), box = inner.getBoundingClientRect(), r = a.getBoundingClientRect();
    links.forEach(l => l.classList.toggle('is-active', l === a));
    ind.style.width = r.width + 'px';
    ind.style.transform = `translateX(${r.left - box.left - inner.clientLeft}px)`;
  };

  place();
  document.fonts?.ready.then(place);
  requestAnimationFrame(() => requestAnimationFrame(() => ind.classList.add('is-ready')));
  let queued = false;
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; place(); }); } };
  if (!fixed) addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
})();
