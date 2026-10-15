export function campaignWindow(campaign) {
  const start = new Date(campaign?.startDate);
  const end = new Date(campaign?.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
  return { start, end };
}

export function isCampaignActive(campaign, instant = new Date()) {
  if (campaign?.enabled !== true) return false;
  const window = campaignWindow(campaign);
  if (!window) return false;
  const now = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(now.getTime())) return false;
  return now >= window.start && now < window.end;
}
