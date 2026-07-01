import { motion } from "motion/react";
import { Mail, Phone, MapPin, Globe, Clock, Shield, Plus, Minus, Send, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { SiteContent } from "../types";
import { useSEO } from "../lib/useSEO";

export default function Contact() {
  useSEO({
    title: "Contact Us – Book Your Journey | Himsagar Travels",
    description: "Get in touch with Himsagar Travels for bookings, inquiries, and custom tour packages. Find our office locations, FAQs, and contact details.",
    canonicalPath: "/contact",
  });

  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const isActive = (field: string) => focusedField === field || formData[field as keyof typeof formData].length > 0;

  return (
    <div className="pt-0 pb-0 bg-[#fdfdfd] min-h-screen">
      {/* 1. Split-Screen Hero + Form */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Dark Info Panel */}
        <div className="bg-brand-navy relative overflow-hidden flex flex-col justify-center px-8 md:px-16 lg:px-20 py-32 lg:py-20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-20 left-10 w-20 h-20 border border-brand-primary/10 rounded-full pointer-events-none" />
          <div className="absolute bottom-32 right-16 w-32 h-32 border border-white/5 rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-lg"
          >
            <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6 flex items-center gap-2">
              <Sparkles size={12} /> Get in Touch
            </h4>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black tracking-tighter mb-6 text-white leading-[0.95]">
              Let's Plan<br />Your Next<br />
              <span className="text-brand-primary">Adventure</span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed mb-12 max-w-md">
              Whether it's a spiritual pilgrimage to the Himalayas or an exotic getaway to Bali — we're here to craft your perfect journey.
            </p>

            {/* Contact Info Cards */}
            <div className="space-y-4">
              <a href="mailto:himsagartour@gmail.com" className="group flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-primary/40 hover:bg-white/[0.08] transition-all">
                <div className="w-12 h-12 bg-brand-primary/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-primary/25 transition-colors">
                  <Mail size={18} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-white/40 mb-1">Email</p>
                  <p className="text-white font-bold text-sm">himsagartour@gmail.com</p>
                </div>
              </a>

              <a href="tel:+91 93102 38426" className="group flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-primary/40 hover:bg-white/[0.08] transition-all">
                <div className="w-12 h-12 bg-brand-primary/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-primary/25 transition-colors">
                  <Phone size={18} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-white/40 mb-1">Phone</p>
                  <p className="text-white font-bold text-sm">+91 93102 38426</p>
                </div>
              </a>

              <div className="group flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-12 h-12 bg-brand-primary/15 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-white/40 mb-1">Office</p>
                  <p className="text-white font-bold text-sm">1/15, Kuppaiah Street, Station Rd,
                    West Mambalam, Chennai - 600033</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-8">
              <a href="https://www.instagram.com/himsagar_travels?igsh=ZzF2MzdkOHZweHlp" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-brand-primary hover:border-brand-primary transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="https://www.facebook.com/himsagar.travels.3/" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-brand-primary hover:border-brand-primary transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="https://wa.me/919310238426" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-brand-primary hover:border-brand-primary transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right: Contact Form */}
        <div className="flex items-center justify-center px-8 md:px-16 lg:px-20 py-20 lg:py-32 bg-[#fdfdfd] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary/0 via-brand-primary/30 to-brand-primary/0 lg:hidden" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-lg"
          >
            <div className="mb-10">
              <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-4">Send a Message</h4>
              <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter text-gray-900 mb-3">We'd Love to<br />Hear From You</h2>
              <p className="text-gray-400 text-sm">Fill out the form and our team will get back to you within 24 hours.</p>
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-5 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p className="text-green-700 font-bold text-sm">Message sent successfully! We'll respond shortly.</p>
              </motion.div>
            )}

            {errors.submit && (
              <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-700 font-bold text-sm">✗ {errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label
                    className={`absolute left-4 transition-all duration-200 pointer-events-none font-bold ${isActive('name')
                      ? 'top-2 text-[8px] uppercase tracking-[0.2em] text-brand-primary'
                      : 'top-4 text-xs text-gray-400'
                      }`}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-white border rounded-xl pt-7 pb-3 px-4 outline-none transition-all text-sm font-bold text-gray-900 ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-brand-primary focus:shadow-sm focus:shadow-brand-primary/10'
                      }`}
                    value={formData.name}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                  />
                  {errors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.name}</p>}
                </div>

                <div className="relative">
                  <label
                    className={`absolute left-4 transition-all duration-200 pointer-events-none font-bold ${isActive('email')
                      ? 'top-2 text-[8px] uppercase tracking-[0.2em] text-brand-primary'
                      : 'top-4 text-xs text-gray-400'
                      }`}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className={`w-full bg-white border rounded-xl pt-7 pb-3 px-4 outline-none transition-all text-sm font-bold text-gray-900 ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-brand-primary focus:shadow-sm focus:shadow-brand-primary/10'
                      }`}
                    value={formData.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.email}</p>}
                </div>
              </div>

              {/* Phone */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none font-bold ${isActive('phone')
                    ? 'top-2 text-[8px] uppercase tracking-[0.2em] text-brand-primary'
                    : 'top-4 text-xs text-gray-400'
                    }`}
                >
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  className={`w-full bg-white border rounded-xl pt-7 pb-3 px-4 outline-none transition-all text-sm font-bold text-gray-900 ${errors.phone ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-brand-primary focus:shadow-sm focus:shadow-brand-primary/10'
                    }`}
                  value={formData.phone}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                />
                {errors.phone && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.phone}</p>}
              </div>

              {/* Message */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none font-bold z-10 ${isActive('message')
                    ? 'top-2 text-[8px] uppercase tracking-[0.2em] text-brand-primary'
                    : 'top-4 text-xs text-gray-400'
                    }`}
                >
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  className={`w-full bg-white border rounded-xl pt-7 pb-3 px-4 outline-none transition-all text-sm resize-none font-medium text-gray-900 ${errors.message ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-brand-primary focus:shadow-sm focus:shadow-brand-primary/10'
                    }`}
                  value={formData.message}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: "" });
                  }}
                />
                <div className="flex justify-between items-start mt-1">
                  <div>
                    {errors.message && <p className="text-red-500 text-xs font-bold ml-1">{errors.message}</p>}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.message.length > 1000 ? "text-red-500" : "text-gray-300"
                    }`}>
                    {formData.message.length}/1000
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-brand-primary text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-navy transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50 rounded-xl flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. Global Offices
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
      )} */}

      {/* 3. VIP Concierge
      <section className="py-32 bg-white">
        <div className="container mx-auto px-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">White Glove Service</h4>
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-gray-900 mb-8">The VIP Concierge</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Our private client advisory handles the most complex travel demands for ultra-high-net-worth individuals, royal families, and corporate executives. We provide absolute discretion, unlisted property access, and security details.
              </p>
              <ul className="space-y-4 text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">
                <li className="flex items-center gap-4"><Shield className="text-brand-primary" size={16} /> Absolute Privacy & Discretion</li>
                <li className="flex items-center gap-4"><Clock className="text-brand-primary" size={16} /> 24/7 Dedicated Advisory</li>
                <li className="flex items-center gap-4"><Globe className="text-brand-primary" size={16} /> Unlisted Property Access</li>
              </ul>
            </div>
            <div className="w-full max-w-[520px] mx-auto aspect-square rounded-full overflow-hidden border-8 border-slate-50 shadow-2xl">
              <img src="/coincerge.png" className="w-full h-full object-cover" alt="Concierge service" />
            </div>
          </div>
        </div>
      </section> */}

      {/* 4. Map Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-6">Find Us</h4>
            <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-gray-900">Our Location</h2>
          </div>
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8531559485393!2d80.22419!3d13.0382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267e17edb0b0d%3A0x4e39cf53b5e7c42!2sHim%20Sagar%20Tours%20%26%20Travels%20Private%20Limited!5e0!3m2!1sen!2sin!4v1717943600000!5m2!1sen!2sin"
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Him Sagar Tours & Travels - West Mambalam, Chennai"
            />
          </div>
          <div className="mt-6 text-center">
            <a
              href="https://maps.google.com/?q=Him+Sagar+Tours+%26+Travels+Private+Limited,+West+Mambalam,+Chennai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-brand-primary text-sm font-bold hover:text-brand-accent transition-colors"
            >
              <MapPin size={14} />
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
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
