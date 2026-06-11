import { NextResponse } from "next/server";
import sharp from "sharp";

// Route /api/og-product — sert systématiquement une image 1200×630 (1.91:1).
// C'est LE ratio que WhatsApp / Facebook interprètent comme "GRAND APERÇU".
//
// Fonctionnement :
//   1. Reçoit ?src=https://…supabase.co/…/image.jpg
//   2. Télécharge l'image source côté server Node.js (fiable, pas de problème
//      CORS / Edge Runtime comme avec ImageResponse + <img> distant)
//   3. Redimensionne en 1200×630 (crop "cover" centré → garde le sujet)
//   4. Répond en image/jpeg 82 % + en-têtes de cache longue durée
//
// Paramètres :
//   ?src=https://...  — URL de l'image source (Supabase). OBLIGATOIRE.
//
// Exemple :
//   /api/og-product?src=https://bmbeahjvdiglnxfpbzyu.supabase.co/storage/v1/object/public/product-images/products/123/lunettes.jpg

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function isValidImageUrl(str) {
  if (!str || typeof str !== "string") return false;
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");

  if (!isValidImageUrl(src)) {
    return NextResponse.json(
      { error: "Paramètre ?src= invalide ou manquant" },
      { status: 400 }
    );
  }

  try {
    // Télécharge l'image source.
    const upstream = await fetch(src, { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Impossible de charger l'image source (${upstream.status})` },
        { status: 502 }
      );
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());

    // Redimensionne en 1200×630 — crop centré pour garder le sujet.
    // Pas de redimensionnement à l'identique, même si source déjà 1.91:1 :
    // on garantit 1200×630 EXACT → WhatsApp/FB décident "grand aperçu".
    const jpeg = await sharp(buffer)
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      })
      .jpeg({ quality: 82, progressive: true, mozjpeg: false })
      .toBuffer();

    return new NextResponse(jpeg, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(jpeg.length),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=2592000",
      },
    });
  } catch (err) {
    // Tout échec → fallback 307 vers /api/og (carte branding 1200×630 sans image).
    // Comme ça on a TOUJOURS une image 1200×630 → jamais de "petit aperçu".
    console.error("[og-product] erreur:", err?.message || err);
    const fallback = new URL("/api/og", req.url);
    // Si on a un titre dans les query params on peut le propager… mais ici
    // on a seulement `src`, donc on redirige vers la carte branding par défaut.
    return NextResponse.redirect(fallback.toString(), 307);
  }
}
