export const SITE_TIME_ZONE = "Europe/Istanbul";

export function getBuildTime() {
  const configured = process.env.SITE_BUILD_TIME;
  if (!configured) return new Date();
  const parsed = new Date(configured);
  if (Number.isNaN(parsed.getTime())) throw new Error(`SITE_BUILD_TIME geçersiz: ${configured}`);
  return parsed;
}

export function istanbulDateKey(value = getBuildTime()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function contentDateKey(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const match = String(value ?? "").match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? "";
}

export function isPostPublished(data, buildTime = getBuildTime()) {
  if (data?.draft === true || data?.draft === "true") return false;
  const publicationDate = contentDateKey(data?.date);
  if (!publicationDate) return false;
  return publicationDate <= istanbulDateKey(buildTime);
}
