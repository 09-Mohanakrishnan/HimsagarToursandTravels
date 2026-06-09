import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Calendar, Send, CheckCircle, Clock, Users, Route, Shield, Hotel, UtensilsCrossed, Bus, Ticket, ChevronLeft, ChevronRight, ChevronDown, Compass, Star, BadgeCheck, AlertCircle, CheckCheck, XCircle } from "lucide-react";
import { TravelEvent } from "../types";

// Tour-specific metadata keyed by title
const tourMeta: Record<string, { tagline: string; duration: string; highlights: string[]; itinerary: { day: string; title: string; desc: string }[]; inclusions: string[]; route: string }> = {
  "Char Dham Yatra": {
    tagline: "A Sacred Himalayan Pilgrimage",
    duration: "11N / 12D",
    highlights: ["Kedarnath Temple", "Badrinath Temple", "Gangotri", "Yamunotri"],
    itinerary: [
      { day: "Day 1", title: "Arrival at Haridwar", desc: "Arrive at Haridwar, attend the mesmerizing Ganga Aarti at Har Ki Pauri." },
      { day: "Day 2-3", title: "Yamunotri Excursion", desc: "Drive to Janki Chatti, trek to Yamunotri Temple. Holy dip in Surya Kund." },
      { day: "Day 4-5", title: "Gangotri Darshan", desc: "Visit the sacred Gangotri Temple at the origin of river Ganges." },
      { day: "Day 6-7", title: "Kedarnath Trek", desc: "Trek through stunning valleys to the ancient Kedarnath Jyotirlinga." },
      { day: "Day 8-9", title: "Badrinath Visit", desc: "Pilgrimage to Lord Vishnu's abode. Visit Mana Village, India's last village." },
      { day: "Day 10-12", title: "Return via Rishikesh", desc: "Descend through Pipalkoti, visit Rishikesh ashrams, depart from Haridwar." },
    ],
    inclusions: ["Premium Hotel Accommodation", "All Vegetarian Meals", "High-Altitude Guide", "VIP Temple Darshan", "AC Ground Transport", "Permits & Registration"],
    route: "Haridwar → Barkot → Yamunotri → Uttarkashi → Gangotri → Guptkashi → Kedarnath → Badrinath → Rishikesh",
  },
  "Muktinath Yatra": {
    tagline: "A Divine Journey to Nepal's Sacred Peak",
    duration: "6N / 7D",
    highlights: ["Muktinath Temple", "108 Water Spouts", "Annapurna Views", "Pashupatinath"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Kathmandu", desc: "Arrive at Tribhuvan Airport. Visit Pashupatinath Temple and Boudhanath Stupa." },
      { day: "Day 2", title: "Kathmandu to Pokhara", desc: "Scenic drive to Pokhara along the Trishuli River. Evening at Phewa Lake." },
      { day: "Day 3", title: "Pokhara to Jomsom", desc: "Early morning flight to Jomsom with spectacular Annapurna range views." },
      { day: "Day 4", title: "Muktinath Darshan", desc: "Visit the sacred Muktinath Temple, 108 water spouts, and eternal flame." },
      { day: "Day 5", title: "Return to Pokhara", desc: "Flight back to Pokhara. Visit Devi's Fall and Gupteshwor Mahadev Cave." },
      { day: "Day 6-7", title: "Kathmandu & Departure", desc: "Return to Kathmandu. Shopping at Thamel, Swayambhunath visit, departure." },
    ],
    inclusions: ["3-4 Star Hotels", "Breakfast & Dinner", "Domestic Flights", "Temple Entry Permits", "English-Speaking Guide", "Airport Transfers"],
    route: "Kathmandu → Pokhara → Jomsom → Muktinath → Pokhara → Kathmandu",
  },
  "Malaysia and Singapore Tour": {
    tagline: "Two Nations, Infinite Experiences",
    duration: "6N / 7D",
    highlights: ["Petronas Twin Towers", "Gardens by the Bay", "Batu Caves", "Marina Bay Sands"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Kuala Lumpur", desc: "Arrive at KLIA. City orientation tour, visit Petronas Twin Towers at night." },
      { day: "Day 2", title: "KL City Tour", desc: "Visit Batu Caves, National Mosque, KL Tower, and Chinatown street markets." },
      { day: "Day 3", title: "Putrajaya & Genting", desc: "Visit Putrajaya's pink mosque. Cable car ride to Genting Highlands." },
      { day: "Day 4", title: "Transfer to Singapore", desc: "Coach transfer to Singapore. Evening visit to Marina Bay Sands light show." },
      { day: "Day 5", title: "Singapore City Tour", desc: "Merlion Park, Gardens by the Bay Supertree Grove, Orchard Road shopping." },
      { day: "Day 6-7", title: "Sentosa & Departure", desc: "Sentosa Island, Universal Studios, S.E.A. Aquarium. Departure." },
    ],
    inclusions: ["4-Star Hotels", "Daily Breakfast", "AC Coach Transfers", "City Tour Guides", "Attraction Tickets", "Travel Insurance"],
    route: "Kuala Lumpur → Batu Caves → Putrajaya → Genting → Singapore → Sentosa",
  },
  "Bali Tour": {
    tagline: "Island of Gods & Endless Beauty",
    duration: "6N / 7D",
    highlights: ["Tegallalang Rice Terraces", "Uluwatu Temple", "Kecak Dance", "Tanah Lot"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Bali", desc: "Arrive at Ngurah Rai Airport. Transfer to Kuta. Evening beach walk." },
      { day: "Day 2", title: "Ubud Exploration", desc: "Visit Tegallalang Rice Terraces, Ubud Monkey Forest, art galleries." },
      { day: "Day 3", title: "Kintamani & Temples", desc: "Mount Batur sunrise view, Tirta Empul water temple purification." },
      { day: "Day 4", title: "Water Sports Day", desc: "Tanjung Benoa water sports: parasailing, banana boat, jet ski, snorkeling." },
      { day: "Day 5", title: "Uluwatu & Kecak Dance", desc: "Visit Uluwatu Temple on sea cliffs. Evening Kecak fire dance at sunset." },
      { day: "Day 6-7", title: "Tanah Lot & Departure", desc: "Visit iconic Tanah Lot sea temple. Seminyak shopping. Departure." },
    ],
    inclusions: ["Beach Resort Stay", "Daily Indian Meals", "Private Transfers", "Water Sports Package", "Temple Entry Fees", "English-Speaking Guide"],
    route: "Kuta → Ubud → Kintamani → Tanjung Benoa → Uluwatu → Tanah Lot → Seminyak",
  },
  "Ramayana Tour": {
    tagline: "Walk the Path of the Epic Ramayana",
    duration: "5N / 6D",
    highlights: ["Sigiriya Rock Fortress", "Seetha Amman Temple", "Ravana Cave", "Temple of the Tooth"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Colombo", desc: "Arrive at Bandaranaike Airport. Visit Colombo's Gangaramaya Temple." },
      { day: "Day 2", title: "Sigiriya & Dambulla", desc: "Climb the ancient Sigiriya Rock Fortress. Visit Dambulla Cave Temple." },
      { day: "Day 3", title: "Kandy Heritage", desc: "Visit Temple of the Tooth, Royal Botanical Gardens, cultural dance show." },
      { day: "Day 4", title: "Nuwara Eliya & Seetha Trail", desc: "Visit Seetha Amman Temple, Ashok Vatika, Divurumpola Temple." },
      { day: "Day 5", title: "Ravana Cave & Ella", desc: "Explore Ravana Cave, Ravana Falls. Scenic train ride through tea estates." },
      { day: "Day 6", title: "Return & Departure", desc: "Drive back to Colombo for departure. Optional Galle Fort visit." },
    ],
    inclusions: ["Heritage Hotels", "All Meals Included", "AC Vehicle & Driver", "English-Speaking Guide", "Entrance Fees", "Airport Transfers"],
    route: "Colombo → Sigiriya → Dambulla → Kandy → Nuwara Eliya → Ella → Colombo",
  },
  "Kashmir Package": {
    tagline: "Paradise on Earth Awaits You",
    duration: "5N / 6D",
    highlights: ["Dal Lake Shikara", "Gulmarg Gondola", "Pahalgam Valley", "Mughal Gardens"],
    itinerary: [
      { day: "Day 1", title: "Arrival in Srinagar", desc: "Arrive at Srinagar Airport. Check into a luxury houseboat on Dal Lake." },
      { day: "Day 2", title: "Mughal Gardens Tour", desc: "Visit Shalimar Bagh, Nishat Bagh, and Chashme Shahi gardens. Shikara ride." },
      { day: "Day 3", title: "Gulmarg Excursion", desc: "Drive to Gulmarg. Gondola ride to Kongdoori & Apharwat Peak (4,200m)." },
      { day: "Day 4", title: "Pahalgam Valley", desc: "Visit Betaab Valley, Aru Valley, and Chandanwari. Riverside walks." },
      { day: "Day 5", title: "Sonmarg Day Trip", desc: "Drive to Sonmarg. Visit Thajiwas Glacier, zero-point meadows." },
      { day: "Day 6", title: "Departure", desc: "Morning floating market visit on Dal Lake. Transfer to airport." },
    ],
    inclusions: ["Houseboat + Hotel Stay", "All Meals (Kashmiri Wazwan)", "Private Innova/Tempo", "Shikara & Gondola Rides", "Sightseeing Fees", "24/7 On-Trip Support"],
    route: "Srinagar → Mughal Gardens → Gulmarg → Pahalgam → Sonmarg → Srinagar",
  },
};

