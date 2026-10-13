import React, { useState, useEffect } from 'react';
import { MarketPrice } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { DemandBadge } from '../components/DemandBadge';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Search,
  CloudSun,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const MarketPricesPage: React.FC = () => {
  const { t, translateCrop, translateCategory } = useLanguage();
  const [activeTab, setActiveTab] = useState<'state_prices' | 'weather_search' | 'commodity_charts'>('state_prices');

  // Commodity price states
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<MarketPrice | null>(null);

  // State-wise buy & sell prices
  const [statePrices, setStatePrices] = useState<any[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Weather search of every place in India
  const [weatherSearchQuery, setWeatherSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [selectedPlaceWeather, setSelectedPlaceWeather] = useState<any | null>(null);
  const [weatherSearching, setWeatherSearching] = useState(false);
  const [selectedPlaceName, setSelectedPlaceName] = useState('Guntur, Andhra Pradesh');

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [apiSource, setApiSource] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pricesRes, statePricesRes, initialWeatherRes] = await Promise.all([
        api.getMarketPrices(),
        api.getStatePrices(),
        api.getPlaceWeather(16.3067, 80.4365, 'Guntur', 'Andhra Pradesh'),
      ]);

      setPrices(pricesRes.prices || []);
      setLastSynced(pricesRes.last_synced || new Date().toISOString());
      setApiSource(pricesRes.api_source || 'Agmarknet APMC Feeds & Open-Meteo Global Weather');
      if (pricesRes.prices && pricesRes.prices.length > 0) {
        setSelectedCrop(pricesRes.prices[0]);
      }

      setStatePrices(statePricesRes.prices || []);
      setAvailableStates(['All', ...(statePricesRes.states_available || [])]);
      setSelectedPlaceWeather(initialWeatherRes.weather);
    } catch (err) {
      console.error('Failed to load real-time prices & weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateFilterChange = async (state: string, category: string) => {
    setSelectedState(state);
    setSelectedCategory(category);
    try {
      const res = await api.getStatePrices(state, category);
      setStatePrices(res.prices || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchLocations = async (val: string) => {
    setWeatherSearchQuery(val);
    if (val.trim().length >= 2) {
      setWeatherSearching(true);
      try {
        const res = await api.searchIndiaLocations(val);
        setLocationResults(res.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setWeatherSearching(false);
      }
    } else {
      setLocationResults([]);
    }
  };

  const handleSelectLocation = async (loc: any) => {
    try {
      setLoading(true);
      setSelectedPlaceName(`${loc.name}, ${loc.state}`);
      setLocationResults([]);
      setWeatherSearchQuery(`${loc.name}, ${loc.state}`);
      const res = await api.getPlaceWeather(loc.latitude, loc.longitude, loc.name, loc.state);
      setSelectedPlaceWeather(res.weather);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLive = async () => {
    try {
      setSyncing(true);
      const res = await api.getLivePrices();
      setPrices(res.prices || []);
      setLastSynced(res.last_synced || new Date().toISOString());
      setApiSource(res.api_source || 'Agmarknet Feeds');
      if (selectedCrop) {
        const updated = res.prices.find((p) => p.crop === selectedCrop.crop);
        if (updated) setSelectedCrop(updated);
      }
      const stRes = await api.getStatePrices(selectedState, selectedCategory);
      setStatePrices(stRes.prices || []);
    } catch (err) {
      console.error('Failed to sync live prices', err);
    } finally {
      setSyncing(false);
    }
  };

  const filteredStatePrices = statePrices.filter(
    (p) =>
      p.crop.toLowerCase().includes(search.toLowerCase()) ||
      translateCrop(p.crop).toLowerCase().includes(search.toLowerCase()) ||
      p.mandi.toLowerCase().includes(search.toLowerCase()) ||
      p.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Real-Time Sync Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {t('market.live_badge', 'LIVE REAL-TIME DATA STREAM')}
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">
              Open-Meteo Weather API & All-India Agmarknet Mandi Feeds
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading mt-1">
            {t('prices.title', 'All-India Mandi Market Rates & Price Benchmarks')}
          </h1>
          <p className="text-xs text-stone-500">
            {t('prices.subtitle', 'Live daily price feeds from agricultural mandis across Indian states, demand velocity ratios, and price forecast analytics.')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSyncLive}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-950/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Live Prices Now'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('state_prices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'state_prices'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          🇮🇳 {t('prices.tab_mandi', 'State Mandi Buy & Sell Rates')} ({statePrices.length})
        </button>
        <button
          onClick={() => setActiveTab('weather_search')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'weather_search'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <CloudSun className="w-4 h-4 text-emerald-600" />
          <span>{t('prices.tab_weather', 'India Live Weather by Place')}</span>
        </button>
        <button
          onClick={() => setActiveTab('commodity_charts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'commodity_charts'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{t('prices.tab_analysis', 'AgroConnect Commodity Index')}</span>
        </button>
      </div>

      {/* TAB 1: ALL-INDIA STATE-WISE BUY & SELL PRICES */}
      {activeTab === 'state_prices' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('market.mandi_search_ph', 'Search by vegetable, fruit, state or mandi...')}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* State and Category Dropdowns */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-semibold text-stone-600">{t('market.filter_district', 'State:')}</span>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateFilterChange(e.target.value, selectedCategory)}
                    className="py-1.5 px-3 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 text-xs"
                  >
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st === 'All' ? t('market.mandi_all_states', 'All Indian States') : st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-stone-600">{t('market.filter_category', 'Category:')}</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleStateFilterChange(selectedState, e.target.value)}
                    className="py-1.5 px-3 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 text-xs"
                  >
                    <option value="All">{t('market.mandi_all_cats', 'All Categories')}</option>
                    <option value="Vegetables">{translateCategory('Vegetables')}</option>
                    <option value="Fruits">{translateCategory('Fruits')}</option>
                    <option value="Grains & Cereals">{translateCategory('Grains & Cereals')}</option>
                    <option value="Spices & Herbs">{translateCategory('Spices & Herbs')}</option>
                    <option value="Pulses & Legumes">{translateCategory('Pulses & Legumes')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Explanation Strip */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" /> {t('market.col_farmer_sells', 'Farmer Sells At')} = Farmgate Arrival
                </span>
                <span className="flex items-center gap-1 text-purple-800 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-600" /> {t('market.col_buyer_buys', 'Buyer Buys At')} = Wholesale APMC Rate
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                Data Synced: {new Date(lastSynced || Date.now()).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* State Mandi Table */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase tracking-wider font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">{t('prices.col_crop', 'Commodity')}</th>
                    <th className="py-3.5 px-4">{t('market.col_mandi', 'State & Mandi Yard')}</th>
                    <th className="py-3.5 px-4 bg-emerald-50/70 text-emerald-950 font-extrabold">
                      {t('market.col_farmer_sells', 'Farmer Sell Rate')}
                    </th>
                    <th className="py-3.5 px-4 bg-purple-50/70 text-purple-950 font-extrabold">
                      {t('market.col_buyer_buys', 'Wholesale Buy Rate')}
                    </th>
                    <th className="py-3.5 px-4">{t('market.col_retail', 'Retail Benchmark')}</th>
                    <th className="py-3.5 px-4">{t('prices.col_trend', 'Price Trend')}</th>
                    <th className="py-3.5 px-4 text-center">{t('prices.col_demand', 'Market Demand')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredStatePrices.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 text-sm">{translateCrop(item.crop)}</div>
                        <div className="text-[11px] text-stone-400">{translateCategory(item.category)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-800">{item.mandi}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" /> {item.state}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 bg-emerald-50/40 font-extrabold text-emerald-800 text-sm">
                        ₹{item.farmer_sell_price} <span className="text-[11px] font-normal text-stone-500">/{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 bg-purple-50/40 font-extrabold text-purple-900 text-sm">
                        ₹{item.buyer_buy_price} <span className="text-[11px] font-normal text-stone-500">/{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-semibold">
                        ₹{item.retail_price} /{item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            item.change_percentage >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {item.change_percentage >= 0 ? '+' : ''}
                          {item.change_percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <DemandBadge level={item.demand_indicator} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEATHER CONDITION OF EVERY PLACE IN INDIA */}
      {activeTab === 'weather_search' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                LIVE HIGH-RESOLUTION AGRO-METEOROLOGY
              </span>
              <h2 className="text-2xl font-bold text-stone-900 font-heading mt-2">
                {t('market.weather_title', 'India Live Microclimate Weather & Advisory')}
              </h2>
              <p className="text-xs text-stone-500">
                {t('market.weather_subtitle', 'Powered by Open-Meteo Real-Time Geocoding & Agricultural Forecast APIs.')}
              </p>
            </div>

            {/* Autocomplete Search Bar */}
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={weatherSearchQuery}
                onChange={(e) => handleSearchLocations(e.target.value)}
                placeholder={t('market.weather_search_ph', 'Search any place in India...')}
                className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
              />
              {locationResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden divide-y divide-stone-100">
                  {locationResults.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left p-3 hover:bg-emerald-50/70 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-stone-800">{loc.name}</span>
                        <span className="text-stone-400">{loc.state}, India</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        Inspect Weather
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Weather Card */}
            {selectedPlaceWeather && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 text-white space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-time Satellite Sync
                    </span>
                    <h3 className="text-2xl font-black font-heading mt-1">{selectedPlaceName}</h3>
                    <p className="text-xs text-stone-400">
                      Latitude: {selectedPlaceWeather.latitude.toFixed(2)}°N, Longitude: {selectedPlaceWeather.longitude.toFixed(2)}°E
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                    <CloudSun className="w-8 h-8 text-amber-400" />
                    <div>
                      <div className="text-3xl font-black">{selectedPlaceWeather.temperature}°C</div>
                      <div className="text-xs text-emerald-300 font-semibold">{selectedPlaceWeather.weatherCondition}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" /> {t('market.weather_humidity', 'Humidity')}
                    </div>
                    <div className="text-lg font-bold">{selectedPlaceWeather.humidity}%</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-teal-400" /> {t('market.weather_wind', 'Wind Speed')}
                    </div>
                    <div className="text-lg font-bold">{selectedPlaceWeather.windSpeed} km/h</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <CloudSun className="w-3.5 h-3.5 text-amber-400" /> {t('market.weather_rain', 'Rain Probability')}
                    </div>
                    <div className="text-lg font-bold">{selectedPlaceWeather.precipitationProbability}%</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="text-stone-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {t('market.weather_blight', 'Blight Risk')}
                    </div>
                    <div className="text-lg font-bold text-emerald-400">{selectedPlaceWeather.blightRisk}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-xs">
                  <span className="font-bold text-emerald-400">{t('market.weather_advisory', 'Advisory:')}</span>
                  <p className="text-stone-300 leading-relaxed">{selectedPlaceWeather.harvestAdvisory}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AGROCONNECT COMMODITY INDEX */}
      {activeTab === 'commodity_charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prices.map((crop) => (
              <div
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  selectedCrop?.id === crop.id
                    ? 'bg-emerald-950 text-white border-emerald-600 shadow-xl'
                    : 'bg-white border-stone-200 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">{translateCrop(crop.crop)}</h3>
                  <DemandBadge level={crop.demand_level} size="sm" />
                </div>
                <div className="mt-3 text-2xl font-black">₹{crop.average_price}/{crop.unit}</div>
                <div className="mt-1 text-xs text-stone-400">
                  {t('prices.col_range', 'Range')}: ₹{crop.min_price} – ₹{crop.max_price}
                </div>
                <div className="mt-2 text-xs font-semibold flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{crop.price_change_percentage}% 24h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
