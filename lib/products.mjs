export function activeProducts(products = []) {
  return products.filter((product) => product?.active === true);
}

export function productUrl(product) {
  return `/urunler/${product.slug}/`;
}

export function activeProduct(products, slug) {
  return activeProducts(products).find((product) => product.slug === slug);
}

export function tryPrice(value) {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(Number(value))} TL`;
}

export function productRelatedPosts(posts, product) {
  const game = product.game.toLocaleLowerCase("tr-TR");
  const category = game === "pubg steam" ? "pubg" : game;
  const direct = [];
  const buyingGuides = [];

  for (const post of posts) {
    const postCategory = post.data.category?.toLocaleLowerCase("tr-TR");
    const tags = (post.data.tags ?? []).map((tag) => tag.toLocaleLowerCase("tr-TR"));
    if (postCategory === category || tags.some((tag) => tag.includes(game))) {
      direct.push(post);
    } else if (["oyun rehberi", "teknik rehber"].includes(postCategory)
      && tags.some((tag) => /makro paket(?:i|leri)|makro satın al/.test(tag))) {
      buyingGuides.push(post);
    }
  }

  return [...direct, ...buyingGuides].slice(0, 3);
}
