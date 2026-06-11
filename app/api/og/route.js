import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

// Route /api/og — génère une carte branding 1200×630 (1.91:1).
// C'est le ratio que WhatsApp / Facebook interprètent comme "grand aperçu".
//
// RÈGLE D'OR (jamais plus de plantage silencieux) :
//   → AUCUNE balise <img src="https://..."> dans le JSX rendu.
//   Les <img> externes demandent à ImageResponse de fetch l'image en bytes,
//   ce qui échoue silencieusement en Edge Runtime (rate-limit Supabase, CORS,
//   temps de chargement…). Le crawler reçoit alors 0 octet → plus d'aperçu.
//   On garde donc du 100 % typographie + formes vectorielles.
//
// Paramètres :
//   ?title=…       — nom du produit ou "Zenith Global"
//   &price=…       — prix affiché en grand à droite ("12 500 FCFA")
//   &category=…    — catégorie en petit doré en haut
//   &badge=…       — badge optionnel rouge ("TOP VENTE")
//
// Exemple :
//   /api/og?title=Lunettes%20Polarisées&price=12%20500%20FCFA&category=Mode&badge=TOP%20VENTE

function splitWords(text, maxCharsPerLine) {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current = current ? current + " " + w : w;
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 3);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Zenith Global").slice(0, 120);
  const price = (searchParams.get("price") || "").slice(0, 40);
  const category = (
    searchParams.get("category") || "Importation Chine → Afrique"
  ).slice(0, 80);
  const badge = (searchParams.get("badge") || "").slice(0, 30);

  const titleLines = splitWords(title, 26);
  const priceLines = splitWords(price, 24);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #1A1515 0%, #2A1F1F 55%, #3A0E14 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* Accent doré en haut à droite */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 560,
            height: 560,
            background:
              "radial-gradient(closest-side, rgba(200,160,59,0.18), transparent 70%)",
          }}
        />

        {/* Bande rouge verticale à gauche */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 80,
            bottom: 80,
            width: 10,
            background: "#C8102E",
            borderRadius: "0 8px 8px 0",
          }}
        />

        {/* Colonne gauche : logo Z géant */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 500,
            height: "100%",
            marginRight: 48,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 440,
              height: 440,
              borderRadius: 40,
              border: "10px solid #C8A03B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(200,160,59,0.08)",
              fontSize: 300,
              fontWeight: 900,
              color: "#C8A03B",
              letterSpacing: -10,
            }}
          >
            Z
          </div>
          {badge && (
            <div
              style={{
                marginTop: 28,
                padding: "12px 32px",
                background: "#C8102E",
                color: "white",
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: 6,
                borderRadius: 999,
                textTransform: "uppercase",
              }}
            >
              {badge}
            </div>
          )}
        </div>

        {/* Colonne droite : catégorie / titre / prix / pied */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 24,
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#C8A03B",
              fontWeight: 700,
              marginBottom: 28,
            }}
          >
            {category}
          </div>

          {titleLines.map((line, idx) => (
            <div
              key={idx}
              style={{
                fontSize: titleLines.length > 2 ? 76 : 98,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: "white",
                marginBottom: 6,
                maxWidth: 640,
              }}
            >
              {line}
            </div>
          ))}

          {priceLines.length > 0 && (
            <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap" }}>
              {priceLines.map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 80,
                    fontWeight: 900,
                    color: "#C8A03B",
                    letterSpacing: -1,
                    marginRight: 16,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: "auto",
              paddingTop: 40,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span>China Express · zenith6.vercel.app</span>
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
