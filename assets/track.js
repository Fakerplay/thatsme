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
// Only fires after a real human interaction (scroll, pointer, touch, key), so link-preview scanners are ignored.
(function () {
  try {
    var r = new URLSearchParams(location.search).get('r');
    if (!r || !/^[\w-]{2,40}$/.test(r) || navigator.webdriver) return;
    var ua = /iPhone|Android|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';
    var t0 = Date.now(), human = false, sent30 = false, sent75 = false;
    function ping(what) {
      try { fetch('https://ntfy.sh/pf-70dbb34ee115', { method: 'POST', body: what + ' ' + r + ' ' + location.pathname + ' (' + ua + ')', keepalive: true }); } catch (e) {}
    }
    function onHuman(e) {
      if (e && e.isTrusted === false) return;
      if (!human) {
        human = true;
        var key = 'pf_r_' + r + location.pathname;
        if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); ping('OPENED'); }
      }
      var h = document.documentElement;
      if (!sent75 && (h.scrollTop + innerHeight) / h.scrollHeight > 0.75) { sent75 = true; ping('SCROLLED 75%'); }
    }
    ['scroll', 'pointermove', 'touchstart', 'keydown', 'wheel'].forEach(function (ev) { addEventListener(ev, onHuman, { passive: true }); });
    setInterval(function () {
      if (human && !sent30 && Date.now() - t0 >= 30000 && document.visibilityState === 'visible') { sent30 = true; ping('READING 30s+'); }
    }, 5000);
  } catch (e) {}
})();
