import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import SubscriptionForm from "./SubscriptionForm";

export default function Footer() {
  const [content, setContent] = useState({
    contact_email: "concierge@himsagar.com",
    contact_phone: "+91 78457 38386",
    address: "Kolkata, West Bengal, India",
    instagram_url: "https://www.instagram.com/himsagar_travels",
    site_name: "Himsagar Travels",
  });

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setContent((prev) => ({
            ...prev,
            contact_email: data.contact_email || prev.contact_email,
            contact_phone: data.contact_phone || prev.contact_phone,
            address: data.address || prev.address,
            instagram_url: data.instagram_url || prev.instagram_url,
            site_name: data.site_name || prev.site_name,
          }));
        }
      })
      .catch(() => {
        // Keep defaults on failure.
      });
  }, []);

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
                className="h-16 md:h-20 w-auto object-contain brightness-0 invert"
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
                <span className="text-white/50 text-xs font-medium leading-relaxed">{content.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-brand-primary shrink-0" />
                <a href={`tel:${content.contact_phone.replace(/\s+/g, "")}`} className="text-white/50 hover:text-white text-xs font-medium transition-colors">
                  {content.contact_phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-brand-primary shrink-0" />
                <a href={`mailto:${content.contact_email}`} className="text-white/50 hover:text-white text-xs font-medium transition-colors">
                  {content.contact_email}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <SubscriptionForm
            source="footer"
            title="Newsletter"
            description="Get early access to exclusive tour launches."
            buttonLabel="Subscribe"
          />
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">
            © {new Date().getFullYear()} {content.site_name}. All rights reserved.
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
