import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";
  const isDarkNav = scrolled || !isHome;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tours", path: "/tours" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-3 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-500 rounded-2xl",
        isDarkNav
          ? "bg-white/95 backdrop-blur-3xl py-3 border border-gray-100 shadow-xl"
          : "bg-white/10 backdrop-blur-md py-4 border border-white/20"
      )}
    >
      <div className="px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Himsagar Travels"
            className={cn(
              "h-14 md:h-20 w-auto object-contain transition-all",
              isDarkNav ? "brightness-0" : "brightness-0 invert"
            )}
          />
        </Link>

        {/* Desktop Nav */}
        <div className={cn(
          "hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-black transition-colors",
          isDarkNav ? "text-brand-dark" : "text-white"
        )}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "transition-all hover:text-brand-primary relative py-1",
                location.pathname === link.path
                  ? "text-brand-primary border-b-2 border-brand-primary"
                  : "opacity-80"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/contact"
            className={cn(
              "px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              isDarkNav
                ? "bg-brand-primary text-white hover:bg-brand-accent"
                : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
            )}
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={cn("md:hidden p-2 rounded-xl transition-colors", isDarkNav ? "text-brand-dark" : "text-white")}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden"
      >
        <div className="bg-white/98 backdrop-blur-xl rounded-b-2xl px-6 py-6 flex flex-col gap-4 border-t border-gray-100">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-xl font-serif font-black  tracking-tighter transition-colors py-2 border-b border-gray-50",
                location.pathname === link.path ? "text-brand-primary" : "text-gray-900"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="mt-2 w-full text-center py-4 bg-brand-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand-accent transition-colors"
          >
            Book Now
          </Link>
          <Link
            to="/admin/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]"
          >
            <User size={14} className="text-brand-primary" />
            Admin Access
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}
