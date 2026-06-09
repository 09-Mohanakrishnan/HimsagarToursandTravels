import express from "express";
import path from "path";
import fs from "fs";
// Vite is a dev-only dependency. Load it at runtime in development only.
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));
app.disable("x-powered-by");

// ─── MongoDB Schemas ─────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: String,
  price: String,
  location: String,
  category: String,
  images: [String],
  itinerary: [{ day: Number, title: String, description: String }],
  visual_journey: [{ image: String, title: String, description: String, location: String }],
  overview: String,
  places_covered: String,
  tour_cost_includes: String,
  note: String,
  tour_highlights: String,
  included: String,
  excluded: String,
  included_excluded: String,
  is_featured: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});
const Event = mongoose.model("Event", eventSchema);

const siteContentSchema = new mongoose.Schema({
  // Home Page
  hero_images: [String],
  categories: [{ title: String, image: String, count: String }],
  stats: [{ number: String, label: String }],
  philosophy: [{ title: String, desc: String }],
  essentials: [{ title: String, desc: String }],
  destinations: [{ name: String, country: String, image: String }],
  testimonials: [{ name: String, text: String, location: String }],
  instagram_moments: [String],

  // Tours Page
  tours_trust_indicators: [{ value: String, label: String }],
  tours_differences: [{ title: String, desc: String }],

  // About Page
  about_heritage_stats: [{ label: String, value: String }],
  about_principles: [{ icon: String, title: String, desc: String }],
  about_global_stats: [{ region: String, count: String }],
  about_team: [{ name: String, role: String, img: String }],

  // Contact Page
  contact_offices: [{ city: String, desc: String, address: String }],
  contact_faqs: [{ q: String, a: String }],

  // Global Settings
  site_name: String,
  contact_email: String,
  contact_phone: String,
  address: String,
  instagram_url: String,
  email_notifications: { type: Boolean, default: true },
  inquiry_alerts: { type: Boolean, default: true },

  created_at: { type: Date, default: Date.now },
});
const SiteContent = mongoose.model("SiteContent", siteContentSchema);

const inquirySchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  event_title: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: String,
  status: { type: String, default: "pending", enum: ["pending", "reviewed", "contacted", "closed"] },
  created_at: { type: Date, default: Date.now },
});
const Inquiry = mongoose.model("Inquiry", inquirySchema);

const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  source: String,
  created_at: { type: Date, default: Date.now },
});
const Subscription = mongoose.model("Subscription", subscriptionSchema);

// ─── Auth Middleware ──────────────────────────────────────────────────────────

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ─── File Upload ──────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRETE
});

// Use multer memory storage and upload buffers to Cloudinary manually.
const upload = multer({ storage: multer.memoryStorage() });

