"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { formatXOF } from "@/lib/format";

const fallbackBackground = "/background.webp";

const AccordionItem = ({ item, isActive, onMouseEnter, index }) => {
  const imageUrl = (item.images && item.images[0]) || fallbackBackground;
  const title = (item.name || item.title || "").slice(0, 28);
  const description = (item.description || "").slice(0, 70);

  return (
    <div
      className={`relative h-[420px] md:h-[520px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-in-out ${
        isActive ? "w-full md:w-full" : "w-[20px] md:w-[30px]"
      }`}
      onMouseEnter={onMouseEnter}
    >
      {/* Background image */}
      <img
        src={imageUrl}
        alt={item.name || item.title || "image"}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          if (!e.target.dataset.fallback) {
            e.target.dataset.fallback = "1";
            e.target.src = fallbackBackground;
          }
        }}
      />

      {/* Dark overlay only on bottom 30% with a smooth fade-in */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/100 via-black/70 to-transparent" />

      {/* Index indicator (inactive) */}
      <span
        className={`absolute left-1/2 -translate-x-1/2 top-6 font-mono text-white/80 text-xs tracking-widest transition-opacity duration-300 ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Rotated title (inactive) / Title (active) */}
      <span
        className={`absolute text-white font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
          isActive
            ? "left-5 right-5 bottom-[calc(30%-4px)] rotate-0 opacity-100 text-base md:text-lg"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-sm opacity-80"
        }`}
      >
        {title}
      </span>

      {/* Bottom info block — only visible when active */}
      <div
        className={`absolute inset-x-0 bottom-0 px-5 pb-5 pt-4 flex flex-col gap-2 text-white transition-[opacity,transform] duration-500 ease-out ${
          isActive
            ? "opacity-100 translate-y-0 delay-150"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {description && (
          <p className="text-xs md:text-sm text-white/80 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-end justify-between gap-3">
          {/* Primary price */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
              Prix gros dès
            </p>
            <p className="font-mono text-2xl md:text-3xl font-bold text-[#C8A03B]">
              {item.wholesalePrice != null ? formatXOF(item.wholesalePrice) : "—"}
            </p>
          </div>

          {/* Secondary (desktop only) */}
          {item.suggestedSellPrice != null && (
            <div className="hidden md:flex items-end gap-3">
              <div className="w-px self-stretch bg-[#C8A03B]/30" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 text-right">
                  Revente
                </p>
                <p className="font-mono text-lg text-white flex items-center justify-end gap-1.5">
                  <TrendingUp size={16} className="text-green-400" />
                  {formatXOF(item.suggestedSellPrice)}
                </p>
              </div>
            </div>
          )}
        </div>

        {item.slug && (
          <Link
            href={`/produit/${item.slug}`}
            className="mt-2 inline-flex items-center justify-center gap-2 self-stretch px-5 py-2.5 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-white rounded-md text-sm font-semibold hover:brightness-110 transition-all"
          >
            Voir le produit
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Progress tick */}
      <div
        className={`absolute bottom-0 left-0 h-[3px] bg-[#C8A03B] transition-all duration-700 ease-in-out ${
          isActive ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
};

export function InteractiveImageAccordion({ slides = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Pour l'auto-défilement (gauche → droite, puis droite → gauche).
  const directionRef = useRef(1); // 1 = ascendant / +1, -1 = descendant / -1
  const userInteractingRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const items = slides.length
    ? slides
    : [
        { id: "f1", name: "Zenith Global" },
        { id: "f2", name: "Meilleurs prix usine" },
        { id: "f3", name: "Qualité contrôlée" },
        { id: "f4", name: "Expédition fiable" },
      ];

  // Timer principal : toutes les 3 secondes, on avance d'un cran.
  // Quand on atteint le dernier élément → on inverse la direction
  // (ça redescend vers la gauche). Et inversement quand on revient
  // sur le premier élément → on remonte.
  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      if (userInteractingRef.current) return; // freeze quand l'utilisateur survole
      setActiveIndex((prev) => {
        const next = prev + directionRef.current;
        if (next > items.length - 1) {
          directionRef.current = -1; // on redescend
          return items.length - 1;
        }
        if (next <= 0) {
          directionRef.current = 1; // on remonte
          return 0;
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [items.length]);

  // Nettoie le timer de reprise à la fin.
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Quand l'utilisateur survole / clique, on met en pause puis on
  // reprend 2 secondes après la dernière interaction.
  const handleUserTouch = useCallback((index) => {
    userInteractingRef.current = true;
    setActiveIndex(index);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      userInteractingRef.current = false;
    }, 2000);
  }, []);

  return (
    <div
      className="flex flex-row items-stretch justify-center gap-1 md:gap-2 overflow-x-auto p-0 md:p-2"
      role="list"
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.id ?? index}
          item={item}
          index={index}
          isActive={index === activeIndex}
          onMouseEnter={() => handleUserTouch(index)}
          onClick={() => handleUserTouch(index)}
        />
      ))}
    </div>
  );
}

export default InteractiveImageAccordion;
