import { activeProducts } from "../../lib/products.mjs";

export default {
  layout: "layouts/base.njk",
  isProductPage: true,
  eleventyExcludeFromCollections: true,
  pagination: {
    data: "products",
    size: 1,
    alias: "product",
    before: activeProducts
  },
  eleventyComputed: {
    title: ({ product }) => product.name,
    description: ({ product }) => product.description
  }
};
