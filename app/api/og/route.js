import { NextResponse } from "next/server";

export const runtime = "edge";

// Route /api/og — Proxy d'image OG sécurisé.
// Cas :
//   - ?src=https://…  → redirect 307 vers l'image source (utilisé comme og:image simple)
//   - ?fallback=1     → sert le OG par défaut du site
//   - ?title=…        → image riche générée via ImageResponse (carte branding)
//
// Exemples :
//   /api/og?src=https://supabase.co/.../image.jpg
//   /api/og?title=Lunettes%20Polarisées&price=12%20500%20FCFA
//
// Pour éviter tout problème de plantage en prod (timeout, erreur), on utilise
// systématiquement un redirect 307 vers la source plutôt que de retélécharger/
// ré-encoder. Les navigateurs et crawlers des réseaux sociaux suivent les redirects.

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
  const src = searchParams.get("src");
  const title = searchParams.get("title");
  const fallback = searchParams.get("fallback");

  // Cas 1 : redirection simple vers une image source
  if (src && isValidHttpUrl(src)) {
    return NextResponse.redirect(src, {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  }

  // Cas 2 : fallback explicite
  if (fallback) {
    return NextResponse.redirect("/logo.webp", {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  }

  // Cas 3 : image riche (générée) — on tente ImageResponse, mais en cas d'échec
  // on retombe sur l'image statique.
  try {
    // Import dynamique pour éviter de charger le module dans tous les cas
    const { ImageResponse } = await import("next/og");

    const price = searchParams.get("price") || "";
    const category = searchParams.get("category") || "";

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
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {category && (
              <div
                style={{
                  fontSize: 24,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#C8A03B",
                  marginBottom: 24,
                }}
              >
                {category}
              </div>
            )}
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                marginBottom: 24,
                maxWidth: 620,
              }}
            >
              {title || "China Express"}
            </div>
            {price && (
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: "#C8A03B",
                }}
              >
                {price}
              </div>
            )}
          </div>

          <div
            style={{
              width: 360,
              height: 360,
              borderRadius: 24,
              background: "rgba(255,255,255,0.06)",
              border: "2px solid rgba(200,160,59,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 140,
                fontWeight: 900,
                color: "#C8A03B",
                opacity: 0.85,
              }}
            >
              Z
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 50,
              left: 80,
              fontSize: 22,
              color: "white",
              opacity: 0.7,
            }}
          >
            zenith6.vercel.app · China Express
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control":
            "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (err) {
    console.error("[og] fallback car erreur:", err?.message || err);
    return NextResponse.redirect("/logo.webp", {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  }
}
