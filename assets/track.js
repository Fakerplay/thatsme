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

// Outreach open tracking: pings a private ntfy topic when a link carries ?r=<tag>. No visual changes.
(function () {
  try {
    var r = new URLSearchParams(location.search).get('r');
    if (!r || !/^[\w-]{2,40}$/.test(r)) return;
    var key = 'pf_r_' + r;
    var ua = /iPhone|Android|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';
    function ping(what) {
      try { fetch('https://ntfy.sh/pf-70dbb34ee115', { method: 'POST', body: what + ' ' + r + ' ' + location.pathname + ' (' + ua + ')', keepalive: true }); } catch (e) {}
    }
    if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); ping('OPENED'); }
    setTimeout(function () { ping('READING 30s+'); }, 30000);
    var sent = false;
    addEventListener('scroll', function () {
      if (sent) return;
      var h = document.documentElement;
      if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.75) { sent = true; ping('SCROLLED 75%'); }
    }, { passive: true });
  } catch (e) {}
})();
