import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Star, MapPin, Calendar, Compass, DollarSign, ShieldCheck, HeartPulse, Send, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TravelEvent, SiteContent } from "../types";
import SubscriptionForm from "../components/SubscriptionForm";

const FALLBACK_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=2000"
];

const INSTAGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1564507592208-0270e30495f4?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=600"
];
const MARQUEE_IMAGES = [...INSTAGRAM_IMAGES, ...INSTAGRAM_IMAGES];

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<TravelEvent[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then(res => res.json()),
      fetch("/api/content").then(res => res.json())
    ]).then(([eventsData, contentData]) => {
      const normalized = eventsData.map((e: any) => ({ ...e, id: e._id || e.id }));
      setFeaturedEvents(normalized.filter((e: TravelEvent) => e.is_featured).slice(0, 3));
      setContent(contentData);
      setLoading(false);
    });
  }, []);

  const activeHeroImages = content?.hero_images?.length ? content.hero_images : FALLBACK_HERO_IMAGES;

  // Hero Carousel Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % activeHeroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeHeroImages]);

  return (
    <div className="flex flex-col bg-[#fcfdfd]">
      {/* 1. Hero Section (Auto Carousel) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-brand-dark">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentHeroIndex}
            src={activeHeroImages[currentHeroIndex]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Himsagar Travels Destinations"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-[14vw] md:text-[10vw] lg:text-[120px] font-serif font-black tracking-tighter text-brand-primary leading-[0.8] mb-6 drop-shadow-2xl">
              HIMSAGAR<br />TRAVELS
            </h1>
            <p className="text-white text-lg md:text-xl uppercase tracking-[0.3em] font-black mb-10 drop-shadow-md">
              EXPERIENCE THE EXTRAORDINARY:<br />
              <span className="text-white/80 font-light lowercase font-serif tracking-normal mt-2 block capitalize">Unforgettable Journeys Across the Himalayas & Beyond.</span>
            </p>
            <Link to="/tours" className="inline-block px-14 py-5 mb-6  bg-brand-primary text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/40 rounded-full">
              Explore Tours
            </Link>
          </motion.div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-30 hidden md:block">
          <div className="bg-white p-4 md:p-8 rounded-none md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
              <label className="text-[9px] uppercase tracking-widest font-black text-gray-400">Where to?</label>
              <input type="text" placeholder="Your destination" className="w-full outline-none text-gray-800 font-bold bg-transparent" />
            </div>
            <div className="flex-1 w-full space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
              <label className="text-[9px] uppercase tracking-widest font-black text-gray-400">Duration</label>
              <select className="w-full bg-transparent outline-none text-gray-800 font-bold appearance-none">
                <option>Select Duration</option>
                <option>1-7 Days</option>
                <option>8-14 Days</option>
                <option>15+ Days</option>
              </select>
            </div>
            <div className="flex-1 w-full space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
              <label className="text-[9px] uppercase tracking-widest font-black text-gray-400">Type</label>
              <select className="w-full bg-transparent outline-none text-gray-800 font-bold appearance-none">
                <option>Spiritual</option>
                <option>Trekking</option>
                <option>Leisure</option>
                <option>Adventure</option>
              </select>
            </div>
            <Link to="/tours" className="w-full md:w-auto px-12 py-5 bg-brand-navy text-white rounded-xl shadow-lg hover:bg-brand-dark transition-all flex items-center justify-center gap-3">
              <span className="text-[10px] uppercase font-black tracking-widest">Search</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Tour Categories Section */}
      {content?.categories && content.categories.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Discover Your Path</h4>
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-navy uppercase">Tour Categories</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.categories.map((cat, i) => (
                <Link to="/tours" key={i} className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-lg block">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">{cat.title}</h3>
                    <p className="text-brand-primary text-[10px] uppercase tracking-widest font-bold">{cat.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. By The Numbers (Impact Statistics) */}
      {content?.stats && content.stats.length > 0 && (
        <section className="py-24 bg-brand-navy text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=2000')] opacity-5 mix-blend-overlay object-cover" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-white/10">
              {content.stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-5xl md:text-6xl font-serif font-black text-brand-primary mb-2"
                  >
                    {stat.number}
                  </motion.span>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Travel Essentials (Comfort & Care) */}
      {content?.essentials && content.essentials.length > 0 && (
        <section className="py-24 bg-slate-50 border-y border-gray-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">The Himsagar Standard</h4>
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-navy uppercase">Travel Without Compromise</h2>
              <p className="mt-6 text-gray-500 font-medium">We ensure that your comfort and safety are never compromised, even in the most remote destinations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.essentials.map((feature, i) => {
                const icons = [<ShieldCheck size={32} />, <HeartPulse size={32} />, <Star size={32} />];
                return (
                  <div key={i} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center hover:shadow-xl transition-shadow group">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
                      {icons[i % 3]}
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-4">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Featured Journeys */}
      <section className="py-32 bg-[#fdfdfd] relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Curated Escapes</h4>
            <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-navy uppercase">Featured Journeys</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-[500px] bg-white border border-gray-100 animate-pulse rounded-2xl" />
              ))
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={event.images[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1470"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={event.title}
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">{event.location}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-8">
                      <span>{event.date} | {event.category}</span>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-gray-400 font-black mb-1">Starting from</span>
                        <span className="text-3xl font-black text-brand-navy">₹{event.price}</span>
                      </div>
                      <Link to={`/events/${event.id}`} className="px-6 py-3 bg-brand-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all shadow-md shadow-brand-primary/20">
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 py-20 text-center border border-gray-100 rounded-3xl bg-white shadow-sm">
                <p className="text-gray-400 font-serif">No featured experiences available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Why We Are Chosen (Philosophy Section) */}
      {content?.philosophy && content.philosophy.length > 0 && (
        <section className="py-32 bg-brand-dark text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 blur-[150px]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black">Signature Philosophy</h4>
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif font-black tracking-tighter leading-[1.1] md:leading-[0.9]">Why We Are Chosen Since 1985</h2>
                <div className="space-y-10">
                  {content.philosophy.map((item, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div className="w-10 h-10 border border-brand-primary/40 rounded-full flex items-center justify-center shrink-0 text-brand-primary font-serif font-black">0{i + 1}</div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-white/40 text-sm font-medium leading-loose uppercase tracking-widest">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10">
                  <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Heritage travel" />
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 border border-brand-primary/20 rounded-[3rem] -z-0" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Instagram Moments (Infinite Marquee) */}
      {content?.instagram_moments && content.instagram_moments.length > 0 && (
        <section className="py-32 bg-white border-t border-gray-100 overflow-hidden flex flex-col">
          <div className="container mx-auto px-6 relative z-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-6">Visual Manifest</h4>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black tracking-tighter text-gray-900">Instagram <br />Moments</h2>
              </div>
              <a href="https://www.instagram.com/himsagar_travels?igsh=ZzF2MzdkOHZweHlp" target="_blank" rel="noreferrer" className="text-gray-400 font-bold hover:text-brand-primary transition-colors group flex items-center gap-2 pb-2 border-b border-gray-100 uppercase tracking-widest text-[10px]">
                Follow @HimsagarTravels
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Marquee Wrapper */}
          <div className="w-full relative flex gap-4 overflow-hidden py-4 -rotate-1 md:-rotate-2 scale-105">
            <div className="flex shrink-0 gap-4 animate-marquee hover:[animation-play-state:paused]">
              {content.instagram_moments.map((img, i) => (
                <a
                  href="https://www.instagram.com/himsagar_travels?igsh=ZzF2MzdkOHZweHlp"
                  target="_blank"
                  rel="noreferrer"
                  key={i}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-[2rem] overflow-hidden group relative cursor-pointer block shrink-0"
                >
                  <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Himsagar Travels Instagram" />
                  <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-xl">
                      <Compass size={24} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Popular Destinations Section */}
      {content?.destinations && content.destinations.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Handpicked For You</h4>
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-navy uppercase">Popular Destinations</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {content.destinations.map((dest, i) => (
                <Link to="/tours" key={i} className="group relative rounded-2xl overflow-hidden aspect-[3/4] block">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-5">
                    <h3 className="text-white text-lg font-black uppercase tracking-tight">{dest.name}</h3>
                    <p className="text-brand-primary text-[9px] uppercase tracking-widest font-bold">{dest.country}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Testimonials Section */}
      {content?.testimonials && content.testimonials.length > 0 && (
        <section className="py-32 bg-white border-y border-gray-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-6">Voice of Explorers</h4>
              <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter text-gray-900">Hear It From Our <br />Happy Travelers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {content.testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 text-brand-primary mb-6">
                      {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-lg font-serif text-gray-600 leading-relaxed mb-8">"{testimonial.text}"</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tighter text-gray-900">{testimonial.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{testimonial.location}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. The Travel Manifest (Newsletter) */}
      <section className="py-24 bg-brand-navy border-t border-brand-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000')] opacity-10 mix-blend-overlay object-cover" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Send className="w-12 h-12 text-brand-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-white mb-6">The Travel Manifest</h2>
            <p className="text-white/60 mb-10 text-lg">Join our exclusive mailing list to receive early access to new itineraries, seasonal discounts, and curated travel guides.</p>

            <SubscriptionForm
              source="homepage"
              title="The Travel Manifest"
              description="Join our exclusive mailing list to receive early access to new itineraries, seasonal discounts, and curated travel guides."
              buttonLabel="Subscribe"
              placeholder="Enter your email address"
              className="max-w-xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* 11. Call to Action */}
      <section className="py-40 container mx-auto px-6">
        <div className="relative rounded-[4rem] overflow-hidden bg-brand-primary p-12 md:p-32 text-center shadow-2xl shadow-brand-primary/20">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-sky-200/20 rounded-full blur-[100px]" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-8">Access the Unseen</h4>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif font-black tracking-tighter text-white mb-12 leading-[1.1] md:leading-[0.9]">Ready for your next <br />unforgettable chapter?</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/contact" className="px-12 py-6 bg-white text-brand-dark font-black uppercase tracking-widest text-xs hover:bg-brand-dark hover:text-white transition-all shadow-2xl">
                Get Early Access
              </Link>
              <Link to="/tours" className="px-12 py-6 border-2 border-white/40 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-primary transition-all">
                The Manifest
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
