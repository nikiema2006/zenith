import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

// Route /api/og — Génère systématiquement une carte 1200×630 (1.91:1).
// C'est LE ratio que WhatsApp / Facebook / LinkedIn interprètent comme
// "grand aperçu" (preview rectangulaire).
//
// Paramètres :
//   ?title=…         — nom du produit (obligatoire pour un bon rendu)
//   &price=…         — prix (affiché en grand, ex: "12 500 FCFA")
//   &category=…      — catégorie (affichée en petit en haut)
//   &image=https://…  — URL de la 1ère image du produit (affichée en grand à gauche)
//   &badge=…         — badge optionnel (ex: "TOP VENTE")
//
// Exemple :
//   /api/og?title=Lunettes%20Polarisées&price=12%20500%20FCFA&category=Mode&image=https://…supabase.co/…/lunettes.jpg
//
// Notes sur le rendu :
//  - Fond : dégradé noir → rouge foncé (identité China Express)
//  - Image produit à gauche en grand (500×500 avec coins arrondis)
//  - Titre + prix à droite (force le ratio 1.91:1)
//  - Si `image` n'est pas fournie ou échoue, on affiche le logo "Z" en grand à gauche
//  - Toutes les tailles sont en pixels = pixels relatifs <svg>/<img> standards
function isValidHttpUrl(str) {
  if (!str) return false;
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "China Express").slice(0, 80);
  const price = (searchParams.get("price") || "").slice(0, 40);
  const category = (searchParams.get("category") || "Importation Chine → Afrique").slice(0, 60);
  const image = searchParams.get("image");
  const badge = (searchParams.get("badge") || "").slice(0, 30);

  const hasImage = isValidHttpUrl(image);

  // Titre multi-lignes si long
  const titleLines = [];
  const maxPerLine = 28;
  if (title.length <= maxPerLine) {
    titleLines.push(title);
  } else {
    const words = title.split(" ");
    let current = "";
    for (const w of words) {
      if ((current + " " + w).trim().length > maxPerLine) {
        titleLines.push(current.trim());
        current = w;
      } else {
        current = current ? current + " " + w : w;
      }
    }
    if (current) titleLines.push(current.trim());
    if (titleLines.length > 3) {
      // On tronque la 3e ligne et on ajoute "…"
      titleLines[2] = titleLines.slice(2).join(" ").slice(0, maxPerLine).trimEnd() + "…";
      titleLines.length = 3;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #1A1515 0%, #2A1F1F 55%, #C8102E 180%)",
          color: "white",
          position: "relative",
          fontFamily: "sans-serif",
          padding: "48px 56px",
        }}
      >
        {/* Fond décoratif doré en haut à droite */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 520,
            height: 520,
            background:
              "radial-gradient(closest-side, rgba(200,160,59,0.18), transparent 70%)",
          }}
        />

        {/* Colonne gauche : image produit */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: 560,
            height: "100%",
            marginRight: 40,
          }}
        >
          <div
            style={{
              width: 500,
              height: 500,
              borderRadius: 24,
              border: "4px solid rgba(200,160,59,0.35)",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 10px 60px rgba(0,0,0,0.55)",
            }}
          >
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  fontSize: 220,
                  fontWeight: 900,
                  color: "#C8A03B",
                }}
              >
                Z
              </div>
            )}
          </div>
          {badge && (
            <div
              style={{
                marginTop: 24,
                background: "#C8102E",
                color: "white",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 2,
                padding: "8px 22px",
                borderRadius: 999,
                textTransform: "uppercase",
              }}
            >
              {badge}
            </div>
          )}
        </div>

        {/* Colonne droite : titre + prix + branding */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 16,
          }}
        >
          {/* Catégorie en haut */}
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#C8A03B",
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            {category}
          </div>

          {/* Titre produit (multi-lignes) */}
          {titleLines.map((line, idx) => (
            <div
              key={idx}
              style={{
                fontSize: titleLines.length > 2 ? 62 : titleLines.length === 2 ? 74 : 84,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                color: "white",
                marginBottom: 8,
                maxWidth: 620,
              }}
            >
              {line}
            </div>
          ))}

          {/* Prix */}
          {price && (
            <div
              style={{
                marginTop: 28,
                fontSize: 72,
                fontWeight: 900,
                color: "#C8A03B",
                letterSpacing: -1,
              }}
            >
              {price}
            </div>
          )}

          {/* Pied de carte : domaine */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 40,
              fontSize: 22,
              color: "rgba(255,255,255,0.65)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "#C8A03B",
                  color: "#1A1515",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                Z
              </span>
              China Express · zenith6.vercel.app
            </span>
            <span>De Guanzhou à Ouaga</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
