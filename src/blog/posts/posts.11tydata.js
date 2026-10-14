import { isPostPublished } from "../../../lib/publishing.mjs";

export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    permalink: (data) => isPostPublished(data)
      ? `/blog/${data.page.fileSlug}/index.html`
      : false,
    updated: (data) => data.updated || data.date
  }
};
