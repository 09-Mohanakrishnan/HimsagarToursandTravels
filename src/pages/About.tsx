import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Compass, Shield, Users, Map, Globe, Leaf, Award, ArrowRight, MapPin, Clock, Sparkles, BadgeDollarSign, Headphones, BookOpen, Heart, Mountain, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteContent } from "../types";
import { useSEO } from "../lib/useSEO";
import * as LucideIcons from "lucide-react";

// Animated counter component
function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const numericPart = parseInt(target.replace(/[^0-9]/g, "")) || 0;
  const textSuffix = target.replace(/[0-9,]/g, "").trim() || suffix;

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = numericPart / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericPart) {
        setCount(numericPart);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, numericPart]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{textSuffix}
    </span>
  );
}

const whyChooseItems = [
  {
    icon: Compass,
    title: "Personalized Itineraries",
    desc: "Your travel plan is designed to suit your preferences, budget, and timeline – no cookie-cutter trips."
  },
  {
    icon: Shield,
    title: "Trusted Network",
    desc: "We work only with verified hotels, guides, and transport providers to ensure your safety and comfort."
  },
  {
    icon: BadgeDollarSign,
    title: "Best Price Guarantee",
    desc: "We offer competitive pricing with transparent costs and zero hidden charges."
  },
  {
    icon: Headphones,
    title: "24/7 Assistance",
    desc: "Round-the-clock support so you can travel worry-free, anywhere in the world."
  },
  {
    icon: BookOpen,
    title: "Expert Guidance",
    desc: "Our seasoned travel designers bring deep local knowledge to craft authentic, immersive journeys."
  },
  {
    icon: Heart,
    title: "Memorable Experiences",
    desc: "We go beyond logistics to create moments that stay with you long after the journey ends."
  }
];

const stats = [
  { value: "154", suffix: "", label: "Destinations" },
  { value: "20", suffix: "+", label: "Amazing Tours" },
  { value: "50", suffix: "", label: "Tour Types" },
  { value: "117259", suffix: "", label: "Happy Customers" }
];

