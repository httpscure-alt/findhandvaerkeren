/**
 * Homepage / marketing CTAs: new visitors → free audit; returning visitors with a saved audit → get-started with recommendation.
 */
(function () {
  function getJourneyStartHref() {
    try {
      var id = sessionStorage.getItem('advero.lastAuditId');
      if (id) {
        return (
          '/advero/get-started?from=report&auditId=' + encodeURIComponent(id)
        );
      }
    } catch {
      /* ignore */
    }
    return '/advero/audit';
  }

  function applyJourneyLinks() {
    var href = getJourneyStartHref();
    document.querySelectorAll('[data-advero-journey-start]').forEach(function (el) {
      if (el.tagName === 'A') el.setAttribute('href', href);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyJourneyLinks);
  } else {
    applyJourneyLinks();
  }
})();
