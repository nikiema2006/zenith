"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Grid3X3, Package2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidGlassPanel } from "@/components/ui/liquid-glass-panel";

const TABS = [
  { to: "/", label: "Accueil", icon: Home, end: true, testid: "tab-home" },
  { to: "/catalogue", label: "Catalogue", icon: Grid3X3, testid: "tab-catalog" },
  { to: "/tracking", label: "Tracking", icon: Package2, testid: "tab-tracking" },
  { to: "/infos", label: "Infos", icon: Info, testid: "tab-infos" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="bottom-nav"
      className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] left-1/2 -translate-x-1/2 z-50"
    >
      {/* Barre englobante = coquille liquid glass, items-center */}
      <LiquidGlassPanel
        as="div"
        className="flex flex-row items-center gap-1 p-1.5"
        radius={9999}
        bezel={28}
        thickness={26}
        specular={0.14}
        bg="rgba(255,255,255,0.0)"
      >
        {TABS.map(({ to, label, icon: Icon, end, testid }) => {
          const isActive = end
            ? pathname === to
            : pathname.startsWith(to) && to !== "/";

          return (
            <Link key={to} href={to} data-testid={testid} className="relative">
              <div
                className={cn(
                  "relative flex flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full transition-colors duration-200",
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-full overflow-hidden"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E95A6C] to-[#A60D26]" />
                    {/* reflet liquide */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-full pointer-events-none" />
                    {/* ombres inset liquid */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-2px_4px_rgba(0,0,0,0.25)] pointer-events-none" />
                    {/* glow externe doux */}
                    <div className="absolute -inset-1 rounded-full -z-10 opacity-40 blur-md bg-gradient-to-br from-[#E95A6C] to-[#A60D26]" />
                  </motion.div>
                )}

                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className="relative z-10"
                />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ duration: 0.18, delay: 0.08 }}
                    className="relative z-10 text-xs font-semibold tracking-tight whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </LiquidGlassPanel>
    </nav>
  );
}
