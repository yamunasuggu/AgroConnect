import React, { useState, useEffect } from 'react';
import { User, Crop } from '../types';
import { api } from '../services/api';
import { CropCard } from '../components/CropCard';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Package,
  Award,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
} from 'lucide-react';

interface FarmerProfilePageProps {
  farmerId: string;
  onBack: () => void;
  onSelectCrop: (crop: Crop) => void;
  onQuickBuy: (crop: Crop) => void;
}

export const FarmerProfilePage: React.FC<FarmerProfilePageProps> = ({
  farmerId,
  onBack,
  onSelectCrop,
  onQuickBuy,
}) => {
  const [profile, setProfile] = useState<{
    farmer: User;
    active_crops: Crop[];
    total_crops_count: number;
    total_orders_count: number;
    reviews: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarmer() {
      try {
        setLoading(true);
        const data = await api.getFarmerProfile(farmerId);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load farmer profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadFarmer();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Loading farmer profile & harvest history...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <p className="text-sm text-stone-600">Farmer profile not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { farmer, active_crops, total_crops_count, total_orders_count, reviews } = profile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={farmer.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
            alt={farmer.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-emerald-500/20 shadow-md"
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
                {farmer.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Grower
              </span>
            </div>

            <p className="text-sm font-semibold text-emerald-800">
              {farmer.farmName || 'Direct Agriculture Farms'}
            </p>

            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              {farmer.bio || 'Dedicated grower focused on sustainable agriculture, pest-free harvest, and fair trade pricing.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {farmer.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Member Since: {new Date(farmer.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>

        {/* Farmer Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-stone-100 text-center">
          <div className="p-3 rounded-2xl bg-stone-50">
            <div className="text-xl font-extrabold text-stone-900 font-heading">
              {total_crops_count}
            </div>
            <div className="text-[11px] text-stone-500 uppercase tracking-wide">
              Total Products Listed
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50">
            <div className="text-xl font-extrabold text-emerald-700 font-heading">
              {total_orders_count}
            </div>
            <div className="text-[11px] text-stone-500 uppercase tracking-wide">
              Delivered Orders
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50">
            <div className="text-xl font-extrabold text-amber-600 font-heading flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-current" /> 4.9
            </div>
            <div className="text-[11px] text-stone-500 uppercase tracking-wide">
              Buyer Rating
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50">
            <div className="text-xl font-extrabold text-stone-900 font-heading">
              {active_crops.length}
            </div>
            <div className="text-[11px] text-stone-500 uppercase tracking-wide">
              Live Active Batches
            </div>
          </div>
        </div>
      </div>

      {/* Available Crops Listed by this farmer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900 font-heading">
            Available Crops from {farmer.name.split(' ')[0]} ({active_crops.length})
          </h2>
        </div>

        {active_crops.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-stone-200 text-xs text-stone-500">
            No active batches currently listed. Check back after the next harvest!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {active_crops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onSelect={onSelectCrop}
                onQuickBuy={onQuickBuy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Received */}
      {reviews.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <h3 className="text-base font-bold text-stone-900 font-heading">
            Verified Customer Reviews ({reviews.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{rev.buyer_name}</span>
                  <div className="flex text-amber-500 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="text-[10px] text-stone-400">
                  Crop: {rev.crop_name} • {new Date(rev.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
