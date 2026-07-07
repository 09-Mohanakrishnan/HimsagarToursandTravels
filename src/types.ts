export interface TravelEvent {
  id: string;
  _id?: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  price: string;
  location: string;
  category: string;
  images: string[];
  itinerary?: { day: number; title: string; description: string }[];
  visual_journey?: { image: string; title: string; description: string; location: string }[];
  overview?: string;
  places_covered?: string;
  tour_cost_includes?: string;
  note?: string;
  tour_highlights?: string;
  included?: string;
  excluded?: string;
  included_excluded?: string;
  is_featured: boolean;
  route?: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  _id?: string;
  event_id: string;
  event_title?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'closed';
  created_at: string;
}

export interface SiteContent {
  _id?: string;
  hero_images: string[];
  categories: { title: string; image: string; count: string }[];
  stats: { number: string; label: string }[];
  philosophy: { title: string; desc: string }[];
  essentials: { title: string; desc: string }[];
  destinations: { name: string; country: string; image: string }[];
  testimonials: { name: string; text: string; location: string; image?: string; rating?: number }[];
  instagram_moments: string[];
  instagram_max_posts?: number;
  instagram_filter_keywords?: string;
  instagram_hide_captions?: boolean;

  // Tours
  tours_trust_indicators: { value: string; label: string }[];
  tours_differences: { title: string; desc: string }[];

  // About
  about_heritage_stats: { label: string; value: string }[];
  about_principles: { icon: string; title: string; desc: string }[];
  about_global_stats: { region: string; count: string }[];
  about_team: { name: string; role: string; img: string }[];

  // Contact
  contact_offices: { city: string; desc: string; address: string }[];
  contact_faqs: { q: string; a: string }[];
  site_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  instagram_url?: string;
  email_notifications?: boolean;
  inquiry_alerts?: boolean;
  created_at?: string;
}

export interface Subscription {
  id: string;
  _id?: string;
  email: string;
  name?: string;
  source?: string;
  status?: 'active' | 'unsubscribed';
  lastEmailSent?: string;
  totalEmailsReceived?: number;
  created_at: string;
}

// ─── Blog Types ───────────────────────────────────────────────────────────────

export interface BlogCategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount?: number;
  created_at: string;
}

export interface BlogTag {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogFAQ {
  question: string;
  answer: string;
}

export interface Blog {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;           // Rich HTML from TipTap
  featuredImage?: string;
  gallery?: string[];
  category?: BlogCategory | string;
  tags?: (BlogTag | string)[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  scheduledAt?: string;
  updatedAt?: string;

  // SEO
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  twitterImage?: string;
  customSchema?: string;

  // Relations
  relatedTours?: string[];
  faq?: BlogFAQ[];

  // Meta
  views: number;
  readingTime?: number;
  isFeatured: boolean;

  created_at: string;
}

export type EmailCampaignStatus = 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled';

export interface EmailCampaign {
  id: string;
  _id?: string;
  blogId: string;
  blogTitle: string;
  blogSlug: string;
  blogExcerpt?: string;
  blogImage?: string;
  status: EmailCampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  created_at: string;
}