const defaultMeta = {
  tagline: "An Unforgettable Journey",
  duration: "7D / 6N",
  highlights: ["Scenic Beauty", "Cultural Heritage", "Local Cuisine", "Guided Tours"],
  itinerary: [
    { day: "Day 1", title: "Arrival & Welcome", desc: "Arrive and settle in. Welcome dinner and orientation." },
    { day: "Day 2-3", title: "Exploration", desc: "Guided tours of key attractions and landmarks." },
    { day: "Day 4-5", title: "Adventure & Culture", desc: "Activities, local experiences, and cultural immersion." },
    { day: "Day 6-7", title: "Leisure & Departure", desc: "Free time for shopping and departure." },
  ],
  inclusions: ["Hotel Accommodation", "Daily Meals", "Ground Transport", "Guided Sightseeing", "Entry Fees", "Travel Insurance"],
  route: "Departure City → Destination → Return",
};

/* ── Itinerary Accordion Component ── */
function ItineraryAccordion({ itinerary, route }: { itinerary: { day: string; title: string; desc: string }[]; route: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first day open by default

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl">
          <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Day by Day</h4>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-4">Detailed Itinerary</h2>
          <p className="text-[10px] text-brand-primary/80 uppercase tracking-widest font-bold mb-12"><Route size={12} className="inline mr-2" />{route}</p>
        </div>

        <div className="max-w-3xl">
          {itinerary.map((item, i) => {
            const isOpen = openIndex === i;
            const isLast = i === itinerary.length - 1;

            return (
              <div key={i} className="relative">
                {/* Timeline Connector */}
                <div className="absolute left-5 top-0 bottom-0 flex flex-col items-center pointer-events-none z-0">
                  {/* Dot */}
                  <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center shrink-0 transition-all duration-300 mt-6 ${
                    isOpen
                      ? 'bg-brand-primary border-brand-primary/20 text-white'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    <span className="text-[10px] font-black">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {/* Line */}
                  {!isLast && (
                    <div className="w-[2px] flex-1 bg-gradient-to-b from-gray-200 to-gray-100 my-0" />
                  )}
                </div>

                {/* Content */}
                <div className="ml-16 mb-2">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group ${
                      isOpen
                        ? 'bg-white border-brand-primary/20 shadow-lg shadow-brand-primary/5'
                        : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] uppercase tracking-widest font-black mb-1 transition-colors ${isOpen ? 'text-brand-primary' : 'text-gray-400'}`}>
                        {item.day}
                      </p>
                      <h4 className="text-lg font-black text-gray-900 truncate">{item.title}</h4>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-brand-primary/10 text-brand-primary rotate-180' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <div
                    className={`overflow-hidden transition-all duration-400 ease-in-out ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 pb-2">
                      <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<TravelEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const [formLoading, setFormLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(res => res.json())
      .then(data => { setEvent({ ...data, id: data._id || data.id }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: id }),
      });
      if (response.ok) setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-pulse text-brand-primary text-lg font-serif">Loading experience...</div></div>;
  if (!event) return <div className="h-screen flex items-center justify-center bg-white"><p className="text-2xl font-serif text-gray-400">Experience not found</p></div>;

  const meta = tourMeta[event.title] || defaultMeta;
  const itineraryToDisplay = event.itinerary && event.itinerary.length > 0
    ? event.itinerary.map(item => ({ day: `Day ${item.day}`, title: item.title, desc: item.description }))
    : meta.itinerary;

  return (
    <div className="flex flex-col bg-white">
      {/* Section 1: Hero */}
      <section className="relative h-[85vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={event.images[0]} className="w-full h-full object-cover" alt={event.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </div>
        <div className="relative z-20 container mx-auto px-6 lg:px-12 pb-16 text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-brand-primary text-[10px] uppercase tracking-[0.4em] font-black mb-3">{event.category} Tour</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-3">{event.title}</h1>
            <p className="text-xl md:text-2xl font-serif text-white/80 mb-6">{meta.tagline}</p>
            <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-widest font-bold text-white/70">
              <span className="flex items-center gap-2"><MapPin size={14} className="text-brand-primary" />{event.location}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-brand-primary" />{event.date}</span>
              <span className="flex items-center gap-2"><Clock size={14} className="text-brand-primary" />{meta.duration}</span>
              <span className="flex items-center gap-2 text-brand-primary font-black text-sm">₹{event.price} / person</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Overview + Highlights */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div>
                <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Overview</h4>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tighter mb-6">Experience the {event.title}</h2>
                {event.overview ? (
                  <div
                    className="prose prose-sm lg:prose-base text-gray-500 leading-relaxed max-w-none text-justify"
                    dangerouslySetInnerHTML={{ __html: event.overview }}
                  />
                ) : (
                  <p className="text-gray-500 leading-relaxed text-lg text-justify">{event.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {meta.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shrink-0">
                      <MapPin size={14} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{h}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-full min-h-[500px] flex items-center justify-center">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-900/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 w-full max-w-md bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Route size={120} className="text-gray-900" />
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <MapPin size={18} />
                  </span>
                  Journey Overview
                </h3>

                <div className="relative pl-5 space-y-6 before:absolute before:inset-y-2 before:left-[27px] before:w-[2px] before:bg-gradient-to-b before:from-brand-primary before:to-gray-100">
                  {meta.route.split(' → ').map((stop, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex items-center gap-6"
                    >
                      <div className="relative z-10 w-4 h-4 rounded-full border-4 border-white bg-brand-primary shadow-sm shrink-0 -ml-[5px]"></div>
                      <div className="flex-1 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-brand-primary/30 hover:shadow-lg transition-all group">
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-brand-primary transition-colors">{stop}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <Clock size={16} className="text-brand-primary mx-auto mb-2" />
                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Duration</p>
                    <p className="font-bold text-gray-900 text-sm">{meta.duration}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <Users size={16} className="text-brand-primary mx-auto mb-2" />
                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Group Size</p>
                    <p className="font-bold text-gray-900 text-sm">10-15 pax</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Detailed Content Sections */}
      {(event.places_covered || event.tour_highlights || event.tour_cost_includes || event.included || event.included_excluded || event.excluded || event.note) && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Complete Details</h4>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">Everything You Need to Know</h2>
            </div>

            <div className="max-w-5xl mx-auto space-y-10">
              {/* Places Covered */}
              {event.places_covered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-lg transition-shadow duration-500"
                >
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Compass size={22} className="text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-brand-primary uppercase tracking-[0.3em] font-black mb-1">Destinations</p>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Places Covered</h3>
                    </div>
                  </div>
                  <div className="pl-0 lg:pl-[68px]">
                    <div className="prose prose-sm lg:prose-base max-w-none text-gray-600 leading-relaxed rich-content" dangerouslySetInnerHTML={{ __html: event.places_covered }} />
                  </div>
                </motion.div>
              )}

              {/* Tour Highlights */}
              {event.tour_highlights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="bg-gray-900 text-white rounded-3xl p-8 lg:p-10 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Star size={22} className="text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-primary uppercase tracking-[0.3em] font-black mb-1">Highlights</p>
                        <h3 className="text-2xl font-black tracking-tighter">Tour Highlights</h3>
                      </div>
                    </div>
                    <div className="pl-0 lg:pl-[68px]">
                      <div className="prose prose-sm lg:prose-base prose-invert max-w-none leading-relaxed rich-content rich-content-dark" dangerouslySetInnerHTML={{ __html: event.tour_highlights }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Included and Excluded — Parallel Containers */}
              {(event.included || event.included_excluded || event.excluded) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-500 flex flex-col h-full"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                        <CheckCheck size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-green-600 uppercase tracking-[0.3em] font-black mb-1">Breakdown</p>
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">Included</h3>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed rich-content flex-grow" dangerouslySetInnerHTML={{ __html: event.included || event.included_excluded || "<p class='text-gray-400 italic text-sm'>No inclusions specified.</p>" }} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-500 flex flex-col h-full"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                        <XCircle size={20} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-red-600 uppercase tracking-[0.3em] font-black mb-1">Breakdown</p>
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">Excluded</h3>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed rich-content flex-grow" dangerouslySetInnerHTML={{ __html: event.excluded || "<p class='text-gray-400 italic text-sm'>No exclusions specified.</p>" }} />
                  </motion.div>
                </div>
              )}

              {event.tour_cost_includes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="bg-brand-primary/10 border border-brand-primary/20 rounded-3xl p-8 lg:p-10 shadow-sm transition-shadow duration-500"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                      <BadgeCheck size={20} className="text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-brand-primary uppercase tracking-[0.3em] font-black mb-1">Pricing</p>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Tour Cost Includes</h3>
                    </div>
                  </div>
                  <div className="prose prose-sm lg:prose-base max-w-none text-gray-800 leading-relaxed rich-content" dangerouslySetInnerHTML={{ __html: event.tour_cost_includes }} />
                </motion.div>
              )}

              {/* Note */}
              {event.note && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="bg-gradient-to-br from-brand-primary/5 via-brand-primary/3 to-transparent rounded-3xl p-8 lg:p-10 border border-brand-primary/15 relative overflow-hidden"
                >
                  <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none">
                    <AlertCircle size={180} className="text-brand-primary" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="w-12 h-12 bg-brand-primary/15 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertCircle size={22} className="text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-primary uppercase tracking-[0.3em] font-black mb-1">Important</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Note</h3>
                      </div>
                    </div>
                    <div className="pl-0 lg:pl-[68px]">
                      <div className="prose prose-sm lg:prose-base max-w-none text-gray-700 leading-relaxed rich-content" dangerouslySetInnerHTML={{ __html: event.note }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Visual Journey */}
      <section className="bg-gray-900 text-white overflow-hidden py-24 relative group/section">
        <div className="container mx-auto px-6 lg:px-12 text-center mb-16 relative">
          <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Visual Journey</h4>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">A Journey in Pictures</h2>

          <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 hidden md:flex gap-4">
            <button onClick={() => scroll("left")} className="p-3 bg-gray-800 rounded-full hover:bg-brand-primary transition-colors text-white">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll("right")} className="p-3 bg-gray-800 rounded-full hover:bg-brand-primary transition-colors text-white">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 lg:px-12 pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {(event.visual_journey && event.visual_journey.length > 0
            ? event.visual_journey
            : event.images.slice(0, 4).map((img, i) => ({
              image: img,
              title: meta.highlights[i] || `Highlight ${i + 1}`,
              description: `Experience the breathtaking beauty and cultural richness of ${meta.highlights[i] || 'this destination'}.`,
              location: event.location
            }))
          ).map((item, i) => (
            <div key={i} className="relative min-w-[85vw] md:min-w-[60vw] lg:min-w-[40vw] h-[60vh] rounded-3xl overflow-hidden group snap-center shrink-0 shadow-2xl">
              <div className="absolute inset-0 z-0">
                <img src={item.image} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-8 z-10 flex flex-col justify-end h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-brand-primary text-4xl font-black opacity-90 mb-2 block leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tighter text-white">{item.title}</h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">{item.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                    <MapPin size={12} />
                    {item.location}
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Itinerary — Accordion */}
      <ItineraryAccordion itinerary={itineraryToDisplay} route={meta.route} />

      {/* Section 5: Inclusions + Booking */}
      <section className="py-24 bg-brand-navy text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Inclusions */}
            <div>
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Package Details</h4>
              <h2 className="text-4xl font-black tracking-tighter mb-10">What  you  get </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {meta.inclusions.map((item, i) => {
                  const icons = [Hotel, UtensilsCrossed, Bus, Shield, Ticket, Users];
                  const Icon = icons[i % icons.length];
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center shrink-0"><Icon size={18} className="text-brand-primary" /></div>
                      <span className="text-sm font-bold text-white/90">{item}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-black text-white/40">Starting From</span>
                  <p className="text-4xl font-black text-brand-primary leading-none">₹{event.price} <span className="text-xs text-white/40 font-bold">/ person</span></p>
                </div>
                <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold text-white/50">
                  <span><Calendar size={12} className="inline mr-1" />{event.date}</span>
                  <span><Clock size={12} className="inline mr-1" />{meta.duration}</span>
                  <span><Users size={12} className="inline mr-1" />10-15 pax</span>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div>
              <h4 className="text-brand-primary uppercase tracking-[0.4em] text-[10px] font-black mb-4">Get in Touch</h4>
              <h2 className="text-4xl font-black tracking-tighter mb-10">Book This Tour</h2>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-black mb-2">Thank You!</h3>
                  <p className="text-white/60 text-sm">We've received your inquiry for {event.title}. Our team will contact you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    { key: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
                    { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
                    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 XXXXX XXXXX" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 block">{field.label}</label>
                      <input
                        type={field.type}
                        required
                        placeholder={field.placeholder}
                        value={formData[field.key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-white/20 outline-none focus:border-brand-primary transition-colors text-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 block">Message (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Any special requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-white/20 outline-none focus:border-brand-primary transition-colors text-sm resize-none"
                    />
                  </div>
                  <button type="submit" disabled={formLoading}
                    className="w-full py-5 bg-brand-primary text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50">
                    {formLoading ? "Sending..." : <><Send size={14} /> Inquire Now</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4">Explore More Tours</h2>
          <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-8">Discover our full collection of curated journeys</p>
          <Link to="/tours" className="inline-block px-12 py-5 bg-brand-navy text-white font-black text-xs uppercase tracking-widest hover:bg-brand-dark transition-all rounded-xl shadow-lg">
            View All Tours
          </Link>
        </div>
      </section>
    </div>
  );
}
