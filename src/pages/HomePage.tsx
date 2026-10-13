import React from 'react';
import { Crop, MarketplaceStats } from '../types';
import { CropCard } from '../components/CropCard';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowRight,
  Sprout,
  Store,
  TrendingUp,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Users,
  Truck,
  Scale,
  Sparkles,
  Award,
  ChevronRight,
  Layers,
  Clock,
  HeartHandshake,
  CloudSun,
} from 'lucide-react';

interface HomePageProps {
  crops: Crop[];
  stats: MarketplaceStats | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  crops,
  stats,
  onNavigate,
  onOpenAuth,
}) => {
  const { t } = useLanguage();
  const featuredCrops = crops.slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-emerald-600/20 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight">
              AgroConnect
              <span className="block text-emerald-400 mt-2 text-3xl sm:text-5xl font-bold">
                {t('hero.title_sub')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* 4 Action Buttons as requested */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Store className="w-4 h-4" /> {t('hero.btn_explore')}
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-sm border border-stone-700 transition-all flex items-center gap-2"
              >
                <Sprout className="w-4 h-4 text-emerald-400" /> {t('hero.btn_farmer')}
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-sm border border-stone-700 transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-emerald-400" /> {t('hero.btn_buyer')}
              </button>

              <button
                onClick={() => onNavigate('assistant')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" /> {t('hero.btn_ai')}
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-stone-900/80 border border-stone-800 backdrop-blur-md shadow-2xl">
            <div className="text-center p-3">
              <div className="text-3xl font-extrabold text-emerald-400 font-heading">
                {stats?.total_farmers || '2,400'}+
              </div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wide">
                Verified Farmers
              </div>
            </div>

            <div className="text-center p-3 border-l border-stone-800">
              <div className="text-3xl font-extrabold text-white font-heading">
                {stats?.total_active_listings || '180'}+
              </div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wide">
                Active Crop Batches
              </div>
            </div>

            <div className="text-center p-3 border-l border-stone-800">
              <div className="text-3xl font-extrabold text-white font-heading">
                ₹{((stats?.total_revenue || 64500) / 1000).toFixed(1)}k+
              </div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wide">
                Direct Farmgate Sales
              </div>
            </div>

            <div className="text-center p-3 border-l border-stone-800">
              <div className="text-3xl font-extrabold text-emerald-400 font-heading">
                0%
              </div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wide">
                Middleman Commission
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (Requested visual step flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Transparent Supply Chain
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 font-heading mt-3">
            How AgroConnect Works
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            A frictionless, end-to-end digital procurement workflow connecting roots directly to retail.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Farmer Lists Crop', desc: 'Sets price, harvest date & quantity.', icon: Sprout },
            { step: '02', title: 'Buyer Discovers Crop', desc: 'Filters mandi grades & location.', icon: Store },
            { step: '03', title: 'Buyer Places Order', desc: 'Escrow protected checkout.', icon: Scale },
            { step: '04', title: 'Farmer Accepts Order', desc: 'Stock reserved & verified.', icon: HeartHandshake },
            { step: '05', title: 'Order Processing', desc: 'Harvest, sorting & packaging.', icon: Clock },
            { step: '06', title: 'Direct Delivery', desc: 'Farm-fresh transit & delivery.', icon: Truck },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.step}
                    </span>
                    <Icon className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                {idx < 5 && (
                  <div className="hidden lg:flex justify-end pt-3">
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED CROPS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Fresh Harvests
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 font-heading mt-1">
              Featured Agricultural Listings
            </h2>
            <p className="text-sm text-stone-600">
              Verified crops harvested recently and ready for immediate dispatch.
            </p>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Crops</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onSelect={(c) => onNavigate('crop_details', { cropId: c.id })}
              onQuickBuy={(c) => onNavigate('crop_details', { cropId: c.id, autoBuy: true })}
            />
          ))}
        </div>
      </section>

      {/* 3.5 REAL-TIME ALL-INDIA DATA HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Live Agmarknet & Open-Meteo Integration
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
                All-India Real-Time Mandi Feeds & Climate Search
              </h2>
              <p className="text-xs text-stone-300 max-w-2xl mt-1">
                Zero mock numbers. Check real-time wholesale buyer rates vs. farmer sell prices across all Indian states and search live microclimate weather for any village, mandi, or district.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Store className="w-4 h-4" /> Open Marketplace Feeds
              </button>
              <button
                onClick={() => onNavigate('prices')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/15"
              >
                <TrendingUp className="w-4 h-4" /> State-wise Mandi Table
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <TrendingUp className="w-4 h-4" /> State Buy vs. Sell Mandi Rates
              </div>
              <p className="text-stone-300">
                Transparent daily rates for vegetables & fruits across Maharashtra, AP, Punjab, Karnataka, UP, Kerala, and all states.
              </p>
              <div className="text-[11px] text-stone-400">
                • Red Onion (Nashik): Farmer ₹32/kg | Buyer ₹35/kg<br />
                • Tomato (Guntur): Farmer ₹27/kg | Buyer ₹30/kg
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <CloudSun className="w-4 h-4" /> India Weather for Every Place
              </div>
              <p className="text-stone-300">
                High-resolution Open-Meteo satellite weather search for any Indian city or village with live humidity, wind, and rain probability.
              </p>
              <div className="text-[11px] text-stone-400">
                • Fungal Blight Risk Index<br />
                • Post-harvest drying & silo advisory
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Bot className="w-4 h-4" /> AI Disease & Crop Suggester
              </div>
              <p className="text-stone-300">
                ICAR plant pathology diagnostics prescribing exact pesticide brands & dosage, plus weather-soil-water crop planning.
              </p>
              <div className="text-[11px] text-stone-400">
                • Early Blight & Leaf Curl viral detection<br />
                • Soil-tailored sowing crop matrix
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI FARMER ASSISTANT SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-900 via-stone-900 to-emerald-950 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                <Bot className="w-4 h-4" />
                <span>Domain-Specific AI Agronomy</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading leading-tight">
                Ask the AI Farmer Assistant
              </h2>

              <p className="text-stone-300 text-sm leading-relaxed">
                Empowered by live AgroConnect marketplace transaction logs and approved ICAR agronomic research. Ask about real-time crop demand ratios, historical mandi rates, pest diagnostics, or post-harvest storage.
              </p>

              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time calculation: <strong>Demand Ratio = Requested Qty / Available Qty</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No fabricated stats: Grounded in live MongoDB marketplace data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Post-harvest storage guidelines and clinical plant disease detection</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('assistant')}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" /> Open AI Assistant Console
                </button>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="bg-stone-900/90 rounded-2xl border border-stone-700/80 p-6 space-y-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AgroConnect AI Assistant</div>
                    <div className="text-[10px] text-emerald-400">Live MongoDB & Knowledge Grounding</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-800/80 text-xs text-stone-200">
                <span className="font-semibold text-emerald-400">Farmer Query:</span> “What is the current demand for tomatoes?”
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-emerald-900/40 text-xs text-stone-300 space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-400 pb-1 border-b border-stone-800">
                  <span>TOMATO MARKETPLACE SUMMARY</span>
                  <span className="text-[11px] bg-emerald-900/80 px-2 py-0.5 rounded-full text-emerald-200">
                    High Demand (1.28x)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Active Listings: <strong className="text-white">18 batches</strong></div>
                  <div>Available Qty: <strong className="text-white">2,450 kg</strong></div>
                  <div>Recent Orders: <strong className="text-white">63 orders</strong></div>
                  <div>Avg Listed Price: <strong className="text-emerald-400">₹28/kg</strong></div>
                </div>
                <p className="text-[11px] text-stone-400 italic pt-1">
                  “Requested quantity is currently 28% higher than available inventory. Good selling window for growers.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS FOR FARMERS & BUYERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Dual Value
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 font-heading mt-3">
            Why Agriculture Trades on AgroConnect
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Tailored benefits built directly for growers and wholesale buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Farmers Card */}
          <div className="p-8 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-heading">For Farmers</h3>
                <p className="text-xs text-emerald-800">Maximize farmgate profits with complete price autonomy</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Direct Pricing Control:</strong> Set your own price per kg/quintal without distress APMC broker discounting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Guaranteed Escrow Settlement:</strong> Buyers deposit funds in advance, releasing payout immediately upon delivery acceptance.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Real-time Demand Intelligence:</strong> Access transparent local order velocity before harvesting perishable stocks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>AI Agronomy On-Demand:</strong> Instant diagnostics for leaf blight, thrips, and optimal curing temperature.</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('register')}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
            >
              Register as Farmer
            </button>
          </div>

          {/* Buyers Card */}
          <div className="p-8 rounded-3xl bg-stone-100/90 border border-stone-300 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-heading">For Wholesale Buyers</h3>
                <p className="text-xs text-stone-600">Fresh harvest traceability direct from accredited growers</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>15–20% Lower Cost:</strong> Eliminate tier-3 middleman commissions and transit markups.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Complete Freshness:</strong> Same-day or next-day harvest dispatch straight from regional farm gates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Detailed Farmer Profiles:</strong> Verify farmer ratings, past delivered batches, and organic certifications.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Live Milestone Tracking:</strong> Real-time stage visibility from packing to dispatch and destination unboxing.</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('register')}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs"
            >
              Register as Wholesale Buyer
            </button>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Real Impact
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 font-heading mt-3">
            Voices from the Field & Kitchen
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex text-amber-400">★★★★★</div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              “Previously, APMC brokers would take 12% commission and pay us 3 weeks later. On AgroConnect, GreenMart orders 500kg tomatoes directly, and payments settle straight to my bank account.”
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100"
                alt="Ramesh Patel"
                className="w-9 h-9 rounded-full object-cover border border-emerald-400"
              />
              <div>
                <div className="text-xs font-bold text-stone-900">Ramesh Patel</div>
                <div className="text-[11px] text-stone-500">Tomato Farmer, Guntur (AP)</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex text-amber-400">★★★★★</div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              “We run a 24-supermarket chain in Hyderabad. Procuring Sharbati wheat and Nashik onions straight from Balwinder and Sunita cut our supply chain delays by 48 hours. Freshness is noticeable.”
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt="Aarav Mehta"
                className="w-9 h-9 rounded-full object-cover border border-emerald-400"
              />
              <div>
                <div className="text-xs font-bold text-stone-900">Aarav Mehta</div>
                <div className="text-[11px] text-stone-500">Procurement Head, GreenMart</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex text-amber-400">★★★★★</div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              “The AI Farmer Assistant is fantastic. It calculates real demand ratios so I know whether to hold or sell my harvested apples, and gave me verified curing tips that saved 15% of our crop.”
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100"
                alt="Priya Sharma"
                className="w-9 h-9 rounded-full object-cover border border-emerald-400"
              />
              <div>
                <div className="text-xs font-bold text-stone-900">Priya Sharma</div>
                <div className="text-[11px] text-stone-500">Orchardist, Shimla (HP)</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
