// musemesh - routing + [X] egg + theme/lang toggles (+ dormant Gumroad commerce).
// Specs: v1 4 (routing/egg), round-2 5 (commerce, now commented in markup),
// round-3 2/5/6 (checkout commented; [ invert ] theme; en/sr language).
(function () {
  'use strict';
  var PAGES = ['home', 'how-it-works', 'run-a-room', 'about', 'contact'];
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.menu-btn'));
  var statusText = document.getElementById('status-text');
  var statusTimer = null;
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
    clearTimeout(statusTimer); // a pending egg revert must not restore the old language
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

  document.getElementById('close-btn').addEventListener('click', function () {
    statusText.textContent = str('status.egg');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
      statusText.textContent = str('status.default');
    }, 2000);
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
