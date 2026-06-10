import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, MessageCircle, Sparkles, Headphones, Shirt, Home as HomeIcon, Sparkle, Wrench } from "lucide-react";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrendingSection from "./TrendingSection";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { getTrendingProducts, CATEGORIES } from "@/services/products";

export const revalidate = 300;

const CAT_ICONS = {
  tech: Headphones,
  mode: Shirt,
  maison: HomeIcon,
  beaute: Sparkle,
  outils: Wrench,
};

export default async function Home() {
  const trending = await getTrendingProducts();
  const slides = trending.slice(0, 6);

  return (
    <div data-testid="home-page">
      <HeroCarousel slides={slides} />

      <div className="bg-gradient-to-r from-[#C8102E]/10 via-[#C8A03B]/15 to-[#C8102E]/10 border-y border-[#C8A03B]/20 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12 text-sm">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0">
              <span className="text-[#C8A03B] font-semibold">Zenith Global</span>
              <span className="text-muted-foreground">Commandes groupées = prix cassés</span>
              <span className="text-[#C8A03B]">⬢</span>
              <span className="text-muted-foreground">Maritime · Aérien Standard</span>
              <span className="text-[#C8A03B]"></span>
              <span className="text-muted-foreground">De Guanzhou à Ouaga, sans stress</span>
              <span className="text-[#C8A03B]">⬢</span>
              <span className="text-muted-foreground">Paiement sécurisé Mobile Money</span>
              <span className="text-[#C8A03B]">⬢</span>
            </div>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C8A03B] mb-2">Catégories</p>
            <h2 className="font-display text-2xl md:text-3xl text-foreground">Trouve ton créneau</h2>
          </div>
          <Link href="/catalogue" className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#C8A03B]">
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1 md:hidden">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const Icon = CAT_ICONS[cat.id] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/catalogue?cat=${cat.id}`}
                data-testid={`home-category-${cat.id}`}
                className="shrink-0 flex flex-col items-center gap-1.5 w-[72px]"
              >
                <div className="w-[60px] h-[60px] rounded-2xl bg-card border border-gray-300 shadow-soft flex items-center justify-center hover:border-[#C8A03B]/50 transition-all">
                  <Icon size={22} className="text-[#C8A03B]" strokeWidth={1.7} />
                </div>
                <span className="text-[11px] font-medium text-foreground text-center leading-tight">{cat.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:grid grid-cols-5 gap-3">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const Icon = CAT_ICONS[cat.id] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/catalogue?cat=${cat.id}`}
                data-testid={`home-category-desktop-${cat.id}`}
                className="aspect-[3/2] rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-2 hover:border-[#C8A03B]/60 hover:shadow-elev transition-all group"
              >
                <Icon size={26} className="text-[#C8A03B] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="font-display text-base text-foreground">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <Suspense fallback={
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#C8A03B] mb-2">Tendances</p>
              <h2 className="font-display text-2xl md:text-4xl text-foreground">Best deals du moment</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">Ce que les revendeurs commandent en ce moment.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      }>
        <TrendingSection trending={trending} />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card border border-border shadow-soft p-8 md:p-10 relative overflow-hidden">
            <ShieldCheck size={36} className="text-[#C8A03B] mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-foreground mb-3">Tu envoies. On vérifie.</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Notre équipe à Guanzhou contrôle visuellement chaque lot avant emballage. Photos et vidéos disponibles sur demande.
            </p>
          </div>

          <a
            href="https://wa.me/22606900288"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="home-whatsapp-cta"
            className="rounded-2xl bg-gradient-to-br from-[#C8102E] to-[#A60D26] p-8 md:p-10 transition-all relative overflow-hidden group glow-red"
          >
            <MessageCircle size={36} className="text-white/90 mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-white mb-3">Une question ? Un lien Alibaba ?</h3>
            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-4">
              Envoie-nous le lien sur WhatsApp, on s&apos;occupe du reste : négociation, qualité, expédition.
            </p>
            <span className="inline-flex items-center gap-2 text-white font-medium text-sm group-hover:translate-x-1 transition-transform">
              +226 06 90 02 88 <ArrowRight size={16} />
            </span>
          </a>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
