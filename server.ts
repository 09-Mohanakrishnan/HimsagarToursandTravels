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
import nodemailer from "nodemailer";


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
  slug: { type: String, unique: true, index: true },
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
  route: String,
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
  testimonials: [{ name: String, text: String, location: String, image: String, rating: { type: Number, default: 5 } }],
  instagram_moments: [String],
  instagram_max_posts: { type: Number, default: 12 },
  instagram_filter_keywords: String,
  instagram_hide_captions: { type: Boolean, default: false },

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
  site_domain: { type: String, default: "https://himsagartravels.com" },
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
  status: { type: String, default: "active", enum: ["active", "unsubscribed"] },
  lastEmailSent: { type: Date },
  totalEmailsReceived: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});
const Subscription = mongoose.model("Subscription", subscriptionSchema);


const seoConfigSchema = new mongoose.Schema({
  pageKey: { type: String, required: true, unique: true }, // "home", "about", "contact", "events", "event::{slug}"
  seoTitle: String,
  metaDescription: String,
  keywords: String,
  canonicalUrl: String,
  slug: String,
  ogImage: String,
  twitterImage: String,
  robots: String,
  customSchema: String, // JSON string
  updated_at: { type: Date, default: Date.now }
});
const SeoConfig = mongoose.model("SeoConfig", seoConfigSchema);

const seoKeywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  landingPage: String,
  targetUrl: String,
  status: { type: String, default: "needs_attention" },
  notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
const SeoKeyword = mongoose.model("SeoKeyword", seoKeywordSchema);

// ─── Blog Schemas ─────────────────────────────────────────────────────────────

const blogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, index: true },
  description: String,
  color: { type: String, default: "#c29d44" },
  created_at: { type: Date, default: Date.now },
});
const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);

const blogTagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, index: true },
  created_at: { type: Date, default: Date.now },
});
const BlogTag = mongoose.model("BlogTag", blogTagSchema);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  excerpt: { type: String, default: "" },
  content: { type: String, default: "" },         // HTML from TipTap
  featuredImage: String,
  gallery: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory" },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogTag" }],
  author: { type: String, default: "Himsagar Travels" },
  status: { type: String, default: "draft", enum: ["draft", "published", "archived"] },
  publishedAt: { type: Date },
  scheduledAt: { type: Date },

  // SEO
  seoTitle: String,
  metaDescription: String,
  keywords: String,
  canonicalUrl: String,
  ogImage: String,
  twitterImage: String,
  customSchema: String,   // JSON-LD string

  // Relations
  relatedTours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  faq: [{ question: String, answer: String }],

  // Meta
  views: { type: Number, default: 0 },
  readingTime: { type: Number, default: 1 },  // minutes
  isFeatured: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ "category": 1, status: 1 });
const BlogPost = mongoose.model("BlogPost", blogSchema);

const emailQueueSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" },
  blogTitle: String,
  blogSlug: String,
  blogExcerpt: String,
  blogImage: String,
  status: { type: String, default: "queued", enum: ["queued", "processing", "sent", "failed", "cancelled"] },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  errorMessage: String,
  startedAt: Date,
  completedAt: Date,
  created_at: { type: Date, default: Date.now },
});
const EmailQueue = mongoose.model("EmailQueue", emailQueueSchema);



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
  cloud_name: process.env.CLOUD_NAME || process.env.cloud_name,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET || process.env.API_SECRETE
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

// ─── Slug Generation ──────────────────────────────────────────────────────────

/** Convert a title string to a URL-friendly slug (e.g. "Muktinath Yatra" → "muktinath-yatra") */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "") // strip special chars
    .replace(/\s+/g, "-")         // spaces → hyphens
    .replace(/-+/g, "-")          // collapse multiple hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphens
};

/** Generate a unique slug, appending -2, -3 etc. if a collision is found */
const generateUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  let baseSlug = generateSlug(title);
  if (!baseSlug) baseSlug = "tour";
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query: any = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Event.findOne(query);
    if (!existing) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

/** Check if a string looks like a MongoDB ObjectId (24-char hex) */
const isMongoId = (str: string): boolean => /^[0-9a-fA-F]{24}$/.test(str);

