(function () {
  var script = document.currentScript;
  if (!script) return;

  var siteId = script.getAttribute("data-site-id");
  if (!siteId) return;

  var endpoint;
  try {
    endpoint = new URL(script.src).origin + "/api/collect";
  } catch {
    return;
  }

  // Captcha/anti-spam tokens, not real form data — never capture these.
  var EXCLUDED_FIELDS = [
    "g-recaptcha-response",
    "h-captcha-response",
    "cf-turnstile-response",
  ];

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      try {
        var data = {};
        new FormData(form).forEach(function (value, key) {
          if (EXCLUDED_FIELDS.indexOf(key) !== -1) return;
          data[key] = typeof value === "string" ? value : value.name || "";
        });

        var payload = JSON.stringify({
          siteId: siteId,
          pageUrl: window.location.href,
          data: data,
        });

        // text/plain keeps this a CORS-simple request (no preflight OPTIONS).
        // A preflighted beacon/fetch can be dropped by the browser if the page
        // navigates or unmounts the form between the OPTIONS and the actual
        // POST, which is exactly what host sites with an AJAX form submit do.
        var sent = false;
        if (navigator.sendBeacon) {
          var blob = new Blob([payload], { type: "text/plain" });
          sent = navigator.sendBeacon(endpoint, blob);
        }
        if (!sent) {
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: payload,
            keepalive: true,
            mode: "cors",
          }).catch(function () {});
        }
      } catch {
        // Never break the host page's own form handling.
      }
      // Deliberately no preventDefault()/stopPropagation():
      // the host site's own submit handling must proceed unmodified.
    },
    true // capture phase, so we still see the event even if the host page stops propagation
  );
})();