const uploadBufferToCloudinary = async (buffer: Buffer, mimetype?: string, filename?: string) => {
  const dataUri = `data:${mimetype || "image/jpeg"};base64,${buffer.toString("base64")}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: 'himsagar-tours',
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
  });
  return (res.secure_url || res.url) as string;
};

// Helper to safely parse incoming fields that may be JSON strings or already-parsed objects
const parseMaybeJSON = (value: any) => {
  if (value === undefined || value === null) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedEvents: any[] = [
  {
    title: "Char Dham Yatra",
    description: "Embark on a sacred and soul-stirring Char Dham Yatra, covering the four most revered Himalayan shrines — Yamunotri, Gangotri, Kedarnath, and Badrinath — along with spiritually significant destinations like Haridwar, Rishikesh, and Barkot. Trek through pristine Himalayan valleys, witness the sacred Ganges at its source, and seek divine blessings at ancient temples perched among snow-capped peaks.",
    date: "May - Oct",
    price: "55,000",
    location: "Uttarakhand, India",
    category: "Spiritual",
    images: [
      "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1600100397608-b99b43ff5f0a?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1585135497273-1a86d9d85e1f?auto=format&fit=crop&q=80&w=2000",
    ],
    is_featured: true,
  },
  {
    title: "Muktinath Yatra",
    description: "Embark on a spiritually uplifting pilgrimage to Muktinath, nestled in the serene Himalayas of Nepal at an altitude of 3,710 metres. Visit the sacred Vishnu temple with its 108 water spouts and eternal flame. The journey passes through breathtaking landscapes of the Annapurna region, ancient Buddhist monasteries, and traditional Nepalese villages.",
    date: "March - Nov",
    price: "45,000",
    location: "Nepal",
    category: "Spiritual",
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1585938389612-a552a28c9471?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&q=80&w=2000",
    ],
    is_featured: true,
  },
  {
    title: "Malaysia & Singapore Tour",
    description: "Explore the best of Malaysia & Singapore in 7 days! Discover KL's iconic Petronas Twin Towers, the ancient Batu Caves, grand Putrajaya mosque, and vibrant Chinatown markets. Cross into Singapore for Gardens by the Bay's Supertree Grove, the futuristic Marina Bay Sands, Sentosa Island, and world-class shopping on Orchard Road.",
    date: "All Year",
    price: "65,000",
    location: "Malaysia & Singapore",
    category: "International",
    images: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&q=80&w=2000",
    ],
    is_featured: true,
  },
  {
    title: "Bali Tour",
    description: "Experience the best of Bali in 7 days with our curated tour package. Explore the stunning Tegallalang rice terraces of Ubud, visit the iconic Uluwatu Temple perched on dramatic sea cliffs, discover the sacred Tirta Empul water temple, and enjoy thrilling water sports at Tanjung Benoa. Witness magical Kecak fire dance performances at sunset and unwind on pristine beaches.",
    date: "All Year",
    price: "50,000",
    location: "Bali, Indonesia",
    category: "International",
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&q=80&w=2000",
    ],
    is_featured: true,
  },
  {
    title: "Ramayana Tour",
    description: "Explore Sri Lanka's sacred sites linked to the epic Ramayana. Visit Ashok Vatika where Sita was held captive, the ancient Seetha Amman Temple, and the mysterious Ravana Cave. Discover Divurumpola temple, climb the majestic Sigiriya Rock Fortress, explore the golden Temple of the Tooth in Kandy, and walk through lush botanical gardens.",
    date: "All Year",
    price: "40,000",
    location: "Sri Lanka",
    category: "Spiritual",
    images: [
      "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1588598198321-9735fd52e0d7?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1567069284855-41ea2e0d50f6?auto=format&fit=crop&q=80&w=2000",
    ],
    is_featured: true,
  },
  {
    title: "Kashmir Package",
    description: "Experience the paradise on earth with our carefully crafted Kashmir tour. Glide on traditional Shikaras across the serene Dal Lake, wander through Pahalgam's pine-clad valleys and Betaab Valley, witness snow-capped peaks and gondola rides at Gulmarg, stroll through the terraced Mughal Gardens of Shalimar Bagh, and explore the vibrant floating vegetable market at dawn.",
    date: "March - Oct",
    price: "35,000",
    location: "Jammu & Kashmir, India",
    category: "Domestic",
    images: [
      "https://images.unsplash.com/photo-1597074866923-dc0589150458?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=2000",
    ],
    is_featured: true,
  },
];

// ─── Start Server ─────────────────────────────────────────────────────────────

async function startServer() {
  const MONGO_URI = process.env.MONGO_URI ||
    "mongodb+srv://mohanakrishnandevin_db_user:dkRgknFj9vBCLft6@himsagar.pff49ct.mongodb.net/?appName=himsagar";
  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

  if (!process.env.MONGO_URI) {
    console.warn("⚠️ No MONGO_URI set. Using the fallback connection string for local development only.");
  }

  if (!process.env.JWT_SECRET) {
    console.warn("⚠️ No JWT_SECRET set. Using a fallback secret. Set JWT_SECRET before deploying to production.");
    if (process.env.NODE_ENV === "production") {
      console.error("❌ JWT_SECRET is required in production.");
      process.exit(1);
    }
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }

  // Seed admin
  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    const hashed = bcrypt.hashSync("admin123", 10);
    await User.create({ username: "admin", password: hashed });
    console.log("Default admin created: admin / admin123");
  }

  // Seed events if empty
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany(seedEvents);
    console.log("Seeded initial experiences.");
  }

  // Seed SiteContent if empty
  const contentCount = await SiteContent.countDocuments();
  if (contentCount === 0) {
    await SiteContent.create({
      hero_images: [
        "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1530731141654-5993c3016c77?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=2000"
      ],
      categories: [
        { title: "Spiritual Tours", image: "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=800", count: "4 Tours" },
        { title: "Domestic Tours", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800", count: "6 Tours" },
        { title: "International Tours", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800", count: "3 Tours" },
      ],
      stats: [
        { number: "38+", label: "Years of Trust" },
        { number: "50k+", label: "Happy Travelers" },
        { number: "150+", label: "Destinations" },
        { number: "100%", label: "Safe Journeys" },
      ],
      philosophy: [
        { title: "Legacy of Trust", desc: "Over 4 decades of curating spiritual and leisure journeys across India and the world." },
        { title: "Bespoke Curation", desc: "Every tour is hand-crafted to provide experiences, not just visits." },
        { title: "Global Network", desc: "Exclusive access to hidden retreats and premium logistics worldwide." }
      ],
      essentials: [
        { title: "Premium Security", desc: "24/7 on-ground support and highly trained expedition leaders." },
        { title: "Medical Assistance", desc: "Expert medical professionals on standby for high-altitude treks." },
        { title: "5-Star Hospitality", desc: "Luxury accommodations and curated dining experiences." },
      ],
      destinations: [
        { name: "Kedarnath", country: "India", image: "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=600" },
        { name: "Dal Lake", country: "Kashmir", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=600" },
        { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600" },
        { name: "Petronas Towers", country: "Malaysia", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=600" },
        { name: "Sigiriya", country: "Sri Lanka", image: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?auto=format&fit=crop&q=80&w=600" },
        { name: "Muktinath", country: "Nepal", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600" },
        { name: "Gardens by Bay", country: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=600" },
        { name: "Gulmarg", country: "Kashmir", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=600" },
      ],
      testimonials: [
        { name: "Anil K.", text: "My Kailash Yatra with Himsagar was more than just a trip; it was a spiritual awakening. Their attention to detail and care for our safety was unparalleled.", location: "Mumbai, India" },
        { name: "Sarah J.", text: "The High Pass Ritual tour was expertly curated. The guides were local masters who showed us rituals we would have never found on our own.", location: "London, UK" },
        { name: "Vikram R.", text: "Trusted since 1985 for a reason. Their legacy of faith and journeys truly reflects in the way they handle every traveler.", location: "Hyderabad, India" }
      ],
      instagram_moments: [
        "https://images.unsplash.com/photo-1564507592208-0270e30495f4?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=600"
      ],

      // Tours Page
      tours_trust_indicators: [
        { value: "30+", label: "Years of Experience" },
        { value: "15k+", label: "Happy Travelers" },
        { value: "24/7", label: "On-Trip Support" }
      ],
      tours_differences: [
        { title: "Zero Friction Transit", desc: "We handle every microscopic detail from visa processing to private airport transfers, ensuring you only focus on the journey." },
        { title: "Unlisted Access", desc: "Through our 4-decade old network, we provide exclusive access to sites, temples, and properties not available to the public." },
        { title: "Elite Guides", desc: "Our expedition leaders are not standard guides. They are historians, mountaineers, and local masters of their craft." }
      ],

      // About Page
      about_heritage_stats: [
        { label: "Established", value: "2010" },
        { label: "Deployments", value: "1.2K+" }
      ],
      about_principles: [
        { icon: "Compass", title: "Curated Path", desc: "No generic itineraries. Every chapter of your journey is hand-selected and verified by our travel designers." },
        { icon: "Shield", title: "Secure Passage", desc: "Your safety and privacy are our top priorities. We employ elite logistics for seamless, worry-free transit." },
        { icon: "Users", title: "Local Masters", desc: "Access the inaccessible through our extensive global network of local experts, historians, and cultural masters." }
      ],
      about_global_stats: [
        { region: "Asia Pacific", count: "45+ Destinations" },
        { region: "Middle East", count: "12+ Destinations" },
        { region: "Europe", count: "28+ Destinations" },
        { region: "Africa", count: "15+ Destinations" }
      ],
      about_team: [
        { name: "Vikram Singh", role: "Founder & Chief Explorer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" },
        { name: "Sarah Jenkins", role: "Head of Global Curation", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" },
        { name: "Arjun Mehta", role: "Director of Operations", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600" }
      ],

      // Contact Page
      contact_offices: [
        { city: "London", desc: "Serving EMEA Clients", address: "15 Mayfair Place, London, UK" },
        { city: "New York", desc: "Serving Americas", address: "One World Trade Center, NY, USA" },
        { city: "Dubai", desc: "Serving Middle East", address: "Boulevard Plaza, Downtown Dubai, UAE" }
      ],
      contact_faqs: [
        { q: "How far in advance should I book a bespoke itinerary?", a: "For custom expeditions, we recommend initiating the planning process at least 6 months in advance. For peak seasons in destinations like Japan or East Africa, 9-12 months is preferred to secure elite accommodations." },
        { q: "Do you handle private aviation and yacht charters?", a: "Yes. Our logistics team routinely coordinates private jet charters, helicopter transfers, and luxury yacht rentals as part of our comprehensive travel design service." },
        { q: "What is your cancellation policy?", a: "Cancellation terms are individually structured based on the specific vendors and properties in your itinerary. Your dedicated travel designer will provide a transparent outline of all terms before any deposit is collected." },
        { q: "Do you provide on-trip support?", a: "Absolutely. Every Himsagar Travels client receives access to our 24/7 global concierge desk, along with direct contact to local fixers in your destination timezone." }
      ]
    } as any);
    console.log("Seeded initial SiteContent.");
  } else {
    // Patch existing document with missing fields
    const existingContent = await SiteContent.findOne() as any;
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
        { name: "Satyamurthy", role: "Founder", img: "/images/PHOTO-2026-06-09-19-16-42.jpg" },
        { name: "Uma Satyamurthy", role: "Director", img: "/images/PHOTO-2026-06-09-19-16-42 2.jpg" }
      ];

      existingContent.site_name = existingContent.site_name || "Himsagar Travels";
      existingContent.contact_email = existingContent.contact_email || "concierge@himsagar.com";
      existingContent.contact_phone = existingContent.contact_phone || "+91 78457 38386";
      existingContent.address = existingContent.address || "Kolkata, West Bengal, India";
      existingContent.instagram_url = existingContent.instagram_url || "https://www.instagram.com/himsagar_travels";
      existingContent.email_notifications = existingContent.email_notifications ?? true;
      existingContent.inquiry_alerts = existingContent.inquiry_alerts ?? true;

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
    }
  }

  // ─── API Routes ───────────────────────────────────────────────────────────

  // Auth
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" });
    res.json({ token });
  });

  // Events — public
  app.get("/api/events", async (req, res) => {
    const events = await Event.find().sort({ created_at: -1 });
    res.json(events.map(e => ({ ...e.toObject(), id: e._id })));
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: "Not found" });
      res.json({ ...event.toObject(), id: event._id });
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  // SiteContent API
  app.get("/api/content", async (req, res) => {
    try {
      const content = await SiteContent.findOne().sort({ created_at: -1 });
      res.json(content || {});
    } catch {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/admin/settings", authenticateToken, async (req, res) => {
    try {
      const content = await SiteContent.findOne().sort({ created_at: -1 });
      res.json({
        site_name: content?.site_name || "Himsagar Travels",
        contact_email: content?.contact_email || "concierge@himsagar.com",
        contact_phone: content?.contact_phone || "+91 78457 38386",
        address: content?.address || "Kolkata, West Bengal, India",
        instagram_url: content?.instagram_url || "https://www.instagram.com/himsagar_travels",
        email_notifications: content?.email_notifications ?? true,
        inquiry_alerts: content?.inquiry_alerts ?? true,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", authenticateToken, async (req, res) => {
    try {
      const { site_name, contact_email, contact_phone, address, instagram_url, email_notifications, inquiry_alerts } = req.body;
      let content = await SiteContent.findOne().sort({ created_at: -1 });
      const updateData = {
        site_name,
        contact_email,
        contact_phone,
        address,
        instagram_url,
        email_notifications,
        inquiry_alerts,
      };

      if (!content) {
        content = await SiteContent.create(updateData);
      } else {
        await SiteContent.updateOne({ _id: content._id }, updateData);
        content = await SiteContent.findById(content._id);
      }
      res.json(content);
    } catch (err) {
      console.error("Failed to update settings:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.put("/api/admin/content", authenticateToken, upload.none(), async (req, res) => {
    try {
      const payload = req.body;
      let content = await SiteContent.findOne().sort({ created_at: -1 });

      const updateData = {
        hero_images: parseMaybeJSON(payload.hero_images) ?? content?.hero_images,
        categories: parseMaybeJSON(payload.categories) ?? content?.categories,
        stats: parseMaybeJSON(payload.stats) ?? content?.stats,
        philosophy: parseMaybeJSON(payload.philosophy) ?? content?.philosophy,
        essentials: parseMaybeJSON(payload.essentials) ?? content?.essentials,
        destinations: parseMaybeJSON(payload.destinations) ?? content?.destinations,
        testimonials: parseMaybeJSON(payload.testimonials) ?? content?.testimonials,
        instagram_moments: parseMaybeJSON(payload.instagram_moments) ?? content?.instagram_moments,

        tours_trust_indicators: parseMaybeJSON(payload.tours_trust_indicators) ?? content?.tours_trust_indicators,
        tours_differences: parseMaybeJSON(payload.tours_differences) ?? content?.tours_differences,

        about_heritage_stats: parseMaybeJSON(payload.about_heritage_stats) ?? content?.about_heritage_stats,
        about_principles: parseMaybeJSON(payload.about_principles) ?? content?.about_principles,
        about_global_stats: parseMaybeJSON(payload.about_global_stats) ?? content?.about_global_stats,
        about_team: parseMaybeJSON(payload.about_team) ?? content?.about_team,

        contact_offices: parseMaybeJSON(payload.contact_offices) ?? content?.contact_offices,
        contact_faqs: parseMaybeJSON(payload.contact_faqs) ?? content?.contact_faqs,
        site_name: payload.site_name || content?.site_name,
        contact_email: payload.contact_email || content?.contact_email,
        contact_phone: payload.contact_phone || content?.contact_phone,
        address: payload.address || content?.address,
        instagram_url: payload.instagram_url || content?.instagram_url,
        email_notifications: Object.prototype.hasOwnProperty.call(payload, "email_notifications") ? (payload.email_notifications === "true" || payload.email_notifications === true) : content?.email_notifications,
        inquiry_alerts: Object.prototype.hasOwnProperty.call(payload, "inquiry_alerts") ? (payload.inquiry_alerts === "true" || payload.inquiry_alerts === true) : content?.inquiry_alerts,
      };

      if (!content) {
        content = await SiteContent.create(updateData);
      } else {
        await SiteContent.updateOne({ _id: content._id }, updateData);
        content = await SiteContent.findById(content._id);
      }
      res.json(content);
    } catch (err) {
      console.error("Failed to update content", { error: err, payload: req.body });
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  // Events — admin CRUD
  app.post("/api/admin/events", authenticateToken, upload.array("images", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const uploadPromises = (files || []).map(f => uploadBufferToCloudinary((f.buffer as Buffer), f.mimetype, f.originalname));
      const imageUrls = files && files.length ? await Promise.all(uploadPromises) : [];
      const existingImages = req.body.existing_images ? (parseMaybeJSON(req.body.existing_images) || []) : [];
      const event = await Event.create({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        price: req.body.price,
        location: req.body.location,
        category: req.body.category,
        overview: req.body.overview,
        places_covered: req.body.places_covered,
        tour_cost_includes: req.body.tour_cost_includes,
        note: req.body.note,
        tour_highlights: req.body.tour_highlights,
        included: req.body.included,
        excluded: req.body.excluded,
        is_featured: req.body.is_featured === "true" || req.body.is_featured === true,
        images: [...(Array.isArray(existingImages) ? existingImages : []), ...imageUrls],
        itinerary: req.body.itinerary ? (parseMaybeJSON(req.body.itinerary) || []) : [],
        visual_journey: req.body.visual_journey ? (parseMaybeJSON(req.body.visual_journey) || []) : [],
      });
      res.json({ ...event.toObject(), id: event._id });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event." });
    }
  });

  app.put("/api/admin/events/:id", authenticateToken, upload.array("images", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const uploadPromises = (files || []).map(f => uploadBufferToCloudinary((f.buffer as Buffer), f.mimetype, f.originalname));
      const imageUrls = files && files.length ? await Promise.all(uploadPromises) : [];
      const existingImages = req.body.existing_images ? (parseMaybeJSON(req.body.existing_images) || []) : [];
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          description: req.body.description,
          date: req.body.date,
          price: req.body.price,
          location: req.body.location,
          category: req.body.category,
          overview: req.body.overview,
          places_covered: req.body.places_covered,
          tour_cost_includes: req.body.tour_cost_includes,
          note: req.body.note,
          tour_highlights: req.body.tour_highlights,
          included: req.body.included,
          excluded: req.body.excluded,
          is_featured: req.body.is_featured === "true" || req.body.is_featured === true,
          images: [...(Array.isArray(existingImages) ? existingImages : []), ...imageUrls],
          itinerary: req.body.itinerary ? (parseMaybeJSON(req.body.itinerary) || []) : [],
          visual_journey: req.body.visual_journey ? (parseMaybeJSON(req.body.visual_journey) || []) : [],
        },
        { new: true }
      );
      res.json({ ...event!.toObject(), id: event!._id });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event details." });
    }
  });

  app.delete("/api/admin/events/:id", authenticateToken, async (req, res) => {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  });

  // Inquiries
  app.post("/api/inquiries", async (req, res) => {
    const { event_id, name, email, phone, message } = req.body;
    let event_title = "";
    const validEventId = event_id && event_id.trim() !== "" ? event_id : undefined;

    try {
      if (validEventId) {
        const ev = await Event.findById(validEventId);
        event_title = ev?.title || "";
      }

      const inquiry = await Inquiry.create({
        event_id: validEventId,
        event_title,
        name,
        email,
        phone,
        message
      });
      res.json({ ...inquiry.toObject(), id: inquiry._id });
    } catch (err) {
      console.error("Failed to create inquiry:", err);
      res.status(500).json({ error: "Failed to create inquiry" });
    }
  });

  app.get("/api/admin/inquiries", authenticateToken, async (req, res) => {
    const inquiries = await Inquiry.find().sort({ created_at: -1 });
    res.json(inquiries.map(i => ({ ...i.toObject(), id: i._id })));
  });

  app.put("/api/admin/inquiries/:id", authenticateToken, async (req, res) => {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: "after" });
    res.json({ ...inquiry!.toObject(), id: inquiry!._id });
  });

  app.post("/api/subscribe", async (req, res) => {
    const { email, name, source } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await Subscription.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ message: "This email is already subscribed." });
      }

      const subscription = await Subscription.create({
        email: normalizedEmail,
        name: name?.trim(),
        source: source || "website",
      });
      res.json({ id: subscription._id, email: subscription.email });
    } catch (err) {
      console.error("Failed to save subscription:", err);
      res.status(500).json({ error: "Failed to save subscription." });
    }
  });

  app.get("/api/admin/subscriptions", authenticateToken, async (req, res) => {
    const subscriptions = await Subscription.find().sort({ created_at: -1 });
    res.json(subscriptions.map(s => ({ ...s.toObject(), id: s._id })));
  });

  app.delete("/api/admin/subscriptions/:id", authenticateToken, async (req, res) => {
    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  });

  // Image upload (Standalone)
  app.post("/api/admin/upload", authenticateToken, upload.array("images", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const uploadPromises = (files || []).map(f => uploadBufferToCloudinary((f.buffer as Buffer), f.mimetype, f.originalname));
      const urls = files && files.length ? await Promise.all(uploadPromises) : [];
      res.json({ urls });
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Vite SSR / SPA — enable only in development. In production serve built assets directly.
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    app.use("*", async (req, res) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    // Production: serve the built Vite files from `dist`.
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Keep SPA fallback after static files
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Set PORT to a different value or stop the process occupying it.`);
      process.exit(1);
    }
    throw err;
  });
}

startServer();
