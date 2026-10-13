import fs from 'fs';
import path from 'path';
import {
  User,
  Crop,
  Order,
  MarketPrice,
  ApprovedKnowledge,
  Notification,
  Review,
  MarketplaceStats,
} from './types.js';

interface DatabaseSchema {
  users: User[];
  crops: Crop[];
  orders: Order[];
  market_prices: MarketPrice[];
  approved_knowledge: ApprovedKnowledge[];
  notifications: Notification[];
  reviews: Review[];
}

const DB_FILE = path.resolve(process.cwd(), 'data_agroconnect.json');

const INITIAL_USERS: User[] = [
  {
    id: 'farmer-1',
    name: 'Ramesh Patel',
    email: 'ramesh@agroconnect.farm',
    phone: '+91 98480 12345',
    role: 'farmer',
    location: 'Guntur, Andhra Pradesh',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    farmName: 'Patel Natural Agro Farms',
    bio: 'Organic farmer with 18 years experience growing premium grade tomatoes, green chillies, and turmeric.',
    status: 'active',
    created_at: '2024-03-15T08:00:00Z',
  },
  {
    id: 'farmer-2',
    name: 'Sunita Devi',
    email: 'sunita@agroconnect.farm',
    phone: '+91 97120 45678',
    role: 'farmer',
    location: 'Nashik, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    farmName: 'Devi Organic Orchards',
    bio: 'Specialist in export-grade red onions, table grapes, and fresh seasonal vegetables.',
    status: 'active',
    created_at: '2024-04-10T10:30:00Z',
  },
  {
    id: 'farmer-3',
    name: 'Balwinder Singh',
    email: 'balwinder@agroconnect.farm',
    phone: '+91 98140 88990',
    role: 'farmer',
    location: 'Ludhiana, Punjab',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    farmName: 'Golden Grain Fields',
    bio: 'Family farm growing Sharbati wheat, Basmati paddy, and mustard seeds directly to mills and retailers.',
    status: 'active',
    created_at: '2024-02-20T07:15:00Z',
  },
  {
    id: 'farmer-4',
    name: 'Priya Sharma',
    email: 'priya@agroconnect.farm',
    phone: '+91 94190 23456',
    role: 'farmer',
    location: 'Shimla, Himachal Pradesh',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    farmName: 'Himalayan Orchard Crest',
    bio: 'High-altitude Royal Delicious apple and walnut grower practicing natural permaculture.',
    status: 'active',
    created_at: '2024-05-01T09:00:00Z',
  },
  {
    id: 'buyer-1',
    name: 'Aarav Mehta (GreenMart Wholesalers)',
    email: 'aarav@greenmart.in',
    phone: '+91 98200 99887',
    role: 'buyer',
    location: 'Hyderabad, Telangana',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    bio: 'Direct procurement manager for 24 retail supermarkets across South India.',
    status: 'active',
    created_at: '2024-03-20T11:45:00Z',
  },
  {
    id: 'buyer-2',
    name: 'Meera Nambiar (FreshTable Hospitality)',
    email: 'meera@freshtable.com',
    phone: '+91 98450 77665',
    role: 'buyer',
    location: 'Bengaluru, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Executive Chef procuring pesticide-free produce for farm-to-table restaurants.',
    status: 'active',
    created_at: '2024-04-18T14:20:00Z',
  },
  {
    id: 'admin-1',
    name: 'Kavita Rao (Admin)',
    email: 'admin@agroconnect.in',
    phone: '+91 99000 11223',
    role: 'admin',
    location: 'National Operations HQ, New Delhi',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
    bio: 'AgroConnect Platform Chief Administrator & Agriculture Marketplace Moderator.',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const INITIAL_CROPS: Crop[] = [
  {
    id: 'crop-1',
    farmer_id: 'farmer-1',
    farmer_name: 'Ramesh Patel',
    farmer_location: 'Guntur, Andhra Pradesh',
    farmer_rating: 4.9,
    farmer_orders_count: 78,
    name: 'Organic Red Tomatoes (Desi Grade A)',
    category: 'Vegetables',
    quantity: 420,
    original_quantity: 600,
    unit: 'kg',
    price_per_unit: 28,
    location: 'Guntur, Andhra Pradesh',
    harvest_date: '2026-10-10',
    expected_delivery_date: '2026-10-14',
    description: 'Vine-ripened, firm desi hybrid tomatoes grown with zero synthetic fertilizers. High pulp content, ideal for direct retail and culinary puree.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 4.9,
    reviews_count: 24,
    created_at: '2026-09-28T09:00:00Z',
  },
  {
    id: 'crop-2',
    farmer_id: 'farmer-2',
    farmer_name: 'Sunita Devi',
    farmer_location: 'Nashik, Maharashtra',
    farmer_rating: 4.8,
    farmer_orders_count: 64,
    name: 'Nashik Red Onions (Medium-Large Bulb)',
    category: 'Vegetables',
    quantity: 1250,
    original_quantity: 1500,
    unit: 'kg',
    price_per_unit: 34,
    location: 'Nashik, Maharashtra',
    harvest_date: '2026-10-05',
    expected_delivery_date: '2026-10-09',
    description: 'Naturally cured Nashik red onions with thick layers and high pungency. Moisture controlled, 4-month post-harvest shelf life.',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 4.8,
    reviews_count: 19,
    created_at: '2026-09-29T11:00:00Z',
  },
  {
    id: 'crop-3',
    farmer_id: 'farmer-3',
    farmer_name: 'Balwinder Singh',
    farmer_location: 'Ludhiana, Punjab',
    farmer_rating: 5.0,
    farmer_orders_count: 52,
    name: 'Sharbati Golden Wheat (Unpolished)',
    category: 'Grains & Cereals',
    quantity: 3400,
    original_quantity: 4000,
    unit: 'kg',
    price_per_unit: 42,
    location: 'Ludhiana, Punjab',
    harvest_date: '2026-09-25',
    expected_delivery_date: '2026-10-02',
    description: 'Grain-sorted Sharbati wheat, heavy golden kernel with high protein content and soft rotis. Direct from Ludhiana sun-dried silos.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 5.0,
    reviews_count: 16,
    created_at: '2026-09-24T08:30:00Z',
  },
  {
    id: 'crop-4',
    farmer_id: 'farmer-4',
    farmer_name: 'Priya Sharma',
    farmer_location: 'Shimla, Himachal Pradesh',
    farmer_rating: 4.9,
    farmer_orders_count: 41,
    name: 'Kinnaur Crisp Royal Delicious Apples',
    category: 'Fruits',
    quantity: 650,
    original_quantity: 800,
    unit: 'kg',
    price_per_unit: 140,
    location: 'Shimla, Himachal Pradesh',
    harvest_date: '2026-09-30',
    expected_delivery_date: '2026-10-06',
    description: 'Handpicked orchard fresh apples from 7,500 ft elevation. Wax-free, deep red blush, sweet crisp texture packed in corrugated fruit trays.',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 4.9,
    reviews_count: 14,
    created_at: '2026-09-30T10:00:00Z',
  },
  {
    id: 'crop-5',
    farmer_id: 'farmer-1',
    farmer_name: 'Ramesh Patel',
    farmer_location: 'Guntur, Andhra Pradesh',
    farmer_rating: 4.9,
    farmer_orders_count: 78,
    name: 'Guntur Sannam Hot Red Chillies (Sun-Dried)',
    category: 'Spices & Herbs',
    quantity: 320,
    original_quantity: 500,
    unit: 'kg',
    price_per_unit: 210,
    location: 'Guntur, Andhra Pradesh',
    harvest_date: '2026-09-20',
    expected_delivery_date: '2026-09-28',
    description: 'World-renowned Guntur S4 chillies with rich natural capsaicin and deep red coloring. Stalkless, moisture under 10%.',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 4.9,
    reviews_count: 22,
    created_at: '2026-09-22T07:45:00Z',
  },
  {
    id: 'crop-6',
    farmer_id: 'farmer-2',
    farmer_name: 'Sunita Devi',
    farmer_location: 'Nashik, Maharashtra',
    farmer_rating: 4.8,
    farmer_orders_count: 64,
    name: 'Fresh Farm Potatoes (Chandramukhi Variety)',
    category: 'Vegetables',
    quantity: 2100,
    original_quantity: 2500,
    unit: 'kg',
    price_per_unit: 22,
    location: 'Nashik, Maharashtra',
    harvest_date: '2026-10-02',
    expected_delivery_date: '2026-10-07',
    description: 'Medium-sized round tubers with minimal mud and smooth skin. Excellent for boiling, curries, and chip processing.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 4.7,
    reviews_count: 11,
    created_at: '2026-10-01T12:00:00Z',
  },
  {
    id: 'crop-7',
    farmer_id: 'farmer-3',
    farmer_name: 'Balwinder Singh',
    farmer_location: 'Ludhiana, Punjab',
    farmer_rating: 5.0,
    farmer_orders_count: 52,
    name: 'Traditional Basmati Rice 1121 Extra Long',
    category: 'Grains & Cereals',
    quantity: 1800,
    original_quantity: 2000,
    unit: 'kg',
    price_per_unit: 95,
    location: 'Ludhiana, Punjab',
    harvest_date: '2026-09-15',
    expected_delivery_date: '2026-09-22',
    description: 'Aged 1 year for fluffy non-sticky grains with signature aroma. Cooked length expands up to 22mm.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 5.0,
    reviews_count: 28,
    created_at: '2026-09-18T14:10:00Z',
  },
  {
    id: 'crop-8',
    farmer_id: 'farmer-4',
    farmer_name: 'Priya Sharma',
    farmer_location: 'Shimla, Himachal Pradesh',
    farmer_rating: 4.9,
    farmer_orders_count: 41,
    name: 'Organic Wild Forest Honey & Raw Ginger',
    category: 'Spices & Herbs',
    quantity: 140,
    original_quantity: 180,
    unit: 'kg',
    price_per_unit: 180,
    location: 'Shimla, Himachal Pradesh',
    harvest_date: '2026-09-28',
    expected_delivery_date: '2026-10-04',
    description: 'Mountain-grown fiber-rich ginger rhizomes alongside raw multi-flora unpasteurized honey collected by hill community beekeepers.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 4.8,
    reviews_count: 9,
    created_at: '2026-09-29T16:00:00Z',
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    buyer_id: 'buyer-1',
    buyer_name: 'Aarav Mehta (GreenMart Wholesalers)',
    buyer_phone: '+91 98200 99887',
    delivery_address: 'Warehouse 4B, Gachibowli Logistics Park, Hyderabad, Telangana 500032',
    farmer_id: 'farmer-1',
    farmer_name: 'Ramesh Patel',
    crop_id: 'crop-1',
    crop_name: 'Organic Red Tomatoes (Desi Grade A)',
    crop_image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    unit: 'kg',
    quantity: 180,
    price_per_unit: 28,
    total_price: 5040,
    status: 'shipped',
    payment_method: 'Bank Transfer / AgroEscrow',
    created_at: '2026-09-30T10:15:00Z',
    updated_at: '2026-10-01T14:30:00Z',
    timeline: [
      { status: 'pending', timestamp: '2026-09-30T10:15:00Z', note: 'Order placed by GreenMart procurement team.' },
      { status: 'accepted', timestamp: '2026-09-30T11:40:00Z', note: 'Farmer Ramesh Patel accepted the order and confirmed stock.' },
      { status: 'preparing', timestamp: '2026-10-01T08:00:00Z', note: 'Tomatoes harvested, sorted, and packed into 20kg crates.' },
      { status: 'shipped', timestamp: '2026-10-01T14:30:00Z', note: 'Dispatched via AgroExpress Cold Van #AP-07-TA-8921.' },
    ],
  },
  {
    id: 'ord-102',
    buyer_id: 'buyer-2',
    buyer_name: 'Meera Nambiar (FreshTable Hospitality)',
    buyer_phone: '+91 98450 77665',
    delivery_address: '12 Lavelle Road, Central Kitchen, Bengaluru, Karnataka 560001',
    farmer_id: 'farmer-4',
    farmer_name: 'Priya Sharma',
    crop_id: 'crop-4',
    crop_name: 'Kinnaur Crisp Royal Delicious Apples',
    crop_image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
    unit: 'kg',
    quantity: 150,
    price_per_unit: 140,
    total_price: 21000,
    status: 'delivered',
    payment_method: 'UPI / Direct Bank',
    created_at: '2026-09-25T11:00:00Z',
    updated_at: '2026-09-29T16:00:00Z',
    timeline: [
      { status: 'pending', timestamp: '2026-09-25T11:00:00Z', note: 'Order placed.' },
      { status: 'accepted', timestamp: '2026-09-25T13:10:00Z', note: 'Farmer confirmed order availability.' },
      { status: 'preparing', timestamp: '2026-09-26T09:30:00Z', note: 'Packed with fruit foam protective packaging.' },
      { status: 'shipped', timestamp: '2026-09-27T12:00:00Z', note: 'In transit via Shimla-Delhi-Bengaluru express cargo.' },
      { status: 'delivered', timestamp: '2026-09-29T16:00:00Z', note: 'Delivered at central kitchen. Received by Chef Meera.' },
    ],
    review: {
      rating: 5,
      comment: 'Exquisite aroma and crunch. Zero transit bruise. Guests loved our autumn apple tart!',
      created_at: '2026-09-30T09:12:00Z',
    },
  },
  {
    id: 'ord-103',
    buyer_id: 'buyer-1',
    buyer_name: 'Aarav Mehta (GreenMart Wholesalers)',
    buyer_phone: '+91 98200 99887',
    delivery_address: 'Warehouse 4B, Gachibowli Logistics Park, Hyderabad',
    farmer_id: 'farmer-2',
    farmer_name: 'Sunita Devi',
    crop_id: 'crop-2',
    crop_name: 'Nashik Red Onions (Medium-Large Bulb)',
    crop_image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    unit: 'kg',
    quantity: 250,
    price_per_unit: 34,
    total_price: 8500,
    status: 'preparing',
    payment_method: 'AgroEscrow',
    created_at: '2026-10-01T08:30:00Z',
    updated_at: '2026-10-01T11:00:00Z',
    timeline: [
      { status: 'pending', timestamp: '2026-10-01T08:30:00Z', note: 'Order placed.' },
      { status: 'accepted', timestamp: '2026-10-01T09:15:00Z', note: 'Accepted by Sunita Devi.' },
      { status: 'preparing', timestamp: '2026-10-01T11:00:00Z', note: 'Weighing and bagging in 50kg aerated jute sacks.' },
    ],
  },
  {
    id: 'ord-104',
    buyer_id: 'buyer-2',
    buyer_name: 'Meera Nambiar (FreshTable Hospitality)',
    buyer_phone: '+91 98450 77665',
    delivery_address: '12 Lavelle Road, Bengaluru',
    farmer_id: 'farmer-1',
    farmer_name: 'Ramesh Patel',
    crop_id: 'crop-1',
    crop_name: 'Organic Red Tomatoes (Desi Grade A)',
    crop_image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    unit: 'kg',
    quantity: 100,
    price_per_unit: 28,
    total_price: 2800,
    status: 'pending',
    payment_method: 'UPI',
    created_at: '2026-10-02T01:30:00Z',
    updated_at: '2026-10-02T01:30:00Z',
    timeline: [
      { status: 'pending', timestamp: '2026-10-02T01:30:00Z', note: 'Order received. Awaiting farmer confirmation.' },
    ],
  },
  {
    id: 'ord-105',
    buyer_id: 'buyer-1',
    buyer_name: 'Aarav Mehta (GreenMart Wholesalers)',
    buyer_phone: '+91 98200 99887',
    delivery_address: 'Warehouse 4B, Gachibowli Logistics Park, Hyderabad',
    farmer_id: 'farmer-3',
    farmer_name: 'Balwinder Singh',
    crop_id: 'crop-3',
    crop_name: 'Sharbati Golden Wheat (Unpolished)',
    crop_image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    unit: 'kg',
    quantity: 600,
    price_per_unit: 42,
    total_price: 25200,
    status: 'delivered',
    payment_method: 'AgroEscrow',
    created_at: '2026-09-20T10:00:00Z',
    updated_at: '2026-09-25T15:00:00Z',
    timeline: [
      { status: 'pending', timestamp: '2026-09-20T10:00:00Z', note: 'Order initiated.' },
      { status: 'accepted', timestamp: '2026-09-20T11:00:00Z', note: 'Order accepted.' },
      { status: 'preparing', timestamp: '2026-09-21T09:00:00Z', note: 'Loaded onto logistics truck.' },
      { status: 'shipped', timestamp: '2026-09-22T08:00:00Z', note: 'Transit via NH44.' },
      { status: 'delivered', timestamp: '2026-09-25T15:00:00Z', note: 'Delivered at Gachibowli warehouse.' },
    ],
    review: {
      rating: 5,
      comment: 'Top quality Sharbati wheat grains. Moisture content perfect, clean and graded well.',
      created_at: '2026-09-26T10:00:00Z',
    },
  },
];

const INITIAL_MARKET_PRICES: MarketPrice[] = [
  {
    id: 'mp-1',
    crop: 'Tomato',
    category: 'Vegetables',
    average_price: 28,
    min_price: 24,
    max_price: 32,
    price_change_percentage: 5.4,
    unit: 'kg',
    last_updated: '2026-10-02T02:00:00Z',
    demand_level: 'High',
    historical_data: [
      { date: '2026-09-26', price: 25 },
      { date: '2026-09-27', price: 26 },
      { date: '2026-09-28', price: 26 },
      { date: '2026-09-29', price: 27 },
      { date: '2026-09-30', price: 27.5 },
      { date: '2026-10-01', price: 28 },
      { date: '2026-10-02', price: 28 },
    ],
  },
  {
    id: 'mp-2',
    crop: 'Onion',
    category: 'Vegetables',
    average_price: 34,
    min_price: 30,
    max_price: 38,
    price_change_percentage: -2.1,
    unit: 'kg',
    last_updated: '2026-10-02T02:00:00Z',
    demand_level: 'High',
    historical_data: [
      { date: '2026-09-26', price: 36 },
      { date: '2026-09-27', price: 35.5 },
      { date: '2026-09-28', price: 35 },
      { date: '2026-09-29', price: 34.5 },
      { date: '2026-09-30', price: 34 },
      { date: '2026-10-01', price: 34 },
      { date: '2026-10-02', price: 34 },
    ],
  },
  {
    id: 'mp-3',
    crop: 'Wheat',
    category: 'Grains & Cereals',
    average_price: 42,
    min_price: 38,
    max_price: 46,
    price_change_percentage: 2.8,
    unit: 'kg',
    last_updated: '2026-10-02T02:00:00Z',
    demand_level: 'Moderate',
    historical_data: [
      { date: '2026-09-26', price: 40 },
      { date: '2026-09-27', price: 41 },
      { date: '2026-09-28', price: 41 },
      { date: '2026-09-29', price: 41.5 },
      { date: '2026-09-30', price: 42 },
      { date: '2026-10-01', price: 42 },
      { date: '2026-10-02', price: 42 },
    ],
  },
  {
    id: 'mp-4',
    crop: 'Apple',
    category: 'Fruits',
    average_price: 140,
    min_price: 120,
    max_price: 165,
    price_change_percentage: 4.1,
    unit: 'kg',
    last_updated: '2026-10-02T02:00:00Z',
    demand_level: 'High',
    historical_data: [
      { date: '2026-09-26', price: 132 },
      { date: '2026-09-27', price: 135 },
      { date: '2026-09-28', price: 136 },
      { date: '2026-09-29', price: 138 },
      { date: '2026-09-30', price: 139 },
      { date: '2026-10-01', price: 140 },
      { date: '2026-10-02', price: 140 },
    ],
  },
  {
    id: 'mp-5',
    crop: 'Potato',
    category: 'Vegetables',
    average_price: 22,
    min_price: 18,
    max_price: 26,
    price_change_percentage: -1.2,
    unit: 'kg',
    last_updated: '2026-10-02T02:00:00Z',
    demand_level: 'Moderate',
    historical_data: [
      { date: '2026-09-26', price: 23 },
      { date: '2026-09-27', price: 22.5 },
      { date: '2026-09-28', price: 22 },
      { date: '2026-09-29', price: 22 },
      { date: '2026-09-30', price: 22 },
      { date: '2026-10-01', price: 22 },
      { date: '2026-10-02', price: 22 },
    ],
  },
  {
    id: 'mp-6',
    crop: 'Chilli',
    category: 'Spices & Herbs',
    average_price: 210,
    min_price: 190,
    max_price: 235,
    price_change_percentage: 6.8,
    unit: 'kg',
    last_updated: '2026-10-02T02:00:00Z',
    demand_level: 'High',
    historical_data: [
      { date: '2026-09-26', price: 195 },
      { date: '2026-09-27', price: 198 },
      { date: '2026-09-28', price: 202 },
      { date: '2026-09-29', price: 205 },
      { date: '2026-09-30', price: 208 },
      { date: '2026-10-01', price: 210 },
      { date: '2026-10-02', price: 210 },
    ],
  },
  {
    id: 'mp-7',
    crop: 'Basmati Rice',
    category: 'Grains & Cereals',
    average_price: 95,
    min_price: 85,
    max_price: 110,
    price_change_percentage: 1.5,
    unit: 'kg',
    last_updated: '2026-10-02T02:00:00Z',
    demand_level: 'Moderate',
    historical_data: [
      { date: '2026-09-26', price: 92 },
      { date: '2026-09-27', price: 93 },
      { date: '2026-09-28', price: 94 },
      { date: '2026-09-29', price: 94 },
      { date: '2026-09-30', price: 95 },
      { date: '2026-10-01', price: 95 },
      { date: '2026-10-02', price: 95 },
    ],
  },
];

const INITIAL_KNOWLEDGE: ApprovedKnowledge[] = [
  {
    id: 'kb-1',
    crop: 'Tomato',
    topic: 'Disease Identification & Management',
    category: 'Crop Health',
    content: 'Tomato Early Blight (Alternaria solani) and Late Blight (Phytophthora infestans) are primary fungal threats during humid cycles. Symptoms include dark concentric rings on lower leaves (early blight) and dark water-soaked lesions that rapidly brown (late blight). For organic prevention, apply Trichoderma viride or copper hydroxide sprays early morning. Ensure 60cm row spacing for leaf airflow.',
    storage_advice: 'Store harvested tomatoes at 12°C–15°C (55°F–60°F) with 85-90% relative humidity. Never store unripened tomatoes below 10°C as cold temperatures destroy aromatic enzymes and induce chilling injury (mealy texture). Keep stems attached to retard moisture loss.',
    common_diseases: ['Early Blight (Alternaria)', 'Late Blight (Phytophthora)', 'Bacterial Canker', 'Tomato Leaf Curl Virus (transmitted by Whiteflies)'],
    pest_management: 'Install yellow sticky traps (15 per acre) for whitefly and leaf miners. Use Neem oil 1500ppm foliar spray every 10 days.',
    verified_by: 'Indian Council of Agricultural Research (ICAR) & State Horticulture Directorate',
    updated_at: '2026-09-15T00:00:00Z',
  },
  {
    id: 'kb-2',
    crop: 'Onion',
    topic: 'Post-Harvest Curing & Purple Blotch Prevention',
    category: 'Post-Harvest & Storage',
    content: 'Onion neck curing is vital to prevent Botrytis neck rot. Allow sun curing in field rows for 3-5 days covering bulbs with foliage. Bulbs must dry until the neck is tight and roots are wiry. Purple Blotch (Alternaria porri) appears as sunken purple-brown centers on leaves, treatable with Mancozeb or biological Bacillus subtilis.',
    storage_advice: 'Store cured onions in well-ventilated bamboo chawls or slatted wooden crates at ambient 25°C–30°C with 65-70% humidity. Avoid sealed poly bags which create moisture sweating and fungal decay.',
    common_diseases: ['Purple Blotch (Alternaria porri)', 'Neck Rot (Botrytis allii)', 'Basal Rot (Fusarium oxysporum)', 'Onion Smut'],
    pest_management: 'Blue sticky traps and spraying 5% Neem Seed Kernel Extract (NSKE) manages onion thrips effectively.',
    verified_by: 'National Horticulture Research & Development Foundation (NHRDF)',
    updated_at: '2026-09-10T00:00:00Z',
  },
  {
    id: 'kb-3',
    crop: 'Wheat',
    topic: 'Grain Storage & Rust Management',
    category: 'Agronomy & Grain Protection',
    content: 'Yellow rust (Stripe rust) causes yellow pustules in linear rows on leaves during cool conditions. Grow resistant cultivars (HD-2967, PBW-550). Maintain soil moisture with light sprinkler irrigation during earhead emergence and grain filling stages.',
    storage_advice: 'Sun dry harvested wheat grain until moisture drops below 10-12% before bagging. Store in clean hermetic bags or galvanized steel silos. Place dried neem leaves or activated charcoal pouches to deter rice weevils (Sitophilus oryzae).',
    common_diseases: ['Yellow / Stripe Rust (Puccinia striiformis)', 'Karnal Bunt', 'Powdery Mildew', 'Loose Smut'],
    pest_management: 'Hermetic bag sealing deprives stored-grain pests of oxygen naturally without toxic chemical fumigation.',
    verified_by: 'Directorate of Wheat Development, Ministry of Agriculture',
    updated_at: '2026-08-28T00:00:00Z',
  },
  {
    id: 'kb-4',
    crop: 'Apple',
    topic: 'Scab Prevention & Controlled Atmosphere Storage',
    category: 'Orchard Management',
    content: 'Apple scab (Venturia inaequalis) causes olive-green to black velvety spots on leaves and fruit. Prune trees post-harvest to open canopy to sunlight and remove leaf litter. In spring, apply protective biocides before bud-burst.',
    storage_advice: 'Store apples in cold storage at 0°C to 2°C with 90-95% relative humidity. In Controlled Atmosphere (CA) chambers (2% O2, 1% CO2), Royal Delicious apples retain crispness for 7-9 months.',
    common_diseases: ['Apple Scab (Venturia inaequalis)', 'Fire Blight', 'Powdery Mildew', 'Crown Gall'],
    pest_management: 'Pheromone traps for codling moth and horticultural mineral oil sprays against San Jose scale.',
    verified_by: 'Dr. YS Parmar University of Horticulture & Forestry',
    updated_at: '2026-09-01T00:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'farmer-1',
    title: 'New Order Received (#ord-104)',
    message: 'FreshTable Hospitality placed an order for 100 kg Organic Tomatoes (₹2,800).',
    type: 'order',
    read: false,
    created_at: '2026-10-02T01:30:00Z',
    link: '/dashboard',
  },
  {
    id: 'notif-2',
    user_id: 'buyer-1',
    title: 'Order Shipped (#ord-101)',
    message: 'Farmer Ramesh Patel dispatched 180 kg Tomatoes via cold-chain van.',
    type: 'order',
    read: false,
    created_at: '2026-10-01T14:30:00Z',
    link: '/orders',
  },
  {
    id: 'notif-3',
    user_id: 'farmer-1',
    title: 'Market Demand Alert: High',
    message: 'Tomato demand ratio is 1.28x on AgroConnect. Average mandi price rose +5.4% this week.',
    type: 'price',
    read: true,
    created_at: '2026-10-01T09:00:00Z',
    link: '/prices',
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    order_id: 'ord-102',
    crop_id: 'crop-4',
    crop_name: 'Kinnaur Crisp Royal Delicious Apples',
    farmer_id: 'farmer-4',
    buyer_id: 'buyer-2',
    buyer_name: 'Meera Nambiar (FreshTable Hospitality)',
    rating: 5,
    comment: 'Exquisite aroma and crunch. Zero transit bruise. Guests loved our autumn apple tart!',
    created_at: '2026-09-30T09:12:00Z',
  },
  {
    id: 'rev-2',
    order_id: 'ord-105',
    crop_id: 'crop-3',
    crop_name: 'Sharbati Golden Wheat (Unpolished)',
    farmer_id: 'farmer-3',
    buyer_id: 'buyer-1',
    buyer_name: 'Aarav Mehta (GreenMart Wholesalers)',
    rating: 5,
    comment: 'Top quality Sharbati wheat grains. Moisture content perfect, clean and graded well.',
    created_at: '2026-09-26T10:00:00Z',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.crops && parsed.orders) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading db file, falling back to initial seed data', e);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      crops: INITIAL_CROPS,
      orders: INITIAL_ORDERS,
      market_prices: INITIAL_MARKET_PRICES,
      approved_knowledge: INITIAL_KNOWLEDGE,
      notifications: INITIAL_NOTIFICATIONS,
      reviews: INITIAL_REVIEWS,
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed saving to db file', e);
    }
  }

  public resetToSample() {
    this.data = {
      users: [...INITIAL_USERS],
      crops: [...INITIAL_CROPS],
      orders: [...INITIAL_ORDERS],
      market_prices: [...INITIAL_MARKET_PRICES],
      approved_knowledge: [...INITIAL_KNOWLEDGE],
      notifications: [...INITIAL_NOTIFICATIONS],
      reviews: [...INITIAL_REVIEWS],
    };
    this.saveData();
    return this.data;
  }

  // Users
  public getUsers() {
    return this.data.users;
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveData();
      return this.data.users[idx];
    }
    return null;
  }

  // Crops
  public getCrops(filters?: {
    category?: string;
    search?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    farmerId?: string;
    status?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest';
  }) {
    let list = [...this.data.crops];

    if (filters?.farmerId) {
      list = list.filter((c) => c.farmer_id === filters.farmerId);
    } else {
      // By default for buyers, show available crops unless specified
      if (filters?.status) {
        list = list.filter((c) => c.status === filters.status);
      } else {
        list = list.filter((c) => c.status !== 'hidden');
      }
    }

    if (filters?.category && filters.category !== 'All') {
      list = list.filter((c) => c.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.location && filters.location !== 'All') {
      list = list.filter((c) => c.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.farmer_name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter((c) => c.price_per_unit >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      list = list.filter((c) => c.price_per_unit <= filters.maxPrice!);
    }

    if (filters?.sortBy === 'price_asc') {
      list.sort((a, b) => a.price_per_unit - b.price_per_unit);
    } else if (filters?.sortBy === 'price_desc') {
      list.sort((a, b) => b.price_per_unit - a.price_per_unit);
    } else {
      // newest
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }

  public getCropById(id: string) {
    return this.data.crops.find((c) => c.id === id);
  }

  public createCrop(crop: Crop) {
    this.data.crops.unshift(crop);
    this.saveData();
    return crop;
  }

  public updateCrop(id: string, updates: Partial<Crop>) {
    const idx = this.data.crops.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.crops[idx] = { ...this.data.crops[idx], ...updates };
      this.saveData();
      return this.data.crops[idx];
    }
    return null;
  }

  public deleteCrop(id: string) {
    const idx = this.data.crops.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const deleted = this.data.crops.splice(idx, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  // Orders
  public getOrders(filters?: {
    buyerId?: string;
    farmerId?: string;
    status?: string;
  }) {
    let list = [...this.data.orders];
    if (filters?.buyerId) {
      list = list.filter((o) => o.buyer_id === filters.buyerId);
    }
    if (filters?.farmerId) {
      list = list.filter((o) => o.farmer_id === filters.farmerId);
    }
    if (filters?.status && filters.status !== 'All') {
      list = list.filter((o) => o.status === filters.status);
    }
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }

  public getOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id);
  }

  public createOrder(order: Order) {
    this.data.orders.unshift(order);
    
    // Decrement stock from crop
    const crop = this.getCropById(order.crop_id);
    if (crop) {
      const newQty = Math.max(0, crop.quantity - order.quantity);
      this.updateCrop(crop.id, {
        quantity: newQty,
        status: newQty === 0 ? 'sold' : crop.status,
      });
    }

    // Add notification to farmer
    this.createNotification({
      id: `notif-${Date.now()}`,
      user_id: order.farmer_id,
      title: `New Order Received (${order.id})`,
      message: `${order.buyer_name} ordered ${order.quantity} ${order.unit} of ${order.crop_name} (₹${order.total_price.toLocaleString('en-IN')}).`,
      type: 'order',
      read: false,
      created_at: new Date().toISOString(),
      link: '/dashboard',
    });

    this.saveData();
    return order;
  }

  public updateOrderStatus(id: string, newStatus: Order['status'], note?: string) {
    const order = this.getOrderById(id);
    if (!order) return null;

    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    order.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}.`,
    });

    // Notify buyer
    this.createNotification({
      id: `notif-${Date.now()}`,
      user_id: order.buyer_id,
      title: `Order #${order.id} ${newStatus.toUpperCase()}`,
      message: `Your order for ${order.crop_name} is now ${newStatus}. ${note || ''}`,
      type: 'order',
      read: false,
      created_at: new Date().toISOString(),
      link: '/orders',
    });

    // If order was cancelled or rejected, restore inventory
    if (newStatus === 'cancelled' || newStatus === 'rejected') {
      const crop = this.getCropById(order.crop_id);
      if (crop) {
        this.updateCrop(crop.id, {
          quantity: crop.quantity + order.quantity,
          status: 'available',
        });
      }
    }

    this.saveData();
    return order;
  }

  public addOrderReview(orderId: string, rating: number, comment: string) {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const reviewObj = {
      rating,
      comment,
      created_at: new Date().toISOString(),
    };
    order.review = reviewObj;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      order_id: order.id,
      crop_id: order.crop_id,
      crop_name: order.crop_name,
      farmer_id: order.farmer_id,
      buyer_id: order.buyer_id,
      buyer_name: order.buyer_name,
      rating,
      comment,
      created_at: new Date().toISOString(),
    };
    this.data.reviews.unshift(newRev);

    // Update farmer average rating
    const farmerReviews = this.data.reviews.filter((r) => r.farmer_id === order.farmer_id);
    const avg = farmerReviews.reduce((sum, r) => sum + r.rating, 0) / farmerReviews.length;
    
    // Update crops of that farmer
    this.data.crops
      .filter((c) => c.farmer_id === order.farmer_id)
      .forEach((c) => {
        c.farmer_rating = Number(avg.toFixed(1));
      });

    this.saveData();
    return order;
  }

  // Market Prices & Statistics
  public getMarketPrices() {
    return this.data.market_prices;
  }

  public getMarketPriceForCrop(cropName: string) {
    const lower = cropName.toLowerCase();
    return (
      this.data.market_prices.find((mp) => mp.crop.toLowerCase().includes(lower)) ||
      this.data.market_prices[0]
    );
  }

  public updateMarketPrice(id: string, updates: Partial<MarketPrice>) {
    const idx = this.data.market_prices.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.market_prices[idx] = { ...this.data.market_prices[idx], ...updates, last_updated: new Date().toISOString() };
      this.saveData();
      return this.data.market_prices[idx];
    }
    return null;
  }

  // Approved Knowledge
  public getApprovedKnowledge(cropName?: string) {
    if (!cropName) return this.data.approved_knowledge;
    const lower = cropName.toLowerCase();
    return this.data.approved_knowledge.filter((k) => k.crop.toLowerCase().includes(lower));
  }

  public createApprovedKnowledge(knowledge: ApprovedKnowledge) {
    this.data.approved_knowledge.push(knowledge);
    this.saveData();
    return knowledge;
  }

  public updateApprovedKnowledge(id: string, updates: Partial<ApprovedKnowledge>) {
    const idx = this.data.approved_knowledge.findIndex((k) => k.id === id);
    if (idx !== -1) {
      this.data.approved_knowledge[idx] = { ...this.data.approved_knowledge[idx], ...updates, updated_at: new Date().toISOString() };
      this.saveData();
      return this.data.approved_knowledge[idx];
    }
    return null;
  }

  public deleteApprovedKnowledge(id: string) {
    const idx = this.data.approved_knowledge.findIndex((k) => k.id === id);
    if (idx !== -1) {
      const removed = this.data.approved_knowledge.splice(idx, 1)[0];
      this.saveData();
      return removed;
    }
    return null;
  }

  // Notifications
  public getNotifications(userId: string) {
    return this.data.notifications.filter((n) => n.user_id === userId);
  }

  public markNotificationAsRead(id: string) {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.saveData();
      return n;
    }
    return null;
  }

  public createNotification(notif: Notification) {
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  // Reviews
  public getReviews(farmerId?: string, cropId?: string) {
    let list = [...this.data.reviews];
    if (farmerId) {
      list = list.filter((r) => r.farmer_id === farmerId);
    }
    if (cropId) {
      list = list.filter((r) => r.crop_id === cropId);
    }
    return list;
  }

  // Marketplace Stats & Demand Calculator
  public getMarketplaceStats(): MarketplaceStats {
    const totalFarmers = this.data.users.filter((u) => u.role === 'farmer').length;
    const totalBuyers = this.data.users.filter((u) => u.role === 'buyer').length;
    const totalCropsListed = this.data.crops.length;
    const totalActiveListings = this.data.crops.filter((c) => c.status === 'available').length;
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
      .reduce((sum, o) => sum + o.total_price, 0);
    const totalVolumeKg = this.data.orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
      .reduce((sum, o) => sum + o.quantity, 0);

    return {
      total_farmers: totalFarmers,
      total_buyers: totalBuyers,
      total_crops_listed: totalCropsListed,
      total_active_listings: totalActiveListings,
      total_orders: totalOrders,
      total_volume_kg: totalVolumeKg,
      total_revenue: totalRevenue,
      average_discount_percentage: 18.5, // Direct farmer saving vs middleman APMC margin
    };
  }

  // Demand Indicator Calculation (Section 16 requirement)
  public calculateCropDemand(cropName: string) {
    const lower = cropName.toLowerCase();
    const matchingCrops = this.data.crops.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower)
    );
    const matchingOrders = this.data.orders.filter((o) => o.crop_name.toLowerCase().includes(lower));

    const activeListings = matchingCrops.filter((c) => c.status === 'available').length;
    const availableQuantity = matchingCrops
      .filter((c) => c.status === 'available')
      .reduce((sum, c) => sum + c.quantity, 0);

    const recentOrdersCount = matchingOrders.length;
    const recentRequestedQuantity = matchingOrders.reduce((sum, o) => sum + o.quantity, 0);
    const soldQuantity = matchingOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.quantity, 0);

    const avgPrice =
      matchingCrops.length > 0
        ? Math.round(
            matchingCrops.reduce((sum, c) => sum + c.price_per_unit, 0) / matchingCrops.length
          )
        : 28;

    // Demand ratio = Recent Requested Quantity / (Available Quantity + 1)
    const demandRatio =
      availableQuantity > 0 ? Number((recentRequestedQuantity / availableQuantity).toFixed(2)) : 1.5;

    let demandIndicator: 'Low' | 'Moderate' | 'High' = 'Moderate';
    let reason = '';

    if (demandRatio > 0.8 || recentOrdersCount >= 4) {
      demandIndicator = 'High';
      reason = `Recent requested quantity (${recentRequestedQuantity.toLocaleString()} kg) is high relative to available inventory (${availableQuantity.toLocaleString()} kg). Buyer inquiries and order frequencies are elevated.`;
    } else if (demandRatio >= 0.3) {
      demandIndicator = 'Moderate';
      reason = `Healthy balance between active listings (${activeListings}) and ongoing order intake (${recentOrdersCount} orders). Supply matches steady retail demand.`;
    } else {
      demandIndicator = 'Low';
      reason = `Ample supply currently available with moderate order velocity. Good window for bulk buying.`;
    }

    return {
      crop_name: cropName,
      active_listings: activeListings,
      available_quantity: availableQuantity,
      recent_orders: recentOrdersCount,
      requested_quantity: recentRequestedQuantity,
      sold_quantity: soldQuantity,
      average_price: avgPrice,
      demand_ratio: demandRatio,
      demand_indicator: demandIndicator,
      reason,
      disclaimer: 'Marketplace-derived indicator based on active listings and orders on AgroConnect, not an official governmental market forecast.',
    };
  }

  // Farmer summary for AI assistant
  public getFarmerSummary(farmerId: string) {
    const farmer = this.getUserById(farmerId);
    const crops = this.data.crops.filter((c) => c.farmer_id === farmerId);
    const orders = this.data.orders.filter((o) => o.farmer_id === farmerId);

    const activeListings = crops.filter((c) => c.status === 'available');
    const soldCrops = crops.filter((c) => c.status === 'sold');
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    const completedOrders = orders.filter((o) => o.status === 'delivered');
    const totalSales = orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
      .reduce((sum, o) => sum + o.total_price, 0);
    const totalStock = activeListings.reduce((sum, c) => sum + c.quantity, 0);
    const totalVolumeSold = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.quantity, 0);

    return {
      farmer_id: farmerId,
      farmer_name: farmer?.name || 'Farmer',
      farm_name: farmer?.farmName || '',
      location: farmer?.location || '',
      total_crops: crops.length,
      active_listings: activeListings.length,
      sold_listings: soldCrops.length,
      pending_orders: pendingOrders.length,
      completed_orders: completedOrders.length,
      total_sales: totalSales,
      total_stock: totalStock,
      total_volume_sold: totalVolumeSold,
      active_crops: activeListings.map((c) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        unit: c.unit,
        price: c.price_per_unit,
      })),
      recent_orders: orders.slice(0, 5).map((o) => ({
        id: o.id,
        buyer_name: o.buyer_name,
        crop: o.crop_name,
        quantity: `${o.quantity} ${o.unit}`,
        amount: o.total_price,
        status: o.status,
        date: o.created_at,
      })),
    };
  }
}

export const db = new Database();
