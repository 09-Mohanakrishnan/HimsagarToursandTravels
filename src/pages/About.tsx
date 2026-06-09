import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Compass, Shield, Users, Map, Globe, Leaf, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteContent } from "../types";
import * as LucideIcons from "lucide-react";

export default function About() {
  const [content, setContent] = useState<SiteContent | null>(null);

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
    <div className="pt-40 pb-0 bg-[#fcfdfd] min-h-screen">
      {/* 1. Header Section */}
      <section className="container mx-auto px-12 mb-32">
        <header className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6">Our Origin</h4>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black tracking-tighter mb-8 text-gray-900 leading-[0.85]">The Art of <br/>Discovery</h1>
            <p className="text-gray-500 text-base uppercase tracking-[0.2em] font-bold leading-loose mt-12">
              Himsagar Travels was founded on a simple belief: that travel is not just about visiting places, but about the unique stories that emerge when we step into the unknown.
            </p>
          </motion.div>
        </header>
      </section>

      {/* 2. Heritage Section */}
      <section className="container mx-auto px-12 mb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1470" 
              className="w-full h-full object-cover" 
              alt="Mountain scenery"
            />
            <div className="absolute inset-0 bg-brand-navy/10" />
          </motion.div>
          <div className="space-y-12">
            <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900 leading-tight">A Heritage of <br/>High Passes</h2>
            <div className="prose prose-lg text-gray-500 font-light leading-relaxed space-y-6">
              <p>Based in the foothills of the Himalayas, we began as a small collective of guides dedicated to showing the world the hidden rituals of Ladakh and Himachal.</p>
              <p>Today, our manifest includes expeditions across the globe, yet our philosophy remains grounded in local expertise and hand-crafted curation. We do not sell tours; we design transformative experiences.</p>
            </div>
            {content?.about_heritage_stats && content.about_heritage_stats.length > 0 && (
              <div className="grid grid-cols-2 gap-10 pt-8 border-t border-gray-100">
                 {content.about_heritage_stats.map((stat, i) => (
                   <div key={i}>
                      <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">{stat.label}</h4>
                      <p className="text-3xl font-serif font-black tracking-tighter text-gray-800">{stat.value}</p>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Guiding Principles */}
      {content?.about_principles && content.about_principles.length > 0 && (
        <section className="py-32 bg-slate-50 rounded-[4rem] px-12 md:px-32 mb-40 container mx-auto">
           <div className="text-center mb-24">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">Our Creed</h4>
              <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900">Guiding Principles</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              {content.about_principles.map((item, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={i} className="text-center space-y-6">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-brand-primary mx-auto shadow-sm border border-gray-100">
                      {getIcon(item.icon)}
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">{item.title}</h3>
                   <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-loose">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </section>
      )}

      {/* 4. Global Footprint (New) */}
      <section className="py-32 bg-brand-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="container mx-auto px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6">Global Reach</h4>
              <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-10 leading-tight">Operating Across <br/>4 Continents</h2>
              <p className="text-white/60 font-light leading-relaxed text-lg mb-12">
                From the dense jungles of Southeast Asia to the icy peaks of the Himalayas, our operational network spans the globe. We maintain direct relationships with boutique properties and local fixers worldwide, ensuring priority access and authentic experiences wherever you roam.
              </p>
              {content?.about_global_stats && content.about_global_stats.length > 0 && (
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  {content.about_global_stats.map((stat, i) => (
                    <div key={i} className="border-l-2 border-brand-primary pl-4">
                      <h3 className="text-xl font-black tracking-tight mb-1">{stat.region}</h3>
                      <p className="text-brand-primary text-[10px] uppercase tracking-widest font-bold">{stat.count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600" className="w-full aspect-[3/4] object-cover rounded-3xl" alt="Bali" />
              <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600" className="w-full aspect-[3/4] object-cover rounded-3xl mt-12" alt="Nepal" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sustainable Travel (New) */}
      <section className="py-40 bg-white">
        <div className="container mx-auto px-12 text-center max-w-5xl">
          <Leaf size={48} className="text-brand-primary mx-auto mb-10" />
          <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6">Our Commitment</h4>
          <h2 className="text-5xl md:text-6xl font-serif font-black tracking-tighter mb-10 text-gray-900">Sustainable & Conscious Travel</h2>
          <p className="text-gray-500 text-xl font-light leading-relaxed mb-16">
            We believe that luxury and sustainability must coexist. A portion of every journey booked goes directly toward local conservation efforts and community development in the regions we visit. We strictly partner with eco-conscious lodges and employ zero-trace expedition tactics.
          </p>
          <div className="flex flex-wrap justify-center gap-12">
            <div className="flex items-center gap-4 text-left">
              <Globe className="text-brand-primary" size={32} />
              <div>
                <p className="font-black text-gray-900">Carbon Neutral</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">All Flights Offset</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left">
              <Users className="text-brand-primary" size={32} />
              <div>
                <p className="font-black text-gray-900">Community First</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">100% Local Guides</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left">
              <Award className="text-brand-primary" size={32} />
              <div>
                <p className="font-black text-gray-900">Certified Eco</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Partner Properties</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Leadership/Founders (New) */}
      {content?.about_team && content.about_team.length > 0 && (
        <section className="py-32 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20">
              <div>
                <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-4">The Architects</h4>
                <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900">Meet The Visionaries</h2>
              </div>
              <Link to="/contact" className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary hover:text-brand-navy transition-colors border-b border-brand-primary pb-1">
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

      {/* 7. Final CTA (New) */}
      <section className="py-40 bg-white text-center">
        <div className="container mx-auto px-12 max-w-4xl">
          <h2 className="text-5xl md:text-8xl font-serif font-black tracking-tighter text-gray-900 mb-10 leading-[0.9]">Begin Your <br/>Next Chapter</h2>
          <p className="text-gray-500 uppercase tracking-[0.2em] font-bold text-sm mb-12">Connect with a travel designer today to craft your bespoke itinerary.</p>
          <Link to="/contact" className="inline-flex items-center gap-4 px-12 py-6 bg-brand-navy text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-2xl rounded-xl">
            Start Planning <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
