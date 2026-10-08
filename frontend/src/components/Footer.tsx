import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import LogoGMIM from "./LogoGMIM";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <LogoGMIM/>
              GMIM Gloria
            </div>
            <p className="text-sm leading-relaxed">
              Melayani Tuhan dengan sepenuh hati. Menjangkau jiwa, membangun iman, dan menjadi berkat bagi sesama.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-white font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/warta", label: "Warta" },
                { to: "/organization", label: "Organization" },
                { to: "/event", label: "Event" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-gold-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-white font-semibold mb-3">Kontak Kami</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-300 flex-shrink-0" />
                <span>Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12345</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-300 flex-shrink-0" />
                <span>(021) 1234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-300 flex-shrink-0" />
                <span>info@gerejagloria.org</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-gold-300 flex-shrink-0" />
                <span>Ibadah Minggu: 08.00 & 10.30 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Gereja Gloria. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
