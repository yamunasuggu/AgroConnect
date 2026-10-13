import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { processAssistantMessage } from './server/aiService.js';
import {
  fetchLiveAgriculturalWeather,
  getLiveMandiPricesWithRealTimeSync,
  searchIndiaLocations,
  getPlaceWeather,
  getAllIndiaStateCommodityPrices,
  detectCropDiseaseAI,
  recommendCropsAI,
} from './server/realtimeService.js';
import { User, Crop, Order, OrderStatus } from './server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  let user = db.getUserByEmail(email);

  // If user doesn't exist, create automatically or use matching demo role user
  if (!user) {
    const roleUsers = db.getUsers().filter((u) => u.role === (role || 'farmer'));
    user = roleUsers[0] || db.getUsers()[0];
  }

  // Token mock payload (stateless base64 token)
  const token = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64');

  return res.json({
    token,
    user,
    message: `Logged in successfully as ${user.name} (${user.role.toUpperCase()}).`,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, role, location, farmName, bio } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists.' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone: phone || '+91 98000 00000',
    role,
    location: location || 'India',
    farmName: farmName || (role === 'farmer' ? `${name}'s Farm` : undefined),
    bio: bio || `${role === 'farmer' ? 'Verified farmer' : 'Marketplace buyer'} on AgroConnect.`,
    avatar:
      role === 'farmer'
        ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  db.createUser(newUser);

  const token = Buffer.from(
    JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64');

  return res.status(201).json({
    token,
    user: newUser,
    message: 'Registration successful! Welcome to AgroConnect.',
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided.' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

app.get('/api/users/farmers/:id', (req: Request, res: Response) => {
  const farmer = db.getUserById(req.params.id);
  if (!farmer || farmer.role !== 'farmer') {
    return res.status(404).json({ error: 'Farmer profile not found.' });
  }
  const crops = db.getCrops({ farmerId: farmer.id });
  const reviews = db.getReviews(farmer.id);
  const orders = db.getOrders({ farmerId: farmer.id });
  
  return res.json({
    farmer,
    active_crops: crops.filter((c) => c.status === 'available'),
    total_crops_count: crops.length,
    total_orders_count: orders.length,
    reviews,
  });
});

// ==========================================
// 2. CROPS & MARKETPLACE
// ==========================================

app.get('/api/crops', (req: Request, res: Response) => {
  const { category, search, location, minPrice, maxPrice, farmerId, status, sortBy } = req.query;

  const crops = db.getCrops({
    category: category as string,
    search: search as string,
    location: location as string,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    farmerId: farmerId as string,
    status: status as string,
    sortBy: sortBy as any,
  });

  return res.json({ crops, total: crops.length });
});

app.get('/api/crops/:id', (req: Request, res: Response) => {
  const crop = db.getCropById(req.params.id);
  if (!crop) {
    return res.status(404).json({ error: 'Crop listing not found.' });
  }
  const farmer = db.getUserById(crop.farmer_id);
  const reviews = db.getReviews(crop.farmer_id, crop.id);

  return res.json({ crop, farmer, reviews });
});

app.post('/api/crops', (req: Request, res: Response) => {
  const {
    farmer_id,
    name,
    category,
    quantity,
    unit,
    price_per_unit,
    location,
    harvest_date,
    expected_delivery_date,
    description,
    image,
  } = req.body;

  if (!farmer_id || !name || !category || !quantity || !price_per_unit) {
    return res.status(400).json({ error: 'Missing mandatory crop fields.' });
  }

  const farmer = db.getUserById(farmer_id);

  const newCrop: Crop = {
    id: `crop-${Date.now()}`,
    farmer_id,
    farmer_name: farmer?.name || 'Farmer',
    farmer_location: location || farmer?.location || 'Guntur, Andhra Pradesh',
    farmer_rating: 4.9,
    farmer_orders_count: 1,
    name,
    category,
    quantity: Number(quantity),
    original_quantity: Number(quantity),
    unit: unit || 'kg',
    price_per_unit: Number(price_per_unit),
    location: location || farmer?.location || 'Guntur, Andhra Pradesh',
    harvest_date: harvest_date || new Date().toISOString().split('T')[0],
    expected_delivery_date,
    description: description || `Fresh harvested ${name} directly from ${farmer?.farmName || 'our farm'}.`,
    image:
      image ||
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    status: 'available',
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
  };

  db.createCrop(newCrop);
  return res.status(201).json({ crop: newCrop, message: 'Crop listing created successfully!' });
});

app.put('/api/crops/:id', (req: Request, res: Response) => {
  const updated = db.updateCrop(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Crop listing not found.' });
  }
  return res.json({ crop: updated, message: 'Crop updated successfully.' });
});

app.delete('/api/crops/:id', (req: Request, res: Response) => {
  const deleted = db.deleteCrop(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Crop listing not found.' });
  }
  return res.json({ message: 'Crop listing removed successfully.', crop: deleted });
});

app.patch('/api/crops/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !['available', 'sold', 'hidden'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const updated = db.updateCrop(req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Crop not found.' });
  }
  return res.json({ crop: updated });
});

