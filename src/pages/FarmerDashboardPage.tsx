import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Crop, Order, MarketPrice } from '../types';
import { api } from '../services/api';
import { DemandBadge } from '../components/DemandBadge';
import {
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  Bot,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Truck,
  Sparkles,
} from 'lucide-react';

interface FarmerDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectCrop: (crop: Crop) => void;
}

export const FarmerDashboardPage: React.FC<FarmerDashboardPageProps> = ({
  onNavigate,
  onSelectCrop,
}) => {
  const { user } = useAuth();
  const { currentOption, t, translateCrop, translateCategory } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  // Edit Crop Modal state
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [cropsRes, ordersRes, pricesRes] = await Promise.all([
        api.getCrops({ farmerId: user.id }),
        api.getOrders({ farmerId: user.id }),
        api.getMarketPrices(),
      ]);

      setCrops(cropsRes.crops || []);
      setOrders(ordersRes.orders || []);
      setMarketPrices(pricesRes.prices || []);
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeListings = crops.filter((c) => c.status === 'available');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const totalSales = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
    .reduce((sum, o) => sum + o.total_price, 0);
  const availableStock = activeListings.reduce((sum, c) => sum + c.quantity, 0);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, note?: string) => {
    try {
      setStatusUpdating(orderId);
      await api.updateOrderStatus(orderId, newStatus, note);
      setDashboardNotice(`Order #${orderId} status updated to ${newStatus}.`);
      await loadDashboardData();
    } catch (err: any) {
      setDashboardNotice(err.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleMarkSold = async (cropId: string) => {
    try {
      await api.updateCropStatus(cropId, 'sold');
      setDashboardNotice('Crop listing marked as Sold Out.');
      await loadDashboardData();
    } catch (e: any) {
      setDashboardNotice(e.message);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    try {
      await api.deleteCrop(cropId);
      setDashboardNotice('Crop listing removed.');
      await loadDashboardData();
    } catch (e: any) {
      setDashboardNotice(e.message);
    }
  };

  const handleSaveCropEdit = async () => {
    if (!editingCrop) return;
    try {
      await api.updateCrop(editingCrop.id, {
        quantity: editQty,
        price_per_unit: editPrice,
        status: editQty > 0 ? 'available' : 'sold',
      });
      setEditingCrop(null);
      setDashboardNotice('Crop listing updated successfully.');
      await loadDashboardData();
    } catch (e: any) {
      setDashboardNotice(e.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Aggregating farm inventory & order logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {dashboardNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{dashboardNotice}</span>
          </div>
          <button onClick={() => setDashboardNotice(null)} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Welcome & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {t('nav.dashboard')}
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-xs text-stone-600">{user?.farmName || 'Patel Natural Farms'}</span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-xs font-semibold text-emerald-700">{currentOption.flag} {currentOption.nativeName}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading mt-1">
            Welcome back, {user?.name || 'Farmer'}
          </h1>
          <p className="text-xs text-stone-500">
            Track your farmgate sales, manage active batches, and process incoming wholesale orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('add_crop')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/10 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> {t('nav.list_crop')}
          </button>
        </div>
      </div>

      {/* 1. KEY STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Total Crops</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-heading">
            {crops.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Lifetime listings</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Active Listings</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-heading">
            {activeListings.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Available for sale</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-heading">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">{t('orders.status_pending')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-heading">
            {completedOrders.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">{t('orders.status_delivered')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Total Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 font-heading">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Escrow verified</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>{t('market.available_stock')}</span>
            <Package className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-heading">
            {availableStock.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">kg unsold</div>
        </div>
      </div>

      {/* 2. PROMINENT "ASK AI FARMER ASSISTANT" CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-stone-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> AI Marketplace Intelligence
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            {t('ai.name')}
          </h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            {t('ai.welcome_banner')}
          </p>
        </div>

        <button
          onClick={() => onNavigate('assistant')}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
        >
          <Bot className="w-4 h-4" />
          <span>{t('nav.assistant')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. RECENT INCOMING ORDERS SECTION */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-heading">
              {t('orders.title')} ({orders.length})
            </h2>
            <p className="text-xs text-stone-500">
              Confirm pending buyer requests, update packaging status, and dispatch shipments.
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            {t('nav.orders')} →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-500">
            {t('orders.no_orders')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-y border-stone-100">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Buyer</th>
                  <th className="py-3 px-3">{t('prices.col_crop')}</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-stone-900">
                      #{ord.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-stone-900">{ord.buyer_name}</div>
                      <div className="text-[11px] text-stone-400">{ord.buyer_phone}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-stone-800">
                      {translateCrop(ord.crop_name)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold">
                      {ord.quantity} {ord.unit}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-800">
                      ₹{ord.total_price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-stone-500">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          ord.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'preparing'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {ord.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'accepted', 'Confirmed by farmer.')}
                            disabled={statusUpdating === ord.id}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="Accept Order"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'rejected', 'Stock unavailable.')}
                            disabled={statusUpdating === ord.id}
                            className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Reject Order"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {ord.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'preparing', 'Harvesting & crate packing.')}
                          disabled={statusUpdating === ord.id}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        >
                          Mark Preparing
                        </button>
                      )}

                      {ord.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'shipped', 'Loaded on regional transport van.')}
                          disabled={statusUpdating === ord.id}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1 ml-auto"
                        >
                          <Truck className="w-3 h-3" /> Mark Shipped
                        </button>
                      )}

                      {ord.status === 'shipped' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'delivered', 'Delivered at buyer location.')}
                          disabled={statusUpdating === ord.id}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 ml-auto"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {ord.status === 'delivered' && (
                        <span className="text-[11px] text-emerald-600 font-semibold">{t('orders.status_delivered')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MY CROP LISTINGS TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-heading">
              {t('market.tab_listings')} ({crops.length})
            </h2>
            <p className="text-xs text-stone-500">
              Manage inventory quantities, adjust prices, or remove finished batches.
            </p>
          </div>
          <button
            onClick={() => onNavigate('add_crop')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> {t('nav.list_crop')}
          </button>
        </div>

        {crops.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-500 space-y-3">
            <p>{t('market.empty_title')}</p>
            <button
              onClick={() => onNavigate('add_crop')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              {t('nav.list_crop')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-y border-stone-100">
                <tr>
                  <th className="py-3 px-3">{t('prices.col_crop')}</th>
                  <th className="py-3 px-3">{t('prices.col_cat')}</th>
                  <th className="py-3 px-3">{t('market.available_stock')}</th>
                  <th className="py-3 px-3">Price / Unit</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {crops.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{translateCrop(c.name)}</div>
                          <div className="text-[10px] text-stone-400">Harvest: {new Date(c.harvest_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-600">
                      {translateCategory(c.category)}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {c.quantity.toLocaleString()} {c.unit}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-emerald-800">
                      ₹{c.price_per_unit}/{c.unit}
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {c.location}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          c.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {c.status === 'available' ? 'Available' : t('market.out_of_stock')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCrop(c);
                            setEditQty(c.quantity);
                            setEditPrice(c.price_per_unit);
                          }}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100"
                          title="Edit Quantity / Price"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {c.status === 'available' && (
                          <button
                            onClick={() => handleMarkSold(c.id)}
                            className="px-2 py-1 text-[10px] font-bold rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50"
                            title="Mark as Sold"
                          >
                            {t('market.out_of_stock')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCrop(c.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. PRICE & MARKET DEMAND SECTION */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-heading">
              {t('prices.title')}
            </h2>
            <p className="text-xs text-stone-500">
              Real transaction benchmarks from AgroConnect order books and regional APMC records.
            </p>
          </div>
          <button
            onClick={() => onNavigate('prices')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            {t('nav.prices')} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {marketPrices.slice(0, 3).map((mp) => (
            <div
              key={mp.id}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-900">{translateCrop(mp.crop)}</span>
                <DemandBadge level={mp.demand_level} size="sm" />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-stone-500">{t('prices.col_avg_price')}</div>
                  <div className="text-xl font-extrabold text-stone-900">
                    ₹{mp.average_price} <span className="text-xs font-normal text-stone-500">/{mp.unit}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold ${
                    mp.price_change_percentage >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {mp.price_change_percentage >= 0 ? '+' : ''}{mp.price_change_percentage}%
                </span>
              </div>

              <div className="text-[11px] text-stone-500 flex justify-between pt-2 border-t border-stone-200">
                <span>{t('prices.col_range')}: ₹{mp.min_price} – ₹{mp.max_price}</span>
                <span>Active Mandi</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Crop Modal */}
      {editingCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              Edit Crop: {translateCrop(editingCrop.name)}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t('market.available_stock')} ({editingCrop.unit})
              </label>
              <input
                type="number"
                value={editQty}
                onChange={(e) => setEditQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Price Per {editingCrop.unit} (₹)
              </label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingCrop(null)}
                className="flex-1 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCropEdit}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
