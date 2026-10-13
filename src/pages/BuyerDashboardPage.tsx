import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, Crop } from '../types';
import { api } from '../services/api';
import {
  ShoppingBag,
  Truck,
  DollarSign,
  Store,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Star,
  RefreshCw,
} from 'lucide-react';

interface BuyerDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectCrop: (crop: Crop) => void;
}

export const BuyerDashboardPage: React.FC<BuyerDashboardPageProps> = ({
  onNavigate,
  onSelectCrop,
}) => {
  const { user } = useAuth();
  const { t, translateCrop } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuyerData();
  }, [user]);

  const loadBuyerData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [ordersRes, cropsRes] = await Promise.all([
        api.getOrders({ buyerId: user.id }),
        api.getCrops(),
      ]);
      setOrders(ordersRes.orders || []);
      setCrops(cropsRes.crops || []);
    } catch (err) {
      console.error('Failed to load buyer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter((o) => ['pending', 'accepted', 'preparing', 'shipped'].includes(o.status));
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
    .reduce((sum, o) => sum + o.total_price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            {t('nav.dashboard')}
          </span>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading mt-1">
            Welcome, {user?.name || 'Buyer'}
          </h1>
          <p className="text-xs text-stone-500">
            Monitor open purchase contracts, track in-transit farm dispatches, and source fresh seasonal harvests.
          </p>
        </div>

        <button
          onClick={() => onNavigate('marketplace')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/10 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Store className="w-4 h-4" /> {t('nav.marketplace')}
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-heading">
            {orders.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Direct contracts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Active / In-Transit</span>
            <Truck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 font-heading">
            {activeOrders.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Processing & transit</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Delivered Batches</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 font-heading">
            {deliveredOrders.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">{t('orders.status_delivered')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Procurement Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-heading">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Zero fee</div>
        </div>
      </div>

      {/* Active Orders Tracking */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-heading">
              {t('orders.title')} ({activeOrders.length})
            </h2>
            <p className="text-xs text-stone-500">
              Track packages currently in harvest prep or cold transit.
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            {t('nav.orders')} →
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-400">
            {t('orders.no_orders')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => onNavigate('orders')}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-400 cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={ord.crop_image}
                      alt={ord.crop_name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900">{translateCrop(ord.crop_name)}</div>
                      <div className="text-[11px] text-stone-500">From: {ord.farmer_name}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                    {ord.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-200/60">
                  <span className="text-stone-600 font-medium">
                    {ord.quantity} {ord.unit}
                  </span>
                  <span className="font-bold text-emerald-800">
                    ₹{ord.total_price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Fresh Crops to Reorder */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 font-heading">
          {t('market.tab_listings')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {crops.slice(0, 4).map((crop) => (
            <div
              key={crop.id}
              onClick={() => onSelectCrop(crop)}
              className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-emerald-500 cursor-pointer shadow-xs transition-all space-y-3"
            >
              <img
                src={crop.image}
                alt={crop.name}
                className="w-full h-36 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-xs text-stone-900 line-clamp-1">{translateCrop(crop.name)}</h3>
                <div className="text-[11px] text-stone-500 mt-0.5">{crop.farmer_name}</div>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100">
                <span className="font-extrabold text-stone-900">₹{crop.price_per_unit}/{crop.unit}</span>
                <span className="text-emerald-700 font-bold">{t('market.btn_buy_now')} →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
