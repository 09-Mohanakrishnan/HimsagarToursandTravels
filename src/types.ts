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
