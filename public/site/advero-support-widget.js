/**
 * Advero floating support widget (email + contact page) for visitors and non-paying users.
 * Live chat (Crisp) loads only in the paid customer dashboard — see lib/adveroCrisp.ts.
 */
(function () {
  if (document.getElementById('advero-support-root')) return;

  var EMAIL = 'hello@advero.dk';
  var CONTACT_PATH = '/contact';

  var copy = {
    da: {
      kicker: 'Kontakt',
      title: 'Brug for hjælp?',
      lead: 'Skriv til os — vi svarer typisk inden for én hverdag.',
      email: 'Send e-mail',
      form: 'Udfyld kontaktformular',
      hours: 'Man–fre · 9–17 CET',
      open: 'Åbn support',
      close: 'Luk support',
    },
    en: {
      kicker: 'Contact',
      title: 'Need help?',
      lead: 'Message us — we usually reply within one business day.',
      email: 'Send email',
      form: 'Open contact form',
      hours: 'Mon–Fri · 9–17 CET',
      open: 'Open support',
      close: 'Close support',
    },
  };

  function lang() {
    try {
      var stored = localStorage.getItem('advero.lang');
      if (stored === 'en' || stored === 'da') return stored;
    } catch (e) {}
    var html = (document.documentElement.lang || 'da').toLowerCase();
    return html.startsWith('en') ? 'en' : 'da';
  }

  function t() {
    return copy[lang()] || copy.da;
  }

  function mailtoHref() {
    var subject = encodeURIComponent(lang() === 'da' ? 'Advero — hurtig forespørgsel' : 'Advero — quick question');
    return 'mailto:' + EMAIL + '?subject=' + subject;
  }

  var root = document.createElement('div');
  root.id = 'advero-support-root';
  root.className = 'advero-support-root';
  root.innerHTML =
    '<div class="advero-support-panel" role="dialog" aria-modal="false" aria-labelledby="advero-support-title">' +
    '<p class="advero-support-kicker" data-advero-support="kicker"></p>' +
    '<p class="advero-support-title" id="advero-support-title" data-advero-support="title"></p>' +
    '<p class="advero-support-lead" data-advero-support="lead"></p>' +
    '<div class="advero-support-actions">' +
    '<a class="advero-support-btn advero-support-btn--primary" data-advero-support="email" href="#"></a>' +
    '<a class="advero-support-btn advero-support-btn--ghost" data-advero-support="form" href="' +
    CONTACT_PATH +
    '"></a>' +
    '</div>' +
    '<p class="advero-support-meta" data-advero-support="hours"></p>' +
    '</div>' +
    '<button type="button" class="advero-support-fab" aria-expanded="false" aria-controls="advero-support-title">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>' +
    '</button>';

  document.body.appendChild(root);

  var fab = root.querySelector('.advero-support-fab');
  var panel = root.querySelector('.advero-support-panel');
  var emailLink = root.querySelector('[data-advero-support="email"]');

  function applyCopy() {
    var c = t();
    root.querySelector('[data-advero-support="kicker"]').textContent = c.kicker;
    root.querySelector('[data-advero-support="title"]').textContent = c.title;
    root.querySelector('[data-advero-support="lead"]').textContent = c.lead;
    emailLink.textContent = c.email;
    emailLink.setAttribute('href', mailtoHref());
    root.querySelector('[data-advero-support="form"]').textContent = c.form;
    root.querySelector('[data-advero-support="hours"]').textContent = c.hours + ' · ' + EMAIL;
    fab.setAttribute('aria-label', root.classList.contains('is-open') ? c.close : c.open);
  }

  function setOpen(open) {
    root.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    applyCopy();
  }

  fab.addEventListener('click', function () {
    setOpen(!root.classList.contains('is-open'));
  });

  document.addEventListener('click', function (e) {
    if (!root.classList.contains('is-open')) return;
    if (root.contains(e.target)) return;
    setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  window.addEventListener('advero:lang', function () {
    applyCopy();
  });

  applyCopy();
})();