/** Generate a unique slug for BlogPost (separate from Event slugs) */
const generateUniqueBlogSlug = async (title: string, excludeId?: string): Promise<string> => {
  let baseSlug = generateSlug(title);
  if (!baseSlug) baseSlug = "blog";
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query: any = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await BlogPost.findOne(query);
    if (!existing) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

/** Generate a unique slug for BlogCategory */
const generateUniqueCategorySlug = async (name: string, excludeId?: string): Promise<string> => {
  let baseSlug = generateSlug(name);
  if (!baseSlug) baseSlug = "category";
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query: any = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await BlogCategory.findOne(query);
    if (!existing) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

/** Calculate reading time in minutes from HTML content */
const calculateReadingTime = (html: string): number => {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
};

// ─── Email Service ────────────────────────────────────────────────────────────

/** Create a Nodemailer transporter if SMTP env vars are configured */
const createEmailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
};

/** Generate professional HTML email template for blog notification */
const buildBlogEmailHtml = (blog: any, domain: string, queueId: string) => {
  const readMoreUrl = `${domain}/blog/${blog.slug}`;
  const unsubscribeUrl = `${domain}/unsubscribe?token={{TOKEN}}`;
  const logoUrl = `${domain}/logo.png`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${blog.title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:28px 40px;text-align:center;">
            <img src="${logoUrl}" alt="Himsagar Travels" height="48" style="height:48px;object-fit:contain;filter:brightness(0) invert(1);" onerror="this.style.display='none'" />
            <p style="color:#c29d44;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:12px 0 0;font-weight:700;">New From Our Blog</p>
          </td>
        </tr>
        ${blog.featuredImage ? `
        <!-- Featured Image -->
        <tr>
          <td style="padding:0;">
            <img src="${blog.featuredImage}" alt="${blog.title}" style="width:100%;height:260px;object-fit:cover;display:block;" />
          </td>
        </tr>` : ""}
        <!-- Content -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${blog.category ? `<p style="color:#c29d44;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin:0 0 16px;">${typeof blog.category === 'object' ? blog.category.name : blog.category}</p>` : ""}
            <h1 style="color:#0f172a;font-size:26px;font-weight:800;line-height:1.3;margin:0 0 20px;">${blog.title}</h1>
            <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 32px;">${blog.excerpt || ""}</p>
            <div style="text-align:center;">
              <a href="${readMoreUrl}" style="display:inline-block;background:#c29d44;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:16px 40px;border-radius:50px;">Read Full Article →</a>
            </div>
          </td>
        </tr>
        <!-- Divider -->
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #f1f5f9;" /></td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">You are receiving this because you subscribed to Himsagar Travels updates.</p>
            <p style="margin:0;">
              <a href="${unsubscribeUrl}" style="color:#94a3b8;font-size:11px;text-decoration:underline;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="${domain}" style="color:#94a3b8;font-size:11px;text-decoration:none;">himsagartravels.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/** Async email queue processor — runs in background, does NOT block API response */
const processEmailQueue = async (queueId: string, blog: any, domain: string) => {
  const transporter = createEmailTransporter();
  const fromAddress = process.env.SMTP_FROM || "Himsagar Travels <noreply@himsagartravels.com>";

  try {
    await EmailQueue.findByIdAndUpdate(queueId, { status: "processing", startedAt: new Date() });

    const subscribers = await Subscription.find({ status: { $ne: "unsubscribed" } });
    const total = subscribers.length;
    await EmailQueue.findByIdAndUpdate(queueId, { totalRecipients: total });

    if (!transporter) {
      console.warn("⚠️  SMTP not configured — email queue marked as failed.");
      await EmailQueue.findByIdAndUpdate(queueId, {
        status: "failed",
        errorMessage: "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in environment.",
        completedAt: new Date(),
      });
      return;
    }

    let sent = 0;
    let failed = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      // Check if cancelled
      const current = await EmailQueue.findById(queueId);
      if (current?.status === "cancelled") {
        console.log(`Email campaign ${queueId} cancelled at batch ${i}`);
        return;
      }

      const batch = subscribers.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (sub) => {
          try {
            const html = buildBlogEmailHtml(blog, domain, queueId);
            await transporter.sendMail({
              from: fromAddress,
              to: sub.email,
              subject: `✈️ New Blog: ${blog.title} | Himsagar Travels`,
              html,
            });
            // Track on subscriber
            await Subscription.findByIdAndUpdate(sub._id, {
              lastEmailSent: new Date(),
              $inc: { totalEmailsReceived: 1 },
            });
            sent++;
          } catch (err: any) {
            console.error(`Failed to send to ${sub.email}:`, err.message);
            failed++;
          }
        })
      );

      await EmailQueue.findByIdAndUpdate(queueId, { sentCount: sent, failedCount: failed });

      // Small delay between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    await EmailQueue.findByIdAndUpdate(queueId, {
      status: failed === total ? "failed" : "sent",
      sentCount: sent,
      failedCount: failed,
      completedAt: new Date(),
    });
    console.log(`✅ Email campaign ${queueId} complete: ${sent} sent, ${failed} failed`);
  } catch (err: any) {
    console.error("Email queue processing error:", err);
    await EmailQueue.findByIdAndUpdate(queueId, {
      status: "failed",
      errorMessage: err.message,
      completedAt: new Date(),
    });
  }
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

    // Migration: populate route field for existing events if not set
    try {
      const eventsToUpdate = await Event.find({ route: { $exists: false } });
      if (eventsToUpdate.length > 0) {
        console.log(`Migrating ${eventsToUpdate.length} events to add route field...`);
        const fallbacks: Record<string, string> = {
          "Char Dham Yatra": "Haridwar → Barkot → Yamunotri → Uttarkashi → Gangotri → Guptkashi → Kedarnath → Badrinath → Rishikesh",
          "Muktinath Yatra": "Kathmandu → Pokhara → Jomsom → Muktinath → Pokhara → Kathmandu",
          "Malaysia and Singapore Tour": "Kuala Lumpur → Batu Caves → Putrajaya → Genting → Singapore → Sentosa",
          "Malaysia & Singapore Tour": "Kuala Lumpur → Batu Caves → Putrajaya → Genting → Singapore → Sentosa",
          "Bali Tour": "Kuta → Ubud → Kintamani → Tanjung Benoa → Uluwatu → Tanah Lot → Seminyak",
          "Ramayana Tour": "Colombo → Sigiriya → Dambulla → Kandy → Nuwara Eliya → Ella → Colombo",
          "Kashmir Package": "Srinagar → Mughal Gardens → Gulmarg → Pahalgam → Sonmarg → Srinagar",
        };
        for (const ev of eventsToUpdate) {
          const matchedRoute = fallbacks[ev.title] || "Departure City → Destination → Return";
          await Event.updateOne({ _id: ev._id }, { $set: { route: matchedRoute } });
        }
        console.log("Migration complete.");
      }
    } catch (migError) {
      console.error("⚠️ Migration failed:", migError);
    }

    // Migration: populate slug field for existing events if not set
    try {
      const eventsWithoutSlug = await Event.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] });
      if (eventsWithoutSlug.length > 0) {
        console.log(`Migrating ${eventsWithoutSlug.length} events to add slug field...`);
        for (const ev of eventsWithoutSlug) {
          const slug = await generateUniqueSlug(ev.title, ev._id.toString());
          await Event.updateOne({ _id: ev._id }, { $set: { slug } });
        }
        console.log("Slug migration complete.");
      }
    } catch (migError) {
      console.error("⚠️ Slug migration failed:", migError);
    }
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

  app.get("/api/events/:idOrSlug", async (req, res) => {
    try {
      const param = req.params.idOrSlug;
      let event;
      if (isMongoId(param)) {
        event = await Event.findById(param);
      } else {
        event = await Event.findOne({ slug: param });
      }
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
        site_domain: content?.site_domain || "https://himsagartravels.com",
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
      const { site_name, site_domain, contact_email, contact_phone, address, instagram_url, email_notifications, inquiry_alerts } = req.body;
      let content = await SiteContent.findOne().sort({ created_at: -1 });
      const updateData: any = {
        site_name,
        contact_email,
        contact_phone,
        address,
        instagram_url,
        email_notifications,
        inquiry_alerts,
      };
      if (site_domain !== undefined) updateData.site_domain = site_domain;

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
        instagram_max_posts: Object.prototype.hasOwnProperty.call(payload, "instagram_max_posts") ? Number(payload.instagram_max_posts) : content?.instagram_max_posts,
        instagram_filter_keywords: payload.instagram_filter_keywords !== undefined ? payload.instagram_filter_keywords : content?.instagram_filter_keywords,
        instagram_hide_captions: Object.prototype.hasOwnProperty.call(payload, "instagram_hide_captions") ? (payload.instagram_hide_captions === "true" || payload.instagram_hide_captions === true) : content?.instagram_hide_captions,

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
      const slug = await generateUniqueSlug(req.body.title);
      const event = await Event.create({
        title: req.body.title,
        slug,
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
        route: req.body.route,
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
      // Regenerate slug if title changed
      const existingEvent = await Event.findById(req.params.id);
      const newSlug = existingEvent && existingEvent.title !== req.body.title
        ? await generateUniqueSlug(req.body.title, req.params.id)
        : existingEvent?.slug || await generateUniqueSlug(req.body.title, req.params.id);

      const event = await Event.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          slug: newSlug,
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
          route: req.body.route,
          images: [...(Array.isArray(existingImages) ? existingImages : []), ...imageUrls],
          itinerary: req.body.itinerary ? (parseMaybeJSON(req.body.itinerary) || []) : [],
          visual_journey: req.body.visual_journey ? (parseMaybeJSON(req.body.visual_journey) || []) : [],
        },
        { new: true }
      );
      res.json({ ...event!.toObject(), id: event!._id });
    } catch (error: any) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event details.", details: error.message, stack: error.stack });
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

  // ─── Instagram Feed API ─────────────────────────────────────────────────────

  let instagramCache: { data: any; timestamp: number } | null = null;
  const INSTAGRAM_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  app.get("/api/instagram/status", async (req, res) => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      return res.json({ connected: false });
    }
    try {
      const meResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      if (!meResponse.ok) return res.json({ connected: false });
      const meData = await meResponse.json() as any;
      res.json({ connected: true, username: meData.username });
    } catch (e) {
      res.json({ connected: false });
    }
  });

  // ─── SEO Management ────────────────────────────────────────────────────────
  
  app.get("/api/admin/seo", authenticateToken, async (req, res) => {
    try {
      const configs = await SeoConfig.find({});
      res.json(configs);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch SEO configs" });
    }
  });

  app.put("/api/admin/seo/:pageKey", authenticateToken, async (req, res) => {
    try {
      const config = await SeoConfig.findOneAndUpdate(
        { pageKey: req.params.pageKey },
        { ...req.body, updated_at: new Date() },
        { new: true, upsert: true }
      );
      res.json(config);
    } catch (err) {
      res.status(500).json({ error: "Failed to update SEO config" });
    }
  });

  app.get("/api/seo/:pageKey", async (req, res) => {
    try {
      const config = await SeoConfig.findOne({ pageKey: req.params.pageKey });
      if (!config) return res.status(404).json({ error: "Not found" });
      res.json(config);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch SEO config" });
    }
  });

  app.get("/api/admin/seo/health", authenticateToken, async (req, res) => {
    try {
      const events = await Event.find({});
      const seoConfigs = await SeoConfig.find({});
      const content = await SiteContent.findOne().sort({ created_at: -1 });
      const domain = content?.site_domain || "https://himsagartravels.com";

      const staticPageDefs = [
        { key: "home", label: "Home Page", path: "/" },
        { key: "about", label: "About Us", path: "/about" },
        { key: "contact", label: "Contact Us", path: "/contact" },
        { key: "events", label: "Tours / Events", path: "/tours" }
      ];

      const pages: any[] = [];
      const titleMap: Record<string, string[]> = {};
      const descMap: Record<string, string[]> = {};

      const analyzeTitle = (t: string, pageKey: string) => {
        const len = t.length;
        const issues: string[] = [];
        if (!t || t === "Himsagar Travels") issues.push("title_too_generic");
        if (len > 65) issues.push("title_too_long");
        if (len > 0 && len < 30) issues.push("title_too_short");
        if (!(titleMap[t])) titleMap[t] = [];
        titleMap[t].push(pageKey);
        return { issues, len };
      };

      const analyzeDesc = (d: string, pageKey: string) => {
        const len = d.length;
        const issues: string[] = [];
        if (!d) issues.push("missing_description");
        if (len > 170) issues.push("desc_too_long");
        if (len > 0 && len < 70) issues.push("desc_too_short");
        if (!(descMap[d])) descMap[d] = [];
        descMap[d].push(pageKey);
        return { issues, len };
      };

      const buildPage = (pageKey: string, label: string, pagePath: string, defaultTitle: string, defaultDesc: string, defaultImg: string, hasSchema: boolean) => {
        const conf: any = seoConfigs.find((c: any) => c.pageKey === pageKey) || {};
        const title = conf.seoTitle || defaultTitle;
        const desc = conf.metaDescription || defaultDesc;
        const canonical = conf.canonicalUrl || `${domain}${pagePath}`;
        const ogImage = conf.ogImage || defaultImg || "";
        const twitterImage = conf.twitterImage || "";
        const schema = !!(conf.customSchema || hasSchema);
        const robots = conf.robots || "index, follow";
        const keywords = conf.keywords || "";

        const issues: string[] = [];
        const ta = analyzeTitle(title, pageKey);
        const da = analyzeDesc(desc, pageKey);
        issues.push(...ta.issues, ...da.issues);
        if (!ogImage) issues.push("missing_og_image");
        if (!twitterImage) issues.push("missing_twitter_image");
        if (!schema) issues.push("missing_schema");
        if (!canonical) issues.push("missing_canonical");
        if (!keywords) issues.push("missing_keywords");
        if (robots.includes("noindex")) issues.push("noindex");

        const checks = 8;
        const pageScore = Math.max(0, Math.round(((checks - issues.length) / checks) * 100));
        let status = "excellent";
        if (pageScore < 90) status = "good";
        if (pageScore < 70) status = "needs_attention";
        if (pageScore < 50) status = "critical";

        pages.push({
          pageKey, label, path: pagePath, title, titleLength: ta.len, description: desc, descLength: da.len,
          canonical, ogImage, twitterImage, schema, robots, keywords, issues, score: pageScore, status,
          updatedAt: conf.updated_at || null
        });
      };

      staticPageDefs.forEach(sp => {
        buildPage(sp.key, sp.label, sp.path, `${sp.label} | Himsagar Travels`, "Experience spiritual and Himalayan tour packages with Himsagar Travels.", "", sp.key === "home");
      });

      events.forEach((e: any) => {
        const pk = `event::${e.slug}`;
        buildPage(pk, e.title, `/tours/${e.slug}`, `${e.title} | Himsagar Travels`, (e.description || "").substring(0, 160), e.images?.[0] || "", true);
      });

      // Find duplicates
      const dupTitles: Record<string, string[]> = {};
      Object.entries(titleMap).forEach(([t, keys]) => { if (keys.length > 1) dupTitles[t] = keys; });
      const dupDescs: Record<string, string[]> = {};
      Object.entries(descMap).forEach(([d, keys]) => { if (keys.length > 1) dupDescs[d] = keys; });

      // Mark duplicate issues on pages
      pages.forEach(p => {
        const t = p.title;
        if (dupTitles[t]) { if (!p.issues.includes("duplicate_title")) p.issues.push("duplicate_title"); }
        const d = p.description;
        if (dupDescs[d]) { if (!p.issues.includes("duplicate_description")) p.issues.push("duplicate_description"); }
      });

      // Summary counts
      const summary = {
        missingTitles: pages.filter(p => p.issues.includes("title_too_generic")).length,
        missingDesc: pages.filter(p => p.issues.includes("missing_description")).length,
        duplicateTitles: Object.keys(dupTitles).length,
        duplicateDescs: Object.keys(dupDescs).length,
        missingCanonical: pages.filter(p => p.issues.includes("missing_canonical")).length,
        missingOgImage: pages.filter(p => p.issues.includes("missing_og_image")).length,
        missingTwitterImage: pages.filter(p => p.issues.includes("missing_twitter_image")).length,
        missingSchema: pages.filter(p => p.issues.includes("missing_schema")).length,
        missingKeywords: pages.filter(p => p.issues.includes("missing_keywords")).length,
        nonIndexable: pages.filter(p => p.issues.includes("noindex")).length,
        titleTooLong: pages.filter(p => p.issues.includes("title_too_long")).length,
        descTooLong: pages.filter(p => p.issues.includes("desc_too_long")).length
      };

      // Recommendations
      const recommendations: any[] = [];
      pages.forEach(p => {
        if (p.issues.includes("title_too_generic")) recommendations.push({ issue: `"${p.label}" has a generic title`, reason: `Title "${p.title}" doesn't differentiate this page`, fix: `Add unique keywords: e.g., "${p.label} | Spiritual Tour Packages | Himsagar Travels"`, priority: "high", pageKey: p.pageKey });
        if (p.issues.includes("title_too_long")) recommendations.push({ issue: `"${p.label}" title exceeds 65 characters (${p.titleLength})`, reason: "Google truncates titles longer than ~60-65 characters", fix: "Shorten the title to 50-60 characters", priority: "medium", pageKey: p.pageKey });
        if (p.issues.includes("missing_description")) recommendations.push({ issue: `"${p.label}" has no meta description`, reason: "Search engines may auto-generate a poor snippet", fix: "Write a compelling 140-160 character description", priority: "high", pageKey: p.pageKey });
        if (p.issues.includes("desc_too_long")) recommendations.push({ issue: `"${p.label}" description exceeds 170 characters (${p.descLength})`, reason: "Google truncates descriptions longer than ~160 characters", fix: "Shorten to 140-160 characters", priority: "medium", pageKey: p.pageKey });
        if (p.issues.includes("missing_og_image")) recommendations.push({ issue: `"${p.label}" is missing an Open Graph image`, reason: "Social shares will show no preview image", fix: "Add a 1200×630 image URL to OG Image field", priority: "medium", pageKey: p.pageKey });
        if (p.issues.includes("missing_schema")) recommendations.push({ issue: `"${p.label}" has no structured data`, reason: "Rich snippets won't appear in search results", fix: "Add JSON-LD schema (Event, FAQ, Breadcrumb, or LocalBusiness)", priority: "medium", pageKey: p.pageKey });
        if (p.issues.includes("missing_keywords")) recommendations.push({ issue: `"${p.label}" has no target keywords`, reason: "Cannot track keyword optimization without defined targets", fix: "Add comma-separated keywords relevant to this page", priority: "low", pageKey: p.pageKey });
        if (p.issues.includes("duplicate_title")) recommendations.push({ issue: `"${p.label}" has a duplicate title`, reason: `Title "${p.title}" is shared with other pages`, fix: "Make each page title unique and descriptive", priority: "high", pageKey: p.pageKey });
        if (p.issues.includes("duplicate_description")) recommendations.push({ issue: `"${p.label}" has a duplicate description`, reason: "Multiple pages share the same meta description", fix: "Write unique descriptions for each page", priority: "high", pageKey: p.pageKey });
      });

      // Overall score
      const totalIssues = pages.reduce((sum, p) => sum + p.issues.length, 0);
      const totalChecks = pages.length * 8;
      const score = Math.max(0, Math.round(((totalChecks - totalIssues) / totalChecks) * 100));

      res.json({ score, pages, summary, duplicates: { titles: dupTitles, descriptions: dupDescs }, recommendations, domain });
    } catch (err) {
      console.error("Health check error:", err);
      res.status(500).json({ error: "Failed to generate health report" });
    }
  });

  // ─── Keyword Tracking CRUD ───────────────────────────────────────────────────

  app.get("/api/admin/seo/keywords", authenticateToken, async (req, res) => {
    try {
      const keywords = await SeoKeyword.find({}).sort({ created_at: -1 });
      res.json(keywords);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch keywords" });
    }
  });

  app.post("/api/admin/seo/keywords", authenticateToken, async (req, res) => {
    try {
      const kw = await SeoKeyword.create(req.body);
      res.json(kw);
    } catch (err) {
      res.status(500).json({ error: "Failed to create keyword" });
    }
  });

  app.put("/api/admin/seo/keywords/:id", authenticateToken, async (req, res) => {
    try {
      const kw = await SeoKeyword.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: new Date() }, { new: true });
      res.json(kw);
    } catch (err) {
      res.status(500).json({ error: "Failed to update keyword" });
    }
  });

  app.delete("/api/admin/seo/keywords/:id", authenticateToken, async (req, res) => {
    try {
      await SeoKeyword.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete keyword" });
    }
  });

  app.post("/api/admin/seo/generate-files", authenticateToken, async (req, res) => {
    try {
      const publicDir = path.resolve(__dirname, "../public");
      const content = await SiteContent.findOne().sort({ created_at: -1 });
      const domain = content?.site_domain || "https://himsagartravels.com";

      // robots.txt
      const robotsContent = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${domain}/sitemap.xml\n`;
      await fs.promises.writeFile(path.join(publicDir, "robots.txt"), robotsContent);

      // sitemap.xml
      const events = await Event.find({});
      const publishedBlogs = await BlogPost.find({ status: "published" }).select("slug updated_at publishedAt");
      const today = new Date().toISOString().split('T')[0];
      const urls = [
        { url: "/", priority: "1.0" },
        { url: "/about", priority: "0.8" },
        { url: "/contact", priority: "0.8" },
        { url: "/tours", priority: "0.9" },
        { url: "/blog", priority: "0.9" },
      ];
      events.forEach(e => urls.push({ url: `/tours/${e.slug}`, priority: "0.8" }));
      publishedBlogs.forEach(b => urls.push({ url: `/blog/${b.slug}`, priority: "0.7" }));
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      urls.forEach(u => {
        sitemap += `  <url>\n    <loc>${domain}${u.url}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>\n`;
      });
      sitemap += `</urlset>`;
      await fs.promises.writeFile(path.join(publicDir, "sitemap.xml"), sitemap);


      res.json({ robots: robotsContent, sitemap: sitemap });
    } catch (err) {
      res.status(500).json({ error: "Failed to generate files" });
    }
  });

  app.get("/api/instagram/feed", async (req, res) => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      return res.json({ posts: [], error: "Instagram not configured" });
    }

    // Return cached data if fresh
    if (instagramCache && (Date.now() - instagramCache.timestamp) < INSTAGRAM_CACHE_TTL) {
      return res.json({ posts: instagramCache.data, cached: true });
    }

    try {
      // First, resolve the Instagram User ID from the token via /me
      const meResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );
      if (!meResponse.ok) {
        const errText = await meResponse.text();
        console.error("Instagram /me failed:", errText);
        return res.json({ posts: [], error: "Instagram authentication failed" });
      }
      const meData = await meResponse.json() as any;
      const userId = meData.id;

      // Fetch media - fetching 50 to allow client-side filtering
      const mediaResponse = await fetch(
        `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${accessToken}`
      );
      if (!mediaResponse.ok) {
        const errText = await mediaResponse.text();
        console.error("Instagram media fetch failed:", errText);
        return res.json({ posts: [], error: "Failed to fetch Instagram posts" });
      }
      const mediaData = await mediaResponse.json() as any;
      const posts = (mediaData.data || []).map((post: any) => ({
        id: post.id,
        caption: post.caption || "",
        media_type: post.media_type,
        media_url: post.media_type === "VIDEO" ? (post.thumbnail_url || post.media_url) : post.media_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
      }));

      instagramCache = { data: posts, timestamp: Date.now() };
      res.json({ posts, cached: false });
    } catch (err) {
      console.error("Instagram API error:", err);
      res.json({ posts: [], error: "Instagram API error" });
    }
  });


  // ─── Blog Public APIs ─────────────────────────────────────────────────────

  // GET /api/blogs — List published blogs with pagination + filters
  app.get("/api/blogs", async (req, res) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Number(req.query.limit) || 12);
      const skip = (page - 1) * limit;
      const query: any = { status: "published" };
      if (req.query.category) query.category = req.query.category;
      if (req.query.tag) query.tags = req.query.tag;
      if (req.query.search) {
        const s = new RegExp(String(req.query.search), "i");
        query.$or = [{ title: s }, { excerpt: s }, { content: s }];
      }
      const [blogs, total] = await Promise.all([
        BlogPost.find(query)
          .populate("category", "name slug color")
          .populate("tags", "name slug")
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-content"),  // Exclude full content for listing
        BlogPost.countDocuments(query)
      ]);
      res.json({ blogs: blogs.map(b => ({ ...b.toObject(), id: b._id })), total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch blogs" });
    }
  });

  // GET /api/blogs/featured — Featured blogs
  app.get("/api/blogs/featured", async (req, res) => {
    try {
      const blogs = await BlogPost.find({ status: "published", isFeatured: true })
        .populate("category", "name slug color")
        .sort({ publishedAt: -1 })
        .limit(3)
        .select("-content");
      res.json(blogs.map(b => ({ ...b.toObject(), id: b._id })));
    } catch { res.status(500).json({ error: "Failed to fetch featured blogs" }); }
  });

  // GET /api/blogs/latest — Latest published blogs
  app.get("/api/blogs/latest", async (req, res) => {
    try {
      const limit = Math.min(10, Number(req.query.limit) || 5);
      const blogs = await BlogPost.find({ status: "published" })
        .populate("category", "name slug color")
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select("-content");
      res.json(blogs.map(b => ({ ...b.toObject(), id: b._id })));
    } catch { res.status(500).json({ error: "Failed to fetch latest blogs" }); }
  });

  // GET /api/blogs/popular — Popular blogs by views
  app.get("/api/blogs/popular", async (req, res) => {
    try {
      const limit = Math.min(10, Number(req.query.limit) || 5);
      const blogs = await BlogPost.find({ status: "published" })
        .populate("category", "name slug color")
        .sort({ views: -1 })
        .limit(limit)
        .select("-content");
      res.json(blogs.map(b => ({ ...b.toObject(), id: b._id })));
    } catch { res.status(500).json({ error: "Failed to fetch popular blogs" }); }
  });

  // GET /api/blogs/:slug — Single blog (increments views)
  app.get("/api/blogs/:slug", async (req, res) => {
    try {
      const blog = await BlogPost.findOneAndUpdate(
        { slug: req.params.slug, status: "published" },
        { $inc: { views: 1 } },
        { new: true }
      ).populate("category", "name slug color description")
        .populate("tags", "name slug")
        .populate("relatedTours", "title slug images category location");
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      res.json({ ...blog.toObject(), id: blog._id });
    } catch { res.status(500).json({ error: "Failed to fetch blog" }); }
  });

  // GET /api/blogs/:slug/related — Related blogs
  app.get("/api/blogs/:slug/related", async (req, res) => {
    try {
      const blog = await BlogPost.findOne({ slug: req.params.slug });
      if (!blog) return res.status(404).json({ error: "Not found" });
      const related = await BlogPost.find({
        status: "published",
        _id: { $ne: blog._id },
        $or: [
          { category: blog.category },
          { tags: { $in: blog.tags } }
        ]
      }).populate("category", "name slug color").sort({ publishedAt: -1 }).limit(3).select("-content");
      res.json(related.map(b => ({ ...b.toObject(), id: b._id })));
    } catch { res.status(500).json({ error: "Failed to fetch related blogs" }); }
  });

  // GET /api/blog-categories — All categories with post counts
  app.get("/api/blog-categories", async (req, res) => {
    try {
      const categories = await BlogCategory.find({}).sort({ name: 1 });
      const withCounts = await Promise.all(categories.map(async (cat) => {
        const count = await BlogPost.countDocuments({ category: cat._id, status: "published" });
        return { ...cat.toObject(), id: cat._id, postCount: count };
      }));
      res.json(withCounts);
    } catch { res.status(500).json({ error: "Failed to fetch categories" }); }
  });

  // GET /api/blog-tags — All tags
  app.get("/api/blog-tags", async (req, res) => {
    try {
      const tags = await BlogTag.find({}).sort({ name: 1 });
      res.json(tags.map(t => ({ ...t.toObject(), id: t._id })));
    } catch { res.status(500).json({ error: "Failed to fetch tags" }); }
  });

  // ─── Blog Admin APIs ──────────────────────────────────────────────────────

  // GET /api/admin/blogs — All blogs for admin (all statuses)
  app.get("/api/admin/blogs", authenticateToken, async (req, res) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Number(req.query.limit) || 20);
      const skip = (page - 1) * limit;
      const query: any = {};
      if (req.query.status) query.status = req.query.status;
      if (req.query.category) query.category = req.query.category;
      if (req.query.search) {
        const s = new RegExp(String(req.query.search), "i");
        query.$or = [{ title: s }, { excerpt: s }];
      }
      const [blogs, total] = await Promise.all([
        BlogPost.find(query)
          .populate("category", "name slug color")
          .populate("tags", "name slug")
          .sort({ updated_at: -1 })
          .skip(skip)
          .limit(limit)
          .select("-content"),
        BlogPost.countDocuments(query)
      ]);
      res.json({ blogs: blogs.map(b => ({ ...b.toObject(), id: b._id })), total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch blogs" });
    }
  });

  // GET /api/admin/blogs/stats — Blog statistics
  app.get("/api/admin/blogs/stats", authenticateToken, async (req, res) => {
    try {
      const [total, published, drafts, archived, categories, subscribers] = await Promise.all([
        BlogPost.countDocuments(),
        BlogPost.countDocuments({ status: "published" }),
        BlogPost.countDocuments({ status: "draft" }),
        BlogPost.countDocuments({ status: "archived" }),
        BlogCategory.countDocuments(),
        Subscription.countDocuments({ status: { $ne: "unsubscribed" } }),
      ]);
      res.json({ total, published, drafts, archived, categories, subscribers });
    } catch { res.status(500).json({ error: "Failed to fetch blog stats" }); }
  });

  // GET /api/admin/blogs/:id — Single blog for editing
  app.get("/api/admin/blogs/:id", authenticateToken, async (req, res) => {
    try {
      const blog = await BlogPost.findById(req.params.id)
        .populate("category", "name slug color")
        .populate("tags", "name slug")
        .populate("relatedTours", "title slug");
      if (!blog) return res.status(404).json({ error: "Not found" });
      res.json({ ...blog.toObject(), id: blog._id });
    } catch { res.status(500).json({ error: "Failed to fetch blog" }); }
  });

  // POST /api/admin/blogs — Create blog
  app.post("/api/admin/blogs", authenticateToken, upload.single("featuredImageFile"), async (req, res) => {
    try {
      let featuredImage = req.body.featuredImage || "";
      if (req.file) {
        featuredImage = await uploadBufferToCloudinary(req.file.buffer as Buffer, req.file.mimetype, req.file.originalname);
      }
      const slug = await generateUniqueBlogSlug(req.body.title);
      const content = req.body.content || "";
      const readingTime = calculateReadingTime(content);

      // Auto-populate SEO if missing
      const title = req.body.title || "";
      const excerpt = req.body.excerpt || "";
      const seoTitle = req.body.seoTitle || `${title} | Himsagar Travels Blog`;
      const metaDescription = req.body.metaDescription || excerpt.substring(0, 155);

      const blog = await BlogPost.create({
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        gallery: parseMaybeJSON(req.body.gallery) || [],
        category: req.body.category || undefined,
        tags: parseMaybeJSON(req.body.tags) || [],
        author: req.body.author || "Himsagar Travels",
        status: req.body.status || "draft",
        isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
        seoTitle,
        metaDescription,
        keywords: req.body.keywords || "",
        canonicalUrl: req.body.canonicalUrl || "",
        ogImage: req.body.ogImage || featuredImage,
        twitterImage: req.body.twitterImage || featuredImage,
        customSchema: req.body.customSchema || "",
        relatedTours: parseMaybeJSON(req.body.relatedTours) || [],
        faq: parseMaybeJSON(req.body.faq) || [],
        readingTime,
      });
      res.json({ ...blog.toObject(), id: blog._id });
    } catch (err: any) {
      console.error("Error creating blog:", err);
      res.status(500).json({ error: "Failed to create blog", details: err.message });
    }
  });

  // PUT /api/admin/blogs/:id — Update blog
  app.put("/api/admin/blogs/:id", authenticateToken, upload.single("featuredImageFile"), async (req, res) => {
    try {
      const existing = await BlogPost.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Not found" });

      let featuredImage = req.body.featuredImage || existing.featuredImage || "";
      if (req.file) {
        featuredImage = await uploadBufferToCloudinary(req.file.buffer as Buffer, req.file.mimetype, req.file.originalname);
      }

      const title = req.body.title || existing.title;
      const slug = title !== existing.title
        ? await generateUniqueBlogSlug(title, req.params.id)
        : existing.slug;

      const content = req.body.content !== undefined ? req.body.content : existing.content;
      const readingTime = calculateReadingTime(content);
      const excerpt = req.body.excerpt !== undefined ? req.body.excerpt : existing.excerpt;
      const seoTitle = req.body.seoTitle || `${title} | Himsagar Travels Blog`;
      const metaDescription = req.body.metaDescription || excerpt.substring(0, 155);

      const blog = await BlogPost.findByIdAndUpdate(req.params.id, {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        gallery: req.body.gallery !== undefined ? (parseMaybeJSON(req.body.gallery) || []) : existing.gallery,
        category: req.body.category !== undefined ? (req.body.category || undefined) : existing.category,
        tags: req.body.tags !== undefined ? (parseMaybeJSON(req.body.tags) || []) : existing.tags,
        author: req.body.author || existing.author,
        status: req.body.status || existing.status,
        isFeatured: req.body.isFeatured !== undefined ? (req.body.isFeatured === "true" || req.body.isFeatured === true) : existing.isFeatured,
        seoTitle,
        metaDescription,
        keywords: req.body.keywords !== undefined ? req.body.keywords : existing.keywords,
        canonicalUrl: req.body.canonicalUrl !== undefined ? req.body.canonicalUrl : existing.canonicalUrl,
        ogImage: req.body.ogImage || featuredImage,
        twitterImage: req.body.twitterImage || featuredImage,
        customSchema: req.body.customSchema !== undefined ? req.body.customSchema : existing.customSchema,
        relatedTours: req.body.relatedTours !== undefined ? (parseMaybeJSON(req.body.relatedTours) || []) : existing.relatedTours,
        faq: req.body.faq !== undefined ? (parseMaybeJSON(req.body.faq) || []) : existing.faq,
        readingTime,
        updated_at: new Date(),
      }, { new: true }).populate("category", "name slug color").populate("tags", "name slug");
      res.json({ ...blog!.toObject(), id: blog!._id });
    } catch (err: any) {
      console.error("Error updating blog:", err);
      res.status(500).json({ error: "Failed to update blog", details: err.message });
    }
  });

  // DELETE /api/admin/blogs/:id — Delete blog
  app.delete("/api/admin/blogs/:id", authenticateToken, async (req, res) => {
    try {
      await BlogPost.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch { res.status(500).json({ error: "Failed to delete blog" }); }
  });

  // POST /api/admin/blogs/:id/publish — Publish blog (with optional email notification)
  app.post("/api/admin/blogs/:id/publish", authenticateToken, async (req, res) => {
    try {
      const blog = await BlogPost.findByIdAndUpdate(req.params.id, {
        status: "published",
        publishedAt: new Date(),
        updated_at: new Date(),
      }, { new: true }).populate("category", "name slug color");
      if (!blog) return res.status(404).json({ error: "Blog not found" });

      let campaign = null;
      const sendEmail = req.body.sendEmail === true || req.body.sendEmail === "true";
      if (sendEmail) {
        const content = await SiteContent.findOne().sort({ created_at: -1 });
        const domain = content?.site_domain || "https://himsagartravels.com";
        const subscriberCount = await Subscription.countDocuments({ status: { $ne: "unsubscribed" } });
        const queue = await EmailQueue.create({
          blogId: blog._id,
          blogTitle: blog.title,
          blogSlug: blog.slug,
          blogExcerpt: blog.excerpt,
          blogImage: blog.featuredImage,
          totalRecipients: subscriberCount,
        });
        campaign = { ...queue.toObject(), id: queue._id };
        // Fire-and-forget: process queue asynchronously
        const blogObj = blog.toObject();
        setImmediate(() => processEmailQueue(queue._id.toString(), blogObj, domain));
      }
      res.json({ blog: { ...blog.toObject(), id: blog._id }, campaign });
    } catch (err: any) {
      console.error("Error publishing blog:", err);
      res.status(500).json({ error: "Failed to publish blog", details: err.message });
    }
  });

  // POST /api/admin/blogs/:id/unpublish — Unpublish blog
  app.post("/api/admin/blogs/:id/unpublish", authenticateToken, async (req, res) => {
    try {
      const blog = await BlogPost.findByIdAndUpdate(req.params.id, {
        status: "draft", updated_at: new Date()
      }, { new: true });
      if (!blog) return res.status(404).json({ error: "Not found" });
      res.json({ ...blog.toObject(), id: blog._id });
    } catch { res.status(500).json({ error: "Failed to unpublish blog" }); }
  });

  // POST /api/admin/blogs/:id/duplicate — Duplicate blog as draft
  app.post("/api/admin/blogs/:id/duplicate", authenticateToken, async (req, res) => {
    try {
      const original = await BlogPost.findById(req.params.id);
      if (!original) return res.status(404).json({ error: "Not found" });
      const slug = await generateUniqueBlogSlug(`${original.title} copy`);
      const { _id, created_at, publishedAt, views, ...rest } = original.toObject();
      const copy = await BlogPost.create({
        ...rest, slug, status: "draft", title: `${original.title} (Copy)`,
        isFeatured: false, views: 0, updated_at: new Date()
      });
      res.json({ ...copy.toObject(), id: copy._id });
    } catch { res.status(500).json({ error: "Failed to duplicate blog" }); }
  });

  // POST /api/admin/blogs/:id/archive — Archive blog
  app.post("/api/admin/blogs/:id/archive", authenticateToken, async (req, res) => {
    try {
      const blog = await BlogPost.findByIdAndUpdate(req.params.id, {
        status: "archived", updated_at: new Date()
      }, { new: true });
      if (!blog) return res.status(404).json({ error: "Not found" });
      res.json({ ...blog.toObject(), id: blog._id });
    } catch { res.status(500).json({ error: "Failed to archive blog" }); }
  });

  // POST /api/admin/blogs/bulk — Bulk actions
  app.post("/api/admin/blogs/bulk", authenticateToken, async (req, res) => {
    try {
      const { action, ids } = req.body;
      if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "ids required" });
      if (action === "delete") {
        await BlogPost.deleteMany({ _id: { $in: ids } });
      } else if (action === "publish") {
        await BlogPost.updateMany({ _id: { $in: ids } }, { status: "published", publishedAt: new Date() });
      } else if (action === "unpublish") {
        await BlogPost.updateMany({ _id: { $in: ids } }, { status: "draft" });
      } else if (action === "archive") {
        await BlogPost.updateMany({ _id: { $in: ids } }, { status: "archived" });
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
      res.json({ success: true, count: ids.length });
    } catch { res.status(500).json({ error: "Bulk action failed" }); }
  });

  // ─── Blog Category Admin APIs ─────────────────────────────────────────────

  app.get("/api/admin/blog-categories", authenticateToken, async (req, res) => {
    try {
      const cats = await BlogCategory.find({}).sort({ name: 1 });
      const withCounts = await Promise.all(cats.map(async (cat) => {
        const count = await BlogPost.countDocuments({ category: cat._id });
        return { ...cat.toObject(), id: cat._id, postCount: count };
      }));
      res.json(withCounts);
    } catch { res.status(500).json({ error: "Failed to fetch categories" }); }
  });

  app.post("/api/admin/blog-categories", authenticateToken, async (req, res) => {
    try {
      const slug = await generateUniqueCategorySlug(req.body.name);
      const cat = await BlogCategory.create({ name: req.body.name, slug, description: req.body.description, color: req.body.color || "#c29d44" });
      res.json({ ...cat.toObject(), id: cat._id });
    } catch (err: any) { res.status(500).json({ error: "Failed to create category", details: err.message }); }
  });

  app.put("/api/admin/blog-categories/:id", authenticateToken, async (req, res) => {
    try {
      const existing = await BlogCategory.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Not found" });
      const slug = req.body.name !== existing.name
        ? await generateUniqueCategorySlug(req.body.name, req.params.id)
        : existing.slug;
      const cat = await BlogCategory.findByIdAndUpdate(req.params.id, {
        name: req.body.name, slug, description: req.body.description, color: req.body.color
      }, { new: true });
      res.json({ ...cat!.toObject(), id: cat!._id });
    } catch { res.status(500).json({ error: "Failed to update category" }); }
  });

  app.delete("/api/admin/blog-categories/:id", authenticateToken, async (req, res) => {
    try {
      await BlogCategory.findByIdAndDelete(req.params.id);
      // Remove category reference from blogs
      await BlogPost.updateMany({ category: req.params.id }, { $unset: { category: 1 } });
      res.json({ success: true });
    } catch { res.status(500).json({ error: "Failed to delete category" }); }
  });

  // ─── Blog Tag Admin APIs ──────────────────────────────────────────────────

  app.get("/api/admin/blog-tags", authenticateToken, async (req, res) => {
    try {
      const tags = await BlogTag.find({}).sort({ name: 1 });
      res.json(tags.map(t => ({ ...t.toObject(), id: t._id })));
    } catch { res.status(500).json({ error: "Failed to fetch tags" }); }
  });

  app.post("/api/admin/blog-tags", authenticateToken, async (req, res) => {
    try {
      const slug = generateSlug(req.body.name);
      const tag = await BlogTag.create({ name: req.body.name, slug });
      res.json({ ...tag.toObject(), id: tag._id });
    } catch (err: any) { res.status(500).json({ error: "Failed to create tag", details: err.message }); }
  });

  app.delete("/api/admin/blog-tags/:id", authenticateToken, async (req, res) => {
    try {
      await BlogTag.findByIdAndDelete(req.params.id);
      await BlogPost.updateMany({ tags: req.params.id }, { $pull: { tags: req.params.id } });
      res.json({ success: true });
    } catch { res.status(500).json({ error: "Failed to delete tag" }); }
  });

  // ─── Email Campaign Admin APIs ────────────────────────────────────────────

  app.get("/api/admin/email-campaigns", authenticateToken, async (req, res) => {
    try {
      const campaigns = await EmailQueue.find({}).sort({ created_at: -1 }).limit(50);
      res.json(campaigns.map(c => ({ ...c.toObject(), id: c._id })));
    } catch { res.status(500).json({ error: "Failed to fetch campaigns" }); }
  });

  app.get("/api/admin/email-campaigns/stats", authenticateToken, async (req, res) => {
    try {
      const [total, queued, processing, sent, failed, cancelled, subscribers] = await Promise.all([
        EmailQueue.countDocuments(),
        EmailQueue.countDocuments({ status: "queued" }),
        EmailQueue.countDocuments({ status: "processing" }),
        EmailQueue.countDocuments({ status: "sent" }),
        EmailQueue.countDocuments({ status: "failed" }),
        EmailQueue.countDocuments({ status: "cancelled" }),
        Subscription.countDocuments({ status: { $ne: "unsubscribed" } }),
      ]);
      const totalSent = await EmailQueue.aggregate([
        { $group: { _id: null, total: { $sum: "$sentCount" } } }
      ]);
      res.json({ total, queued, processing, sent, failed, cancelled, subscribers, totalEmailsSent: totalSent[0]?.total || 0 });
    } catch { res.status(500).json({ error: "Failed to fetch stats" }); }
  });

  app.get("/api/admin/email-campaigns/:id", authenticateToken, async (req, res) => {
    try {
      const campaign = await EmailQueue.findById(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Not found" });
      res.json({ ...campaign.toObject(), id: campaign._id });
    } catch { res.status(500).json({ error: "Failed to fetch campaign" }); }
  });

  app.post("/api/admin/email-campaigns/:id/retry", authenticateToken, async (req, res) => {
    try {
      const campaign = await EmailQueue.findById(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Not found" });
      if (campaign.status !== "failed" && campaign.status !== "cancelled") {
        return res.status(400).json({ error: "Only failed or cancelled campaigns can be retried" });
      }
      const blog = await BlogPost.findById(campaign.blogId).populate("category", "name slug");
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      await EmailQueue.findByIdAndUpdate(req.params.id, {
        status: "queued", sentCount: 0, failedCount: 0, errorMessage: "", startedAt: null, completedAt: null
      });
      const content = await SiteContent.findOne().sort({ created_at: -1 });
      const domain = content?.site_domain || "https://himsagartravels.com";
      setImmediate(() => processEmailQueue(req.params.id, blog.toObject(), domain));
      res.json({ success: true, message: "Campaign queued for retry" });
    } catch { res.status(500).json({ error: "Failed to retry campaign" }); }
  });

  app.delete("/api/admin/email-campaigns/:id/cancel", authenticateToken, async (req, res) => {
    try {
      const campaign = await EmailQueue.findByIdAndUpdate(req.params.id,
        { status: "cancelled", completedAt: new Date() }, { new: true }
      );
      if (!campaign) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch { res.status(500).json({ error: "Failed to cancel campaign" }); }
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
