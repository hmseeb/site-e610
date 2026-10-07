/* =========================================================
   South Texas Overhead Garage Doors — main.js
   ========================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

    /* ---------- Set _page hidden field to the current URL ---------- */
    var pageInputs = document.querySelectorAll('input[name="_page"]');
    for (var i = 0; i < pageInputs.length; i++) {
      pageInputs[i].value = window.location.href;
    }

    /* ---------- Mobile navigation ---------- */
    var nav = document.getElementById('nav');
    var navToggle = document.getElementById('navToggle');
    var overlay = null;

    function closeNav() {
      if (!nav) return;
      nav.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      if (overlay) { overlay.remove(); overlay = null; }
    }

    function openNav() {
      if (!nav) return;
      nav.classList.add('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
      overlay = document.createElement('div');
      overlay.className = 'body-overlay';
      overlay.addEventListener('click', closeNav);
      document.body.appendChild(overlay);
    }

    if (navToggle && nav) {
      navToggle.addEventListener('click', function () {
        if (nav.classList.contains('open')) { closeNav(); } else { openNav(); }
      });
    }

    if (nav) {
      nav.addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.tagName === 'A') { closeNav(); }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeNav(); }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) { closeNav(); }
    });

    /* ---------- Header shadow on scroll ---------- */
    var header = document.getElementById('header');
    if (header) {
      var onScroll = function () {
        if (window.scrollY > 8) { header.style.boxShadow = '0 8px 24px rgba(13,31,51,.10)'; }
        else { header.style.boxShadow = 'none'; }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---------- Reveal on scroll ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      for (var r = 0; r < reveals.length; r++) { observer.observe(reveals[r]); }
    } else {
      for (var k = 0; k < reveals.length; k++) { reveals[k].classList.add('is-visible'); }
    }

    /* ---------- Contact form: inline fetch submission ---------- */
    var form = document.getElementById('contactForm');
    var status = document.getElementById('formStatus');

    function showStatus(type, message) {
      if (!status) return;
      status.hidden = false;
      status.className = 'form__status ' + type;
      status.textContent = message;
    }

    function markInvalid(field) {
      if (!field) return;
      field.classList.add('invalid');
      field.addEventListener('input', function handler() {
        field.classList.remove('invalid');
        field.removeEventListener('input', handler);
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        // Validation (JS-enabled path only; native required still works without JS).
        var required = form.querySelectorAll('[required]');
        var firstBad = null;
        for (var j = 0; j < required.length; j++) {
          if (!required[j].value || !String(required[j].value).trim()) {
            markInvalid(required[j]);
            if (!firstBad) firstBad = required[j];
          }
        }
        if (firstBad) {
          e.preventDefault();
          firstBad.focus();
          showStatus('error', 'Please complete the required fields marked with *');
          return;
        }

        // If fetch is unavailable, let the browser POST normally.
        if (!window.fetch) { return; }

        e.preventDefault();

        var submitBtn = form.querySelector('button[type="submit"]');
        var originalLabel = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

        var data = {};
        var elements = form.elements;
        for (var n = 0; n < elements.length; n++) {
          var el = elements[n];
          if (!el.name) { continue; }
          data[el.name] = el.value;
        }
        // Ensure the originating page URL is sent in the JSON body.
        data._page = window.location.href;

        fetch(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (!res.ok) { throw new Error('Request failed with status ' + res.status); }
            return res.json().catch(function () { return { ok: true }; });
          })
          .then(function (json) {
            if (json && json.ok === false) { throw new Error('Submission not accepted'); }
            form.reset();
            showStatus('success', 'Thanks, your message was sent! We\u2019ll be in touch soon.');
          })
          .catch(function () {
            showStatus('error', 'Sorry, something went wrong. Please call us at (210) 264-5351 or email george@southtexasgaragedoors.com.');
          })
          .then(function () {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
          });
      });
    }

    /* ---------- Confirmation for plain (non-JS / native) submissions ---------- */
    var params = new URLSearchParams(window.location.search);
    if (params.get('submitted') === '1' && status) {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showStatus('success', 'Thanks, your message was sent! We\u2019ll be in touch soon.');
    }
  });
})();