import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata = {
  title: {
    default: "Zenith Global — Importation Chine → Afrique",
    template: "%s · Zenith Global",
  },
  description: "Agent d'importation Chine → Afrique. Catalogue produits prix d'usine, calculateur de profit, suivi de colis. De Guanzhou à Ouaga, sans stress.",
  keywords: ["importation chine afrique", "chinois produits", "Guanzhou ouaga", "grossiste chine"],
  authors: [{ name: "Zenith Global" }],
  creator: "Zenith Global",
  publisher: "Zenith Global",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Zenith Global",
    title: "Zenith Global — Importation Chine → Afrique",
    description: "Agent d'importation Chine → Afrique. Catalogue produits prix d'usine, calculateur de profit, suivi de colis.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zenith Global — De Guanzhou à Ouaga, sans stress",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zenith Global — Importation Chine → Afrique",
    description: "Agent d'importation Chine → Afrique. Catalogue produits prix d'usine, calculateur de profit, suivi de colis.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${montserrat.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Header />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <Toaster
          theme="dark"
          position="top-right"
        />
      </body>
    </html>
  );
}
