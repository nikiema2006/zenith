import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { formatXOF } from "@/lib/format";

export default function ProductCard({ product, index = 0 }) {
  const badge = product.badge;
  const badgeIsGold = product.badgeColor === "gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/produit/${product.slug}`}
        data-testid={`product-card-${product.id}`}
        className="group block relative overflow-hidden rounded-xl bg-card border border-gray-300 shadow-soft hover:border-[#C8A03B]/50 hover:shadow-elev transition-all duration-300"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {badge && (
            <span
              data-testid={`product-badge-${product.id}`}
              className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm ${
                badgeIsGold
                  ? "bg-[#C8A03B] text-black"
                  : "bg-[#C8102E] text-white"
              }`}
            >
              {badge}
            </span>
          )}

          {product.minWholesale && (
            <span className="absolute bottom-3 right-3 px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm bg-black/70 text-[#C8A03B] border border-[#C8A03B]/30">
              Gros dès {product.minWholesale}
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-display text-base leading-snug text-foreground line-clamp-2 group-hover:text-[#C8A03B] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star size={12} className="fill-[#C8A03B] text-[#C8A03B]" />
            <span className="font-medium text-foreground">{product.rating}</span>
            <span>· {product.reviews} avis</span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Prix détail</p>
              <p className="font-mono text-base font-semibold text-foreground">
                {formatXOF(product.retailPrice)}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C8A03B]">Prix Gros</p>
              <p className="font-mono text-sm font-semibold text-[#C8A03B]">
                {formatXOF(product.wholesalePrice)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
