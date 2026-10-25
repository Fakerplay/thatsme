// Click tracking for Vercel Web Analytics custom events. No visual changes.
(function () {
  function send(name, data) {
    try { if (window.va) window.va('event', { name: name, data: data || {} }); } catch (e) {}
  }
  function page() { return location.pathname; }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    if (href.indexOf('mailto:') === 0) return send('Email click', { from: page(), label: text });
    if (/resume/i.test(href)) return send('Resume click', { from: page() });
    if (/behance\.net/.test(href)) return send('Behance click', { from: page() });
    if (/linkedin\.com/.test(href)) return send('LinkedIn click', { from: page() });
    if (/(^|\/)project\/[\w-]+\/?$/.test(href)) {
      var slug = href.replace(/\/$/, '').split('/').pop();
      return send('Case study click', { project: slug, from: page() });
    }
    if (el.id === 'search-toggle' || el.id === 'mobile-search') return send('Ask chat opened', { from: page() });
    if (/^https?:\/\//.test(href) && el.hostname !== location.hostname) {
      return send('Outbound click', { host: el.hostname, from: page() });
    }
  }, { capture: true, passive: true });
})();
