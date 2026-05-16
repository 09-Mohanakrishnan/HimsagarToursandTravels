import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-navy border-t border-white/10 pt-20 pb-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6 col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Himsagar Travels"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white/50 leading-relaxed text-sm max-w-xs">
              Crafting unparalleled travel experiences and spiritual expeditions since 2010. Hand-selected journeys for the discerning traveler.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/himsagar_travels?igsh=ZzF2MzdkOHZweHlp"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary transition-all"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: "Home", path: "/" },
                { name: "Tours", path: "/tours" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-white/50 hover:text-white transition-colors text-[11px] uppercase tracking-[0.25em] font-bold">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-8">Contact</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-brand-primary mt-1 shrink-0" />
                <span className="text-white/50 text-xs font-medium leading-relaxed">Kolkata, West Bengal, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-brand-primary shrink-0" />
                <a href="tel:+917845738386" className="text-white/50 hover:text-white text-xs font-medium transition-colors">+91 78457 38386</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-brand-primary shrink-0" />
                <a href="mailto:concierge@himsagar.com" className="text-white/50 hover:text-white text-xs font-medium transition-colors">concierge@himsagar.com</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-8">Newsletter</h4>
            <p className="text-white/50 text-xs font-bold leading-relaxed mb-6 uppercase tracking-widest">
              Get early access to exclusive tour launches.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-all text-[11px] uppercase tracking-widest placeholder:text-white/20 text-white"
              />
              <button type="submit" className="w-full py-3 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-brand-accent transition-all rounded-xl">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">
            © {new Date().getFullYear()} Himsagar Travels. All rights reserved.
          </p>
          <a
            href="https://www.freshdigihub.com/"
            target="_blank"
            rel="noreferrer"
            className="text-[9px] uppercase tracking-[0.3em] text-white/30 hover:text-brand-primary transition-colors font-bold"
          >
            Powered by FreshDigiHub
          </a>
        </div>
      </div>
    </footer>
  );
}
