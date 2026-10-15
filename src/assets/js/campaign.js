(() => {
  const campaignElements = [...document.querySelectorAll("[data-campaign]")];
  if (!campaignElements.length) return;

  const start = Date.parse(campaignElements[0].dataset.campaignStart || "");
  const end = Date.parse(campaignElements[0].dataset.campaignEnd || "");
  const MAX_TIMER_DELAY = 2147483647;
  let clockOffset = 0;
  let expiryTimer;

  const now = () => Date.now() + clockOffset;
  const isActive = () => Number.isFinite(start) && Number.isFinite(end) && now() >= start && now() < end;
  const syncVisibility = () => campaignElements.forEach((element) => { element.hidden = !isActive(); });
  const scheduleExpiry = () => {
    clearTimeout(expiryTimer);
    syncVisibility();
    if (!isActive()) return;
    expiryTimer = setTimeout(scheduleExpiry, Math.min(MAX_TIMER_DELAY, Math.max(0, end - now()) + 25));
  };

  // Önce yerel saatle gecikmeden kontrol et; ardından CDN'nin Date başlığıyla saat farkını düzelt.
  scheduleExpiry();
  fetch(window.location.pathname, { method: "HEAD", cache: "no-store", credentials: "same-origin" })
    .then((response) => {
      const serverDate = Date.parse(response.headers.get("date") || "");
      if (Number.isFinite(serverDate)) clockOffset = serverDate - Date.now();
    })
    .catch(() => {})
    .finally(scheduleExpiry);

  document.addEventListener("visibilitychange", () => { if (!document.hidden) scheduleExpiry(); });
})();
