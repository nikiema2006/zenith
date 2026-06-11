"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidGlassPanel } from "@/components/ui/liquid-glass-panel";

const LOGO = "/logo.webp";

const NAV_LINKS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/tracking", label: "Suivi" },
  { to: "/infos", label: "Infos" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header data-testid="site-header" className="sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        {/* Seule coquille liquid glass — flex row, items-center, items bien alignés */}
        <LiquidGlassPanel
          as="nav"
          className="flex flex-row items-center justify-between gap-2 md:gap-4 px-3 md:px-5 py-2 md:py-3"
          radius={28}
          bezel={32}
          thickness={28}
          specular={0.14}
          bg="rgba(255,255,255,0.0)"
        >
          {/* Logo — shrink-0 pour ne pas être écrasé */}
          <Link
            href="/"
            data-testid="brand-logo"
            className="shrink-0 inline-flex items-center gap-3 group"
          >
            <img
              src={LOGO}
              alt="Zenith Global"
              className="h-9 md:h-11 w-auto drop-shadow-[0_2px_4px_rgba(200,160,59,0.35)] transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base md:text-xl text-slate-900 tracking-tight">
                Zenith <span className="text-[#C8A03B] font-semibold">Global</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-slate-500">
                Export·Chine→Ouaga
              </span>
            </div>
          </Link>

          {/* Nav desktop — onglets en ligne, tous items-center */}
          <div
            className="hidden md:flex items-center gap-1"
            data-testid="desktop-nav"
          >
            {NAV_LINKS.map(({ to, label, end }) => {
              const isActive = end ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  href={to}
                  className={cn(
                    "relative inline-flex items-center h-9 px-4 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#C8A03B]"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-xl bg-white/80
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(15,23,42,0.1),0_4px_10px_-6px_rgba(15,23,42,0.2)]"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop : CTA téléphone */}
          <button
            type="button"
            onClick={() => { window.location.href = 'tel:+22607336700'; }}
            data-testid="header-phone-cta"
            className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-xl text-[#C8A03B] hover:text-[#a6821b] transition-colors text-sm font-semibold tracking-wide
              bg-white/50
              shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(15,23,42,0.1)]"
          >
            <Phone size={14} strokeWidth={2} />
            <span>+226 07 33 67 00</span>
          </button>

          {/* Mobile : icône recherche */}
          <button
            data-testid="header-mobile-search"
            aria-label="Rechercher"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-700 shrink-0
              bg-white/50
              shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(15,23,42,0.1)]"
          >
            <Search size={18} strokeWidth={1.7} />
          </button>
        </LiquidGlassPanel>
      </div>
    </header>
  );
}
