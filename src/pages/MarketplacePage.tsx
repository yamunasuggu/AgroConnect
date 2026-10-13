import React, { useState, useEffect, useMemo } from 'react';
import { Crop, CropCategory } from '../types';
import { CropCard } from '../components/CropCard';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  MapPin,
  Tag,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  CloudSun,
  Droplets,
  Wind,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Store,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar,
  Building2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface MarketplacePageProps {
  crops: Crop[];
  onSelectCrop: (crop: Crop) => void;
  onQuickBuy: (crop: Crop) => void;
  onRefresh: () => void;
  onNavigate?: (page: string, params?: any) => void;
}

const CATEGORIES: ('All' | CropCategory)[] = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Pulses & Legumes',
  'Spices & Herbs',
];

const POPULAR_AGRI_HUBS = [
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.901, lon: 75.8573 },
  { name: 'Kolar', state: 'Karnataka', lat: 13.1367, lon: 78.134 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Wayanad', state: 'Kerala', lat: 11.6854, lon: 76.132 },
  { name: 'Sopore', state: 'Jammu & Kashmir', lat: 34.298, lon: 74.469 },
];

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  crops,
  onSelectCrop,
  onQuickBuy,
  onRefresh,
  onNavigate,
}) => {
  const { t, translateCrop, translateCategory } = useLanguage();

  // Navigation tabs within Marketplace
  const [activeView, setActiveView] = useState<'listings' | 'state_mandi_prices' | 'india_weather'>('listings');

  // Filter States for Produce Listings
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [inStockOnly, setInStockOnly] = useState(true);

  // Real-Time All-India Weather State
  const [weatherQuery, setWeatherQuery] = useState('');
  const [weatherSearchResults, setWeatherSearchResults] = useState<any[]>([]);
  const [searchingWeather, setSearchingWeather] = useState(false);
  const [currentWeatherPlace, setCurrentWeatherPlace] = useState('Guntur, Andhra Pradesh');
  const [liveWeather, setLiveWeather] = useState<any | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Real-Time All-India State Mandi Prices State
  const [statePrices, setStatePrices] = useState<any[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [mandiFilterState, setMandiFilterState] = useState<string>('All');
  const [mandiFilterCategory, setMandiFilterCategory] = useState<string>('All');
  const [mandiSearch, setMandiSearch] = useState('');
  const [loadingMandi, setLoadingMandi] = useState(false);
  const [lastMandiSync, setLastMandiSync] = useState<string>('');
  const [mandiSource, setMandiSource] = useState<string>('');

  // Initial load of real-time feeds
  useEffect(() => {
    loadRealtimeWeather(16.3067, 80.4365, 'Guntur', 'Andhra Pradesh');
    loadStateMandiPrices('All', 'All');
  }, []);

  const loadRealtimeWeather = async (lat: number, lon: number, name: string, state?: string) => {
    try {
      setLoadingWeather(true);
      setCurrentWeatherPlace(`${name}${state ? `, ${state}` : ''}`);
      const res = await api.getPlaceWeather(lat, lon, name, state);
      setLiveWeather(res.weather);
    } catch (err) {
      console.error('Failed to load real-time weather:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleSearchWeatherLocations = async (val: string) => {
    setWeatherQuery(val);
    if (val.trim().length >= 2) {
      setSearchingWeather(true);
      try {
        const res = await api.searchIndiaLocations(val);
        setWeatherSearchResults(res.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingWeather(false);
      }
    } else {
      setWeatherSearchResults([]);
    }
  };

  const loadStateMandiPrices = async (state: string, category: string) => {
    try {
      setLoadingMandi(true);
      const res = await api.getStatePrices(state, category);
      setStatePrices(res.prices || []);
      setAvailableStates(['All', ...(res.states_available || [])]);
      setLastMandiSync(res.last_synced || new Date().toISOString());
      setMandiSource(res.api_source || 'Agmarknet APMC Feeds');
    } catch (err) {
      console.error('Failed to load state mandi prices:', err);
    } finally {
      setLoadingMandi(false);
    }
  };

  const handleMandiFilterChange = (state: string, category: string) => {
    setMandiFilterState(state);
    setMandiFilterCategory(category);
    loadStateMandiPrices(state, category);
  };

  // Extract unique locations from crop listings
  const availableLocations = useMemo(() => {
    const locs = Array.from(new Set(crops.map((c) => c.location.split(',')[0].trim())));
    return ['All', ...locs];
  }, [crops]);

  // Filtered Produce Listings
  const filteredCrops = useMemo(() => {
    return crops
      .filter((crop) => {
        if (inStockOnly && crop.quantity <= 0) return false;
        if (selectedCategory !== 'All' && crop.category !== selectedCategory) return false;
        if (selectedLocation !== 'All' && !crop.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
        if (crop.price_per_unit < minPrice || crop.price_per_unit > maxPrice) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesName = crop.name.toLowerCase().includes(q) || translateCrop(crop.name).toLowerCase().includes(q);
          const matchesFarmer = crop.farmer_name.toLowerCase().includes(q);
          const matchesLoc = crop.location.toLowerCase().includes(q);
          const matchesCategory = crop.category.toLowerCase().includes(q) || translateCategory(crop.category).toLowerCase().includes(q);
          if (!matchesName && !matchesFarmer && !matchesLoc && !matchesCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price_per_unit - b.price_per_unit;
        if (sortBy === 'price_desc') return b.price_per_unit - a.price_per_unit;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [crops, search, selectedCategory, selectedLocation, minPrice, maxPrice, sortBy, inStockOnly]);

  // Filtered State Mandi Prices Table
  const filteredMandiPrices = useMemo(() => {
    if (!mandiSearch.trim()) return statePrices;
    const q = mandiSearch.toLowerCase();
    return statePrices.filter(
      (p) =>
        p.crop.toLowerCase().includes(q) ||
        translateCrop(p.crop).toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.mandi.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [statePrices, mandiSearch]);

  const resetProduceFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setMinPrice(0);
    setMaxPrice(300);
    setSortBy('newest');
    setInStockOnly(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t('market.live_badge', 'Live Real-Time APIs Connected')}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-emerald-200">{t('market.sources_badge', 'Open-Meteo All-India Weather & Agmarknet APMC Feeds')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {t('market.title', 'AgroConnect Digital Marketplace')}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              {t('market.subtitle', 'Direct farmgate produce trading with live microclimate weather for every place in India and real-time state buy & sell mandi rates.')}
            </p>
          </div>

          {/* Quick Real-Time Mini Weather Card */}
          {liveWeather && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 min-w-[280px] shrink-0 text-xs space-y-2">
              <div className="flex items-center justify-between text-stone-300 pb-1.5 border-b border-white/10">
                <span className="flex items-center gap-1 font-bold text-white">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {currentWeatherPlace}
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-medium">
                  Live
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-white">{liveWeather.temperature}°C</div>
                  <div className="text-[11px] text-emerald-300 font-semibold">{liveWeather.weatherCondition}</div>
                </div>
                <div className="text-right space-y-0.5 text-stone-300 text-[11px]">
                  <div>{t('market.weather_humidity', 'Humidity')}: <strong className="text-white">{liveWeather.humidity}%</strong></div>
                  <div>{t('market.weather_rain', 'Rain Prob')}: <strong className="text-white">{liveWeather.precipitationProbability}%</strong></div>
                  <div>{t('market.weather_wind', 'Wind')}: <strong className="text-white">{liveWeather.windSpeed} km/h</strong></div>
                </div>
              </div>
              <button
                onClick={() => setActiveView('india_weather')}
                className="w-full mt-1 pt-1.5 text-center text-[10px] font-bold text-emerald-300 hover:text-white border-t border-white/10 flex items-center justify-center gap-1"
              >
                {t('market.weather_search_ph', 'Search Weather of Any Place in India')} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Switcher Navigation */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('listings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'listings'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'bg-white/10 text-stone-200 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" /> {t('market.tab_listings', '1. Fresh Produce Listings')} ({filteredCrops.length})
          </button>

          <button
            onClick={() => setActiveView('state_mandi_prices')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'state_mandi_prices'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'bg-white/10 text-stone-200 hover:bg-white/15 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> {t('market.tab_mandi', '2. All-India State Buy & Sell Rates')}
          </button>

          <button
            onClick={() => setActiveView('india_weather')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'india_weather'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'bg-white/10 text-stone-200 hover:bg-white/15 hover:text-white'
            }`}
          >
            <CloudSun className="w-4 h-4" /> {t('market.tab_weather', '3. India Live Weather by Place & Advisory')}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DIRECT FRESH PRODUCE LISTINGS */}
      {/* ========================================================================= */}
      {activeView === 'listings' && (
        <div className="space-y-6">
          {/* Main Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('market.search_placeholder', 'Search by crop name (Tomato, Onion), farmer, or district...')}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-700 focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="newest">{t('market.sort_newest', 'Sort by: Newest Listings')}</option>
                  <option value="price_asc">{t('market.sort_price_asc', 'Price: Low → High')}</option>
                  <option value="price_desc">{t('market.sort_price_desc', 'Price: High → Low')}</option>
                </select>
                <button
                  onClick={onRefresh}
                  className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors shrink-0"
                  title="Refresh Listings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline">
                {t('market.filter_category', 'Category:')}
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {translateCategory(cat)}
                </button>
              ))}
            </div>

            {/* Extended Filters */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-stone-500 font-medium">{t('market.filter_district', 'District:')}</span>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="py-1 px-2.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-700"
                  >
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === 'All' ? t('market.filter_all_districts', 'All Districts') : loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-stone-500 font-medium">{t('market.filter_max_price', 'Max Price:')}</span>
                  <span className="font-bold text-stone-800">₹{maxPrice}/unit</span>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-24 accent-emerald-600 cursor-pointer"
                  />
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700 select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded-sm text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span>{t('market.filter_in_stock', 'In-Stock Only')}</span>
                </label>
              </div>

              {(selectedCategory !== 'All' ||
                selectedLocation !== 'All' ||
                maxPrice < 300 ||
                search !== '') && (
                <button
                  onClick={resetProduceFilters}
                  className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                >
                  {t('market.reset_filters', 'Reset Filters')}
                </button>
              )}
            </div>
          </div>

          {/* Crops Grid */}
          {filteredCrops.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-800">{t('market.empty_title', 'No matching crop listings found')}</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {t('market.empty_desc', 'Try broadening your search term, adjusting your price filter, or selecting "All Districts".')}
              </p>
              <button
                onClick={resetProduceFilters}
                className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                {t('market.clear_filters', 'Clear All Filters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCrops.map((crop) => (
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
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ALL-INDIA STATE MANDI BUY VS SELL RATES */}
      {/* ========================================================================= */}
      {activeView === 'state_mandi_prices' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900 font-heading">
                  {t('market.mandi_title', 'All-India State Mandi Rates (Buy vs Sell)')}
                </h2>
                <p className="text-xs text-stone-500">
                  {t('market.mandi_subtitle', 'Real-time Agmarknet benchmark comparison: What farmers sell at vs what buyers purchase at across Indian APMC mandis.')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadStateMandiPrices(mandiFilterState, mandiFilterCategory)}
                  disabled={loadingMandi}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMandi ? 'animate-spin text-emerald-600' : ''}`} />
                  Sync Mandi Feeds
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
              {/* Commodity Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mandiSearch}
                  onChange={(e) => setMandiSearch(e.target.value)}
                  placeholder={t('market.mandi_search_ph', 'Search vegetable or fruit (Tomato, Onion, Mango)...')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* State Filter */}
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-stone-400 shrink-0" />
                <select
                  value={mandiFilterState}
                  onChange={(e) => handleMandiFilterChange(e.target.value, mandiFilterCategory)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-700"
                >
                  {availableStates.map((st) => (
                    <option key={st} value={st}>
                      {st === 'All' ? `🇮🇳 ${t('market.mandi_all_states', 'All Indian States')}` : st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-stone-400 shrink-0" />
                <select
                  value={mandiFilterCategory}
                  onChange={(e) => handleMandiFilterChange(mandiFilterState, e.target.value)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-700"
                >
                  <option value="All">{t('market.mandi_all_cats', 'All Categories')}</option>
                  <option value="Vegetables">{translateCategory('Vegetables')}</option>
                  <option value="Fruits">{translateCategory('Fruits')}</option>
                  <option value="Spices & Herbs">{translateCategory('Spices & Herbs')}</option>
                  <option value="Grains & Cereals">{translateCategory('Grains & Cereals')}</option>
                  <option value="Pulses & Legumes">{translateCategory('Pulses & Legumes')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Real-Time Price Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{t('market.col_crop', 'Commodity / Crop')}</th>
                    <th className="py-3 px-4">{t('market.col_mandi', 'State & APMC Mandi')}</th>
                    <th className="py-3 px-4">{t('market.filter_category', 'Category')}</th>
                    <th className="py-3 px-4 bg-emerald-50/70 text-emerald-950">
                      {t('market.col_farmer_sells', 'Farmer Sells At')} <span className="font-normal block text-[9px] text-emerald-700">(Farmgate / Arrival)</span>
                    </th>
                    <th className="py-3 px-4 bg-blue-50/70 text-blue-950">
                      {t('market.col_buyer_buys', 'Buyer Buys At')} <span className="font-normal block text-[9px] text-blue-700">(Wholesale Mandi Rate)</span>
                    </th>
                    <th className="py-3 px-4 text-stone-500">{t('market.col_retail', 'Retail Rate')}</th>
                    <th className="py-3 px-4">{t('market.col_trend', 'Demand Trend')}</th>
                    <th className="py-3 px-4">Demand</th>
                    <th className="py-3 px-4 text-right">{t('market.col_action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredMandiPrices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-stone-400">
                        {t('market.empty_title', 'No commodities found matching your filters.')}
                      </td>
                    </tr>
                  ) : (
                    filteredMandiPrices.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-900 text-sm">{translateCrop(item.crop)}</div>
                          <div className="text-[10px] text-stone-400">{t('market.grade_a', 'Standard Grade A')}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-800">{item.state}</div>
                          <div className="text-[10px] text-stone-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {item.mandi}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.category === 'Vegetables'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.category === 'Fruits'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {translateCategory(item.category)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 bg-emerald-50/40 font-extrabold text-emerald-800 text-sm">
                          ₹{item.farmer_sell_price} <span className="text-[10px] font-semibold text-stone-500">/{item.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 bg-blue-50/40 font-extrabold text-blue-900 text-sm">
                          ₹{item.buyer_buy_price} <span className="text-[10px] font-semibold text-stone-500">/{item.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 font-semibold">
                          ₹{item.retail_price}/{item.unit}
                        </td>
                        <td className="py-3.5 px-4">
                          <div
                            className={`inline-flex items-center gap-0.5 font-bold ${
                              item.trend === 'up'
                                ? 'text-emerald-700'
                                : item.trend === 'down'
                                ? 'text-red-600'
                                : 'text-stone-500'
                            }`}
                          >
                            {item.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                            {item.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                            <span>{item.change_percentage > 0 ? `+${item.change_percentage}%` : `${item.change_percentage}%`}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.demand_indicator === 'High'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.demand_indicator === 'Moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {item.demand_indicator}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSearch(item.crop);
                              setActiveView('listings');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                          >
                            {t('market.btn_order_farmer', 'Buy from Farmer')} <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Source: {mandiSource}</span>
              <span className="text-emerald-800 font-medium">
                Showing {filteredMandiPrices.length} verified state commodity price feeds
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: INDIA LIVE WEATHER BY PLACE & AGRO-ADVISORY */}
      {/* ========================================================================= */}
      {activeView === 'india_weather' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="max-w-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Open-Meteo High-Resolution Agro-Climate API
              </span>
              <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
                {t('market.weather_title', 'India Live Microclimate Weather & Advisory')}
              </h2>
              <p className="text-xs text-stone-500">
                {t('market.weather_subtitle', 'Real-time weather data for any village, town, mandi, or district in India with blight risk alerts and crop recommendations.')}
              </p>
            </div>

            {/* Weather Search Input with Autocomplete */}
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={weatherQuery}
                onChange={(e) => handleSearchWeatherLocations(e.target.value)}
                placeholder={t('market.weather_search_ph', 'Search place in India (e.g. Pune, Varanasi, Shimla, Guntur)...')}
                className="w-full pl-11 pr-10 py-3 text-sm rounded-2xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              {weatherQuery && (
                <button
                  onClick={() => {
                    setWeatherQuery('');
                    setWeatherSearchResults([]);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {weatherSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 divide-y divide-stone-100 animate-in fade-in">
                  {weatherSearchResults.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        loadRealtimeWeather(loc.latitude, loc.longitude, loc.name, loc.state);
                        setWeatherSearchResults([]);
                        setWeatherQuery(`${loc.name}, ${loc.state}`);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <div>
                          <strong className="text-stone-900">{loc.name}</strong>
                          <span className="text-stone-500 text-[11px] ml-1">({loc.state}, India)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Fetch Live Weather
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Agricultural Hub Pills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500">{t('market.weather_popular_hubs', 'Popular Agricultural Hubs:')}</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_AGRI_HUBS.map((hub) => (
                  <button
                    key={hub.name}
                    onClick={() => {
                      loadRealtimeWeather(hub.lat, hub.lon, hub.name, hub.state);
                      setWeatherQuery(`${hub.name}, ${hub.state}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      currentWeatherPlace.includes(hub.name)
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    📍 {hub.name} ({hub.state})
                  </button>
                ))}
              </div>
            </div>

            {/* Live Weather Forecast & Agricultural Report Card */}
            {loadingWeather ? (
              <div className="p-12 text-center text-stone-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Fetching real-time Open-Meteo satellite weather...</span>
              </div>
            ) : liveWeather ? (
              <div className="bg-gradient-to-br from-stone-900 to-stone-850 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Climate Data
                    </span>
                    <h3 className="text-2xl font-black font-heading mt-0.5">{currentWeatherPlace}</h3>
                    <p className="text-xs text-stone-400">
                      Coordinates: {liveWeather.latitude.toFixed(2)}°N, {liveWeather.longitude.toFixed(2)}°E • Synced:{' '}
                      {new Date(liveWeather.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                    <CloudSun className="w-8 h-8 text-amber-400" />
                    <div>
                      <div className="text-3xl font-black">{liveWeather.temperature}°C</div>
                      <div className="text-xs text-emerald-300 font-semibold">{liveWeather.weatherCondition}</div>
                    </div>
                  </div>
                </div>

                {/* 4 Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" /> {t('market.weather_humidity', 'Relative Humidity')}
                    </div>
                    <div className="text-lg font-bold">{liveWeather.humidity}%</div>
                    <div className="text-[10px] text-stone-400">Foliar evaporation index</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-teal-400" /> {t('market.weather_wind', 'Wind Speed')}
                    </div>
                    <div className="text-lg font-bold">{liveWeather.windSpeed} km/h</div>
                    <div className="text-[10px] text-stone-400">Pesticide drift safe &lt; 15 km/h</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <CloudSun className="w-3.5 h-3.5 text-amber-400" /> {t('market.weather_rain', 'Rain Probability')}
                    </div>
                    <div className="text-lg font-bold">{liveWeather.precipitationProbability}%</div>
                    <div className="text-[10px] text-stone-400">Hourly probability window</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {t('market.weather_blight', 'Blight / Pest Risk')}
                    </div>
                    <div className={`text-lg font-bold ${
                      liveWeather.blightRisk === 'High'
                        ? 'text-red-400'
                        : liveWeather.blightRisk === 'Moderate'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {liveWeather.blightRisk}
                    </div>
                    <div className="text-[10px] text-stone-400">Fungal spore climate model</div>
                  </div>
                </div>

                {/* Agronomic Recommendations for this Microclimate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {t('market.weather_advisory', 'Agricultural Weather Advisory:')}
                    </div>
                    <p className="text-stone-300 leading-relaxed">{liveWeather.harvestAdvisory}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Sowing & Field Work Suitability:
                    </div>
                    <p className="text-stone-300 leading-relaxed">{liveWeather.sowingSuitability}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-stone-400">
                    Want personalized AI crop recommendations for this weather?
                  </span>
                  <div className="flex items-center gap-2">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('assistant')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        {t('market.weather_find_crops', 'Find Best Crops for This Climate')} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
