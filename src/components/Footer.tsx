import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
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
    <footer className="bg-brand-navy border-t border-white/10 pt-16 pb-8 font-serif">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 items-start">
          {/* Brand */}
          <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Himsagar Travels"
                className="h-14 md:h-16 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white/50 leading-relaxed text-sm max-w-xs">
              Crafting unparalleled travel experiences and spiritual expeditions since 1995. Hand-selected journeys for the discerning traveler.
            </p>
            <div className="flex gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/himsagar_travels?igsh=ZzF2MzdkOHZweHlp"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/himsagartravelsofficial/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/919310238426"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quicklinks */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-8 ml-16">Quicklinks</h4>
            <ul className="space-y-4 ml-16">
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "Spiritual Tours", path: "/tours?category=Spiritual" },
                { name: "Domestic Tours", path: "/tours?category=Domestic" },
                { name: "International Tours", path: "/tours?category=International" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-white/50 hover:text-white transition-colors font-serif">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-8">
              Contact
            </h4>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-brand-primary mt-1 shrink-0" />
                <span className="text-white/50 hover:text-white transition-colors font-serif leading-relaxed">
                  {content.address}
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Phone size={14} className="text-brand-primary shrink-0" />
                <a
                  href={`tel:${content.contact_phone.replace(/\s+/g, "")}`}
                  className="text-white/50 hover:text-white transition-colors font-serif"
                >
                  {content.contact_phone}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail size={14} className="text-brand-primary shrink-0" />
                <a
                  href={`mailto:${content.contact_email}`}
                  className="text-white/50 hover:text-white transition-colors font-serif"
                >
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
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 font-serif">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} {content.site_name}. All rights reserved.
          </p>
          <a
            href="https://www.freshdigihub.com/"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/40 hover:text-brand-primary transition-colors"
          >
            Powered by FreshDigiHub
          </a>
        </div>
      </div>
    </footer>
  );
}
