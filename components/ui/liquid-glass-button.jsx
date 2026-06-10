"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Liquid Glass — THÈME CLAIR (light)
 * Couche "verre dépoli / glassmorphism lumineux" :
 * - fond blanc translucide (opacity modérée)
 * - reflet clair en haut (bord supérieur "lumineux")
 * - ombre intérieure basse sombre pour le relief
 * - ombre externe douce
 * Utilisé comme sous-couche décorative (z-0) dans <LiquidButton />,
 * les pillules du header et du BottomNav.
 */
export function LiquidGlassLight({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 rounded-2xl",
        "bg-white/70 backdrop-blur-xl",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(15,23,42,0.12),inset_1px_0_0_rgba(255,255,255,0.6),inset_-1px_0_0_rgba(15,23,42,0.08),0_10px_30px_-12px_rgba(15,23,42,0.18)]",
        "border border-white/60",
        "ring-1 ring-slate-200/70",
        className
      )}
    />
  );
}

/**
 * Bouton liquid-glass (light) — utilise la couche ci-dessus
 * pour l'effet verre, puis ajoute un subtil reflet haut 1/2
 * et un effet hover (brillance + déplacement vertical -1px).
 */
export function LiquidButton({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap",
        "rounded-xl text-sm font-medium",
        "transition-[color,box-shadow,transform] duration-200",
        "hover:-translate-y-px active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A03B]/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {/* Fond glass */}
      <LiquidGlassLight className="rounded-xl" />
      {/* Reflet haut subtil (1/2 supérieur) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/60 to-transparent z-[1]"
      />
      {/* Contenu */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* MetalButton (version light-friendly : reflets + doré)                       */
/* -------------------------------------------------------------------------- */

const colorVariants = {
  default: {
    outer: "bg-gradient-to-b from-slate-200 to-slate-400",
    inner: "bg-gradient-to-b from-white via-slate-100 to-slate-200",
    button: "bg-gradient-to-b from-white to-slate-200",
    textColor: "text-slate-800",
    textShadow: "[text-shadow:_0_1px_0_rgb(255_255_255_/_60%)]",
  },
  primary: {
    outer: "bg-gradient-to-b from-[#E7C870] to-[#8a6a14]",
    inner: "bg-gradient-to-b from-[#FFF5D6] via-[#C8A03B] to-[#8a6a14]",
    button: "bg-gradient-to-b from-[#F3D98A] to-[#B8891E]",
    textColor: "text-[#1a1200]",
    textShadow: "[text-shadow:_0_1px_0_rgb(255_255_255_/_40%)]",
  },
  success: {
    outer: "bg-gradient-to-b from-emerald-200 to-emerald-500",
    inner: "bg-gradient-to-b from-emerald-50 via-emerald-300 to-emerald-400",
    button: "bg-gradient-to-b from-emerald-200 to-emerald-500",
    textColor: "text-emerald-950",
    textShadow: "[text-shadow:_0_1px_0_rgb(255_255_255_/_40%)]",
  },
  error: {
    outer: "bg-gradient-to-b from-rose-200 to-rose-500",
    inner: "bg-gradient-to-b from-rose-50 via-rose-200 to-rose-400",
    button: "bg-gradient-to-b from-rose-300 to-rose-600",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(0_0_0_/_20%)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-[#E7C870] to-[#8a6a14]",
    inner: "bg-gradient-to-b from-[#FFF5D6] via-[#E7C870] to-[#B8891E]",
    button: "bg-gradient-to-b from-[#FFEBA1] to-[#C8A03B]",
    textColor: "text-[#1a1200]",
    textShadow: "[text-shadow:_0_1px_0_rgb(255_255_255_/_40%)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-[#E9B486] to-[#7a3d10]",
    inner: "bg-gradient-to-b from-[#FFDEC1] via-[#E9B486] to-[#A36F3D]",
    button: "bg-gradient-to-b from-[#FFE3C9] to-[#A36F3D]",
    textColor: "text-[#2a1200]",
    textShadow: "[text-shadow:_0_1px_0_rgb(255_255_255_/_30%)]",
  },
};

function metalButtonVariants(variant, isPressed, isHovered, isTouchDevice) {
  const colors = colorVariants[variant] || colorVariants.default;
  const transitionStyle = "all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)";

  return {
    wrapper: cn(
      "relative inline-flex transform-gpu rounded-xl p-[1.5px] will-change-transform",
      colors.outer
    ),
    wrapperStyle: {
      transform: isPressed
        ? "translateY(1.5px) scale(0.995)"
        : "translateY(0) scale(1)",
      boxShadow: isPressed
        ? "0 1px 2px rgba(15,23,42,0.15)"
        : isHovered && !isTouchDevice
          ? "0 10px 24px -10px rgba(15,23,42,0.25)"
          : "0 6px 16px -12px rgba(15,23,42,0.2)",
      transition: transitionStyle,
      transformOrigin: "center center",
    },
    inner: cn(
      "absolute inset-[1px] transform-gpu rounded-xl will-change-transform",
      colors.inner
    ),
    innerStyle: {
      transition: transitionStyle,
      transformOrigin: "center center",
      filter:
        isHovered && !isPressed && !isTouchDevice ? "brightness(1.03)" : "none",
    },
    button: cn(
      "relative z-10 m-[1px] rounded-xl inline-flex h-10 transform-gpu cursor-pointer items-center justify-center overflow-hidden px-5 py-2 text-sm leading-none font-semibold will-change-transform outline-none",
      colors.button,
      colors.textColor,
      colors.textShadow
    ),
    buttonStyle: {
      transform: isPressed ? "scale(0.98)" : "scale(1)",
      transition: transitionStyle,
      transformOrigin: "center center",
      filter:
        isHovered && !isPressed && !isTouchDevice ? "brightness(1.02)" : "none",
    },
  };
}

function ShineEffect({ isPressed }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300",
        isPressed ? "opacity-20" : "opacity-0"
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

export const MetalButton = React.forwardRef(function MetalButton(
  { children, className, variant = "default", ...props },
  ref
) {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  const variants = metalButtonVariants(variant, isPressed, isHovered, isTouchDevice);

  return (
    <div className={variants.wrapper} style={variants.wrapperStyle}>
      <div className={variants.inner} style={variants.innerStyle} />
      <button
        ref={ref}
        className={cn(variants.button, className)}
        style={variants.buttonStyle}
        {...props}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => {
          setIsPressed(false);
          setIsHovered(false);
        }}
        onMouseEnter={() => {
          if (!isTouchDevice) setIsHovered(true);
        }}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onTouchCancel={() => setIsPressed(false)}
      >
        <ShineEffect isPressed={isPressed} />
        <span className="relative z-10">{children}</span>
        {isHovered && !isPressed && !isTouchDevice && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-white/30 rounded-xl" />
        )}
      </button>
    </div>
  );
});

export default LiquidButton;
