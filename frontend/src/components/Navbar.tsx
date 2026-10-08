import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import LogoGMIM from "./LogoGMIM";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/warta", label: "Warta" },
  { to: "/organization", label: "Organization" },
  { to: "/event", label: "Event" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-primary-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-white to-gold-600 bg-clip-text text-transparent">
            <LogoGMIM/>
            <span>GMIM Gloria</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:bg-primary-700 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => navigate("/admin")}
              className="ml-4 bg-gold-400 hover:bg-gold-500 text-primary-900 text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Admin
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-primary-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-primary-900 px-4 pb-4 space-y-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-primary-700 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="block mt-2 bg-gold-400 hover:bg-gold-500 text-primary-900 text-sm font-semibold px-4 py-2 rounded-md text-center"
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
