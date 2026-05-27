export interface TravelEvent {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  price: string;
  location: string;
  category: string;
  images: string[];
  itinerary?: { day: number; title: string; description: string }[];
  visual_journey?: { image: string; title: string; description: string; location: string }[];
  is_featured: boolean;
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
  testimonials: { name: string; text: string; location: string }[];
  instagram_moments: string[];

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
  created_at: string;
}
