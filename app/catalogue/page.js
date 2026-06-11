import { Suspense } from "react";
import CatalogContent from "./CatalogContent";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { getProducts, CATEGORIES } from "@/services/products";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  title: "Catalogue · Produits prix d'usine Chine",
  description:
    "Catalogue complet China Express : tech, mode, maison, beauté, outils. Prix d'usine, livraison Guanzhou → Ouaga.",
  keywords: [
    "catalogue chine",
    "prix usine",
    "produits importation",
    "tech mode maison beauté",
    "achats groupés chine",
    "revendeur Afrique",
  ],
  alternates: {
    canonical: `${SITE_URL}/catalogue`,
  },
  openGraph: {
    title: "Catalogue · China Express",
    description:
      "Catalogue complet China Express : tech, mode, maison, beauté, outils. Prix d'usine, livraison Guanzhou → Ouaga.",
    url: `${SITE_URL}/catalogue`,
    type: "website",
    siteName: "China Express",
    images: [
      {
        url: `${SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Catalogue China Express",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalogue · China Express",
    description:
      "Catalogue complet China Express : tech, mode, maison, beauté, outils. Prix d'usine.",
    images: [`${SITE_URL}/images/og-image.jpg`],
  },
};

function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
      <div className="mb-6 md:mb-10">
        <div className="h-3 w-24 mb-2 bg-gray-200 rounded" />
        <div className="h-12 w-3/4 mb-3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="h-12 flex-1 bg-gray-200 rounded" />
        <div className="h-12 w-48 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function Catalog() {
  const products = await getProducts();

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent initialProducts={products} categories={CATEGORIES} />
    </Suspense>
  );
}
