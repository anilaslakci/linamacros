const context = "https://schema.org";

export function websiteSchema(site) {
  return {
    "@context": context,
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: `${site.url}/`,
    inLanguage: site.language
  };
}

export function faqSchema(site, faqs) {
  return {
    "@context": context,
    "@type": "FAQPage",
    "@id": `${site.url}/#sss`,
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };
}

export function blogPostingSchema(site, pageUrl, post) {
  const canonical = `${site.url}${pageUrl}`;
  return {
    "@context": context,
    "@type": "BlogPosting",
    url: canonical,
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: site.language,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    author: { "@type": "Organization", name: site.author, url: `${site.url}/` },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: `${site.url}/`,
      logo: { "@type": "ImageObject", url: `${site.url}/icon-512.png` }
    },
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {})
  };
}

export function productSchema(site, pageUrl, product) {
  const canonical = `${site.url}${pageUrl}`;
  return {
    "@context": context,
    "@type": "Product",
    "@id": `${canonical}#product`,
    url: canonical,
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      "@id": `${canonical}#offer`,
      price: product.price,
      priceCurrency: "TRY",
      availability: `${context}/InStock`,
      url: canonical,
      seller: { "@type": "Organization", name: site.name }
    }
  };
}

export function pageBreadcrumbs(pageUrl, title, isProductPage) {
  return [
    { name: "Ana Sayfa", url: "/" },
    isProductPage ? { name: "Ürünler", url: "/#urunler" } : { name: "Blog", url: "/blog/" },
    { name: title, url: pageUrl }
  ];
}

export function breadcrumbSchema(site, breadcrumbs) {
  return {
    "@context": context,
    "@type": "BreadcrumbList",
    "@id": `${site.url}${breadcrumbs.at(-1).url}#breadcrumb`,
    itemListElement: breadcrumbs.map(({ name, url }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: { "@id": `${site.url}${url}`, url: `${site.url}${url}` }
    }))
  };
}
