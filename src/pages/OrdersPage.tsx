import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { OrderTimeline } from '../components/OrderTimeline';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Calendar,
  Star,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, role } = useAuth();
  const { t, translateCrop } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params =
        role === 'farmer'
          ? { farmerId: user.id }
          : role === 'buyer'
          ? { buyerId: user.id }
          : {};
      const res = await api.getOrders(params);
      setOrders(res.orders || []);
      if (res.orders && res.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setActionError(null);
      await api.updateOrderStatus(orderId, 'cancelled', 'Cancelled by buyer before farmer acceptance.');
      await loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel order');
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string, note?: string) => {
    try {
      setActionError(null);
      await api.updateOrderStatus(orderId, status, note);
      await loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update order status');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setReviewSubmitting(true);
    try {
      setActionError(null);
      await api.submitReview(reviewOrder.id, rating, reviewComment);
      setReviewOrder(null);
      setReviewComment('');
      await loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Sign in to Track Orders</h2>
        <p className="text-xs text-stone-500">
          Sign in as a Farmer or Buyer to view direct farmgate transactions and logistics timelines.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Pending') return o.status === 'pending';
    if (selectedFilter === 'In Progress')
      return ['accepted', 'preparing', 'shipped'].includes(o.status);
    if (selectedFilter === 'Delivered') return o.status === 'delivered';
    if (selectedFilter === 'Cancelled')
      return ['cancelled', 'rejected'].includes(o.status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {role === 'farmer' ? 'FARMER ORDER LOGS' : 'BUYER PROCUREMENT ORDERS'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading mt-1">
            Order Management & Tracking
          </h1>
          <p className="text-xs text-stone-500">
            Real-time status tracking, milestone history, and direct escrow fulfillment.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Pending', 'In Progress', 'Delivered', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === tab
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Orders List & Detailed Timeline View */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">No orders matching this filter</h3>
          <p className="text-xs text-stone-500">
            {role === 'buyer'
              ? 'Browse the marketplace to place fresh farmgate crop orders.'
              : 'Incoming orders from wholesale buyers will appear here.'}
          </p>
          {role === 'buyer' && (
            <button
              onClick={() => onNavigate('marketplace')}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Explore Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Order Cards List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white relative ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-100 shadow-md'
                      : 'border-stone-200 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={ord.crop_image}
                        alt={ord.crop_name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900 line-clamp-1">
                          {ord.crop_name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {role === 'farmer' ? `Buyer: ${ord.buyer_name}` : `Farmer: ${ord.farmer_name}`}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${
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
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600">
                      {ord.quantity} {ord.unit} @ ₹{ord.price_per_unit}/{ord.unit}
                    </span>
                    <span className="font-extrabold text-emerald-800">
                      ₹{ord.total_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Order Timeline Card */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-6 sticky top-24">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-stone-900">
                      Order #{selectedOrder.id}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 font-heading mt-0.5">
                    {selectedOrder.crop_name}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-400">Total Value</div>
                  <div className="text-xl font-extrabold text-emerald-800">
                    ₹{selectedOrder.total_price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Order Visual Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Tracking Timeline
                </h3>
                <OrderTimeline order={selectedOrder} />
              </div>

              {/* Details breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div>
                  <span className="text-stone-400 block mb-0.5">Farmer & Dispatch Location</span>
                  <div className="font-bold text-stone-900">{selectedOrder.farmer_name}</div>
                  <div className="text-stone-600 text-[11px]">Direct Farmgate Lot</div>
                </div>

                <div>
                  <span className="text-stone-400 block mb-0.5">Buyer & Delivery Address</span>
                  <div className="font-bold text-stone-900">{selectedOrder.buyer_name}</div>
                  <div className="text-stone-600 text-[11px]">{selectedOrder.delivery_address}</div>
                </div>

                <div>
                  <span className="text-stone-400 block mb-0.5">Quantity & Rate</span>
                  <div className="font-bold text-stone-900">
                    {selectedOrder.quantity} {selectedOrder.unit} × ₹{selectedOrder.price_per_unit}
                  </div>
                </div>

                <div>
                  <span className="text-stone-400 block mb-0.5">Escrow Payment</span>
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {selectedOrder.payment_method}
                  </div>
                </div>
              </div>

              {/* Review Section if Delivered */}
              {selectedOrder.status === 'delivered' && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Buyer Rating & Review
                    </span>
                    {!selectedOrder.review && role === 'buyer' && (
                      <button
                        onClick={() => setReviewOrder(selectedOrder)}
                        className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-bold text-xs hover:bg-emerald-800"
                      >
                        Rate This Order
                      </button>
                    )}
                  </div>

                  {selectedOrder.review ? (
                    <div className="space-y-1">
                      <div className="flex text-amber-500">
                        {'★'.repeat(selectedOrder.review.rating)}
                      </div>
                      <p className="text-stone-700 italic">"{selectedOrder.review.comment}"</p>
                    </div>
                  ) : (
                    <p className="text-stone-600 text-[11px]">
                      {role === 'buyer'
                        ? 'Order delivered. Share your feedback on product freshness and transit packaging!'
                        : 'No review submitted yet by the buyer.'}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons based on Role & Status */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-end gap-3 text-xs">
                {/* Farmer Actions */}
                {role === 'farmer' && selectedOrder.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'accepted', 'Farmer accepted the order.')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'rejected', 'Stock unavailable.')}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-700 font-bold hover:bg-red-50"
                    >
                      Reject Order
                    </button>
                  </>
                )}

                {role === 'farmer' && selectedOrder.status === 'accepted' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'preparing', 'Harvesting & sorting produce.')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                  >
                    Mark as Preparing
                  </button>
                )}

                {role === 'farmer' && selectedOrder.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped', 'Dispatched on cold transport van.')}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" /> Mark as Shipped
                  </button>
                )}

                {role === 'farmer' && selectedOrder.status === 'shipped' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered', 'Produce received & unboxed by buyer.')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                  >
                    Mark as Delivered
                  </button>
                )}

                {/* Buyer Actions */}
                {role === 'buyer' && selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50"
                  >
                    Cancel Order
                  </button>
                )}

                {role === 'buyer' && selectedOrder.status === 'shipped' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered', 'Buyer confirmed physical receipt.')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                  >
                    Confirm Delivery Received
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              Rate Your Experience for #{reviewOrder.id}
            </h3>
            <p className="text-xs text-stone-500">
              Your rating directly shapes the farmer's marketplace reputation.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Rating: {rating} Star{rating > 1 ? 's' : ''}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      <span className={star <= rating ? 'text-amber-400' : 'text-stone-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Comments & Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Produce freshness, promptness of dispatch, packaging condition..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="flex-1 py-2 text-xs font-bold text-stone-700 border border-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
