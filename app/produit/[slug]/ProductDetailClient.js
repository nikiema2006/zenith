"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Package, ShieldCheck, MessageCircle, Phone, LucideRulerDimensionLine, Share2 } from "lucide-react";
import { formatXOF } from "@/lib/format";
import ProfitCalculator from "@/components/products/ProfitCalculator";
import ProductCard from "@/components/products/ProductCard";
import ProductDetailSkeleton from "@/components/products/ProductDetailSkeleton";
import VideoCarousel from "@/components/products/VideoCarousel";

export default function ProductDetailClient({ product, related, productUrl, whatsappUrl }) {
  const [activeImage, setActiveImage] = useState(0);
  const [loading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // productUrl et whatsappUrl sont calculés CÔTÉ SERVEUR (app/produit/[slug]/page.js)
  // et passés en props — ceci garantit que le HTML initial du SSR est strictement
  // identique au premier rendu React côté client → pas d'hydration mismatch.

  const handleCopyLink = async () => {
    try {
      const absoluteUrl =
        typeof window !== "undefined" && productUrl.startsWith("/")
          ? `${window.location.origin}${productUrl}`
          : productUrl;
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Échec de la copie:", err);
    }
  };

  return (
    <div data-testid="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
      <Link
        href="/catalogue"
        data-testid="product-back-link"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#C8A03B] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border mb-3 relative">
            {product.badge && (
              <span
                className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm ${
                  product.badgeColor === "gold"
                    ? "bg-[#C8A03B] text-black"
                    : "bg-[#C8102E] text-white"
                }`}
              >
                {product.badge}
              </span>
            )}
            <motion.img
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                data-testid={`product-thumb-${i}`}
                className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                  i === activeImage ? "border-[#C8A03B] ring-2 ring-[#C8A03B]/20" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C8A03B] mb-2">{product.category}</p>
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? "fill-[#C8A03B] text-[#C8A03B]" : "text-[#4A4A4A]"}
                />
              ))}
            </div>
            <span className="font-medium text-foreground">{product.rating}</span>
            <span className="text-muted-foreground">· {product.reviews} avis vérifiés</span>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border border-border p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">Prix détail</p>
              <p className="font-mono text-2xl font-semibold text-foreground">{formatXOF(product.retailPrice)}</p>
              <p className="text-xs text-muted-foreground mt-1.5">Min. {product.minRetail} unité</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#C8A03B]/10 to-transparent border border-[#C8A03B]/30 p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C8A03B] mb-1.5">Prix gros</p>
              <p className="font-mono text-2xl font-semibold text-[#C8A03B]">{formatXOF(product.wholesalePrice)}</p>
              <p className="text-xs text-[#C8A03B]/80 mt-1.5">Dès {product.minWholesale} unités</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-muted border border-border p-3">
              <Package size={14} className="text-[#C8A03B] mb-1.5" />
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Poids</p>
              <p className="font-mono text-foreground mt-0.5">{product.weightKg} kg</p>
            </div>
            <div className="rounded-lg bg-muted border border-border p-3">
              <LucideRulerDimensionLine size={14} className="text-[#C8A03B] mb-1.5" />
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">Dimensions</p>
              <p className="font-mono text-foreground mt-0.5">{product.dimensions}</p>
            </div>
            <div className="rounded-lg bg-muted border border-border p-3">
              <ShieldCheck size={14} className="text-[#C8A03B] mb-1.5" />
              <p className="text-muted-foreground uppercase tracking-wider text-[10px]">QC</p>
              <p className="font-mono text-foreground mt-0.5">Contrôlé</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="product-order-cta"
              className="flex-1 inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-white rounded-md font-semibold hover:brightness-110 transition-all glow-red text-sm uppercase tracking-wider"
            >
              <MessageCircle size={16} /> Commander sur WhatsApp
            </a>
            <button
              onClick={handleCopyLink}
              data-testid="product-copy-link"
              className="inline-flex items-center justify-center gap-2 px-5 py-4 border border-border text-muted-foreground rounded-md font-semibold hover:border-[#C8A03B]/40 hover:text-[#C8A03B] transition-all text-sm"
            >
              <Share2 size={16} />
              {copied ? "Copié !" : "Copier le lien"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <VideoCarousel videoLinks={product.videoLinks} />
      </div>

      <div className="mb-16">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#C8A03B] mb-1">Simulation</p>
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            Combien tu gagnes <span className="text-gold-gradient">vraiment ?</span>
          </h2>
        </div>
        <ProfitCalculator product={product} />
      </div>

      {related.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-5">Dans la même catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="h-12" />
    </div>
  );
}
