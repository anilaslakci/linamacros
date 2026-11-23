import { getBuildTime, isPostPublished } from "./lib/publishing.mjs";
import { isCampaignActive } from "./lib/campaign.mjs";
import { activeProduct, activeProducts, productRelatedPosts, productUrl, tryPrice } from "./lib/products.mjs";
import { isRulesGuide, resolveArticleLinks } from "./lib/article-links.mjs";
import { blogPostingSchema, breadcrumbSchema, faqSchema, pageBreadcrumbs, productSchema, websiteSchema } from "./lib/structured-data.mjs";

export default function (eleventyConfig) {
  const buildTime = getBuildTime();
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/icon-192.png");
  eleventyConfig.addPassthroughCopy("src/icon-512.png");

  eleventyConfig.addFilter("readableDate", (value) => new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul"
  }).format(new Date(value)));

  eleventyConfig.addFilter("htmlDate", (value) => new Date(value).toISOString().slice(0, 10));
  eleventyConfig.addFilter("relatedPosts", (posts, currentUrl) => posts
    .filter((item) => item.url !== currentUrl)
    .slice(0, 3));
  eleventyConfig.addFilter("activeFaqs", (faqs = []) => faqs
    .filter((faq) => faq?.active === true && String(faq.question ?? "").trim() && String(faq.answer ?? "").trim())
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)));
  eleventyConfig.addFilter("activeProducts", activeProducts);
  eleventyConfig.addFilter("activeProduct", activeProduct);
  eleventyConfig.addFilter("resolveArticleLinks", resolveArticleLinks);
  eleventyConfig.addFilter("isRulesGuide", isRulesGuide);
  eleventyConfig.addFilter("productUrl", productUrl);
  eleventyConfig.addFilter("productRelatedPosts", productRelatedPosts);
  eleventyConfig.addFilter("tryPrice", tryPrice);
  eleventyConfig.addFilter("discountPercent", (product) => {
    const price = Number(product?.price);
    const regularPrice = Number(product?.regularPrice);
    if (!(price > 0) || !(regularPrice >= price)) return 0;
    return Math.round((1 - price / regularPrice) * 100);
  });
  eleventyConfig.addFilter("campaignActive", (campaign) => isCampaignActive(campaign, buildTime));
  // JSON in a script element must not contain a literal opening angle bracket.
  eleventyConfig.addNunjucksFilter("dump", (value, spaces) => JSON.stringify(value, null, spaces)?.replaceAll("<", "\\u003c"));
  eleventyConfig.addFilter("websiteSchema", websiteSchema);
  eleventyConfig.addFilter("faqSchema", faqSchema);
  eleventyConfig.addFilter("blogPostingSchema", blogPostingSchema);
  eleventyConfig.addFilter("productSchema", productSchema);
  eleventyConfig.addFilter("pageBreadcrumbs", pageBreadcrumbs);
  eleventyConfig.addFilter("breadcrumbSchema", breadcrumbSchema);

  eleventyConfig.addCollection("posts", (collectionApi) => collectionApi
    .getFilteredByGlob("src/blog/posts/*.md")
    .filter((item) => isPostPublished(item.data, buildTime))
    .sort((a, b) => b.date - a.date));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
