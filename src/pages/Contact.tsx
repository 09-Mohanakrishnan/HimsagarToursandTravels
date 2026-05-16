import { motion } from "motion/react";
import { Mail, Phone, MapPin, Globe, Clock, Shield, Plus, Minus, Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          event_id: "" // Empty event_id for general inquiries
        })
      });
      if (res.ok) {
        alert("Enquiry sent to the concierge team.");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        alert("Failed to send inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: "How far in advance should I book a bespoke itinerary?", a: "For custom expeditions, we recommend initiating the planning process at least 6 months in advance. For peak seasons in destinations like Japan or East Africa, 9-12 months is preferred to secure elite accommodations." },
    { q: "Do you handle private aviation and yacht charters?", a: "Yes. Our logistics team routinely coordinates private jet charters, helicopter transfers, and luxury yacht rentals as part of our comprehensive travel design service." },
    { q: "What is your cancellation policy?", a: "Cancellation terms are individually structured based on the specific vendors and properties in your itinerary. Your dedicated travel designer will provide a transparent outline of all terms before any deposit is collected." },
    { q: "Do you provide on-trip support?", a: "Absolutely. Every Himsagar Travels client receives access to our 24/7 global concierge desk, along with direct contact to local fixers in your destination timezone." }
  ];

  return (
    <div className="pt-40 pb-0 bg-[#fdfdfd] min-h-screen">
      {/* 1. Header */}
      <section className="container mx-auto px-12 mb-20 text-center max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6 italic">Secure Channel</h4>
          <h1 className="text-7xl md:text-9xl font-serif font-black italic tracking-tighter mb-8 text-gray-900">Contact Us</h1>
          <p className="text-gray-400 text-base uppercase tracking-[0.2em] font-bold leading-loose">
            Reach out to our global concierge for inquiries, partnerships, or expedition planning.
          </p>
        </motion.div>
      </section>

      {/* 2. Main Contact Form & Info */}
      <section className="container mx-auto px-12 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-slate-50 border border-gray-100 flex items-center justify-center text-brand-primary rounded-xl shadow-sm">
                  <Mail size={20} />
                </div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-800">Email Registry</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest underline underline-offset-4 decoration-brand-primary/20">concierge@himsagar.com</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-slate-50 border border-gray-100 flex items-center justify-center text-brand-primary rounded-xl shadow-sm">
                  <Phone size={20} />
                </div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-800">Direct Signal</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest underline underline-offset-4 decoration-brand-primary/20">+91 78457 38386</p>
              </div>
            </div>

            <div className="relative p-12 bg-brand-navy rounded-[3rem] shadow-xl overflow-hidden min-h-[400px] flex flex-col justify-end text-white">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1470" className="w-full h-full object-cover opacity-10 mix-blend-overlay" alt="Map" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/80 to-transparent" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-serif font-black italic tracking-tighter mb-8 text-white">Headquarters</h3>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <MapPin className="text-brand-primary shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Corporate Office</p>
                      <p className="text-base font-light text-white italic">42 Luxury Row, Heritage District<br/>Kolkata, West Bengal, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-12 md:p-16 rounded-[4rem] shadow-2xl shadow-brand-primary/5">
            <h2 className="text-4xl font-serif font-black italic tracking-tighter mb-12 text-gray-900">Dispatch Message</h2>
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Full Handle</label>
                  <input required type="text" className="bg-transparent border-b border-gray-200 py-3 outline-none focus:border-brand-primary transition-all text-sm font-bold text-gray-900" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Return Address</label>
                  <input required type="email" className="bg-transparent border-b border-gray-200 py-3 outline-none focus:border-brand-primary transition-all text-sm font-bold text-gray-900" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Subject of Interest</label>
                <input type="text" placeholder="EX: EXPEDITION #42 ENQUIRY" className="bg-transparent border-b border-gray-200 py-3 outline-none focus:border-brand-primary transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Narrative</label>
                <textarea rows={4} className="bg-slate-50 border border-gray-100 rounded-2xl p-6 outline-none focus:border-brand-primary transition-all text-sm resize-none text-gray-900 font-medium" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-6 bg-brand-primary text-white font-black text-[12px] uppercase tracking-[0.4em] italic hover:bg-brand-navy transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50 rounded-2xl">
                {loading ? "TRANSMITTING..." : "DISPATCH NOW"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Global Offices (New) */}
      <section className="py-32 bg-slate-50 border-y border-gray-100">
        <div className="container mx-auto px-12">
          <div className="text-center mb-20">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">Our Outposts</h4>
            <h2 className="text-5xl font-serif font-black italic tracking-tighter text-gray-900">Global Offices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { city: "London", desc: "Serving EMEA Clients", address: "15 Mayfair Place, London, UK" },
              { city: "New York", desc: "Serving Americas", address: "One World Trade Center, NY, USA" },
              { city: "Dubai", desc: "Serving Middle East", address: "Boulevard Plaza, Downtown Dubai, UAE" }
            ].map((office, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center group hover:shadow-xl transition-all">
                <Globe className="text-brand-primary mx-auto mb-6 opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
                <h3 className="text-3xl font-black tracking-tighter mb-2 text-gray-900">{office.city}</h3>
                <p className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-primary mb-6">{office.desc}</p>
                <p className="text-gray-500 font-serif italic">{office.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VIP Concierge (New) */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">White Glove Service</h4>
              <h2 className="text-5xl font-serif font-black italic tracking-tighter text-gray-900 mb-8">The VIP Concierge</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Our private client advisory handles the most complex travel demands for ultra-high-net-worth individuals, royal families, and corporate executives. We provide absolute discretion, unlisted property access, and security details.
              </p>
              <ul className="space-y-4 text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">
                <li className="flex items-center gap-4"><Shield className="text-brand-primary" size={16} /> Absolute Privacy & Discretion</li>
                <li className="flex items-center gap-4"><Clock className="text-brand-primary" size={16} /> 24/7 Dedicated Advisory</li>
                <li className="flex items-center gap-4"><Globe className="text-brand-primary" size={16} /> Unlisted Property Access</li>
              </ul>
            </div>
            <div className="aspect-square rounded-full overflow-hidden border-8 border-slate-50 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1542314831-c6a4d142104d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Concierge service" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ (New) */}
      <section className="py-32 bg-brand-navy text-white">
        <div className="container mx-auto px-12 max-w-4xl">
          <div className="text-center mb-20">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">Knowledge Base</h4>
            <h2 className="text-5xl font-serif font-black italic tracking-tighter">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="font-black text-lg tracking-tight pr-8">{faq.q}</span>
                  {activeFaq === i ? <Minus className="text-brand-primary shrink-0" /> : <Plus className="text-brand-primary shrink-0" />}
                </button>
                {activeFaq === i && (
                  <div className="px-8 pb-6 text-white/60 font-light leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
