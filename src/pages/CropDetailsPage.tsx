import React, { useState, useEffect } from 'react';
import { Crop, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Package,
  ShieldCheck,
  Truck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface CropDetailsPageProps {
  cropId: string;
  autoBuy?: boolean;
  onBack: () => void;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const CropDetailsPage: React.FC<CropDetailsPageProps> = ({
  cropId,
  autoBuy = false,
  onBack,
  onNavigate,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const { t, translateCrop, translateCategory } = useLanguage();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [farmer, setFarmer] = useState<User | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Order form state
  const [quantity, setQuantity] = useState<number>(50);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    user?.location ? `${user.location} Central Store` : 'Gachibowli Logistics Park, Hyderabad'
  );
  const [phone, setPhone] = useState<string>(user?.phone || '+91 98200 99887');
  const [paymentMethod, setPaymentMethod] = useState<string>('AgroEscrow / Bank Transfer');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getCropById(cropId);
        setCrop(data.crop);
        setFarmer(data.farmer);
        setReviews(data.reviews || []);
        if (data.crop && data.crop.quantity < 50) {
          setQuantity(Math.max(1, data.crop.quantity));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load crop details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cropId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Fetching harvest batch details...</p>
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">{t('market.empty_title')}</h2>
        <p className="text-xs text-stone-500">{error || t('market.empty_desc')}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl"
        >
          {t('market.tab_listings')}
        </button>
      </div>
    );
  }

  const totalPrice = quantity * crop.price_per_unit;
  const isOutOfStock = crop.quantity <= 0;
  const isFarmerOwnCrop = user?.id === crop.farmer_id;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    if (quantity > crop.quantity) {
      setFormError(`Requested quantity (${quantity} ${crop.unit}) exceeds available stock (${crop.quantity} ${crop.unit}).`);
      return;
    }

    setOrderSubmitting(true);
    try {
      const res = await api.placeOrder({
        buyer_id: user.id,
        crop_id: crop.id,
        quantity,
        delivery_address: deliveryAddress,
        buyer_phone: phone,
        payment_method: paymentMethod,
      });

      setOrderSuccess(res.order);
      setCrop({ ...crop, quantity: crop.quantity - quantity });
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> ← {t('nav.marketplace')}
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Large Image & Crop Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm relative aspect-4/3 sm:aspect-16/10">
            <img
              src={crop.image}
              alt={crop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 backdrop-blur-md text-emerald-200">
                {translateCategory(crop.category)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-900/80 backdrop-blur-md text-white">
                {t('market.grade_a')} Mandi Certified
              </span>
            </div>
            <div className="absolute bottom-4 right-4">
              <span className="px-3.5 py-1.5 rounded-xl text-sm font-extrabold bg-white/95 backdrop-blur-md text-emerald-900 shadow-lg">
                ₹{crop.price_per_unit} <span className="text-xs font-normal text-stone-500">/{crop.unit}</span>
              </span>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
                {translateCrop(crop.name)}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {crop.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Harvest Date: <strong>{new Date(crop.harvest_date).toLocaleDateString()}</strong>
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {crop.rating} ({crop.reviews_count || 14} verified orders)
                </span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Crop & Harvest Details
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {crop.description}
              </p>
            </div>

            {/* Quality & Traceability Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50">
                <div className="text-stone-400 text-[11px]">{t('market.available_stock')}</div>
                <div className="font-bold text-stone-900 text-sm mt-0.5">
                  {crop.quantity.toLocaleString()} {crop.unit}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50">
                <div className="text-stone-400 text-[11px]">Dispatch Window</div>
                <div className="font-bold text-stone-900 text-sm mt-0.5">
                  24–48 Hours
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50">
                <div className="text-stone-400 text-[11px]">Storage Condition</div>
                <div className="font-bold text-stone-900 text-sm mt-0.5">
                  Natural Cured
                </div>
              </div>
            </div>

            {/* Farmer Profile Card */}
            {farmer && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={farmer.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                    alt={farmer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                      <span>{farmer.name}</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-md font-bold">
                        Verified Farmer
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      {farmer.farmName || 'Direct Agriculture Grower'} • {farmer.location}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('farmer_profile', { farmerId: farmer.id })}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>View Farm</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Reviews list */}
          {reviews.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 space-y-4">
              <h3 className="text-sm font-bold text-stone-900">
                Buyer Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">{rev.buyer_name}</span>
                      <div className="flex text-amber-500 text-xs font-semibold">
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Placement Form */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-900/5 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Procurement Checkout
              </span>
              <h2 className="text-xl font-bold text-stone-900 font-heading mt-1">
                {t('market.btn_order_farmer')}
              </h2>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            {orderSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <h3 className="font-bold text-base text-stone-900">Order Placed Successfully!</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Order <strong>#{orderSuccess.id}</strong> has been transmitted to {crop.farmer_name}.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-emerald-100 text-xs text-left space-y-1 text-stone-700">
                  <div className="flex justify-between">
                    <span>Batch:</span> <strong>{translateCrop(orderSuccess.crop_name)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span> <strong>{orderSuccess.quantity} {orderSuccess.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span> <strong className="text-emerald-700">₹{orderSuccess.total_price.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('orders')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    {t('nav.orders')}
                  </button>
                  <button
                    onClick={() => setOrderSuccess(null)}
                    className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                  >
                    Order More
                  </button>
                </div>
              </div>
            ) : isFarmerOwnCrop ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <span className="font-bold block">This is your own crop listing.</span>
                <p>
                  You are currently logged in as {crop.farmer_name}. You can manage, update stock, or edit this listing from your Farmer Dashboard.
                </p>
                <button
                  onClick={() => onNavigate('farmer_dashboard')}
                  className="mt-2 px-3.5 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
                >
                  {t('nav.dashboard')}
                </button>
              </div>
            ) : isOutOfStock ? (
              <div className="p-5 rounded-2xl bg-stone-100 text-center space-y-2">
                <span className="font-bold text-stone-700 block">{t('market.out_of_stock')}</span>
                <p className="text-xs text-stone-500">
                  This harvest batch has been completely reserved by other buyers.
                </p>
                <button
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold"
                >
                  {t('nav.marketplace')}
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Quantity Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-700">
                      Required Quantity ({crop.unit}) *
                    </label>
                    <span className="text-[11px] text-stone-400">
                      Max: {crop.quantity} {crop.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={crop.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(crop.quantity, Math.max(1, Number(e.target.value))))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-bold text-stone-900"
                    />
                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-2.5 rounded-xl border border-stone-200">
                      {crop.unit}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Warehouse / Restaurant / Shop Address, City, State, Pincode"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                {/* Payment Option */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Payment & Settlement
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium text-stone-700"
                  >
                    <option value="AgroEscrow / Bank Transfer">AgroEscrow (Released on delivery approval)</option>
                    <option value="UPI / Instant Bank Pay">UPI / Instant Bank Transfer</option>
                    <option value="Direct Mandi Net-30">Direct Institutional Net-30 (Approved Buyers)</option>
                  </select>
                </div>

                {/* Price Breakdown Calculation */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Base Rate:</span>
                    <span>₹{crop.price_per_unit} / {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Quantity:</span>
                    <span>{quantity} {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Platform Commission:</span>
                    <span className="text-emerald-600 font-bold">₹0 (Zero fee)</span>
                  </div>
                  <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-extrabold text-stone-900">
                    <span>Total Amount:</span>
                    <span className="text-emerald-700 text-base">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2"
                >
                  {orderSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <span>{t('market.btn_buy_now')} (₹{totalPrice.toLocaleString('en-IN')})</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AgroEscrow protection guarantee enabled</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
