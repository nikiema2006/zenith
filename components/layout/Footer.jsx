import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_china-africa-trade-1/artifacts/gm0lbsx0_logochinaexpress-removebg-preview.png";

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="hidden md:block relative border-t border-[#C8A03B]/20 bg-card mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Zenith Global" className="h-12 w-auto" />
            <div>
              <p className="font-display text-xl">
                Zenith <span className="text-gold-gradient font-semibold">Global</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Import/Export</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Le pont entre les usines chinoises et ton business en Afrique. De Shenzhen à Ouaga, sans stress.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C8A03B] mb-4">Pages</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-foreground">Accueil</a></li>
            <li><a href="/catalogue" className="hover:text-foreground">Catalogue</a></li>
            <li><a href="/tracking" className="hover:text-foreground">Suivre un colis</a></li>
            <li><a href="/infos" className="hover:text-foreground">Comment ça marche</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C8A03B] mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-[#C8A03B]" />
              <a href="tel:+22606900288" className="hover:text-foreground">+226 06 90 02 88</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-[#C8A03B]" />
              <a href="tel:+22607336700" className="hover:text-foreground">+226 07 33 67 00</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={14} className="text-[#C8A03B]" />
              <a href="https://wa.me/22606900288" className="hover:text-foreground">WhatsApp business</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-[#C8A03B]" />
              <span>Ouagadougou, Burkina Faso</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#C8A03B] mb-4">Notre promesse</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Un phénix qui porte tes colis. Un partenaire qui porte ton business.
          </p>
          <p className="text-sm text-foreground mt-3 font-display italic">
            « L'Afrique se fournit en Chine. »
          </p>
        </div>
      </div>

      <div className="border-t border-[#C8A03B]/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Zenith Global. Tous droits réservés.</p>
          <p className="font-mono tracking-wider">Shenzhen → Ouagadougou</p>
        </div>
      </div>
    </footer>
  );
}