// ==========================================
// 3. ORDERS & TRACKING
// ==========================================

app.get('/api/orders', (req: Request, res: Response) => {
  const { buyerId, farmerId, status } = req.query;
  const orders = db.getOrders({
    buyerId: buyerId as string,
    farmerId: farmerId as string,
    status: status as string,
  });
  return res.json({ orders, total: orders.length });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  return res.json({ order });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { buyer_id, crop_id, quantity, delivery_address, buyer_phone, payment_method } = req.body;

  if (!buyer_id || !crop_id || !quantity || !delivery_address) {
    return res.status(400).json({ error: 'Required fields missing for order placement.' });
  }

  const crop = db.getCropById(crop_id);
  if (!crop) {
    return res.status(404).json({ error: 'Crop not found.' });
  }

  if (crop.quantity < Number(quantity)) {
    return res.status(400).json({
      error: `Insufficient stock. Only ${crop.quantity} ${crop.unit} available for this crop.`,
    });
  }

  const buyer = db.getUserById(buyer_id);
  const orderQuantity = Number(quantity);
  const totalPrice = orderQuantity * crop.price_per_unit;

  const newOrder: Order = {
    id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
    buyer_id,
    buyer_name: buyer?.name || 'Buyer',
    buyer_phone: buyer_phone || buyer?.phone || '+91 98000 00000',
    delivery_address,
    farmer_id: crop.farmer_id,
    farmer_name: crop.farmer_name,
    crop_id: crop.id,
    crop_name: crop.name,
    crop_image: crop.image,
    unit: crop.unit,
    quantity: orderQuantity,
    price_per_unit: crop.price_per_unit,
    total_price: totalPrice,
    status: 'pending',
    payment_method: payment_method || 'AgroEscrow / Bank Transfer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    timeline: [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        note: `Order placed by ${buyer?.name || 'Buyer'} for ${orderQuantity} ${crop.unit}.`,
      },
    ],
  };

  db.createOrder(newOrder);

  return res.status(201).json({
    order: newOrder,
    message: 'Order placed successfully! The farmer has been notified.',
  });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  const validStatuses: OrderStatus[] = [
    'pending',
    'accepted',
    'preparing',
    'shipped',
    'delivered',
    'cancelled',
    'rejected',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status specified.' });
  }

  const updated = db.updateOrderStatus(req.params.id, status, note);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  return res.json({ order: updated, message: `Order status updated to ${status}.` });
});

app.post('/api/orders/:id/review', (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
  }

  const updated = db.addOrderReview(req.params.id, Number(rating), comment || 'Great farm-fresh produce!');
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  return res.json({ order: updated, message: 'Review submitted successfully! Thank you for rating the farmer.' });
});

// ==========================================
// 4. MARKET PRICES & REAL-TIME AGRI FEEDS
// ==========================================

app.get('/api/realtime/india-weather/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const results = await searchIndiaLocations(q);
    return res.json({ results });
  } catch (err: any) {
    return res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

app.get('/api/realtime/india-weather/place', async (req: Request, res: Response) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const name = (req.query.name as string) || 'Location';
    const state = (req.query.state as string) || 'India';

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
    }

    const weather = await getPlaceWeather(lat, lon, name, state);
    return res.json({ weather });
  } catch (err: any) {
    return res.status(500).json({ error: 'Weather lookup failed', details: err.message });
  }
});

