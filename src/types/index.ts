export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  avatar?: string;
  farmName?: string;
  bio?: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export type CropCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Grains & Cereals'
  | 'Pulses & Legumes'
  | 'Spices & Herbs'
  | 'Oilseeds'
  | 'Dairy & Organic';

export interface Crop {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_location: string;
  farmer_rating: number;
  farmer_orders_count: number;
  name: string;
  category: CropCategory;
  quantity: number;
  original_quantity: number;
  unit: string;
  price_per_unit: number;
  location: string;
  harvest_date: string;
  expected_delivery_date?: string;
  description: string;
  image: string;
  status: 'available' | 'sold' | 'hidden';
  rating: number;
  reviews_count: number;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  delivery_address: string;
  farmer_id: string;
  farmer_name: string;
  crop_id: string;
  crop_name: string;
  crop_image: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
  updated_at: string;
  timeline: OrderTimelineItem[];
  review?: {
    rating: number;
    comment: string;
    created_at: string;
  };
}

export interface MarketPrice {
  id: string;
  crop: string;
  category: CropCategory;
  average_price: number;
  min_price: number;
  max_price: number;
  price_change_percentage: number;
  unit: string;
  last_updated: string;
  demand_level: 'Low' | 'Moderate' | 'High';
  historical_data: { date: string; price: number }[];
}

export interface ApprovedKnowledge {
  id: string;
  crop: string;
  topic: string;
  category: string;
  content: string;
  storage_advice: string;
  common_diseases: string[];
  pest_management: string;
  verified_by: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'price' | 'system' | 'crop';
  read: boolean;
  created_at: string;
  link?: string;
}

export interface Review {
  id: string;
  order_id: string;
  crop_id: string;
  crop_name: string;
  farmer_id: string;
  buyer_id: string;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface MarketplaceStats {
  total_farmers: number;
  total_buyers: number;
  total_crops_listed: number;
  total_active_listings: number;
  total_orders: number;
  total_volume_kg: number;
  total_revenue: number;
  average_discount_percentage: number;
}
