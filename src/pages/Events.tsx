import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Filter, MapPin, Calendar, Search, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import SubscriptionForm from "../components/SubscriptionForm";
import { TravelEvent, SiteContent } from "../types";

export default function Events() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then(res => res.json()),
      fetch("/api/content").then(res => res.json())
    ]).then(([eventsData, contentData]) => {
      setEvents(eventsData.map((e: any) => ({ ...e, id: e._id || e.id })));
      setContent(contentData);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...new Set(events.map(e => e.category).filter(Boolean))];

  const filteredEvents = events.filter(e => {
    const matchesCategory = category === "All" || e.category === category;
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-40 min-h-screen bg-[#fcfdfd]">
      <div className="container mx-auto px-12">
        <header className="mb-20">
          <h4 className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-6">Discovery Catalog</h4>
          <h1 className="text-4xl md:text-7xl lg:text-9xl font-serif font-black tracking-tighter mb-8 text-gray-900">Experiences</h1>
          <p className="text-gray-400 max-w-2xl text-base uppercase tracking-[0.2em] leading-loose font-bold">
            From the high peaks of the North to the silent deserts of the West.
          </p>
        </header>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-8 mb-20 items-center justify-between border-y border-gray-100 py-10">
          <div className="flex flex-wrap gap-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[10px] uppercase tracking-[0.3em] font-black transition-all ${category === cat ? "text-brand-primary border-b-2 border-brand-primary" : "text-gray-400 hover:text-brand-dark"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="SEARCH MANIFEST"
              className="w-full bg-transparent border-b border-gray-100 py-3 pl-8 pr-4 outline-none focus:border-brand-primary transition-all text-xs uppercase tracking-widest text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-white animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {filteredEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col"
              >
                <Link to={`/events/${event.id}`} className="block overflow-hidden mb-8 aspect-[4/5] relative rounded-2xl border border-gray-100">
                  <img
                    src={event.images[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={event.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-brand-primary text-[9px] font-black uppercase tracking-[0.3em] mb-2 block">{event.category}</span>
                    <p className="text-3xl font-serif font-black tracking-tighter drop-shadow-xl text-white">{event.title}</p>
                  </div>
                </Link>

                <div className="flex flex-col gap-4 px-2">
                  <div className="flex items-center gap-6 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-600">
                    <span className="flex items-center gap-2">
                      <MapPin size={12} className="text-brand-primary" />
                      {event.location}
                    </span>
                    <span>{event.date.split(',')[0]}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-6">
                    <span className="text-3xl font-black text-brand-navy">₹{event.price}</span>
                    <Link to={`/events/${event.id}`} className="text-[9px] uppercase tracking-[0.4em] font-black flex items-center gap-3 text-brand-primary hover:text-brand-dark transition-colors underline underline-offset-8">
                      Inquire <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <h3 className="text-3xl font-serif text-gray-300">No experiences found matching your criteria.</h3>
            <button
              onClick={() => { setCategory("All"); setSearchTerm(""); }}
              className="mt-6 text-brand-primary uppercase tracking-widest text-sm font-bold border-b border-brand-primary pb-1"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Section 4: Call to Action / Manifest */}
      <section className="py-32 bg-brand-navy border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black">Bespoke Curation</h4>
              <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-white">Can't Find Your <br />Perfect Journey?</h2>
              <p className="text-white/60 leading-relaxed font-light max-w-lg">
                Our travel designers specialize in crafting tailor-made itineraries that match your exact specifications. From private helicopter tours to exclusive temple access, let us design your dream expedition.
              </p>
              <Link to="/contact" className="inline-block px-10 py-5 bg-brand-primary text-white text-[10px] uppercase font-black tracking-widest hover:bg-brand-accent transition-colors shadow-lg">
                Request Custom Itinerary
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10">
                <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Custom tour" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Trust Indicators */}
      {content?.tours_trust_indicators && content.tours_trust_indicators.length > 0 && (
        <section className="py-20 bg-[#f8fafc] border-y border-gray-100">
          <div className="container mx-auto px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {content.tours_trust_indicators.map((item, i) => (
                <div key={i} className="flex flex-col items-center p-4">
                  <span className="text-4xl font-serif text-brand-primary mb-2">{item.value}</span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 6: Why Travel With Us (New) */}
      {content?.tours_differences && content.tours_differences.length > 0 && (
        <section className="py-32 bg-white">
          <div className="container mx-auto px-12 text-center max-w-6xl">
            <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-6">The Himsagar Difference</h4>
            <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-gray-900 mb-20">Redefining The Expedition</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {content.tours_differences.map((item, i) => (
                <div key={i} className="space-y-6">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mx-auto">
                    <span className="font-serif font-black text-2xl">0{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 7: Newsletter (New) */}
      <section className="py-32 bg-brand-navy border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="container mx-auto px-12 relative z-10 text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-white mb-6">Join The Registry</h2>
          <p className="text-white/60 mb-12 text-sm uppercase tracking-widest font-bold">Receive early access to limited-capacity expeditions and private charters.</p>
          <SubscriptionForm
            source="tours"
            hideHeader
            buttonLabel="Subscribe"
            placeholder="YOUR EMAIL ADDRESS"
            className="justify-center max-w-2xl mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
