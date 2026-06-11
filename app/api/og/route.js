import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

// Image OG 1200 × 630 dynamique par produit
// Utilisation : /api/og?title=Chaise%20Nordique&price=12%20500%20FCFA&wholesale=8%20400%20FCFA&category=Mobilier&image=https://...&badge=Promo
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "China Express · Zenith Global").slice(0, 80);
  const price = (searchParams.get("price") || "").slice(0, 40);
  const wholesale = (searchParams.get("wholesale") || "").slice(0, 40);
  const category = (searchParams.get("category") || "").slice(0, 40);
  const image = (searchParams.get("image") || "").slice(0, 500);
  const badge = (searchParams.get("badge") || "").slice(0, 30);

  const hasImage = Boolean(image);

  // Titre + sous-titre sur 2 lignes si long
  const titleLines =
    title.length > 30
      ? [title.slice(0, Math.ceil(title.length / 2)), title.slice(Math.ceil(title.length / 2))]
      : [title];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #1A1515 0%, #2A1F1F 50%, #C8102E 180%)",
          color: "white",
          padding: 80,
          gap: 40,
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Badge catégorie en haut à gauche */}
        {category && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 80,
              fontSize: 24,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C8A03B",
              fontWeight: 700,
            }}
          >
            {category}
          </div>
        )}

        {/* Logo / Brand — en haut à droite */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "white",
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#C8A03B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#1A1515",
            }}
          >
            ZG
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800 }}>China Express</span>
            <span style={{ fontSize: 14, opacity: 0.6 }}>Zenith Global</span>
          </div>
        </div>

        {/* Colonne texte */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, paddingTop: 60 }}>
          {/* Badge promo */}
          {badge && (
            <div
              style={{
                display: "inline-block",
                background: "#C8102E",
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 800,
                marginBottom: 24,
                letterSpacing: "0.1em",
                alignSelf: "flex-start",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </div>
          )}

          {/* Titre multi-lignes */}
          {titleLines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: "white",
                marginBottom: i === titleLines.length - 1 ? 24 : 6,
                maxWidth: 620,
              }}
            >
              {line}
            </div>
          ))}

          {/* Prix */}
          {price && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 10, gap: 4 }}>
              <div style={{ fontSize: 22, color: "#C8A03B", opacity: 0.9 }}>Prix détail</div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#C8A03B",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {price}
              </div>
              {wholesale && (
                <div
                  style={{
                    fontSize: 26,
                    color: "white",
                    opacity: 0.7,
                    marginTop: 12,
                  }}
                >
                  Gros : <span style={{ fontWeight: 800 }}>{wholesale}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image produit à droite */}
        <div
          style={{
            width: 520,
            height: 520,
            borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            border: "2px solid rgba(200,160,59,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
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
                fontSize: 160,
                color: "#C8A03B",
                fontWeight: 900,
                opacity: 0.4,
              }}
            >
              ZG
            </div>
          )}
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "white",
            opacity: 0.65,
          }}
        >
          <div>zenith-global.com</div>
          <div style={{ display: "flex", gap: 20 }}>
            <span>Guanzhou → Ouaga</span>
            <span>•</span>
            <span>+226 06 90 02 88</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
