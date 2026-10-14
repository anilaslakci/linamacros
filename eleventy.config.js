export default function (eleventyConfig) {
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

  eleventyConfig.addCollection("posts", (collectionApi) => collectionApi
    .getFilteredByGlob("src/blog/posts/*.md")
    .filter((item) => !item.data.draft)
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
