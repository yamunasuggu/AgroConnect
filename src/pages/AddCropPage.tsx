import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CropCategory } from '../types';
import { api } from '../services/api';
import {
  ArrowLeft,
  Sprout,
  Image as ImageIcon,
  DollarSign,
  Package,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AddCropPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PRESET_IMAGES: { name: string; url: string; category: CropCategory }[] = [
  {
    name: 'Desi Red Tomatoes',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    category: 'Vegetables',
  },
  {
    name: 'Nashik Red Onions',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    category: 'Vegetables',
  },
  {
    name: 'Golden Sharbati Wheat',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    category: 'Grains & Cereals',
  },
  {
    name: 'Royal Delicious Apples',
    url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
    category: 'Fruits',
  },
  {
    name: 'Chandramukhi Potatoes',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    category: 'Vegetables',
  },
  {
    name: 'Guntur S4 Red Chillies',
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
    category: 'Spices & Herbs',
  },
  {
    name: 'Aged Basmati Rice 1121',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    category: 'Grains & Cereals',
  },
  {
    name: 'Mountain Ginger',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    category: 'Spices & Herbs',
  },
];

export const AddCropPage: React.FC<AddCropPageProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { t, translateCategory } = useLanguage();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<string>('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number>(28);
  const [location, setLocation] = useState(user?.location || 'Guntur, Andhra Pradesh');
  const [harvestDate, setHarvestDate] = useState('2026-10-10');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('2026-10-14');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in as a farmer to list produce.');
      return;
    }
    if (!name.trim()) {
      setError('Crop name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createCrop({
        farmer_id: user.id,
        name,
        category,
        quantity: Number(quantity),
        unit,
        price_per_unit: Number(pricePerUnit),
        location,
        harvest_date: harvestDate,
        expected_delivery_date: expectedDeliveryDate,
        description: description || `Fresh harvested ${name} grown in ${location}. Grade A direct farmgate lot.`,
        image: customImageUrl.trim() || image,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to list crop');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_IMAGES[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setImage(preset.url);
    setCustomImageUrl('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> ← {t('nav.dashboard')}
      </button>

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-900/5 p-6 sm:p-10 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('nav.list_crop')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading mt-2">
            {t('nav.list_crop')}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Provide harvest date, available quantity, and your direct farmgate price. No broker commissions.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Quick Autofill Presets */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Quick Autofill Presets:
            </span>
            <span className="text-[10px] text-stone-400">Click to fill details</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_IMAGES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-3 py-1 text-xs rounded-xl border transition-all ${
                  name === p.name
                    ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-400'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('prices.col_crop')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Red Tomatoes"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('prices.col_cat')} *
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 bg-white font-medium text-stone-700 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="Vegetables">{translateCategory('Vegetables')}</option>
                <option value="Fruits">{translateCategory('Fruits')}</option>
                <option value="Grains & Cereals">{translateCategory('Grains & Cereals')}</option>
                <option value="Pulses & Legumes">{translateCategory('Pulses & Legumes')}</option>
                <option value="Spices & Herbs">{translateCategory('Spices & Herbs')}</option>
                <option value="Dairy & Organic">{translateCategory('Dairy & Organic')}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity, Unit, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('market.available_stock')} *
              </label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="500"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Measurement Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 bg-white font-medium text-stone-700 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="quintal">quintal (100 kg)</option>
                <option value="tonne">tonne (1000 kg)</option>
                <option value="box">box / crate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Price Per Unit (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                placeholder="28"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 font-bold text-stone-900"
              />
            </div>
          </div>

          {/* Row 3: Location, Harvest Date, Expected Delivery Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Farm Location / District *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Guntur, Andhra Pradesh"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Harvest Date *
              </label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 text-stone-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 text-stone-700"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description & Quality Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Vine-ripened, naturally cured with zero chemical preservatives. High pulp, uniform size, packed in clean 25kg crates."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Crop Image Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Crop Image Photo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {PRESET_IMAGES.map((p) => (
                <div
                  key={p.name}
                  onClick={() => {
                    setImage(p.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video ${
                    image === p.url && !customImageUrl
                      ? 'border-emerald-600 ring-2 ring-emerald-200'
                      : 'border-stone-200 hover:border-emerald-400'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold bg-stone-900/80 text-white px-1 py-0.5 rounded-sm truncate">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold shrink-0">Or Custom Image URL:</span>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/10 flex items-center gap-1.5 transition-all"
            >
              {loading ? 'Publishing Listing...' : t('nav.list_crop')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
