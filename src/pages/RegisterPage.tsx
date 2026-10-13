import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import {
  Sprout,
  ShoppingBag,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState<UserRole>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Guntur, Andhra Pradesh');
  const [farmName, setFarmName] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full name and email address are required.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the AgroConnect fair-trade terms.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        phone: phone || '+91 98480 00000',
        role,
        location: location || (role === 'farmer' ? 'Guntur, Andhra Pradesh' : 'Hyderabad'),
        farmName: farmName || (role === 'farmer' ? `${name}'s Natural Farm` : `${name} Wholesale Corp`),
      });

      // Redirect to corresponding dashboard
      if (role === 'farmer') onNavigate('farmer_dashboard');
      else if (role === 'buyer') onNavigate('buyer_dashboard');
      else onNavigate('admin_dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl shadow-stone-900/5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading">
            {t('auth.register_title', 'Create AgroConnect Account')}
          </h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {t('auth.register_sub', 'Join India’s direct farm-to-market trading & AI agriculture platform')}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              {t('auth.role_label', 'Select Your Platform Account Type *')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>{t('auth.role_farmer', 'Farmer (Seller)')}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'buyer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>{t('auth.role_buyer', 'Buyer / Trader')}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'admin'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>{t('auth.role_admin', 'Market Admin')}</span>
              </button>
            </div>
          </div>

          {/* Name & Business */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.name_label', 'Full Name')} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600 font-medium text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.farm_label', 'Farm or Business Name')}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Patel Natural Organic Farm"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.email_label', 'Email Address')} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@farm.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.phone_label', 'Mobile Number')} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98480 12345"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Location & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.loc_label', 'District & State in India')} *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Nashik, Maharashtra"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.pass_label', 'Create Password')} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded-sm text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
            />
            <label htmlFor="terms" className="text-xs text-stone-600 select-none">
              I agree to the AgroConnect Direct Farm-to-Market charter, verified APMC quality benchmarks, and escrow settlement rules.
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Registering Account...</span>
            ) : (
              <>
                <span>{t('auth.create_acc_btn', 'Register Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Switch to Login */}
          <div className="text-center pt-2 text-xs text-stone-600">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-emerald-700 hover:underline"
            >
              {t('auth.have_account', 'Already registered? Log in here')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
