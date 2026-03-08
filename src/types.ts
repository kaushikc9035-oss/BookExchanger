export interface User {
  id: number;
  email: string;
  name: string;
  location?: string;
  avatar?: string;
  trust_score: number;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Book {
  id: number;
  owner_id: number;
  owner_name?: string;
  owner_avatar?: string;
  owner_trust?: number;
  title: string;
  author: string;
  category: string;
  condition: string;
  description: string;
  image_url: string;
  availability: 'borrow' | 'trade' | 'both';
  status: 'available' | 'borrowed' | 'traded' | 'unavailable';
  city: string;
  created_at: string;
}

export interface Request {
  id: number;
  book_id: number;
  book_title?: string;
  requester_id: number;
  requester_name?: string;
  owner_id: number;
  owner_name?: string;
  type: 'borrow' | 'trade';
  trade_book_id?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  return_date?: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  user_id: number;
  content: string;
  type: string;
  read: number;
  created_at: string;
}