export default function About() {
  const [content, setContent] = useState<SiteContent | null>(null);

  useSEO({
    title: "About Us – Our Story & Heritage | Himsagar Travels",
    description: "Since 1995, Himsagar Travels has been crafting spiritual and Himalayan tour packages. Learn about our heritage, principles, and team.",
    canonicalPath: "/about",
  });

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(data => setContent(data));
  }, []);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent size={32} strokeWidth={1.5} /> : <Compass size={32} strokeWidth={1.5} />;
  };

  return (
    <div className="pb-0 bg-[#fcfdfd] min-h-screen">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO SECTION — Full-bleed cinematic hero
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-28">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000"
            alt="Journey landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/70 via-brand-navy/50 to-brand-navy/80" />
        </div>

        {/* Floating geometric accents */}
        <div className="absolute top-20 left-10 w-72 h-72 border border-white/[0.06] rounded-full" />
        <div className="absolute bottom-16 right-16 w-48 h-48 border border-brand-primary/10 rounded-full" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-6 py-2.5 mb-10">
              <Mountain size={14} className="text-brand-primary" />
              <span className="text-white/80 text-[10px] uppercase tracking-[0.4em] font-bold">Crafting Journeys Since 1995</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-serif font-black tracking-tighter text-white leading-[0.9] mb-8">
              We Help You<br />
              <span className="text-brand-primary">Plan Your Journey</span>
            </h1>
            <p className="text-white/55 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-14">
              At Himsagar Travels, we believe travel is more than just reaching a destination — it's about the experiences, the memories, and the connections you make along the way.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                to="/tours"
                className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary text-brand-navy font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all duration-300 rounded-xl shadow-2xl shadow-brand-primary/20"
              >
                Explore Tours <ArrowRight size={14} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-black text-xs uppercase tracking-[0.3em] hover:bg-white/20 transition-all duration-300 rounded-xl"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcfdfd] to-transparent" />
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          2. ABOUT — Mission Statement + Who We Are
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">
            {/* Left: Stacked Images */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1470"
                    className="w-full h-full object-cover"
                    alt="Mountain scenery"
                  />
                </div>
                {/* Floating accent card */}
                <div className="absolute -bottom-8 -right-4 md:-right-8 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Plane className="text-brand-primary" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-serif font-black tracking-tighter text-gray-900">30+ Years</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">of Excellence</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div>
                <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-5">About Us</h4>
                <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-gray-900 leading-tight mb-8">
                  Our Mission Is To<br />Make Travel <span className="text-brand-primary">Seamless</span>
                </h2>
                <p className="text-gray-500 text-base leading-relaxed mb-6">
                  Founded with a passion for exploration, our mission is to make every trip seamless, exciting, and memorable for our travelers. We don't just book tours — we design transformative experiences.
                </p>
              </div>

              {/* Who We Are */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h3 className="text-xl font-serif font-black tracking-tighter text-gray-900 mb-4 flex items-center gap-3">
                  <Users size={20} className="text-brand-primary" />
                  Who We Are
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We are a team of travel enthusiasts, planners, and dreamers committed to curating the best travel experiences for you. Whether you are looking for a serene escape to the mountains, an adventurous road trip, or a cultural tour across India — we've got you covered.
                </p>
              </div>

              {/* Quick feature pills */}
              <div className="flex flex-wrap gap-3">
                {["Spiritual Journeys", "Domestic Tours", "International Trips", "Custom Itineraries"].map((tag, i) => (
                  <span key={i} className="px-5 py-2.5 bg-brand-primary/8 text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold rounded-full border border-brand-primary/15">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          3. STATISTICS — Social Proof Banner
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-brand-navy relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tighter text-white mb-3 group-hover:text-brand-primary transition-colors duration-300">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          4. WHY CHOOSE HIMSAGAR TRAVELS — 6-card grid
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 bg-[#fcfdfd]">
        <div className="container mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6">Why Choose</h4>
              <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-gray-900 mb-6">
                Himsagar Travels
              </h2>
              <p className="text-gray-400 text-sm uppercase tracking-[0.15em] font-bold leading-relaxed">
                Six reasons why thousands of travelers trust us to make their journeys extraordinary
              </p>
            </motion.div>
          </div>

          {/* 6-card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative bg-white rounded-2xl p-8 md:p-10 border border-gray-100 hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500"
                >
                  {/* Number watermark */}
                  <span className="absolute top-6 right-8 text-[80px] font-serif font-black text-gray-50 leading-none select-none group-hover:text-brand-primary/[0.06] transition-colors duration-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-7 group-hover:bg-brand-primary group-hover:text-white text-brand-primary transition-all duration-300">
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          5. THE ARCHITECTS — Preserved exactly as-is
      ═══════════════════════════════════════════════════════════════════════ */}
      {content?.about_team && content.about_team.length > 0 && (
        <section className="py-32 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20">
              <div>
                <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-4">The Architects</h4>
                <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900">Meet The Visionaries</h2>
              </div>
              <Link to="/contact" className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary hover:text-brand-navy transition-colors border-b border-brand-primary pb-1 mt-6 md:mt-0">
                Connect with our team
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
              {content.about_team.map((person, i) => (
                <div key={i} className="group">
                  <div className="aspect-[3/4] rounded-[4rem] overflow-hidden mb-8 relative shadow-xl">
                    <img src={person.img} alt={person.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-4xl font-serif font-black tracking-tighter text-gray-900 mb-2">{person.name}</h3>
                  <p className="text-brand-primary text-xs uppercase tracking-[0.3em] font-bold">{person.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ═══════════════════════════════════════════════════════════════════════
          6. FINAL CTA
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-40 bg-white text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tighter text-gray-900 mb-10 leading-[0.9]">Begin Your <br />Next Chapter</h2>
            <p className="text-gray-500 uppercase tracking-[0.2em] font-bold text-sm mb-12">Connect with a travel designer today to craft your bespoke itinerary.</p>
            <Link to="/contact" className="inline-flex items-center gap-4 px-12 py-6 bg-brand-navy text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-2xl rounded-xl">
              Start Planning <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