app.get('/api/realtime/state-prices', (req: Request, res: Response) => {
  const { state, category } = req.query;
  const data = getAllIndiaStateCommodityPrices(state as string, category as string);
  return res.json(data);
});

app.get('/api/prices/live', async (req: Request, res: Response) => {
  try {
    const liveData = await getLiveMandiPricesWithRealTimeSync();
    return res.json(liveData);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch live prices', details: err.message });
  }
});

app.get('/api/realtime/weather', async (req: Request, res: Response) => {
  try {
    const weather = await fetchLiveAgriculturalWeather();
    return res.json({
      weather,
      api_source: 'Open-Meteo High-Resolution Global Weather API',
      last_updated: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch agricultural weather', details: err.message });
  }
});

app.get('/api/prices', async (req: Request, res: Response) => {
  try {
    const liveData = await getLiveMandiPricesWithRealTimeSync();
    return res.json({
      prices: liveData.prices,
      live_weather: liveData.live_weather,
      disclaimer: 'Live synchronized commodity prices & Open-Meteo agricultural climate advisory.',
      api_source: liveData.api_source,
      last_synced: liveData.last_synced,
    });
  } catch {
    const prices = db.getMarketPrices();
    return res.json({
      prices,
      disclaimer: 'Marketplace-listed price data & verified mandi benchmarks.',
    });
  }
});

app.get('/api/prices/:crop', (req: Request, res: Response) => {
  const cropPrice = db.getMarketPriceForCrop(req.params.crop);
  return res.json({ price: cropPrice });
});

app.get('/api/marketplace/stats', (req: Request, res: Response) => {
  const stats = db.getMarketplaceStats();
  return res.json({ stats });
});

// ==========================================
// 5. AI FARMER ASSISTANT
// ==========================================

app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, farmerId, contextCrop, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const assistantResult = await processAssistantMessage({
      message,
      farmerId,
      contextCrop,
      language,
    });

    return res.json(assistantResult);
  } catch (err: any) {
    console.error('Assistant error:', err);
    return res.status(500).json({
      error: 'Failed to process AI assistant inquiry.',
      details: err.message,
    });
  }
});

app.post('/api/assistant/disease-detect', async (req: Request, res: Response) => {
  try {
    const { crop, symptoms, imageBase64, language } = req.body;
    if (!symptoms && !imageBase64) {
      return res.status(400).json({ error: 'Please describe symptoms or upload a photo of the plant leaf.' });
    }

    const diagnosis = await detectCropDiseaseAI(
      crop || 'Plant',
      symptoms || 'Visual leaf inspection from uploaded plant photo',
      imageBase64,
      language
    );
    return res.json(diagnosis);
  } catch (err: any) {
    console.error('Disease detection error:', err);
    return res.status(500).json({ error: 'Diagnosis failed', details: err.message });
  }
});

app.post('/api/assistant/crop-recommend', async (req: Request, res: Response) => {
  try {
    const { location, soilType, waterAvailability, lat, lon, language } = req.body;
    if (!location || !soilType || !waterAvailability) {
      return res.status(400).json({ error: 'Location, soilType, and waterAvailability are required.' });
    }

    let weatherData: any = null;
    if (lat && lon) {
      weatherData = await getPlaceWeather(Number(lat), Number(lon), location);
    } else {
      const searchRes = await searchIndiaLocations(location);
      if (searchRes.length > 0) {
        weatherData = await getPlaceWeather(searchRes[0].latitude, searchRes[0].longitude, location, searchRes[0].state);
      } else {
        weatherData = await getPlaceWeather(16.3, 80.4, location);
      }
    }

    const recommendations = await recommendCropsAI(
      location,
      weatherData,
      soilType,
      waterAvailability,
      language
    );

    return res.json(recommendations);
  } catch (err: any) {
    console.error('Crop recommendation error:', err);
    return res.status(500).json({ error: 'Crop recommendation failed', details: err.message });
  }
});

