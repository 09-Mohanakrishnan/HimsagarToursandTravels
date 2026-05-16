import { motion } from "motion/react";
import { ArrowRight, Star, MapPin, Calendar, Compass, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TravelEvent } from "../types";

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<TravelEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((e: any) => ({ ...e, id: e._id || e.id }));
        setFeaturedEvents(normalized.filter((e: TravelEvent) => e.is_featured).slice(0, 3));
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col bg-[#fcfdfd]">
      {/* Hero Section - Matching Mock 1 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Himalayan landscape"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-[14vw] md:text-[10vw] lg:text-[120px] font-serif font-black italic tracking-tighter text-brand-primary leading-[0.8] mb-6 drop-shadow-2xl">
              HIMSAGAR<br/>TRAVELS
            </h1>
            <p className="text-white text-lg md:text-xl uppercase tracking-[0.3em] font-black italic mb-10 drop-shadow-md">
              EXPERIENCE THE EXTRAORDINARY:<br/>
              <span className="text-white/80 font-light lowercase font-serif tracking-normal mt-2 block capitalize">Unforgettable Journeys Across the Himalayas & Beyond.</span>
            </p>
            <button className="px-14 py-5 bg-brand-primary text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/40">
              Explore Tours
            </button>
          </motion.div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-30">
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
            <button className="w-full md:w-auto px-12 py-5 bg-brand-navy text-white rounded-xl shadow-lg hover:bg-brand-dark transition-all flex items-center justify-center gap-3">
              <span className="text-[10px] uppercase font-black tracking-widest">Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Journeys - Matching Mockup Card Style */}
      <section className="py-32 bg-[#fdfdfd] relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter text-brand-navy uppercase">Featured Journeys</h2>
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
                         <span className="text-3xl font-black italic text-brand-navy">₹{event.price}</span>
                      </div>
                      <Link to={`/events/${event.id}`} className="px-6 py-3 bg-brand-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest italic hover:bg-brand-accent transition-all shadow-md shadow-brand-primary/20">
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 py-20 text-center border border-gray-100 rounded-3xl bg-white shadow-sm">
                <p className="text-gray-400 italic font-serif">No featured experiences available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tour Categories Section */}
      <section className="py-24 bg-white border-t border-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4 italic">Discover Your Path</h4>
            <h2 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter text-brand-navy uppercase">Tour Categories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Spiritual Tours", image: "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=800", count: "4 Tours" },
              { title: "Domestic Tours", image: "https://images.unsplash.com/photo-1597074866923-dc0589150458?auto=format&fit=crop&q=80&w=800", count: "6 Tours" },
              { title: "International Tours", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800", count: "3 Tours" },
            ].map((cat, i) => (
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

      {/* Features Section */}
      <section className="py-20 bg-slate-50 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {[
              { icon: <DollarSign size={32} />, title: "Competitive Pricing", desc: "Best value for your travel investments with no hidden costs." },
              { icon: <MapPin size={32} />, title: "Worldwide Coverage", desc: "From Himalayan peaks to tropical beaches, we cover it all." },
              { icon: <Calendar size={32} />, title: "Fast Booking", desc: "Seamless and instant reservation process for all our tours." },
              { icon: <Compass size={32} />, title: "Guided Tours", desc: "Expert local guides ensuring an authentic and safe experience." },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-2">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4 italic">Handpicked For You</h4>
            <h2 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter text-brand-navy uppercase">Popular Destinations</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Kedarnath", country: "India", image: "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=600" },
              { name: "Dal Lake", country: "Kashmir", image: "https://images.unsplash.com/photo-1597074866923-dc0589150458?auto=format&fit=crop&q=80&w=600" },
              { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600" },
              { name: "Petronas Towers", country: "Malaysia", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=600" },
              { name: "Sigiriya", country: "Sri Lanka", image: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?auto=format&fit=crop&q=80&w=600" },
              { name: "Muktinath", country: "Nepal", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600" },
              { name: "Gardens by Bay", country: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=600" },
              { name: "Gulmarg", country: "Kashmir", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=600" },
            ].map((dest, i) => (
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

      {/* Testimonials Section */}
      <section className="py-32 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-6 italic">Voice of Explorers</h4>
            <h2 className="text-5xl md:text-7xl font-serif font-black italic tracking-tighter text-gray-900">Hear It From Our <br/>Happy Travelers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "Anil K.",
                text: "My Kailash Yatra with Himsagar was more than just a trip; it was a spiritual awakening. Their attention to detail and care for our safety was unparalleled.",
                location: "Mumbai, India"
              },
              {
                name: "Sarah J.",
                text: "The High Pass Ritual tour was expertly curated. The guides were local masters who showed us rituals we would have never found on our own.",
                location: "London, UK"
              },
              {
                name: "Vikram R.",
                text: "Trusted since 1985 for a reason. Their legacy of faith and journeys truly reflects in the way they handle every traveler.",
                location: "Hyderabad, India"
              }
            ].map((testimonial, i) => (
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
                  <p className="text-lg font-serif italic text-gray-600 leading-relaxed mb-8">"{testimonial.text}"</p>
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

      {/* Instagram Gallery */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-6 italic">Visual Manifest</h4>
              <h2 className="text-5xl md:text-7xl font-serif font-black italic tracking-tighter text-gray-900">Instagram <br/>Moments</h2>
            </div>
            <a href="https://www.instagram.com/himsagar_travels?igsh=ZzF2MzdkOHZweHlp" target="_blank" rel="noreferrer" className="text-gray-400 font-bold hover:text-brand-primary transition-colors group flex items-center gap-2 pb-2 border-b border-gray-100 uppercase tracking-widest text-[10px]">
              Follow @HimsagarTravels
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1530731141654-5993c3016c77?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=600",
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square rounded-[2rem] overflow-hidden group relative cursor-pointer"
              >
                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Instagram moment" />
                <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-xl">
                    <Compass size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 bg-brand-dark text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 blur-[150px]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black italic">Signature Philosophy</h4>
              <h2 className="text-5xl md:text-8xl font-serif font-black italic tracking-tighter leading-[0.9]">Why We Are Chosen Since 1985</h2>
              <div className="space-y-10">
                {[
                  { title: "Legacy of Trust", desc: "Over 4 decades of curating spiritual and leisure journeys across India and the world." },
                  { title: "Bespoke Curation", desc: "Every tour is hand-crafted to provide experiences, not just visits." },
                  { title: "Global Network", desc: "Exclusive access to hidden retreats and premium logistics worldwide." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="w-10 h-10 border border-brand-primary/40 rounded-full flex items-center justify-center shrink-0 text-brand-primary font-serif font-black italic">0{i+1}</div>
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

      {/* Call to Action */}
      <section className="py-40 container mx-auto px-6">
        <div className="relative rounded-[4rem] overflow-hidden bg-brand-primary p-12 md:p-32 text-center shadow-2xl shadow-brand-primary/20">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-sky-200/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-8">Access the Unseen</h4>
            <h2 className="text-5xl md:text-8xl font-serif font-black italic tracking-tighter text-white mb-12 leading-[0.9]">Ready for your next <br/>unforgettable chapter?</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/contact" className="px-12 py-6 bg-white text-brand-dark font-black uppercase tracking-widest text-xs hover:bg-brand-dark hover:text-white transition-all shadow-2xl">
                Get Early Access
              </Link>
              <Link to="/events" className="px-12 py-6 border-2 border-white/40 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-brand-primary transition-all">
                The Manifest
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
