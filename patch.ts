import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mohanakrishnandevin_db_user:dkRgknFj9vBCLft6@himsagar.pff49ct.mongodb.net/?appName=himsagar";

const siteContentSchema = new mongoose.Schema({
  tours_trust_indicators: [{ value: String, label: String }],
  tours_differences: [{ title: String, desc: String }],
  about_heritage_stats: [{ label: String, value: String }],
  about_principles: [{ icon: String, title: String, desc: String }],
  about_global_stats: [{ region: String, count: String }],
  about_team: [{ name: String, role: String, img: String }],
  contact_offices: [{ city: String, desc: String, address: String }],
  contact_faqs: [{ q: String, a: String }],
  instagram_moments: [String],
}, { strict: false });

const SiteContent = mongoose.model("SiteContent", siteContentSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB Atlas");
  const existingContent = await SiteContent.findOne();
  if (existingContent && (!existingContent.tours_trust_indicators || existingContent.tours_trust_indicators.length === 0)) {
    existingContent.instagram_moments = [
        "https://images.unsplash.com/photo-1564507592208-0270e30495f4?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=600"
    ];
    
    existingContent.tours_trust_indicators = [
        { value: "30+", label: "Years of Experience" },
        { value: "15k+", label: "Happy Travelers" },
        { value: "24/7", label: "On-Trip Support" }
    ];
    existingContent.tours_differences = [
        { title: "Zero Friction Transit", desc: "We handle every microscopic detail from visa processing to private airport transfers, ensuring you only focus on the journey." },
        { title: "Unlisted Access", desc: "Through our 4-decade old network, we provide exclusive access to sites, temples, and properties not available to the public." },
        { title: "Elite Guides", desc: "Our expedition leaders are not standard guides. They are historians, mountaineers, and local masters of their craft." }
    ];

    existingContent.about_heritage_stats = [
        { label: "Established", value: "2010" },
        { label: "Deployments", value: "1.2K+" }
    ];
    existingContent.about_principles = [
        { icon: "Compass", title: "Curated Path", desc: "No generic itineraries. Every chapter of your journey is hand-selected and verified by our travel designers." },
        { icon: "Shield", title: "Secure Passage", desc: "Your safety and privacy are our top priorities. We employ elite logistics for seamless, worry-free transit." },
        { icon: "Users", title: "Local Masters", desc: "Access the inaccessible through our extensive global network of local experts, historians, and cultural masters." }
    ];
    existingContent.about_global_stats = [
        { region: "Asia Pacific", count: "45+ Destinations" },
        { region: "Middle East", count: "12+ Destinations" },
        { region: "Europe", count: "28+ Destinations" },
        { region: "Africa", count: "15+ Destinations" }
    ];
    existingContent.about_team = [
        { name: "Vikram Singh", role: "Founder & Chief Explorer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" },
        { name: "Sarah Jenkins", role: "Head of Global Curation", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" },
        { name: "Arjun Mehta", role: "Director of Operations", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600" }
    ];

    existingContent.contact_offices = [
        { city: "London", desc: "Serving EMEA Clients", address: "15 Mayfair Place, London, UK" },
        { city: "New York", desc: "Serving Americas", address: "One World Trade Center, NY, USA" },
        { city: "Dubai", desc: "Serving Middle East", address: "Boulevard Plaza, Downtown Dubai, UAE" }
    ];
    existingContent.contact_faqs = [
        { q: "How far in advance should I book a bespoke itinerary?", a: "For custom expeditions, we recommend initiating the planning process at least 6 months in advance. For peak seasons in destinations like Japan or East Africa, 9-12 months is preferred to secure elite accommodations." },
        { q: "Do you handle private aviation and yacht charters?", a: "Yes. Our logistics team routinely coordinates private jet charters, helicopter transfers, and luxury yacht rentals as part of our comprehensive travel design service." },
        { q: "What is your cancellation policy?", a: "Cancellation terms are individually structured based on the specific vendors and properties in your itinerary. Your dedicated travel designer will provide a transparent outline of all terms before any deposit is collected." },
        { q: "Do you provide on-trip support?", a: "Absolutely. Every Himsagar Travels client receives access to our 24/7 global concierge desk, along with direct contact to local fixers in your destination timezone." }
    ];
    await existingContent.save();
    console.log("Patched existing SiteContent with new arrays.");
  } else {
    console.log("No patch needed or no content found.");
  }
  process.exit(0);
}

run();
