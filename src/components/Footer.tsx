import React from 'react';
import { Sprout, ShieldCheck, Scale, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, translateCategory } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-heading">
                Agro<span className="text-emerald-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Empowering farmers with direct market access, fair farmgate pricing, and transparent AI-assisted agricultural market intelligence. Eliminating middlemen friction across India.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Escrow Protected
              </span>
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-400" /> Fair Mandi Benchmarks
              </span>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-4">
              {t('nav.marketplace')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('market.tab_listings')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {translateCategory('Vegetables')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {translateCategory('Grains & Cereals')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {translateCategory('Fruits')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {translateCategory('Spices & Herbs')}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Intelligence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-4">
              {t('nav.home')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('prices')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  {t('nav.prices')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {t('nav.assistant')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('orders')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('nav.orders')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('add_crop')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('nav.list_crop')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('auth.sign_in_btn')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-emerald-400 transition-colors font-bold text-emerald-400"
                >
                  {t('auth.create_acc_btn')}
                </button>
              </li>
            </ul>
          </div>

          {/* Transparency & Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-4">
              Data & Ethics
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Demand indicators are computed strictly from real platform order volumes and active farmer listings. We never fabricate market forecasts.
            </p>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 text-[11px] text-stone-300">
              <span className="text-emerald-400 font-bold block mb-0.5">Government Data Notice:</span>
              Mandi prices derived from verified marketplace transactions and daily reference feeds.
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 AgroConnect Technologies. Built with pride for Indian Farmers & Wholesale Buyers.</p>
          <div className="flex items-center gap-1">
            <span>Direct Farm to Table</span>
            <span className="text-emerald-500">🌾</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
