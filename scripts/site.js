// The site's only script: phone menu, enquiry form, and the name on /thanks/.
// Everything works without it: the nav wraps, and the form posts natively to Netlify.
(function () {
  'use strict';

  // ---------- Phone menu (below 860px) ----------
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  if (header && toggle) {
    var label = toggle.querySelector('[data-menu-label]');
    var nav = document.getElementById(toggle.getAttribute('aria-controls'));
    var mq = window.matchMedia('(max-width: 859.98px)');

    var setOpen = function (open, returnFocus) {
      header.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Close' : 'Menu';
      if (open) {
        header.style.setProperty('--menu-top', header.getBoundingClientRect().bottom + 'px');
        var first = nav.querySelector('a');
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) setOpen(false, true);
    });
    // Following a link (including same-page anchors) closes the menu.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && header.classList.contains('is-open')) setOpen(false, false);
    });
    // Keep keyboard focus inside the open panel.
    header.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !header.classList.contains('is-open')) return;
      var items = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll('a')));
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var onChange = function () { if (!mq.matches && header.classList.contains('is-open')) setOpen(false, false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
  }

  // ---------- Enquiry form ----------
  var form = document.querySelector('[data-enquiry-form]');
  if (form) {
    var loadedAt = Date.now();
    var attempted = false;
    var status = form.querySelector('[data-form-status]');
    var button = form.querySelector('button[type="submit"]');
    var fields = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    form.setAttribute('novalidate', '');

    var messageFor = function (el) {
      if (el.validity.valueMissing || !el.value.trim()) return el.getAttribute('data-error');
      if (!el.validity.valid) return el.getAttribute('data-error-type') || el.getAttribute('data-error');
      return '';
    };

    var check = function (el) {
      var msg = messageFor(el);
      var box = document.getElementById(el.id + '-error');
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', box.id);
        box.querySelector('span').textContent = msg;
        box.hidden = false;
      } else {
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
        box.hidden = true;
      }
      return !msg;
    };

    // Validate on submit first, then live as fields change.
    fields.forEach(function (el) {
      var live = function () { if (attempted) check(el); };
      el.addEventListener('input', live);
      el.addEventListener('change', live);
    });

    var showStatus = function (text, isError) {
      status.textContent = text;
      status.classList.toggle('is-error', !!isError);
      status.hidden = false;
    };

    var rememberName = function () {
      try {
        var first = (form.elements.name.value || '').trim().split(/\s+/)[0];
        if (first) sessionStorage.setItem('enquiryName', first.slice(0, 40));
      } catch (err) { /* storage blocked: the thanks page just omits the name */ }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      attempted = true;
      var invalid = fields.filter(function (el) { return !check(el); });
      if (invalid.length) { invalid[0].focus(); return; }

      // Spam checks that cost real visitors nothing: honeypot filled, or sent within 3 seconds of loading.
      if (form.elements['company-website'].value || Date.now() - loadedAt < 3000) {
        window.location.href = form.getAttribute('action');
        return;
      }

      button.disabled = true;
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        rememberName();
        showStatus('Sent. Taking you to the confirmation page…');
        window.location.href = form.getAttribute('action');
      }).catch(function () {
        // Fall back to a normal form post, which Netlify handles without JavaScript.
        rememberName();
        HTMLFormElement.prototype.submit.call(form);
      });
    });
  }

  // ---------- Thanks page: greet by first name ----------
  var title = document.querySelector('[data-thanks-title]');
  if (title) {
    try {
      var name = sessionStorage.getItem('enquiryName');
      if (name) {
        title.textContent = 'Thanks, ' + name + '. Your enquiry is in.';
        sessionStorage.removeItem('enquiryName');
      }
    } catch (err) { /* keep the default heading */ }
  }
})();
