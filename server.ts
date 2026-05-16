import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

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
  is_featured: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});
const Event = mongoose.model("Event", eventSchema);

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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'himsagar-tours',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  } as any
});
const upload = multer({ storage });

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedEvents = [
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
  const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb+srv://mohanakrishnandevin_db_user:dkRgknFj9vBCLft6@himsagar.pff49ct.mongodb.net/?appName=himsagar";

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

  // Events — admin CRUD
  app.post("/api/admin/events", authenticateToken, upload.array("images", 10), async (req, res) => {
    const imageUrls = (req.files as Express.Multer.File[])?.map(f => f.path) || [];
    const existingImages = req.body.existing_images ? JSON.parse(req.body.existing_images) : [];
    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      price: req.body.price,
      location: req.body.location,
      category: req.body.category,
      is_featured: req.body.is_featured === "true",
      images: [...existingImages, ...imageUrls],
    });
    res.json({ ...event.toObject(), id: event._id });
  });

  app.put("/api/admin/events/:id", authenticateToken, upload.array("images", 10), async (req, res) => {
    const imageUrls = (req.files as Express.Multer.File[])?.map(f => f.path) || [];
    const existingImages = req.body.existing_images ? JSON.parse(req.body.existing_images) : [];
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        price: req.body.price,
        location: req.body.location,
        category: req.body.category,
        is_featured: req.body.is_featured === "true",
        images: [...existingImages, ...imageUrls],
      },
      { new: true }
    );
    res.json({ ...event!.toObject(), id: event!._id });
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
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ ...inquiry!.toObject(), id: inquiry!._id });
  });

  // Image upload (Standalone)
  app.post("/api/admin/upload", authenticateToken, upload.array("images", 10), (req, res) => {
    const files = req.files as Express.Multer.File[];
    const urls = files.map(f => f.path);
    res.json({ urls });
  });

  // Vite SSR / SPA
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

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
