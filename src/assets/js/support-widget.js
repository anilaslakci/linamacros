(() => {
  const FIRST_DELAY = 5000;
  const VISIBLE_DURATION = 6000;
  const REPEAT_DELAY = 90000;
  const MAX_SHOWS = 3;
  const keys = { count: 'lina_support_bubble_count', last: 'lina_support_bubble_last', dismissed: 'lina_support_bubble_dismissed', panelUsed: 'lina_support_panel_used' };
  const widget = document.querySelector('[data-support-widget]');
  const toggle = widget?.querySelector('[data-support-toggle]');
  const panel = widget?.querySelector('[data-support-panel]');
  const close = widget?.querySelector('[data-support-close]');
  const bubble = widget?.querySelector('[data-support-bubble]');
  const bubbleClose = widget?.querySelector('[data-support-bubble-close]');
  if (!widget || !toggle || !panel || !bubble) return;
  let showTimer;
  let hideTimer;
  const stopTimers = () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  const autoStopped = () => sessionStorage.getItem(keys.dismissed) === '1' || sessionStorage.getItem(keys.panelUsed) === '1';
  const hideBubble = () => { bubble.hidden = true; };
  const schedule = () => {
    stopTimers();
    const count = Number(sessionStorage.getItem(keys.count) || 0);
    if (autoStopped() || count >= MAX_SHOWS) return;
    const last = Number(sessionStorage.getItem(keys.last) || 0);
    const delay = last ? Math.max(0, last + REPEAT_DELAY - Date.now()) : FIRST_DELAY;
    showTimer = setTimeout(() => {
      if (autoStopped()) return;
      bubble.hidden = false;
      sessionStorage.setItem(keys.count, String(count + 1));
      sessionStorage.setItem(keys.last, String(Date.now()));
      hideTimer = setTimeout(() => { hideBubble(); schedule(); }, VISIBLE_DURATION);
    }, delay);
  };
  const setPanel = (open, { restoreFocus = true } = {}) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Hızlı destek menüsünü kapat' : 'Hızlı destek menüsünü aç');
    if (open) {
      sessionStorage.setItem(keys.panelUsed, '1');
      stopTimers();
      hideBubble();
      panel.querySelector('a')?.focus();
    } else if (restoreFocus) toggle.focus();
  };
  bubbleClose?.addEventListener('click', () => {
    sessionStorage.setItem(keys.dismissed, '1');
    stopTimers();
    hideBubble();
    toggle.focus();
  });
  toggle.addEventListener('click', () => setPanel(panel.hidden));
  close?.addEventListener('click', () => setPanel(false));
  widget.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setPanel(false, { restoreFocus: false })));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) setPanel(false); });
  document.addEventListener('click', (event) => { if (!panel.hidden && !widget.contains(event.target)) setPanel(false, { restoreFocus: false }); });
  schedule();
})();
