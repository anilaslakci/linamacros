import { productUrl } from "./products.mjs";

export function resolveArticleLinks(html, products, site) {
  const inactiveUrls = new Set(products.filter((product) => product.active !== true).map(productUrl));
  const brokenSupportHref = `%5B${site.telegramSupport}%5D(${site.telegramSupport})`;
  let hasPackageLink = false;

  const content = String(html).replace(/<a\b[^>]*\shref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (link, href, label) => {
    // Older Markdown may contain a duplicated Telegram link wrapper.
    if (href === brokenSupportHref) return link.replace(href, site.telegramSupport);

    const localHref = href.startsWith(`${site.url}/`) ? href.slice(site.url.length) : href;
    const pathname = localHref.split(/[?#]/, 1)[0];
    if (inactiveUrls.has(pathname)) return label;
    if (localHref === "/#paketler") {
      hasPackageLink = true;
      return link.replace(href, "/#urunler");
    }
    if (pathname.startsWith("/urunler/") || localHref === "/#urunler") hasPackageLink = true;
    return link;
  });

  return { content, hasPackageLink };
}

export function isRulesGuide(tags = []) {
  return tags.some((tag) => /makro yasak mı|makro ban riski|^oyun makrosu nedir$/i.test(tag));
}
