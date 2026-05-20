import { motion } from "motion/react";
import { Mail, Phone, MapPin, Globe, Clock, Shield, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { SiteContent } from "../types";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(data => setContent(data));
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Full name must not exceed 50 characters.";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = "Message must not exceed 1000 characters.";
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone.trim() && !/^[\d\s+\-()]+$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          event_id: ""
        })
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setErrors({});
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const body = await res.text();
        setErrors({ submit: body ? JSON.parse(body).error : "Failed to send inquiry. Please try again." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: "An error occurred. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 pb-0 bg-[#fdfdfd] min-h-screen">
      {/* 1. Header */}
      <section className="container mx-auto px-12 mb-20 text-center max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6">Secure Channel</h4>
          <h1 className="text-7xl md:text-9xl font-serif font-black tracking-tighter mb-8 text-gray-900">Contact Us</h1>
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
                <h3 className="text-3xl font-serif font-black tracking-tighter mb-8 text-white">Headquarters</h3>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <MapPin className="text-brand-primary shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Corporate Office</p>
                      <p className="text-base font-light text-white">42 Luxury Row, Heritage District<br/>Kolkata, West Bengal, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-12 md:p-16 rounded-[4rem] shadow-2xl shadow-brand-primary/5">
            <h2 className="text-4xl font-serif font-black tracking-tighter mb-12 text-gray-900">Dispatch Message</h2>
            
            {success && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <p className="text-green-700 font-bold text-sm">✓ Enquiry sent successfully. Our concierge team will respond shortly.</p>
              </div>
            )}

            {errors.submit && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-700 font-bold text-sm">✗ {errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Full Handle</label>
                  <input 
                    type="text"
                    className={`bg-transparent border-b py-3 outline-none focus:border-brand-primary transition-all text-sm font-bold text-gray-900 ${
                      errors.name ? "border-red-400" : "border-gray-200"
                    }`}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                  />
                  {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Email Address</label>
                  <input
                    type="email"
                    className={`bg-transparent border-b py-3 outline-none focus:border-brand-primary transition-all text-sm font-bold text-gray-900 ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Mobile Number (Optional)</label>
                <input
                  type="text"
                  placeholder="EX: +91 98765 43210"
                  className={`bg-transparent border-b py-3 outline-none focus:border-brand-primary transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal ${
                    errors.phone ? "border-red-400" : "border-gray-200"
                  }`}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                />
                {errors.phone && <p className="text-red-500 text-xs font-bold">{errors.phone}</p>}
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Narrative</label>
                <textarea
                  rows={4}
                  className={`border rounded-2xl p-6 outline-none focus:border-brand-primary transition-all text-sm resize-none font-medium ${
                    errors.message ? "border-red-400 bg-red-50" : "border-gray-100 bg-slate-50"
                  } text-gray-900`}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: "" });
                  }}
                />
                <div className="flex justify-between items-start">
                  <div>
                    {errors.message && <p className="text-red-500 text-xs font-bold">{errors.message}</p>}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${
                    formData.message.length > 1000 ? "text-red-500" : "text-gray-400"
                  }`}>
                    {formData.message.length}/1000
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-brand-primary text-white font-black text-[12px] uppercase tracking-[0.4em] hover:bg-brand-navy transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50 rounded-2xl"
              >
                {loading ? "TRANSMITTING..." : "DISPATCH NOW"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Global Offices (New) */}
      {content?.contact_offices && content.contact_offices.length > 0 && (
        <section className="py-32 bg-slate-50 border-y border-gray-100">
          <div className="container mx-auto px-12">
            <div className="text-center mb-20">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">Our Outposts</h4>
              <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900">Global Offices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {content.contact_offices.map((office, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center group hover:shadow-xl transition-all">
                  <Globe className="text-brand-primary mx-auto mb-6 opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
                  <h3 className="text-3xl font-black tracking-tighter mb-2 text-gray-900">{office.city}</h3>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-brand-primary mb-6">{office.desc}</p>
                  <p className="text-gray-500 font-serif">{office.address}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. VIP Concierge (New) */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">White Glove Service</h4>
              <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900 mb-8">The VIP Concierge</h2>
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
      {content?.contact_faqs && content.contact_faqs.length > 0 && (
        <section className="py-32 bg-brand-navy text-white">
          <div className="container mx-auto px-12 max-w-4xl">
            <div className="text-center mb-20">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">Knowledge Base</h4>
              <h2 className="text-5xl font-serif font-black tracking-tighter">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {content.contact_faqs.map((faq, i) => (
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
      )}
    </div>
  );
}
