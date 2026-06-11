import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { getProductBySlug, getRelatedProducts } from "@/services/products";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function truncate(text, max = 180) {
  if (!text) return "";
  if (typeof text !== "string") return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}

function buildOgImageUrl(product) {
  const params = new URLSearchParams({
    title: product.name || "",
    price: product.retail_price
      ? `${Number(product.retail_price).toLocaleString("fr-FR")} FCFA`
      : "",
    wholesale: product.wholesale_price
      ? `${Number(product.wholesale_price).toLocaleString("fr-FR")} FCFA`
      : "",
    category: product.category || "",
    image: product.images?.[0] || "",
    badge: product.badge || "",
  });
  return `${SITE_URL}/api/og?${params.toString()}`;
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return {
        title: "Produit non trouvé · China Express",
        description: "Ce produit n'est pas disponible.",
        robots: { index: false, follow: false },
      };
    }

    const description = truncate(product.description, 200);
    const ogImage = buildOgImageUrl(product);

    return {
      title: `${product.name}${product.badge ? " · " + product.badge : ""} · China Express`,
      description,
      keywords: [
        product.name,
        product.category,
        "importation chine afrique",
        "chinois produits",
        "prix usine",
        "catalogue chine",
        String(product.retail_price ? product.retail_price + " FCFA" : ""),
      ].filter(Boolean),
      alternates: {
        canonical: `${SITE_URL}/produit/${slug}`,
      },
      openGraph: {
        type: "product",
        locale: "fr_FR",
        url: `${SITE_URL}/produit/${slug}`,
        siteName: "China Express · Zenith Global",
        title: `${product.name}${product.badge ? " · " + product.badge : ""}`,
        description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        category: product.category,
        price: product.retail_price
          ? {
              amount: product.retail_price,
              currency: "XOF",
            }
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} · China Express`,
        description,
        images: [ogImage],
      },
      facebook: {
        appId: process.env.NEXT_PUBLIC_FB_APP_ID || "",
      },
      robots: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    };
  } catch (error) {
    return {
      title: "Produit non trouvé",
      description: "Ce produit n'est pas disponible.",
      robots: { index: false, follow: false },
    };
  }
}

function ProductJsonLd({ product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: product.images && product.images.length ? product.images : undefined,
    sku: product.slug || String(product.id || ""),
    brand: {
      "@type": "Brand",
      name: "China Express",
    },
    category: product.category || "",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produit/${product.slug}`,
      priceCurrency: "XOF",
      price: Number(product.retail_price || 0),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating:
      product.rating || product.reviews
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating) || 5,
            reviewCount: Number(product.reviews) || 1,
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catalogue",
        item: `${SITE_URL}/catalogue`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category || "Produits",
        item: `${SITE_URL}/catalogue?cat=${encodeURIComponent(product.category || "")}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${SITE_URL}/produit/${product.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductDetailPage({ params }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    const relatedProducts = await getRelatedProducts(product.id, product.category, 4);

    return (
      <>
        <ProductJsonLd product={product} />
        <BreadcrumbJsonLd product={product} />
        <ProductDetailClient product={product} related={relatedProducts} />
      </>
    );
  } catch (error) {
    notFound();
  }
}
