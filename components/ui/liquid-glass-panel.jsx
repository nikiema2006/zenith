"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Liquid Glass Panel
 * -----------------------------------------------------------------
 * Basé sur l'article https://kube.io/blog/liquid-glass-css-svg/
 *
 * Principe :
 *   - Réfraction via SVG `<feDisplacementMap />` + carte de déplacement
 *     pré-calculée (profil "squircle" carré → convexe, bordures lisses).
 *   - "Specular highlight" = un filet lumineux (rim light) ajouté par
 *     `<feSpecularLighting />` + `<feComposite />`.
 *   - Application finale via `backdrop-filter: url(#id)`.
 *
 * LIMITATION NAVIGATRICE IMPORTANTE (depuis l'article) :
 *   - `backdrop-filter: url(...)` n'est implémenté QUE DANS CHROMIUM
 *     (Chrome, Edge, Arc). Ne fonctionne PAS dans Firefox ni Safari.
 *   - On fournit donc un FALLBACK élégant ("glass standard") pour
 *     les navigateurs non compatibles. Les deux styles cohabitent.
 *
 * Props :
 *   - radius      : rayon de bordure (px) – défaut 24
 *   - bezel       : épaisseur de la bordure en px (zone de réfraction)
 *   - thickness   : "épaisseur" du verre — pilote l'amplitude de
 *                   déplacement et l'intensité du specular.
 *   - specular    : intensité 0..1 de la lueur sur les bords.
 *   - bg          : couleur d'arrière-plan semi-transparent
 *   - advanced    : true → tente le vrai liquid glass (Chromium).
 *                   false → force le fallback glass.
 *   - as          : balise html (div, nav, header...)
 *   - ref         : (optionnel) forwardedRef si besoin
 */

// ---------------------------------------------------------------------------
// 1. Carte de déplacement (displacement map).
//    Profil "squircle" convexe inspiré de l'article : les pixels sont
//    déplacés vers l'extérieur de la lentille, avec une intensité
//    maximale près du bord et un centre "plat" pour marquer la transition.
//    Contrairement à la première version, on encode un vecteur dirigé
//    (non unitaire) afin que le scale passe correctement par le max de
//    la map — ça donne un effet "vraie lentille" sur toute la surface.
// ---------------------------------------------------------------------------
function buildDisplacementMapCanvas(radius, bezel, thickness) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);

  const cx = size / 2;
  const cy = size / 2;
  // rayon de la lentille : on utilise toute la surface du canvas
  const lensR = size / 2 - 1;

  // Profil squircle : t ∈ [0, 1], 0 = centre, 1 = bord extérieur.
  // intensity(t) donne la magnitude de déplacement (entre 0 et 1).
  // Profil préféré de l'article : fort près du bord, faible au centre,
  // avec une transition douce (squircle exponent 4).
  function intensity(t) {
    // Plateau central — faible mais NON NUL, sinon le centre ne
    // réfracte rien du tout et on voit juste le fond transparent.
    if (t < 0.55) {
      const s = t / 0.55;
      // Courbure douce croissante jusqu'à ~0.55
      return 0.35 + 0.25 * s * s;
    }
    // Depuis 55% → 100% : squircle monte jusqu'à 1 (fort au bord).
    const s = (t - 0.55) / 0.45;
    const squircle = 1 - Math.pow(1 - s, 4);
    return 0.6 + 0.4 * squircle;
  }

  // magnitude max en pixels avant normalisation — servira de base au scale.
  let maxMag = 0;
  const buffer = new Float32Array(size * size * 2); // dx, dy par pixel
  const inside = new Uint8Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const idx = (y * size + x) * 2;

      if (dist <= lensR) {
        inside[y * size + x] = 1;
        const t = dist / lensR;
        const mag = intensity(t) * thickness; // px, avant normalisation
        buffer[idx] = (dx / (dist || 1)) * mag;
        buffer[idx + 1] = (dy / (dist || 1)) * mag;
        if (mag > maxMag) maxMag = mag;
      } else {
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
      }
    }
  }

  // Étape finale : remapper (dx, dy) en canaux R, G ∈ [0..255] avec
  // 128 = neutre. On utilise maxMag comme échelle.
  const scale = Math.max(1, Math.round(maxMag));
  const inv = 1 / (scale || 1);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i2 = (y * size + x) * 2;
      const i4 = (y * size + x) * 4;
      if (inside[y * size + x]) {
        const r = Math.max(0, Math.min(255, 128 + buffer[i2] * inv * 127));
        const g = Math.max(0, Math.min(255, 128 + buffer[i2 + 1] * inv * 127));
        img.data[i4] = r;
        img.data[i4 + 1] = g;
        img.data[i4 + 2] = 128;
        img.data[i4 + 3] = 255;
      } else {
        // hors lentille → neutre, sans aucune déformation (donc
        // le fond hors de la coquille n'est pas déplacé)
        img.data[i4] = 128;
        img.data[i4 + 1] = 128;
        img.data[i4 + 2] = 128;
        img.data[i4 + 3] = 0; // alpha 0 → feImage ignore hors zone
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  return { canvas, scale };
}

