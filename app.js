// musemesh - routing + [X] crash egg + theme/lang toggles (+ dormant Gumroad commerce).
// Specs: v1 4 (routing/egg), round-2 5 (commerce, now commented in markup),
// round-3 2/5/6 (checkout commented; [ invert ] theme; en/sr language).
(function () {
  'use strict';
  var PAGES = ['home', 'how-it-works', 'run-a-room', 'about', 'contact'];
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.menu-btn'));
  var statusText = document.getElementById('status-text');
  var lang = 'en';
  var theme = 'dark';
  try { if (localStorage.getItem('musemesh.lang') === 'sr') { lang = 'sr'; } } catch (e) {}
  try { if (localStorage.getItem('musemesh.theme') === 'light') { theme = 'light'; } } catch (e) {}

  function str(key) {
    var t = MUSEMESH_STRINGS[lang] || MUSEMESH_STRINGS.en;
    return t[key] !== undefined ? t[key] : (MUSEMESH_STRINGS.en[key] || '');
  }

  function applyLang(next) {
    lang = next === 'sr' ? 'sr' : 'en';
    try { localStorage.setItem('musemesh.lang', lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      el.textContent = str(el.getAttribute('data-i18n'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-aria]'), function (el) {
      el.setAttribute('aria-label', str(el.getAttribute('data-i18n-aria')));
    });
    document.getElementById('lang-toggle').textContent = lang === 'en' ? '[ \u0421\u0420\u041F ]' : '[ EN ]';
    statusText.textContent = str('status.default');
  }

  function applyTheme(next) {
    theme = next === 'light' ? 'light' : 'dark';
    try { localStorage.setItem('musemesh.theme', theme); } catch (e) {}
    if (theme === 'light') { document.documentElement.setAttribute('data-theme', 'light'); }
    else { document.documentElement.removeAttribute('data-theme'); }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof window.redraw === 'function') {
      window.redraw(); // repaint the static frame in the new scheme
    }
  }

  function currentPage() {
    var h = location.hash.replace(/^#/, '');
    return PAGES.indexOf(h) >= 0 ? h : 'home';
  }

  function show(page) {
    PAGES.forEach(function (id) {
      document.getElementById(id).hidden = (id !== page);
    });
    buttons.forEach(function (b) {
      var isActive = b.getAttribute('data-page') === page;
      b.classList.toggle('active', isActive);
      if (isActive) { b.setAttribute('aria-current', 'page'); } else { b.removeAttribute('aria-current'); }
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      location.hash = b.getAttribute('data-page');
    });
  });

  document.getElementById('goto-how').addEventListener('click', function () {
    location.hash = 'how-it-works';
  });

  // ---- the [X] crash egg (2026-07-17 website-crash-egg spec; ported from
  // the S400 room-pages egg). One-shot ~1s: window shake + a monochrome
  // particle burst from the [X], then everything reverts. Vanilla canvas at
  // z-index 3 — the p5 background canvas sits BEHIND the window (z-index 0)
  // and cannot host the burst. Dot color reads --ink at tap time so it
  // follows [ invert ]. prefers-reduced-motion gets a motion-free 1s window
  // invert instead.
  var eggActive = false; // 1s lockout — re-taps while running are ignored
  var closeBtn = document.getElementById('close-btn');

  function crashBurst(originX, originY) {
    var dpr = window.devicePixelRatio || 1;
    var canvas = document.createElement('canvas');
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;';
    document.body.appendChild(canvas);
    var g = canvas.getContext('2d');
    g.scale(dpr, dpr);

    var ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#fff';
    var dots = [];
    for (var i = 0; i < 60; i++) {
      dots.push({
        angle: Math.random() * Math.PI * 2,
        speed: 120 + Math.random() * 480, // px/s
        radius: 1.5 + Math.random() * 2.5
      });
    }

    var t0 = performance.now();
    var DURATION_MS = 1000;
    function frame(now) {
      var t = (now - t0) / DURATION_MS; // 0..1
      if (t >= 1) { canvas.remove(); return; }
      g.clearRect(0, 0, window.innerWidth, window.innerHeight);
      g.fillStyle = ink;
      g.globalAlpha = 1 - t;
      for (var k = 0; k < dots.length; k++) {
        var d = dots[k];
        var dist = d.speed * t;
        g.beginPath();
        g.arc(originX + Math.cos(d.angle) * dist, originY + Math.sin(d.angle) * dist, d.radius, 0, Math.PI * 2);
        g.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  closeBtn.addEventListener('click', function () {
    if (eggActive) return;
    eggActive = true;
    var win = document.querySelector('.win');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      win.classList.add('crashed');
    } else {
      var r = closeBtn.getBoundingClientRect();
      crashBurst(r.left + r.width / 2, r.top + r.height / 2);
      win.classList.add('shaking');
    }
    // Timeout (not animationend) ends BOTH branches — deterministic even if
    // the tab is backgrounded mid-effect.
    setTimeout(function () {
      win.classList.remove('shaking', 'crashed');
      eggActive = false;
    }, 1000);
  });

  document.getElementById('theme-toggle').addEventListener('click', function () {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('lang-toggle').addEventListener('click', function () {
    applyLang(lang === 'en' ? 'sr' : 'en');
  });

  // ---- round 2 commerce, dormant: markup is commented out in index.html
  // while the kit is free (round-3 spec 2). Guards below make this a no-op;
  // re-enable = uncomment the markup + swap REPLACE-ME. ----
  var GUMROAD_URL = 'https://gumroad.com/l/REPLACE-ME'; // PLACEHOLDER: swap for the real product URL once created (see README "Commerce")
  var buyLink = document.getElementById('buy-link');
  var couponInput = document.getElementById('coupon-input');
  if (buyLink) {
    buyLink.href = GUMROAD_URL;
    if (couponInput) {
      couponInput.addEventListener('input', function () {
        var code = couponInput.value.trim();
        buyLink.href = code ? GUMROAD_URL + '/' + encodeURIComponent(code) : GUMROAD_URL;
      });
    }
  }

  window.addEventListener('hashchange', function () { show(currentPage()); });
  applyTheme(theme);
  applyLang(lang);
  show(currentPage()); // honors a deep link on load; empty/unknown hash -> home
})();
