(() => {
  const measurementId = window.LINA_ANALYTICS_ID;
  const consentKey = "lina_analytics_consent_v1";
  const banner = document.querySelector("[data-consent-banner]");
  const acceptButton = document.querySelector("[data-consent-accept]");
  const rejectButton = document.querySelector("[data-consent-reject]");
  const settingsButtons = document.querySelectorAll("[data-consent-settings]");
  let analyticsLoaded = false;

  function getConsent() {
    try {
      return window.localStorage.getItem(consentKey);
    } catch {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch {
      // The choice still applies for the current page if storage is unavailable.
    }
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    banner.querySelector("button")?.focus({ preventScroll: true });
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(";").forEach((item) => {
      const name = item.split("=")[0].trim();
      if (!name.startsWith("_ga")) return;
      for (const domain of ["", ".linamacros.com.tr", "linamacros.com.tr"]) {
        const domainPart = domain ? `; Domain=${domain}` : "";
        document.cookie = `${name}=; Max-Age=0; Path=/${domainPart}; SameSite=Lax`;
      }
    });
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  function loadAnalytics() {
    if (!measurementId || analyticsLoaded || document.getElementById("lina-ga4")) return;
    analyticsLoaded = true;
    ensureGtag();
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.id = "lina-ga4";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  function grantConsent() {
    saveConsent("granted");
    hideBanner();
    loadAnalytics();
  }

  function denyConsent() {
    saveConsent("denied");
    hideBanner();
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }
    deleteAnalyticsCookies();
  }

  acceptButton?.addEventListener("click", grantConsent);
  rejectButton?.addEventListener("click", denyConsent);
  settingsButtons.forEach((button) => button.addEventListener("click", showBanner));

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || getConsent() !== "granted" || typeof window.gtag !== "function") return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) {
      window.gtag("event", "click_outbound", {
        link_url: destination.href,
        link_domain: destination.hostname,
        outbound: true,
        transport_type: "beacon"
      });
    }

    if (!link.matches("[data-shopier-product]")) return;
    const openInSameTab = !link.target || link.target === "_self";
    let navigated = false;
    const continueToShopier = () => {
      if (!openInSameTab || navigated) return;
      navigated = true;
      window.location.assign(destination.href);
    };

    if (openInSameTab) event.preventDefault();
    window.gtag("event", "click_shopier", {
      product_name: link.dataset.shopierProduct,
      game: link.dataset.shopierGame,
      destination_url: destination.href,
      transport_type: "beacon",
      event_callback: continueToShopier,
      event_timeout: 800
    });
    if (openInSameTab) window.setTimeout(continueToShopier, 850);
  });

  if (getConsent() === "granted") loadAnalytics();
  else if (getConsent() !== "denied") showBanner();
})();
