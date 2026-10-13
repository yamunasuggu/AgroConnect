import React from 'react';
import { Crop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Calendar, Star, Package, ArrowRight, ShieldCheck } from 'lucide-react';

interface CropCardProps {
  crop: Crop;
  onSelect: (crop: Crop) => void;
  onQuickBuy?: (crop: Crop) => void;
  isOwner?: boolean;
}

export const CropCard: React.FC<CropCardProps> = ({
  crop,
  onSelect,
  onQuickBuy,
  isOwner = false,
}) => {
  const { t, translateCrop, translateCategory } = useLanguage();
  const stockPercentage = Math.min(
    100,
    Math.round((crop.quantity / (crop.original_quantity || crop.quantity)) * 100)
  );

  const localizedCropName = translateCrop(crop.name);
  const localizedCategory = translateCategory(crop.category);

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image & Tags */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={crop.image}
          alt={localizedCropName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-900/80 backdrop-blur-md text-emerald-100 shadow-xs">
            {localizedCategory}
          </span>
          {crop.rating >= 4.8 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Star className="w-3 h-3 fill-current" /> {t('market.grade_a', 'Grade A')}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-md text-emerald-900 shadow-md">
            ₹{crop.price_per_unit} <span className="font-normal text-stone-500 text-[11px]">/{crop.unit}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onSelect(crop)}
              className="font-bold text-stone-900 group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1 text-base"
            >
              {localizedCropName}
            </h3>
          </div>

          {/* Farmer & Rating */}
          <div className="mt-1 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-stone-800 truncate max-w-[140px]">{crop.farmer_name}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
              <span>{crop.rating}</span>
              <span className="text-stone-400 font-normal">({crop.reviews_count || 12})</span>
            </div>
          </div>

          {/* Location & Harvest */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1 truncate" title={crop.location}>
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{crop.location.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{new Date(crop.harvest_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Stock bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-stone-500 flex items-center gap-1">
                <Package className="w-3 h-3" /> {t('market.available_stock', 'Available Stock:')}
              </span>
              <span className={`font-semibold ${crop.quantity < 100 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {crop.quantity.toLocaleString()} {crop.unit}
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stockPercentage > 40 ? 'bg-emerald-500' : stockPercentage > 15 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(5, stockPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onSelect(crop)}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors text-center"
          >
            {t('market.btn_view_details', 'View Details')}
          </button>
          
          {isOwner ? (
            <button
              onClick={() => onSelect(crop)}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors text-center"
            >
              {t('common.manage', 'Manage')}
            </button>
          ) : (
            <button
              onClick={() => onQuickBuy ? onQuickBuy(crop) : onSelect(crop)}
              disabled={crop.quantity <= 0}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl text-white transition-all text-center flex items-center justify-center gap-1 shadow-xs ${
                crop.quantity <= 0
                  ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
              }`}
            >
              {crop.quantity <= 0 ? t('market.out_of_stock', 'Out of Stock') : t('market.btn_buy_now', 'Buy Now')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