app.get('/api/assistant/market-demand/:crop_name', (req: Request, res: Response) => {
  const demand = db.calculateCropDemand(req.params.crop_name);
  return res.json(demand);
});

app.get('/api/assistant/market-price/:crop_name', (req: Request, res: Response) => {
  const price = db.getMarketPriceForCrop(req.params.crop_name);
  return res.json(price);
});

app.get('/api/assistant/popular-crops', (req: Request, res: Response) => {
  const prices = db.getMarketPrices();
  const highDemand = prices.filter((p) => p.demand_level === 'High');
  return res.json({
    popular_crops: highDemand,
    demand_summary: 'High buyer ordering velocity observed across tomatoes, onions, apples, and chillies.',
  });
});

app.get('/api/assistant/farmer-summary/:farmer_id', (req: Request, res: Response) => {
  const summary = db.getFarmerSummary(req.params.farmer_id);
  return res.json(summary);
});

// ==========================================
// 6. ADMIN & KNOWLEDGE BASE
// ==========================================

app.get('/api/admin/users', (req: Request, res: Response) => {
  const users = db.getUsers();
  return res.json({ users });
});

app.patch('/api/admin/users/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or suspended.' });
  }
  const user = db.updateUser(req.params.id, { status });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  return res.json({ user, message: `User status changed to ${status}.` });
});

app.get('/api/admin/knowledge', (req: Request, res: Response) => {
  const kb = db.getApprovedKnowledge();
  return res.json({ knowledge: kb });
});

app.post('/api/admin/knowledge', (req: Request, res: Response) => {
  const { crop, topic, category, content, storage_advice, common_diseases, pest_management, verified_by } = req.body;
  if (!crop || !topic || !content) {
    return res.status(400).json({ error: 'Crop, topic, and content are required.' });
  }

  const newEntry = db.createApprovedKnowledge({
    id: `kb-${Date.now()}`,
    crop,
    topic,
    category: category || 'Agronomy',
    content,
    storage_advice: storage_advice || 'Ensure cool, dry ventilation.',
    common_diseases: Array.isArray(common_diseases) ? common_diseases : [common_diseases || 'Standard fungal blights'],
    pest_management: pest_management || 'Use IPM and biological controls.',
    verified_by: verified_by || 'AgroConnect Agricultural Moderator Team',
    updated_at: new Date().toISOString(),
  });

  return res.status(201).json({ knowledge: newEntry, message: 'Approved knowledge entry created.' });
});

app.put('/api/admin/knowledge/:id', (req: Request, res: Response) => {
  const updated = db.updateApprovedKnowledge(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Knowledge record not found.' });
  return res.json({ knowledge: updated, message: 'Knowledge record updated.' });
});

app.delete('/api/admin/knowledge/:id', (req: Request, res: Response) => {
  const removed = db.deleteApprovedKnowledge(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Knowledge record not found.' });
  return res.json({ message: 'Knowledge record deleted.', removed });
});

app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const stats = db.getMarketplaceStats();
  const crops = db.getCrops();
  const orders = db.getOrders();
  const users = db.getUsers();

  const locationsMap: Record<string, number> = {};
  crops.forEach((c) => {
    locationsMap[c.location] = (locationsMap[c.location] || 0) + 1;
  });

  const categoryMap: Record<string, number> = {};
  crops.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });

  return res.json({
    stats,
    top_locations: Object.entries(locationsMap).map(([loc, count]) => ({ location: loc, listings: count })),
    categories_distribution: Object.entries(categoryMap).map(([cat, count]) => ({ category: cat, count })),
    recent_transactions: orders.slice(0, 10),
  });
});

app.post('/api/admin/reset-data', (req: Request, res: Response) => {
  const reset = db.resetToSample();
  return res.json({ message: 'AgroConnect sample database restored.', data: reset });
});

// ==========================================
// 7. NOTIFICATIONS
// ==========================================

app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const notifs = db.getNotifications(userId);
  return res.json({ notifications: notifs });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const updated = db.markNotificationAsRead(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  return res.json({ notification: updated });
});

// ==========================================
// VITE INTEGRATION / SPA SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`🌾 AgroConnect Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