// ---------------------------------------------------------------------------
// 2. Layer specular — multi-rim (haut, bas, gauche, droite).
//    Paramètres venant du prompt utilisateur :
//      SPECULAR OPACITY    = 0.14
//      SPECULAR SATURATION = 0    (donc niveau de gris sans teinte)
//      REFRACTION LEVEL    = 1.00
//      BLUR LEVEL          = 1.6
//      PROGRESSIVE BLUR    = 5.78
//      GLASS BG OPACITY    = 0.00 (pas de fond coloré)
//    Au lieu d'un anneau radial (qui ne faisait que le bas en pratique),
//    on dessine 4 bandes indépendantes que l'on combine ensuite en blend
//    screen — les 4 bords de la coquille reçoivent bien un rim-light.
// ---------------------------------------------------------------------------
function buildSpecularMapCanvas(bezel, opacity) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);

  // Profil "edge falloff" (utilisé pour chaque bord) :
  //   t = 0  au bord extérieur → intensité max (reflet vif)
  //   t = 1  à l'intérieur     → 0 (zone plate sans reflet)
  // Progression : squircle pour une transition douce.
  function edgeFalloff(t) {
    const clamp = Math.max(0, Math.min(1, t));
    const sq = 1 - Math.pow(1 - clamp, 4);
    return (1 - sq); // 1 en bord, 0 au centre
  }

  // Largeur (en pixels) de la bande lumineuse sur chaque bord.
  // On utilise "bezel" comme unité (40px par défaut).
  const rim = Math.max(6, Math.round(bezel * 0.7));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Distance normalisée vers le bord le plus proche, par côté.
      const topT    = y         / rim;   // 0 = bord haut,  >1 = hors bande
      const bottomT = (size-1-y)/ rim;   // 0 = bord bas
      const leftT   = x         / rim;   // 0 = bord gauche
      const rightT  = (size-1-x)/ rim;   // 0 = bord droit

      // Contribution par côté (0 si on est hors de sa bande).
      const top    = topT    <= 1 ? edgeFalloff(topT)    : 0;
      const bottom = bottomT <= 1 ? edgeFalloff(bottomT) : 0;
      const left   = leftT   <= 1 ? edgeFalloff(leftT)   : 0;
      const right  = rightT  <= 1 ? edgeFalloff(rightT)  : 0;

      // Somme "screen-like" (évite la saturation en coin).
      let total = top + bottom + left + right;
      total = Math.min(1, total * 0.75);

      // Multipli par opacity specular utilisateur (0.14).
      // Saturation = 0 → on reste en niveaux de gris (R=G=B).
      const v = Math.max(0, Math.min(255, total * opacity * 255));

      const i = (y * size + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      // Alpha : non nul seulement dans la zone des 4 bords,
      // pour ne pas écraser le reste de l'image par du noir.
      img.data[i + 3] = total > 0.01 ? 255 : 0;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------------
// 3. Composant principal
// ---------------------------------------------------------------------------
export function LiquidGlassPanel({
  className,
  children,
  radius = 24,
  bezel = 40,
  thickness = 32,
  specular = 0.14,
  bg = "rgba(255,255,255,0.0)",
  advanced = true,
  as: As = "div",
  style,
  ...rest
}) {
  // IDs uniques par instance pour éviter les collisions CSS.
  const refractionId = useId().replace(/:/g, "");
  const specularId = useId().replace(/:/g, "");

  // Pour éviter une hydration-mismatch entre SSR et client :
  //   - SSR  : on n'a pas accès à `document` → pas de canvas → pas de
  //            map de déplacement.
  //   - 1er render client : idem que SSR → même HTML, React peut
  //            hydrater.
  //   - Une fois monté (useEffect), on génère les data URLs côté
  //            client **seulement** et on ré-rend avec les filtres
  //            avancés activés.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Généré seulement après le montage client.
  // En SSR / 1er render, on renvoie systématiquement ("", 0).
  const { displacementUrl, scale } = useMemo(() => {
    if (!isMounted) return { displacementUrl: "", scale: 0 };
    try {
      const { canvas, scale } = buildDisplacementMapCanvas(radius, bezel, thickness);
      return { displacementUrl: canvas.toDataURL("image/png"), scale };
    } catch {
      return { displacementUrl: "", scale: 0 };
    }
  }, [isMounted, radius, bezel, thickness]);

  const specularDataUrl = useMemo(() => {
    if (!isMounted) return "";
    try {
      return buildSpecularMapCanvas(bezel, 1.0).toDataURL("image/png");
    } catch {
      return "";
    }
  }, [isMounted, bezel, specular]);

  // Masque radial pour le progressive blur.
  // Construit à partir d'un <radialGradient> SVG inline :
  //   centre transparent → bord opaque.
  const progressiveBlurMaskUrl = useMemo(() => {
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
      `<defs>` +
      `<radialGradient id='g' cx='50%' cy='50%' r='70%'>` +
      `<stop offset='0%'  stop-color='#FFF' stop-opacity='0'/>` +
      `<stop offset='70%' stop-color='#FFF' stop-opacity='0'/>` +
      `<stop offset='100%' stop-color='#FFF' stop-opacity='1'/>` +
      `</radialGradient>` +
      `</defs>` +
      `<rect width='100%' height='100%' fill='url(#g)'/>` +
      `</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  const Tag = As;

  return (
    <>
      {/* Filter definitions (invisible) — référencées via backdrop-filter:url(#id).
          Pipeline inspiré de l'article, avec les paramètres de l'image :
            BLUR LEVEL          = 1.6
            REFRACTION LEVEL    = 1.00
            PROGRESSIVE BLUR    = 5.78
            SPECULAR OPACITY    = 0.14
            SPECULAR SATURATION = 0 (niveaux de gris)
            GLASS BG OPACITY    = 0 (pas de fond coloré)

          Ordre des étapes :
            1) feDisplacementMap(scale=thickness) → réfraction de la lentille
            2) feGaussianBlur(stdDev=1.6)         → "blur level" de base
            3) feGaussianBlur(stdDev=5.78)        → flou progressif fort
            4) feComposite(arithmetic)            → on mixe 2) et 3) selon un
                                                     mask radial (bord=fort,
                                                     centre=léger)
            5) feSpecularLighting + feBlend(screen) → rim-light sur 4 bords */}
      {advanced && displacementUrl && (
        <svg
          aria-hidden="true"
          width="0"
          height="0"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        >
          <defs>
            <filter id={refractionId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feImage
                href={displacementUrl}
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="displacementMap"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale={scale}
                xChannelSelector="R"
                yChannelSelector="G"
                result="refracted"
              />
              {/* Flou de base (BLUR LEVEL = 1.6) — flou doux, homogène. */}
              <feGaussianBlur
                in="refracted"
                stdDeviation="1.6"
                result="baseBlur"
              />
              {/* Flou progressif fort (PROGRESSIVE BLUR = 5.78). */}
              <feGaussianBlur
                in="refracted"
                stdDeviation="5.78"
                result="strongBlur"
              />
              {/* Masque "bord=opaque, centre=transparent" (SVG inline,
                  dataURL). Remplit edgeMaskFallback comme source pour
                  feComposite operator="in"/"out". */}
              <feImage
                href={progressiveBlurMaskUrl}
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="edgeMaskFallback"
              />
              {/* Flou progressif : on superpose un flou fort (5.78) seulement sur
                  les bords, via un mask radial (bord=opaque, centre=transparent).
                  → centre = baseBlur(1.6) → bord = strongBlur(5.78). */}
              <feComposite
                in="strongBlur"
                in2="edgeMaskFallback"
                operator="in"
                result="strongOnEdges"
              />
              {/* Combinaison : on part de strongOnEdges + on superpose (normal) par-dessus
                  baseBlur dans la zone "centre transparent". */}
              <feComposite
                in="baseBlur"
                in2="edgeMaskFallback"
                operator="out"
                result="baseOnlyCenter"
              />
              <feMerge result="progressiveBlurred">
                <feMergeNode in="strongOnEdges" />
                <feMergeNode in="baseOnlyCenter" />
              </feMerge>
              {/* Specular multi-rim (haut, bas, gauche, droite). */}
              {specularDataUrl && (
                <>
                  <feImage
                    href={specularDataUrl}
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    result="specularMask"
                  />
                  <feSpecularLighting
                    in="specularMask"
                    surfaceScale={specular * 14}
                    specularConstant={specular}
                    specularExponent="22"
                    lightingColor="#ffffff"
                    result="specular"
                  >
                    <feDistantLight azimuth="135" elevation="72" />
                  </feSpecularLighting>
                  <feBlend in="progressiveBlurred" in2="specular" mode="screen" />
                </>
              )}
            </filter>

            <filter id={specularId} colorInterpolationFilters="sRGB">
              <feImage
                href={specularDataUrl}
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="mask"
              />
              <feSpecularLighting
                in="mask"
                surfaceScale={specular * 14}
                specularConstant={specular}
                specularExponent="22"
                lightingColor="#ffffff"
                result="spec"
              >
                <feDistantLight azimuth="135" elevation="72" />
              </feSpecularLighting>
            </filter>
          </defs>
        </svg>
      )}

      <Tag
        className={cn(
          "relative isolate overflow-hidden",
          "border border-white/60 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)]",
          className
        )}
        style={{
          borderRadius: radius,
          background: bg,
          backdropFilter: advanced && displacementUrl
            ? `url(#${refractionId}) saturate(130%) brightness(1.05)`
            : "blur(16px) saturate(140%)",
          WebkitBackdropFilter: advanced && displacementUrl
            ? `url(#${refractionId}) saturate(130%) brightness(1.05)`
            : "blur(16px) saturate(140%)",
          ...style,
        }}
        {...rest}
      >
        {/* Couches décoratives — absolute, au-dessus de l'arrière-plan
            mais AU-DESSOUS du contenu (z < 10) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent z-[5]"
          style={{ borderRadius: `${radius}px ${radius}px 0 0` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[6]"
          style={{
            borderRadius: radius,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -2px 6px rgba(15,23,42,0.12), inset 1px 0 0 rgba(255,255,255,0.55), inset -1px 0 0 rgba(15,23,42,0.08)",
          }}
        />

        {/* Contenu DIRECT — plus de sous-couche "relative z-10" qui cassait
            la transmission des classes flex/flex-direction/items-center */}
        {children}
      </Tag>
    </>
  );
}

export default LiquidGlassPanel;
